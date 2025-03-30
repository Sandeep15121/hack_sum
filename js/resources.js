// alerts.js - AgriSense Alerts & Recommendations Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all event listeners
    setupFieldSelector();
    setupAlertFilters();
    setupAlertActions();
    setupPagination();
    setupNotificationSettings();
    setupCustomAlertForm();
});

// Field selection functionality
function setupFieldSelector() {
    const fieldSelect = document.getElementById('alert-field-select');
    if (!fieldSelect) return;
    
    fieldSelect.addEventListener('change', function() {
        const selectedField = this.value;
        console.log(`Filtering alerts for: ${selectedField}`);
        
        // Filter alerts based on selected field
        filterAlertsByField(selectedField);
    });
}

function filterAlertsByField(fieldId) {
    // Show loading state
    document.querySelector('.alerts-container').classList.add('loading');
    
    setTimeout(() => {
        const alertCards = document.querySelectorAll('.alert-card');
        
        alertCards.forEach(card => {
            const cardContent = card.querySelector('.alert-content').textContent.toLowerCase();
            
            if (fieldId === 'all') {
                card.style.display = 'block';
            } else {
                // Check if the card mentions the selected field
                // This is a simplified approach. In a real app, you would have proper data attributes
                const fieldNames = {
                    'field1': 'north field',
                    'field2': 'south field',
                    'field3': 'east field'
                };
                
                if (cardContent.includes(fieldNames[fieldId])) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
        
        // Also filter recommendations
        filterRecommendationsByField(fieldId);
        
        // Remove loading state
        document.querySelector('.alerts-container').classList.remove('loading');
    }, 300);
}

function filterRecommendationsByField(fieldId) {
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    
    recommendationCards.forEach(card => {
        const fieldTag = card.querySelector('.field-tag').textContent.toLowerCase();
        
        if (fieldId === 'all') {
            card.style.display = 'flex';
        } else {
            const fieldNames = {
                'field1': 'north field',
                'field2': 'south field',
                'field3': 'east field'
            };
            
            if (fieldTag.includes(fieldNames[fieldId]) || fieldTag.includes('all fields')) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Alert filters functionality
function setupAlertFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter alerts based on selected type
            const filterType = this.getAttribute('data-filter');
            filterAlertsByType(filterType);
        });
    });
}

function filterAlertsByType(type) {
    // Show loading state
    document.querySelector('.alerts-container').classList.add('loading');
    
    setTimeout(() => {
        const alertCards = document.querySelectorAll('.alert-card');
        
        alertCards.forEach(card => {
            if (type === 'all') {
                card.style.display = 'block';
            } else {
                if (card.classList.contains(type)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
        
        // Remove loading state
        document.querySelector('.alerts-container').classList.remove('loading');
    }, 300);
}

// Alert action buttons (Mark as Resolved, Snooze)
function setupAlertActions() {
    // Mark as Resolved buttons
    const resolveButtons = document.querySelectorAll('.alert-actions .btn-primary');
    resolveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const alertCard = this.closest('.alert-card');
            
            // Add a resolved visual feedback
            alertCard.classList.add('resolving');
            
            setTimeout(() => {
                // In a real app, this would call an API to update the alert status
                alertCard.style.opacity = '0';
                
                setTimeout(() => {
                    alertCard.style.display = 'none';
                    
                    // Show a success message
                    showNotification('Alert marked as resolved successfully!', 'success');
                    
                    // Check if there are no more visible alerts
                    checkForEmptyAlerts();
                }, 300);
            }, 700);
        });
    });
    
    // Snooze buttons
    const snoozeButtons = document.querySelectorAll('.alert-actions .btn-secondary');
    snoozeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const alertCard = this.closest('.alert-card');
            
            // Show snooze options (in a real app, this would be a dropdown or modal)
            const snoozeTime = prompt('Snooze for how many hours?', '24');
            
            if (snoozeTime) {
                // Add a snoozed visual feedback
                alertCard.classList.add('snoozed');
                
                // Update the UI to show it's snoozed
                const alertHeader = alertCard.querySelector('.alert-header');
                const snoozeIndicator = document.createElement('div');
                snoozeIndicator.className = 'snooze-indicator';
                snoozeIndicator.innerHTML = `<i class="fas fa-clock"></i> Snoozed for ${snoozeTime}h`;
                alertHeader.appendChild(snoozeIndicator);
                
                // Show a success message
                showNotification(`Alert snoozed for ${snoozeTime} hours!`, 'info');
            }
        });
    });
    
    // Recommendation apply buttons
    const applyButtons = document.querySelectorAll('.recommendation-content .btn-primary');
    applyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const recommendationCard = this.closest('.recommendation-card');
            const recommendationTitle = recommendationCard.querySelector('h3').textContent;
            
            // In a real app, this would call an API to apply the recommendation
            // For demo, just show a visual confirmation
            this.innerHTML = '<i class="fas fa-check"></i> Applied';
            this.classList.add('applied');
            this.disabled = true;
            
            // Show a success message
            showNotification(`Recommendation "${recommendationTitle}" has been applied!`, 'success');
        });
    });
}

