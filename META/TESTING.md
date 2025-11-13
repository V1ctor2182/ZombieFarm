
**META-TESTING.md**  
```markdown
---
title: "Zombie Farm - Testing Standards"
last updated: 2025-11-12
author: Claude (AI Assistant)
---

# Testing Standards

## Overview
This document outlines the standards and best practices for testing the Zombie Farm codebase. Following a **Test-Driven Development (TDD)** approach, we write tests for new features and bug fixes early and ensure high coverage of critical game logic. The goals are to catch regressions, validate game mechanics, and provide living documentation of expected behavior.

We use **Jest** as the test runner and assertion library, along with **React Testing Library (RTL)** for component tests. All tests should be written in **TypeScript** and live alongside the code they validate (either in a `__tests__` subdirectory or as `*.test.ts(x)` files next to the implementation files).

## Tools and Setup
- **Jest**: Our primary testing framework for unit and integration tests. It provides a JSDOM environment for simulating browser behavior and a rich API for assertions and mocks.
- **React Testing Library (RTL)**: Used for rendering components in tests and interacting with them (simulating clicks, typing, etc.) in a way that reflects real user usage. RTL encourages testing UI via public interactions and content, not internal component state.
- **Jest Dom Matchers**: We include `@testing-library/jest-dom` for convenient assertions on DOM nodes (e.g. `.toBeVisible()`, `.toHaveTextContent()`).
- **Test Utilities**: The project provides helpers like `TEST_FARM` state fixtures or factory functions to create common game state setups. Use these to reduce boilerplate when writing tests. (For example, a `TEST_FARM` object might represent a baseline farm with default values that can be spread into tests.)

Before running tests, ensure:
- All modules compile (TypeScript types are correct).
- Jest config (if any custom setup) is updated for any new file paths (e.g. if using path aliases, ensure `moduleNameMapper` in jest.config matches).
- For React components, a jest setup file may import RTL and extend expect with `jest-dom`.

## Test Structure and Naming
Tests should be organized and named clearly:
- **File Naming**: Name test files after the unit under test. For example, the farm event handler `spawnZombie.ts` should have tests in `spawnZombie.test.ts` (or in `events/__tests__/spawnZombie.test.ts`). This makes it easy to locate tests for a given feature.
- **Describe Blocks**: Use `describe` blocks to group related tests by module or function. For instance:
  ```typescript
  describe("spawnZombie", () => {
    it("spawns a zombie in an empty plot", () => { ... });
    it("fails if no seed is available", () => { ... });
  });
