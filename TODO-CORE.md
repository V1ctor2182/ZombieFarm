---
title: "Core Systems TODO"
module: Core (Infrastructure & Integration)
priority: Critical (Foundation)
last updated: 2025-11-12
---

# Core Systems Implementation TODO

This document tracks all tasks for implementing the core infrastructure, state management, and cross-module integration following ARCHITECTURE.md. These systems must be built first as they provide the foundation for Farm and Combat modules.

## Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked/Needs attention

---

## Phase 1: Project Initialization

### 1.1 Repository & Environment Setup
- [ ] Initialize Git repository
  - [ ] Create .gitignore (node_modules, dist, .env, etc.)
  - [ ] Initial commit with documentation
  - [ ] Set up branch strategy (main/develop)
- [ ] Create README.md
  - [ ] Project description
  - [ ] Setup instructions
  - [ ] Development workflow
  - [ ] Tech stack overview
- [ ] Set up development environment
  - [ ] Install Node.js (LTS version)
  - [ ] Install package manager (npm/yarn/pnpm)
  - [ ] Install VS Code extensions (ESLint, Prettier, etc.)

### 1.2 Build Tool Configuration
- [ ] Initialize Vite project
  - [ ] Create vite.config.ts
  - [ ] Configure path aliases (@features, @lib, @components)
  - [ ] Set up dev server options
  - [ ] Configure build options
  - [ ] Enable HMR (Hot Module Replacement)
- [ ] Configure environment variables
  - [ ] Create .env.example template
  - [ ] Set up VITE_ prefixed variables

### 1.3 TypeScript Configuration
- [ ] Create tsconfig.json
  - [ ] Enable strict mode
  - [ ] Configure path mappings
  - [ ] Set target to ES2020+
  - [ ] Enable JSX for React
  - [ ] Configure module resolution
- [ ] Create tsconfig.node.json for build scripts
- [ ] Set up TypeScript checking in CI

### 1.4 Code Quality Tools
- [ ] Set up ESLint
  - [ ] Install ESLint + TypeScript parser
  - [ ] Configure rules (.eslintrc)
  - [ ] Add React/JSX rules
  - [ ] Configure import sorting
- [ ] Set up Prettier
  - [ ] Install Prettier
  - [ ] Create .prettierrc config
  - [ ] Add .prettierignore
  - [ ] Integrate with ESLint
- [ ] Set up Husky (Git hooks)
  - [ ] Pre-commit: lint-staged
  - [ ] Pre-push: run tests
- [ ] Create lint-staged config

### 1.5 Testing Framework Setup
- [ ] Install Jest
  - [ ] Configure jest.config.js
  - [ ] Set up jsdom environment
  - [ ] Configure path mappings
  - [ ] Set up coverage thresholds
- [ ] Install React Testing Library
  - [ ] Install @testing-library/react
  - [ ] Install @testing-library/jest-dom
  - [ ] Install @testing-library/user-event
  - [ ] Create setupTests.ts
- [ ] Create test scripts in package.json
  - [ ] test: run all tests
  - [ ] test:watch: watch mode
  - [ ] test:coverage: generate coverage report
- [ ] Set up first smoke test
  - [ ] Test that App component renders

---

## Phase 2: Core Dependencies & UI Foundation

### 2.1 React Setup
- [ ] Install React 18
- [ ] Install React DOM
- [ ] Install React Router (for future routing)
- [ ] Create main.tsx entry point
- [ ] Create root App.tsx component
- [ ] Set up React StrictMode

### 2.2 Styling System (Tailwind CSS)
- [ ] Install Tailwind CSS
- [ ] Create tailwind.config.js
  - [ ] Configure content paths
  - [ ] Set up zombie theme colors (dark palette)
  - [ ] Configure custom fonts (pixel-art style)
  - [ ] Add custom animations
- [ ] Create global CSS file
  - [ ] Import Tailwind directives
  - [ ] Add zombie theme variables
  - [ ] Custom scrollbars and UI elements
- [ ] Create PostCSS config

### 2.3 Phaser Integration
- [ ] Install Phaser 3
- [ ] Create Phaser wrapper component
  - [ ] React component that hosts Phaser canvas
  - [ ] Lifecycle management (mount/unmount)
  - [ ] Props for scene switching
