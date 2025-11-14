/**
 * Decay Service
 *
 * Implements zombie decay mechanics per DOMAIN-FARM.md:
 * - Daily stat decay (quality-based rates)
 * - Decay floor (minimum stat values based on quality)
 * - Feeding prevention
 * - Crypt storage pauses decay
 * - Shelter and preservation item effects
 *
 * Authority: DOMAIN-FARM.md Section "Decay and Maintenance"
 */

import type { Zombie, ZombieQuality, FarmState, ZombieStats } from '../../../types/farm';
import type { TimeState } from '../../../types/global';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

/**
 * Quality-Based Decay Rates
 *
 * Per task requirements:
 * - Common: 1% per day
 * - Uncommon: 1.5% per day (higher quality = more unstable)
 * - Rare: 2% per day
 * - Epic: 2.5% per day
 * - Legendary/Diamond: 3% per day
 */
const QUALITY_DECAY_RATES: Record<string, number> = {
  bronze: 0.01, // 1% - Common quality
  silver: 0.015, // 1.5% - Uncommon
  gold: 0.02, // 2% - Rare
  diamond: 0.03, // 3% - Legendary
};

/**
 * Quality-Based Decay Floors
 *
 * Minimum stat percentage based on quality:
 * - Common (Bronze): 50% minimum
 * - Uncommon (Silver): 60% minimum
 * - Rare (Gold): 70% minimum
 * - Legendary (Diamond): 90% minimum
 */
const QUALITY_DECAY_FLOORS: Record<string, number> = {
  bronze: 0.5, // 50%
  silver: 0.6, // 60%
  gold: 0.7, // 70%
  diamond: 0.9, // 90%
};

/**
 * Decay Result
 *
 * Result of applying decay to a zombie.
 */
export interface DecayResult {
  zombie: Zombie;
  decayed: boolean;
  amountDecayed: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
  };
  hitFloor: boolean;
}

/**
 * Get Decay Rate for Quality
 *
 * Returns the daily decay rate for a given zombie quality.
 *
 * @param quality - Zombie quality tier
 * @returns Decay rate (0.01 = 1% per day)
 */
export function getQualityDecayRate(quality: ZombieQuality): number {
  return QUALITY_DECAY_RATES[quality] || QUALITY_DECAY_RATES.bronze;
}

/**
 * Get Decay Floor for Quality
 *
 * Returns the minimum stat percentage (decay floor) for a given quality.
 *
 * @param quality - Zombie quality tier
 * @returns Decay floor (0.5 = 50% minimum)
 */
export function getDecayFloor(quality: ZombieQuality): number {
  return QUALITY_DECAY_FLOORS[quality] || QUALITY_DECAY_FLOORS.bronze;
}

/**
 * Get Effective Decay Rate
 *
 * Calculates the effective decay rate considering all modifiers:
 * - Base quality rate
 * - Zombie type decay modifier (from stats)
 * - Shelter bonus (50% reduction)
 * - Preservation items (future)
 *
 * @param zombie - Zombie to calculate decay rate for
 * @param isSheltered - Whether zombie is in a shelter
 * @returns Effective decay rate
 */
export function getEffectiveDecayRate(zombie: Zombie, isSheltered: boolean = false): number {
  // Base rate from quality
  const baseRate = getQualityDecayRate(zombie.quality);

  // Apply zombie type modifier (from config)
  const typeModifier = zombie.stats.decayRate;

  // Combine base rate and type modifier
  let effectiveRate = baseRate * typeModifier;

  // Apply shelter reduction (50% less decay)
  if (isSheltered) {
    effectiveRate *= gameConfig.DECAY.SHELTER_DECAY_REDUCTION;
  }

  // Apply preservation item effects (future: check zombie.equipment for preservation items)
  // For now, no preservation items implemented

  return effectiveRate;
}

/**
 * Can Zombie Decay
 *
 * Checks if a zombie is eligible for decay.
 * Zombies in Crypt or recently fed do not decay.
 *
 * @param zombie - Zombie to check
 * @param isInCrypt - Whether zombie is in Crypt storage
 * @param currentGameDay - Current game day
 * @returns True if zombie can decay
 */
