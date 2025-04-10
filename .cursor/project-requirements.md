`Project Requirements rules *@docs/project-requirements.md* You will use tools codebase to know what are the details of the files of this *@docs/project-requirements.md* directory files to check the project requirements and the project standards that you need to follow. This will be the guide for you to make sure you are following the project standards. So make sure to read this when planning and implementing the project to avoid duplications, conflicts, and errors. Don't touch that folder and files, you will only read it. Don't over do it to the point that you are not following the project requirements. DON'T REMOVE THIS LINE 1!!!!`

# Modern Front-End Developer Portfolio Website Requirements

> Version: 1.0.0 (Incorporating AI Rules System & GSAP Focus)

## Overview 🌟

- **Project Description:** A single-page application showcasing front-end development skills, featuring a clean, minimalist UI with modern effects and seamless navigation.
- **Core Goals:** Create an engaging user experience, highlight technical proficiency (HTML, CSS, JS, GSAP, Gulp), and present portfolio pieces effectively.
- **Target Audience:** Potential employers, recruiters, clients, and fellow developers.
- **UI/UX Vision:** Implement a visually appealing interface using Glassmorphism (frosted-glass effects via `backdrop-filter` and semi-transparent `rgba` backgrounds, as seen in `#technologies .box`, `.service-card`, `#form .form-wrapper` in `dist/style.css`). Navigation relies on seamless, animated transitions between full-screen sections driven by GSAP ScrollTrigger, overriding default scroll behavior.

## Core Features ✨

1. **GSAP ScrollTrigger Navigation:**

   * Implement full-page section transitions triggered by scroll attempts (wheel, touch).
   * Eliminate default browser scrolling; use ScrollTrigger snapping or observation to control navigation between sections (`<section class="section">`).
   * Ensure the background video (`#bg-video` in `dist/index.html`) remains visually static during section transitions. The content sections should appear to animate *over* the static background.
   * Animate content within sections (e.g., text, images) during transitions using configurable presets (fades, slides, scales).
2. **Modular & Customizable Animations:**

   * Design the animation system for easy modification. Use data attributes (e.g., `data-animation="fadeInUp"`) or a JavaScript configuration object to define and apply animations.
   * Create reusable animation presets (e.g., `fadeIn`, `slideInLeft`, `zoomIn`) using GSAP timelines.
3. **Glassmorphism UI:**

   * Apply consistent frosted-glass effects to relevant UI elements (e.g., cards, form containers) using CSS `backdrop-filter: blur()` and appropriate `background-color` with alpha transparency. (Ref: `dist/style.css`)
4. **Portfolio Showcase:**

   * Dedicated section (`#portfolio`) to display project details and links. (Ref: `dist/index.html`)
   * Implement interactive elements (e.g., hover effects on images, as seen in `.portfolio-image-wrapper` in `dist/style.css`).
5. **Contact Form:**

   * Functional contact form (`#form`) submitting data asynchronously via AJAX to Formspree. (Ref: `src/js/script.js` lines 34-58)
6. **Responsive Design:**

   * Ensure seamless experience across devices (desktop, tablet, mobile).
   * Implement a functional mobile navigation menu (currently handled by jQuery in `src/js/script.js`, potentially refactor with vanilla JS or GSAP).

## Technical Specifications 💻

**Frontend:**

* HTML5 (Structure defined in `src/pages/index.html` and templates `src/templates/*.html`)
* CSS3 / SCSS (`src/scss/main.scss`, compiled to `dist/style.css` via Gulp)
* JavaScript (ES6+) (`src/js/script.js`, minified to `dist/js/script.js` via Gulp/Terser)
* **Libraries:**
  * GSAP (Core + ScrollTrigger Plugin) - Included via CDN in `dist/index.html` (lines 257-258). Primary engine for animations and navigation.
  * jQuery - Included via CDN (`dist/index.html` line 11). **Currently used for smooth scroll and mobile menu (`src/js/script.js`), needs refactoring to avoid conflicts with ScrollTrigger.**
