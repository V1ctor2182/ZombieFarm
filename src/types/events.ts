/**
 * Event Type Definitions
 *
 * Defines all game events using discriminated unions for type safety.
 * Events are the primary mechanism for state transitions in the game.
 */

import type { ZombieId, PlotId, BuildingId, LocationId, BattleId, Position } from './global';
import type { SeedType, Resource, Currency, Item } from './resources';
import type { ZombieType, Building } from './farm';
import type { BattleResult } from './combat';

/**
 * Game Event
 *
 * Discriminated union of all possible game events.
 */
export type GameEvent = FarmEvent | CombatEvent | SystemEvent | WorldEvent | UIEvent;

// ============================================================================
// FARM EVENTS
// ============================================================================

/**
 * Farm Event
 *
 * Events related to farm activities.
 */
export type FarmEvent =
  // Planting & Harvesting
  | { type: 'seed.planted'; payload: { plotId: PlotId; seedType: SeedType; timestamp: number } }
  | { type: 'plot.watered'; payload: { plotId: PlotId; timestamp: number } }
  | { type: 'plot.fertilized'; payload: { plotId: PlotId; timestamp: number } }
  | { type: 'zombie.matured'; payload: { plotId: PlotId; zombieId: ZombieId; timestamp: number } }
  | { type: 'zombie.harvested'; payload: { plotId: PlotId; zombieId: ZombieId; timestamp: number } }

  // Zombie Management
  | { type: 'zombie.fed'; payload: { zombieId: ZombieId; foodItem: Resource; timestamp: number } }
  | { type: 'zombie.pet'; payload: { zombieId: ZombieId; timestamp: number } }
  | { type: 'zombie.toCrypt'; payload: { zombieId: ZombieId; timestamp: number } }
  | { type: 'zombie.fromCrypt'; payload: { zombieId: ZombieId; timestamp: number } }
  | {
      type: 'zombie.command';
      payload: { zombieId: ZombieId; command: string; targetPosition?: Position };
    }
  | { type: 'zombie.died'; payload: { zombieId: ZombieId; reason: string; timestamp: number } }

  // Zombie Progression
  | { type: 'zombie.levelUp'; payload: { zombieId: ZombieId; newLevel: number; timestamp: number } }
  | { type: 'zombie.mutated'; payload: { zombieId: ZombieId; mutation: string; timestamp: number } }
  | { type: 'zombie.equipped'; payload: { zombieId: ZombieId; slot: string; itemId: string } }
  | { type: 'zombie.unequipped'; payload: { zombieId: ZombieId; slot: string } }

  // Building & Construction
  | {
      type: 'building.placed';
      payload: { buildingId: BuildingId; type: string; position: Position; timestamp: number };
    }
  | { type: 'building.constructed'; payload: { buildingId: BuildingId; timestamp: number } }
  | {
      type: 'building.upgraded';
      payload: { buildingId: BuildingId; newLevel: number; timestamp: number };
    }
  | { type: 'building.demolished'; payload: { buildingId: BuildingId; timestamp: number } }

  // Resource Management
  | {
      type: 'resource.gathered';
      payload: { resource: Resource; amount: number; nodeId?: string; timestamp: number };
    }
  | {
      type: 'resource.spent';
      payload: { resource: Resource; amount: number; reason: string; timestamp: number };
    }
  | {
      type: 'resource.node.harvested';
      payload: { nodeId: string; resource: Resource; amount: number; timestamp: number };
    }
  | { type: 'resource.node.depleted'; payload: { nodeId: string; timestamp: number } }

  // Farm Expansion
  | {
      type: 'farm.expanded';
      payload: { newLevel: number; newSize: { width: number; height: number }; timestamp: number };
    }

  // Time & Weather
  | { type: 'time.dayChanged'; payload: { newDay: number; timestamp: number } }
  | {
      type: 'time.hourChanged';
      payload: { newHour: number; isDaytime: boolean; timestamp: number };
    }
  | {
      type: 'weather.changed';
      payload: { newWeather: string; duration: number; timestamp: number };
    }

  // Decay & Maintenance
  | { type: 'decay.applied'; payload: { zombieId: ZombieId; amount: number; timestamp: number } }
  | {
      type: 'happiness.changed';
      payload: { zombieId: ZombieId; oldValue: number; newValue: number; reason: string };
    };

