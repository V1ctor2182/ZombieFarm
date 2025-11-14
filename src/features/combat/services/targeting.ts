/**
 * Target Selection System
 *
 * Implements targeting algorithms, range checking, line of sight,
 * target prioritization, and re-targeting logic.
 *
 * Per DOMAIN-COMBAT.md Engagement & Targeting specifications.
 */

import type { CombatUnit, Enemy, Obstacle } from '../../../types/combat';
import { TargetPriority, EnemyType } from '../../../types/combat';
import type { Position } from '../../../types/global';

// ============================================================================
// DISTANCE AND RANGE UTILITIES
// ============================================================================

/**
 * Calculate Euclidean distance between two positions
 *
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Distance between positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if target is within unit's attack range
 *
 * @param unit - Attacking unit
 * @param target - Potential target
 * @returns True if target is in range
 */
export function isInRange(unit: CombatUnit, target: CombatUnit | Enemy): boolean {
  const distance = calculateDistance(unit.position, target.position);
  return distance <= unit.stats.range;
}

/**
 * Get all targets within a radius of a center point
 *
 * @param center - Center position
 * @param radius - Radius in tiles
 * @param targets - Potential targets
 * @returns Targets within radius
 */
export function getTargetsInRadius(
  center: Position,
  radius: number,
  targets: (CombatUnit | Enemy)[]
): (CombatUnit | Enemy)[] {
  return targets.filter((target) => {
    if (target.isDead) return false;
    const distance = calculateDistance(center, target.position);
    return distance <= radius;
  });
}

// ============================================================================
// LINE OF SIGHT
// ============================================================================

/**
 * Check if line of sight exists between two positions
 *
 * Uses simple ray-casting algorithm to check if obstacles block the line.
 *
 * @param from - Starting position
 * @param to - Target position
 * @param obstacles - Obstacles that may block LOS
 * @returns True if line of sight is clear
 */
