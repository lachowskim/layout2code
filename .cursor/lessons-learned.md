*This lessons-learned file serves as a critical knowledge base for capturing and preventing mistakes. During development, document any reusable solutions, bug fixes, or important patterns using the format: [Timestamp] Category: Issue → Solution → Impact. Entries must be categorized by priority (Critical/Important/Enhancement) and include clear problem statements, solutions, prevention steps, and code examples. Only update upon user request with "lesson" trigger word. Focus on high-impact, reusable lessons that improve code quality, prevent common errors, and establish best practices. Cross-reference with @memories.md for context.*

# Lessons Learned

*Note: This file is updated only upon user request and focuses on capturing important, reusable lessons learned during development. Each entry includes a timestamp, category, and comprehensive explanation to prevent similar issues in the future.*

[v0.5.1-LL001] Critical: GSAP Implementation: Issue → GSAP ScrollTrigger/ScrollTo fails with "Plugin not defined" error and/or incorrect scroll behavior if required plugins (e.g., ScrollToPlugin) are not included via CDN, or if ScrollTrigger axis configuration (e.g., `xPercent` vs. vertical logic) doesn't match page layout. Solution → Always verify all necessary GSAP plugin CDN links are present in HTML (`dist/index.html`) and ensure ScrollTrigger setup aligns with the intended scroll direction (vertical/horizontal). Impact → Prevents runtime errors and ensures scroll-based animations function correctly, avoiding implementation delays.
[v0.5.1-LL002] Important: GSAP Full-Page Scroll: Issue → Standard `ScrollTrigger.create({ snap: ... })` may not reliably hijack scroll events for full-page section transitions when `body { overflow: hidden; }` is applied. Also, animating NodeLists in callbacks (`onEnter`, etc.) without checking `nodeList.length > 0` can cause "target not found" errors if the list is empty during transitions. Performance issues (e.g., in Brave) can arise from heavy effects (video, glassmorphism). Solution → Use `gsap.Observer` for robust manual scroll hijacking in overflow:hidden scenarios. Wrap NodeList animations in length checks. Profile performance in target browsers and apply optimizations (e.g., `will-change`, simplifying effects). Impact → Ensures reliable scroll navigation, prevents console errors, and improves cross-browser performance.
[v0.5.1-LL003] Critical: Static Background Effect: Issue → To achieve a static background (e.g., video, overlay) behind scroll-jacked content sections, the background elements *must* be positioned outside the scrolling containers/sections in the HTML DOM. They should typically use `position: fixed` and appropriate `z-index` (e.g., negative) relative to the viewport, not `position: absolute` within scrolling sections. Performance → Heavy CSS effects like `backdrop-filter` or complex animations can cause cross-browser performance differences (e.g., Brave vs. Chrome); test and consider alternatives or targeted optimizations if needed. Impact → Correctly implements static background effect, prevents background scrolling with content, aids performance diagnosis.
[v1.0.0-LL004] Critical: Build Tool Workflow Awareness

- Category: Workflow & Build Process
- Issue: Edits made directly to compiled output files (`dist/`) instead of source files (`src/`) when using a build tool like Gulp.
- Solution: Always identify the project's build process (e.g., check `gulpfile.js`, `package.json` scripts). Make all code modifications in the source directory (`src/`) and allow the build tool to compile them to the output directory (`dist/`).
- Impact: Prevents loss of work, ensures changes are correctly processed (minification, compilation), maintains project integrity.
- Tags: #gulp #build #workflow #source-control #compilation

[v0.5.2-LL005] Critical: Semantic Versioning Adherence

- Category: Documentation & Workflow
- Issue: Incorrectly incrementing version numbers, especially major versions (e.g., jumping from v0.x to v1.0.0) for minor fixes or during active development.
- Solution: Strictly follow Semantic Versioning (MAJOR.MINOR.PATCH). During pre-1.0.0 development, only increment MINOR (max 0.1 per logical change set, e.g., v0.5 -> v0.6) or PATCH (e.g., v0.5.1 -> v0.5.2) versions. Document this requirement in project rules.
- Impact: Maintains clear history of changes, accurately reflects project maturity, avoids confusion about release status.
- Tags: #versioning #semver #documentation #workflow #rules
