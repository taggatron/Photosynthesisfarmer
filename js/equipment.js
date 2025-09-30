// Equipment.js - Farm equipment system

class Equipment {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.isActive = true;
        this.level = 1;
        this.durability = 100;
        this.installationCost = 0;
        this.dailyOperatingCost = 0;
        
        // Load equipment specifications
        this.specs = this.getEquipmentSpecs(type);
        this.installationCost = this.specs.cost;
        this.dailyOperatingCost = this.specs.operatingCost;
        
        // Performance tracking
        this.totalOperatingHours = 0;
        this.maintenanceRequired = false;
        this.lastMaintenance = 0;
    }
    
    getEquipmentSpecs(type) {
        const equipmentDatabase = {
            'led_light': {
                name: 'LED Grow Light',
                cost: 200,
                operatingCost: 15,
                powerUsage: 100, // watts
                coverage: 4, // farm slots
                effects: {
                    lightIntensity: 40,
                    temperature: 2
                },
                durability: 90,
                maintenanceInterval: 30,
                icon: '💡',
                description: 'High-efficiency LED lighting system for optimal plant growth'
            },
            'hps_light': {
                name: 'HPS Grow Light',
                cost: 150,
                operatingCost: 25,
                powerUsage: 400,
                coverage: 6,
                effects: {
                    lightIntensity: 50,
                    temperature: 8
                },
                durability: 60,
                maintenanceInterval: 20,
                icon: '🔆',
                description: 'Traditional high-pressure sodium lighting with high heat output'
            },
            'heater': {
                name: 'Space Heater',
                cost: 100,
                operatingCost: 8,
                powerUsage: 500,
                coverage: 8,
                effects: {
                    temperature: 10
                },
                durability: 85,
                maintenanceInterval: 45,
                icon: '🔥',
                description: 'Maintains optimal temperature for plant growth'
            },
            'air_conditioner': {
                name: 'Air Conditioner',
                cost: 350,
                operatingCost: 12,
                powerUsage: 800,
                coverage: 12,
                effects: {
                    temperature: -15,
                    humidity: -10
                },
                durability: 80,
                maintenanceInterval: 60,
                icon: '❄️',
                description: 'Cools and dehumidifies growing environment'
            },
            'humidifier': {
                name: 'Humidifier',
                cost: 80,
                operatingCost: 3,
                powerUsage: 50,
                coverage: 6,
                effects: {
                    humidity: 20
                },
                durability: 70,
                maintenanceInterval: 15,
                icon: '💨',
                description: 'Increases humidity levels for optimal growing conditions'
            },
            'dehumidifier': {
                name: 'Dehumidifier',
                cost: 120,
                operatingCost: 5,
                powerUsage: 200,
                coverage: 8,
                effects: {
                    humidity: -25
                },
                durability: 75,
                maintenanceInterval: 20,
                icon: '🌬️',
                description: 'Reduces humidity to prevent mold and pests'
            },
            'ventilation_fan': {
                name: 'Ventilation Fan',
                cost: 60,
                operatingCost: 2,
                powerUsage: 75,
                coverage: 10,
                effects: {
                    temperature: -3,
                    humidity: -5,
                    airCirculation: 30
                },
                durability: 90,
                maintenanceInterval: 30,
                icon: '🌀',
                description: 'Improves air circulation and prevents stagnation'
            },
            'co2_generator': {
                name: 'CO₂ Generator',
                cost: 300,
                operatingCost: 20,
                powerUsage: 150,
                coverage: 15,
                effects: {
                    co2Level: 600,
                    temperature: 3
                },
                durability: 85,
                maintenanceInterval: 25,
                icon: '🫧',
                description: 'Increases CO₂ levels to boost photosynthesis'
            },
            'hydroponic_system': {
                name: 'Hydroponic System',
                cost: 500,
                operatingCost: 10,
                powerUsage: 100,
                coverage: 6,
                effects: {
                    nutrientEfficiency: 2.0,
                    waterEfficiency: 1.5,
                    growth: 25
                },
                durability: 95,
                maintenanceInterval: 40,
                icon: '🏺',
                description: 'Automated nutrient delivery system for faster growth'
            },
            'ph_controller': {
                name: 'pH Controller',
                cost: 180,
                operatingCost: 3,
                powerUsage: 25,
                coverage: 8,
                effects: {
                    phStability: 95,
                    nutrientUptake: 20
                },
                durability: 80,
                maintenanceInterval: 35,
                icon: '🧪',
                description: 'Automatically maintains optimal pH levels'
            },
            'security_camera': {
                name: 'Security Camera',
                cost: 150,
                operatingCost: 1,
                powerUsage: 20,
                coverage: 20,
                effects: {
                    security: 80,
                    monitoring: 100
                },
                durability: 95,
                maintenanceInterval: 90,
                icon: '📹',
                description: 'Monitors your farm and deters theft'
            },
            'timer_system': {
                name: 'Automated Timer',
                cost: 75,
                operatingCost: 0.5,
                powerUsage: 5,
                coverage: 999, // Affects all equipment
                effects: {
                    automation: 50,
                    efficiency: 15
                },
                durability: 100,
                maintenanceInterval: 180,
                icon: '⏰',
                description: 'Automates equipment schedules for optimal efficiency'
            }
        };
        
        return equipmentDatabase[type] || equipmentDatabase['led_light'];
    }
    
    // Calculate equipment effects on environment
    getEnvironmentalEffects() {
        if (!this.isActive || this.durability <= 0) {
            return {};
        }
        
        const effects = { ...this.specs.effects };
        
        // Apply durability modifier
        const durabilityModifier = this.durability / 100;
        Object.keys(effects).forEach(key => {
            if (typeof effects[key] === 'number') {
                effects[key] *= durabilityModifier;
            }
        });
        
        // Apply level modifier
        const levelModifier = 1 + (this.level - 1) * 0.15;
        Object.keys(effects).forEach(key => {
            if (typeof effects[key] === 'number') {
                effects[key] *= levelModifier;
            }
        });
        
        return effects;
    }
    
    // Daily maintenance and wear
    dailyUpdate(gameDay) {
        if (!this.isActive) return;
        
        this.totalOperatingHours += 24;
        
        // Equipment degrades over time
        const degradationRate = this.specs.durability > 80 ? 0.5 : 1.0;
        this.durability = Math.max(0, this.durability - degradationRate);
        
        // Check if maintenance is required
        const daysSinceInstall = gameDay - (this.lastMaintenance || 0);
        if (daysSinceInstall >= this.specs.maintenanceInterval) {
            this.maintenanceRequired = true;
        }
        
        // Calculate operating cost
        const cost = this.dailyOperatingCost * (this.isActive ? 1 : 0);
        
        return {
            operatingCost: cost,
            powerUsage: this.isActive ? this.specs.powerUsage : 0
        };
    }
    
    // Perform maintenance
    performMaintenance(gameDay) {
        const maintenanceCost = Math.floor(this.specs.cost * 0.1);
        
        this.durability = Math.min(100, this.durability + 20);
        this.maintenanceRequired = false;
        this.lastMaintenance = gameDay;
        
        return {
            success: true,
            cost: maintenanceCost,
            message: `${this.specs.name} maintenance completed`,
            durabilityRestored: 20
        };
    }
    
    // Upgrade equipment
    upgrade() {
        if (this.level >= 5) {
            return { success: false, message: "Equipment already at maximum level" };
        }
        
        const upgradeCost = Math.floor(this.specs.cost * this.level * 0.5);
        
        this.level++;
        this.durability = Math.min(100, this.durability + 10);
        
        return {
            success: true,
            cost: upgradeCost,
            message: `${this.specs.name} upgraded to level ${this.level}`,
            newLevel: this.level
        };
    }
    
    // Toggle equipment on/off
    togglePower() {
        this.isActive = !this.isActive;
        return {
            success: true,
            message: `${this.specs.name} ${this.isActive ? 'activated' : 'deactivated'}`,
            status: this.isActive
        };
    }
    
    // Get equipment status for UI
    getStatus() {
        let status = 'operational';
        let statusColor = '#4CAF50';
        
        if (this.durability <= 0) {
            status = 'broken';
            statusColor = '#F44336';
        } else if (this.maintenanceRequired) {
            status = 'maintenance_required';
            statusColor = '#FF9800';
        } else if (this.durability < 30) {
            status = 'poor_condition';
            statusColor = '#FF5722';
        } else if (!this.isActive) {
            status = 'inactive';
            statusColor = '#9E9E9E';
        }
        
        return {
            status,
            statusColor,
            durability: this.durability,
            level: this.level,
            isActive: this.isActive,
            maintenanceRequired: this.maintenanceRequired,
            operatingCost: this.dailyOperatingCost,
            powerUsage: this.specs.powerUsage
        };
    }
    
    // Get detailed information for equipment panel
    getDetailedInfo() {
        return {
            name: this.specs.name,
            type: this.type,
            description: this.specs.description,
            level: this.level,
            durability: Math.floor(this.durability),
            isActive: this.isActive,
            installationCost: this.installationCost,
            dailyOperatingCost: this.dailyOperatingCost,
            powerUsage: this.specs.powerUsage,
            coverage: this.specs.coverage,
            effects: this.specs.effects,
            status: this.getStatus(),
            maintenanceRequired: this.maintenanceRequired,
            totalOperatingHours: this.totalOperatingHours,
            icon: this.specs.icon
        };
    }
}