- [ ] Set up Phaser configuration
  - [ ] Game dimensions
  - [ ] Physics engine config (Arcade)
  - [ ] Rendering options
- [ ] Test Phaser renders in React

### 2.4 State Management (XState)
- [ ] Install XState + React integration
- [ ] Create state machine utilities
  - [ ] Type helpers for machines
  - [ ] Context providers
  - [ ] Machine hooks
- [ ] Test XState integration with React

---

## Phase 3: Core Game State Architecture

### 3.1 Global Type Definitions
- [ ] Create `src/types/` directory structure
  - [ ] global.ts (GameState, Player, etc.)
  - [ ] farm.ts (delegated to Farm module)
  - [ ] combat.ts (delegated to Combat module)
  - [ ] events.ts (all game events)
  - [ ] resources.ts (currencies, materials)
- [ ] Define GameState interface
  - [ ] player: Player (level, XP, etc.)
  - [ ] farm: FarmState
  - [ ] combat: CombatState
  - [ ] inventory: Inventory
  - [ ] world: WorldState
  - [ ] ui: UIState
- [ ] Define Player interface
  - [ ] id, name, level, xp
  - [ ] skills, achievements
  - [ ] unlocks, tutorial progress

### 3.2 Game Configuration
- [ ] Create `src/lib/config/zombieFarmConfig.ts`
  - [ ] Game constants (tick rates, limits, etc.)
  - [ ] Zombie type definitions
  - [ ] Resource definitions
  - [ ] Building definitions
  - [ ] Balance values (costs, growth times, etc.)
- [ ] Make config easily tweakable
- [ ] Add config validation

### 3.3 Core State Machine - TEST PHASE
- [ ] Write tests for game machine:
  - [ ] Test: Game initializes in "loading" state
  - [ ] Test: Transitions to "tutorial" on first play
  - [ ] Test: Transitions to "farm" mode after tutorial
  - [ ] Test: Transitions to "combat" when battle starts
  - [ ] Test: Returns to "farm" after combat ends
  - [ ] Test: Game can pause/resume
  - [ ] Test: Context updates correctly
  - [ ] Test: Events dispatch properly

### 3.4 Core State Machine - IMPLEMENTATION
- [ ] Create `src/features/game/gameMachine.ts`
  - [ ] Define states: loading, tutorial, farm, combat, paused, gameOver
  - [ ] Define transitions between states
  - [ ] Define context (holds game state)
  - [ ] Define events (actions that trigger transitions)
- [ ] Implement state entry/exit actions
- [ ] Create machine interpreter setup
- [ ] Add machine visualization (XState visualizer)

### 3.5 Game Context Provider
- [ ] Create `src/features/game/GameProvider.tsx`
  - [ ] Wrap game machine in React context
  - [ ] Provide state and send function
  - [ ] Handle machine subscription
- [ ] Create useGameState() hook
- [ ] Create useGameDispatch() hook
- [ ] Create utility hooks (useIsState, etc.)

---

## Phase 4: Event System

### 4.1 Event Architecture - TEST PHASE
- [ ] Write tests for event system:
  - [ ] Test: Event is dispatched to machine
  - [ ] Test: Event triggers state transition
  - [ ] Test: Event updates context
  - [ ] Test: Invalid events are rejected
  - [ ] Test: Event payload is validated
  - [ ] Test: Multiple modules can listen to events
  - [ ] Test: Event history is tracked (for debugging)

### 4.2 Event System - IMPLEMENTATION
- [ ] Create `src/lib/events/eventBus.ts`
  - [ ] Central event dispatcher
  - [ ] Event subscription system
  - [ ] Event validation
  - [ ] Event history/logging (debug mode)
- [ ] Define all game events in types
  - [ ] Farm events (plant, harvest, feed, etc.)
  - [ ] Combat events (battle start, attack, victory, etc.)
  - [ ] UI events (open modal, close, etc.)
  - [ ] System events (save, load, pause, etc.)
- [ ] Create event factories (type-safe event creators)
- [ ] Add event debugging tools

