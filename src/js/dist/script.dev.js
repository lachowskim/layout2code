"use strict";

/**
 * Portfolio Site - Main JavaScript
 * Streamlined version with modular functionality
 */
// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer); // ======= CONFIGURATION =======

var CONFIG = {
  // Animation settings
  animation: {
    duration: 0.6,
    // 📌 Base duration for animations
    stagger: 0.04,
    // 📌 Stagger timing for sequential animations
    easeIn: "power2.in",
    easeOut: "power2.out",
    fadeSpeed: 0.8 // 📌 Fade speed multiplier

  },
  glass: {
    height: '60vh',
    duration: 0.5 // 📌 Glass container animation duration

  },
  navigation: {
    dotPosition: 65,
    scrollThrottle: 500,
    wheelSpeed: 5
  },
  // Scroll button appearance settings
  scrollButtons: {
    initialDelay: 2.5,
    // seconds - delay before showing on banner
    showDuration: 0.3,
    // animation duration for appearance
    showEase: "power2.inOut"
  },
  // 🚀 ENHANCED: Advanced Animation Interruption System
  interruption: {
    // Smart debouncing settings
    debounceWindow: 150,
    // ms - debounce window for scroll events (higher = more time to detect bursts)
    // Scroll burst detection for section skipping
    scrollBurst: {
      enabled: false,
      // DISABLED - section skipping proved unreliable with Observer event behavior
      // Always go to adjacent section for predictable, smooth navigation
      minBurstCount: 2 // (Not used when disabled)

    },
    // Progressive state lock system
    lockThreshold: 0.7,
    // Lock during first 70% of animation (0.0-1.0)
    lockoutPeriod: 150,
    // ms - brief lockout after animation completes
    // Priority-based interruption delays 
    priority: {
      content: 0,
      // Priority 1: Immediate (main section content)
      glass: 150,
      // Priority 2: Stable-point detection (glass container)
      nav: 0,
      // Priority 3: Immediate state, async visual (navigation dots)
      logo: 100 // Priority 4: Queued with skip (logo rotation)

    },
    // Section skip optimization
    skipOptimization: {
      enabled: true,
      contextualEasing: {
        adjacent: {
          duration: 0.6,
          ease: 'power2.out'
        },
        // 1 section
        mediumSkip: {
          duration: 0.8,
          ease: 'power2.inOut'
        },
        // 2 sections
        largeSkip: {
          duration: 1.0,
          ease: 'power3.inOut'
        } // 3+ sections

      }
    },
    // Transaction system
    enableTransactionValidation: true,
    // Prevent race conditions
    cancelPendingOnInterrupt: true,
    // Kill all pending animations on interrupt
    // Debug settings
    debug: true,
    // Enable interruption-specific debug logging
    logTransactionIds: true // Log transaction IDs in console

  },
  // Global debug flag
  debug: true
}; ////////////////////////////////////////////////////////////////////////////////
// ======= HELPER UTILITIES =======
// DOM helpers are now provided by dom-helpers.js module
// Will be initialized after CONFIG is set
////////////////////////////////////////////////////////////////////////////////

var $q, $$q, on; // Initialize DOM helpers after CONFIG is available

window.Portfolio = window.Portfolio || {};
window.Portfolio.debug = CONFIG.debug;
var _window$Portfolio$dom = window.Portfolio.dom;
$q = _window$Portfolio$dom.$q;
$$q = _window$Portfolio$dom.$$q;
on = _window$Portfolio$dom.on;
// ======= DOM ELEMENTS =======
var sections,
    sectionCount,
    currentSection = 0; // Make variables globally accessible for modules

window.isAnimating = false;
window.sections = null;
window.sectionCount = 0;
window.currentSection = 0;
window.CONFIG = null; // ======= INITIALIZATION =======

document.addEventListener('DOMContentLoaded', function () {
  // Initialize Splitting.js
  if (typeof Splitting === 'function') Splitting(); // Short delay to ensure everything is ready

  setTimeout(initSite, 100);
}); // jQuery initialization for backward compatibility

