// weather.js - AgriSense Weather Forecast Functionality

// Your OpenWeatherMap API key - replace this with your actual key
const apiKey = '278c20e91cd24356ac795416fa5be1f1';

// Default coordinates (Amritsar, Punjab)
const defaultLat = 31.6340;
const defaultLon = 74.8723;
const defaultLocation = 'Amritsar, Punjab';

// Global chart variables
let temperatureChart, rainfallChart, windChart;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI
    setCurrentLocation(defaultLocation);
    
    // Show loading indicator
    showLoading();
    
    // Initialize weather data with default location
    fetchWeatherData(defaultLat, defaultLon);
    
    // Setup event listeners
    setupLocationChange();
    setupChartTabs();
});

// ----- API Data Fetching -----

async function fetchWeatherData(lat, lon) {
    try {
        // In a production environment, this API call should be made through your backend
        // to avoid exposing your API key in frontend code
        const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }
        
        const data = await response.json();
        console.log('Weather data:', data);
        
        // Update all UI components with the fetched data
        updateWeatherUI(data);
        
        // Hide loading indicator
        hideLoading();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // If API call fails, use mock data instead
        console.log('Using mock data instead');
        const mockData = generateMockWeatherData();
        updateWeatherUI(mockData);
        
        // Hide loading indicator
        hideLoading();
        
        // Show error notification to user
        showNotification('Unable to fetch latest weather data. Showing sample data instead.', 'warning');
    }
}

// ----- UI Update Functions -----

function updateWeatherUI(data) {
    // Update current weather
    updateCurrentWeather(data.current, data.daily[0]);
    
    // Update 7-day forecast cards
    updateForecastCards(data.daily);
    
    // Initialize or update charts
    updateWeatherCharts(data.daily);
    
    // Update weather alerts
    updateWeatherAlerts(data.alerts || []);
    
    // Update agricultural impact messages
    updateAgriculturalImpact(data);
}

