/**
 * Damage Calculator Test Helpers
 *
 * Utilities for testing damage calculations, type effectiveness,
 * and damage-related combat mechanics.
 *
 * Based on DOMAIN-COMBAT.md damage formulas:
 * - Base damage = Attack - Defense (minimum 1)
 * - Type modifiers (Holy 2x vs undead, etc.)
 * - Armor penetration
 * - Critical hits
 *
 * Per TESTING.md standards.
 */

import {
  type CombatUnit,
  type Enemy,
  type DamageCalculation,
  DamageType,
} from '../../../types/combat';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';
import { createMockCombatUnit, createMockEnemy } from './combatTestHelpers';

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

/**
 * Calculates expected damage based on DOMAIN-COMBAT.md formulas
 *
 * Base formula: Damage = Attack - Defense (minimum 1)
 * Type modifiers applied after base calculation
 */
export function calculateExpectedDamage(
  attacker: CombatUnit | Enemy,
  defender: CombatUnit | Enemy,
  damageType: DamageType,
  options?: {
    isCritical?: boolean;
    ignoreArmor?: boolean;
  }
): DamageCalculation {
  const { isCritical = false, ignoreArmor = false } = options || {};

  // Get damage multipliers from config
  const typeConfig = gameConfig.COMBAT.DAMAGE_MULTIPLIERS[damageType];

  // Calculate base damage
  const baseDamage = attacker.stats.attack;

  // Apply armor reduction unless ignored
  let armorReduction = 0;
  if (!ignoreArmor) {
    if (typeConfig.ignoresArmor) {
      // Dark damage ignores armor
      armorReduction = 0;
    } else if (typeConfig.armorPenetration) {
      // Toxic bypasses 50% of armor
      armorReduction = defender.stats.defense * (1 - typeConfig.armorPenetration);
    } else if (typeConfig.vsArmor) {
      // Physical/Fire reduced by armor
      armorReduction = defender.stats.defense * typeConfig.vsArmor;
    } else {
      armorReduction = defender.stats.defense;
    }
  }

  const damageAfterArmor = baseDamage - armorReduction;

  // Type effectiveness multiplier
  let typeMultiplier = 1.0;
  if (damageType === DamageType.HOLY) {
    // Holy deals 2x damage to undead (zombies)
    // Check if defender is a zombie (has type property that's a string)
    const defenderIsZombie = 'type' in defender && typeof defender.type === 'string';
    if (defenderIsZombie) {
      // Defender is zombie, attacker is enemy (human) - apply holy bonus
      typeMultiplier = typeConfig.vsUndead || 2.0;
    }
  } else if (damageType === DamageType.DARK && typeConfig.vsPeasants) {
    // Dark damage bonus vs weak-willed
    if ('type' in defender && defender.type === 'peasant') {
      typeMultiplier = typeConfig.vsPeasants;
    }
  } else if (damageType === DamageType.EXPLOSIVE && typeConfig.vsStructures) {
    // Explosive bonus vs structures (not applicable to units)
    typeMultiplier = 1.0;
  }

  // Critical multiplier
  const criticalMultiplier = isCritical ? 2.0 : 1.0;

  // Final damage
  const finalDamage = Math.max(
    gameConfig.COMBAT.MINIMUM_DAMAGE,
    Math.floor(damageAfterArmor * typeMultiplier * criticalMultiplier)
  );

  return {
    baseDamage,
    finalDamage,
    damageType,
    isCritical,
    modifiers: {
      armorReduction,
      typeMultiplier,
      criticalMultiplier,
      other: 1.0,
    },
  };
}

/**
 * Verifies damage type multipliers match config
 */
export function verifyDamageMultipliers(damageType: DamageType): {
  isAoE: boolean;
  ignoresArmor: boolean;
  armorPenetration: number;
  specialEffects: string[];
} {
  const config = gameConfig.COMBAT.DAMAGE_MULTIPLIERS[damageType];

  const specialEffects: string[] = [];
  if (config.appliesPoison) specialEffects.push('poison');
  if (config.appliesBurning) specialEffects.push('burning');
  if (config.appliesFear) specialEffects.push('fear');
  if (config.appliesWeakened) specialEffects.push('weakened');

  return {
    isAoE: config.isAoE || false,
    ignoresArmor: config.ignoresArmor || false,
    armorPenetration: config.armorPenetration || 0,
    specialEffects,
  };
}

/**
 * Creates a damage scenario for testing
 */
export function createDamageScenario(
  type: DamageType,
  attackerOverrides?: Partial<CombatUnit | Enemy>,
  defenderOverrides?: Partial<CombatUnit | Enemy>
): {
  attacker: CombatUnit;
  defender: Enemy;
  damageType: DamageType;
  expectedDamage: DamageCalculation;
} {
  const attacker = createMockCombatUnit(attackerOverrides);
  const defender = createMockEnemy(defenderOverrides);

  const expectedDamage = calculateExpectedDamage(attacker, defender, type);

  return {
    attacker,
    defender,
    damageType: type,
    expectedDamage,
  };
}

