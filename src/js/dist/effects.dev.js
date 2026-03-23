"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Effects Module
 * Handles button hover effects, text animations, scroll button hover effects, and mobile menu
 */
(function () {
  'use strict'; // Initialize Portfolio namespace

  window.Portfolio = window.Portfolio || {};
  /**
   * Setup button hover effects
   * Applies radial cursor-based hover effect to .btn and .category-cta elements
   */

  function setupButtonEffects() {
    document.querySelectorAll('.btn, .category-cta').forEach(function (button) {
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
   * Setup scroll button hover effects - BULLETPROOF VERSION
   */


  function setupScrollButtonHoverEffects() {
    var scrollDownBtn = document.querySelector('.scroll-down');
    var scrollUpBtn = document.querySelector('.scroll-up');
    var scrollDownArrow = document.querySelector('.scroll-down .scroll-btn-arrow');
    var scrollUpArrow = document.querySelector('.scroll-up .scroll-btn-arrow');
    if (!scrollDownBtn || !scrollUpBtn || !scrollDownArrow || !scrollUpArrow) return;
    window.log('effects', '[SCROLL HOVER] BULLETPROOF setup starting');

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
        window.log('effects', "[".concat(rotate ? 'UP' : 'DOWN', "] ENTER"));
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
        window.log('effects', "[".concat(rotate ? 'UP' : 'DOWN', "] LEAVE"));
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
    var categories = document.querySelectorAll('.service-category');

    if (!categories.length) {
      window.log('effects', '[SERVICE ACCORDION] No categories found');
      return;
    } // Service category messages for form pre-population


    var categoryMessages = {
      'design-to-code': 'Hi! I\'m interested in your Design-to-Code implementation services. Could you please provide more details about pixel-perfect coding from Figma/Photoshop and your process?',
      'wordpress-api': 'Hi! I\'m interested in WordPress theme customization and API integration services. Could you please share more information about your development approach?',
      'frameworks-performance': 'Hi! I\'m interested in performance optimization and modern framework development. Could you please provide details about your services?'
    }; // Store accordion instances for external control

    var accordionInstances = []; // 🔧 FIX: Hide all cards initially to prevent flash on section entry
    // Use config values for initial state

    var config = window.CONFIG.services;
    categories.forEach(function (category, setupIndex) {
      window.log('effects', "[SERVICE ACCORDION] Initial setup for accordion ".concat(setupIndex)); // Hide the container

      gsap.set(category, config.containerAnimation.from); // 🔧 FIX: Also ensure content is collapsed initially

      var content = category.querySelector('.category-content');
      var header = category.querySelector('.category-header');
      var serviceItems = content.querySelectorAll('.service-item');
      var ctaLink = content.querySelector('.category-cta');
      window.log('effects', "[SERVICE ACCORDION] Setup ".concat(setupIndex, " - content element:"), content);
      window.log('effects', "[SERVICE ACCORDION] Setup ".concat(setupIndex, " - content ID:"), content ? content.id : 'null');

      if (content && header) {
        // Set ARIA to collapsed state
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true'); // Remove expanded class if present

        category.classList.remove('is-expanded'); // 🔧 CRITICAL: Set initial collapsed state for accordion container
        // Log BEFORE setting

        var beforeStyle = window.getComputedStyle(content);
        window.log('effects', "[SERVICE ACCORDION] Setup ".concat(setupIndex, " BEFORE gsap.set - maxHeight:"), beforeStyle.maxHeight);
        gsap.set(content, {
          maxHeight: 0,
          padding: '0'
        }); // Log AFTER setting

        setTimeout(function () {
          var afterStyle = window.getComputedStyle(content);
          window.log('effects', "[SERVICE ACCORDION] Setup ".concat(setupIndex, " AFTER gsap.set - maxHeight:"), afterStyle.maxHeight, 'padding:', afterStyle.padding);
        }, 50); // 🔧 CRITICAL: Force hide the content elements with GSAP (override CSS)

        if (serviceItems.length > 0) {
          gsap.set(serviceItems, {
            opacity: 0,
            y: 20
          });
        }

        if (ctaLink) {
          gsap.set(ctaLink, {
            opacity: 0,
            y: 10
          });
        }
      }
    });
    categories.forEach(function (category, index) {
      var header = category.querySelector('.category-header');
      var content = category.querySelector('.category-content');
      var toggle = category.querySelector('.category-toggle');
      var serviceItems = content.querySelectorAll('.service-item');
      var ctaLink = content.querySelector('.category-cta');
      if (!header || !content) return; // 🔧 FIX: Add unique identification to prevent cross-contamination

      var accordionId = "accordion-".concat(index);
      category.setAttribute('data-accordion-id', accordionId);
      content.setAttribute('data-accordion-id', accordionId);
      window.log('effects', "[SERVICE ACCORDION] Initializing accordion ".concat(index, " with ID: ").concat(accordionId));
      window.log('effects', "[SERVICE ACCORDION] Accordion ".concat(index, " - header element:"), header);
      window.log('effects', "[SERVICE ACCORDION] Accordion ".concat(index, " - header ID:"), header ? header.getAttribute('aria-controls') : 'null');
      window.log('effects', "[SERVICE ACCORDION] Accordion ".concat(index, " - content element:"), content);
      window.log('effects', "[SERVICE ACCORDION] Accordion ".concat(index, " - content ID:"), content ? content.id : 'null');
      window.log('effects', "[SERVICE ACCORDION] Accordion ".concat(index, " - serviceItems count:"), serviceItems.length); // 🚨 CRITICAL: Check if this header is shared with other accordions

      if (index > 0) {
        var prevAccordion = accordionInstances[index - 1];

        if (prevAccordion && prevAccordion.header === header) {
          console.error("[SERVICE ACCORDION] \u274C BUG FOUND! Accordion ".concat(index, " shares SAME header element with accordion ").concat(index - 1, "!"));
        }
      } // Create accordion instance with proper state management


      var accordion = {
        index: index,
        // 🔧 FIX: Store index in accordion object for proper closure
        accordionId: accordionId,
        element: category,
        header: header,
        content: content,
        serviceItems: serviceItems,
        ctaLink: ctaLink,
        isExpanded: false,
        // Expand this specific accordion
        expand: function expand() {
          var _this = this;

          if (this.isExpanded) {
            window.log('effects', "[SERVICE ACCORDION] Category ".concat(this.index, " (").concat(this.accordionId, ") already expanded, skipping"));
            return; // Already expanded
          }

          var runExpandLogic = function runExpandLogic() {
            window.log('effects', "[SERVICE ACCORDION] \uD83D\uDFE2 EXPANDING category ".concat(_this.index, " (").concat(_this.accordionId, ")"));
            window.log('effects', "[SERVICE ACCORDION] Accordion ".concat(_this.index, " - content element before animation:"), _this.content);
            _this.isExpanded = true; // Update ARIA attributes for accessibility

            _this.header.setAttribute('aria-expanded', 'true');

            _this.content.setAttribute('aria-hidden', 'false'); // Add expanded class


            _this.element.classList.add('is-expanded');

            window.log('effects', "[SERVICE ACCORDION] Category ".concat(_this.index, " - items count:"), _this.serviceItems.length); // Get animation config

            var contentAnim = config.contentAnimation;
            var ctaAnim = config.ctaAnimation; // 🔧 CRITICAL: Ensure items start from hidden state (force reset before animation)

            gsap.set(_this.serviceItems, contentAnim.itemFrom);

            if (_this.ctaLink) {
              gsap.set(_this.ctaLink, ctaAnim.from);
            }

            gsap.killTweensOf(_this.content);
            gsap.set(_this.content, {
              maxHeight: 0,
              padding: '0'
            }); // Tablet/mobile: pin wrapper's visual center so it expands above and below with no drift (exact viewport anchor).

            var isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
            var wrapper = isTabletOrMobile ? _this.element.closest('.services-wrapper') : null;

            if (wrapper) {
              var r = wrapper.getBoundingClientRect();
              wrapper._servicesAnchorCenter = r.top + r.height / 2;
            } // Same GSAP expand animation for desktop and mobile (smooth open).


            gsap.to(_this.content, {
              maxHeight: 600,
              padding: '0 28px 28px 28px',
              duration: 0.5,
              ease: 'power2.inOut',
              onUpdate: wrapper ? function () {
                var anchorCenter = wrapper._servicesAnchorCenter;
                if (anchorCenter == null) return;
                var rect = wrapper.getBoundingClientRect();
                var currentY = gsap.getProperty(wrapper, 'y') || 0;
                gsap.set(wrapper, {
                  y: anchorCenter - rect.height / 2 - rect.top + currentY
                });
              } : undefined
            });
            gsap.to(_this.serviceItems, _objectSpread({}, contentAnim.itemTo, {
              duration: contentAnim.itemDuration,
              stagger: contentAnim.itemStagger,
              ease: contentAnim.itemEase,
              delay: contentAnim.delayAfterContainer
            }));

            if (_this.ctaLink) {
              gsap.to(_this.ctaLink, _objectSpread({}, ctaAnim.to, {
                duration: ctaAnim.duration,
                delay: ctaAnim.delay,
                ease: ctaAnim.ease
              }));
            }
          }; // Single-open on tablet/mobile: collapse others first, then expand (smooth, no double-open)


          if (window.matchMedia && window.matchMedia('(max-width: 899px)').matches) {
            var othersToCollapse = accordionInstances.filter(function (o) {
              return o !== _this && o.isExpanded;
            });

            if (othersToCollapse.length > 0) {
              Promise.all(othersToCollapse.map(function (o) {
                return o.collapse();
              })).then(function () {
                runExpandLogic();
              });
              return;
            }
          }

          runExpandLogic();
        },
        // Collapse this specific accordion. Returns a Promise that resolves when collapse animation completes.
        collapse: function collapse() {
          var _this2 = this;

          if (!this.isExpanded) return Promise.resolve();
          window.log('effects', "[SERVICE ACCORDION] \uD83D\uDD34 COLLAPSING category ".concat(this.index, " (").concat(this.accordionId, ")"));
          this.isExpanded = false; // Update ARIA attributes

          this.header.setAttribute('aria-expanded', 'false');
          this.content.setAttribute('aria-hidden', 'true'); // Remove expanded class

          this.element.classList.remove('is-expanded');
          gsap.killTweensOf(this.serviceItems);
          gsap.killTweensOf(this.ctaLink);
          gsap.killTweensOf(this.content); // Tablet/mobile: keep wrapper visual top pinned to anchor during collapse so grid does not drift (no jump on next expand, no “all boxes move up”).

          var isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
          var wrapper = isTabletOrMobile ? this.element.closest('.services-wrapper') : null;
          if (wrapper) gsap.killTweensOf(wrapper); // Same GSAP collapse animation for desktop and mobile (smooth close).

          gsap.to(this.serviceItems, {
            opacity: 0,
            y: 20,
            duration: 0.28,
            ease: 'power2.inOut'
          });
          if (this.ctaLink) gsap.to(this.ctaLink, {
            opacity: 0,
            y: 10,
            duration: 0.28,
            ease: 'power2.inOut'
          });
          return new Promise(function (resolve) {
            gsap.to(_this2.content, {
              maxHeight: 0,
              padding: '0',
              duration: 0.4,
              ease: 'power2.inOut',
              onUpdate: wrapper && wrapper._servicesAnchorCenter != null ? function () {
                var anchorCenter = wrapper._servicesAnchorCenter;
                var rect = wrapper.getBoundingClientRect();
                var currentY = gsap.getProperty(wrapper, 'y') || 0;
                gsap.set(wrapper, {
                  y: anchorCenter - rect.height / 2 - rect.top + currentY
                });
              } : undefined,
              onComplete: function onComplete() {
                if (wrapper && wrapper._servicesAnchorCenter != null) {
                  var rect = wrapper.getBoundingClientRect();
                  var currentY = gsap.getProperty(wrapper, 'y') || 0;
                  var layoutTop = rect.top - currentY;
                  gsap.set(wrapper, {
                    y: wrapper._servicesAnchorCenter - rect.height / 2 - layoutTop
                  });
                }

                gsap.set(_this2.content, {
                  maxHeight: 0,
                  padding: 0
                });
                resolve();
              }
            });
          });
        },
        // Toggle this specific accordion (independent: other sections stay as-is)
        toggle: function toggle() {
          if (this.isExpanded) {
            this.collapse();
          } else {
            this.expand();
          }
        }
      }; // Click event for header

      header.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent event bubbling

        window.log('effects', "[SERVICE ACCORDION] \uD83D\uDDB1\uFE0F CLICK on accordion ".concat(accordion.index, " header"));
        window.log('effects', "[SERVICE ACCORDION] Clicked element:", e.currentTarget);
        window.log('effects', "[SERVICE ACCORDION] Accordion header:", accordion.header);
        window.log('effects', "[SERVICE ACCORDION] Headers match:", e.currentTarget === accordion.header);
        accordion.toggle();
      }); // Keyboard accessibility

      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation(); // Prevent event bubbling

          window.log('effects', "[SERVICE ACCORDION] \u2328\uFE0F KEYBOARD on accordion ".concat(accordion.index, " header"));
          accordion.toggle();
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
      } // Store instance


      accordionInstances.push(accordion);
    }); // Store instances globally for external access

    window.Portfolio.serviceAccordions = accordionInstances;
    window.log('effects', "[SERVICE ACCORDION] Setup complete - ".concat(categories.length, " categories initialized"));
  }
  /**
   * Reveal service accordion containers sequentially on section entry (content stays collapsed).
   * Called when Services section becomes active.
   */


  function autoExpandServiceAccordions() {
    var transactionId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (!window.Portfolio.serviceAccordions) {
      window.log('effects', '[SERVICE AUTO-EXPAND] Accordions not initialized');
      return;
    }

    var config = window.CONFIG.services;

    if (!config.autoExpandOnEntry) {
      window.log('effects', '[SERVICE AUTO-EXPAND] Auto-expansion disabled');
      return;
    }

    var accordions = window.Portfolio.serviceAccordions;
    var isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
    window.log('effects', '[SERVICE AUTO-EXPAND] Starting container reveal cascade (content stays collapsed)'); // Mobile only: no container reveal animation (no y/scale on cards); cards visible, content collapsed.

    if (isTabletOrMobile) {
      accordions.forEach(function (accordion) {
        gsap.killTweensOf(accordion.element);
        gsap.killTweensOf(accordion.content);
        gsap.set(accordion.element, config.containerAnimation.to);
        gsap.set(accordion.content, {
          maxHeight: 0,
          padding: 0
        });
        accordion.isExpanded = false;
        accordion.element.classList.remove('is-expanded');
        accordion.header.setAttribute('aria-expanded', 'false');
        accordion.content.setAttribute('aria-hidden', 'true');
      }); // Store anchor position so expand/collapse can keep block in place (flex re-centering causes drift).

      requestAnimationFrame(function () {
        var wrapper = accordions[0] && accordions[0].element.closest('.services-wrapper');

        if (wrapper) {
          gsap.set(wrapper, {
            y: 0
          });
          var r = wrapper.getBoundingClientRect();
          wrapper._servicesAnchorCenter = r.top + r.height / 2;
        }
      });
      return;
    } // Desktop: reveal containers one by one with delays


    accordions.forEach(function (accordion, idx) {
      var delay = config.startDelay + idx * config.expansionDelay;
      gsap.delayedCall(delay / 1000, function () {
        // Validate transaction if provided
        if (transactionId && window.Portfolio.scroll) {
          var currentTransactionId = window.Portfolio.scroll.getCurrentTransactionId();

          if (transactionId !== currentTransactionId) {
            window.log('effects', "[SERVICE AUTO-EXPAND] Transaction ".concat(transactionId, " cancelled - skipping expansion"));
            return;
          }
        } // Check if user is still on Services section


        var servicesSection = document.getElementById('services');
        var currentSectionIndex = window.sections ? window.sections.indexOf(servicesSection) : -1;

        if (currentSectionIndex === window.currentSection) {
          window.log('effects', "[SERVICE AUTO-EXPAND] \uD83C\uDFAC Revealing container ".concat(accordion.index, " (").concat(accordion.accordionId, ")")); // 🔧 FIX: Kill any existing animations on this specific accordion's element AND content

          gsap.killTweensOf(accordion.element);
          gsap.killTweensOf(accordion.content); // 🔧 CRITICAL: Force reset content to collapsed state before container animation

          gsap.set(accordion.content, {
            maxHeight: 0,
            padding: '0'
          }); // 🔍 VERIFY: Log state immediately after gsap.set

          setTimeout(function () {
            var checkStyle = window.getComputedStyle(accordion.content);
            window.log('effects', "[AUTO-EXPAND ".concat(accordion.index, "] AFTER gsap.set - padding: ").concat(checkStyle.padding, ", maxHeight: ").concat(checkStyle.maxHeight));
          }, 5); // First animate the container itself appearing (using config values) - ELEMENT-SPECIFIC

          var containerAnim = config.containerAnimation;
          gsap.to(accordion.element, _objectSpread({}, containerAnim.to, {
            duration: containerAnim.duration,
            ease: containerAnim.ease,
            onStart: function onStart() {
              window.log('effects', "[SERVICE AUTO-EXPAND] \uD83C\uDFAA Container reveal START for accordion ".concat(accordion.index));
              window.log('effects', "[SERVICE AUTO-EXPAND] Target element:", accordion.element); // 🔍 Check content state at container animation START

              var startStyle = window.getComputedStyle(accordion.content);
              window.log('effects', "[CONTAINER START ".concat(accordion.index, "] Content state - padding: ").concat(startStyle.padding, ", maxHeight: ").concat(startStyle.maxHeight));
            },
            onComplete: function onComplete() {
              // Desktop: expand all by default (side-by-side layout). Tablet/mobile: leave collapsed.
              if (window.matchMedia('(min-width: 900px)').matches) {
                accordion.expand();
              }

              window.log('effects', "[SERVICE AUTO-EXPAND] \u2705 Container reveal COMPLETE for accordion ".concat(accordion.index));
            }
          }));
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
    var config = window.CONFIG.services;
    var isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 899px)').matches;
    var wrapper = isTabletOrMobile && window.Portfolio.serviceAccordions[0] ? window.Portfolio.serviceAccordions[0].element.closest('.services-wrapper') : null;
    if (wrapper) gsap.set(wrapper, {
      y: 0
    });
    window.Portfolio.serviceAccordions.forEach(function (accordion) {
      window.log('effects', "[SERVICE ACCORDION] Resetting accordion ".concat(accordion.index, " (").concat(accordion.accordionId, ")")); // Collapse the content

      accordion.collapse(); // Desktop: hide containers for next reveal. Mobile: leave visible (no container reveal).

      gsap.set(accordion.element, isTabletOrMobile ? config.containerAnimation.to : config.containerAnimation.from);
    });
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
      window.log('effects', '[FLIP CARDS] Form integration setup complete');
    }
  } // Expose effects functions


  window.Portfolio.effects = {
    setupButtonEffects: setupButtonEffects,
    setupScrollButtonHoverEffects: setupScrollButtonHoverEffects,
    setupServiceAccordion: setupServiceAccordion,
    // Updated Services Layout – 2025 Version
    autoExpandServiceAccordions: autoExpandServiceAccordions,
    // Auto-expand on section entry
    resetServiceAccordions: resetServiceAccordions,
    // Reset on section exit
    setupFlipCardFormIntegration: setupFlipCardFormIntegration // Legacy - kept for backwards compatibility

  };

  if (window.Portfolio.debug) {
    window.log('initialization', '[EFFECTS] Module loaded successfully');
  }
})();