/**
 * Portfolio Site - Main JavaScript
 * Streamlined version with modular functionality
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);

// ======= CONFIGURATION =======
const CONFIG = {
  // Animation settings
  animation: {
    duration: 0.6,  // 📌 Base duration for animations
    stagger: 0.04,  // 📌 Stagger timing for sequential animations
    easeIn: "power2.in",
    easeOut: "power2.out",
    fadeSpeed: 0.8,  // 📌 Fade speed multiplier
  },
  glass: { 
    height: '650px', 
    duration: 0.5  // 📌 Glass container animation duration
  },
  navigation: {
    dotPosition: 65,
    scrollThrottle: 500,
    wheelSpeed: 5
  },
  // Scroll button appearance settings
  scrollButtons: {
    initialDelay: 2.5, // seconds - delay before showing on banner
    showDuration: 0.3, // animation duration for appearance
    showEase: "power2.inOut"
  },
  // Services section accordion settings
  services: {
    autoExpandOnEntry: true,        // Enable/disable auto-expansion on section entry
    
    // ========== TIMING SETTINGS ==========
    startDelay: 0,                // Delay before first card starts appearing (ms)
    expansionDelay: 400,            // Delay between each card appearing (ms)
    
    // ========== CONTAINER ANIMATION SETTINGS ==========
    // Animation when the card container itself appears
    containerAnimation: {
      duration: 0.5,                // How long the container takes to appear (seconds)
      ease: 'back.out(1.7)',        // Easing function (back.out creates slight overshoot)
      // Initial state (where animation starts from):
      from: {
        opacity: 0,                 // Start invisible
        scale: 0.9,                 // Start slightly smaller (0.9 = 90% size)
        y: 20                       // Start 20px below final position
      },
      // Final state (where animation ends):
      to: {
        opacity: 1,                 // End fully visible
        scale: 1,                   // End at normal size
        y: 0                        // End at final position
      }
    },
    
    // ========== CONTENT ANIMATION SETTINGS ==========
    // Animation for service items inside the accordion (after container appears)
    contentAnimation: {
      delayAfterContainer: 0.1,     // Delay after container appears before content starts (seconds)
      itemDuration: 0.4,            // Duration for each service item (seconds)
      itemStagger: 0.18,            // Delay between each service item appearing (seconds)
      itemEase: 'power2.out(1.2)',    // Easing for service items
      // Initial state for service items:
      itemFrom: {
        opacity: 0,
        y: 20                       // Items start 20px below
      },
      // Final state for service items:
      itemTo: {
        opacity: 1,
        y: 0
      }
    },
    
    // ========== CTA BUTTON ANIMATION SETTINGS ==========
    // Animation for the "Start Your Project →" button
    ctaAnimation: {
      delay: 0.9,                   // Delay after content starts (seconds)
      duration: 0.3,                // Button animation duration (seconds)
      ease: 'power2.out',           // Easing for button
      from: {
        opacity: 0,
        y: 10                       // Button starts 10px below
      },
      to: {
        opacity: 1,
        y: 0
      }
    }
  },
  // 🚀 ENHANCED: Advanced Animation Interruption System
  interruption: {
    // Smart debouncing settings
    debounceWindow: 150, // ms - debounce window for scroll events (higher = more time to detect bursts)
    
    // Scroll burst detection for section skipping
    scrollBurst: {
      enabled: false,          // DISABLED - section skipping proved unreliable with Observer event behavior
                               // Always go to adjacent section for predictable, smooth navigation
      minBurstCount: 2         // (Not used when disabled)
    },
    
    // Progressive state lock system
    lockThreshold: 0.7, // Lock during first 70% of animation (0.0-1.0)
    lockoutPeriod: 150, // ms - brief lockout after animation completes
    
    // Priority-based interruption delays 
    priority: {
      content: 0,       // Priority 1: Immediate (main section content)
      glass: 150,       // Priority 2: Stable-point detection (glass container)
      nav: 0,           // Priority 3: Immediate state, async visual (navigation dots)
      logo: 100         // Priority 4: Queued with skip (logo rotation)
    },
    
    // Section skip optimization
    skipOptimization: {
      enabled: true,
      contextualEasing: {
        adjacent: { duration: 0.6, ease: 'power2.out' },      // 1 section
        mediumSkip: { duration: 0.8, ease: 'power2.inOut' },  // 2 sections
        largeSkip: { duration: 1.0, ease: 'power3.inOut' }    // 3+ sections
      }
    },
    
    // Transaction system
    enableTransactionValidation: true, // Prevent race conditions
    cancelPendingOnInterrupt: true,    // Kill all pending animations on interrupt
    
    // Debug settings (set true only when debugging scroll/interruption)
    debug: false,
    logTransactionIds: false
  },
  
  // 🆕 SCROLL TOAST MESSAGE SYSTEM (Desktop Only)
  // ============================================================================
  // Shows "Not so fast?" message when user attempts rapid scrolling
  // Customizable text, icon, and timing
  // ============================================================================
  scrollMessage: {
    enabled: true,                // Toggle feature on/off
    minScrollsToTrigger: 5,       // Show after X burst scrolls in a row
    message: "Not too fast?",      // Customizable message text
    icon: "",                     // Icon (emoji or leave empty: "")
                                   // Examples: "⚡" "🚀" "⏸️" "🛑" or ""
    duration: 2000,                // ms - how long message stays visible
    cooldown: 3000,                // ms - prevent message spam (time before can show again)
    slideDistance: 400,            // px - distance to slide in from right
    animationDuration: 0.4,        // seconds - slide-in animation speed
    ease: 'power2.out',            // GSAP easing function
    desktopOnly: true              // Hide on mobile/tablet (recommended: true)
  },
  
  // Global debug flag
  debug: true
};

// ======= CONSOLE LOGGING CONTROL =======
// All categories off by default for clean console. To enable in browser console:
//   window.DEBUG.scrollManager = true;   // scroll handling
//   Object.keys(window.DEBUG).forEach(k => window.DEBUG[k] = true);  // enable all
window.DEBUG = {
  scrollManager: false,
  scrollToast: false,
  sectionTransition: false,
  exitAnimation: false,
  entryAnimation: false,
  stateManagement: false,
  cleanup: false,
  logoQueue: false,
  glassContainer: false,
  headerAnimation: false,
  scrollButtons: false,
  navigationSetup: false,
  navigationDots: false,
  navigation: false,
  effects: false,
  initialization: false,
  main: false
};

/**
 * Centralized logging function
 * @param {string} category - Logging category from window.DEBUG
 * @param {...any} args - Arguments to log
 */
