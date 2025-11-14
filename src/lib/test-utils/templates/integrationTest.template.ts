/**
 * Integration Test Template
 *
 * Purpose: Test interactions between multiple modules, workflows, or state machines.
 * Use this template for multi-step processes, cross-module integration, and complex workflows.
 *
 * INSTRUCTIONS:
 * 1. Replace all [PLACEHOLDER] text with your actual values
 * 2. Remove sections that don't apply to your test
 * 3. Test complete workflows, not individual functions
 * 4. Use realistic scenarios that users would encounter
 * 5. Verify state consistency across module boundaries
 */

import {
  setupFakeTimers,
  teardownFakeTimers,
  advanceTime,
  createTestActor,
  waitForState,
  expectState,
} from '@lib/test-utils/mocks';
import { create[TYPE], create[OTHER_TYPE] } from '@lib/test-utils/factories';
import {
  createSimpleBattleScenario,
  createGrowingZombieScenario,
} from '@lib/test-utils/fixtures';
import { [FUNCTION_A] } from '@features/[MODULE_A]/[FILE_A]';
import { [FUNCTION_B] } from '@features/[MODULE_B]/[FILE_B]';
import { [MACHINE_NAME] } from '@features/[MODULE]/[MACHINE_FILE]';
import type { [TYPE] } from '@types';

describe('[WORKFLOW_NAME] Integration', () => {
  /**
   * SETUP AND TEARDOWN
   * Set up shared test infrastructure
   */
  beforeEach(() => {
    setupFakeTimers(); // For time-dependent workflows
  });

  afterEach(() => {
    teardownFakeTimers();
  });

  /**
   * COMPLETE WORKFLOW TESTS
   * Test full end-to-end workflows
   */
  describe('complete [WORKFLOW] workflow', () => {
    it('should complete full workflow from [START] to [END]', async () => {
      // Arrange - Set up initial state
      const initialState = create[TYPE]({
        [PROPERTY]: [INITIAL_VALUE],
      });

      // Act & Assert - Step 1: [FIRST_STEP]
      const step1Result = [FUNCTION_A](initialState, [PARAMS]);

      expect(step1Result.success).toBe(true);
      expect(step1Result.[STATE_PROPERTY]).toBe([EXPECTED_VALUE]);

      // Act & Assert - Step 2: [SECOND_STEP]
      advanceTime([TIME_AMOUNT]); // If time-dependent

      const step2Result = [FUNCTION_B](step1Result.state, [PARAMS]);

      expect(step2Result.success).toBe(true);
      expect(step2Result.[STATE_PROPERTY]).toBe([EXPECTED_VALUE]);

      // Act & Assert - Step 3: [FINAL_STEP]
      const finalResult = [FINAL_FUNCTION](step2Result.state);

      expect(finalResult.[FINAL_PROPERTY]).toBe([EXPECTED_FINAL_VALUE]);
      // Verify overall state consistency
      expect(finalResult.[KEY]).toBeDefined();
    });

    it('should handle partial workflow when [INTERRUPTION_OCCURS]', () => {
      // Arrange
      const initialState = create[TYPE]();

      // Act - Complete first steps
      const step1Result = [FUNCTION_A](initialState);
      expect(step1Result.success).toBe(true);

      // Act - Attempt next step with blocking condition
      const step2Result = [FUNCTION_B](step1Result.state, [BLOCKING_PARAMS]);

      // Assert - Should fail gracefully
      expect(step2Result.success).toBe(false);
      expect(step2Result.error).toMatch(/[ERROR_PATTERN]/i);

      // Assert - Previous step's state should remain valid
      expect(step1Result.state.[PROPERTY]).toBe([EXPECTED_VALUE]);
    });
  });

  /**
   * STATE MACHINE WORKFLOW TESTS
   * Test state machine transitions and workflows
   */
  describe('state machine workflow', () => {
    it('should transition through all states in correct order', async () => {
      // Arrange
      const context = {
        [CONTEXT_PROPERTY]: [INITIAL_VALUE],
      };

      const actor = createTestActor(
        [MACHINE_NAME].provide({ context })
      );

      actor.start();

      // Assert initial state
      expectState(actor, '[INITIAL_STATE]');

      // Act & Assert - Transition 1
      actor.send({ type: '[EVENT_1]' });
      await waitForState(actor, '[STATE_1]');
      expectState(actor, '[STATE_1]');

      // Act & Assert - Transition 2
      actor.send({ type: '[EVENT_2]' });
      await waitForState(actor, '[STATE_2]');
      expectState(actor, '[STATE_2]');

      // Assert final context
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.[PROPERTY]).toBe([FINAL_VALUE]);

      // Cleanup
      actor.stop();
    });

    it('should handle guard conditions preventing transitions', async () => {
      // Arrange
      const context = {
        [BLOCKING_PROPERTY]: [BLOCKING_VALUE], // Prevents transition
      };

      const actor = createTestActor(
        [MACHINE_NAME].provide({ context })
      );

      actor.start();

      // Act
      actor.send({ type: '[GUARDED_EVENT]' });

      // Assert - Should stay in current state
      await new Promise(resolve => setTimeout(resolve, 100));
      expectState(actor, '[CURRENT_STATE]');

      actor.stop();
    });
  });

  /**
   * CROSS-MODULE INTEGRATION TESTS
   * Test data flow between different modules
   */
  describe('[MODULE_A] to [MODULE_B] integration', () => {
    it('should pass data correctly from [MODULE_A] to [MODULE_B]', () => {
      // Arrange
      const initialData = create[TYPE]({
        [MODULE_A_PROPERTY]: [VALUE],
      });

      // Act - Module A processes data
      const moduleAResult = [MODULE_A_FUNCTION](initialData);

      // Assert Module A output
      expect(moduleAResult.[OUTPUT_PROPERTY]).toBeDefined();

      // Act - Module B receives Module A output
      const moduleBResult = [MODULE_B_FUNCTION](moduleAResult);

      // Assert Module B processes correctly
      expect(moduleBResult.[RESULT_PROPERTY]).toBe([EXPECTED_VALUE]);

      // Assert - Verify data integrity across modules
      expect(moduleBResult.[SHARED_PROPERTY]).toBe(
        moduleAResult.[SHARED_PROPERTY]
      );
    });

    it('should maintain state consistency across module boundaries', () => {
      // Arrange
      const sharedState = create[TYPE]();

      // Act - Module A modifies shared state
      const updatedByA = [MODULE_A_FUNCTION](sharedState);

      // Act - Module B reads shared state
      const updatedByB = [MODULE_B_FUNCTION](updatedByA);

      // Assert - Both modules see consistent state
      expect(updatedByB.[PROPERTY]).toBe([EXPECTED_VALUE]);
      expect(updatedByB.[SHARED_ID]).toBe(sharedState.[SHARED_ID]);
    });
  });

  /**
   * TIME-BASED WORKFLOW TESTS
   * Test workflows that depend on time progression
   */
  describe('time-dependent workflow', () => {
    it('should progress correctly over time', () => {
      // Arrange
      const scenario = createGrowingZombieScenario();

      // Assert initial state
      expect(scenario.plot.status).toBe('growing');

      // Act - Advance time partially
      advanceTime([PARTIAL_TIME]);

      // Assert - Still in progress
      expect(scenario.plot.status).toBe('growing');
      expect(scenario.plot.progress).toBeGreaterThan(0);
      expect(scenario.plot.progress).toBeLessThan(100);

      // Act - Complete remaining time
      advanceTime([REMAINING_TIME]);

      // Assert - Completed
      expect(scenario.plot.status).toBe('ready');
      expect(scenario.plot.progress).toBe(100);
    });
  });

  /**
   * SCENARIO-BASED TESTS
   * Test using predefined scenarios
   */
  describe('using test scenarios', () => {
    it('should handle battle scenario correctly', async () => {
      // Arrange
      const scenario = createSimpleBattleScenario();
      const actor = createTestActor([COMBAT_MACHINE], scenario);

      actor.start();

      // Act - Execute battle workflow
      actor.send({ type: 'START_BATTLE' });
      await waitForState(actor, 'fighting');

      // Simulate combat...
      actor.send({ type: 'RESOLVE_ATTACK', [ATTACK_DATA] });

      // Assert
      await waitForState(actor, '[END_STATE]');
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.result).toBeDefined();

      actor.stop();
    });
  });

  /**
   * ERROR RECOVERY TESTS
   * Test how workflows handle and recover from errors
   */
  describe('error recovery', () => {
    it('should recover gracefully from [ERROR_TYPE]', () => {
      // Arrange
      const state = create[TYPE]();

      // Act - Trigger error condition
      const step1 = [FUNCTION_A](state, [PARAMS_CAUSING_ERROR]);

      // Assert - Error handled
      expect(step1.success).toBe(false);

      // Act - Attempt recovery
      const recovered = [RECOVERY_FUNCTION](state);

      // Assert - State recovered
      expect(recovered.success).toBe(true);
      expect(recovered.state.[PROPERTY]).toBe([VALID_VALUE]);
    });

    it('should rollback changes on workflow failure', () => {
      // Arrange
      const originalState = create[TYPE]({
        [PROPERTY]: [ORIGINAL_VALUE],
      });

      // Act - Start workflow
      const step1 = [FUNCTION_A](originalState);

      // Act - Workflow fails at step 2
      const step2 = [FUNCTION_B](step1.state, [FAILING_PARAMS]);

      // Assert - Should rollback to original state
      expect(step2.success).toBe(false);
      expect(step2.state.[PROPERTY]).toBe([ORIGINAL_VALUE]);
    });
  });
});

