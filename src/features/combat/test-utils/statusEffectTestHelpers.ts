/**
 * Status Effect Test Helpers
 *
 * Utilities for testing status effects (poison, burning, stunned, etc.)
 * and their application, duration, and stacking behavior.
 *
 * Based on DOMAIN-COMBAT.md status effect rules:
 * - Poisoned: -2% HP/sec for 10s (stackable)
 * - Burning: -5% HP/sec for 5s (spreads)
 * - Stunned: Cannot act for 2s
 * - Fear: Flee for 4s
 * - Weakened: -30% attack for 6s
 * - Slowed: -50% speed for 5s
 *
 * Per TESTING.md standards.
 */

import {
  type ActiveStatusEffect,
  StatusEffect,
  type CombatState,
  type CombatUnit,
  type Enemy,
} from '../../../types/combat';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';
import { createMockBattle } from './combatTestHelpers';

// ============================================================================
// STATUS EFFECT FACTORIES
// ============================================================================

/**
 * Applies a mock status effect to a unit
 */
export function applyMockStatusEffect(
  unit: CombatUnit | Enemy,
  effect: StatusEffect,
  duration?: number
): CombatUnit | Enemy {
  const config = gameConfig.COMBAT.STATUS_EFFECTS[effect];
  const effectDuration = duration ?? config.duration;

  return {
    ...unit,
    statusEffects: [...unit.statusEffects, effect],
  };
}

/**
 * Creates an active status effect
 */
export function createActiveStatusEffect(
  effect: StatusEffect,
  unitId: string,
  overrides?: Partial<ActiveStatusEffect>
): ActiveStatusEffect {
  const config = gameConfig.COMBAT.STATUS_EFFECTS[effect];

  let strength = 0;
  if (effect === 'poisoned') {
    strength = config.damagePerSecond || 2;
  } else if (effect === 'burning') {
    strength = config.damagePerSecond || 5;
  } else if (effect === 'bleeding') {
    strength = config.damagePerSecond || 1;
  } else if (effect === 'weakened') {
    strength = config.attackReduction || 0.3;
  } else if (effect === 'slowed') {
    strength = config.speedReduction || 0.5;
  } else if (effect === 'buffed') {
    strength = config.statBoost || 0.2;
  }

  return {
    effect,
    unitId,
    duration: config.duration,
    strength,
    appliedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Creates a status effect scenario for testing
 */
export function createStatusEffectScenario(
  effect: StatusEffect,
  targetIds: string[]
): {
  battle: CombatState;
  effect: StatusEffect;
  targets: string[];
  activeEffects: ReadonlyArray<ActiveStatusEffect>;
} {
  const battle = createMockBattle();

  const activeEffects = targetIds.map((unitId) => createActiveStatusEffect(effect, unitId));

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects,
  };

  return {
    battle: updatedBattle,
    effect,
    targets: targetIds,
    activeEffects,
  };
}

// ============================================================================
// STATUS EFFECT VERIFICATION
// ============================================================================

/**
 * Verifies status effect behavior matches config
 */
export function verifyStatusEffectBehavior(effect: StatusEffect): {
  duration: number;
  canStack: boolean;
  maxStacks?: number;
  damagePerSecond?: number;
  preventsAction?: boolean;
  forcesRetreat?: boolean;
  modifiesStats?: {
    attack?: number;
    speed?: number;
  };
} {
  const config = gameConfig.COMBAT.STATUS_EFFECTS[effect];

  const result: ReturnType<typeof verifyStatusEffectBehavior> = {
    duration: config.duration,
    canStack: config.canStack,
    maxStacks: config.maxStacks,
  };

  if ('damagePerSecond' in config) {
    result.damagePerSecond = config.damagePerSecond;
  }

  if ('preventsAction' in config) {
    result.preventsAction = config.preventsAction;
  }

  if ('forcesRetreat' in config) {
    result.forcesRetreat = config.forcesRetreat;
  }

  if ('attackReduction' in config) {
    result.modifiesStats = {
      attack: -config.attackReduction,
    };
  }

  if ('speedReduction' in config) {
    result.modifiesStats = {
      ...result.modifiesStats,
      speed: -config.speedReduction,
    };
  }

  if ('statBoost' in config) {
    result.modifiesStats = {
      attack: config.statBoost,
      speed: config.statBoost,
    };
  }

  return result;
}

// ============================================================================
// SPECIALIZED STATUS EFFECT SCENARIOS
// ============================================================================

/**
 * Creates a poison scenario
 */
export function createPoisonScenario(): {
  battle: CombatState;
  poisonedUnitId: string;
  effect: ActiveStatusEffect;
} {
  const battle = createMockBattle();
  const poisonedUnitId = battle.playerSquad[0].id;

  const effect = createActiveStatusEffect('poisoned', poisonedUnitId);

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    poisonedUnitId,
    effect,
  };
}

/**
 * Creates a burning scenario
 */
export function createBurningScenario(): {
  battle: CombatState;
  burningUnitId: string;
  effect: ActiveStatusEffect;
  nearbyUnits: string[];
} {
  const battle = createMockBattle();
  const burningUnitId = battle.playerSquad[0].id;

  // Get nearby units (simplified - just other squad members)
  const nearbyUnits = battle.playerSquad.slice(1, 3).map((z) => z.id);

  const effect = createActiveStatusEffect('burning', burningUnitId);

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    burningUnitId,
    effect,
    nearbyUnits,
  };
}

/**
 * Creates a stun scenario
 */
