---
title: "Zombie Farm - Development Workflow"
last updated: 2025-11-12
author: Solo Dev
---

# Development Workflow

This guide describes how the solo developer and the Claude AI sub-agents collaborate in a test-driven, iterative development process. The workflow ensures that new features are implemented with minimal bugs, that code and documentation stay in sync, and that the project progresses in manageable increments.

The core principles of our workflow are:
- **Test-Driven Development (TDD):** Write tests for new features or bug fixes first, then write code to fulfill those tests.
- **Modular Development with AI Agents:** Use specialized AI coding agents (Claude sub-agents) for different aspects (testing, architecture, UI, farm logic, combat logic) to speed up development, while the Solo Dev provides guidance, integration, and final review.
- **Frequent Commits & Updates:** Make small, incremental changes with frequent commits. Keep documentation and code aligned by updating docs when behavior changes.

## Roles of AI Sub-Agents
We have several Claude AI sub-agents, each focused on a domain or task:
- **Architecture Agent:** Helps design high-level structure or refactor large portions. The Solo Dev consults this agent when planning new modules or reorganizing code for clarity and performance.
- **Test Agent:** Assists in generating comprehensive test cases and scenarios. The dev might use it to draft initial tests for a new feature or edge cases that might be overlooked. It ensures we maintain consistency in test style (as per META-TESTING standards).
- **UI/UX Agent:** Responsible for implementing UI components or styling according to our design guidelines (META-UI-UX). The dev can describe the desired interface or provide a wireframe, and this agent will produce the corresponding React components and CSS.
- **Farm Domain Agent:** Focuses on game logic related to farming (zombie lifecycle, resources, etc.), implementing features as specified in the farm domain rules (META-DOMAIN-FARM). The dev uses this agent when a farming mechanic needs coding – for example, planting logic, decay effects, etc.
- **Combat Domain Agent:** Similar to Farm agent, but for combat mechanics. When combat logic (battle system, damage calculation, AI behaviors defined in META-DOMAIN-COMBAT) needs implementation, the dev calls on this agent.
- *(If needed, other agents can be spun up, e.g. a “Documentation Agent” for help updating docs, but primarily the above cover our needs.)*

The Solo Dev orchestrates all these agents. They are not used autonomously; the developer decides **when and how to invoke** each, providing requirements and reviewing outputs.

## Test-Driven Development Cycle
1. **Start with Requirements:** For a new feature or change, clarify what is needed. This comes from the design documentation or a specific game design requirement. For example, “Zombies should lose happiness if not fed within 24 hours” (referenced in design docs).
2. **Write a Test (Red Stage):** The developer writes one or more Jest test cases capturing the expected behavior. If it’s a new feature, the test will initially fail (red). For instance, write a test that creates a zombie, does not feed it for a day, calls the daily update function, and expects the zombie’s happiness to decrease. Use the standards from META-TESTING (clear naming, AAA pattern). If the feature is complex, write multiple tests for different scenarios (normal case, edge cases, error conditions).
3. **Run Tests & See Failures:** Confirm that the new tests indeed fail (or even won’t compile if the functionality doesn’t exist yet). This validates that the test is correctly catching the absence of the feature.
4. **Implement with Agents (Green Stage):** Decide which agent to involve for implementation:
   - If the feature is primarily logic (no UI), use the Farm or Combat agent accordingly. Provide the agent with context: the relevant domain rules or acceptance criteria, and sometimes the failing test message or pseudo-code approach.
   - If the feature involves UI, coordinate between UI agent and domain agents. For example, to add a “Feed” button that calls a feedZombie action: the UI agent would create the button component and hook, while the Farm agent implements the feedZombie logic.
   - Always supply the agent with clear guidance derived from the design: e.g., “According to META-DOMAIN-FARM, feeding a zombie resets its decay for the day and boosts happiness. Implement a function feedZombie(zombieId) that applies these effects.”
   - The agent returns code (or a diff) which the Solo Dev then integrates into the codebase. The developer reviews this code carefully, making minor adjustments if needed (e.g., fixing small typos or ensuring style consistency).
5. **Run Tests Again:** Execute the test suite. Ideally, the previously failing tests now pass (green). If they don’t:
   - Analyze the failures. Perhaps the implementation missed a detail or the test expectations were off.
   - Decide whether to fix code or adjust the test. Generally, if the test was based on confirmed design rules, the code should be fixed. Use the relevant agent (or do a small manual fix) to correct the logic.
   - Re-run until tests pass.
