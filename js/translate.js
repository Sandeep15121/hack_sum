// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Create hidden Google Translate element
    const googleDiv = document.createElement('div');
    googleDiv.id = 'google_translate_element';
    googleDiv.style.display = 'none';
    document.body.appendChild(googleDiv);
    
    // Set up language selector
    const languageSelector = document.getElementById('language');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            translatePage(this.value);
        });
        
        // Load saved preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            languageSelector.value = savedLanguage;
        }
    }
    
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=initGoogleTranslate';
    script.async = true;
    document.body.appendChild(script);
    
    // Try to load saved language after a delay
    setTimeout(function() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            translatePage(savedLanguage);
        }
    }, 1000);
});

// Google Translate initialization function
function initGoogleTranslate() {
    new google.translate.TranslateElement(
        {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ta,bn',
            autoDisplay: false,
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
    );
    
    // After Google Translate is initialized, try to apply saved language
    setTimeout(function() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            translatePage(savedLanguage);
        }
    }, 1000);
}

// Function to translate the page to the selected language
function translatePage(lang) {
    // Save user selection
    localStorage.setItem('preferredLanguage', lang);
    
    // Only continue if Google Translate is loaded
    if (!window.google || !google.translate) {
        console.log('Google Translate not loaded yet. Trying again in 1 second.');
        setTimeout(() => translatePage(lang), 1000);
        return;
    }
    
    // Use the Google Translate dropdown
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
        selectElement.value = lang;
        
        // Trigger change event
        const event = new Event('change');
        selectElement.dispatchEvent(event);
        
        // Also try using fireEvent for IE compatibility
        if (selectElement.fireEvent) {
            selectElement.fireEvent('onchange');
        }
    } else {
        console.log('Google Translate dropdown not found. Trying again in 1 second.');
        setTimeout(() => translatePage(lang), 1000);
    }
}

// Add CSS to fix Google Translate issues
function addGoogleTranslateCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Google Translate fixes */
        .goog-te-banner-frame {
            display: none !important;
        }
        
        body {
            top: 0 !important;
        }
        
        .goog-te-gadget {
            display: none !important;
        }
        
        .VIpgJd-ZVi9od-l4eHX-hSRGPd,
        .goog-logo-link {
            display: none !important;
        }
        
        .goog-te-menu-value span {
            display: none;
        }
        
        #goog-gt-tt, 
        .goog-te-balloon-frame {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Add the CSS fixes
addGoogleTranslateCSS();