// ============================================================================
// COMBAT EVENTS
// ============================================================================

/**
 * Combat Event
 *
 * Events related to combat and battles.
 */
export type CombatEvent =
  // Battle Lifecycle
  | {
      type: 'battle.initiated';
      payload: { battleId: BattleId; locationId: LocationId; timestamp: number };
    }
  | {
      type: 'battle.squadSelected';
      payload: { battleId: BattleId; zombieIds: ReadonlyArray<ZombieId> };
    }
  | { type: 'battle.started'; payload: { battleId: BattleId; timestamp: number } }
  | {
      type: 'battle.ended';
      payload: { battleId: BattleId; result: BattleResult; timestamp: number };
    }
  | {
      type: 'battle.retreated';
      payload: { battleId: BattleId; survivors: ReadonlyArray<ZombieId>; timestamp: number };
    }

  // Combat Actions
  | {
      type: 'unit.spawned';
      payload: { battleId: BattleId; unitId: string; unitType: string; position: Position };
    }
  | {
      type: 'unit.moved';
      payload: { battleId: BattleId; unitId: string; from: Position; to: Position };
    }
  | {
      type: 'unit.attacked';
      payload: {
        battleId: BattleId;
        attackerId: string;
        targetId: string;
        damage: number;
        damageType: string;
      };
    }
  | {
      type: 'unit.damaged';
      payload: { battleId: BattleId; unitId: string; damage: number; newHp: number };
    }
  | {
      type: 'unit.healed';
      payload: { battleId: BattleId; unitId: string; amount: number; newHp: number };
    }
  | { type: 'unit.died'; payload: { battleId: BattleId; unitId: string; killerId?: string } }

  // Status Effects
  | {
      type: 'status.applied';
      payload: { battleId: BattleId; unitId: string; effect: string; duration: number };
    }
  | { type: 'status.removed'; payload: { battleId: BattleId; unitId: string; effect: string } }

  // Abilities
  | {
      type: 'ability.used';
      payload: {
        battleId: BattleId;
        unitId: string;
        abilityId: string;
        targetIds: ReadonlyArray<string>;
      };
    }

  // Wave Management
  | {
      type: 'wave.spawned';
      payload: { battleId: BattleId; waveNumber: number; enemyIds: ReadonlyArray<string> };
    }
  | { type: 'wave.completed'; payload: { battleId: BattleId; waveNumber: number } }

  // Obstacles
  | {
      type: 'obstacle.damaged';
      payload: { battleId: BattleId; obstacleId: string; damage: number; newHp: number };
    }
  | { type: 'obstacle.destroyed'; payload: { battleId: BattleId; obstacleId: string } }
  | {
      type: 'trap.triggered';
      payload: { battleId: BattleId; trapId: string; victimId: string; damage: number };
    };

// ============================================================================
// WORLD EVENTS
// ============================================================================

/**
 * World Event
 *
 * Events related to world exploration and progression.
 */
export type WorldEvent =
  | { type: 'location.unlocked'; payload: { locationId: LocationId; timestamp: number } }
  | { type: 'location.conquered'; payload: { locationId: LocationId; timestamp: number } }
  | {
      type: 'location.raided';
      payload: { locationId: LocationId; success: boolean; timestamp: number };
    }
  | { type: 'world.regionUnlocked'; payload: { regionId: string; timestamp: number } };

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

/**
 * System Event
 *
 * Events related to game system operations.
 */
