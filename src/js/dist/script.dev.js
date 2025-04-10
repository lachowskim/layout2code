"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);
$(document).ready(function () {
  // CRITICAL FIX: Log script execution start to help with debugging
  console.log("🔄 Script initialization started - fixing LiveServer reload issues"); // --- Configuration Variables ---

  var preloaderConfig = {
    duration: 1000,
    // Increased duration in milliseconds for better visibility
    showOncePerSession: true // Only show once per browser session

  }; // Development/Production mode toggle

  var configMode = {
    developmentMode: true,
    // Set to false for production
    liveServerProtection: false,
    // Disable Live Server protection
    debugLogging: false // Enable debug logging

  }; // Flag to detect and prevent infinite refresh loops

  var isPageReloading = false; // CRITICAL FIX: Always clear session storage on page load to prevent infinite reloads

  sessionStorage.removeItem('isReloading');
  console.log("🧹 Session storage cleared to prevent reload loops"); // IMMEDIATE FIX: Force reset the flag to false (was stuck at true)

  isPageReloading = false; // Modify page reload detection to avoid infinite loop on Live Server

  window.addEventListener('beforeunload', function () {
    isPageReloading = false;
  }); // Check if we're coming back from a reload - MODIFIED to prevent loops

  var wasReloading = false; // Force this to false to break the loop

  sessionStorage.removeItem('isReloading'); // Clear any existing flag

  isPageReloading = false; // Force this to false
  // Also listen for visibility changes which often happen during Live Server refreshes

  document.addEventListener('visibilitychange', function () {
    // Completely disabled to prevent reload loops with Live Server
    // Do nothing here that would set reload flags
    if (configMode.debugLogging && document.visibilityState === 'hidden') {
      console.log("Page visibility changed to hidden, but protection disabled");
    } else if (configMode.debugLogging && document.visibilityState === 'visible') {
      console.log("Page visibility changed to visible, but protection disabled");
    }
  }); // Dot navigation config

  var dotNavConfig = {
    rightPosition: 65,
    // Default position from right edge (px)
    activeEffect: 'effect-pulse' // Options: 'effect-pulse', 'effect-glow', 'effect-bounce', or ''

  }; // Section transition animation config

  var sectionAnimConfig = {
    currentAnimIndex: 4,
    // Default animation type (index in the animations array)
    duration: 1,
    // Animation duration in seconds
    dotToContentDelay: 0,
    // Delay between dot activation and content animation (seconds)
    fadeSpeed: 0.3 // NEW: Controls how quickly content fades out (smaller = faster)

  }; // Scroll sensitivity config

  var scrollConfig = {
    threshold: 200,
    wheelSpeed: -5,
    // Negative for correct scroll direction
    throttle: 16
  }; // Animation variations for section transitions - completely revised for reliability

  var sectionAnimations = [// 0: Default slide (standard implementation) - Now using scale animation
  {
    name: 'Slide (Scale)',
    animation: function animation(currentIndex, targetIndex, onComplete) {
      // Get sections
      var currentSection = sections[currentIndex];
      var targetSection = sections[targetIndex];
      var targetY = targetIndex * window.innerHeight; // Create timeline

      var tl = gsap.timeline({
        onComplete: onComplete
      }); // Pre-set target section content with scale (fade from within)

      gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        transformOrigin: 'center center'
      }); // First scroll immediately to position (INSTANT)

      window.scrollTo(0, targetY); // Fade out current section content with scale

      tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
        ease: "power1.out"
      }, 0); // Fade in target section content with scale

      tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 1,
        opacity: 1,
        duration: sectionAnimConfig.duration / 2,
        ease: "power1.in"
      }, 0.05); // Small delay for better visual effect
    }
  }, // 1: Fade transition - Now using scale animation
  {
    name: 'Fade (Scale)',
    animation: function animation(currentIndex, targetIndex, onComplete) {
      // Get sections
      var currentSection = sections[currentIndex];
      var targetSection = sections[targetIndex];
      var targetY = targetIndex * window.innerHeight; // Create timeline

      var tl = gsap.timeline({
        onComplete: onComplete
      }); // Immediately hide target section content with scale

      gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        transformOrigin: 'center center'
      }); // First scroll immediately to position

      window.scrollTo(0, targetY); // Fade out current section content with scale

      tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
        ease: "power1.out"
      }, 0); // Fade in target section content with scale

      tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 1,
        opacity: 1,
        duration: sectionAnimConfig.duration / 2,
        ease: "power1.in"
      }, 0.05); // Small delay for better visual effect
    }
  }, // 2: Scale transition - Already using scale animation, just make consistent
  {
    name: 'Scale',
    animation: function animation(currentIndex, targetIndex, onComplete) {
      // Get sections
      var currentSection = sections[currentIndex];
      var targetSection = sections[targetIndex];
      var targetY = targetIndex * window.innerHeight; // Create timeline

      var tl = gsap.timeline({
        onComplete: onComplete
      }); // Pre-set target section content

      gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.8,
        opacity: 0,
        transformOrigin: 'center center'
      }); // First scroll immediately to position

      window.scrollTo(0, targetY); // Scale down current section content

      tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.8,
        opacity: 0,
        duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
        ease: "power1.out"
      }, 0); // Scale up target section content

      tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 1,
        opacity: 1,
        duration: sectionAnimConfig.duration / 2,
        ease: "power1.in"
      }, 0.05); // Small delay for better visual effect
    }
  }, // 3: Slide from side - Modified to use scale animation instead of x position
  {
    name: 'Scale with Side Effect',
    animation: function animation(currentIndex, targetIndex, onComplete) {
      // Get sections
      var currentSection = sections[currentIndex];
      var targetSection = sections[targetIndex];
      var targetY = targetIndex * window.innerHeight; // Create timeline

      var tl = gsap.timeline({
        onComplete: onComplete
      }); // Pre-set target section content

      gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        transformOrigin: 'center center'
      }); // First scroll immediately to position

      window.scrollTo(0, targetY); // Fade out current section content with scale

      tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.8,
        opacity: 0,
        duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
        ease: "power1.out"
      }, 0); // Fade in target section content with scale

      tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 1,
        opacity: 1,
        duration: sectionAnimConfig.duration / 2,
        ease: "power1.in"
      }, 0.05); // Small delay for better visual effect
    }
  }, // 4: Staggered fade - Modified to use scale with stagger
  {
    name: 'Staggered Scale',
    animation: function animation(currentIndex, targetIndex, onComplete) {
      // Get sections
      var currentSection = sections[currentIndex];
      var targetSection = sections[targetIndex];
      var targetY = targetIndex * window.innerHeight; // Create timeline

      var tl = gsap.timeline({
        onComplete: onComplete
      }); // Pre-set target section content

      gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        transformOrigin: 'center center'
      }); // First scroll immediately to position

      window.scrollTo(0, targetY); // Fade out current section content all at once with scale

      tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 0.9,
        opacity: 0,
        duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
        ease: "power1.out"
      }, 0); // Fade in target section content with stagger and scale

      tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), {
        scale: 1,
        opacity: 1,
        duration: sectionAnimConfig.duration / 2,
        stagger: 0.02,
        ease: "power1.in"
      }, 0.05); // Small delay for better visual effect
    }
  }]; // --- Improved Preloader ---

  var preloader = $("#preloader"); // Function to handle preloader

  var handlePreloader = function handlePreloader() {
    // Force the preloader to be visible and fully opaque at start
    preloader.css({
      'display': 'flex',
      'opacity': '1'
    }); // Set the CSS variable for transition duration

    document.documentElement.style.setProperty('--preloader-duration', "".concat(preloaderConfig.duration, "ms")); // Force browser reflow to ensure styles are applied before animation starts

    preloader[0].offsetHeight;
    console.log("Starting preloader animation with duration:", preloaderConfig.duration); // Use GSAP for more reliable animation instead of CSS transitions

    gsap.to(preloader[0], {
      opacity: 0,
      duration: preloaderConfig.duration / 1000,
      // Convert to seconds for GSAP
      ease: "power2.out",
      onComplete: function onComplete() {
        preloader.hide();
        console.log("Preloader animation complete");
      }
    });
  }; // Check if we should show the preloader


  var hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');

  if (preloaderConfig.showOncePerSession && hasSeenPreloader) {
    // Skip preloader if already seen
    preloader.hide();
    console.log("Preloader skipped - already seen in this session");
  } else {
    // Ensure preloader is fully visible before starting fade-out
    // Use setTimeout to ensure DOM is ready
    setTimeout(handlePreloader, 100); // Mark as seen

    sessionStorage.setItem('hasSeenPreloader', 'true');
  } // --- Mobile Menu ---


  var burgerIcon = $("#burgerIcon");
  var menu = $(".menu-wrapper ul.menu");
  var menuOverlay = $("#menuOverlay");
  burgerIcon.on("click", function () {
    menu.toggleClass("active");
    menuOverlay.toggleClass("active");
    burgerIcon.toggleClass("active");
  });
  menuOverlay.on("click", function () {
    menu.removeClass("active");
    menuOverlay.removeClass("active");
    burgerIcon.removeClass("active");
  });
  menu.find("a").on("click", function (e) {
    menu.removeClass("active");
    menuOverlay.removeClass("active");
    burgerIcon.removeClass("active"); // Scroll handled below by GSAP Observer/goToSection
  }); // --- GSAP Observer Setup (Scroll Hijacking) ---
  // Observer (Re-enabled)

  var sections = gsap.utils.toArray('.section');
  var sectionCount = sections.length;
  var scrollUpBtn = document.querySelector(".scroll-up"); // Get scroll up button

  var scrollDownBtn = document.querySelector(".scroll-down"); // Get scroll down button

  var currentSection = 0;
  var isAnimating = false; // Function to refresh section detection and navigation

  var refreshSections = function refreshSections() {
    sections = gsap.utils.toArray('.section');
    sectionCount = sections.length; // Reinitialize dot navigation with new sections

    initDotNav(); // Fix initial state if needed

    if (currentSection >= sectionCount) {
      currentSection = sectionCount - 1;
    }

    return sectionCount;
  }; // Function to reinitialize the scroll observer


  var reinitializeScrollObserver = function reinitializeScrollObserver() {
    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    // Kill any existing observers
    Observer.getAll().forEach(function (obs) {
      return obs.kill();
    }); // Create a new observer with current settings

    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: scrollConfig.wheelSpeed,
      tolerance: scrollConfig.threshold,
      throttle: scrollConfig.throttle,
      preventDefault: true,
      onDown: function onDown() {
        return !isAnimating && goToSection(currentSection - 1, -1);
      },
      // Scroll down = previous section
      onUp: function onUp() {
        return !isAnimating && goToSection(currentSection + 1, 1);
      } // Scroll up = next section

    });
  }; // Create an emergency reset button in console


  window.resetScrollNow = function () {
    // Kill all observers
    Observer.getAll().forEach(function (obs) {
      return obs.kill();
    }); // Reset flags

    isPageReloading = false;
    isAnimating = false;
    configMode.liveServerProtection = false; // Clear any session storage

    sessionStorage.removeItem('isReloading'); // Force reinitialize scroll with the force parameter

    reinitializeScrollObserver(true);
    console.log("🔥 EMERGENCY SCROLL RESET APPLIED 🔥");
    console.log("Protection disabled, flags reset");
    return "Scroll has been reset - try scrolling now";
  }; // Add a dedicated fix for LiveServer infinite reload issues


  window.fixLiveServerReload = function () {
    // Clear session storage
    sessionStorage.clear(); // Reset all flags

    isPageReloading = false;
    isAnimating = false;
    configMode.liveServerProtection = false; // Kill and recreate observers with force parameter

    reinitializeScrollObserver(true); // Refresh sections

    refreshSections();
    console.log("🔧 LIVE SERVER RELOAD FIX APPLIED 🔧");
    console.log("Try refreshing the page now - it should load properly");
    return "LiveServer reload fix applied";
  }; // Make all helpers available globally


  window.refreshSections = refreshSections;
  window.reinitializeScrollObserver = reinitializeScrollObserver; // --- Initialize Dot Navigation ---

  var initDotNav = function initDotNav() {
    var dotsContainer = document.querySelector('.section-dots'); // Set configurable right position

    document.documentElement.style.setProperty('--dot-nav-right-position', "".concat(dotNavConfig.rightPosition, "px")); // Clear any existing dots

    dotsContainer.innerHTML = ''; // Create dots based on section count

    sections.forEach(function (section, index) {
      // Create dot container (holds dot and label)
      var dotContainer = document.createElement('div');
      dotContainer.className = 'section-dot-container'; // Create dot

      var dot = document.createElement('div');
      dot.className = 'section-dot';

      if (index === currentSection) {
        dot.classList.add('active', dotNavConfig.activeEffect);
      } // Create section name label


      var sectionName = document.createElement('div');
      sectionName.className = 'section-dot-label'; // Try to get section name from ID, data attribute, or use generic name

      var sectionId = section.id || "section-".concat(index + 1);
      var displayName = section.dataset.name || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      sectionName.textContent = displayName; // Add elements to container

      dotContainer.appendChild(sectionName);
      dotContainer.appendChild(dot); // Click event to navigate to corresponding section

      dotContainer.addEventListener('click', function () {
        if (!isAnimating && index !== currentSection) {
          var direction = index > currentSection ? 1 : -1;
          goToSection(index, direction);
        }
      });
      dotsContainer.appendChild(dotContainer);
    });
  }; // Initialize dot navigation


  initDotNav(); // Completely rewritten goToSection function with more reliable animation handling

  function goToSection(index, direction) {
    // Ensure index is within bounds 
    index = Math.max(0, Math.min(index, sections.length - 1)); // Check if already animating or at the target section

    if (isAnimating || index === currentSection) return;
    console.log("\uD83D\uDD04 goToSection called: index=".concat(index, ", currentSection=").concat(currentSection, ", direction=").concat(direction)); // Set animating flag

    isAnimating = true; // Store current section before updating

    var prevSection = currentSection; // Update current section

    currentSection = index; // --- Button Disappearance Animation ---

    if (scrollUpBtn && scrollDownBtn) {
      // Button animations (existing code)
      if (direction === 1 && currentSection === 1) {
        gsap.to(scrollUpBtn, {
          duration: 0.3,
          opacity: 0,
          y: -20,
          ease: "power2.out"
        });
      } else if (direction === -1 && currentSection === sections.length - 2) {
        gsap.to(scrollDownBtn, {
          duration: 0.3,
          opacity: 0,
          y: 20,
          ease: "power2.out"
        });
      } else if (currentSection === 0) {
        gsap.to(scrollUpBtn, {
          duration: 0.3,
          opacity: 0,
          y: -20,
          ease: "power2.out"
        });
      } else if (currentSection === sections.length - 1) {
        gsap.to(scrollDownBtn, {
          duration: 0.3,
          opacity: 0,
          y: 20,
          ease: "power2.out"
        });
      }
    } // Get the selected animation


    var animationIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
    var selectedAnimation = sectionAnimations[animationIndex]; // --- Dynamic Header Title - Animate Out Immediately ---

    var titleContainer = document.getElementById('dynamic-header-title-container');
    console.log("\uD83D\uDCE6 Title container found:", titleContainer ? 'YES' : 'NO');
    var currentHeaderTitle = titleContainer ? titleContainer.querySelector('.header-dynamic-title') : null;
    console.log("\uD83D\uDCDD Existing header title found:", currentHeaderTitle ? 'YES' : 'NO'); // Logo arrow reference

    var logoArrow = document.querySelector('#headerLogo #arrowGroup'); // Determine if previous section had a header

    var prevSectionHadHeader = prevSection !== 0 && prevSection !== sections.length - 1; // Determine if new section has a header

    var newSectionHasHeader = currentSection !== 0 && currentSection !== sections.length - 1; // Only rotate when transitioning between header/no-header states

    var shouldRotateArrow = prevSectionHadHeader !== newSectionHasHeader;

    if (currentHeaderTitle) {
      console.log("\uD83D\uDD04 Animating OUT existing header title");
      gsap.to(currentHeaderTitle, {
        xPercent: -100,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: function onComplete() {
          console.log("\u2705 Animation OUT complete, removing element");

          if (currentHeaderTitle.parentNode) {
            // Check if still attached
            currentHeaderTitle.parentNode.removeChild(currentHeaderTitle);
          }
        }
      }); // Rotate arrow back to initial position (clockwise) only when needed

      if (logoArrow && shouldRotateArrow) {
        gsap.to(logoArrow, {
          rotation: 0,
          duration: 0.4,
          ease: 'power2.inOut'
        });
      }
    } // ------------------------------------------------------
    // Execute the section animation


    selectedAnimation.animation(prevSection, currentSection, function () {
      // Main Section Animation complete
      isAnimating = false;
      console.log("\u2705 Main section animation complete"); // --- Dynamic Header Title - Animate In After Delay ---

      console.log("\uD83D\uDCCA Current section=".concat(currentSection, ", Banner check:"), currentSection !== 0);

      if (currentSection !== 0 && titleContainer) {
        // Don't show title for banner
        var originalH1 = sections[currentSection].querySelector('.headline h1');
        console.log("\uD83D\uDD0D Original H1 found:", originalH1 ? 'YES' : 'NO', originalH1 ? "Text: \"".concat(originalH1.textContent, "\"") : '');

        if (originalH1) {
          var titleText = originalH1.textContent;
          var newTitle = document.createElement('h1');
          newTitle.className = 'header-dynamic-title';
          newTitle.textContent = titleText; // Set initial style for proper animation

          gsap.set(newTitle, {
            xPercent: -100,
            autoAlpha: 0,
            color: '#FFFFFF' // Use the highlight color to make it more visible

          }); // Add to DOM

          titleContainer.appendChild(newTitle);
          console.log("\u2795 New title created and appended to container"); // Animate in AFTER main animation

          console.log("\uD83D\uDD04 Animating IN new header title");
          gsap.to(newTitle, {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.5,
            // Slightly longer for visibility
            ease: 'back.out(1.2)',
            // More pronounced animation
            onStart: function onStart() {
              console.log("\uD83D\uDE80 Animation IN started - newTitle:", newTitle); // Rotate arrow counter-clockwise 135 degrees as header slides in
              // Only when transitioning between sections with/without headers

              if (logoArrow && shouldRotateArrow) {
                gsap.to(logoArrow, {
                  rotation: -135,
                  // Adjusted rotation value
                  duration: 0.5,
                  ease: 'back.out(1.2)'
                });
              }
            },
            onComplete: function onComplete() {
              console.log("\u2705 Animation IN complete"); // Make sure the title stays visible

              gsap.set(newTitle, {
                clearProps: "all"
              });
              newTitle.style.color = '#FFFFFF'; // Keep highlight color
            }
          });
        }
      } // ------------------------------------------------------
      // --- Button Appearance Animation --- 


      if (scrollUpBtn && scrollDownBtn) {
        if (currentSection > 0) {
          gsap.to(scrollUpBtn, {
            duration: 0.3,
            opacity: 1,
            y: 0,
            ease: "power2.out"
          });
        }

        if (currentSection < sections.length - 1) {
          gsap.to(scrollDownBtn, {
            duration: 0.3,
            opacity: 1,
            y: 0,
            ease: "power2.out"
          });
        }

        if (currentSection === 0) {
          gsap.to(scrollUpBtn, {
            duration: 0.3,
            opacity: 0,
            y: -20,
            ease: "power2.out"
          });
        }

        if (currentSection === sections.length - 1) {
          gsap.to(scrollDownBtn, {
            duration: 0.3,
            opacity: 0,
            y: 20,
            ease: "power2.out"
          });
        }
      }
    }); // Delay dot navigation update

    setTimeout(function () {
      // Update dot navigation
      var dots = document.querySelectorAll('.section-dot-container .section-dot'); // First reset all dots

      dots.forEach(function (dot) {
        dot.classList.remove('active', 'effect-pulse', 'effect-glow', 'effect-bounce');
        gsap.killTweensOf(dot);
        gsap.set(dot, {
          scale: 1,
          clearProps: "filter,boxShadow"
        });
      }); // Then set new active dot

      if (dots[currentSection]) {
        var activeDot = dots[currentSection]; // Add active class and effect

        activeDot.classList.add('active');

        if (dotNavConfig.activeEffect) {
          activeDot.classList.add(dotNavConfig.activeEffect);
        } // Animate scale with same duration as content animation


        gsap.to(activeDot, {
          scale: 1.3,
          duration: sectionAnimConfig.duration,
          ease: "power2.out",
          onComplete: function onComplete() {
            if (dotNavConfig.activeEffect === 'effect-glow') {
              gsap.to(activeDot, {
                boxShadow: "0 0 10px 2px rgba(241, 178, 71, 0.7)",
                duration: 0.3
              });
            }
          }
        });
      }
    }, sectionAnimConfig.dotToContentDelay * 1000); // Apply the delay to the dot transition
  } // Initialize scroll observer


  reinitializeScrollObserver(); // Public methods for easy animation type switching

  window.setSectionAnimation = function (animationIndex) {
    // Ensure the index is valid
    var validIndex = Math.min(Math.max(0, animationIndex), sectionAnimations.length - 1);
    sectionAnimConfig.currentAnimIndex = validIndex; // Force refresh all section animations by re-triggering all ScrollTrigger callbacks
    // This ensures the new animation type is immediately applied to all visible sections

    ScrollTrigger.getAll().forEach(function (trigger) {
      // Only refresh section-specific triggers
      if (trigger.id && trigger.id.startsWith('section-')) {
        if (trigger.isActive) {
          // If the trigger is active, manually call its callbacks to update animations
          if (trigger.direction > 0 && trigger.onEnter) {
            trigger.onEnter();
          } else if (trigger.direction < 0 && trigger.onEnterBack) {
            trigger.onEnterBack();
          }
        }
      }
    });
    console.log("Animation set to: ".concat(sectionAnimations[validIndex].name));
    return sectionAnimations[validIndex].name;
  };

  window.getSectionAnimations = function () {
    return sectionAnimations.map(function (anim, index) {
      return {
        index: index,
        name: anim.name
      };
    });
  };

  window.setDotEffect = function (effectName) {
    // Valid effects: 'effect-pulse', 'effect-glow', 'effect-bounce', or ''
    dotNavConfig.activeEffect = effectName; // Update current active dot

    var dots = document.querySelectorAll('.section-dot-container .section-dot');
    dots.forEach(function (dot, i) {
      dot.classList.remove('effect-pulse', 'effect-glow', 'effect-bounce');

      if (i === currentSection) {
        dot.classList.add(dotNavConfig.activeEffect);
      }
    });
    return "Dot effect set to: ".concat(effectName || 'none');
  }; // GSAP Smooth Scroll for Anchor Links (Uses goToSection)


  $('a[href^="#"]').on("click", function (e) {
    // Immediately prevent default to avoid any standard scroll behavior
    e.preventDefault();
    var targetId = $(this).attr('href');
    var targetSection = $(targetId)[0];

    if (targetSection) {
      var sectionIndex = sections.indexOf(targetSection);

      if (sectionIndex > -1) {
        goToSection(sectionIndex);
      }
    }
  }); // Log successful initialization to console

  console.log("✅ Script initialized successfully - scrolling should be working");
  console.log("💡 If you still have issues, type fixLiveServerReload() in the console"); // --- Section Content Animations (Check NodeList Length) ---

  sections.forEach(function (section, index) {
    // --- Default Animation (Subtle Scale Up) ---
    var defaultAnimElements = section.querySelectorAll('.headline h1, .headline h2, .headline p, .headline .btn, .portfolio-wrapper .headline, .portfolio-wrapper .text-portfolio, .form-details h2, .form-details h3, .service-card');

    if (defaultAnimElements && defaultAnimElements.length > 0) {
      gsap.set(defaultAnimElements, {
        autoAlpha: 0,
        scale: 0.9,
        transformOrigin: 'center center'
      });
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top center+=100",
      end: "bottom center-=100",
      id: "section-default-".concat(index),
      onEnter: function onEnter() {
        // Check length before animating
        if (defaultAnimElements && defaultAnimElements.length > 0) {
          gsap.to(defaultAnimElements, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power1.out'
          });
        }
      },
      onLeave: function onLeave() {
        // Reset when leaving forward (optional but good practice)
        if (defaultAnimElements && defaultAnimElements.length > 0) {
          gsap.to(defaultAnimElements, {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power1.in'
          });
        }
      },
      onEnterBack: function onEnterBack() {
        // Check length before animating
        if (defaultAnimElements && defaultAnimElements.length > 0) {
          gsap.to(defaultAnimElements, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power1.out'
          });
        }
      },
      onLeaveBack: function onLeaveBack() {
        // Check length before animating
        if (defaultAnimElements && defaultAnimElements.length > 0) {
          gsap.to(defaultAnimElements, {
            autoAlpha: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power1.in'
          });
        }
      }
    }); // --- Special Animations for #about and #form (Check NodeLists) --- 

    var aboutTl, formTl; // Define timelines outside conditional scope

    if (section.id === 'banner') {
      var bannerWrapper = section.querySelector('.headline-wrapper');
      var bannerText = section.querySelector('.headline-text');
      var bannerElements = section.querySelectorAll('.headline-text h1, .headline-text h2, .headline-text .btn'); // Ensure elements exist before setting/animating

      if (bannerWrapper && bannerText && bannerElements.length > 0) {
        // Use scale animation (fade from within)
        gsap.set([bannerWrapper, bannerText].concat(_toConsumableArray(bannerElements)), {
          autoAlpha: 0,
          scale: 0.9,
          transformOrigin: 'center center'
        }); // Get the selected animation from global config

        var animationIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1); // Create a ScrollTrigger that will use the global configuration

        ScrollTrigger.create({
          trigger: section,
          start: "top center+=100",
          end: "bottom center-=100",
          id: 'section-banner',
          onEnter: function onEnter() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1); // When entering, apply animation based on current global setting

            gsap.to([bannerWrapper, bannerText].concat(_toConsumableArray(bannerElements)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onEnterBack: function onEnterBack() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
            gsap.to([bannerWrapper, bannerText].concat(_toConsumableArray(bannerElements)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onLeave: function onLeave() {
            gsap.to([bannerWrapper, bannerText].concat(_toConsumableArray(bannerElements)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          },
          onLeaveBack: function onLeaveBack() {
            gsap.to([bannerWrapper, bannerText].concat(_toConsumableArray(bannerElements)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          }
        });
      }
    }

    if (section.id === 'about') {
      // Instead of creating a completely custom animation, we'll respect global animation settings
      // but still select the specific elements for the about section
      var aboutWrapper = section.querySelector('.about-wrapper');
      var aboutHeadline = section.querySelector('.about-wrapper-headline');
      var aboutText = section.querySelectorAll('.about-text p');
      var techBoxes = section.querySelectorAll('#technologies .box'); // Ensure elements exist before setting/animating

      if (aboutWrapper && aboutText.length > 0 && techBoxes.length > 0) {
        // Use scale animation like banner (fade from within)
        gsap.set([aboutHeadline].concat(_toConsumableArray(aboutText), _toConsumableArray(techBoxes)), {
          autoAlpha: 0,
          scale: 0.9,
          transformOrigin: 'center center'
        }); // Create a ScrollTrigger that will use the global configuration

        ScrollTrigger.create({
          trigger: section,
          start: "top center+=100",
          end: "bottom center-=100",
          id: 'section-about',
          onEnter: function onEnter() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1); // When entering, apply animation based on current global setting

            gsap.to([aboutHeadline].concat(_toConsumableArray(aboutText), _toConsumableArray(techBoxes)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onEnterBack: function onEnterBack() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
            gsap.to([aboutHeadline].concat(_toConsumableArray(aboutText), _toConsumableArray(techBoxes)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onLeave: function onLeave() {
            gsap.to([aboutHeadline].concat(_toConsumableArray(aboutText), _toConsumableArray(techBoxes)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          },
          onLeaveBack: function onLeaveBack() {
            gsap.to([aboutHeadline].concat(_toConsumableArray(aboutText), _toConsumableArray(techBoxes)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          }
        });
      }
    }

    if (section.id === 'form') {
      var formWrapper = section.querySelector('.form-wrapper');
      var formDetails = section.querySelectorAll('.form-details h2, .form-details h3');
      var formInputs = section.querySelectorAll('form input, form textarea, form .btn');

      if (formWrapper && formDetails.length > 0 && formInputs.length > 0) {
        // Use scale animation like banner (fade from within)
        gsap.set([formWrapper].concat(_toConsumableArray(formDetails), _toConsumableArray(formInputs)), {
          autoAlpha: 0,
          scale: 0.9,
          transformOrigin: 'center center'
        }); // Create a ScrollTrigger that will use the global configuration

        ScrollTrigger.create({
          trigger: section,
          start: "top center+=100",
          end: "bottom center-=100",
          id: 'section-form',
          onEnter: function onEnter() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1); // When entering, apply animation based on current global setting

            gsap.to([formWrapper].concat(_toConsumableArray(formDetails), _toConsumableArray(formInputs)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onEnterBack: function onEnterBack() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
            gsap.to([formWrapper].concat(_toConsumableArray(formDetails), _toConsumableArray(formInputs)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onLeave: function onLeave() {
            gsap.to([formWrapper].concat(_toConsumableArray(formDetails), _toConsumableArray(formInputs)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          },
          onLeaveBack: function onLeaveBack() {
            gsap.to([formWrapper].concat(_toConsumableArray(formDetails), _toConsumableArray(formInputs)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          }
        });
      }
    } // Add special animation for skills section with staggered card reveal


    if (section.id === 'skills') {
      var skillsHeadline = section.querySelector('.headline');
      var skillCards = section.querySelectorAll('.skill-card');

      if (skillsHeadline && skillCards.length > 0) {
        // Set initial state - hide elements
        gsap.set(skillsHeadline, {
          autoAlpha: 0,
          y: -30
        });
        gsap.set(skillCards, {
          autoAlpha: 0,
          y: 50,
          rotationY: 15,
          transformOrigin: "center center"
        }); // Create the ScrollTrigger for the skills section

        ScrollTrigger.create({
          trigger: section,
          start: "top center+=100",
          end: "bottom center-=100",
          id: 'section-skills',
          onEnter: function onEnter() {
            // Animate headline first
            gsap.to(skillsHeadline, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out"
            }); // Then stagger the cards with a cascade effect

            gsap.to(skillCards, {
              autoAlpha: 1,
              y: 0,
              rotationY: 0,
              stagger: 0.1,
              duration: 0.8,
              delay: 0.3,
              // Start after headline animation
              ease: "back.out(1.2)"
            });
          },
          onEnterBack: function onEnterBack() {
            // Similar animation when scrolling back up
            gsap.to(skillsHeadline, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out"
            });
            gsap.to(skillCards, {
              autoAlpha: 1,
              y: 0,
              rotationY: 0,
              stagger: 0.07,
              duration: 0.8,
              delay: 0.2,
              ease: "back.out(1.2)"
            });
          },
          onLeave: function onLeave() {
            // Hide when scrolling away
            gsap.to(skillsHeadline, {
              autoAlpha: 0,
              y: -30,
              duration: 0.5,
              ease: "power1.in"
            });
            gsap.to(skillCards, {
              autoAlpha: 0,
              y: 50,
              stagger: 0.03,
              duration: 0.5,
              ease: "power1.in"
            });
          },
          onLeaveBack: function onLeaveBack() {
            // Hide when scrolling back
            gsap.to(skillsHeadline, {
              autoAlpha: 0,
              y: -30,
              duration: 0.5,
              ease: "power1.in"
            });
            gsap.to(skillCards, {
              autoAlpha: 0,
              y: 50,
              stagger: 0.03,
              duration: 0.5,
              ease: "power1.in"
            });
          }
        });
      }
    }

    if (section.id === 'services') {
      var servicesWrapper = section.querySelector('.services-wrapper');
      var serviceCards = section.querySelectorAll('.service-card');

      if (servicesWrapper && serviceCards.length > 0) {
        // Use scale animation like banner (fade from within)
        gsap.set([servicesWrapper].concat(_toConsumableArray(serviceCards)), {
          autoAlpha: 0,
          scale: 0.9,
          transformOrigin: 'center center'
        }); // Create a ScrollTrigger that will use the global configuration

        ScrollTrigger.create({
          trigger: section,
          start: "top center+=100",
          end: "bottom center-=100",
          id: 'section-services',
          onEnter: function onEnter() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1); // When entering, apply animation based on current global setting

            gsap.to([servicesWrapper].concat(_toConsumableArray(serviceCards)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.05 : 0,
              // Only use stagger for staggered animation (reduced for services)
              ease: 'power1.out'
            });
          },
          onEnterBack: function onEnterBack() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
            gsap.to([servicesWrapper].concat(_toConsumableArray(serviceCards)), {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.05 : 0,
              // Only use stagger for staggered animation (reduced for services)
              ease: 'power1.out'
            });
          },
          onLeave: function onLeave() {
            gsap.to([servicesWrapper].concat(_toConsumableArray(serviceCards)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          },
          onLeaveBack: function onLeaveBack() {
            gsap.to([servicesWrapper].concat(_toConsumableArray(serviceCards)), {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          }
        });
      }
    }

    if (section.id === 'portfolio') {
      var portfolioWrapper = section.querySelector('.portfolio-wrapper');
      var portfolioHeadline = section.querySelector('.headline');
      var textPortfolio = section.querySelector('.text-portfolio');
      var portfolioImage = section.querySelector('.portfolio-image-wrapper');

      if (portfolioWrapper && portfolioHeadline && textPortfolio && portfolioImage) {
        // Use scale animation like banner (fade from within)
        gsap.set([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], {
          autoAlpha: 0,
          scale: 0.9,
          transformOrigin: 'center center'
        }); // Create a ScrollTrigger that will use the global configuration

        ScrollTrigger.create({
          trigger: section,
          start: "top center+=100",
          end: "bottom center-=100",
          id: 'section-portfolio',
          onEnter: function onEnter() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1); // When entering, apply animation based on current global setting

            gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onEnterBack: function onEnterBack() {
            // Get current animation index in case it has changed
            var currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
            gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], {
              autoAlpha: 1,
              scale: 1,
              duration: sectionAnimConfig.duration,
              stagger: currentAnimIndex === 4 ? 0.1 : 0,
              // Only use stagger for staggered animation
              ease: 'power1.out'
            });
          },
          onLeave: function onLeave() {
            gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          },
          onLeaveBack: function onLeaveBack() {
            gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], {
              autoAlpha: 0,
              scale: 0.9,
              duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
              ease: 'power1.in'
            });
          }
        });
      }
    }
  }); // --- Form Submission ---

  var form = $("form");
  form.on("submit", function (e) {
    e.preventDefault();
    var formData = {
      name: $('input[name="name"]').val(),
      email: $('input[name="_replyto"]').val(),
      message: $('textarea[name="message"]').val()
    };
    $.ajax({
      url: "https://formspree.io/f/meqydzll",
      method: "POST",
      data: formData,
      dataType: "json",
      success: function success() {
        alert("Thank you for your message! I will get back to you soon.");
        form[0].reset();
      },
      error: function error() {
        alert("Oops! There was an error sending your message. Please try again.");
      }
    });
  }); // --- Initial Setup ---

  gsap.set(window, {
    scrollTo: 0
  });
  currentSection = 0; // Optionally trigger entrance for the first section immediately
  // let firstSectionElements = sections[0].querySelectorAll(...);
  // if(firstSectionElements && firstSectionElements.length > 0) { gsap.to(firstSectionElements, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1 }); }
  // --- Initial Button State ---

  if (scrollUpBtn) {
    // Hide scroll-up initially if on first section
    gsap.set(scrollUpBtn, {
      opacity: 0,
      y: -20
    }); // y is relative to rotated state
  } // --- End Initial State ---
  // --- Radial Button ---


  var buttons = document.querySelectorAll('.btn');
  buttons.forEach(function (button) {
    button.addEventListener('mouseenter', function (e) {
      // Calculate cursor position relative to the button (0% to 100%)
      button.classList.remove('radial-hover'); // Ensure animation restarts cleanly

      var rect = button.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width * 100;
      var y = (e.clientY - rect.top) / rect.height * 100; // Set CSS custom properties used by the ::before pseudo-element's clip-path

      button.style.setProperty('--x', "".concat(x, "%"));
      button.style.setProperty('--y', "".concat(y, "%")); // Add class to trigger the expansion animation in CSS

      button.classList.add('radial-hover'); // NOTE: Expansion speed is controlled by 'transition-duration' in
      // src/scss/_base.scss -> .btn::before (currently 0.45s based on your changes)
      // Final expanded size is controlled by 'clip-path' in 
      // src/scss/_base.scss -> .btn.radial-hover::before (currently circle(150%...))
    });
    button.addEventListener('mousemove', function (e) {
      // Continuously update cursor position while moving over the button
      var rect = button.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width * 100;
      var y = (e.clientY - rect.top) / rect.height * 100; // Update CSS custom properties for smooth origin tracking

      button.style.setProperty('--x', "".concat(x, "%"));
      button.style.setProperty('--y', "".concat(y, "%"));
    });
    button.addEventListener('mouseleave', function (e) {
      // Update position one last time for the retraction origin point
      var rect = button.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width * 100;
      var y = (e.clientY - rect.top) / rect.height * 100;
      button.style.setProperty('--x', "".concat(x, "%"));
      button.style.setProperty('--y', "".concat(y, "%")); // Remove class to trigger the retraction animation in CSS

      button.classList.remove('radial-hover'); // NOTE: Retraction speed is the same as expansion speed (controlled by 'transition-duration')
    });
  }); // --- End Radial Button ---
  // --- Splitting.js Text Animations --- 

  Splitting();
  console.log("Splitting() executed."); // DEBUG: Confirm Splitting ran
  // --- "Hi" Letter 'i' Flip Animation ---

  var hiElement = document.querySelector('.headline h1[data-splitting]');

  if (hiElement) {
    console.log("Found hiElement for 'Hi' animation.");
    var iCharSpan = hiElement.querySelector('.char[style*="--char-index:1"]');

    if (iCharSpan) {
      console.log("Found iCharSpan for 'Hi' animation:", iCharSpan);
      gsap.set(iCharSpan, {
        transformOrigin: "center center",
        transformPerspective: 400
      }); // Alternative: Use jQuery event delegation on the H1

      $(hiElement).on('mouseenter', '.char:nth-child(2)', function (event) {
        // 'this' inside this function refers to the iCharSpan that was hovered
        console.log("jQuery delegate: 'i' span mouseenter triggered on", this); // DEBUG

        var targetISpan = this; // Capture 'this'

        gsap.to(targetISpan, {
          rotationY: "+=1080",
          duration: 0.7,
          ease: "elastic.out(1, 0.5)",
          overwrite: 'auto',
          onStart: function onStart() {
            return console.log("jQuery delegate: GSAP 'i' flip animation starting.");
          } // DEBUG

        });
      }); // Optional: Add mouseleave listener to parent H1 if needed
    }
  } // --- Life Animation ---


  var lifeElements = document.querySelectorAll('[data-splitting][data-life-pulse]');

  if (lifeElements.length > 0) {
    console.log("Found ".concat(lifeElements.length, " elements for 'Life' animation."));
  } else {
    console.error("Could not find elements for 'Life' animation.");
  }

  lifeElements.forEach(function (lifeElement) {
    // Find the word span for "life" specifically
    var lifeWordSpan = lifeElement.querySelector('.word[data-word="life"]');

    if (!lifeWordSpan) {
      console.error("Could not find word span for 'life' in:", lifeElement);
      return; // Skip if 'life' word span not found
    } // --- If lifeWordSpan IS found, proceed: ---


    var charsInLife = lifeWordSpan.querySelectorAll('.char');

    if (!charsInLife || charsInLife.length === 0) {
      console.error("No .char elements found within lifeWordSpan:", lifeWordSpan);
      return; // Skip if no characters found
    } // Ensure transform origin is set correctly


    gsap.set(charsInLife, {
      transformOrigin: "center center"
    }); // --- OPTION 1: Pulse on Hover (Default) ---

    var pulseTimeline = gsap.timeline({
      paused: true,
      repeat: -1
    });
    pulseTimeline.to(charsInLife, {
      scale: 1.05,
      duration: 0.15,
      stagger: 0.05,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1
    }); // Attach listeners to the found lifeWordSpan

    lifeWordSpan.addEventListener('mouseenter', function (event) {
      console.log("'Life' word span mouseenter triggered on:", lifeWordSpan);
      pulseTimeline.play();
      console.log("Playing 'Life' pulse timeline.");
    });
    lifeWordSpan.addEventListener('mouseleave', function () {
      console.log("'Life' mouseleave triggered.");
      pulseTimeline.pause().progress(0);
      gsap.set(charsInLife, {
        scale: 1
      });
    }); // --- End Option 1 ---
    // --- OPTION 2: Permanent Pulse (Uncomment to activate) ---

    /*
    gsap.to(charsInLife, { // Target only 'life' chars if permanent
    // ... (rest of code inside forEach remains the same) ...
    });
    */
    // --- End Option 2 ---
  }); // End of forEach loop for lifeElements
  // --- Vertical Word Shuffle Animation (v16 - Configurable Edges) ---

  var shuffleContainer = document.querySelector('.shuffle-container');
  var shuffleWordElement = document.querySelector('.shuffle-word');

  if (shuffleContainer && shuffleWordElement) {
    // NEW: Minimum number of slowdown steps before allowing stop on final word
    // --- EDGE CUTOFF CONFIGURATION ---
    // These can be adjusted at runtime if needed for responsive designs
    var updateEdgeCutoffs = function updateEdgeCutoffs() {
      var topCutoff = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var bottomCutoff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
      document.documentElement.style.setProperty('--shuffle-top-cutoff', "".concat(topCutoff, "px"));
      document.documentElement.style.setProperty('--shuffle-bottom-cutoff', "".concat(bottomCutoff, "px"));
    }; // Default edge cutoffs - can be called again to adjust for different screen sizes


    var shuffleWord = function shuffleWord() {
      if (isAnimatingShuffle || hasFinished) return;
      isAnimatingShuffle = true;
      clearTimeout(shuffleTimeout);
      var nextWordIndex = (wordIndex + 1) % words.length;
      var nextWord = words[nextWordIndex]; // Check if this will be the final transition we want to slow down
      // Only true if: in slowdown phase, next word is final word, and we've done enough slowdown steps

      willBeLastTransition = isSlowingDown && nextWord === finalWord && slowdownStepCounter >= minSlowdownSteps; // --- Correct Speed Curve Calculation (v16) ---

      if (stepCounter < accelerationSteps) {
        // 1. Acceleration Phase
        var progress = stepCounter / accelerationSteps;
        var easedProgress = gsap.parseEase("sine.out")(progress); // Smoother acceleration

        currentShuffleTime = gsap.utils.interpolate(initialShuffleTime, minShuffleTime, easedProgress);
        console.log("Acceleration phase: stepCounter=".concat(stepCounter, ", progress=").concat(progress.toFixed(3), ", time=").concat(currentShuffleTime.toFixed(3))); // IMPORTANT FIX: If fastLaps=0, enter slowdown immediately after acceleration

        if (stepCounter === accelerationSteps - 1 && fastLaps === 0 && !isSlowingDown) {
          isSlowingDown = true;
          slowdownStepCounter = 0;
          console.log("Acceleration complete - entering slowdown immediately (fastLaps=0)");
        }
      } else if (!isSlowingDown) {
        // Check !isSlowingDown instead of lapCount < fastLaps
        // 2. Fast Phase (Continues until isSlowingDown is set in onComplete)
        currentShuffleTime = minShuffleTime;
        console.log("Fast phase: lapCount=".concat(lapCount, ", isSlowingDown=").concat(isSlowingDown, ", time=").concat(currentShuffleTime.toFixed(3)));
      } else {
        // 3. Slowdown Phase (Based on steps SINCE slowdown started)
        // --- DETAILED LOGGING ---
        console.log("--> SLOWDOWN CALC START (wordIndex: ".concat(wordIndex, ", slowdownStepCounter: ").concat(slowdownStepCounter, ", wordsTotal: ").concat(words.length, ")")); // Calculate progress based on steps taken DURING slowdown
        // For fastLaps=0, use higher maxSlowdownSteps for smoother deceleration

        var maxSlowdownSteps = fastLaps === 0 ? words.length * 0.8 : words.length * 1.5;
        var progressInSlowdown = Math.min(slowdownStepCounter / maxSlowdownSteps, 1);

        var _easedProgress = gsap.parseEase("sine.in")(progressInSlowdown);

        console.log("    progressInSlowdown: ".concat(progressInSlowdown.toFixed(3), ", easedProgress: ").concat(_easedProgress.toFixed(3)));
        var calculatedSlowdownTime = gsap.utils.interpolate(minShuffleTime, maxShuffleTime, _easedProgress);
        console.log("    Calculated General Slowdown Time: ".concat(calculatedSlowdownTime.toFixed(3), " (min: ").concat(minShuffleTime, ", max: ").concat(maxShuffleTime, ")"));
        currentShuffleTime = calculatedSlowdownTime; // --- Override for the VERY LAST transition ONLY ---

        if (willBeLastTransition) {
          currentShuffleTime = finalTransitionTime;
          console.log("    FINAL TRANSITION OVERRIDE: Using finalTransitionTime: ".concat(finalTransitionTime));
        }

        console.log("    ==> FINAL currentShuffleTime for this step: ".concat(currentShuffleTime.toFixed(3))); // --- END DETAILED LOGGING ---
      } // --- End Speed Curve Calculation ---


      var halfTime = Math.max(currentShuffleTime / 2, 0.02); // Clear existing children before adding the new one
      // Important: Only the current and next elements should exist at any time

      while (shuffleContainer.childNodes.length > 1) {
        shuffleContainer.removeChild(shuffleContainer.firstChild);
      } // Create and position next element


      var currentElement = shuffleWordElement;
      var nextElement = document.createElement('span');
      nextElement.className = 'shuffle-word';
      nextElement.textContent = nextWord;
      shuffleContainer.appendChild(nextElement); // Let CSS handle position/styling - only set animation properties

      gsap.set(nextElement, {
        yPercent: 100,
        autoAlpha: 1
      });
      var tl = gsap.timeline({
        onComplete: function onComplete() {
          // Remove the old element and keep only the new one
          if (currentElement.parentNode === shuffleContainer) {
            shuffleContainer.removeChild(currentElement);
          }

          shuffleWordElement = nextElement;
          wordIndex = nextWordIndex;
          isAnimatingShuffle = false;
          stepCounter++; // Key change: Increment slowdownStepCounter ONLY when in slowdown phase

          if (isSlowingDown) {
            slowdownStepCounter++;
            console.log("Slowdown step incremented: ".concat(slowdownStepCounter));
          } // Check if we just completed a lap


          if (wordIndex === words.length - 1) {
            lapCount++;
            console.log("Completed lap ".concat(lapCount)); // Set the slowdown flag *after* completing the required number of fast laps
            // Only needed when fastLaps > 0, since we now initialize isSlowingDown at start

            if (lapCount >= fastLaps && !isSlowingDown) {
              isSlowingDown = true;
              slowdownStepCounter = 0; // Reset counter at start of slowdown phase

              console.log("Entering Slowdown Phase - slowdownStepCounter reset to 0");
            }
          } // Stop/Continue Logic


          var shouldStop = false; // UPDATED Stop condition: Check if this was the final transition we identified earlier

          if (willBeLastTransition && !hasFinished) {
            shouldStop = true;
            hasFinished = true;
            console.log("Shuffle complete! After ".concat(slowdownStepCounter, " slowdown steps"));
          } else if (isSlowingDown && nextWord === finalWord && slowdownStepCounter < minSlowdownSteps) {
            // If we hit the final word too early in the slowdown phase, log but continue
            console.log("Hit final word \"".concat(finalWord, "\" but continuing: only ").concat(slowdownStepCounter, "/").concat(minSlowdownSteps, " slowdown steps"));
          }

          if (!shouldStop && !hasFinished) {
            shuffleTimeout = setTimeout(shuffleWord, 10);
          }
        }
      }); // Animate current out, next in

      tl.to(currentElement, {
        yPercent: -100,
        duration: halfTime,
        ease: "power1.in"
      }).to(nextElement, {
        yPercent: 0,
        duration: halfTime,
        ease: "power1.out"
      }, "<0.1"); // Adjust overlap if needed
    };

    var words = ["cool", "soft", "dark", "neat", "raw", "chic", "bold", "light", "your"]; // User updated list

    var finalWord = "your"; // --- Timing & Speed Parameters (ADJUST THESE) ---

    var fastLaps = 1; // Number of full laps at max speed before slowing down. Set to 0 to start slowdown immediately.

    var minShuffleTime = 0.05; // Fastest interval between word changes (seconds). Lower = faster.

    var maxShuffleTime = 2.0; // Slowest interval during the *general* slowdown (seconds). Higher = slower.

    var startDelay = 1.5; // Delay before the entire animation starts (seconds).

    var accelerationSteps = 5; // How many word changes to reach max speed (higher = slower accel).

    var initialShuffleTime = 2.2; // Interval time for the very first word change (seconds). Higher = slower start.

    var finalTransitionTime = 3.1; // Configurable: Speed of the VERY LAST step onto 'your' (seconds). MUST BE < maxShuffleTime

    var minSlowdownSteps = 4;
    updateEdgeCutoffs(15, -13); // --- End Configuration ---

    var lapCount = 0;
    var wordIndex = 0;
    var stepCounter = 0;
    var slowdownStepCounter = 0; // Dedicated counter for tracking slowdown progress

    var currentShuffleTime = initialShuffleTime; // Initialize slowdown flag based on fastLaps setting

    var isSlowingDown = fastLaps === 0; // Start in slowdown immediately if fastLaps=0

    var isAnimatingShuffle = false;
    var shuffleTimeout;
    var hasFinished = false;
    var willBeLastTransition = false; // Flag to identify the actual final transition
    // Ensure "your" is at the end of array - our stop logic will handle the proper slowdown

    var yourIndex = words.indexOf(finalWord);

    if (yourIndex !== -1 && yourIndex !== words.length - 1) {
      // If "your" is not currently the last word, move it to the end
      words.splice(yourIndex, 1); // Remove from current position

      words.push(finalWord); // Add to end

      console.log("Restored 'your' to end of the words array:", words);
    } // Clean the container and set initial word


    shuffleContainer.innerHTML = '';
    shuffleWordElement = document.createElement('span');
    shuffleWordElement.className = 'shuffle-word';
    shuffleWordElement.textContent = words[wordIndex];
    shuffleContainer.appendChild(shuffleWordElement); // Let CSS handle positioning - only set animation properties in JS

    gsap.set(shuffleWordElement, {
      yPercent: 0,
      autoAlpha: 1
    });
    shuffleTimeout = setTimeout(shuffleWord, startDelay * 1000); // Expose the updateEdgeCutoffs function to window for potential use in responsive designs

    window.updateShuffleCutoffs = updateEdgeCutoffs;
  } // --- End Vertical Word Shuffle Animation ---
  // Add public method to adjust animation delay


  window.setAnimationDelay = function (delayInSeconds) {
    sectionAnimConfig.dotToContentDelay = delayInSeconds;
    console.log("Animation delay set to: ".concat(delayInSeconds, " seconds"));
    return "Animation delay set to: ".concat(delayInSeconds, " seconds");
  }; // Add public method to adjust fade speed in addition to existing animation delay


  window.setFadeSpeed = function (fadeSpeedFactor) {
    // Ensure the value is reasonable (between 0.1 and 1)
    sectionAnimConfig.fadeSpeed = Math.max(0.1, Math.min(fadeSpeedFactor, 1));
    console.log("Fade speed set to: ".concat(sectionAnimConfig.fadeSpeed, " (smaller = faster)"));
    return "Fade speed set to: ".concat(sectionAnimConfig.fadeSpeed, " (smaller = faster)");
  }; // Public method to adjust scroll threshold at runtime


  window.setScrollThreshold = function (threshold) {
    // Validate input (ensure it's a number >= 50)
    var validThreshold = Math.max(50, parseInt(threshold) || 500); // Update the configuration

    scrollConfig.threshold = validThreshold; // Re-create the Observer with new settings

    reinitializeScrollObserver();
    console.log("Scroll threshold set to: ".concat(validThreshold, "px"));
    return validThreshold;
  }; // Public method to temporarily disable/enable scroll hijacking


  window.toggleScrollHijacking = function () {
    var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    if (enabled === false) {
      // Disable by killing all observers
      Observer.getAll().forEach(function (obs) {
        return obs.kill();
      });
      isPageReloading = true; // Use the reload flag to prevent re-enabling

      console.log("Scroll hijacking disabled");
      return "Scroll hijacking disabled";
    } else {
      // Re-enable by recreating the observer
      isPageReloading = false; // Reinitialize the observer

      reinitializeScrollObserver();
      console.log("Scroll hijacking enabled");
      return "Scroll hijacking enabled";
    }
  }; // Public debug method to fix scroll hijacking issues


  window.fixScroll = function () {
    // Reset flags
    isPageReloading = false; // Clear session storage

    sessionStorage.removeItem('isReloading'); // Reinitialize scroll observer

    reinitializeScrollObserver(); // Report status

    console.log("Scroll hijacking reset and reinitialized");
    console.log("Current section: ".concat(currentSection, " of ").concat(sections.length));
    console.log("isPageReloading: ".concat(isPageReloading));
    console.log("isAnimating: ".concat(isAnimating));
    return "Scroll hijacking fixed - check console for details";
  }; // Public method to toggle development mode


  window.setDevelopmentMode = function () {
    var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    configMode.developmentMode = Boolean(enabled);
    configMode.liveServerProtection = Boolean(enabled); // Reset flags and reinitialize

    isPageReloading = false;
    reinitializeScrollObserver();
    console.log("Development mode: ".concat(configMode.developmentMode ? 'enabled' : 'disabled'));
    console.log("LiveServer protection: ".concat(configMode.liveServerProtection ? 'enabled' : 'disabled'));
    return "Development mode ".concat(configMode.developmentMode ? 'enabled' : 'disabled');
  }; // Special method to manually fix scroll after any issues


  window.debugFixScroll = function () {
    // Force-disable development mode protection
    configMode.liveServerProtection = false; // Reset flags

    isPageReloading = false;
    isAnimating = false; // Clear session storage

    sessionStorage.removeItem('isReloading'); // Kill any existing observers

    Observer.getAll().forEach(function (obs) {
      return obs.kill();
    }); // Create a new basic observer with no development mode checks

    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: scrollConfig.wheelSpeed,
      tolerance: scrollConfig.threshold,
      throttle: scrollConfig.throttle,
      preventDefault: true,
      onDown: function onDown() {
        !isAnimating && goToSection(currentSection + 1, 1);
      },
      onUp: function onUp() {
        !isAnimating && goToSection(currentSection - 1, -1);
      }
    });
    console.log("Emergency scroll fix applied - development mode protection disabled");
    return "Emergency scroll fix applied";
  }; // Auto-detect new sections with MutationObserver


  var setupSectionDetection = function setupSectionDetection() {
    // Initial section count to detect changes
    var lastSectionCount = sections.length; // Create a mutation observer to watch for DOM changes

    var observer = new MutationObserver(function (mutations) {
      var shouldRefresh = false;
      mutations.forEach(function (mutation) {
        // Check if nodes were added
        if (mutation.addedNodes.length > 0) {
          // Check if any of the added nodes are sections or contain sections
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              if (node.classList && node.classList.contains('section')) {
                shouldRefresh = true;
              } else if (node.querySelector && typeof node.querySelector === 'function') {
                try {
                  if (node.querySelector('.section')) {
                    shouldRefresh = true;
                  }
                } catch (err) {// Silently fail if querySelector throws an error
                }
              }
            }
          });
        } // Also check for class changes that might add the 'section' class


        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (mutation.target.classList && mutation.target.classList.contains('section')) {
            shouldRefresh = true;
          }
        }
      }); // If sections were added or removed, refresh the navigation

      if (shouldRefresh) {
        var currentCount = document.querySelectorAll('.section').length;

        if (currentCount !== lastSectionCount) {
          console.log("DOM changed: Sections count changed from ".concat(lastSectionCount, " to ").concat(currentCount));
          lastSectionCount = currentCount;
          setTimeout(refreshSections, 100); // Small delay to ensure DOM is settled
        }
      }
    }); // Options for the observer

    var config = {
      childList: true,
      // Observe direct children
      subtree: true,
      // Observe all descendants
      attributes: true,
      // Observe attribute changes
      attributeFilter: ['class'] // Only care about class changes

    }; // Start observing the document body

    observer.observe(document.body, config);
    console.log("Section detection observer started");
  }; // Setup section detection after initial load


  setTimeout(setupSectionDetection, 500); // Run refreshSections once more after everything is loaded
  // This helps with potential race conditions during page load

  $(window).on('load', function () {
    // Clear any session storage items that might be causing reload issues
    sessionStorage.removeItem('isReloading');
    setTimeout(function () {
      refreshSections(); // IMMEDIATE FIX: Force reset everything 

      isPageReloading = false;
      isAnimating = false;
      configMode.liveServerProtection = false; // Also ensure scroll hijacking is properly initialized with force parameter

      reinitializeScrollObserver(true);

      if (configMode.debugLogging) {
        console.log("Window load complete - scroll hijacking reinitialized");
        console.log("🟢 SCROLLING SHOULD NOW BE WORKING 🟢");
        console.log("If still not working, run resetScrollNow() in console");
      } // Add a final auto-reset with delay


      setTimeout(function () {
        isPageReloading = false;
        console.log("Final auto-reset of page reload flag"); // Use force parameter

        reinitializeScrollObserver(true);
      }, 1500);
    }, 300);
  }); // --- Section Dot Navigation ---

  var sectionElements = document.querySelectorAll('.section');
  var sectionDots = document.querySelector('.section-dots');

  if (sectionElements.length > 0 && !sectionDots) {
    // Create dots container if it doesn't exist
    var dotsContainer = document.createElement('div');
    dotsContainer.className = 'section-dots';
    document.body.appendChild(dotsContainer); // Create dots for each section

    sectionElements.forEach(function (section, index) {
      var dotContainer = document.createElement('div');
      dotContainer.className = 'section-dot-container';
      var dot = document.createElement('div');
      dot.className = 'section-dot';

      if (index === 0) {
        dot.classList.add('active', 'effect-pulse');
      }

      var label = document.createElement('div');
      label.className = 'section-dot-label';
      label.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);
      dotContainer.appendChild(label);
      dotContainer.appendChild(dot);
      dotsContainer.appendChild(dotContainer); // Add click event to scroll to section

      dotContainer.addEventListener('click', function () {
        var targetY = index * window.innerHeight;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      });
    });
  } // Update active dot on scroll


  window.addEventListener('scroll', function () {
    var scrollPosition = window.scrollY;
    var windowHeight = window.innerHeight;
    sectionElements.forEach(function (section, index) {
      var dot = document.querySelector(".section-dots .section-dot-container:nth-child(".concat(index + 1, ") .section-dot"));
      if (!dot) return;
      var sectionTop = section.offsetTop;
      var sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop - windowHeight / 2 && scrollPosition < sectionBottom - windowHeight / 2) {
        document.querySelectorAll('.section-dot').forEach(function (d) {
          d.classList.remove('active', 'effect-pulse');
        });
        dot.classList.add('active', 'effect-pulse');
      }
    });
  });
});