window.log = function(category, ...args) {
  if (window.DEBUG && window.DEBUG[category]) {
    console.log(...args);
  }
};

////////////////////////////////////////////////////////////////////////////////
// ======= HELPER UTILITIES =======
// DOM helpers are now provided by dom-helpers.js module
// Will be initialized after CONFIG is set
////////////////////////////////////////////////////////////////////////////////
let $q, $$q, on; 

// Initialize DOM helpers after CONFIG is available
window.Portfolio = window.Portfolio || {};
window.Portfolio.debug = CONFIG.debug;
({ $q, $$q, on } = window.Portfolio.dom);

// ======= DOM ELEMENTS =======
let sections, sectionCount, currentSection = 0;

// Make variables globally accessible for modules
window.isAnimating = false;
window.sections = null;
window.sectionCount = 0;
window.currentSection = 0;
window.CONFIG = null;

// ======= INITIALIZATION (single entry) =======
document.addEventListener('DOMContentLoaded', () => {
  // Preloader: hide immediately if already seen, otherwise animate out after delay
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');
    if (hasSeenPreloader) {
      preloader.style.display = 'none';
    } else {
      preloader.style.display = 'flex';
      preloader.style.opacity = '1';
      setTimeout(() => {
        gsap.to(preloader, {
          opacity: 0,
          duration: 3,
          ease: "power2.out",
          onComplete: () => {
            preloader.style.display = 'none';
          }
        });
        sessionStorage.setItem('hasSeenPreloader', 'true');
      }, 300);
    }
  }

  // Plan B (mobile only): pause video when tab hidden or banner off-screen
  const bgVideo = document.getElementById('bg-video');
  const banner = document.getElementById('banner');
  if (bgVideo && banner) {
    function isMobileView() {
      return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    }
    function onVisibilityChange() {
      if (!isMobileView()) return;
      if (document.hidden) {
        bgVideo.pause();
      } else {
        const r = banner.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          bgVideo.play().catch(() => {});
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (typeof IntersectionObserver !== 'undefined') {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          if (!isMobileView()) return;
          const e = entries[0];
          if (!e || e.target !== banner) return;
          if (e.isIntersecting) {
            if (!document.hidden) bgVideo.play().catch(() => {});
          } else {
            bgVideo.pause();
          }
        },
        { threshold: 0.1, root: null }
      );
      videoObserver.observe(banner);
    }
  }

  // Short delay then full site init
  setTimeout(initSite, 100);
});