* **Templating:** Nunjucks (`src/pages/`, `src/templates/`), processed by Gulp (`gulpfile.js` lines 39-45).

**Build Tools:**

* Gulp (`gulpfile.js`):
  * SCSS compilation (`sass`, `postcss`, `autoprefixer`, `sourcemaps`, `rename`) - `scssTask` function.
  * JavaScript minification (`terser`, `sourcemaps`) - `jsTask` function.
  * Nunjucks templating (`gulp-nunjucks-render`) - `nunjucksTask` function.
  * Live Reload / Watch (`watch`) - `watchTask` function.

**Key Implementation Patterns:**

* **GSAP ScrollTrigger Logic:**
  * Utilize `ScrollTrigger.create()` for each section or a master timeline.
  * Implement snapping between sections using `snap: 1 / (sections.length - 1)`.
  * Potentially use `ScrollTrigger.observe()` to capture scroll intents if default scroll is fully disabled via CSS (`overflow: hidden`).
  * Animate section content (`<h1>`, `<p>`, etc.) based on scroll position or section activation using GSAP timelines tied to ScrollTrigger instances.
* **Static Background:** Achieved by keeping the `#bg-video` element's position fixed or outside the main scrolling/animated container, while sections animate within their container. The `.overlay` likely shares the same static behavior. (Ref: `#bg-video`, `.overlay` CSS in `dist/style.css`)
* **CSS:** Utilizes modern CSS features, including `backdrop-filter` for glassmorphism. Potential for CSS Variables for theming (to be confirmed or implemented). Uses `calc()` for responsive font sizes. (Ref: `dist/style.css`)

## AI Rules System Integration (.cursorrules) 🧠

* **`@memories.md`:** Log significant milestones with versions (e.g., `[v1.1.0] Implemented GSAP ScrollTrigger section snapping`, `[v1.2.0] Refactored jQuery smooth scroll to GSAP`). Use format from `803-memories-format.mdc`.
* **`@lessons-learned.md`:** Document challenges and solutions (e.g., `[v1.0.0-LL001] Performance: Large background videos impact load time → Implement lazy-loading or optimize video aggressively → Prevents poor initial user experience.`, `[v1.1.0-LL002] Animation: ScrollTrigger snapping conflicts with default anchor link behavior → Disable default behavior and use GSAP navigation methods → Ensures smooth transitions.`). Use format from `801-lessons-learned.mdc`.
* **`@scratchpad.md`:** Manage implementation tasks with status and priority. Use format from `804-scratchpad-system.mdc`. See **Project Roadmap** section below for initial tasks.

## Non-Negotiables ⚠️

1. **Zero Visible Scrollbar:** Body or main scrolling container must have `overflow: hidden` set in CSS. Navigation is handled solely by GSAP ScrollTrigger.
2. **Performance First:** Prioritize fast loading times. Lazy-load the background video (`4K.mp4`) and large images (e.g., `Ola.jpg`). Optimize assets during the build process.
3. **Animation Modularity:** Decouple animation logic from HTML structure. Use data attributes (e.g., `data-animation="slideInUp"`) or a JS configuration module to trigger animations, allowing easy updates and reuse.
4. **Refactor jQuery Dependency:** Replace jQuery-based smooth scrolling (`src/js/script.js` lines 23-31) with a GSAP-based solution (e.g., `gsap.to(window, {scrollTo: targetSection})`) to work correctly with ScrollTrigger. Consider refactoring the mobile menu as well.

## Documentation Standards 📄

1. **JavaScript:** Use JSDoc comments for all GSAP modules, animation preset functions, and complex logic.
2. **SCSS:** Comment complex selectors or mixins. Maintain structure as seen in `src/scss/` (`_base.scss`, `main.scss`, potentially adding partials for components/sections).
3. **Gulpfile:** Add comments explaining each task and complex configurations.
4. **This Document:** Keep `@project-requirements.md` updated as the single source of truth for project goals and technical approach.

