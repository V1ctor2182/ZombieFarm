/**
 * Farm Type Definitions
 *
 * Defines all farm-related types: plots, zombies, buildings, and farm state.
 * Based on DOMAIN-FARM.md specifications.
 */

import type { Position, ZombieId, PlotId, BuildingId } from './global';
import type { SeedType, ResourceNode } from './resources';

/**
 * Farm State
 *
 * Complete state of the player's farm.
 */
export interface FarmState {
  /** All plots on the farm */
  readonly plots: ReadonlyArray<Plot>;

  /** Active zombies roaming the farm */
  readonly activeZombies: ReadonlyArray<Zombie>;

  /** Zombies stored in the Crypt (inactive, no decay) */
  readonly cryptZombies: ReadonlyArray<Zombie>;

  /** Buildings constructed on the farm */
  readonly buildings: ReadonlyArray<Building>;

  /** Resource nodes (harvestable) */
  readonly resourceNodes: ReadonlyArray<ResourceNode>;

  /** Maximum active zombie capacity */
  readonly activeZombieCapacity: number;

  /** Farm expansion level */
  readonly expansionLevel: number;

  /** Farm grid dimensions */
  readonly gridSize: { readonly width: number; readonly height: number };
}

// ============================================================================
// PLOTS
// ============================================================================

/**
 * Plot
 *
 * A farming plot where zombie seeds are planted and grown.
 */
export interface Plot {
  /** Unique plot ID */
  readonly id: PlotId;

  /** Position on farm grid */
  readonly position: Position;

  /** Current state */
  readonly state: PlotState;

  /** Planted seed (if any) */
  readonly plantedSeed: SeedType | null;

  /** Time when planting occurred */
  readonly plantedAt: number | null;

  /** Base growth time in milliseconds */
  readonly baseGrowthTime: number | null;

  /** Remaining growth time in milliseconds */
  readonly growthTimeRemaining: number | null;

  /** Has been watered (speeds growth) */
  readonly isWatered: boolean;

  /** Has been fertilized (boosts quality) */
  readonly isFertilized: boolean;

  /** Zombie ID (when ready to harvest) */
  readonly zombieId: ZombieId | null;
}

/**
 * Plot State
 */
export enum PlotState {
  EMPTY = 'empty', // No seed planted
  PLANTED = 'planted', // Seed planted, growing
  READY = 'ready', // Zombie ready to harvest
}

// ============================================================================
// ZOMBIES
// ============================================================================

/**
 * Zombie
 *
 * A living undead unit on the farm.
 */
export interface Zombie {
  /** Unique zombie ID */
  readonly id: ZombieId;

  /** Zombie type */
  readonly type: ZombieType;

  /** Display name (generated or custom) */
  readonly name: string;

  /** Zombie quality tier */
  readonly quality: ZombieQuality;

  /** Current level (1-100) */
  readonly level: number;

  /** Current XP */
  readonly xp: number;

  /** XP needed for next level */
  readonly xpToNextLevel: number;

  /** Combat stats */
  readonly stats: ZombieStats;

  /** Current happiness (0-100) */
  readonly happiness: number;

  /** Days since last fed */
  readonly daysSinceLastFed: number;

  /** Last time this zombie was fed */
  readonly lastFedAt: number | null;

  /** Last time this zombie was pet */
  readonly lastPetAt: number | null;

  /** Mutations (special traits) */
  readonly mutations: ReadonlyArray<string>;

  /** Equipment/items (if any) */
  readonly equipment: ZombieEquipment;

  /** Position on farm (if active) */
  readonly position: Position | null;

  /** Current AI state (if active on farm) */
  readonly aiState: ZombieAIState;

  /** Time when zombie was created */
  readonly createdAt: number;
}

/**
 * Zombie Type
 *
 * Different zombie archetypes with distinct behaviors and stats.
 */
export enum ZombieType {
  // Basic Tier
  SHAMBLER = 'shambler', // Slow, tanky, basic zombie
  RUNNER = 'runner', // Fast, fragile, high DPS

  // Advanced Tier
  BRUTE = 'brute', // Very tanky, AoE damage, structure breaker
  SPITTER = 'spitter', // Ranged, toxic damage
  GHOUL = 'ghoul', // Balanced melee, life steal

  // Elite Tier
  ABOMINATION = 'abomination', // Massive HP, slow, huge damage
  LICH = 'lich', // Ranged caster, dark magic, support
  BONE_KNIGHT = 'boneKnight', // Armored, high defense, tactical

  // Special
  PRIEST_ZOMBIE = 'priestZombie', // Holy-undead hybrid, heals undead
  EXPLOSIVE_ZOMBIE = 'explosiveZombie', // Explodes on death
  NECROMANCER_ZOMBIE = 'necromancerZombie', // Can resurrect fallen allies
}

/**
 * Zombie Quality
 *
 * Determines base stat multipliers and appearance.
 */
export enum ZombieQuality {
  BRONZE = 'bronze', // 1.0x stats
  SILVER = 'silver', // 1.25x stats
  GOLD = 'gold', // 1.5x stats
  DIAMOND = 'diamond', // 2.0x stats
}

/**
 * Zombie Stats
 *
 * Combat and maintenance stats for a zombie.
 */
export interface ZombieStats {
  /** Current hit points */
  readonly hp: number;

