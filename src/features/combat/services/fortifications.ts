/**
 * Fortifications Service
 *
 * Handles fortification types (walls, towers, traps),
 * placement validation, and battlefield obstacles per DOMAIN-COMBAT.md.
 *
 * Responsibilities:
 * - Create fortification obstacles (walls, gates, towers, traps)
 * - Validate fortification placement
 * - Handle line of sight and movement blocking
 * - Trigger trap mechanics
 * - Manage fortification destruction
 */

import type { Obstacle, ObstacleType, DamageType } from '../../../types/combat';
import type { Position } from '../../../types/global';
import { generateId } from '../../../lib/utils/idGenerator';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Fortification stats template
 */
interface FortificationStats {
  maxHp: number;
  defense: number;
  isDestructible: boolean;
  blockMovement: boolean;
  blockLineOfSight: boolean;
  trapDamage?: number;
  damageType?: DamageType;
}

/**
 * Trap trigger result
 */
export interface TrapTriggerResult {
  triggered: boolean;
  damage: number;
  damageType: DamageType;
  statusEffect?: any;
  updatedTrap: Obstacle;
}

// ============================================================================
// FORTIFICATION STATS DATABASE
// ============================================================================

/**
 * Stats for each fortification type
 *
 * Per DOMAIN-COMBAT.md fortification specifications.
 */
const FORTIFICATION_STATS: Record<ObstacleType, FortificationStats> = {
  gate: {
    maxHp: 300,
    defense: 20,
    isDestructible: true,
    blockMovement: true,
    blockLineOfSight: true,
  },
  wall: {
    maxHp: 150,
    defense: 15,
    isDestructible: true,
    blockMovement: true,
    blockLineOfSight: true,
  },
  tower: {
    maxHp: 100,
    defense: 10,
    isDestructible: true,
    blockMovement: false, // Can pass under/around
    blockLineOfSight: true,
  },
  barricade: {
    maxHp: 80,
    defense: 5,
    isDestructible: true,
    blockMovement: true,
    blockLineOfSight: true,
  },
  spikePit: {
    maxHp: 0,
    defense: 0,
    isDestructible: false,
    blockMovement: false,
    blockLineOfSight: false,
    trapDamage: 50,
    damageType: 'physical' as DamageType,
  },
  fireTrap: {
    maxHp: 0,
    defense: 0,
    isDestructible: false,
    blockMovement: false,
    blockLineOfSight: false,
    trapDamage: 40,
    damageType: 'fire' as DamageType,
  },
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** Minimum distance between fortifications */
const MIN_FORTIFICATION_SPACING = 32;

/** Battlefield width */
const BATTLEFIELD_WIDTH = 1920;

/** Battlefield height */
const BATTLEFIELD_HEIGHT = 1080;

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create a fortification obstacle
 *
 * @param type Fortification type
 * @param position Position on battlefield
 * @returns Initialized fortification
 */
export function createFortification(type: ObstacleType, position: Position): Obstacle {
  const stats = FORTIFICATION_STATS[type];

  const obstacle: Obstacle = {
    id: generateId(),
    type,
    position,
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    defense: stats.defense,
    isDestructible: stats.isDestructible,
    isDestroyed: false,
  };

  // Add trap data for traps
  if (type === 'spikePit' || type === 'fireTrap') {
    obstacle.trapData = {
      damage: stats.trapDamage!,
      damageType: stats.damageType!,
      triggered: false,
    };
  }

  return obstacle;
}

/**
 * Get stats template for fortification type
 *
 * @param type Fortification type
 * @returns Fortification stats
 */
export function getFortificationStats(type: ObstacleType): FortificationStats {
  return { ...FORTIFICATION_STATS[type] };
}

/**
 * Check if fortification can be placed at position
 *
 * @param position Proposed position
 * @param existingFortifications Existing fortifications
 * @returns True if placement is valid
 */
export function canPlaceFortification(
  position: Position,
  existingFortifications: Obstacle[]
): boolean {
  // Check bounds
  if (
    position.x < 0 ||
    position.x > BATTLEFIELD_WIDTH ||
    position.y < 0 ||
    position.y > BATTLEFIELD_HEIGHT
  ) {
    return false;
  }

  // Check spacing from existing fortifications
  for (const fort of existingFortifications) {
    const distance = Math.sqrt(
      Math.pow(position.x - fort.position.x, 2) + Math.pow(position.y - fort.position.y, 2)
    );

    if (distance < MIN_FORTIFICATION_SPACING) {
      return false;
    }
  }

  return true;
}

/**
 * Check if fortification blocks line of sight
 *
 * @param fortification Fortification to check
 * @returns True if blocks LOS
 */
export function blocksLineOfSight(fortification: Obstacle): boolean {
  if (fortification.isDestroyed) {
    return false;
  }

  const stats = FORTIFICATION_STATS[fortification.type];
  return stats.blockLineOfSight;
}

/**
 * Check if fortification blocks movement
 *
 * @param fortification Fortification to check
 * @returns True if blocks movement
 */
export function blocksMovement(fortification: Obstacle): boolean {
  if (fortification.isDestroyed) {
    return false;
  }

  const stats = FORTIFICATION_STATS[fortification.type];
  return stats.blockMovement;
}

/**
 * Trigger a trap
 *
 * @param trap Trap obstacle
 * @returns Trigger result with damage and updated trap
 */
export function triggerTrap(trap: Obstacle): TrapTriggerResult {
  // Not a trap
  if (!trap.trapData) {
    return {
      triggered: false,
      damage: 0,
      damageType: 'physical' as DamageType,
      updatedTrap: trap,
    };
  }

  // Already triggered
  if (trap.trapData.triggered) {
    return {
      triggered: false,
      damage: 0,
      damageType: trap.trapData.damageType,
      updatedTrap: trap,
    };
  }

  // Trigger the trap
  const updatedTrap: Obstacle = {
    ...trap,
    trapData: {
      ...trap.trapData,
      triggered: true,
    },
  };

  const result: TrapTriggerResult = {
    triggered: true,
    damage: trap.trapData.damage,
    damageType: trap.trapData.damageType,
    updatedTrap,
  };

  // Add status effect for fire trap
  if (trap.type === 'fireTrap') {
    result.statusEffect = {
      type: 'burning',
      duration: 5,
      damagePerSecond: 5,
    };
  }

  return result;
}

/**
 * Destroy a fortification
 *
 * @param fortification Fortification to destroy
 * @returns Updated fortification (destroyed)
 */
export function destroyFortification(fortification: Obstacle): Obstacle {
  if (fortification.hp <= 0 && !fortification.isDestroyed) {
    return {
      ...fortification,
      isDestroyed: true,
      hp: 0,
    };
  }

  return fortification;
}
