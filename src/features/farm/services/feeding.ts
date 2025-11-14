/**
 * Feeding Service
 *
 * Implements zombie feeding mechanics per DOMAIN-FARM.md:
 * - Feeding requires resources (Rotten Meat)
 * - Feeding prevents decay for that day (resets daysSinceLastFed)
 * - Feeding boosts happiness (+10)
 * - Feeding has 24-hour cooldown (once per day per zombie)
 * - Different zombie types may have different food requirements
 *
 * Authority: DOMAIN-FARM.md Section "Decay and Maintenance" - Feeding subsection
 */

import type { Zombie, ZombieId, FarmState } from '../../../types/farm';
import type { GameState } from '../../../types/global';
import { Resource } from '../../../types/resources';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';
import { clampHappiness } from './happiness';

/**
 * Result type for service operations
 */
export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

/**
 * Feed Zombie Result
 */
export interface FeedZombieResult {
  zombie: Zombie;
  happinessGained: number;
  resourcesConsumed: Record<string, number>;
}

/**
 * Batch Feed Result
 */
export interface BatchFeedResult {
  successfullyFed: FeedZombieResult[];
  failed: Array<{ zombieId: ZombieId; reason: string }>;
  totalResourcesConsumed: Record<string, number>;
}

/**
 * Get Feeding Cost
 *
 * Returns the resource cost to feed a zombie based on its type.
 *
 * @param zombie - Zombie to check
 * @returns Resource costs
 */
export function getFeedingCost(zombie: Zombie): Record<string, number> {
  // Get feeding cost from zombie config
  const zombieConfig = gameConfig.ZOMBIES[zombie.type];

  if (zombieConfig && zombieConfig.feedCost && zombieConfig.feedCost.resources) {
    return zombieConfig.feedCost.resources;
  }

  // Default cost: 1 Rotten Meat
  return {
    [Resource.ROTTEN_MEAT]: 1,
  };
}

/**
 * Can Feed Zombie
 *
 * Checks if a zombie can be fed (not on cooldown, not in Crypt).
 *
 * @param zombie - Zombie to check
 * @param currentGameDay - Current game day
 * @param isInCrypt - Whether zombie is in Crypt
 * @returns True if zombie can be fed
 */
export function canFeedZombie(zombie: Zombie, currentGameDay: number, isInCrypt: boolean): boolean {
  // Cannot feed Crypt zombies
  if (isInCrypt) {
    return false;
  }

  // Cannot feed if already fed today
  // daysSinceLastFed === 0 means fed today
  if (zombie.daysSinceLastFed === 0) {
    return false;
  }

  return true;
}

/**
 * Has Sufficient Resources
 *
 * Checks if the player has enough resources to feed a zombie.
 *
 * @param gameState - Current game state
 * @param resourceCost - Resource costs required
 * @returns True if player has sufficient resources
 */
export function hasSufficientResources(
  gameState: GameState,
  resourceCost: Record<string, number>
): boolean {
  for (const [resource, amount] of Object.entries(resourceCost)) {
    const available = gameState.inventory.resources[resource as Resource] || 0;
    if (available < amount) {
      return false;
    }
  }
  return true;
}

/**
 * Validate Feeding
 *
 * Validates all conditions for feeding a zombie.
 *
 * @param zombie - Zombie to feed
 * @param gameState - Current game state
 * @param currentGameDay - Current game day
 * @param isInCrypt - Whether zombie is in Crypt
 * @returns Error message if invalid, null if valid
 */
export function validateFeeding(
  zombie: Zombie,
  gameState: GameState,
  currentGameDay: number,
  isInCrypt: boolean
): string | null {
  // Check if in Crypt
  if (isInCrypt) {
    return 'Cannot feed zombies in Crypt storage';
  }

  // Check cooldown
  if (!canFeedZombie(zombie, currentGameDay, isInCrypt)) {
    return 'Zombie was already fed today';
  }

  // Check resources
  const feedingCost = getFeedingCost(zombie);
  if (!hasSufficientResources(gameState, feedingCost)) {
    return 'Insufficient resources to feed zombie';
  }

  return null; // Valid
}

/**
 * Feed Zombie
 *
 * Feeds a zombie, consuming resources and applying benefits:
 * - Resets daysSinceLastFed to 0
 * - Updates lastFedAt timestamp
 * - Increases happiness by 10
 *
 * @param zombie - Zombie to feed
 * @param gameState - Current game state
 * @param currentTime - Current timestamp (milliseconds)
 * @param currentGameDay - Current game day
 * @param isInCrypt - Whether zombie is in Crypt
 * @returns Result with updated zombie and game state, or error
 */
