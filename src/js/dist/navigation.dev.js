"use strict";

/**
 * Navigation Module
 * Handles dot navigation, hash navigation, and section switching
 */
(function () {
  'use strict'; // Initialize Portfolio namespace

  window.Portfolio = window.Portfolio || {};
  /**
   * Setup navigation dots
   */

  function setupNavigation(sections, currentSection, goToSection, CONFIG) {
    window.log('navigationSetup', '[NAVIGATION SETUP] setupNavigation called with', sections.length, 'sections');
    var dotsContainer = document.querySelector('.section-dots');
    window.log('navigationSetup', '[NAVIGATION SETUP] Found .section-dots container:', !!dotsContainer);

    if (!dotsContainer) {
      console.error('[NAVIGATION SETUP] ERROR: .section-dots container not found in DOM!');
      return;
    }

    var servicesIndex = sections.findIndex(function (s) {
      return s && s.id === 'services';
    });
    window.Portfolio.servicesSectionIndex = servicesIndex >= 0 ? servicesIndex : -1; // Set configurable position

    document.documentElement.style.setProperty('--dot-nav-right-position', "".concat(CONFIG.navigation.dotPosition, "px")); // Clear existing dots

    dotsContainer.innerHTML = '';
    window.log('navigationSetup', '[NAVIGATION SETUP] Cleared existing dots'); // Create dots for each section

    window.log('navigationSetup', '[NAVIGATION SETUP] Creating dots for', sections.length, 'sections');
    sections.forEach(function (section, index) {
      if (!section) return; // Create container for dot and label

      var dotContainer = document.createElement('div');
      dotContainer.className = 'section-dot-container'; // Create dot and label

      var dot = document.createElement('div');
      dot.className = 'section-dot';
      if (index === currentSection) dot.classList.add('active', 'effect-pulse');
      var label = document.createElement('div');
      label.className = 'section-dot-label';
      var sectionId = section.id || "section-".concat(index + 1);
      var displayName = section.dataset.name || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      label.textContent = displayName; // Add elements and click event

      dotContainer.appendChild(label);
      dotContainer.appendChild(dot);
      dotContainer.addEventListener('click', function () {
        // isAnimating will be passed as a parameter or accessed globally
        if (!window.isAnimating && index !== window.currentSection) {
          goToSection(index, false, window.CONFIG);
        }
      });
      dotsContainer.appendChild(dotContainer);
      window.log('navigationSetup', '[NAVIGATION SETUP] Created dot', index, 'for section', section.id);
    });
    window.log('navigationSetup', '[NAVIGATION SETUP] Created', dotsContainer.children.length, 'total dots'); // Add anchor navigation

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = anchor.getAttribute('href');
        var targetSection = document.querySelector(targetId);

        if (targetSection) {
          var index = sections.indexOf(targetSection);
          if (index > -1) goToSection(index, false, window.CONFIG);
        }
      });
    }); // Set initial dot state immediately

    updateNavigation(currentSection, true, CONFIG); // Plan B (mobile only): Throttle resize to avoid layout thrash (150ms)

    var resizeRaf = null;
    var resizeTimeout = null;
    var RESIZE_THROTTLE_MS = 150;
    var mobileMatch = window.matchMedia && window.matchMedia('(max-width: 768px)');
    window.addEventListener('resize', function () {
      if (mobileMatch && !mobileMatch.matches) {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = null;
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = null;
        resizeRaf = requestAnimationFrame(function () {
          resizeRaf = null;
          var activeIndex = typeof window.currentSection === 'number' ? window.currentSection : -1;

          if (activeIndex === window.Portfolio.servicesSectionIndex) {
            alignSectionDotsWithServices(activeIndex);
          }
        });
        return;
      }

      if (!mobileMatch || !mobileMatch.matches) return;
      if (resizeTimeout) return;
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () {
        resizeRaf = null;
        resizeTimeout = setTimeout(function () {
          resizeTimeout = null;
          var activeIndex = typeof window.currentSection === 'number' ? window.currentSection : -1;

          if (activeIndex === window.Portfolio.servicesSectionIndex) {
            alignSectionDotsWithServices(activeIndex);
          }
        }, RESIZE_THROTTLE_MS);
      });
    });
  }
  /**
   * Align section-dots so the middle dot (Services) lines up with the "+" of the middle service card.
   * Sets --section-dots-y-offset on :root when on Services section; clears it otherwise.
   * Runs measure after layout (double rAF + short delay) so section is in final position.
   */


  function alignSectionDotsWithServices(targetIndex) {
    var servicesIndex = window.Portfolio.servicesSectionIndex;
    var root = document.documentElement;

    if (servicesIndex < 0 || targetIndex !== servicesIndex) {
      root.style.setProperty('--section-dots-y-offset', '0px');
      return;
    }

    function measureAndApply() {
      var middleHeader = document.querySelector('#services .service-categories-grid .service-category:nth-child(2) .category-header');
      var dotsContainer = document.querySelector('.section-dots');
      var middleDotContainer = dotsContainer && dotsContainer.children[servicesIndex];
      var middleDot = middleDotContainer && middleDotContainer.querySelector('.section-dot');

      if (!middleHeader || !middleDot) {
        root.style.setProperty('--section-dots-y-offset', '0px');
        return;
      }

      var hr = middleHeader.getBoundingClientRect();
      var dr = middleDot.getBoundingClientRect();
      var headerCenterY = hr.top + hr.height / 2;
      var dotCenterY = dr.top + dr.height / 2;
      var offsetPx = headerCenterY - dotCenterY;
      root.style.setProperty('--section-dots-y-offset', "".concat(offsetPx, "px"));
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        measureAndApply();
        setTimeout(measureAndApply, 350);
      });
    });
  }
  /**
   * Update the active navigation dot with smooth transition
   */


  function updateNavigation(targetIndex) {
    var immediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var CONFIG = arguments.length > 2 ? arguments[2] : undefined;
    var dots = document.querySelectorAll('.section-dot');
    if (!dots.length) return; // Use global CONFIG as fallback if not provided

    var config = CONFIG || window.CONFIG; // Reset all dots to inactive state

    dots.forEach(function (dot) {
      dot.classList.remove('active', 'effect-pulse');

      if (immediate) {
        gsap.set(dot, {
          scale: 1
        });
      } else {
        gsap.to(dot, {
          scale: 1,
          duration: config.animation.duration * 0.6,
          ease: "power2.out"
        });
      }
    }); // Animate new active dot

    if (dots[targetIndex]) {
      var activeDot = dots[targetIndex];
      activeDot.classList.add('active', 'effect-pulse');

      if (immediate) {
        gsap.set(activeDot, {
          scale: 1.3
        });
      } else {
        gsap.to(activeDot, {
          scale: 1.3,
          duration: config.animation.duration,
          ease: "back.out(1.2)"
        });
      }
    }
  }
  /**
   * 🚀 ENHANCED: Priority 3 - Immediate state update with async visual transition
   * Updates navigation state synchronously, then animates visual transition asynchronously
   */


  function updateNavigationImmediate(targetIndex, CONFIG) {
    var transactionId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var dots = document.querySelectorAll('.section-dot');
    if (!dots.length) return; // Use global CONFIG as fallback if not provided

    var config = CONFIG || window.CONFIG;
    window.log('navigationDots', "[NAV DOTS #".concat(transactionId, "] Immediate state update to section ").concat(targetIndex));
    var servicesIndex = window.Portfolio.servicesSectionIndex;

    if (targetIndex !== servicesIndex) {
      document.documentElement.style.setProperty('--section-dots-y-offset', '0px');
    } // 🚀 PRIORITY 3: Update state IMMEDIATELY (synchronous)


    dots.forEach(function (dot, index) {
      if (index === targetIndex) {
        dot.classList.add('active', 'effect-pulse');
      } else {
        dot.classList.remove('active', 'effect-pulse');
      }
    }); // 🚀 Async visual transition (non-blocking)

    requestAnimationFrame(function () {
      if (targetIndex === servicesIndex) {
        alignSectionDotsWithServices(targetIndex);
      } // Validate transaction before animating


      if (transactionId && window.Portfolio.scroll && transactionId !== window.Portfolio.scroll.getCurrentTransactionId()) {
        window.log('navigationDots', "[NAV DOTS #".concat(transactionId, "] Visual animation cancelled - transaction invalidated"));
        return;
      } // Animate inactive dots


      dots.forEach(function (dot, index) {
        if (index !== targetIndex) {
          gsap.to(dot, {
            scale: 1,
            duration: config.animation.duration * 0.5,
            ease: "power2.out",
            overwrite: true
          });
        }
      }); // Animate active dot

      if (dots[targetIndex]) {
        gsap.to(dots[targetIndex], {
          scale: 1.3,
          duration: config.animation.duration * 0.6,
          ease: "back.out(1.2)",
          overwrite: true
        });
      }

      window.log('navigationDots', "[NAV DOTS #".concat(transactionId, "] Visual animation completed"));
    });
  }
  /**
   * Handle initial navigation (e.g., from URL hash)
   */


  function handleInitialNavigation(sections, goToSection, animateBannerContent) {
    // Check for hash in URL
    var hash = window.location.hash;

    if (hash) {
      var targetSection = document.querySelector(hash);

      if (targetSection) {
        var index = sections.indexOf(targetSection);

        if (index > -1) {
          setTimeout(function () {
            return goToSection(index, false, window.CONFIG);
          }, 300);
          return;
        }
      }
    } // If no valid hash or on banner, animate first section


    var bannerSection = document.getElementById('banner');
    if (bannerSection) animateBannerContent(bannerSection, true);
  } // Expose navigation functions


  window.Portfolio.navigation = {
    setupNavigation: setupNavigation,
    updateNavigation: updateNavigation,
    updateNavigationImmediate: updateNavigationImmediate,
    // 🚀 New: Priority 3 immediate state update
    handleInitialNavigation: handleInitialNavigation
  };

  if (window.Portfolio.debug) {
    window.log('initialization', '[NAVIGATION] Module loaded successfully with Priority 3 immediate updates');
  }
})();