jQuery(document).ready(function ($) {
  // Handle preloader if it exists
  var preloader = $("#preloader");
  if (!preloader.length) return;
  var hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');

  if (hasSeenPreloader) {
    preloader.hide();
  } else {
    setTimeout(function () {
      preloader.css({
        'display': 'flex',
        'opacity': '1'
      });
      gsap.to(preloader[0], {
        opacity: 0,
        duration: 3,
        ease: "power2.out",
        onComplete: function onComplete() {
          return preloader.hide();
        }
      });
      sessionStorage.setItem('hasSeenPreloader', 'true');
    }, 300);
  } // Add mobile menu handlers


  window.Portfolio.effects.setupMobileMenu();
}); // ======= CORE FUNCTIONS =======

/**
 * Initialize the site
 */

function initSite() {
  sections = gsap.utils.toArray('.section');
  sectionCount = sections.length; // Make variables globally accessible

  window.sections = sections;
  window.sectionCount = sectionCount;
  window.currentSection = currentSection;
  window.CONFIG = CONFIG; // Initialize simple state management

  if (window.Portfolio.scroll && window.Portfolio.scroll.initializeSimpleState) {
    window.Portfolio.scroll.initializeSimpleState(currentSection);
    console.log('[INIT] Simple state management initialized');
  } // 📌 ADDED: Hide all sections initially to prevent flash


  sections.forEach(function (section, index) {
    if (index !== currentSection) {
      // Hide non-current sections completely
      gsap.set(section, {
        visibility: 'hidden',
        display: 'none'
      });
    }
  });
  window.Portfolio.navigation.setupNavigation(sections, currentSection, window.Portfolio.scroll.goToSection, CONFIG);
  window.Portfolio.ui.setupGlassContainer();
  window.Portfolio.effects.setupButtonEffects();
  window.Portfolio.scroll.setupScrollObserver(CONFIG);
  window.Portfolio.effects.setupScrollButtonHoverEffects(); // Updated Services Layout – 2025 Version

  window.Portfolio.effects.setupServiceAccordion(); // Initialize new accordion-based service cards
  // window.Portfolio.effects.setupFlipCardFormIntegration(); // Legacy - uncomment to restore flip cards
  // 🚨 CRITICAL: Set initial scroll button visibility IMMEDIATELY (elements are visible by default now)

  var scrollUpBtn = document.querySelector('.scroll-up');
  var scrollDownBtn = document.querySelector('.scroll-down');

  if (scrollUpBtn && scrollDownBtn) {
    // Hide both buttons initially - will be shown properly by updateScrollButtons
    gsap.set([scrollUpBtn, scrollDownBtn], {
      opacity: 0,
      visibility: "hidden"
    });
    console.log('[INIT] Initial scroll buttons hidden - will be managed by updateScrollButtons');
  } // Set initial state


  if (currentSection === 0) {
    document.body.classList.add('banner-active'); // Force remove glass container from banner

    var glassContainer = document.querySelector('.section-glass-container');

    if (glassContainer) {
      gsap.set(glassContainer, {
        opacity: 0,
        visibility: "hidden",
        display: "none"
      });
    } // Always animate banner on initial load


    var bannerSection = document.getElementById('banner');

    if (bannerSection) {
      // 📌 ADDED: Ensure banner section is visible before animation
      gsap.set(bannerSection, {
        visibility: 'visible',
        display: 'flex'
      });
      animateBannerContent(bannerSection, true);
    }
  } // Handle hash navigation on page load


  window.Portfolio.navigation.handleInitialNavigation(sections, window.Portfolio.scroll.goToSection, animateBannerContent); // Set proper scroll button visibility based on current section

  window.Portfolio.ui.updateScrollButtons(); // Verify navigation elements are working properly

  window.Portfolio.ui.showNavigationElements();
  if (CONFIG.debug) logDebugInfo("Site initialized");
} // handleInitialNavigation moved to navigation.js module
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


