---
title: 'Testing Infrastructure TODO'
module: Testing (test-qa-guardian)
priority: Critical (Foundation)
last updated: 2025-11-12
---

# Testing Infrastructure & Setup TODO

This document tracks all tasks for setting up the testing infrastructure for Zombie Farm. As the test-qa-guardian agent, you are responsible for establishing the testing framework, utilities, and standards that all other modules will use.

**IMPORTANT**: This project follows **Test-Driven Development (TDD)**. The testing infrastructure must be complete before significant feature development can begin.

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked/Needs attention

---

## Phase 1: Core Testing Framework Setup

### 1.1 Jest Installation & Configuration

- [ ] Install Jest and dependencies
  - [ ] `npm install --save-dev jest @jest/globals`
  - [ ] `npm install --save-dev ts-jest`
  - [ ] `npm install --save-dev @types/jest`
- [ ] Create `jest.config.ts`
  - [ ] Configure TypeScript support via ts-jest
  - [ ] Set test environment to `jsdom` for React testing
  - [ ] Configure module name mappings (match tsconfig.json paths)
    - `@features/*` -> `<rootDir>/src/features/*`
    - `@lib/*` -> `<rootDir>/src/lib/*`
    - `@components/*` -> `<rootDir>/src/components/*`
    - `@types/*` -> `<rootDir>/src/types/*`
    - `@assets/*` -> `<rootDir>/src/assets/*`
  - [ ] Set coverage thresholds:
    - Global: 80% (statements, functions, lines, branches)
    - Critical paths: Configure per-directory overrides for 100%
  - [ ] Configure test match patterns: `**/*.test.ts`, `**/*.test.tsx`
  - [ ] Set up coverage directory: `coverage/`
  - [ ] Configure coverage ignore patterns (node_modules, test files, etc.)
- [ ] Create `jest.setup.ts`
  - [ ] Import and configure testing environment
  - [ ] Set up global test utilities
  - [ ] Configure fake timers defaults
  - [ ] Set up cleanup hooks

### 1.2 React Testing Library Setup

- [ ] Install React Testing Library
  - [ ] `npm install --save-dev @testing-library/react`
  - [ ] `npm install --save-dev @testing-library/jest-dom`
  - [ ] `npm install --save-dev @testing-library/user-event`
- [ ] Configure jest-dom matchers
  - [ ] Import `@testing-library/jest-dom` in jest.setup.ts
  - [ ] Extend Jest matchers with DOM assertions
- [ ] Create custom render utilities
  - [ ] `src/lib/test-utils/render.tsx` - Custom render with providers
  - [ ] Support for XState context providers
  - [ ] Support for game state providers
  - [ ] Support for routing (when added)

### 1.3 Test Scripts Configuration

- [ ] Update `package.json` scripts
  - [ ] `"test": "jest"` - Run all tests
  - [ ] `"test:watch": "jest --watch"` - Watch mode
  - [ ] `"test:coverage": "jest --coverage"` - Generate coverage
  - [ ] `"test:ci": "jest --ci --coverage --maxWorkers=2"` - CI mode
  - [ ] `"test:update": "jest --updateSnapshot"` - Update snapshots
  - [ ] `"test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"` - Debug mode
- [ ] Update Husky pre-push hook
  - [ ] Uncomment `npm run test` in `.husky/pre-push`
  - [ ] Ensure tests run before push (after tests are stable)

---

## Phase 2: Test Utilities & Helpers

### 2.1 Test Data Factories

- [ ] Create `src/lib/test-utils/factories/` directory
- [ ] Implement factory functions:
  - [ ] `createTestGameState()` - Generate valid GameState
  - [ ] `createTestPlayer()` - Generate Player with configurable level/XP
  - [ ] `createTestZombie()` - Generate zombie with stats
  - [ ] `createTestEnemy()` - Generate enemy unit
  - [ ] `createTestInventory()` - Generate inventory with resources
  - [ ] `createTestFarmState()` - Generate farm state
  - [ ] `createTestCombatState()` - Generate combat state
- [ ] Use builder pattern for flexibility
  - Example: `createTestZombie({ attack: 50, hp: 100 })`
- [ ] Export all factories from `src/lib/test-utils/index.ts`

### 2.2 Test Fixtures & Constants

- [ ] Create `src/lib/test-utils/fixtures.ts`
  - [ ] `TEST_GAME_STATE` - Baseline game state
  - [ ] `TEST_FARM` - Standard farm setup
  - [ ] `TEST_INVENTORY` - Standard starting inventory
  - [ ] `TEST_ZOMBIE_TYPES` - Sample zombie configurations
  - [ ] `TEST_ENEMY_TYPES` - Sample enemy configurations
