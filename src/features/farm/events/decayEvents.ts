/**
 * Decay & Maintenance Event Definitions
 *
 * Events emitted by the decay, feeding, and happiness systems.
 */

import type { ZombieId } from '../../../types/farm';

/**
 * Zombie Decayed Event
 *
 * Emitted when a zombie's stats decay due to neglect.
 */
export interface ZombieDecayedEvent {
  type: 'ZOMBIE_DECAYED';
  payload: {
    zombieId: ZombieId;
    zombieName: string;
    amountDecayed: {
      hp: number;
      maxHp: number;
      attack: number;
      defense: number;
    };
    hitFloor: boolean;
    daysSinceLastFed: number;
    timestamp: number;
  };
}

/**
 * Zombie Fed Event
 *
 * Emitted when a zombie is fed.
 */
export interface ZombieFedEvent {
  type: 'ZOMBIE_FED';
  payload: {
    zombieId: ZombieId;
    zombieName: string;
    happinessGained: number;
    resourcesConsumed: Record<string, number>;
    timestamp: number;
  };
}

/**
 * Zombie Pet Event
 *
 * Emitted when a zombie is pet by the player.
 */
export interface ZombiePetEvent {
  type: 'ZOMBIE_PET';
  payload: {
    zombieId: ZombieId;
    zombieName: string;
    happinessGained: number;
    newHappiness: number;
    timestamp: number;
  };
}

/**
 * Zombie Happiness Changed Event
 *
 * Emitted when a zombie's happiness changes significantly.
 */
export interface ZombieHappinessChangedEvent {
  type: 'ZOMBIE_HAPPINESS_CHANGED';
  payload: {
    zombieId: ZombieId;
    zombieName: string;
    oldHappiness: number;
    newHappiness: number;
    change: number;
    timestamp: number;
  };
}

/**
 * Zombie Unhappy Event
 *
 * Emitted when a zombie becomes very unhappy (threshold crossed).
 */
export interface ZombieUnhappyEvent {
  type: 'ZOMBIE_UNHAPPY';
  payload: {
    zombieId: ZombieId;
    zombieName: string;
    happiness: number;
    reason: string;
    timestamp: number;
  };
}

/**
 * Batch Feed Completed Event
 *
 * Emitted when a batch feeding operation completes.
 */
export interface BatchFeedCompletedEvent {
  type: 'BATCH_FEED_COMPLETED';
  payload: {
    successCount: number;
    failureCount: number;
    totalResourcesConsumed: Record<string, number>;
    timestamp: number;
  };
}

/**
 * Daily Decay Processed Event
 *
 * Emitted when daily decay is processed for all zombies.
 */
export interface DailyDecayProcessedEvent {
  type: 'DAILY_DECAY_PROCESSED';
  payload: {
    zombiesDecayed: number;
    zombiesPreserved: number;
    gameDay: number;
    timestamp: number;
  };
}

/**
 * Union type of all decay/maintenance events
 */
export type DecayEvent =
  | ZombieDecayedEvent
  | ZombieFedEvent
  | ZombiePetEvent
  | ZombieHappinessChangedEvent
  | ZombieUnhappyEvent
  | BatchFeedCompletedEvent
  | DailyDecayProcessedEvent;
