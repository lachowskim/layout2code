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
   * Applies radial cursor-based hover effect to .btn and .category-cta elements
   */
  function setupButtonEffects() {
    document.querySelectorAll('.btn, .category-cta').forEach(button => {
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
   * Setup scroll button hover effects - BULLETPROOF VERSION
   */
  function setupScrollButtonHoverEffects() {
    const scrollDownBtn = document.querySelector('.scroll-down');
    const scrollUpBtn = document.querySelector('.scroll-up');
    const scrollDownArrow = document.querySelector('.scroll-down .scroll-btn-arrow');
    const scrollUpArrow = document.querySelector('.scroll-up .scroll-btn-arrow');
  
    if (!scrollDownBtn || !scrollUpBtn || !scrollDownArrow || !scrollUpArrow) return;
  
    window.log('effects', '[SCROLL HOVER] BULLETPROOF setup starting');
  
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
        window.log('effects', `[${rotate ? 'UP' : 'DOWN'}] ENTER`);
  
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
        window.log('effects', `[${rotate ? 'UP' : 'DOWN'}] LEAVE`);
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
  
    window.log('effects', '[SCROLL HOVER] BULLETPROOF setup complete');
  }
  
  /**
   * Setup service accordion interactions - Updated Services Layout – 2025 Version
   * Handles accordion expand/collapse with GSAP animations and form integration
   */
  function setupServiceAccordion() {
    window.log('effects', '[SERVICE ACCORDION] Initializing...');
    
    const categories = document.querySelectorAll('.service-category');
    
    if (!categories.length) {
      window.log('effects', '[SERVICE ACCORDION] No categories found');
      return;
    }
    
    // Service category messages for form pre-population
    const categoryMessages = {
      'design-to-code': 'Hi! I\'m interested in your Design-to-Code implementation services. Could you please provide more details about pixel-perfect coding from Figma/Photoshop and your process?',
      'wordpress-api': 'Hi! I\'m interested in WordPress theme customization and API integration services. Could you please share more information about your development approach?',
      'frameworks-performance': 'Hi! I\'m interested in performance optimization and modern framework development. Could you please provide details about your services?'
    };
    
    // Store accordion instances for external control
    const accordionInstances = [];
    
    // 🔧 FIX: Hide all cards initially to prevent flash on section entry
    // Use config values for initial state
    const config = window.CONFIG.services;
    categories.forEach((category, setupIndex) => {
      window.log('effects', `[SERVICE ACCORDION] Initial setup for accordion ${setupIndex}`);
      
      // Hide the container
      gsap.set(category, config.containerAnimation.from);
      
      // 🔧 FIX: Also ensure content is collapsed initially
      const content = category.querySelector('.category-content');
      const header = category.querySelector('.category-header');
      const serviceItems = content.querySelectorAll('.service-item');
      const ctaLink = content.querySelector('.category-cta');
      
      window.log('effects', `[SERVICE ACCORDION] Setup ${setupIndex} - content element:`, content);
      window.log('effects', `[SERVICE ACCORDION] Setup ${setupIndex} - content ID:`, content ? content.id : 'null');
      
      if (content && header) {
        // Set ARIA to collapsed state
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        // Remove expanded class if present
        category.classList.remove('is-expanded');
        
        // 🔧 CRITICAL: Set initial collapsed state for accordion container
        // Log BEFORE setting
        const beforeStyle = window.getComputedStyle(content);
        window.log('effects', `[SERVICE ACCORDION] Setup ${setupIndex} BEFORE gsap.set - maxHeight:`, beforeStyle.maxHeight);
        
        gsap.set(content, { maxHeight: 0, padding: '0' });
        
        // Log AFTER setting
        setTimeout(() => {
          const afterStyle = window.getComputedStyle(content);
          window.log('effects', `[SERVICE ACCORDION] Setup ${setupIndex} AFTER gsap.set - maxHeight:`, afterStyle.maxHeight, 'padding:', afterStyle.padding);
        }, 50);
        
        // 🔧 CRITICAL: Force hide the content elements with GSAP (override CSS)
        if (serviceItems.length > 0) {
          gsap.set(serviceItems, { opacity: 0, y: 20 });
        }
        if (ctaLink) {
          gsap.set(ctaLink, { opacity: 0, y: 10 });
        }
      }
    });
    
    categories.forEach((category, index) => {
      const header = category.querySelector('.category-header');
      const content = category.querySelector('.category-content');
      const toggle = category.querySelector('.category-toggle');
      const serviceItems = content.querySelectorAll('.service-item');
      const ctaLink = content.querySelector('.category-cta');
      
      if (!header || !content) return;
      
      // 🔧 FIX: Add unique identification to prevent cross-contamination
      const accordionId = `accordion-${index}`;
      category.setAttribute('data-accordion-id', accordionId);
      content.setAttribute('data-accordion-id', accordionId);
      
      window.log('effects', `[SERVICE ACCORDION] Initializing accordion ${index} with ID: ${accordionId}`);
      window.log('effects', `[SERVICE ACCORDION] Accordion ${index} - header element:`, header);
      window.log('effects', `[SERVICE ACCORDION] Accordion ${index} - header ID:`, header ? header.getAttribute('aria-controls') : 'null');
      window.log('effects', `[SERVICE ACCORDION] Accordion ${index} - content element:`, content);
      window.log('effects', `[SERVICE ACCORDION] Accordion ${index} - content ID:`, content ? content.id : 'null');
      window.log('effects', `[SERVICE ACCORDION] Accordion ${index} - serviceItems count:`, serviceItems.length);
      
      // 🚨 CRITICAL: Check if this header is shared with other accordions
      if (index > 0) {
        const prevAccordion = accordionInstances[index - 1];
        if (prevAccordion && prevAccordion.header === header) {
          console.error(`[SERVICE ACCORDION] ❌ BUG FOUND! Accordion ${index} shares SAME header element with accordion ${index - 1}!`);
        }
      }
      
      // Create accordion instance with proper state management
      const accordion = {
        index: index, // 🔧 FIX: Store index in accordion object for proper closure
        accordionId: accordionId,
        element: category,
        header: header,
        content: content,
        serviceItems: serviceItems,
        ctaLink: ctaLink,
        isExpanded: false,
        
        // Expand this specific accordion
        expand: function() {
          if (this.isExpanded) {
            window.log('effects', `[SERVICE ACCORDION] Category ${this.index} (${this.accordionId}) already expanded, skipping`);
            return; // Already expanded
          }

          const runExpandLogic = () => {
            window.log('effects', `[SERVICE ACCORDION] 🟢 EXPANDING category ${this.index} (${this.accordionId})`);
          window.log('effects', `[SERVICE ACCORDION] Accordion ${this.index} - content element before animation:`, this.content);
          
          this.isExpanded = true;
          
          // Update ARIA attributes for accessibility
          this.header.setAttribute('aria-expanded', 'true');
          this.content.setAttribute('aria-hidden', 'false');
          
          // Add expanded class
          this.element.classList.add('is-expanded');
          
          window.log('effects', `[SERVICE ACCORDION] Category ${this.index} - items count:`, this.serviceItems.length);
          
          // Get animation config
          const contentAnim = config.contentAnimation;
          const ctaAnim = config.ctaAnimation;
          
          // 🔧 CRITICAL: Ensure items start from hidden state (force reset before animation)
          gsap.set(this.serviceItems, contentAnim.itemFrom);
          if (this.ctaLink) {
            gsap.set(this.ctaLink, ctaAnim.from);
          }
          
          gsap.killTweensOf(this.content);
          gsap.set(this.content, { maxHeight: 0, padding: '0' });
          
          // Tablet/mobile: pin wrapper's visual center so it expands above and below with no drift (exact viewport anchor).
          const isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
          const wrapper = isTabletOrMobile ? this.element.closest('.services-wrapper') : null;
          if (wrapper) {
            const r = wrapper.getBoundingClientRect();
            wrapper._servicesAnchorCenter = r.top + r.height / 2;
          }
          
          // Same GSAP expand animation for desktop and mobile (smooth open).
          gsap.to(this.content, {
            maxHeight: 600,
            padding: '0 28px 28px 28px',
            duration: 0.5,
            ease: 'power2.inOut',
            onUpdate: wrapper ? function() {
              const anchorCenter = wrapper._servicesAnchorCenter;
              if (anchorCenter == null) return;
              const rect = wrapper.getBoundingClientRect();
              const currentY = gsap.getProperty(wrapper, 'y') || 0;
              gsap.set(wrapper, { y: anchorCenter - rect.height / 2 - rect.top + currentY });
            } : undefined
          });
          gsap.to(this.serviceItems, {
            ...contentAnim.itemTo,
            duration: contentAnim.itemDuration,
            stagger: contentAnim.itemStagger,
            ease: contentAnim.itemEase,
            delay: contentAnim.delayAfterContainer
          });
          if (this.ctaLink) {
            gsap.to(this.ctaLink, {
              ...ctaAnim.to,
              duration: ctaAnim.duration,
              delay: ctaAnim.delay,
              ease: ctaAnim.ease
            });
          }
          };

          // Single-open on tablet/mobile: collapse others first, then expand (smooth, no double-open)
          if (window.matchMedia && window.matchMedia('(max-width: 899px)').matches) {
            const othersToCollapse = accordionInstances.filter((o) => o !== this && o.isExpanded);
            if (othersToCollapse.length > 0) {
              Promise.all(othersToCollapse.map((o) => o.collapse())).then(() => {
                runExpandLogic();
              });
              return;
            }
          }
          runExpandLogic();
        },
        
        // Collapse this specific accordion. Returns a Promise that resolves when collapse animation completes.
        collapse: function() {
          if (!this.isExpanded) return Promise.resolve();
          
          window.log('effects', `[SERVICE ACCORDION] 🔴 COLLAPSING category ${this.index} (${this.accordionId})`);
          
          this.isExpanded = false;
          
          // Update ARIA attributes
          this.header.setAttribute('aria-expanded', 'false');
          this.content.setAttribute('aria-hidden', 'true');
          
          // Remove expanded class
          this.element.classList.remove('is-expanded');
          
          gsap.killTweensOf(this.serviceItems);
          gsap.killTweensOf(this.ctaLink);
          gsap.killTweensOf(this.content);
          
          // Tablet/mobile: keep wrapper visual top pinned to anchor during collapse so grid does not drift (no jump on next expand, no “all boxes move up”).
          const isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
          const wrapper = isTabletOrMobile ? this.element.closest('.services-wrapper') : null;
          if (wrapper) gsap.killTweensOf(wrapper);
          
          // Same GSAP collapse animation for desktop and mobile (smooth close).
          gsap.to(this.serviceItems, { opacity: 0, y: 20, duration: 0.28, ease: 'power2.inOut' });
          if (this.ctaLink) gsap.to(this.ctaLink, { opacity: 0, y: 10, duration: 0.28, ease: 'power2.inOut' });
          return new Promise((resolve) => {
            gsap.to(this.content, {
              maxHeight: 0,
              padding: '0',
              duration: 0.4,
              ease: 'power2.inOut',
              onUpdate: wrapper && wrapper._servicesAnchorCenter != null ? function() {
                const anchorCenter = wrapper._servicesAnchorCenter;
                const rect = wrapper.getBoundingClientRect();
                const currentY = gsap.getProperty(wrapper, 'y') || 0;
                gsap.set(wrapper, { y: anchorCenter - rect.height / 2 - rect.top + currentY });
              } : undefined,
              onComplete: () => {
                if (wrapper && wrapper._servicesAnchorCenter != null) {
                  const rect = wrapper.getBoundingClientRect();
                  const currentY = gsap.getProperty(wrapper, 'y') || 0;
                  const layoutTop = rect.top - currentY;
                  gsap.set(wrapper, { y: wrapper._servicesAnchorCenter - rect.height / 2 - layoutTop });
                }
                gsap.set(this.content, { maxHeight: 0, padding: 0 });
                resolve();
              }
            });
          });
        },
        
        // Toggle this specific accordion (independent: other sections stay as-is)
        toggle: function() {
          if (this.isExpanded) {
            this.collapse();
          } else {
            this.expand();
          }
        }
      };
      
      // Click event for header
      header.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        window.log('effects', `[SERVICE ACCORDION] 🖱️ CLICK on accordion ${accordion.index} header`);
        window.log('effects', `[SERVICE ACCORDION] Clicked element:`, e.currentTarget);
        window.log('effects', `[SERVICE ACCORDION] Accordion header:`, accordion.header);
        window.log('effects', `[SERVICE ACCORDION] Headers match:`, e.currentTarget === accordion.header);
        accordion.toggle();
      });
      
      // Keyboard accessibility
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation(); // Prevent event bubbling
          window.log('effects', `[SERVICE ACCORDION] ⌨️ KEYBOARD on accordion ${accordion.index} header`);
          accordion.toggle();
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
      
      // Store instance
      accordionInstances.push(accordion);
    });
    
    // Store instances globally for external access
    window.Portfolio.serviceAccordions = accordionInstances;

    window.log('effects', `[SERVICE ACCORDION] Setup complete - ${categories.length} categories initialized`);
  }
  
  /**
   * Reveal service accordion containers sequentially on section entry (content stays collapsed).
   * Called when Services section becomes active.
   */
  function autoExpandServiceAccordions(transactionId = null) {
    if (!window.Portfolio.serviceAccordions) {
      window.log('effects', '[SERVICE AUTO-EXPAND] Accordions not initialized');
      return;
    }

    const config = window.CONFIG.services;
    if (!config.autoExpandOnEntry) {
      window.log('effects', '[SERVICE AUTO-EXPAND] Auto-expansion disabled');
      return;
    }
    
    const accordions = window.Portfolio.serviceAccordions;
    const isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
    
    window.log('effects', '[SERVICE AUTO-EXPAND] Starting container reveal cascade (content stays collapsed)');
    
    // Mobile only: no container reveal animation (no y/scale on cards); cards visible, content collapsed.
    if (isTabletOrMobile) {
      accordions.forEach((accordion) => {
        gsap.killTweensOf(accordion.element);
        gsap.killTweensOf(accordion.content);
        gsap.set(accordion.element, config.containerAnimation.to);
        gsap.set(accordion.content, { maxHeight: 0, padding: 0 });
        accordion.isExpanded = false;
        accordion.element.classList.remove('is-expanded');
        accordion.header.setAttribute('aria-expanded', 'false');
        accordion.content.setAttribute('aria-hidden', 'true');
      });
      // Store anchor position so expand/collapse can keep block in place (flex re-centering causes drift).
      requestAnimationFrame(() => {
        const wrapper = accordions[0] && accordions[0].element.closest('.services-wrapper');
        if (wrapper) {
          gsap.set(wrapper, { y: 0 });
          const r = wrapper.getBoundingClientRect();
          wrapper._servicesAnchorCenter = r.top + r.height / 2;
        }
      });
      return;
    }
    
    // Desktop: reveal containers one by one with delays
    accordions.forEach((accordion, idx) => {
      const delay = config.startDelay + (idx * config.expansionDelay);
      
      gsap.delayedCall(delay / 1000, () => {
        // Validate transaction if provided
        if (transactionId && window.Portfolio.scroll) {
          const currentTransactionId = window.Portfolio.scroll.getCurrentTransactionId();
          if (transactionId !== currentTransactionId) {
            window.log('effects', `[SERVICE AUTO-EXPAND] Transaction ${transactionId} cancelled - skipping expansion`);
            return;
          }
        }
        
        // Check if user is still on Services section
        const servicesSection = document.getElementById('services');
        const currentSectionIndex = window.sections ? window.sections.indexOf(servicesSection) : -1;
        
        if (currentSectionIndex === window.currentSection) {
          window.log('effects', `[SERVICE AUTO-EXPAND] 🎬 Revealing container ${accordion.index} (${accordion.accordionId})`);
          
          // 🔧 FIX: Kill any existing animations on this specific accordion's element AND content
          gsap.killTweensOf(accordion.element);
          gsap.killTweensOf(accordion.content);
          
          // 🔧 CRITICAL: Force reset content to collapsed state before container animation
          gsap.set(accordion.content, { maxHeight: 0, padding: '0' });
          
          // 🔍 VERIFY: Log state immediately after gsap.set
          setTimeout(() => {
            const checkStyle = window.getComputedStyle(accordion.content);
            window.log('effects', `[AUTO-EXPAND ${accordion.index}] AFTER gsap.set - padding: ${checkStyle.padding}, maxHeight: ${checkStyle.maxHeight}`);
          }, 5);
          
          // First animate the container itself appearing (using config values) - ELEMENT-SPECIFIC
          const containerAnim = config.containerAnimation;
          gsap.to(accordion.element, { // Using direct element reference
            ...containerAnim.to,
            duration: containerAnim.duration,
            ease: containerAnim.ease,
            onStart: () => {
              window.log('effects', `[SERVICE AUTO-EXPAND] 🎪 Container reveal START for accordion ${accordion.index}`);
              window.log('effects', `[SERVICE AUTO-EXPAND] Target element:`, accordion.element);
              // 🔍 Check content state at container animation START
              const startStyle = window.getComputedStyle(accordion.content);
              window.log('effects', `[CONTAINER START ${accordion.index}] Content state - padding: ${startStyle.padding}, maxHeight: ${startStyle.maxHeight}`);
            },
            onComplete: () => {
              // Desktop: expand all by default (side-by-side layout). Tablet/mobile: leave collapsed.
              if (window.matchMedia('(min-width: 900px)').matches) {
                accordion.expand();
              }
              window.log('effects', `[SERVICE AUTO-EXPAND] ✅ Container reveal COMPLETE for accordion ${accordion.index}`);
            }
          });
        } else {
          window.log('effects', '[SERVICE AUTO-EXPAND] User left Services section - stopping auto-expansion');
        }
      });
    });
  }
  
  /**
   * Reset all service accordions to collapsed state
   * Called when leaving Services section
   */
  function resetServiceAccordions() {
    if (!window.Portfolio.serviceAccordions) return;
    
    window.log('effects', '[SERVICE ACCORDION] 🔄 Resetting all accordions');
    const config = window.CONFIG.services;
    
    const isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
    const wrapper = isTabletOrMobile && window.Portfolio.serviceAccordions[0]
      ? window.Portfolio.serviceAccordions[0].element.closest('.services-wrapper')
      : null;
    if (wrapper) gsap.set(wrapper, { y: 0 });
    
    window.Portfolio.serviceAccordions.forEach(accordion => {
      window.log('effects', `[SERVICE ACCORDION] Resetting accordion ${accordion.index} (${accordion.accordionId})`);
      
      // Collapse the content
      accordion.collapse();
      
      // Desktop: hide containers for next reveal. Mobile: leave visible (no container reveal).
      gsap.set(accordion.element, isTabletOrMobile ? config.containerAnimation.to : config.containerAnimation.from);
    });
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
      window.log('effects', '[FLIP CARDS] Form integration setup complete');
    }
  }
  
  // Expose effects functions
  window.Portfolio.effects = {
    setupButtonEffects,
    setupScrollButtonHoverEffects,
    setupServiceAccordion, // Updated Services Layout – 2025 Version
    autoExpandServiceAccordions, // Auto-expand on section entry
    resetServiceAccordions, // Reset on section exit
    setupFlipCardFormIntegration // Legacy - kept for backwards compatibility
  };
  
  if (window.Portfolio.debug) {
    window.log('initialization', '[EFFECTS] Module loaded successfully');
  }
})(); 