- [ ] Create `src/lib/test-utils/constants.ts`
  - [ ] Test-specific constants (fast timers for testing, etc.)
  - [ ] Mock IDs and UUIDs
  - [ ] Standard test values (to ensure consistency)

### 2.3 Mock Utilities

- [ ] Create `src/lib/test-utils/mocks/` directory
- [ ] Implement common mocks:
  - [ ] `mockLocalStorage.ts` - Mock localStorage API
  - [ ] `mockTimers.ts` - Utilities for Jest fake timers
  - [ ] `mockRandom.ts` - Deterministic random number generation
  - [ ] `mockPhaser.ts` - Mock Phaser objects (for when Phaser is added)
  - [ ] `mockXState.ts` - XState testing utilities (when XState is added)
- [ ] Create setup/teardown helpers
  - [ ] `setupTest()` - Common test initialization
  - [ ] `cleanupTest()` - Reset mocks and state

### 2.4 Custom Matchers

- [ ] Create `src/lib/test-utils/matchers.ts`
- [ ] Implement game-specific Jest matchers:
  - [ ] `toHaveResource(resource, amount)` - Check inventory
  - [ ] `toBeInState(stateName)` - Check state machine state
  - [ ] `toHaveZombie(zombieId)` - Check zombie exists
  - [ ] `toHaveStats(stats)` - Verify zombie/enemy stats
- [ ] Extend Jest expect with custom matchers

---

## Phase 3: Test Organization & Standards

### 3.1 Test Directory Structure

- [ ] Document test file organization standards
  - [ ] Co-locate tests with code: `feature/module.test.ts`
  - [ ] OR use `__tests__/` subdirectories for complex modules
  - [ ] Naming convention: `*.test.ts` for unit, `*.integration.test.ts` for integration
- [ ] Create test directory structure examples
  ```
  src/
  ├── features/
  │   ├── game/
  │   │   ├── gameMachine.ts
  │   │   ├── gameMachine.test.ts
  │   │   └── __tests__/
  │   │       └── integration/
  │   │           └── gameFlow.integration.test.ts
  ```

### 3.2 Testing Standards Documentation

- [ ] Create `src/lib/test-utils/README.md`
  - [ ] How to write tests (AAA pattern: Arrange, Act, Assert)
  - [ ] How to use test utilities and factories
  - [ ] When to use unit vs integration tests
  - [ ] Best practices for React component testing
  - [ ] Best practices for state machine testing
- [ ] Document coverage requirements
  - [ ] Critical code: 100% (farm logic, combat calculations)
  - [ ] Overall: 80%+
  - [ ] UI: Meaningful tests, not just snapshots

### 3.3 Example Tests

- [ ] Create example test files as templates:
  - [ ] `src/lib/test-utils/examples/unit.test.example.ts`
    - Pure function testing
    - Using factories and fixtures
    - Mocking dependencies
  - [ ] `src/lib/test-utils/examples/component.test.example.tsx`
    - Rendering components
    - User interactions (clicks, typing)
    - Assertions with jest-dom
  - [ ] `src/lib/test-utils/examples/integration.test.example.ts`
    - Multi-step workflows
    - State machine interactions
    - Event dispatching
- [ ] Include comprehensive comments explaining patterns

---

## Phase 4: Smoke Tests & Validation

### 4.1 Initial Smoke Tests

- [ ] Create `src/App.test.tsx` (when App component exists)
  - [ ] Test that App component renders without crashing
  - [ ] Test basic mount/unmount lifecycle
- [ ] Create infrastructure smoke tests
  - [ ] `src/lib/test-utils/setup.test.ts` - Verify test setup works
  - [ ] Test that custom matchers work
  - [ ] Test that factories produce valid data
  - [ ] Test that mocks can be imported

### 4.2 Test Configuration Validation

- [ ] Verify path aliases work in tests
  - [ ] Import from `@features/*`
  - [ ] Import from `@lib/*`
  - [ ] Import from `@components/*`
- [ ] Verify coverage reporting works
  - [ ] Run `npm run test:coverage`
  - [ ] Check that `coverage/` directory is created
  - [ ] Verify HTML report is generated
- [ ] Verify CI mode works
  - [ ] Run `npm run test:ci`
  - [ ] Check that tests run in CI mode without hanging

---

## Phase 5: Advanced Testing Tools

### 5.1 Integration Testing Helpers

- [ ] Create `src/lib/test-utils/integration/` directory
- [ ] Build integration test utilities:
  - [ ] `runGameScenario()` - Execute multi-step game flows
  - [ ] `advanceGameTime()` - Simulate time progression
  - [ ] `dispatchGameEvent()` - Send events to state machine
  - [ ] `waitForStateTransition()` - Async state change helpers
