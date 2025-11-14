/**
 * Harvesting Service
 *
 * Implements zombie harvesting system per DOMAIN-FARM.md:
 * - Harvest ready zombies from plots
 * - Generate zombie with stats based on type and quality
 * - Apply quality multipliers (Bronze 1.0x, Silver 1.25x, Gold 1.5x, Diamond 2.0x)
 * - Random mutation system
 * - Add zombie to active roster or Crypt
 * - Clear plot for replanting
 * - Resource byproduct drops
 *
 * Authority: DOMAIN-FARM.md Section "Harvesting"
 */

import type {
  FarmState,
  Plot,
  Zombie,
  ZombieStats,
  ZombieType,
  ZombieQuality,
} from '../../../types/farm';
import type { Inventory, SeedType, Resource } from '../../../types/resources';
import { PlotState, ZombieAIState } from '../../../types/farm';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

/**
 * Result type for service operations
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Map SeedType to ZombieType
 */
function seedTypeToZombieType(seedType: SeedType): ZombieType | null {
  const mapping: Record<string, ZombieType> = {
    shamblerSeed: 'shambler' as ZombieType,
    runnerSeed: 'runner' as ZombieType,
    bruteSeed: 'brute' as ZombieType,
    spitterSeed: 'spitter' as ZombieType,
    ghoulSeed: 'ghoul' as ZombieType,
    abominationSeed: 'abomination' as ZombieType,
    lichSeed: 'lich' as ZombieType,
    boneKnightSeed: 'boneKnight' as ZombieType,
    priestZombieSeed: 'priestZombie' as ZombieType,
    explosiveZombieSeed: 'explosiveZombie' as ZombieType,
    necromancerZombieSeed: 'necromancerZombie' as ZombieType,
  };

  return mapping[seedType] || null;
}

// ============================================================================
// VALIDATE HARVEST
// ============================================================================

/**
 * Validates that a plot can be harvested
 *
 * Per DOMAIN-FARM.md:
 * - Plot must be in READY state
 * - Plot must have planted seed
 * - Growth must be complete (growthTimeRemaining = 0)
 *
 * @param plot - Plot to validate
 * @returns Success or error
 */
export function validateHarvest(plot: Plot): Result<void> {
  // Check plot state
  if (plot.state === PlotState.EMPTY) {
    return {
      success: false,
      error: 'Cannot harvest from empty plot',
    };
  }

  if (plot.state !== PlotState.READY) {
    return {
      success: false,
      error: 'Plot is not ready to harvest',
    };
  }

  // Check planted seed exists
  if (!plot.plantedSeed) {
    return {
      success: false,
      error: 'Plot has no planted seed',
    };
  }

  return { success: true, data: undefined };
}

// ============================================================================
// GENERATE ZOMBIE STATS
// ============================================================================

/**
 * Generates zombie stats based on type and quality
 *
 * Per DOMAIN-FARM.md:
 * - Base stats come from zombie type config
 * - Quality multipliers applied (Bronze 1.0x, Silver 1.25x, Gold 1.5x, Diamond 2.0x)
 * - New zombies start at full HP
 *
 * @param zombieType - Type of zombie
 * @param quality - Quality tier
 * @returns Zombie stats
 */
export function generateZombieStats(
  zombieType: ZombieType,
  quality: ZombieQuality
): ZombieStats {
  // Get base stats from config
  const zombieConfig = gameConfig.ZOMBIES[zombieType];
  if (!zombieConfig) {
    throw new Error(`Unknown zombie type: ${zombieType}`);
  }

  const baseStats = zombieConfig.baseStats;

  // Apply quality multiplier
  return applyQualityMultiplier(
    {
      hp: baseStats.maxHp,
      maxHp: baseStats.maxHp,
      attack: baseStats.attack,
      defense: baseStats.defense,
      speed: baseStats.speed,
      range: baseStats.range,
      attackCooldown: baseStats.attackCooldown,
      decayRate: baseStats.decayRate,
    },
    quality
  );
}

// ============================================================================
// APPLY QUALITY MULTIPLIER
// ============================================================================

/**
 * Applies quality multiplier to zombie stats
 *
 * Per DOMAIN-FARM.md quality multipliers:
 * - Bronze: 1.0x (no change)
 * - Silver: 1.25x
 * - Gold: 1.5x
 * - Diamond: 2.0x
 *
 * @param baseStats - Base stats before quality
 * @param quality - Quality tier
 * @returns Stats with quality multiplier applied
 */
