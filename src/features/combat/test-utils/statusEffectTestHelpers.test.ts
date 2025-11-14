/**
 * Status Effect Test Helpers - Tests
 *
 * Comprehensive tests for status effect utilities.
 * Validates status effect application, stacking, and behavior.
 */

import {
  applyMockStatusEffect,
  createActiveStatusEffect,
  createStatusEffectScenario,
  verifyStatusEffectBehavior,
  createPoisonScenario,
  createBurningScenario,
  createStunScenario,
  createFearScenario,
  createWeakenedScenario,
  createSlowedScenario,
  createBuffScenario,
  createStackingScenario,
  calculateDoTDamage,
  canEffectStack,
  getMaxStacks,
  getUnitEffects,
  countEffectStacks,
} from './statusEffectTestHelpers';
import { createMockCombatUnit } from './combatTestHelpers';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

describe('statusEffectTestHelpers', () => {
  // ========== STATUS EFFECT FACTORIES ==========

  describe('applyMockStatusEffect', () => {
    it('adds status effect to unit', () => {
      const unit = createMockCombatUnit();
      const updated = applyMockStatusEffect(unit, 'poisoned');

      expect(updated.statusEffects).toContain('poisoned');
    });

    it('adds multiple status effects', () => {
      let unit = createMockCombatUnit();
      unit = applyMockStatusEffect(unit, 'poisoned');
      unit = applyMockStatusEffect(unit, 'burning');

      expect(unit.statusEffects).toHaveLength(2);
      expect(unit.statusEffects).toContain('poisoned');
      expect(unit.statusEffects).toContain('burning');
    });
  });

  describe('createActiveStatusEffect', () => {
    it('creates poisoned effect', () => {
      const effect = createActiveStatusEffect('poisoned', 'unit-1');

      expect(effect.effect).toBe('poisoned');
      expect(effect.unitId).toBe('unit-1');
      expect(effect.duration).toBe(
        gameConfig.COMBAT.STATUS_EFFECTS.poisoned.duration
      );
      expect(effect.strength).toBeGreaterThan(0);
    });

    it('creates burning effect', () => {
      const effect = createActiveStatusEffect('burning', 'unit-1');

      expect(effect.effect).toBe('burning');
      expect(effect.strength).toBe(5);
    });

    it('creates stunned effect', () => {
      const effect = createActiveStatusEffect('stunned', 'unit-1');

      expect(effect.effect).toBe('stunned');
      expect(effect.duration).toBe(2);
    });

    it('applies overrides', () => {
      const effect = createActiveStatusEffect('poisoned', 'unit-1', {
        duration: 20,
        strength: 10,
      });

      expect(effect.duration).toBe(20);
      expect(effect.strength).toBe(10);
    });
  });

  describe('createStatusEffectScenario', () => {
    it('creates scenario with single target', () => {
      const scenario = createStatusEffectScenario('poisoned', ['unit-1']);

      expect(scenario.effect).toBe('poisoned');
      expect(scenario.targets).toEqual(['unit-1']);
      expect(scenario.activeEffects).toHaveLength(1);
    });

    it('creates scenario with multiple targets', () => {
      const scenario = createStatusEffectScenario('burning', [
        'unit-1',
        'unit-2',
        'unit-3',
      ]);

      expect(scenario.targets).toHaveLength(3);
      expect(scenario.activeEffects).toHaveLength(3);
    });

    it('adds effects to battle state', () => {
      const scenario = createStatusEffectScenario('poisoned', ['unit-1']);

      expect(scenario.battle.activeEffects).toHaveLength(1);
      expect(scenario.battle.activeEffects[0].unitId).toBe('unit-1');
    });
  });

  // ========== STATUS EFFECT VERIFICATION ==========

  describe('verifyStatusEffectBehavior', () => {
    it('verifies poisoned behavior', () => {
      const behavior = verifyStatusEffectBehavior('poisoned');

      expect(behavior.duration).toBe(10);
      expect(behavior.canStack).toBe(true);
      expect(behavior.maxStacks).toBe(3);
      expect(behavior.damagePerSecond).toBe(2);
    });

    it('verifies burning behavior', () => {
      const behavior = verifyStatusEffectBehavior('burning');

      expect(behavior.duration).toBe(5);
      expect(behavior.canStack).toBe(false);
      expect(behavior.damagePerSecond).toBe(5);
    });

    it('verifies stunned behavior', () => {
      const behavior = verifyStatusEffectBehavior('stunned');

      expect(behavior.duration).toBe(2);
      expect(behavior.canStack).toBe(false);
      expect(behavior.preventsAction).toBe(true);
    });

    it('verifies fear behavior', () => {
      const behavior = verifyStatusEffectBehavior('fear');

      expect(behavior.duration).toBe(4);
      expect(behavior.forcesRetreat).toBe(true);
    });

    it('verifies weakened behavior', () => {
      const behavior = verifyStatusEffectBehavior('weakened');

      expect(behavior.duration).toBe(6);
      expect(behavior.modifiesStats?.attack).toBe(-0.3);
    });

    it('verifies slowed behavior', () => {
      const behavior = verifyStatusEffectBehavior('slowed');

      expect(behavior.duration).toBe(5);
      expect(behavior.modifiesStats?.speed).toBe(-0.5);
    });

    it('verifies buffed behavior', () => {
      const behavior = verifyStatusEffectBehavior('buffed');

      expect(behavior.duration).toBe(10);
      expect(behavior.canStack).toBe(true);
      expect(behavior.maxStacks).toBe(3);
    });
  });

  // ========== SPECIALIZED SCENARIOS ==========

  describe('createPoisonScenario', () => {
    it('creates poison scenario', () => {
      const scenario = createPoisonScenario();

      expect(scenario.effect.effect).toBe('poisoned');
      expect(scenario.battle.activeEffects).toHaveLength(1);
    });

    it('targets a zombie', () => {
      const scenario = createPoisonScenario();
      const zombie = scenario.battle.playerSquad.find(
        (z) => z.id === scenario.poisonedUnitId
      );

      expect(zombie).toBeDefined();
    });
  });

  describe('createBurningScenario', () => {
    it('creates burning scenario', () => {
      const scenario = createBurningScenario();

      expect(scenario.effect.effect).toBe('burning');
      expect(scenario.battle.activeEffects).toHaveLength(1);
    });

    it('identifies nearby units', () => {
      const scenario = createBurningScenario();

      expect(scenario.nearbyUnits.length).toBeGreaterThan(0);
    });
  });

  describe('createStunScenario', () => {
    it('creates stun scenario', () => {
      const scenario = createStunScenario();

      expect(scenario.effect.effect).toBe('stunned');
    });

    it('targets an enemy', () => {
      const scenario = createStunScenario();
      const enemy = scenario.battle.enemies.find(
        (e) => e.id === scenario.stunnedUnitId
      );

      expect(enemy).toBeDefined();
    });
  });

  describe('createFearScenario', () => {
    it('creates fear scenario', () => {
      const scenario = createFearScenario();

      expect(scenario.effect.effect).toBe('fear');
    });
  });

  describe('createWeakenedScenario', () => {
    it('creates weakened scenario', () => {
      const scenario = createWeakenedScenario();

      expect(scenario.effect.effect).toBe('weakened');
    });

    it('calculates reduced attack', () => {
      const scenario = createWeakenedScenario();

      expect(scenario.reducedAttack).toBeLessThan(
        scenario.originalAttack
      );
      // Floor rounding means it might be slightly less than exact 0.7
      expect(scenario.reducedAttack).toBeGreaterThanOrEqual(
        Math.floor(scenario.originalAttack * 0.7)
      );
      expect(scenario.reducedAttack).toBeLessThanOrEqual(
        scenario.originalAttack * 0.7
      );
    });
  });

  describe('createSlowedScenario', () => {
    it('creates slowed scenario', () => {
      const scenario = createSlowedScenario();

      expect(scenario.effect.effect).toBe('slowed');
    });

    it('calculates reduced speed', () => {
      const scenario = createSlowedScenario();

      expect(scenario.reducedSpeed).toBeLessThan(scenario.originalSpeed);
      expect(scenario.reducedSpeed).toBeCloseTo(
        scenario.originalSpeed * 0.5,
        1
      );
    });
  });

  describe('createBuffScenario', () => {
    it('creates buff scenario', () => {
      const scenario = createBuffScenario();

      expect(scenario.effect.effect).toBe('buffed');
    });

    it('calculates buffed stats', () => {
      const scenario = createBuffScenario();

      expect(scenario.buffedStats.attack).toBeGreaterThan(
        scenario.originalStats.attack
      );
      expect(scenario.buffedStats.defense).toBeGreaterThan(
        scenario.originalStats.defense
      );
    });
  });

  // ========== STACKING AND DURATION ==========

  describe('createStackingScenario', () => {
    it('creates multiple stacks', () => {
      const scenario = createStackingScenario('poisoned', 3);

      expect(scenario.stackCount).toBe(3);
      expect(scenario.effects).toHaveLength(3);
    });

    it('all stacks target same unit', () => {
      const scenario = createStackingScenario('poisoned', 3);

      const uniqueTargets = new Set(scenario.effects.map((e) => e.unitId));
      expect(uniqueTargets.size).toBe(1);
    });

    it('effects are same type', () => {
      const scenario = createStackingScenario('poisoned', 3);

      expect(scenario.effects.every((e) => e.effect === 'poisoned')).toBe(
        true
      );
    });
  });

  describe('calculateDoTDamage', () => {
    it('calculates poison damage', () => {
      const damage = calculateDoTDamage('poisoned', 100, 10, 1);

      // 2% per second for 10 seconds = 20% of 100 = 20
      expect(damage).toBe(20);
    });

    it('calculates burning damage', () => {
      const damage = calculateDoTDamage('burning', 100, 5, 1);

      // 5% per second for 5 seconds = 25% of 100 = 25
      expect(damage).toBe(25);
    });

    it('calculates stacked damage', () => {
      const damage = calculateDoTDamage('poisoned', 100, 10, 3);

      // 2% * 3 stacks = 6% per second for 10 seconds = 60% of 100 = 60
      expect(damage).toBe(60);
    });

    it('returns 0 for non-DoT effects', () => {
      const damage = calculateDoTDamage('stunned', 100, 2, 1);

      expect(damage).toBe(0);
    });
  });

  describe('canEffectStack', () => {
    it('returns true for stackable effects', () => {
      expect(canEffectStack('poisoned')).toBe(true);
      expect(canEffectStack('bleeding')).toBe(true);
      expect(canEffectStack('buffed')).toBe(true);
    });

    it('returns false for non-stackable effects', () => {
      expect(canEffectStack('burning')).toBe(false);
      expect(canEffectStack('stunned')).toBe(false);
      expect(canEffectStack('fear')).toBe(false);
    });
  });

  describe('getMaxStacks', () => {
    it('returns max stacks for limited effects', () => {
      expect(getMaxStacks('poisoned')).toBe(3);
      expect(getMaxStacks('bleeding')).toBe(5);
      expect(getMaxStacks('buffed')).toBe(3);
    });

    it('returns null for unlimited or non-stackable', () => {
      expect(getMaxStacks('burning')).toBeNull();
      expect(getMaxStacks('stunned')).toBeNull();
    });
  });

  describe('getUnitEffects', () => {
    it('returns effects for specific unit', () => {
      const scenario = createStackingScenario('poisoned', 2);
      const unitEffects = getUnitEffects(
        scenario.battle,
        scenario.targetUnitId
      );

      expect(unitEffects).toHaveLength(2);
    });

    it('returns empty array for unit with no effects', () => {
      const scenario = createPoisonScenario();
      const unitEffects = getUnitEffects(scenario.battle, 'nonexistent-id');

      expect(unitEffects).toHaveLength(0);
    });
  });

  describe('countEffectStacks', () => {
    it('counts stacks of specific effect', () => {
      const scenario = createStackingScenario('poisoned', 3);
      const count = countEffectStacks(
        scenario.battle,
        scenario.targetUnitId,
        'poisoned'
      );

      expect(count).toBe(3);
    });

    it('returns 0 for non-applied effect', () => {
      const scenario = createPoisonScenario();
      const count = countEffectStacks(
        scenario.battle,
        scenario.poisonedUnitId,
        'burning'
      );

      expect(count).toBe(0);
    });
  });
});