// Equipment Manager class
class EquipmentManager {
    constructor() {
        this.equipment = new Map(); // Map of position -> Equipment
        this.availableEquipment = this.getAvailableEquipment();
        this.totalPowerUsage = 0;
        this.totalOperatingCosts = 0;
    }
    
    getAvailableEquipment() {
        return [
            { type: 'led_light', unlockLevel: 1 },
            { type: 'ventilation_fan', unlockLevel: 1 },
            { type: 'heater', unlockLevel: 2 },
            { type: 'humidifier', unlockLevel: 2 },
            { type: 'hps_light', unlockLevel: 3 },
            { type: 'dehumidifier', unlockLevel: 3 },
            { type: 'co2_generator', unlockLevel: 4 },
            { type: 'air_conditioner', unlockLevel: 4 },
            { type: 'hydroponic_system', unlockLevel: 5 },
            { type: 'ph_controller', unlockLevel: 5 },
            { type: 'security_camera', unlockLevel: 6 },
            { type: 'timer_system', unlockLevel: 7 }
        ];
    }
    
    // Install new equipment
    installEquipment(type, x, y, playerLevel = 1) {
        const key = `${x},${y}`;
        
        // Check if slot is already occupied
        if (this.equipment.has(key)) {
            return { success: false, message: "Slot already occupied" };
        }
        
        // Check if equipment is unlocked
        const equipmentInfo = this.availableEquipment.find(eq => eq.type === type);
        if (!equipmentInfo || playerLevel < equipmentInfo.unlockLevel) {
            return { success: false, message: "Equipment not yet unlocked" };
        }
        
        // Create and install equipment
        const equipment = new Equipment(type, x, y);
        this.equipment.set(key, equipment);
        
        return {
            success: true,
            message: `${equipment.specs.name} installed`,
            cost: equipment.installationCost,
            equipment: equipment
        };
    }
    
