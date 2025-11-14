/**
 * Harvesting Event Handlers
 *
 * Event handlers for zombie harvesting actions.
 * Integrates harvesting service with game state machine.
 */

import type { GameState } from '../../../types/global';
import type { ZombieQuality } from '../../../types/farm';
import { harvestZombie } from '../services/harvesting';
import { determineQuality } from '../services/growth';

/**
 * Result type for event handlers
 */
export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

// ============================================================================
// HARVEST EVENT
// ============================================================================

/**
 * Harvest event structure
 */
export interface HarvestEvent {
  type: 'HARVEST';
  plotId: string;
  quality: ZombieQuality;
}

/**
 * Handles HARVEST event
 *
 * Called when player harvests a ready zombie from a plot.
 *
 * Steps:
 * 1. Validate event structure
 * 2. Call harvesting service
 * 3. Update player stats (zombiesHarvested)
 * 4. Return updated game state
 *
 * @param gameState - Current game state
 * @param event - Harvest event
 * @returns Updated game state or error
 */
export function handleHarvestEvent(gameState: GameState, event: HarvestEvent): Result<GameState> {
  // Validate event structure
  if (!event.plotId || !event.quality) {
    return {
      success: false,
      error: 'Invalid harvest event: missing plotId or quality',
    };
  }

  // Call harvesting service
  const harvestResult = harvestZombie(
    gameState.farm,
    gameState.inventory,
    event.plotId,
    event.quality
  );

  if (!harvestResult.success) {
    return harvestResult as Result<GameState>;
  }

  // Update player stats
  const updatedGameState: GameState = {
    ...gameState,
    farm: harvestResult.data.farmState,
    inventory: harvestResult.data.inventory,
    player: {
      ...gameState.player,
      stats: {
        ...gameState.player.stats,
        zombiesHarvested: gameState.player.stats.zombiesHarvested + 1,
      },
    },
  };

  return {
    success: true,
    data: updatedGameState,
  };
}

// ============================================================================
// BATCH HARVEST EVENT
// ============================================================================

/**
 * Batch harvest event structure
 */
export interface BatchHarvestEvent {
  type: 'BATCH_HARVEST';
  harvests: Array<{
    plotId: string;
    quality: ZombieQuality;
  }>;
}

/**
 * Handles BATCH_HARVEST event
 *
 * Harvests multiple plots at once (e.g., "Harvest All" button).
 *
 * Steps:
 * 1. Validate event structure
 * 2. Process each harvest sequentially
 * 3. Continue on failures (partial success allowed)
 * 4. Update player stats with total harvested
 * 5. Return updated game state
 *
 * @param gameState - Current game state
 * @param event - Batch harvest event
 * @returns Updated game state or error
 */
export function handleBatchHarvestEvent(
  gameState: GameState,
  event: BatchHarvestEvent
): Result<GameState> {
  // Validate event structure
  if (!event.harvests || !Array.isArray(event.harvests)) {
    return {
      success: false,
      error: 'Invalid batch harvest event: harvests must be an array',
    };
  }

  if (event.harvests.length === 0) {
    return {
      success: false,
      error: 'Batch harvest event cannot have empty harvests list',
    };
  }

  // Process each harvest
  let currentGameState = gameState;
  let successCount = 0;
  const errors: string[] = [];

  for (const harvest of event.harvests) {
    const harvestResult = harvestZombie(
      currentGameState.farm,
      currentGameState.inventory,
      harvest.plotId,
      harvest.quality
    );

    if (harvestResult.success) {
      // Update state for next iteration
      currentGameState = {
        ...currentGameState,
        farm: harvestResult.data.farmState,
        inventory: harvestResult.data.inventory,
      };
      successCount++;
    } else {
      // Record error but continue
      errors.push(`${harvest.plotId}: ${harvestResult.error}`);
    }
  }

  // Update player stats with successful harvests
  const finalGameState: GameState = {
    ...currentGameState,
    player: {
      ...currentGameState.player,
      stats: {
        ...currentGameState.player.stats,
        zombiesHarvested: currentGameState.player.stats.zombiesHarvested + successCount,
      },
    },
  };

  return {
    success: true,
    data: finalGameState,
  };
}

// ============================================================================
// AUTO-HARVEST EVENT
// ============================================================================

/**
 * Auto-harvest event structure
 *
 * Automatically harvests all ready plots.
 */
export interface AutoHarvestEvent {
  type: 'AUTO_HARVEST';
}

/**
 * Handles AUTO_HARVEST event
 *
 * Automatically harvests all ready plots with quality determination.
 *
 * Steps:
 * 1. Find all READY plots
 * 2. Determine quality for each using growth service
 * 3. Create batch harvest event
 * 4. Process via handleBatchHarvestEvent
 *
 * @param gameState - Current game state
 * @param event - Auto-harvest event
 * @returns Updated game state or error
 */
export function handleAutoHarvestEvent(
  gameState: GameState,
  event: AutoHarvestEvent
): Result<GameState> {
  // Find all ready plots
  const readyPlots = gameState.farm.plots.filter(
    (plot) => plot.state === 'ready' && plot.plantedSeed
  );

  if (readyPlots.length === 0) {
    return {
      success: false,
      error: 'No plots ready to harvest',
    };
  }

  // Determine quality for each plot
  const harvests = readyPlots.map((plot) => {
    const quality = determineQuality(plot.plantedSeed!, {
      isFertilized: plot.isFertilized,
      isWatered: plot.isWatered,
    });

    return {
      plotId: plot.id,
      quality,
    };
  });

  // Process as batch harvest
  return handleBatchHarvestEvent(gameState, {
    type: 'BATCH_HARVEST',
    harvests,
  });
}
