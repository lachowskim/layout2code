/**
 * Navigation Module
 * Handles dot navigation, hash navigation, and section switching
 */
(function() {
  'use strict';
  
  // Initialize Portfolio namespace
  window.Portfolio = window.Portfolio || {};
  
  /**
   * Setup navigation dots
   */
  function setupNavigation(sections, currentSection, goToSection, CONFIG) {
    console.log('[NAVIGATION SETUP] setupNavigation called with', sections.length, 'sections');
    
    const dotsContainer = document.querySelector('.section-dots');
    console.log('[NAVIGATION SETUP] Found .section-dots container:', !!dotsContainer);
    
    if (!dotsContainer) {
      console.error('[NAVIGATION SETUP] ERROR: .section-dots container not found in DOM!');
      return;
    }
    
    // Set configurable position
    document.documentElement.style.setProperty('--dot-nav-right-position', `${CONFIG.navigation.dotPosition}px`); 
    
    // Clear existing dots
    dotsContainer.innerHTML = '';
    console.log('[NAVIGATION SETUP] Cleared existing dots');
     
    // Create dots for each section
    console.log('[NAVIGATION SETUP] Creating dots for', sections.length, 'sections');
    sections.forEach((section, index) => {
      if (!section) return;
      
      // Create container for dot and label
      const dotContainer  = document.createElement('div');
      dotContainer.className = 'section-dot-container';
      
      // Create dot and label
      const dot = document.createElement('div');
      dot.className = 'section-dot';
      if (index === currentSection) dot.classList.add('active', 'effect-pulse');
      
      const label = document.createElement('div');
      label.className = 'section-dot-label';
      const sectionId = section.id || `section-${index+1}`;
      const displayName = section.dataset.name || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      label.textContent = displayName;
      
      // Add elements and click event
      dotContainer.appendChild(label);
      dotContainer.appendChild(dot);
      dotContainer.addEventListener('click', () => {
        // isAnimating will be passed as a parameter or accessed globally
        if (!window.isAnimating && index !== window.currentSection) {
          goToSection(index, false, window.CONFIG);
        }
      });
      
      dotsContainer.appendChild(dotContainer);
      console.log('[NAVIGATION SETUP] Created dot', index, 'for section', section.id);
    });
    
    console.log('[NAVIGATION SETUP] Created', dotsContainer.children.length, 'total dots');
    
    // Add anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const index = sections.indexOf(targetSection);
          if (index > -1) goToSection(index, false, window.CONFIG);
        }
      });
    });
    
    // Set initial dot state immediately
    updateNavigation(currentSection, true, CONFIG);
  }
  
  /**
   * Update the active navigation dot with smooth transition
   */
  function updateNavigation(targetIndex, immediate = false, CONFIG) {
    const dots = document.querySelectorAll('.section-dot');
    if (!dots.length) return;
    
    // Use global CONFIG as fallback if not provided
    const config = CONFIG || window.CONFIG;
    
    // Reset all dots to inactive state
    dots.forEach(dot => {
      dot.classList.remove('active', 'effect-pulse');
      if (immediate) {
        gsap.set(dot, { scale: 1 });
      } else {
        gsap.to(dot, { 
          scale: 1, 
          duration: config.animation.duration * 0.6,
          ease: "power2.out" 
        });
      }
    });
    
    // Animate new active dot
    if (dots[targetIndex]) {
      const activeDot = dots[targetIndex];
      activeDot.classList.add('active', 'effect-pulse');
      
      if (immediate) {
        gsap.set(activeDot, { scale: 1.3 });
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
  function updateNavigationImmediate(targetIndex, CONFIG, transactionId = null) {
    const dots = document.querySelectorAll('.section-dot');
    if (!dots.length) return;
    
    // Use global CONFIG as fallback if not provided
    const config = CONFIG || window.CONFIG;
    
    console.log(`[NAV DOTS #${transactionId}] Immediate state update to section ${targetIndex}`);
    
    // 🚀 PRIORITY 3: Update state IMMEDIATELY (synchronous)
    dots.forEach((dot, index) => {
      if (index === targetIndex) {
        dot.classList.add('active', 'effect-pulse');
      } else {
        dot.classList.remove('active', 'effect-pulse');
      }
    });
    
    // 🚀 Async visual transition (non-blocking)
    requestAnimationFrame(() => {
      // 🚀 Validate transaction before animating
      if (transactionId && window.Portfolio.scroll && 
          transactionId !== window.Portfolio.scroll.getCurrentTransactionId()) {
        console.log(`[NAV DOTS #${transactionId}] Visual animation cancelled - transaction invalidated`);
        return;
      }
      
      // Animate inactive dots
      dots.forEach((dot, index) => {
        if (index !== targetIndex) {
          gsap.to(dot, {
            scale: 1,
            duration: config.animation.duration * 0.5,
            ease: "power2.out",
            overwrite: true
          });
        }
      });
      
      // Animate active dot
      if (dots[targetIndex]) {
        gsap.to(dots[targetIndex], {
          scale: 1.3,
          duration: config.animation.duration * 0.6,
          ease: "back.out(1.2)",
          overwrite: true
        });
      }
      
      console.log(`[NAV DOTS #${transactionId}] Visual animation completed`);
    });
  }
  
  /**
   * Handle initial navigation (e.g., from URL hash)
   */
  function handleInitialNavigation(sections, goToSection, animateBannerContent) {
    // Check for hash in URL
    const hash = window.location.hash;
    if (hash) {
      const targetSection = document.querySelector(hash);
      if (targetSection) {
        const index = sections.indexOf(targetSection);
        if (index > -1) {
          setTimeout(() => goToSection(index, false, window.CONFIG), 300);
          return;
        }
      }
    }
    
    // If no valid hash or on banner, animate first section
    const bannerSection = document.getElementById('banner');
    if (bannerSection) animateBannerContent(bannerSection, true);
  }
  
  // Expose navigation functions
  window.Portfolio.navigation = {
    setupNavigation,
    updateNavigation,
    updateNavigationImmediate, // 🚀 New: Priority 3 immediate state update
    handleInitialNavigation
  };
  
  if (window.Portfolio.debug) {
    console.log('[NAVIGATION] Module loaded successfully with Priority 3 immediate updates');
  }
})(); 