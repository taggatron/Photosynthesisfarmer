// game.js - Main game controller

class THCFarmerGame {
    constructor() {
        // Farm dimensions
        this.farmWidth = 8;
        this.farmHeight = 6;
        
        // Game state
        this.gameDay = 1;
        this.isPaused = false;
        this.gameSpeed = 1; // 1x, 2x, 4x speed
        this.currentMode = 'normal'; // normal, planting, placing_equipment
        this.selectedEquipmentType = null;
        
        // Player stats
        this.cash = 10000;
        this.playerLevel = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        
        // Financial tracking
        this.dailyProfit = 0;
        this.totalRevenue = 0;
        this.totalElectricityCost = 0;
        this.totalEquipmentCost = 0;
        this.totalSuppliesCost = 0;
        this.previousDayStats = {};

        // Equipment spending by category (installation + operating)
        this.spendingByCategory = {
            lighting: { install: 0, operating: 0 },
            climate: { install: 0, operating: 0 },
            air: { install: 0, operating: 0 },
            co2: { install: 0, operating: 0 },
            nutrient: { install: 0, operating: 0 },
            automation: { install: 0, operating: 0 },
            security: { install: 0, operating: 0 }
        };
        // Map equipment type -> category for spending aggregation
        this.EQUIPMENT_CATEGORY_MAP = {
            led_light: 'lighting',
            hps_light: 'lighting',
            heater: 'climate',
            air_conditioner: 'climate',
            ventilation_fan: 'air',
            humidifier: 'air',
            dehumidifier: 'air',
            co2_generator: 'co2',
            hydroponic_system: 'nutrient',
            ph_controller: 'nutrient',
            timer_system: 'automation',
            security_camera: 'security'
        };
        
        // Game entities
        this.plants = new Map(); // Map of position -> Plant
        this.equipmentManager = new EquipmentManager();
        
        // Environmental base conditions
        this.baseEnvironment = {
            temperature: 72, // Fahrenheit
            humidity: 45, // percentage
            lightIntensity: 60, // percentage (natural light)
            co2Level: 400, // ppm
            pH: 6.5
        };
        
        // Market conditions
        this.marketConditions = {
            demandMultiplier: 1.0,
            priceVolatility: 0.1,
            seasonalBonus: 1.0,
            competitionLevel: 1.0
        };
        
        // Research and progression
        this.researchTree = {
            'improved_seeds': { cost: 100, unlocked: false, benefits: 'Better seed genetics' },
            'automation': { cost: 200, unlocked: false, benefits: 'Automated watering system' },
            'pest_control': { cost: 150, unlocked: false, benefits: 'Reduced pest damage' },
            'advanced_nutrients': { cost: 300, unlocked: false, benefits: 'More efficient nutrients' },
            'climate_control': { cost: 400, unlocked: false, benefits: 'Better environmental control' }
        };
        
        // Game progression
        this.achievements = new Map();
        this.unlockedVarieties = ['basic'];
        this.researchPoints = 0;
        
        // Initialize systems
        this.initializeGame();
        
        // Start game loop
        this.lastUpdateTime = Date.now();
        this.gameLoop();
    }
    
    initializeGame() {
        // Initialize UI
        this.ui = new UIManager(this);
        
        // Set up initial conditions
        this.updateMarketConditions();
        
        // Start with basic tutorial/starter equipment if needed
        this.checkAchievements();
        
        console.log('THC Farmer Game initialized successfully!');
    }
    
