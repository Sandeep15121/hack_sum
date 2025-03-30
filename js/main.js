document.addEventListener('DOMContentLoaded', function() {
    // Initialize language selector
    initLanguageSelector();
    
    // Initialize responsive navigation
    initResponsiveNav();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Check if user is logged in and update UI accordingly
    checkUserStatus();
});

// Language selector functionality
function initLanguageSelector() {
    const languageSelector = document.getElementById('language');
    
    if (languageSelector) {
        // Load previously selected language if available
        const savedLanguage = localStorage.getItem('agriSenseLanguage');
        if (savedLanguage) {
            languageSelector.value = savedLanguage;
        }
        
        // Add change event listener
        languageSelector.addEventListener('change', function() {
            const selectedLanguage = this.value;
            localStorage.setItem('agriSenseLanguage', selectedLanguage);
            
            // In a real application, you would load language-specific content here
            console.log(`Language changed to: ${selectedLanguage}`);
            
            // Simulate language change (In production, this would be more sophisticated)
            showNotification(`Language changed to ${getLanguageName(selectedLanguage)}`);
        });
    }
}

// Helper function to get language name from code
function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'hi': 'हिंदी (Hindi)',
        'ta': 'தமிழ் (Tamil)',
        'bn': 'বাংলা (Bengali)'
    };
    return languages[code] || code;
}

// Initialize responsive navigation
function initResponsiveNav() {
    // Check if we need to add a mobile menu toggle
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-nav-toggle')) {
        const nav = document.querySelector('nav');
        if (nav) {
            // Create mobile menu toggle button
            const mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-nav-toggle';
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            
            // Insert before nav
            nav.parentNode.insertBefore(mobileToggle, nav);
            
            // Add click event
            mobileToggle.addEventListener('click', function() {
                nav.classList.toggle('active');
                this.innerHTML = nav.classList.contains('active') ? 
                    '<i class="fas fa-times"></i>' : 
                    '<i class="fas fa-bars"></i>';
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!nav.contains(event.target) && !mobileToggle.contains(event.target) && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.feature-card, .workflow-step, .benefit, .testimonial');
    
    // Only initialize if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        elementsToAnimate.forEach(element => {
            element.classList.add('animate');
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add event listener to close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('closing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
    
    // Add animation class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
}

// Check user login status
function checkUserStatus() {
    // This is a placeholder - in a real app, you would check if the user is logged in
    const isLoggedIn = localStorage.getItem('agriSenseLoggedIn') === 'true';
    
    // Update UI based on login status
    const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
    const ctaButton = document.querySelector('.cta .btn-primary');
    
    if (isLoggedIn) {
        dashboardLinks.forEach(link => {
            link.innerText = link.innerText.includes('Dashboard') ? link.innerText : 'Your Dashboard';
        });
        
        if (ctaButton && ctaButton.innerText.includes('Get Started')) {
            ctaButton.innerText = 'Go to Dashboard';
            ctaButton.href = 'dashboard.html';
        }
    } else {
        // For demo purposes, let's allow a simulated login
        if (ctaButton) {
            ctaButton.addEventListener('click', function(e) {
                if (!isLoggedIn) {
                    e.preventDefault();
                    simulateLogin();
                }
            });
        }
    }
}

// Simulate login for demo purposes
function simulateLogin() {
    localStorage.setItem('agriSenseLoggedIn', 'true');
    showNotification('Login successful! Redirecting to dashboard...', 'info');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}