- [ ] Create scenario templates
  - [ ] Plant-harvest-combat flow
  - [ ] Day/night cycle with decay
  - [ ] Resource gathering and spending

### 5.2 Performance Testing (Future)

- [ ] Research performance testing tools
  - [ ] Consider `@testing-library/react-hooks` for hook performance
  - [ ] Consider custom timers for large state updates
- [ ] Create benchmarks for critical paths
  - [ ] State update performance
  - [ ] Combat calculation performance
  - [ ] Rendering performance

### 5.3 Snapshot Testing (Limited Use)

- [ ] Document when to use snapshots
  - [ ] Only for simple, stable components
  - [ ] Never for complex UI or dynamic content
  - [ ] Prefer explicit assertions
- [ ] Create snapshot update workflow
  - [ ] Review changes before updating
  - [ ] Document why snapshots changed

---

## Phase 6: Testing for Specific Modules

### 6.1 Core Module Testing Support

- [ ] Provide test utilities for Core module:
  - [ ] State machine test helpers
  - [ ] Event bus test utilities
  - [ ] Save/load test mocks
  - [ ] Time system test utilities
- [ ] Create Core-specific fixtures
  - [ ] Default game state
  - [ ] Resource inventories
  - [ ] Time configurations

### 6.2 Farm Module Testing Support

- [ ] Provide test utilities for Farm module:
  - [ ] Zombie lifecycle test helpers
  - [ ] Growth timer utilities
  - [ ] Decay calculation test data
  - [ ] Farm state assertions
- [ ] Create Farm-specific fixtures
  - [ ] Planted zombies at various stages
  - [ ] Active zombies with different stats
  - [ ] Farm buildings and structures

### 6.3 Combat Module Testing Support

- [ ] Provide test utilities for Combat module:
  - [ ] Battle simulation helpers
  - [ ] Damage calculation test data
  - [ ] AI behavior test utilities
  - [ ] Combat outcome assertions
- [ ] Create Combat-specific fixtures
  - [ ] Standard squads (zombies)
  - [ ] Standard enemy waves
  - [ ] Battle states at various stages

---

## Phase 7: Continuous Integration & Quality

### 7.1 Coverage Monitoring

- [ ] Set up coverage thresholds in jest.config.ts
  - [ ] Fail build if coverage drops below 80%
  - [ ] Per-directory thresholds for critical code
- [ ] Generate coverage reports
  - [ ] HTML report for local viewing
  - [ ] LCOV format for CI integration (future)
- [ ] Document coverage gaps
  - [ ] Track which files are under-covered
  - [ ] Create issues/tasks for missing tests

### 7.2 Test Documentation

- [ ] Maintain test documentation
  - [ ] Update META/TESTING.md as standards evolve
  - [ ] Document common test patterns
  - [ ] Document pitfalls and gotchas
- [ ] Create testing guidelines for developers
  - [ ] When to write unit vs integration tests
  - [ ] How to test state machines
  - [ ] How to test React components
  - [ ] How to test async behavior

### 7.3 Test Maintenance

- [ ] Create test review checklist
  - [ ] Tests are clear and well-named
  - [ ] Tests are independent (no shared state)
  - [ ] Tests use appropriate assertions
  - [ ] Tests are fast (no unnecessary delays)
  - [ ] Tests are deterministic (no flakiness)
- [ ] Monitor test performance
  - [ ] Identify slow tests
  - [ ] Refactor or parallelize as needed

---

## Phase 8: Special Testing Scenarios

### 8.1 Phaser Testing (When Phaser is Added)

- [ ] Research Phaser testing strategies
  - [ ] Mock Phaser scenes in unit tests
  - [ ] Test Phaser integration points
  - [ ] Avoid running full Phaser game loop in tests
- [ ] Create Phaser test utilities
  - [ ] Mock scene creation
  - [ ] Mock game object creation
  - [ ] Spy on Phaser method calls

### 8.2 XState Testing (When XState is Added)

- [ ] Install XState testing utilities
  - [ ] `@xstate/test` for model-based testing (optional)
- [ ] Create state machine test helpers
  - [ ] Test state transitions
  - [ ] Test context updates
  - [ ] Test guards and actions
  - [ ] Test event handling
- [ ] Create state machine fixtures
  - [ ] Machines at various states
  - [ ] Machines with specific contexts

### 8.3 Async & Timer Testing

- [ ] Document fake timer usage
  - [ ] `jest.useFakeTimers()`
  - [ ] `jest.advanceTimersByTime()`
  - [ ] `jest.runAllTimers()`
- [ ] Create timer test utilities
  - [ ] `advanceTime(ms)` wrapper
  - [ ] `waitForNextTick()` helper
  - [ ] `flushPromises()` helper
- [ ] Test offline progress calculations
  - [ ] Mock current time
  - [ ] Calculate elapsed time
  - [ ] Verify state updates