        // Game loop with error handling
    gameLoop() {
        try {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdateTime;
            
            // Update game at specified speed (if not paused)
            if (!this.isPaused) {
                // Game updates every 2 seconds at 1x speed
                const updateInterval = 2000 / this.gameSpeed;
                
                if (deltaTime >= updateInterval) {
                    this.update();
                    this.lastUpdateTime = currentTime;
                }
            }
            
            // Update UI every frame
            if (this.ui) {
                this.ui.update();
            }
        } catch (error) {
            console.error('Game loop error:', error);
            // Attempt to recover by pausing the game
            this.isPaused = true;
            if (this.ui) {
                this.ui.showNotification('Game error detected - paused for safety', 'error');
            }
        }
        
        // Continue game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update() {
        // Daily update (every 24 game hours)
        const previousDay = this.gameDay;
        this.gameDay += (1 / 12); // Each update represents 2 game hours at 1x speed
        
        if (Math.floor(this.gameDay) > Math.floor(previousDay)) {
            this.dailyUpdate();
        }
        
        // Update plants
        this.updatePlants();
        
        // Update equipment
        this.updateEquipment();
        
        // Update market conditions
        if (Math.random() < 0.1) { // 10% chance per update
            this.updateMarketConditions();
        }
        
        // Calculate current profit/loss
        this.calculateDailyProfit();
        
        // Check for achievements and level progression
        this.checkAchievements();
        this.checkLevelProgression();
    }
    
    dailyUpdate() {
        console.log(`Day ${Math.floor(this.gameDay)} complete`);
        
        // Reset daily tracking
        this.previousDayStats = {
            revenue: this.totalRevenue,
            electricityCost: this.totalElectricityCost,
            equipmentCost: this.totalEquipmentCost,
            suppliesCost: this.totalSuppliesCost
        };
        
        // Random events
        this.checkRandomEvents();
        
        // Save game state (if localStorage is available)
        this.saveGame();
    }
    
    updatePlants() {
        const environment = this.getAverageEnvironment();
        
        this.plants.forEach(plant => {
            // Calculate local environmental effects
            const localEffects = this.equipmentManager.calculateEnvironmentalEffects(plant.x, plant.y);
            const localEnvironment = this.applyEnvironmentalEffects(environment, localEffects);
            
            plant.update(localEnvironment, this.gameDay);
            
            // Remove dead plants after a delay
            if (plant.isDead && Math.random() < 0.1) {
                this.plants.delete(`${plant.x},${plant.y}`);
            }
        });
    }
    
    updateEquipment() {
        const costs = this.equipmentManager.dailyUpdate(Math.floor(this.gameDay));
        
        // Apply daily equipment costs
        this.totalElectricityCost += costs.electricityCost;
        this.totalEquipmentCost += costs.operatingCosts;
        
        // Deduct daily costs from cash
        this.cash -= costs.electricityCost + costs.operatingCosts;

        // Aggregate operating costs by category
        if (costs.breakdown) {
            costs.breakdown.forEach(item => {
                const cat = this.EQUIPMENT_CATEGORY_MAP[item.type];
                if (cat && this.spendingByCategory[cat]) {
                    this.spendingByCategory[cat].operating += item.operatingCost;
                }
            });
        }
    }
    
    calculateDailyProfit() {
        const currentRevenue = this.totalRevenue - (this.previousDayStats.revenue || 0);
        const currentCosts = 
            (this.totalElectricityCost - (this.previousDayStats.electricityCost || 0)) +
            (this.totalEquipmentCost - (this.previousDayStats.equipmentCost || 0)) +
            (this.totalSuppliesCost - (this.previousDayStats.suppliesCost || 0));
        
        this.dailyProfit = currentRevenue - currentCosts;
    }
    
    getAverageEnvironment() {
        // Start with base environment
        const environment = { ...this.baseEnvironment };
        
        // Apply global equipment effects (like timer systems)
        const globalEffects = this.equipmentManager.calculateEnvironmentalEffects(0, 0, 999);
        return this.applyEnvironmentalEffects(environment, globalEffects);
    }
    
    applyEnvironmentalEffects(baseEnvironment, effects) {
        const result = { ...baseEnvironment };
        
        Object.keys(effects).forEach(key => {
            if (result.hasOwnProperty(key) && typeof effects[key] === 'number') {
                result[key] += effects[key];
            }
        });
        
        return result;
    }
    