export function applyQualityMultiplier(
  baseStats: ZombieStats,
  quality: ZombieQuality
): ZombieStats {
  const multiplier = gameConfig.QUALITY_MULTIPLIERS[quality];

  // Round stats to avoid floating point issues
  const round = (n: number) => Math.round(n);

  return {
    hp: round(baseStats.hp * multiplier),
    maxHp: round(baseStats.maxHp * multiplier),
    attack: round(baseStats.attack * multiplier),
    defense: round(baseStats.defense * multiplier),
    speed: baseStats.speed, // Speed not affected by quality
    range: baseStats.range, // Range not affected
    attackCooldown: baseStats.attackCooldown, // Cooldown not affected
    decayRate: baseStats.decayRate, // Decay rate not affected
  };
}

// ============================================================================
// APPLY MUTATIONS
// ============================================================================

/**
 * Available mutation types
 */
const MUTATION_TYPES = [
  'Regeneration', // Slowly heals over time
  'Thick Skin', // +defense
  'Bloodlust', // +attack
  'Swift', // +speed
  'Venomous', // Attacks apply poison
  'Resilient', // Reduced decay rate
  'Explosive Finish', // Explodes on death
  'Pack Leader', // Boosts nearby zombies
  'Berserker', // Gains attack as HP lowers
  'Armored', // Additional damage reduction
];

/**
 * Applies random mutations to zombie
 *
 * Per DOMAIN-FARM.md:
 * - Mutations are rare special traits
 * - Higher quality zombies have higher mutation chance
 * - Mutations provide unique bonuses
 *
 * Mutation chances by quality:
 * - Bronze: 5%
 * - Silver: 10%
 * - Gold: 20%
 * - Diamond: 35%
 *
 * @param zombie - Zombie to mutate
 * @param mutationChance - Probability of mutation (0-1)
 * @returns Zombie with mutations applied
 */
export function applyMutations(zombie: Zombie, mutationChance: number): Zombie {
  // Check if mutation occurs
  if (Math.random() > mutationChance) {
    return zombie; // No mutation
  }

  // Select random mutation(s)
  const numMutations = Math.random() < 0.1 ? 2 : 1; // 10% chance for 2 mutations
  const mutations: string[] = [];

  for (let i = 0; i < numMutations; i++) {
    const mutation =
      MUTATION_TYPES[Math.floor(Math.random() * MUTATION_TYPES.length)];
    if (!mutations.includes(mutation)) {
      mutations.push(mutation);
    }
  }

  return {
    ...zombie,
    mutations: [...zombie.mutations, ...mutations],
  };
}

/**
 * Gets mutation chance based on quality
 */
function getMutationChance(quality: ZombieQuality): number {
  const chances = {
    bronze: 0.05, // 5%
    silver: 0.10, // 10%
    gold: 0.20, // 20%
    diamond: 0.35, // 35%
  };
  return chances[quality] || 0;
}

// ============================================================================
// GENERATE BYPRODUCTS
// ============================================================================

/**
 * Generates resource byproducts from harvest
 *
 * Per DOMAIN-FARM.md:
 * - Harvesting zombies yields resource byproducts
 * - Different zombie types drop different resources
 * - Higher tier zombies drop more/better resources
 *
 * @param zombieType - Type of zombie harvested
 * @returns Resource byproducts
 */
export function generateByproducts(
  zombieType: ZombieType
): Record<Resource, number> {
  // Base byproducts for all zombies
  const byproducts: Partial<Record<Resource, number>> = {
    rottedWood: Math.floor(Math.random() * 3) + 1, // 1-3 wood
    bones: Math.floor(Math.random() * 2) + 1, // 1-2 bones
  };

  // Type-specific byproducts
  const tierBonus = getTierBonus(zombieType);

  // Advanced/Elite zombies drop more
  if (tierBonus >= 2) {
    byproducts.corpseDust = Math.floor(Math.random() * 2) + 1;
  }

  if (tierBonus >= 3) {
    byproducts.soulFragments = 1;
  }

  return byproducts as Record<Resource, number>;
}

/**
 * Gets tier bonus for zombie type
 */
function getTierBonus(zombieType: ZombieType): number {
  const zombieConfig = gameConfig.ZOMBIES[zombieType];
  if (!zombieConfig) return 1;

  const tierMap = {
    basic: 1,
    advanced: 2,
    elite: 3,
    special: 3,
  };

  return tierMap[zombieConfig.tier] || 1;
}

