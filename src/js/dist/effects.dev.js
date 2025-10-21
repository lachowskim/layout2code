"use strict";

/**
 * Effects Module
 * Handles button hover effects, text animations, scroll button hover effects, and mobile menu
 */
(function () {
  'use strict'; // Initialize Portfolio namespace

  window.Portfolio = window.Portfolio || {};
  /**
   * Setup button hover effects
   */

  function setupButtonEffects() {
    document.querySelectorAll('.btn').forEach(function (button) {
      button.addEventListener('mouseenter', function (e) {
        button.classList.remove('radial-hover');
        var rect = button.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width * 100;
        var y = (e.clientY - rect.top) / rect.height * 100;
        button.style.setProperty('--x', "".concat(x, "%"));
        button.style.setProperty('--y', "".concat(y, "%"));
        button.classList.add('radial-hover');
      });
      button.addEventListener('mousemove', function (e) {
        var rect = button.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width * 100;
        var y = (e.clientY - rect.top) / rect.height * 100;
        button.style.setProperty('--x', "".concat(x, "%"));
        button.style.setProperty('--y', "".concat(y, "%"));
      });
      button.addEventListener('mouseleave', function () {
        button.classList.remove('radial-hover');
      });
    });
  }
  /**
   * Setup mobile menu
   */


  function setupMobileMenu() {
    var burgerIcon = document.getElementById('burgerIcon');
    var menu = document.querySelector('.menu-wrapper ul.menu');
    var menuOverlay = document.getElementById('menuOverlay');
    if (!burgerIcon || !menu || !menuOverlay) return;
    burgerIcon.addEventListener('click', function () {
      menu.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      burgerIcon.classList.toggle('active');
    });
    menuOverlay.addEventListener('click', function () {
      menu.classList.remove('active');
      menuOverlay.classList.remove('active');
      burgerIcon.classList.remove('active');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
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
    var scrollDownBtn = document.querySelector('.scroll-down');
    var scrollUpBtn = document.querySelector('.scroll-up');
    var scrollDownArrow = document.querySelector('.scroll-down .scroll-btn-arrow');
    var scrollUpArrow = document.querySelector('.scroll-up .scroll-btn-arrow');
    if (!scrollDownBtn || !scrollUpBtn || !scrollDownArrow || !scrollUpArrow) return;
    console.log('[SCROLL HOVER] BULLETPROOF setup starting');

    function resetArrowStyles(arrow) {
      gsap.killTweensOf(arrow);
      gsap.set(arrow, {
        transition: "none",
        animation: "none"
      });
      arrow.style.animation = 'none';
      arrow.style.transition = 'none';
    }

    function returnToBase(arrow, baseY) {
      var rotate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var baseTransform = rotate ? "translate(-50%, -50%) translateY(".concat(baseY, "px) rotate(180deg)") : "translate(-50%, -50%) translateY(".concat(baseY, "px)");
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
    var downTimeline = {
      current: null
    };
    var upTimeline = {
      current: null
    };

    function setupHoverAnimation(btn, arrow, positions) {
      var rotate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var timelineRef = arguments.length > 4 ? arguments[4] : undefined;
      btn.addEventListener('mouseenter', function () {
        console.log("[".concat(rotate ? 'UP' : 'DOWN', "] ENTER"));
        gsap.killTweensOf(arrow);

        if (timelineRef.current) {
          timelineRef.current.kill();
          timelineRef.current = null;
        }

        var tl = gsap.timeline({
          repeat: -1,
          yoyo: true
        });
        tl.to(arrow, {
          transform: "translate(-50%, -50%) translateY(".concat(positions[0], "px)").concat(rotate ? ' rotate(180deg)' : ''),
          duration: 0.5,
          ease: "power2.inOut"
        }).to(arrow, {
          transform: "translate(-50%, -50%) translateY(".concat(positions[1], "px)").concat(rotate ? ' rotate(180deg)' : ''),
          duration: 0.5,
          ease: "power2.inOut"
        });
        timelineRef.current = tl;
      });
      btn.addEventListener('mouseleave', function () {
        console.log("[".concat(rotate ? 'UP' : 'DOWN', "] LEAVE"));
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
    var categories = document.querySelectorAll('.service-category');

    if (!categories.length) {
      console.log('[SERVICE ACCORDION] No categories found');
      return;
    } // Service category messages for form pre-population


    var categoryMessages = {
      'design-to-code': 'Hi! I\'m interested in your Design-to-Code implementation services. Could you please provide more details about pixel-perfect coding from Figma/Photoshop and your process?',
      'wordpress-api': 'Hi! I\'m interested in WordPress theme customization and API integration services. Could you please share more information about your development approach?',
      'frameworks-performance': 'Hi! I\'m interested in performance optimization and modern framework development. Could you please provide details about your services?'
    };
    categories.forEach(function (category) {
      var header = category.querySelector('.category-header');
      var content = category.querySelector('.category-content');
      var toggle = category.querySelector('.category-toggle');
      var serviceItems = content.querySelectorAll('.service-item');
      var ctaLink = content.querySelector('.category-cta');
      if (!header || !content) return;
      var isExpanded = false; // Accordion toggle function

      var toggleAccordion = function toggleAccordion() {
        isExpanded = !isExpanded; // Update ARIA attributes for accessibility

        header.setAttribute('aria-expanded', isExpanded);
        content.setAttribute('aria-hidden', !isExpanded); // Toggle expanded class

        category.classList.toggle('is-expanded', isExpanded);

        if (isExpanded) {
          // Expand animation
          console.log('[SERVICE ACCORDION] Expanding category'); // Staggered reveal of service items

          gsap.fromTo(serviceItems, {
            opacity: 0,
            y: 20
          }, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: 'back.out(1.2)',
            delay: 0.1
          }); // Fade in CTA button

          if (ctaLink) {
            gsap.fromTo(ctaLink, {
              opacity: 0,
              y: 10
            }, {
              opacity: 1,
              y: 0,
              duration: 0.3,
              delay: 0.3,
              ease: 'power2.out'
            });
          }
        } else {
          // Collapse animation - kill any ongoing animations
          console.log('[SERVICE ACCORDION] Collapsing category');
          gsap.killTweensOf(serviceItems);
          gsap.killTweensOf(ctaLink);
        }
      }; // Click event for header


      header.addEventListener('click', toggleAccordion); // Keyboard accessibility

      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      }); // Form pre-population when CTA is clicked

      if (ctaLink) {
        ctaLink.addEventListener('click', function (e) {
          var categoryType = category.getAttribute('data-category');
          var message = categoryMessages[categoryType] || 'Hi! I\'m interested in your services. Could you please provide more information?'; // Pre-populate form message after navigation

          setTimeout(function () {
            var messageTextarea = document.querySelector('textarea[name="message"]');

            if (messageTextarea) {
              messageTextarea.value = message;
              messageTextarea.focus();
            }
          }, 500);
        });
      }
    });
    console.log("[SERVICE ACCORDION] Setup complete - ".concat(categories.length, " categories initialized"));
  }
  /**
   * Setup flip card form pre-population - LEGACY (2024)
   * Kept for backwards compatibility if old flip-card system is restored
   */


  function setupFlipCardFormIntegration() {
    var serviceMessages = {
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
    }; // Add click event listeners to all flip containers

    document.querySelectorAll('[data-service]').forEach(function (container) {
      var links = container.querySelectorAll('a[href="#form"]');
      links.forEach(function (link) {
        link.addEventListener('click', function (e) {
          var serviceType = container.getAttribute('data-service');
          var message = serviceMessages[serviceType] || 'Hi! I\'m interested in your services. Could you please provide more information?'; // Pre-populate form message after a short delay to ensure form is visible

          setTimeout(function () {
            var messageTextarea = document.querySelector('textarea[name="message"]');

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
  } // Expose effects functions


  window.Portfolio.effects = {
    setupButtonEffects: setupButtonEffects,
    setupMobileMenu: setupMobileMenu,
    setupScrollButtonHoverEffects: setupScrollButtonHoverEffects,
    setupServiceAccordion: setupServiceAccordion,
    // Updated Services Layout – 2025 Version
    setupFlipCardFormIntegration: setupFlipCardFormIntegration // Legacy - kept for backwards compatibility

  };

  if (window.Portfolio.debug) {
    console.log('[EFFECTS] Module loaded successfully');
  }
})();