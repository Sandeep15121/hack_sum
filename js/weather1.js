// weather.js - AgriSense Weather Forecast Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initTemperatureChart();
    initRainfallChart();
    initWindChart();
    
    // Setup event listeners
    setupChartTabs();
    setupLocationChange();
    
    // Initialize weather icons based on conditions
    updateWeatherIcons();
});

// Chart initialization functions
function initTemperatureChart() {
    const ctx = document.getElementById('temperatureForecastChart').getContext('2d');
    
    const temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Today', 'Tomorrow', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                {
                    label: 'Max Temperature',
                    data: [32, 30, 29, 27, 25, 28, 30],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Min Temperature',
                    data: [22, 21, 22, 20, 19, 20, 21],
                    borderColor: '#4FACFE',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Average Temperature',
                    data: [27, 26, 25.5, 24, 22, 24, 25.5],
                    borderColor: '#8D67AB',
                    backgroundColor: 'rgba(141, 103, 171, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initRainfallChart() {
    const ctx = document.getElementById('rainfallForecastChart').getContext('2d');
    
    const rainfallChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Today', 'Tomorrow', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                {
                    label: 'Rainfall (mm)',
                    data: [0, 2, 5, 15, 25, 8, 3],
                    backgroundColor: [
                        'rgba(79, 172, 254, 0.6)',
                        'rgba(79, 172, 254, 0.6)',
                        'rgba(79, 172, 254, 0.6)',
                        'rgba(79, 172, 254, 0.8)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 0.6)',
                        'rgba(79, 172, 254, 0.6)'
                    ],
                    borderColor: [
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 1)',
                        'rgba(79, 172, 254, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Rainfall (mm)'
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initWindChart() {
    const ctx = document.getElementById('windForecastChart').getContext('2d');
    
    const windChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Today', 'Tomorrow', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                {
                    label: 'Wind Speed (km/h)',
                    data: [10, 12, 18, 15, 14, 8, 6],
                    borderColor: '#66BB6A',
                    backgroundColor: 'rgba(102, 187, 106, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Wind Speed (km/h)'
                    },
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Chart tab switching functionality
function setupChartTabs() {
    const chartTabs = document.querySelectorAll('.chart-tab');
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and containers
            chartTabs.forEach(t => t.classList.remove('active'));
            chartContainers.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Add active class to corresponding container
            const chartId = this.getAttribute('data-chart');
            document.getElementById(`${chartId}-chart-container`).classList.add('active');
        });
    });
}

// Location change functionality
function setupLocationChange() {
    const changeLocationBtn = document.getElementById('change-location');
    
    changeLocationBtn.addEventListener('click', function() {
        // In a real application, this would open a location selector modal
        // For this demo, we'll use a simple prompt
        const newLocation = prompt("Enter your farm location:", "Amritsar, Punjab");
        
        if (newLocation && newLocation.trim() !== '') {
            // Update location display
            document.getElementById('current-location').textContent = newLocation;
            
            // Simulate loading new weather data
            showLoadingIndicator();
            
            setTimeout(() => {
                // In a real app, this would fetch new weather data for the location
                // For demo, we'll just update with random variations
                updateWeatherData();
                hideLoadingIndicator();
            }, 1500);
        }
    });
}

// Update weather icons based on conditions
function updateWeatherIcons() {
    const forecastCards = document.querySelectorAll('.forecast-card');
    
    forecastCards.forEach(card => {
        const condition = card.querySelector('.forecast-condition').textContent.toLowerCase();
        const iconElement = card.querySelector('.forecast-icon i');
        
        // Clear existing classes
        iconElement.className = '';
        
        // Set appropriate icon class based on weather condition
        if (condition.includes('sunny')) {
            iconElement.className = 'fas fa-sun';
        } else if (condition.includes('partly cloudy')) {
            iconElement.className = 'fas fa-cloud-sun';
        } else if (condition.includes('cloudy')) {
            iconElement.className = 'fas fa-cloud';
        } else if (condition.includes('shower')) {
            iconElement.className = 'fas fa-cloud-sun-rain';
        } else if (condition.includes('rain')) {
            iconElement.className = 'fas fa-cloud-rain';
        } else if (condition.includes('thunder')) {
            iconElement.className = 'fas fa-bolt';
        } else if (condition.includes('snow')) {
            iconElement.className = 'fas fa-snowflake';
        } else if (condition.includes('fog') || condition.includes('mist')) {
            iconElement.className = 'fas fa-smog';
        } else {
            // Default icon
            iconElement.className = 'fas fa-cloud';
        }
    });
    
    // Update current weather icon
    const currentCondition = document.getElementById('weather-condition').textContent.toLowerCase();
    const currentIconElement = document.querySelector('.weather-now .weather-icon i');
    
    // Clear existing classes
    currentIconElement.className = '';
    
    // Set appropriate icon class based on current weather condition
    if (currentCondition.includes('sunny')) {
        currentIconElement.className = 'fas fa-sun';
    } else if (currentCondition.includes('partly cloudy')) {
        currentIconElement.className = 'fas fa-cloud-sun';
    } else if (currentCondition.includes('cloudy')) {
        currentIconElement.className = 'fas fa-cloud';
    } else if (currentCondition.includes('shower')) {
        currentIconElement.className = 'fas fa-cloud-sun-rain';
    } else if (currentCondition.includes('rain')) {
        currentIconElement.className = 'fas fa-cloud-rain';
    } else if (currentCondition.includes('thunder')) {
        currentIconElement.className = 'fas fa-bolt';
    } else if (currentCondition.includes('snow')) {
        currentIconElement.className = 'fas fa-snowflake';
    } else if (currentCondition.includes('fog') || currentCondition.includes('mist')) {
        currentIconElement.className = 'fas fa-smog';
    } else {
        // Default icon
        currentIconElement.className = 'fas fa-cloud';
    }
}