window.animateSectionContent = function (section, isEntering) {
  if (!section) return;
  var isBanner = section.id === 'banner'; // 📌 DEBUG: Log which section and animation type

  console.log("[ANIMATION] animateSectionContent called for ".concat(section.id, ", isEntering: ").concat(isEntering)); // BANNER SECTIONS: Skip entirely - let animateBannerContent() handle it

  if (isBanner) {
    if (CONFIG.debug) {
      console.log('[ANIMATE] Skipping animateSectionContent for banner - dedicated function handles it');
    }

    return;
  } // Select elements to animate for NON-BANNER sections only


  var selectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .flip-cards-container, .service-categories-grid';
  var elements = section.querySelectorAll(selectors);
  if (elements.length === 0) return;

  if (!isEntering) {
    // EXIT ANIMATION - Updated to fade-up
    console.log("[ANIMATION EXIT] Fading up ".concat(section.id, " with y: -10"));
    gsap.to(elements, {
      opacity: 0,
      y: -10,
      // 📌 FASTER: Reduced to -10 for snappy responsiveness
      scale: 0.99,
      duration: CONFIG.animation.duration * CONFIG.animation.fadeSpeed,
      ease: CONFIG.animation.easeIn,
      stagger: 0,
      force3D: true,
      overwrite: true
    });
  } else {
    // Standard section entry animation (NON-BANNER only)
    console.log("[ANIMATION ENTRY] Fading in ".concat(section.id, " from y: 12"));
    gsap.set(elements, {
      opacity: 0,
      y: 12,
      // 📌 FASTER: Reduced to 12 for snappy responsiveness
      scale: 0.97,
      force3D: true
    });
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      // 📌 FIXED: Animate Y to 0 for fade-in effect
      scale: 1,
      duration: CONFIG.animation.duration,
      stagger: CONFIG.animation.stagger,
      ease: CONFIG.animation.easeOut,
      force3D: true,
      overwrite: true
    });
  }
};
/**
 * Reset banner content to ensure visibility before animation
 */


window.resetBannerContent = function (section) {
  if (!section) return;
  var headlineWrapper = section.querySelector('.headline-wrapper');
  var headlineText = section.querySelector('.headline-text');
  var h1 = section.querySelector('h1');
  var h2 = section.querySelector('h2');
  var btn = section.querySelector('.btn'); // Force all banner elements to be properly positioned but NOT visible yet

  var elementsToReset = [headlineWrapper, headlineText, h1, h2, btn].filter(function (el) {
    return el;
  });
  elementsToReset.forEach(function (element) {
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
      clearProps: 'opacity,transform',
      // Clear opacity and transform - let animation set them
      force3D: false
    }); // Force CSS display but NOT opacity

    element.style.visibility = 'visible';
    element.style.display = element === headlineWrapper || element === headlineText ? 'flex' : 'block'; // DON'T set element.style.opacity - let GSAP animation handle it
  }); // EXTRA: Force show the parent section too (but not opacity)

  gsap.set(section, {
    visibility: 'visible',
    display: 'flex' // DON'T set opacity here either

  }); // EXTRA: Ensure body has correct banner class

  document.body.classList.add('banner-active');

  if (CONFIG.debug) {
    console.log('[BANNER RESET] Reset positioning without setting opacity - let animation handle it');
    console.log('[BANNER RESET] Elements found:', elementsToReset.length);
  }
};

window.animateBannerContent = function (section) {
  var isInitialLoad = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!section) return;
  var headlineWrapper = section.querySelector('.headline-wrapper');
  var headlineText = section.querySelector('.headline-text');
  var h1 = section.querySelector('h1');
  var h2 = section.querySelector('h2');
  var btn = section.querySelector('.btn');
  if (!headlineText) return; // 📌 FORCE CLEAR ANY EXISTING STYLES/ANIMATIONS

  var allElements = [headlineWrapper, headlineText, h1, h2, btn].filter(function (el) {
    return el;
  });
  allElements.forEach(function (el) {
    gsap.killTweensOf(el);
    gsap.set(el, {
      clearProps: "all"
    });
  }); // Ensure the parent containers are visible

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
  }); // Set initial state for child elements

  var elementsToAnimate = [h1, h2, btn].filter(function (el) {
    return el;
  });
  if (elementsToAnimate.length === 0) return; // 📌 ABSOLUTELY ENSURE FADE FROM BELOW

  console.log('[BANNER] FORCING FADE FROM BELOW ANIMATION'); // Set elements WAY below and invisible

  elementsToAnimate.forEach(function (el, index) {
    gsap.set(el, {
      y: 15,
      // 📌 FASTER: Reduced to 15 for snappy responsiveness
      opacity: 0,
      scale: 0.97,
      x: 0,
      // 📌 FORCE x to 0 - no horizontal movement
      rotation: 0,
      force3D: true,
      clearProps: "transform" // Clear any CSS transforms first

    }); // 📌 FORCE STYLE to ensure no CSS interference

    el.style.transform = "translateY(60px) scale(0.9)";
    el.style.opacity = '0';
  }); // Create timeline for precise control

  var tl = gsap.timeline({
    onStart: function onStart() {
      return console.log('[BANNER] Starting fade from below animation');
    },
    onComplete: function onComplete() {
      return console.log('[BANNER] Fade from below complete');
    }
  }); // Animate each element with stagger

  elementsToAnimate.forEach(function (el, index) {
    tl.to(el, {
      y: 0,
      // 📌 Move to final position
      opacity: 1,
      scale: 1,
      duration: 1.2,
      // 📌 INCREASED: From 0.8 to 1.2 for CLEAR fade effect
      ease: "power2.inOut",
      // 📌 CHANGED: From "power2.out" to smoother "power2.inOut" - no overshoot!
      force3D: true,
      clearProps: "transform" // 📌 FIXED: Only clear transform, NOT opacity! CSS has opacity: 0 by default

    }, index * 0.3); // Manual stagger
  });
  return tl;
};
/**
 * 📌 NEW: Animate banner text EXIT with fade-up effect
 * This creates a reversed version of the entry animation
 */


