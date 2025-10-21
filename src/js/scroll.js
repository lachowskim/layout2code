/**
 * Scroll Module
 * Handles GSAP Observer, scroll events, direction-aware interruption, and section navigation
 */
(function() {
  'use strict';
  
  // Initialize Portfolio namespace
  window.Portfolio = window.Portfolio || {};
  
  // Module-level variables
  let observer = null;
  
  // 🚀 ENHANCED: Advanced animation state management with transaction system
  let animationState = {
    transactionId: 0, // Unique ID for each transition to prevent race conditions
    currentDirection: 0, // -1 = up, 1 = down, 0 = none
    scrollTween: null, // Track the main scroll tween for interruption
    isTransitioning: false, // Overall transition state
    animationProgress: 0, // 0 to 1, tracks how far through animation we are
    lockThreshold: 0.7, // Lock during first 70% of animation (user preference)
    progressTween: null, // Tracks animation progress for interruption logic
    
    // Start a new transition with unique ID
    startTransition(duration) {
      this.transactionId++;
      this.isTransitioning = true;
      this.animationProgress = 0;
      
      // Kill previous progress tracker
      if (this.progressTween) {
        this.progressTween.kill();
      }
      
      // Track progress for smart interruption logic
      this.progressTween = gsap.to(this, {
        animationProgress: 1,
        duration: duration,
        ease: 'none',
        onComplete: () => {
          this.isTransitioning = false;
          this.animationProgress = 0;
        }
      });
      
      return this.transactionId;
    },
    
    // Check if current animation can be interrupted
    canInterrupt() {
      // Allow interruption only in final 30% or when not animating
      return !this.isTransitioning || this.animationProgress > this.lockThreshold;
    },
    
    // Invalidate current transaction (cancel all pending operations)
    invalidateTransaction() {
      this.transactionId++;
      this.isTransitioning = false;
      this.animationProgress = 0;
      if (this.progressTween) {
        this.progressTween.kill();
        this.progressTween = null;
      }
    } 
  };
  
  // 🚀 SIMPLIFIED: Smart scroll manager with event deduplication
  let scrollManager = {
    lastScrollTime: 0,
    lastCountedScrollTime: 0, // Track when we last counted a scroll
    debounceWindow: 150,
    pendingDirection: null,
    debounceTimeout: null,
    
    // Track scroll bursts - how many DISTINCT user scrolls in same direction
    scrollBurstCount: 0,
    lastBurstDirection: null,
    
    handleScroll(direction, CONFIG) {
      const now = Date.now();
      const debounceWindow = CONFIG.interruption?.debounceWindow || 150;
      const minScrollInterval = 50; // Scrolls must be at least 50ms apart to count as separate
      
      // Check if this is a distinct scroll action (not just Observer firing multiple times)
      const timeSinceLastCount = now - this.lastCountedScrollTime;
      const isDistinctScroll = timeSinceLastCount >= minScrollInterval;
      
      // Only count distinct scrolls in same direction while debouncing
      if (this.debounceTimeout && direction === this.lastBurstDirection && isDistinctScroll) {
        this.scrollBurstCount++;
        this.lastCountedScrollTime = now;
        if (CONFIG.debug) {
          console.log(`[SCROLL MANAGER] Distinct burst scroll - count: ${this.scrollBurstCount}, direction: ${direction}`);
        }
      } else if (!this.debounceTimeout || direction !== this.lastBurstDirection) {
        // New burst starting or direction changed
        this.scrollBurstCount = 0;
        this.lastBurstDirection = direction;
        this.lastCountedScrollTime = now;
        if (CONFIG.debug) {
          console.log(`[SCROLL MANAGER] New burst starting - direction: ${direction}`);
        }
      } else if (CONFIG.debug) {
        console.log(`[SCROLL MANAGER] Observer event ignored - too soon (${timeSinceLastCount}ms < ${minScrollInterval}ms)`);
      }
      
      this.lastScrollTime = now;
      this.pendingDirection = direction;
      
      // Debouncing - reset timer on each scroll event
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.executeScroll(direction, this.scrollBurstCount, CONFIG);
        // Reset burst tracking after execution
        this.scrollBurstCount = 0;
        this.lastBurstDirection = null;
      }, debounceWindow);
      
      if (CONFIG.debug) {
        console.log(`[SCROLL MANAGER] Timer reset - burstCount: ${this.scrollBurstCount}, will execute in ${debounceWindow}ms`);
      }
    },
    
    executeScroll(direction, burstCount, CONFIG) {
      // Apply CONFIG settings
      const burstConfig = CONFIG.interruption?.scrollBurst || {};
      const skipEnabled = burstConfig.enabled !== false;
      const minBurstForSkip = burstConfig.minBurstCount || 2; // How many bursts needed to skip
      
      if (CONFIG.debug) {
        console.log(`[SCROLL MANAGER] Executing scroll - direction: ${direction}, burstCount: ${burstCount}, skipEnabled: ${skipEnabled}`);
      }
      
      // Check if we can interrupt current animation
      if (animationState.isTransitioning && !animationState.canInterrupt()) {
        if (CONFIG.debug) {
          console.log(`[SCROLL MANAGER] Animation locked (${Math.round(animationState.animationProgress * 100)}% complete) - scroll ignored`);
        }
        return; // Just ignore the scroll if locked
      }
      
      // Determine target based on burst count
      let targetSection;
      
      if (skipEnabled && burstCount >= minBurstForSkip) {
        // Burst scrolling detected - skip sections
        // burstCount 2 = skip 1 section (go to +2)
        // burstCount 3 = skip 2 sections (go to +3), etc.
        const skipAmount = Math.min(burstCount, 2); // Cap at skipping 2 sections max
        targetSection = window.currentSection + (direction * (skipAmount + 1));
        
        // Clamp to valid section bounds
        targetSection = Math.max(0, Math.min(targetSection, window.sectionCount - 1));
        
        if (CONFIG.debug) {
          console.log(`[SCROLL MANAGER] 🚀 Burst skip! ${window.currentSection} → ${targetSection} (burstCount: ${burstCount}, skip: ${skipAmount})`);
        }
      } else {
        // Normal scroll - adjacent section only
        targetSection = window.currentSection + direction;
        if (CONFIG.debug) {
          console.log(`[SCROLL MANAGER] Normal scroll - adjacent only (burstCount: ${burstCount} < min: ${minBurstForSkip})`);
        }
      }
      
      // Validate target section bounds
      if (targetSection < 0 || targetSection >= window.sectionCount) {
        if (CONFIG.debug) {
          console.log(`[SCROLL MANAGER] Target section ${targetSection} out of bounds - ignoring`);
        }
        return;
      }
      
      if (CONFIG.debug) {
        console.log(`[SCROLL MANAGER] ✅ Navigation: ${window.currentSection} → ${targetSection}`);
      }
      
      // Execute transition
      goToSection(targetSection, false, CONFIG);
    },
    
    reset() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
      this.pendingDirection = null;
      this.scrollBurstCount = 0;
      this.lastBurstDirection = null;
      this.lastCountedScrollTime = 0;
    }
  };
  
  // 🚀 ENHANCED: Logo rotation queue system (Priority 4 - lowest)
  let logoRotationQueue = {
    targetRotation: 0,
    rotationTimeout: null,
    
    queueRotation(rotation, immediate = false) {
      this.targetRotation = rotation;
      
      if (immediate) {
        this.executeRotation();
        return;
      }
      
      // Debounce: only animate if no new rotation requested in 100ms
      clearTimeout(this.rotationTimeout);
      this.rotationTimeout = setTimeout(() => {
        this.executeRotation();
      }, 100);
    },
    
    executeRotation() {
      const arrow = document.getElementById('arrowGroup');
      if (!arrow) return;
      
      gsap.to(arrow, {
        rotation: this.targetRotation,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true // Always overwrite previous rotation
      });
      
      console.log(`[LOGO QUEUE] Rotating to ${this.targetRotation}°`);
    }
  };
  
  // Simple state management for atomic operations
  let simpleState = {
    validateSection(index) {
      return Math.max(0, Math.min(index, window.sectionCount - 1));
    },
    
    // Atomic update - just update the current section safely
    updateCurrent(newSection) {
      const validSection = this.validateSection(newSection);
      window.currentSection = validSection;
      
      // Update body class atomically 
      document.body.classList.toggle('banner-active', validSection === 0);
      
      console.log(`[STATE] Simple atomic update to section ${validSection}`);
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
      tolerance: 10, // Small tolerance to prevent over-sensitivity
      lockAxis: true,
      
      onUp: () => {
        handleScrollEvent(-1, CONFIG); // Up direction
      },
      
      onDown: () => {
        handleScrollEvent(1, CONFIG); // Down direction
      }
    });
  }
  
  /**
   * 🚀 ENHANCED: Handle scroll events with smart debouncing and direction detection
   */
  function handleScrollEvent(direction, CONFIG) {
    if (CONFIG.debug) {
      console.log(`[SCROLL] Direction: ${direction}, IsAnimating: ${window.isAnimating}, Progress: ${Math.round(animationState.animationProgress * 100)}%, CurrentSection: ${window.currentSection}`);
    }
    
    // Use smart scroll manager for all scroll handling
    scrollManager.handleScroll(direction, CONFIG);
  }
  
  /**
   * 🚀 ENHANCED: Comprehensive animation cleanup system
   * Priority-based cleanup: content → glass container → nav dots → logo
   */
  function killAllPendingAnimations(priority = 'all') {
    console.log(`[CLEANUP] Killing all pending animations (priority: ${priority})`);
    
    // Invalidate current transaction to prevent delayed callbacks from executing
    animationState.invalidateTransaction();
    
    // Reset scroll manager state
    scrollManager.reset();
    
    // Clear logo rotation queue
    clearTimeout(logoRotationQueue.rotationTimeout);
    logoRotationQueue.rotationTimeout = null;
    
    // Priority 1: Content animations - smart cleanup to prevent flicker
    if (priority === 'all' || priority === 'content') {
      const contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .flip-cards-container';
      const contentElements = document.querySelectorAll(contentSelectors);
      
      // Smart cleanup: only fast-forward if animation is nearly complete (>80%)
      // Otherwise just kill cleanly to prevent jitter
      gsap.getTweensOf(contentElements).forEach(tween => {
        if (tween.isActive()) {
          const progress = tween.progress();
          if (progress > 0.8) {
            tween.progress(1); // Nearly done - complete it
          }
          // Otherwise let it be killed cleanly
        }
      });
      
      gsap.killTweensOf(contentElements);
      console.log(`[CLEANUP] Cleaned ${contentElements.length} content element animations`);
    }
    
    // Priority 2: Glass container - smart cleanup
    if (priority === 'all' || priority === 'glass') {
      const glassContainer = document.querySelector('.section-glass-container');
      if (glassContainer) {
        // Smart cleanup: only fast-forward if nearly complete
        gsap.getTweensOf(glassContainer).forEach(tween => {
          if (tween.isActive()) {
            const progress = tween.progress();
            if (progress > 0.8) {
              tween.progress(1); // Nearly done - complete it
            }
          }
        });
        gsap.killTweensOf(glassContainer);
        console.log(`[CLEANUP] Cleaned glass container animations`);
      }
    }
    
    // Priority 3: Navigation dots (always clean)
    if (priority === 'all' || priority === 'nav') {
      const navDots = document.querySelectorAll('.section-dot');
      gsap.killTweensOf(navDots);
      console.log(`[CLEANUP] Killed ${navDots.length} navigation dot animations`);
    }
    
    // Priority 4: Logo rotation (always clean)
    if (priority === 'all' || priority === 'logo') {
      const arrow = document.getElementById('arrowGroup');
      const titleContainer = document.getElementById('dynamic-header-title-container');
      if (arrow) gsap.killTweensOf(arrow);
      if (titleContainer) {
        const titles = titleContainer.querySelectorAll('.header-dynamic-title');
        gsap.killTweensOf(titles);
      }
      console.log(`[CLEANUP] Killed logo/header animations`);
    }
    
    // Kill scroll tweens
    if (animationState.scrollTween) {
      animationState.scrollTween.kill();
      animationState.scrollTween = null;
    }
    
    // Clear scroll button timelines
    if (window.scrollButtonTimeline) {
      window.scrollButtonTimeline.kill();
      window.scrollButtonTimeline = null;
    }
    
    // Kill all GSAP delayed calls that might be pending
    gsap.globalTimeline.getChildren(true, true, true).forEach(child => {
      if (child.data && child.data.type === 'delayedCall') {
        child.kill();
      }
    });
    
    console.log(`[CLEANUP] All pending animations cleared`);
  }
  
  /**
   * 🚀 ENHANCED: Calculate contextual easing based on section distance
   * For section skipping with smooth transitions
   */
  function calculateSkipTransition(fromIndex, toIndex) {
    const distance = Math.abs(toIndex - fromIndex);
    
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
  function goToSection(index, isInterrupting = false, CONFIG) {
    // Simple validation
    const validatedIndex = simpleState.validateSection(index);
    
    if (validatedIndex === window.currentSection && !isInterrupting) {
      console.log(`[GOTO] No transition needed - already at section ${validatedIndex}`);
      return;
    }
    
    console.log(`[GOTO] Starting transition: ${window.currentSection} → ${validatedIndex}`);
    
    // 🚀 Calculate contextual timing for section skipping
    const transitionConfig = calculateSkipTransition(window.currentSection, validatedIndex);
    const totalDuration = transitionConfig.duration;
    
    console.log(`[GOTO] Section distance: ${Math.abs(validatedIndex - window.currentSection)}, duration: ${totalDuration}s, easing: ${transitionConfig.ease}`);
    
    // 🚀 Clean up all pending animations before starting new transition
    killAllPendingAnimations('all');
    
    // 🚀 Start new transaction and get unique ID
    const transactionId = animationState.startTransition(totalDuration);
    console.log(`[GOTO] Transaction #${transactionId} started`);
    
    // Hide scroll buttons immediately
    if (window.Portfolio.ui && window.Portfolio.ui.hideScrollButtons) {
      window.Portfolio.ui.hideScrollButtons();
    }
    
    // Set animation lock
    window.isAnimating = true;
    
    // Track animation direction
    const direction = validatedIndex > window.currentSection ? 1 : -1;
    animationState.currentDirection = direction;
    
    // Simple section references
    const prevIndex = window.currentSection;
    const prevSection = window.sections[prevIndex];
    const targetSection = window.sections[validatedIndex];
    const isBanner = validatedIndex === 0;
    
    // Basic validation
    if (!targetSection) {
      console.error(`[GOTO] ERROR: Target section ${validatedIndex} element not found!`);
      return;
    }
    
    // 🚀 ENHANCED: Transaction-validated promise chain
    
    // Step 1: Run EXIT animation FIRST while section is still visible
    runExitAnimation(prevSection, targetSection, CONFIG, transactionId)
      .then(() => {
        // 🚀 Validate transaction before continuing
        if (transactionId !== animationState.transactionId) {
          throw new Error(`Transaction ${transactionId} cancelled (current: ${animationState.transactionId})`);
        }
        
        // Step 2: Prepare target section AFTER exit animation
        console.log(`[GOTO #${transactionId}] Preparing target section ${targetSection.id}`);
        
        // Show target section but ensure content starts hidden to prevent flash
        gsap.set(targetSection, { 
          visibility: 'visible', 
          display: 'flex' 
        });
        
        // Hide content elements in target section to prevent flash
        if (!isBanner) {
          const contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .flip-cards-container, .service-categories-grid';
          const contentElements = targetSection.querySelectorAll(contentSelectors);
          if (contentElements.length > 0) {
            gsap.set(contentElements, {
              opacity: 0,
              y: 12,  // 📌 FASTER: Reduced to 12 for snappy responsiveness
              scale: 0.97
            });
            console.log(`[GOTO #${transactionId}] Content hidden for ${targetSection.id} to prevent flash`);
          }
        }
        
        // Glass container management
        const glassContainer = document.querySelector('.section-glass-container');
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
            console.log(`[GOTO #${transactionId}] Glass container forced hidden for banner`);
          } else {
            // Ensure glass container is in correct base state for all non-banner sections
            gsap.set(glassContainer, {
              visibility: "visible",
              display: "block",
              height: window.CONFIG.glass.height,
              clearProps: "y", // Clear any Y transforms that break centering
              position: "fixed", // Ensure fixed positioning
              left: "50%", // Center horizontally
              top: "50%", // Center vertically
              transform: "translate(-50%, -50%)" // Center alignment
            });
            console.log(`[GOTO #${transactionId}] Glass container prepared for section ${validatedIndex}`);
          }
        }
        
        // Step 3: Scroll to target position
        const targetY = validatedIndex * window.innerHeight;
        
        return new Promise((resolve, reject) => {
          // 🚀 Validate transaction before scroll
          if (transactionId !== animationState.transactionId) {
            reject(new Error(`Transaction ${transactionId} cancelled before scroll`));
            return;
          }
          
          animationState.scrollTween = gsap.to(window, {
            scrollTo: { y: targetY, autoKill: false },
            duration: 0,  // Instant scroll
            ease: 'none',
            onComplete: () => {
              animationState.scrollTween = null;
              console.log(`[GOTO #${transactionId}] Scroll complete to section ${validatedIndex}`);
              resolve();
            }
          });
        });
      })
      .then(() => {
        // 🚀 Validate transaction
        if (transactionId !== animationState.transactionId) {
          throw new Error(`Transaction ${transactionId} cancelled`);
        }
        
        // Step 4: Update navigation state atomically
        simpleState.updateCurrent(validatedIndex);
        return updateNavigationState(validatedIndex, isBanner, prevIndex, CONFIG, transactionId);
      })
      .then(() => {
        // 🚀 Validate transaction
        if (transactionId !== animationState.transactionId) {
          throw new Error(`Transaction ${transactionId} cancelled`);
        }
        
        // Step 5: Run ENTRY animation
        return runEntryAnimation(targetSection, isBanner, isInterrupting, CONFIG, prevSection, transactionId);
      })
      .then(() => {
        // 🚀 Validate transaction
        if (transactionId !== animationState.transactionId) {
          throw new Error(`Transaction ${transactionId} cancelled`);
        }
        
        // Step 6: Complete transition
        console.log(`[GOTO #${transactionId}] Transition completed successfully`);
        completeSectionTransition(validatedIndex, CONFIG, transactionId);
      })
      .catch((error) => {
        if (error.message.includes('cancelled')) {
          console.log(`[GOTO #${transactionId}] ${error.message} - graceful exit`);
        } else {
          console.error(`[GOTO #${transactionId}] Transition failed:`, error);
        }
        
        // Only reset animation state if this is still the current transaction
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
    return new Promise((resolve, reject) => {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        reject(new Error(`Transaction ${transactionId} cancelled in updateNavigationState`));
        return;
      }
      
      console.log(`[NAV UPDATE #${transactionId}] Updating navigation state to section ${index}`);
      
      // Clear header titles AFTER exit animation has completed
      if (window.Portfolio.ui && window.Portfolio.ui.updateHeaderTitle) {
        window.Portfolio.ui.updateHeaderTitle(prevIndex, index);
        console.log(`[NAV UPDATE #${transactionId}] Header cleared after exit animation completed`);
      }
      
      // 🚀 Queue logo rotation using Priority 4 system (queued, skips intermediates)
      // 🔧 FIX: Also check if target is form section (last section) - should stay at 0°
      const targetSection = window.sections[index];
      const isFormSection = targetSection && (targetSection.id === 'form' || index === window.sectionCount - 1);
      
      if (isBanner || isFormSection) {
        logoRotationQueue.queueRotation(0);
        console.log(`[NAV UPDATE #${transactionId}] ${isBanner ? 'Banner' : 'Form'} section - arrow rotation queued to 0°`);
      }
      
      // IMMEDIATE banner reset if targeting banner
      if (isBanner) {
        const bannerSection = document.getElementById('banner');
        if (bannerSection && window.resetBannerContent) {
          window.resetBannerContent(bannerSection);
          console.log(`[NAV UPDATE #${transactionId}] Banner reset applied`);
        }
      }
      
      // 🚀 Priority 3: Update navigation dots with immediate state, async visual
      if (window.Portfolio.navigation && window.Portfolio.navigation.updateNavigationImmediate) {
        // Use immediate update function if available
        window.Portfolio.navigation.updateNavigationImmediate(index, CONFIG, transactionId);
      } else {
        // Fallback to delayed update
        gsap.delayedCall(0.2, () => {
          // 🚀 Validate transaction before executing delayed callback
          if (transactionId !== animationState.transactionId) {
            console.log(`[NAV UPDATE #${transactionId}] Delayed nav dot update cancelled`);
            return;
          }
          
        if (window.Portfolio.navigation && window.Portfolio.navigation.updateNavigation) {
          window.Portfolio.navigation.updateNavigation(index, false, CONFIG);
        }
          console.log(`[NAV UPDATE #${transactionId}] Navigation dots updated to section ${index}`);
        });
      }
      
        resolve();
    });
  }
  
  /**
   * 🚀 ENHANCED: Clean exit animation system with transaction validation
   */
  function runExitAnimation(prevSection, targetSection, CONFIG, transactionId) {
    return new Promise((resolve, reject) => {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        reject(new Error(`Transaction ${transactionId} cancelled in runExitAnimation`));
        return;
      }
      
      if (!prevSection || prevSection === targetSection) {
        console.log(`[EXIT #${transactionId}] No exit animation needed - same section or no previous section`);
        resolve(); // No exit animation needed
        return;
      }
      
      // 🚨 DEBUG: Log direction and sections
      const currentIndex = window.sections.indexOf(prevSection);
      const targetIndex = window.sections.indexOf(targetSection);
      const direction = targetIndex > currentIndex ? 'DOWN' : 'UP';
      
      console.log(`[EXIT DEBUG] Direction: ${direction}, Prev: ${prevSection.id} (${currentIndex}), Target: ${targetSection.id} (${targetIndex})`);
      
      const prevHasGlass = prevSection.id !== 'banner';
      const targetHasGlass = targetSection.id !== 'banner';
      const bothHaveGlass = prevHasGlass && targetHasGlass;
      let exitDuration = CONFIG.animation.fadeSpeed * 0.5;
      
      console.log(`[EXIT START #${transactionId}] ${prevSection.id} exit animation beginning (${direction})`);
      console.log(`[EXIT DEBUG #${transactionId}] prevHasGlass: ${prevHasGlass}, targetHasGlass: ${targetHasGlass}, bothHaveGlass: ${bothHaveGlass}`);
      
      // 🚀 Priority 4: Queue arrow/header exit animation (non-blocking, queued)
      if (prevHasGlass) {
        console.log(`[EXIT #${transactionId}] Queueing arrow/header exit for glass section ${prevSection.id}`);
        
        // Queue logo rotation to 0 (will be executed after debounce)
        logoRotationQueue.queueRotation(0);
        
        // Immediately fade out header titles (Priority 4 but visible element)
        const titleContainer = document.getElementById('dynamic-header-title-container');
        if (titleContainer) {
          const existingTitles = titleContainer.querySelectorAll('.header-dynamic-title');
          if (existingTitles.length > 0) {
            console.log(`[EXIT #${transactionId}] Fading ${existingTitles.length} header titles`);
            gsap.to(existingTitles, {
              autoAlpha: 0,
              xPercent: -100, // Exit to LEFT (reverse of entry from left)
              duration: 0.4,
              ease: 'power2.in'
            });
          }
        }
      }
      
      if (prevSection.id === 'banner' && window.animateBannerExit) {
        // 🚨 FIX: Banner exit animation
        console.log(`[EXIT DEBUG] Starting banner exit animation for ${direction} scroll`);
        window.animateBannerExit(prevSection);
        exitDuration = 0.6; // 📌 SIMPLE: Fixed 0.6s duration
        console.log(`[EXIT DEBUG] Banner exit duration set to: ${exitDuration}`);
      } else if (prevHasGlass) {
        // 🚨 FIX: Glass container sections - ALWAYS animate content out, conditionally animate container
        console.log(`[EXIT DEBUG] Starting glass section exit animation for ${prevSection.id}`);
        if (window.Portfolio.ui && window.Portfolio.ui.animateGlassContent) {
          console.log(`[EXIT DEBUG] Calling animateGlassContent(${prevSection.id}, false)`);
          window.Portfolio.ui.animateGlassContent(prevSection, false);
        } else {
          console.log(`[EXIT DEBUG] animateGlassContent function not found!`);
        }
        
        // Only animate glass container if target doesn't have glass
        if (!bothHaveGlass && window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
          console.log(`[EXIT DEBUG] Both sections don't have glass - animating glass container out`);
          window.Portfolio.ui.updateGlassContainer(prevSection, false, targetSection);
          exitDuration = 0.8; // 📌 SIMPLE: Fixed 0.8s duration for glass container
        } else {
          console.log(`[EXIT DEBUG] Both sections have glass - keeping glass container, only animating content`);
          exitDuration = 0.5; // 📌 SIMPLE: Fixed 0.5s duration for content only
        }
        console.log(`[EXIT DEBUG] Glass section exit duration set to: ${exitDuration}`);
      } else if (window.animateSectionContent) {
        // Standard section exit animation (form)
        console.log(`[EXIT DEBUG] Starting standard section exit animation for ${prevSection.id}`);
        window.animateSectionContent(prevSection, false);
        exitDuration = 0.5; // 📌 SIMPLE: Fixed 0.5s duration
        console.log(`[EXIT DEBUG] Standard section exit duration set to: ${exitDuration}`);
      } else {
        console.log(`[EXIT DEBUG] No exit animation function found for ${prevSection.id}!`);
      }
      
      // Wait for exit animation to complete, then hide section
      console.log(`[EXIT #${transactionId}] Setting delayed call for ${exitDuration}s to complete ${prevSection.id} exit`);
      gsap.delayedCall(exitDuration, () => {
        // 🚀 Validate transaction before completing exit
        if (transactionId !== animationState.transactionId) {
          console.log(`[EXIT #${transactionId}] Delayed callback cancelled - transaction invalidated`);
          return;
        }
        
        gsap.set(prevSection, { 
          visibility: 'hidden', 
          display: 'none' 
        });
        console.log(`[EXIT COMPLETE #${transactionId}] ${prevSection.id} exit animation finished (${direction})`);
        resolve();
      });
    });
  }
  
  /**
   * 🚀 ENHANCED: Clean entry animation system with transaction validation
   */
  function runEntryAnimation(targetSection, isBanner, isInterrupting, CONFIG, prevSection, transactionId) {
    return new Promise((resolve, reject) => {
      // 🚀 Validate transaction
      if (transactionId !== animationState.transactionId) {
        reject(new Error(`Transaction ${transactionId} cancelled in runEntryAnimation`));
        return;
      }
      
      console.log(`[ENTRY START #${transactionId}] ${targetSection.id} entry animation beginning`);
      
      if (isBanner) {
        // Banner entry animation
        const bannerSection = document.getElementById('banner');
        if (bannerSection && window.animateBannerContent) {
          window.animateBannerContent(bannerSection, isInterrupting);
        }
        
        gsap.delayedCall(CONFIG.animation.duration, () => {
          // 🚀 Validate transaction before resolving
          if (transactionId !== animationState.transactionId) {
            console.log(`[ENTRY #${transactionId}] Banner entry callback cancelled`);
            return;
          }
          console.log(`[ENTRY COMPLETE #${transactionId}] ${targetSection.id} entry animation finished`);
          resolve();
        });
      } else {
        const hasGlassContainer = targetSection.id !== 'banner';
        
        if (hasGlassContainer) {
          // Pass prevSection to maintain "both have glass" logic
          if (window.Portfolio.ui && window.Portfolio.ui.updateGlassContainer) {
            window.Portfolio.ui.updateGlassContainer(targetSection, true, prevSection, transactionId);
          }
          
          // 🚀 Priority 4: Queue arrow/header animation (will skip intermediates)
          const targetIndex = window.sections.indexOf(targetSection);
          const isFormSection = targetSection.id === 'form' || targetIndex === window.sectionCount - 1;
          
          if (targetIndex !== 0) {
            console.log(`[ENTRY #${transactionId}] Queueing arrow and header animation for section ${targetIndex}`);
            
            // 🔧 FIX: Don't rotate logo in form section (last section)
            if (isFormSection) {
              // Form section - keep logo at 0 degrees (no rotation)
              logoRotationQueue.queueRotation(0);
              console.log(`[ENTRY #${transactionId}] Form section detected - logo rotation set to 0°`);
            } else {
              // Other glass sections - rotate logo to -135 degrees
              logoRotationQueue.queueRotation(-135);
            }
            
            // Add header title immediately (visual element, Priority 3)
            // But NOT for form section (no header in form)
            if (!isFormSection && window.Portfolio.ui && window.Portfolio.ui.addHeaderTitle) {
            window.Portfolio.ui.addHeaderTitle(targetIndex);
            }
          }
          
          gsap.delayedCall(CONFIG.glass.duration + CONFIG.animation.duration, () => {
            // 🚀 Validate transaction before resolving
            if (transactionId !== animationState.transactionId) {
              console.log(`[ENTRY #${transactionId}] Glass entry callback cancelled`);
              return;
            }
            console.log(`[ENTRY COMPLETE #${transactionId}] ${targetSection.id} glass container entry finished`);
            resolve();
          });
        } else {
          // Form section
          if (window.animateSectionContent) {
            window.animateSectionContent(targetSection, true);
          }
          
          gsap.delayedCall(CONFIG.animation.duration, () => {
            // 🚀 Validate transaction before resolving
            if (transactionId !== animationState.transactionId) {
              console.log(`[ENTRY #${transactionId}] Form entry callback cancelled`);
              return;
            }
            console.log(`[ENTRY COMPLETE #${transactionId}] ${targetSection.id} standard entry finished`);
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
    console.log(`[TRANSITION COMPLETE #${transactionId}] Section ${index} transition finished`);
    
    // 🚀 Validate transaction
    if (transactionId !== animationState.transactionId) {
      console.log(`[TRANSITION COMPLETE #${transactionId}] Completion cancelled - transaction invalidated`);
      return;
    }
    
    // 🚨 Show scroll buttons with proper delay to prevent flickering
    gsap.delayedCall(0.2, () => {
      // 🚀 Validate transaction in delayed callback
      if (transactionId !== animationState.transactionId) {
        console.log(`[TRANSITION COMPLETE #${transactionId}] Scroll button update cancelled`);
        return;
      }
      
      if (window.Portfolio.ui && window.Portfolio.ui.updateScrollButtons) {
        window.Portfolio.ui.updateScrollButtons();
      }
    });
    
    // Reset animation direction
    animationState.currentDirection = 0;
    
    // 🚀 ENHANCED: Brief lockout period (100-150ms) to prevent immediate re-trigger
    // This creates a stable window after animation completes
    gsap.delayedCall(0.15, () => {
      // 🚀 Validate transaction before releasing lock
      if (transactionId !== animationState.transactionId) {
        console.log(`[TRANSITION COMPLETE #${transactionId}] Lock release cancelled`);
        return;
      }
      
    window.isAnimating = false;
      console.log(`[TRANSITION COMPLETE #${transactionId}] Animation lock released after lockout period`);
    
    if (CONFIG.debug && window.logDebugInfo) {
      window.logDebugInfo(`Navigation to section ${index} complete`);
    }
    });
  }
  
  // Simple initialization
  function initializeSimpleState(currentSection = 0) {
    simpleState.updateCurrent(currentSection);
    console.log(`[STATE] Simple state initialized with section ${currentSection}`);
  }
  
  // Expose scroll functions and state
  window.Portfolio.scroll = {
    setupScrollObserver,
    handleScrollEvent,
    goToSection,
    initializeSimpleState,
    killAllPendingAnimations,
    // Expose state for other modules
    getAnimationState: () => animationState,
    getScrollManager: () => scrollManager,
    getLogoRotationQueue: () => logoRotationQueue,
    // Utility for checking if scroll is locked
    canInterrupt: () => animationState.canInterrupt(),
    // Current transaction ID for validation in other modules
    getCurrentTransactionId: () => animationState.transactionId
  };
  
  if (window.Portfolio.debug) {
    console.log('[SCROLL] Module loaded successfully with enhanced animation management');
  }
})(); 