    // Player actions
    plantSeed(x, y, variety = 'basic') {
        const key = `${x},${y}`;
        
        // Check if slot is occupied
        if (this.plants.has(key) || this.equipmentManager.getEquipmentAt(x, y)) {
            this.ui.showNotification('Slot is already occupied', 'error');
            return false;
        }
        
        // Check if player can afford seed
        const seedCost = this.getSeedCost(variety);
        if (this.cash < seedCost) {
            this.ui.showNotification('Not enough cash for seed', 'error');
            return false;
        }
        
        // Check if variety is unlocked
        if (!this.unlockedVarieties.includes(variety)) {
            this.ui.showNotification('Plant variety not yet unlocked', 'error');
            return false;
        }
        
        // Plant the seed
        const plant = new Plant(x, y, variety);
        this.plants.set(key, plant);
        
        // Deduct cost
        this.cash -= seedCost;
        this.totalSuppliesCost += seedCost;
        
        // Award experience
        this.addExperience(5);
        
        this.ui.showNotification(`${variety.charAt(0).toUpperCase() + variety.slice(1)} seed planted`, 'success');
        return true;
    }
    
    getSeedCost(variety) {
        const costs = {
            'basic': 50,
            'premium': 100,
            'exotic': 200
        };
        return costs[variety] || costs['basic'];
    }
    
    installEquipment(type, x, y) {
        const result = this.equipmentManager.installEquipment(type, x, y, this.playerLevel);
        
        if (result.success) {
            // Check if player can afford it
            if (this.cash < result.cost) {
                // Remove the equipment that was just installed
                this.equipmentManager.removeEquipment(x, y);
                this.ui.showNotification('Not enough cash', 'error');
                return false;
            }
            
            // Deduct cost
            this.cash -= result.cost;
            this.totalEquipmentCost += result.cost;

            // Track install spend by category
            const cat = this.EQUIPMENT_CATEGORY_MAP[type];
            if (cat && this.spendingByCategory[cat]) {
                this.spendingByCategory[cat].install += result.cost;
            }
            
            // Award experience
            this.addExperience(10);
            
            this.ui.showNotification(result.message, 'success');
            return true;
        } else {
            this.ui.showNotification(result.message, 'error');
            return false;
        }
    }