export function canDecay(zombie: Zombie, isInCrypt: boolean, currentGameDay: number): boolean {
  // Crypt zombies never decay
  if (isInCrypt) {
    return false;
  }

  // Zombies fed today don't decay
  // (daysSinceLastFed is incremented daily, so 0 means fed today)
  if (zombie.daysSinceLastFed === 0) {
    return false;
  }

  return true;
}

/**
 * Calculate Decayed Stats
 *
 * Calculates new stats after applying decay, enforcing decay floor.
 *
 * @param currentStats - Current zombie stats
 * @param baseStats - Original base stats (for floor calculation)
 * @param decayRate - Effective decay rate
 * @param daysSinceLastFed - Number of days unfed
 * @param quality - Zombie quality (for decay floor)
 * @returns New stats after decay
 */
export function calculateDecayedStats(
  currentStats: ZombieStats,
  baseStats: ZombieStats,
  decayRate: number,
  daysSinceLastFed: number,
  quality: ZombieQuality
): ZombieStats {
  const decayFloor = getDecayFloor(quality);

  // Calculate total decay percentage for all days unfed
  // Compound decay: each day reduces current stats by percentage
  const totalDecayMultiplier = Math.pow(1 - decayRate, daysSinceLastFed);

  // Calculate new stat values
  const newMaxHp = currentStats.maxHp * totalDecayMultiplier;
  const newAttack = currentStats.attack * totalDecayMultiplier;
  const newDefense = currentStats.defense * totalDecayMultiplier;

  // Calculate decay floors based on original base stats
  const floorMaxHp = baseStats.maxHp * decayFloor;
  const floorAttack = baseStats.attack * decayFloor;
  const floorDefense = baseStats.defense * decayFloor;

  // Enforce decay floors
  const finalMaxHp = Math.max(Math.floor(newMaxHp), Math.floor(floorMaxHp));
  const finalAttack = Math.max(Math.floor(newAttack), Math.floor(floorAttack));
  const finalDefense = Math.max(Math.floor(newDefense), Math.floor(floorDefense));

  // Current HP should not exceed new maxHp
  const finalHp = Math.min(currentStats.hp, finalMaxHp);

  return {
    ...currentStats,
    hp: finalHp,
    maxHp: finalMaxHp,
    attack: finalAttack,
    defense: finalDefense,
    // Speed, range, attackCooldown, decayRate don't decay
  };
}

/**
 * Apply Decay to Zombie
 *
 * Applies decay to a zombie's stats based on days since last fed.
 * Returns updated zombie and decay information.
 *
 * @param zombie - Zombie to apply decay to
 * @param baseStats - Original base stats (for floor calculation)
 * @param isInCrypt - Whether zombie is in Crypt
 * @param isSheltered - Whether zombie is sheltered
 * @param currentGameDay - Current game day
 * @returns Decay result with updated zombie
 */
export function applyDecay(
  zombie: Zombie,
  baseStats: ZombieStats,
  isInCrypt: boolean = false,
  isSheltered: boolean = false,
  currentGameDay: number = 1
): DecayResult {
  // Check if zombie can decay
  if (!canDecay(zombie, isInCrypt, currentGameDay)) {
    return {
      zombie,
      decayed: false,
      amountDecayed: { hp: 0, maxHp: 0, attack: 0, defense: 0 },
      hitFloor: false,
    };
  }

  // Get effective decay rate
  const decayRate = getEffectiveDecayRate(zombie, isSheltered);

  // Calculate new stats
  const oldStats = zombie.stats;
  const newStats = calculateDecayedStats(
    oldStats,
    baseStats,
    decayRate,
    zombie.daysSinceLastFed,
    zombie.quality
  );

  // Calculate amount decayed
  const amountDecayed = {
    hp: oldStats.hp - newStats.hp,
    maxHp: oldStats.maxHp - newStats.maxHp,
    attack: oldStats.attack - newStats.attack,
    defense: oldStats.defense - newStats.defense,
  };

  // Check if hit decay floor
  const decayFloor = getDecayFloor(zombie.quality);
  const hitFloor =
    newStats.maxHp <= Math.floor(baseStats.maxHp * decayFloor) ||
    newStats.attack <= Math.floor(baseStats.attack * decayFloor) ||
    newStats.defense <= Math.floor(baseStats.defense * decayFloor);

  // Create updated zombie
  const updatedZombie: Zombie = {
    ...zombie,
    stats: newStats,
  };

  return {
    zombie: updatedZombie,
    decayed: amountDecayed.maxHp > 0 || amountDecayed.attack > 0 || amountDecayed.defense > 0,
    amountDecayed,
    hitFloor,
  };
}