export function hasLineOfSight(
  from: Position,
  to: Position,
  obstacles: Obstacle[]
): boolean {
  // Filter to only LOS-blocking obstacles
  const blockingObstacles = obstacles.filter(
    (obs) => obs.blocksLineOfSight && !obs.isDead
  );

  if (blockingObstacles.length === 0) {
    return true;
  }

  // Check if any obstacle intersects the line from -> to
  for (const obstacle of blockingObstacles) {
    if (isObstacleOnLine(from, to, obstacle.position)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an obstacle position intersects a line between two points
 *
 * @param from - Line start
 * @param to - Line end
 * @param obstaclePos - Obstacle position
 * @returns True if obstacle is on the line
 */
function isObstacleOnLine(
  from: Position,
  to: Position,
  obstaclePos: Position
): boolean {
  // Calculate line equation coefficients
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Handle vertical line
  if (Math.abs(dx) < 0.001) {
    return (
      Math.abs(obstaclePos.x - from.x) < 0.5 &&
      obstaclePos.y >= Math.min(from.y, to.y) &&
      obstaclePos.y <= Math.max(from.y, to.y)
    );
  }

  // Handle horizontal line
  if (Math.abs(dy) < 0.001) {
    return (
      Math.abs(obstaclePos.y - from.y) < 0.5 &&
      obstaclePos.x >= Math.min(from.x, to.x) &&
      obstaclePos.x <= Math.max(from.x, to.x)
    );
  }

  // General case: point-to-line distance
  const lineLength = Math.sqrt(dx * dx + dy * dy);
  const distanceToLine =
    Math.abs(dy * obstaclePos.x - dx * obstaclePos.y + to.x * from.y - to.y * from.x) /
    lineLength;

  // Check if obstacle is close to line (within 0.5 tiles)
  if (distanceToLine > 0.5) {
    return false;
  }

  // Check if obstacle is between from and to (not behind)
  const dotProduct =
    (obstaclePos.x - from.x) * dx + (obstaclePos.y - from.y) * dy;
  const lineSquared = dx * dx + dy * dy;

  if (dotProduct < 0 || dotProduct > lineSquared) {
    return false; // Obstacle is behind or past the target
  }

  return true;
}

// ============================================================================
// FIND TARGETS IN RANGE
// ============================================================================

/**
 * Find all valid targets within range and line of sight
 *
 * @param unit - Attacking unit
 * @param enemies - Potential enemy targets
 * @param obstacles - Obstacles that may block LOS
 * @returns Array of valid targets
 */
export function findTargetsInRange(
  unit: CombatUnit,
  enemies: Enemy[],
  obstacles: Obstacle[]
): Enemy[] {
  return enemies.filter((enemy) => {
    // Exclude dead enemies
    if (enemy.isDead) {
      return false;
    }

    // Check if in range
    if (!isInRange(unit, enemy)) {
      return false;
    }

    // Check line of sight
    if (!hasLineOfSight(unit.position, enemy.position, obstacles)) {
      return false;
    }

    return true;
  });
}

// ============================================================================
// TARGET PRIORITIZATION
// ============================================================================

/**
 * Get support unit priority score
 *
 * Higher score = higher priority for SUPPORT targeting
 *
 * @param enemy - Enemy to score
 * @returns Priority score
 */
function getSupportPriority(enemy: Enemy): number {
  switch (enemy.type) {
    case EnemyType.PRIEST:
      return 100; // Highest priority
    case EnemyType.MAGE:
    case EnemyType.NECROMANCER:
      return 80;
    case EnemyType.GENERAL:
      return 60;
    default:
      return 0;
  }
}

/**
 * Get ranged unit priority score
 *
 * Higher score = higher priority for RANGED targeting
 *
 * @param enemy - Enemy to score
 * @returns Priority score
 */
function getRangedPriority(enemy: Enemy): number {
  switch (enemy.type) {
    case EnemyType.ARCHER:
    case EnemyType.CROSSBOWMAN:
      return 100;
    case EnemyType.MAGE:
      return 80;
    default:
      return enemy.stats.range > 3 ? 50 : 0;
  }
}

/**
 * Prioritize targets based on AI targeting strategy
 *
 * Per DOMAIN-COMBAT.md targeting priorities:
 * - CLOSEST: Nearest enemy
 * - WEAKEST: Lowest HP
 * - HIGHEST_THREAT: Highest attack
 * - LOWEST_ARMOR: Lowest defense
 * - SUPPORT: Healers and buffers
 * - RANGED: Ranged attackers
 *
 * @param targets - Available targets
 * @param priority - Targeting priority strategy
 * @param unit - Unit doing the targeting (for distance calculations)
 * @returns Sorted array (highest priority first)
 */
export function prioritizeTargets(
  targets: Enemy[],
  priority: TargetPriority,
  unit?: CombatUnit
): Enemy[] {
  const sorted = [...targets];

  switch (priority) {
    case TargetPriority.CLOSEST:
      if (!unit) {
        throw new Error('Unit required for CLOSEST priority');
      }
      sorted.sort((a, b) => {
        const distA = calculateDistance(unit.position, a.position);
        const distB = calculateDistance(unit.position, b.position);
        return distA - distB;
      });
      break;

    case TargetPriority.WEAKEST:
      sorted.sort((a, b) => a.stats.hp - b.stats.hp);
      break;

    case TargetPriority.HIGHEST_THREAT:
      sorted.sort((a, b) => b.stats.attack - a.stats.attack);
      break;

    case TargetPriority.LOWEST_ARMOR:
      sorted.sort((a, b) => a.stats.defense - b.stats.defense);
      break;

    case TargetPriority.SUPPORT:
      sorted.sort((a, b) => {
        const priorityA = getSupportPriority(a);
        const priorityB = getSupportPriority(b);
        return priorityB - priorityA;
      });
      break;

    case TargetPriority.RANGED:
      sorted.sort((a, b) => {
        const priorityA = getRangedPriority(a);
        const priorityB = getRangedPriority(b);
        return priorityB - priorityA;
      });
      break;

    default:
      // Unknown priority, return unsorted
      break;
  }

  return sorted;
}

// ============================================================================
// SELECT TARGET
// ============================================================================

/**
 * Select the best target based on priority strategy
 *
 * @param unit - Unit selecting a target
 * @param targets - Available targets
 * @param priority - Targeting priority
 * @returns Selected target or null if none available
 */
export function selectTarget(
  unit: CombatUnit,
  targets: Enemy[],
  priority: TargetPriority
): Enemy | null {
  // Filter out dead targets
  const validTargets = targets.filter((t) => !t.isDead);

  if (validTargets.length === 0) {
    return null;
  }

  // Prioritize targets
  const sorted = prioritizeTargets(validTargets, priority, unit);

  // Return highest priority target
  return sorted[0];
}

// ============================================================================
// RE-TARGETING LOGIC
// ============================================================================

/**
 * Determine if unit should switch to a new target
 *
 * Re-targeting occurs when:
 * - Current target is dead
 * - Current target is null
 * - Current target is out of range
 * - A significantly higher priority target is available (only if priority specified)
 *
 * @param unit - Unit currently targeting
 * @param currentTarget - Current target (or null)
 * @param allTargets - All available targets
 * @param priority - Targeting priority (optional)
 * @returns True if should retarget
 */
export function shouldRetarget(
  unit: CombatUnit,
  currentTarget: Enemy | null,
  allTargets: Enemy[],
  priority?: TargetPriority
): boolean {
  // No current target
  if (!currentTarget) {
    return true;
  }

  // Current target is dead
  if (currentTarget.isDead) {
    return true;
  }

  // Current target out of range
  if (!isInRange(unit, currentTarget)) {
    return true;
  }

  // If no priority specified, stick with current target
  if (!priority) {
    return false;
  }

  // Check if a significantly better target exists (only when priority is specified)
  const validTargets = allTargets.filter((t) => !t.isDead);

  if (validTargets.length === 0) {
    return false;
  }

  const bestTarget = selectTarget(unit, validTargets, priority);

  if (!bestTarget) {
    return false;
  }

  // If best target is not current target, check if it's significantly better
  if (bestTarget.id !== currentTarget.id) {
    return isSigificantlyBetterTarget(currentTarget, bestTarget, priority, unit);
  }

  return false;
}

/**
 * Check if new target is significantly better than current target
 *
 * @param current - Current target
 * @param potential - Potential new target
 * @param priority - Targeting priority
 * @param unit - Unit doing the targeting
 * @returns True if potential target is significantly better
 */
function isSigificantlyBetterTarget(
  current: Enemy,
  potential: Enemy,
  priority: TargetPriority,
  unit: CombatUnit
): boolean {
  switch (priority) {
    case TargetPriority.CLOSEST: {
      const currentDist = calculateDistance(unit.position, current.position);
      const potentialDist = calculateDistance(unit.position, potential.position);
      // Retarget if new target is at least 3 tiles closer
      return potentialDist < currentDist - 3;
    }

    case TargetPriority.WEAKEST: {
      // Retarget if new target has 30% less HP
      return potential.stats.hp < current.stats.hp * 0.7;
    }

    case TargetPriority.HIGHEST_THREAT: {
      // Retarget if new target has 50% more attack
      return potential.stats.attack > current.stats.attack * 1.5;
    }

    case TargetPriority.LOWEST_ARMOR: {
      // Retarget if new target has 50% less defense
      return potential.stats.defense < current.stats.defense * 0.5;
    }

    case TargetPriority.SUPPORT: {
      const currentPriority = getSupportPriority(current);
      const potentialPriority = getSupportPriority(potential);
      // Retarget if new target is support and current is not
      return potentialPriority > currentPriority + 20;
    }

    case TargetPriority.RANGED: {
      const currentPriority = getRangedPriority(current);
      const potentialPriority = getRangedPriority(potential);
      // Retarget if new target is ranged and current is not
      return potentialPriority > currentPriority + 20;
    }

    default:
      return false;
  }
}
