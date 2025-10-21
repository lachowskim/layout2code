"use strict";

/**
 * Scroll Module
 * Handles GSAP Observer, scroll events, direction-aware interruption, and section navigation
 */
(function () {
  'use strict'; // Initialize Portfolio namespace

  window.Portfolio = window.Portfolio || {}; // Module-level variables

  var observer = null; // 🚀 ENHANCED: Advanced animation state management with transaction system

  var animationState = {
    transactionId: 0,
    // Unique ID for each transition to prevent race conditions
    currentDirection: 0,
    // -1 = up, 1 = down, 0 = none
    scrollTween: null,
    // Track the main scroll tween for interruption
    isTransitioning: false,
    // Overall transition state
    animationProgress: 0,
    // 0 to 1, tracks how far through animation we are
    lockThreshold: 0.7,
    // Lock during first 70% of animation (user preference)
    progressTween: null,
    // Tracks animation progress for interruption logic
    // Start a new transition with unique ID
    startTransition: function startTransition(duration) {
      var _this = this;

      this.transactionId++;
      this.isTransitioning = true;
      this.animationProgress = 0; // Kill previous progress tracker

      if (this.progressTween) {
        this.progressTween.kill();
      } // Track progress for smart interruption logic


      this.progressTween = gsap.to(this, {
        animationProgress: 1,
        duration: duration,
        ease: 'none',
        onComplete: function onComplete() {
          _this.isTransitioning = false;
          _this.animationProgress = 0;
        }
      });
      return this.transactionId;
    },
    // Check if current animation can be interrupted
    canInterrupt: function canInterrupt() {
      // Allow interruption only in final 30% or when not animating
      return !this.isTransitioning || this.animationProgress > this.lockThreshold;
    },
    // Invalidate current transaction (cancel all pending operations)
    invalidateTransaction: function invalidateTransaction() {
      this.transactionId++;
      this.isTransitioning = false;
      this.animationProgress = 0;

      if (this.progressTween) {
        this.progressTween.kill();
        this.progressTween = null;
      }
    }
  }; // 🚀 ENHANCED: Smart scroll manager with strict section skip detection

  var scrollManager = {
    lastScrollTime: 0,
    debounceWindow: 100,
    // Will be set from CONFIG
    pendingDirection: null,
    debounceTimeout: null,
    // Scroll burst tracking for aggressive skip detection
    burstScrolls: [],
    // Array of {time, direction}
    burstWindow: 200,
    // Will be set from CONFIG
    rapidThreshold: 70,
    // Will be set from CONFIG
    minRapidCount: 2,
    // Will be set from CONFIG
    skipEnabled: true,
    // Will be set from CONFIG
    handleScroll: function handleScroll(direction, CONFIG) {
      var _this2 = this;

      var now = Date.now(); // Track this scroll in burst array

      this.burstScrolls.push({
        time: now,
        direction: direction
      }); // Clean up old scrolls outside burst window

      this.burstScrolls = this.burstScrolls.filter(function (scroll) {
        return now - scroll.time < _this2.burstWindow;
      }); // Count rapid scrolls in SAME direction

      var rapidCount = 0;

      for (var i = 1; i < this.burstScrolls.length; i++) {
        var current = this.burstScrolls[i];
        var previous = this.burstScrolls[i - 1]; // Check if same direction AND rapid timing

        if (current.direction === previous.direction && current.time - previous.time < this.rapidThreshold) {
          rapidCount++;
        }
      }

      this.lastScrollTime = now;
      this.pendingDirection = direction; // Debouncing - wait for scroll to settle

      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(function () {
        _this2.executeScroll(direction, rapidCount, CONFIG);
      }, this.debounceWindow);

      if (CONFIG.debug) {
        console.log("[SCROLL MANAGER] Scroll queued - direction: ".concat(direction, ", rapidCount: ").concat(rapidCount, ", burst: ").concat(this.burstScrolls.length));
      }
    },
    executeScroll: function executeScroll(direction, rapidCount, CONFIG) {
      var _this3 = this;

      if (CONFIG.debug) {
        console.log("[SCROLL MANAGER] Executing scroll - direction: ".concat(direction, ", rapidCount: ").concat(rapidCount));
      } // Check if we can interrupt current animation


      if (animationState.isTransitioning && !animationState.canInterrupt()) {
        if (CONFIG.debug) {
          console.log("[SCROLL MANAGER] Animation locked (".concat(Math.round(animationState.animationProgress * 100), "% complete) - scroll queued"));
        } // Re-queue this scroll to try again after lock period


        this.debounceTimeout = setTimeout(function () {
          _this3.executeScroll(direction, rapidCount, CONFIG);
        }, 50);
        return;
      } // Determine target based on rapid scroll count


      var targetSection;

      if (rapidCount >= 2) {
        // Aggressive scrolling detected - skip sections
        // rapidCount 2 = skip 1 section (go to +2)
        // rapidCount 3 = skip 2 sections (go to +3), etc.
        var skipAmount = rapidCount + 1;
        targetSection = window.currentSection + direction * skipAmount; // Clamp to valid section bounds

        targetSection = Math.max(0, Math.min(targetSection, window.sectionCount - 1));

        if (CONFIG.debug) {
          console.log("[SCROLL MANAGER] \uD83D\uDE80 Section skip detected! ".concat(window.currentSection, " \u2192 ").concat(targetSection, " (skip: ").concat(skipAmount, ")"));
        }
      } else {
        // Normal scroll - adjacent section only
        targetSection = window.currentSection + direction;
      } // Validate target section bounds


      if (targetSection < 0 || targetSection >= window.sectionCount) {
        if (CONFIG.debug) {
          console.log("[SCROLL MANAGER] Target section ".concat(targetSection, " out of bounds - ignoring"));
        }

        return;
      } // Reset burst after execution


      this.burstScrolls = [];

      if (CONFIG.debug) {
        console.log("[SCROLL MANAGER] Navigation: ".concat(window.currentSection, " \u2192 ").concat(targetSection));
      } // Execute transition


      goToSection(targetSection, false, CONFIG);
    },
    reset: function reset() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
      this.pendingDirection = null;
      this.burstScrolls = [];
    }
  }; // 🚀 ENHANCED: Logo rotation queue system (Priority 4 - lowest)

  var logoRotationQueue = {
    targetRotation: 0,
    rotationTimeout: null,
    queueRotation: function queueRotation(rotation) {
      var _this4 = this;

      var immediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.targetRotation = rotation;

      if (immediate) {
        this.executeRotation();
        return;
      } // Debounce: only animate if no new rotation requested in 100ms


      clearTimeout(this.rotationTimeout);
      this.rotationTimeout = setTimeout(function () {
        _this4.executeRotation();
      }, 100);
    },
    executeRotation: function executeRotation() {
      var arrow = document.getElementById('arrowGroup');
      if (!arrow) return;
      gsap.to(arrow, {
        rotation: this.targetRotation,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true // Always overwrite previous rotation

      });
      console.log("[LOGO QUEUE] Rotating to ".concat(this.targetRotation, "\xB0"));
    }
  }; // Simple state management for atomic operations

  var simpleState = {
    validateSection: function validateSection(index) {
      return Math.max(0, Math.min(index, window.sectionCount - 1));
    },
    // Atomic update - just update the current section safely
    updateCurrent: function updateCurrent(newSection) {
      var validSection = this.validateSection(newSection);
      window.currentSection = validSection; // Update body class atomically 

      document.body.classList.toggle('banner-active', validSection === 0);
      console.log("[STATE] Simple atomic update to section ".concat(validSection));
      return validSection;
    }
  };
  /**
   * Setup GSAP scroll observer with direction-aware interruption
   */

  function setupScrollObserver(CONFIG) {
    // Kill existing observer if it exists
    if (observer) observer.kill();
    observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: CONFIG.navigation.wheelSpeed,
      preventDefault: true,
      dragMinimum: 250,
      tolerance: 10,
      // Small tolerance to prevent over-sensitivity
      lockAxis: true,
      onUp: function onUp() {
        handleScrollEvent(-1, CONFIG); // Up direction
      },
      onDown: function onDown() {
        handleScrollEvent(1, CONFIG); // Down direction
      }
    });
  }
  /**
   * 🚀 ENHANCED: Handle scroll events with smart debouncing and direction detection
   */


  function handleScrollEvent(direction, CONFIG) {
    if (CONFIG.debug) {
      console.log("[SCROLL] Direction: ".concat(direction, ", IsAnimating: ").concat(window.isAnimating, ", Progress: ").concat(Math.round(animationState.animationProgress * 100), "%, CurrentSection: ").concat(window.currentSection));
    } // Use smart scroll manager for all scroll handling


    scrollManager.handleScroll(direction, CONFIG);
  }
  /**
   * 🚀 ENHANCED: Comprehensive animation cleanup system
   * Priority-based cleanup: content → glass container → nav dots → logo
   */


  function killAllPendingAnimations() {
    var priority = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
    console.log("[CLEANUP] Killing all pending animations (priority: ".concat(priority, ")")); // Invalidate current transaction to prevent delayed callbacks from executing

    animationState.invalidateTransaction(); // Reset scroll manager state

    scrollManager.reset(); // Clear logo rotation queue

    clearTimeout(logoRotationQueue.rotationTimeout);
    logoRotationQueue.rotationTimeout = null; // Priority 1: Content animations - fast-forward to completion instead of killing

    if (priority === 'all' || priority === 'content') {
      var contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .flip-cards-container';
      var contentElements = document.querySelectorAll(contentSelectors); // Fast-forward exit animations to completion (progress: 1) instead of killing abruptly
      // This prevents visual "dip" during rapid scrolling

      gsap.getTweensOf(contentElements).forEach(function (tween) {
        if (tween.isActive()) {
          tween.progress(1); // Complete the animation instantly
        }
      });
      gsap.killTweensOf(contentElements);
      console.log("[CLEANUP] Completed ".concat(contentElements.length, " content element animations"));
    } // Priority 2: Glass container - fast-forward to completion


    if (priority === 'all' || priority === 'glass') {
      var glassContainer = document.querySelector('.section-glass-container');

      if (glassContainer) {
        // Fast-forward to completion to prevent visual dip
        gsap.getTweensOf(glassContainer).forEach(function (tween) {
          if (tween.isActive()) {
            tween.progress(1); // Complete the animation instantly
          }
        });
        gsap.killTweensOf(glassContainer);
        console.log("[CLEANUP] Completed glass container animations");
      }
    } // Priority 3: Navigation dots (always clean)


    if (priority === 'all' || priority === 'nav') {
      var navDots = document.querySelectorAll('.section-dot');
      gsap.killTweensOf(navDots);
      console.log("[CLEANUP] Killed ".concat(navDots.length, " navigation dot animations"));
    } // Priority 4: Logo rotation (always clean)


    if (priority === 'all' || priority === 'logo') {
      var arrow = document.getElementById('arrowGroup');
      var titleContainer = document.getElementById('dynamic-header-title-container');
      if (arrow) gsap.killTweensOf(arrow);

      if (titleContainer) {
        var titles = titleContainer.querySelectorAll('.header-dynamic-title');
        gsap.killTweensOf(titles);
      }

      console.log("[CLEANUP] Killed logo/header animations");
    } // Kill scroll tweens


    if (animationState.scrollTween) {
      animationState.scrollTween.kill();
      animationState.scrollTween = null;
    } // Clear scroll button timelines


    if (window.scrollButtonTimeline) {
      window.scrollButtonTimeline.kill();
      window.scrollButtonTimeline = null;
    } // Kill all GSAP delayed calls that might be pending


    gsap.globalTimeline.getChildren(true, true, true).forEach(function (child) {
      if (child.data && child.data.type === 'delayedCall') {
        child.kill();
      }
    });
    console.log("[CLEANUP] All pending animations cleared");
  }
  /**
   * 🚀 ENHANCED: Calculate contextual easing based on section distance
   * For section skipping with smooth transitions
   */


  function calculateSkipTransition(fromIndex, toIndex) {
    var distance = Math.abs(toIndex - fromIndex);

    if (distance === 1) {
      // Adjacent section: normal speed
      return {
        duration: 0.6,
        ease: 'power2.out'
      };
    } else if (distance === 2) {
      // Skip 1 section: slightly slower for smoothness
      return {
        duration: 0.8,
        ease: 'power2.inOut'
      };
    } else {
      // Skip 2+ sections: slower with smoother easing
      return {
        duration: 1.0,
        ease: 'power3.inOut'
      };
    }
  }
  /**
   * 🚀 ENHANCED: Navigate to a specific section with transaction validation and optimizations
   */


  function goToSection(index) {
    var isInterrupting = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var CONFIG = arguments.length > 2 ? arguments[2] : undefined;
    // Simple validation
    var validatedIndex = simpleState.validateSection(index);

    if (validatedIndex === window.currentSection && !isInterrupting) {
      console.log("[GOTO] No transition needed - already at section ".concat(validatedIndex));
      return;
    }

    console.log("[GOTO] Starting transition: ".concat(window.currentSection, " \u2192 ").concat(validatedIndex)); // 🚀 Calculate contextual timing for section skipping

    var transitionConfig = calculateSkipTransition(window.currentSection, validatedIndex);
    var totalDuration = transitionConfig.duration;
    console.log("[GOTO] Section distance: ".concat(Math.abs(validatedIndex - window.currentSection), ", duration: ").concat(totalDuration, "s, easing: ").concat(transitionConfig.ease)); // 🚀 Clean up all pending animations before starting new transition

    killAllPendingAnimations('all'); // 🚀 Start new transaction and get unique ID

    var transactionId = animationState.startTransition(totalDuration);
    console.log("[GOTO] Transaction #".concat(transactionId, " started")); // Hide scroll buttons immediately

    if (window.Portfolio.ui && window.Portfolio.ui.hideScrollButtons) {
      window.Portfolio.ui.hideScrollButtons();
    } // Set animation lock


    window.isAnimating = true; // Track animation direction

    var direction = validatedIndex > window.currentSection ? 1 : -1;
    animationState.currentDirection = direction; // Simple section references

    var prevIndex = window.currentSection;
    var prevSection = window.sections[prevIndex];
    var targetSection = window.sections[validatedIndex];
    var isBanner = validatedIndex === 0; // Basic validation

    if (!targetSection) {
      console.error("[GOTO] ERROR: Target section ".concat(validatedIndex, " element not found!"));
      return;
    } // 🚀 ENHANCED: Transaction-validated promise chain
    // Step 1: Run EXIT animation FIRST while section is still visible


    runExitAnimation(prevSection, targetSection, CONFIG, transactionId).then(function () {
      // 🚀 Validate transaction before continuing
      if (transactionId !== animationState.transactionId) {
        throw new Error("Transaction ".concat(transactionId, " cancelled (current: ").concat(animationState.transactionId, ")"));
      } // Step 2: Prepare target section AFTER exit animation


      console.log("[GOTO #".concat(transactionId, "] Preparing target section ").concat(targetSection.id)); // Show target section but ensure content starts hidden to prevent flash

      gsap.set(targetSection, {
        visibility: 'visible',
        display: 'flex'
      }); // Hide content elements in target section to prevent flash

      if (!isBanner) {
        var contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .flip-cards-container';
        var contentElements = targetSection.querySelectorAll(contentSelectors);

        if (contentElements.length > 0) {
          gsap.set(contentElements, {
            opacity: 0,
            y: 12,
            // 📌 FASTER: Reduced to 12 for snappy responsiveness
            scale: 0.97
          });
          console.log("[GOTO #".concat(transactionId, "] Content hidden for ").concat(targetSection.id, " to prevent flash"));
        }
      } // Glass container management


      var glassContainer = document.querySelector('.section-glass-container');

      if (glassContainer) {
        if (isBanner) {
          // Force hidden for banner
          gsap.set(glassContainer, {
            opacity: 0,
            visibility: "hidden",
            display: "none",
            scale: 0,
            clearProps: "y" // Clear any Y transforms that break centering

          });
          console.log("[GOTO #".concat(transactionId, "] Glass container forced hidden for banner"));
        } else {
          // Ensure glass container is in correct base state for all non-banner sections
          gsap.set(glassContainer, {
            visibility: "visible",
            display: "block",
            height: window.CONFIG.glass.height,
            clearProps: "y",
            // Clear any Y transforms that break centering
            position: "fixed",
            // Ensure fixed positioning
            left: "50%",
            // Center horizontally
            top: "50%",
            // Center vertically
            transform: "translate(-50%, -50%)" // Center alignment

          });
          console.log("[GOTO #".concat(transactionId, "] Glass container prepared for section ").concat(validatedIndex));
        }
      } // Step 3: Scroll to target position


      var targetY = validatedIndex * window.innerHeight;
      return new Promise(function (resolve, reject) {
        // 🚀 Validate transaction before scroll
        if (transactionId !== animationState.transactionId) {
          reject(new Error("Transaction ".concat(transactionId, " cancelled before scroll")));
          return;
        }

        animationState.scrollTween = gsap.to(window, {
          scrollTo: {
            y: targetY,
            autoKill: false
          },
          duration: 0,
          // Instant scroll
          ease: 'none',
          onComplete: function onComplete() {
            animationState.scrollTween = null;
            console.log("[GOTO #".concat(transactionId, "] Scroll complete to section ").concat(validatedIndex));
            resolve();
          }
        });
      });
    }).then(function () {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        throw new Error("Transaction ".concat(transactionId, " cancelled"));
      } // Step 4: Update navigation state atomically


      simpleState.updateCurrent(validatedIndex);
      return updateNavigationState(validatedIndex, isBanner, prevIndex, CONFIG, transactionId);
    }).then(function () {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        throw new Error("Transaction ".concat(transactionId, " cancelled"));
      } // Step 5: Run ENTRY animation


      return runEntryAnimation(targetSection, isBanner, isInterrupting, CONFIG, prevSection, transactionId);
    }).then(function () {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        throw new Error("Transaction ".concat(transactionId, " cancelled"));
      } // Step 6: Complete transition


      console.log("[GOTO #".concat(transactionId, "] Transition completed successfully"));
      completeSectionTransition(validatedIndex, CONFIG, transactionId);
    })["catch"](function (error) {
      if (error.message.includes('cancelled')) {
        console.log("[GOTO #".concat(transactionId, "] ").concat(error.message, " - graceful exit"));
      } else {
        console.error("[GOTO #".concat(transactionId, "] Transition failed:"), error);
      } // Only reset animation state if this is still the current transaction


      if (transactionId === animationState.transactionId) {
        animationState.currentDirection = 0;
        window.isAnimating = false;
      }
    });
  }
  /**
   * 🚀 ENHANCED: Update navigation state with transaction validation
   */


  function updateNavigationState(index, isBanner, prevIndex, CONFIG, transactionId) {
    return new Promise(function (resolve, reject) {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        reject(new Error("Transaction ".concat(transactionId, " cancelled in updateNavigationState")));
        return;
      }

      console.log("[NAV UPDATE #".concat(transactionId, "] Updating navigation state to section ").concat(index)); // Clear header titles AFTER exit animation has completed

      if (window.Portfolio.ui && window.Portfolio.ui.updateHeaderTitle) {
        window.Portfolio.ui.updateHeaderTitle(prevIndex, index);
        console.log("[NAV UPDATE #".concat(transactionId, "] Header cleared after exit animation completed"));
      } // 🚀 Queue logo rotation using Priority 4 system (queued, skips intermediates)
      // 🔧 FIX: Also check if target is form section (last section) - should stay at 0°


      var targetSection = window.sections[index];
      var isFormSection = targetSection && (targetSection.id === 'form' || index === window.sectionCount - 1);

      if (isBanner || isFormSection) {
        logoRotationQueue.queueRotation(0);
        console.log("[NAV UPDATE #".concat(transactionId, "] ").concat(isBanner ? 'Banner' : 'Form', " section - arrow rotation queued to 0\xB0"));
      } // IMMEDIATE banner reset if targeting banner


      if (isBanner) {
        var bannerSection = document.getElementById('banner');

        if (bannerSection && window.resetBannerContent) {
          window.resetBannerContent(bannerSection);
          console.log("[NAV UPDATE #".concat(transactionId, "] Banner reset applied"));
        }
      } // 🚀 Priority 3: Update navigation dots with immediate state, async visual


      if (window.Portfolio.navigation && window.Portfolio.navigation.updateNavigationImmediate) {
        // Use immediate update function if available
        window.Portfolio.navigation.updateNavigationImmediate(index, CONFIG, transactionId);
      } else {
        // Fallback to delayed update
        gsap.delayedCall(0.2, function () {
          // 🚀 Validate transaction before executing delayed callback
          if (transactionId !== animationState.transactionId) {
            console.log("[NAV UPDATE #".concat(transactionId, "] Delayed nav dot update cancelled"));
            return;
          }

          if (window.Portfolio.navigation && window.Portfolio.navigation.updateNavigation) {
            window.Portfolio.navigation.updateNavigation(index, false, CONFIG);
          }

          console.log("[NAV UPDATE #".concat(transactionId, "] Navigation dots updated to section ").concat(index));
        });
      }

      resolve();
    });
  }
  /**
   * 🚀 ENHANCED: Clean exit animation system with transaction validation
   */


  function runExitAnimation(prevSection, targetSection, CONFIG, transactionId) {
    return new Promise(function (resolve, reject) {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        reject(new Error("Transaction ".concat(transactionId, " cancelled in runExitAnimation")));
        return;
      }

      if (!prevSection || prevSection === targetSection) {
        console.log("[EXIT #".concat(transactionId, "] No exit animation needed - same section or no previous section"));
        resolve(); // No exit animation needed

        return;
      } // 🚨 DEBUG: Log direction and sections


      var currentIndex = window.sections.indexOf(prevSection);
      var targetIndex = window.sections.indexOf(targetSection);
      var direction = targetIndex > currentIndex ? 'DOWN' : 'UP';
      console.log("[EXIT DEBUG] Direction: ".concat(direction, ", Prev: ").concat(prevSection.id, " (").concat(currentIndex, "), Target: ").concat(targetSection.id, " (").concat(targetIndex, ")"));
      var prevHasGlass = prevSection.id !== 'banner';
      var targetHasGlass = targetSection.id !== 'banner';
      var bothHaveGlass = prevHasGlass && targetHasGlass;
      var exitDuration = CONFIG.animation.fadeSpeed * 0.5;
      console.log("[EXIT START #".concat(transactionId, "] ").concat(prevSection.id, " exit animation beginning (").concat(direction, ")"));
      console.log("[EXIT DEBUG #".concat(transactionId, "] prevHasGlass: ").concat(prevHasGlass, ", targetHasGlass: ").concat(targetHasGlass, ", bothHaveGlass: ").concat(bothHaveGlass)); // 🚀 Priority 4: Queue arrow/header exit animation (non-blocking, queued)

      if (prevHasGlass) {
        console.log("[EXIT #".concat(transactionId, "] Queueing arrow/header exit for glass section ").concat(prevSection.id)); // Queue logo rotation to 0 (will be executed after debounce)

        logoRotationQueue.queueRotation(0); // Immediately fade out header titles (Priority 4 but visible element)

        var titleContainer = document.getElementById('dynamic-header-title-container');

        if (titleContainer) {
          var existingTitles = titleContainer.querySelectorAll('.header-dynamic-title');

          if (existingTitles.length > 0) {
            console.log("[EXIT #".concat(transactionId, "] Fading ").concat(existingTitles.length, " header titles"));
            gsap.to(existingTitles, {
              autoAlpha: 0,
              xPercent: -100,
              // Exit to LEFT (reverse of entry from left)
              duration: 0.4,
              ease: 'power2.in'
            });
          }
        }
      }

      if (prevSection.id === 'banner' && window.animateBannerExit) {
        // 🚨 FIX: Banner exit animation
        console.log("[EXIT DEBUG] Starting banner exit animation for ".concat(direction, " scroll"));
        window.animateBannerExit(prevSection);
        exitDuration = 0.6; // 📌 SIMPLE: Fixed 0.6s duration

        console.log("[EXIT DEBUG] Banner exit duration set to: ".concat(exitDuration));
      } else if (prevHasGlass) {
        // 🚨 FIX: Glass container sections - ALWAYS animate content out, conditionally animate container
        console.log("[EXIT DEBUG] Starting glass section exit animation for ".concat(prevSection.id));

        if (window.Portfolio.ui && window.Portfolio.ui.animateGlassContent) {
          console.log("[EXIT DEBUG] Calling animateGlassContent(".concat(prevSection.id, ", false)"));
          window.Portfolio.ui.animateGlassContent(prevSection, false);
        } else {
          console.log("[EXIT DEBUG] animateGlassContent function not found!");
        } // Only animate glass container if target doesn't have glass


        if (!bothHaveGlass && window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
          console.log("[EXIT DEBUG] Both sections don't have glass - animating glass container out");
          window.Portfolio.ui.updateGlassContainer(prevSection, false, targetSection);
          exitDuration = 0.8; // 📌 SIMPLE: Fixed 0.8s duration for glass container
        } else {
          console.log("[EXIT DEBUG] Both sections have glass - keeping glass container, only animating content");
          exitDuration = 0.5; // 📌 SIMPLE: Fixed 0.5s duration for content only
        }

        console.log("[EXIT DEBUG] Glass section exit duration set to: ".concat(exitDuration));
      } else if (window.animateSectionContent) {
        // Standard section exit animation (form)
        console.log("[EXIT DEBUG] Starting standard section exit animation for ".concat(prevSection.id));
        window.animateSectionContent(prevSection, false);
        exitDuration = 0.5; // 📌 SIMPLE: Fixed 0.5s duration

        console.log("[EXIT DEBUG] Standard section exit duration set to: ".concat(exitDuration));
      } else {
        console.log("[EXIT DEBUG] No exit animation function found for ".concat(prevSection.id, "!"));
      } // Wait for exit animation to complete, then hide section


      console.log("[EXIT #".concat(transactionId, "] Setting delayed call for ").concat(exitDuration, "s to complete ").concat(prevSection.id, " exit"));
      gsap.delayedCall(exitDuration, function () {
        // 🚀 Validate transaction before completing exit
        if (transactionId !== animationState.transactionId) {
          console.log("[EXIT #".concat(transactionId, "] Delayed callback cancelled - transaction invalidated"));
          return;
        }

        gsap.set(prevSection, {
          visibility: 'hidden',
          display: 'none'
        });
        console.log("[EXIT COMPLETE #".concat(transactionId, "] ").concat(prevSection.id, " exit animation finished (").concat(direction, ")"));
        resolve();
      });
    });
  }
  /**
   * 🚀 ENHANCED: Clean entry animation system with transaction validation
   */


  function runEntryAnimation(targetSection, isBanner, isInterrupting, CONFIG, prevSection, transactionId) {
    return new Promise(function (resolve, reject) {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        reject(new Error("Transaction ".concat(transactionId, " cancelled in runEntryAnimation")));
        return;
      }

      console.log("[ENTRY START #".concat(transactionId, "] ").concat(targetSection.id, " entry animation beginning"));

      if (isBanner) {
        // Banner entry animation
        var bannerSection = document.getElementById('banner');

        if (bannerSection && window.animateBannerContent) {
          window.animateBannerContent(bannerSection, isInterrupting);
        }

        gsap.delayedCall(CONFIG.animation.duration, function () {
          // 🚀 Validate transaction before resolving
          if (transactionId !== animationState.transactionId) {
            console.log("[ENTRY #".concat(transactionId, "] Banner entry callback cancelled"));
            return;
          }

          console.log("[ENTRY COMPLETE #".concat(transactionId, "] ").concat(targetSection.id, " entry animation finished"));
          resolve();
        });
      } else {
        var hasGlassContainer = targetSection.id !== 'banner';

        if (hasGlassContainer) {
          // Pass prevSection to maintain "both have glass" logic
          if (window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
            window.Portfolio.ui.updateGlassContainer(targetSection, true, prevSection, transactionId);
          } // 🚀 Priority 4: Queue arrow/header animation (will skip intermediates)


          var targetIndex = window.sections.indexOf(targetSection);
          var isFormSection = targetSection.id === 'form' || targetIndex === window.sectionCount - 1;

          if (targetIndex !== 0) {
            console.log("[ENTRY #".concat(transactionId, "] Queueing arrow and header animation for section ").concat(targetIndex)); // 🔧 FIX: Don't rotate logo in form section (last section)

            if (isFormSection) {
              // Form section - keep logo at 0 degrees (no rotation)
              logoRotationQueue.queueRotation(0);
              console.log("[ENTRY #".concat(transactionId, "] Form section detected - logo rotation set to 0\xB0"));
            } else {
              // Other glass sections - rotate logo to -135 degrees
              logoRotationQueue.queueRotation(-135);
            } // Add header title immediately (visual element, Priority 3)
            // But NOT for form section (no header in form)


            if (!isFormSection && window.Portfolio.ui && window.Portfolio.ui.addHeaderTitle) {
              window.Portfolio.ui.addHeaderTitle(targetIndex);
            }
          }

          gsap.delayedCall(CONFIG.glass.duration + CONFIG.animation.duration, function () {
            // 🚀 Validate transaction before resolving
            if (transactionId !== animationState.transactionId) {
              console.log("[ENTRY #".concat(transactionId, "] Glass entry callback cancelled"));
              return;
            }

            console.log("[ENTRY COMPLETE #".concat(transactionId, "] ").concat(targetSection.id, " glass container entry finished"));
            resolve();
          });
        } else {
          // Form section
          if (window.animateSectionContent) {
            window.animateSectionContent(targetSection, true);
          }

          gsap.delayedCall(CONFIG.animation.duration, function () {
            // 🚀 Validate transaction before resolving
            if (transactionId !== animationState.transactionId) {
              console.log("[ENTRY #".concat(transactionId, "] Form entry callback cancelled"));
              return;
            }

            console.log("[ENTRY COMPLETE #".concat(transactionId, "] ").concat(targetSection.id, " standard entry finished"));
            resolve();
          });
        }
      }
    });
  }
  /**
   * 🚀 ENHANCED: Final cleanup after all animations complete with brief lockout
   */


  function completeSectionTransition(index, CONFIG, transactionId) {
    console.log("[TRANSITION COMPLETE #".concat(transactionId, "] Section ").concat(index, " transition finished")); // 🚀 Validate transaction

    if (transactionId !== animationState.transactionId) {
      console.log("[TRANSITION COMPLETE #".concat(transactionId, "] Completion cancelled - transaction invalidated"));
      return;
    } // 🚨 Show scroll buttons with proper delay to prevent flickering


    gsap.delayedCall(0.2, function () {
      // 🚀 Validate transaction in delayed callback
      if (transactionId !== animationState.transactionId) {
        console.log("[TRANSITION COMPLETE #".concat(transactionId, "] Scroll button update cancelled"));
        return;
      }

      if (window.Portfolio.ui && window.Portfolio.ui.updateScrollButtons) {
        window.Portfolio.ui.updateScrollButtons();
      }
    }); // Reset animation direction

    animationState.currentDirection = 0; // 🚀 ENHANCED: Brief lockout period (100-150ms) to prevent immediate re-trigger
    // This creates a stable window after animation completes

    gsap.delayedCall(0.15, function () {
      // 🚀 Validate transaction before releasing lock
      if (transactionId !== animationState.transactionId) {
        console.log("[TRANSITION COMPLETE #".concat(transactionId, "] Lock release cancelled"));
        return;
      }

      window.isAnimating = false;
      console.log("[TRANSITION COMPLETE #".concat(transactionId, "] Animation lock released after lockout period"));

      if (CONFIG.debug && window.logDebugInfo) {
        window.logDebugInfo("Navigation to section ".concat(index, " complete"));
      }
    });
  } // Simple initialization


  function initializeSimpleState() {
    var currentSection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    simpleState.updateCurrent(currentSection);
    console.log("[STATE] Simple state initialized with section ".concat(currentSection));
  } // Expose scroll functions and state


  window.Portfolio.scroll = {
    setupScrollObserver: setupScrollObserver,
    handleScrollEvent: handleScrollEvent,
    goToSection: goToSection,
    initializeSimpleState: initializeSimpleState,
    killAllPendingAnimations: killAllPendingAnimations,
    // Expose state for other modules
    getAnimationState: function getAnimationState() {
      return animationState;
    },
    getScrollManager: function getScrollManager() {
      return scrollManager;
    },
    getLogoRotationQueue: function getLogoRotationQueue() {
      return logoRotationQueue;
    },
    // Utility for checking if scroll is locked
    canInterrupt: function canInterrupt() {
      return animationState.canInterrupt();
    },
    // Current transaction ID for validation in other modules
    getCurrentTransactionId: function getCurrentTransactionId() {
      return animationState.transactionId;
    }
  };

  if (window.Portfolio.debug) {
    console.log('[SCROLL] Module loaded successfully with enhanced animation management');
  }
})();