    // Compute summary of photosynthesis limiting factors and spending effectiveness
    getPhotosynthesisSummary() {
        // Aggregate average environment
        const env = this.getAverageEnvironment();
        // Collect plant stats to estimate productivity potential
        let plantCount = 0;
        let avgHealth = 0;
        let avgGrowth = 0;
        this.plants.forEach(p => {
            const d = p.getDetailedInfo();
            plantCount++;
            avgHealth += d.health;
            avgGrowth += d.growth;
        });
        if (plantCount > 0) {
            avgHealth /= plantCount;
            avgGrowth /= plantCount;
        }

        // Helper to compute efficiency ratio 0-1 based on plant preference ranges
        const factorEfficiency = (value, pref) => {
            if (!pref) return 0;
            if (value < pref.min || value > pref.max) return 0.2; // outside safe range
            // Map min->0.4, optimal->1, max->0.4 using triangular function
            if (value === pref.optimal) return 1;
            if (value < pref.optimal) {
                return 0.4 + 0.6 * ((value - pref.min) / (pref.optimal - pref.min));
            } else {
                return 0.4 + 0.6 * ((pref.max - value) / (pref.max - pref.optimal));
            }
        };

        // Use first plant's preferences as reference (assumes same variety typical) 
        let refPref = null;
        for (let p of this.plants.values()) { refPref = p.preferences; break; }
        if (!refPref) {
            refPref = {
                temperature: { min: 68, optimal: 75, max: 85 },
                humidity: { min: 40, optimal: 55, max: 70 },
                lightIntensity: { min: 30, optimal: 80, max: 100 },
                co2Level: { min: 350, optimal: 1200, max: 1500 }
            };
        }

        const efficiencies = {
            light: factorEfficiency(env.lightIntensity, refPref.lightIntensity),
            temperature: factorEfficiency(env.temperature, refPref.temperature),
            humidity: factorEfficiency(env.humidity, refPref.humidity),
            co2: factorEfficiency(env.co2Level, refPref.co2Level)
        };

        // Limiting factor is smallest efficiency
        let limitingFactor = null;
        let minVal = 999;
        Object.entries(efficiencies).forEach(([k,v]) => { if (v < minVal) { minVal = v; limitingFactor = k; } });

        // Spending effectiveness: compare category spend vs direct contributing factors
        const categoryImpacts = {
            lighting: 'light',
            climate: 'temperature',
            air: 'humidity',
            co2: 'co2',
            nutrient: 'growth',
            automation: 'efficiency',
            security: 'none'
        };
        const spendingSummary = Object.entries(this.spendingByCategory).map(([cat,vals]) => {
            const total = vals.install + vals.operating;
            const impactFactor = categoryImpacts[cat];
            let relatedEfficiency = null;
            if (impactFactor && efficiencies[impactFactor] !== undefined) {
                relatedEfficiency = efficiencies[impactFactor];
            } else if (impactFactor === 'growth') {
                relatedEfficiency = plantCount ? avgGrowth / 100 : 0;
            }
            return { category: cat, install: Math.round(vals.install), operating: Math.round(vals.operating), total: Math.round(total), relatedEfficiency };
        });

        return {
            plantCount,
            avgHealth: Math.round(avgHealth),
            avgGrowth: Math.round(avgGrowth),
            efficiencies,
            limitingFactor,
            spendingSummary
        };
    }
    
    removePlant(x, y) {
        const key = `${x},${y}`;
        this.plants.delete(key);
    }
    
    getPlantAt(x, y) {
        return this.plants.get(`${x},${y}`);
    }
    
    harvestAllReady() {
        let totalValue = 0;
        let count = 0;
        const toRemove = [];
        
        this.plants.forEach((plant, key) => {
            if (plant.isHarvestable) {
                const result = plant.harvest();
                if (result.success) {
                    totalValue += result.revenue;
                    count++;
                    toRemove.push(key);
                    
                    // Award experience based on quality
                    const expGain = result.quality === 'Premium' ? 25 : 
                                   result.quality === 'High' ? 20 : 
                                   result.quality === 'Good' ? 15 : 10;
                    this.addExperience(expGain);
                }
            }
        });
        
        // Remove harvested plants
        toRemove.forEach(key => this.plants.delete(key));
        
        // Add revenue
        this.cash += totalValue;
        this.totalRevenue += totalValue;
        
        return { count, totalValue };
    }
    
    // Game state management
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    
    toggleSpeed() {
        this.gameSpeed = this.gameSpeed >= 4 ? 1 : this.gameSpeed * 2;
    }
    