function updateCurrentWeather(current, today) {
    // Update current temperature
    document.getElementById('current-temp').textContent = `${Math.round(current.temp)}°C`;
    
    // Update weather condition
    const condition = current.weather[0].main;
    document.getElementById('weather-condition').textContent = condition;
    
    // Update weather icon
    const weatherIcon = document.querySelector('.weather-now .weather-icon i');
    weatherIcon.className = getWeatherIcon(current.weather[0].icon);
    
    // Update details
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(current.wind_speed)} km/h`;
    document.getElementById('precipitation').textContent = `${Math.round((today.pop || 0) * 100)}%`;
    document.getElementById('pressure').textContent = `${current.pressure} hPa`;
}

function updateForecastCards(dailyData) {
    const forecastContainer = document.querySelector('.forecast-cards');
    forecastContainer.innerHTML = ''; // Clear existing cards
    
    // Get day names and format dates
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    // Create card for each day (limit to 7 days)
    dailyData.slice(0, 7).forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = index === 0 ? 'Today' : days[date.getDay()];
        const formattedDate = formatDate(date);
        
        const weatherIcon = getWeatherIcon(day.weather[0].icon);
        const maxTemp = Math.round(day.temp.max);
        const minTemp = Math.round(day.temp.min);
        const condition = day.weather[0].description;
        const precipitation = Math.round((day.pop || 0) * 100);
        
        // Add 'today' class to the first card
        const cardClass = index === 0 ? 'forecast-card today' : 'forecast-card';
        
        // Create card HTML
        const cardHTML = `
            <div class="${cardClass}">
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-date">${formattedDate}</div>
                <div class="forecast-icon">
                    <i class="${weatherIcon}"></i>
                </div>
                <div class="forecast-temp">
                    <span class="max-temp">${maxTemp}°C</span>
                    <span class="min-temp">${minTemp}°C</span>
                </div>
                <div class="forecast-condition">${capitalizeFirstLetter(condition)}</div>
                <div class="forecast-precipitation">
                    <i class="fas fa-tint"></i> ${precipitation}%
                </div>
            </div>
        `;
        
        forecastContainer.innerHTML += cardHTML;
    });
}

function updateWeatherCharts(dailyData) {
    // Extract data for charts
    const labels = dailyData.slice(0, 7).map((day, index) => {
        return index === 0 ? 'Today' : formatDayName(new Date(day.dt * 1000));
    });
    
    const maxTemps = dailyData.slice(0, 7).map(day => Math.round(day.temp.max));
    const minTemps = dailyData.slice(0, 7).map(day => Math.round(day.temp.min));
    const avgTemps = dailyData.slice(0, 7).map(day => Math.round((day.temp.max + day.temp.min) / 2));
    
    const rainfall = dailyData.slice(0, 7).map(day => {
        return day.rain ? Math.round(day.rain) : 0;
    });
    
    const windSpeed = dailyData.slice(0, 7).map(day => Math.round(day.wind_speed));
    
    // Update or create charts
    updateTemperatureChart(labels, maxTemps, minTemps, avgTemps);
    updateRainfallChart(labels, rainfall, dailyData.slice(0, 7).map(day => Math.round((day.pop || 0) * 100)));
    updateWindChart(labels, windSpeed);
    
    // Update wind direction indicators
    updateWindDirections(dailyData.slice(0, 7));
}

function updateTemperatureChart(labels, maxTemps, minTemps, avgTemps) {
    const ctx = document.getElementById('temperatureForecastChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (temperatureChart) {
        temperatureChart.destroy();
    }
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Max Temperature',
                    data: maxTemps,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Min Temperature',
                    data: minTemps,
                    borderColor: '#4FACFE',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Average Temperature',
                    data: avgTemps,
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

function updateRainfallChart(labels, rainfall, probability) {
    const ctx = document.getElementById('rainfallForecastChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (rainfallChart) {
        rainfallChart.destroy();
    }
    
    // Create color array based on rainfall amount
    const colors = rainfall.map(value => {
        const alpha = 0.6 + (value / 30) * 0.4; // Adjust alpha based on rainfall
        return `rgba(79, 172, 254, ${Math.min(1, alpha)})`;
    });
    
    rainfallChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Rainfall (mm)',
                    data: rainfall,
                    backgroundColor: colors,
                    borderColor: 'rgba(79, 172, 254, 1)',
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
    
    // Update probability bars
    const probabilityValues = document.querySelectorAll('.probability-values .probability-value');
    const probabilityLabels = document.querySelectorAll('.probability-labels span');
    
    probability.forEach((prob, i) => {
        if (probabilityValues[i]) {
            probabilityValues[i].style.height = `${prob}%`;
            probabilityValues[i].textContent = `${prob}%`;
        }
        
        if (probabilityLabels[i]) {
            probabilityLabels[i].textContent = i === 0 ? 'Today' : `+${i}`;
        }
    });
}

function updateWindChart(labels, windSpeed) {
    const ctx = document.getElementById('windForecastChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (windChart) {
        windChart.destroy();
    }
    
    windChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Wind Speed (km/h)',
                    data: windSpeed,
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

function updateWindDirections(dailyData) {
    const directionDays = document.querySelectorAll('.direction-day');
    
    // Map degrees to cardinal directions
    dailyData.forEach((day, i) => {
        if (directionDays[i]) {
            const degrees = day.wind_deg;
            const indicator = directionDays[i].querySelector('.wind-direction-indicator');
            const label = directionDays[i].querySelector('.direction-label');
            
            // Rotate arrow to match wind direction
            indicator.style.transform = `rotate(${degrees}deg)`;
            
            // Set cardinal direction label
            label.textContent = getCardinalDirection(degrees);
        }
    });
}

function updateWeatherAlerts(alerts) {
    const alertContainer = document.querySelector('.alert-container');
    
    // If there are no alerts from API, keep the static ones
    if (!alerts || alerts.length === 0) return;
    
    alertContainer.innerHTML = '';
    
    alerts.forEach(alert => {
        const startTime = new Date(alert.start * 1000);
        const endTime = new Date(alert.end * 1000);
        
        const alertHTML = `
            <div class="weather-alert warning">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <h3>${alert.event}</h3>
                    <p>${alert.description}</p>
                    <div class="alert-time">Valid until: ${formatDateFull(endTime)}</div>
                </div>
            </div>
        `;
        
        alertContainer.innerHTML += alertHTML;
    });
}

function updateAgriculturalImpact(data) {
    const current = data.current;
    const forecast = data.daily.slice(0, 3); // Next 3 days
    const impactContainer = document.querySelector('.weather-impact');
    
    // Clear existing impacts except the heading
    while (impactContainer.children.length > 1) {
        impactContainer.removeChild(impactContainer.lastChild);
    }
    
    // Add impacts based on current and forecast conditions
    
    // Temperature impact
    if (current.temp > 30) {
        addImpactItem(impactContainer, 'warning', 'High temperature may stress crops. Consider additional irrigation.');
    } else if (current.temp < 15) {
        addImpactItem(impactContainer, 'warning', 'Low temperature may slow down growth. Monitor closely.');
    } else {
        addImpactItem(impactContainer, 'favorable', 'Temperature is in optimal range for most crops.');
    }
    
    // Rain forecast impact
    const willRainSoon = forecast.some(day => day.pop > 0.5);
    if (willRainSoon) {
        addImpactItem(impactContainer, 'warning', 'Significant rainfall expected in the next 3 days. Plan field activities accordingly.');
    } else if (forecast.every(day => day.pop < 0.2)) {
        addImpactItem(impactContainer, 'warning', 'Low rainfall expected in the coming days. Irrigation may be required.');
    }
    
    // Wind impact
    if (current.wind_speed > 15) {
        addImpactItem(impactContainer, 'warning', 'High winds. Not advisable for spraying pesticides.');
    } else if (current.wind_speed < 5 && current.humidity > 80) {
        addImpactItem(impactContainer, 'warning', 'Low wind and high humidity. Watch for fungal diseases.');
    } else if (current.wind_speed < 10) {
        addImpactItem(impactContainer, 'favorable', 'Good conditions for spraying fertilizers today.');
    }
}

// ----- Event Handlers -----

function setupLocationChange() {
    const changeLocationBtn = document.getElementById('change-location');
    
    changeLocationBtn.addEventListener('click', async function() {
        const newLocation = prompt("Enter your farm location:", "Amritsar, Punjab");
        
        if (newLocation && newLocation.trim() !== '') {
            // Show loading indicator
            showLoading();
            
            try {
                // In a real app, you would use the OpenWeatherMap Geocoding API
                // to convert the location name to coordinates
                // For this demo, we'll just simulate it
                
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Update location display
                setCurrentLocation(newLocation);
                
                // For demo purposes, generate random coordinates
                // In a real app, you would use the actual coordinates from the geocoding API
                const randomLat = defaultLat + (Math.random() - 0.5) * 10;
                const randomLon = defaultLon + (Math.random() - 0.5) * 10;
                
                // Fetch weather data for the new location
                fetchWeatherData(randomLat, randomLon);
            } catch (error) {
                console.error('Error changing location:', error);
                hideLoading();
                showNotification('Unable to find weather data for this location.', 'error');
            }
        }
    });
}

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

// ----- Helper Functions -----

function setCurrentLocation(location) {
    document.getElementById('current-location').textContent = location;
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatDateFull(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDayName(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',           // clear sky day
        '01n': 'fas fa-moon',          // clear sky night
        '02d': 'fas fa-cloud-sun',     // few clouds day
        '02n': 'fas fa-cloud-moon',    // few clouds night
        '03d': 'fas fa-cloud',         // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',         // broken clouds
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',    // shower rain
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain', // rain day
        '10n': 'fas fa-cloud-moon-rain', // rain night
        '11d': 'fas fa-bolt',          // thunderstorm
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',     // snow
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',          // mist
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-cloud';
}

function getCardinalDirection(angle) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
    return directions[index];
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

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Notification/toast message function
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        document.body.removeChild(existingNotification);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.width = '350px';
    notification.style.maxWidth = '90vw';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s';
    
    // Set icon based on type
    let iconClass, iconColor;
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            iconColor = '#4CAF50';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            iconColor = '#FF9800';
            break;
        case 'error':
            iconClass = 'fas fa-times-circle';
            iconColor = '#F44336';
            break;
        default:
            iconClass = 'fas fa-info-circle';
            iconColor = '#2196F3';
    }
    
    notification.innerHTML = `
        <div style="font-size: 20px; margin-right: 12px; color: ${iconColor};">
            <i class="${iconClass}"></i>
        </div>
        <div style="flex: 1;">${message}</div>
        <button style="background: none; border: none; cursor: pointer; font-size: 16px; color: #555;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Set up close button
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// ----- Mock Data Generation -----

