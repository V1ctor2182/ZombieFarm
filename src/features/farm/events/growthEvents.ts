/**
 * Growth Events
 *
 * Event handlers for zombie growth progression.
 * Integrates growth service with game state management.
 *
 * Authority: DOMAIN-FARM.md, ARCHITECTURE.md (event-driven patterns)
 */

import type { GameState } from '../../../types/global';
import type { PlotId } from '../../../types/global';
import { updateGrowth, calculateOfflineGrowth } from '../services/growth';

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Growth Update Event
 *
 * Dispatched periodically to advance growth timers (typically every frame or second).
 */
export interface GrowthUpdateEvent {
  /** Event type identifier */
  readonly type: 'GROWTH_UPDATE';

  /** Time elapsed since last update (in milliseconds) */
  readonly deltaTime: number;

  /** Timestamp of event */
  readonly timestamp: number;
}

/**
 * Offline Growth Event
 *
 * Dispatched when player returns after being offline.
 * Calculates all growth progress during absence.
 */
export interface OfflineGrowthEvent {
  /** Event type identifier */
  readonly type: 'OFFLINE_GROWTH';

  /** Time elapsed offline (in milliseconds) */
  readonly offlineTime: number;

  /** Timestamp when player returned */
  readonly timestamp: number;
}

/**
 * Growth Complete Event
 *
 * Dispatched when a zombie completes growth and is ready to harvest.
 */
export interface GrowthCompleteEvent {
  /** Event type identifier */
  readonly type: 'GROWTH_COMPLETE';

  /** Plot ID where zombie completed growth */
  readonly plotId: PlotId;

  /** Timestamp of completion */
  readonly timestamp: number;
}

/**
 * Growth Event Result
 *
 * Result of processing a growth event.
 */
export interface GrowthEventResult {
  /** Whether event processing succeeded */
  readonly success: boolean;

  /** Error message if failed */
  readonly error?: string;

  /** Updated game state (if successful) */
  readonly updatedState?: GameState;

  /** Plot IDs that completed growth (for GROWTH_UPDATE) */
  readonly completedPlots?: PlotId[];
}

// ============================================================================
// EVENT VALIDATION
// ============================================================================

/**
 * Validate Growth Update Event
 */
function validateGrowthUpdateEvent(event: GrowthUpdateEvent): boolean {
  if (!event) return false;
  if (event.type !== 'GROWTH_UPDATE') return false;
  if (typeof event.deltaTime !== 'number' || event.deltaTime < 0) return false;
  if (typeof event.timestamp !== 'number') return false;
  return true;
}

/**
 * Validate Offline Growth Event
 */
function validateOfflineGrowthEvent(event: OfflineGrowthEvent): boolean {
  if (!event) return false;
  if (event.type !== 'OFFLINE_GROWTH') return false;
  if (typeof event.offlineTime !== 'number' || event.offlineTime < 0) return false;
  if (typeof event.timestamp !== 'number') return false;
  return true;
}

/**
 * Validate Growth Complete Event
 */
