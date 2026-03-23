"use strict";

/**
 * Scroll Module
 * Handles GSAP Observer, scroll events, direction-aware interruption, and section navigation
 */
(function () {
  'use strict'; // Initialize Portfolio namespace

  window.Portfolio = window.Portfolio || {}; // Module-level variables

  var observer = null;
  var touchCleanup = null;
  var SWIPE_THRESHOLD_PX = 50;
  var MOBILE_BREAKPOINT_PX = 768;

  function isMobileView() {
    return window.matchMedia && window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT_PX + 'px)').matches;
  }
  /**
   * Setup touch swipe: swipe down = next section, swipe up = previous section.
   * Prevents default touch so native scroll doesn't conflict. One section per swipe.
   */


  function setupTouchSwipe(CONFIG) {
    var startY = 0;

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
    }

    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
    }

    function onTouchEnd(e) {
      if (e.changedTouches.length !== 1) return;
      var endY = e.changedTouches[0].clientY;
      var deltaY = endY - startY;
      if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX) return;
      e.preventDefault(); // Swipe up (finger moves up) = next section; swipe down = previous section

      var direction = deltaY < 0 ? 1 : -1;
      handleScrollEvent(direction, CONFIG);
    }

    var target = document.body;
    target.addEventListener('touchstart', onTouchStart, {
      passive: true
    });
    target.addEventListener('touchmove', onTouchMove, {
      passive: false
    });
    target.addEventListener('touchend', onTouchEnd, {
      passive: false
    });
    return function cleanup() {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
    };
  } // 🚀 ENHANCED: Advanced animation state management with transaction system


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
  }; // 🚀 SIMPLIFIED: Smart scroll manager with event deduplication

  var scrollManager = {
    lastScrollTime: 0,
    lastCountedScrollTime: 0,
    // Track when we last counted a scroll
    debounceWindow: 150,
    pendingDirection: null,
    debounceTimeout: null,
    // Track scroll bursts - how many DISTINCT user scrolls in same direction
    scrollBurstCount: 0,
    lastBurstDirection: null,
    hasTriggeredToast: false,
    // 🔧 FIX: Track if toast has been triggered in current burst
    handleScroll: function handleScroll(direction, CONFIG) {
      var _this2 = this;

      var now = Date.now(); // 🔧 FIX: Remove optional chaining for Babel compatibility

      var debounceWindow = CONFIG.interruption && CONFIG.interruption.debounceWindow || 150;
      var minScrollInterval = 60; // 🔧 ADJUSTED: 30ms → 60ms for less sensitive toast triggering
      // 🔧 DEBUG: Log current state

      window.log('scrollManager', "[SCROLL DEBUG] handleScroll called - direction: ".concat(direction, ", current count: ").concat(this.scrollBurstCount, ", hasTimeout: ").concat(!!this.debounceTimeout, ", lastDir: ").concat(this.lastBurstDirection, ", hasTriggered: ").concat(this.hasTriggeredToast)); // Check if this is a distinct scroll action (not just Observer firing multiple times)

      var timeSinceLastCount = now - this.lastCountedScrollTime;
      var isDistinctScroll = timeSinceLastCount >= minScrollInterval; // Only count distinct scrolls in same direction while debouncing

      if (this.debounceTimeout && direction === this.lastBurstDirection && isDistinctScroll) {
        this.scrollBurstCount++;
        this.lastCountedScrollTime = now;
        window.log('scrollManager', "[SCROLL MANAGER] \u2705 Continuing burst - count: ".concat(this.scrollBurstCount, ", direction: ").concat(direction));
      } else if (!this.debounceTimeout || direction !== this.lastBurstDirection) {
        // 🔧 FIX: Start count at 1 instead of 0 (this IS the first scroll in burst)
        window.log('scrollManager', "[SCROLL MANAGER] \uD83C\uDD95 NEW burst starting - direction: ".concat(direction, ", resetting count from ").concat(this.scrollBurstCount, " to 1"));
        this.scrollBurstCount = 1;
        this.lastBurstDirection = direction;
        this.lastCountedScrollTime = now;
        this.hasTriggeredToast = false; // 🔧 CRITICAL: Reset trigger flag on new burst
      } else {
        window.log('scrollManager', "[SCROLL MANAGER] \u23ED\uFE0F Observer event ignored - too soon (".concat(timeSinceLastCount, "ms < ").concat(minScrollInterval, "ms)"));
      }

      this.lastScrollTime = now;
      this.pendingDirection = direction; // Debouncing - reset timer on each scroll event

      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(function () {
        _this2.executeScroll(direction, _this2.scrollBurstCount, CONFIG); // 🔧 CRITICAL: Reset ALL state after execution


        _this2.scrollBurstCount = 0;
        _this2.lastBurstDirection = null;
        _this2.hasTriggeredToast = false;
        _this2.debounceTimeout = null; // 🔧 CRITICAL FIX: Clear timeout reference!

        if (CONFIG.debug) {
          window.log('scrollManager', '[SCROLL MANAGER] Burst complete - all state reset');
        }
      }, debounceWindow);

      if (CONFIG.debug) {
        window.log('scrollManager', "[SCROLL MANAGER] Timer reset - burstCount: ".concat(this.scrollBurstCount, ", will execute in ").concat(debounceWindow, "ms"));
      }
    },
    executeScroll: function executeScroll(direction, burstCount, CONFIG) {
      window.log('scrollManager', "[SCROLL DEBUG] executeScroll - burstCount: ".concat(burstCount, ", hasTriggered: ").concat(this.hasTriggeredToast)); // 🆕 SCROLL TOAST MESSAGE - Check AFTER burst completes
      // Trigger if burst count is AT OR ABOVE threshold (5+ rapid scrolls)

      var scrollMsgConfig = CONFIG.scrollMessage;
      var shouldTrigger = scrollMsgConfig && scrollMsgConfig.enabled && burstCount >= scrollMsgConfig.minScrollsToTrigger && !this.hasTriggeredToast;
      window.log('scrollToast', "[SCROLL TOAST DEBUG] Threshold: ".concat(scrollMsgConfig.minScrollsToTrigger, ", BurstCount: ").concat(burstCount, ", HasTriggered: ").concat(this.hasTriggeredToast, ", ShouldTrigger: ").concat(shouldTrigger));

      if (shouldTrigger) {
        if (window.Portfolio.ui && window.Portfolio.ui.showScrollToast) {
          window.log('scrollToast', "[SCROLL TOAST] \uD83D\uDD14 TRIGGERING MESSAGE - burst count ".concat(burstCount, " reached threshold ").concat(scrollMsgConfig.minScrollsToTrigger));
          window.Portfolio.ui.showScrollToast();
          this.hasTriggeredToast = true;
        }
      } else {
        window.log('scrollToast', "[SCROLL TOAST] \u274C NOT triggering - count: ".concat(burstCount, ", threshold: ").concat(scrollMsgConfig.minScrollsToTrigger, ", already triggered: ").concat(this.hasTriggeredToast));
      } // Apply CONFIG settings (scrollBurst.enabled is false in CONFIG → always adjacent section)


      var burstConfig = CONFIG.interruption && CONFIG.interruption.scrollBurst || {};
      var skipEnabled = burstConfig.enabled !== false;
      var minBurstForSkip = burstConfig.minBurstCount || 2; // How many bursts needed to skip

      if (CONFIG.debug) {
        window.log('scrollManager', "[SCROLL MANAGER] Executing scroll - direction: ".concat(direction, ", burstCount: ").concat(burstCount, ", skipEnabled: ").concat(skipEnabled));
      } // Check if we can interrupt current animation


      if (animationState.isTransitioning && !animationState.canInterrupt()) {
        if (CONFIG.debug) {
          window.log('scrollManager', "[SCROLL MANAGER] Animation locked (".concat(Math.round(animationState.animationProgress * 100), "% complete) - scroll ignored"));
        }

        return; // Just ignore the scroll if locked
      } // Determine target based on burst count


      var targetSection;

      if (skipEnabled && burstCount >= minBurstForSkip) {
        // Burst scrolling detected - skip sections
        // burstCount 2 = skip 1 section (go to +2)
        // burstCount 3 = skip 2 sections (go to +3), etc.
        var skipAmount = Math.min(burstCount, 2); // Cap at skipping 2 sections max

        targetSection = window.currentSection + direction * (skipAmount + 1); // Clamp to valid section bounds

        targetSection = Math.max(0, Math.min(targetSection, window.sectionCount - 1));

        if (CONFIG.debug) {
          window.log('scrollManager', "[SCROLL MANAGER] \uD83D\uDE80 Burst skip! ".concat(window.currentSection, " \u2192 ").concat(targetSection, " (burstCount: ").concat(burstCount, ", skip: ").concat(skipAmount, ")"));
        }
      } else {
        // Normal scroll - adjacent section only
        targetSection = window.currentSection + direction;

        if (CONFIG.debug) {
          window.log('scrollManager', "[SCROLL MANAGER] Normal scroll - adjacent only (burstCount: ".concat(burstCount, " < min: ").concat(minBurstForSkip, ")"));
        }
      } // Validate target section bounds


      if (targetSection < 0 || targetSection >= window.sectionCount) {
        if (CONFIG.debug) {
          window.log('scrollManager', "[SCROLL MANAGER] Target section ".concat(targetSection, " out of bounds - ignoring"));
        }

        return;
      }

      if (CONFIG.debug) {
        window.log('scrollManager', "[SCROLL MANAGER] \u2705 Navigation: ".concat(window.currentSection, " \u2192 ").concat(targetSection));
      } // Execute transition


      goToSection(targetSection, false, CONFIG);
    },
    reset: function reset() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
      this.pendingDirection = null;
      this.scrollBurstCount = 0;
      this.lastBurstDirection = null;
      this.lastCountedScrollTime = 0;
      this.hasTriggeredToast = false; // Reset toast trigger flag
    }
  }; // 🚀 ENHANCED: Logo rotation queue system (Priority 4 - lowest)

  var logoRotationQueue = {
    targetRotation: 0,
    rotationTimeout: null,
    queueRotation: function queueRotation(rotation) {
      var _this3 = this;

      var immediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.targetRotation = rotation;

      if (immediate) {
        this.executeRotation();
        return;
      } // Debounce: only animate if no new rotation requested in 100ms


      clearTimeout(this.rotationTimeout);
      this.rotationTimeout = setTimeout(function () {
        _this3.executeRotation();
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
      window.log('logoQueue', "[LOGO QUEUE] Rotating to ".concat(this.targetRotation, "\xB0"));
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
      window.log('stateManagement', "[STATE] Simple atomic update to section ".concat(validSection));
      return validSection;
    }
  };
  /**
   * Setup GSAP scroll observer with direction-aware interruption.
   * On mobile (viewport <= 768px): Observer uses wheel only; touch is handled by setupTouchSwipe
   * so that swipe down = next section, swipe up = previous section, without blocking touch.
   */

  function setupScrollObserver(CONFIG) {
    if (touchCleanup) {
      touchCleanup();
      touchCleanup = null;
    }

    if (observer) observer.kill();
    var isMobile = isMobileView();
    var observerType = isMobile ? 'wheel' : 'wheel,touch,pointer';
    observer = Observer.create({
      target: window,
      type: observerType,
      wheelSpeed: CONFIG.navigation.wheelSpeed,
      preventDefault: true,
      dragMinimum: 250,
      tolerance: 10,
      lockAxis: true,
      onUp: function onUp() {
        handleScrollEvent(-1, CONFIG);
      },
      onDown: function onDown() {
        handleScrollEvent(1, CONFIG);
      }
    });

    if (isMobile) {
      touchCleanup = setupTouchSwipe(CONFIG);
    }
  }
  /**
   * 🚀 ENHANCED: Handle scroll events with smart debouncing and direction detection
   */


  function handleScrollEvent(direction, CONFIG) {
    if (CONFIG.debug) {
      window.log('scrollManager', "[SCROLL] Direction: ".concat(direction, ", IsAnimating: ").concat(window.isAnimating, ", Progress: ").concat(Math.round(animationState.animationProgress * 100), "%, CurrentSection: ").concat(window.currentSection));
    } // Use smart scroll manager for all scroll handling


    scrollManager.handleScroll(direction, CONFIG);
  }
  /**
   * 🚀 ENHANCED: Comprehensive animation cleanup system
   * Priority-based cleanup: content → glass container → nav dots → logo
   */


  function killAllPendingAnimations() {
    var priority = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
    window.log('cleanup', "[CLEANUP] Killing all pending animations (priority: ".concat(priority, ")")); // Invalidate current transaction to prevent delayed callbacks from executing

    animationState.invalidateTransaction(); // Reset scroll manager state

    scrollManager.reset(); // Clear logo rotation queue

    clearTimeout(logoRotationQueue.rotationTimeout);
    logoRotationQueue.rotationTimeout = null; // Priority 1: Content animations - smart cleanup to prevent flicker

    if (priority === 'all' || priority === 'content') {
      var contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .form-left, .form-right, .services-wrapper, .flip-cards-container';
      var contentElements = document.querySelectorAll(contentSelectors); // Smart cleanup: only fast-forward if animation is nearly complete (>80%)
      // Otherwise just kill cleanly to prevent jitter

      gsap.getTweensOf(contentElements).forEach(function (tween) {
        if (tween.isActive()) {
          var progress = tween.progress();

          if (progress > 0.8) {
            tween.progress(1); // Nearly done - complete it
          } // Otherwise let it be killed cleanly

        }
      });
      gsap.killTweensOf(contentElements);
      window.log('cleanup', "[CLEANUP] Cleaned ".concat(contentElements.length, " content element animations"));
    } // Priority 2: Glass container - smart cleanup


    if (priority === 'all' || priority === 'glass') {
      var glassContainer = document.querySelector('.section-glass-container');

      if (glassContainer) {
        // Smart cleanup: only fast-forward if nearly complete
        gsap.getTweensOf(glassContainer).forEach(function (tween) {
          if (tween.isActive()) {
            var progress = tween.progress();

            if (progress > 0.8) {
              tween.progress(1); // Nearly done - complete it
            }
          }
        });
        gsap.killTweensOf(glassContainer);
        window.log('cleanup', "[CLEANUP] Cleaned glass container animations");
      }
    } // Priority 3: Navigation dots (always clean)


    if (priority === 'all' || priority === 'nav') {
      var navDots = document.querySelectorAll('.section-dot');
      gsap.killTweensOf(navDots);
      window.log('cleanup', "[CLEANUP] Killed ".concat(navDots.length, " navigation dot animations"));
    } // Priority 4: Logo rotation (always clean)


    if (priority === 'all' || priority === 'logo') {
      var arrow = document.getElementById('arrowGroup');
      var titleContainer = document.getElementById('dynamic-header-title-container');
      if (arrow) gsap.killTweensOf(arrow);

      if (titleContainer) {
        var titles = titleContainer.querySelectorAll('.header-dynamic-title');
        gsap.killTweensOf(titles);
      }

      window.log('cleanup', "[CLEANUP] Killed logo/header animations");
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
    window.log('cleanup', "[CLEANUP] All pending animations cleared");
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
      window.log('sectionTransition', "[GOTO] No transition needed - already at section ".concat(validatedIndex));
      return;
    }

    window.log('sectionTransition', "[GOTO] Starting transition: ".concat(window.currentSection, " \u2192 ").concat(validatedIndex)); // 🚀 Calculate contextual timing for section skipping

    var transitionConfig = calculateSkipTransition(window.currentSection, validatedIndex);
    var totalDuration = transitionConfig.duration;
    window.log('sectionTransition', "[GOTO] Section distance: ".concat(Math.abs(validatedIndex - window.currentSection), ", duration: ").concat(totalDuration, "s, easing: ").concat(transitionConfig.ease)); // 🚀 Clean up all pending animations before starting new transition

    killAllPendingAnimations('all'); // 🚀 Start new transaction and get unique ID

    var transactionId = animationState.startTransition(totalDuration);
    window.log('sectionTransition', "[GOTO] Transaction #".concat(transactionId, " started")); // Hide scroll buttons immediately

    if (window.Portfolio.ui && window.Portfolio.ui.hideScrollButtons) {
      window.Portfolio.ui.hideScrollButtons();
    } // Set animation lock and body class for will-change scoping (Plan B performance)


    window.isAnimating = true;
    document.body.classList.add('section-transitioning'); // Track animation direction

    var direction = validatedIndex > window.currentSection ? 1 : -1;
    animationState.currentDirection = direction; // Simple section references

    var prevIndex = window.currentSection;
    var prevSection = window.sections[prevIndex];
    var targetSection = window.sections[validatedIndex];
    var isBanner = validatedIndex === 0; // Basic validation

    if (!targetSection) {
      console.error("[GOTO] ERROR: Target section ".concat(validatedIndex, " element not found!"));
      return;
    } // When entering services: hide scroll UI instantly so no flash during entry


    if (targetSection.id === 'services') {
      var scrollDownEl = document.querySelector('.scroll-down');
      var scrollUpEl = document.querySelector('.scroll-up');

      if (scrollDownEl && scrollUpEl) {
        gsap.set([scrollDownEl, scrollUpEl], {
          opacity: 0,
          visibility: 'hidden'
        });
      }
    } // 🚀 ENHANCED: Transaction-validated promise chain
    // Step 1: Run EXIT animation FIRST while section is still visible


    runExitAnimation(prevSection, targetSection, CONFIG, transactionId).then(function () {
      // 🚀 Validate transaction before continuing
      if (transactionId !== animationState.transactionId) {
        throw new Error("Transaction ".concat(transactionId, " cancelled (current: ").concat(animationState.transactionId, ")"));
      } // Step 2: Prepare target section AFTER exit animation


      window.log("[GOTO #".concat(transactionId, "] Preparing target section ").concat(targetSection.id)); // Show target section but ensure content starts hidden to prevent flash

      gsap.set(targetSection, {
        visibility: 'visible',
        display: 'flex'
      }); // Hide content elements in target section to prevent flash
      // Note: .service-categories-grid removed - handled by auto-expand function

      if (!isBanner) {
        var contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .form-left, .form-right, .services-wrapper, .flip-cards-container';
        var contentElements = targetSection.querySelectorAll(contentSelectors);

        if (contentElements.length > 0) {
          gsap.set(contentElements, {
            opacity: 0,
            y: 12,
            // 📌 FASTER: Reduced to 12 for snappy responsiveness
            scale: 0.97
          });
          window.log("[GOTO #".concat(transactionId, "] Content hidden for ").concat(targetSection.id, " to prevent flash"));
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
          window.log("[GOTO #".concat(transactionId, "] Glass container forced hidden for banner"));
        } else {
          // Ensure glass container is in correct base state for all non-banner sections
          gsap.set(glassContainer, {
            visibility: "visible",
            display: "block",
            height: window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height,
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
          window.log("[GOTO #".concat(transactionId, "] Glass container prepared for section ").concat(validatedIndex));
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
            window.log("[GOTO #".concat(transactionId, "] Scroll complete to section ").concat(validatedIndex));
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


      window.log("[GOTO #".concat(transactionId, "] Transition completed successfully"));
      completeSectionTransition(validatedIndex, CONFIG, transactionId);
    })["catch"](function (error) {
      if (error.message.includes('cancelled')) {
        window.log("[GOTO #".concat(transactionId, "] ").concat(error.message, " - graceful exit"));
      } else {
        console.error("[GOTO #".concat(transactionId, "] Transition failed:"), error);
      } // Only reset animation state if this is still the current transaction


      if (transactionId === animationState.transactionId) {
        document.body.classList.remove('section-transitioning');
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

      window.log('sectionTransition', "[NAV UPDATE #".concat(transactionId, "] Updating navigation state to section ").concat(index)); // Clear header titles AFTER exit animation has completed

      if (window.Portfolio.ui && window.Portfolio.ui.updateHeaderTitle) {
        window.Portfolio.ui.updateHeaderTitle(prevIndex, index);
        window.log('sectionTransition', "[NAV UPDATE #".concat(transactionId, "] Header cleared after exit animation completed"));
      } // 🚀 Queue logo rotation using Priority 4 system (queued, skips intermediates)
      // 🔧 FIX: Also check if target is form section (last section) - should stay at 0°


      var targetSection = window.sections[index];
      var isFormSection = targetSection && (targetSection.id === 'form' || index === window.sectionCount - 1);

      if (isBanner || isFormSection) {
        logoRotationQueue.queueRotation(0);
        window.log('sectionTransition', "[NAV UPDATE #".concat(transactionId, "] ").concat(isBanner ? 'Banner' : 'Form', " section - arrow rotation queued to 0\xB0"));
      } // IMMEDIATE banner reset if targeting banner


      if (isBanner) {
        var bannerSection = document.getElementById('banner');

        if (bannerSection && window.resetBannerContent) {
          window.resetBannerContent(bannerSection);
          window.log('sectionTransition', "[NAV UPDATE #".concat(transactionId, "] Banner reset applied"));
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
            window.log('sectionTransition', "[NAV UPDATE #".concat(transactionId, "] Delayed nav dot update cancelled"));
            return;
          }

          if (window.Portfolio.navigation && window.Portfolio.navigation.updateNavigation) {
            window.Portfolio.navigation.updateNavigation(index, false, CONFIG);
          }

          window.log('sectionTransition', "[NAV UPDATE #".concat(transactionId, "] Navigation dots updated to section ").concat(index));
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
        window.log('exitAnimation', "[EXIT #".concat(transactionId, "] No exit animation needed - same section or no previous section"));
        resolve(); // No exit animation needed

        return;
      } // 🚨 DEBUG: Log direction and sections


      var currentIndex = window.sections.indexOf(prevSection);
      var targetIndex = window.sections.indexOf(targetSection);
      var direction = targetIndex > currentIndex ? 'DOWN' : 'UP';
      window.log('exitAnimation', "[EXIT DEBUG] Direction: ".concat(direction, ", Prev: ").concat(prevSection.id, " (").concat(currentIndex, "), Target: ").concat(targetSection.id, " (").concat(targetIndex, ")")); // 🆕 Services section doesn't use glass container

      var prevHasGlass = prevSection.id !== 'banner' && prevSection.id !== 'services';
      var targetHasGlass = targetSection.id !== 'banner' && targetSection.id !== 'services';
      var bothHaveGlass = prevHasGlass && targetHasGlass;
      var exitDuration = CONFIG.animation.fadeSpeed * 0.5;
      window.log('exitAnimation', "[EXIT START #".concat(transactionId, "] ").concat(prevSection.id, " exit animation beginning (").concat(direction, ")"));
      window.log('exitAnimation', "[EXIT DEBUG #".concat(transactionId, "] prevHasGlass: ").concat(prevHasGlass, ", targetHasGlass: ").concat(targetHasGlass, ", bothHaveGlass: ").concat(bothHaveGlass)); // 🆕 HANDLE SERVICES EXIT ANIMATION (non-glass section but needs header fadeout)

      if (prevSection.id === 'services') {
        window.log('exitAnimation', "[EXIT #".concat(transactionId, "] Services section exit - fading out header")); // Fade out header title only (logo rotation handled in entry animation)

        var titleContainer = document.getElementById('dynamic-header-title-container');

        if (titleContainer) {
          var existingTitles = titleContainer.querySelectorAll('.header-dynamic-title');

          if (existingTitles.length > 0) {
            window.log('exitAnimation', "[EXIT #".concat(transactionId, "] Fading out Services header title"));
            gsap.to(existingTitles, {
              autoAlpha: 0,
              xPercent: -100,
              duration: 0.3,
              ease: 'power2.in'
            });
          }
        }
      } // 🚀 Priority 4: Queue arrow/header exit animation (non-blocking, queued)


      if (prevHasGlass) {
        window.log('exitAnimation', "[EXIT #".concat(transactionId, "] Glass section exit - fading out header")); // Fade out header titles only (logo rotation handled in entry animation)

        var _titleContainer = document.getElementById('dynamic-header-title-container');

        if (_titleContainer) {
          var _existingTitles = _titleContainer.querySelectorAll('.header-dynamic-title');

          if (_existingTitles.length > 0) {
            window.log('exitAnimation', "[EXIT #".concat(transactionId, "] Fading ").concat(_existingTitles.length, " header titles"));
            gsap.to(_existingTitles, {
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
        window.log('exitAnimation', "[EXIT DEBUG] Starting banner exit animation for ".concat(direction, " scroll"));
        window.animateBannerExit(prevSection);
        exitDuration = 0.6; // 📌 SIMPLE: Fixed 0.6s duration

        window.log('exitAnimation', "[EXIT DEBUG] Banner exit duration set to: ".concat(exitDuration));
      } else if (prevHasGlass) {
        // 🚨 FIX: Glass container sections - ALWAYS animate content out, conditionally animate container
        window.log('exitAnimation', "[EXIT DEBUG] Starting glass section exit animation for ".concat(prevSection.id));

        if (window.Portfolio.ui && window.Portfolio.ui.animateGlassContent) {
          window.log('exitAnimation', "[EXIT DEBUG] Calling animateGlassContent(".concat(prevSection.id, ", false)"));
          window.Portfolio.ui.animateGlassContent(prevSection, false);
        } else {
          window.log('exitAnimation', "[EXIT DEBUG] animateGlassContent function not found!");
        } // Only animate glass container if target doesn't have glass


        if (!bothHaveGlass && window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
          window.log('exitAnimation', "[EXIT DEBUG] Both sections don't have glass - animating glass container out");
          window.Portfolio.ui.updateGlassContainer(prevSection, false, targetSection);
          exitDuration = 0.8; // 📌 SIMPLE: Fixed 0.8s duration for glass container
        } else {
          window.log('exitAnimation', "[EXIT DEBUG] Both sections have glass - keeping glass container, only animating content");
          exitDuration = 0.5; // 📌 SIMPLE: Fixed 0.5s duration for content only
        }

        window.log('exitAnimation', "[EXIT DEBUG] Glass section exit duration set to: ".concat(exitDuration));
      } else if (window.animateSectionContent) {
        // Standard section exit animation (form)
        window.log('exitAnimation', "[EXIT DEBUG] Starting standard section exit animation for ".concat(prevSection.id));
        window.animateSectionContent(prevSection, false);
        exitDuration = 0.5; // 📌 SIMPLE: Fixed 0.5s duration

        window.log('exitAnimation', "[EXIT DEBUG] Standard section exit duration set to: ".concat(exitDuration));
      } else {
        window.log('exitAnimation', "[EXIT DEBUG] No exit animation function found for ".concat(prevSection.id, "!"));
      } // Wait for exit animation to complete, then hide section


      window.log('exitAnimation', "[EXIT #".concat(transactionId, "] Setting delayed call for ").concat(exitDuration, "s to complete ").concat(prevSection.id, " exit"));
      gsap.delayedCall(exitDuration, function () {
        // 🚀 Validate transaction before completing exit
        if (transactionId !== animationState.transactionId) {
          window.log('exitAnimation', "[EXIT #".concat(transactionId, "] Delayed callback cancelled - transaction invalidated"));
          return;
        }

        gsap.set(prevSection, {
          visibility: 'hidden',
          display: 'none'
        }); // 🆕 RESET SERVICES ACCORDIONS when leaving Services section

        if (prevSection.id === 'services' && window.Portfolio.effects && window.Portfolio.effects.resetServiceAccordions) {
          window.log('sectionTransition', "[SERVICES #".concat(transactionId, "] Resetting accordions on exit"));
          window.Portfolio.effects.resetServiceAccordions();
        }

        window.log('exitAnimation', "[EXIT COMPLETE #".concat(transactionId, "] ").concat(prevSection.id, " exit animation finished (").concat(direction, ")"));
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

      window.log('entryAnimation', "[ENTRY START #".concat(transactionId, "] ").concat(targetSection.id, " entry animation beginning"));

      if (isBanner) {
        // Banner entry animation
        var bannerSection = document.getElementById('banner');

        if (bannerSection && window.animateBannerContent) {
          window.animateBannerContent(bannerSection, isInterrupting);
        }

        gsap.delayedCall(CONFIG.animation.duration, function () {
          // 🚀 Validate transaction before resolving
          if (transactionId !== animationState.transactionId) {
            window.log('entryAnimation', "[ENTRY #".concat(transactionId, "] Banner entry callback cancelled"));
            return;
          }

          window.log('entryAnimation', "[ENTRY COMPLETE #".concat(transactionId, "] ").concat(targetSection.id, " entry animation finished"));
          resolve();
        });
      } else {
        // 🆕 Services section doesn't use glass container (individual cards have their own glassmorphism)
        var hasGlassContainer = targetSection.id !== 'banner' && targetSection.id !== 'services';

        if (hasGlassContainer) {
          // Pass prevSection to maintain "both have glass" logic
          if (window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
            window.Portfolio.ui.updateGlassContainer(targetSection, true, prevSection, transactionId);
          } // 🚀 Priority 4: Queue arrow/header animation (will skip intermediates)


          var targetIndex = window.sections.indexOf(targetSection);
          var isFormSection = targetSection.id === 'form' || targetIndex === window.sectionCount - 1;

          if (targetIndex !== 0) {
            window.log('entryAnimation', "[ENTRY #".concat(transactionId, "] Queueing arrow and header animation for section ").concat(targetIndex)); // 🔧 FIX: Don't rotate logo in form section (last section)

            if (isFormSection) {
              // Form section - keep logo at 0 degrees (no rotation)
              logoRotationQueue.queueRotation(0);
              window.log('entryAnimation', "[ENTRY #".concat(transactionId, "] Form section detected - logo rotation set to 0\xB0"));
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
              window.log('entryAnimation', "[ENTRY #".concat(transactionId, "] Glass entry callback cancelled"));
              return;
            }

            window.log('entryAnimation', "[ENTRY COMPLETE #".concat(transactionId, "] ").concat(targetSection.id, " glass container entry finished")); // Note: Services auto-expand is now handled in non-glass path (Services doesn't use glass)

            resolve();
          });
        } else {
          // Non-glass sections (Form, Services) – ensure glass container is hidden when entering Services
          if (targetSection.id === 'services' && window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
            window.Portfolio.ui.updateGlassContainer(targetSection, false, prevSection, transactionId);
          }

          if (window.animateSectionContent) {
            window.animateSectionContent(targetSection, true);
          } // 🆕 ADD LOGO ROTATION FOR SERVICES SECTION


          var _targetIndex = window.sections.indexOf(targetSection);

          if (targetSection.id === 'services') {
            // Services section HAS header - rotate logo to -135 degrees
            logoRotationQueue.queueRotation(-135);
            window.log('sectionTransition', "[SERVICES #".concat(transactionId, "] Logo rotation queued to -135\xB0 (has header)"));
          } else {
            // Form section DOESN'T have header - rotate logo to 0 degrees
            logoRotationQueue.queueRotation(0);
            window.log('sectionTransition', "[FORM #".concat(transactionId, "] Logo rotation queued to 0\xB0 (no header)"));
          } // 🆕 ADD HEADER TITLE FOR SERVICES SECTION (it doesn't use glass container but still needs header)


          if (targetSection.id === 'services' && window.Portfolio.ui && window.Portfolio.ui.addHeaderTitle) {
            window.log('sectionTransition', "[SERVICES #".concat(transactionId, "] Adding header title for Services section"));
            window.Portfolio.ui.addHeaderTitle(_targetIndex);
          } // 🆕 AUTO-EXPAND SERVICES ACCORDIONS IMMEDIATELY (don't wait for other animations)


          if (targetSection.id === 'services' && window.Portfolio.effects && window.Portfolio.effects.autoExpandServiceAccordions) {
            window.log('sectionTransition', "[SERVICES #".concat(transactionId, "] Triggering auto-expansion immediately"));
            window.Portfolio.effects.autoExpandServiceAccordions(transactionId);
          }

          gsap.delayedCall(CONFIG.animation.duration, function () {
            // 🚀 Validate transaction before resolving
            if (transactionId !== animationState.transactionId) {
              window.log('entryAnimation', "[ENTRY #".concat(transactionId, "] Standard entry callback cancelled"));
              return;
            }

            window.log('entryAnimation', "[ENTRY COMPLETE #".concat(transactionId, "] ").concat(targetSection.id, " standard entry finished"));
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
    window.log('sectionTransition', "[TRANSITION COMPLETE #".concat(transactionId, "] Section ").concat(index, " transition finished")); // 🚀 Validate transaction

    if (transactionId !== animationState.transactionId) {
      window.log('sectionTransition', "[TRANSITION COMPLETE #".concat(transactionId, "] Completion cancelled - transaction invalidated"));
      return;
    } // 🚨 Show scroll buttons with proper delay to prevent flickering


    gsap.delayedCall(0.2, function () {
      // 🚀 Validate transaction in delayed callback
      if (transactionId !== animationState.transactionId) {
        window.log('sectionTransition', "[TRANSITION COMPLETE #".concat(transactionId, "] Scroll button update cancelled"));
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
        window.log('sectionTransition', "[TRANSITION COMPLETE #".concat(transactionId, "] Lock release cancelled"));
        return;
      }

      document.body.classList.remove('section-transitioning');
      window.isAnimating = false;
      window.log('sectionTransition', "[TRANSITION COMPLETE #".concat(transactionId, "] Animation lock released after lockout period"));

      if (CONFIG.debug && window.logDebugInfo) {
        window.logDebugInfo("Navigation to section ".concat(index, " complete"));
      }
    });
  } // Simple initialization


  function initializeSimpleState() {
    var currentSection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    simpleState.updateCurrent(currentSection);
    window.log('stateManagement', "[STATE] Simple state initialized with section ".concat(currentSection));
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
    window.log('initialization', '[SCROLL] Module loaded successfully with enhanced animation management');
  }
})();