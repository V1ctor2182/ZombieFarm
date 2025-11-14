/**
 * Global Type Definitions
 *
 * Core game types used across the entire application.
 * These types define the root game state structure and fundamental game concepts.
 */

import type { FarmState } from './farm';
import type { CombatState } from './combat';
import type { Inventory } from './resources';
import type { WorldState } from './world';
import type { UIState } from './ui';

/**
 * Game Mode
 *
 * Represents the current high-level state/scene of the game.
 */
export enum GameMode {
  LOADING = 'loading',
  TUTORIAL = 'tutorial',
  FARM = 'farm',
  COMBAT = 'combat',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
}

/**
 * Time State
 *
 * Tracks the in-game time, day/night cycle, and weather.
 * Day/night cycle: 30 minutes real-time (20 min day, 10 min night).
 */
export interface TimeState {
  /** Current in-game day (starts at 1) */
  readonly day: number;

  /** Current hour in 24-hour format (0-23) */
  readonly hour: number;

  /** Minutes within the hour (0-59) */
  readonly minute: number;

  /** Current season (affects events, growth rates, etc.) */
  readonly season: Season;

  /** Is it currently daytime? (6:00-20:00) */
  readonly isDaytime: boolean;

  /** Current weather condition */
  readonly weather: Weather;

  /** Timestamp of last update (for offline progress calculation) */
  readonly lastUpdate: number;
}

/**
 * Season
 *
 * Different seasons affect game mechanics (growth rates, events, etc.)
 */
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
}

/**
 * Weather
 *
 * Weather conditions that affect gameplay.
 */
export enum Weather {
  CLEAR = 'clear',
  BLOOD_RAIN = 'bloodRain',    // Accelerates growth, refills Blood Wells
  FOG = 'fog',                  // Cosmetic, slight raid chance reduction
  BRIGHT_SUN = 'brightSun',     // Slows undead growth, reduces happiness
}

/**
 * Player
 *
 * Represents the player (Necromancer) character.
 */
export interface Player {
  /** Unique player ID */
  readonly id: string;

  /** Player name */
  readonly name: string;

  /** Necromancer level (1-100) */
  readonly level: number;

  /** Current experience points */
  readonly xp: number;

  /** XP required for next level */
  readonly xpToNextLevel: number;

  /** Completed achievement IDs */
  readonly achievements: ReadonlyArray<string>;

  /** Completed quest IDs */
  readonly completedQuests: ReadonlyArray<string>;

  /** Active quest IDs */
  readonly activeQuests: ReadonlyArray<string>;

  /** Unlocked technology/research IDs */
  readonly unlockedTech: ReadonlyArray<string>;

  /** Tutorial completion flags */
  readonly tutorialFlags: Readonly<Record<string, boolean>>;

  /** Statistics for achievements and progression */
  readonly stats: PlayerStats;
}

/**
 * Player Statistics
 *
 * Tracks player accomplishments for achievements and progression.
 */
export interface PlayerStats {
  /** Total zombies harvested (lifetime) */
  readonly zombiesHarvested: number;

  /** Total zombies lost in combat (lifetime) */
  readonly zombiesLost: number;

  /** Total battles won */
  readonly battlesWon: number;

  /** Total battles lost */
  readonly battlesLost: number;

  /** Total locations conquered */
  readonly locationsConquered: number;

  /** Total Dark Coins earned (lifetime) */
  readonly darkCoinsEarned: number;

  /** Total resources gathered (by type) */
  readonly resourcesGathered: Readonly<Record<string, number>>;

  /** Highest zombie level achieved */
  readonly highestZombieLevel: number;

  /** Total play time in seconds */
  readonly totalPlayTime: number;
}

/**
 * Game State
 *
 * Root state container for the entire game.
 * This is the single source of truth managed by XState.
 */
export interface GameState {
  /** Current game mode/scene */
  readonly mode: GameMode;

  /** Player data */
  readonly player: Player;

  /** Farm state (plots, zombies, buildings, resources) */
  readonly farm: FarmState;

  /** Combat state (active battles only) */
  readonly combat: CombatState | null;

  /** Player inventory (resources and items) */
  readonly inventory: Inventory;

  /** World state (locations, progression) */
  readonly world: WorldState;

  /** UI state (modals, notifications) */
  readonly ui: UIState;

  /** Time and weather state */
  readonly time: TimeState;

  /** Save metadata */
  readonly meta: SaveMetadata;
}

/**
 * Save Metadata
 *
 * Information about the save file itself.
 */
export interface SaveMetadata {
  /** Save file version (for migration) */
  readonly version: string;

  /** When the save was created */
  readonly createdAt: number;

  /** When the save was last updated */
  readonly lastSavedAt: number;

  /** Total play time in seconds */
  readonly totalPlayTime: number;
}

/**
 * Position
 *
 * 2D coordinate on the farm grid or battlefield.
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Dimensions
 *
 * Width and height for rectangular areas.
 */
export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

/**
 * ID Types
 *
 * Type aliases for clarity in function signatures.
 */
export type ZombieId = string;
export type PlotId = string;
export type BuildingId = string;
export type LocationId = string;
export type EnemyId = string;
export type BattleId = string;
export type ResourceType = string;
export type ItemId = string;

/**
 * Rarity/Quality Tier
 *
 * Used for items, zombies, and other game elements.
 */
export enum QualityTier {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}