export function feedZombie(
  zombie: Zombie,
  gameState: GameState,
  currentTime: number,
  currentGameDay: number,
  isInCrypt: boolean = false
): Result<{ zombie: Zombie; gameState: GameState; feedResult: FeedZombieResult }> {
  // Validate feeding
  const validationError = validateFeeding(zombie, gameState, currentGameDay, isInCrypt);
  if (validationError) {
    return {
      success: false,
      error: validationError,
    };
  }

  // Get feeding cost
  const feedingCost = getFeedingCost(zombie);

  // Consume resources
  const updatedResources = { ...gameState.inventory.resources };
  for (const [resource, amount] of Object.entries(feedingCost)) {
    updatedResources[resource as Resource] -= amount;
  }

  // Apply feeding benefits to zombie
  const happinessBoost = gameConfig.HAPPINESS.FEEDING_BOOST; // +10
  const newHappiness = clampHappiness(zombie.happiness + happinessBoost);

  const updatedZombie: Zombie = {
    ...zombie,
    daysSinceLastFed: 0, // Reset decay counter
    lastFedAt: currentTime,
    happiness: newHappiness,
  };

  // Update game state
  const updatedGameState: GameState = {
    ...gameState,
    inventory: {
      ...gameState.inventory,
      resources: updatedResources,
    },
  };

  return {
    success: true,
    data: {
      zombie: updatedZombie,
      gameState: updatedGameState,
      feedResult: {
        zombie: updatedZombie,
        happinessGained: happinessBoost,
        resourcesConsumed: feedingCost,
      },
    },
  };
}

/**
 * Feed Multiple Zombies
 *
 * Feeds multiple zombies at once, consuming resources for each.
 * Stops if resources run out.
 *
 * @param zombieIds - IDs of zombies to feed
 * @param farmState - Current farm state
 * @param gameState - Current game state
 * @param currentTime - Current timestamp
 * @param currentGameDay - Current game day
 * @returns Batch feed result
 */
export function feedMultipleZombies(
  zombieIds: ZombieId[],
  farmState: FarmState,
  gameState: GameState,
  currentTime: number,
  currentGameDay: number
): Result<{ farmState: FarmState; gameState: GameState; batchResult: BatchFeedResult }> {
  const successfullyFed: FeedZombieResult[] = [];
  const failed: Array<{ zombieId: ZombieId; reason: string }> = [];
  const totalResourcesConsumed: Record<string, number> = {};

  let currentGameState = gameState;
  let currentFarmState = farmState;

  for (const zombieId of zombieIds) {
    // Find zombie in active roster
    const zombieIndex = currentFarmState.activeZombies.findIndex((z) => z.id === zombieId);
    if (zombieIndex === -1) {
      failed.push({ zombieId, reason: 'Zombie not found in active roster' as string });
      continue;
    }

    const zombie = currentFarmState.activeZombies[zombieIndex];

    // Attempt to feed
    const result = feedZombie(zombie, currentGameState, currentTime, currentGameDay, false);

    if (result.success) {
      // Update zombie in farm state
      const updatedActiveZombies = [...currentFarmState.activeZombies];
      updatedActiveZombies[zombieIndex] = result.data.zombie;

      currentFarmState = {
        ...currentFarmState,
        activeZombies: updatedActiveZombies,
      };

      currentGameState = result.data.gameState;

      // Track resources consumed
      for (const [resource, amount] of Object.entries(result.data.feedResult.resourcesConsumed)) {
        totalResourcesConsumed[resource as string] = (totalResourcesConsumed[resource as string] || 0) + amount;
      }

      successfullyFed.push(result.data.feedResult);
    } else {
      failed.push({ zombieId, reason: result.error as string });
    }
  }

  return {
    success: true,
    data: {
      farmState: currentFarmState,
      gameState: currentGameState,
      batchResult: {
        successfullyFed,
        failed,
        totalResourcesConsumed,
      },
    },
  };
}

/**
 * Get Hungry Zombies
 *
 * Returns list of zombies that need feeding (daysSinceLastFed > 0).
 *
 * @param farmState - Current farm state
 * @returns Array of hungry zombies
 */
export function getHungryZombies(farmState: FarmState): Zombie[] {
  return farmState.activeZombies.filter((zombie) => zombie.daysSinceLastFed > 0);
}

/**
 * Calculate Feeding Priority
 *
 * Calculates feeding priority for zombies (for auto-feeding).
 * Higher priority = closer to decay threshold.
 *
 * @param zombie - Zombie to calculate priority for
 * @returns Priority score (higher = more urgent)
 */
export function calculateFeedingPriority(zombie: Zombie): number {
  // Priority based on days since last fed
  let priority = zombie.daysSinceLastFed * 10;

  // Boost priority for unhappy zombies
  if (zombie.happiness < 50) {
    priority += (50 - zombie.happiness) / 10;
  }

  // Boost priority for injured zombies
  const hpPercent = zombie.stats.hp / zombie.stats.maxHp;
  if (hpPercent < 0.5) {
    priority += 10;
  }

  return priority;
}

/**
 * Get Feeding Queue
 *
 * Returns zombies sorted by feeding priority (most urgent first).
 *
 * @param farmState - Current farm state
 * @returns Zombies sorted by priority
 */
export function getFeedingQueue(farmState: FarmState): Zombie[] {
  const hungryZombies = getHungryZombies(farmState);

  return hungryZombies.sort((a, b) => {
    const priorityA = calculateFeedingPriority(a);
    const priorityB = calculateFeedingPriority(b);
    return priorityB - priorityA; // Descending order
  });
}