### 4.3 Event Handlers
- [ ] Create handler registration system
- [ ] Implement handler middleware (validation, logging)
- [ ] Create error handling for failed events
- [ ] Add event replay capability (for debugging)

---

## Phase 5: Persistence & Save System

### 5.1 Local Storage Save System - TEST PHASE
- [ ] Write tests for save/load:
  - [ ] Test: Game state serializes to JSON
  - [ ] Test: Serialized state saves to localStorage
  - [ ] Test: Saved state loads correctly
  - [ ] Test: Invalid/corrupted save is handled gracefully
  - [ ] Test: Save versioning works (migration)
  - [ ] Test: Auto-save triggers at intervals
  - [ ] Test: Manual save works
  - [ ] Test: Multiple save slots supported

### 5.2 Save System - IMPLEMENTATION
- [ ] Create `src/lib/storage/localSaveSystem.ts`
  - [ ] Serialize GameState to JSON
  - [ ] Compress save data (optional, LZ-string)
  - [ ] Save to localStorage
  - [ ] Load from localStorage
  - [ ] Validate loaded data structure
  - [ ] Handle save corruption
- [ ] Implement save versioning
  - [ ] Current save version constant
  - [ ] Migration functions for old versions
  - [ ] Detect version mismatches
- [ ] Create auto-save system
  - [ ] Save every X minutes
  - [ ] Save on significant events (battle end, day end)
  - [ ] Save before closing window (onbeforeunload)

### 5.3 Save UI
- [ ] Create save/load menu
  - [ ] Manual save button
  - [ ] Load save button
  - [ ] Multiple save slots UI
  - [ ] Delete save option
  - [ ] Export/import save (JSON file)
- [ ] Create save confirmation notifications
- [ ] Add last saved timestamp display

---

## Phase 6: Resource & Inventory System

### 6.1 Resource System - TEST PHASE
- [ ] Write tests for resources:
  - [ ] Test: Resources tracked in inventory
  - [ ] Test: Add resource increases count
  - [ ] Test: Remove resource decreases count
  - [ ] Test: Cannot go negative (validation)
  - [ ] Test: Resource caps enforced (if any)
  - [ ] Test: Currency (Dark Coins) tracked separately

### 6.2 Resource System - IMPLEMENTATION
- [ ] Create `src/features/game/lib/resources.ts`
  - [ ] Define resource types (Wood, Bones, Blood Water, etc.)
  - [ ] Create inventory data structure
  - [ ] Implement add/remove resource functions
  - [ ] Implement validation (no negative, caps)
  - [ ] Track Dark Coins (primary currency)
  - [ ] Track Soul Essence (premium currency)
- [ ] Create resource events (resource.added, resource.removed)
- [ ] Add resource change notifications

### 6.3 Inventory UI Components
- [ ] Create resource counter component
  - [ ] Display resource icon + count
  - [ ] Compact mode for HUD
  - [ ] Detailed mode for inventory screen
- [ ] Create inventory panel
  - [ ] List all resources
  - [ ] Show descriptions
  - [ ] Show storage limits
- [ ] Create currency displays
  - [ ] Dark Coins counter
  - [ ] Soul Essence counter

---

## Phase 7: Time & Day/Night System

### 7.1 Time System - TEST PHASE
- [ ] Write tests for time:
  - [ ] Test: Time progresses in real-time
  - [ ] Test: 30 min real = 1 full day/night cycle
  - [ ] Test: Day is 20 min, night is 10 min
  - [ ] Test: Day/night state transitions correctly
  - [ ] Test: Time events fire at correct intervals
  - [ ] Test: Offline time calculated correctly
  - [ ] Test: Time can be paused
  - [ ] Test: Time speed can be changed (debug)

### 7.2 Time System - IMPLEMENTATION
- [ ] Create `src/features/game/lib/timeSystem.ts`
  - [ ] Game clock (tracks in-game time)
  - [ ] Real-time to game-time conversion
  - [ ] Day counter (track which day it is)
  - [ ] Time of day (0-24 hours)
  - [ ] Day/night state (day, night, dawn, dusk)
