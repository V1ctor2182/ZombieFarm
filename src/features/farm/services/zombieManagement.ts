/**
 * Zombie Management Service
 *
 * Implements active zombie management system per DOMAIN-FARM.md:
 * - Active zombie capacity management (starts at 10, expandable to ~100)
 * - Crypt storage overflow handling
 * - Deploy/store zombies between active roster and Crypt
 * - Capacity checking and validation
 *
 * Authority: DOMAIN-FARM.md Section "Capacity and the Crypt"
 */

import type { FarmState, Zombie, ZombieId } from '../../../types/farm';
import type { Position } from '../../../types/global';
import { ZombieAIState } from '../../../types/farm';

/**
 * Result type for service operations
 */
export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

// ============================================================================
// CAPACITY CHECKS
// ============================================================================

/**
 * Get available capacity on active roster
 *
 * @param farmState - Current farm state
 * @returns Number of available slots
 */
export function getAvailableCapacity(farmState: FarmState): number {
  const currentActive = farmState.activeZombies.length;
  const capacity = farmState.activeZombieCapacity;
  return Math.max(0, capacity - currentActive);
}

/**
 * Check if zombie can be added to active roster
 *
 * @param farmState - Current farm state
 * @returns True if under capacity
 */
export function canAddToActiveRoster(farmState: FarmState): boolean {
  return farmState.activeZombies.length < farmState.activeZombieCapacity;
}

/**
 * Check if new zombie should be sent to Crypt
 *
 * Per DOMAIN-FARM.md: Excess zombies automatically go to Crypt storage
 *
 * @param farmState - Current farm state
 * @returns True if at capacity (should use Crypt)
 */
export function shouldSendToCrypt(farmState: FarmState): boolean {
  return !canAddToActiveRoster(farmState);
}

// ============================================================================
// CRYPT MANAGEMENT
// ============================================================================

/**
 * Send zombie from active roster to Crypt
 *
 * Per DOMAIN-FARM.md:
 * - Zombies in Crypt are inactive (no decay, no resource consumption)
 * - Position is reset to null
 * - AI state is reset to IDLE
 *
 * @param farmState - Current farm state
 * @param zombieId - Zombie to store
 * @returns Updated farm state or error
 */
export function sendToCrypt(farmState: FarmState, zombieId: ZombieId): Result<FarmState> {
  // Find zombie in active roster
  const zombieIndex = farmState.activeZombies.findIndex((z) => z.id === zombieId);
  if (zombieIndex === -1) {
    return {
      success: false,
      error: `Zombie ${zombieId} not found in active roster`,
    };
  }

  const zombie = farmState.activeZombies[zombieIndex];

  // Create updated zombie for Crypt (reset position and AI state)
  const cryptZombie: Zombie = {
    ...zombie,
    position: null,
    aiState: ZombieAIState.IDLE,
  };

  // Remove from active roster, add to Crypt
  const newActiveZombies = [
    ...farmState.activeZombies.slice(0, zombieIndex),
    ...farmState.activeZombies.slice(zombieIndex + 1),
  ];

  const newCryptZombies = [...farmState.cryptZombies, cryptZombie];

  return {
    success: true,
    data: {
      ...farmState,
      activeZombies: newActiveZombies,
      cryptZombies: newCryptZombies,
    },
  };
}

/**
 * Deploy zombie from Crypt to active roster
 *
 * Per DOMAIN-FARM.md:
 * - Can only deploy if space available
 * - Zombie gets default spawn position
 * - AI state set to IDLE
 *
 * @param farmState - Current farm state
 * @param zombieId - Zombie to deploy
 * @returns Updated farm state or error
 */
export function deployFromCrypt(farmState: FarmState, zombieId: ZombieId): Result<FarmState> {
  // Check capacity
  if (!canAddToActiveRoster(farmState)) {
    return {
      success: false,
      error: 'Active roster at capacity. Cannot deploy zombie from Crypt.',
    };
  }

  // Find zombie in Crypt
  const zombieIndex = farmState.cryptZombies.findIndex((z) => z.id === zombieId);
  if (zombieIndex === -1) {
    return {
      success: false,
      error: `Zombie ${zombieId} not found in Crypt`,
    };
  }

  const zombie = farmState.cryptZombies[zombieIndex];

  // Create updated zombie for active roster (set spawn position)
  const activeZombie: Zombie = {
    ...zombie,
    position: getDefaultSpawnPosition(farmState),
    aiState: ZombieAIState.IDLE,
  };

  // Remove from Crypt, add to active roster
  const newCryptZombies = [
    ...farmState.cryptZombies.slice(0, zombieIndex),
    ...farmState.cryptZombies.slice(zombieIndex + 1),
  ];

  const newActiveZombies = [...farmState.activeZombies, activeZombie];

  return {
    success: true,
    data: {
      ...farmState,
      activeZombies: newActiveZombies,
      cryptZombies: newCryptZombies,
    },
  };
}

/**
 * Get default spawn position for newly deployed zombie
 *
 * Per LAYOUT-FARM.md: Zombies spawn near Crypt entrance (default: right side of farm)
 *
 * @param farmState - Current farm state
 * @returns Spawn position
 */
function getDefaultSpawnPosition(farmState: FarmState): Position {
  // Spawn near center-right (near Crypt entrance per LAYOUT-FARM.md)
  const { width, height } = farmState.gridSize;
  return {
    x: Math.floor(width * 0.75), // 75% to the right
    y: Math.floor(height * 0.5), // Center vertically
  };
}

// ============================================================================
// CAPACITY INCREASE
// ============================================================================

/**
 * Increase active zombie capacity
 *
 * Per DOMAIN-FARM.md:
 * - Starts at 10, expandable to ~100 via structures and upgrades
 * - Mausoleums add +5 each
 * - Research/upgrades can add more
 *
 * @param farmState - Current farm state
 * @param amount - Amount to increase (must be positive)
 * @returns Updated farm state or error
 */
export function increaseCapacity(farmState: FarmState, amount: number): Result<FarmState> {
  if (amount <= 0) {
    return {
      success: false,
      error: 'Capacity increase must be a positive number',
    };
  }

  const newCapacity = Math.min(farmState.activeZombieCapacity + amount, 100);

  return {
    success: true,
    data: {
      ...farmState,
      activeZombieCapacity: newCapacity,
    },
  };
}