// ======= DESKTOP LAYOUT RESET =======
/**
 * Restore desktop layout when switching from mobile to desktop viewport.
 * Call when resize detects transition from <=768px to >768px.
 * - Removes header.mobile and menu.active (closes mobile menu, restores desktop nav)
 * - Clears navigation dots offset
 * - On Services section at desktop (900px+): resets services wrapper and expands all accordions
 */
function resetDesktopLayout() {
  const header = document.getElementById('header');
  const menu = document.querySelector('#header .menu-wrapper ul.menu');
  if (header) header.classList.remove('mobile');
  if (menu) menu.classList.remove('active');
  document.documentElement.style.setProperty('--section-dots-y-offset', '0px');

  const isDesktopServices = window.matchMedia && window.matchMedia('(min-width: 900px)').matches;
  const servicesSection = document.getElementById('services');
  const onServices = servicesSection && window.sections && typeof window.currentSection === 'number' &&
    window.sections.indexOf(servicesSection) === window.currentSection;

  if (isDesktopServices && onServices && window.Portfolio.serviceAccordions && window.Portfolio.serviceAccordions.length) {
    const wrapper = window.Portfolio.serviceAccordions[0].element.closest('.services-wrapper');
    if (wrapper) gsap.set(wrapper, { y: 0 });
    window.Portfolio.serviceAccordions.forEach(accordion => {
      gsap.killTweensOf(accordion.element);
      gsap.killTweensOf(accordion.content);
      if (!accordion.isExpanded) accordion.expand();
    });
  }

  window.log('initialization', '[RESET] Desktop layout reset applied');
}

/**
 * Collapse all service accordions when entering mobile/tablet viewport (e.g. from desktop).
 * Call when resize detects transition from >=900px to <900px and user is on Services section.
 */
function collapseServicesForMobileView() {
  const servicesSection = document.getElementById('services');
  const onServices = servicesSection && window.sections && typeof window.currentSection === 'number' &&
    window.sections.indexOf(servicesSection) === window.currentSection;
  if (!onServices || !window.Portfolio.serviceAccordions || !window.Portfolio.serviceAccordions.length) return;

  const wrapper = window.Portfolio.serviceAccordions[0].element.closest('.services-wrapper');
  if (wrapper) gsap.set(wrapper, { y: 0 });
  window.Portfolio.serviceAccordions.forEach(accordion => {
    gsap.killTweensOf(accordion.element);
    gsap.killTweensOf(accordion.content);
    if (accordion.isExpanded) accordion.collapse();
  });
  window.log('initialization', '[RESET] Services collapsed for mobile view');
}

/** Tracks viewport crossing 900px for services layout (desktop = expanded, mobile = collapsed). */
let lastViewportWasDesktopServices = true;