- [ ] Implement time progression
  - [ ] Update clock each frame/tick
  - [ ] Trigger day/night transitions
  - [ ] Fire time-based events (daily, hourly)
- [ ] Implement offline time calculation
  - [ ] Calculate time elapsed since last play
  - [ ] Apply elapsed time to game state
  - [ ] Cap at 7 days for safety

### 7.3 Day/Night Cycle Effects
- [ ] Create day/night modifier system
  - [ ] Zombies +stats at night
  - [ ] Humans +stats at day
  - [ ] Growth rate modifiers
- [ ] Implement visual day/night cycle
  - [ ] Sky color transitions
  - [ ] Lighting changes
  - [ ] Shadow changes (Phaser)

### 7.4 Time UI
- [ ] Create time display widget
  - [ ] Show current in-game time
  - [ ] Show day counter
  - [ ] Sun/moon icon for day/night
- [ ] Add day transition animations
  - [ ] Dawn fade-in
  - [ ] Dusk fade-out

---

## Phase 8: Utility Libraries

### 8.1 Math & Random Utilities - TEST & IMPLEMENTATION
- [ ] Test and implement `src/lib/utils/math.ts`
  - [ ] Clamp function (min, max)
  - [ ] Linear interpolation (lerp)
  - [ ] Percentage calculations
  - [ ] Random number generators
  - [ ] Weighted random (for loot tables)
- [ ] Test edge cases (NaN, Infinity, etc.)

### 8.2 Formatting Utilities - TEST & IMPLEMENTATION
- [ ] Test and implement `src/lib/utils/format.ts`
  - [ ] Number formatting (1000 -> 1K)
  - [ ] Time formatting (seconds to HH:MM:SS)
  - [ ] Percentage formatting
  - [ ] Currency formatting
- [ ] Test localization (future-proof)

### 8.3 Validation Utilities - TEST & IMPLEMENTATION
- [ ] Test and implement `src/lib/utils/validation.ts`
  - [ ] Type guards
  - [ ] Data schema validation
  - [ ] Enum validation
  - [ ] Range validation
- [ ] Create validation error types

### 8.4 Array & Object Utilities
- [ ] Common array operations (shuffle, sample, etc.)
- [ ] Deep clone function
- [ ] Deep merge function
- [ ] Object diff function (for debugging)

---

## Phase 9: UI Component Library

### 9.1 Base Components
- [ ] Create Button component
  - [ ] Variants (primary, secondary, danger, ghost)
  - [ ] Sizes (sm, md, lg)
  - [ ] Loading state
  - [ ] Disabled state
  - [ ] Icon support
- [ ] Create Input component
  - [ ] Text input
  - [ ] Number input
  - [ ] Validation states
- [ ] Create Modal component
  - [ ] Open/close animations
  - [ ] Backdrop click to close
  - [ ] Keyboard support (ESC to close)
  - [ ] Focus trap
- [ ] Create Tooltip component
  - [ ] Position options
  - [ ] Delay settings
- [ ] Create Progress Bar component
  - [ ] Horizontal/vertical
  - [ ] Label support
  - [ ] Color variants

### 9.2 Game-Specific Components
- [ ] Create Card component (for items, zombies, etc.)
- [ ] Create IconButton component
- [ ] Create Badge component (counters, notifications)
- [ ] Create Tabs component
- [ ] Create Dropdown/Select component
- [ ] Create Slider component

### 9.3 Layout Components
- [ ] Create Panel component (bordered containers)
- [ ] Create Grid layout component
- [ ] Create Stack component (flex container)
- [ ] Create Divider component

### 9.4 Feedback Components
- [ ] Create Toast/Notification system
  - [ ] Success, error, info, warning variants
  - [ ] Auto-dismiss timers
  - [ ] Stack multiple toasts
  - [ ] Position options
- [ ] Create Loading spinner component
- [ ] Create Skeleton loader component
- [ ] Create Error boundary component

---

## Phase 10: Audio System

### 10.1 Audio Manager - TEST PHASE
- [ ] Write tests for audio:
  - [ ] Test: Can load audio files
  - [ ] Test: Can play/pause/stop sounds
  - [ ] Test: Volume control works
  - [ ] Test: Mute/unmute works
  - [ ] Test: Multiple sounds play simultaneously
  - [ ] Test: Music loops correctly
  - [ ] Test: Audio settings persist

