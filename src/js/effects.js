/**
 * Effects Module
 * Handles button hover effects, text animations, scroll button hover effects, and mobile menu
 */
(function() {
  'use strict';
  
  // Initialize Portfolio namespace
  window.Portfolio = window.Portfolio || {};
  
  /**
   * Setup button hover effects
   */
  function setupButtonEffects() {
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('mouseenter', e => {
        button.classList.remove('radial-hover');
        
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        button.style.setProperty('--x', `${x}%`);
        button.style.setProperty('--y', `${y}%`); 
        button.classList.add('radial-hover');
      });
      
      button.addEventListener('mousemove', e => {
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        button.style.setProperty('--x', `${x}%`);
        button.style.setProperty('--y', `${y}%`);
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('radial-hover');
      });
    });
  }
  
  /**
   * Setup mobile menu
   */
  function setupMobileMenu() {
    const burgerIcon = document.getElementById('burgerIcon');
    const menu = document.querySelector('.menu-wrapper ul.menu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (!burgerIcon || !menu || !menuOverlay) return;
    
    burgerIcon.addEventListener('click', () => {
      menu.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      burgerIcon.classList.toggle('active');
    });
    
    menuOverlay.addEventListener('click', () => {
      menu.classList.remove('active');
      menuOverlay.classList.remove('active');
      burgerIcon.classList.remove('active');
    });
    
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        menuOverlay.classList.remove('active');
        burgerIcon.classList.remove('active');
      });
    });
  }

  
  /**
   * Setup scroll button hover effects - BULLETPROOF VERSION
   */
  function setupScrollButtonHoverEffects() {
    const scrollDownBtn = document.querySelector('.scroll-down');
    const scrollUpBtn = document.querySelector('.scroll-up');
    const scrollDownArrow = document.querySelector('.scroll-down .scroll-btn-arrow');
    const scrollUpArrow = document.querySelector('.scroll-up .scroll-btn-arrow');
  
    if (!scrollDownBtn || !scrollUpBtn || !scrollDownArrow || !scrollUpArrow) return;
  
    console.log('[SCROLL HOVER] BULLETPROOF setup starting');
  
    function resetArrowStyles(arrow) {
      gsap.killTweensOf(arrow);
      gsap.set(arrow, { transition: "none", animation: "none" });
      arrow.style.animation = 'none';
      arrow.style.transition = 'none';
    }
  
    function returnToBase(arrow, baseY, rotate = false) {
      const baseTransform = rotate
        ? `translate(-50%, -50%) translateY(${baseY}px) rotate(180deg)`
        : `translate(-50%, -50%) translateY(${baseY}px)`;
  
      gsap.to(arrow, {
        transform: baseTransform,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true
      });
    }
  
    resetArrowStyles(scrollDownArrow);
    resetArrowStyles(scrollUpArrow);
  
    gsap.set(scrollDownArrow, {
      transform: "translate(-50%, -50%) translateY(35px)"
    });
  
    gsap.set(scrollUpArrow, {
      transform: "translate(-50%, -50%) translateY(-35px) rotate(180deg)"
    });
  
    let downTimeline = { current: null };
    let upTimeline = { current: null };
  
    function setupHoverAnimation(btn, arrow, positions, rotate = false, timelineRef) {
      btn.addEventListener('mouseenter', () => {
        console.log(`[${rotate ? 'UP' : 'DOWN'}] ENTER`);
  
        gsap.killTweensOf(arrow);
        if (timelineRef.current) {
          timelineRef.current.kill();
          timelineRef.current = null;
        }
  
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(arrow, {
          transform: `translate(-50%, -50%) translateY(${positions[0]}px)${rotate ? ' rotate(180deg)' : ''}`,
          duration: 0.5,
          ease: "power2.inOut"
        }).to(arrow, {
          transform: `translate(-50%, -50%) translateY(${positions[1]}px)${rotate ? ' rotate(180deg)' : ''}`,
          duration: 0.5,
          ease: "power2.inOut"
        });
  
        timelineRef.current = tl;
      });
  
      btn.addEventListener('mouseleave', () => {
        console.log(`[${rotate ? 'UP' : 'DOWN'}] LEAVE`);
        gsap.killTweensOf(arrow);
        if (timelineRef.current) {
          timelineRef.current.kill();
          timelineRef.current = null;
        }
  
        returnToBase(arrow, rotate ? -35 : 35, rotate);
      });
    }
  
    setupHoverAnimation(scrollDownBtn, scrollDownArrow, [30, 35], false, downTimeline);
    setupHoverAnimation(scrollUpBtn, scrollUpArrow, [-30, -35], true, upTimeline);
  
    console.log('[SCROLL HOVER] BULLETPROOF setup complete');
  }
  
  /**
   * Setup service accordion interactions - Updated Services Layout – 2025 Version
   * Handles accordion expand/collapse with GSAP animations and form integration
   */
  function setupServiceAccordion() {
    console.log('[SERVICE ACCORDION] Initializing...');
    
    const categories = document.querySelectorAll('.service-category');
    
    if (!categories.length) {
      console.log('[SERVICE ACCORDION] No categories found');
      return;
    }
    
    // Service category messages for form pre-population
    const categoryMessages = {
      'design-to-code': 'Hi! I\'m interested in your Design-to-Code implementation services. Could you please provide more details about pixel-perfect coding from Figma/Photoshop and your process?',
      'wordpress-api': 'Hi! I\'m interested in WordPress theme customization and API integration services. Could you please share more information about your development approach?',
      'frameworks-performance': 'Hi! I\'m interested in performance optimization and modern framework development. Could you please provide details about your services?'
    };
    
    categories.forEach((category) => {
      const header = category.querySelector('.category-header');
      const content = category.querySelector('.category-content');
      const toggle = category.querySelector('.category-toggle');
      const serviceItems = content.querySelectorAll('.service-item');
      const ctaLink = content.querySelector('.category-cta');
      
      if (!header || !content) return;
      
      let isExpanded = false;
      
      // Accordion toggle function
      const toggleAccordion = () => {
        isExpanded = !isExpanded;
        
        // Update ARIA attributes for accessibility
        header.setAttribute('aria-expanded', isExpanded);
        content.setAttribute('aria-hidden', !isExpanded);
        
        // Toggle expanded class
        category.classList.toggle('is-expanded', isExpanded);
        
        if (isExpanded) {
          // Expand animation
          console.log('[SERVICE ACCORDION] Expanding category');
          
          // Staggered reveal of service items
          gsap.fromTo(serviceItems, 
            {
              opacity: 0,
              y: 20
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.08,
              ease: 'back.out(1.2)',
              delay: 0.1
            }
          );
          
          // Fade in CTA button
          if (ctaLink) {
            gsap.fromTo(ctaLink,
              {
                opacity: 0,
                y: 10
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.3,
                delay: 0.3,
                ease: 'power2.out'
              }
            );
          }
        } else {
          // Collapse animation - kill any ongoing animations
          console.log('[SERVICE ACCORDION] Collapsing category');
          gsap.killTweensOf(serviceItems);
          gsap.killTweensOf(ctaLink);
        }
      };
      
      // Click event for header
      header.addEventListener('click', toggleAccordion);
      
      // Keyboard accessibility
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      });
      
      // Form pre-population when CTA is clicked
      if (ctaLink) {
        ctaLink.addEventListener('click', (e) => {
          const categoryType = category.getAttribute('data-category');
          const message = categoryMessages[categoryType] || 'Hi! I\'m interested in your services. Could you please provide more information?';
          
          // Pre-populate form message after navigation
          setTimeout(() => {
            const messageTextarea = document.querySelector('textarea[name="message"]');
            if (messageTextarea) {
              messageTextarea.value = message;
              messageTextarea.focus();
            }
          }, 500);
        });
      }
    });
    
    console.log(`[SERVICE ACCORDION] Setup complete - ${categories.length} categories initialized`);
  }
  
  /**
   * Setup flip card form pre-population - LEGACY (2024)
   * Kept for backwards compatibility if old flip-card system is restored
   */
  function setupFlipCardFormIntegration() {
    const serviceMessages = {
      'design-implementation': 'Hi! I\'m interested in design implementation services (PSD to WWW conversion). Could you please provide more details about your process and pricing?',
      'wordpress-development': 'Hi! I\'m interested in custom WordPress theme development. Could you please share more information about your services and pricing?',
      'website-modernization': 'Hi! I\'m interested in website modernization services. Could you please provide details about your approach to updating existing websites?',
      'technical-audit': 'Hi! I\'m interested in technical audit services including performance and SEO optimization. Could you please share more information?',
      'responsive-design': 'Hi! I\'m interested in advanced responsive web design services. Could you please provide details about your mobile-first approach?',
      'api-integrations': 'Hi! I\'m interested in API integration services for payment systems and external services. Could you please share more information?',
      'ui-animations': 'Hi! I\'m interested in UI/UX animation services using GSAP and modern techniques. Could you please provide more details?',
      'modern-frameworks': 'Hi! I\'m interested in development using modern frameworks like React, Vue, or Astro. Could you please share more information?',
      'training': 'Hi! I\'m interested in individual training for CMS management or frontend development. Could you please provide details about your training programs?',
      'ux-optimization': 'Hi! I\'m interested in UI/UX optimization services with focus on accessibility. Could you please share more information?',
      'performance-optimization': 'Hi! I\'m interested in performance optimization services and Core Web Vitals improvement. Could you please provide more details?',
      'security': 'Hi! I\'m interested in security implementation and protection services. Could you please share more information about your security approach?'
    };

    // Add click event listeners to all flip containers
    document.querySelectorAll('[data-service]').forEach(container => {
      const links = container.querySelectorAll('a[href="#form"]');
      
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const serviceType = container.getAttribute('data-service');
          const message = serviceMessages[serviceType] || 'Hi! I\'m interested in your services. Could you please provide more information?';
          
          // Pre-populate form message after a short delay to ensure form is visible
          setTimeout(() => {
            const messageTextarea = document.querySelector('textarea[name="message"]');
            if (messageTextarea) {
              messageTextarea.value = message;
              messageTextarea.focus();
            }
          }, 500);
        });
      });
    });
    
    if (window.Portfolio.debug) {
      console.log('[FLIP CARDS] Form integration setup complete');
    }
  }
  
  // Expose effects functions
  window.Portfolio.effects = {
    setupButtonEffects,
    setupMobileMenu,
    setupScrollButtonHoverEffects,
    setupServiceAccordion, // Updated Services Layout – 2025 Version
    setupFlipCardFormIntegration // Legacy - kept for backwards compatibility
  };
  
  if (window.Portfolio.debug) {
    console.log('[EFFECTS] Module loaded successfully');
  }
})(); 