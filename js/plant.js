// Plant.js - Cannabis plant growth simulation

class Plant {
    constructor(x, y, variety = 'basic') {
        this.x = x;
        this.y = y;
        this.variety = variety;
        
        // Growth stages: 'seed', 'seedling', 'young', 'mature', 'flowering', 'ready'
        this.stage = 'seed';
        this.age = 0; // in game days
        this.growthProgress = 0; // 0-100 for current stage
        
        // Core health and growth factors
        this.health = 100; // 0-100
        this.size = 1; // multiplier for yield
        
        // Environmental needs and current levels
        this.waterLevel = 50; // 0-100
        this.nutrientLevel = 50; // 0-100
        this.stressLevel = 0; // 0-100 (higher is worse)
        
        // Environmental preferences (optimal ranges)
        this.preferences = {
            temperature: { min: 68, optimal: 75, max: 85 }, // Fahrenheit
            humidity: { min: 40, optimal: 55, max: 70 }, // percentage
            lightIntensity: { min: 30, optimal: 80, max: 100 }, // percentage
            co2Level: { min: 350, optimal: 1200, max: 1500 }, // ppm
            pH: { min: 6.0, optimal: 6.5, max: 7.0 }
        };
        
        // Growth stage requirements
        this.stageRequirements = {
            'seed': { days: 1, waterMin: 70, nutrientMin: 20 },
            'seedling': { days: 7, waterMin: 60, nutrientMin: 30 },
            'young': { days: 14, waterMin: 50, nutrientMin: 40 },
            'mature': { days: 21, waterMin: 45, nutrientMin: 60 },
            'flowering': { days: 28, waterMin: 40, nutrientMin: 80 },
            'ready': { days: Infinity, waterMin: 0, nutrientMin: 0 }
        };
        
        // Economic factors
        this.value = 0; // current estimated value
        this.baseYield = this.getBaseYield(variety);
        this.qualityMultiplier = 1.0; // affected by environmental conditions
        
        // Status tracking
        this.lastWatered = 0;
        this.lastFed = 0;
        this.diseaseResistance = Math.random() * 0.3 + 0.7; // 0.7-1.0
        this.isDead = false;
        this.isHarvestable = false;
        
        // Equipment effects tracking
        this.equipmentEffects = {
            lightBonus: 0,
            temperatureBonus: 0,
            humidityBonus: 0,
            co2Bonus: 0,
            nutrientEfficiency: 1.0
        };
    }
    
    getBaseYield(variety) {
        const varieties = {
            'basic': { min: 50, max: 100, cost: 50 },
            'premium': { min: 80, max: 150, cost: 100 },
            'exotic': { min: 120, max: 250, cost: 200 }
        };
        const v = varieties[variety] || varieties['basic'];
        return Math.random() * (v.max - v.min) + v.min;
    }
    
    // Main update function called each game tick
    update(environment, gameDay) {
        if (this.isDead) return;
        
        this.age = gameDay;
        
        // Calculate environmental stress
        this.calculateEnvironmentalStress(environment);
        
        // Update plant needs
        this.updateNeeds();
        
        // Update growth progress
        this.updateGrowth();
        
        // Update health based on stress and care
        this.updateHealth();
        
        // Update economic value
        this.updateValue();
        
        // Check for stage advancement
        this.checkStageAdvancement();
        
        // Check for death conditions
        this.checkDeathConditions();
    }
    
    calculateEnvironmentalStress(environment) {
        let totalStress = 0;
        const factors = ['temperature', 'humidity', 'lightIntensity', 'co2Level'];
        
        factors.forEach(factor => {
            const current = environment[factor] + (this.equipmentEffects[factor + 'Bonus'] || 0);
            const pref = this.preferences[factor];
            
            let stress = 0;
            if (current < pref.min) {
                stress = (pref.min - current) / pref.min * 100;
            } else if (current > pref.max) {
                stress = (current - pref.max) / pref.max * 100;
            } else if (current < pref.optimal) {
                stress = (pref.optimal - current) / (pref.optimal - pref.min) * 20;
            } else if (current > pref.optimal) {
                stress = (current - pref.optimal) / (pref.max - pref.optimal) * 20;
            }
            
            totalStress += Math.max(0, Math.min(stress, 50)); // Cap individual stress at 50
        });
        
        // Add stress from neglect
        const daysSinceWater = this.age - this.lastWatered;
        const daysSinceFed = this.age - this.lastFed;
        
        if (daysSinceWater > 2) totalStress += (daysSinceWater - 2) * 10;
        if (daysSinceFed > 3) totalStress += (daysSinceFed - 3) * 8;
        
        this.stressLevel = Math.max(0, Math.min(totalStress, 100));
    }
    
    updateNeeds() {
        // Water depletes over time, faster in hot/dry conditions
        const waterDepletionRate = 8 + (this.stressLevel * 0.1);
        this.waterLevel = Math.max(0, this.waterLevel - waterDepletionRate);
        
        // Nutrients deplete based on growth stage and plant size
        const nutrientDepletionRate = 5 + (this.size * 2) + (this.stage === 'flowering' ? 5 : 0);
        this.nutrientLevel = Math.max(0, this.nutrientLevel - nutrientDepletionRate * this.equipmentEffects.nutrientEfficiency);
    }
    