### 10.2 Audio Manager - IMPLEMENTATION
- [ ] Create `src/lib/audio/audioManager.ts`
  - [ ] Load audio assets
  - [ ] Play sound effects
  - [ ] Play/pause music
  - [ ] Volume controls (master, SFX, music)
  - [ ] Mute/unmute
  - [ ] Audio pooling for performance
- [ ] Implement audio settings
  - [ ] Save audio preferences to localStorage
  - [ ] Load preferences on init
- [ ] Create audio preloader

### 10.3 Audio Assets (Placeholder)
- [ ] Create placeholder audio files
  - [ ] Button click sound
  - [ ] Success/error sounds
  - [ ] Background music (farm, combat)
  - [ ] Ambient sounds
- [ ] Organize audio directory structure
  - [ ] /public/audio/sfx/
  - [ ] /public/audio/music/
  - [ ] /public/audio/ambient/

### 10.4 Audio UI
- [ ] Create audio settings panel
  - [ ] Master volume slider
  - [ ] SFX volume slider
  - [ ] Music volume slider
  - [ ] Mute toggle buttons
- [ ] Add audio icon to HUD (quick mute)

---

## Phase 11: Asset Management

### 11.1 Asset Loading System
- [ ] Create asset loader
  - [ ] Image preloader
  - [ ] Audio preloader
  - [ ] JSON data loader
- [ ] Implement loading screen
  - [ ] Progress bar
  - [ ] Asset count display
  - [ ] Error handling
- [ ] Create asset manifest (list of all assets)

### 11.2 Sprite Management
- [ ] Set up sprite atlas system
  - [ ] Combine small sprites into atlases
  - [ ] Generate atlas JSON metadata
- [ ] Create sprite loader for Phaser
- [ ] Organize sprite directory structure
  - [ ] /public/sprites/zombies/
  - [ ] /public/sprites/enemies/
  - [ ] /public/sprites/ui/
  - [ ] /public/sprites/environment/

### 11.3 Placeholder Assets
- [ ] Create placeholder images
  - [ ] Zombie sprites (basic shapes/colors)
  - [ ] UI icons (resource icons, buttons)
  - [ ] Background tiles
- [ ] Document asset requirements for artists

---

## Phase 12: Debug & Development Tools

### 12.1 Debug Panel
- [ ] Create debug mode toggle (ENV var)
- [ ] Create debug overlay panel
  - [ ] FPS counter
  - [ ] Current state display
  - [ ] Event log viewer
  - [ ] Resource editor (add/remove resources)
  - [ ] Time controls (pause, speed up, skip day)
  - [ ] Zombie spawner (quick test)
- [ ] Add keyboard shortcuts (F1 for debug, etc.)

### 12.2 State Inspection Tools
- [ ] Create state inspector
  - [ ] View full game state (JSON viewer)
  - [ ] Export state to clipboard
  - [ ] Import state from JSON
- [ ] Integrate XState visualizer
- [ ] Add Redux DevTools support (if using Redux)

### 12.3 Testing Utilities
- [ ] Create test data factories
  - [ ] Create mock game state
  - [ ] Create mock zombies
  - [ ] Create mock battles
- [ ] Create visual regression testing setup (optional)
- [ ] Create E2E testing setup (Playwright/Cypress) (future)

---

## Phase 13: Performance Optimization

### 13.1 React Performance
- [ ] Profile React renders (React DevTools)
- [ ] Identify unnecessary re-renders
- [ ] Implement React.memo where needed
- [ ] Use useMemo for expensive calculations
- [ ] Use useCallback for event handlers
- [ ] Implement virtual scrolling for long lists

### 13.2 State Management Performance
- [ ] Minimize state updates frequency
- [ ] Batch state updates where possible
- [ ] Use selectors to prevent unnecessary re-renders
- [ ] Profile state machine transitions

### 13.3 Asset Optimization
- [ ] Compress images (PNG -> WebP)
- [ ] Create multiple sprite sizes (responsive)
- [ ] Lazy load non-critical assets
- [ ] Implement asset caching strategy

