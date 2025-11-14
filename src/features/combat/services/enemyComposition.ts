/**
 * Enemy Composition Service
 *
 * Handles location-based enemy composition, stat loading,
 * and difficulty scaling per DOMAIN-COMBAT.md.
 *
 * Responsibilities:
 * - Load enemy base stats from configuration
 * - Scale stats based on location difficulty
 * - Generate enemy units with proper AI profiles
 * - Validate enemy compositions
 */

import type { Location } from '../../../types/world';
import type {
  Enemy,
  EnemyType,
  CombatStats,
  EnemyAIProfile,
  EnemyAbility,
} from '../../../types/combat';
import {
  UnitAIState,
  TargetPriority,
  DamageType,
  AbilityEffectType,
  AbilityTargetType,
} from '../../../types/combat';
import type { Position } from '../../../types/global';
import { generateId } from '../../../lib/utils/idGenerator';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Enemy composition from a location
 */
export interface LocationEnemyComposition {
  type: EnemyType;
  count: number;
  wave: number;
  stats: CombatStats;
  spawnZone?: string;
  isBoss?: boolean;
}

/**
 * Validation result for enemy composition
 */
export interface EnemyCompositionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// ENEMY BASE STATS DATABASE
// ============================================================================

/**
 * Base stats for each enemy type (difficulty 1)
 *
 * Per DOMAIN-COMBAT.md enemy specifications.
 */
const ENEMY_BASE_STATS: Record<EnemyType, Omit<CombatStats, 'currentHp'>> = {
  // Common enemies
  peasant: {
    maxHp: 30,
    attack: 5,
    defense: 2,
    speed: 1.0,
    range: 1,
    accuracy: 0.8,
    evasion: 0.1,
    critRate: 0.05,
    critMultiplier: 1.5,
  },
  militia: {
    maxHp: 50,
    attack: 10,
    defense: 5,
    speed: 1.0,
    range: 1,
    accuracy: 0.85,
    evasion: 0.15,
    critRate: 0.1,
    critMultiplier: 1.5,
  },

  // Ranged
  archer: {
    maxHp: 40,
    attack: 12,
    defense: 3,
    speed: 1.0,
    range: 4,
    accuracy: 0.9,
    evasion: 0.2,
    critRate: 0.15,
    critMultiplier: 2.0,
  },
  crossbowman: {
    maxHp: 50,
    attack: 18,
    defense: 4,
    speed: 0.8,
    range: 5,
    accuracy: 0.95,
    evasion: 0.15,
    critRate: 0.2,
    critMultiplier: 2.5,
  },

  // Melee
  soldier: {
    maxHp: 70,
    attack: 15,
    defense: 8,
    speed: 1.0,
    range: 1,
    accuracy: 0.85,
    evasion: 0.15,
    critRate: 0.1,
    critMultiplier: 1.5,
  },
  knight: {
    maxHp: 120,
    attack: 20,
    defense: 15,
    speed: 0.8,
    range: 1,
    accuracy: 0.9,
    evasion: 0.1,
    critRate: 0.12,
    critMultiplier: 1.8,
  },
  brute: {
    maxHp: 200,
    attack: 30,
    defense: 10,
    speed: 0.6,
    range: 1,
    accuracy: 0.8,
    evasion: 0.05,
    critRate: 0.08,
    critMultiplier: 2.0,
  },

  // Magic
  mage: {
    maxHp: 60,
    attack: 25,
    defense: 5,
    speed: 1.0,
    range: 5,
    accuracy: 0.85,
    evasion: 0.2,
    critRate: 0.15,
    critMultiplier: 2.0,
  },
  priest: {
    maxHp: 70,
    attack: 20,
    defense: 6,
    speed: 1.0,
    range: 4,
    accuracy: 0.9,
    evasion: 0.15,
    critRate: 0.1,
    critMultiplier: 2.5,
  },
  necromancer: {
    maxHp: 80,
    attack: 22,
    defense: 7,
    speed: 1.0,
    range: 4,
    accuracy: 0.85,
    evasion: 0.2,
    critRate: 0.12,
    critMultiplier: 2.0,
  },

  // Elite
  paladin: {
    maxHp: 150,
    attack: 30,
    defense: 20,
    speed: 0.9,
    range: 2,
    accuracy: 0.95,
    evasion: 0.15,
    critRate: 0.15,
    critMultiplier: 2.0,
  },
  general: {
    maxHp: 130,
    attack: 25,
    defense: 18,
    speed: 1.0,
    range: 2,
    accuracy: 0.9,
    evasion: 0.2,
    critRate: 0.2,
    critMultiplier: 1.8,
  },
  boss: {
    maxHp: 300,
    attack: 40,
    defense: 25,
    speed: 0.9,
    range: 2,
    accuracy: 0.95,
    evasion: 0.2,
    critRate: 0.25,
    critMultiplier: 2.5,
  },
};