function checkForEmptyAlerts() {
    const visibleAlerts = document.querySelectorAll('.alert-card[style="display: block;"], .alert-card:not([style])');
    
    if (visibleAlerts.length === 0) {
        const alertsContainer = document.querySelector('.alerts-container');
        
        // Create an empty state message
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>All caught up!</h3>
            <p>No active alerts at the moment. We'll notify you when something needs attention.</p>
        `;
        
        alertsContainer.appendChild(emptyState);
    }
}

// Notification/toast message function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon;
    switch(type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        case 'error':
            icon = 'fas fa-times-circle';
            break;
        default:
            icon = 'fas fa-info-circle';
    }
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icon}"></i>
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Add visible class after a small delay (for animation)
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('visible');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('visible');
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Pagination for Alert History
function setupPagination() {
    const pageButtons = document.querySelectorAll('.page-btn');
    if (pageButtons.length === 0) return;
    
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('next')) {
                // Handle next page button
                const activePage = document.querySelector('.page-btn.active:not(.next)');
                if (activePage && activePage.nextElementSibling && !activePage.nextElementSibling.classList.contains('next')) {
                    activePage.classList.remove('active');
                    activePage.nextElementSibling.classList.add('active');
                    
                    // In a real app, this would load the next page of data
                    loadAlertHistoryPage(activePage.nextElementSibling.textContent);
                }
            } else {
                // Handle numbered page buttons
                pageButtons.forEach(b => {
                    if (!b.classList.contains('next')) {
                        b.classList.remove('active');
                    }
                });
                
                this.classList.add('active');
                
                // In a real app, this would load the specific page of data
                loadAlertHistoryPage(this.textContent);
            }
        });
    });
}

function loadAlertHistoryPage(pageNumber) {
    // Show loading state
    const historyTable = document.querySelector('.alert-table tbody');
    historyTable.classList.add('loading');
    
    // In a real app, this would fetch page data from an API
    // For demo, we'll simulate loading with a timeout
    setTimeout(() => {
        // Simulate different data for different pages
        if (pageNumber === '1') {
            // Page 1 is already loaded in the HTML
            historyTable.classList.remove('loading');
        } else if (pageNumber === '2') {
            // Simulate page 2 data
            historyTable.innerHTML = `
                <tr>
                    <td>Mar 15, 2025 - 08:30 AM</td>
                    <td><span class="alert-tag info">Info</span></td>
                    <td>South Field (Rice)</td>
                    <td>Optimal Temperature for Rice Growth</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Mar 12, 2025 - 01:45 PM</td>
                    <td><span class="alert-tag warning">Warning</span></td>
                    <td>North Field (Wheat)</td>
                    <td>Calcium Deficiency Detected</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Mar 10, 2025 - 11:20 AM</td>
                    <td><span class="alert-tag critical">Critical</span></td>
                    <td>East Field (Corn)</td>
                    <td>Pest Detection: Corn Borers</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Mar 08, 2025 - 09:55 AM</td>
                    <td><span class="alert-tag warning">Warning</span></td>
                    <td>All Fields</td>
                    <td>Frost Warning: Temperatures below 2°C expected</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Mar 05, 2025 - 03:40 PM</td>
                    <td><span class="alert-tag info">Info</span></td>
                    <td>North Field (Wheat)</td>
                    <td>Recommended Time for Weed Control</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
            `;
            historyTable.classList.remove('loading');
        } else if (pageNumber === '3') {
            // Simulate page 3 data
            historyTable.innerHTML = `
                <tr>
                    <td>Mar 02, 2025 - 10:15 AM</td>
                    <td><span class="alert-tag warning">Warning</span></td>
                    <td>South Field (Rice)</td>
                    <td>Increased Salinity Detected (3.2 dS/m)</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Feb 28, 2025 - 02:30 PM</td>
                    <td><span class="alert-tag info">Info</span></td>
                    <td>East Field (Corn)</td>
                    <td>Optimal Soil Structure for Planting</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Feb 25, 2025 - 09:10 AM</td>
                    <td><span class="alert-tag critical">Critical</span></td>
                    <td>North Field (Wheat)</td>
                    <td>Water Logging Detected</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Feb 22, 2025 - 11:45 AM</td>
                    <td><span class="alert-tag warning">Warning</span></td>
                    <td>All Fields</td>
                    <td>Strong Wind Advisory (>30 km/h)</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
                <tr>
                    <td>Feb 20, 2025 - 04:20 PM</td>
                    <td><span class="alert-tag info">Info</span></td>
                    <td>South Field (Rice)</td>
                    <td>Harvest Time Recommendation</td>
                    <td><span class="status-tag resolved">Resolved</span></td>
                </tr>
            `;
            historyTable.classList.remove('loading');
        }
    }, 500);
}

// Notification Settings
function setupNotificationSettings() {
    const saveButton = document.querySelector('.notification-settings .btn-primary');
    const resetButton = document.querySelector('.notification-settings .btn-secondary');
    
    if (!saveButton || !resetButton) return;
    
    // Save button
    saveButton.addEventListener('click', function() {
        // In a real app, this would save preferences to a database
        showNotification('Notification preferences saved successfully!', 'success');
        
        // Simulate a successful save
        const checkboxes = document.querySelectorAll('.notification-settings input[type="checkbox"]');
        const preferences = {};
        
        checkboxes.forEach(checkbox => {
            preferences[checkbox.id] = checkbox.checked;
        });
        
        console.log('Saved preferences:', preferences);
        
        // In a real app, you'd store these preferences
        localStorage.setItem('alertPreferences', JSON.stringify(preferences));
    });
    
    // Reset button
    resetButton.addEventListener('click', function() {
        // Reset all checkboxes to checked
        const checkboxes = document.querySelectorAll('.notification-settings input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        showNotification('Notification preferences reset to default!', 'info');
    });
    
    // Load saved preferences if any
    const savedPreferences = localStorage.getItem('alertPreferences');
    if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        
        // Apply saved preferences
        Object.keys(preferences).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = preferences[id];
            }
        });
    }
}

// Custom Alert Setup
function setupCustomAlertForm() {
    const createButton = document.querySelector('.custom-alert-form .btn-primary');
    if (!createButton) return;
    
    createButton.addEventListener('click', function() {
        // Get form values
        const field = document.getElementById('alert-field').value;
        const parameter = document.getElementById('alert-parameter').value;
        const minThreshold = document.getElementById('min-threshold').value;
        const maxThreshold = document.getElementById('max-threshold').value;
        const priority = document.getElementById('alert-priority').value;
        
        // Validate
        if (!field || !parameter || !minThreshold || !maxThreshold) {
            showNotification('Please fill in all fields!', 'error');
            return;
        }
        
        // Get field name from select option text
        const fieldName = document.getElementById('alert-field').options[document.getElementById('alert-field').selectedIndex].text;
        const parameterName = document.getElementById('alert-parameter').options[document.getElementById('alert-parameter').selectedIndex].text;
        
        // In a real app, this would save the custom alert to the database
        // For demo, add to the table
        addCustomAlertToTable(fieldName, parameterName, minThreshold, maxThreshold, priority);
        
        // Show success message
        showNotification('Custom alert created successfully!', 'success');
        
        // Reset form
        document.getElementById('alert-field').value = '';
        document.getElementById('alert-parameter').value = '';
        document.getElementById('min-threshold').value = '';
        document.getElementById('max-threshold').value = '';
        document.getElementById('alert-priority').value = 'critical';
    });
    
    // Setup delete and edit buttons for existing custom alerts
    setupCustomAlertTableActions();
}

function addCustomAlertToTable(field, parameter, min, max, priority) {
    const tbody = document.querySelector('.custom-alert-table tbody');
    
    // Create new row
    const tr = document.createElement('tr');
    
    // Add units based on parameter
    let unitMin = min;
    let unitMax = max;
    
    if (parameter === 'Soil Moisture') {
        unitMin = `${min}%`;
        unitMax = `${max}%`;
    } else if (parameter === 'Soil Temperature') {
        unitMin = `${min}°C`;
        unitMax = `${max}°C`;
    } else if (parameter === 'pH Level') {
        // No units for pH
    } else {
        unitMin = `${min} kg/ha`;
        unitMax = `${max} kg/ha`;
    }
    
    tr.innerHTML = `
        <td>${field}</td>
        <td>${parameter}</td>
        <td>${unitMin}</td>
        <td>${unitMax}</td>
        <td><span class="alert-tag ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span></td>
        <td>
            <button class="btn-icon edit-alert">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-alert">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    // Add to table
    tbody.appendChild(tr);
    
    // Setup actions for the new row
    setupCustomAlertTableActions();
}

function setupCustomAlertTableActions() {
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.delete-alert');
    deleteButtons.forEach(btn => {
        // Remove existing listeners
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Add new listeners
    document.querySelectorAll('.delete-alert').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            
            // Confirm delete
            if (confirm('Are you sure you want to delete this custom alert?')) {
                // Fade out and remove
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    showNotification('Custom alert deleted successfully!', 'success');
                }, 300);
            }
        });
    });
    
    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-alert');
    editButtons.forEach(btn => {
        // Remove existing listeners
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Add new listeners
    document.querySelectorAll('.edit-alert').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const cells = row.querySelectorAll('td');
            
            // Get field name and find corresponding option
            const fieldName = cells[0].textContent;
            const fieldSelect = document.getElementById('alert-field');
            for (let i = 0; i < fieldSelect.options.length; i++) {
                if (fieldSelect.options[i].text === fieldName) {
                    fieldSelect.value = fieldSelect.options[i].value;
                    break;
                }
            }
            
            // Get parameter name and find corresponding option
            const parameterName = cells[1].textContent;
            const parameterSelect = document.getElementById('alert-parameter');
            for (let i = 0; i < parameterSelect.options.length; i++) {
                if (parameterSelect.options[i].text === parameterName) {
                    parameterSelect.value = parameterSelect.options[i].value;
                    break;
                }
            }
            
            // Get min/max values (remove units)
            let minValue = cells[2].textContent;
            let maxValue = cells[3].textContent;
            
            minValue = minValue.replace(/[^0-9.]/g, '');
            maxValue = maxValue.replace(/[^0-9.]/g, '');
            
            document.getElementById('min-threshold').value = minValue;
            document.getElementById('max-threshold').value = maxValue;
            
            // Get priority
            const priorityText = cells[4].textContent.toLowerCase();
            document.getElementById('alert-priority').value = priorityText;
            
            // Scroll to form
            document.querySelector('.custom-alert-form').scrollIntoView({ behavior: 'smooth' });
            
            // Update button text to indicate editing
            createButton.textContent = 'Update Custom Alert';
            
            // Store reference to the row being edited
            createButton.setAttribute('data-editing-row', Array.from(row.parentNode.children).indexOf(row));
            
            showNotification('Edit mode: Update the form and click "Update Custom Alert" to save changes', 'info');
        });
    });
    
    // Check if we're in edit mode
    const createButton = document.querySelector('.custom-alert-form .btn-primary');
    if (createButton && createButton.hasAttribute('data-editing-row')) {
        createButton.addEventListener('click', function() {
            if (this.hasAttribute('data-editing-row')) {
                const rowIndex = parseInt(this.getAttribute('data-editing-row'));
                const rows = document.querySelectorAll('.custom-alert-table tbody tr');
                
                if (rows[rowIndex]) {
                    // Remove the row
                    rows[rowIndex].remove();
                }
                
                // Reset button
                this.textContent = 'Create Custom Alert';
                this.removeAttribute('data-editing-row');
            }
        });
    }
}

// CSS for notification system (add to your stylesheet)
// This is included here for reference, but should be in your CSS file
/*
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px;
    border-radius: 5px;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    width: 350px;
    max-width: 90vw;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    z-index: 1000;
}

.notification.visible {
    transform: translateX(0);
}

.notification .notification-icon {
    font-size: 20px;
}

.notification.success .notification-icon {
    color: #4CAF50;
}

.notification.info .notification-icon {
    color: #2196F3;
}

.notification.warning .notification-icon {
    color: #FF9800;
}

.notification.error .notification-icon {
    color: #F44336;
}

.notification .notification-message {
    flex: 1;
}

.notification .notification-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #555;
}

.notification .notification-close:hover {
    color: #000;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    margin-top: 20px;
}

.empty-state .empty-icon {
    font-size: 48px;
    color: #4CAF50;
    margin-bottom: 16px;
}

.empty-state h3 {
    font-size: 24px;
    margin-bottom: 10px;
}

.empty-state p {
    color: #666;
    max-width: 400px;
    margin: 0 auto;
}

.loading {
    opacity: 0.6;
    position: relative;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #4CAF50;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
}
*/