window.animateBannerExit = function (section) {
  console.log("[BANNER EXIT] Function called for section: ".concat(section ? section.id : 'null'));

  if (!section || section.id !== 'banner') {
    console.log("[BANNER EXIT] Invalid section - expected banner, got: ".concat(section ? section.id : 'null'));
    return;
  }

  var h1 = section.querySelector('h1');
  var h2 = section.querySelector('h2');
  var btn = section.querySelector('.btn');
  console.log("[BANNER EXIT] Found elements - h1: ".concat(!!h1, ", h2: ").concat(!!h2, ", btn: ").concat(!!btn));
  var elementsToAnimate = [h1, h2, btn].filter(function (el) {
    return el;
  });

  if (elementsToAnimate.length === 0) {
    console.log("[BANNER EXIT] No elements to animate found!");
    return;
  }

  console.log("[BANNER EXIT] Starting fade-up exit animation for ".concat(elementsToAnimate.length, " elements")); // Kill any existing animations

  gsap.killTweensOf(elementsToAnimate); // 🚨 FIX: Disable CSS transitions to prevent conflicts

  gsap.set(elementsToAnimate, {
    transition: "none" // Override any CSS transitions that cause conflicts

  }); // Fade-up exit animation - reverse of entry

  gsap.to(elementsToAnimate, {
    y: 12,
    // 📌 FASTER: Reduced to 12 for snappy responsiveness
    opacity: 0,
    scale: 0.97,
    // 📌 FASTER: Less dramatic scale change
    duration: 0.4,
    // 📌 FASTER: Reduced duration for responsiveness
    ease: "power2.in",
    stagger: {
      each: 0.08,
      // Slightly faster stagger
      from: "start" // 📌 FIXED: Start to end for exit (reverse of entry end to start)

    },
    force3D: true,
    overwrite: true,
    onStart: function onStart() {
      return console.log("[BANNER EXIT] Animation started - moving DOWN");
    },
    onComplete: function onComplete() {
      // 🚨 FIX: Restore CSS transitions after animation
      gsap.set(elementsToAnimate, {
        transition: "" // Restore CSS transitions for other interactions

      });
      console.log("[BANNER EXIT] Animation completed");
    }
  });
}; // setupGlassContainer moved to ui.js module
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


window.logDebugInfo = function (message) {
  if (!CONFIG.debug) return;
  console.log("[DEBUG] ".concat(message));
}; // ======= PUBLIC API =======


window.setAnimation = function (style) {
  return "Animation style set to: ".concat(style);
};

window.setFadeSpeed = function (speed) {
  CONFIG.animation.fadeSpeed = Math.max(0.1, Math.min(speed, 1));
  return "Fade speed set to: ".concat(CONFIG.animation.fadeSpeed);
};

window.toggleDebug = function () {
  CONFIG.debug = !CONFIG.debug;
  return "Debug mode: ".concat(CONFIG.debug ? 'on' : 'off');
};

console.log("CHUCK TESTING 123");