    // Remove equipment
    removeEquipment(x, y) {
        const key = `${x},${y}`;
        const equipment = this.equipment.get(key);
        
        if (!equipment) {
            return { success: false, message: "No equipment at this location" };
        }
        
        this.equipment.delete(key);
        
        // Return partial refund
        const refund = Math.floor(equipment.installationCost * 0.3 * (equipment.durability / 100));
        
        return {
            success: true,
            message: `${equipment.specs.name} removed`,
            refund: refund
        };
    }
    
    // Calculate environmental effects for a specific area
    calculateEnvironmentalEffects(x, y, radius = 2) {
        const effects = {
            lightIntensity: 0,
            temperature: 0,
            humidity: 0,
            co2Level: 0,
            nutrientEfficiency: 1.0,
            waterEfficiency: 1.0
        };
        
        // Check all equipment within radius
        this.equipment.forEach((equipment, key) => {
            const [equipX, equipY] = key.split(',').map(Number);
            const distance = Math.sqrt(Math.pow(x - equipX, 2) + Math.pow(y - equipY, 2));
            
            // Apply effects if within range
            if (distance <= equipment.specs.coverage || equipment.specs.coverage >= 999) {
                const equipEffects = equipment.getEnvironmentalEffects();
                
                // Distance-based effect reduction (except for global effects)
                const distanceModifier = equipment.specs.coverage >= 999 ? 1 : 
                    Math.max(0.3, 1 - (distance / equipment.specs.coverage));
                
                Object.keys(equipEffects).forEach(effect => {
                    if (effects.hasOwnProperty(effect)) {
                        if (typeof equipEffects[effect] === 'number') {
                            effects[effect] += equipEffects[effect] * distanceModifier;
                        } else {
                            effects[effect] = equipEffects[effect];
                        }
                    }
                });
            }
        });
        
        return effects;
    }
    
