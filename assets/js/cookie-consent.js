(function() {
    // Insert CSS into the document head
    const style = document.createElement('style');
    style.textContent = `
        /* Banner styles */
        #consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--VeryDarkGray);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
            padding: 15px 20px;
            z-index: 999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
            border-top: 3px solid var(--EuphoriaMagenta);
        }
        #consent-banner.show {
            transform: translateY(0);
        }
        .consent-content {
            max-width: 1200px;
            margin: 0 auto;
        }
        .consent-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--VeryLightGray);
        }
        .consent-text {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 15px;
            color: var(--VeryLightGray);
        }
        .consent-text a {
            color: var(--EuphoriaMagenta);
            text-decoration: none;
        }
        .consent-text a:hover {
            text-decoration: underline;
        }
        .consent-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .consent-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .consent-accept-all {
            background-color: var(--EuphoriaMagenta);
            color: var(--VeryLightGray);
        }
        .consent-accept-all:hover {
            background-color: var(--EuphoriaMagentaBright);
            transform: translateY(-2px);
        }
        .consent-reject-all {
            background-color: rgba(244, 67, 54, 0.8);
            color: var(--VeryLightGray);
        }
        .consent-reject-all:hover {
            background-color: rgba(244, 67, 54, 1);
            transform: translateY(-2px);
        }
        .consent-customize {
            background-color: var(--DarkGray);
            color: var(--VeryLightGray);
            border: 1px solid var(--Gray);
        }
        .consent-customize:hover {
            background-color: var(--Gray);
            transform: translateY(-2px);
        }
        #preferences-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            overflow-y: auto;
            padding: 30px 15px;
        }
        .modal-content {
            background-color: var(--VeryDarkGray);
            border-radius: 10px;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--Gray);
            position: relative;
        }
        .modal-header {
            display: block;
            position: relative;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--Gray);
            text-align: center;
        }
        .modal-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--VeryLightGray);
            width: 100%;
        }
        .close-modal {
            position: absolute;
            top: -5px;
            right: -5px;
            background: none;
            border: none;
            font-size: 22px;
            cursor: pointer;
            color: var (--VeryLightGray);
            transition: color 0.2s;
            padding: 5px;
        }
        .close-modal:hover {
            color: var(--EuphoriaMagenta);
        }
        .preference-group {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--Gray);
        }
        .preference-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .preference-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--VeryLightGray);
        }
        .preference-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }
        .preference-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--Gray);
            transition: .4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: var(--VeryLightGray);
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: var(--EuphoriaMagenta);
        }
        input:focus + .slider {
            box-shadow: 0 0 1px var(--EuphoriaMagenta);
        }
        input:checked + .slider:before {
            transform: translateX(20px);
        }
        .preference-description {
            font-size: 14px;
            color: var(--VeryLightGray);
            margin-bottom: 10px;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        #cookie-settings-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--DarkGray);
            border: 1px solid var(--Gray);
            border-radius: 50px;
            padding: 8px 12px;
            font-size: 12px;
            cursor: pointer;
            display: none;
            z-index: 998;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            color: var(--VeryLightGray);
            transition: all 0.2s ease;
        }
        #cookie-settings-btn:hover {
            background-color: var(--Gray);
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        @media (max-width: 768px) {
            .consent-buttons {
                flex-direction: column;
            }
            .consent-btn {
                width: 100%;
                margin-bottom: 8px;
            }
            .modal-content {
                padding: 15px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create and insert HTML elements
    const bannerHTML = `
        <!-- Cookie Settings Button -->
        <button id="cookie-settings-btn">Cookie Settings</button>

        <!-- Consent Banner -->
        <div id="consent-banner">
            <div class="consent-content">
                <div class="consent-title">We value your privacy</div>
                <p class="consent-text">
                    We use cookies to enhance your browsing experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies. For more information, please see our <a href="/privacy-policy">Privacy Policy</a>.
                </p>
                <div class="consent-buttons">
                    <button class="consent-btn consent-accept-all" id="accept-all-btn">Accept</button>
                    <button class="consent-btn consent-reject-all" id="reject-all-btn">Reject Analytics</button>
                    <button class="consent-btn consent-customize" id="customize-btn">Customize</button>
                </div>
            </div>
        </div>

        <!-- Preferences Modal -->
        <div id="preferences-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Cookie Preferences</div>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="preference-group">
                    <div class="preference-header">
                        <div class="preference-title">Essential Cookies</div>
                        <label class="preference-switch">
                            <input type="checkbox" id="essential-cookies" checked disabled>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <p class="preference-description">
                        These cookies are necessary for the website to function and cannot be switched off.
                    </p>
                </div>
                
                <div class="preference-group">
                    <div class="preference-header">
                        <div class="preference-title">Analytics Cookies</div>
                        <label class="preference-switch">
                            <input type="checkbox" id="analytics-cookies">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <p class="preference-description">
                        These cookies allow us to count visits and analyze traffic sources so we can measure and improve site performance.
                    </p>
                </div>
                
                <div class="modal-footer">
                    <button class="consent-btn consent-customize" id="save-preferences-btn">Save Preferences</button>
                </div>
            </div>
        </div>
    `;

    // Create a container for our banner elements
    const container = document.createElement('div');
    container.innerHTML = bannerHTML;
    
    // Append all elements to the body
    while (container.firstChild) {
        document.body.appendChild(container.firstChild);
    }

    // Configuration and functionality code
    const regionSettings = {
        eu: {
            bannerTitle: "We value your privacy",
            bannerText: "We use cookies to enhance your browsing experience and analyze site traffic. By clicking 'Accept', you consent to our use of cookies. For more information, see our <a href='/privacy-policy'>Privacy Policy</a>.",
            requireConsent: true,
            showRejectAll: true,
            expireDays: 182 // 6 months, GDPR compliant
        },
        uk: {
            bannerTitle: "We value your privacy",
            bannerText: "We use cookies to enhance your browsing experience and analyze site traffic. By clicking 'Accept', you consent to our use of cookies. For more information, see our <a href='/privacy-policy'>Privacy Policy</a>.",
            requireConsent: true,
            showRejectAll: true,
            expireDays: 182 // 6 months
        },
        us: {
            bannerTitle: "Cookie Notice",
            bannerText: "We use cookies to enhance your experience and analyze site traffic. By continuing to use our site, you agree to our <a href='/privacy-policy'>Privacy Policy</a>.",
            requireConsent: false, // Implied consent
            showRejectAll: false,
            expireDays: 365 // 1 year
        },
        ca: {
            bannerTitle: "We value your privacy",
            bannerText: "We use cookies to enhance your browsing experience and analyze site traffic. By clicking 'Accept', you consent to our use of cookies in accordance with CCPA requirements. For more information, see our <a href='/privacy-policy'>Privacy Policy</a>.",
            requireConsent: true,
            showRejectAll: true,
            expireDays: 365 // 1 year
        },
        other: {
            bannerTitle: "Cookie Notice",
            bannerText: "We use cookies to enhance your experience and analyze site traffic. By continuing to visit this site you agree to our use of cookies.",
            requireConsent: false,
            showRejectAll: false,
            expireDays: 365 // 1 year
        }
    };

    // DOM elements
    const consentBanner = document.getElementById('consent-banner');
    const preferencesModal = document.getElementById('preferences-modal');
    const cookieSettingsBtn = document.getElementById('cookie-settings-btn');
    const acceptAllBtn = document.getElementById('accept-all-btn');
    const rejectAllBtn = document.getElementById('reject-all-btn');
    const customizeBtn = document.getElementById('customize-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const savePreferencesBtn = document.getElementById('save-preferences-btn');

    // Cookie consent preferences checkboxes
    const analyticsCookiesCheckbox = document.getElementById('analytics-cookies');

    // GA4 initialization flag
    let ga4Initialized = false;

    // Google Analytics Measurement ID
    const GA_MEASUREMENT_ID = 'G-3CGSG92RGD';

    // Detect user region
    function detectUserRegion() {
        const browserLang = navigator.language || navigator.userLanguage;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (browserLang.startsWith('en-GB') || timezone.includes('Europe/London')) {
            return 'uk';
        } else if (browserLang.startsWith('en-US') || timezone.includes('America/New_York') || 
                  timezone.includes('America/Los_Angeles') || timezone.includes('America/Chicago')) {
            return 'us';
        } else if (browserLang.startsWith('en-CA') || timezone.includes('America/Toronto')) {
            return 'ca';
        } else if (timezone.includes('Europe/') || browserLang.startsWith('de') || 
                  browserLang.startsWith('fr') || browserLang.startsWith('es-ES') || 
                  browserLang.startsWith('it')) {
            return 'eu';
        } else {
            return 'other';
        }
    }

    // Set cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    }

    // Get cookie
    function getCookie(name) {
        const cookieName = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return "";
    }

    // Check for existing GA
    function checkExistingGA() {
        return typeof window.gtag === 'function';
    }

    // Initialize Google Analytics with appropriate settings
    function initGA(preferences) {
        if (ga4Initialized) return; // Prevent multiple initializations
        
        // Only initialize if analytics consent is given
        if (!preferences.analytics) return;
        
        // Check if GA is already initialized (for backward compatibility)
        if (checkExistingGA()) {
            // Just update the consent settings
            updateGAConsent(preferences);
            ga4Initialized = true;
            return;
        }
        
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag; // Make it globally available
        gtag('js', new Date());
        
        // Apply consent settings
        const consentSettings = {
            'analytics_storage': 'granted',
            'functionality_storage': 'granted', // Essential cookies
            'security_storage': 'granted' // Essential cookies
        };
        
        gtag('consent', 'default', consentSettings);
        gtag('config', GA_MEASUREMENT_ID, {
            'page_path': window.location.pathname,
            'page_location': window.location.href
        });
        
        ga4Initialized = true;
    }
    
    // Add this function to track page views after navigation
    function trackPageView() {
        if (!ga4Initialized) return;
        
        if (typeof window.gtag === 'function') {
            window.gtag('config', GA_MEASUREMENT_ID, {
                'page_path': window.location.pathname,
                'page_location': window.location.href
            });
        }
    }

    // Update Google Analytics consent
    function updateGAConsent(preferences) {
        if (typeof gtag !== 'function') return;
        
        gtag('consent', 'update', {
            'analytics_storage': preferences.analytics ? 'granted' : 'denied'
        });
    }

    // Save user preferences
    function savePreferences(preferences) {
        setCookie('cookie_consent', JSON.stringify(preferences), getRegionSettings().expireDays);
        
        // Initialize or update GA based on preferences
        if (!ga4Initialized && preferences.analytics) {
            initGA(preferences);
        } else if (ga4Initialized) {
            updateGAConsent(preferences);
        }
        
        // Hide banner and show settings button
        hideBanner();
        showSettingsButton();
    }

    // Get region-specific settings
    function getRegionSettings() {
        const userRegion = detectUserRegion();
        return regionSettings[userRegion] || regionSettings.other;
    }

    // Apply region-specific content to banner
    function applyRegionalSettings() {
        const settings = getRegionSettings();
        
        // Set banner content
        document.querySelector('.consent-title').textContent = settings.bannerTitle;
        document.querySelector('.consent-text').innerHTML = settings.bannerText;
        
        // Show/hide reject button based on region
        rejectAllBtn.style.display = settings.showRejectAll ? 'block' : 'none';
    }

    // Show banner
    function showBanner() {
        consentBanner.classList.add('show');
    }

    // Hide banner
    function hideBanner() {
        consentBanner.classList.remove('show');
    }

    // Show settings button
    function showSettingsButton() {
        cookieSettingsBtn.style.display = 'block';
    }

    // Track if user has interacted with the banner
    let bannerInteracted = false;

    // Open preferences modal
    function openPreferencesModal() {
        preferencesModal.style.display = 'block';
        bannerInteracted = true;
        
        // Load current preferences
        const cookieValue = getCookie('cookie_consent');
        if (cookieValue) {
            const preferences = JSON.parse(cookieValue);
            analyticsCookiesCheckbox.checked = preferences.analytics;
        }
    }

    // Close preferences modal
    function closePreferencesModal() {
        preferencesModal.style.display = 'none';
        
        // Show settings button if consent cookie exists or user has interacted with banner
        const cookieConsent = getCookie('cookie_consent');
        if (cookieConsent || bannerInteracted) {
            showSettingsButton();
        }
    }

    // Initialize banner
    function initBanner() {
        const cookieConsent = getCookie('cookie_consent');
        
        if (cookieConsent) {
            // Consent already given, initialize GA with saved preferences
            const preferences = JSON.parse(cookieConsent);
            initGA(preferences);
            showSettingsButton();
        } else {
            // No consent yet, show banner
            applyRegionalSettings();
            showBanner();
        }

        // Add click event listener to close modal when clicking outside
        preferencesModal.addEventListener('click', function(event) {
            // Check if the click is on the modal background (not on the modal content)
            if (event.target === preferencesModal) {
                closePreferencesModal();
            }
        });
    }

    // Event Listeners
    acceptAllBtn.addEventListener('click', function() {
        const preferences = {
            essential: true, // Always required
            analytics: true
        };
        savePreferences(preferences);
    });

    rejectAllBtn.addEventListener('click', function() {
        const preferences = {
            essential: true, // Always required
            analytics: false
        };
        savePreferences(preferences);
    });

    customizeBtn.addEventListener('click', function() {
        hideBanner();
        openPreferencesModal();
    });

    closeModalBtn.addEventListener('click', closePreferencesModal);

    savePreferencesBtn.addEventListener('click', function() {
        const preferences = {
            essential: true, // Always required
            analytics: analyticsCookiesCheckbox.checked
        };
        savePreferences(preferences);
        closePreferencesModal();
    });

    cookieSettingsBtn.addEventListener('click', openPreferencesModal);

    // Initialize banner when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        // DOM already loaded
        initBanner();
    }
})();