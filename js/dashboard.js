// dashboard.js - AgriSense Dashboard Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initMoisturePhChart();
    initTemperatureChart();
    
    // Setup event listeners
    setupFieldSelector();
    setupTimeRangeSelector();
    setupChartToggles();
    setupExportButton();
    setupSensorHovers();
    
    // Simulate real-time data updates
    startDataSimulation();
});

// Field Selection Handling
function setupFieldSelector() {
    const fieldSelect = document.getElementById('field-select');
    if (!fieldSelect) return;
    
    fieldSelect.addEventListener('change', function() {
        const selectedField = this.value;
        console.log(`Field changed to: ${selectedField}`);
        
        // Update dashboard data based on selected field
        updateDashboardData(selectedField);
    });
}

function updateDashboardData(fieldId) {
    // Simulate loading data for the selected field
    showLoadingState();
    
    // In a real application, this would fetch data from a server
    setTimeout(() => {
        // Update card values based on "field data"
        const fieldData = getFieldData(fieldId);
        
        document.getElementById('moisture-value').textContent = fieldData.moisture;
        document.getElementById('ph-value').textContent = fieldData.ph;
        document.getElementById('temperature-value').textContent = fieldData.temperature;
        document.getElementById('nutrient-value').textContent = fieldData.nutrientIndex;
        
        // Update status indicators
        updateStatusIndicators(fieldData);
        
        // Update charts with new data
        updateCharts(fieldData);
        
        // Remove loading state
        hideLoadingState();
    }, 800);
}

// Mock data for different fields
function getFieldData(fieldId) {
    const fieldData = {
        field1: {
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
            }
        },
        field2: {
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
            }
        },
        field3: {
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
            }
        }
    };
    
    return fieldData[fieldId] || fieldData.field1;
}

function updateStatusIndicators(fieldData) {
    // Update moisture status
    const moistureValue = parseInt(fieldData.moisture);
    const moistureCard = document.getElementById('moisture-value').closest('.dashboard-card');
    const moistureStatus = moistureCard.querySelector('.card-status');
    
    if (moistureValue < 25) {
        moistureStatus.textContent = 'Low';
        moistureStatus.className = 'card-status low';
    } else if (moistureValue > 45) {
        moistureStatus.textContent = 'High';
        moistureStatus.className = 'card-status high';
    } else {
        moistureStatus.textContent = 'Optimal';
        moistureStatus.className = 'card-status optimal';
    }
    
    // Update pH status
    const phValue = parseFloat(fieldData.ph);
    const phCard = document.getElementById('ph-value').closest('.dashboard-card');
    const phStatus = phCard.querySelector('.card-status');
    
    if (phValue < 5.5) {
        phStatus.textContent = 'Too Acidic';
        phStatus.className = 'card-status low';
    } else if (phValue > 7.5) {
        phStatus.textContent = 'Too Alkaline';
        phStatus.className = 'card-status high';
    } else {
        phStatus.textContent = 'Optimal';
        phStatus.className = 'card-status optimal';
    }
    
    // Update nutrient meters
    updateNutrientMeters(fieldData.nutrients);
}

function updateNutrientMeters(nutrients) {
    // Update nitrogen
    const nitrogenMeter = document.querySelector('.nutrient-card:nth-child(1) .meter-fill');
    nitrogenMeter.style.width = `${nutrients.nitrogen}%`;
    document.querySelector('.nutrient-card:nth-child(1) .nutrient-value span').textContent = nutrients.nitrogen;
    
    // Update phosphorus
    const phosphorusMeter = document.querySelector('.nutrient-card:nth-child(2) .meter-fill');
    phosphorusMeter.style.width = `${nutrients.phosphorus}%`;
    document.querySelector('.nutrient-card:nth-child(2) .nutrient-value span').textContent = nutrients.phosphorus;
    
    // Update potassium
    const potassiumMeter = document.querySelector('.nutrient-card:nth-child(3) .meter-fill');
    potassiumMeter.style.width = `${nutrients.potassium}%`;
    document.querySelector('.nutrient-card:nth-child(3) .nutrient-value span').textContent = nutrients.potassium;
    
    // Update calcium
    const calciumMeter = document.querySelector('.nutrient-card:nth-child(4) .meter-fill');
    calciumMeter.style.width = `${nutrients.calcium}%`;
    document.querySelector('.nutrient-card:nth-child(4) .nutrient-value span').textContent = nutrients.calcium;
}

// Chart initializations
let moisturePhChart, temperatureChart;

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
                    fill: true
                },
                {
                    label: 'Soil pH',
                    data: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5],
                    borderColor: '#FDA085',
                    backgroundColor: 'rgba(253, 160, 133, 0.1)',
                    tension: 0.3,
                    fill: true,
                    hidden: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
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

function initTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Soil Temperature (°C)',
                    data: [21, 22, 24, 23, 22, 23, 23],
                    borderColor: '#F97794',
                    backgroundColor: 'rgba(249, 119, 148, 0.1)',
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
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
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