    // Progression system
    addExperience(amount) {
        this.experience += amount;
        
        if (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.playerLevel++;
        this.experience = 0;
        this.experienceToNext = this.playerLevel * 100;
        
        // Award level up bonus
        this.cash += this.playerLevel * 50;
        
        // Unlock new content
        this.unlockNewContent();
        
        this.ui.showNotification(`Level up! You are now level ${this.playerLevel}`, 'success');
    }
    
    unlockNewContent() {
        // Unlock plant varieties
        if (this.playerLevel >= 3 && !this.unlockedVarieties.includes('premium')) {
            this.unlockedVarieties.push('premium');
            this.ui.showNotification('Premium seeds unlocked!', 'success');
        }
        if (this.playerLevel >= 6 && !this.unlockedVarieties.includes('exotic')) {
            this.unlockedVarieties.push('exotic');
            this.ui.showNotification('Exotic seeds unlocked!', 'success');
        }
        
        // Auto-unlock research based on level
        Object.keys(this.researchTree).forEach(researchId => {
            const research = this.researchTree[researchId];
            if (!research.unlocked && this.researchPoints >= research.cost) {
                research.unlocked = true;
                this.researchPoints -= research.cost;
                this.ui.showNotification(`Research completed: ${researchId.replace('_', ' ')}!`, 'success');
            }
        });
        
        // Research points
        this.researchPoints += this.playerLevel * 2;
    }
    
    checkLevelProgression() {
        // Additional progression checks
        if (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }
    
    // Achievement system
    checkAchievements() {
        const achievements = [
            {
                id: 'first_plant',
                name: 'Green Thumb',
                description: 'Plant your first seed',
                condition: () => this.plants.size >= 1,
                reward: { cash: 100, experience: 25 }
            },
            {
                id: 'full_farm',
                name: 'Full Bloom',
                description: 'Fill all farm slots with plants',
                condition: () => this.plants.size >= this.farmWidth * this.farmHeight,
                reward: { cash: 1000, experience: 100 }
            },
            {
                id: 'first_harvest',
                name: 'First Harvest',
                description: 'Harvest your first plant',
                condition: () => this.totalRevenue > 0,
                reward: { cash: 200, experience: 50 }
            },
            {
                id: 'profitable',
                name: 'Profitable Farmer',
                description: 'Achieve positive daily profit',
                condition: () => this.dailyProfit > 0,
                reward: { cash: 500, experience: 75 }
            },
            {
                id: 'high_tech',
                name: 'High-Tech Farmer',
                description: 'Install 5 different types of equipment',
                condition: () => {
                    const types = new Set();
                    this.equipmentManager.getAllEquipment().forEach(eq => types.add(eq.type));
                    return types.size >= 5;
                },
                reward: { cash: 2000, experience: 150 }
            }
        ];
        
        achievements.forEach(achievement => {
            if (!this.achievements.has(achievement.id) && achievement.condition()) {
                this.achievements.set(achievement.id, true);
                this.cash += achievement.reward.cash;
                this.addExperience(achievement.reward.experience);
                this.ui.showNotification(`Achievement: ${achievement.name}!`, 'success');
            }
        });
    }
    
    // Market and random events
    updateMarketConditions() {
        // Seasonal changes
        const season = Math.floor((this.gameDay % 365) / 91);
        this.marketConditions.seasonalBonus = [1.2, 1.0, 0.8, 1.1][season]; // Spring, Summer, Fall, Winter
        
        // Random market fluctuations
        this.marketConditions.demandMultiplier += (Math.random() - 0.5) * this.marketConditions.priceVolatility;
        this.marketConditions.demandMultiplier = Math.max(0.5, Math.min(2.0, this.marketConditions.demandMultiplier));
        
        // Competition level changes
        if (Math.random() < 0.05) { // 5% chance
            this.marketConditions.competitionLevel += (Math.random() - 0.5) * 0.2;
            this.marketConditions.competitionLevel = Math.max(0.5, Math.min(2.0, this.marketConditions.competitionLevel));
        }
    }
    
    checkRandomEvents() {
        const events = [
            {
                chance: 0.05,
                name: 'Power Outage',
                description: 'A power outage affects your equipment for a day',
                effect: () => {
                    this.equipmentManager.equipment.forEach(eq => {
                        if (eq.specs.powerUsage > 0) eq.isActive = false;
                    });
                }
            },
            {
                chance: 0.03,
                name: 'Pest Infestation',
                description: 'Pests attack your plants, reducing health',
                effect: () => {
                    this.plants.forEach(plant => {
                        plant.health = Math.max(10, plant.health - 20);
                        plant.stressLevel = Math.min(100, plant.stressLevel + 30);
                    });
                }
            },
            {
                chance: 0.02,
                name: 'Market Boom',
                description: 'High demand increases plant values',
                effect: () => {
                    this.marketConditions.demandMultiplier *= 1.5;
                    setTimeout(() => {
                        this.marketConditions.demandMultiplier /= 1.5;
                    }, 86400000 / this.gameSpeed); // Effect lasts one game day
                }
            },
            {
                chance: 0.01,
                name: 'Government Inspection',
                description: 'You pass a government inspection and receive a bonus',
                effect: () => {
                    this.cash += 1000;
                    this.addExperience(50);
                }
            }
        ];
        
        events.forEach(event => {
            if (Math.random() < event.chance) {
                event.effect();
                this.ui.showNotification(`Random Event: ${event.name}`, 'warning');
            }
        });
    }
    
    // Save/Load system
    saveGame() {
        if (typeof Storage !== 'undefined') {
            const gameState = {
                gameDay: this.gameDay,
                cash: this.cash,
                playerLevel: this.playerLevel,
                experience: this.experience,
                totalRevenue: this.totalRevenue,
                totalElectricityCost: this.totalElectricityCost,
                totalEquipmentCost: this.totalEquipmentCost,
                totalSuppliesCost: this.totalSuppliesCost,
                unlockedVarieties: this.unlockedVarieties,
                achievements: Array.from(this.achievements.entries()),
                marketConditions: this.marketConditions,
                plants: Array.from(this.plants.entries()).map(([key, plant]) => [key, {
                    x: plant.x,
                    y: plant.y,
                    variety: plant.variety,
                    stage: plant.stage,
                    age: plant.age,
                    health: plant.health,
                    waterLevel: plant.waterLevel,
                    nutrientLevel: plant.nutrientLevel
                    // Add other plant properties as needed
                }]),
                equipment: this.equipmentManager.getAllEquipment().map(eq => ({
                    type: eq.type,
                    x: eq.x,
                    y: eq.y,
                    level: eq.level,
                    durability: eq.durability,
                    isActive: eq.isActive
                }))
            };
            
            localStorage.setItem('thc_farmer_save', JSON.stringify(gameState));
        }
    }
    
    loadGame() {
        if (typeof Storage !== 'undefined') {
            const saved = localStorage.getItem('thc_farmer_save');
            if (saved) {
                try {
                    const gameState = JSON.parse(saved);
                    
                    // Restore basic state
                    Object.keys(gameState).forEach(key => {
                        if (this.hasOwnProperty(key) && typeof gameState[key] !== 'object') {
                            this[key] = gameState[key];
                        }
                    });
                    
                    // Restore complex objects
                    this.achievements = new Map(gameState.achievements);
                    this.marketConditions = gameState.marketConditions;
                    this.unlockedVarieties = gameState.unlockedVarieties;
                    
                    // Restore plants
                    this.plants.clear();
                    gameState.plants.forEach(([key, plantData]) => {
                        const plant = new Plant(plantData.x, plantData.y, plantData.variety);
                        Object.assign(plant, plantData);
                        this.plants.set(key, plant);
                    });
                    
                    // Restore equipment
                    gameState.equipment.forEach(equipData => {
                        this.equipmentManager.installEquipment(equipData.type, equipData.x, equipData.y);
                        const equipment = this.equipmentManager.getEquipmentAt(equipData.x, equipData.y);
                        if (equipment) {
                            Object.assign(equipment, equipData);
                        }
                    });
                    
                    this.ui.showNotification('Game loaded successfully', 'success');
                    return true;
                } catch (error) {
                    console.error('Failed to load game:', error);
                    this.ui.showNotification('Failed to load saved game', 'error');
                    return false;
                }
            }
        }
        return false;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new THCFarmerGame();
    
    // Try to load saved game
    if (!window.game.loadGame()) {
        console.log('Starting new game');
    }
});