/**
 * Planting Service
 *
 * Implements zombie seed planting system per DOMAIN-FARM.md.
 *
 * Key mechanics:
 * - Validates plot availability (must be empty)
 * - Checks seed inventory
 * - Applies growth modifiers (watering, fertilizer, weather)
 * - Initializes growth timer
 * - Updates farm state immutably
 *
 * Authority: DOMAIN-FARM.md Section "Planting"
 */

import type { FarmState, Plot, PlotState } from '../../../types/farm';
import type { Inventory, SeedType } from '../../../types/resources';
import type { Weather } from '../../../types/global';
import { ZombieType } from '../../../types/farm';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

// ============================================================================
// SEED TYPE MAPPING
// ============================================================================

/**
 * Map SeedType to ZombieType
 *
 * Converts seed string identifiers to zombie enum values.
 */
function seedTypeToZombieType(seedType: SeedType): ZombieType | null {
  const mapping: Record<string, ZombieType> = {
    shamblerSeed: ZombieType.SHAMBLER,
    runnerSeed: ZombieType.RUNNER,
    bruteSeed: ZombieType.BRUTE,
    spitterSeed: ZombieType.SPITTER,
    ghoulSeed: ZombieType.GHOUL,
    abominationSeed: ZombieType.ABOMINATION,
    lichSeed: ZombieType.LICH,
    boneKnightSeed: ZombieType.BONE_KNIGHT,
    priestZombieSeed: ZombieType.PRIEST_ZOMBIE,
    explosiveZombieSeed: ZombieType.EXPLOSIVE_ZOMBIE,
    necromancerZombieSeed: ZombieType.NECROMANCER_ZOMBIE,
  };

  return mapping[seedType] || null;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Growth Timer
 *
 * Tracks growth progress for a planted zombie seed.
 */
export interface GrowthTimer {
  /** Plot ID this timer is for */
  readonly plotId: string;

  /** Seed type being grown */
  readonly seedType: SeedType;

  /** When planting occurred */
  readonly startedAt: number;

  /** Base growth time without modifiers (ms) */
  readonly baseGrowthTime: number;

  /** Actual remaining time with modifiers applied (ms) */
  readonly remainingTime: number;
}

/**
 * Planting Result
 *
 * Result of attempting to plant a seed.
 */
export interface PlantingResult {
  /** Whether planting succeeded */
  readonly success: boolean;

  /** Error message if failed */
  readonly error?: string;

  /** Updated farm state (if successful) */
  readonly farmState?: FarmState;

  /** Updated inventory (if successful) */
  readonly inventory?: Inventory;

  /** Growth timer (if successful) */
  readonly growthTimer?: GrowthTimer;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate Plot
 *
 * Checks if a plot is valid and available for planting.
 *
 * @param plot - Plot to validate
 * @returns true if plot is empty and ready for planting
 */
export function validatePlot(plot: Plot | null | undefined): boolean {
  if (!plot) {
    return false;
  }

  // Plot must be in EMPTY state
  return plot.state === ('empty' as PlotState);
}

/**
 * Validate Seed Availability
 *
 * Checks if a seed type is available in inventory.
 *
 * @param inventory - Player inventory
 * @param seedType - Seed type to check
 * @returns true if at least 1 seed is available
 */
export function validateSeedAvailability(
  inventory: Inventory | null | undefined,
  seedType: SeedType
): boolean {
  if (!inventory || !inventory.seeds) {
    return false;
  }

  const seedCount = inventory.seeds[seedType];

  // Must have at least 1 seed and count must be positive
  return typeof seedCount === 'number' && seedCount > 0;
}

// ============================================================================
// BONUS CALCULATION
// ============================================================================

/**
 * Calculate Planting Bonus
 *
 * Calculates growth speed modifier based on plot conditions and weather.
 *
 * Per DOMAIN-FARM.md:
 * - Watering: +50% growth speed (0.5 bonus)
 * - Fertilizer: +30% growth speed (0.3 bonus)
 * - Blood Rain: +20% growth speed (0.2 bonus)
 * - Bright Sun: -10% growth speed (-0.1 penalty)
 * - Bonuses stack additively
 *
 * @param plot - Plot being planted
 * @param weather - Current weather condition
 * @returns Bonus multiplier (0.5 = 50% faster, -0.1 = 10% slower)
 */
export function calculatePlantingBonus(plot: Plot, weather: Weather): number {
  let bonus = 0;

  // Watering bonus: 50% faster growth
  if (plot.isWatered) {
    bonus += 0.5;
  }

  // Fertilizer bonus: 30% faster growth
  if (plot.isFertilized) {
    bonus += 0.3;
  }

  // Weather effects
  switch (weather) {
    case 'bloodRain':
      // Blood rain accelerates undead growth
      bonus += 0.2;
      break;
    case 'brightSun':
      // Bright sun slows undead (they prefer darkness)
      bonus -= 0.1;
      break;
    case 'clear':
    case 'fog':
      // No weather effect
      break;
  }

  return bonus;
}

// ============================================================================
// GROWTH TIMER
// ============================================================================

/**
 * Start Growth Timer
 *
 * Creates a growth timer with appropriate time calculations.
 *
 * Formula: actualTime = baseTime / (1 + bonus)
 * - If bonus is 0.5 (50% faster): actualTime = baseTime / 1.5
 * - If bonus is -0.1 (10% slower): actualTime = baseTime / 0.9
 *
 * Minimum time: 1 second (prevents negative or zero times)
 *
 * @param plotId - Plot ID
 * @param seedType - Seed type being planted
 * @param bonus - Growth speed bonus/penalty
 * @param timestamp - Current timestamp
 * @returns Growth timer configuration
 */
export function startGrowthTimer(
  plotId: string,
  seedType: SeedType,
  bonus: number,
  timestamp: number
): GrowthTimer {
  // Convert seed type to zombie type
  const zombieType = seedTypeToZombieType(seedType);

  if (!zombieType) {
    throw new Error(`Invalid seed type: ${seedType}`);
  }

  // Get base growth time from config
  const zombieConfig = gameConfig.ZOMBIES[zombieType];

  if (!zombieConfig) {
    throw new Error(`No configuration found for zombie type: ${zombieType}`);
  }

  const baseGrowthTimeMinutes = zombieConfig.growthTimeMinutes;
  const baseGrowthTime = baseGrowthTimeMinutes * 60 * 1000; // Convert to milliseconds

  // Apply bonus: time = baseTime / (1 + bonus)
  // Ensure denominator is never zero or negative
  const multiplier = Math.max(0.001, 1 + bonus); // Minimum 0.001 to avoid division by zero
  let remainingTime = baseGrowthTime / multiplier;

  // Enforce minimum time of 1 second
  remainingTime = Math.max(1000, remainingTime);

  return {
    plotId,
    seedType,
    startedAt: timestamp,
    baseGrowthTime,
    remainingTime,
  };
}

// ============================================================================
// MAIN PLANTING FUNCTION
// ============================================================================

/**
 * Plant Seed
 *
 * Plants a zombie seed in a plot, updating farm state and inventory.
 *
 * Process:
 * 1. Validate plot exists and is empty
 * 2. Validate seed is available in inventory
 * 3. Calculate growth bonuses
 * 4. Create growth timer
 * 5. Update plot state to PLANTED
 * 6. Decrement seed count
 * 7. Return updated state immutably
 *
 * @param farmState - Current farm state
 * @param inventory - Current inventory
 * @param plotId - ID of plot to plant in
 * @param seedType - Type of seed to plant
 * @param timestamp - Current timestamp
 * @returns Planting result with updated state or error
 */
export function plantSeed(
  farmState: FarmState | null | undefined,
  inventory: Inventory | null | undefined,
  plotId: string,
  seedType: SeedType,
  timestamp: number,
  weather?: Weather
): PlantingResult {
  // Validate inputs
  if (!farmState) {
    return {
      success: false,
      error: 'Invalid farm state',
    };
  }

  if (!inventory) {
    return {
      success: false,
      error: 'Invalid inventory',
    };
  }

  // Find the plot
  const plot = farmState.plots.find(p => p.id === plotId);

  if (!plot) {
    return {
      success: false,
      error: 'Plot not found',
    };
  }

  // Validate plot is empty
  if (!validatePlot(plot)) {
    return {
      success: false,
      error: 'Plot is not empty',
    };
  }

  // Validate seed type exists and convert to zombie type
  const zombieType = seedTypeToZombieType(seedType);

  if (!zombieType) {
    return {
      success: false,
      error: 'Invalid seed type',
    };
  }

  const zombieConfig = gameConfig.ZOMBIES[zombieType];

  if (!zombieConfig) {
    return {
      success: false,
      error: 'Invalid seed type',
    };
  }

  // Validate seed availability
  if (!validateSeedAvailability(inventory, seedType)) {
    return {
      success: false,
      error: 'Seed not available',
    };
  }

  // Calculate growth bonus
  const currentWeather = weather || ('clear' as Weather); // Default to clear if not provided
  const bonus = calculatePlantingBonus(plot, currentWeather);

  // Create growth timer
  const growthTimer = startGrowthTimer(plotId, seedType, bonus, timestamp);

  // Update plot state immutably
  const updatedPlots = farmState.plots.map(p => {
    if (p.id === plotId) {
      return {
        ...p,
        state: 'planted' as PlotState,
        plantedSeed: seedType,
        plantedAt: timestamp,
        baseGrowthTime: growthTimer.baseGrowthTime,
        growthTimeRemaining: growthTimer.remainingTime,
      };
    }
    return p;
  });

  // Update inventory immutably (decrement seed count)
  const updatedSeeds = {
    ...inventory.seeds,
    [seedType]: inventory.seeds[seedType] - 1,
  };

  const updatedInventory: Inventory = {
    ...inventory,
    seeds: updatedSeeds,
  };

  const updatedFarmState: FarmState = {
    ...farmState,
    plots: updatedPlots,
  };

  return {
    success: true,
    farmState: updatedFarmState,
    inventory: updatedInventory,
    growthTimer,
  };
}