function setupViewportServicesReset() {
  const mq = window.matchMedia && window.matchMedia('(min-width: 900px)');
  if (!mq) return;
  lastViewportWasDesktopServices = mq.matches;
  window.addEventListener('resize', () => {
    const isDesktopServices = mq.matches;
    if (lastViewportWasDesktopServices && !isDesktopServices) collapseServicesForMobileView();
    lastViewportWasDesktopServices = isDesktopServices;
  });
}

// Expose for navigation resize and any other callers
window.Portfolio = window.Portfolio || {};
window.Portfolio.resetDesktopLayout = resetDesktopLayout;
window.Portfolio.collapseServicesForMobileView = collapseServicesForMobileView;

// ======= CORE FUNCTIONS =======

/**
 * Initialize the site
 */
function initSite() {
  sections = gsap.utils.toArray('.section');
  sectionCount = sections.length;
  
  // Make variables globally accessible
  window.sections = sections;
  window.sectionCount = sectionCount;
  window.currentSection = currentSection;
  window.CONFIG = CONFIG;

  /** On viewport <= 599px returns height with 10px offset from bottom (80px top + 10px bottom = 90px). */
  window.getGlassHeight = function() {
    if (typeof window.matchMedia !== 'undefined' && window.matchMedia('(max-width: 599px)').matches)
      return 'calc(100vh - 90px)';
    return (window.CONFIG && window.CONFIG.glass && window.CONFIG.glass.height) ? window.CONFIG.glass.height : '650px';
  };

  // Initialize translations before navigation dots are built
  if (window.Portfolio.i18n && window.Portfolio.i18n.init) {
    window.Portfolio.i18n.init();
  }
  
  // Initialize simple state management
  if (window.Portfolio.scroll && window.Portfolio.scroll.initializeSimpleState) {
    window.Portfolio.scroll.initializeSimpleState(currentSection);
    window.log('initialization', '[INIT] Simple state management initialized');
  }
  
  // 📌 ADDED: Hide all sections initially to prevent flash
  sections.forEach((section, index) => {
    if (index !== currentSection) {
      // Hide non-current sections completely
      gsap.set(section, { visibility: 'hidden', display: 'none' });
    }
  });
  
  window.Portfolio.navigation.setupNavigation(sections, currentSection, window.Portfolio.scroll.goToSection, CONFIG);
  if (window.matchMedia && window.matchMedia('(min-width: 769px)').matches && window.Portfolio.resetDesktopLayout) {
    window.Portfolio.resetDesktopLayout();
  }
  window.Portfolio.ui.setupGlassContainer();
  window.Portfolio.ui.initializeScrollToast(); // 🆕 Initialize scroll toast notification
  window.Portfolio.effects.setupButtonEffects();
  window.Portfolio.scroll.setupScrollObserver(CONFIG);
  window.Portfolio.effects.setupScrollButtonHoverEffects();
  // Updated Services Layout – 2025 Version
  window.Portfolio.effects.setupServiceAccordion(); // Initialize new accordion-based service cards
  setupViewportServicesReset(); // Collapse services when entering mobile view; desktop reset keeps them expanded
  // window.Portfolio.effects.setupFlipCardFormIntegration(); // Legacy - uncomment to restore flip cards
  
  // 🚨 CRITICAL: Set initial scroll button visibility IMMEDIATELY (elements are visible by default now)
  const scrollUpBtn = document.querySelector('.scroll-up');
  const scrollDownBtn = document.querySelector('.scroll-down');
  
  if (scrollUpBtn && scrollDownBtn) {
    // Hide both buttons initially - will be shown properly by updateScrollButtons
    gsap.set([scrollUpBtn, scrollDownBtn], {
      opacity: 0,
      visibility: "hidden"
    });
    window.log('initialization', '[INIT] Initial scroll buttons hidden - will be managed by updateScrollButtons');
  }

  // Set initial state
  if (currentSection === 0) {
    document.body.classList.add('banner-active');
    // Force remove glass container from banner
    const glassContainer = document.querySelector('.section-glass-container');
    if (glassContainer) {
      gsap.set(glassContainer, {
        opacity: 0,
        visibility: "hidden",
        display: "none"
      });
    }
    // Always animate banner on initial load
    const bannerSection = document.getElementById('banner');
    if (bannerSection) {
      // 📌 ADDED: Ensure banner section is visible before animation
      gsap.set(bannerSection, { visibility: 'visible', display: 'flex' });
      animateBannerContent(bannerSection, true);
    }
  }
  
  // Handle hash navigation on page load
  window.Portfolio.navigation.handleInitialNavigation(sections, window.Portfolio.scroll.goToSection, animateBannerContent);
  
  // Set proper scroll button visibility based on current section
  window.Portfolio.ui.updateScrollButtons();
  
  // Verify navigation elements are working properly
  window.Portfolio.ui.showNavigationElements();
  
  if (CONFIG.debug) logDebugInfo("Site initialized");
}