6. **Refactor (Blue Stage):** With tests green, optionally refactor the new code for clarity or efficiency. The Architecture agent can assist if it’s a larger design refactor. Ensure tests still pass after refactoring. For example, if a piece of logic is duplicated between farm and combat, the Architecture agent might suggest a utility function to DRY it up. Write tests for the new utility if needed and integrate it.
7. **Commit Changes:** Commit the code to version control with a descriptive message. We use conventional commit style, e.g. `feat(farm): implement zombie feeding mechanic` or `fix(combat): correct damage calculation formula`. Frequent, small commits are preferred.
8. **Update Documentation:** If the feature affects any documentation (design or technical):
   - Update the relevant META document. In our example, if “feeding” was newly implemented but already documented in META-DOMAIN-FARM, ensure the implementation matches the doc. If the implementation revealed a need for adjustment (perhaps the decay reset works slightly differently), update the doc to reflect reality, keeping it consistent with the code.
   - If new terms or mechanics were introduced, add them to META-GLOSSARY. For instance, if we added a concept of “Overfeeding” as a mechanic, document its meaning.
   - We treat documentation as part of the codebase – changes to code and docs should go hand-in-hand. Often the Solo Dev will do doc updates manually, but can leverage the Documentation agent or even Test agent to verify all requirements are met.

This red-green-refactor cycle is the core of every task, whether adding features or fixing bugs.

## Using Agents Effectively
Knowing when to call each agent is key:
- **Architecture Agent Usage:** Invoke this agent at the start of a major feature for design planning, or during refactoring. For example, when starting the Combat module, the dev asked the Architecture agent to outline how to structure the combat system within the project (ensuring it fits with the farm and core systems). The agent might provide a scaffold or suggestions for module APIs. Another use is when performance issues arise; the agent can propose optimizations (e.g., how to handle 100 zombies on farm without lag).
- **During Implementation:** The dev doesn't blindly rely on agents—each agent’s output is reviewed. Agents excel at boilerplate and following patterns, which the dev ensures align with our project. For instance:
  - After the Test agent generates tests for a new scenario, the dev double-checks that these tests indeed reflect the PRD’s intent and aren’t testing irrelevant things.
  - If the UI agent creates a component, the dev will open the game and ensure it visually looks right and behaves (sometimes adjusting CSS or minor details that are easier to fine-tune manually).
- **Parallel Development:** Because the dev is solo, agents allow a form of parallelization. While the Farm agent works on logic, the dev might simultaneously prompt the UI agent to build the interface for that logic. However, to avoid confusion, it’s often best to iterate in small steps (complete the logic, then the UI, or vice versa, rather than both at once).
- **Communication Between Agents:** The Solo Dev acts as the mediator. If an output from one agent affects another (e.g., the farm logic defines a data structure that the UI needs to display), the dev ensures the UI agent is given the updated data contract. Agents are not aware of each other’s work in real-time, so the dev must feed outputs from one to another when necessary. For example, “UI Agent, here is the shape of data the Farm agent just created for zombie status. Create a component to display this.”

## Handling Failing Tests and Bugs
Despite our best efforts, tests will fail and bugs will be discovered. Here’s the approach:
- **Test Fails During Dev:** If a test fails immediately after an agent’s implementation:
  - Read the error message and stack trace. Identify if it’s a logic error, a simple syntax mistake, or a misunderstanding of requirements.
  - If it’s a minor issue (like a typo or an off-by-one), the Solo Dev often can correct it faster directly in code. For more complex logic fixes, inform the same agent of the failure and the expected vs actual behavior. For example, “The decayRate was supposed to be 1% but the test shows 0.1% effect; adjust the formula.”
  - Re-run tests after fixes. Repeat if new issues surface.
- **Regression Bugs:** If a bug is found later (through playtesting or new tests), first reproduce it in a test if possible. This might involve writing a new test that currently fails because of the bug (red). Then engage the appropriate agent with the context of that failing test. The agent can propose a fix which the dev applies. Confirm the test passes (green) and that no other tests broke (to ensure the fix didn’t introduce side-effects).
- **Debugging with Agents:** Sometimes understanding *why* something failed is tricky. The dev can ask an agent to analyze a small snippet or error. For instance, “Given this code and this test, why might the output be null?” The agent can often pinpoint overlooked conditions. However, final judgment lies with the dev – the agent is a helper, not an oracle.
- **Prioritizing Fixes:** Maintain a backlog of known issues. Critical bugs (crashes, incorrect game math) get immediate attention in the next development cycle. Less critical ones might be scheduled. But importantly, no test should remain failing; a failing test is either fixed or, if the test itself was wrong or obsolete, updated.

