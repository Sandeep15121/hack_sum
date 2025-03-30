// dashboard.js - Advanced AgriSense Dashboard Functionality

// Global variables for charts and data
let moisturePhChart, temperatureChart;
let currentFieldData = null;
let sensorDataInterval = null;
let anomalyDetectionEnabled = true;
let soilHealthTrends = {};
let notificationCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts with animations and advanced configuration
    initMoisturePhChart();
    initTemperatureChart();
    
    // Setup event listeners for all dashboard controls
    setupFieldSelector();
    setupTimeRangeSelector();
    setupChartToggles();
    setupExportButton();
    setupSensorHovers();
    setupAdvancedControls();
    
    // Initialize with default field data
    updateDashboardData('field1');
    
    // Start data monitoring systems
    startDataSimulation();
    initializeAnomalyDetection();
    initializePredictiveAnalytics();
    
    // Check if dashboard data exists in localStorage for user preferences
    restoreUserPreferences();
    
    // Display dashboard initialized notification
    showNotification('Dashboard initialized successfully', 'success');
});

// Advanced Field Selection with historical data tracking
function setupFieldSelector() {
    const fieldSelect = document.getElementById('field-select');
    if (!fieldSelect) return;
    
    fieldSelect.addEventListener('change', function() {
        const selectedField = this.value;
        console.log(`Field changed to: ${selectedField}`);
        
        // Log to history for analytics
        logUserAction('field_selection', selectedField);
        
        // Terminate any existing data simulation for previous field
        if (sensorDataInterval) {
            clearInterval(sensorDataInterval);
        }
        
        // Update dashboard data based on selected field
        updateDashboardData(selectedField);
        
        // Save user preference
        saveUserPreference('selectedField', selectedField);
    });
}

// Enhanced dashboard data update with progressive loading
function updateDashboardData(fieldId) {
    // Show progressive loading state with skeleton UI
    showLoadingState();
    
    // In a real application, this would fetch data from a server with proper error handling
    const dataPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const fieldData = getFieldData(fieldId);
                resolve(fieldData);
            } catch (error) {
                reject(error);
                console.error("Error fetching field data:", error);
                showNotification('Error loading field data', 'error');
            }
        }, 800);
    });
    
    // Use Promise to handle data loading sequence
    dataPromise.then(fieldData => {
        // Store current field data globally
        currentFieldData = fieldData;
        
        // Update card values with animation
        animateValueUpdate('moisture-value', fieldData.moisture);
        animateValueUpdate('ph-value', fieldData.ph);
        animateValueUpdate('temperature-value', fieldData.temperature);
        animateValueUpdate('nutrient-value', fieldData.nutrientIndex);
        
        // Update status indicators with enhanced visualization
        updateStatusIndicators(fieldData);
        
        // Update charts with transition animations
        updateCharts(fieldData);
        
        // Update sensor map locations with new data
        updateSensorMap(fieldData);
        
        // Calculate and display soil health trends
        calculateSoilHealthTrends(fieldData);
        
        // Hide loading state
        hideLoadingState();
        
        // Start new data simulation for this field
        startFieldSpecificDataSimulation(fieldId);
        
        // Show notification
        showNotification(`${getFieldDisplayName(fieldId)} data loaded successfully`, 'success');
    }).catch(error => {
        hideLoadingState();
        console.error("Failed to update dashboard:", error);
        showNotification('Failed to update dashboard data', 'error');
    });
}

// Animation for numeric value updates
function animateValueUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Extract numeric part from the value
    let targetValue = newValue;
    let suffix = '';
    
    if (typeof newValue === 'string') {
        // Extract numeric part and suffix (like % or °C)
        const match = newValue.match(/^(\d+\.?\d*)(.*)$/);
        if (match) {
            targetValue = parseFloat(match[1]);
            suffix = match[2];
        }
    }
    
    // Get current value
    let currentValue = parseFloat(element.textContent);
    if (isNaN(currentValue)) currentValue = 0;
    
    // Calculate increment for smooth animation
    const difference = targetValue - currentValue;
    const steps = 20;
    const increment = difference / steps;
    
    // Animate the change
    let step = 0;
    const animation = setInterval(() => {
        step++;
        const newVal = currentValue + (increment * step);
        
        // Format according to data type
        if (element.id === 'ph-value') {
            element.textContent = newVal.toFixed(1) + suffix;
        } else if (element.id === 'nutrient-value') {
            element.textContent = Math.round(newVal) + suffix;
        } else {
            element.textContent = Math.round(newVal) + suffix;
        }
        
        if (step >= steps) {
            clearInterval(animation);
            element.textContent = newValue; // Ensure final value is exactly as provided
        }
    }, 20);
    
    // Add visual feedback for the change
    element.classList.add('value-changed');
    setTimeout(() => element.classList.remove('value-changed'), 1000);
}

// Enhanced field data with more metrics and historical patterns
function getFieldData(fieldId) {
    // Expanded mock data structure with more metrics
    const fieldData = {
        field1: {
            displayName: "North Field (Wheat)",
            moisture: '37%',
            ph: '6.5',
            temperature: '23°C',
            nutrientIndex: '78/100',
            moistureHistory: [34, 35, 38, 37, 36, 37, 37],
            phHistory: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5],
            temperatureHistory: [21, 22, 24, 23, 22, 23, 23],
            nutrients: {
                nitrogen: 65,
                phosphorus: 45,
                potassium: 85,
                calcium: 72
            },
            soilType: "Clay loam",
            lastIrrigation: "2025-03-28",
            lastFertilization: "2025-03-15",
            cropHealth: 85,
            predictedHarvest: "2025-07-15",
            sensors: [
                { id: "S1-NF", location: { top: "30%", left: "25%" }, moisture: 38, ph: 6.7, temperature: 22 },
                { id: "S2-NF", location: { top: "45%", left: "60%" }, moisture: 36, ph: 6.4, temperature: 23 },
                { id: "S3-NF", location: { top: "70%", left: "40%" }, moisture: 35, ph: 6.3, temperature: 24 }
            ],
            healthHistory: {
                moisture: [35, 36, 36, 37, 38, 37, 37, 37, 36, 36, 35, 37],
                ph: [6.4, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5, 6.5, 6.4, 6.5, 6.5, 6.5],
                nutrients: [75, 76, 77, 79, 78, 78, 77, 78, 79, 80, 79, 78]
            }
        },
        field2: {
            displayName: "South Field (Rice)",
            moisture: '42%',
            ph: '5.8',
            temperature: '24°C',
            nutrientIndex: '65/100',
            moistureHistory: [39, 40, 41, 43, 42, 42, 42],
            phHistory: [5.6, 5.7, 5.8, 5.9, 5.8, 5.8, 5.8],
            temperatureHistory: [23, 24, 25, 25, 24, 24, 24],
            nutrients: {
                nitrogen: 58,
                phosphorus: 32,
                potassium: 70,
                calcium: 65
            },
            soilType: "Silty clay",
            lastIrrigation: "2025-03-29",
            lastFertilization: "2025-03-20",
            cropHealth: 72,
            predictedHarvest: "2025-08-10",
            sensors: [
                { id: "S1-SF", location: { top: "35%", left: "30%" }, moisture: 43, ph: 5.7, temperature: 24 },
                { id: "S2-SF", location: { top: "50%", left: "55%" }, moisture: 41, ph: 5.8, temperature: 24 },
                { id: "S3-SF", location: { top: "65%", left: "45%" }, moisture: 40, ph: 5.9, temperature: 25 }
            ],
            healthHistory: {
                moisture: [40, 41, 42, 43, 42, 42, 41, 40, 41, 42, 42, 42],
                ph: [5.6, 5.7, 5.7, 5.8, 5.8, 5.9, 5.8, 5.8, 5.7, 5.8, 5.8, 5.8],
                nutrients: [60, 62, 63, 64, 65, 67, 66, 65, 64, 65, 66, 65]
            }
        },
        field3: {
            displayName: "East Field (Corn)",
            moisture: '31%',
            ph: '7.2',
            temperature: '22°C',
            nutrientIndex: '82/100',
            moistureHistory: [28, 29, 30, 32, 31, 31, 31],
            phHistory: [7.0, 7.1, 7.2, 7.3, 7.2, 7.2, 7.2],
            temperatureHistory: [20, 21, 22, 23, 22, 22, 22],
            nutrients: {
                nitrogen: 72,
                phosphorus: 58,
                potassium: 90,
                calcium: 80
            },
            soilType: "Sandy loam",
            lastIrrigation: "2025-03-27",
            lastFertilization: "2025-03-10",
            cropHealth: 90,
            predictedHarvest: "2025-09-05",
            sensors: [
                { id: "S1-EF", location: { top: "25%", left: "35%" }, moisture: 32, ph: 7.1, temperature: 21 },
                { id: "S2-EF", location: { top: "55%", left: "50%" }, moisture: 30, ph: 7.2, temperature: 22 },
                { id: "S3-EF", location: { top: "75%", left: "35%" }, moisture: 31, ph: 7.3, temperature: 22 }
            ],
            healthHistory: {
                moisture: [29, 30, 31, 32, 31, 30, 31, 31, 32, 31, 30, 31],
                ph: [7.0, 7.1, 7.2, 7.2, 7.3, 7.2, 7.2, 7.1, 7.2, 7.2, 7.2, 7.2],
                nutrients: [80, 81, 81, 82, 83, 84, 82, 81, 82, 83, 82, 82]
            }
        }
    };
    
    return fieldData[fieldId] || fieldData.field1;
}

function getFieldDisplayName(fieldId) {
    const fieldData = {
        field1: "North Field (Wheat)",
        field2: "South Field (Rice)",
        field3: "East Field (Corn)"
    };
    
    return fieldData[fieldId] || "Unknown Field";
}

// Advanced status indicators with trend detection
function updateStatusIndicators(fieldData) {
    // Update moisture status with trend detection
    const moistureValue = parseInt(fieldData.moisture);
    const moistureCard = document.getElementById('moisture-value').closest('.dashboard-card');
    const moistureStatus = moistureCard.querySelector('.card-status');
    
    // Calculate moisture trend
    const moistureTrend = calculateTrend(fieldData.moistureHistory);
    
    if (moistureValue < 25) {
        moistureStatus.textContent = `Low ${getTrendIcon(moistureTrend)}`;
        moistureStatus.className = 'card-status low';
        if (moistureTrend < 0) {
            // Critical condition - decreasing from already low value
            moistureStatus.classList.add('critical');
            createActionRecommendation('moisture-critical', 'Urgent irrigation needed! Soil moisture critically low and decreasing.');
        } else if (moistureTrend > 0) {
            // Improving condition
            moistureStatus.classList.add('improving');
        }
    } else if (moistureValue > 45) {
        moistureStatus.textContent = `High ${getTrendIcon(moistureTrend)}`;
        moistureStatus.className = 'card-status high';
        if (moistureTrend > 0) {
            // Critical condition - increasing from already high value
            moistureStatus.classList.add('critical');
            createActionRecommendation('moisture-high', 'Warning: Excessive soil moisture may lead to root diseases. Consider improving drainage.');
        } else if (moistureTrend < 0) {
            // Improving condition
            moistureStatus.classList.add('improving');
        }
    } else {
        moistureStatus.textContent = `Optimal ${getTrendIcon(moistureTrend)}`;
        moistureStatus.className = 'card-status optimal';
    }
    
    // Add trend tooltip
    moistureStatus.setAttribute('title', `Trend: ${getTrendDescription(moistureTrend)}`);
    
    // Update pH status with detailed analysis
    const phValue = parseFloat(fieldData.ph);
    const phCard = document.getElementById('ph-value').closest('.dashboard-card');
    const phStatus = phCard.querySelector('.card-status');
    
    // Calculate pH trend
    const phTrend = calculateTrend(fieldData.phHistory);
    
    if (phValue < 5.5) {
        phStatus.textContent = `Too Acidic ${getTrendIcon(phTrend)}`;
        phStatus.className = 'card-status low';
        if (phTrend < 0) {
            // Critical condition - becoming more acidic
            phStatus.classList.add('critical');
            createActionRecommendation('ph-acidic', 'Consider applying lime to increase soil pH. Current acidity may impact nutrient availability.');
        } else if (phTrend > 0) {
            // Improving condition
            phStatus.classList.add('improving');
        }
    } else if (phValue > 7.5) {
        phStatus.textContent = `Too Alkaline ${getTrendIcon(phTrend)}`;
        phStatus.className = 'card-status high';
        if (phTrend > 0) {
            // Critical condition - becoming more alkaline
            phStatus.classList.add('critical');
            createActionRecommendation('ph-alkaline', 'Soil becoming too alkaline. Consider applying soil amendments like sulfur or gypsum.');
        } else if (phTrend < 0) {
            // Improving condition
            phStatus.classList.add('improving');
        }
    } else {
        phStatus.textContent = `Optimal ${getTrendIcon(phTrend)}`;
        phStatus.className = 'card-status optimal';
    }
    
    // Add trend tooltip
    phStatus.setAttribute('title', `Trend: ${getTrendDescription(phTrend)}`);
    
    // Update temperature status based on crop-specific optimal ranges
    const tempValue = parseInt(fieldData.temperature);
    const tempCard = document.getElementById('temperature-value').closest('.dashboard-card');
    const tempStatus = tempCard.querySelector('.card-status');
    
    // Get crop type from field name
    const cropType = fieldData.displayName ? fieldData.displayName.match(/\((.*?)\)/)[1].toLowerCase() : 'wheat';
    
    // Define optimal temperature ranges for different crops
    const optimalRanges = {
        wheat: { min: 18, max: 24 },
        rice: { min: 22, max: 28 },
        corn: { min: 20, max: 30 }
    };
    
    const optimalRange = optimalRanges[cropType] || optimalRanges.wheat;
    
    // Calculate temperature trend
    const tempTrend = calculateTrend(fieldData.temperatureHistory);
    
    if (tempValue < optimalRange.min) {
        tempStatus.textContent = `Too Cold ${getTrendIcon(tempTrend)}`;
        tempStatus.className = 'card-status low';
        if (tempTrend < 0) {
            // Critical condition - getting colder
            tempStatus.classList.add('critical');
            createActionRecommendation('temp-low', `Soil temperature below optimal range for ${cropType}. Consider applying mulch or covering crops.`);
        } else if (tempTrend > 0) {
            // Improving condition
            tempStatus.classList.add('improving');
        }
    } else if (tempValue > optimalRange.max) {
        tempStatus.textContent = `Too Hot ${getTrendIcon(tempTrend)}`;
        tempStatus.className = 'card-status high';
        if (tempTrend > 0) {
            // Critical condition - getting hotter
            tempStatus.classList.add('critical');
            createActionRecommendation('temp-high', `Soil temperature above optimal range for ${cropType}. Consider additional irrigation to cool soil.`);
        } else if (tempTrend < 0) {
            // Improving condition
            tempStatus.classList.add('improving');
        }
    } else {
        tempStatus.textContent = `Optimal ${getTrendIcon(tempTrend)}`;
        tempStatus.className = 'card-status optimal';
    }
    
    // Add tooltip with optimal range information
    tempStatus.setAttribute('title', `Optimal range for ${cropType}: ${optimalRange.min}°C - ${optimalRange.max}°C | Trend: ${getTrendDescription(tempTrend)}`);
    
    // Update nutrient index with detailed breakdown
    const nutrientValue = parseInt(fieldData.nutrientIndex);
    const nutrientCard = document.getElementById('nutrient-value').closest('.dashboard-card');
    const nutrientStatus = nutrientCard.querySelector('.card-status');
    
    // Update nutrient meters with animation and detailed analysis
    updateNutrientMeters(fieldData.nutrients);
    
    if (nutrientValue < 60) {
        nutrientStatus.textContent = 'Poor';
        nutrientStatus.className = 'card-status low';
        createActionRecommendation('nutrient-low', 'Overall nutrient levels are low. Consider a comprehensive fertilization plan.');
    } else if (nutrientValue < 75) {
        nutrientStatus.textContent = 'Good';
        nutrientStatus.className = 'card-status good';
    } else if (nutrientValue < 90) {
        nutrientStatus.textContent = 'Excellent';
        nutrientStatus.className = 'card-status optimal';
    } else {
        nutrientStatus.textContent = 'Outstanding';
        nutrientStatus.className = 'card-status outstanding';
    }
    
    // Check nutrient balance
    checkNutrientBalance(fieldData.nutrients);
}

// Calculate trend from historical data
function calculateTrend(historyData) {
    if (!historyData || historyData.length < 2) return 0;
    
    // Use last 3 days to determine trend
    const recentValues = historyData.slice(-3);
    
    // Simple linear regression to determine slope
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < recentValues.length; i++) {
        sumX += i;
        sumY += recentValues[i];
        sumXY += i * recentValues[i];
        sumXX += i * i;
    }
    
    const n = recentValues.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Normalize the trend between -1 and 1
    const lastValue = recentValues[recentValues.length - 1];
    const normalizedSlope = slope / lastValue * 10;
    
    // Return normalized trend with cutoffs
    if (normalizedSlope > 0.05) return 1;  // Increasing
    if (normalizedSlope < -0.05) return -1; // Decreasing
    return 0; // Stable
}

// Get trend icon for visual indication
function getTrendIcon(trend) {
    if (trend > 0) return '<i class="fas fa-arrow-up" style="font-size: 0.8em;"></i>';
    if (trend < 0) return '<i class="fas fa-arrow-down" style="font-size: 0.8em;"></i>';
    return '<i class="fas fa-equals" style="font-size: 0.8em;"></i>';
}

// Get text description of trend
function getTrendDescription(trend) {
    if (trend > 0) return 'Increasing';
    if (trend < 0) return 'Decreasing';
    return 'Stable';
}