Grouping: If a complex function has multiple scenarios (e.g., success vs failure), use nested describe or at least separate it cases for each scenario. This yields more granular test results.
What to Test
Focus on testing game logic, critical behaviors, and user-facing outcomes:
Domain Logic: All core mechanics should have unit tests. For example, the farming module’s planting and harvesting functions, the decay system (e.g. zombie stats lowering if not fed), and the combat damage calculation should be thoroughly tested. Each game rule defined in the design (e.g. “zombies lose 1% stats per day unfed”) should have a corresponding test to ensure it’s correctly implemented.
Edge Cases: Consider boundary conditions. Test cases like “no seeds in inventory”, “zombie cap reached when harvesting” or “combat with an empty enemy wave” ensure the game handles these gracefully (often yielding some error message or alternative outcome).
UI Components: Use RTL to test that important UI components render and behave correctly given certain states. For example, test that the FarmHUD displays the correct resource counts, or that clicking the “Feed” button on a zombie calls the feed action and results in a UI update (happiness icon appears, etc.).
Test interactive components by simulating events: e.g., Arrange: render the component with initial props/state; Act: perform a click or input using userEvent or fireEvent; Assert: check that the expected element appears or the callback was called.
Verify conditional rendering: if a component should show a special indicator when a zombie is at 0 happiness, you can render it with that state and assert the indicator is in the document.
Integration Scenarios: In addition to unit tests for individual functions or components, write integration tests that cover a sequence of actions or a full game loop in a controlled environment. For instance, simulate a mini gameplay sequence: plant a seed, advance time until growth, harvest the zombie, then send it into combat, and verify the final outcomes (zombie count, resources gained, etc.). These can use the game’s state machine or services directly to step through a scenario. Integration tests ensure that multiple systems work together as expected.
Regression Tests: If a bug is found (e.g., feeding a zombie at max happiness causes an error), first write a test that reproduces the bug, then fix the code. The test then serves to prevent that bug from reoccurring.
Importantly, tests should cover expected gameplay behaviors rather than implementation details. For example, rather than testing “internal property X is set to 5”, test the outcome that a player or another system would observe (e.g., “zombie’s health is increased to 5” or “the UI now shows 5/5 HP”). This ensures refactoring the internal code won’t break tests as long as the outward behavior remains correct.
Mocking and Test Isolation
Use mocks and stubs to isolate units of code and control the test environment, but do so judiciously:
Mocking External Modules: If a module depends on something like the browser LocalStorage or a random number generator, you should mock those in tests. For instance, use Jest’s jest.spyOn or jest.fn() to stub random number generation to a fixed value when testing mutation chances, so tests are deterministic.
Time-dependent Logic: For features like zombie growth timers or decay over time, use fake timers (jest.useFakeTimers()). This allows you to simulate days passing or growth completion instantly in tests. Always reset or clear timers to avoid affecting other tests.
Phaser and Canvas: We do not run a full Phaser game loop in unit tests. Instead, abstract any game engine calls behind interfaces if possible. For example, if there’s a function startBattle() that normally kicks off a Phaser scene, in a test we might spy on that call or use a no-op implementation. We trust Phaser’s own functionality; our tests focus on whether we invoke it under the right conditions. RTL can still render components containing a <canvas> to ensure they mount, but we won't simulate actual rendering.
API Calls and Network: Currently the game is offline, but if any module did have asynchronous operations (e.g., loading something), use Jest mocks or msw (Mock Service Worker) to simulate responses. Ensure tests don’t make real HTTP calls.
Spying on Events: In integration tests using the XState state machine or context, you can spy on event dispatches or subscribe to state changes. This can verify, for example, that a zombie.harvested event is dispatched after a harvest action. The XState interpreter can be started in tests and you can send events to it and assert on the resulting state context.
Each unit test should ideally be independent of others: avoid reusing global mutable state across tests. Reset or recreate fresh state for each test (using utility functions to generate baseline farm state, etc.). Jest runs tests in isolation, but if using any global objects (like modifying Date.now or similar), restore them after each test (afterEach cleanup).
Coverage Goals
We aim for a high level of test coverage:
Critical Code: Core game logic (the content of the Farm and Combat domain rules) should be close to 100% covered by tests. This includes all functions that calculate outcomes (damage, resource yields, growth progression, etc.).
Overall: The project should maintain at least 80% coverage across statements, functions, and lines. Coverage reports are generated with Jest (--coverage) to track this. While 100% coverage is not required, any significant new code should include corresponding tests.
UI Coverage: We focus on meaningful UI tests rather than snapshot tests. If using snapshots (for component output), do so sparingly and only for simple components where the snapshot is stable. Otherwise, prefer explicit assertions (e.g., “renders zombie name”, “button is disabled when no seeds” etc.).
Coverage is a guide, not an absolute—it's more important to cover all scenarios than to chase a number. However, if coverage drops below our target, add tests to fill gaps (this might happen when new features are added without tests or a lot of refactoring is done).
Testing Examples
Here are a few examples of how tests align with game scenarios:
Zombie Growth (Farm logic): Test that planting a seed creates a growing zombie and that after the growth duration the state marks the zombie as ready. This might involve simulating time: e.g., use fake timers to advance the growth timer and then assert the zombie’s status changed to readyToHarvest.
Decay and Feeding (Farm logic): Set up a zombie with 100% stats, then simulate one day without feeding (perhaps by calling a progressDay() function or directly invoking the decay calculation) and assert the stats dropped (e.g., to 99% if 1% decay). Then test that feeding the zombie resets or slows the decay (the stats remain higher or decay is prevented on that day).
Combat Damage Calculation (Combat logic): Create two mock unit objects (a zombie and a human) with known attack/defense values. Run them through a damage resolution function to ensure that damage is calculated correctly (e.g., physical damage reduced by armor, holy damage double on undead, etc.). Test various damage types and their effects (poison applying a DOT, fire spreading, etc.) to ensure the formulas match design specs.
UI Flow (Integration): Render the main game component or a relevant slice (maybe a <FarmScreen /> component). Simulate the user flow of planting and harvesting via the UI:
Click "Plant" button on an empty plot (RTL find by role or text, then userEvent.click).
Expect a seed selection modal or confirmation appears.
Choose a seed (simulate selecting an option and confirming).
Advance time (maybe call a function in context or trigger the growth complete event).
Verify the UI now shows a zombie ready to harvest (e.g., an icon or button on the plot).
Click the harvest button, and verify that the zombie count in the HUD increased by one and the plot is empty again.
This kind of test ensures the integration of multiple components with game state works correctly. Such end-to-end simulations in a test environment complement our unit tests for each component and logic unit.
Continuous Testing Practice
Run tests frequently, ideally on every significant code change. Use npm run test -- --watch during development to run tests on changed files.
All tests must pass before a PR (or code integration) is merged. Our CI pipeline will run the full test suite (and coverage) on each commit.
When adding new features, follow the TDD mantra: write a test, see it fail, then write code to make it pass. This ensures you define the expected behavior upfront.
Keep tests up to date with code changes. If game rules change (e.g., we alter the decay rate or add a new zombie type), update or add tests to reflect the new expectations.
Pay attention to test failure messages – they should be descriptive. A good test name and clear assertions mean that when something breaks, the failing test will immediately hint at what went wrong.
By adhering to these standards, we ensure the reliability of Zombie Farm as it evolves. The test suite will catch unintended side effects and guard the game design rules (from the PRD) against regressions. Remember: tests are part of the development process, not an afterthought – they help design the code and provide confidence to refactor and improve the game continuously.