### 13.4 Bundle Optimization
- [ ] Code splitting by route (future)
- [ ] Tree-shaking verification
- [ ] Minimize bundle size
- [ ] Analyze bundle (webpack-bundle-analyzer)
- [ ] Configure Vite chunk splitting

---

## Phase 14: Error Handling & Monitoring

### 14.1 Error Boundaries
- [ ] Create React error boundary
- [ ] Display fallback UI on error
- [ ] Log errors to console
- [ ] Show "reload game" option
- [ ] Preserve game state if possible

### 14.2 Error Logging
- [ ] Create error logger
  - [ ] Log to console in dev
  - [ ] Send to monitoring service in prod (future)
  - [ ] Include context (state, user actions)
  - [ ] Stack trace capture
- [ ] Create error reporting UI (user feedback)

### 14.3 Validation & Safety
- [ ] Add input validation everywhere
- [ ] Prevent negative resources
- [ ] Prevent invalid state transitions
- [ ] Add rate limiting for actions (prevent spam)
- [ ] Add sanity checks for loaded data

---

## Phase 15: Cross-Module Integration

### 15.1 Farm-Core Integration - TEST PHASE
- [ ] Write integration tests:
  - [ ] Test: Farm state updates in game state
  - [ ] Test: Farm events flow through event bus
  - [ ] Test: Farm data saves/loads correctly
  - [ ] Test: Farm resources sync with inventory
  - [ ] Test: Time system affects farm mechanics

### 15.2 Farm-Core Integration - IMPLEMENTATION
- [ ] Create integration layer
  - [ ] Farm state adapter for game state
  - [ ] Farm event handlers in game machine
  - [ ] Resource sync between farm and inventory
- [ ] Implement state synchronization
- [ ] Add integration tests

### 15.3 Combat-Core Integration - TEST PHASE
- [ ] Write integration tests:
  - [ ] Test: Combat state updates in game state
  - [ ] Test: Combat uses zombie data from farm
  - [ ] Test: Combat results update farm state
  - [ ] Test: Combat rewards add to inventory
  - [ ] Test: Zombie deaths remove from farm

### 15.4 Combat-Core Integration - IMPLEMENTATION
- [ ] Create integration layer
  - [ ] Combat state adapter
  - [ ] Combat event handlers
  - [ ] Zombie data bridge (farm -> combat)
  - [ ] Result handler (combat -> farm)
- [ ] Implement state synchronization
- [ ] Add integration tests

### 15.5 Module Communication
- [ ] Define clear module boundaries
- [ ] Create interface contracts
- [ ] Document module interactions
- [ ] Add validation at module boundaries
- [ ] Create integration test suite

---

## Phase 16: Polish & UX Enhancements

### 16.1 Loading & Transitions
- [ ] Create smooth scene transitions
  - [ ] Farm <-> Combat
  - [ ] Menu <-> Game
- [ ] Add loading animations
- [ ] Implement skeleton screens
- [ ] Optimize perceived performance

### 16.2 Feedback & Juice
- [ ] Add visual feedback for all actions
  - [ ] Button press animations
  - [ ] Resource gain/loss animations
  - [ ] Success/failure indicators
- [ ] Add sound feedback
- [ ] Implement particle effects
- [ ] Screen shake for impact

### 16.3 Accessibility
- [ ] Ensure keyboard navigation works
- [ ] Add ARIA labels
- [ ] Ensure color contrast (WCAG AA)
- [ ] Add screen reader support
- [ ] Test with accessibility tools

### 16.4 Responsive Design
- [ ] Test on different screen sizes
- [ ] Adjust UI for mobile (future)
- [ ] Handle window resize gracefully
- [ ] Support min/max window sizes

---

## Phase 17: Documentation

### 17.1 Code Documentation
- [ ] Add JSDoc comments to all public APIs
- [ ] Document complex algorithms
- [ ] Create module READMEs
- [ ] Document architecture decisions

### 17.2 Developer Documentation
- [ ] Update ARCHITECTURE.md with implementation details
- [ ] Document state machine diagram
- [ ] Document event flow
- [ ] Document module interfaces
- [ ] Create troubleshooting guide