/**
 * Process Decay for All Zombies
 *
 * Applies decay to all eligible zombies in the farm.
 * Skips Crypt zombies.
 *
 * @param farmState - Current farm state
 * @param zombieBaseStats - Map of zombie ID to base stats
 * @param currentGameDay - Current game day
 * @returns Updated farm state with decayed zombies
 */
export function processAllZombiesDecay(
  farmState: FarmState,
  zombieBaseStats: Map<string, ZombieStats>,
  currentGameDay: number
): {
  farmState: FarmState;
  decayResults: DecayResult[];
} {
  const decayResults: DecayResult[] = [];

  // Process active zombies (not in Crypt)
  const updatedActiveZombies = farmState.activeZombies.map((zombie) => {
    const baseStats = zombieBaseStats.get(zombie.id);
    if (!baseStats) {
      // No base stats available, return unchanged
      return zombie;
    }

    // Apply decay (active zombies are not in Crypt)
    const result = applyDecay(zombie, baseStats, false, false, currentGameDay);
    decayResults.push(result);
    return result.zombie;
  });

  // Crypt zombies don't decay, keep unchanged
  const updatedCryptZombies = farmState.cryptZombies;

  return {
    farmState: {
      ...farmState,
      activeZombies: updatedActiveZombies,
      cryptZombies: updatedCryptZombies,
    },
    decayResults,
  };
}

/**
 * Increment Days Since Last Fed
 *
 * Increments the daysSinceLastFed counter for all zombies.
 * This should be called at the start of each new game day.
 *
 * @param farmState - Current farm state
 * @returns Updated farm state
 */
export function incrementDaysSinceLastFed(farmState: FarmState): FarmState {
  // Increment for active zombies
  const updatedActiveZombies = farmState.activeZombies.map((zombie) => ({
    ...zombie,
    daysSinceLastFed: zombie.daysSinceLastFed + 1,
  }));

  // Crypt zombies don't need feeding, but increment anyway for tracking
  // (they won't decay regardless of this value)
  const updatedCryptZombies = farmState.cryptZombies.map((zombie) => ({
    ...zombie,
    daysSinceLastFed: zombie.daysSinceLastFed + 1,
  }));

  return {
    ...farmState,
    activeZombies: updatedActiveZombies,
    cryptZombies: updatedCryptZombies,
  };
}

/**
 * Calculate Offline Decay
 *
 * Calculates decay for multiple days passed during offline time.
 * Integrates with time system's offline calculation.
 *
 * @param farmState - Current farm state
 * @param zombieBaseStats - Map of zombie ID to base stats
 * @param daysPassed - Number of days passed offline
 * @param currentGameDay - Current game day after offline time
 * @returns Updated farm state after offline decay
 */
export function calculateOfflineDecay(
  farmState: FarmState,
  zombieBaseStats: Map<string, ZombieStats>,
  daysPassed: number,
  currentGameDay: number
): FarmState {
  // Increment days since last fed for each day passed
  let updatedFarmState = farmState;
  for (let i = 0; i < daysPassed; i++) {
    updatedFarmState = incrementDaysSinceLastFed(updatedFarmState);
  }

  // Apply accumulated decay
  const { farmState: finalFarmState } = processAllZombiesDecay(
    updatedFarmState,
    zombieBaseStats,
    currentGameDay
  );

  return finalFarmState;
}
