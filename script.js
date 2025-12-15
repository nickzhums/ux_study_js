/**
 * ThemeSwitcher Class
 * Manages light/dark theme switching functionality with localStorage persistence
 * and system preference detection.
 */
class ThemeSwitcher {
    /**
     * Constructor - Initializes theme switcher with stored or system theme
     * Sets up DOM element references and initial theme state
     */
    constructor() {
        // Get reference to theme toggle button
        this.themeToggle = document.getElementById('theme-toggle');
        // Get reference to the theme icon span element
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        // Set current theme from localStorage or fall back to system preference
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        
        // Initialize event listeners and apply theme
        this.init();
    }

    /**
     * Initialize theme switcher
     * Sets up event listeners for click, keyboard, and system theme changes
     */
    init() {
        // Apply the initial theme to the page
        this.setTheme(this.currentTheme);
        
        // Add click event listener to toggle button
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Listen for system theme preference changes
        // Only applies if user hasn't manually selected a theme
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Add keyboard accessibility support (Enter or Space key)
        this.themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Get system theme preference
     * @returns {string} 'dark' or 'light' based on system preference
     */
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    /**
     * Get stored theme from localStorage
     * @returns {string|null} Stored theme value or null if not set
     */
    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - Theme to store ('dark' or 'light')
     */
    setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    /**
     * Apply theme to the page
     * Updates data-theme attribute, icon, localStorage, and ARIA label
     * @param {string} theme - Theme to apply ('dark' or 'light')
     */
    setTheme(theme) {
        // Update current theme state
        this.currentTheme = theme;
        // Set data-theme attribute on root element for CSS variable switching
        document.documentElement.setAttribute('data-theme', theme);
        // Update the theme icon (moon/sun)
        this.updateThemeIcon(theme);
        // Persist theme preference to localStorage
        this.setStoredTheme(theme);
        
        // Update button aria-label for screen readers
        this.themeToggle.setAttribute('aria-label', 
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
        );
    }

    /**
     * Update theme icon with animation
     * Scales down icon, changes it, then scales back up
     * @param {string} theme - Current theme ('dark' or 'light')
     */
    updateThemeIcon(theme) {
        // Scale down animation
        this.themeIcon.style.transform = 'scale(0)';
        
        // After animation completes, change icon and scale back up
        setTimeout(() => {
            // Sun icon for dark theme (click to go light), moon for light theme
            this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
            this.themeIcon.style.transform = 'scale(1)';
        }, 150);
    }

    /**
     * Toggle between light and dark themes
     * Applies the opposite theme and adds button press animation
     */
    toggleTheme() {
        // Switch to opposite theme
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Add button press animation effect
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 100);
    }
}

/**
 * NavigationHandler Class
 * Manages smooth scrolling navigation and active link highlighting
 */
class NavigationHandler {
    /**
     * Constructor - Initializes navigation with all nav links
     */
    constructor() {
        // Get all navigation links
        this.navLinks = document.querySelectorAll('.nav-link');
        // Initialize event listeners
        this.init();
    }

    /**
     * Initialize navigation handlers
     * Sets up click and scroll event listeners
     */
    init() {
        // Add click handler to each navigation link
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Extract target section ID from href (remove #)
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Smooth scroll to target section
                    this.scrollToElement(targetElement);
                    // Highlight active navigation link
                    this.updateActiveLink(link);
                }
            });
        });

        // Update active link highlighting while scrolling
        window.addEventListener('scroll', () => {
            this.updateActiveOnScroll();
        });
    }

    /**
     * Scroll to target element with offset for sticky header
     * @param {HTMLElement} element - Target element to scroll to
     */
    scrollToElement(element) {
        // Calculate offset to account for sticky header
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = element.offsetTop - headerHeight - 20;
        
        // Smooth scroll to calculated position
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Update active state of navigation links
     * @param {HTMLElement} activeLink - The link to mark as active
     */
    updateActiveLink(activeLink) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    /**
     * Update active link based on scroll position
     * Determines which section is currently in view and highlights corresponding nav link
     */
    updateActiveOnScroll() {
        // Calculate scroll position with header offset
        const headerHeight = document.querySelector('.header').offsetHeight;
        const scrollPosition = window.scrollY + headerHeight + 50;

        // Get all content sections
        const sections = document.querySelectorAll('.section');
        let currentSection = null;

        // Find which section is currently visible
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section;
            }
        });

        // Update active link if a section is in view
        if (currentSection) {
            const currentId = currentSection.getAttribute('id');
            const activeLink = document.querySelector(`.nav-link[href="#${currentId}"]`);
            if (activeLink) {
                this.updateActiveLink(activeLink);
            }
        }
    }
}

/**
 * AccessibilityHandler Class
 * Enhances page accessibility with skip links, focus management, and reduced motion support
 */
class AccessibilityHandler {
    /**
     * Constructor - Initializes accessibility features
     */
    constructor() {
        this.init();
    }

    /**
     * Initialize all accessibility features
     */
    init() {
        // Add skip link for keyboard navigation (WCAG requirement)
        this.addSkipLink();
        
        // Improve focus management for interactive elements
        this.improveFocusManagement();
        
        // Add support for users who prefer reduced motion
        this.handleReducedMotion();
    }

    /**
     * Add skip link for keyboard users
     * Allows users to bypass header and jump directly to main content
     * Link is hidden until it receives focus (WCAG 2.4.1)
     */
    addSkipLink() {
        // Create skip link element
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        // Style skip link (hidden by default, visible on focus)
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--button-bg);
            color: var(--button-text);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        // Show skip link when focused
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        // Hide skip link when focus is lost
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        // Insert skip link as first element in body
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content area for skip link target
        const mainContent = document.querySelector('.content');
        if (mainContent) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('tabindex', '-1'); // Allow focus but not in tab order
        }
    }

    /**
     * Improve focus management for interactive elements
     * Ensures all interactive elements are keyboard accessible (WCAG 2.1.1)
     */
    improveFocusManagement() {
        // Get all interactive elements (buttons and links)
        const interactiveElements = document.querySelectorAll('button, a');
        interactiveElements.forEach(element => {
            // Add tabindex if not already present to ensure keyboard accessibility
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * Handle reduced motion preference
     * Respects user's system preference for reduced animations (WCAG 2.3.3)
     */
    handleReducedMotion() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable animations and transitions for better accessibility
            document.documentElement.style.setProperty('--transition-duration', '0s');
        }
    }
}

/**
 * Application Initialization
 * Initialize all components when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme switcher functionality
    new ThemeSwitcher();
    // Initialize navigation and smooth scrolling
    new NavigationHandler();
    // Initialize accessibility enhancements
    new AccessibilityHandler();
    
    // Mark page as loaded for fade-in animation
    document.body.classList.add('loaded');
});

/**
 * Dynamic CSS Injection
 * Add additional styles for dynamic components and animations
 */
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* Active navigation link styling */
    .nav-link.active {
        background-color: rgba(0, 120, 212, 0.15);
        color: var(--nav-link-hover);
        font-weight: 600;
    }
    
    /* Skip link focus state for accessibility */
    .skip-link:focus {
        outline: 2px solid var(--button-text);
        outline-offset: 2px;
    }
    
    /* Page load fade-in animation */
    body {
        opacity: 0;
        animation: fadeIn 0.5s ease-in-out forwards;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    /* Fade-in keyframes */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Theme icon transition */
    .theme-icon {
        transition: transform 0.3s ease;
    }
    
    /* Respect reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
// Inject styles into document head
document.head.appendChild(additionalStyles);