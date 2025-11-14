/**
 * Damage Calculator Test Helpers - Tests
 *
 * Comprehensive tests for damage calculation utilities.
 * Validates formulas against DOMAIN-COMBAT.md specifications.
 */

import {
  calculateExpectedDamage,
  verifyDamageMultipliers,
  createDamageScenario,
  createPhysicalDamageScenario,
  createToxicDamageScenario,
  createFireDamageScenario,
  createDarkDamageScenario,
  createHolyDamageScenario,
  createExplosiveDamageScenario,
  createCriticalHitScenario,
  createZeroDamageScenario,
  createOverkillScenario,
  validateDamageCalculation,
} from './damageCalculatorTestHelpers';
import { DamageType } from '../../../types/combat';
import { createMockCombatUnit, createMockEnemy } from './combatTestHelpers';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

describe('damageCalculatorTestHelpers', () => {
  // ========== DAMAGE CALCULATION ==========

  describe('calculateExpectedDamage', () => {
    it('calculates basic physical damage', () => {
      const attacker = createMockCombatUnit({
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 50,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const defender = createMockEnemy({
        stats: {
          hp: 50,
          maxHp: 50,
          attack: 10,
          defense: 20,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const result = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL);

      expect(result.baseDamage).toBe(50);
      expect(result.finalDamage).toBeGreaterThanOrEqual(gameConfig.COMBAT.MINIMUM_DAMAGE);
      expect(result.damageType).toBe(DamageType.PHYSICAL);
    });

    it('enforces minimum damage of 1', () => {
      const attacker = createMockCombatUnit({
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 1,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const defender = createMockEnemy({
        stats: {
          hp: 50,
          maxHp: 50,
          attack: 10,
          defense: 999,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const result = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL);

      expect(result.finalDamage).toBe(1);
    });

    it('calculates critical hit damage', () => {
      const attacker = createMockCombatUnit({
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 50,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const defender = createMockEnemy({
        stats: {
          hp: 50,
          maxHp: 50,
          attack: 10,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const normal = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL);
      const critical = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL, {
        isCritical: true,
      });

      expect(critical.isCritical).toBe(true);
      expect(critical.finalDamage).toBeGreaterThan(normal.finalDamage);
      expect(critical.modifiers.criticalMultiplier).toBe(2.0);
    });

    it('handles armor-ignoring attacks', () => {
      const attacker = createMockCombatUnit({
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 40,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const defender = createMockEnemy({
        stats: {
          hp: 50,
          maxHp: 50,
          attack: 10,
          defense: 30,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      const result = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL, {
        ignoreArmor: true,
      });

      expect(result.modifiers.armorReduction).toBe(0);
    });
  });

  describe('verifyDamageMultipliers', () => {
    it('returns physical damage properties', () => {
      const props = verifyDamageMultipliers(DamageType.PHYSICAL);

      expect(props.isAoE).toBe(false);
      expect(props.ignoresArmor).toBe(false);
      expect(props.armorPenetration).toBe(0);
      expect(props.specialEffects).toEqual([]);
    });

    it('returns toxic damage properties', () => {
      const props = verifyDamageMultipliers(DamageType.TOXIC);

      expect(props.isAoE).toBe(false);
      expect(props.ignoresArmor).toBe(false);
      expect(props.armorPenetration).toBe(0.5);
      expect(props.specialEffects).toContain('poison');
    });

    it('returns fire damage properties', () => {
      const props = verifyDamageMultipliers(DamageType.FIRE);

      expect(props.isAoE).toBe(true);
      expect(props.specialEffects).toContain('burning');
    });

    it('returns dark damage properties', () => {
      const props = verifyDamageMultipliers(DamageType.DARK);

      expect(props.ignoresArmor).toBe(true);
      expect(props.specialEffects).toContain('fear');
    });

    it('returns holy damage properties', () => {
      const props = verifyDamageMultipliers(DamageType.HOLY);

      expect(props.specialEffects).toContain('weakened');
    });

    it('returns explosive damage properties', () => {
      const props = verifyDamageMultipliers(DamageType.EXPLOSIVE);

      expect(props.isAoE).toBe(true);
    });
  });

  describe('createDamageScenario', () => {
    it('creates complete damage scenario', () => {
      const scenario = createDamageScenario(DamageType.PHYSICAL);

      expect(scenario.attacker).toBeDefined();
      expect(scenario.defender).toBeDefined();
      expect(scenario.damageType).toBe(DamageType.PHYSICAL);
      expect(scenario.expectedDamage).toBeDefined();
    });

    it('applies attacker overrides', () => {
      const scenario = createDamageScenario(DamageType.PHYSICAL, {
        name: 'Custom Attacker',
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 75,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      expect(scenario.attacker.name).toBe('Custom Attacker');
      expect(scenario.attacker.stats.attack).toBe(75);
    });

    it('applies defender overrides', () => {
      const scenario = createDamageScenario(DamageType.PHYSICAL, undefined, {
        name: 'Custom Defender',
        stats: {
          hp: 200,
          maxHp: 200,
          attack: 10,
          defense: 40,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });

      expect(scenario.defender.name).toBe('Custom Defender');
      expect(scenario.defender.stats.defense).toBe(40);
    });
  });

  // ========== SPECIALIZED SCENARIOS ==========

  describe('createPhysicalDamageScenario', () => {
    it('creates physical damage scenario', () => {
      const scenario = createPhysicalDamageScenario();

      expect(scenario.damageType).toBe(DamageType.PHYSICAL);
      expect(scenario.attacker.stats.attack).toBe(50);
      expect(scenario.defender.stats.defense).toBe(20);
    });

    it('calculates expected damage correctly', () => {
      const scenario = createPhysicalDamageScenario();

      expect(scenario.expectedDamage.baseDamage).toBe(50);
      expect(scenario.expectedDamage.finalDamage).toBeGreaterThan(0);
    });
  });

  describe('createToxicDamageScenario', () => {
    it('creates toxic damage scenario', () => {
      const scenario = createToxicDamageScenario();

      expect(scenario.damageType).toBe(DamageType.TOXIC);
      expect(scenario.attacker.stats.range).toBe(5);
    });

    it('bypasses part of armor', () => {
      const scenario = createToxicDamageScenario();

      expect(scenario.expectedDamage.modifiers.armorReduction).toBeLessThan(
        scenario.defender.stats.defense
      );
    });
  });

  describe('createFireDamageScenario', () => {
    it('creates fire damage scenario', () => {
      const scenario = createFireDamageScenario();

      expect(scenario.damageType).toBe(DamageType.FIRE);
    });

    it('has AoE properties', () => {
      const props = verifyDamageMultipliers(DamageType.FIRE);

      expect(props.isAoE).toBe(true);
      expect(props.specialEffects).toContain('burning');
    });
  });

  describe('createDarkDamageScenario', () => {
    it('creates dark damage scenario', () => {
      const scenario = createDarkDamageScenario();

      expect(scenario.damageType).toBe(DamageType.DARK);
    });

    it('ignores armor completely', () => {
      const scenario = createDarkDamageScenario();

      expect(scenario.expectedDamage.modifiers.armorReduction).toBe(0);
    });
  });

  describe('createHolyDamageScenario', () => {
    it('creates holy damage scenario', () => {
      const scenario = createHolyDamageScenario();

      expect(scenario.damageType).toBe(DamageType.HOLY);
    });

    it('deals increased damage to undead', () => {
      const scenario = createHolyDamageScenario();

      expect(scenario.expectedDamage.modifiers.typeMultiplier).toBeGreaterThan(1.0);
    });
  });

  describe('createExplosiveDamageScenario', () => {
    it('creates explosive damage scenario', () => {
      const scenario = createExplosiveDamageScenario();

      expect(scenario.damageType).toBe(DamageType.EXPLOSIVE);
    });

    it('has AoE properties', () => {
      const props = verifyDamageMultipliers(DamageType.EXPLOSIVE);

      expect(props.isAoE).toBe(true);
    });
  });

  // ========== CRITICAL HIT TESTING ==========

  describe('createCriticalHitScenario', () => {
    it('creates critical hit scenario', () => {
      const scenario = createCriticalHitScenario();

      expect(scenario.attacker).toBeDefined();
      expect(scenario.defender).toBeDefined();
      expect(scenario.normalDamage).toBeDefined();
      expect(scenario.criticalDamage).toBeDefined();
    });

    it('critical damage is double normal damage', () => {
      const scenario = createCriticalHitScenario();

      expect(scenario.criticalDamage.isCritical).toBe(true);
      expect(scenario.normalDamage.isCritical).toBe(false);
      expect(scenario.criticalDamage.modifiers.criticalMultiplier).toBe(2.0);
    });

    it('critical deals more damage', () => {
      const scenario = createCriticalHitScenario();

      expect(scenario.criticalDamage.finalDamage).toBeGreaterThan(
        scenario.normalDamage.finalDamage
      );
    });
  });

  // ========== EDGE CASES ==========

  describe('createZeroDamageScenario', () => {
    it('creates zero damage scenario', () => {
      const scenario = createZeroDamageScenario();

      expect(scenario.attacker.stats.attack).toBeLessThan(scenario.defender.stats.defense);
    });

    it('enforces minimum damage', () => {
      const scenario = createZeroDamageScenario();

      expect(scenario.expectedDamage.finalDamage).toBe(gameConfig.COMBAT.MINIMUM_DAMAGE);
    });
  });

  describe('createOverkillScenario', () => {
    it('creates overkill scenario', () => {
      const scenario = createOverkillScenario();

      expect(scenario.attacker.stats.attack).toBeGreaterThan(scenario.defender.stats.hp * 10);
    });

    it('calculates massive damage', () => {
      const scenario = createOverkillScenario();

      expect(scenario.expectedDamage.finalDamage).toBeGreaterThan(scenario.defender.stats.hp);
    });
  });

  describe('validateDamageCalculation', () => {
    it('validates damage meets minimum', () => {
      const scenario = createPhysicalDamageScenario();

      const isValid = validateDamageCalculation(
        scenario.expectedDamage,
        gameConfig.COMBAT.MINIMUM_DAMAGE
      );

      expect(isValid).toBe(true);
    });

    it('rejects damage below minimum', () => {
      const invalidCalc = {
        baseDamage: 10,
        finalDamage: 0,
        damageType: DamageType.PHYSICAL,
        isCritical: false,
        modifiers: {
          armorReduction: 10,
          typeMultiplier: 1.0,
          criticalMultiplier: 1.0,
          other: 1.0,
        },
      };

      const isValid = validateDamageCalculation(invalidCalc, 1);

      expect(isValid).toBe(false);
    });

    it('validates damage within range', () => {
      const scenario = createPhysicalDamageScenario();

      const isValid = validateDamageCalculation(scenario.expectedDamage, 1, 1000);

      expect(isValid).toBe(true);
    });

    it('rejects damage above max', () => {
      const scenario = createOverkillScenario();

      const isValid = validateDamageCalculation(scenario.expectedDamage, 1, 10);

      expect(isValid).toBe(false);
    });
  });
});