// Create actionable recommendations based on soil conditions
function createActionRecommendation(id, message) {
    // Check if recommendation container exists
    let recommendationsContainer = document.querySelector('.action-recommendations');
    
    // Create container if it doesn't exist
    if (!recommendationsContainer) {
        recommendationsContainer = document.createElement('div');
        recommendationsContainer.className = 'action-recommendations';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Recommended Actions';
        recommendationsContainer.appendChild(heading);
        
        // Insert after dashboard-overview
        const dashboardOverview = document.querySelector('.dashboard-overview');
        dashboardOverview.parentNode.insertBefore(recommendationsContainer, dashboardOverview.nextSibling);
    }
    
    // Check if this recommendation already exists
    const existingRecommendation = document.getElementById(`recommendation-${id}`);
    if (existingRecommendation) {
        // Update existing recommendation
        existingRecommendation.querySelector('p').textContent = message;
        
        // Flash to highlight update
        existingRecommendation.classList.add('flash');
        setTimeout(() => {
            existingRecommendation.classList.remove('flash');
        }, 1000);
        
        return;
    }
    
    // Create new recommendation
    const recommendation = document.createElement('div');
    recommendation.className = 'recommendation';
    recommendation.id = `recommendation-${id}`;
    
    recommendation.innerHTML = `
        <div class="recommendation-icon">
            <i class="fas fa-lightbulb"></i>
        </div>
        <div class="recommendation-content">
            <p>${message}</p>
        </div>
        <button class="recommendation-dismiss" title="Dismiss">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add dismiss functionality
    recommendation.querySelector('.recommendation-dismiss').addEventListener('click', function() {
        recommendation.classList.add('dismissed');
        setTimeout(() => {
            recommendation.remove();
            
            // Remove container if no recommendations left
            if (document.querySelectorAll('.recommendation').length === 0) {
                recommendationsContainer.remove();
            }
        }, 300);
    });
    
    // Add to container with animation
    recommendation.style.opacity = '0';
    recommendation.style.transform = 'translateY(20px)';
    recommendationsContainer.appendChild(recommendation);
    
    // Trigger animation
    setTimeout(() => {
        recommendation.style.opacity = '1';
        recommendation.style.transform = 'translateY(0)';
    }, 10);
}

// Check for nutrient imbalances
function checkNutrientBalance(nutrients) {
    // Check N:P:K ratio
    const n = nutrients.nitrogen;
    const p = nutrients.phosphorus;
    const k = nutrients.potassium;
    
    // Calculate imbalances
    if (p < n * 0.35) {
        createActionRecommendation('phosphorus-low', 'Phosphorus levels too low relative to nitrogen. Consider adding phosphate fertilizers.');
    }
    
    if (k < n * 0.5) {
        createActionRecommendation('potassium-low', 'Potassium levels too low for optimal growth. Consider potassium-rich fertilizers.');
    }
    
    // Check individual nutrient levels
    if (nutrients.phosphorus < 35) {
        createActionRecommendation('phosphorus-critical', 'Phosphorus critically low. Immediate application recommended for root development.');
    }
}

// Advanced nutrient meter updates with animation and analysis
function updateNutrientMeters(nutrients) {
    // Create animations for nutrient meters
    animateNutrientMeter('.nutrient-card:nth-child(1) .meter-fill', nutrients.nitrogen);
    animateNutrientMeter('.nutrient-card:nth-child(2) .meter-fill', nutrients.phosphorus);
    animateNutrientMeter('.nutrient-card:nth-child(3) .meter-fill', nutrients.potassium);
    animateNutrientMeter('.nutrient-card:nth-child(4) .meter-fill', nutrients.calcium);
    
    // Update value displays
    document.querySelector('.nutrient-card:nth-child(1) .nutrient-value span').textContent = nutrients.nitrogen;
    document.querySelector('.nutrient-card:nth-child(2) .nutrient-value span').textContent = nutrients.phosphorus;
    document.querySelector('.nutrient-card:nth-child(3) .nutrient-value span').textContent = nutrients.potassium;
    document.querySelector('.nutrient-card:nth-child(4) .nutrient-value span').textContent = nutrients.calcium;
    
    // Update status labels based on optimal ranges
    updateNutrientStatus('.nutrient-card:nth-child(1) .nutrient-status', nutrients.nitrogen, 40, 80);
    updateNutrientStatus('.nutrient-card:nth-child(2) .nutrient-status', nutrients.phosphorus, 30, 60);
    updateNutrientStatus('.nutrient-card:nth-child(3) .nutrient-status', nutrients.potassium, 40, 80);
    updateNutrientStatus('.nutrient-card:nth-child(4) .nutrient-status', nutrients.calcium, 50, 85);
}

// Animate nutrient meter updates
function animateNutrientMeter(selector, value) {
    const meterFill = document.querySelector(selector);
    if (!meterFill) return;
    
    // Get current width
    const currentWidth = parseInt(meterFill.style.width) || 0;
    
    // Animate width change
    const duration = 800; // ms
    const steps = 20;
    const increment = (value - currentWidth) / steps;
    let step = 0;
    
    const animation = setInterval(() => {
        step++;
        const newWidth = currentWidth + (increment * step);
        meterFill.style.width = `${newWidth}%`;
        
        // Update color dynamically
        updateMeterColor(meterFill, newWidth);
        
        if (step >= steps) {
            clearInterval(animation);
            meterFill.style.width = `${value}%`;
            updateMeterColor(meterFill, value);
        }
    }, duration / steps);
}

// Update meter fill color based on value
function updateMeterColor(meterElement, value) {
    if (value < 35) {
        meterElement.style.backgroundColor = '#e74c3c'; // Red for low
    } else if (value < 60) {
        meterElement.style.backgroundColor = '#f39c12'; // Orange for medium
    } else if (value < 80) {
        meterElement.style.backgroundColor = '#2ecc71'; // Green for good
    } else {
        meterElement.style.backgroundColor = '#3498db'; // Blue for high
    }
}

// Update nutrient status based on value ranges
function updateNutrientStatus(selector, value, lowThreshold, highThreshold) {
    const statusElement = document.querySelector(selector);
    if (!statusElement) return;
    
    if (value < lowThreshold) {
        statusElement.textContent = 'Low';
        statusElement.className = 'nutrient-status low';
    } else if (value > highThreshold) {
        statusElement.textContent = 'High';
        statusElement.className = 'nutrient-status high';
    } else {
        statusElement.textContent = 'Optimal';
        statusElement.className = 'nutrient-status optimal';
    }
}

// Update sensor map with real-time data
function updateSensorMap(fieldData) {
    // Clear existing sensor points
    const existingSensors = document.querySelectorAll('.sensor-point');
    existingSensors.forEach(sensor => sensor.remove());
    
    // Get the field map container
    const fieldMap = document.querySelector('.field-map');
    if (!fieldMap) return;
    
    // Add new sensor points based on field data
    fieldData.sensors.forEach(sensor => {
        const sensorPoint = document.createElement('div');
        sensorPoint.className = 'sensor-point';
        sensorPoint.style.top = sensor.location.top;
        sensorPoint.style.left = sensor.location.left;
        
        // Create tooltip with sensor data
        const tooltip = document.createElement('div');
        tooltip.className = 'sensor-tooltip';
        tooltip.innerHTML = `
            <h4>Sensor ${sensor.id}</h4>
            <p>Moisture: ${sensor.moisture}%</p>
            <p>pH: ${sensor.ph}</p>
            <p>Temperature: ${sensor.temperature}°C</p>
        `;
        
        sensorPoint.appendChild(tooltip);
        fieldMap.appendChild(sensorPoint);
        
        // Add visual indicator based on sensor health
        if (sensor.moisture < 25 || sensor.moisture > 45) {
            sensorPoint.classList.add('warning');
        }
    });
    
    // Setup sensor interaction
    setupSensorHovers();
}

// Calculate soil health trends over time
function calculateSoilHealthTrends(fieldData) {
    // Only proceed if we have historical data
    if (!fieldData.healthHistory) return;
    
    // Compare current values with historical averages
    const moistureHistory = fieldData.healthHistory.moisture;
    const phHistory = fieldData.healthHistory.ph;
    const nutrientHistory = fieldData.healthHistory.nutrients;
    
    // Calculate 30-day trends
    const moistureTrend = calculateExtendedTrend(moistureHistory);
    const phTrend = calculateExtendedTrend(phHistory);
    const nutrientTrend = calculateExtendedTrend(nutrientHistory);
    
    // Store trends globally
    soilHealthTrends = {
        moisture: moistureTrend,
        ph: phTrend,
        nutrients: nutrientTrend
    };
    
    // Create or update trends section
    let trendsSection = document.querySelector('.soil-health-trends');
    
    if (!trendsSection) {
        trendsSection = document.createElement('div');
        trendsSection.className = 'soil-health-trends';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Soil Health Trends (30-Day)';
        trendsSection.appendChild(heading);
        
        // Create trend container
        const trendContainer = document.createElement('div');
        trendContainer.className = 'trends-container';
        trendsSection.appendChild(trendContainer);
        
        // Add to page
        const soilDetails = document.querySelector('.soil-details');
        soilDetails.appendChild(trendsSection);
    }
    
    // Update trend displays
    const trendContainer = trendsSection.querySelector('.trends-container');
    trendContainer.innerHTML = '';
    
    // Add trend indicators
    addTrendIndicator(trendContainer, 'Moisture', moistureTrend, '%');
    addTrendIndicator(trendContainer, 'pH Level', phTrend);
    addTrendIndicator(trendContainer, 'Nutrient Index', nutrientTrend, ' points');
}

// Calculate trend over longer period
function calculateExtendedTrend(historyData) {
    if (!historyData || historyData.length < 3) return { value: 0, percentage: 0 };
    
    // Calculate average of first third vs last third
    const segmentSize = Math.floor(historyData.length / 3);
    const firstSegment = historyData.slice(0, segmentSize);
    const lastSegment = historyData.slice(-segmentSize);
    
    const firstAvg = firstSegment.reduce((sum, val) => sum + val, 0) / firstSegment.length;
    const lastAvg = lastSegment.reduce((sum, val) => sum + val, 0) / lastSegment.length;
    
    const change = lastAvg - firstAvg;
    const percentChange = (change / firstAvg) * 100;
    
    return {
        value: change.toFixed(2),
        percentage: percentChange.toFixed(1)
    };
}

// Add visual trend indicator
function addTrendIndicator(container, name, trend, unit = '') {
    const trendElement = document.createElement('div');
    trendElement.className = 'trend-indicator';
    
    // Determine trend direction
    let trendClass = 'neutral';
    let trendIcon = 'fa-equals';
    
    if (parseFloat(trend.percentage) > 2) {
        trendClass = 'positive';
        trendIcon = 'fa-arrow-up';
    } else if (parseFloat(trend.percentage) < -2) {
        trendClass = 'negative';
        trendIcon = 'fa-arrow-down';
    }
    
    trendElement.innerHTML = `
        <div class="trend-name">${name}</div>
        <div class="trend-value ${trendClass}">
            <i class="fas ${trendIcon}"></i>
            ${trend.value}${unit} (${trend.percentage > 0 ? '+' : ''}${trend.percentage}%)
        </div>
    `;
    
    container.appendChild(trendElement);
}

// Advanced chart initialization with more interactive features
function initMoisturePhChart() {
    const ctx = document.getElementById('moisturePhChart').getContext('2d');
    moisturePhChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Soil Moisture (%)',
                    data: [34, 35, 38, 37, 36, 37, 37],
                    borderColor: '#4FACFE',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4FACFE'
                },
                {
                    label: 'Soil pH',
                    data: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5],
                    borderColor: '#FDA085',
                    backgroundColor: 'rgba(253, 160, 133, 0.1)',
                    tension: 0.3,
                    fill: true,
                    hidden: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#FDA085'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts with animations and advanced configuration
    initMoisturePhChart();
    initTemperatureChart();
    
    // Setup event listeners for all dashboard controls
    setupFieldSelector();
    setupTimeRangeSelector();
    setupChartToggles();
    setupExportButton();
    setupSensorHovers();
    setupAdvancedControls();
    
    // Initialize with default field data
    updateDashboardData('field1');
    
    // Start data monitoring systems
    startDataSimulation();
    initializeAnomalyDetection();
    initializePredictiveAnalytics();
    
    // Check if dashboard data exists in localStorage for user preferences
    restoreUserPreferences();
    
    // Display dashboard initialized notification
    showNotification('Dashboard initialized successfully', 'success');
});

// Advanced Field Selection with historical data tracking
function setupFieldSelector() {
    const fieldSelect = document.getElementById('field-select');
    if (!fieldSelect) return;
    
    fieldSelect.addEventListener('change', function() {
        const selectedField = this.value;
        console.log(`Field changed to: ${selectedField}`);
        
        // Log to history for analytics
        logUserAction('field_selection', selectedField);
        
        // Terminate any existing data simulation for previous field
        if (sensorDataInterval) {
            clearInterval(sensorDataInterval);
        }
        
        // Update dashboard data based on selected field
        updateDashboardData(selectedField);
        
        // Save user preference
        saveUserPreference('selectedField', selectedField);
    });
}

// Enhanced dashboard data update with progressive loading
function updateDashboardData(fieldId) {
    // Show progressive loading state with skeleton UI
    showLoadingState();
    
    // In a real application, this would fetch data from a server with proper error handling
    const dataPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const fieldData = getFieldData(fieldId);
                resolve(fieldData);
            } catch (error) {
                reject(error);
                console.error("Error fetching field data:", error);
                showNotification('Error loading field data', 'error');
            }
        }, 800);
    });
    
    // Use Promise to handle data loading sequence
    dataPromise.then(fieldData => {
        // Store current field data globally
        currentFieldData = fieldData;
        
        // Update card values with animation
        animateValueUpdate('moisture-value', fieldData.moisture);
        animateValueUpdate('ph-value', fieldData.ph);
        animateValueUpdate('temperature-value', fieldData.temperature);
        animateValueUpdate('nutrient-value', fieldData.nutrientIndex);
        
        // Update status indicators with enhanced visualization
        updateStatusIndicators(fieldData);
        
        // Update charts with transition animations
        updateCharts(fieldData);
        
        // Update sensor map locations with new data
        updateSensorMap(fieldData);
        
        // Calculate and display soil health trends
        calculateSoilHealthTrends(fieldData);
        
        // Hide loading state
        hideLoadingState();
        
        // Start new data simulation for this field
        startFieldSpecificDataSimulation(fieldId);
        
        // Show notification
        showNotification(`${getFieldDisplayName(fieldId)} data loaded successfully`, 'success');
    }).catch(error => {
        hideLoadingState();
        console.error("Failed to update dashboard:", error);
        showNotification('Failed to update dashboard data', 'error');
    });
}

// Animation for numeric value updates
function animateValueUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Extract numeric part from the value
    let targetValue = newValue;
    let suffix = '';
    
    if (typeof newValue === 'string') {
        // Extract numeric part and suffix (like % or °C)
        const match = newValue.match(/^(\d+\.?\d*)(.*)$/);
        if (match) {
            targetValue = parseFloat(match[1]);
            suffix = match[2];
        }
    }
    
    // Get current value
    let currentValue = parseFloat(element.textContent);
    if (isNaN(currentValue)) currentValue = 0;
    
    // Calculate increment for smooth animation
    const difference = targetValue - currentValue;
    const steps = 20;
    const increment = difference / steps;
    
    // Animate the change
    let step = 0;
    const animation = setInterval(() => {
        step++;
        const newVal = currentValue + (increment * step);
        
        // Format according to data type
        if (element.id === 'ph-value') {
            element.textContent = newVal.toFixed(1) + suffix;
        } else if (element.id === 'nutrient-value') {
            element.textContent = Math.round(newVal) + suffix;
        } else {
            element.textContent = Math.round(newVal) + suffix;
        }
        
        if (step >= steps) {
            clearInterval(animation);
            element.textContent = newValue; // Ensure final value is exactly as provided
        }
    }, 20);
    
    // Add visual feedback for the change
    element.classList.add('value-changed');
    setTimeout(() => element.classList.remove('value-changed'), 1000);
}

// Enhanced field data with more metrics and historical patterns
function getFieldData(fieldId) {
    // Expanded mock data structure with more metrics
    const fieldData = {
        field1: {
            displayName: "North Field (Wheat)",
            moisture: '37%',
            ph: '6.5',
            temperature: '23°C',
            nutrientIndex: '78/100',
            moistureHistory: [34, 35, 38, 37, 36, 37, 37],
            phHistory: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5],
            temperatureHistory: [21, 22, 24, 23, 22, 23, 23],
            nutrients: {
                nitrogen: 65,
                phosphorus: 45,
                potassium: 85,
                calcium: 72
            },
            soilType: "Clay loam",
            lastIrrigation: "2025-03-28",
            lastFertilization: "2025-03-15",
            cropHealth: 85,
            predictedHarvest: "2025-07-15",
            sensors: [
                { id: "S1-NF", location: { top: "30%", left: "25%" }, moisture: 38, ph: 6.7, temperature: 22 },
                { id: "S2-NF", location: { top: "45%", left: "60%" }, moisture: 36, ph: 6.4, temperature: 23 },
                { id: "S3-NF", location: { top: "70%", left: "40%" }, moisture: 35, ph: 6.3, temperature: 24 }
            ],
            healthHistory: {
                moisture: [35, 36, 36, 37, 38, 37, 37, 37, 36, 36, 35, 37],
                ph: [6.4, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5, 6.5, 6.4, 6.5, 6.5, 6.5],
                nutrients: [75, 76, 77, 79, 78, 78, 77, 78, 79, 80, 79, 78]
            }
        },
        field2: {
            displayName: "South Field (Rice)",
            moisture: '42%',
            ph: '5.8',
            temperature: '24°C',
            nutrientIndex: '65/100',
            moistureHistory: [39, 40, 41, 43, 42, 42, 42],
            phHistory: [5.6, 5.7, 5.8, 5.9, 5.8, 5.8, 5.8],
            temperatureHistory: [23, 24, 25, 25, 24, 24, 24],
            nutrients: {
                nitrogen: 58,
                phosphorus: 32,
                potassium: 70,
                calcium: 65
            },
            soilType: "Silty clay",
            lastIrrigation: "2025-03-29",
            lastFertilization: "2025-03-20",
            cropHealth: 72,
            predictedHarvest: "2025-08-10",
            sensors: [
                { id: "S1-SF", location: { top: "35%", left: "30%" }, moisture: 43, ph: 5.7, temperature: 24 },
                { id: "S2-SF", location: { top: "50%", left: "55%" }, moisture: 41, ph: 5.8, temperature: 24 },
                { id: "S3-SF", location: { top: "65%", left: "45%" }, moisture: 40, ph: 5.9, temperature: 25 }
            ],
            healthHistory: {
                moisture: [40, 41, 42, 43, 42, 42, 41, 40, 41, 42, 42, 42],
                ph: [5.6, 5.7, 5.7, 5.8, 5.8, 5.9, 5.8, 5.8, 5.7, 5.8, 5.8, 5.8],
                nutrients: [60, 62, 63, 64, 65, 67, 66, 65, 64, 65, 66, 65]
            }
        },
        field3: {
            displayName: "East Field (Corn)",
            moisture: '31%',
            ph: '7.2',
            temperature: '22°C',
            nutrientIndex: '82/100',
            moistureHistory: [28, 29, 30, 32, 31, 31, 31],
            phHistory: [7.0, 7.1, 7.2, 7.3, 7.2, 7.2, 7.2],
            temperatureHistory: [20, 21, 22, 23, 22, 22, 22],
            nutrients: {
                nitrogen: 72,
                phosphorus: 58,
                potassium: 90,
                calcium: 80
            },
            soilType: "Sandy loam",
            lastIrrigation: "2025-03-27",
            lastFertilization: "2025-03-10",
            cropHealth: 90,
            predictedHarvest: "2025-09-05",
            sensors: [
                { id: "S1-EF", location: { top: "25%", left: "35%" }, moisture: 32, ph: 7.1, temperature: 21 },
                { id: "S2-EF", location: { top: "55%", left: "50%" }, moisture: 30, ph: 7.2, temperature: 22 },
                { id: "S3-EF", location: { top: "75%", left: "35%" }, moisture: 31, ph: 7.3, temperature: 22 }
            ],
            healthHistory: {
                moisture: [29, 30, 31, 32, 31, 30, 31, 31, 32, 31, 30, 31],
                ph: [7.0, 7.1, 7.2, 7.2, 7.3, 7.2, 7.2, 7.1, 7.2, 7.2, 7.2, 7.2],
                nutrients: [80, 81, 81, 82, 83, 84, 82, 81, 82, 83, 82, 82]
            }
        }
    };
    
    return fieldData[fieldId] || fieldData.field1;
}

function getFieldDisplayName(fieldId) {
    const fieldData = {
        field1: "North Field (Wheat)",
        field2: "South Field (Rice)",
        field3: "East Field (Corn)"
    };
    
    return fieldData[fieldId] || "Unknown Field";
}

// Advanced status indicators with trend detection
function updateStatusIndicators(fieldData) {
    // Update moisture status with trend detection
    const moistureValue = parseInt(fieldData.moisture);
    const moistureCard = document.getElementById('moisture-value').closest('.dashboard-card');
    const moistureStatus = moistureCard.querySelector('.card-status');
    
    // Calculate moisture trend
    const moistureTrend = calculateTrend(fieldData.moistureHistory);
    
    if (moistureValue < 25) {
        moistureStatus.textContent = `Low ${getTrendIcon(moistureTrend)}`;
        moistureStatus.className = 'card-status low';
        if (moistureTrend < 0) {
            // Critical condition - decreasing from already low value
            moistureStatus.classList.add('critical');
            createActionRecommendation('moisture-critical', 'Urgent irrigation needed! Soil moisture critically low and decreasing.');
        } else if (moistureTrend > 0) {
            // Improving condition
            moistureStatus.classList.add('improving');
        }
    } else if (moistureValue > 45) {
        moistureStatus.textContent = `High ${getTrendIcon(moistureTrend)}`;
        moistureStatus.className = 'card-status high';
        if (moistureTrend > 0) {
            // Critical condition - increasing from already high value
            moistureStatus.classList.add('critical');
            createActionRecommendation('moisture-high', 'Warning: Excessive soil moisture may lead to root diseases. Consider improving drainage.');
        } else if (moistureTrend < 0) {
            // Improving condition
            moistureStatus.classList.add('improving');
        }
    } else {
        moistureStatus.textContent = `Optimal ${getTrendIcon(moistureTrend)}`;
        moistureStatus.className = 'card-status optimal';
    }
    
    // Add trend tooltip
    moistureStatus.setAttribute('title', `Trend: ${getTrendDescription(moistureTrend)}`);
    
    // Update pH status with detailed analysis
    const phValue = parseFloat(fieldData.ph);
    const phCard = document.getElementById('ph-value').closest('.dashboard-card');
    const phStatus = phCard.querySelector('.card-status');
    
    // Calculate pH trend
    const phTrend = calculateTrend(fieldData.phHistory);
    
    if (phValue < 5.5) {
        phStatus.textContent = `Too Acidic ${getTrendIcon(phTrend)}`;
        phStatus.className = 'card-status low';
        if (phTrend < 0) {
            // Critical condition - becoming more acidic
            phStatus.classList.add('critical');
            createActionRecommendation('ph-acidic', 'Consider applying lime to increase soil pH. Current acidity may impact nutrient availability.');
        } else if (phTrend > 0) {
            // Improving condition
            phStatus.classList.add('improving');
        }
    } else if (phValue > 7.5) {
        phStatus.textContent = `Too Alkaline ${getTrendIcon(phTrend)}`;
        phStatus.className = 'card-status high';
        if (phTrend > 0) {
            // Critical condition - becoming more alkaline
            phStatus.classList.add('critical');
            createActionRecommendation('ph-alkaline', 'Soil becoming too alkaline. Consider applying soil amendments like sulfur or gypsum.');
        } else if (phTrend < 0) {
            // Improving condition
            phStatus.classList.add('improving');
        }
    } else {
        phStatus.textContent = `Optimal ${getTrendIcon(phTrend)}`;
        phStatus.className = 'card-status optimal';
    }
    
    // Add trend tooltip
    phStatus.setAttribute('title', `Trend: ${getTrendDescription(phTrend)}`);
    
    // Update temperature status based on crop-specific optimal ranges
    const tempValue = parseInt(fieldData.temperature);
    const tempCard = document.getElementById('temperature-value').closest('.dashboard-card');
    const tempStatus = tempCard.querySelector('.card-status');
    
    // Get crop type from field name
    const cropType = fieldData.displayName ? fieldData.displayName.match(/\((.*?)\)/)[1].toLowerCase() : 'wheat';
    
    // Define optimal temperature ranges for different crops
    const optimalRanges = {
        wheat: { min: 18, max: 24 },
        rice: { min: 22, max: 28 },
        corn: { min: 20, max: 30 }
    };
    
    const optimalRange = optimalRanges[cropType] || optimalRanges.wheat;
    
    // Calculate temperature trend
    const tempTrend = calculateTrend(fieldData.temperatureHistory);
    
    if (tempValue < optimalRange.min) {
        tempStatus.textContent = `Too Cold ${getTrendIcon(tempTrend)}`;
        tempStatus.className = 'card-status low';
        if (tempTrend < 0) {
            // Critical condition - getting colder
            tempStatus.classList.add('critical');
            createActionRecommendation('temp-low', `Soil temperature below optimal range for ${cropType}. Consider applying mulch or covering crops.`);
        } else if (tempTrend > 0) {
            // Improving condition
            tempStatus.classList.add('improving');
        }
    } else if (tempValue > optimalRange.max) {
        tempStatus.textContent = `Too Hot ${getTrendIcon(tempTrend)}`;
        tempStatus.className = 'card-status high';
        if (tempTrend > 0) {
            // Critical condition - getting hotter
            tempStatus.classList.add('critical');
            createActionRecommendation('temp-high', `Soil temperature above optimal range for ${cropType}. Consider additional irrigation to cool soil.`);
        } else if (tempTrend < 0) {
            // Improving condition
            tempStatus.classList.add('improving');
        }
    } else {
        tempStatus.textContent = `Optimal ${getTrendIcon(tempTrend)}`;
        tempStatus.className = 'card-status optimal';
    }
    
    // Add tooltip with optimal range information
    tempStatus.setAttribute('title', `Optimal range for ${cropType}: ${optimalRange.min}°C - ${optimalRange.max}°C | Trend: ${getTrendDescription(tempTrend)}`);
    
    // Update nutrient index with detailed breakdown
    const nutrientValue = parseInt(fieldData.nutrientIndex);
    const nutrientCard = document.getElementById('nutrient-value').closest('.dashboard-card');
    const nutrientStatus = nutrientCard.querySelector('.card-status');
    
    // Update nutrient meters with animation and detailed analysis
    updateNutrientMeters(fieldData.nutrients);
    
    if (nutrientValue < 60) {
        nutrientStatus.textContent = 'Poor';
        nutrientStatus.className = 'card-status low';
        createActionRecommendation('nutrient-low', 'Overall nutrient levels are low. Consider a comprehensive fertilization plan.');
    } else if (nutrientValue < 75) {
        nutrientStatus.textContent = 'Good';
        nutrientStatus.className = 'card-status good';
    } else if (nutrientValue < 90) {
        nutrientStatus.textContent = 'Excellent';
        nutrientStatus.className = 'card-status optimal';
    } else {
        nutrientStatus.textContent = 'Outstanding';
        nutrientStatus.className = 'card-status outstanding';
    }
    
    // Check nutrient balance
    checkNutrientBalance(fieldData.nutrients);
}

// Calculate trend from historical data
function calculateTrend(historyData) {
    if (!historyData || historyData.length < 2) return 0;
    
    // Use last 3 days to determine trend
    const recentValues = historyData.slice(-3);
    
    // Simple linear regression to determine slope
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < recentValues.length; i++) {
        sumX += i;
        sumY += recentValues[i];
        sumXY += i * recentValues[i];
        sumXX += i * i;
    }
    
    const n = recentValues.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Normalize the trend between -1 and 1
    const lastValue = recentValues[recentValues.length - 1];
    const normalizedSlope = slope / lastValue * 10;
    
    // Return normalized trend with cutoffs
    if (normalizedSlope > 0.05) return 1;  // Increasing
    if (normalizedSlope < -0.05) return -1; // Decreasing
    return 0; // Stable
}

// Get trend icon for visual indication
function getTrendIcon(trend) {
    if (trend > 0) return '<i class="fas fa-arrow-up" style="font-size: 0.8em;"></i>';
    if (trend < 0) return '<i class="fas fa-arrow-down" style="font-size: 0.8em;"></i>';
    return '<i class="fas fa-equals" style="font-size: 0.8em;"></i>';
}

// Get text description of trend
function getTrendDescription(trend) {
    if (trend > 0) return 'Increasing';
    if (trend < 0) return 'Decreasing';
    return 'Stable';
}

// Create actionable recommendations based on soil conditions
function createActionRecommendation(id, message) {
    // Check if recommendation container exists
    let recommendationsContainer = document.querySelector('.action-recommendations');
    
    // Create container if it doesn't exist
    if (!recommendationsContainer) {
        recommendationsContainer = document.createElement('div');
        recommendationsContainer.className = 'action-recommendations';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Recommended Actions';
        recommendationsContainer.appendChild(heading);
        
        // Insert after dashboard-overview
        const dashboardOverview = document.querySelector('.dashboard-overview');
        dashboardOverview.parentNode.insertBefore(recommendationsContainer, dashboardOverview.nextSibling);
    }
    
    // Check if this recommendation already exists
    const existingRecommendation = document.getElementById(`recommendation-${id}`);
    if (existingRecommendation) {
        // Update existing recommendation
        existingRecommendation.querySelector('p').textContent = message;
        
        // Flash to highlight update
        existingRecommendation.classList.add('flash');
        setTimeout(() => {
            existingRecommendation.classList.remove('flash');
        }, 1000);
        
        return;
    }
    
    // Create new recommendation
    const recommendation = document.createElement('div');
    recommendation.className = 'recommendation';
    recommendation.id = `recommendation-${id}`;
    
    recommendation.innerHTML = `
        <div class="recommendation-icon">
            <i class="fas fa-lightbulb"></i>
        </div>
        <div class="recommendation-content">
            <p>${message}</p>
        </div>
        <button class="recommendation-dismiss" title="Dismiss">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add dismiss functionality
    recommendation.querySelector('.recommendation-dismiss').addEventListener('click', function() {
        recommendation.classList.add('dismissed');
        setTimeout(() => {
            recommendation.remove();
            
            // Remove container if no recommendations left
            if (document.querySelectorAll('.recommendation').length === 0) {
                recommendationsContainer.remove();
            }
        }, 300);
    });
    
    // Add to container with animation
    recommendation.style.opacity = '0';
    recommendation.style.transform = 'translateY(20px)';
    recommendationsContainer.appendChild(recommendation);
    
    // Trigger animation
    setTimeout(() => {
        recommendation.style.opacity = '1';
        recommendation.style.transform = 'translateY(0)';
    }, 10);
}

