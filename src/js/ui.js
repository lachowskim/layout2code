/**
 * UI Module
 * Handles glass container, dynamic headers, and scroll button management
 */
(function() {
  'use strict';
  
  // Initialize Portfolio namespace
  window.Portfolio = window.Portfolio || {};
  
  /**
   * Setup glass container
   */
  function setupGlassContainer() {
    const glassContainer = document.querySelector('.section-glass-container');
    if (!glassContainer) return;
    
    // Ensure glass container is never in the banner
    const banner = document.getElementById('banner');
    if (banner && banner.contains(glassContainer)) {
      banner.removeChild(glassContainer);
    }
     
    // Move glass container to body if not already there
    if (!document.body.contains(glassContainer)) {
      document.body.appendChild(glassContainer);
    }
    
    // 🚨 FIX: Show glass container for non-banner sections (starts hidden by default)
    if (window.currentSection === 0) {
      // Banner section - keep hidden (already hidden by default CSS)
      gsap.set(glassContainer, {
        opacity: 0,
        visibility: "hidden", 
        display: "none",
        scale: 0
      });
    } else {
      // Non-banner section - show the glass container
      gsap.set(glassContainer, {
        opacity: 1,
        visibility: "visible",
        display: "block",
        scale: 1,
        height: window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height
      });
    }

    // Add extra class to reinforce CSS rule
    document.body.classList.add('glass-container-ready');
  }
  
  /**
   * 🚀 ENHANCED: Update glass container for section with transaction validation
   * Priority 2: Glass container animations with stable-point detection
   */
  function updateGlassContainer(section, isVisible, prevSection = null, transactionId = null) {
    const glassContainer = document.querySelector('.section-glass-container');
    if (!glassContainer) {
      window.log('glassContainer', '[GLASS CONTAINER] No glass container found!');
      return;
    }
    
    // 🚀 Get current transaction ID if not provided
    if (transactionId === null && window.Portfolio.scroll) {
      transactionId = window.Portfolio.scroll.getCurrentTransactionId();
    }
    
    window.log('glassContainer', `[GLASS CONTAINER #${transactionId}] updateGlassContainer called: section=${section ? section.id : 'null'}, isVisible=${isVisible}, prevSection=${prevSection ? prevSection.id : 'null'}`);
    
    // 🚀 Priority 2: Check if we're at a stable point before interrupting
    const currentScale = gsap.getProperty(glassContainer, 'scale');
    const isStablePoint = currentScale > 0.5 || currentScale === 0 || currentScale === 1;
    
    if (!isStablePoint) {
      window.log('glassContainer', `[GLASS CONTAINER #${transactionId}] Not at stable point (scale: ${currentScale.toFixed(2)}) - waiting...`);
      // Wait for stable point before changing animation
      gsap.delayedCall(0.15, () => {
        // 🚀 Validate transaction after delay
        if (transactionId && window.Portfolio.scroll && 
            transactionId !== window.Portfolio.scroll.getCurrentTransactionId()) {
          window.log('glassContainer', `[GLASS CONTAINER #${transactionId}] Transaction invalidated during wait`);
          return;
        }
        updateGlassContainer(section, isVisible, prevSection, transactionId);
      });
      return;
    }
    
    // Kill any existing animations
    gsap.killTweensOf(glassContainer);
    
    // Immediately hide if section is banner or services (services doesn't use glass container)
    if (section && (section.id === 'banner' || section.id === 'services')) {
      window.log('glassContainer', `[GLASS CONTAINER DEBUG] Target is ${section.id} - hiding glass container immediately`);
      gsap.set(glassContainer, {
        opacity: 0,
        visibility: "hidden",
        display: "none",
        scale: 0
      });
      return;
    }
    
    // 📌 NEW: Check if both current and previous sections have glass containers (exclude banner and services)
    const bothHaveGlass = prevSection && 
                         prevSection.id !== 'banner' && 
                         prevSection.id !== 'services' &&
                         section.id !== 'banner' && 
                         section.id !== 'services';
    
    window.log('glassContainer', `[GLASS CONTAINER DEBUG] bothHaveGlass calculation: ${bothHaveGlass} (prevSection: ${prevSection ? prevSection.id : 'null'}, section: ${section ? section.id : 'null'})`);
    
    if (!isVisible) {
      window.log('glassContainer', `[GLASS CONTAINER DEBUG] EXIT MODE - isVisible=false`);
      // Portfolio exit: animate height and max-width back to default first
      const isLeavingPortfolio = section && section.id === 'portfolio';
      const targetSection = prevSection; // In exit mode, prevSection arg is the target section
      const shouldResizeBeforeCollapse = isLeavingPortfolio && targetSection && targetSection.id === 'form';
      if (shouldResizeBeforeCollapse) {
        gsap.to(glassContainer, {
          height: window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height,
          maxWidth: '1400px',
          duration: 0.4,
          ease: 'power2.inOut'
        });
      }
      // 🚨 FIX: EXIT SEQUENCE using consistent animateGlassContent function
      
      if (!bothHaveGlass) {
        window.log('glassContainer', `[GLASS CONTAINER DEBUG] !bothHaveGlass - Will animate glass container OUT`);
        // Step 1: Animate content out using animateGlassContent for consistency
        if (section) {
          window.log('glassContainer', `[GLASS CONTAINER DEBUG] Step 1: Animating content out for ${section.id}`);
          animateGlassContent(section, false);
        }
        
        // Step 2: Collapse the container with improved animation
        const delay = shouldResizeBeforeCollapse ? 0.45 : 0.2; // Only wait when resizing to form dimensions
        window.log('glassContainer', `[GLASS CONTAINER DEBUG] Step 2: Setting ${delay}s delay before collapsing glass container`);
        gsap.delayedCall(delay, () => {
          window.log('glassContainer', `[GLASS CONTAINER DEBUG] Starting glass container collapse animation`);
          glassContainer.classList.add('glass-transitioning');

          // 🚨 FIX: Disable CSS transitions to prevent conflicts with GSAP
          gsap.set(glassContainer, {
            transition: "none" // Override CSS transition that causes conflicts
          });

          gsap.to(glassContainer, {
            opacity: 0,
            scale: 0.8,  // Scale only - NO Y POSITIONING that breaks centering
            duration: 0.5,
            ease: "power2.in",
            transformOrigin: "center center",
            onStart: () => window.log('glassContainer', `[GLASS CONTAINER DEBUG] Glass container collapse started - scale to 0.8 ONLY`),
            onComplete: () => {
              glassContainer.classList.remove('glass-transitioning');
              // CLEANUP: Reset WITHOUT breaking CSS centering
              gsap.set(glassContainer, {
                visibility: "hidden",
                display: "none",
                scale: 0.8,
                clearProps: "y", // CRITICAL: Clear any Y transforms that break centering
                transition: ""
              });
              window.log('glassContainer', '[GLASS CONTAINER] Exit animation complete - collapsed with centering preserved');
            }
          });
        });
      } else {
        window.log('glassContainer', `[GLASS CONTAINER DEBUG] bothHaveGlass=true - Only animating content, keeping glass container`);
        // Both sections have glass - just animate content out
        if (section) {
          animateGlassContent(section, false);
        }
      }
    } else {
      window.log('glassContainer', `[GLASS CONTAINER DEBUG] ENTRY MODE - isVisible=true`);
      // 📌 ENTRY SEQUENCE: Container expands first, then content fades in
      
      // Show container - but never for banner (form now gets glass container)
      if (section && section.id !== 'banner') {
        if (!bothHaveGlass) {
          window.log('glassContainer', `[GLASS CONTAINER DEBUG] !bothHaveGlass - Will animate glass container IN`);
          // Portfolio: set final size upfront so expand and resize are one go
          const isPortfolio = section.id === 'portfolio';
          gsap.set(glassContainer, {
            visibility: "visible",
            display: "block",
            height: isPortfolio ? '700px' : (window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height),
            maxWidth: isPortfolio ? '1500px' : undefined,
            opacity: 0,
            scale: 0,  // 📌 Start from center
            transformOrigin: "center center"
          });
          
          window.log('glassContainer', `[GLASS CONTAINER DEBUG] Starting glass container expand animation`);
          glassContainer.classList.add('glass-transitioning');
          gsap.to(glassContainer, {
            opacity: 1,
            scale: 1,  // 📌 Expand to full size (already at portfolio size if portfolio)
            duration: window.CONFIG.glass.duration,
            ease: "back.out(1.02)",
            onStart: () => window.log('glassContainer', `[GLASS CONTAINER DEBUG] Glass container expand started`),
            onComplete: () => {
              glassContainer.classList.remove('glass-transitioning');
              window.log('glassContainer', `[GLASS CONTAINER DEBUG] Glass container expand complete - now animating content`);
              animateGlassContent(section, true);
            }
          });
        } else {
          window.log('glassContainer', `[GLASS CONTAINER DEBUG] bothHaveGlass=true - Skipping container animation, only animating content`);
          // 📌 Both sections have glass - one tween for both dimensions so they resize in sync
          const isPortfolio = section.id === 'portfolio';
          const isFromPortfolio = prevSection && prevSection.id === 'portfolio';
          gsap.set(glassContainer, {
            visibility: "visible",
            display: "block",
            opacity: 1,
            scale: 1
          });
          if (isPortfolio) {
            gsap.set(glassContainer, {
              height: window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height,
              maxWidth: '1400px'
            });
            gsap.to(glassContainer, {
              height: '700px',
              maxWidth: '1500px',
              duration: 0.4,
              ease: 'power2.inOut',
              overwrite: true,
              onComplete: () => animateGlassContent(section, true)
            });
          } else if (isFromPortfolio) {
            // Resize already starts during portfolio exit; avoid a second staged resize on entry.
            gsap.set(glassContainer, {
              height: window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height,
              maxWidth: '1400px'
            });
            animateGlassContent(section, true);
          } else {
            gsap.set(glassContainer, {
              height: window.getGlassHeight ? window.getGlassHeight() : window.CONFIG.glass.height,
              maxWidth: '1400px'
            });
            animateGlassContent(section, true);
          }
        }
      }
    }
  }
  
  /**
   * 📌 NEW: Animate content inside glass container
   */
  function animateGlassContent(section, isEntering) {
    if (!section) return;
    
    // 📌 DEBUG: Log glass content animation
    window.log('glassContainer', `[GLASS CONTENT] animateGlassContent called for ${section.id}, isEntering: ${isEntering}`);
    
    // Note: .service-categories-grid removed - Services section doesn't use glass container
    const contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .form-left, .form-right, .services-wrapper, .flip-cards-container';
    const elements = section.querySelectorAll(contentSelectors);
    const isPortfolioSection = section.id === 'portfolio';
    const portfolioDivider = isPortfolioSection ? section.querySelector('.portfolio-divider') : null;
    const portfolioImageElements = isPortfolioSection
      ? section.querySelectorAll('#mockup img, .portfolio-next .btn')
      : [];
    
    if (elements.length === 0) return;
    const entryScale = isPortfolioSection ? 1 : 0.97;
    const exitScale = isPortfolioSection ? 1 : 0.97;
    
    // 📌 FIXED: Kill any existing animations to prevent conflicts and timing issues
    gsap.killTweensOf(elements);
    
    // 🚨 FIX: Disable CSS transitions to prevent conflicts with GSAP
    gsap.set(elements, { 
      transition: "none" // Override any CSS transitions that cause conflicts
    });
    
    if (isEntering) {
      // Portfolio-specific: ensure divider fully spans once section enters
      if (portfolioDivider) {
        gsap.set(portfolioDivider, {
          clipPath: "inset(0px 0px 0px 0px)"
        });
      }

      // Set initial state
      window.log('glassContainer', `[GLASS CONTENT] Setting initial state with y: 12 for ${section.id}`);
      gsap.set(elements, {
        opacity: 0,
        y: 12,  // 📌 FASTER: Reduced to 12 for snappy responsiveness
        scale: entryScale
      });
      
      // Animate in
      window.log('glassContainer', `[GLASS CONTENT] Animating to y: 0 for ${section.id}`);
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: window.CONFIG.animation.duration,
        stagger: window.CONFIG.animation.stagger,
        ease: window.CONFIG.animation.easeOut,
        force3D: true,
        overwrite: true,  // 📌 ADDED: Ensure this animation takes precedence
        onComplete: () => {
          // 📌 FIX: Restore CSS transitions after GSAP animation completes
          gsap.set(elements, {
            transition: "" // Restore CSS transitions for other interactions
          });
          
          // 🚨 PORTFOLIO FIX: Also restore CSS transitions on Portfolio elements
          if (portfolioImageElements.length > 0) {
            gsap.set(portfolioImageElements, {
              transition: "" // Restore Portfolio image transitions
            });
            window.log('glassContainer', `[GLASS CONTENT] Restored CSS transitions on ${portfolioImageElements.length} Portfolio image elements for ${section.id}`);
          }
          
          window.log('glassContainer', `[GLASS CONTENT] ${section.id} entry animation completed, CSS transitions restored`);
        }
      });
    } else {
      // 🚨 FIX: EXIT ANIMATION - Reset elements to initial hidden state
      window.log('glassContainer', `[GLASS CONTENT] Exiting ${section.id} - resetting to initial state`);

      // Portfolio-specific: clip divider during glass shrink (700 -> default height),
      // so it never appears outside the glass container border.
      if (portfolioDivider) {
        gsap.to(portfolioDivider, {
          clipPath: "inset(25px 0px 25px 0px)",
          duration: 0.4,
          ease: "power2.in",
          overwrite: true
        });
      }
      
      // 🚨 FIX: Disable CSS transitions on elements to prevent conflicts
      gsap.set(elements, { 
        transition: "none" // Override any CSS transitions that cause conflicts
      });
      
      gsap.to(elements, {
        opacity: 0,
        y: 12,  // 📌 FASTER: Reduced to 12 for snappy responsiveness
        scale: exitScale, // Keep portfolio at scale 1 to avoid border/image snap artifacts
        duration: 0.4, // 📌 FASTER: Reduced duration for responsiveness
        ease: "power2.in",
        stagger: 0, // No stagger to prevent timing conflicts
        force3D: true,
        overwrite: true,
        onStart: () => window.log('glassContainer', `[GLASS CONTENT] Starting ${section.id} content exit animation - moving DOWN`),
        onComplete: () => {
          // 📌 CRITICAL: Ensure elements stay in hidden state
          gsap.set(elements, {
            opacity: 0,
            y: 12, // Reset to entry position - reduced for responsiveness
            scale: exitScale,
            transition: "" // Restore CSS transitions for other interactions
          });
          
          // 🚨 PORTFOLIO FIX: Also restore CSS transitions on Portfolio elements after exit
          if (portfolioImageElements.length > 0) {
            gsap.set(portfolioImageElements, {
              transition: "" // Restore Portfolio image transitions
            });
            window.log('glassContainer', `[GLASS CONTENT] Restored CSS transitions on ${portfolioImageElements.length} Portfolio image elements after ${section.id} exit`);
          }
          
          window.log('glassContainer', `[GLASS CONTENT] ${section.id} elements reset to initial state`);
        }
      });
    }
  }
  
  /**
   * Aggressively clear all header titles and reset header state
   */
  function clearAllHeaderTitles() {
    const titleContainer = document.getElementById('dynamic-header-title-container');
    
    if (titleContainer) {
      // Kill all animations on title container and its children
      gsap.killTweensOf(titleContainer);
      gsap.killTweensOf(titleContainer.children);
      
      // Remove all existing titles - multiple methods for safety
      const existingTitles = titleContainer.querySelectorAll('.header-dynamic-title');
      existingTitles.forEach(title => {
        gsap.killTweensOf(title);
        title.remove();
      });
      
      // EXTRA: Clear by class name
      const titlesByClass = document.querySelectorAll('.header-dynamic-title');
      titlesByClass.forEach(title => {
        if (title.parentNode) title.parentNode.removeChild(title);
      });
      
      // Clear any remaining content - multiple methods
      titleContainer.innerHTML = '';
      titleContainer.textContent = '';
      
      // Force reset container styles
      gsap.set(titleContainer, {
        clearProps: 'all'
      });
      
      if (window.CONFIG.debug) {
        window.log('headerAnimation', '[HEADER] EXTREMELY aggressive header cleanup completed');
        window.log('headerAnimation', '[HEADER] Remaining children:', titleContainer.children.length);
      }
    }
    
    // DON'T reset arrow here - let addHeaderTitle handle arrow animations properly
  }
  
  /**
   * Update header title when changing sections - ONLY HANDLES EXIT
   */
  function updateHeaderTitle(prevIndex, currentIndex) {
    // ALWAYS do aggressive cleanup first
    clearAllHeaderTitles();
    
    if (window.CONFIG.debug) {
      window.log('headerAnimation', `[HEADER] Header transition: ${prevIndex} → ${currentIndex}`);
    }
  }
  
  /**
   * Add new header title - ENTER ANIMATION ONLY (called after section transition)
   */
  function addHeaderTitle(sectionIndex) {
    const titleContainer = document.getElementById('dynamic-header-title-container');
    const headerArrow = document.getElementById('arrowGroup');
    if (!titleContainer) return;
    
    // SAFETY CHECK: Don't add headers if banner is active
    if (document.body.classList.contains('banner-active') || sectionIndex === 0) {
      if (window.CONFIG.debug) {
        window.log('headerAnimation', '[HEADER] Skipping header addition - banner is active');
      }
      
      // Just handle arrow for banner
      if (headerArrow) {
        gsap.to(headerArrow, {
          rotation: 0,
          duration: 0.4,
          ease: 'power2.inOut'
        });
      }
      return;
    }
    
    // SAFETY CHECK: Make sure container is actually empty
    const existingTitles = titleContainer.querySelectorAll('.header-dynamic-title');
    if (existingTitles.length > 0) {
      if (window.CONFIG.debug) {
        window.log('headerAnimation', '[HEADER] WARNING: Found existing titles during add, clearing first');
      }
      clearAllHeaderTitles();
    }
    
    const hasHeader = sectionIndex !== 0 && sectionIndex !== window.sectionCount - 1;
    
    if (hasHeader) {
      const section = window.sections[sectionIndex];
      if (!section) return;
      
      const originalH1 = section.querySelector('.headline h1');
      if (originalH1) {
        const newTitle = document.createElement('h1');
        newTitle.className = 'header-dynamic-title';
        newTitle.textContent = originalH1.textContent;
        newTitle.style.color = '#FFFFFF';
        
        titleContainer.appendChild(newTitle);
        
        // Set initial position (off-screen LEFT)
        gsap.set(newTitle, {
          autoAlpha: 0,
          xPercent: -100, // Start from LEFT
          transformOrigin: 'left center'
        });
        
        // Animate to final position (ENTER from LEFT)
        gsap.to(newTitle, {
          autoAlpha: 1,
          xPercent: 0, // End at normal position
          duration: 0.4,
          ease: 'back.out(1.2)',
          onStart: () => {
            // Rotate arrow if needed - RESTORED ORIGINAL WORKING LOGIC
            if (headerArrow) {
              gsap.to(headerArrow, {
                rotation: -135,
                duration: 0.3,
                ease: 'back.out(1.2)'
              });
            }
          }
        });
        
        if (window.CONFIG.debug) {
          window.log('headerAnimation', `[HEADER] Added header: "${newTitle.textContent}"`);
        }
      }
    } else {
      // No header for this section (banner or form) - rotate arrow back to 0
      if (headerArrow) {
        gsap.to(headerArrow, {
          rotation: 0,
          duration: 0.4,
          ease: 'power2.inOut'
        });
      }
    }
  }
  
  /**
   * Hide scroll buttons smoothly when animation starts
   */
  function hideScrollButtons() {
    const { $q } = window.Portfolio.dom;
    const scrollUpBtn   = $q(".scroll-up");
    const scrollDownBtn = $q(".scroll-down");
    
    if (!scrollUpBtn || !scrollDownBtn) return;
    
    // Hide both buttons smoothly
    gsap.to([scrollUpBtn, scrollDownBtn], {
      duration: 0.01, // Faster fade out when starting animation
      opacity: 0,
      ease: "power2.out",
      onComplete: () => {
        scrollUpBtn.style.visibility = "hidden";
        scrollDownBtn.style.visibility = "hidden";
      }
    });
  }
  
  /**
   * Animate delayed scroll button appearance for banner and form sections
   */
  function animateDelayedScrollButtonAppearance(button, isForm = false) {
    const config = window.CONFIG.scrollButtons;
    
    // Initially hide the button completely
    gsap.set(button, {
      opacity: 0,
      visibility: "hidden"
    });
    
    // Create killable timeline for delayed appearance
    window.scrollButtonTimeline = gsap.timeline();
    window.scrollButtonTimeline.to({}, {
      duration: config.initialDelay,
      onComplete: () => {
        // Check if we're still on the correct section
        const isCorrectSection = isForm ? 
          (window.currentSection === window.sectionCount - 1) : // Form section
          (window.currentSection === 0);                        // Banner section
        
        if (isCorrectSection) {
          window.log('scrollButtons', `[SCROLL BUTTON] Delayed appearance triggered - still on correct section`);
          
          // Force scroll button to be visible
          gsap.set(button, {
            opacity: 1,
            visibility: "visible"
          });
          button.style.opacity = "1";
          button.style.visibility = "visible";
          
          window.log('scrollButtons', `[SCROLL BUTTON] FORCED scroll button visible`);
        } else {
          window.log('scrollButtons', `[SCROLL BUTTON] Delayed appearance cancelled - no longer on correct section`);
          // Ensure button stays hidden
          gsap.set(button, {
            opacity: 0,
            visibility: "hidden"
          });
          button.style.opacity = "0";
          button.style.visibility = "hidden";
        }
      }
    });
  }
  
  /**
   * Update scroll buttons visibility - SURGICAL FIX (NAVIGATION DOTS PRESERVED)
   */
  function updateScrollButtons() {
    window.log('scrollButtons', '[SCROLL BUTTONS] updateScrollButtons called for section:', window.currentSection);
    
    const { $q } = window.Portfolio.dom;
    const scrollUpBtn   = $q(".scroll-up");
    const scrollDownBtn = $q(".scroll-down");
    
    window.log('scrollButtons', '[SCROLL BUTTONS] Elements found - up:', !!scrollUpBtn, 'down:', !!scrollDownBtn);
    
    if (!scrollUpBtn || !scrollDownBtn) {
      return;
    }
    
    // 🚨 SURGICAL FIX: Kill delayed calls ONLY when needed to prevent race conditions
    // but preserve all other navigation functionality
    
    // 🚨 ALWAYS kill delayed calls first to prevent race conditions from banner
    // FIX: gsap.killDelayedCallsTo doesn't exist - use killTweensOf instead
    gsap.killTweensOf([scrollUpBtn, scrollDownBtn]);
    
    // Clear any delayed calls with timeline approach
    if (window.scrollButtonTimeline) {
      window.scrollButtonTimeline.kill();
      window.scrollButtonTimeline = null;
    }

    // On banner (first section): only show scroll down with delay
    if (window.currentSection === 0) {
      window.log('scrollButtons', '[SCROLL BUTTONS] Banner section - hiding up, showing down with delay');
      
      // Hide scroll-up button
      gsap.set(scrollUpBtn, {
        opacity: 0,
        visibility: "hidden"
      });
      
      // Show scroll-down button with configurable delay and animation
      animateDelayedScrollButtonAppearance(scrollDownBtn);
    }
    // On form (last section): only show scroll up
    else if (window.currentSection === window.sectionCount - 1) {
      window.log('scrollButtons', '[SCROLL BUTTONS] Form section - showing up, hiding down');
      
      // Hide scroll-down button
      gsap.set(scrollDownBtn, {
        opacity: 0,
        visibility: "hidden"
      });
      
      // Show scroll-up button with configurable delay and animation
      animateDelayedScrollButtonAppearance(scrollUpBtn, true);
    }
    // Middle sections (About, Services, Portfolio): hide both scroll buttons
    else {
      window.log('scrollButtons', '[SCROLL BUTTONS] Middle section (About/Services/Portfolio) - hiding both scroll buttons');
      
      // Hide both scroll buttons (navigation dots are handled separately and stay visible)
      gsap.set([scrollUpBtn, scrollDownBtn], {
        opacity: 0,
        visibility: "hidden"
      });
    }
  }
  
  /**
   * Ensure navigation elements are properly visible (navigation dots should always be visible)
   */
  function showNavigationElements() {
    const sectionDots = document.querySelector('.section-dots');
    if (sectionDots) {
      // Navigation dots visibility is handled by CSS
    }
  }
  
  // ============================================================================
  // 🆕 SCROLL TOAST MESSAGE SYSTEM
  // ============================================================================
  // Displays notification when user attempts rapid scrolling
  // Configurable via CONFIG.scrollMessage
  // ============================================================================
  
  let scrollToastState = {
    lastShownTime: 0,
    isShowing: false,
    hideTimeout: null
  };
  
  /**
   * Initialize scroll toast notification element
   * Sets up content from CONFIG
   */
  function initializeScrollToast() {
    // 🔧 FIX: Remove optional chaining for Babel compatibility
    const config = window.CONFIG && window.CONFIG.scrollMessage;
    if (!config || !config.enabled) return;
    
    const toastElement = document.getElementById('scroll-toast');
    if (!toastElement) return;
    
    // Set icon and text from CONFIG
    const iconSpan = toastElement.querySelector('.scroll-toast-icon');
    const textSpan = toastElement.querySelector('.scroll-toast-text');
    
    if (iconSpan && config.icon) {
      iconSpan.textContent = config.icon;
    } else if (iconSpan) {
      iconSpan.style.display = 'none'; // Hide if no icon
    }
    
    if (textSpan) {
      textSpan.textContent = config.message;
    }
  }
  
  /**
   * Show scroll toast notification
   * Handles cooldown, slide-in animation, and auto-dismiss
   */
  function showScrollToast() {
    // 🔧 FIX: Remove optional chaining for Babel compatibility
    const config = window.CONFIG && window.CONFIG.scrollMessage;
    
    // Check if feature is enabled
    if (!config || !config.enabled) {
      return;
    }
    
    // Check if already showing
    if (scrollToastState.isShowing) return;
    
    const now = Date.now();
    const timeSinceLastShown = now - scrollToastState.lastShownTime;
    if (timeSinceLastShown < config.cooldown) return;
    
    const toastElement = document.getElementById('scroll-toast');
    if (!toastElement) return;
    
    // Mark as showing
    scrollToastState.isShowing = true;
    scrollToastState.lastShownTime = now;
    
    // Clear any existing hide timeout
    if (scrollToastState.hideTimeout) {
      clearTimeout(scrollToastState.hideTimeout);
      scrollToastState.hideTimeout = null;
    }
    
    // Kill any existing animations
    gsap.killTweensOf(toastElement);
    
    // Slide in from right
    gsap.to(toastElement, {
      x: 0,
      duration: config.animationDuration,
      ease: config.ease,
      onComplete: () => {
        scrollToastState.hideTimeout = setTimeout(() => {
          hideScrollToast();
        }, config.duration);
      }
    });
  }
  
  /**
   * Hide scroll toast notification
   * Slides back out to the right
   */
  function hideScrollToast() {
    // 🔧 FIX: Remove optional chaining for Babel compatibility
    const config = window.CONFIG && window.CONFIG.scrollMessage;
    if (!config) return;
    
    const toastElement = document.getElementById('scroll-toast');
    if (!toastElement) return;
    
    // Clear timeout
    if (scrollToastState.hideTimeout) {
      clearTimeout(scrollToastState.hideTimeout);
      scrollToastState.hideTimeout = null;
    }
    
    // Kill any existing animations
    gsap.killTweensOf(toastElement);
    
    // Slide out to right
    gsap.to(toastElement, {
      x: config.slideDistance,
      duration: config.animationDuration,
      ease: config.ease,
      onComplete: () => {
        scrollToastState.isShowing = false;
      }
    });
  }
  
  // ============================================================================
  
  // Expose UI functions
  window.Portfolio.ui = {
    setupGlassContainer,
    updateGlassContainer,
    clearAllHeaderTitles,
    updateHeaderTitle,
    addHeaderTitle,
    hideScrollButtons,
    updateScrollButtons,
    animateDelayedScrollButtonAppearance,
    animateGlassContent,
    showNavigationElements,
    initializeScrollToast,
    showScrollToast,
    hideScrollToast
  };
  
})(); 