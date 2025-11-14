/**
 * Resource Type Definitions
 *
 * Defines all resource types, currencies, and inventory management.
 * Resources are gathered on the farm and consumed for building, crafting, and zombie care.
 */

/**
 * Resource Type
 *
 * All collectible resources in the game.
 * Primary farm resources as defined in DOMAIN-FARM.md.
 */
export enum Resource {
  // Primary Farm Resources
  ROTTEN_WOOD = 'rottedWood',       // Basic building material from dead trees
  BONES = 'bones',                   // Building material from graves/skeletons
  BLOOD_WATER = 'bloodWater',        // For watering zombie crops, speeds growth
  CORPSE_DUST = 'corpseDust',        // Fertilizer from Corpse Composter
  SOUL_FRAGMENTS = 'soulFragments',  // From defeated enemies, magical uses

  // Secondary Resources
  IRON_SCRAPS = 'ironScraps',        // Metal from ruins or defeated soldiers
  CLOTH = 'cloth',                   // From looting or defeating enemies
  BRAINS = 'brains',                 // Premium zombie food, major happiness boost
  ROTTEN_MEAT = 'rottenMeat',        // Standard zombie food
  HOLY_WATER = 'holyWater',          // From cathedrals, used in dark rituals
  COAL = 'coal',                     // Fuel for certain structures
  TAR = 'tar',                       // From swamp expansions
  GRAVE_DIRT = 'graveDirt',          // Special soil for premium zombie growth

  // Crafted Materials
  BONE_MEAL = 'boneMeal',            // Processed bones, fertilizer
  EMBALMING_FLUID = 'embalmingFluid',// Reduces decay rate
  DARK_ESSENCE = 'darkEssence',      // Crafted magical material
}

/**
 * Currency Type
 *
 * Special resources used as currency.
 */
export enum Currency {
  DARK_COINS = 'darkCoins',          // Primary currency from raids
  SOUL_ESSENCE = 'soulEssence',      // Premium currency from major battles
}

/**
 * Seed Type
 *
 * Zombie seeds that can be planted.
 */
export enum SeedType {
  // Basic Tier
  SHAMBLER_SEED = 'shamblerSeed',
  RUNNER_SEED = 'runnerSeed',

  // Advanced Tier
  BRUTE_SEED = 'bruteSeed',
  SPITTER_SEED = 'spitterSeed',
  GHOUL_SEED = 'ghoulSeed',

  // Elite Tier
  ABOMINATION_SEED = 'abominationSeed',
  LICH_SEED = 'lichSeed',
  BONE_KNIGHT_SEED = 'boneKnightSeed',

  // Special/Rare
  PRIEST_ZOMBIE_SEED = 'priestZombieSeed',  // From Cathedral
  EXPLOSIVE_ZOMBIE_SEED = 'explosiveZombieSeed',
  NECROMANCER_ZOMBIE_SEED = 'necromancerZombieSeed',
}

/**
 * Item Type
 *
 * Special items (not stackable resources).
 */
export interface Item {
  /** Unique item ID */
  readonly id: string;

  /** Item type identifier */
  readonly type: string;

  /** Display name */
  readonly name: string;

  /** Description */
  readonly description: string;

  /** Rarity/quality */
  readonly quality: ItemQuality;

  /** Item-specific data */
  readonly data: Record<string, unknown>;
}

/**
 * Item Quality
 */
export enum ItemQuality {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * Inventory
 *
 * Player's collection of resources, currencies, seeds, and items.
 */
export interface Inventory {
  /** Resource quantities (stackable) */
  readonly resources: Readonly<Record<Resource, number>>;

  /** Currency amounts */
  readonly currencies: Readonly<Record<Currency, number>>;

  /** Seed quantities */
  readonly seeds: Readonly<Record<SeedType, number>>;

  /** Special items (non-stackable) */
  readonly items: ReadonlyArray<Item>;

  /** Maximum inventory capacity (if limited) */
  readonly capacity: number;

  /** Current total item count */
  readonly currentCount: number;
}

/**
 * Resource Cost
 *
 * Represents a cost in resources/currencies for actions.
 */
export interface ResourceCost {
  readonly resources?: Readonly<Partial<Record<Resource, number>>>;
  readonly currencies?: Readonly<Partial<Record<Currency, number>>>;
  readonly seeds?: Readonly<Partial<Record<SeedType, number>>>;
}

/**
 * Resource Reward
 *
 * Represents a reward in resources/currencies from actions.
 */
export interface ResourceReward {
  readonly resources?: Readonly<Partial<Record<Resource, number>>>;
  readonly currencies?: Readonly<Partial<Record<Currency, number>>>;
  readonly seeds?: Readonly<Partial<Record<SeedType, number>>>;
  readonly items?: ReadonlyArray<Item>;
}

/**
 * Resource Node
 *
 * A harvestable resource source on the farm (trees, graves, wells, etc.)
 */
export interface ResourceNode {
  /** Unique node ID */
  readonly id: string;

  /** Node type (determines what resource it yields) */
  readonly type: ResourceNodeType;

  /** Position on farm grid */
  readonly position: { readonly x: number; readonly y: number };

  /** Current state */
  readonly state: ResourceNodeState;

  /** Time until next harvest available (if depleted) */
  readonly cooldownRemaining: number;

  /** Total yield capacity before depletion */
  readonly capacity: number;

  /** Current remaining capacity */
  readonly remaining: number;
}

/**
 * Resource Node Type
 */
export enum ResourceNodeType {
  DEAD_TREE = 'deadTree',           // Yields Rotten Wood
  GRAVE_MOUND = 'graveMound',       // Yields Bones, Grave Dirt
  BLOOD_WELL = 'bloodWell',         // Yields Blood Water (refills over time)
  RUIN = 'ruin',                    // Yields Iron Scraps, Cloth
  BONE_PILE = 'bonePile',           // Yields Bones
  SWAMP_TAR = 'swampTar',           // Yields Tar (from swamp expansion)
}

/**
 * Resource Node State
 */
export enum ResourceNodeState {
  READY = 'ready',                  // Can be harvested
  DEPLETED = 'depleted',            // Harvested, on cooldown
  PERMANENT = 'permanent',          // Permanent structure (e.g., built well)
}

/**
 * Helper type for resource amounts
 */
export type ResourceAmount = Readonly<Partial<Record<Resource, number>>>;

/**
 * Helper type for currency amounts
 */
export type CurrencyAmount = Readonly<Partial<Record<Currency, number>>>;

/**
 * Helper type for seed amounts
 */
export type SeedAmount = Readonly<Partial<Record<SeedType, number>>>;