// ============================================================================
// SPECIALIZED DAMAGE SCENARIOS
// ============================================================================

/**
 * Creates a physical damage scenario (standard attack)
 */
export function createPhysicalDamageScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.PHYSICAL,
    {
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
    },
    {
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
    }
  );
}

/**
 * Creates a toxic damage scenario (armor-bypassing)
 */
export function createToxicDamageScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.TOXIC,
    {
      stats: {
        hp: 80,
        maxHp: 80,
        attack: 25,
        defense: 8,
        speed: 1.2,
        range: 5,
        attackCooldown: 2.0,
        resistances: {},
      },
    },
    {
      stats: {
        hp: 50,
        maxHp: 50,
        attack: 10,
        defense: 20, // High armor - toxic should bypass 50%
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    }
  );
}

/**
 * Creates a fire damage scenario (AoE burning)
 */
export function createFireDamageScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.FIRE,
    {
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 40,
        defense: 10,
        speed: 1.0,
        range: 3,
        attackCooldown: 2.5,
        resistances: {},
      },
    },
    {
      stats: {
        hp: 50,
        maxHp: 50,
        attack: 10,
        defense: 15,
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    }
  );
}

/**
 * Creates a dark damage scenario (ignores armor)
 */
export function createDarkDamageScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.DARK,
    {
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 40,
        defense: 15,
        speed: 1.0,
        range: 7,
        attackCooldown: 2.5,
        resistances: {},
      },
    },
    {
      stats: {
        hp: 50,
        maxHp: 50,
        attack: 10,
        defense: 30, // High armor - should be ignored
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    }
  );
}

/**
 * Creates a holy damage scenario (2x vs undead)
 */
export function createHolyDamageScenario(): ReturnType<typeof createDamageScenario> {
  // Holy is used by enemies against zombies
  const attacker = createMockEnemy({
    type: 'priest' as any,
    stats: {
      hp: 60,
      maxHp: 60,
      attack: 30,
      defense: 10,
      speed: 1.0,
      range: 4,
      attackCooldown: 2.0,
      resistances: {},
    },
  });

  const defender = createMockCombatUnit({
    stats: {
      hp: 100,
      maxHp: 100,
      attack: 15,
      defense: 10,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
  });

  const expectedDamage = calculateExpectedDamage(attacker, defender, DamageType.HOLY);

  return {
    attacker: attacker as any,
    defender: defender as any,
    damageType: DamageType.HOLY,
    expectedDamage,
  };
}

/**
 * Creates an explosive damage scenario (AoE)
 */
export function createExplosiveDamageScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.EXPLOSIVE,
    {
      stats: {
        hp: 50,
        maxHp: 50,
        attack: 60,
        defense: 5,
        speed: 1.5,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    },
    {
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
    }
  );
}

// ============================================================================
// CRITICAL HIT TESTING
// ============================================================================

/**
 * Creates a critical hit scenario
 */
export function createCriticalHitScenario(): {
  attacker: CombatUnit;
  defender: Enemy;
  normalDamage: DamageCalculation;
  criticalDamage: DamageCalculation;
} {
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
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 20,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
  });

  const normalDamage = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL);

  const criticalDamage = calculateExpectedDamage(attacker, defender, DamageType.PHYSICAL, {
    isCritical: true,
  });

  return {
    attacker,
    defender,
    normalDamage,
    criticalDamage,
  };
}

// ============================================================================
// EDGE CASE SCENARIOS
// ============================================================================

/**
 * Creates zero damage scenario (high defense)
 */
export function createZeroDamageScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.PHYSICAL,
    {
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 5, // Very low attack
        defense: 10,
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    },
    {
      stats: {
        hp: 50,
        maxHp: 50,
        attack: 10,
        defense: 50, // Very high defense
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    }
  );
}

/**
 * Creates overkill damage scenario (damage >> HP)
 */
export function createOverkillScenario(): ReturnType<typeof createDamageScenario> {
  return createDamageScenario(
    DamageType.PHYSICAL,
    {
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 999,
        defense: 10,
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    },
    {
      stats: {
        hp: 10,
        maxHp: 10,
        attack: 5,
        defense: 0,
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
    }
  );
}

/**
 * Validates damage calculation result
 */
export function validateDamageCalculation(
  calc: DamageCalculation,
  expectedMin: number,
  expectedMax?: number
): boolean {
  if (calc.finalDamage < gameConfig.COMBAT.MINIMUM_DAMAGE) {
    return false;
  }

  if (calc.finalDamage < expectedMin) {
    return false;
  }

  if (expectedMax !== undefined && calc.finalDamage > expectedMax) {
    return false;
  }

  return true;
}