    // Daily update for all equipment
    dailyUpdate(gameDay) {
        let totalOperatingCost = 0;
        let totalPowerUsage = 0;
        
        this.equipment.forEach(equipment => {
            const costs = equipment.dailyUpdate(gameDay);
            totalOperatingCost += costs.operatingCost;
            totalPowerUsage += costs.powerUsage;
        });
        
        this.totalOperatingCosts = totalOperatingCost;
        this.totalPowerUsage = totalPowerUsage;
        
        // Calculate electricity cost (varies by region, time of day, etc.)
        const electricityCost = this.calculateElectricityCost(totalPowerUsage);
        
        return {
            operatingCosts: totalOperatingCost,
            electricityCost: electricityCost,
            totalPowerUsage: totalPowerUsage
        };
    }
    
    calculateElectricityCost(powerUsage) {
        // Electricity cost per kWh (varies by time and usage tier)
        const baseRate = 0.12; // $0.12 per kWh
        const peakHourMultiplier = 1.5;
        const dailyUsage = (powerUsage * 24) / 1000; // Convert to kWh
        
        // Progressive pricing tiers
        let cost = 0;
        if (dailyUsage <= 10) {
            cost = dailyUsage * baseRate;
        } else if (dailyUsage <= 25) {
            cost = 10 * baseRate + (dailyUsage - 10) * baseRate * 1.2;
        } else {
            cost = 10 * baseRate + 15 * baseRate * 1.2 + (dailyUsage - 25) * baseRate * 1.5;
        }
        
        return Math.round(cost * 100) / 100; // Round to cents
    }
    
    // Get equipment at specific location
    getEquipmentAt(x, y) {
        return this.equipment.get(`${x},${y}`);
    }
    
    // Get all equipment for UI display
    getAllEquipment() {
        const equipmentList = [];
        this.equipment.forEach((equipment, key) => {
            const [x, y] = key.split(',').map(Number);
            equipmentList.push({
                x, y,
                ...equipment.getDetailedInfo()
            });
        });
        return equipmentList;
    }
    
    // Get equipment shop inventory
    getShopInventory(playerLevel = 1) {
        return this.availableEquipment
            .filter(item => playerLevel >= item.unlockLevel)
            .map(item => {
                const equipment = new Equipment(item.type, 0, 0);
                return {
                    type: item.type,
                    ...equipment.getDetailedInfo(),
                    unlockLevel: item.unlockLevel,
                    isUnlocked: true
                };
            });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Equipment, EquipmentManager };
}