// Check for nutrient imbalances
function checkNutrientBalance(nutrients) {
    // Check N:P:K ratio
    const n = nutrients.nitrogen;
    const p = nutrients.phosphorus;
    const k = nutrients.potassium;
    
    // Calculate imbalances
    if (p < n * 0.35) {
        createActionRecommendation('phosphorus-low', 'Phosphorus levels too low relative to nitrogen. Consider adding phosphate fertilizers.');
    }
    
    if (k < n * 0.5) {
        createActionRecommendation('potassium-low', 'Potassium levels too low for optimal growth. Consider potassium-rich fertilizers.');
    }
    
    // Check individual nutrient levels
    if (nutrients.phosphorus < 35) {
        createActionRecommendation('phosphorus-critical', 'Phosphorus critically low. Immediate application recommended for root development.');
    }
}

// Advanced nutrient meter updates with animation and analysis
function updateNutrientMeters(nutrients) {
    // Create animations for nutrient meters
    animateNutrientMeter('.nutrient-card:nth-child(1) .meter-fill', nutrients.nitrogen);
    animateNutrientMeter('.nutrient-card:nth-child(2) .meter-fill', nutrients.phosphorus);
    animateNutrientMeter('.nutrient-card:nth-child(3) .meter-fill', nutrients.potassium);
    animateNutrientMeter('.nutrient-card:nth-child(4) .meter-fill', nutrients.calcium);
    
    // Update value displays
    document.querySelector('.nutrient-card:nth-child(1) .nutrient-value span').textContent = nutrients.nitrogen;
    document.querySelector('.nutrient-card:nth-child(2) .nutrient-value span').textContent = nutrients.phosphorus;
    document.querySelector('.nutrient-card:nth-child(3) .nutrient-value span').textContent = nutrients.potassium;
    document.querySelector('.nutrient-card:nth-child(4) .nutrient-value span').textContent = nutrients.calcium;
    
    // Update status labels based on optimal ranges
    updateNutrientStatus('.nutrient-card:nth-child(1) .nutrient-status', nutrients.nitrogen, 40, 80);
    updateNutrientStatus('.nutrient-card:nth-child(2) .nutrient-status', nutrients.phosphorus, 30, 60);
    updateNutrientStatus('.nutrient-card:nth-child(3) .nutrient-status', nutrients.potassium, 40, 80);
    updateNutrientStatus('.nutrient-card:nth-child(4) .nutrient-status', nutrients.calcium, 50, 85);
}

// Animate nutrient meter updates
function animateNutrientMeter(selector, value) {
    const meterFill = document.querySelector(selector);
    if (!meterFill) return;
    
    // Get current width
    const currentWidth = parseInt(meterFill.style.width) || 0;
    
    // Animate width change
    const duration = 800; // ms
    const steps = 20;
    const increment = (value - currentWidth) / steps;
    let step = 0;
    
    const animation = setInterval(() => {
        step++;
        const newWidth = currentWidth + (increment * step);
        meterFill.style.width = `${newWidth}%`;
        
        // Update color dynamically
        updateMeterColor(meterFill, newWidth);
        
        if (step >= steps) {
            clearInterval(animation);
            meterFill.style.width = `${value}%`;
            updateMeterColor(meterFill, value);
        }
    }, duration / steps);
}

// Update meter fill color based on value
function updateMeterColor(meterElement, value) {
    if (value < 35) {
        meterElement.style.backgroundColor = '#e74c3c'; // Red for low
    } else if (value < 60) {
        meterElement.style.backgroundColor = '#f39c12'; // Orange for medium
    } else if (value < 80) {
        meterElement.style.backgroundColor = '#2ecc71'; // Green for good
    } else {
        meterElement.style.backgroundColor = '#3498db'; // Blue for high
    }
}

// Update nutrient status based on value ranges
function updateNutrientStatus(selector, value, lowThreshold, highThreshold) {
    const statusElement = document.querySelector(selector);
    if (!statusElement) return;
    
    if (value < lowThreshold) {
        statusElement.textContent = 'Low';
        statusElement.className = 'nutrient-status low';
    } else if (value > highThreshold) {
        statusElement.textContent = 'High';
        statusElement.className = 'nutrient-status high';
    } else {
        statusElement.textContent = 'Optimal';
        statusElement.className = 'nutrient-status optimal';
    }
}

// Update sensor map with real-time data
function updateSensorMap(fieldData) {
    // Clear existing sensor points
    const existingSensors = document.querySelectorAll('.sensor-point');
    existingSensors.forEach(sensor => sensor.remove());
    
    // Get the field map container
    const fieldMap = document.querySelector('.field-map');
    if (!fieldMap) return;
    
    // Add new sensor points based on field data
    fieldData.sensors.forEach(sensor => {
        const sensorPoint = document.createElement('div');
        sensorPoint.className = 'sensor-point';
        sensorPoint.style.top = sensor.location.top;
        sensorPoint.style.left = sensor.location.left;
        
        // Create tooltip with sensor data
        const tooltip = document.createElement('div');
        tooltip.className = 'sensor-tooltip';
        tooltip.innerHTML = `
            <h4>Sensor ${sensor.id}</h4>
            <p>Moisture: ${sensor.moisture}%</p>
            <p>pH: ${sensor.ph}</p>
            <p>Temperature: ${sensor.temperature}°C</p>
        `;
        
        sensorPoint.appendChild(tooltip);
        fieldMap.appendChild(sensorPoint);
        
        // Add visual indicator based on sensor health
        if (sensor.moisture < 25 || sensor.moisture > 45) {
            sensorPoint.classList.add('warning');
        }
    });
    
    // Setup sensor interaction
    setupSensorHovers();
}

// Calculate soil health trends over time
function calculateSoilHealthTrends(fieldData) {
    // Only proceed if we have historical data
    if (!fieldData.healthHistory) return;
    
    // Compare current values with historical averages
    const moistureHistory = fieldData.healthHistory.moisture;
    const phHistory = fieldData.healthHistory.ph;
    const nutrientHistory = fieldData.healthHistory.nutrients;
    
    // Calculate 30-day trends
    const moistureTrend = calculateExtendedTrend(moistureHistory);
    const phTrend = calculateExtendedTrend(phHistory);
    const nutrientTrend = calculateExtendedTrend(nutrientHistory);
    
    // Store trends globally
    soilHealthTrends = {
        moisture: moistureTrend,
        ph: phTrend,
        nutrients: nutrientTrend
    };
    
    // Create or update trends section
    let trendsSection = document.querySelector('.soil-health-trends');
    
    if (!trendsSection) {
        trendsSection = document.createElement('div');
        trendsSection.className = 'soil-health-trends';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Soil Health Trends (30-Day)';
        trendsSection.appendChild(heading);
        
        // Create trend container
        const trendContainer = document.createElement('div');
        trendContainer.className = 'trends-container';
        trendsSection.appendChild(trendContainer);
        
        // Add to page
        const soilDetails = document.querySelector('.soil-details');
        soilDetails.appendChild(trendsSection);
    }
    
    // Update trend displays
    const trendContainer = trendsSection.querySelector('.trends-container');
    trendContainer.innerHTML = '';
    
    // Add trend indicators
    addTrendIndicator(trendContainer, 'Moisture', moistureTrend, '%');
    addTrendIndicator(trendContainer, 'pH Level', phTrend);
    addTrendIndicator(trendContainer, 'Nutrient Index', nutrientTrend, ' points');
}

// Calculate trend over longer period
function calculateExtendedTrend(historyData) {
    if (!historyData || historyData.length < 3) return { value: 0, percentage: 0 };
    
    // Calculate average of first third vs last third
    const segmentSize = Math.floor(historyData.length / 3);
    const firstSegment = historyData.slice(0, segmentSize);
    const lastSegment = historyData.slice(-segmentSize);
    
    const firstAvg = firstSegment.reduce((sum, val) => sum + val, 0) / firstSegment.length;
    const lastAvg = lastSegment.reduce((sum, val) => sum + val, 0) / lastSegment.length;
    
    const change = lastAvg - firstAvg;
    const percentChange = (change / firstAvg) * 100;
    
    return {
        value: change.toFixed(2),
        percentage: percentChange.toFixed(1)
    };
}

// Add visual trend indicator
function addTrendIndicator(container, name, trend, unit = '') {
    const trendElement = document.createElement('div');
    trendElement.className = 'trend-indicator';
    
    // Determine trend direction
    let trendClass = 'neutral';
    let trendIcon = 'fa-equals';
    
    if (parseFloat(trend.percentage) > 2) {
        trendClass = 'positive';
        trendIcon = 'fa-arrow-up';
    } else if (parseFloat(trend.percentage) < -2) {
        trendClass = 'negative';
        trendIcon = 'fa-arrow-down';
    }
    
    trendElement.innerHTML = `
        <div class="trend-name">${name}</div>
        <div class="trend-value ${trendClass}">
            <i class="fas ${trendIcon}"></i>
            ${trend.value}${unit} (${trend.percentage > 0 ? '+' : ''}${trend.percentage}%)
        </div>
    `;
    
    container.appendChild(trendElement);
}

function initMoisturePhChart() {
    const ctx = document.getElementById('moisturePhChart').getContext('2d');
    
    // Create gradient for better visualization
    const moistureGradient = ctx.createLinearGradient(0, 0, 0, 300);
    moistureGradient.addColorStop(0, 'rgba(79, 172, 254, 0.3)');
    moistureGradient.addColorStop(1, 'rgba(79, 172, 254, 0.05)');
    
    const phGradient = ctx.createLinearGradient(0, 0, 0, 300);
    phGradient.addColorStop(0, 'rgba(253, 160, 133, 0.3)');
    phGradient.addColorStop(1, 'rgba(253, 160, 133, 0.05)');
    
    moisturePhChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Soil Moisture (%)',
                    data: [34, 35, 38, 37, 36, 37, 37],
                    borderColor: '#4FACFE',
                    backgroundColor: moistureGradient,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4FACFE'
                },
                {
                    label: 'Soil pH',
                    data: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5],
                    borderColor: '#FDA085',
                    backgroundColor: phGradient,
                    tension: 0.3,
                    fill: true,
                    hidden: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#FDA085'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Format based on data type
                                if (context.dataset.label.includes('pH')) {
                                    label += context.parsed.y.toFixed(1);
                                } else {
                                    label += context.parsed.y + '%';
                                }
                            }
                            return label;
                        },
                        // Add a footer with analysis
                        footer: function(tooltipItems) {
                            const datasetIndex = tooltipItems[0].datasetIndex;
                            const dataPoint = tooltipItems[0].parsed.y;
                            
                            // Show status based on value
                            if (datasetIndex === 0) { // Moisture
                                if (dataPoint < 25) return ['Status: Too Dry'];
                                if (dataPoint > 45) return ['Status: Too Wet'];
                                return ['Status: Optimal'];
                            } else { // pH
                                if (dataPoint < 5.5) return ['Status: Too Acidic'];
                                if (dataPoint > 7.5) return ['Status: Too Alkaline'];
                                return ['Status: Optimal'];
                            }
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Optimal moisture range
                        moistureRangeAnnotation: {
                            type: 'box',
                            yMin: 30,
                            yMax: 40,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Optimal Range',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        // Optimal pH range
                        phRangeAnnotation: {
                            type: 'box',
                            yMin: 6.0,
                            yMax: 7.0,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Optimal pH Range',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            },
                            display: false
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: function(value) {
                            // Add appropriate suffix based on current visible dataset
                            const datasets = moisturePhChart.data.datasets;
                            if (datasets[0].hidden && !datasets[1].hidden) {
                                return value; // pH value with no suffix
                            } else {
                                return value + '%'; // Moisture percentage
                            }
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 8
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            },
            layout: {
                padding: {
                    top: 10,
                    right: 20,
                    bottom: 10,
                    left: 20
                }
            }
        }
    });
    
    // Add click handler to show detailed analysis
    document.getElementById('moisturePhChart').addEventListener('click', function(evt) {
        const points = moisturePhChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        
        if (points.length) {
            const point = points[0];
            const label = moisturePhChart.data.labels[point.index];
            const value = moisturePhChart.data.datasets[point.datasetIndex].data[point.index];
            const dataType = point.datasetIndex === 0 ? 'moisture' : 'ph';
            
            showDetailedDataModal(label, value, dataType);
        }
    });
}

function initTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    // Create gradient for temperature chart
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(249, 119, 148, 0.5)');
    gradientFill.addColorStop(0.6, 'rgba(249, 119, 148, 0.1)');
    gradientFill.addColorStop(1, 'rgba(249, 119, 148, 0)');
    
    const ambientGradient = ctx.createLinearGradient(0, 0, 0, 300);
    ambientGradient.addColorStop(0, 'rgba(123, 104, 238, 0.3)');
    ambientGradient.addColorStop(1, 'rgba(123, 104, 238, 0)');
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Soil Temperature (°C)',
                    data: [21, 22, 24, 23, 22, 23, 23],
                    borderColor: '#F97794',
                    backgroundColor: gradientFill,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#F97794',
                    fill: true
                },
                {
                    label: 'Ambient Temperature (°C)',
                    data: [19, 20, 22, 21, 20, 21, 20],
                    borderColor: '#7B68EE',
                    backgroundColor: ambientGradient,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#7B68EE',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + '°C';
                            }
                            return label;
                        },
                        // Show temperature difference
                        afterLabel: function(context) {
                            const datasetIndex = context.datasetIndex;
                            const dataIndex = context.dataIndex;
                            const datasets = temperatureChart.data.datasets;
                            
                            // Compare soil and ambient temperature if viewing soil temperature
                            if (datasetIndex === 0 && datasets.length > 1) {
                                const soilTemp = datasets[0].data[dataIndex];
                                const ambientTemp = datasets[1].data[dataIndex];
                                const diff = (soilTemp - ambientTemp).toFixed(1);
                                return `${diff > 0 ? '+' : ''}${diff}°C from ambient`;
                            }
                            return '';
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Optimal temperature range based on crop type
                        optimalTempRange: {
                            type: 'box',
                            yMin: 18,
                            yMax: 24,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Optimal Range',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 8
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
    
    // Add click handler for temperature forecast
    document.getElementById('temperatureChart').addEventListener('click', function() {
        showTemperatureForecast();
    });
}

// Update charts with smooth animations
function updateCharts(fieldData) {
    // Update moisture/pH chart
    if (moisturePhChart) {
        // Update moisture dataset
        moisturePhChart.data.datasets[0].data = fieldData.moistureHistory;
        
        // Update pH dataset
        moisturePhChart.data.datasets[1].data = fieldData.phHistory;
        
        // Use common labels
        moisturePhChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Update optimal range annotation based on crop type
        const cropType = fieldData.displayName ? fieldData.displayName.match(/\((.*?)\)/)[1].toLowerCase() : 'wheat';
        
        // Define optimal ranges for different crops
        const optimalRanges = {
            wheat: { moisture: { min: 30, max: 40 }, ph: { min: 6.0, max: 7.0 } },
            rice: { moisture: { min: 35, max: 45 }, ph: { min: 5.5, max: 6.5 } },
            corn: { moisture: { min: 25, max: 40 }, ph: { min: 5.8, max: 7.0 } }
        };
        
        const optimalRange = optimalRanges[cropType] || optimalRanges.wheat;
        
        // Update annotations
        if (moisturePhChart.options.plugins.annotation && 
            moisturePhChart.options.plugins.annotation.annotations) {
            
            const annotations = moisturePhChart.options.plugins.annotation.annotations;
            
            // Update moisture range
            if (annotations.moistureRangeAnnotation) {
                annotations.moistureRangeAnnotation.yMin = optimalRange.moisture.min;
                annotations.moistureRangeAnnotation.yMax = optimalRange.moisture.max;
                annotations.moistureRangeAnnotation.label.content = 
                    `Optimal ${cropType} moisture: ${optimalRange.moisture.min}-${optimalRange.moisture.max}%`;
            }
            
            // Update pH range
            if (annotations.phRangeAnnotation) {
                annotations.phRangeAnnotation.yMin = optimalRange.ph.min;
                annotations.phRangeAnnotation.yMax = optimalRange.ph.max;
                annotations.phRangeAnnotation.label.content = 
                    `Optimal ${cropType} pH: ${optimalRange.ph.min}-${optimalRange.ph.max}`;
            }
        }
        
        // Check for anomalies
        if (anomalyDetectionEnabled) {
            // Add or update anomaly datasets
            const moistureAnomalies = detectDataAnomalies(fieldData.moistureHistory);
            const phAnomalies = detectDataAnomalies(fieldData.phHistory);
            
            // Find existing anomaly datasets or create new ones
            let moistureAnomalyDataset = moisturePhChart.data.datasets.find(ds => 
                ds.label === 'Moisture Anomalies');
            
            let phAnomalyDataset = moisturePhChart.data.datasets.find(ds => 
                ds.label === 'pH Anomalies');
            
            if (moistureAnomalyDataset) {
                // Update existing dataset
                moistureAnomalyDataset.data = moistureAnomalies.map((isAnomaly, i) => 
                    isAnomaly ? fieldData.moistureHistory[i] : null);
            } else {
                // Create new anomaly dataset
                moisturePhChart.data.datasets.push({
                    label: 'Moisture Anomalies',
                    data: moistureAnomalies.map((isAnomaly, i) => 
                        isAnomaly ? fieldData.moistureHistory[i] : null),
                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                    borderColor: 'rgba(255, 0, 0, 1)',
                    borderWidth: 0,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointStyle: 'triangle',
                    pointRotation: 180,
                    hidden: moisturePhChart.data.datasets[0].hidden
                });
            }
            
            if (phAnomalyDataset) {
                // Update existing dataset
                phAnomalyDataset.data = phAnomalies.map((isAnomaly, i) => 
                    isAnomaly ? fieldData.phHistory[i] : null);
            } else {
                // Create new anomaly dataset
                moisturePhChart.data.datasets.push({
                    label: 'pH Anomalies',
                    data: phAnomalies.map((isAnomaly, i) => 
                        isAnomaly ? fieldData.phHistory[i] : null),
                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                    borderColor: 'rgba(255, 0, 0, 1)',
                    borderWidth: 0,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointStyle: 'triangle',
                    pointRotation: 180,
                    hidden: moisturePhChart.data.datasets[1].hidden
                });
            }
        } else {
            // Remove anomaly datasets if anomaly detection is disabled
            moisturePhChart.data.datasets = moisturePhChart.data.datasets.filter(ds => 
                !ds.label.includes('Anomalies'));
        }
        
        // Apply animations when updating
        moisturePhChart.options.animation = {
            duration: 800,
            easing: 'easeOutQuart'
        };
        
        // Update the chart
        moisturePhChart.update();
    }
    
    // Update temperature chart
    if (temperatureChart) {
        // Update soil temperature dataset
        temperatureChart.data.datasets[0].data = fieldData.temperatureHistory;
        
        // Calculate ambient temperature (typically 1-3 degrees lower than soil)
        const ambientTemperature = fieldData.temperatureHistory.map(temp => 
            Math.max(temp - 1 - Math.random() * 2, 10));
        
        // Update ambient temperature dataset
        temperatureChart.data.datasets[1].data = ambientTemperature;
        
        // Update crop-specific optimal temperature range
        const cropType = fieldData.displayName ? fieldData.displayName.match(/\((.*?)\)/)[1].toLowerCase() : 'wheat';
        
        // Define optimal temperature ranges for different crops
        const optimalTemps = {
            wheat: { min: 18, max: 24 },
            rice: { min: 22, max: 28 },
            corn: { min: 20, max: 30 }
        };
        
        const optimalTemp = optimalTemps[cropType] || optimalTemps.wheat;
        
        // Update annotations
        if (temperatureChart.options.plugins.annotation && 
            temperatureChart.options.plugins.annotation.annotations) {
            
            const annotations = temperatureChart.options.plugins.annotation.annotations;
            
            if (annotations.optimalTempRange) {
                annotations.optimalTempRange.yMin = optimalTemp.min;
                annotations.optimalTempRange.yMax = optimalTemp.max;
                annotations.optimalTempRange.label.content = 
                    `Optimal ${cropType} temp: ${optimalTemp.min}-${optimalTemp.max}°C`;
            }
        }
        
        // Apply animations when updating
        temperatureChart.options.animation = {
            duration: 800,
            easing: 'easeOutQuart'
        };
        
        // Update the chart
        temperatureChart.update();
    }
    
    // Create or update nutrient radar chart
    updateNutrientRadarChart(fieldData.nutrients);
}

// Update or create nutrient radar chart
function updateNutrientRadarChart(nutrients) {
    const canvas = document.getElementById('nutrientRadarChart');
    if (!canvas) {
        // Create container and canvas if it doesn't exist
        createNutrientRadarChart();
        return;
    }
    
    // Get the chart instance
    const chart = Chart.getChart(canvas);
    if (!chart) return;
    
    // Update data
    chart.data.datasets[0].data = [
        nutrients.nitrogen,
        nutrients.phosphorus,
        nutrients.potassium,
        nutrients.calcium,
        nutrients.magnesium || 60, // Default if not provided
        nutrients.sulfur || 50      // Default if not provided
    ];
    
    // Apply animations when updating
    chart.options.animation = {
        duration: 800,
        easing: 'easeOutQuart'
    };
    
    // Update the chart
    chart.update();
}

// Create nutrient radar chart if it doesn't exist
function createNutrientRadarChart() {
    // Find container to add radar chart
    const nutrientSection = document.querySelector('.soil-details');
    if (!nutrientSection) return;
    
    // Create container
    const radarContainer = document.createElement('div');
    radarContainer.className = 'nutrient-radar-container';
    radarContainer.innerHTML = `
        <h3>Nutrient Balance</h3>
        <canvas id="nutrientRadarChart"></canvas>
    `;
    
    // Add to section
    nutrientSection.appendChild(radarContainer);
    
    // Initialize chart
    const ctx = document.getElementById('nutrientRadarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Magnesium', 'Sulfur'],
            datasets: [{
                label: 'Current Levels',
                data: [65, 45, 85, 72, 60, 50],
                backgroundColor: 'rgba(79, 172, 254, 0.2)',
                borderColor: 'rgba(79, 172, 254, 1)',
                pointBackgroundColor: 'rgba(79, 172, 254, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(79, 172, 254, 1)',
                borderWidth: 2
            }, {
                label: 'Optimal Range',
                data: [70, 60, 75, 65, 55, 45],
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 2,
                borderDash: [5, 5]
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Advanced anomaly detection algorithm
function detectDataAnomalies(dataArray) {
    if (!dataArray || dataArray.length < 3) {
        return Array(dataArray.length).fill(false);
    }
    
    // Copy data to avoid mutations
    const data = [...dataArray];
    
    // Calculate mean and standard deviation
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    // Z-score threshold for anomalies
    const threshold = 1.8;
    
    // Detect anomalies using z-scores
    const anomalies = data.map(value => {
        const zScore = Math.abs((value - mean) / stdDev);
        return zScore > threshold;
    });
    
    return anomalies;
}

// Show detailed data analysis in a modal
function showDetailedDataModal(dayLabel, value, dataType) {
    // Create or get existing modal
    let modal = document.getElementById('data-detail-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'data-detail-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Set modal content based on data type
    let analysisText, recommendationText, iconClass;
    
    if (dataType === 'moisture') {
        if (value < 25) {
            analysisText = `The soil moisture level of ${value}% is below optimal range (30-40%).`;
            recommendationText = 'Consider irrigation to improve moisture levels for better nutrient uptake.';
            iconClass = 'fa-tint-slash';
        } else if (value > 40) {
            analysisText = `The soil moisture level of ${value}% is above optimal range (30-40%).`;
            recommendationText = 'Monitor for potential drainage issues and reduce irrigation frequency.';
            iconClass = 'fa-water';
        } else {
            analysisText = `The soil moisture level of ${value}% is within optimal range (30-40%).`;
            recommendationText = 'Maintain current irrigation schedule to preserve ideal moisture levels.';
            iconClass = 'fa-check-circle';
        }
    } else { // pH
        if (value < 5.5) {
            analysisText = `The soil pH level of ${value} is too acidic (below 5.5).`;
            recommendationText = 'Apply agricultural lime to raise pH. Too acidic soil restricts nutrient availability.';
            iconClass = 'fa-arrow-down';
        } else if (value > 7.5) {
            analysisText = `The soil pH level of ${value} is too alkaline (above 7.5).`;
            recommendationText = 'Apply sulfur or gypsum to lower pH. Too alkaline soil can reduce micronutrient availability.';
            iconClass = 'fa-arrow-up';
        } else {
            analysisText = `The soil pH level of ${value} is within optimal range (5.5-7.5).`;
            recommendationText = 'Maintain current soil management practices to preserve ideal pH balance.';
            iconClass = 'fa-check-circle';
        }
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${dataType === 'moisture' ? 'Soil Moisture Analysis' : 'Soil pH Analysis'} for ${dayLabel}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="analysis-header">
                    <i class="fas ${iconClass}"></i>
                    <span>${dataType === 'moisture' ? value + '%' : value}</span>
                </div>
                <div class="analysis-section">
                    <h4>Analysis</h4>
                    <p>${analysisText}</p>
                </div>
                <div class="analysis-section">
                    <h4>Recommendation</h4>
                    <p>${recommendationText}</p>
                </div>
                <div class="analysis-section">
                    <h4>Historical Comparison</h4>
                    <div class="historical-chart">
                        <canvas id="historical-comparison-chart"></canvas>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="export-analysis btn">Export Analysis</button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.querySelector('.export-analysis').addEventListener('click', function() {
        exportAnalysis(dayLabel, value, dataType, analysisText, recommendationText);
    });
    
    // Create comparison chart
    setTimeout(() => {
        createHistoricalComparisonChart(dataType, value);
    }, 100);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Create historical comparison chart for the modal
function createHistoricalComparisonChart(dataType, currentValue) {
    const ctx = document.getElementById('historical-comparison-chart');
    if (!ctx) return;
    
    // Get historical data
    const pastMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate seasonal data based on data type
    let seasonalData;
    
    if (dataType === 'moisture') {
        // Simulate seasonal moisture patterns
        seasonalData = [32, 35, 38, 40, 43, 41, 36, 34, 33, 35, 36, 33];
    } else {
        // Simulate seasonal pH patterns (less variable)
        seasonalData = [6.3, 6.4, 6.5, 6.6, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2, 6.3, 6.4];
    }
    
    // Get current month for marking in the chart
    const currentMonthIndex = new Date().getMonth();
    
    // Create point styles array to highlight current month
    const pointStyles = Array(12).fill('circle');
    pointStyles[currentMonthIndex] = 'rectRot';
    
    // Create point radius array to highlight current month
    const pointRadiuses = Array(12).fill(3);
    pointRadiuses[currentMonthIndex] = 8;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: pastMonths,
            datasets: [
                {
                    label: dataType === 'moisture' ? 'Historical Moisture (%)' : 'Historical pH',
                    data: seasonalData,
                    borderColor: '#4FACFE',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointStyle: pointStyles,
                    pointRadius: pointRadiuses,
                    pointHoverRadius: 8,
                    pointBackgroundColor: ctx => {
                        const index = ctx.dataIndex;
                        return index === currentMonthIndex ? '#ff6b6b' : '#4FACFE';
                    },
                    pointBorderColor: ctx => {
                        const index = ctx.dataIndex;
                        return index === currentMonthIndex ? '#ff6b6b' : '#ffffff';
                    },
                    pointBorderWidth: ctx => {
                        const index = ctx.dataIndex;
                        return index === currentMonthIndex ? 2 : 1;
                    }
                },
                {
                    label: 'Current Value',
                    data: Array(12).fill(null).map((_, i) => i === currentMonthIndex ? currentValue : null),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.5)',
                    pointStyle: 'rectRot',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: (value) => dataType === 'moisture' ? value + '%' : value
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            const monthIndex = item.dataIndex;
                            return monthIndex === currentMonthIndex ? 
                                pastMonths[monthIndex] + ' (Current Month)' : 
                                pastMonths[monthIndex];
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Add optimal range based on data type
                        optimalRange: {
                            type: 'box',
                            yMin: dataType === 'moisture' ? 30 : 6.0,
                            yMax: dataType === 'moisture' ? 40 : 7.0,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: dataType === 'moisture' ? 'Optimal Range (30-40%)' : 'Optimal Range (6.0-7.0)',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Show temperature forecast in a popup
function showTemperatureForecast() {
    // Create or get existing modal
    let modal = document.getElementById('forecast-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forecast-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Generate 7-day forecast data
    const today = new Date();
    const forecastDays = [];
    const forecastTemps = [];
    const precipProbability = [];
    
    for (let i = 0; i < 7; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        forecastDays.push(forecastDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        
        // Generate realistic temperature forecast with some random variation
        const baseTemp = 22 + Math.sin(i / 2) * 3;
        const randomVariation = Math.random() * 2 - 1;
        forecastTemps.push(Math.round(baseTemp + randomVariation));
        
        // Generate precipitation probability
        precipProbability.push(Math.round(Math.random() * 100));
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>7-Day Temperature & Precipitation Forecast</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="forecast-chart-container">
                    <canvas id="forecast-chart"></canvas>
                </div>
                <div class="forecast-details">
                    <div class="forecast-info">
                        <h4>Field Conditions</h4>
                        <p>Based on the forecast, optimal irrigation days: <strong>${getForecastIrrigationDays(precipProbability)}</strong></p>
                        <p>Expected soil temperature trend: <strong>${getForecastTempTrend(forecastTemps)}</strong></p>
                    </div>
                    <div class="forecast-actions">
                        <h4>Recommended Actions</h4>
                        <ul class="forecast-action-list">
                            ${generateForecastActions(forecastTemps, precipProbability)}
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn export-forecast">Export Forecast</button>
                    <button class="btn schedule-irrigation">Schedule Irrigation</button>
                </div>
            </div>
        </div>`


    const ctx = document.getElementById('moisturePhChart').getContext('2d');
    
    // Create gradient for better visualization
    const moistureGradient = ctx.createLinearGradient(0, 0, 0, 300);
    moistureGradient.addColorStop(0, 'rgba(79, 172, 254, 0.3)');
    moistureGradient.addColorStop(1, 'rgba(79, 172, 254, 0.05)');
    
    const phGradient = ctx.createLinearGradient(0, 0, 0, 300);
    phGradient.addColorStop(0, 'rgba(253, 160, 133, 0.3)');
    phGradient.addColorStop(1, 'rgba(253, 160, 133, 0.05)');
    
    moisturePhChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Soil Moisture (%)',
                    data: [34, 35, 38, 37, 36, 37, 37],
                    borderColor: '#4FACFE',
                    backgroundColor: moistureGradient,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4FACFE'
                },
                {
                    label: 'Soil pH',
                    data: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5],
                    borderColor: '#FDA085',
                    backgroundColor: phGradient,
                    tension: 0.3,
                    fill: true,
                    hidden: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#FDA085'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Format based on data type
                                if (context.dataset.label.includes('pH')) {
                                    label += context.parsed.y.toFixed(1);
                                } else {
                                    label += context.parsed.y + '%';
                                }
                            }
                            return label;
                        },
                        // Add a footer with analysis
                        footer: function(tooltipItems) {
                            const datasetIndex = tooltipItems[0].datasetIndex;
                            const dataPoint = tooltipItems[0].parsed.y;
                            
                            // Show status based on value
                            if (datasetIndex === 0) { // Moisture
                                if (dataPoint < 25) return ['Status: Too Dry'];
                                if (dataPoint > 45) return ['Status: Too Wet'];
                                return ['Status: Optimal'];
                            } else { // pH
                                if (dataPoint < 5.5) return ['Status: Too Acidic'];
                                if (dataPoint > 7.5) return ['Status: Too Alkaline'];
                                return ['Status: Optimal'];
                            }
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Optimal moisture range
                        moistureRangeAnnotation: {
                            type: 'box',
                            yMin: 30,
                            yMax: 40,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Optimal Range',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            }
                        },
                        // Optimal pH range
                        phRangeAnnotation: {
                            type: 'box',
                            yMin: 6.0,
                            yMax: 7.0,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Optimal pH Range',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            },
                            display: false
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: function(value) {
                            // Add appropriate suffix based on current visible dataset
                            const datasets = moisturePhChart.data.datasets;
                            if (datasets[0].hidden && !datasets[1].hidden) {
                                return value; // pH value with no suffix
                            } else {
                                return value + '%'; // Moisture percentage
                            }
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 8
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            },
            layout: {
                padding: {
                    top: 10,
                    right: 20,
                    bottom: 10,
                    left: 20
                }
            }
        }
    });
    
    // Add click handler to show detailed analysis
    document.getElementById('moisturePhChart').addEventListener('click', function(evt) {
        const points = moisturePhChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        
        if (points.length) {
            const point = points[0];
            const label = moisturePhChart.data.labels[point.index];
            const value = moisturePhChart.data.datasets[point.datasetIndex].data[point.index];
            const dataType = point.datasetIndex === 0 ? 'moisture' : 'ph';
            
            showDetailedDataModal(label, value, dataType);
        }
    });
}

function initTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    // Create gradient for temperature chart
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(249, 119, 148, 0.5)');
    gradientFill.addColorStop(0.6, 'rgba(249, 119, 148, 0.1)');
    gradientFill.addColorStop(1, 'rgba(249, 119, 148, 0)');
    
    const ambientGradient = ctx.createLinearGradient(0, 0, 0, 300);
    ambientGradient.addColorStop(0, 'rgba(123, 104, 238, 0.3)');
    ambientGradient.addColorStop(1, 'rgba(123, 104, 238, 0)');
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Soil Temperature (°C)',
                    data: [21, 22, 24, 23, 22, 23, 23],
                    borderColor: '#F97794',
                    backgroundColor: gradientFill,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#F97794',
                    fill: true
                },
                {
                    label: 'Ambient Temperature (°C)',
                    data: [19, 20, 22, 21, 20, 21, 20],
                    borderColor: '#7B68EE',
                    backgroundColor: ambientGradient,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#7B68EE',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + '°C';
                            }
                            return label;
                        },
                        // Show temperature difference
                        afterLabel: function(context) {
                            const datasetIndex = context.datasetIndex;
                            const dataIndex = context.dataIndex;
                            const datasets = temperatureChart.data.datasets;
                            
                            // Compare soil and ambient temperature if viewing soil temperature
                            if (datasetIndex === 0 && datasets.length > 1) {
                                const soilTemp = datasets[0].data[dataIndex];
                                const ambientTemp = datasets[1].data[dataIndex];
                                const diff = (soilTemp - ambientTemp).toFixed(1);
                                return `${diff > 0 ? '+' : ''}${diff}°C from ambient`;
                            }
                            return '';
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Optimal temperature range based on crop type
                        optimalTempRange: {
                            type: 'box',
                            yMin: 18,
                            yMax: 24,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Optimal Range',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        },
                        padding: 8
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 8
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
    
    // Add click handler for temperature forecast
    document.getElementById('temperatureChart').addEventListener('click', function() {
        showTemperatureForecast();
    });
}

// Update charts with smooth animations
function updateCharts(fieldData) {
    // Update moisture/pH chart
    if (moisturePhChart) {
        // Update moisture dataset
        moisturePhChart.data.datasets[0].data = fieldData.moistureHistory;
        
        // Update pH dataset
        moisturePhChart.data.datasets[1].data = fieldData.phHistory;
        
        // Use common labels
        moisturePhChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Update optimal range annotation based on crop type
        const cropType = fieldData.displayName ? fieldData.displayName.match(/\((.*?)\)/)[1].toLowerCase() : 'wheat';
        
        // Define optimal ranges for different crops
        const optimalRanges = {
            wheat: { moisture: { min: 30, max: 40 }, ph: { min: 6.0, max: 7.0 } },
            rice: { moisture: { min: 35, max: 45 }, ph: { min: 5.5, max: 6.5 } },
            corn: { moisture: { min: 25, max: 40 }, ph: { min: 5.8, max: 7.0 } }
        };
        
        const optimalRange = optimalRanges[cropType] || optimalRanges.wheat;
        
        // Update annotations
        if (moisturePhChart.options.plugins.annotation && 
            moisturePhChart.options.plugins.annotation.annotations) {
            
            const annotations = moisturePhChart.options.plugins.annotation.annotations;
            
            // Update moisture range
            if (annotations.moistureRangeAnnotation) {
                annotations.moistureRangeAnnotation.yMin = optimalRange.moisture.min;
                annotations.moistureRangeAnnotation.yMax = optimalRange.moisture.max;
                annotations.moistureRangeAnnotation.label.content = 
                    `Optimal ${cropType} moisture: ${optimalRange.moisture.min}-${optimalRange.moisture.max}%`;
            }
            
            // Update pH range
            if (annotations.phRangeAnnotation) {
                annotations.phRangeAnnotation.yMin = optimalRange.ph.min;
                annotations.phRangeAnnotation.yMax = optimalRange.ph.max;
                annotations.phRangeAnnotation.label.content = 
                    `Optimal ${cropType} pH: ${optimalRange.ph.min}-${optimalRange.ph.max}`;
            }
        }
        
        // Check for anomalies
        if (anomalyDetectionEnabled) {
            // Add or update anomaly datasets
            const moistureAnomalies = detectDataAnomalies(fieldData.moistureHistory);
            const phAnomalies = detectDataAnomalies(fieldData.phHistory);
            
            // Find existing anomaly datasets or create new ones
            let moistureAnomalyDataset = moisturePhChart.data.datasets.find(ds => 
                ds.label === 'Moisture Anomalies');
            
            let phAnomalyDataset = moisturePhChart.data.datasets.find(ds => 
                ds.label === 'pH Anomalies');
            
            if (moistureAnomalyDataset) {
                // Update existing dataset
                moistureAnomalyDataset.data = moistureAnomalies.map((isAnomaly, i) => 
                    isAnomaly ? fieldData.moistureHistory[i] : null);
            } else {
                // Create new anomaly dataset
                moisturePhChart.data.datasets.push({
                    label: 'Moisture Anomalies',
                    data: moistureAnomalies.map((isAnomaly, i) => 
                        isAnomaly ? fieldData.moistureHistory[i] : null),
                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                    borderColor: 'rgba(255, 0, 0, 1)',
                    borderWidth: 0,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointStyle: 'triangle',
                    pointRotation: 180,
                    hidden: moisturePhChart.data.datasets[0].hidden
                });
            }
            
            if (phAnomalyDataset) {
                // Update existing dataset
                phAnomalyDataset.data = phAnomalies.map((isAnomaly, i) => 
                    isAnomaly ? fieldData.phHistory[i] : null);
            } else {
                // Create new anomaly dataset
                moisturePhChart.data.datasets.push({
                    label: 'pH Anomalies',
                    data: phAnomalies.map((isAnomaly, i) => 
                        isAnomaly ? fieldData.phHistory[i] : null),
                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                    borderColor: 'rgba(255, 0, 0, 1)',
                    borderWidth: 0,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointStyle: 'triangle',
                    pointRotation: 180,
                    hidden: moisturePhChart.data.datasets[1].hidden
                });
            }
        } else {
            // Remove anomaly datasets if anomaly detection is disabled
            moisturePhChart.data.datasets = moisturePhChart.data.datasets.filter(ds => 
                !ds.label.includes('Anomalies'));
        }
        
        // Apply animations when updating
        moisturePhChart.options.animation = {
            duration: 800,
            easing: 'easeOutQuart'
        };
        
        // Update the chart
        moisturePhChart.update();
    }
    
    // Update temperature chart
    if (temperatureChart) {
        // Update soil temperature dataset
        temperatureChart.data.datasets[0].data = fieldData.temperatureHistory;
        
        // Calculate ambient temperature (typically 1-3 degrees lower than soil)
        const ambientTemperature = fieldData.temperatureHistory.map(temp => 
            Math.max(temp - 1 - Math.random() * 2, 10));
        
        // Update ambient temperature dataset
        temperatureChart.data.datasets[1].data = ambientTemperature;
        
        // Update crop-specific optimal temperature range
        const cropType = fieldData.displayName ? fieldData.displayName.match(/\((.*?)\)/)[1].toLowerCase() : 'wheat';
        
        // Define optimal temperature ranges for different crops
        const optimalTemps = {
            wheat: { min: 18, max: 24 },
            rice: { min: 22, max: 28 },
            corn: { min: 20, max: 30 }
        };
        
        const optimalTemp = optimalTemps[cropType] || optimalTemps.wheat;
        
        // Update annotations
        if (temperatureChart.options.plugins.annotation && 
            temperatureChart.options.plugins.annotation.annotations) {
            
            const annotations = temperatureChart.options.plugins.annotation.annotations;
            
            if (annotations.optimalTempRange) {
                annotations.optimalTempRange.yMin = optimalTemp.min;
                annotations.optimalTempRange.yMax = optimalTemp.max;
                annotations.optimalTempRange.label.content = 
                    `Optimal ${cropType} temp: ${optimalTemp.min}-${optimalTemp.max}°C`;
            }
        }
        
        // Apply animations when updating
        temperatureChart.options.animation = {
            duration: 800,
            easing: 'easeOutQuart'
        };
        
        // Update the chart
        temperatureChart.update();
    }
    
    // Create or update nutrient radar chart
    updateNutrientRadarChart(fieldData.nutrients);
}

// Update or create nutrient radar chart
function updateNutrientRadarChart(nutrients) {
    const canvas = document.getElementById('nutrientRadarChart');
    if (!canvas) {
        // Create container and canvas if it doesn't exist
        createNutrientRadarChart();
        return;
    }
    
    // Get the chart instance
    const chart = Chart.getChart(canvas);
    if (!chart) return;
    
    // Update data
    chart.data.datasets[0].data = [
        nutrients.nitrogen,
        nutrients.phosphorus,
        nutrients.potassium,
        nutrients.calcium,
        nutrients.magnesium || 60, // Default if not provided
        nutrients.sulfur || 50      // Default if not provided
    ];
    
    // Apply animations when updating
    chart.options.animation = {
        duration: 800,
        easing: 'easeOutQuart'
    };
    
    // Update the chart
    chart.update();
}

// Create nutrient radar chart if it doesn't exist
function createNutrientRadarChart() {
    // Find container to add radar chart
    const nutrientSection = document.querySelector('.soil-details');
    if (!nutrientSection) return;
    
    // Create container
    const radarContainer = document.createElement('div');
    radarContainer.className = 'nutrient-radar-container';
    radarContainer.innerHTML = `
        <h3>Nutrient Balance</h3>
        <canvas id="nutrientRadarChart"></canvas>
    `;
    
    // Add to section
    nutrientSection.appendChild(radarContainer);
    
    // Initialize chart
    const ctx = document.getElementById('nutrientRadarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Magnesium', 'Sulfur'],
            datasets: [{
                label: 'Current Levels',
                data: [65, 45, 85, 72, 60, 50],
                backgroundColor: 'rgba(79, 172, 254, 0.2)',
                borderColor: 'rgba(79, 172, 254, 1)',
                pointBackgroundColor: 'rgba(79, 172, 254, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(79, 172, 254, 1)',
                borderWidth: 2
            }, {
                label: 'Optimal Range',
                data: [70, 60, 75, 65, 55, 45],
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 2,
                borderDash: [5, 5]
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    },
                    grid: {
                        color: 'rgba(200, 200, 200, 0.2)'
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Advanced anomaly detection algorithm
function detectDataAnomalies(dataArray) {
    if (!dataArray || dataArray.length < 3) {
        return Array(dataArray.length).fill(false);
    }
    
    // Copy data to avoid mutations
    const data = [...dataArray];
    
    // Calculate mean and standard deviation
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    // Z-score threshold for anomalies
    const threshold = 1.8;
    
    // Detect anomalies using z-scores
    const anomalies = data.map(value => {
        const zScore = Math.abs((value - mean) / stdDev);
        return zScore > threshold;
    });
    
    return anomalies;
}

// Show detailed data analysis in a modal
function showDetailedDataModal(dayLabel, value, dataType) {
    // Create or get existing modal
    let modal = document.getElementById('data-detail-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'data-detail-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Set modal content based on data type
    let analysisText, recommendationText, iconClass;
    
    if (dataType === 'moisture') {
        if (value < 25) {
            analysisText = `The soil moisture level of ${value}% is below optimal range (30-40%).`;
            recommendationText = 'Consider irrigation to improve moisture levels for better nutrient uptake.';
            iconClass = 'fa-tint-slash';
        } else if (value > 40) {
            analysisText = `The soil moisture level of ${value}% is above optimal range (30-40%).`;
            recommendationText = 'Monitor for potential drainage issues and reduce irrigation frequency.';
            iconClass = 'fa-water';
        } else {
            analysisText = `The soil moisture level of ${value}% is within optimal range (30-40%).`;
            recommendationText = 'Maintain current irrigation schedule to preserve ideal moisture levels.';
            iconClass = 'fa-check-circle';
        }
    } else { // pH
        if (value < 5.5) {
            analysisText = `The soil pH level of ${value} is too acidic (below 5.5).`;
            recommendationText = 'Apply agricultural lime to raise pH. Too acidic soil restricts nutrient availability.';
            iconClass = 'fa-arrow-down';
        } else if (value > 7.5) {
            analysisText = `The soil pH level of ${value} is too alkaline (above 7.5).`;
            recommendationText = 'Apply sulfur or gypsum to lower pH. Too alkaline soil can reduce micronutrient availability.';
            iconClass = 'fa-arrow-up';
        } else {
            analysisText = `The soil pH level of ${value} is within optimal range (5.5-7.5).`;
            recommendationText = 'Maintain current soil management practices to preserve ideal pH balance.';
            iconClass = 'fa-check-circle';
        }
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${dataType === 'moisture' ? 'Soil Moisture Analysis' : 'Soil pH Analysis'} for ${dayLabel}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="analysis-header">
                    <i class="fas ${iconClass}"></i>
                    <span>${dataType === 'moisture' ? value + '%' : value}</span>
                </div>
                <div class="analysis-section">
                    <h4>Analysis</h4>
                    <p>${analysisText}</p>
                </div>
                <div class="analysis-section">
                    <h4>Recommendation</h4>
                    <p>${recommendationText}</p>
                </div>
                <div class="analysis-section">
                    <h4>Historical Comparison</h4>
                    <div class="historical-chart">
                        <canvas id="historical-comparison-chart"></canvas>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="export-analysis btn">Export Analysis</button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.querySelector('.export-analysis').addEventListener('click', function() {
        exportAnalysis(dayLabel, value, dataType, analysisText, recommendationText);
    });
    
    // Create comparison chart
    setTimeout(() => {
        createHistoricalComparisonChart(dataType, value);
    }, 100);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Create historical comparison chart for the modal
function createHistoricalComparisonChart(dataType, currentValue) {
    const ctx = document.getElementById('historical-comparison-chart');
    if (!ctx) return;
    
    // Get historical data
    const pastMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate seasonal data based on data type
    let seasonalData;
    
    if (dataType === 'moisture') {
        // Simulate seasonal moisture patterns
        seasonalData = [32, 35, 38, 40, 43, 41, 36, 34, 33, 35, 36, 33];
    } else {
        // Simulate seasonal pH patterns (less variable)
        seasonalData = [6.3, 6.4, 6.5, 6.6, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2, 6.3, 6.4];
    }
    
    // Get current month for marking in the chart
    const currentMonthIndex = new Date().getMonth();
    
    // Create point styles array to highlight current month
    const pointStyles = Array(12).fill('circle');
    pointStyles[currentMonthIndex] = 'rectRot';
    
    // Create point radius array to highlight current month
    const pointRadiuses = Array(12).fill(3);
    pointRadiuses[currentMonthIndex] = 8;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: pastMonths,
            datasets: [
                {
                    label: dataType === 'moisture' ? 'Historical Moisture (%)' : 'Historical pH',
                    data: seasonalData,
                    borderColor: '#4FACFE',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointStyle: pointStyles,
                    pointRadius: pointRadiuses,
                    pointHoverRadius: 8,
                    pointBackgroundColor: ctx => {
                        const index = ctx.dataIndex;
                        return index === currentMonthIndex ? '#ff6b6b' : '#4FACFE';
                    },
                    pointBorderColor: ctx => {
                        const index = ctx.dataIndex;
                        return index === currentMonthIndex ? '#ff6b6b' : '#ffffff';
                    },
                    pointBorderWidth: ctx => {
                        const index = ctx.dataIndex;
                        return index === currentMonthIndex ? 2 : 1;
                    }
                },
                {
                    label: 'Current Value',
                    data: Array(12).fill(null).map((_, i) => i === currentMonthIndex ? currentValue : null),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.5)',
                    pointStyle: 'rectRot',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.15)'
                    },
                    ticks: {
                        callback: (value) => dataType === 'moisture' ? value + '%' : value
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            const monthIndex = item.dataIndex;
                            return monthIndex === currentMonthIndex ? 
                                pastMonths[monthIndex] + ' (Current Month)' : 
                                pastMonths[monthIndex];
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Add optimal range based on data type
                        optimalRange: {
                            type: 'box',
                            yMin: dataType === 'moisture' ? 30 : 6.0,
                            yMax: dataType === 'moisture' ? 40 : 7.0,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: dataType === 'moisture' ? 'Optimal Range (30-40%)' : 'Optimal Range (6.0-7.0)',
                                display: true,
                                position: 'start',
                                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Show temperature forecast in a popup
function showTemperatureForecast() {
    // Create or get existing modal
    let modal = document.getElementById('forecast-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'forecast-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Generate 7-day forecast data
    const today = new Date();
    const forecastDays = [];
    const forecastTemps = [];
    const precipProbability = [];
    
    for (let i = 0; i < 7; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        forecastDays.push(forecastDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        
        // Generate realistic temperature forecast with some random variation
        const baseTemp = 22 + Math.sin(i / 2) * 3;
        const randomVariation = Math.random() * 2 - 1;
        forecastTemps.push(Math.round(baseTemp + randomVariation));
        
        // Generate precipitation probability
        precipProbability.push(Math.round(Math.random() * 100));
    }
    
    // ...existing code...
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h3>7-Day Temperature & Precipitation Forecast</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="forecast-chart-container">
                <canvas id="forecast-chart"></canvas>
            </div>
            <div class="forecast-details">
                <div class="forecast-info">
                    <h4>Field Conditions</h4>
                    <p>Based on the forecast, optimal irrigation days: <strong>${getForecastIrrigationDays(precipProbability)}</strong></p>
                    <p>Expected soil temperature trend: <strong>${getForecastTempTrend(forecastTemps)}</strong></p>
                </div>
                <div class="forecast-actions">
                    <h4>Recommended Actions</h4>
                    <ul class="forecast-action-list">
                        ${generateForecastActions(forecastTemps, precipProbability)}
                    </ul>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn export-forecast">Export Forecast</button>
            <button class="btn schedule-irrigation">Schedule Irrigation</button>
        </div>
    </div>
`;

// Show modal
modal.style.display = 'flex';

// Add event listeners
modal.querySelector('.modal-close').addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Export forecast button
modal.querySelector('.export-forecast').addEventListener('click', function() {
    exportForecastData(forecastDays, forecastTemps, precipProbability);
});

// Schedule irrigation button
modal.querySelector('.schedule-irrigation').addEventListener('click', function() {
    showIrrigationScheduler(forecastDays, precipProbability);
});

// Create forecast chart
setTimeout(() => {
    createForecastChart(forecastDays, forecastTemps, precipProbability);
}, 100);
}

// Helper functions for the forecast modal
function getForecastIrrigationDays(precipProbability) {
    // Find days with low precipitation probability (good for irrigation)
    const goodDays = precipProbability.map((prob, index) => 
        prob < 30 ? index : -1).filter(day => day !== -1);
    
    if (goodDays.length === 0) return "None (all days show precipitation)";
    
    // Convert to day names
    const today = new Date();
    return goodDays.map(dayIndex => {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + dayIndex);
        return forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
    }).join(', ');
}

function getForecastTempTrend(temperatures) {
    // Analyze the temperature trend
    const firstHalf = temperatures.slice(0, 3);
    const secondHalf = temperatures.slice(-3);
    
    const firstAvg = firstHalf.reduce((sum, temp) => sum + temp, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, temp) => sum + temp, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 1.5) return "Warming trend";
    if (diff < -1.5) return "Cooling trend";
    return "Stable temperatures";
}

function generateForecastActions(temperatures, precipitation) {
    const actions = [];
    
    // Check for high temperatures
    if (temperatures.some(temp => temp > 28)) {
        actions.push("Consider additional irrigation due to high temperatures forecasted");
    }
    
    // Check for precipitation
    const highPrecipDays = precipitation.filter(prob => prob > 60).length;
    if (highPrecipDays > 2) {
        actions.push("Monitor field drainage with heavy precipitation expected");
    } else if (precipitation.every(prob => prob < 30)) {
        actions.push("Plan irrigation schedule with dry conditions expected");
    }
    
    // Check temperature fluctuations
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    if (maxTemp - minTemp > 8) {
        actions.push("Be aware of significant temperature fluctuations that may affect crop development");
    }
    
    // If no specific actions, add a general recommendation
    if (actions.length === 0) {
        actions.push("Maintain regular monitoring schedule, no critical issues in forecast");
    }
    
    return actions.map(action => `<li><i class="fas fa-check-circle"></i> ${action}</li>`).join('');
}

function createForecastChart(days, temperatures, precipitation) {
    const ctx = document.getElementById('forecast-chart');
    if (!ctx) return;
    
    // Create chart with two Y axes: temperature and precipitation probability
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    backgroundColor: 'rgba(249, 119, 148, 0.6)',
                    borderColor: 'rgba(249, 119, 148, 1)',
                    borderWidth: 1,
                    type: 'line',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y',
                    pointBackgroundColor: 'rgba(249, 119, 148, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Precipitation Probability (%)',
                    data: precipitation,
                    backgroundColor: function(context) {
                        const value = context.raw;
                        return value < 30
                            ? 'rgba(46, 204, 113, 0.5)'  // Low chance - green
                            : value < 60
                                ? 'rgba(243, 156, 18, 0.5)'  // Medium chance - orange
                                : 'rgba(231, 76, 60, 0.5)';  // High chance - red
                    },
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Precipitation Probability (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Show irrigation scheduler popup
function showIrrigationScheduler(forecastDays, precipProbability) {
    // Create or get existing modal
    let schedulerModal = document.getElementById('irrigation-scheduler-modal');
    
    if (!schedulerModal) {
        schedulerModal = document.createElement('div');
        schedulerModal.id = 'irrigation-scheduler-modal';
        schedulerModal.className = 'modal';
        document.body.appendChild(schedulerModal);
    }
    
    // Create checkboxes for each day, with recommended days pre-checked
    const checkboxes = forecastDays.map((day, index) => {
        const isRecommended = precipProbability[index] < 30;
        return `
            <div class="scheduler-day ${isRecommended ? 'recommended' : ''}">
                <label>
                    <input type="checkbox" name="irrigation-day" value="${index}" ${isRecommended ? 'checked' : ''}>
                    <span>${day}</span>
                    ${isRecommended ? '<span class="recommended-tag">Recommended</span>' : ''}
                    <span class="precip-indicator">${precipProbability[index]}% precipitation</span>
                </label>
            </div>
        `;
    }).join('');
    
    // Set modal content
    schedulerModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Schedule Irrigation</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p class="scheduler-info">Select days to schedule automatic irrigation based on weather forecast:</p>
                <div class="scheduler-days">
                    ${checkboxes}
                </div>
                <div class="irrigation-options">
                    <h4>Irrigation Settings</h4>
                    <div class="option-row">
                        <label>Duration: 
                            <select name="irrigation-duration">
                                <option value="30">30 minutes</option>
                                <option value="60" selected>1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2 hours</option>
                            </select>
                        </label>
                        <label>Start time: 
                            <select name="irrigation-time">
                                <option value="5">5:00 AM</option>
                                <option value="6" selected>6:00 AM</option>
                                <option value="7">7:00 AM</option>
                                <option value="18">6:00 PM</option>
                                <option value="19">7:00 PM</option>
                            </select>
                        </label>
                    </div>
                    <div class="option-row">
                        <label>
                            <input type="checkbox" name="auto-adjust" checked>
                            Auto-adjust based on soil moisture readings
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn cancel-irrigation">Cancel</button>
                <button class="btn confirm-irrigation">Confirm Schedule</button>
            </div>
        </div>
    `;
    
    // Show modal
    schedulerModal.style.display = 'flex';
    
    // Add event listeners
    schedulerModal.querySelector('.modal-close').addEventListener('click', function() {
        schedulerModal.style.display = 'none';
    });
    
    schedulerModal.querySelector('.cancel-irrigation').addEventListener('click', function() {
        schedulerModal.style.display = 'none';
    });
    
    schedulerModal.querySelector('.confirm-irrigation').addEventListener('click', function() {
        // Get selected days
        const selectedDays = Array.from(schedulerModal.querySelectorAll('input[name="irrigation-day"]:checked'))
            .map(checkbox => parseInt(checkbox.value));
        
        // Get irrigation settings
        const duration = schedulerModal.querySelector('select[name="irrigation-duration"]').value;
        const startTime = schedulerModal.querySelector('select[name="irrigation-time"]').value;
        const autoAdjust = schedulerModal.querySelector('input[name="auto-adjust"]').checked;
        
        // In a real app, this would send the schedule to a server
        // For the demo, just show a confirmation
        schedulerModal.style.display = 'none';
        
        // Show success notification
        showNotification(`Irrigation scheduled for ${selectedDays.length} days with ${duration} min duration`, 'success');
        
        // Close the forecast modal too
        document.getElementById('forecast-modal').style.display = 'none';
        
        // Log the action
        logUserAction('irrigation_scheduled', {
            days: selectedDays.map(index => forecastDays[index]),
            duration,
            startTime,
            autoAdjust
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === schedulerModal) {
            schedulerModal.style.display = 'none';
        }
    });
}

// Export forecast data to CSV
function exportForecastData(days, temperatures, precipitation) {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Temperature (°C),Precipitation Probability (%)\n";
    
    // Add data rows
    days.forEach((day, index) => {
        csvContent += `${day},${temperatures[index]},${precipitation[index]}\n`;
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `weather_forecast_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    showNotification("Forecast data exported successfully", "success");
}

// Export analysis to PDF (in real app would use a PDF library)
function exportAnalysis(day, value, dataType, analysis, recommendation) {
    // In a real application, this would generate a PDF
    // For demo purposes, we'll just create a text file
    
    const analysisText = `
AgriSense Soil Analysis Report
==============================
Date: ${new Date().toDateString()}
Day analyzed: ${day}
Measurement type: ${dataType === 'moisture' ? 'Soil Moisture' : 'Soil pH'}
Value: ${value}${dataType === 'moisture' ? '%' : ''}

Analysis:
${analysis}

Recommendation:
${recommendation}

Generated by AgriSense Dashboard
    `.trim();
    
    // Create blob and download
    const blob = new Blob([analysisText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataType}_analysis_${day.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    showNotification(`Analysis report exported successfully`, 'success');
}

// Show notifications
function showNotification(message, type = 'info') {
    // Get or create notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        default:
            icon = 'fa-info-circle';
    }
    
    // Set notification content
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="notification-message">${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add event listener for close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('closing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after a delay
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
    
    // Track notification count for analytics
    notificationCount++;
}

// Initialize anomaly detection system
function initializeAnomalyDetection() {
    // In a real app, this would set up more sophisticated detection logic
    console.log("Initializing anomaly detection system...");
    
    // Set up periodic checks for anomalies
    setInterval(() => {
        if (!currentFieldData || !anomalyDetectionEnabled) return;
        
        // Check for critical anomalies in latest data
        const anomalies = findAnomalies(currentFieldData);
        
        // Show alerts for critical anomalies
        if (anomalies.length > 0) {
            anomalies.forEach(anomaly => {
                showNotification(`Anomaly detected: ${anomaly.message}`, 'warning');
                createActionRecommendation(`anomaly-${anomaly.id}`, anomaly.recommendation);
            });
        }
    }, 60000); // Check every minute
}

// Initialize predictive analytics system
function initializePredictiveAnalytics() {
    console.log("Initializing predictive analytics...");
    
    // Simulate generating periodic predictions
    setInterval(() => {
        if (!currentFieldData) return;
        
        // In a real app, this would use machine learning models to generate predictions
        // For now, just simulate with random predictions occasionally
        if (Math.random() < 0.1) { // 10% chance to show a prediction
            generatePrediction();
        }
    }, 120000); // Check every 2 minutes
}

// Find anomalies in current field data
function findAnomalies(fieldData) {
    const anomalies = [];
    
    // Check for rapid moisture changes
    if (fieldData.moistureHistory && fieldData.moistureHistory.length >= 3) {
        const lastThree = fieldData.moistureHistory.slice(-3);
        const diff = lastThree[2] - lastThree[0];
        
        if (Math.abs(diff) > 5) {
            anomalies.push({
                id: 'rapid-moisture-change',
                message: `Rapid moisture change detected (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)`,
                recommendation: `Investigate sudden ${diff > 0 ? 'increase' : 'decrease'} in soil moisture. ${diff > 0 ? 'Check for irrigation issues or leaks.' : 'Check for drainage issues or sensor malfunction.'}`
            });
        }
    }
    
    // Check for pH drift
    if (fieldData.phHistory && fieldData.phHistory.length >= 5) {
        const startAvg = (fieldData.phHistory[0] + fieldData.phHistory[1]) / 2;
        const endAvg = (fieldData.phHistory[fieldData.phHistory.length - 1] + fieldData.phHistory[fieldData.phHistory.length - 2]) / 2;
        const phDrift = endAvg - startAvg;
        
        if (Math.abs(phDrift) > 0.3) {
            anomalies.push({
                id: 'ph-drift',
                message: `pH drifting ${phDrift > 0 ? 'up' : 'down'} (${phDrift.toFixed(2)} change)`,
                recommendation: `Monitor pH drift and consider ${phDrift > 0 ? 'acidifying amendments' : 'applying lime'} if trend continues.`
            });
        }
    }
    
    return anomalies;
}

// Generate a prediction based on current data
function generatePrediction() {
    if (!currentFieldData) return;
    
    // Get current field type from name
    const fieldName = currentFieldData.displayName || '';
    const cropType = fieldName.match(/\((.*?)\)/)?.[1].toLowerCase() || 'crop';
    
    // Simulate different types of predictions
    const predictionTypes = [
        {
            id: 'moisture-forecast',
            title: 'Moisture Trend Prediction',
            message: `Based on current trends and weather forecast, soil moisture is predicted to ${Math.random() > 0.5 ? 'decrease by 3-5%' : 'increase by 2-4%'} over the next 48 hours.`,
            actionable: true
        },
        {
            id: 'yield-impact',
            title: 'Yield Impact Analysis',
            message: `Current soil conditions suggest a potential ${Math.random() > 0.7 ? 'negative' : 'positive'} impact of ${Math.floor(Math.random() * 10) + 1}% on ${cropType} yield compared to last season.`,
            actionable: Math.random() > 0.5
        },
        {
            id: 'nutrient-depletion',
            title: 'Nutrient Depletion Alert',
            message: `${['Nitrogen', 'Phosphorus', 'Potassium'][Math.floor(Math.random() * 3)]} levels projected to reach deficiency threshold within ${Math.floor(Math.random() * 20) + 10} days based on current uptake rate.`,
            actionable: true
        }
    ];
    
    // Select a random prediction type
    const prediction = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];
    
    // Show the prediction
    showPredictionAlert(prediction);
}

// Show prediction alert
function showPredictionAlert(prediction) {
    // Create or get existing predictions panel
    let predictionsPanel = document.querySelector('.predictions-panel');
    
    if (!predictionsPanel) {
        predictionsPanel = document.createElement('div');
        predictionsPanel.className = 'predictions-panel';
        
        const panelHeader = document.createElement('div');
        panelHeader.className = 'predictions-header';
        panelHeader.innerHTML = `
            <h3><i class="fas fa-chart-line"></i> Predictive Insights</h3>
            <button class="predictions-toggle"><i class="fas fa-chevron-down"></i></button>
        `;
        
        predictionsPanel.appendChild(panelHeader);
        
        const panelBody = document.createElement('div');
        panelBody.className = 'predictions-body';
        predictionsPanel.appendChild(panelBody);
        
        // Add to page
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            dashboardContent.appendChild(predictionsPanel);
        } else {
            document.body.appendChild(predictionsPanel);
        }
        
        // Add toggle functionality
        panelHeader.querySelector('.predictions-toggle').addEventListener('click', function() {
            predictionsPanel.classList.toggle('collapsed');
            this.innerHTML = predictionsPanel.classList.contains('collapsed') 
                ? '<i class="fas fa-chevron-up"></i>' 
                : '<i class="fas fa-chevron-down"></i>';
        });
    }
    
    // Add the prediction to the panel
    const predictionsBody = predictionsPanel.querySelector('.predictions-body');
    
    const predictionItem = document.createElement('div');
    predictionItem.className = 'prediction-item';
    predictionItem.innerHTML = `
        <div class="prediction-header">
            <h4>${prediction.title}</h4>
            <span class="prediction-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <p>${prediction.message}</p>
        ${prediction.actionable ? '<button class="btn-take-action">Take Action</button>' : ''}
        <button class="btn-dismiss-prediction"><i class="fas fa-times"></i></button>
    `;
    
    // Add to predictions body
    predictionsBody.appendChild(predictionItem);
    
    // Make panel visible if it was hidden
    predictionsPanel.classList.remove('hidden');
    
    // Add event listeners
    if (prediction.actionable) {
        predictionItem.querySelector('.btn-take-action').addEventListener('click', function() {
            showActionPlan(prediction);
            predictionItem.classList.add('actioned');
            this.textContent = 'Action Planned';
            this.disabled = true;
        });
    }
    
    predictionItem.querySelector('.btn-dismiss-prediction').addEventListener('click', function() {
        predictionItem.classList.add('dismissed');
        setTimeout(() => {
            predictionItem.remove();
            
            // If no more predictions, hide the panel
            if (predictionsBody.children.length === 0) {
                predictionsPanel.classList.add('hidden');
            }
        }, 300);
    });
    
    // Highlight the panel to get attention
    predictionsPanel.classList.add('highlight');
    setTimeout(() => {
        predictionsPanel.classList.remove('highlight');
    }, 1000);
}

// Show action plan for a prediction
function showActionPlan(prediction) {
    // Generate action plan based on prediction type
    let actionPlan;
    
    switch (prediction.id) {
        case 'moisture-forecast':
            actionPlan = {
                title: "Moisture Management Plan",
                steps: [
                    "Adjust irrigation schedule based on forecast",
                    "Monitor soil moisture sensors at 4-hour intervals",
                    "Prepare contingency irrigation system if needed"
                ],
                timeframe: "Next 48 hours"
            };
            break;
        case 'yield-impact':
            actionPlan = {
                title: "Yield Optimization Plan",
                steps: [
                    "Conduct detailed soil nutrient analysis",
                    "Adjust fertilization schedule based on findings",
                    "Monitor crop development with increased frequency"
                ],
                timeframe: "Next 7-10 days"
            };
            break;
        case 'nutrient-depletion':
            actionPlan = {
                title: "Nutrient Management Plan",
                steps: [
                    "Apply supplementary fertilizer to targeted areas",
                    "Increase sampling frequency to track effectiveness",
                    "Analyze crop intake patterns for optimization"
                ],
                timeframe: "Next 5 days"
            };
            break;
        default:
            actionPlan = {
                title: "Response Plan",
                steps: [
                    "Analyze current field conditions in detail",
                    "Implement appropriate mitigation measures",
                    "Monitor effectiveness with increased frequency"
                ],
                timeframe: "Next 7 days"
            };
    }
    
    // Create action plan modal
    let actionModal = document.getElementById('action-plan-modal');
    
    if (!actionModal) {
        actionModal = document.createElement('div');
        actionModal.id = 'action-plan-modal';
        actionModal.className = 'modal';
        document.body.appendChild(actionModal);
    }
    
    // Create steps HTML
    const stepsHtml = actionPlan.steps.map((step, index) => `
        <div class="action-step">
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
                <p>${step}</p>
                <div class="step-controls">
                    <label><input type="checkbox"> Mark as complete</label>
                    <button class="btn-assign">Assign</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Set modal content
    actionModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${actionPlan.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="action-plan-info">
                    <p><strong>Prediction:</strong> ${prediction.message}</p>
                    <p><strong>Recommended Timeframe:</strong> ${actionPlan.timeframe}</p>
                </div>
                <div class="action-steps">
                    <h4>Action Steps</h4>
                    ${stepsHtml}
                </div>
                <div class="action-notes">
                    <h4>Notes</h4>
                    <textarea placeholder="Add notes about this action plan..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-save-plan">Save Plan</button>
                <button class="btn-print-plan">Print</button>
            </div>
        </div>
    `;
    
    // Show modal
    actionModal.style.display = 'flex';
    
    // Add event listeners
    actionModal.querySelector('.modal-close').addEventListener('click', function() {
        actionModal.style.display = 'none';
    });
    
    actionModal.querySelector('.btn-save-plan').addEventListener('click', function() {
        // In a real app, this would save the plan to a database
        showNotification('Action plan saved successfully', 'success');
        actionModal.style.display = 'none';
    });
    
    actionModal.querySelector('.btn-print-plan').addEventListener('click', function() {
        // In a real app, this would open a print dialog
        window.print();
    });
    
    // Add assign functionality
    const assignButtons = actionModal.querySelectorAll('.btn-assign');
    assignButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepElement = this.closest('.action-step');
            const stepText = stepElement.querySelector('p').textContent;
            showAssignmentDialog(stepText);
        });
    });
    
    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === actionModal) {
            actionModal.style.display = 'none';
        }
    });
}

// Show assignment dialog for action steps
function showAssignmentDialog(stepText) {
    // Create small dialog for assignment
    let assignDialog = document.getElementById('assign-dialog');
    
    if (!assignDialog) {
        assignDialog = document.createElement('div');
        assignDialog.id = 'assign-dialog';
        assignDialog.className = 'dialog';
        document.body.appendChild(assignDialog);
    }
    
    // Set dialog content
    assignDialog.innerHTML = `
        <div class="dialog-content">
            <h4>Assign Task</h4>
            <p><strong>Task:</strong> ${stepText}</p>
            <div class="form-group">
                <label>Assign to:</label>
                <select>
                    <option>John Smith (Field Manager)</option>
                    <option>Maria Garcia (Agronomist)</option>
                    <option>Robert Johnson (Technician)</option>
                    <option>Custom...</option>
                </select>
            </div>
            <div class="form-group">
                <label>Due date:</label>
                <input type="date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Priority:</label>
                <div class="priority-options">
                    <label><input type="radio" name="priority" value="low"> Low</label>
                    <label><input type="radio" name="priority" value="medium" checked> Medium</label>
                    <label><input type="radio" name="priority" value="high"> High</label>
                </div>
            </div>
            <div class="dialog-actions">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm">Assign Task</button>
            </div>
        </div>
    `;
    
    // Position the dialog in the center
    assignDialog.style.display = 'flex';
    
    // Add event listeners
    assignDialog.querySelector('.btn-cancel').addEventListener('click', function() {
        assignDialog.style.display = 'none';
    });
    
    assignDialog.querySelector('.btn-confirm').addEventListener('click', function() {
        // Get assignment details
        const assignee = assignDialog.querySelector('select').value;
        const dueDate = assignDialog.querySelector('input[type="date"]').value;
        const priority = assignDialog.querySelector('input[name="priority"]:checked').value;
        
        // In a real app, this would send an assignment notification
        showNotification(`Task assigned to ${assignee} with ${priority} priority`, 'success');
        
        // Close the dialog
        assignDialog.style.display = 'none';
    });
    
    // Add click outside to close
    document.addEventListener('click', function closeDialog(event) {
        if (!assignDialog.contains(event.target) && event.target !== assignDialog) {
            assignDialog.style.display = 'none';
            document.removeEventListener('click', closeDialog);
        }
    });
}

// Configure and start data simulations
function startDataSimulation() {
    console.log("Starting data simulation...");
    
    // Simulate real-time updates to sensor data
    startSensorDataSimulation();
    
    // Simulate automatic anomaly detection
    startAnomalySimulation();
}

// Start field-specific data simulation
function startFieldSpecificDataSimulation(fieldId) {
    console.log(`Starting simulation for field: ${fieldId}`);
    
    // Clear any existing interval
    if (sensorDataInterval) {
        clearInterval(sensorDataInterval);
    }
    
    // Set up simulation interval for the selected field
    sensorDataInterval = setInterval(() => {
        if (!currentFieldData) return;
        
        // Simulate real-time sensor updates with small variations
        currentFieldData.sensors.forEach(sensor => {
            // Add small random fluctuations to sensor readings
            sensor.moisture += (Math.random() - 0.5) * 1;
            sensor.moisture = Math.max(20, Math.min(50, sensor.moisture));
            
            sensor.ph += (Math.random() - 0.5) * 0.05;
            sensor.ph = Math.max(5.0, Math.min(8.0, sensor.ph));
            
            sensor.temperature += (Math.random() - 0.5) * 0.3;
            sensor.temperature = Math.max(15, Math.min(30, sensor.temperature));
        });
        
        // Update sensor map with new data
        updateSensorMap(currentFieldData);
        
    }, 10000); // Update every 10 seconds
}

// Simulate sensor data updates
function startSensorDataSimulation() {
    // This would be replaced by real-time API calls in a production app
    setInterval(() => {
        if (!currentFieldData || !document.querySelector('.sensor-point')) return;
        
        // Randomly select a sensor to update
        const sensorPoints = document.querySelectorAll('.sensor-point');
        const randomSensor = sensorPoints[Math.floor(Math.random() * sensorPoints.length)];
        
        if (randomSensor) {
            // Add a visual pulse effect to show real-time update
            randomSensor.classList.add('pulse');
            setTimeout(() => randomSensor.classList.remove('pulse'), 1000);
        }
    }, 8000); // Show an update approximately every 8 seconds
}

// Simulate occasional anomalies
function startAnomalySimulation() {
    setInterval(() => {
        // Only simulate anomalies occasionally (10% chance)
        if (Math.random() < 0.1 && currentFieldData) {
            const anomalyTypes = [
                {
                    id: 'sudden-moisture-drop',
                    message: 'Sudden drop in moisture detected in east sector',
                    recommendation: 'Check irrigation system in east sector for potential malfunctions'
                },
                {
                    id: 'ph-spike',
                    message: 'Unusual pH spike detected in north-west corner',
                    recommendation: 'Investigate recent soil amendments or fertilizer application in// filepath: c:\Users\shobi\Downloads\summit\js\dashboard1.js
// ...existing code...
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h3>7-Day Temperature & Precipitation Forecast</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="forecast-chart-container">
                <canvas id="forecast-chart"></canvas>
            </div>
            <div class="forecast-details">
                <div class="forecast-info">
                    <h4>Field Conditions</h4>
                    <p>Based on the forecast, optimal irrigation days: <strong>${getForecastIrrigationDays(precipProbability)}</strong></p>
                    <p>Expected soil temperature trend: <strong>${getForecastTempTrend(forecastTemps)}</strong></p>
                </div>
                <div class="forecast-actions">
                    <h4>Recommended Actions</h4>
                    <ul class="forecast-action-list">
                        ${generateForecastActions(forecastTemps, precipProbability)}
                    </ul>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn export-forecast">Export Forecast</button>
            <button class="btn schedule-irrigation">Schedule Irrigation</button>
        </div>
    </div>
`;

// Show modal
modal.style.display = 'flex';

// Add event listeners
modal.querySelector('.modal-close').addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Export forecast button
modal.querySelector('.export-forecast').addEventListener('click', function() {
    exportForecastData(forecastDays, forecastTemps, precipProbability);
});

// Schedule irrigation button
modal.querySelector('.schedule-irrigation').addEventListener('click', function() {
    showIrrigationScheduler(forecastDays, precipProbability);
});

// Create forecast chart
setTimeout(() => {
    createForecastChart(forecastDays, forecastTemps, precipProbability);
}, 100);
}

// Helper functions for the forecast modal
function getForecastIrrigationDays(precipProbability) {
    // Find days with low precipitation probability (good for irrigation)
    const goodDays = precipProbability.map((prob, index) => 
        prob < 30 ? index : -1).filter(day => day !== -1);
    
    if (goodDays.length === 0) return "None (all days show precipitation)";
    
    // Convert to day names
    const today = new Date();
    return goodDays.map(dayIndex => {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + dayIndex);
        return forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
    }).join(', ');
}

function getForecastTempTrend(temperatures) {
    // Analyze the temperature trend
    const firstHalf = temperatures.slice(0, 3);
    const secondHalf = temperatures.slice(-3);
    
    const firstAvg = firstHalf.reduce((sum, temp) => sum + temp, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, temp) => sum + temp, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 1.5) return "Warming trend";
    if (diff < -1.5) return "Cooling trend";
    return "Stable temperatures";
}

function generateForecastActions(temperatures, precipitation) {
    const actions = [];
    
    // Check for high temperatures
    if (temperatures.some(temp => temp > 28)) {
        actions.push("Consider additional irrigation due to high temperatures forecasted");
    }
    
    // Check for precipitation
    const highPrecipDays = precipitation.filter(prob => prob > 60).length;
    if (highPrecipDays > 2) {
        actions.push("Monitor field drainage with heavy precipitation expected");
    } else if (precipitation.every(prob => prob < 30)) {
        actions.push("Plan irrigation schedule with dry conditions expected");
    }
    
    // Check temperature fluctuations
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    if (maxTemp - minTemp > 8) {
        actions.push("Be aware of significant temperature fluctuations that may affect crop development");
    }
    
    // If no specific actions, add a general recommendation
    if (actions.length === 0) {
        actions.push("Maintain regular monitoring schedule, no critical issues in forecast");
    }
    
    return actions.map(action => `<li><i class="fas fa-check-circle"></i> ${action}</li>`).join('');
}

function createForecastChart(days, temperatures, precipitation) {
    const ctx = document.getElementById('forecast-chart');
    if (!ctx) return;
    
    // Create chart with two Y axes: temperature and precipitation probability
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    backgroundColor: 'rgba(249, 119, 148, 0.6)',
                    borderColor: 'rgba(249, 119, 148, 1)',
                    borderWidth: 1,
                    type: 'line',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y',
                    pointBackgroundColor: 'rgba(249, 119, 148, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Precipitation Probability (%)',
                    data: precipitation,
                    backgroundColor: function(context) {
                        const value = context.raw;
                        return value < 30
                            ? 'rgba(46, 204, 113, 0.5)'  // Low chance - green
                            : value < 60
                                ? 'rgba(243, 156, 18, 0.5)'  // Medium chance - orange
                                : 'rgba(231, 76, 60, 0.5)';  // High chance - red
                    },
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Precipitation Probability (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Show irrigation scheduler popup
function showIrrigationScheduler(forecastDays, precipProbability) {
    // Create or get existing modal
    let schedulerModal = document.getElementById('irrigation-scheduler-modal');
    
    if (!schedulerModal) {
        schedulerModal = document.createElement('div');
        schedulerModal.id = 'irrigation-scheduler-modal';
        schedulerModal.className = 'modal';
        document.body.appendChild(schedulerModal);
    }
    
    // Create checkboxes for each day, with recommended days pre-checked
    const checkboxes = forecastDays.map((day, index) => {
        const isRecommended = precipProbability[index] < 30;
        return `
            <div class="scheduler-day ${isRecommended ? 'recommended' : ''}">
                <label>
                    <input type="checkbox" name="irrigation-day" value="${index}" ${isRecommended ? 'checked' : ''}>
                    <span>${day}</span>
                    ${isRecommended ? '<span class="recommended-tag">Recommended</span>' : ''}
                    <span class="precip-indicator">${precipProbability[index]}% precipitation</span>
                </label>
            </div>
        `;
    }).join('');
    
    // Set modal content
    schedulerModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Schedule Irrigation</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p class="scheduler-info">Select days to schedule automatic irrigation based on weather forecast:</p>
                <div class="scheduler-days">
                    ${checkboxes}
                </div>
                <div class="irrigation-options">
                    <h4>Irrigation Settings</h4>
                    <div class="option-row">
                        <label>Duration: 
                            <select name="irrigation-duration">
                                <option value="30">30 minutes</option>
                                <option value="60" selected>1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2 hours</option>
                            </select>
                        </label>
                        <label>Start time: 
                            <select name="irrigation-time">
                                <option value="5">5:00 AM</option>
                                <option value="6" selected>6:00 AM</option>
                                <option value="7">7:00 AM</option>
                                <option value="18">6:00 PM</option>
                                <option value="19">7:00 PM</option>
                            </select>
                        </label>
                    </div>
                    <div class="option-row">
                        <label>
                            <input type="checkbox" name="auto-adjust" checked>
                            Auto-adjust based on soil moisture readings
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn cancel-irrigation">Cancel</button>
                <button class="btn confirm-irrigation">Confirm Schedule</button>
            </div>
        </div>
    `;
    
    // Show modal
    schedulerModal.style.display = 'flex';
    
    // Add event listeners
    schedulerModal.querySelector('.modal-close').addEventListener('click', function() {
        schedulerModal.style.display = 'none';
    });
    
    schedulerModal.querySelector('.cancel-irrigation').addEventListener('click', function() {
        schedulerModal.style.display = 'none';
    });
    
    schedulerModal.querySelector('.confirm-irrigation').addEventListener('click', function() {
        // Get selected days
        const selectedDays = Array.from(schedulerModal.querySelectorAll('input[name="irrigation-day"]:checked'))
            .map(checkbox => parseInt(checkbox.value));
        
        // Get irrigation settings
        const duration = schedulerModal.querySelector('select[name="irrigation-duration"]').value;
        const startTime = schedulerModal.querySelector('select[name="irrigation-time"]').value;
        const autoAdjust = schedulerModal.querySelector('input[name="auto-adjust"]').checked;
        
        // In a real app, this would send the schedule to a server
        // For the demo, just show a confirmation
        schedulerModal.style.display = 'none';
        
        // Show success notification
        showNotification(`Irrigation scheduled for ${selectedDays.length} days with ${duration} min duration`, 'success');
        
        // Close the forecast modal too
        document.getElementById('forecast-modal').style.display = 'none';
        
        // Log the action
        logUserAction('irrigation_scheduled', {
            days: selectedDays.map(index => forecastDays[index]),
            duration,
            startTime,
            autoAdjust
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === schedulerModal) {
            schedulerModal.style.display = 'none';
        }
    });
}

// Export forecast data to CSV
function exportForecastData(days, temperatures, precipitation) {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Temperature (°C),Precipitation Probability (%)\n";
    
    // Add data rows
    days.forEach((day, index) => {
        csvContent += `${day},${temperatures[index]},${precipitation[index]}\n`;
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `weather_forecast_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    showNotification("Forecast data exported successfully", "success");
}

// Export analysis to PDF (in real app would use a PDF library)
function exportAnalysis(day, value, dataType, analysis, recommendation) {
    // In a real application, this would generate a PDF
    // For demo purposes, we'll just create a text file
    
    const analysisText = `
AgriSense Soil Analysis Report
==============================
Date: ${new Date().toDateString()}
Day analyzed: ${day}
Measurement type: ${dataType === 'moisture' ? 'Soil Moisture' : 'Soil pH'}
Value: ${value}${dataType === 'moisture' ? '%' : ''}

Analysis:
${analysis}

Recommendation:
${recommendation}

Generated by AgriSense Dashboard
    `.trim();
    
    // Create blob and download
    const blob = new Blob([analysisText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataType}_analysis_${day.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    showNotification(`Analysis report exported successfully`, 'success');
}

// Show notifications
function showNotification(message, type = 'info') {
    // Get or create notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        default:
            icon = 'fa-info-circle';
    }
    
    // Set notification content
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="notification-message">${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add event listener for close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('closing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after a delay
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
    
    // Track notification count for analytics
    notificationCount++;
}

// Initialize anomaly detection system
function initializeAnomalyDetection() {
    // In a real app, this would set up more sophisticated detection logic
    console.log("Initializing anomaly detection system...");
    
    // Set up periodic checks for anomalies
    setInterval(() => {
        if (!currentFieldData || !anomalyDetectionEnabled) return;
        
        // Check for critical anomalies in latest data
        const anomalies = findAnomalies(currentFieldData);
        
        // Show alerts for critical anomalies
        if (anomalies.length > 0) {
            anomalies.forEach(anomaly => {
                showNotification(`Anomaly detected: ${anomaly.message}`, 'warning');
                createActionRecommendation(`anomaly-${anomaly.id}`, anomaly.recommendation);
            });
        }
    }, 60000); // Check every minute
}

// Initialize predictive analytics system
function initializePredictiveAnalytics() {
    console.log("Initializing predictive analytics...");
    
    // Simulate generating periodic predictions
    setInterval(() => {
        if (!currentFieldData) return;
        
        // In a real app, this would use machine learning models to generate predictions
        // For now, just simulate with random predictions occasionally
        if (Math.random() < 0.1) { // 10% chance to show a prediction
            generatePrediction();
        }
    }, 120000); // Check every 2 minutes
}

// Find anomalies in current field data
function findAnomalies(fieldData) {
    const anomalies = [];
    
    // Check for rapid moisture changes
    if (fieldData.moistureHistory && fieldData.moistureHistory.length >= 3) {
        const lastThree = fieldData.moistureHistory.slice(-3);
        const diff = lastThree[2] - lastThree[0];
        
        if (Math.abs(diff) > 5) {
            anomalies.push({
                id: 'rapid-moisture-change',
                message: `Rapid moisture change detected (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)`,
                recommendation: `Investigate sudden ${diff > 0 ? 'increase' : 'decrease'} in soil moisture. ${diff > 0 ? 'Check for irrigation issues or leaks.' : 'Check for drainage issues or sensor malfunction.'}`
            });
        }
    }
    
    // Check for pH drift
    if (fieldData.phHistory && fieldData.phHistory.length >= 5) {
        const startAvg = (fieldData.phHistory[0] + fieldData.phHistory[1]) / 2;
        const endAvg = (fieldData.phHistory[fieldData.phHistory.length - 1] + fieldData.phHistory[fieldData.phHistory.length - 2]) / 2;
        const phDrift = endAvg - startAvg;
        
        if (Math.abs(phDrift) > 0.3) {
            anomalies.push({
                id: 'ph-drift',
                message: `pH drifting ${phDrift > 0 ? 'up' : 'down'} (${phDrift.toFixed(2)} change)`,
                recommendation: `Monitor pH drift and consider ${phDrift > 0 ? 'acidifying amendments' : 'applying lime'} if trend continues.`
            });
        }
    }
    
    return anomalies;
}

// Generate a prediction based on current data
function generatePrediction() {
    if (!currentFieldData) return;
    
    // Get current field type from name
    const fieldName = currentFieldData.displayName || '';
    const cropType = fieldName.match(/\((.*?)\)/)?.[1].toLowerCase() || 'crop';
    
    // Simulate different types of predictions
    const predictionTypes = [
        {
            id: 'moisture-forecast',
            title: 'Moisture Trend Prediction',
            message: `Based on current trends and weather forecast, soil moisture is predicted to ${Math.random() > 0.5 ? 'decrease by 3-5%' : 'increase by 2-4%'} over the next 48 hours.`,
            actionable: true
        },
        {
            id: 'yield-impact',
            title: 'Yield Impact Analysis',
            message: `Current soil conditions suggest a potential ${Math.random() > 0.7 ? 'negative' : 'positive'} impact of ${Math.floor(Math.random() * 10) + 1}% on ${cropType} yield compared to last season.`,
            actionable: Math.random() > 0.5
        },
        {
            id: 'nutrient-depletion',
            title: 'Nutrient Depletion Alert',
            message: `${['Nitrogen', 'Phosphorus', 'Potassium'][Math.floor(Math.random() * 3)]} levels projected to reach deficiency threshold within ${Math.floor(Math.random() * 20) + 10} days based on current uptake rate.`,
            actionable: true
        }
    ];
    
    // Select a random prediction type
    const prediction = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];
    
    // Show the prediction
    showPredictionAlert(prediction);
}

// Show prediction alert
function showPredictionAlert(prediction) {
    // Create or get existing predictions panel
    let predictionsPanel = document.querySelector('.predictions-panel');
    
    if (!predictionsPanel) {
        predictionsPanel = document.createElement('div');
        predictionsPanel.className = 'predictions-panel';
        
        const panelHeader = document.createElement('div');
        panelHeader.className = 'predictions-header';
        panelHeader.innerHTML = `
            <h3><i class="fas fa-chart-line"></i> Predictive Insights</h3>
            <button class="predictions-toggle"><i class="fas fa-chevron-down"></i></button>
        `;
        
        predictionsPanel.appendChild(panelHeader);
        
        const panelBody = document.createElement('div');
        panelBody.className = 'predictions-body';
        predictionsPanel.appendChild(panelBody);
        
        // Add to page
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            dashboardContent.appendChild(predictionsPanel);
        } else {
            document.body.appendChild(predictionsPanel);
        }
        
        // Add toggle functionality
        panelHeader.querySelector('.predictions-toggle').addEventListener('click', function() {
            predictionsPanel.classList.toggle('collapsed');
            this.innerHTML = predictionsPanel.classList.contains('collapsed') 
                ? '<i class="fas fa-chevron-up"></i>' 
                : '<i class="fas fa-chevron-down"></i>';
        });
    }
    
    // Add the prediction to the panel
    const predictionsBody = predictionsPanel.querySelector('.predictions-body');
    
    const predictionItem = document.createElement('div');
    predictionItem.className = 'prediction-item';
    predictionItem.innerHTML = `
        <div class="prediction-header">
            <h4>${prediction.title}</h4>
            <span class="prediction-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <p>${prediction.message}</p>
        ${prediction.actionable ? '<button class="btn-take-action">Take Action</button>' : ''}
        <button class="btn-dismiss-prediction"><i class="fas fa-times"></i></button>
    `;
    
    // Add to predictions body
    predictionsBody.appendChild(predictionItem);
    
    // Make panel visible if it was hidden
    predictionsPanel.classList.remove('hidden');
    
    // Add event listeners
    if (prediction.actionable) {
        predictionItem.querySelector('.btn-take-action').addEventListener('click', function() {
            showActionPlan(prediction);
            predictionItem.classList.add('actioned');
            this.textContent = 'Action Planned';
            this.disabled = true;
        });
    }
    
    predictionItem.querySelector('.btn-dismiss-prediction').addEventListener('click', function() {
        predictionItem.classList.add('dismissed');
        setTimeout(() => {
            predictionItem.remove();
            
            // If no more predictions, hide the panel
            if (predictionsBody.children.length === 0) {
                predictionsPanel.classList.add('hidden');
            }
        }, 300);
    });
    
    // Highlight the panel to get attention
    predictionsPanel.classList.add('highlight');
    setTimeout(() => {
        predictionsPanel.classList.remove('highlight');
    }, 1000);
}

// Show action plan for a prediction
function showActionPlan(prediction) {
    // Generate action plan based on prediction type
    let actionPlan;
    
    switch (prediction.id) {
        case 'moisture-forecast':
            actionPlan = {
                title: "Moisture Management Plan",
                steps: [
                    "Adjust irrigation schedule based on forecast",
                    "Monitor soil moisture sensors at 4-hour intervals",
                    "Prepare contingency irrigation system if needed"
                ],
                timeframe: "Next 48 hours"
            };
            break;
        case 'yield-impact':
            actionPlan = {
                title: "Yield Optimization Plan",
                steps: [
                    "Conduct detailed soil nutrient analysis",
                    "Adjust fertilization schedule based on findings",
                    "Monitor crop development with increased frequency"
                ],
                timeframe: "Next 7-10 days"
            };
            break;
        case 'nutrient-depletion':
            actionPlan = {
                title: "Nutrient Management Plan",
                steps: [
                    "Apply supplementary fertilizer to targeted areas",
                    "Increase sampling frequency to track effectiveness",
                    "Analyze crop intake patterns for optimization"
                ],
                timeframe: "Next 5 days"
            };
            break;
        default:
            actionPlan = {
                title: "Response Plan",
                steps: [
                    "Analyze current field conditions in detail",
                    "Implement appropriate mitigation measures",
                    "Monitor effectiveness with increased frequency"
                ],
                timeframe: "Next 7 days"
            };
    }
    
    // Create action plan modal
    let actionModal = document.getElementById('action-plan-modal');
    
    if (!actionModal) {
        actionModal = document.createElement('div');
        actionModal.id = 'action-plan-modal';
        actionModal.className = 'modal';
        document.body.appendChild(actionModal);
    }
    
    // Create steps HTML
    const stepsHtml = actionPlan.steps.map((step, index) => `
        <div class="action-step">
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
                <p>${step}</p>
                <div class="step-controls">
                    <label><input type="checkbox"> Mark as complete</label>
                    <button class="btn-assign">Assign</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Set modal content
    actionModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${actionPlan.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="action-plan-info">
                    <p><strong>Prediction:</strong> ${prediction.message}</p>
                    <p><strong>Recommended Timeframe:</strong> ${actionPlan.timeframe}</p>
                </div>
                <div class="action-steps">
                    <h4>Action Steps</h4>
                    ${stepsHtml}
                </div>
                <div class="action-notes">
                    <h4>Notes</h4>
                    <textarea placeholder="Add notes about this action plan..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-save-plan">Save Plan</button>
                <button class="btn-print-plan">Print</button>
            </div>
        </div>
    `;
    
    // Show modal
    actionModal.style.display = 'flex';
    
    // Add event listeners
    actionModal.querySelector('.modal-close').addEventListener('click', function() {
        actionModal.style.display = 'none';
    });
    
    actionModal.querySelector('.btn-save-plan').addEventListener('click', function() {
        // In a real app, this would save the plan to a database
        showNotification('Action plan saved successfully', 'success');
        actionModal.style.display = 'none';
    });
    
    actionModal.querySelector('.btn-print-plan').addEventListener('click', function() {
        // In a real app, this would open a print dialog
        window.print();
    });
    
    // Add assign functionality
    const assignButtons = actionModal.querySelectorAll('.btn-assign');
    assignButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepElement = this.closest('.action-step');
            const stepText = stepElement.querySelector('p').textContent;
            showAssignmentDialog(stepText);
        });
    });
    
    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === actionModal) {
            actionModal.style.display = 'none';
        }
    });
}

// Show assignment dialog for action steps
function showAssignmentDialog(stepText) {
    // Create small dialog for assignment
    let assignDialog = document.getElementById('assign-dialog');
    
    if (!assignDialog) {
        assignDialog = document.createElement('div');
        assignDialog.id = 'assign-dialog';
        assignDialog.className = 'dialog';
        document.body.appendChild(assignDialog);
    }
    
    // Set dialog content
    assignDialog.innerHTML = `
        <div class="dialog-content">
            <h4>Assign Task</h4>
            <p><strong>Task:</strong> ${stepText}</p>
            <div class="form-group">
                <label>Assign to:</label>
                <select>
                    <option>John Smith (Field Manager)</option>
                    <option>Maria Garcia (Agronomist)</option>
                    <option>Robert Johnson (Technician)</option>
                    <option>Custom...</option>
                </select>
            </div>
            <div class="form-group">
                <label>Due date:</label>
                <input type="date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Priority:</label>
                <div class="priority-options">
                    <label><input type="radio" name="priority" value="low"> Low</label>
                    <label><input type="radio" name="priority" value="medium" checked> Medium</label>
                    <label><input type="radio" name="priority" value="high"> High</label>
                </div>
            </div>
            <div class="dialog-actions">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-confirm">Assign Task</button>
            </div>
        </div>
    `;
    
    // Position the dialog in the center
    assignDialog.style.display = 'flex';
    
    // Add event listeners
    assignDialog.querySelector('.btn-cancel').addEventListener('click', function() {
        assignDialog.style.display = 'none';
    });
    
    assignDialog.querySelector('.btn-confirm').addEventListener('click', function() {
        // Get assignment details
        const assignee = assignDialog.querySelector('select').value;
        const dueDate = assignDialog.querySelector('input[type="date"]').value;
        const priority = assignDialog.querySelector('input[name="priority"]:checked').value;
        
        // In a real app, this would send an assignment notification
        showNotification(`Task assigned to ${assignee} with ${priority} priority`, 'success');
        
        // Close the dialog
        assignDialog.style.display = 'none';
    });
    
    // Add click outside to close
    document.addEventListener('click', function closeDialog(event) {
        if (!assignDialog.contains(event.target) && event.target !== assignDialog) {
            assignDialog.style.display = 'none';
            document.removeEventListener('click', closeDialog);
        }
    });
}

// Configure and start data simulations
function startDataSimulation() {
    console.log("Starting data simulation...");
    
    // Simulate real-time updates to sensor data
    startSensorDataSimulation();
    
    // Simulate automatic anomaly detection
    startAnomalySimulation();
}

// Start field-specific data simulation
function startFieldSpecificDataSimulation(fieldId) {
    console.log(`Starting simulation for field: ${fieldId}`);
    
    // Clear any existing interval
    if (sensorDataInterval) {
        clearInterval(sensorDataInterval);
    }
    
    // Set up simulation interval for the selected field
    sensorDataInterval = setInterval(() => {
        if (!currentFieldData) return;
        
        // Simulate real-time sensor updates with small variations
        currentFieldData.sensors.forEach(sensor => {
            // Add small random fluctuations to sensor readings
            sensor.moisture += (Math.random() - 0.5) * 1;
            sensor.moisture = Math.max(20, Math.min(50, sensor.moisture));
            
            sensor.ph += (Math.random() - 0.5) * 0.05;
            sensor.ph = Math.max(5.0, Math.min(8.0, sensor.ph));
            
            sensor.temperature += (Math.random() - 0.5) * 0.3;
            sensor.temperature = Math.max(15, Math.min(30, sensor.temperature));
        });
        
        // Update sensor map with new data
        updateSensorMap(currentFieldData);
        
    }, 10000); // Update every 10 seconds
}

// Simulate sensor data updates
function startSensorDataSimulation() {
    // This would be replaced by real-time API calls in a production app
    setInterval(() => {
        if (!currentFieldData || !document.querySelector('.sensor-point')) return;
        
        // Randomly select a sensor to update
        const sensorPoints = document.querySelectorAll('.sensor-point');
        const randomSensor = sensorPoints[Math.floor(Math.random() * sensorPoints.length)];
        
        if (randomSensor) {
            // Add a visual pulse effect to show real-time update
            randomSensor.classList.add('pulse');
            setTimeout(() => randomSensor.classList.remove('pulse'), 1000);
        }
    }, 8000); // Show an update approximately every 8 seconds
}

// Simulate occasional anomalies
function startAnomalySimulation() {
    setInterval(() => {
        // Only simulate anomalies occasionally (10% chance)
        if (Math.random() < 0.1 && currentFieldData) {
            const anomalyTypes = [
                {
                    id: 'sudden-moisture-drop',
                    message: 'Sudden drop in moisture detected in east sector',
                    recommendation: 'Check irrigation system in east sector for potential malfunctions'
                },
                {
                    id: 'ph-spike',
                    message: 'Unusual pH spike detected in north-west corner',
                    recommendation: 'Investigate recent soil amendments or fertilizer application in north-west area'
                },
                {
                    id: 'temperature-anomaly',
                    message: 'Temperature anomaly detected near sensor S2',
                    recommendation: 'Verify sensor calibration and check for localized heating effects'
                }
            ];

            const randomAnomaly = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
            
            // Show notification about anomaly
            if (anomalyDetectionEnabled) {
                showNotification(`Anomaly detected: ${randomAnomaly.message}`, 'warning');
                createActionRecommendation(`anomaly-${randomAnomaly.id}`, randomAnomaly.recommendation);
            }
        }
    }, 90000); // Check approximately every 1.5 minutes
}

function saveUserPreference(key, value) {
    try {
        const preferences = JSON.parse(localStorage.getItem('agriSensePreferences') || '{}');
        preferences[key] = value;
        localStorage.setItem('agriSensePreferences', JSON.stringify(preferences));
        console.log(`User preference saved: ${key} = ${value}`);
    } catch (error) {
        console.error('Failed to save preference:', error);
    }
}

function restoreUserPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('agriSensePreferences') || '{}');
        
        // Restore field selection
        if (preferences.selectedField) {
            const fieldSelect = document.getElementById('field-select');
            if (fieldSelect && fieldSelect.value !== preferences.selectedField) {
                fieldSelect.value = preferences.selectedField;
                updateDashboardData(preferences.selectedField);
            }
        }
        
        // Restore anomaly detection preference
        if (preferences.anomalyDetection !== undefined) {
            anomalyDetectionEnabled = preferences.anomalyDetection;
            const anomalyToggle = document.getElementById('anomaly-detection');
            if (anomalyToggle) {
                anomalyToggle.checked = anomalyDetectionEnabled;
            }
        }
        
        // Restore theme preference if available
        if (preferences.theme) {
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(preferences.theme);
        }
        
        console.log('User preferences restored:', preferences);
    } catch (error) {
        console.error('Failed to restore preferences:', error);
    }
}

// User action logging for analytics
function logUserAction(action, details) {
    // In a real application, this would send data to an analytics service
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        fieldId: currentFieldData ? currentFieldData.displayName : null
    };
    
    console.log('User action logged:', logEntry);
    
    // Store in session for demo purposes
    const actionLog = JSON.parse(sessionStorage.getItem('userActionLog') || '[]');
    actionLog.push(logEntry);
    sessionStorage.setItem('userActionLog', JSON.stringify(actionLog));
}

// Setup time range selector
function setupTimeRangeSelector() {
    const dateRange = document.getElementById('date-range');
    if (!dateRange) return;
    
    dateRange.addEventListener('change', function() {
        const selectedRange = this.value;
        logUserAction('time_range_changed', selectedRange);
        
        if (selectedRange === 'custom') {
            showCustomDateRangePicker();
        } else {
            dashboardState.timeRange = selectedRange;
            
            // Fetch and update data with new time range
            showLoadingState();
            fetchDashboardData(dashboardState.selectedField, dashboardState.timeRange)
                .then(updateDashboardUI)
                .catch(error => {
                    console.error('Error updating time range:', error);
                    hideLoadingState();
                    showNotification('Failed to update time range', 'error');
                });
        }
    });
}

// Show custom date range picker
function showCustomDateRangePicker() {
    // Create or get existing date picker modal
    let datePickerModal = document.getElementById('date-picker-modal');
    
    if (!datePickerModal) {
        datePickerModal = document.createElement('div');
        datePickerModal.id = 'date-picker-modal';
        datePickerModal.className = 'modal';
        document.body.appendChild(datePickerModal);
    }
    
    // Get current date for max value
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    
    // Set default start date to 7 days ago
    const defaultStart = new Date();
    defaultStart.setDate(today.getDate() - 7);
    const startDate = defaultStart.toISOString().split('T')[0];
    
    // Set modal content
    datePickerModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Custom Date Range</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="date-range-form">
                    <div class="form-group">
                        <label for="start-date">Start Date:</label>
                        <input type="date" id="start-date" max="${currentDate}" value="${startDate}">
                    </div>
                    <div class="form-group">
                        <label for="end-date">End Date:</label>
                        <input type="date" id="end-date" max="${currentDate}" value="${currentDate}">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-apply">Apply Range</button>
            </div>
        </div>
    `;
    
    // Show modal
    datePickerModal.style.display = 'flex';
    
    // Add event listeners
    datePickerModal.querySelector('.modal-close').addEventListener('click', function() {
        datePickerModal.style.display = 'none';
        // Reset select to previous value
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.value = dashboardState.timeRange;
        }
    });
    
    datePickerModal.querySelector('.btn-cancel').addEventListener('click', function() {
        datePickerModal.style.display = 'none';
        // Reset select to previous value
        const dateRange = document.getElementById('date-range');
        if (dateRange) {
            dateRange.value = dashboardState.timeRange;
        }
    });
    
    datePickerModal.querySelector('.btn-apply').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        // Validate date range
        if (startDate > endDate) {
            showNotification('Start date cannot be after end date', 'error');
            return;
        }
        
        // Apply custom range
        dashboardState.timeRange = 'custom';
        dashboardState.customDateRange = { startDate, endDate };
        
        // Fetch and update data with custom range
        showLoadingState();
        fetchDashboardDataWithCustomRange(dashboardState.selectedField, startDate, endDate)
            .then(updateDashboardUI)
            .catch(error => {
                console.error('Error applying custom date range:', error);
                hideLoadingState();
                showNotification('Failed to apply custom date range', 'error');
            });
        
        // Close modal
        datePickerModal.style.display = 'none';
        
        // Update custom range display
        const dateRangeDisplay = document.querySelector('.date-range-display');
        if (dateRangeDisplay) {
            const formattedStart = new Date(startDate).toLocaleDateString();
            const formattedEnd = new Date(endDate).toLocaleDateString();
            dateRangeDisplay.textContent = `${formattedStart} - ${formattedEnd}`;
        }
        
        // Log the action
        logUserAction('custom_date_range', { startDate, endDate });
    });
    
    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === datePickerModal) {
            datePickerModal.style.display = 'none';
            // Reset select to previous value
            const dateRange = document.getElementById('date-range');
            if (dateRange) {
                dateRange.value = dashboardState.timeRange;
            }
        }
    });
}

// Fetch data with custom date range
async function fetchDashboardDataWithCustomRange(fieldId, startDate, endDate) {
    // In a real application, this would make an API call with date parameters
    // For demo, we'll simulate with mock data
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get standard field data as a base
    const fieldData = getFieldData(fieldId);
    
    // Adjust data to represent the custom range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Generate labels for the custom range
    fieldData.labels = Array.from({ length: dayCount }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Generate custom historical data
    fieldData.moistureHistory = generateTrendingDataForRange(
        parseInt(fieldData.moisture),
        dayCount,
        5,
        25,
        50
    );
    
    fieldData.phHistory = generateTrendingDataForRange(
        parseFloat(fieldData.ph),
        dayCount,
        0.3,
        5.0,
        8.0
    );
    
    fieldData.temperatureHistory = generateTrendingDataForRange(
        parseInt(fieldData.temperature),
        dayCount,
        2,
        15,
        30
    );
    
    // Update last refresh time
    dashboardState.lastRefreshed = new Date();
    
    // Return the modified data
    return fieldData;
}

// Generate realistic trending data for a specific range
function generateTrendingDataForRange(currentValue, count, maxFluctuation, min, max) {
    // Similar to generateTrendingData but optimized for custom ranges
    const result = [];
    let value = currentValue;
    
    // Create a semi-realistic pattern with seasonality
    for (let i = 0; i < count; i++) {
        // Add seasonal component (subtle sine wave)
        const seasonalComponent = Math.sin(i / (count/2) * Math.PI) * maxFluctuation * 0.5;
        
        // Add random noise
        const noise = (Math.random() - 0.5) * maxFluctuation;
        
        // Combine components
        value = currentValue + seasonalComponent + noise;
        
        // Ensure within bounds
        value = Math.max(min, Math.min(max, value));
        
        // Add to result with appropriate precision
        if (Number.isInteger(currentValue)) {
            result.push(Math.round(value));
        } else {
            result.push(Number(value.toFixed(1)));
        }
    }
    
    return result;
}

// Export feature
function setupExportButton() {
    const exportBtn = document.getElementById('export-data');
    if (!exportBtn) return;
    
    exportBtn.addEventListener('click', function() {
        if (!currentFieldData) {
            showNotification('No data to export', 'warning');
            return;
        }
        
        // Show export options dialog
        showExportOptionsDialog();
    });
}

// Show export options dialog
function showExportOptionsDialog() {
    // Create or get existing dialog
    let exportDialog = document.getElementById('export-dialog');
    
    if (!exportDialog) {
        exportDialog = document.createElement('div');
        exportDialog.id = 'export-dialog';
        exportDialog.className = 'dialog';
        document.body.appendChild(exportDialog);
    }
    
    // Set dialog content
    exportDialog.innerHTML = `
        <div class="dialog-content">
            <h4>Export Field Data</h4>
            <p>Choose what data to export from ${currentFieldData.displayName}</p>
            <div class="export-options">
                <label><input type="checkbox" name="export-moisture" checked> Moisture History</label>
                <label><input type="checkbox" name="export-ph" checked> pH History</label>
                <label><input type="checkbox" name="export-temperature" checked> Temperature History</label>
                <label><input type="checkbox" name="export-nutrients"> Nutrient Levels</label>
                <label><input type="checkbox" name="export-sensors"> Sensor Readings</label>
            </div>
            <div class="export-format">
                <label>Format:</label>
                <select name="export-format">
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="excel">Excel</option>
                </select>
            </div>
            <div class="dialog-actions">
                <button class="btn-cancel">Cancel</button>
                <button class="btn-export">Export</button>
            </div>
        </div>
    `;
    
    // Show dialog
    exportDialog.style.display = 'flex';
    
    // Add event listeners
    exportDialog.querySelector('.btn-cancel').addEventListener('click', function() {
        exportDialog.style.display = 'none';
    });
    
    exportDialog.querySelector('.btn-export').addEventListener('click', function() {
        // Get selected options
        const options = {
            moisture: exportDialog.querySelector('input[name="export-moisture"]').checked,
            ph: exportDialog.querySelector('input[name="export-ph"]').checked,
            temperature: exportDialog.querySelector('input[name="export-temperature"]').checked,
            nutrients: exportDialog.querySelector('input[name="export-nutrients"]').checked,
            sensors: exportDialog.querySelector('input[name="export-sensors"]').checked,
            format: exportDialog.querySelector('select[name="export-format"]').value
        };
        
        // Perform export
        exportDashboardData(options);
        
        // Close dialog
        exportDialog.style.display = 'none';
    });
    
    // Add click outside to close
    document.addEventListener('click', function closeExportDialog(event) {
        if (!exportDialog.contains(event.target) && event.target !== exportDialog) {
            exportDialog.style.display = 'none';
            document.removeEventListener('click', closeExportDialog);
        }
    });
}

// Export dashboard data based on selected options
function exportDashboardData(options) {
    if (!currentFieldData) return;
    
    // Log the export action
    logUserAction('data_export', options);
    
    // In a production app, this would generate the appropriate file format
    // For demo purposes, we'll just simulate a CSV export
    
    let exportContent = "";
    let filename = "";
    
    // Generate content based on format
    if (options.format === 'csv') {
        // Create CSV header
        let header = "Date";
        if (options.moisture) header += ",Moisture (%)";
        if (options.ph) header += ",pH";
        if (options.temperature) header += ",Temperature (°C)";
        
        exportContent = header + "\n";
        
        // Add data rows
        currentFieldData.labels.forEach((date, i) => {
            let row = date;
            if (options.moisture) row += "," + currentFieldData.moistureHistory[i];
            if (options.ph) row += "," + currentFieldData.phHistory[i];
            if (options.temperature) row += "," + currentFieldData.temperatureHistory[i];
            exportContent += row + "\n";
        });
        
        filename = `agrisense_${currentFieldData.displayName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.csv`;
    } else {
        // For other formats, just show a notification
        showNotification(`Export to ${options.format.toUpperCase()} would be implemented in production`, 'info');
        return;
    }
    
    // Create and trigger download
    const blob = new Blob([exportContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success notification
    showNotification('Data exported successfully', 'success');
}

// Sensor hover effects
function setupSensorHovers() {
    const sensors = document.querySelectorAll('.sensor-point');
    
    sensors.forEach(sensor => {
        // Show sensor data on hover
        sensor.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        sensor.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
        
        // Click to show more detailed view
        sensor.addEventListener('click', function(e) {
            e.stopPropagation();
            showSensorDetailView(this);
        });
    });
}

// Show detailed view for a sensor
function showSensorDetailView(sensorElement) {
    // Get sensor id from tooltip
    const sensorId = sensorElement.querySelector('h4').textContent.replace('Sensor ', '');
    const moisture = sensorElement.querySelector('p:nth-child(2)').textContent.replace('Moisture: ', '');
    const ph = sensorElement.querySelector('p:nth-child(3)').textContent.replace('pH: ', '');
    const temperature = sensorElement.querySelector('p:nth-child(4)').textContent.replace('Temperature: ', '');
    
    // Create modal for detailed view
    let sensorModal = document.getElementById('sensor-detail-modal');
    
    if (!sensorModal) {
        sensorModal = document.createElement('div');
        sensorModal.id = 'sensor-detail-modal';
        sensorModal.className = 'modal';
        document.body.appendChild(sensorModal);
    }
    
    // Set modal content
    sensorModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Sensor ${sensorId} Details</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="sensor-readings">
                    <div class="sensor-reading moisture">
                        <div class="reading-icon"><i class="fas fa-tint"></i></div>
                        <div class="reading-value">${moisture}</div>
                        <div class="reading-label">Moisture</div>
                    </div>
                    <div class="sensor-reading ph">
                        <div class="reading-icon"><i class="fas fa-flask"></i></div>
                        <div class="reading-value">${ph}</div>
                        <div class="reading-label">pH</div>
                    </div>
                    <div class="sensor-reading temperature">
                        <div class="reading-icon"><i class="fas fa-thermometer-half"></i></div>
                        <div class="reading-value">${temperature}</div>
                        <div class="reading-label">Temperature</div>
                    </div>
                </div>
                <div class="sensor-history-charts">
                    <h4>24-Hour History</h4>
                    <canvas id="sensor-history-chart"></canvas>
                </div>
                <div class="sensor-status">
                    <h4>Sensor Status</h4>
                    <div class="status-item">
                        <span class="status-label">Battery:</span>
                        <span class="status-value good">87% <i class="fas fa-battery-three-quarters"></i></span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Signal Strength:</span>
                        <span class="status-value good">Excellent <i class="fas fa-signal"></i></span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Last Calibration:</span>
                        <span class="status-value">2025-01-15</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-sensor-history">View Full History</button>
                <button class="btn-sensor-calibrate">Calibrate Sensor</button>
            </div>
        </div>
    `;
    
    // Show modal
    sensorModal.style.display = 'flex';
    
    // Add event listeners
    sensorModal.querySelector('.modal-close').addEventListener('click', function() {
        sensorModal.style.display = 'none';
    });
    
    // Create sensor history chart
    setTimeout(() => {
        createSensorHistoryChart(sensorId);
    }, 100);
    
    // Close when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === sensorModal) {
            sensorModal.style.display = 'none';
        }
    });
    
    // Log the action
    logUserAction('sensor_detail_view', { sensorId });
}

// Setup advanced controls
function setupAdvancedControls() {
    // Add theme toggle
    addThemeToggle();
    
    // Add dashboard preferences toggle
    addDashboardPreferences();
}

// Add theme toggle
function addThemeToggle() {
    const dashboardActions = document.querySelector('.dashboard-header .dashboard-actions');
    if (!dashboardActions) return;
    
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = `
        <button class="btn-theme" title="Toggle Theme">
            <i class="fas fa-moon"></i>
        </button>
    `;
    
    dashboardActions.appendChild(themeToggle);
    
    // Add event listener
    themeToggle.querySelector('.btn-theme').addEventListener('click', function() {
        const isDarkMode = document.body.classList.contains('dark-theme');
        
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(isDarkMode ? 'light-theme' : 'dark-theme');
        
        this.innerHTML = isDarkMode ? 
            '<i class="fas fa-moon"></i>' : 
            '<i class="fas fa-sun"></i>';
        
        // Save preference
        saveUserPreference('theme', isDarkMode ? 'light-theme' : 'dark-theme');
    });
}

// Helper function for loading states
function showLoadingState() {
    // Create or get loading overlay
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-icon"></div>
                <div class="spinner-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.style.display = 'flex';
}

function hideLoadingState() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Helper function to create a sensor 24-hour history chart
function createSensorHistoryChart(sensorId) {
    const ctx = document.getElementById('sensor-history-chart');
    if (!ctx) return;
    
    // Generate hourly data for the last 24 hours
    const hours = [];
    const moistureData = [];
    const phData = [];
    const temperatureData = [];
    
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i);
        hours.push(hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Generate data with realistic patterns
        // For moisture - slight decrease during day, increase at night
        const timeEffect = Math.sin((hour.getHours() / 24) * Math.PI * 2) * 2;
        
        const baseMoisture = parseInt(currentFieldData ? currentFieldData.moisture : '35%');
        moistureData.push(Math.max(20, Math.min(50, baseMoisture + timeEffect + (Math.random() - 0.5) * 3)));
        
        // For pH - very subtle variations
        const basePh = parseFloat(currentFieldData ? currentFieldData.ph : '6.5');
        phData.push(Math.max(5.0, Math.min(8.0, basePh + (Math.random() - 0.5) * 0.2)));
        
        // For temperature - daily cycle
        const tempCycle = Math.sin((hour.getHours() / 24) * Math.PI * 2 + Math.PI) * 3;
        const baseTemp = parseInt(currentFieldData ? currentFieldData.temperature : '23°C');
        temperatureData.push(Math.max(15, Math.min(30, baseTemp + tempCycle + (Math.random() - 0.5))));
    }
    
    // Create chart with multiple y-axes
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'Moisture (%)',
                    data: moistureData,
                    borderColor: '#4FACFE',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y-moisture'
                },
                {
                    label: 'pH',
                    data: phData,
                    borderColor: '#FDA085',
                    backgroundColor: 'rgba(253, 160, 133, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y-ph'
                },
                {
                    label: 'Temperature (°C)',
                    data: temperatureData,
                    borderColor: '#F97794',
                    backgroundColor: 'rgba(249, 119, 148, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y-temperature'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: `Sensor ${sensorId} - 24-Hour History`,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                }
            },
            scales: {
                'y-moisture': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Moisture (%)'
                    },
                    min: 20,
                    max: 50
                },
                'y-ph': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'pH'
                    },
                    min: 5.0,
                    max: 8.0,
                    grid: {
                        drawOnChartArea: false
                    }
                },
                'y-temperature': {
                    type: 'linear',
                    display: false, // Hidden by default, can be toggled
                    min: 15,
                    max: 30
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Add dashboard preferences
function addDashboardPreferences() {
    // Create & add preferences button to dashboard header
    const dashboardActions = document.querySelector('.dashboard-header .dashboard-actions');
    if (!dashboardActions) return;
    
    const prefsButton = document.createElement('button');
    prefsButton.className = 'btn-preferences';
    prefsButton.innerHTML = '<i class="fas fa-cog"></i>';
    prefsButton.title = 'Dashboard Settings';
    
    dashboardActions.appendChild(prefsButton);
    
    // Add click handler to show preferences panel
    prefsButton.addEventListener('click', showPreferencesPanel);
}

// Show dashboard preferences panel
function showPreferencesPanel() {
    // Create or get preferences panel
    let prefsPanel = document.getElementById('preferences-panel');
    
    if (!prefsPanel) {
        prefsPanel = document.createElement('div');
        prefsPanel.id = 'preferences-panel';
        prefsPanel.className = 'side-panel';
        
        // Set panel content
        prefsPanel.innerHTML = `
            <div class="panel-header">
                <h3>Dashboard Settings</h3>
                <button class="panel-close">&times;</button>
            </div>
            <div class="panel-body">
                <div class="preference-section">
                    <h4>Display Settings</h4>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" id="pref-real-time" checked>
                            Enable real-time updates
                        </label>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" id="pref-anomaly-detection" checked>
                            Enable anomaly detection
                        </label>
                    </div>
                    <div class="preference-item">
                        <label>Chart Animation Speed:</label>
                        <select id="pref-animation-speed">
                            <option value="0">No Animation</option>
                            <option value="500">Fast</option>
                            <option value="1000" selected>Normal</option>
                            <option value="2000">Slow</option>
                        </select>
                    </div>
                </div>
                <div class="preference-section">
                    <h4>Notification Settings</h4>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" id="pref-notifications" checked>
                            Enable notifications
                        </label>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" id="pref-sound" checked>
                            Enable sound alerts
                        </label>
                    </div>
                    <div class="preference-item">
                        <label>Notification Duration:</label>
                        <select id="pref-notification-duration">
                            <option value="3000">3 seconds</option>
                            <option value="5000" selected>5 seconds</option>
                            <option value="10000">10 seconds</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="panel-footer">
                <button id="restore-defaults">Restore Defaults</button>
                <button id="save-preferences">Save Settings</button>
            </div>
        `;
        
        document.body.appendChild(prefsPanel);
        
        // Add event listeners
        prefsPanel.querySelector('.panel-close').addEventListener('click', function() {
            prefsPanel.classList.remove('open');
        });
        
        document.getElementById('save-preferences').addEventListener('click', function() {
            savePreferences();
            prefsPanel.classList.remove('open');
            showNotification('Preferences saved successfully', 'success');
        });
        
        document.getElementById('restore-defaults').addEventListener('click', function() {
            restoreDefaultPreferences();
        });
    }
    
    // Initialize preference values from current state
    document.getElementById('pref-real-time').checked = dashboardState.realTimeUpdates;
    document.getElementById('pref-anomaly-detection').checked = anomalyDetectionEnabled;
    
    // Show panel
    prefsPanel.classList.add('open');
}

// Save dashboard preferences
function savePreferences() {
    // Get preference values
    const realTimeUpdates = document.getElementById('pref-real-time').checked;
    const anomalyDetection = document.getElementById('pref-anomaly-detection').checked;
    const animationSpeed = document.getElementById('pref-animation-speed').value;
    const notificationsEnabled = document.getElementById('pref-notifications').checked;
    const soundEnabled = document.getElementById('pref-sound').checked;
    const notificationDuration = document.getElementById('pref-notification-duration').value;
    
    // Update dashboard state
    dashboardState.realTimeUpdates = realTimeUpdates;
    anomalyDetectionEnabled = anomalyDetection;
    
    // Save to local storage
    saveUserPreference('realTimeUpdates', realTimeUpdates);
    saveUserPreference('anomalyDetection', anomalyDetection);
    saveUserPreference('animationSpeed', animationSpeed);
    saveUserPreference('notificationsEnabled', notificationsEnabled);
    saveUserPreference('soundEnabled', soundEnabled);
    saveUserPreference('notificationDuration', notificationDuration);
    
    // Log action
    logUserAction('preferences_updated', {
        realTimeUpdates,
        anomalyDetection,
        animationSpeed,
        notificationsEnabled,
        soundEnabled,
        notificationDuration
    });
    
    // Apply changes
    if (realTimeUpdates) {
        startRealTimeUpdates();
    } else {
        stopRealTimeUpdates();
    }
}

// Stop real-time updates
function stopRealTimeUpdates() {
    if (dashboardState.chartUpdateInterval) {
        clearInterval(dashboardState.chartUpdateInterval);
        dashboardState.chartUpdateInterval = null;
    }
    
    if (sensorDataInterval) {
        clearInterval(sensorDataInterval);
        sensorDataInterval = null;
    }
    
    console.log('Real-time updates stopped');
}

// Restore default preferences
function restoreDefaultPreferences() {
    document.getElementById('pref-real-time').checked = true;
    document.getElementById('pref-anomaly-detection').checked = true;
    document.getElementById('pref-animation-speed').value = '1000';
    document.getElementById('pref-notifications').checked = true;
    document.getElementById('pref-sound').checked = true;
    document.getElementById('pref-notification-duration').value = '5000';
    
    showNotification('Default preferences restored', 'info');
}

// Render last updated time
function renderLastUpdatedTime() {
    const lastUpdatedElement = document.querySelector('.last-updated');
    if (lastUpdatedElement) {
        const time = dashboardState.lastRefreshed.toLocaleTimeString();
        lastUpdatedElement.textContent = `Last updated: ${time}`;
    }
}

// Show chart-specific loading state
function showChartLoadingState(chartId) {
    const chartContainer = document.getElementById(chartId).parentElement;
    
    // Add loading overlay
    let loadingOverlay = chartContainer.querySelector('.chart-loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'chart-loading-overlay';
        loadingOverlay.innerHTML = '<div class="spinner"></div>';
        chartContainer.appendChild(loadingOverlay);
    }
    
    loadingOverlay.style.display = 'flex';
}

// Hide chart-specific loading state
function hideChartLoadingState(chartId) {
    const chartContainer = document.getElementById(chartId).parentElement;
    const loadingOverlay = chartContainer.querySelector('.chart-loading-overlay');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Handle data errors gracefully
function handleDataError(error) {
    console.error('Data error:', error);
    hideLoadingState();
    showNotification('Failed to load dashboard data. Please try again.', 'error');
}