// Helper functions for updating weather data
function updateWeatherData() {
    // This would normally fetch data from a weather API
    // For demo purposes, we're just simulating some random changes
    
    // Update current temperature with small random variation
    const currentTemp = document.getElementById('current-temp');
    let tempValue = parseInt(currentTemp.textContent);
    tempValue = tempValue + (Math.random() > 0.5 ? 1 : -1);
    currentTemp.textContent = `${tempValue}°C`;
    
    // Update humidity
    const humidity = document.getElementById('humidity');
    let humidityValue = parseInt(humidity.textContent);
    humidityValue = Math.max(30, Math.min(90, humidityValue + Math.floor(Math.random() * 10) - 5));
    humidity.textContent = `${humidityValue}%`;
    
    // Update wind speed
    const windSpeed = document.getElementById('wind-speed');
    let windValue = parseInt(windSpeed.textContent);
    windValue = Math.max(0, Math.min(30, windValue + Math.floor(Math.random() * 6) - 3));
    windSpeed.textContent = `${windValue} km/h`;
    
    // Update precipitation
    const precipitation = document.getElementById('precipitation');
    let precipValue = parseInt(precipitation.textContent);
    precipValue = Math.max(0, Math.min(100, precipValue + Math.floor(Math.random() * 10) - 5));
    precipitation.textContent = `${precipValue}%`;
    
    // Update pressure
    const pressure = document.getElementById('pressure');
    let pressureValue = parseInt(pressure.textContent);
    pressureValue = Math.max(980, Math.min(1040, pressureValue + Math.floor(Math.random() * 10) - 5));
    pressure.textContent = `${pressureValue} hPa`;
    
    // Update agricultural impact messages based on new weather data
    updateAgriculturalImpacts(tempValue, humidityValue, precipValue, windValue);
}

function updateAgriculturalImpacts(temp, humidity, precip, wind) {
    const impactContainer = document.querySelector('.weather-impact');
    
    // Clear existing impact items
    while (impactContainer.children.length > 1) {
        impactContainer.removeChild(impactContainer.lastChild);
    }
    
    // Add new impact messages based on weather conditions
    
    // Temperature impacts
    if (temp > 30) {
        addImpactItem(impactContainer, 'warning', 'High temperature may stress crops. Consider additional irrigation.');
    } else if (temp < 15) {
        addImpactItem(impactContainer, 'warning', 'Low temperature may slow down growth. Monitor closely.');
    } else {
        addImpactItem(impactContainer, 'favorable', 'Temperature is in optimal range for most crops.');
    }
    
    // Precipitation impacts
    if (precip > 60) {
        addImpactItem(impactContainer, 'warning', 'High chance of rainfall. Delay fertilizer application.');
    } else if (precip < 10 && humidity < 40) {
        addImpactItem(impactContainer, 'warning', 'Dry conditions. Irrigation may be required.');
    } else if (precip < 30) {
        addImpactItem(impactContainer, 'favorable', 'Good conditions for spraying fertilizers today.');
    }
    
    // Wind impacts
    if (wind > 15) {
        addImpactItem(impactContainer, 'warning', 'High winds. Not advisable for spraying pesticides.');
    } else if (wind < 5 && humidity > 80) {
        addImpactItem(impactContainer, 'warning', 'Low wind and high humidity. Watch for fungal diseases.');
    }
}

function addImpactItem(container, type, message) {
    const impactItem = document.createElement('div');
    impactItem.className = `impact-item ${type}`;
    
    const impactIcon = document.createElement('div');
    impactIcon.className = 'impact-icon';
    
    const icon = document.createElement('i');
    icon.className = type === 'favorable' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    
    impactIcon.appendChild(icon);
    
    const impactText = document.createElement('div');
    impactText.className = 'impact-text';
    
    const span = document.createElement('span');
    span.textContent = message;
    
    impactText.appendChild(span);
    
    impactItem.appendChild(impactIcon);
    impactItem.appendChild(impactText);
    
    container.appendChild(impactItem);
}

// Loading indicator functions
function showLoadingIndicator() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading weather data...</span>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

function hideLoadingIndicator() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}