  /** Maximum hit points */
  readonly maxHp: number;

  /** Attack power */
  readonly attack: number;

  /** Defense/armor */
  readonly defense: number;

  /** Movement speed (tiles per second) */
  readonly speed: number;

  /** Attack range (tiles) */
  readonly range: number;

  /** Attack cooldown (seconds) */
  readonly attackCooldown: number;

  /** Decay rate modifier (1.0 = normal) */
  readonly decayRate: number;
}

/**
 * Zombie Equipment
 *
 * Items equipped to the zombie.
 */
export interface ZombieEquipment {
  /** Weapon (boosts attack) */
  readonly weapon: string | null;

  /** Armor (boosts defense) */
  readonly armor: string | null;

  /** Accessory (special effects) */
  readonly accessory: string | null;
}

/**
 * Zombie AI State
 *
 * Current behavior state for zombies roaming the farm.
 */
export enum ZombieAIState {
  IDLE = 'idle', // Standing still
  WANDERING = 'wandering', // Random movement
  FOLLOWING = 'following', // Following player command
  GUARDING = 'guarding', // Staying at assigned location
  GATHERING = 'gathering', // Gathering resource
  TRAINING = 'training', // Using training dummy
  RESTING = 'resting', // In shelter/structure
}

// ============================================================================
// BUILDINGS
// ============================================================================

/**
 * Building
 *
 * Constructed structures on the farm.
 */
export interface Building {
  /** Unique building ID */
  readonly id: BuildingId;

  /** Building type */
  readonly type: BuildingType;

  /** Position on farm grid */
  readonly position: Position;

  /** Building level (for upgradeable buildings) */
  readonly level: number;

  /** Current state */
  readonly state: BuildingState;

  /** Time when construction started */
  readonly constructionStartedAt: number | null;

  /** Construction time remaining (if building) */
  readonly constructionTimeRemaining: number | null;

  /** Building-specific data */
  readonly data: Record<string, unknown>;
}

/**
 * Building Type
 */
export enum BuildingType {
  // Core Buildings
  COMMAND_CENTER = 'commandCenter', // Main building, unlocks research
  CRYPT = 'crypt', // Stores inactive zombies

  // Production Buildings
  ZOMBIE_PLOT = 'zombiePlot', // Plot for growing zombies
  BLOOD_WELL = 'bloodWell', // Produces Blood Water
  CORPSE_COMPOSTER = 'corpseComposter', // Converts waste to Corpse Dust
  BONE_MILL = 'boneMill', // Processes bones to Bone Meal

  // Capacity Buildings
  MAUSOLEUM = 'mausoleum', // Increases zombie capacity
  CRYPT_EXPANSION = 'cryptExpansion', // Increases storage capacity

  // Training & Support
  TRAINING_DUMMY = 'trainingDummy', // Zombies train here for XP
  STITCHING_STATION = 'stitchingStation', // Heals injured zombies
  GUARD_TOWER = 'guardTower', // Defense against raids

  // Decorations (boost happiness)
  BONFIRE = 'bonfire',
  PUMPKIN_SCARECROW = 'pumpkinScarecrow',
  GALLOWS = 'gallows',

  // Defensive Structures
  WOODEN_SPIKES = 'woodenSpikes',
  STONE_WALL = 'stoneWall',
  TRAP = 'trap',
}

/**
 * Building State
 */
export enum BuildingState {
  BUILDING = 'building', // Under construction
  ACTIVE = 'active', // Operational
  DAMAGED = 'damaged', // Damaged, needs repair
  DISABLED = 'disabled', // Temporarily disabled
}

// ============================================================================
// ZOMBIE GROWTH & HARVESTING
// ============================================================================

/**
 * Zombie Growth Config
 *
 * Configuration for zombie growth mechanics.
 */
export interface ZombieGrowthConfig {
  /** Base growth time in minutes */
  readonly baseGrowthTime: number;

  /** Growth time reduction from watering (%) */
  readonly wateringSpeedBoost: number;

  /** Growth time reduction from fertilizer (%) */
  readonly fertilizerSpeedBoost: number;

  /** Quality chance modifiers */
  readonly qualityChances: Readonly<Record<ZombieQuality, number>>;
}

// ============================================================================
// DECAY & MAINTENANCE
// ============================================================================

/**
 * Decay Config
 *
 * Configuration for zombie decay mechanics.
 */
export interface DecayConfig {
  /** Daily stat decay percentage (unfed zombies) */
  readonly dailyDecayRate: number;

  /** Minimum stat percentage (decay floor) */
  readonly decayFloor: number;

  /** Daily happiness decay (unfed zombies) */
  readonly dailyHappinessDecay: number;

  /** Happiness boost from feeding */
  readonly feedingHappinessBoost: number;

  /** Happiness boost from petting */
  readonly pettingHappinessBoost: number;

  /** Cooldown between petting same zombie (hours) */
  readonly pettingCooldown: number;
}

/**
 * Happiness Factors
 *
 * Factors that affect zombie happiness.
 */
export interface HappinessFactor {
  readonly fed: number; // +10 if fed today
  readonly pet: number; // +5 if pet today
  readonly environment: number; // +/- based on farm cleanliness
  readonly social: number; // +5 if other zombies nearby
  readonly entertainment: number; // +5 if decorations nearby
  readonly injured: number; // -10 if below 50% HP
}