export type SystemEvent =
  // Game Lifecycle
  | { type: 'game.started'; payload: { timestamp: number } }
  | { type: 'game.loaded'; payload: { saveVersion: string; timestamp: number } }
  | { type: 'game.saved'; payload: { timestamp: number } }
  | { type: 'game.paused'; payload: { timestamp: number } }
  | { type: 'game.resumed'; payload: { timestamp: number } }
  | { type: 'game.over'; payload: { reason: string; timestamp: number } }

  // Tutorial
  | { type: 'tutorial.started'; payload: { timestamp: number } }
  | { type: 'tutorial.stepCompleted'; payload: { stepId: string; timestamp: number } }
  | { type: 'tutorial.completed'; payload: { timestamp: number } }

  // Player Progression
  | { type: 'player.levelUp'; payload: { newLevel: number; timestamp: number } }
  | { type: 'player.xpGained'; payload: { amount: number; source: string; timestamp: number } }
  | { type: 'achievement.unlocked'; payload: { achievementId: string; timestamp: number } }
  | { type: 'quest.started'; payload: { questId: string; timestamp: number } }
  | { type: 'quest.completed'; payload: { questId: string; rewards: unknown; timestamp: number } }
  | { type: 'tech.researched'; payload: { techId: string; timestamp: number } }

  // Offline Progress
  | {
      type: 'offline.calculated';
      payload: { timeAway: number; eventsProcessed: number; timestamp: number };
    }

  // Errors
  | { type: 'error.occurred'; payload: { errorType: string; message: string; timestamp: number } };

// ============================================================================
// UI EVENTS
// ============================================================================

/**
 * UI Event
 *
 * Events related to user interface interactions.
 */
export type UIEvent =
  // Modal Management
  | { type: 'modal.opened'; payload: { modalType: string; data?: unknown } }
  | { type: 'modal.closed'; payload: { modalType: string } }

  // Notifications
  | {
      type: 'notification.shown';
      payload: { notificationType: string; message: string; duration?: number };
    }
  | { type: 'notification.dismissed'; payload: { notificationId: string } }

  // Panel Management
  | { type: 'panel.opened'; payload: { panelType: string; data?: unknown } }
  | { type: 'panel.closed'; payload: { panelType: string } }

  // Scene Changes
  | { type: 'scene.changed'; payload: { from: string; to: string; timestamp: number } }

  // HUD Updates
  | { type: 'hud.updated'; payload: { element: string; value: unknown } };

// ============================================================================
// EVENT HELPERS
// ============================================================================

/**
 * Extract event type from event object
 */
export type EventType = GameEvent['type'];

/**
 * Extract payload type for a specific event type
 */
export type EventPayload<T extends EventType> = Extract<GameEvent, { type: T }>['payload'];

/**
 * Event Handler
 *
 * Function that handles a specific event type.
 */
export type EventHandler<T extends EventType = EventType> = (
  event: Extract<GameEvent, { type: T }>
) => void | Promise<void>;

/**
 * Event Listener
 *
 * Registered event listener with cleanup.
 */
export interface EventListener {
  readonly type: EventType;
  readonly handler: EventHandler;
  readonly once?: boolean;
}

/**
 * Event Bus Interface
 *
 * Global event bus for pub/sub communication.
 */
export interface EventBus {
  /**
   * Emit an event
   */
  emit<T extends EventType>(event: Extract<GameEvent, { type: T }>): void;

  /**
   * Subscribe to an event
   */
  on<T extends EventType>(type: T, handler: EventHandler<T>): () => void;

  /**
   * Subscribe to an event (one-time)
   */
  once<T extends EventType>(type: T, handler: EventHandler<T>): () => void;

  /**
   * Unsubscribe from an event
   */
  off<T extends EventType>(type: T, handler: EventHandler<T>): void;

  /**
   * Unsubscribe all handlers for an event type
   */
  offAll(type: EventType): void;

  /**
   * Clear all event listeners
   */
  clear(): void;
}

/**
 * Event Metadata
 *
 * Additional metadata attached to events for debugging/analytics.
 */
export interface EventMetadata {
  /** Unique event ID */
  readonly eventId: string;

  /** Event timestamp */
  readonly timestamp: number;

  /** Source of the event (user action, system, timer, etc.) */
  readonly source: string;

  /** Session ID */
  readonly sessionId: string;
}