// handleInitialNavigation moved to navigation.js module

// setupNavigation moved to navigation.js module

// updateNavigation moved to navigation.js module

// setupScrollObserver moved to scroll.js module

// handleScrollEvent moved to scroll.js module

// interruptAndReverse moved to scroll.js module
// queueScrollDirection moved to scroll.js module  
// goToSection moved to scroll.js module

/**
 * Animate section content in or out
 */
window.animateSectionContent = function(section, isEntering) {
  if (!section) return;
  
  const isBanner = section.id === 'banner';
  
  // 📌 DEBUG: Log which section and animation type
  window.log('main', `[ANIMATION] animateSectionContent called for ${section.id}, isEntering: ${isEntering}`);
  
  // BANNER SECTIONS: Skip entirely - let animateBannerContent() handle it
  if (isBanner) {
    if (CONFIG.debug) {
      window.log('main', '[ANIMATE] Skipping animateSectionContent for banner - dedicated function handles it');
    }
    return;
  }
  
  // Select elements to animate for NON-BANNER sections only
  // Note: .service-categories-grid removed - handled by auto-expand function
  const selectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .form-left, .form-right, .services-wrapper, .flip-cards-container';
  
  const elements = section.querySelectorAll(selectors);
  if (elements.length === 0) return;
  
  if (!isEntering) {
    // EXIT ANIMATION - Updated to fade-up
    window.log('main', `[ANIMATION EXIT] Fading up ${section.id} with y: -10`);
    gsap.to(elements, {
      opacity: 0,
      y: -10,  // 📌 FASTER: Reduced to -10 for snappy responsiveness
      scale: 0.99,
      duration: CONFIG.animation.duration * CONFIG.animation.fadeSpeed,
      ease: CONFIG.animation.easeIn,
      stagger: 0,
      force3D: true,
      overwrite: true
    });
  } else {
    // Standard section entry animation (NON-BANNER only)
    window.log('main', `[ANIMATION ENTRY] Fading in ${section.id} from y: 12`);
    gsap.set(elements, { 
      opacity: 0, 
      y: 12,      // 📌 FASTER: Reduced to 12 for snappy responsiveness
      scale: 0.97, 
      force3D: true 
    });
    
    gsap.to(elements, {
      opacity: 1,
      y: 0,       // 📌 FIXED: Animate Y to 0 for fade-in effect
      scale: 1,
      duration: CONFIG.animation.duration,
      stagger: CONFIG.animation.stagger,
      ease: CONFIG.animation.easeOut,
      force3D: true,
      overwrite: true
    });
  }
}

/**
 * Reset banner content to ensure visibility before animation
 */
