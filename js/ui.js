// ui.js - User Interface Management

class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedPlant = null;
        this.selectedEquipment = null;
        this.currentView = 'farm';
        this.isDragging = false;
        this.draggedEquipmentType = null;
        
        this.initializeUI();
        this.bindEvents();
    }
    
    initializeUI() {
        this.createFarmGrid();
        this.updateEquipmentShop();
        this.updateStats();
        this.createModals();
    }
    
    createFarmGrid() {
        const farmGrid = document.getElementById('farm-grid');
        farmGrid.innerHTML = '';
        
        for (let y = 0; y < this.game.farmHeight; y++) {
            for (let x = 0; x < this.game.farmWidth; x++) {
                const slot = document.createElement('div');
                slot.className = 'farm-slot';
                slot.dataset.x = x;
                slot.dataset.y = y;
                slot.id = `slot-${x}-${y}`;
                
                // Add drop zone functionality
                slot.addEventListener('dragover', this.handleDragOver.bind(this));
                slot.addEventListener('drop', this.handleDrop.bind(this));
                slot.addEventListener('click', this.handleSlotClick.bind(this));
                
                farmGrid.appendChild(slot);
            }
        }
    }
    
    updateFarmDisplay() {
        for (let y = 0; y < this.game.farmHeight; y++) {
            for (let x = 0; x < this.game.farmWidth; x++) {
                const slot = document.getElementById(`slot-${x}-${y}`);
                const plant = this.game.getPlantAt(x, y);
                const equipment = this.game.equipmentManager.getEquipmentAt(x, y);
                
                // Clear previous content
                slot.innerHTML = '';
                slot.className = 'farm-slot';
                
                // Add plant if present
                if (plant) {
                    const plantElement = document.createElement('div');
                    plantElement.className = `plant ${plant.stage}`;
                    plantElement.textContent = plant.getDisplayEmoji();
                    
                    if (plant.isHarvestable) {
                        plantElement.classList.add('ready');
                    }
                    
                    // Add health indicator
                    const healthStatus = plant.getHealthStatus();
                    const statusIndicator = document.createElement('div');
                    statusIndicator.className = `status-indicator status-${healthStatus.status}`;
                    plantElement.appendChild(statusIndicator);
                    
                    slot.appendChild(plantElement);
                    slot.classList.add('occupied');
                }
                
                // Add equipment if present
                if (equipment) {
                    const equipmentElement = document.createElement('div');
                    equipmentElement.className = 'equipment-icon';
                    equipmentElement.textContent = equipment.specs.icon;
                    equipmentElement.title = equipment.specs.name;
                    
                    const status = equipment.getStatus();
                    equipmentElement.style.color = status.statusColor;
                    
                    if (equipment.maintenanceRequired) {
                        equipmentElement.classList.add('maintenance-required');
                    }
                    
                    slot.appendChild(equipmentElement);
                    slot.classList.add('has-equipment');
                }
                
                // Add environmental effect visualization
                const effects = this.game.equipmentManager.calculateEnvironmentalEffects(x, y);
                if (effects.lightIntensity > 0 || effects.temperature !== 0) {
                    slot.style.boxShadow = this.getEnvironmentalGlow(effects);
                }
            }
        }
    }
    
    getEnvironmentalGlow(effects) {
        let glowColor = 'rgba(255, 255, 255, 0.1)';
        
        if (effects.lightIntensity > 30) {
            glowColor = `rgba(255, 235, 59, ${Math.min(effects.lightIntensity / 100, 0.5)})`;
        }
        if (effects.temperature > 5) {
            glowColor = `rgba(255, 87, 34, ${Math.min(effects.temperature / 15, 0.3)})`;
        }
        if (effects.temperature < -5) {
            glowColor = `rgba(33, 150, 243, ${Math.min(Math.abs(effects.temperature) / 15, 0.3)})`;
        }
        
        return `inset 0 0 10px ${glowColor}`;
    }
    
    updateEquipmentShop() {
        const equipmentList = document.getElementById('equipment-list');
        equipmentList.innerHTML = '';
        
        const shopInventory = this.game.equipmentManager.getShopInventory(this.game.playerLevel);
        
        shopInventory.forEach(item => {
            const equipmentItem = document.createElement('div');
            equipmentItem.className = 'equipment-item';
            
            const canAfford = this.game.cash >= item.installationCost;
            equipmentItem.classList.add(canAfford ? 'affordable' : 'expensive');
            
            equipmentItem.innerHTML = `
                <div class="equipment-name">
                    <span class="equipment-icon">${item.icon}</span>
                    <span>${item.name}</span>
                </div>
                <div class="equipment-price">$${item.installationCost}</div>
            `;
            
            // Add drag functionality
            equipmentItem.draggable = canAfford;
            equipmentItem.dataset.equipmentType = item.type;
            
            if (canAfford) {
                equipmentItem.addEventListener('dragstart', this.handleDragStart.bind(this));
                equipmentItem.addEventListener('click', () => this.selectEquipmentForPlacement(item.type));
            }
            
            // Add tooltip
            equipmentItem.title = `${item.description}\nDaily cost: $${item.dailyOperatingCost}\nPower: ${item.powerUsage}W`;
            
            equipmentList.appendChild(equipmentItem);
        });
    }
    
    updateStats() {
        // Update financial stats
        document.getElementById('cash').textContent = `$${this.game.cash.toLocaleString()}`;
        document.getElementById('daily-profit').textContent = 
            `${this.game.dailyProfit >= 0 ? '+' : ''}$${this.game.dailyProfit.toLocaleString()}`;
        document.getElementById('daily-profit').className = 
            `stat-value ${this.game.dailyProfit >= 0 ? 'profit' : 'loss'}`;
        
        // Update plant count
        const plantCount = this.game.plants.size;
        document.getElementById('plant-count').textContent = plantCount;
        
        // Update game day
        document.getElementById('game-day').textContent = this.game.gameDay;
        
        // Update environmental stats
        const avgEnvironment = this.game.getAverageEnvironment();
        document.getElementById('temperature').textContent = `${Math.round(avgEnvironment.temperature)}°F`;
        document.getElementById('humidity').textContent = `${Math.round(avgEnvironment.humidity)}%`;
        document.getElementById('light-level').textContent = `${Math.round(avgEnvironment.lightIntensity)}%`;
        document.getElementById('co2-level').textContent = `${Math.round(avgEnvironment.co2Level)}ppm`;
        
        // Update financial breakdown
        document.getElementById('total-revenue').textContent = `$${this.game.totalRevenue.toLocaleString()}`;
        document.getElementById('electricity-cost').textContent = `-$${this.game.totalElectricityCost.toLocaleString()}`;
        document.getElementById('equipment-cost').textContent = `-$${this.game.totalEquipmentCost.toLocaleString()}`;
        document.getElementById('supplies-cost').textContent = `-$${this.game.totalSuppliesCost.toLocaleString()}`;
        
        const netProfit = this.game.totalRevenue - this.game.totalElectricityCost - this.game.totalEquipmentCost - this.game.totalSuppliesCost;
        document.getElementById('net-profit').textContent = `$${netProfit.toLocaleString()}`;
        document.getElementById('net-profit').className = netProfit >= 0 ? 'green' : 'red';
    }
    
    updatePlantDetails(plant) {
        const plantInfo = document.getElementById('selected-plant-info');
        
        if (!plant) {
            plantInfo.innerHTML = '<p>Select a plant to view details</p>';
            return;
        }
        
        const details = plant.getDetailedInfo();
        const healthStatus = plant.getHealthStatus();
        
        plantInfo.innerHTML = `
            <div class="plant-overview">
                <h4>${plant.getDisplayEmoji()} ${details.stage.charAt(0).toUpperCase() + details.stage.slice(1)} Plant</h4>
                <p>Age: ${details.age} days | Quality: ${details.quality}</p>
                <p>Estimated Value: $${details.value}</p>
            </div>
            
            <div class="plant-stats">
                <div class="plant-stat">
                    <span>Health:</span>
                    <div class="stat-bar">
                        <div class="stat-fill health-bar" style="width: ${details.health}%"></div>
                    </div>
                    <span>${details.health}%</span>
                </div>
                
                <div class="plant-stat">
                    <span>Growth:</span>
                    <div class="stat-bar">
                        <div class="stat-fill growth-bar" style="width: ${details.growth}%"></div>
                    </div>
                    <span>${details.growth}%</span>
                </div>
                
                <div class="plant-stat">
                    <span>Water:</span>
                    <div class="stat-bar">
                        <div class="stat-fill water-bar" style="width: ${details.water}%"></div>
                    </div>
                    <span>${details.water}%</span>
                </div>
                
                <div class="plant-stat">
                    <span>Nutrients:</span>
                    <div class="stat-bar">
                        <div class="stat-fill nutrients-bar" style="width: ${details.nutrients}%"></div>
                    </div>
                    <span>${details.nutrients}%</span>
                </div>
                
                <div class="plant-stat">
                    <span>Stress Level:</span>
                    <span style="color: ${details.stress < 30 ? '#4CAF50' : details.stress < 70 ? '#FF9800' : '#F44336'}">${details.stress}%</span>
                </div>
            </div>
            
            ${details.isHarvestable ? '<p class="harvest-ready">🌾 Ready for harvest!</p>' : ''}
            ${details.isDead ? '<p class="plant-dead">💀 Plant is dead</p>' : ''}
        `;
    }
    
    createModals() {
        // Ensure plant modal exists (already in HTML). Add equipment modal if missing.
        if (!document.getElementById('equipment-modal')) {
            const modal = document.createElement('div');
            modal.id = 'equipment-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-btn equip-close">&times;</span>
                    <h3>Equipment Details</h3>
                    <div id="equipment-modal-details"></div>
                    <div class="modal-actions">
                        <button id="maintain-equipment-btn" class="action-btn">🔧 Maintain</button>
                        <button id="toggle-equipment-btn" class="action-btn">⏯️ Toggle</button>
                        <button id="remove-equipment-btn" class="action-btn">🗑️ Remove</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }
        // Bind close if not already
        const equipClose = document.querySelector('#equipment-modal .equip-close');
        if (equipClose && !equipClose.dataset.bound) {
            equipClose.addEventListener('click', () => this.closeEquipmentModal());
            equipClose.dataset.bound = 'true';
        }
    }
    
    // Event handlers
    bindEvents() {
        // Game control buttons
        document.getElementById('play-pause-btn').addEventListener('click', this.toggleGamePause.bind(this));
        document.getElementById('speed-btn').addEventListener('click', this.toggleGameSpeed.bind(this));
        document.getElementById('plant-seed-btn').addEventListener('click', this.enterPlantingMode.bind(this));
        document.getElementById('harvest-all-btn').addEventListener('click', this.harvestAll.bind(this));
        
        // Modal events
        document.querySelector('.close-btn').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('plant-modal').addEventListener('click', this.handleModalClick.bind(this));
        
        // Plant action buttons
        document.getElementById('water-plant-btn').addEventListener('click', () => this.performPlantAction('water'));
        document.getElementById('add-nutrients-btn').addEventListener('click', () => this.performPlantAction('nutrients'));
        document.getElementById('harvest-plant-btn').addEventListener('click', () => this.performPlantAction('harvest'));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }
    
    handleSlotClick(event) {
        const x = parseInt(event.currentTarget.dataset.x);
        const y = parseInt(event.currentTarget.dataset.y);
        
        const plant = this.game.getPlantAt(x, y);
        const equipment = this.game.equipmentManager.getEquipmentAt(x, y);
        
        if (this.game.currentMode === 'planting' && !plant && !equipment) {
            // Plant a seed
            this.game.plantSeed(x, y);
        } else if (plant) {
            // Select plant for detailed view
            this.selectedPlant = plant;
            this.updatePlantDetails(plant);
            
            // Show plant modal for actions
            this.showPlantModal(plant);
        } else if (equipment) {
            // Show equipment details
            this.selectedEquipment = equipment;
            this.showEquipmentModal(equipment);
        }
    }
    
    handleDragStart(event) {
        this.isDragging = true;
        this.draggedEquipmentType = event.currentTarget.dataset.equipmentType;
        event.dataTransfer.setData('text/plain', this.draggedEquipmentType);
        event.dataTransfer.effectAllowed = 'copy';
    }
    
    handleDragOver(event) {
        if (this.isDragging) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
    }
    
    handleDrop(event) {
        if (!this.isDragging) return;
        
        event.preventDefault();
        const x = parseInt(event.currentTarget.dataset.x);
        const y = parseInt(event.currentTarget.dataset.y);
        const equipmentType = event.dataTransfer.getData('text/plain');
        
        this.game.installEquipment(equipmentType, x, y);
        this.isDragging = false;
        this.draggedEquipmentType = null;
    }
    
    toggleGamePause() {
        this.game.togglePause();
        const btn = document.getElementById('play-pause-btn');
        btn.textContent = this.game.isPaused ? '▶️ Play' : '⏸️ Pause';
    }
    
    toggleGameSpeed() {
        this.game.toggleSpeed();
        const btn = document.getElementById('speed-btn');
        const speeds = ['1x', '2x', '4x'];
        btn.textContent = `🕐 ${speeds[this.game.gameSpeed - 1]}`;
    }
    
    enterPlantingMode() {
        this.game.currentMode = 'planting';
        document.getElementById('plant-seed-btn').textContent = '🌱 Planting Mode (ESC to exit)';
        document.getElementById('plant-seed-btn').style.background = '#ff9800';
    }
    
    exitPlantingMode() {
        this.game.currentMode = 'normal';
        document.getElementById('plant-seed-btn').textContent = '🌱 Plant Seed ($50)';
        document.getElementById('plant-seed-btn').style.background = '';
    }
    
    harvestAll() {
        const harvested = this.game.harvestAllReady();
        if (harvested.count > 0) {
            this.showNotification(`Harvested ${harvested.count} plants for $${harvested.totalValue}`, 'success');
        } else {
            this.showNotification('No plants ready for harvest', 'info');
        }
    }
    
    selectEquipmentForPlacement(equipmentType) {
        this.game.currentMode = 'placing_equipment';
        this.game.selectedEquipmentType = equipmentType;
        this.showNotification('Click on an empty slot to place equipment', 'info');
    }
    
    showPlantModal(plant) {
        const modal = document.getElementById('plant-modal');
        const modalDetails = document.getElementById('modal-plant-details');
        
        const details = plant.getDetailedInfo();
        modalDetails.innerHTML = `
            <h4>${plant.getDisplayEmoji()} Plant Details</h4>
            <p><strong>Stage:</strong> ${details.stage}</p>
            <p><strong>Age:</strong> ${details.age} days</p>
            <p><strong>Health:</strong> ${details.health}%</p>
            <p><strong>Water Level:</strong> ${details.water}%</p>
            <p><strong>Nutrient Level:</strong> ${details.nutrients}%</p>
            <p><strong>Current Value:</strong> $${details.value}</p>
            <p><strong>Quality:</strong> ${details.quality}</p>
        `;
        
        // Update button availability
        document.getElementById('water-plant-btn').disabled = details.isDead;
        document.getElementById('add-nutrients-btn').disabled = details.isDead;
        document.getElementById('harvest-plant-btn').disabled = !details.isHarvestable;
        
        modal.classList.remove('hidden');
    }
    
    showEquipmentModal(equipment) {
        const modal = document.getElementById('equipment-modal');
        if (!modal) return;
        const container = document.getElementById('equipment-modal-details');
        const details = equipment.getDetailedInfo();
        const effectEntries = Object.entries(details.effects || {})
            .filter(([k,v]) => typeof v === 'number')
            .map(([k,v]) => `${k}: ${v>0?'+':''}${v}`);
        container.innerHTML = `
            <p><strong>Type:</strong> ${details.name}</p>
            <p><strong>Description:</strong> ${details.description || ''}</p>
            <p><strong>Level:</strong> ${details.level}</p>
            <p><strong>Coverage:</strong> ${details.coverage}</p>
            <p><strong>Durability:</strong> ${details.durability}%</p>
            <p><strong>Status:</strong> ${details.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Daily Cost:</strong> $${details.dailyOperatingCost}</p>
            <p><strong>Power Usage:</strong> ${details.powerUsage}W</p>
            <p><strong>Effects:</strong></p>
            <ul style="margin-left:15px;">${effectEntries.map(e => `<li>${e}</li>`).join('') || '<li>None</li>'}</ul>
        `;
        document.getElementById('maintain-equipment-btn').onclick = () => this.performEquipmentAction('maintain');
        document.getElementById('toggle-equipment-btn').onclick = () => this.performEquipmentAction('toggle');
        document.getElementById('remove-equipment-btn').onclick = () => this.performEquipmentAction('remove');
        modal.classList.remove('hidden');
    }
    
    closeEquipmentModal() {
        const modal = document.getElementById('equipment-modal');
        if (modal) modal.classList.add('hidden');
        this.selectedEquipment = null;
    }
    
    closeModal() {
        document.getElementById('plant-modal').classList.add('hidden');
        this.closeEquipmentModal();
        this.selectedPlant = null;
        this.selectedEquipment = null;
    }
    
    handleModalClick(event) {
        if (event.target.id === 'plant-modal') {
            this.closeModal();
        }
    }
    
    performPlantAction(action) {
        if (!this.selectedPlant) return;
        
        let result;
        switch (action) {
            case 'water':
                result = this.selectedPlant.water();
                break;
            case 'nutrients':
                result = this.selectedPlant.addNutrients();
                break;
            case 'harvest':
                result = this.selectedPlant.harvest();
                if (result.success) {
                    this.game.removePlant(this.selectedPlant.x, this.selectedPlant.y);
                    this.game.cash += result.revenue;
                    this.game.totalRevenue += result.revenue;
                }
                break;
        }
        
        if (result) {
            if (result.success) {
                this.game.cash -= result.cost || 0;
                this.game.totalSuppliesCost += result.cost || 0;
                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
            
            this.updatePlantDetails(this.selectedPlant);
            this.updateStats();
        }
        
        if (action === 'harvest' && result.success) {
            this.closeModal();
        }
    }
    
    performEquipmentAction(action) {
        if (!this.selectedEquipment) return;
        let result;
        switch(action) {
            case 'maintain':
                result = this.game.equipmentManager.maintainEquipment(this.selectedEquipment);
                break;
            case 'toggle':
                result = this.game.equipmentManager.toggleEquipment(this.selectedEquipment);
                break;
            case 'remove':
                result = this.game.equipmentManager.removeEquipment(this.selectedEquipment.x, this.selectedEquipment.y);
                if (result.success) this.closeEquipmentModal();
                break;
        }
        if (result) {
            this.showNotification(result.message, result.success ? 'success' : 'error');
        }
    }
    
    handleKeyboard(event) {
        switch (event.code) {
            case 'Escape':
                if (this.game.currentMode === 'planting') {
                    this.exitPlantingMode();
                } else {
                    this.closeModal();
                }
                break;
            case 'Space':
                event.preventDefault();
                this.toggleGamePause();
                break;
            case 'KeyH':
                this.harvestAll();
                break;
            case 'KeyP':
                this.enterPlantingMode();
                break;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            maxWidth: '300px',
            backgroundColor: type === 'success' ? '#4CAF50' : 
                           type === 'error' ? '#F44336' : 
                           type === 'warning' ? '#FF9800' : '#2196F3'
        });
        
        document.body.appendChild(notification);
        
        // Add fade-in animation
        notification.classList.add('fade-in');
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    // Main update method called by game loop
    update() {
        // Use requestAnimationFrame throttling for performance
        if (!this.updateRequested) {
            this.updateRequested = true;
            requestAnimationFrame(() => {
                this.updateRequested = false;
                this.performUpdate();
            });
        }
    }
    
    performUpdate() {
        this.updateFarmDisplay();
        this.updateStats();
        
        if (this.selectedPlant && !this.selectedPlant.isDead) {
            this.updatePlantDetails(this.selectedPlant);
        }
        
        // Only update equipment shop occasionally to improve performance
        if (!this.lastEquipmentUpdate || Date.now() - this.lastEquipmentUpdate > 5000) {
            this.updateEquipmentShop();
            this.lastEquipmentUpdate = Date.now();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}