## Documentation and Source Control
We maintain all project artifacts in a Git repository (code, tests, docs, assets):
- **Branching Strategy:** As a solo developer, a simple git flow is used. The `main` branch always contains the latest stable features that pass all tests. For major features or risky changes, the dev may create a feature branch (e.g., `feature/combat-system`) to work in isolation with agents, then merge to main when done. Often, though, the TDD approach and small commits allow working directly on main or a short-lived branch.
- **Commits:** Commit messages should be descriptive as mentioned. We group changes logically: for example, adding a feed mechanic touches logic, UI, and tests – those can be one commit or a few small commits if developed incrementally (one for tests added, one for logic, one for UI, etc.). The aim is that any commit on main should pass all tests (we avoid “breaking” main, given tests act as a gatekeeper).
- **Versioning:** We tag releases or major milestones with version numbers (v0.1, v0.2, etc.). Since the game is in development and not yet at 1.0, these tags mainly mark playable increments or demo builds. Semantic versioning is used once we have public releases (major.minor.patch), but during rapid development, we might simply increment minor versions for each significant feature set completed.
- **Continuous Integration (CI):** In a future state, we plan to set up a CI pipeline that runs the test suite on each push. This ensures no code from an agent (or manual change) breaks existing functionality. Until then, the Solo Dev manually runs the full test suite regularly (at least before each push).
- **Documentation Updates:** Documentation lives alongside code in the repo (for example, the `docs/` directory contains these META files). Any commit that implements a feature should ideally include updates to relevant docs. We treat missing doc updates as “incomplete feature.” The dev occasionally does a documentation sweep: re-reading META-DOMAIN and META-ARCHITECTURE docs to ensure they still accurately describe the code. If any drift is found, update the docs immediately or create a task for it.
- **Pull Requests (PRs):** If the project involves PRs (even as self-review), the Solo Dev uses them to review sets of changes together. The PR description references the design requirements (e.g., “Implements feature X as per design – enabling ranged attack for new zombie”). Even as a solo dev, this practice helps maintain discipline and record rationale for changes.

## Example Workflow Scenarios

To illustrate, here are two example development flows:

**Feature Implementation Example – Adding a New Zombie Type**:
1. **Plan:** The PRD defines a new zombie type “Spitter” with a ranged attack. The Solo Dev reads the design details to understand requirements (e.g., it should attack from a distance with acid spit, but have low HP).
2. **Design Tests:** Write tests for key behaviors: e.g., `it("Spitter zombie attacks from range without taking return damage until engaged")` and scenarios for its effect (does its acid attack apply poison DoT?). These tests likely use the combat simulation at a small scale (one Spitter vs one enemy) to verify ranged logic.
3. **Domain Logic:** Call the Combat Domain agent to implement the Spitter’s combat behavior. Input to agent: "Implement new ZombieType 'Spitter' with ranged attack per design (acid spit that deals toxic damage, range X). Ensure it targets enemies from distance and only takes damage once enemies close the gap." The agent produces code updating relevant data structures (zombie stats, range property) and adding logic in the AI for ranged targeting.
4. **Assets and UI:** Coordinate with UI/UX agent: add a new icon for Spitter in the squad selection UI and HUD. Provide a placeholder graphic if needed. The UI agent updates the selection menu to include Spitter (with its cost, etc.). Also ensure an acid spit projectile or effect is represented (we might have the combat agent use an existing projectile sprite or simple particle).
5. **Integration:** Manually integrate any art assets (sprite for Spitter, projectile sprite). Run the game to visually verify that the Spitter can be selected for battle and appears in combat.
6. **Test & Iterate:** Run tests – suppose an issue arises that the Spitter’s damage was not applied because the combat loop didn’t include ranged hits properly. Fix by adjusting the combat simulation (e.g., allow ranged units to inflict damage from their max range). Re-run tests until all pass, and perhaps do a quick manual combat to see the Spitter in action.
7. **Docs:** Update META-DOMAIN-COMBAT to list the new Spitter type and its rules (range, damage type, etc.). Update META-GLOSSARY with “Spitter” definition. Commit with message `feat(combat): add Spitter zombie type with ranged attack`.

**Bug Fix Example – Zombie Not Saving Happiness**:
1. **Identify Issue:** During playtesting, the dev notices that zombie happiness resets to 100% on game reload, even if it was lower before – indicating the happiness wasn’t saved. A bug is filed.
2. **Write Regression Test:** Add a test: create a game state with a zombie at 50% happiness, run the save function (or serialize to JSON), then load it back and assert the zombie’s happiness is still 50%. This test currently fails (loaded happiness comes back at default 100).
3. **Debug:** Investigate the save system. Find that the happiness property wasn’t included in the serialized data. It’s an oversight in the save logic.
4. **Fix:** Use the Farm Domain agent or manual edit to add the missing property to the save data. E.g., include `zombie.happiness` in the `saveGameState` output. Follow the pattern used for other stats in that function.
5. **Run Tests:** The new test passes, and all others remain green (no side effects on save/load).
6. **Confirm Manually:** Boot the game, adjust a zombie’s happiness (let it drop by not feeding), save and reload – verify it persists correctly now.
7. **Commit:** `fix(farm): include zombie happiness in save data`. Add a line in documentation if needed (if we document save data format in META-ARCHITECTURE or elsewhere, update it).

Through these examples, we see the general workflow: **tests guide development**, agents accelerate coding of well-defined tasks, and the Solo Dev integrates and maintains overall coherence. By strictly following this workflow, Zombie Farm’s development remains organized, with high code quality and alignment to the design vision. Each change is validated by tests and documented, which will pay off as the project grows in complexity.