// ============================================================================
// ENEMY AI PROFILES
// ============================================================================

/**
 * AI profiles for each enemy type
 */
const ENEMY_AI_PROFILES: Record<EnemyType, EnemyAIProfile> = {
  peasant: {
    aggression: 0.3,
    targetPriority: TargetPriority.CLOSEST,
    preferredRange: 1,
    canRetreat: true,
  },
  militia: {
    aggression: 0.5,
    targetPriority: TargetPriority.CLOSEST,
    preferredRange: 1,
    canRetreat: false,
  },
  archer: {
    aggression: 0.6,
    targetPriority: TargetPriority.LOWEST_ARMOR,
    preferredRange: 4,
    canRetreat: true,
  },
  crossbowman: {
    aggression: 0.7,
    targetPriority: TargetPriority.LOWEST_ARMOR,
    preferredRange: 5,
    canRetreat: true,
  },
  soldier: {
    aggression: 0.6,
    targetPriority: TargetPriority.CLOSEST,
    preferredRange: 1,
    canRetreat: false,
  },
  knight: {
    aggression: 0.7,
    targetPriority: TargetPriority.HIGHEST_THREAT,
    preferredRange: 1,
    canRetreat: false,
  },
  brute: {
    aggression: 0.9,
    targetPriority: TargetPriority.CLOSEST,
    preferredRange: 1,
    canRetreat: false,
  },
  mage: {
    aggression: 0.6,
    targetPriority: TargetPriority.WEAKEST,
    preferredRange: 5,
    canRetreat: true,
  },
  priest: {
    aggression: 0.4,
    targetPriority: TargetPriority.SUPPORT,
    preferredRange: 4,
    canRetreat: true,
  },
  necromancer: {
    aggression: 0.5,
    targetPriority: TargetPriority.WEAKEST,
    preferredRange: 4,
    canRetreat: true,
  },
  paladin: {
    aggression: 0.8,
    targetPriority: TargetPriority.HIGHEST_THREAT,
    preferredRange: 2,
    canRetreat: false,
  },
  general: {
    aggression: 0.7,
    targetPriority: TargetPriority.HIGHEST_THREAT,
    preferredRange: 2,
    canRetreat: false,
  },
  boss: {
    aggression: 0.9,
    targetPriority: TargetPriority.HIGHEST_THREAT,
    preferredRange: 2,
    canRetreat: false,
  },
};

// ============================================================================
// ENEMY ABILITIES
// ============================================================================

/**
 * Get abilities for enemy type
 */
function getEnemyAbilities(type: EnemyType): EnemyAbility[] {
  const abilities: EnemyAbility[] = [];

  switch (type as string) {
    case EnemyType.MAGE:
      abilities.push({
        id: generateId(),
        name: 'Fireball',
        cooldown: 10,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.DAMAGE,
          damage: 30,
          damageType: DamageType.FIRE,
          aoeRadius: 2,
          targetType: AbilityTargetType.AOE,
        },
      });
      break;

    case EnemyType.PRIEST:
      abilities.push({
        id: generateId(),
        name: 'Holy Smite',
        cooldown: 8,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.DAMAGE,
          damage: 40,
          damageType: DamageType.HOLY,
          targetType: AbilityTargetType.SINGLE,
        },
      });
      break;

    case EnemyType.PALADIN:
      abilities.push({
        id: generateId(),
        name: 'Divine Shield',
        cooldown: 20,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.BUFF,
          targetType: AbilityTargetType.SELF,
        },
      });
      abilities.push({
        id: generateId(),
        name: 'Consecration',
        cooldown: 12,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.DAMAGE,
          damage: 25,
          damageType: DamageType.HOLY,
          aoeRadius: 2,
          targetType: AbilityTargetType.AOE,
        },
      });
      break;

    case EnemyType.NECROMANCER:
      abilities.push({
        id: generateId(),
        name: 'Dark Bolt',
        cooldown: 6,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.DAMAGE,
          damage: 35,
          damageType: DamageType.DARK,
          targetType: AbilityTargetType.SINGLE,
        },
      });
      break;

    case EnemyType.GENERAL:
      abilities.push({
        id: generateId(),
        name: 'Rally',
        cooldown: 15,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.BUFF,
          targetType: AbilityTargetType.ALL_ALLIES,
        },
      });
      break;

    case 'boss':
      abilities.push({
        id: generateId(),
        name: 'Devastating Strike',
        cooldown: 10,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.DAMAGE,
          damage: 80,
          damageType: DamageType.PHYSICAL,
          targetType: AbilityTargetType.SINGLE,
        },
      });
      abilities.push({
        id: generateId(),
        name: 'Enrage',
        cooldown: 30,
        lastUsedAt: null,
        effect: {
          type: AbilityEffectType.BUFF,
          targetType: AbilityTargetType.SELF,
        },
      });
      break;

    default:
      // No special abilities for basic units
      break;
  }

  return abilities;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get base stats for an enemy type
 *
 * @param type Enemy type
 * @returns Base combat stats (difficulty 1)
 */