function generateMockWeatherData() {
    const currentDate = new Date();
    const mockCurrent = {
        dt: Math.floor(currentDate.getTime() / 1000),
        sunrise: Math.floor(new Date(currentDate.setHours(6, 30, 0, 0)).getTime() / 1000),
        sunset: Math.floor(new Date(currentDate.setHours(18, 30, 0, 0)).getTime() / 1000),
        temp: 28,
        feels_like: 30,
        pressure: 1012,
        humidity: 45,
        dew_point: 15,
        uvi: 7,
        clouds: 10,
        visibility: 10000,
        wind_speed: 10,
        wind_deg: 45,
        weather: [
            {
                id: 800,
                main: "Clear",
                description: "clear sky",
                icon: "01d"
            }
        ]
    };
    
    const mockDaily = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // Generate more varied weather for later days
        let weatherType, weatherIcon, pop;
        if (i === 0) {
            weatherType = "Clear";
            weatherIcon = "01d";
            pop = 0;
        } else if (i >= 3 && i <= 4) {
            weatherType = i === 3 ? "Rain" : "Showers";
            weatherIcon = i === 3 ? "10d" : "09d";
            pop = i === 3 ? 0.8 : 0.5;
        } else {
            const types = ["Clouds", "Clear", "Partly Cloudy"];
            const icons = ["03d", "01d", "02d"];
            const index = Math.floor(Math.random() * types.length);
            weatherType = types[index];
            weatherIcon = icons[index];
            pop = Math.random() * 0.3;
        }
        
        // Temperature decreases slightly then rises again
        const tempOffset = i === 0 ? 0 : i === 1 ? -2 : i === 2 ? -3 : i === 3 ? -5 : i === 4 ? -3 : i === 5 ? -2 : 0;
        
        mockDaily.push({
            dt: Math.floor(date.getTime() / 1000),
            sunrise: Math.floor(new Date(date.setHours(6, 30, 0, 0)).getTime() / 1000),
            sunset: Math.floor(new Date(date.setHours(18, 30, 0, 0)).getTime() / 1000),
            temp: {
                day: 28 + tempOffset,
                min: 21 + tempOffset,
                max: 32 + tempOffset,
                night: 21 + tempOffset,
                eve: 27 + tempOffset,
                morn: 22 + tempOffset
            },
            feels_like: {
                day: 30 + tempOffset,
                night: 22 + tempOffset,
                eve: 28 + tempOffset,
                morn: 23 + tempOffset
            },
            pressure: 1012 - i,
            humidity: 45 + i * 5,
            dew_point: 15,
            wind_speed: i === 2 ? 18 : 10,
            wind_deg: 45 + i * 45,
            weather: [
                {
                    id: 800,
                    main: weatherType,
                    description: weatherType.toLowerCase(),
                    icon: weatherIcon
                }
            ],
            clouds: 10 + i * 10,
            pop: pop,
            rain: i >= 3 && i <= 4 ? (i === 3 ? 15 : 5) : 0,
            uvi: 7
        });
    }
    
    // Mock alerts for heavy rain
    const mockAlerts = [];
    if (true) { // Always show the alert in mock data
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 2); // Alert starts in 2 days
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 2); // Alert lasts for 2 days
        
        mockAlerts.push({
            sender_name: "AgriSense Weather",
            event: "Heavy Rain Warning",
            start: Math.floor(startDate.getTime() / 1000),
            end: Math.floor(endDate.getTime() / 1000),
            description: "Heavy rainfall expected on Wednesday and Thursday. Consider delaying any planned fertilizer application.",
            tags: ["Rain", "Flood"]
        });
    }
    
    return {
        lat: defaultLat,
        lon: defaultLon,
        timezone: "Asia/Kolkata",
        timezone_offset: 19800,
        current: mockCurrent,
        daily: mockDaily,
        alerts: mockAlerts
    };
}