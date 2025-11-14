/**
 * World Type Definitions
 *
 * Defines types for the world map, locations, and exploration.
 */

import type { LocationId, Position } from './global';
import type { EnemyType } from './combat';
import type { ResourceReward } from './resources';

/**
 * World State
 *
 * State of the world map and exploration progress.
 */
export interface WorldState {
  /** All locations in the world */
  readonly locations: ReadonlyArray<Location>;

  /** Currently unlocked location IDs */
  readonly unlockedLocations: ReadonlyArray<LocationId>;

  /** Conquered location IDs */
  readonly conqueredLocations: ReadonlyArray<LocationId>;

  /** Current region ID */
  readonly currentRegion: string;

  /** Unlocked region IDs */
  readonly unlockedRegions: ReadonlyArray<string>;
}

/**
 * Location
 *
 * A raidable location on the world map.
 */
export interface Location {
  /** Unique location ID */
  readonly id: LocationId;

  /** Display name */
  readonly name: string;

  /** Description */
  readonly description: string;

  /** Location type */
  readonly type: LocationType;

  /** Region this location belongs to */
  readonly regionId: string;

  /** Difficulty level (1-10) */
  readonly difficulty: number;

  /** Recommended zombie level */
  readonly recommendedLevel: number;

  /** Position on world map */
  readonly mapPosition: Position;

  /** Is this location unlocked? */
  readonly isUnlocked: boolean;

  /** Has this location been conquered? */
  readonly isConquered: boolean;

  /** Enemy composition */
  readonly enemies: ReadonlyArray<LocationEnemy>;

  /** Fortifications/obstacles */
  readonly fortifications: ReadonlyArray<string>;

  /** Number of waves */
  readonly waves: number;

  /** Rewards for first victory */
  readonly firstTimeRewards: ResourceReward;

  /** Rewards for repeat victories */
  readonly repeatRewards: ResourceReward;

  /** Special unlocks (blueprints, seeds, etc.) */
  readonly unlocks: ReadonlyArray<string>;

  /** Cooldown before can be raided again (hours) */
  readonly raidCooldown: number;

  /** Time when location can be raided next */
  readonly nextRaidAvailable: number | null;

  /** Prerequisites to unlock this location */
  readonly prerequisites: LocationPrerequisites;

  /** Lore/story text */
  readonly lore?: string;
}

/**
 * Location Type
 */
export enum LocationType {
  // Human Settlements
  VILLAGE = 'village',              // Small settlement, easy
  TOWN = 'town',                    // Medium settlement, moderate
  CITY = 'city',                    // Large settlement, hard
  CAPITAL = 'capital',              // Capital city, very hard

  // Military
  OUTPOST = 'outpost',              // Military outpost
  CAMP = 'camp',                    // Military camp
  FORTRESS = 'fortress',            // Military fortress
  CASTLE = 'castle',                // Castle, heavily defended

  // Religious
  CHAPEL = 'chapel',                // Small chapel
  CHURCH = 'church',                // Church
  CATHEDRAL = 'cathedral',          // Cathedral, holy enemies

  // Economic
  FARM = 'farm',                    // Human farm
  MINE = 'mine',                    // Mine, resources
  LUMBER_MILL = 'lumberMill',       // Lumber mill, wood resources
  MARKET = 'market',                // Market, loot

  // Special
  RUINS = 'ruins',                  // Ancient ruins
  CRYPT = 'crypt',                  // Other necromancer's crypt
  LABORATORY = 'laboratory',        // Alchemist/scientist lab
  BOSS = 'boss',                    // Unique boss encounter
}

/**
 * Location Enemy
 *
 * Enemy composition for a location.
 */
export interface LocationEnemy {
  /** Enemy type */
  readonly type: EnemyType;

  /** Number of this enemy type */
  readonly count: number;

  /** Wave this enemy spawns in (1-based) */
  readonly wave: number;

  /** Spawn position or zone */
  readonly spawnZone?: string;

  /** Is this a boss unit? */
  readonly isBoss?: boolean;

  /** Level modifier (multiplies base stats) */
  readonly levelModifier?: number;
}

/**
 * Location Prerequisites
 *
 * Requirements to unlock a location.
 */
export interface LocationPrerequisites {
  /** Required player level */
  readonly playerLevel?: number;

  /** Required conquered location IDs */
  readonly conqueredLocations?: ReadonlyArray<LocationId>;

  /** Required unlocked tech IDs */
  readonly unlockedTech?: ReadonlyArray<string>;

  /** Required quest completion */
  readonly completedQuests?: ReadonlyArray<string>;

  /** Required zombie count */
  readonly zombieCount?: number;

  /** Required zombie level */
  readonly zombieLevel?: number;
}

/**
 * Region
 *
 * A region/area on the world map containing multiple locations.
 */
export interface Region {
  /** Unique region ID */
  readonly id: string;

  /** Display name */
  readonly name: string;

  /** Description */
  readonly description: string;

  /** Region type/biome */
  readonly biome: RegionBiome;

  /** Locations in this region */
  readonly locationIds: ReadonlyArray<LocationId>;

  /** Is this region unlocked? */
  readonly isUnlocked: boolean;

  /** Prerequisites to unlock */
  readonly prerequisites: RegionPrerequisites;

  /** Special mechanics for this region */
  readonly mechanics?: string[];

  /** Lore/story text */
  readonly lore?: string;
}

/**
 * Region Biome
 */
export enum RegionBiome {
  GRASSLAND = 'grassland',          // Starting area
  FOREST = 'forest',                // Dense forest
  SWAMP = 'swamp',                  // Dark swamp
  MOUNTAINS = 'mountains',          // Mountain range
  DESERT = 'desert',                // Desert wasteland
  TUNDRA = 'tundra',                // Frozen tundra
  CORRUPTION = 'corruption',        // Corrupted/cursed land
}

/**
 * Region Prerequisites
 */
export interface RegionPrerequisites {
  /** Required player level */
  readonly playerLevel?: number;

  /** Required conquered regions */
  readonly conqueredRegions?: ReadonlyArray<string>;

  /** Required locations conquered */
  readonly conqueredLocations?: ReadonlyArray<LocationId>;
}

/**
 * World Map Node
 *
 * Visual representation of a location on the world map.
 */
export interface WorldMapNode {
  /** Location ID */
  readonly locationId: LocationId;

  /** Position on map canvas */
  readonly position: Position;

  /** Connected node IDs (paths) */
  readonly connections: ReadonlyArray<LocationId>;

  /** Visual state */
  readonly visualState: NodeVisualState;
}

/**
 * Node Visual State
 */
export enum NodeVisualState {
  LOCKED = 'locked',                // Not yet unlocked
  UNLOCKED = 'unlocked',            // Unlocked, not conquered
  CONQUERED = 'conquered',          // Conquered
  AVAILABLE = 'available',          // Can be raided now
  COOLDOWN = 'cooldown',            // On cooldown
}
