gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);

$(document).ready(function() {
    // CRITICAL FIX: Log script execution start to help with debugging
    console.log("🔄 Script initialization started - fixing LiveServer reload issues");

    // --- Configuration Variables ---
    const preloaderConfig = {
        duration: 1000, // Increased duration in milliseconds for better visibility
        showOncePerSession: true // Only show once per browser session
    };
    
    // Development/Production mode toggle
    const configMode = {
        developmentMode: true, // Set to false for production
        liveServerProtection: false, // Disable Live Server protection
        debugLogging: false, // Enable debug logging
    };
    
    // Flag to detect and prevent infinite refresh loops
    let isPageReloading = false;
    
    // CRITICAL FIX: Always clear session storage on page load to prevent infinite reloads
    sessionStorage.removeItem('isReloading');
    console.log("🧹 Session storage cleared to prevent reload loops");
    
    // IMMEDIATE FIX: Force reset the flag to false (was stuck at true)
    isPageReloading = false;
    
    // Modify page reload detection to avoid infinite loop on Live Server
    window.addEventListener('beforeunload', () => {
        isPageReloading = false;
    });
    
    // Check if we're coming back from a reload - MODIFIED to prevent loops
    const wasReloading = false; // Force this to false to break the loop
    sessionStorage.removeItem('isReloading'); // Clear any existing flag
    isPageReloading = false; // Force this to false
    
    // Also listen for visibility changes which often happen during Live Server refreshes
    document.addEventListener('visibilitychange', function() {
        // Completely disabled to prevent reload loops with Live Server
        // Do nothing here that would set reload flags
        if (configMode.debugLogging && document.visibilityState === 'hidden') {
            console.log("Page visibility changed to hidden, but protection disabled");
        } else if (configMode.debugLogging && document.visibilityState === 'visible') {
            console.log("Page visibility changed to visible, but protection disabled");
        }
    });
    
    // Dot navigation config
    const dotNavConfig = {
        rightPosition: 65, // Default position from right edge (px)
        activeEffect: 'effect-pulse', // Options: 'effect-pulse', 'effect-glow', 'effect-bounce', or ''
    };
    
    // Section transition animation config
    const sectionAnimConfig = {
        currentAnimIndex: 4, // Default animation type (index in the animations array)
        duration: 1, // Animation duration in seconds
        dotToContentDelay: 0, // Delay between dot activation and content animation (seconds)
        fadeSpeed: 0.3 // NEW: Controls how quickly content fades out (smaller = faster)
    };
    
    // Scroll sensitivity config
    const scrollConfig = {
        threshold: 200,
        wheelSpeed: -5, // Negative for correct scroll direction
        throttle: 16
    };
    
    // Animation variations for section transitions - completely revised for reliability
    const sectionAnimations = [
        // 0: Default slide (standard implementation) - Now using scale animation
        {
            name: 'Slide (Scale)',
            animation: (currentIndex, targetIndex, onComplete) => {
                // Get sections
                const currentSection = sections[currentIndex];
                const targetSection = sections[targetIndex];
                const targetY = targetIndex * window.innerHeight;
                
                // Create timeline
                const tl = gsap.timeline({
                    onComplete: onComplete
                });
                
                // Pre-set target section content with scale (fade from within)
                gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0,
                    transformOrigin: 'center center'
                });
                
                // First scroll immediately to position (INSTANT)
                window.scrollTo(0, targetY);
                
                // Fade out current section content with scale
                tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0, 
                    duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                    ease: "power1.out"
                }, 0);
                
                // Fade in target section content with scale
                tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 1,
                    opacity: 1, 
                    duration: sectionAnimConfig.duration / 2,
                    ease: "power1.in"
                }, 0.05); // Small delay for better visual effect
            }
        },
        // 1: Fade transition - Now using scale animation
        {
            name: 'Fade (Scale)',
            animation: (currentIndex, targetIndex, onComplete) => {
                // Get sections
                const currentSection = sections[currentIndex];
                const targetSection = sections[targetIndex];
                const targetY = targetIndex * window.innerHeight;

                // Create timeline
                const tl = gsap.timeline({
                    onComplete: onComplete
                });
                
                // Immediately hide target section content with scale
                gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0,
                    transformOrigin: 'center center'
                });
                
                // First scroll immediately to position
                window.scrollTo(0, targetY);
                
                // Fade out current section content with scale
                tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0, 
                    duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                    ease: "power1.out"
                }, 0);
                
                // Fade in target section content with scale
                tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 1,
                    opacity: 1, 
                    duration: sectionAnimConfig.duration / 2,
                    ease: "power1.in"
                }, 0.05); // Small delay for better visual effect
            }
        },
        // 2: Scale transition - Already using scale animation, just make consistent
        {
            name: 'Scale',
            animation: (currentIndex, targetIndex, onComplete) => {
                // Get sections
                const currentSection = sections[currentIndex];
                const targetSection = sections[targetIndex];
                const targetY = targetIndex * window.innerHeight;
                
                // Create timeline
                const tl = gsap.timeline({
                    onComplete: onComplete
                });
                
                // Pre-set target section content
                gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.8,
                    opacity: 0,
                    transformOrigin: 'center center'
                });
                
                // First scroll immediately to position
                window.scrollTo(0, targetY);
                
                // Scale down current section content
                tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.8, 
                    opacity: 0, 
                    duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                    ease: "power1.out"
                }, 0);
                
                // Scale up target section content
                tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 1, 
                    opacity: 1, 
                    duration: sectionAnimConfig.duration / 2,
                    ease: "power1.in"
                }, 0.05); // Small delay for better visual effect
            }
        },
        // 3: Slide from side - Modified to use scale animation instead of x position
        {
            name: 'Scale with Side Effect',
            animation: (currentIndex, targetIndex, onComplete) => {
                // Get sections
                const currentSection = sections[currentIndex];
                const targetSection = sections[targetIndex];
                const targetY = targetIndex * window.innerHeight;
                
                // Create timeline
                const tl = gsap.timeline({
                    onComplete: onComplete
                });
                
                // Pre-set target section content
                gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0,
                    transformOrigin: 'center center'
                });
                
                // First scroll immediately to position
                window.scrollTo(0, targetY);
                
                // Fade out current section content with scale
                tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.8, 
                    opacity: 0, 
                    duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                    ease: "power1.out"
                }, 0);
                
                // Fade in target section content with scale
                tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 1, 
                    opacity: 1, 
                    duration: sectionAnimConfig.duration / 2,
                    ease: "power1.in"
                }, 0.05); // Small delay for better visual effect
            }
        },
        // 4: Staggered fade - Modified to use scale with stagger
        {
            name: 'Staggered Scale',
            animation: (currentIndex, targetIndex, onComplete) => {
                // Get sections
                const currentSection = sections[currentIndex];
                const targetSection = sections[targetIndex];
                const targetY = targetIndex * window.innerHeight;
                
                // Create timeline
                const tl = gsap.timeline({
                    onComplete: onComplete
                });
                
                // Pre-set target section content
                gsap.set(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0,
                    transformOrigin: 'center center'
                });
                
                // First scroll immediately to position
                window.scrollTo(0, targetY);
                
                // Fade out current section content all at once with scale
                tl.to(currentSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 0.9,
                    opacity: 0, 
                    duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                    ease: "power1.out"
                }, 0);
                
                // Fade in target section content with stagger and scale
                tl.to(targetSection.querySelectorAll('.headline, .headline h1, .headline h2, .headline p, .headline .btn, .about-wrapper, .portfolio-wrapper, .form-wrapper, .services-wrapper, .headline-wrapper, .headline-text'), { 
                    scale: 1,
                    opacity: 1, 
                    duration: sectionAnimConfig.duration / 2,
                    stagger: 0.02,
                    ease: "power1.in"
                }, 0.05); // Small delay for better visual effect
            }
        }
    ];

    // --- Improved Preloader ---
    const preloader = $("#preloader");
    
    // Function to handle preloader
    const handlePreloader = () => {
        // Force the preloader to be visible and fully opaque at start
        preloader.css({
            'display': 'flex',
            'opacity': '1'
        });
        
        // Set the CSS variable for transition duration
        document.documentElement.style.setProperty('--preloader-duration', `${preloaderConfig.duration}ms`);
        
        // Force browser reflow to ensure styles are applied before animation starts
        preloader[0].offsetHeight;
        
        console.log("Starting preloader animation with duration:", preloaderConfig.duration);
        
        // Use GSAP for more reliable animation instead of CSS transitions
        gsap.to(preloader[0], {
            opacity: 0,
            duration: preloaderConfig.duration / 1000, // Convert to seconds for GSAP
            ease: "power2.out",
            onComplete: () => {
                preloader.hide();
                console.log("Preloader animation complete");
            }
        });
    };
    
    // Check if we should show the preloader
    const hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');
    
    if (preloaderConfig.showOncePerSession && hasSeenPreloader) {
        // Skip preloader if already seen
        preloader.hide();
        console.log("Preloader skipped - already seen in this session");
    } else {
        // Ensure preloader is fully visible before starting fade-out
        // Use setTimeout to ensure DOM is ready
        setTimeout(handlePreloader, 100);
        
        // Mark as seen
        sessionStorage.setItem('hasSeenPreloader', 'true');
    }

    // --- Mobile Menu ---
    const burgerIcon = $("#burgerIcon");
    const menu = $(".menu-wrapper ul.menu");
    const menuOverlay = $("#menuOverlay");
    
    burgerIcon.on("click", function() {
        menu.toggleClass("active");
        menuOverlay.toggleClass("active");
        burgerIcon.toggleClass("active");
    });

    menuOverlay.on("click", function() {
        menu.removeClass("active");
        menuOverlay.removeClass("active");
        burgerIcon.removeClass("active");
    });

    menu.find("a").on("click", function(e) {
        menu.removeClass("active");
        menuOverlay.removeClass("active");
        burgerIcon.removeClass("active");
        // Scroll handled below by GSAP Observer/goToSection
    });

    // --- GSAP Observer Setup (Scroll Hijacking) ---
    // Observer (Re-enabled)
    let sections = gsap.utils.toArray('.section');
    let sectionCount = sections.length;
    const scrollUpBtn = document.querySelector(".scroll-up"); // Get scroll up button
    const scrollDownBtn = document.querySelector(".scroll-down"); // Get scroll down button
    let currentSection = 0;
    let isAnimating = false;

    // Function to refresh section detection and navigation
    const refreshSections = () => {
        sections = gsap.utils.toArray('.section');
        sectionCount = sections.length;
        
        // Reinitialize dot navigation with new sections
        initDotNav();
        
        // Fix initial state if needed
        if (currentSection >= sectionCount) {
            currentSection = sectionCount - 1;
        }
        
        return sectionCount;
    };
    
    // Function to reinitialize the scroll observer
    const reinitializeScrollObserver = (force = false) => {
        // Kill any existing observers
        Observer.getAll().forEach(obs => obs.kill());
        
        // Create a new observer with current settings
        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            wheelSpeed: scrollConfig.wheelSpeed,
            tolerance: scrollConfig.threshold,
            throttle: scrollConfig.throttle,
            preventDefault: true,
            onDown: () => !isAnimating && goToSection(currentSection - 1, -1), // Scroll down = previous section
            onUp: () => !isAnimating && goToSection(currentSection + 1, 1)     // Scroll up = next section
        });
    };
    
    // Create an emergency reset button in console
    window.resetScrollNow = () => {
        // Kill all observers
        Observer.getAll().forEach(obs => obs.kill());
        
        // Reset flags
        isPageReloading = false;
        isAnimating = false;
        configMode.liveServerProtection = false;
        
        // Clear any session storage
        sessionStorage.removeItem('isReloading');
        
        // Force reinitialize scroll with the force parameter
        reinitializeScrollObserver(true);
        
        console.log("🔥 EMERGENCY SCROLL RESET APPLIED 🔥");
        console.log("Protection disabled, flags reset");
        return "Scroll has been reset - try scrolling now";
    };
    
    // Add a dedicated fix for LiveServer infinite reload issues
    window.fixLiveServerReload = () => {
        // Clear session storage
        sessionStorage.clear();
        
        // Reset all flags
        isPageReloading = false;
        isAnimating = false;
        configMode.liveServerProtection = false;
        
        // Kill and recreate observers with force parameter
        reinitializeScrollObserver(true);
        
        // Refresh sections
        refreshSections();
        
        console.log("🔧 LIVE SERVER RELOAD FIX APPLIED 🔧");
        console.log("Try refreshing the page now - it should load properly");
        return "LiveServer reload fix applied";
    };
    
    // Make all helpers available globally
    window.refreshSections = refreshSections;
    window.reinitializeScrollObserver = reinitializeScrollObserver;
    
    // --- Initialize Dot Navigation ---
    const initDotNav = () => {
        const dotsContainer = document.querySelector('.section-dots');
        
        // Set configurable right position
        document.documentElement.style.setProperty('--dot-nav-right-position', `${dotNavConfig.rightPosition}px`);
        
        // Clear any existing dots
        dotsContainer.innerHTML = '';
        
        // Create dots based on section count
        sections.forEach((section, index) => {
            // Create dot container (holds dot and label)
            const dotContainer = document.createElement('div');
            dotContainer.className = 'section-dot-container';
            
            // Create dot
            const dot = document.createElement('div');
            dot.className = 'section-dot';
            if (index === currentSection) {
                dot.classList.add('active', dotNavConfig.activeEffect);
            }
            
            // Create section name label
            const sectionName = document.createElement('div');
            sectionName.className = 'section-dot-label';
            // Try to get section name from ID, data attribute, or use generic name
            const sectionId = section.id || `section-${index+1}`;
            const displayName = section.dataset.name || sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
            sectionName.textContent = displayName;
            
            // Add elements to container
            dotContainer.appendChild(sectionName);
            dotContainer.appendChild(dot);
            
            // Click event to navigate to corresponding section
            dotContainer.addEventListener('click', () => {
                if (!isAnimating && index !== currentSection) {
                    const direction = index > currentSection ? 1 : -1;
                    goToSection(index, direction);
                }
            });
            
            dotsContainer.appendChild(dotContainer);
        });
    };
    
    // Initialize dot navigation
    initDotNav();
    
    // Completely rewritten goToSection function with more reliable animation handling
    function goToSection(index, direction) {
        // Ensure index is within bounds 
        index = Math.max(0, Math.min(index, sections.length - 1));

        // Check if already animating or at the target section
        if (isAnimating || index === currentSection) return;

        console.log(`🔄 goToSection called: index=${index}, currentSection=${currentSection}, direction=${direction}`);

        // Set animating flag
        isAnimating = true;
        
        // Store current section before updating
        const prevSection = currentSection;
        
        // Update current section
        currentSection = index;

        // --- Button Disappearance Animation ---
        if (scrollUpBtn && scrollDownBtn) { 
            // Button animations (existing code)
            if (direction === 1 && currentSection === 1) {
                 gsap.to(scrollUpBtn, { duration: 0.3, opacity: 0, y: -20, ease: "power2.out" });
            }
            else if (direction === -1 && currentSection === sections.length - 2) {
                 gsap.to(scrollDownBtn, { duration: 0.3, opacity: 0, y: 20, ease: "power2.out" });
            }
            else if (currentSection === 0) {
                 gsap.to(scrollUpBtn, { duration: 0.3, opacity: 0, y: -20, ease: "power2.out" });
            }
            else if (currentSection === sections.length - 1) {
                 gsap.to(scrollDownBtn, { duration: 0.3, opacity: 0, y: 20, ease: "power2.out" });
            }
        }
        
        // Get the selected animation
        const animationIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
        const selectedAnimation = sectionAnimations[animationIndex];
        
        // --- Dynamic Header Title - Animate Out Immediately ---
        const titleContainer = document.getElementById('dynamic-header-title-container');
        console.log(`📦 Title container found:`, titleContainer ? 'YES' : 'NO');
        
        const currentHeaderTitle = titleContainer ? titleContainer.querySelector('.header-dynamic-title') : null;
        console.log(`📝 Existing header title found:`, currentHeaderTitle ? 'YES' : 'NO');
        
        // Logo arrow reference
        const logoArrow = document.querySelector('#headerLogo #arrowGroup');
        
        // Determine if previous section had a header
        const prevSectionHadHeader = prevSection !== 0 && prevSection !== sections.length - 1;
        
        // Determine if new section has a header
        const newSectionHasHeader = currentSection !== 0 && currentSection !== sections.length - 1;
        
        // Only rotate when transitioning between header/no-header states
        const shouldRotateArrow = prevSectionHadHeader !== newSectionHasHeader;
        
        if (currentHeaderTitle) {
            console.log(`🔄 Animating OUT existing header title`);
            gsap.to(currentHeaderTitle, {
                xPercent: -100,
                autoAlpha: 0,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    console.log(`✅ Animation OUT complete, removing element`);
                    if (currentHeaderTitle.parentNode) { // Check if still attached
                        currentHeaderTitle.parentNode.removeChild(currentHeaderTitle);
                    }
                }
            });
            
            // Rotate arrow back to initial position (clockwise) only when needed
            if (logoArrow && shouldRotateArrow) {
                gsap.to(logoArrow, {
                    rotation: 0,
                    duration: 0.4,
                    ease: 'power2.inOut'
                });
            }
        }
        // ------------------------------------------------------
        
        // Execute the section animation
        selectedAnimation.animation(prevSection, currentSection, () => {
            // Main Section Animation complete
            isAnimating = false;
            console.log(`✅ Main section animation complete`);
            
            // --- Dynamic Header Title - Animate In After Delay ---
            console.log(`📊 Current section=${currentSection}, Banner check:`, currentSection !== 0);
            if (currentSection !== 0 && titleContainer) { // Don't show title for banner
                const originalH1 = sections[currentSection].querySelector('.headline h1');
                console.log(`🔍 Original H1 found:`, originalH1 ? 'YES' : 'NO', originalH1 ? `Text: "${originalH1.textContent}"` : '');
                
                if (originalH1) {
                    const titleText = originalH1.textContent;
                    const newTitle = document.createElement('h1');
                    newTitle.className = 'header-dynamic-title';
                    newTitle.textContent = titleText;
                    
                    // Set initial style for proper animation
                    gsap.set(newTitle, { 
                        xPercent: -100, 
                        autoAlpha: 0,
                        color: '#FFFFFF' // Use the highlight color to make it more visible
                    });
                    
                    // Add to DOM
                    titleContainer.appendChild(newTitle);
                    console.log(`➕ New title created and appended to container`);
                    
                    // Animate in AFTER main animation
                    console.log(`🔄 Animating IN new header title`);
                    gsap.to(newTitle, { 
                        xPercent: 0,
                        autoAlpha: 1,
                        duration: 0.5, // Slightly longer for visibility
                        ease: 'back.out(1.2)', // More pronounced animation
                        onStart: () => {
                            console.log(`🚀 Animation IN started - newTitle:`, newTitle);
                            
                            // Rotate arrow counter-clockwise 135 degrees as header slides in
                            // Only when transitioning between sections with/without headers
                            if (logoArrow && shouldRotateArrow) {
                                gsap.to(logoArrow, {
                                    rotation: -135, // Adjusted rotation value
                                    duration: 0.5,
                                    ease: 'back.out(1.2)'
                                });
                            }
                        },
                        onComplete: () => {
                            console.log(`✅ Animation IN complete`);
                            // Make sure the title stays visible
                            gsap.set(newTitle, { clearProps: "all" });
                            newTitle.style.color = '#FFFFFF'; // Keep highlight color
                        }
                    });
                }
            }
            // ------------------------------------------------------

            // --- Button Appearance Animation --- 
            if (scrollUpBtn && scrollDownBtn) {
                if (currentSection > 0) {
                    gsap.to(scrollUpBtn, { duration: 0.3, opacity: 1, y: 0, ease: "power2.out" });
                }
                if (currentSection < sections.length - 1) {
                     gsap.to(scrollDownBtn, { duration: 0.3, opacity: 1, y: 0, ease: "power2.out" });
                }
                if (currentSection === 0) {
                    gsap.to(scrollUpBtn, { duration: 0.3, opacity: 0, y: -20, ease: "power2.out" });
                }
                if (currentSection === sections.length - 1) {
                     gsap.to(scrollDownBtn, { duration: 0.3, opacity: 0, y: 20, ease: "power2.out" });
                }
            }
        });
        
        // Delay dot navigation update
        setTimeout(() => {
            // Update dot navigation
            const dots = document.querySelectorAll('.section-dot-container .section-dot');
            
            // First reset all dots
            dots.forEach(dot => {
                dot.classList.remove('active', 'effect-pulse', 'effect-glow', 'effect-bounce');
                gsap.killTweensOf(dot);
                gsap.set(dot, { scale: 1, clearProps: "filter,boxShadow" });
            });
            
            // Then set new active dot
            if (dots[currentSection]) {
                const activeDot = dots[currentSection];
                
                // Add active class and effect
                activeDot.classList.add('active');
                if (dotNavConfig.activeEffect) {
                    activeDot.classList.add(dotNavConfig.activeEffect);
                }
                
                // Animate scale with same duration as content animation
                gsap.to(activeDot, { 
                    scale: 1.3, 
                    duration: sectionAnimConfig.duration,
                    ease: "power2.out",
                    onComplete: () => {
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
    }

    // Initialize scroll observer
    reinitializeScrollObserver();
    
    // Public methods for easy animation type switching
    window.setSectionAnimation = (animationIndex) => {
        // Ensure the index is valid
        const validIndex = Math.min(Math.max(0, animationIndex), sectionAnimations.length - 1);
        sectionAnimConfig.currentAnimIndex = validIndex;
        
        // Force refresh all section animations by re-triggering all ScrollTrigger callbacks
        // This ensures the new animation type is immediately applied to all visible sections
        ScrollTrigger.getAll().forEach(trigger => {
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
        
        console.log(`Animation set to: ${sectionAnimations[validIndex].name}`);
        return sectionAnimations[validIndex].name;
    };
    
    window.getSectionAnimations = () => {
        return sectionAnimations.map((anim, index) => ({ index, name: anim.name }));
    };
    
    window.setDotEffect = (effectName) => {
        // Valid effects: 'effect-pulse', 'effect-glow', 'effect-bounce', or ''
        dotNavConfig.activeEffect = effectName;
        
        // Update current active dot
        const dots = document.querySelectorAll('.section-dot-container .section-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('effect-pulse', 'effect-glow', 'effect-bounce');
            if (i === currentSection) {
                dot.classList.add(dotNavConfig.activeEffect);
            }
        });
        
        return `Dot effect set to: ${effectName || 'none'}`;
    };

    // GSAP Smooth Scroll for Anchor Links (Uses goToSection)
    $('a[href^="#"]').on("click", function(e) {
        // Immediately prevent default to avoid any standard scroll behavior
        e.preventDefault();
        
        const targetId = $(this).attr('href');
        const targetSection = $(targetId)[0];

        if (targetSection) {
            const sectionIndex = sections.indexOf(targetSection);
            if (sectionIndex > -1) {
                goToSection(sectionIndex);
            }
        }
    });
    
    // Log successful initialization to console
    console.log("✅ Script initialized successfully - scrolling should be working");
    console.log("💡 If you still have issues, type fixLiveServerReload() in the console");

    // --- Section Content Animations (Check NodeList Length) ---
    sections.forEach((section, index) => {
        
        // --- Default Animation (Subtle Scale Up) ---
        const defaultAnimElements = section.querySelectorAll('.headline h1, .headline h2, .headline p, .headline .btn, .portfolio-wrapper .headline, .portfolio-wrapper .text-portfolio, .form-details h2, .form-details h3, .service-card'); 
        if (defaultAnimElements && defaultAnimElements.length > 0) {
            gsap.set(defaultAnimElements, { autoAlpha: 0, scale: 0.9, transformOrigin: 'center center' });
        }

        ScrollTrigger.create({
            trigger: section,
            start: "top center+=100", 
            end: "bottom center-=100",
            id: `section-default-${index}`,
            onEnter: () => {
                // Check length before animating
                if (defaultAnimElements && defaultAnimElements.length > 0) { 
                    gsap.to(defaultAnimElements, { 
                        autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power1.out'
                    });
                }
            },
            onLeave: () => { 
                 // Reset when leaving forward (optional but good practice)
                 if (defaultAnimElements && defaultAnimElements.length > 0) {
                     gsap.to(defaultAnimElements, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: 'power1.in' });
                 }
            },
            onEnterBack: () => {
                 // Check length before animating
                 if (defaultAnimElements && defaultAnimElements.length > 0) {
                     gsap.to(defaultAnimElements, { 
                        autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power1.out'
                    });
                 }
            },
            onLeaveBack: () => { 
                 // Check length before animating
                 if (defaultAnimElements && defaultAnimElements.length > 0) {
                     gsap.to(defaultAnimElements, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: 'power1.in' });
                 }
            },
        });

        // --- Special Animations for #about and #form (Check NodeLists) --- 
        let aboutTl, formTl; // Define timelines outside conditional scope

        if (section.id === 'banner') {
            const bannerWrapper = section.querySelector('.headline-wrapper');
            const bannerText = section.querySelector('.headline-text');
            const bannerElements = section.querySelectorAll('.headline-text h1, .headline-text h2, .headline-text .btn');

            // Ensure elements exist before setting/animating
            if (bannerWrapper && bannerText && bannerElements.length > 0) {
                // Use scale animation (fade from within)
                gsap.set([bannerWrapper, bannerText, ...bannerElements], { autoAlpha: 0, scale: 0.9, transformOrigin: 'center center' });
                
                // Get the selected animation from global config
                const animationIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                
                // Create a ScrollTrigger that will use the global configuration
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center+=100",
                    end: "bottom center-=100",
                    id: 'section-banner',
                    onEnter: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        // When entering, apply animation based on current global setting
                        gsap.to([bannerWrapper, bannerText, ...bannerElements], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onEnterBack: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        gsap.to([bannerWrapper, bannerText, ...bannerElements], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onLeave: () => {
                        gsap.to([bannerWrapper, bannerText, ...bannerElements], { 
                            autoAlpha: 0, 
                            scale: 0.9, 
                            duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                            ease: 'power1.in'
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to([bannerWrapper, bannerText, ...bannerElements], { 
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
            const aboutWrapper = section.querySelector('.about-wrapper');
            const aboutHeadline = section.querySelector('.about-wrapper-headline');
            const aboutText = section.querySelectorAll('.about-text p');
            const techBoxes = section.querySelectorAll('#technologies .box');

            // Ensure elements exist before setting/animating
            if (aboutWrapper && aboutText.length > 0 && techBoxes.length > 0) {
                // Use scale animation like banner (fade from within)
                gsap.set([aboutHeadline, ...aboutText, ...techBoxes], { autoAlpha: 0, scale: 0.9, transformOrigin: 'center center' });
                
                // Create a ScrollTrigger that will use the global configuration
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center+=100",
                    end: "bottom center-=100",
                    id: 'section-about',
                    onEnter: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        // When entering, apply animation based on current global setting
                        gsap.to([aboutHeadline, ...aboutText, ...techBoxes], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onEnterBack: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        gsap.to([aboutHeadline, ...aboutText, ...techBoxes], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onLeave: () => {
                        gsap.to([aboutHeadline, ...aboutText, ...techBoxes], { 
                            autoAlpha: 0, 
                            scale: 0.9, 
                            duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                            ease: 'power1.in'
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to([aboutHeadline, ...aboutText, ...techBoxes], { 
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
            const formWrapper = section.querySelector('.form-wrapper');
            const formDetails = section.querySelectorAll('.form-details h2, .form-details h3');
            const formInputs = section.querySelectorAll('form input, form textarea, form .btn');

            if (formWrapper && formDetails.length > 0 && formInputs.length > 0) {
                // Use scale animation like banner (fade from within)
                gsap.set([formWrapper, ...formDetails, ...formInputs], { autoAlpha: 0, scale: 0.9, transformOrigin: 'center center' });
                
                // Create a ScrollTrigger that will use the global configuration
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center+=100",
                    end: "bottom center-=100",
                    id: 'section-form',
                    onEnter: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        // When entering, apply animation based on current global setting
                        gsap.to([formWrapper, ...formDetails, ...formInputs], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onEnterBack: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        gsap.to([formWrapper, ...formDetails, ...formInputs], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onLeave: () => {
                        gsap.to([formWrapper, ...formDetails, ...formInputs], { 
                            autoAlpha: 0, 
                            scale: 0.9, 
                            duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                            ease: 'power1.in'
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to([formWrapper, ...formDetails, ...formInputs], { 
                            autoAlpha: 0, 
                            scale: 0.9, 
                            duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                            ease: 'power1.in'
                        });
                    }
                });
            }
        }
        
        // Add special animation for skills section with staggered card reveal
        if (section.id === 'skills') {
            const skillsHeadline = section.querySelector('.headline');
            const skillCards = section.querySelectorAll('.skill-card');
            
            if (skillsHeadline && skillCards.length > 0) {
                // Set initial state - hide elements
                gsap.set(skillsHeadline, { autoAlpha: 0, y: -30 });
                gsap.set(skillCards, { 
                    autoAlpha: 0, 
                    y: 50,
                    rotationY: 15,
                    transformOrigin: "center center"
                });
                
                // Create the ScrollTrigger for the skills section
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center+=100",
                    end: "bottom center-=100",
                    id: 'section-skills',
                    onEnter: () => {
                        // Animate headline first
                        gsap.to(skillsHeadline, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.8,
                            ease: "power2.out"
                        });
                        
                        // Then stagger the cards with a cascade effect
                        gsap.to(skillCards, {
                            autoAlpha: 1,
                            y: 0,
                            rotationY: 0,
                            stagger: 0.1,
                            duration: 0.8,
                            delay: 0.3, // Start after headline animation
                            ease: "back.out(1.2)"
                        });
                    },
                    onEnterBack: () => {
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
                    onLeave: () => {
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
                    onLeaveBack: () => {
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
            const servicesWrapper = section.querySelector('.services-wrapper');
            const serviceCards = section.querySelectorAll('.service-card');

            if (servicesWrapper && serviceCards.length > 0) {
                // Use scale animation like banner (fade from within)
                gsap.set([servicesWrapper, ...serviceCards], { autoAlpha: 0, scale: 0.9, transformOrigin: 'center center' });
                
                // Create a ScrollTrigger that will use the global configuration
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center+=100",
                    end: "bottom center-=100",
                    id: 'section-services',
                    onEnter: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        // When entering, apply animation based on current global setting
                        gsap.to([servicesWrapper, ...serviceCards], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.05 : 0, // Only use stagger for staggered animation (reduced for services)
                            ease: 'power1.out'
                        });
                    },
                    onEnterBack: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        gsap.to([servicesWrapper, ...serviceCards], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.05 : 0, // Only use stagger for staggered animation (reduced for services)
                            ease: 'power1.out'
                        });
                    },
                    onLeave: () => {
                        gsap.to([servicesWrapper, ...serviceCards], { 
                            autoAlpha: 0, 
                            scale: 0.9, 
                            duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                            ease: 'power1.in'
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to([servicesWrapper, ...serviceCards], { 
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
            const portfolioWrapper = section.querySelector('.portfolio-wrapper');
            const portfolioHeadline = section.querySelector('.headline');
            const textPortfolio = section.querySelector('.text-portfolio');
            const portfolioImage = section.querySelector('.portfolio-image-wrapper');

            if (portfolioWrapper && portfolioHeadline && textPortfolio && portfolioImage) {
                // Use scale animation like banner (fade from within)
                gsap.set([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], { autoAlpha: 0, scale: 0.9, transformOrigin: 'center center' });
                
                // Create a ScrollTrigger that will use the global configuration
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center+=100",
                    end: "bottom center-=100",
                    id: 'section-portfolio',
                    onEnter: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        // When entering, apply animation based on current global setting
                        gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onEnterBack: () => {
                        // Get current animation index in case it has changed
                        const currentAnimIndex = Math.min(sectionAnimConfig.currentAnimIndex, sectionAnimations.length - 1);
                        gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], { 
                            autoAlpha: 1, 
                            scale: 1, 
                            duration: sectionAnimConfig.duration,
                            stagger: currentAnimIndex === 4 ? 0.1 : 0, // Only use stagger for staggered animation
                            ease: 'power1.out'
                        });
                    },
                    onLeave: () => {
                        gsap.to([portfolioWrapper, portfolioHeadline, textPortfolio, portfolioImage], { 
                            autoAlpha: 0, 
                            scale: 0.9, 
                            duration: sectionAnimConfig.duration * sectionAnimConfig.fadeSpeed,
                            ease: 'power1.in'
                        });
                    },
                    onLeaveBack: () => {
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
    });

    // --- Form Submission ---
    const form = $("form");
    form.on("submit", function(e) {
        e.preventDefault();
        const formData = {
            name: $('input[name="name"]').val(),
            email: $('input[name="_replyto"]').val(),
            message: $('textarea[name="message"]').val()
        }; 

        $.ajax({
            url: "https://formspree.io/f/meqydzll",
            method: "POST",
            data: formData,
            dataType: "json",
            success: function() {
                alert("Thank you for your message! I will get back to you soon.");
                form[0].reset();
            },
            error: function() {
                alert("Oops! There was an error sending your message. Please try again.");
            }
        });
    });

    // --- Initial Setup ---
    gsap.set(window, { scrollTo: 0 });
    currentSection = 0;
    // Optionally trigger entrance for the first section immediately
    // let firstSectionElements = sections[0].querySelectorAll(...);
    // if(firstSectionElements && firstSectionElements.length > 0) { gsap.to(firstSectionElements, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1 }); }

    // --- Initial Button State ---
    if (scrollUpBtn) { // Hide scroll-up initially if on first section
        gsap.set(scrollUpBtn, { opacity: 0, y: -20 }); // y is relative to rotated state
    }
    // --- End Initial State ---

    // --- Radial Button ---
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            // Calculate cursor position relative to the button (0% to 100%)
            button.classList.remove('radial-hover'); // Ensure animation restarts cleanly
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Set CSS custom properties used by the ::before pseudo-element's clip-path
            button.style.setProperty('--x', `${x}%`);
            button.style.setProperty('--y', `${y}%`);

            // Add class to trigger the expansion animation in CSS
            button.classList.add('radial-hover');
            // NOTE: Expansion speed is controlled by 'transition-duration' in
            // src/scss/_base.scss -> .btn::before (currently 0.45s based on your changes)
            // Final expanded size is controlled by 'clip-path' in 
            // src/scss/_base.scss -> .btn.radial-hover::before (currently circle(150%...))
        });

        button.addEventListener('mousemove', (e) => {
            // Continuously update cursor position while moving over the button
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Update CSS custom properties for smooth origin tracking
            button.style.setProperty('--x', `${x}%`);
            button.style.setProperty('--y', `${y}%`);
        });

        button.addEventListener('mouseleave', (e) => {
            // Update position one last time for the retraction origin point
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            button.style.setProperty('--x', `${x}%`);
            button.style.setProperty('--y', `${y}%`);

            // Remove class to trigger the retraction animation in CSS
            button.classList.remove('radial-hover');
            // NOTE: Retraction speed is the same as expansion speed (controlled by 'transition-duration')
        });
    });
    // --- End Radial Button ---

    // --- Splitting.js Text Animations --- 
    Splitting(); 
    console.log("Splitting() executed."); // DEBUG: Confirm Splitting ran

    // --- "Hi" Letter 'i' Flip Animation ---
    const hiElement = document.querySelector('.headline h1[data-splitting]'); 
    if (hiElement) {
        console.log("Found hiElement for 'Hi' animation."); 
        const iCharSpan = hiElement.querySelector('.char[style*="--char-index:1"]');
        if (iCharSpan) {
            console.log("Found iCharSpan for 'Hi' animation:", iCharSpan);
            gsap.set(iCharSpan, { transformOrigin: "center center", transformPerspective: 400 });

            // Alternative: Use jQuery event delegation on the H1
            $(hiElement).on('mouseenter', '.char:nth-child(2)', function(event) {
                // 'this' inside this function refers to the iCharSpan that was hovered
                console.log("jQuery delegate: 'i' span mouseenter triggered on", this); // DEBUG
                let targetISpan = this; // Capture 'this'
                gsap.to(targetISpan, { 
                    rotationY: "+=1080", 
                    duration: 0.7, 
                    ease: "elastic.out(1, 0.5)", 
                    overwrite: 'auto',
                    onStart: () => console.log("jQuery delegate: GSAP 'i' flip animation starting.") // DEBUG
                });
            });

            // Optional: Add mouseleave listener to parent H1 if needed
        }
    }

    // --- Life Animation ---
    const lifeElements = document.querySelectorAll('[data-splitting][data-life-pulse]'); 
    if (lifeElements.length > 0) {
        console.log(`Found ${lifeElements.length} elements for 'Life' animation.`);
    } else {
        console.error("Could not find elements for 'Life' animation.");
    }
    lifeElements.forEach(lifeElement => {
        // Find the word span for "life" specifically
        const lifeWordSpan = lifeElement.querySelector('.word[data-word="life"]');

        if (!lifeWordSpan) {
            console.error("Could not find word span for 'life' in:", lifeElement);
            return; // Skip if 'life' word span not found
        }

        // --- If lifeWordSpan IS found, proceed: ---
        const charsInLife = lifeWordSpan.querySelectorAll('.char'); 

        if (!charsInLife || charsInLife.length === 0) { 
            console.error("No .char elements found within lifeWordSpan:", lifeWordSpan);
            return; // Skip if no characters found
        }

        // Ensure transform origin is set correctly
        gsap.set(charsInLife, { transformOrigin: "center center" }); 

        // --- OPTION 1: Pulse on Hover (Default) ---
        let pulseTimeline = gsap.timeline({ paused: true, repeat: -1 });

        pulseTimeline.to(charsInLife, { 
             scale: 1.05, 
             duration: 0.15, 
             stagger: 0.05, 
             ease: "power2.inOut", 
             yoyo: true, 
             repeat: 1 
         });
 
        // Attach listeners to the found lifeWordSpan
        lifeWordSpan.addEventListener('mouseenter', (event) => {
            console.log("'Life' word span mouseenter triggered on:", lifeWordSpan); 
            pulseTimeline.play();
            console.log("Playing 'Life' pulse timeline."); 
        });
 
        lifeWordSpan.addEventListener('mouseleave', () => {
            console.log("'Life' mouseleave triggered."); 
            pulseTimeline.pause().progress(0); 
            gsap.set(charsInLife, {scale: 1});
        });
        // --- End Option 1 ---
 
        // --- OPTION 2: Permanent Pulse (Uncomment to activate) ---
        /*
        gsap.to(charsInLife, { // Target only 'life' chars if permanent
// ... (rest of code inside forEach remains the same) ...
        });
        */
        // --- End Option 2 ---

    }); // End of forEach loop for lifeElements

    // --- Vertical Word Shuffle Animation (v16 - Configurable Edges) ---
    const shuffleContainer = document.querySelector('.shuffle-container');
    let shuffleWordElement = document.querySelector('.shuffle-word');

    if (shuffleContainer && shuffleWordElement) {
        const words = ["cool", "soft", "dark", "neat", "raw", "chic", "bold", "light", "your"]; // User updated list
        const finalWord = "your";

        // --- Timing & Speed Parameters (ADJUST THESE) ---
        const fastLaps = 1;             // Number of full laps at max speed before slowing down. Set to 0 to start slowdown immediately.
        const minShuffleTime = 0.05;    // Fastest interval between word changes (seconds). Lower = faster.
        const maxShuffleTime = 2.0;     // Slowest interval during the *general* slowdown (seconds). Higher = slower.
        const startDelay = 1.5;         // Delay before the entire animation starts (seconds).
        const accelerationSteps = 5;    // How many word changes to reach max speed (higher = slower accel).
        const initialShuffleTime = 2.2; // Interval time for the very first word change (seconds). Higher = slower start.
        const finalTransitionTime = 3.1; // Configurable: Speed of the VERY LAST step onto 'your' (seconds). MUST BE < maxShuffleTime
        const minSlowdownSteps = 4;     // NEW: Minimum number of slowdown steps before allowing stop on final word
        
        // --- EDGE CUTOFF CONFIGURATION ---
        // These can be adjusted at runtime if needed for responsive designs
        function updateEdgeCutoffs(topCutoff = 0, bottomCutoff = 1000) {
            document.documentElement.style.setProperty('--shuffle-top-cutoff', `${topCutoff}px`);
            document.documentElement.style.setProperty('--shuffle-bottom-cutoff', `${bottomCutoff}px`);
        }
        // Default edge cutoffs - can be called again to adjust for different screen sizes
        updateEdgeCutoffs(15, -13);
        // --- End Configuration ---

        let lapCount = 0;
        let wordIndex = 0;
        let stepCounter = 0;
        let slowdownStepCounter = 0; // Dedicated counter for tracking slowdown progress
        
        let currentShuffleTime = initialShuffleTime;
        // Initialize slowdown flag based on fastLaps setting
        let isSlowingDown = fastLaps === 0; // Start in slowdown immediately if fastLaps=0
        let isAnimatingShuffle = false;
        let shuffleTimeout;
        let hasFinished = false;
        let willBeLastTransition = false; // Flag to identify the actual final transition
        
        // Ensure "your" is at the end of array - our stop logic will handle the proper slowdown
        const yourIndex = words.indexOf(finalWord);
        if (yourIndex !== -1 && yourIndex !== words.length - 1) {
            // If "your" is not currently the last word, move it to the end
            words.splice(yourIndex, 1); // Remove from current position
            words.push(finalWord); // Add to end
            console.log("Restored 'your' to end of the words array:", words);
        }

        // Clean the container and set initial word
        shuffleContainer.innerHTML = '';
        shuffleWordElement = document.createElement('span');
        shuffleWordElement.className = 'shuffle-word';
        shuffleWordElement.textContent = words[wordIndex];
        shuffleContainer.appendChild(shuffleWordElement);
        
        // Let CSS handle positioning - only set animation properties in JS
        gsap.set(shuffleWordElement, { 
            yPercent: 0,
            autoAlpha: 1
        });

        function shuffleWord() {
            if (isAnimatingShuffle || hasFinished) return;
            isAnimatingShuffle = true;
            clearTimeout(shuffleTimeout);

            const nextWordIndex = (wordIndex + 1) % words.length;
            const nextWord = words[nextWordIndex];
            
            // Check if this will be the final transition we want to slow down
            // Only true if: in slowdown phase, next word is final word, and we've done enough slowdown steps
            willBeLastTransition = isSlowingDown && 
                                nextWord === finalWord && 
                                slowdownStepCounter >= minSlowdownSteps;
            
            // --- Correct Speed Curve Calculation (v16) ---
            if (stepCounter < accelerationSteps) {
                 // 1. Acceleration Phase
                let progress = stepCounter / accelerationSteps;
                let easedProgress = gsap.parseEase("sine.out")(progress); // Smoother acceleration
                currentShuffleTime = gsap.utils.interpolate(initialShuffleTime, minShuffleTime, easedProgress);
                console.log(`Acceleration phase: stepCounter=${stepCounter}, progress=${progress.toFixed(3)}, time=${currentShuffleTime.toFixed(3)}`);
                
                // IMPORTANT FIX: If fastLaps=0, enter slowdown immediately after acceleration
                if (stepCounter === accelerationSteps - 1 && fastLaps === 0 && !isSlowingDown) {
                    isSlowingDown = true;
                    slowdownStepCounter = 0;
                    console.log("Acceleration complete - entering slowdown immediately (fastLaps=0)");
                }
            } else if (!isSlowingDown) { // Check !isSlowingDown instead of lapCount < fastLaps
                 // 2. Fast Phase (Continues until isSlowingDown is set in onComplete)
                currentShuffleTime = minShuffleTime;
                console.log(`Fast phase: lapCount=${lapCount}, isSlowingDown=${isSlowingDown}, time=${currentShuffleTime.toFixed(3)}`);
            } else {
                 // 3. Slowdown Phase (Based on steps SINCE slowdown started)
                 
                 // --- DETAILED LOGGING ---
                 console.log(`--> SLOWDOWN CALC START (wordIndex: ${wordIndex}, slowdownStepCounter: ${slowdownStepCounter}, wordsTotal: ${words.length})`);

                 // Calculate progress based on steps taken DURING slowdown
                 // For fastLaps=0, use higher maxSlowdownSteps for smoother deceleration
                 let maxSlowdownSteps = fastLaps === 0 ? words.length * 0.8 : words.length * 1.5;
                 let progressInSlowdown = Math.min(slowdownStepCounter / maxSlowdownSteps, 1);
                 let easedProgress = gsap.parseEase("sine.in")(progressInSlowdown);
                 
                 console.log(`    progressInSlowdown: ${progressInSlowdown.toFixed(3)}, easedProgress: ${easedProgress.toFixed(3)}`);

                 let calculatedSlowdownTime = gsap.utils.interpolate(minShuffleTime, maxShuffleTime, easedProgress);
                 console.log(`    Calculated General Slowdown Time: ${calculatedSlowdownTime.toFixed(3)} (min: ${minShuffleTime}, max: ${maxShuffleTime})`);

                 currentShuffleTime = calculatedSlowdownTime;

                 // --- Override for the VERY LAST transition ONLY ---
                 if (willBeLastTransition) {
                      currentShuffleTime = finalTransitionTime;
                      console.log(`    FINAL TRANSITION OVERRIDE: Using finalTransitionTime: ${finalTransitionTime}`);
                 }
                 
                 console.log(`    ==> FINAL currentShuffleTime for this step: ${currentShuffleTime.toFixed(3)}`);
                 // --- END DETAILED LOGGING ---
            }
            // --- End Speed Curve Calculation ---

            const halfTime = Math.max(currentShuffleTime / 2, 0.02);

            // Clear existing children before adding the new one
            // Important: Only the current and next elements should exist at any time
            while (shuffleContainer.childNodes.length > 1) {
                shuffleContainer.removeChild(shuffleContainer.firstChild);
            }

            // Create and position next element
            const currentElement = shuffleWordElement;
            const nextElement = document.createElement('span');
            nextElement.className = 'shuffle-word';
            nextElement.textContent = nextWord;
            shuffleContainer.appendChild(nextElement);
            
            // Let CSS handle position/styling - only set animation properties
            gsap.set(nextElement, { 
                yPercent: 100,
                autoAlpha: 1
            });

            const tl = gsap.timeline({
                onComplete: () => {
                    // Remove the old element and keep only the new one
                    if (currentElement.parentNode === shuffleContainer) {
                        shuffleContainer.removeChild(currentElement);
                    }
                    shuffleWordElement = nextElement;
                    wordIndex = nextWordIndex;
                    isAnimatingShuffle = false;
                    stepCounter++;
                    
                    // Key change: Increment slowdownStepCounter ONLY when in slowdown phase
                    if (isSlowingDown) {
                        slowdownStepCounter++;
                        console.log(`Slowdown step incremented: ${slowdownStepCounter}`);
                    }

                    // Check if we just completed a lap
                    if (wordIndex === words.length - 1) {
                        lapCount++;
                        console.log(`Completed lap ${lapCount}`);
                        
                        // Set the slowdown flag *after* completing the required number of fast laps
                        // Only needed when fastLaps > 0, since we now initialize isSlowingDown at start
                        if (lapCount >= fastLaps && !isSlowingDown) {
                           isSlowingDown = true;
                           slowdownStepCounter = 0; // Reset counter at start of slowdown phase
                           console.log("Entering Slowdown Phase - slowdownStepCounter reset to 0");
                        }
                    }

                    // Stop/Continue Logic
                    let shouldStop = false;
                    // UPDATED Stop condition: Check if this was the final transition we identified earlier
                    if (willBeLastTransition && !hasFinished) {
                        shouldStop = true;
                        hasFinished = true;
                        console.log(`Shuffle complete! After ${slowdownStepCounter} slowdown steps`);
                    } else if (isSlowingDown && nextWord === finalWord && slowdownStepCounter < minSlowdownSteps) {
                        // If we hit the final word too early in the slowdown phase, log but continue
                        console.log(`Hit final word "${finalWord}" but continuing: only ${slowdownStepCounter}/${minSlowdownSteps} slowdown steps`);
                    }

                    if (!shouldStop && !hasFinished) {
                       shuffleTimeout = setTimeout(shuffleWord, 10);
                    }
                }
            });

            // Animate current out, next in
            tl.to(currentElement, {
                yPercent: -100,
                duration: halfTime,
                ease: "power1.in"
              })
              .to(nextElement, {
                 yPercent: 0,
                 duration: halfTime,
                 ease: "power1.out"
               }, "<0.1"); // Adjust overlap if needed
        }

        shuffleTimeout = setTimeout(shuffleWord, startDelay * 1000);
        
        // Expose the updateEdgeCutoffs function to window for potential use in responsive designs
        window.updateShuffleCutoffs = updateEdgeCutoffs;
    }
    // --- End Vertical Word Shuffle Animation ---

    // Add public method to adjust animation delay
    window.setAnimationDelay = (delayInSeconds) => {
        sectionAnimConfig.dotToContentDelay = delayInSeconds;
        console.log(`Animation delay set to: ${delayInSeconds} seconds`);
        return `Animation delay set to: ${delayInSeconds} seconds`;
    };

    // Add public method to adjust fade speed in addition to existing animation delay
    window.setFadeSpeed = (fadeSpeedFactor) => {
        // Ensure the value is reasonable (between 0.1 and 1)
        sectionAnimConfig.fadeSpeed = Math.max(0.1, Math.min(fadeSpeedFactor, 1));
        console.log(`Fade speed set to: ${sectionAnimConfig.fadeSpeed} (smaller = faster)`);
        return `Fade speed set to: ${sectionAnimConfig.fadeSpeed} (smaller = faster)`;
    };

    // Public method to adjust scroll threshold at runtime
    window.setScrollThreshold = (threshold) => {
        // Validate input (ensure it's a number >= 50)
        const validThreshold = Math.max(50, parseInt(threshold) || 500);
        
        // Update the configuration
        scrollConfig.threshold = validThreshold;
        
        // Re-create the Observer with new settings
        reinitializeScrollObserver();
        
        console.log(`Scroll threshold set to: ${validThreshold}px`);
        return validThreshold;
    };

    // Public method to temporarily disable/enable scroll hijacking
    window.toggleScrollHijacking = (enabled = true) => {
        if (enabled === false) {
            // Disable by killing all observers
            Observer.getAll().forEach(obs => obs.kill());
            isPageReloading = true; // Use the reload flag to prevent re-enabling
            console.log("Scroll hijacking disabled");
            return "Scroll hijacking disabled";
        } else {
            // Re-enable by recreating the observer
            isPageReloading = false;
            
            // Reinitialize the observer
            reinitializeScrollObserver();
            
            console.log("Scroll hijacking enabled");
            return "Scroll hijacking enabled";
        }
    };

    // Public debug method to fix scroll hijacking issues
    window.fixScroll = () => {
        // Reset flags
        isPageReloading = false;
        
        // Clear session storage
        sessionStorage.removeItem('isReloading');
        
        // Reinitialize scroll observer
        reinitializeScrollObserver();
        
        // Report status
        console.log("Scroll hijacking reset and reinitialized");
        console.log(`Current section: ${currentSection} of ${sections.length}`);
        console.log(`isPageReloading: ${isPageReloading}`);
        console.log(`isAnimating: ${isAnimating}`);
        
        return "Scroll hijacking fixed - check console for details";
    };
    
    // Public method to toggle development mode
    window.setDevelopmentMode = (enabled = true) => {
        configMode.developmentMode = Boolean(enabled);
        configMode.liveServerProtection = Boolean(enabled);
        
        // Reset flags and reinitialize
        isPageReloading = false;
        reinitializeScrollObserver();
        
        console.log(`Development mode: ${configMode.developmentMode ? 'enabled' : 'disabled'}`);
        console.log(`LiveServer protection: ${configMode.liveServerProtection ? 'enabled' : 'disabled'}`);
        
        return `Development mode ${configMode.developmentMode ? 'enabled' : 'disabled'}`;
    };

    // Special method to manually fix scroll after any issues
    window.debugFixScroll = () => {
        // Force-disable development mode protection
        configMode.liveServerProtection = false;
        
        // Reset flags
        isPageReloading = false;
        isAnimating = false;
        
        // Clear session storage
        sessionStorage.removeItem('isReloading');
        
        // Kill any existing observers
        Observer.getAll().forEach(obs => obs.kill());
        
        // Create a new basic observer with no development mode checks
        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            wheelSpeed: scrollConfig.wheelSpeed,
            tolerance: scrollConfig.threshold,
            throttle: scrollConfig.throttle,
            preventDefault: true,
            onDown: () => {
                !isAnimating && goToSection(currentSection + 1, 1);
            },
            onUp: () => {
                !isAnimating && goToSection(currentSection - 1, -1);
            }
        });
        
        console.log("Emergency scroll fix applied - development mode protection disabled");
        return "Emergency scroll fix applied";
    };

    // Auto-detect new sections with MutationObserver
    const setupSectionDetection = () => {
        // Initial section count to detect changes
        let lastSectionCount = sections.length;
        
        // Create a mutation observer to watch for DOM changes
        const observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;
            
            mutations.forEach(mutation => {
                // Check if nodes were added
                if (mutation.addedNodes.length > 0) {
                    // Check if any of the added nodes are sections or contain sections
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('section')) {
                                shouldRefresh = true;
                            } else if (node.querySelector && typeof node.querySelector === 'function') {
                                try {
                                    if (node.querySelector('.section')) {
                                        shouldRefresh = true;
                                    }
                                } catch (err) {
                                    // Silently fail if querySelector throws an error
                                }
                            }
                        }
                    });
                }
                
                // Also check for class changes that might add the 'section' class
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (mutation.target.classList && mutation.target.classList.contains('section')) {
                        shouldRefresh = true;
                    }
                }
            });
            
            // If sections were added or removed, refresh the navigation
            if (shouldRefresh) {
                const currentCount = document.querySelectorAll('.section').length;
                if (currentCount !== lastSectionCount) {
                    console.log(`DOM changed: Sections count changed from ${lastSectionCount} to ${currentCount}`);
                    lastSectionCount = currentCount;
                    setTimeout(refreshSections, 100); // Small delay to ensure DOM is settled
                }
            }
        });
        
        // Options for the observer
        const config = { 
            childList: true,     // Observe direct children
            subtree: true,       // Observe all descendants
            attributes: true,    // Observe attribute changes
            attributeFilter: ['class'] // Only care about class changes
        };
        
        // Start observing the document body
        observer.observe(document.body, config);
        console.log("Section detection observer started");
    };
    
    // Setup section detection after initial load
    setTimeout(setupSectionDetection, 500);
    
    // Run refreshSections once more after everything is loaded
    // This helps with potential race conditions during page load
    $(window).on('load', function() {
        // Clear any session storage items that might be causing reload issues
        sessionStorage.removeItem('isReloading');
        
        setTimeout(() => {
            refreshSections();
            
            // IMMEDIATE FIX: Force reset everything 
            isPageReloading = false;
            isAnimating = false;
            configMode.liveServerProtection = false;
            
            // Also ensure scroll hijacking is properly initialized with force parameter
            reinitializeScrollObserver(true);
            
            if (configMode.debugLogging) {
                console.log("Window load complete - scroll hijacking reinitialized");
                console.log("🟢 SCROLLING SHOULD NOW BE WORKING 🟢");
                console.log("If still not working, run resetScrollNow() in console");
            }
            
            // Add a final auto-reset with delay
            setTimeout(() => {
                isPageReloading = false;
                console.log("Final auto-reset of page reload flag");
                // Use force parameter
                reinitializeScrollObserver(true);
            }, 1500);
        }, 300);
    });

    // --- Section Dot Navigation ---
    const sectionElements = document.querySelectorAll('.section');
    const sectionDots = document.querySelector('.section-dots');

    if (sectionElements.length > 0 && !sectionDots) {
        // Create dots container if it doesn't exist
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'section-dots';
        document.body.appendChild(dotsContainer);

        // Create dots for each section
        sectionElements.forEach((section, index) => {
            const dotContainer = document.createElement('div');
            dotContainer.className = 'section-dot-container';
            
            const dot = document.createElement('div');
            dot.className = 'section-dot';
            if (index === 0) {
                dot.classList.add('active', 'effect-pulse');
            }
            
            const label = document.createElement('div');
            label.className = 'section-dot-label';
            label.textContent = section.id.charAt(0).toUpperCase() + section.id.slice(1);
            
            dotContainer.appendChild(label);
            dotContainer.appendChild(dot);
            dotsContainer.appendChild(dotContainer);
            
            // Add click event to scroll to section
            dotContainer.addEventListener('click', () => {
                const targetY = index * window.innerHeight;
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });
            });
        });
    }

    // Update active dot on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        sectionElements.forEach((section, index) => {
            const dot = document.querySelector(`.section-dots .section-dot-container:nth-child(${index + 1}) .section-dot`);
            if (!dot) return;
            
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop - windowHeight/2 && scrollPosition < sectionBottom - windowHeight/2) {
                document.querySelectorAll('.section-dot').forEach(d => {
                    d.classList.remove('active', 'effect-pulse');
                });
                dot.classList.add('active', 'effect-pulse');
            }
        });
    });

});