export function getEnemyBaseStats(type: EnemyType): Omit<CombatStats, 'currentHp'> {
  return { ...ENEMY_BASE_STATS[type] };
}

/**
 * Scale enemy stats based on difficulty
 *
 * Formula: stat * (1 + (difficulty - 1) * 0.15)
 * This gives approximately +15% stats per difficulty level.
 *
 * @param baseStats Base stats to scale
 * @param difficulty Location difficulty (1-10)
 * @param levelModifier Optional boss/elite modifier (default 1.0)
 * @returns Scaled stats
 */
export function scaleEnemyStats(
  baseStats: Omit<CombatStats, 'currentHp'>,
  difficulty: number,
  levelModifier: number = 1.0
): Omit<CombatStats, 'currentHp'> {
  const scaleFactor = 1 + (difficulty - 1) * 0.15;
  const totalScale = scaleFactor * levelModifier;

  return {
    maxHp: Math.floor(baseStats.maxHp * totalScale),
    attack: Math.floor(baseStats.attack * totalScale),
    defense: Math.floor(baseStats.defense * totalScale),
    speed: baseStats.speed, // Speed doesn't scale
    range: baseStats.range, // Range doesn't scale
    accuracy: baseStats.accuracy,
    evasion: baseStats.evasion,
    critRate: baseStats.critRate,
    critMultiplier: baseStats.critMultiplier,
  };
}

/**
 * Get enemy composition from location
 *
 * Loads enemies and applies difficulty scaling.
 *
 * @param location Location definition
 * @returns Array of enemy compositions with scaled stats
 */
export function getLocationEnemies(location: Location): LocationEnemyComposition[] {
  return location.enemies.map((enemy) => {
    const baseStats = getEnemyBaseStats(enemy.type);
    const scaled = scaleEnemyStats(baseStats, location.difficulty, enemy.levelModifier);

    return {
      type: enemy.type,
      count: enemy.count,
      wave: enemy.wave,
      stats: scaled,
      spawnZone: enemy.spawnZone,
      isBoss: enemy.isBoss,
    };
  });
}

/**
 * Generate a single enemy unit
 *
 * @param type Enemy type
 * @param position Spawn position
 * @param difficulty Optional difficulty for scaling (default 1)
 * @param levelModifier Optional level modifier (default 1.0)
 * @returns Fully initialized enemy unit
 */
export function generateEnemyUnit(
  type: EnemyType,
  position: Position,
  difficulty: number = 1,
  levelModifier: number = 1.0
): Enemy {
  const baseStats = getEnemyBaseStats(type);
  const scaledStats = scaleEnemyStats(baseStats, difficulty, levelModifier);
  const aiProfile = ENEMY_AI_PROFILES[type];
  const abilities = getEnemyAbilities(type);

  return {
    id: generateId() as EnemyId,
    type,
    name: formatEnemyName(type),
    position,
    stats: {
      ...scaledStats,
      currentHp: scaledStats.maxHp,
    },
    statusEffects: [],
    aiProfile,
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    abilities,
    isDead: false,
  };
}

/**
 * Validate enemy composition for a location
 *
 * @param location Location to validate
 * @returns Validation result
 */
export function validateEnemyComposition(location: Location): EnemyCompositionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for empty composition
  if (location.enemies.length === 0) {
    errors.push('Location has no enemies defined');
  }

  let bossCount = 0;

  for (const enemy of location.enemies) {
    // Validate wave number
    if (enemy.wave < 1) {
      errors.push(`Enemy ${enemy.type} has invalid wave number: ${enemy.wave}`);
    }

    if (enemy.wave > location.waves) {
      errors.push(`Enemy ${enemy.type} wave ${enemy.wave} exceeds total waves ${location.waves}`);
    }

    // Validate count
    if (enemy.count <= 0) {
      errors.push(`Enemy ${enemy.type} has invalid count: ${enemy.count}`);
    }

    // Count bosses
    if (enemy.isBoss) {
      bossCount++;

      // Warn if boss not in final wave
      if (enemy.wave < location.waves) {
        warnings.push('Boss unit not in final wave (may be intentional)');
      }
    }
  }

  // Warn about multiple bosses
  if (bossCount > 1) {
    warnings.push(`Location has ${bossCount} boss units (may be intentional)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format enemy name for display
 */
function formatEnemyName(type: EnemyType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
