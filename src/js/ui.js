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
        height: window.CONFIG.glass.height
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
      console.log('[GLASS CONTAINER] No glass container found!');
      return;
    }
    
    // 🚀 Get current transaction ID if not provided
    if (transactionId === null && window.Portfolio.scroll) {
      transactionId = window.Portfolio.scroll.getCurrentTransactionId();
    }
    
    console.log(`[GLASS CONTAINER #${transactionId}] updateGlassContainer called: section=${section ? section.id : 'null'}, isVisible=${isVisible}, prevSection=${prevSection ? prevSection.id : 'null'}`);
    
    // 🚀 Priority 2: Check if we're at a stable point before interrupting
    const currentScale = gsap.getProperty(glassContainer, 'scale');
    const isStablePoint = currentScale > 0.5 || currentScale === 0 || currentScale === 1;
    
    if (!isStablePoint) {
      console.log(`[GLASS CONTAINER #${transactionId}] Not at stable point (scale: ${currentScale.toFixed(2)}) - waiting...`);
      // Wait for stable point before changing animation
      gsap.delayedCall(0.15, () => {
        // 🚀 Validate transaction after delay
        if (transactionId && window.Portfolio.scroll && 
            transactionId !== window.Portfolio.scroll.getCurrentTransactionId()) {
          console.log(`[GLASS CONTAINER #${transactionId}] Transaction invalidated during wait`);
          return;
        }
        updateGlassContainer(section, isVisible, prevSection, transactionId);
      });
      return;
    }
    
    // Kill any existing animations
    gsap.killTweensOf(glassContainer);
    
    // Immediately hide if section is banner
    if (section && section.id === 'banner') {
      console.log('[GLASS CONTAINER DEBUG] Target is banner - hiding glass container immediately');
      gsap.set(glassContainer, {
        opacity: 0,
        visibility: "hidden",
        display: "none",
        scale: 0
      });
      return;
    }
    
    // 📌 NEW: Check if both current and previous sections have glass containers (only exclude banner)
    const bothHaveGlass = prevSection && 
                         prevSection.id !== 'banner' && 
                         section.id !== 'banner';
    
    console.log(`[GLASS CONTAINER DEBUG] bothHaveGlass calculation: ${bothHaveGlass} (prevSection: ${prevSection ? prevSection.id : 'null'}, section: ${section ? section.id : 'null'})`);
    
    if (!isVisible) {
      console.log(`[GLASS CONTAINER DEBUG] EXIT MODE - isVisible=false`);
      // 🚨 FIX: EXIT SEQUENCE using consistent animateGlassContent function
      
      if (!bothHaveGlass) {
        console.log(`[GLASS CONTAINER DEBUG] !bothHaveGlass - Will animate glass container OUT`);
        // Step 1: Animate content out using animateGlassContent for consistency
        if (section) {
          console.log(`[GLASS CONTAINER DEBUG] Step 1: Animating content out for ${section.id}`);
          animateGlassContent(section, false);
        }
        
        // Step 2: Collapse the container with improved animation
        const delay = 0.2; // 📌 SIMPLE: Fixed 0.2s delay instead of complex calculation
        console.log(`[GLASS CONTAINER DEBUG] Step 2: Setting ${delay}s delay before collapsing glass container`);
        gsap.delayedCall(delay, () => {
          console.log(`[GLASS CONTAINER DEBUG] Starting glass container collapse animation`);
          
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
            onStart: () => console.log(`[GLASS CONTAINER DEBUG] Glass container collapse started - scale to 0.8 ONLY`),
            onComplete: () => {
              // CLEANUP: Reset WITHOUT breaking CSS centering
              gsap.set(glassContainer, {
                visibility: "hidden",
                display: "none",
                scale: 0.8,
                clearProps: "y", // CRITICAL: Clear any Y transforms that break centering
                transition: ""
              });
              console.log('[GLASS CONTAINER] Exit animation complete - collapsed with centering preserved');
            }
          });
        });
      } else {
        console.log(`[GLASS CONTAINER DEBUG] bothHaveGlass=true - Only animating content, keeping glass container`);
        // Both sections have glass - just animate content out
        if (section) {
          animateGlassContent(section, false);
        }
      }
    } else {
      console.log(`[GLASS CONTAINER DEBUG] ENTRY MODE - isVisible=true`);
      // 📌 ENTRY SEQUENCE: Container expands first, then content fades in
      
      // Show container - but never for banner (form now gets glass container)
      if (section && section.id !== 'banner') {
        if (!bothHaveGlass) {
          console.log(`[GLASS CONTAINER DEBUG] !bothHaveGlass - Will animate glass container IN`);
          // Step 1: Expand container from center
          gsap.set(glassContainer, {
            visibility: "visible",
            display: "block",
            height: window.CONFIG.glass.height,
            opacity: 0,
            scale: 0,  // 📌 Start from center
            transformOrigin: "center center"
          });
          
          console.log(`[GLASS CONTAINER DEBUG] Starting glass container expand animation`);
          gsap.to(glassContainer, {
            opacity: 1,
            scale: 1,  // 📌 Expand to full size
            duration: window.CONFIG.glass.duration,
            ease: "back.out(1.02)",
            onStart: () => console.log(`[GLASS CONTAINER DEBUG] Glass container expand started`),
            onComplete: () => {
              console.log(`[GLASS CONTAINER DEBUG] Glass container expand complete - now animating content`);
              // Step 2: Then animate content in
              animateGlassContent(section, true);
            }
          });
        } else {
          console.log(`[GLASS CONTAINER DEBUG] bothHaveGlass=true - Skipping container animation, only animating content`);
          // 📌 Both sections have glass - skip container animation
          gsap.set(glassContainer, {
            visibility: "visible",
            display: "block",
            height: window.CONFIG.glass.height,
            opacity: 1,
            scale: 1
          });
          // Just animate content
          animateGlassContent(section, true);
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
    console.log(`[GLASS CONTENT] animateGlassContent called for ${section.id}, isEntering: ${isEntering}`);
    
    const contentSelectors = '.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .flip-cards-container, .service-categories-grid';
    const elements = section.querySelectorAll(contentSelectors);
    
    // 🚨 PORTFOLIO FIX: Also disable CSS transitions on Portfolio image elements that cause hickups
    const portfolioImageElements = section.querySelectorAll('.portfolio-image-wrapper img, .text-portfolio div');
    
    if (elements.length === 0) return;
    
    // 📌 FIXED: Kill any existing animations to prevent conflicts and timing issues
    gsap.killTweensOf(elements);
    
    // 🚨 FIX: Disable CSS transitions to prevent conflicts with GSAP
    gsap.set(elements, { 
      transition: "none" // Override any CSS transitions that cause conflicts
    });
    
    // 🚨 PORTFOLIO FIX: Also disable CSS transitions on Portfolio-specific elements
    if (portfolioImageElements.length > 0) {
      gsap.set(portfolioImageElements, { 
        transition: "none" // Override Portfolio image transitions that cause hickups
      });
      console.log(`[GLASS CONTENT] Disabled CSS transitions on ${portfolioImageElements.length} Portfolio image elements for ${section.id}`);
    }
    
    if (isEntering) {
      // Set initial state
      console.log(`[GLASS CONTENT] Setting initial state with y: 12 for ${section.id}`);
      gsap.set(elements, {
        opacity: 0,
        y: 12,  // 📌 FASTER: Reduced to 12 for snappy responsiveness
        scale: 0.97
      });
      
      // Animate in
      console.log(`[GLASS CONTENT] Animating to y: 0 for ${section.id}`);
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
            console.log(`[GLASS CONTENT] Restored CSS transitions on ${portfolioImageElements.length} Portfolio image elements for ${section.id}`);
          }
          
          console.log(`[GLASS CONTENT] ${section.id} entry animation completed, CSS transitions restored`);
        }
      });
    } else {
      // 🚨 FIX: EXIT ANIMATION - Reset elements to initial hidden state
      console.log(`[GLASS CONTENT] Exiting ${section.id} - resetting to initial state`);
      
      // 🚨 FIX: Disable CSS transitions on elements to prevent conflicts
      gsap.set(elements, { 
        transition: "none" // Override any CSS transitions that cause conflicts
      });
      
      gsap.to(elements, {
        opacity: 0,
        y: 12,  // 📌 FASTER: Reduced to 12 for snappy responsiveness
        scale: 0.97, // 📌 FASTER: Less dramatic scale change
        duration: 0.4, // 📌 FASTER: Reduced duration for responsiveness
        ease: "power2.in",
        stagger: 0, // No stagger to prevent timing conflicts
        force3D: true,
        overwrite: true,
        onStart: () => console.log(`[GLASS CONTENT] Starting ${section.id} content exit animation - moving DOWN`),
        onComplete: () => {
          // 📌 CRITICAL: Ensure elements stay in hidden state
          gsap.set(elements, {
            opacity: 0,
            y: 12, // Reset to entry position - reduced for responsiveness
            scale: 0.97,
            transition: "" // Restore CSS transitions for other interactions
          });
          
          // 🚨 PORTFOLIO FIX: Also restore CSS transitions on Portfolio elements after exit
          if (portfolioImageElements.length > 0) {
            gsap.set(portfolioImageElements, {
              transition: "" // Restore Portfolio image transitions
            });
            console.log(`[GLASS CONTENT] Restored CSS transitions on ${portfolioImageElements.length} Portfolio image elements after ${section.id} exit`);
          }
          
          console.log(`[GLASS CONTENT] ${section.id} elements reset to initial state`);
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
        console.log('[HEADER] EXTREMELY aggressive header cleanup completed');
        console.log('[HEADER] Remaining children:', titleContainer.children.length);
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
      console.log(`[HEADER] Header transition: ${prevIndex} → ${currentIndex}`);
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
        console.log('[HEADER] Skipping header addition - banner is active');
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
        console.log('[HEADER] WARNING: Found existing titles during add, clearing first');
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
          console.log(`[HEADER] Added header: "${newTitle.textContent}"`);
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
          console.log(`[SCROLL BUTTON] Delayed appearance triggered - still on correct section`);
          
          // Force scroll button to be visible
          gsap.set(button, {
            opacity: 1,
            visibility: "visible"
          });
          button.style.opacity = "1";
          button.style.visibility = "visible";
          
          console.log(`[SCROLL BUTTON] FORCED scroll button visible`);
        } else {
          console.log(`[SCROLL BUTTON] Delayed appearance cancelled - no longer on correct section`);
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
    console.log('[SCROLL BUTTONS] updateScrollButtons called for section:', window.currentSection);
    
    const { $q } = window.Portfolio.dom;
    const scrollUpBtn   = $q(".scroll-up");
    const scrollDownBtn = $q(".scroll-down");
    
    console.log('[SCROLL BUTTONS] Elements found - up:', !!scrollUpBtn, 'down:', !!scrollDownBtn);
    
    if (!scrollUpBtn || !scrollDownBtn) {
      console.error('[SCROLL BUTTONS] ERROR: Elements not found!');
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
      console.log('[SCROLL BUTTONS] Banner section - hiding up, showing down with delay');
      
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
      console.log('[SCROLL BUTTONS] Form section - showing up, hiding down');
      
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
      console.log('[SCROLL BUTTONS] Middle section (About/Services/Portfolio) - hiding both scroll buttons');
      
      // Hide both scroll buttons (navigation dots are handled separately and stay visible)
      gsap.set([scrollUpBtn, scrollDownBtn], {
        opacity: 0,
        visibility: "hidden"
      });
      
      console.log('[SCROLL BUTTONS] Both scroll buttons hidden - navigation dots stay visible');
    }
  }
  
  /**
   * Ensure navigation elements are properly visible (navigation dots should always be visible)
   */
  function showNavigationElements() {
    console.log('[NAVIGATION DOTS] showNavigationElements called');
    
    const sectionDots = document.querySelector('.section-dots');
    
    console.log('[NAVIGATION DOTS] Found .section-dots element:', !!sectionDots);
    
    if (sectionDots) {
      console.log('[NAVIGATION DOTS] Navigation dots should now be visible by default (CSS updated)');
      
      // Verify they're visible and log their state
      const computedStyle = window.getComputedStyle(sectionDots);
      console.log('[NAVIGATION DOTS] Current computed opacity:', computedStyle.opacity);
      console.log('[NAVIGATION DOTS] Current computed visibility:', computedStyle.visibility);
      console.log('[NAVIGATION DOTS] Current computed display:', computedStyle.display);
      
      // Count dots to verify they were created
      const dots = sectionDots.querySelectorAll('.section-dot');
      console.log('[NAVIGATION DOTS] Number of dots found:', dots.length);
      
    } else {
      console.error('[NAVIGATION DOTS] ERROR: .section-dots element not found in DOM!');
    }
    
    if (window.CONFIG.debug) {
      console.log('[UI] Navigation elements checked after initialization');
    }
  }
  
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
    showNavigationElements
  };
  
  if (window.Portfolio.debug) {
    console.log('[UI] Module loaded successfully');
  }
})(); 