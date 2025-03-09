(function() {
    const styles = `
        .back-to-top-btn {
            position: fixed;
            bottom: 30px;
            left: 50%;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgba(87, 16, 74, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            box-shadow: 
                0 4px 8px rgba(0, 0, 0, 0.8),
                0 8px 16px rgba(0, 0, 0, 0.5);
            cursor: pointer;
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.9);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }
        
        .back-to-top-btn.visible {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
            pointer-events: auto;
        }
        
        .back-to-top-btn:hover {
            transform: translateX(-50%) translateY(-5px) scale(1.05);
            background-color: rgba(255, 80, 223, 0.3);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 
                0 6px 16px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        
        .back-to-top-btn:active {
            transform: translateX(-50%) translateY(0) scale(0.95);
            background-color: rgba(255, 80, 223, 0.4);
        }
        
        .back-to-top-btn i {
            font-size: 20px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        @media (max-width: 768px) {
            .back-to-top-btn {
                width: 45px;
                height: 45px;
                bottom: 20px;
            }
        }
    `;

    // Function to inject styles
    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    // Function to create and inject button
    function createButton() {
        const button = document.createElement('button');
        button.id = 'back-to-top-btn';
        button.className = 'back-to-top-btn';
        button.setAttribute('aria-label', 'Back to top');
        
        const icon = document.createElement('i');
        icon.className = 'fa fa-chevron-up';
        
        button.appendChild(icon);
        document.body.appendChild(button);
        
        return button;
    }

    // Initialize back to top functionality
    function initBackToTop() {
        injectStyles();
        const backToTopBtn = createButton();
        const scrollThreshold = 300; // When to show the button (in pixels)
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > scrollThreshold) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top on click
        backToTopBtn.addEventListener('click', function() {
            // For modern browsers
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Fallback for older browsers
            if (typeof window.scrollTo !== 'function') {
                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            }
        });
        
        // Initial check in case page is loaded scrolled down
        if (window.pageYOffset > scrollThreshold) {
            backToTopBtn.classList.add('visible');
        }
    }

    // When DOM is ready, initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackToTop);
    } else {
        initBackToTop();
    }
})();