export function createStunScenario(): {
  battle: CombatState;
  stunnedUnitId: string;
  effect: ActiveStatusEffect;
} {
  const battle = createMockBattle();
  const stunnedUnitId = battle.enemies[0].id;

  const effect = createActiveStatusEffect('stunned', stunnedUnitId);

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    stunnedUnitId,
    effect,
  };
}

/**
 * Creates a fear scenario
 */
export function createFearScenario(): {
  battle: CombatState;
  fearedUnitId: string;
  effect: ActiveStatusEffect;
} {
  const battle = createMockBattle();
  const fearedUnitId = battle.enemies[0].id;

  const effect = createActiveStatusEffect('fear', fearedUnitId);

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    fearedUnitId,
    effect,
  };
}

/**
 * Creates a weakened scenario
 */
export function createWeakenedScenario(): {
  battle: CombatState;
  weakenedUnitId: string;
  effect: ActiveStatusEffect;
  originalAttack: number;
  reducedAttack: number;
} {
  const battle = createMockBattle();
  const weakenedUnitId = battle.playerSquad[0].id;
  const originalAttack = battle.playerSquad[0].stats.attack;

  const effect = createActiveStatusEffect('weakened', weakenedUnitId);

  const reduction = gameConfig.COMBAT.STATUS_EFFECTS.weakened.attackReduction;
  const reducedAttack = Math.floor(originalAttack * (1 - reduction));

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    weakenedUnitId,
    effect,
    originalAttack,
    reducedAttack,
  };
}

/**
 * Creates a slowed scenario
 */
export function createSlowedScenario(): {
  battle: CombatState;
  slowedUnitId: string;
  effect: ActiveStatusEffect;
  originalSpeed: number;
  reducedSpeed: number;
} {
  const battle = createMockBattle();
  const slowedUnitId = battle.playerSquad[0].id;
  const originalSpeed = battle.playerSquad[0].stats.speed;

  const effect = createActiveStatusEffect('slowed', slowedUnitId);

  const reduction = gameConfig.COMBAT.STATUS_EFFECTS.slowed.speedReduction;
  const reducedSpeed = originalSpeed * (1 - reduction);

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    slowedUnitId,
    effect,
    originalSpeed,
    reducedSpeed,
  };
}

/**
 * Creates a buff scenario
 */
export function createBuffScenario(): {
  battle: CombatState;
  buffedUnitId: string;
  effect: ActiveStatusEffect;
  originalStats: { attack: number; defense: number };
  buffedStats: { attack: number; defense: number };
} {
  const battle = createMockBattle();
  const buffedUnitId = battle.playerSquad[0].id;
  const unit = battle.playerSquad[0];

  const originalStats = {
    attack: unit.stats.attack,
    defense: unit.stats.defense,
  };

  const effect = createActiveStatusEffect('buffed', buffedUnitId);

  const boost = gameConfig.COMBAT.STATUS_EFFECTS.buffed.statBoost;
  const buffedStats = {
    attack: Math.floor(originalStats.attack * (1 + boost)),
    defense: Math.floor(originalStats.defense * (1 + boost)),
  };

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: [effect],
  };

  return {
    battle: updatedBattle,
    buffedUnitId,
    effect,
    originalStats,
    buffedStats,
  };
}

// ============================================================================
// STACKING AND DURATION
// ============================================================================

/**
 * Creates a stacking scenario for stackable effects
 */
export function createStackingScenario(
  effect: StatusEffect,
  stacks: number
): {
  battle: CombatState;
  targetUnitId: string;
  stackCount: number;
  effects: ReadonlyArray<ActiveStatusEffect>;
} {
  const battle = createMockBattle();
  const targetUnitId = battle.playerSquad[0].id;

  const effects: ActiveStatusEffect[] = [];
  for (let i = 0; i < stacks; i++) {
    effects.push(
      createActiveStatusEffect(effect, targetUnitId, {
        appliedAt: Date.now() + i * 100, // Slightly staggered
      })
    );
  }

  const updatedBattle: CombatState = {
    ...battle,
    activeEffects: effects,
  };

  return {
    battle: updatedBattle,
    targetUnitId,
    stackCount: stacks,
    effects,
  };
}

/**
 * Calculates expected damage from DoT effects
 */
export function calculateDoTDamage(
  effect: StatusEffect,
  maxHp: number,
  duration: number,
  stacks: number = 1
): number {
  const config = gameConfig.COMBAT.STATUS_EFFECTS[effect];

  if (!('damagePerSecond' in config)) {
    return 0;
  }

  const damagePerSecond = config.damagePerSecond || 0;
  const percentPerSecond = damagePerSecond / 100; // Convert percentage

  const totalDamage = maxHp * percentPerSecond * duration * stacks;

  return Math.floor(totalDamage);
}

/**
 * Checks if an effect can stack
 */
export function canEffectStack(effect: StatusEffect): boolean {
  const config = gameConfig.COMBAT.STATUS_EFFECTS[effect];
  return config.canStack;
}

/**
 * Gets max stacks for an effect
 */
export function getMaxStacks(effect: StatusEffect): number | null {
  const config = gameConfig.COMBAT.STATUS_EFFECTS[effect];
  return config.maxStacks ?? null;
}

/**
 * Filters active effects by unit ID
 */
export function getUnitEffects(
  battle: CombatState,
  unitId: string
): ReadonlyArray<ActiveStatusEffect> {
  return battle.activeEffects.filter((e) => e.unitId === unitId);
}

/**
 * Counts stacks of a specific effect on a unit
 */
export function countEffectStacks(
  battle: CombatState,
  unitId: string,
  effect: StatusEffect
): number {
  return battle.activeEffects.filter((e) => e.unitId === unitId && e.effect === effect).length;
}