### 17.3 User Documentation (Future)
- [ ] Create in-game help system
- [ ] Write player guide
- [ ] Create tutorial tooltips
- [ ] FAQ document

---

## Phase 18: Testing & Quality Assurance

### 18.1 Comprehensive Testing
- [ ] Achieve 80%+ overall code coverage
- [ ] Achieve 100% coverage for critical core logic
- [ ] Write integration tests for all modules
- [ ] Write E2E tests for main flows
- [ ] Performance benchmarks

### 18.2 Cross-Browser Testing
- [ ] Test in Chrome/Edge (Chromium)
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Document browser compatibility

### 18.3 Quality Checks
- [ ] Run ESLint with no errors
- [ ] Run Prettier on all files
- [ ] TypeScript compiles with no errors
- [ ] All tests pass
- [ ] Bundle size within limits

---

## Phase 19: CI/CD & Deployment

### 19.1 Continuous Integration
- [ ] Set up GitHub Actions (or similar)
  - [ ] Run tests on every PR
  - [ ] Run linting on every PR
  - [ ] Check TypeScript compilation
  - [ ] Generate coverage report
  - [ ] Build check
- [ ] Add status badges to README

### 19.2 Deployment Setup
- [ ] Configure production build
  - [ ] Optimize bundle
  - [ ] Minify code
  - [ ] Generate source maps
- [ ] Choose hosting (Vercel, Netlify, GitHub Pages)
- [ ] Set up deployment pipeline
- [ ] Configure custom domain (optional)

### 19.3 Versioning
- [ ] Implement semantic versioning
- [ ] Create CHANGELOG.md
- [ ] Tag releases in Git
- [ ] Create release notes

---

## Future Enhancements (Post-MVP)

- [ ] Analytics integration
- [ ] Error monitoring (Sentry, etc.)
- [ ] Multiplayer infrastructure
- [ ] Cloud save system
- [ ] Account system
- [ ] Leaderboards
- [ ] In-app purchases (if monetizing)
- [ ] Progressive Web App (PWA) support
- [ ] Mobile responsiveness
- [ ] Internationalization (i18n)

---

## Notes

- **Critical Path:** Core must be complete before Farm and Combat can proceed
- **TDD Approach:** Write tests first for all core logic
- **Modularity:** Keep modules loosely coupled via events
- **Documentation:** Keep docs in sync with implementation
- **Performance:** Profile early and often
- **Commits:** Small, frequent, atomic commits
- **Code Review:** Self-review before marking complete
- **Dependencies:** Farm and Combat depend heavily on Core being solid

---

## Current Status

**Phase:** Not started
**Next Task:** Phase 1.1 - Repository & Environment Setup
**Blockers:** None (starting point)
**Priority:** Critical - Must complete Phase 1-7 before other modules can proceed
**Notes:** Core systems provide the foundation for all other features

---

## Dependencies

### Farm Module depends on:
- Phase 3: Game State Architecture
- Phase 4: Event System
- Phase 5: Persistence
- Phase 6: Resource System
- Phase 7: Time System
- Phase 9: UI Components

### Combat Module depends on:
- Phase 3: Game State Architecture
- Phase 4: Event System
- Phase 5: Persistence
- Phase 6: Resource System
- Phase 9: UI Components
- Phase 11: Asset Management (sprites)

### Minimum Viable Core (MVC):
**For Farm to start:** Phases 1-7 must be complete
**For Combat to start:** Phases 1-7 + Phase 11 (basic sprites)

---

## Estimation

- **Phase 1-2:** ~2-3 days (setup and config)
- **Phase 3-5:** ~3-5 days (state management and save system)
- **Phase 6-7:** ~2-3 days (resources and time)
- **Phase 8-9:** ~3-4 days (utilities and UI components)
- **Phase 10-11:** ~2-3 days (audio and assets)
- **Phase 12-14:** ~2-3 days (debugging and error handling)
- **Phase 15:** ~2-3 days (module integration) - *after Farm and Combat exist*
- **Phase 16-19:** ~3-5 days (polish and deployment)

**Total Core Development:** ~20-30 days (not including Farm/Combat integration phase)