// ============================================================================
// HARVEST ZOMBIE
// ============================================================================

/**
 * Harvest result containing updated state and harvested zombie
 */
export interface HarvestResult {
  farmState: FarmState;
  inventory: Inventory;
  zombie: Zombie;
}

/**
 * Harvests a zombie from a ready plot
 *
 * Per DOMAIN-FARM.md:
 * 1. Validate plot is ready
 * 2. Generate zombie with stats based on type and quality
 * 3. Apply quality multipliers
 * 4. Apply random mutations
 * 5. Add zombie to active roster (or Crypt if at capacity)
 * 6. Clear plot for replanting
 * 7. Generate and add resource byproducts
 *
 * @param farmState - Current farm state
 * @param inventory - Current inventory
 * @param plotId - ID of plot to harvest
 * @param quality - Quality of harvested zombie (from determineQuality)
 * @returns Updated farm state, inventory, and harvested zombie
 */
export function harvestZombie(
  farmState: FarmState,
  inventory: Inventory,
  plotId: string,
  quality: ZombieQuality
): Result<HarvestResult> {
  // Find plot
  const plot = farmState.plots.find((p) => p.id === plotId);
  if (!plot) {
    return {
      success: false,
      error: `Plot ${plotId} not found`,
    };
  }

  // Validate harvest
  const validation = validateHarvest(plot);
  if (!validation.success) {
    return validation as Result<HarvestResult>;
  }

  // Get zombie type from seed
  const zombieType = seedTypeToZombieType(plot.plantedSeed!);
  if (!zombieType) {
    return {
      success: false,
      error: `Unknown seed type: ${plot.plantedSeed}`,
    };
  }

  // Generate zombie
  const stats = generateZombieStats(zombieType, quality);

  const zombie: Zombie = {
    id: `zombie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: zombieType,
    name: generateZombieName(zombieType),
    quality,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    stats,
    happiness: 50, // Start at neutral happiness
    daysSinceLastFed: 0,
    lastFedAt: null,
    lastPetAt: null,
    mutations: [],
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    position: null,
    aiState: ZombieAIState.IDLE,
    createdAt: Date.now(),
  };

  // Apply mutations
  const mutationChance = getMutationChance(quality);
  const mutatedZombie = applyMutations(zombie, mutationChance);

  // Determine if zombie goes to active roster or Crypt
  const hasCapacity =
    farmState.activeZombies.length < farmState.activeZombieCapacity;

  const updatedFarmState: FarmState = {
    ...farmState,
    activeZombies: hasCapacity
      ? [...farmState.activeZombies, mutatedZombie]
      : farmState.activeZombies,
    cryptZombies: hasCapacity
      ? farmState.cryptZombies
      : [...farmState.cryptZombies, mutatedZombie],
    plots: farmState.plots.map((p) =>
      p.id === plotId
        ? {
            ...p,
            state: PlotState.EMPTY,
            plantedSeed: null,
            plantedAt: null,
            baseGrowthTime: null,
            growthTimeRemaining: null,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          }
        : p
    ),
  };

  // Generate byproducts
  const byproducts = generateByproducts(zombieType);

  // Add byproducts to inventory
  const updatedInventory: Inventory = {
    ...inventory,
    resources: {
      ...inventory.resources,
      ...Object.entries(byproducts).reduce(
        (acc, [resource, amount]) => ({
          ...acc,
          [resource]: (inventory.resources[resource as Resource] || 0) + amount,
        }),
        {}
      ),
    },
  };

  return {
    success: true,
    data: {
      farmState: updatedFarmState,
      inventory: updatedInventory,
      zombie: mutatedZombie,
    },
  };
}

/**
 * Generates a random name for a zombie
 */
function generateZombieName(zombieType: ZombieType): string {
  const prefixes = [
    'Rotting',
    'Shambling',
    'Decaying',
    'Groaning',
    'Lurching',
    'Creeping',
    'Festering',
    'Putrid',
  ];
  const suffixes = [
    'Walker',
    'Corpse',
    'Fiend',
    'Ghoul',
    'Wretch',
    'Revenant',
    'Cadaver',
    'Remains',
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // For special zombie types, use their type name
  const zombieConfig = gameConfig.ZOMBIES[zombieType];
  const typeName = zombieConfig?.name || zombieType;

  return `${prefix} ${typeName}`;
}