    updateGrowth() {
        const requirements = this.stageRequirements[this.stage];
        
        // Growth rate affected by environmental conditions and care
        let growthRate = 1;
        
        // Positive factors
        if (this.waterLevel > requirements.waterMin) growthRate += 0.5;
        if (this.nutrientLevel > requirements.nutrientMin) growthRate += 0.5;
        if (this.stressLevel < 20) growthRate += 0.3;
        if (this.health > 80) growthRate += 0.2;
        
        // Negative factors
        if (this.stressLevel > 50) growthRate -= 0.4;
        if (this.health < 50) growthRate -= 0.3;
        if (this.waterLevel < requirements.waterMin * 0.5) growthRate -= 0.5;
        if (this.nutrientLevel < requirements.nutrientMin * 0.5) growthRate -= 0.3;
        
        growthRate = Math.max(0.1, growthRate);
        
        // Update growth progress
        const dailyGrowthTarget = 100 / requirements.days;
        this.growthProgress += dailyGrowthTarget * growthRate;
        this.growthProgress = Math.min(100, this.growthProgress);
    }
    
    updateHealth() {
        let healthChange = 0;
        
        // Health affected by stress
        if (this.stressLevel < 20) {
            healthChange += 2; // Slowly recover in good conditions
        } else if (this.stressLevel > 60) {
            healthChange -= 3; // Decline in bad conditions
        }
        
        // Health affected by basic needs
        const requirements = this.stageRequirements[this.stage];
        if (this.waterLevel < requirements.waterMin) healthChange -= 4;
        if (this.nutrientLevel < requirements.nutrientMin) healthChange -= 2;
        
        // Random disease chance (modified by resistance)
        if (Math.random() < (0.002 * (1 - this.diseaseResistance))) {
            healthChange -= 15;
        }
        
        this.health = Math.max(0, Math.min(100, this.health + healthChange));
    }
    
    updateValue() {
        // Base value increases with size and stage
        let stageMultiplier = {
            'seed': 0,
            'seedling': 0.1,
            'young': 0.3,
            'mature': 0.6,
            'flowering': 0.9,
            'ready': 1.0
        }[this.stage];
        
        // Quality affected by care and environment
        this.qualityMultiplier = 1.0;
        if (this.health > 90) this.qualityMultiplier += 0.3;
        else if (this.health < 50) this.qualityMultiplier -= 0.4;
        
        if (this.stressLevel < 10) this.qualityMultiplier += 0.2;
        else if (this.stressLevel > 70) this.qualityMultiplier -= 0.5;
        
        this.qualityMultiplier = Math.max(0.2, this.qualityMultiplier);
        
        this.value = this.baseYield * stageMultiplier * this.qualityMultiplier * this.size;
    }
    
    checkStageAdvancement() {
        if (this.growthProgress >= 100 && this.stage !== 'ready') {
            const stages = ['seed', 'seedling', 'young', 'mature', 'flowering', 'ready'];
            const currentIndex = stages.indexOf(this.stage);
            
            if (currentIndex < stages.length - 1) {
                this.stage = stages[currentIndex + 1];
                this.growthProgress = 0;
                
                if (this.stage === 'ready') {
                    this.isHarvestable = true;
                }
            }
        }
    }
    
    checkDeathConditions() {
        if (this.health <= 0) {
            this.isDead = true;
        }
    }
    
    // Player actions
    water() {
        if (this.isDead) return { success: false, message: "Plant is dead" };
        
        this.waterLevel = Math.min(100, this.waterLevel + 40);
        this.lastWatered = this.age;
        
        return { 
            success: true, 
            message: "Plant watered", 
            cost: 5,
            effect: "+40 water level"
        };
    }
    
    addNutrients() {
        if (this.isDead) return { success: false, message: "Plant is dead" };
        
        this.nutrientLevel = Math.min(100, this.nutrientLevel + 50);
        this.lastFed = this.age;
        
        return { 
            success: true, 
            message: "Nutrients added", 
            cost: 10,
            effect: "+50 nutrient level"
        };
    }
    
    harvest() {
        if (!this.isHarvestable) {
            return { success: false, message: "Plant not ready for harvest" };
        }
        
        const finalValue = Math.floor(this.value);
        const quality = this.getQualityGrade();
        
        return {
            success: true,
            message: `Harvested ${quality} quality plant`,
            revenue: finalValue,
            quality: quality,
            weight: Math.floor(this.baseYield * this.qualityMultiplier / 10) / 10
        };
    }
    
    getQualityGrade() {
        if (this.qualityMultiplier >= 1.4) return "Premium";
        if (this.qualityMultiplier >= 1.1) return "High";
        if (this.qualityMultiplier >= 0.9) return "Good";
        if (this.qualityMultiplier >= 0.6) return "Average";
        return "Low";
    }
    
    // Equipment effect application
    applyEquipmentEffects(effects) {
        this.equipmentEffects = { ...this.equipmentEffects, ...effects };
    }
    
    // UI display methods
    getDisplayEmoji() {
        if (this.isDead) return "💀";
        
        const emojis = {
            'seed': '🌰',
            'seedling': '🌱',
            'young': '🌿',
            'mature': '🍃',
            'flowering': '🌸',
            'ready': '✨🌿'
        };
        
        return emojis[this.stage] || '🌱';
    }
    
    getHealthStatus() {
        if (this.health > 80) return { status: 'healthy', color: '#4CAF50' };
        if (this.health > 50) return { status: 'warning', color: '#FF9800' };
        return { status: 'danger', color: '#F44336' };
    }
    
    getDetailedInfo() {
        return {
            stage: this.stage,
            age: this.age,
            health: Math.floor(this.health),
            water: Math.floor(this.waterLevel),
            nutrients: Math.floor(this.nutrientLevel),
            stress: Math.floor(this.stressLevel),
            growth: Math.floor(this.growthProgress),
            value: Math.floor(this.value),
            quality: this.getQualityGrade(),
            isHarvestable: this.isHarvestable,
            isDead: this.isDead
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Plant;
}