window.resetBannerContent = function(section) {
  if (!section) return;
  
  const headlineWrapper = section.querySelector('.headline-wrapper');
  const headlineText = section.querySelector('.headline-text');
  const h1 = section.querySelector('h1');
  const h2 = section.querySelector('h2');
  const btn = section.querySelector('.btn');
  
  // Force all banner elements to be properly positioned but NOT visible yet
  const elementsToReset = [headlineWrapper, headlineText, h1, h2, btn].filter(el => el);
  
  elementsToReset.forEach(element => {
    gsap.killTweensOf(element); // Kill any existing animations
    
    // Reset positioning and display but DON'T set opacity - let animation handle that
    gsap.set(element, {
      visibility: 'visible',
      display: element === headlineWrapper || element === headlineText ? 'flex' : 'block',
      scale: 1,
      y: 0,
      x: 0,
      rotation: 0,
      zIndex: 10,
      position: 'relative',
      clearProps: 'opacity,transform', // Clear opacity and transform - let animation set them
      force3D: false
    });
    
    // Force CSS display but NOT opacity
    element.style.visibility = 'visible';
    element.style.display = element === headlineWrapper || element === headlineText ? 'flex' : 'block';
    // DON'T set element.style.opacity - let GSAP animation handle it
  });
  
  // EXTRA: Force show the parent section too (but not opacity)
  gsap.set(section, {
    visibility: 'visible',
    display: 'flex',
    // DON'T set opacity here either
  });
  
  // EXTRA: Ensure body has correct banner class
  document.body.classList.add('banner-active');
  
  if (CONFIG.debug) {
    window.log('main', '[BANNER RESET] Reset positioning without setting opacity - let animation handle it');
    window.log('main', '[BANNER RESET] Elements found:', elementsToReset.length);
  }
}

window.animateBannerContent = function(section, isInitialLoad = false) {
  if (!section) return;

  const headlineWrapper = section.querySelector('.headline-wrapper');
  const headlineText = section.querySelector('.headline-text');
  const h1 = section.querySelector('h1');
  const h2 = section.querySelector('h2');
  const btn = section.querySelector('.btn');

  if (!headlineText) return;

  // 📌 FORCE CLEAR ANY EXISTING STYLES/ANIMATIONS
  const allElements = [headlineWrapper, headlineText, h1, h2, btn].filter(el => el);
  allElements.forEach(el => {
    gsap.killTweensOf(el);
    gsap.set(el, { clearProps: "all" });
  });

  // Ensure the parent containers are visible
  if (headlineWrapper) {
    gsap.set(headlineWrapper, {
      opacity: 1,
      visibility: 'visible',
      display: 'flex'
    });
  }

  gsap.set(headlineText, {
    opacity: 1,
    visibility: 'visible',
    display: 'flex'
  });

  // Set initial state for child elements
  const elementsToAnimate = [h1, h2, btn].filter(el => el);
  if (elementsToAnimate.length === 0) return;

  // 📌 ABSOLUTELY ENSURE FADE FROM BELOW
  window.log('main', '[BANNER] FORCING FADE FROM BELOW ANIMATION');
  
  // Set elements WAY below and invisible
  elementsToAnimate.forEach((el, index) => {
    const isInteractiveButton = el === btn;
    const initialScale = isInteractiveButton ? 1 : 0.97;
    const initialY = 60;
    const initialTransform = isInteractiveButton ? `translateY(${initialY}px)` : `translateY(${initialY}px) scale(0.9)`;

    gsap.set(el, {
      y: 15,              // 📌 FASTER: Reduced to 15 for snappy responsiveness
      opacity: 0,
      scale: initialScale,
      x: 0,               // 📌 FORCE x to 0 - no horizontal movement
      rotation: 0,
      force3D: true,
      clearProps: "transform" // Clear any CSS transforms first
    });
    
    // 📌 FORCE STYLE to ensure no CSS interference
    el.style.transform = initialTransform;
    el.style.opacity = '0';
  });

  // Create timeline for precise control
  const tl = gsap.timeline({
    onStart: () => window.log('main', '[BANNER] Starting fade from below animation'),
    onComplete: () => window.log('main', '[BANNER] Fade from below complete')
  });

  // Animate each element with stagger
  elementsToAnimate.forEach((el, index) => {
    tl.to(el, {
      y: 0,               // 📌 Move to final position
      opacity: 1,
      scale: 1,
      duration: 1.2,      // 📌 INCREASED: From 0.8 to 1.2 for CLEAR fade effect
      ease: "power2.inOut", // 📌 CHANGED: From "power2.out" to smoother "power2.inOut" - no overshoot!
      force3D: true,
      clearProps: "transform" // 📌 FIXED: Only clear transform, NOT opacity! CSS has opacity: 0 by default
    }, index * 0.3);      // Manual stagger
  });

  return tl;
}

