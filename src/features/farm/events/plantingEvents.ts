/**
 * Planting Events
 *
 * Event handlers for seed planting actions.
 * Integrates planting service with game state management.
 *
 * Authority: DOMAIN-FARM.md, ARCHITECTURE.md (event-driven patterns)
 */

import type { GameState } from '../../../types/global';
import type { SeedType } from '../../../types/resources';
import type { GrowthTimer } from '../services/planting';
import { plantSeed } from '../services/planting';

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Plant Seed Event
 *
 * Dispatched when player attempts to plant a seed in a plot.
 */
export interface PlantSeedEvent {
  /** Event type identifier */
  readonly type: 'PLANT_SEED';

  /** Plot ID to plant in */
  readonly plotId: string;

  /** Seed type to plant */
  readonly seedType: SeedType;

  /** Timestamp of event */
  readonly timestamp: number;
}

/**
 * Plant Seed Event Result
 *
 * Result of processing a plant seed event.
 */
export interface PlantSeedEventResult {
  /** Whether event processing succeeded */
  readonly success: boolean;

  /** Error message if failed */
  readonly error?: string;

  /** Updated game state (if successful) */
  readonly updatedState?: GameState;

  /** Growth timer (if successful) */
  readonly growthTimer?: GrowthTimer;
}

// ============================================================================
// EVENT VALIDATION
// ============================================================================

/**
 * Validate Plant Seed Event
 *
 * Ensures event has required fields and valid structure.
 *
 * @param event - Event to validate
 * @returns true if event is valid
 */
function validateEvent(event: PlantSeedEvent): boolean {
  if (!event) {
    return false;
  }

  if (event.type !== 'PLANT_SEED') {
    return false;
  }

  if (!event.plotId || typeof event.plotId !== 'string') {
    return false;
  }

  if (!event.seedType || typeof event.seedType !== 'string') {
    return false;
  }

  if (!event.timestamp || typeof event.timestamp !== 'number') {
    return false;
  }

  return true;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle Plant Seed Event
 *
 * Processes a PLANT_SEED event and updates game state.
 *
 * Flow:
 * 1. Validate event structure
 * 2. Extract farm state and inventory from game state
 * 3. Apply weather bonus from time state
 * 4. Call planting service
 * 5. Update game state immutably
 * 6. Return result
 *
 * @param gameState - Current game state
 * @param event - Plant seed event
 * @returns Event processing result
 */
export function handlePlantSeedEvent(
  gameState: GameState,
  event: PlantSeedEvent
): PlantSeedEventResult {
  // Validate event structure
  if (!validateEvent(event)) {
    return {
      success: false,
      error: 'Invalid event structure',
    };
  }

  // Validate game state
  if (!gameState) {
    return {
      success: false,
      error: 'Invalid game state',
    };
  }

  // Extract relevant state
  const { farm, inventory, time } = gameState;

  // Get weather for bonus calculation
  const weather = time.weather;

  // Call planting service with weather context
  const plantingResult = plantSeed(
    farm,
    inventory,
    event.plotId,
    event.seedType,
    event.timestamp,
    weather
  );

  if (!plantingResult.success) {
    return {
      success: false,
      error: plantingResult.error,
    };
  }

  // Update game state immutably
  const updatedState: GameState = {
    ...gameState,
    farm: plantingResult.farmState!,
    inventory: plantingResult.inventory!,
  };

  return {
    success: true,
    updatedState,
    growthTimer: plantingResult.growthTimer,
  };
}

/**
 * Handle Multiple Plant Seed Events
 *
 * Processes multiple planting events in sequence.
 * Useful for batch planting operations.
 *
 * @param gameState - Initial game state
 * @param events - Array of plant seed events
 * @returns Final event processing result
 */
export function handleMultiplePlantSeedEvents(
  gameState: GameState,
  events: PlantSeedEvent[]
): PlantSeedEventResult {
  let currentState = gameState;
  const timers: GrowthTimer[] = [];

  for (const event of events) {
    const result = handlePlantSeedEvent(currentState, event);

    if (!result.success) {
      return {
        success: false,
        error: `Failed at event for plot ${event.plotId}: ${result.error}`,
      };
    }

    currentState = result.updatedState!;

    if (result.growthTimer) {
      timers.push(result.growthTimer);
    }
  }

  return {
    success: true,
    updatedState: currentState,
    growthTimer: timers[timers.length - 1], // Return last timer
  };
}