---

## Phase 9: Test Quality & Debugging

### 9.1 Test Debugging Tools

- [ ] Document debugging strategies
  - [ ] Using `test.only()` to isolate tests
  - [ ] Using `console.log()` in tests
  - [ ] Using VS Code debugger with Jest
  - [ ] Using `screen.debug()` in RTL
- [ ] Create debugging utilities
  - [ ] `printGameState()` - Pretty-print state
  - [ ] `logEvents()` - Log event dispatches
  - [ ] `traceStateChanges()` - Track state transitions

### 9.2 Flaky Test Prevention

- [ ] Document causes of flakiness
  - [ ] Shared mutable state
  - [ ] Timing issues (real timers, async)
  - [ ] Random number generation
  - [ ] External dependencies
- [ ] Create anti-flakiness patterns
  - [ ] Always use fake timers for time-dependent code
  - [ ] Always seed random generators in tests
  - [ ] Always clean up after each test
  - [ ] Always mock external dependencies

### 9.3 Test Code Quality

- [ ] Lint test files
  - [ ] Include test files in ESLint
  - [ ] Add test-specific ESLint rules
- [ ] Apply same code standards to tests
  - [ ] TypeScript strict mode
  - [ ] Proper types for test data
  - [ ] Descriptive variable names
  - [ ] Comments for complex test logic

---

## Deliverables Checklist

By the end of this TODO, the following should be complete:

- [ ] ✅ Jest fully configured and working
- [ ] ✅ React Testing Library set up and integrated
- [ ] ✅ Test utilities and factories available
- [ ] ✅ Custom matchers implemented
- [ ] ✅ Mock utilities created
- [ ] ✅ Test scripts in package.json working
- [ ] ✅ Smoke tests passing
- [ ] ✅ Coverage reporting functional
- [ ] ✅ Test documentation complete
- [ ] ✅ Example tests created as templates
- [ ] ✅ Pre-push hook running tests (when stable)

---

## Dependencies

**This testing infrastructure is required before:**

- Farm module can write meaningful tests
- Combat module can write meaningful tests
- Core module can write state machine tests
- UI components can be tested

**Blocks:**

- Phase 3-7 of TODO-CORE.md (requires test infrastructure)
- Phase 2+ of TODO-FARM.md (requires test utilities)
- Phase 2+ of TODO-COMBAT.md (requires test utilities)

---

## Notes for test-qa-guardian Agent

### Your Role:

You are responsible for:

1. Setting up the entire testing infrastructure
2. Creating reusable test utilities
3. Establishing testing standards
4. Writing example tests
5. Documenting testing best practices
6. Ensuring tests are fast, reliable, and meaningful

### Best Practices:

1. **Keep tests fast**: Avoid real timers, real network calls, real file I/O
2. **Keep tests isolated**: Each test should be independent
3. **Keep tests deterministic**: No random behavior (seed RNGs)
4. **Keep tests readable**: Clear names, good assertions, minimal setup
5. **Keep tests maintainable**: Use factories and utilities, avoid duplication

### Testing Philosophy:

- **Test behavior, not implementation**: Focus on what users/systems observe
- **Test critical paths thoroughly**: 100% coverage for game logic
- **Test edge cases**: Boundary conditions, error states, empty states
- **Test integrations**: Ensure modules work together
- **Don't over-test**: Avoid testing framework code or trivial getters/setters

### Integration with TDD Workflow:

1. Other agents will request test cases for features
2. You provide comprehensive test scenarios (Red phase)
3. Tests should fail initially (no implementation yet)
4. Implementation agents write code to pass tests (Green phase)
5. Refactoring keeps tests passing (Blue phase)

### Communication:

- When providing test cases, explain the scenarios being tested
- Document any test utilities or patterns you create
- Notify other agents when testing infrastructure is ready
- Help debug test failures when needed

---

## Current Status

**Phase:** Not started
**Priority:** Critical - Must complete before Core Phase 3
**Blockers:** None (can start immediately)
**Next Steps:**

1. Install Jest and dependencies
2. Create jest.config.ts
3. Set up React Testing Library
4. Create basic test utilities

---

## Success Criteria

Testing infrastructure is complete when:

1. ✅ All test scripts run successfully
2. ✅ Coverage reports generate correctly
3. ✅ Test utilities are documented and functional
4. ✅ Example tests demonstrate all patterns
5. ✅ Other agents can write tests using the infrastructure
6. ✅ Pre-commit/pre-push hooks work with tests
7. ✅ Tests run in under 30 seconds (for initial suite)

---

**Remember**: Quality testing infrastructure is the foundation of a maintainable codebase. Take the time to do this right, and all future development will be faster and more reliable.