/**
 * 📌 NEW: Animate banner text EXIT with fade-up effect
 * This creates a reversed version of the entry animation
 */
window.animateBannerExit = function(section) {
  window.log('main', `[BANNER EXIT] Function called for section: ${section ? section.id : 'null'}`);
  
  if (!section || section.id !== 'banner') {
    window.log('main', `[BANNER EXIT] Invalid section - expected banner, got: ${section ? section.id : 'null'}`);
    return;
  }
  
  const h1 = section.querySelector('h1');
  const h2 = section.querySelector('h2');
  const btn = section.querySelector('.btn');
  
  window.log('main', `[BANNER EXIT] Found elements - h1: ${!!h1}, h2: ${!!h2}, btn: ${!!btn}`);
  
  const elementsToAnimate = [h1, h2, btn].filter(el => el);
  if (elementsToAnimate.length === 0) {
    window.log('main', `[BANNER EXIT] No elements to animate found!`);
    return;
  }
  
  window.log('main', `[BANNER EXIT] Starting fade-up exit animation for ${elementsToAnimate.length} elements`);
  
  // Kill any existing animations
  gsap.killTweensOf(elementsToAnimate);
  
  // 🚨 FIX: Disable CSS transitions to prevent conflicts
  gsap.set(elementsToAnimate, { 
    transition: "none" // Override any CSS transitions that cause conflicts
  });
  
  // Fade-up exit animation - reverse of entry
  gsap.to(elementsToAnimate, {
    y: 12,               // 📌 FASTER: Reduced to 12 for snappy responsiveness
    opacity: 0,
    scale: (_, el) => (el === btn ? 1 : 0.97), // Keep banner button at scale 1 to avoid snap artifacts
    duration: 0.4,       // 📌 FASTER: Reduced duration for responsiveness
    ease: "power2.in",
    stagger: {
      each: 0.08,        // Slightly faster stagger
      from: "start"      // 📌 FIXED: Start to end for exit (reverse of entry end to start)
    },
    force3D: true,
    overwrite: true,
    onStart: () => window.log('main', `[BANNER EXIT] Animation started - moving DOWN`),
    onComplete: () => {
      // 🚨 FIX: Restore CSS transitions after animation
      gsap.set(elementsToAnimate, { 
        transition: "" // Restore CSS transitions for other interactions
      });
      window.log('main', `[BANNER EXIT] Animation completed`);
    }
  });

}

// setupGlassContainer moved to ui.js module

// updateGlassContainer moved to ui.js module

// clearAllHeaderTitles moved to ui.js module

// updateHeaderTitle moved to ui.js module
// addHeaderTitle moved to ui.js module
// hideScrollButtons moved to ui.js module
// updateScrollButtons moved to ui.js module

// setupButtonEffects moved to effects.js module

// setupMobileMenu moved to effects.js module

// setupTextAnimations moved to effects.js module

// setupScrollButtonHoverEffects moved to effects.js module

/**
 * Log debug information
 */
window.logDebugInfo = function(message) {
  if (!CONFIG.debug) return;
  window.log('main', `[DEBUG] ${message}`);
}

// ======= PUBLIC API =======
window.setAnimation = style => `Animation style set to: ${style}`;
window.setFadeSpeed = speed => {
  CONFIG.animation.fadeSpeed = Math.max(0.1, Math.min(speed, 1));
  return `Fade speed set to: ${CONFIG.animation.fadeSpeed}`;
};
window.toggleDebug = () => {
  CONFIG.debug = !CONFIG.debug;
  return `Debug mode: ${CONFIG.debug ? 'on' : 'off'}`;
};