function validateGrowthCompleteEvent(event: GrowthCompleteEvent): boolean {
  if (!event) return false;
  if (event.type !== 'GROWTH_COMPLETE') return false;
  if (!event.plotId || typeof event.plotId !== 'string') return false;
  if (typeof event.timestamp !== 'number') return false;
  return true;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle Growth Update Event
 *
 * Advances growth timers for all planted plots.
 *
 * Flow:
 * 1. Validate event structure
 * 2. Extract farm state
 * 3. Call growth service to update timers
 * 4. Identify newly completed plots
 * 5. Update game state immutably
 * 6. Return result with completed plot IDs
 *
 * @param gameState - Current game state
 * @param event - Growth update event
 * @returns Event processing result
 */
export function handleGrowthUpdateEvent(
  gameState: GameState,
  event: GrowthUpdateEvent
): GrowthEventResult {
  // Validate event
  if (!validateGrowthUpdateEvent(event)) {
    return {
      success: false,
      error: 'Invalid growth update event structure',
    };
  }

  // Validate game state
  if (!gameState || !gameState.farm) {
    return {
      success: false,
      error: 'Invalid game state',
    };
  }

  // Extract farm state
  const { farm } = gameState;

  // Track plots that were NOT complete before update
  const previouslyIncomplete = farm.plots
    .filter(plot => plot.growthTimeRemaining !== null && plot.growthTimeRemaining > 0)
    .map(plot => plot.id);

  // Update growth timers
  const updateResult = updateGrowth(farm, event.deltaTime);

  if (!updateResult.success) {
    return {
      success: false,
      error: updateResult.error,
    };
  }

  const updatedFarm = updateResult.data;

  // Identify plots that just completed (were incomplete, now complete)
  const completedPlots = updatedFarm.plots
    .filter(plot =>
      previouslyIncomplete.includes(plot.id) &&
      plot.growthTimeRemaining === 0
    )
    .map(plot => plot.id);

  // Update game state immutably
  const updatedState: GameState = {
    ...gameState,
    farm: updatedFarm,
  };

  return {
    success: true,
    updatedState,
    completedPlots,
  };
}

/**
 * Handle Offline Growth Event
 *
 * Calculates growth progress during offline period.
 *
 * Flow:
 * 1. Validate event structure
 * 2. Extract farm state
 * 3. Call growth service to calculate offline progress
 * 4. Identify completed plots
 * 5. Update game state immutably
 * 6. Return result
 *
 * @param gameState - Current game state
 * @param event - Offline growth event
 * @returns Event processing result
 */
export function handleOfflineGrowthEvent(
  gameState: GameState,
  event: OfflineGrowthEvent
): GrowthEventResult {
  // Validate event
  if (!validateOfflineGrowthEvent(event)) {
    return {
      success: false,
      error: 'Invalid offline growth event structure',
    };
  }

  // Validate game state
  if (!gameState || !gameState.farm) {
    return {
      success: false,
      error: 'Invalid game state',
    };
  }

  // Extract farm state
  const { farm } = gameState;

  // Track plots that were NOT complete before offline period
  const previouslyIncomplete = farm.plots
    .filter(plot => plot.growthTimeRemaining !== null && plot.growthTimeRemaining > 0)
    .map(plot => plot.id);

  // Calculate offline growth
  const offlineResult = calculateOfflineGrowth(farm, event.offlineTime);

  if (!offlineResult.success) {
    return {
      success: false,
      error: offlineResult.error,
    };
  }

  const updatedFarm = offlineResult.data;

  // Identify plots that completed during offline period
  const completedPlots = updatedFarm.plots
    .filter(plot =>
      previouslyIncomplete.includes(plot.id) &&
      plot.growthTimeRemaining === 0
    )
    .map(plot => plot.id);

  // Update game state immutably
  const updatedState: GameState = {
    ...gameState,
    farm: updatedFarm,
  };

  return {
    success: true,
    updatedState,
    completedPlots,
  };
}

/**
 * Handle Growth Complete Event
 *
 * Marks a plot as ready for harvest when growth completes.
 * This is typically dispatched after a GROWTH_UPDATE detects completion.
 *
 * Note: Actual state transition to READY happens during harvesting.
 * This event is mainly for triggering notifications/UI updates.
 *
 * @param gameState - Current game state
 * @param event - Growth complete event
 * @returns Event processing result
 */
export function handleGrowthCompleteEvent(
  gameState: GameState,
  event: GrowthCompleteEvent
): GrowthEventResult {
  // Validate event
  if (!validateGrowthCompleteEvent(event)) {
    return {
      success: false,
      error: 'Invalid growth complete event structure',
    };
  }

  // Validate game state
  if (!gameState || !gameState.farm) {
    return {
      success: false,
      error: 'Invalid game state',
    };
  }

  // Find the plot
  const plot = gameState.farm.plots.find(p => p.id === event.plotId);

  if (!plot) {
    return {
      success: false,
      error: `Plot ${event.plotId} not found`,
    };
  }

  // Verify plot is actually complete
  if (plot.growthTimeRemaining !== 0) {
    return {
      success: false,
      error: `Plot ${event.plotId} growth is not complete`,
    };
  }

  // This event doesn't modify state - it's for notifications
  // The actual READY transition happens during harvest
  return {
    success: true,
    updatedState: gameState,
    completedPlots: [event.plotId],
  };
}
