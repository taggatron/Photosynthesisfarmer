# 🌿 Hemp Farmer - Virtual Hemp Farm Simulator

A comprehensive web-based hemp farming simulation game where players manage their own virtual cannabis farm, balancing plant care, equipment, and finances to build a profitable operation.

## 🎮 Game Features

### 🌱 Realistic Plant Growth System
- **Growth Stages**: Seed → Seedling → Young → Mature → Flowering → Ready
- **Environmental Factors**: Temperature, humidity, light intensity, CO₂ levels, and pH
- **Plant Care**: Watering, nutrients, health monitoring, and stress management
- **Quality System**: Plant quality affects final harvest value and market price

### 🔧 Equipment & Upgrades
- **Lighting Systems**: LED and HPS grow lights with different efficiency ratings
- **Climate Control**: Heaters, air conditioners, humidifiers, and dehumidifiers
- **Advanced Systems**: Hydroponic systems, CO₂ generators, pH controllers
- **Automation**: Timer systems and monitoring equipment
- **Maintenance**: Equipment degrades over time and requires maintenance

### 💰 Financial Management
- **Revenue Tracking**: Track income from plant sales and quality bonuses
- **Operating Costs**: Electricity bills, equipment maintenance, and supplies
- **Market Dynamics**: Seasonal price fluctuations and demand changes
- **Profit/Loss Analysis**: Real-time financial performance monitoring

### 🎯 Game Progression
- **Leveling System**: Gain experience through farming activities
- **Achievements**: Complete challenges to unlock bonuses and new content
- **Plant Varieties**: Unlock premium and exotic strains as you progress
- **Research Tree**: Invest research points in improvements and automation

### 🎨 Visual Elements
- **SVG Graphics**: Custom-designed plant stages and equipment icons
- **Interactive Interface**: Drag-and-drop equipment placement
- **Environmental Effects**: Visual indicators for lighting and temperature
- **Status Indicators**: Plant health and equipment condition monitoring

## 🚀 Getting Started

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No additional installation or server setup required!

### Basic Controls
- **Plant Seeds**: Click the "🌱 Plant Seed" button, then click empty farm slots
- **Equipment**: Drag equipment from the shop onto farm slots or click to select
- **Plant Care**: Click on plants to water, add nutrients, or harvest
- **Game Speed**: Use the speed button to control game pace (1x, 2x, 4x)
- **Pause/Play**: Pause the game at any time to plan your strategy

### Keyboard Shortcuts
- **Space**: Pause/Play game
- **P**: Enter planting mode
- **H**: Harvest all ready plants
- **ESC**: Exit current mode or close modals

## 🎯 Gameplay Tips

### 🌿 Plant Care
1. **Monitor Growth Stages**: Each stage has different water and nutrient requirements
2. **Environmental Conditions**: Maintain optimal temperature (75°F) and humidity (55%)
3. **Stress Management**: High stress levels reduce growth and final quality
4. **Timing**: Harvest plants when they reach the "ready" stage for maximum value

### 🏭 Equipment Strategy
1. **Start Simple**: Begin with basic LED lights and ventilation
2. **Coverage Areas**: Each equipment type has a coverage radius - plan placement carefully
3. **Power Management**: Monitor electricity costs as they can quickly eat into profits
4. **Upgrades**: Upgrade equipment to improve efficiency and reduce operating costs

### 💡 Financial Success
1. **Track Daily P/L**: Keep an eye on your daily profit/loss in the header
2. **Balance Investment**: Don't over-invest in equipment early on
3. **Quality Focus**: Higher quality plants sell for significantly more money
4. **Market Timing**: Pay attention to seasonal bonuses and market conditions

### 🎮 Advanced Strategies
1. **Hydroponic Systems**: Expensive but significantly boost growth and efficiency
2. **Automation**: Timer systems reduce labor and improve consistency
3. **Research Investments**: Use research points to unlock better genetics and systems
4. **Achievement Hunting**: Completing achievements provides cash and experience bonuses

## 🛠️ Technical Details

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Optimized for 60 FPS gameplay
- Local storage save/load system
- Responsive design for mobile and desktop

### File Structure
```
THCfarmer/
├── index.html              # Main game interface
├── css/
│   └── style.css          # Game styling and animations
├── js/
│   ├── game.js            # Main game controller
│   ├── plant.js           # Plant growth simulation
│   ├── equipment.js       # Equipment and effects system
│   └── ui.js              # User interface management
└── assets/
    └── svg/               # Game graphics and icons
        ├── plant-seedling.svg
        ├── plant-young.svg
        ├── plant-mature.svg
        ├── led-light.svg
        ├── heater.svg
        ├── hydroponic-system.svg
        ├── ventilation-fan.svg
        └── co2-generator.svg
```

## 🎨 Customization

### Adding New Equipment
1. Define equipment specifications in `equipment.js`
2. Create corresponding SVG graphics
3. Add to the equipment database with costs and effects

### New Plant Varieties
1. Extend the variety system in `plant.js`
2. Define growth characteristics and market values
3. Add unlock conditions in the progression system

### Visual Themes
1. Modify CSS variables for color schemes
2. Replace SVG graphics with custom designs
3. Adjust animations and effects in the stylesheet

## 🐛 Known Issues & Future Features

### Current Limitations
- No multiplayer functionality
- Limited sound effects
- Basic AI for market simulation

### Planned Features
- **Sound System**: Background music and sound effects
- **Weather Events**: Rain, drought, and seasonal effects
- **Pest Management**: More detailed pest and disease system
- **Genetics System**: Breeding plants for better traits
- **Market Trading**: Buy/sell equipment and seeds with other players

## 📄 License

This project is open source and available under the MIT License. Feel free to modify and distribute as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**🌿 Happy Farming! 🌿**

*Build your hemp empire from seed to harvest in this comprehensive farming simulation.*
