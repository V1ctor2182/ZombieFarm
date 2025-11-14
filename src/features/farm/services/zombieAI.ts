/**
 * Zombie AI Service
 *
 * Implements zombie AI behavior system per DOMAIN-FARM.md:
 * - AI states (IDLE, WANDERING, FOLLOWING, GUARDING, etc.)
 * - State transitions based on personality
 * - Command execution (Follow, Guard, etc.)
 * - Movement and pathfinding
 *
 * Authority: DOMAIN-FARM.md Section "Living Zombies on the Farm"
 */

import type { Zombie, ZombieAIState, ZombiePersonality } from '../../../types/farm';
import type { Position } from '../../../types/global';

/**
 * Result type for service operations
 */
export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

// ============================================================================
// AI STATE MANAGEMENT
// ============================================================================

/**
 * Set zombie AI state
 *
 * @param zombie - Zombie to update
 * @param state - New AI state
 * @returns Updated zombie
 */
export function setAIState(zombie: Zombie, state: ZombieAIState): Zombie {
  return {
    ...zombie,
    aiState: state,
  };
}

// ============================================================================
// COMMAND EXECUTION
// ============================================================================

/**
 * Set zombie to FOLLOWING state (follow player command)
 *
 * Per DOMAIN-FARM.md: Player can give "Follow me" command to any active zombie
 *
 * @param zombie - Zombie to command
 * @returns Updated zombie or error
 */
export function setFollowCommand(zombie: Zombie): Result<Zombie> {
  return {
    success: true,
    data: setAIState(zombie, 'following'),
  };
}

/**
 * Set zombie to GUARDING state at specific position
 *
 * Per DOMAIN-FARM.md: Player can assign zombies to guard specific locations
 *
 * @param zombie - Zombie to command
 * @param guardPosition - Position to guard
 * @returns Updated zombie or error
 */
export function setGuardCommand(zombie: Zombie, guardPosition: Position): Result<Zombie> {
  // Validate position
  if (guardPosition.x < 0 || guardPosition.y < 0) {
    return {
      success: false,
      error: 'Guard position has invalid coordinates (must be non-negative)',
    };
  }

  // Update zombie to guarding state
  // Note: Guard position would typically be stored in zombie data
  // For now, we just set the AI state
  return {
    success: true,
    data: {
      ...zombie,
      aiState: 'guarding',
      position: guardPosition,
    },
  };
}

/**
 * Clear zombie command and return to IDLE
 *
 * @param zombie - Zombie to update
 * @returns Updated zombie
 */
export function clearCommand(zombie: Zombie): Zombie {
  return setAIState(zombie, 'idle');
}

// ============================================================================
// WANDERING BEHAVIOR
// ============================================================================

/**
 * Get next wander position for zombie
 *
 * Per DOMAIN-FARM.md: Zombies roam farm area freely within boundaries
 *
 * @param currentPosition - Current position
 * @param wanderRange - Maximum tiles to wander in one move
 * @returns Next position
 */
export function getNextWanderPosition(currentPosition: Position, wanderRange: number): Position {
  // Ensure wanderRange is valid
  const validRange = Math.min(Math.max(1, Math.floor(wanderRange)), 100);

  // Generate random offset within wander range
  const offsetX = Math.floor(Math.random() * (validRange * 2 + 1)) - validRange;
  const offsetY = Math.floor(Math.random() * (validRange * 2 + 1)) - validRange;

  // Calculate new position (ensure non-negative and finite)
  const newX = Math.max(0, Math.floor(currentPosition.x + offsetX));
  const newY = Math.max(0, Math.floor(currentPosition.y + offsetY));

  return {
    x: isFinite(newX) ? newX : 0,
    y: isFinite(newY) ? newY : 0,
  };
}

/**
 * Validate guard position is within grid bounds
 *
 * @param position - Position to check
 * @param gridSize - Farm grid dimensions
 * @returns True if valid
 */
export function isValidGuardPosition(
  position: Position,
  gridSize: { width: number; height: number }
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < gridSize.width &&
    position.y < gridSize.height
  );
}

// ============================================================================
// PERSONALITY-BASED BEHAVIOR
// ============================================================================

/**
 * Personality trait idle transition chances
 *
 * Per DOMAIN-FARM.md: Personality affects zombie behavior
 */