/**
 * EXAMPLES OF COMMON INTEGRATION PATTERNS
 */

// Example 1: Plant-to-Harvest Workflow
describe('Plant-to-Harvest Workflow', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    teardownFakeTimers();
  });

  it('completes full zombie lifecycle', () => {
    const gameState = createTestGameState();

    // Plant
    const planted = plantZombie(gameState, { type: 'shambler' });
    expect(planted.plot.status).toBe('growing');

    // Wait for growth
    advanceTimeByHours(1);

    // Harvest
    const harvested = harvestZombie(planted.gameState, planted.plot.id);
    expect(harvested.success).toBe(true);
    expect(harvested.zombie).toBeDefined();
  });
});

// Example 2: Farm-to-Combat Integration
describe('Farm-to-Combat Integration', () => {
  it('sends zombies to combat and processes results', () => {
    const gameState = createTestGameState({
      farm: {
        zombies: { z1: createTestZombie() },
        activeZombies: ['z1'],
      },
    });

    // Send to combat
    const sentToCombat = sendSquadToCombat(gameState, ['z1']);
    expect(sentToCombat.combat.squad).toHaveLength(1);

    // Battle occurs...
    const battleResult = { victory: true, survivors: ['z1'] };

    // Process results
    const afterBattle = processBattleResults(sentToCombat, battleResult);
    expect(afterBattle.farm.activeZombies).toContain('z1');
  });
});

// Example 3: State Machine Workflow
describe('Combat State Machine', () => {
  it('flows through combat phases', async () => {
    const actor = createTestActor(combatMachine);
    actor.start();

    expectState(actor, 'preparation');

    actor.send({ type: 'START_BATTLE' });
    await waitForState(actor, 'fighting');

    actor.send({ type: 'VICTORY' });
    await waitForState(actor, 'rewards');

    actor.stop();
  });
});