function updateCharts(fieldData) {
    // Update moisture/pH chart
    moisturePhChart.data.datasets[0].data = fieldData.moistureHistory;
    moisturePhChart.data.datasets[1].data = fieldData.phHistory;
    moisturePhChart.update();
    
    // Update temperature chart
    temperatureChart.data.datasets[0].data = fieldData.temperatureHistory;
    temperatureChart.update();
}

// Chart toggle functionality
function setupChartToggles() {
    // Moisture/pH chart toggles
    const moisturePhToggles = document.querySelectorAll('.chart-header:first-of-type .btn-chart-toggle');
    moisturePhToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            moisturePhToggles.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const dataType = this.getAttribute('data-type');
            if (dataType === 'moisture') {
                moisturePhChart.data.datasets[0].hidden = false;
                moisturePhChart.data.datasets[1].hidden = true;
            } else {
                moisturePhChart.data.datasets[0].hidden = true;
                moisturePhChart.data.datasets[1].hidden = false;
            }
            moisturePhChart.update();
        });
    });
    
    // Temperature chart timeframe toggles
    const temperatureToggles = document.querySelectorAll('.chart-header:nth-of-type(2) .btn-chart-toggle');
    temperatureToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            temperatureToggles.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const timeframe = this.getAttribute('data-timeframe');
            // In a real app, this would fetch data for different timeframes
            // For demo, we'll just show a loading indicator
            showChartLoadingState('temperature-chart');
            
            setTimeout(() => {
                // Simulate updated data
                let newData;
                if (timeframe === 'day') {
                    newData = [21, 22, 23, 24, 23, 22, 21];
                } else if (timeframe === 'week') {
                    newData = [21, 22, 24, 23, 22, 23, 23];
                } else {
                    newData = [19, 20, 22, 25, 24, 23, 21];
                }
                
                temperatureChart.data.datasets[0].data = newData;
                temperatureChart.update();
                hideChartLoadingState('temperature-chart');
            }, 500);
        });
    });
}

// Time Range Selection
function setupTimeRangeSelector() {
    const dateRange = document.getElementById('date-range');
    if (!dateRange) return;
    
    dateRange.addEventListener('change', function() {
        const selectedRange = this.value;
        console.log(`Time range changed to: ${selectedRange}`);
        
        // In a real app, this would fetch data for the selected time range
        // For the demo, we'll simulate data loading
        showLoadingState();
        
        setTimeout(() => {
            // Update charts based on "new data"
            hideLoadingState();
        }, 800);
    });
}

// Export functionality
function setupExportButton() {
    const exportBtn = document.getElementById('export-data');
    if (!exportBtn) return;
    
    exportBtn.addEventListener('click', function() {
        // In a real application, this would generate and download a CSV/PDF
        alert('This would export your dashboard data as CSV or PDF in a real application.');
    });
}

// Sensor map interactivity
function setupSensorHovers() {
    const sensorPoints = document.querySelectorAll('.sensor-point');
    
    sensorPoints.forEach(point => {
        point.addEventListener('mouseenter', function() {
            this.classList.add('active');
        });
        
        point.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });
}

// Data simulation for real-time effect
function startDataSimulation() {
    // Simulate small changes to soil moisture every 10 seconds
    setInterval(() => {
        const moistureValue = document.getElementById('moisture-value');
        if (!moistureValue) return;
        
        let currentMoisture = parseInt(moistureValue.textContent);
        // Random fluctuation between -1 and +1
        const fluctuation = Math.floor(Math.random() * 3) - 1;
        currentMoisture += fluctuation;
        
        // Keep within reasonable range
        if (currentMoisture < 20) currentMoisture = 20;
        if (currentMoisture > 50) currentMoisture = 50;
        
        moistureValue.textContent = `${currentMoisture}%`;
        
        // Update status if needed
        const moistureStatus = document.querySelector('#moisture-value').closest('.dashboard-card').querySelector('.card-status');
        if (currentMoisture < 25) {
            moistureStatus.textContent = 'Low';
            moistureStatus.className = 'card-status low';
        } else if (currentMoisture > 45) {
            moistureStatus.textContent = 'High';
            moistureStatus.className = 'card-status high';
        } else {
            moistureStatus.textContent = 'Optimal';
            moistureStatus.className = 'card-status optimal';
        }
    }, 10000);
}

// UI State Helpers
function showLoadingState() {
    // Add loading class to the main dashboard sections
    document.querySelector('.dashboard-overview').classList.add('loading');
    document.querySelector('.soil-details').classList.add('loading');
}

function hideLoadingState() {
    // Remove loading class
    document.querySelector('.dashboard-overview').classList.remove('loading');
    document.querySelector('.soil-details').classList.remove('loading');
}

function showChartLoadingState(chartId) {
    document.getElementById(chartId).classList.add('loading');
}

function hideChartLoadingState(chartId) {
    document.getElementById(chartId).classList.remove('loading');
}