## Project Roadmap (Initial Tasks for @scratchpad.md) 🗺️

**Phase 1: GSAP Navigation & Core Setup**

* `[ID-001] Setup GSAP Core & ScrollTrigger`: Basic initialization. Status: [ ] Priority: High
* `[ID-002] Implement ScrollTrigger Section Snapping`: Configure snapping between `.section` elements. Status: [ ] Priority: High Dependencies: [ID-001]
* `[ID-003] Disable Default Scroll & Remove Scrollbar`: Apply necessary CSS (`overflow: hidden`). Status: [ ] Priority: High
* `[ID-004] Ensure Static Background Video`: Verify video remains visually fixed during transitions. Status: [ ] Priority: Medium Dependencies: [ID-002]
* `[ID-005] Refactor jQuery Scroll`: Replace `$('html, body').animate` with `gsap.to(window, {scrollTo: ...})`. Status: [ ] Priority: High Dependencies: [ID-001]
* `[ID-006] Basic Content Animation`: Implement simple fade-in/out for section content on transition. Status: [ ] Priority: Medium Dependencies: [ID-002]

**Phase 2: Enhancements & Refinements**

* `[ID-007] Create Animation Preset Module/System`: Develop reusable animation functions or data-attribute handler. Status: [ ] Priority: Medium Dependencies: [ID-001]
* `[ID-008] Apply Animation Presets`: Use the new system for section content animations. Status: [ ] Priority: Medium Dependencies: [ID-007]
* `[ID-009] Implement Consistent Glassmorphism`: Apply backdrop-filter styles uniformly. Status: [ ] Priority: Low
* `[ID-010] Performance Optimization`: Lazy-load video and images. Status: [ ] Priority: Medium
* `[ID-011] Refactor Mobile Menu (Optional)`: Replace jQuery toggle with vanilla JS or GSAP. Status: [ ] Priority: Low
* `[ID-012] Cross-Browser Testing`: Test animations and layout thoroughly. Status: [ ] Priority: Medium

## Architecture Guidelines 🏗️

### 1. Project Structure (Current & Target)

```
├── dist/              # Compiled output (served to browser)
│   ├── img/
│   ├── js/
│   │   └── script.js
│   │   └── script.js.map
│   ├── index.html
│   └── style.css
│   └── style.css.map
│   └── 4K.mp4
├── src/               # Source files
│   ├── js/
│   │   └── script.js  # Main JS file (target for GSAP code)
│   │   
│   ├── pages/
│   │   └── index.html # Main Nunjucks page
│   ├── scss/
│   │   ├── _base.scss
│   │   ├── _reset.scss
│   │   ├── main.scss  # Main SCSS entry point
│   │   └── _functions.scss
│   └── templates/       # Nunjucks templates
│       ├── footer_template.html
	├── header_template.html
	└── structure_template.html
├── .cursor/           # AI Rules and Project Config
│   ├── project-requirements.md
│   ├── rules/
│   └── ...
├── .cursorrules       # Main AI instructions
├── gulpfile.js        # Gulp build configuration
├── package.json
├── package-lock.json
└── (other config files)
```

### 2. JavaScript Approach

* Organize GSAP/ScrollTrigger logic clearly, potentially in dedicated functions or modules within `src/js/script.js` or separate files (e.g., `src/js/animations.js`).
* Minimize global scope pollution.
* Prioritize vanilla JavaScript where possible, especially for DOM manipulation if jQuery is fully refactored out.

### 3. SCSS Approach

* Utilize partials (`src/scss/partials/`) for better organization (e.g., `_variables.scss`, `_header.scss`, `_sections.scss`, `_animations.scss`).
* Use SCSS variables for colors, fonts, and potentially animation timings to maintain consistency.
* Follow a naming convention (e.g., BEM) for CSS classes.

### 4. HTML Approach

* Use semantic HTML5 elements (`<section>`, `<nav>`, `<header>`, `<footer>`).
* Leverage data attributes (`data-animation`, `data-trigger`) for hooking animations via JavaScript.
