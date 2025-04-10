*This scratchpad file serves as a phase-specific task tracker and implementation planner. The Mode System on Line 1 is critical and must never be deleted. It defines two core modes: Implementation Type for new feature development and Bug Fix Type for issue resolution. Each mode requires specific documentation formats, confidence tracking, and completion criteria. Use "plan" trigger for planning phase (🎯) and "agent" trigger for execution phase (⚡) after reaching 95% confidence. Follow strict phase management with clear documentation transfer process.*

`MODE SYSTEM TYPES (DO NOT DELETE!):

1. Implementation Type (New Features):

   - Trigger: User requests new implementation
   - Format: MODE: Implementation, FOCUS: New functionality
   - Requirements: Detailed planning, architecture review, documentation
   - Process: Plan mode (🎯) → 95% confidence → Agent mode (⚡)
2. Bug Fix Type (Issue Resolution):

   - Trigger: User reports bug/issue
   - Format: MODE: Bug Fix, FOCUS: Issue resolution
   - Requirements: Problem diagnosis, root cause analysis, solution verification
   - Process: Plan mode (🎯) → Chain of thought analysis → Agent mode (⚡)

Cross-reference with @memories.md and @lessons-learned.md for context and best practices.`

# Project Scratchpad

**Current Focus:** Fix Observer implementation (delay, static background) & Correct Workflow

**CRITICAL NOTE:** Gulp builds `src` -> `dist`. **ALL EDITS MUST BE MADE IN `src` DIRECTORY.**

### Phase 1: GSAP Navigation & Core Setup (Fixing - Attempt 10 - SRC FOCUS)

- `[ID-023]`, `[ID-025]`, `[ID-030]`: Rules Enforced. Status: `[X]`
- `[ID-001]`-`[ID-015]`, `[ID-017]`, `[ID-022]`, `[ID-026]`, `[ID-020]`, `[ID-021]`, `[ID-004]`, `[ID-018]`, `[ID-024]`, `[ID-031]`, `[ID-003]`: Status: `[X]`
- `[ID-016] Implement Observer for Scroll Hijacking`: wheelSpeed=-5, logs added. Status: `[? ]` Priority: High
- `[ID-005] Refactor GSAP ScrollTo`: jQuery removed, delay removed. Status: `[? ]` Priority: High
- `[ID-027]`, `[ID-028]`, `[ID-029]`: Button Fixes. Status: `[X]`
- `[ID-006] Basic Content Animation`: Status: `[? ]` Priority: Medium
- `[ID-019] Performance Audit (Brave)`: Status: `[? ]` Priority: Medium
- `[ID-006] Implement radial button hover effect (CSS+JS)`: Status: `[X]` Priority: Medium

### Phase 1.5: Responsive & Mobile Refinements (DEFERRED)

- `[ID-013] Responsive Layout Audit`: Test across devices and identify CSS adjustments needed. Status: `[ Deferred ]` Priority: Medium
- `[ID-014] Implement Responsive CSS Fixes`: Apply necessary media queries and style adjustments. Status: `[ Deferred ]` Priority: Medium Dependencies: [ID-013]
- `[ID-011] Refactor Mobile Menu (Decision Pending)`: Replace jQuery toggle (Awaiting user feedback). Status: `[ Deferred ]` Priority: Low Dependencies: [ID-001] (if using GSAP)

### Phase 2: Enhancements & Refinements (From @project-requirements.md)

- `[ID-007] Create Animation Preset Module/System`: Develop reusable animation functions or data-attribute handler. Status: `[ ]` Priority: Medium Dependencies: [ID-001]
- `[ID-008] Apply Animation Presets`: Use the new system for section content animations. Status: `[ ]` Priority: Medium Dependencies: [ID-007]
- `[ID-009] Implement Consistent Glassmorphism`: Apply backdrop-filter styles uniformly. Status: `[ ]` Priority: Low
- `[ID-010] Performance Optimization`: Lazy-load video and images. Status: `[ ]` Priority: Medium
- `[ID-012] Cross-Browser Testing`: Test animations and layout thoroughly. Status: `[ ]` Priority: Medium

## Confidence: 60% (Increased sensitivity significantly, pending test)

### Confidence Gaps & Required Input:
- Need confirmation if `wheelSpeed: -5` provides the required INSTANT start feel.
- Keep checking console log timing.
- Awaiting user testing after Gulp build for Attempt 10.