const IDLE_TRANSITION_CHANCE: Record<ZombiePersonality, number> = {
  aggressive: 0.1, // 10% chance - stays active
  defensive: 0.3, // 30% chance - moderate
  timid: 0.5, // 50% chance - often idle
  curious: 0.2, // 20% chance - stays active exploring
  lazy: 0.7, // 70% chance - frequently idle
  energetic: 0.05, // 5% chance - rarely idle
};

/**
 * Check if zombie should transition to IDLE based on personality
 *
 * Per DOMAIN-FARM.md: Different personalities exhibit different activity levels
 * - Lazy zombies idle more often
 * - Energetic zombies keep moving
 * - Aggressive zombies patrol frequently
 *
 * @param zombie - Zombie to check
 * @returns True if should become idle
 */
export function shouldTransitionToIdle(zombie: Zombie): boolean {
  // Never transition from commanded states
  if (zombie.aiState === 'following' || zombie.aiState === 'guarding') {
    return false;
  }

  // Only transition from wandering/gathering
  if (zombie.aiState !== 'wandering' && zombie.aiState !== 'gathering') {
    return false;
  }

  // Check personality-based transition chance
  const chance = IDLE_TRANSITION_CHANCE[zombie.personality];
  return Math.random() < chance;
}

/**
 * Personality trait wander range modifiers
 */
const WANDER_RANGE: Record<ZombiePersonality, number> = {
  aggressive: 8, // Patrols widely
  defensive: 3, // Stays close to home
  timid: 4, // Cautious movement
  curious: 7, // Explores broadly
  lazy: 2, // Minimal movement
  energetic: 6, // Active movement
};

/**
 * Get wander range for zombie based on personality
 *
 * @param personality - Zombie personality
 * @returns Wander range in tiles
 */
function getWanderRange(personality: ZombiePersonality): number {
  return WANDER_RANGE[personality];
}

/**
 * Personality trait activity chances (chance to start wandering from idle)
 */
const ACTIVITY_CHANCE: Record<ZombiePersonality, number> = {
  aggressive: 0.8, // 80% chance - very active
  defensive: 0.4, // 40% chance - moderate
  timid: 0.3, // 30% chance - cautious
  curious: 0.7, // 70% chance - explores often
  lazy: 0.1, // 10% chance - rarely moves
  energetic: 0.9, // 90% chance - always moving
};

/**
 * Check if idle zombie should start wandering based on personality
 *
 * @param zombie - Zombie to check
 * @returns True if should start wandering
 */
function shouldStartWandering(zombie: Zombie): boolean {
  if (zombie.aiState !== 'idle') {
    return false;
  }

  const chance = ACTIVITY_CHANCE[zombie.personality];
  return Math.random() < chance;
}

// ============================================================================
// AI UPDATE (MAIN LOOP)
// ============================================================================

/**
 * Update zombie AI state and position
 *
 * Per DOMAIN-FARM.md: Zombies exhibit autonomous behavior based on:
 * - Current AI state
 * - Personality traits
 * - Time elapsed
 *
 * @param zombie - Zombie to update
 * @param deltaTime - Time elapsed in milliseconds
 * @returns Updated zombie
 */
export function updateZombieAI(zombie: Zombie, deltaTime: number): Zombie {
  // Ignore invalid deltaTime
  if (deltaTime <= 0) {
    return zombie;
  }

  // Zombie must have position to move
  if (!zombie.position) {
    return zombie;
  }

  let updatedZombie = zombie;

  // Handle state-specific behavior
  switch (zombie.aiState) {
    case 'idle':
      // Check if should start wandering
      if (shouldStartWandering(zombie)) {
        updatedZombie = setAIState(zombie, 'wandering');
      }
      break;

    case 'wandering':
      // Check if should transition to idle
      if (shouldTransitionToIdle(zombie)) {
        updatedZombie = setAIState(zombie, 'idle');
      } else {
        // Move to new position
        const wanderRange = getWanderRange(zombie.personality);
        const newPosition = getNextWanderPosition(zombie.position, wanderRange);
        updatedZombie = {
          ...zombie,
          position: newPosition,
        };
      }
      break;

    case 'following':
      // Following behavior would track player position
      // For now, just maintain state
      break;

    case 'guarding':
      // Guarding zombies stay at assigned position
      // No movement needed
      break;

    case 'gathering':
    case 'training':
    case 'resting':
      // These states are handled by other systems
      break;
  }

  return updatedZombie;
}
