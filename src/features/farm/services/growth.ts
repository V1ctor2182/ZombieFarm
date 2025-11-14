/**
 * Growth Service
 *
 * Implements zombie growth mechanics per DOMAIN-FARM.md:
 * - Growth timer countdown
 * - Offline progress calculation
 * - Growth completion detection
 * - Quality determination
 */

import type { FarmState, Plot, ZombieQuality } from '../../../types/farm';
import type { SeedType } from '../../../types/resources';
import { PlotState } from '../../../types/farm';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

/**
 * Result type for service operations
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// ============================================================================
// GROWTH UPDATE
// ============================================================================

/**
 * Updates growth progress for all planted plots
 *
 * Reduces growthTimeRemaining by deltaTime for all PLANTED plots.
 * Does not transition plots to READY state - that's handled by harvesting logic.
 *
 * @param farmState - Current farm state
 * @param deltaTime - Time elapsed in milliseconds
 * @returns Updated farm state or error
 */
export function updateGrowth(
  farmState: FarmState,
  deltaTime: number
): Result<FarmState> {
  // Validate delta time
  if (deltaTime < 0) {
    return {
      success: false,
      error: 'Delta time cannot be negative',
    };
  }

  // If no time passed, return unchanged state
  if (deltaTime === 0) {
    return { success: true, data: farmState };
  }

  // Update each planted plot
  const updatedPlots = farmState.plots.map((plot) => {
    // Only update PLANTED plots
    if (plot.state !== PlotState.PLANTED || plot.growthTimeRemaining === null) {
      return plot;
    }

    // Calculate new remaining time (don't go below 0)
    const newRemaining = Math.max(0, plot.growthTimeRemaining - deltaTime);

    return {
      ...plot,
      growthTimeRemaining: newRemaining,
    };
  });

  return {
    success: true,
    data: {
      ...farmState,
      plots: updatedPlots,
    },
  };
}

// ============================================================================
// GROWTH COMPLETION CHECK
// ============================================================================

/**
 * Checks if a plot's zombie has completed growth
 *
 * Growth is complete when:
 * - Plot is PLANTED and growthTimeRemaining is 0
 * - Or plot is already READY
 *
 * @param plot - Plot to check
 * @returns True if zombie is ready to harvest
 */
export function checkGrowthComplete(plot: Plot): boolean {
  // Already ready
  if (plot.state === PlotState.READY) {
    return true;
  }

  // Empty plots are never ready
  if (plot.state === PlotState.EMPTY) {
    return false;
  }

  // Check if growth timer completed
  if (plot.state === PlotState.PLANTED && plot.growthTimeRemaining === 0) {
    return true;
  }

  return false;
}

// ============================================================================
// OFFLINE PROGRESS
// ============================================================================

/**
 * Calculates offline growth progress
 *
 * When player returns after being away, this advances all growth timers
 * by the offline time elapsed.
 *
 * Per DOMAIN-FARM.md:
 * - Growth continues offline
 * - Timers advance normally
 * - Zombies can complete growth while offline
 *
 * @param farmState - Current farm state
 * @param offlineTime - Time elapsed offline in milliseconds
 * @returns Updated farm state or error
 */
export function calculateOfflineGrowth(
  farmState: FarmState,
  offlineTime: number
): Result<FarmState> {
  // Validate offline time
  if (offlineTime < 0) {
    return {
      success: false,
      error: 'Offline time cannot be negative',
    };
  }

  // Use same logic as updateGrowth
  return updateGrowth(farmState, offlineTime);
}

// ============================================================================
// QUALITY DETERMINATION
// ============================================================================

/**
 * Conditions that affect zombie quality
 */
export interface QualityConditions {
  /** Was plot fertilized? */
  readonly isFertilized: boolean;
  /** Was plot watered? */
  readonly isWatered: boolean;
}

/**
 * Determines zombie quality at harvest
 *
 * Per DOMAIN-FARM.md:
 * - Base quality chances: Bronze 60%, Silver 25%, Gold 12%, Diamond 3%
 * - Fertilizer boosts quality chances by +15%
 * - Watering affects speed, not quality
 *
 * Quality is determined probabilistically using weighted random selection.
 *
 * @param seedType - Type of seed (affects zombie type)
 * @param conditions - Growth conditions (fertilized, watered, etc.)
 * @returns Quality tier for the zombie
 */
export function determineQuality(
  seedType: SeedType,
  conditions: QualityConditions
): ZombieQuality {
  // Get base quality chances from config
  const baseChances = gameConfig.ZOMBIE_GROWTH.qualityChances;

  // Apply fertilizer bonus if applicable
  let chances = { ...baseChances };
  if (conditions.isFertilized) {
    const boost = gameConfig.ZOMBIE_GROWTH.fertilizerQualityBoost; // 0.15 (15%)

    // Redistribute probabilities: reduce bronze, increase higher tiers
    // We shift 15% from bronze to higher tiers proportionally
    const bronzeReduction = boost;
    const silverBoost = boost * 0.5; // Half goes to silver
    const goldBoost = boost * 0.3; // 30% goes to gold
    const diamondBoost = boost * 0.2; // 20% goes to diamond

    chances = {
      bronze: Math.max(0, baseChances.bronze - bronzeReduction),
      silver: Math.min(1, baseChances.silver + silverBoost),
      gold: Math.min(1, baseChances.gold + goldBoost),
      diamond: Math.min(1, baseChances.diamond + diamondBoost),
    };
  }

  // Generate random number for quality selection
  const roll = Math.random();

  // Cumulative probability selection
  let cumulative = 0;

  if (roll < (cumulative += chances.bronze)) {
    return 'bronze' as ZombieQuality;
  }
  if (roll < (cumulative += chances.silver)) {
    return 'silver' as ZombieQuality;
  }
  if (roll < (cumulative += chances.gold)) {
    return 'gold' as ZombieQuality;
  }
  // Diamond is the remainder
  return 'diamond' as ZombieQuality;
}
