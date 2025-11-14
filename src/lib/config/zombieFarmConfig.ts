/**
 * Zombie Farm Game Configuration
 *
 * Central configuration file containing all game balance values, zombie definitions,
 * resource costs, building specifications, and combat balance.
 *
 * All values derived from DOMAIN-FARM.md and DOMAIN-COMBAT.md specifications.
 */

import { ZombieType, ZombieQuality, BuildingType } from '../../types/farm';
import { Resource, Currency, SeedType, ResourceNodeType } from '../../types/resources';
import { DamageType, StatusEffect } from '../../types/combat';

// ============================================================================
// GAME CONSTANTS
// ============================================================================

export const gameConfig = {
  /**
   * Time System
   *
   * Day/night cycle configuration per DOMAIN-FARM.md:
   * - Full cycle: 30 minutes real-time
   * - Day: 20 minutes
   * - Night: 10 minutes
   */
  TIME: {
    DAY_NIGHT_CYCLE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
    DAY_DURATION: 20 * 60 * 1000, // 20 minutes
    NIGHT_DURATION: 10 * 60 * 1000, // 10 minutes
    OFFLINE_PROGRESS_MAX_DAYS: 7, // Cap offline progress at 7 days
  },

  /**
   * Zombie Capacity
   *
   * Per DOMAIN-FARM.md:
   * - Initial cap: 10 active zombies
   * - Max cap: ~100 zombies (with all upgrades)
   * - Crypt storage: unlimited, no decay
   */
  CAPACITY: {
    INITIAL_ZOMBIE_CAP: 10,
    MAX_ZOMBIE_CAP: 100,
    CRYPT_STORAGE_UNLIMITED: true,
  },

  /**
   * Decay System
   *
   * Per DOMAIN-FARM.md:
   * - Daily stat decay: 1% per day unfed
   * - Decay floor: 50% minimum stats
   * - Happiness decay: -5 per day unfed
   * - Crypt: 0% decay
   */
  DECAY: {
    DAILY_STAT_DECAY_RATE: 0.01, // 1% per day
    DECAY_FLOOR: 0.5, // Stats won't decay below 50%
    DAILY_HAPPINESS_DECAY: 5, // -5 happiness per day unfed
    CRYPT_DECAY_RATE: 0, // No decay in Crypt
    SHELTER_DECAY_REDUCTION: 0.5, // 50% less decay in shelters
  },

  /**
   * Happiness System
   *
   * Per DOMAIN-FARM.md happiness factors.
   */
  HAPPINESS: {
    MIN: 0,
    MAX: 100,
    FEEDING_BOOST: 10, // +10 when fed
    PETTING_BOOST: 5, // +5 when pet
    PETTING_COOLDOWN_HOURS: 24, // Can pet once per day
    SOCIAL_BOOST: 5, // +5 if other zombies nearby
    ENVIRONMENT_BOOST: 5, // +5 from decorations
    INJURED_PENALTY: -10, // -10 if below 50% HP
    LONELY_PENALTY: -5, // -5 if only zombie on farm
  },

  /**
   * Farm Grid and Expansion
   */
  FARM: {
    INITIAL_GRID_SIZE: {
      width: 20,
      height: 15,
    },
    GRID_TILE_SIZE: 32, // pixels
    MAX_EXPANSIONS: 5,
    EXPANSION_COSTS: [
      // Each expansion cost increases
      {
        resources: {
          [Resource.ROTTEN_WOOD]: 50,
          [Resource.BONES]: 50,
        },
        currencies: {
          [Currency.DARK_COINS]: 100,
        },
      },
      {
        resources: {
          [Resource.ROTTEN_WOOD]: 100,
          [Resource.BONES]: 100,
          [Resource.IRON_SCRAPS]: 50,
        },
        currencies: {
          [Currency.DARK_COINS]: 250,
        },
      },
      // More expansions...
    ],
  },

  // ============================================================================
  // ZOMBIE TYPE DEFINITIONS
  // ============================================================================

  /**
   * Zombie Configurations
   *
   * All 11 zombie types with stats, costs, and growth times.
   * Stats balanced per DOMAIN-COMBAT.md damage formulas and DOMAIN-FARM.md growth mechanics.
   */
  ZOMBIES: {
    // ========== BASIC TIER ==========
    [ZombieType.SHAMBLER]: {
      name: 'Shambler',
      description: 'Slow but sturdy basic zombie. Reliable frontline fighter.',
      tier: 'basic' as const,
      baseStats: {
        maxHp: 100,
        attack: 15,
        defense: 10,
        speed: 1.0, // tiles per second
        range: 1, // melee
        attackCooldown: 1.5, // seconds between attacks
        decayRate: 1.0, // normal decay
      },
      damageType: DamageType.PHYSICAL,
      growthTimeMinutes: 5,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 10,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 1,
        },
      },
    },

    [ZombieType.RUNNER]: {
      name: 'Runner',
      description: 'Fast and aggressive but fragile. High DPS glass cannon.',
      tier: 'basic' as const,
      baseStats: {
        maxHp: 60,
        attack: 20,
        defense: 5,
        speed: 2.5,
        range: 1,
        attackCooldown: 1.0,
        decayRate: 1.2, // Decays faster (less stable)
      },
      damageType: DamageType.PHYSICAL,
      growthTimeMinutes: 4,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 15,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 1,
        },
      },
    },

    // ========== ADVANCED TIER ==========
    [ZombieType.BRUTE]: {
      name: 'Brute',
      description: 'Massive tank with AoE damage. Excels at breaking structures.',
      tier: 'advanced' as const,
      baseStats: {
        maxHp: 250,
        attack: 35,
        defense: 20,
        speed: 0.7,
        range: 1,
        attackCooldown: 2.5,
        decayRate: 0.8, // More stable
      },
      damageType: DamageType.PHYSICAL,
      abilities: ['Structure Breaker', 'AoE Smash'],
      growthTimeMinutes: 15,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 50,
        },
        resources: {
          [Resource.BONES]: 10,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 2,
        },
      },
    },

    [ZombieType.SPITTER]: {
      name: 'Spitter',
      description: 'Ranged toxic attacker. Bypasses armor with acid spit.',
      tier: 'advanced' as const,
      baseStats: {
        maxHp: 80,
        attack: 25,
        defense: 8,
        speed: 1.2,
        range: 5, // ranged
        attackCooldown: 2.0,
        decayRate: 1.0,
      },
      damageType: DamageType.TOXIC,
      abilities: ['Poison DoT', 'Armor Penetration'],
      growthTimeMinutes: 12,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 40,
        },
        resources: {
          [Resource.CORPSE_DUST]: 5,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 1,
        },
      },
    },

    [ZombieType.GHOUL]: {
      name: 'Ghoul',
      description: 'Balanced melee fighter with life steal. Self-sustaining in combat.',
      tier: 'advanced' as const,
      baseStats: {
        maxHp: 120,
        attack: 22,
        defense: 12,
        speed: 1.5,
        range: 1,
        attackCooldown: 1.3,
        decayRate: 0.9,
      },
      damageType: DamageType.PHYSICAL,
      abilities: ['Life Steal'],
      growthTimeMinutes: 10,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 35,
        },
        resources: {
          [Resource.BLOOD_WATER]: 5,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 1,
        },
      },
    },

    // ========== ELITE TIER ==========
    [ZombieType.ABOMINATION]: {
      name: 'Abomination',
      description: 'Massive undead construct. Incredible HP and damage but very slow.',
      tier: 'elite' as const,
      baseStats: {
        maxHp: 500,
        attack: 60,
        defense: 30,
        speed: 0.5,
        range: 1,
        attackCooldown: 3.0,
        decayRate: 0.6,
      },
      damageType: DamageType.PHYSICAL,
      abilities: ['Massive HP', 'Intimidation'],
      growthTimeMinutes: 30,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 150,
        },
        resources: {
          [Resource.BONES]: 30,
          [Resource.CORPSE_DUST]: 20,
          [Resource.SOUL_FRAGMENTS]: 5,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 3,
        },
      },
      requiresUnlock: 'necromancer_level_10',
    },

    [ZombieType.LICH]: {
      name: 'Lich',
      description: 'Powerful ranged caster with dark magic. Support and high damage.',
      tier: 'elite' as const,
      baseStats: {
        maxHp: 100,
        attack: 40,
        defense: 15,
        speed: 1.0,
        range: 7, // long range caster
        attackCooldown: 2.5,
        decayRate: 0.5, // Very stable (magical preservation)
      },
      damageType: DamageType.DARK,
      abilities: ['Dark Bolt', 'Fear Aura', 'Debuff Enemies'],
      growthTimeMinutes: 25,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 120,
        },
        resources: {
          [Resource.SOUL_FRAGMENTS]: 10,
          [Resource.DARK_ESSENCE]: 5,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 2,
        },
      },
      requiresUnlock: 'necromancer_level_8',
    },

    [ZombieType.BONE_KNIGHT]: {
      name: 'Bone Knight',
      description: 'Heavily armored undead knight. High defense and tactical prowess.',
      tier: 'elite' as const,
      baseStats: {
        maxHp: 200,
        attack: 30,
        defense: 35,
        speed: 1.2,
        range: 1,
        attackCooldown: 1.8,
        decayRate: 0.7,
      },
      damageType: DamageType.PHYSICAL,
      abilities: ['Heavy Armor', 'Shield Bash'],
      growthTimeMinutes: 20,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 100,
        },
        resources: {
          [Resource.BONES]: 25,
          [Resource.IRON_SCRAPS]: 15,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 2,
        },
      },
      requiresUnlock: 'necromancer_level_7',
    },

    // ========== SPECIAL ==========
    [ZombieType.PRIEST_ZOMBIE]: {
      name: 'Priest Zombie',
      description: 'Holy-undead hybrid. Can heal other zombies with dark rituals.',
      tier: 'special' as const,
      baseStats: {
        maxHp: 90,
        attack: 18,
        defense: 12,
        speed: 1.0,
        range: 4, // support range
        attackCooldown: 2.0,
        decayRate: 0.8,
      },
      damageType: DamageType.HOLY, // Ironic
      abilities: ['Heal Undead', 'Sanctify'],
      growthTimeMinutes: 18,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 80,
        },
        resources: {
          [Resource.HOLY_WATER]: 10,
          [Resource.SOUL_FRAGMENTS]: 5,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 1,
        },
      },
      requiresUnlock: 'cathedral_defeated',
    },

    [ZombieType.EXPLOSIVE_ZOMBIE]: {
      name: 'Explosive Zombie',
      description: 'Unstable zombie that explodes on death, dealing massive AoE damage.',
      tier: 'special' as const,
      baseStats: {
        maxHp: 50,
        attack: 15,
        defense: 5,
        speed: 1.5,
        range: 1,
        attackCooldown: 1.5,
        decayRate: 1.5, // Very unstable
      },
      damageType: DamageType.EXPLOSIVE,
      abilities: ['Death Explosion'],
      growthTimeMinutes: 8,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 60,
        },
        resources: {
          [Resource.CORPSE_DUST]: 10,
          [Resource.COAL]: 5,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 1,
        },
      },
      requiresUnlock: 'explosives_research',
    },

    [ZombieType.NECROMANCER_ZOMBIE]: {
      name: 'Necromancer Zombie',
      description: 'Rare undead spellcaster. Can resurrect fallen allies once per battle.',
      tier: 'special' as const,
      baseStats: {
        maxHp: 80,
        attack: 25,
        defense: 10,
        speed: 1.0,
        range: 5,
        attackCooldown: 2.5,
        decayRate: 0.6,
      },
      damageType: DamageType.DARK,
      abilities: ['Resurrect Ally', 'Summon Minions'],
      growthTimeMinutes: 35,
      seedCost: {
        currencies: {
          [Currency.DARK_COINS]: 200,
        },
        resources: {
          [Resource.SOUL_FRAGMENTS]: 15,
          [Resource.DARK_ESSENCE]: 10,
        },
      },
      feedCost: {
        resources: {
          [Resource.ROTTEN_MEAT]: 2,
          [Resource.SOUL_FRAGMENTS]: 1,
        },
      },
      requiresUnlock: 'necromancy_mastery',
    },
  },

  /**
   * Quality Multipliers
   *
   * Applied to base stats per DOMAIN-FARM.md:
   * - Bronze: 1.0x (base)
   * - Silver: 1.25x
   * - Gold: 1.5x
   * - Diamond: 2.0x
   */
  QUALITY_MULTIPLIERS: {
    [ZombieQuality.BRONZE]: 1.0,
    [ZombieQuality.SILVER]: 1.25,
    [ZombieQuality.GOLD]: 1.5,
    [ZombieQuality.DIAMOND]: 2.0,
  },

  /**
   * Zombie Growth Configuration
   */
  ZOMBIE_GROWTH: {
    wateringSpeedBoost: 0.5, // 50% faster growth when watered
    fertilizerSpeedBoost: 0.3, // 30% faster growth with fertilizer
    fertilizerQualityBoost: 0.15, // +15% chance for higher quality
    qualityChances: {
      [ZombieQuality.BRONZE]: 0.6, // 60% bronze
      [ZombieQuality.SILVER]: 0.25, // 25% silver
      [ZombieQuality.GOLD]: 0.12, // 12% gold
      [ZombieQuality.DIAMOND]: 0.03, // 3% diamond
    },
  },

  // ============================================================================
  // RESOURCE DEFINITIONS
  // ============================================================================

  /**
   * Resource Metadata
   */
  RESOURCES: {
    [Resource.ROTTEN_WOOD]: {
      name: 'Rotten Wood',
      description: 'Basic building material from dead trees.',
      stackSize: 999,
      icon: 'rotten_wood.png',
    },
    [Resource.BONES]: {
      name: 'Bones',
      description: 'Skeletal remains. Used for construction and fertilizer.',
      stackSize: 999,
      icon: 'bones.png',
    },
    [Resource.BLOOD_WATER]: {
      name: 'Blood Water',
      description: 'Crimson water for watering zombie crops. Speeds growth.',
      stackSize: 500,
      icon: 'blood_water.png',
    },
    [Resource.CORPSE_DUST]: {
      name: 'Corpse Dust',
      description: 'Potent fertilizer from decomposed remains.',
      stackSize: 200,
      icon: 'corpse_dust.png',
    },
    [Resource.SOUL_FRAGMENTS]: {
      name: 'Soul Fragments',
      description: 'Essence of defeated enemies. Used for dark magic.',
      stackSize: 100,
      icon: 'soul_fragment.png',
    },
    [Resource.IRON_SCRAPS]: {
      name: 'Iron Scraps',
      description: 'Metal salvaged from ruins and soldiers.',
      stackSize: 999,
      icon: 'iron_scraps.png',
    },
    [Resource.CLOTH]: {
      name: 'Cloth',
      description: 'Fabric scraps from looting.',
      stackSize: 500,
      icon: 'cloth.png',
    },
    [Resource.BRAINS]: {
      name: 'Brains',
      description: 'Premium zombie food. Major happiness boost.',
      stackSize: 50,
      icon: 'brains.png',
    },
    [Resource.ROTTEN_MEAT]: {
      name: 'Rotten Meat',
      description: 'Standard zombie food. Prevents decay.',
      stackSize: 200,
      icon: 'rotten_meat.png',
    },
    [Resource.HOLY_WATER]: {
      name: 'Holy Water',
      description: 'Blessed water from cathedrals. Used in dark rituals.',
      stackSize: 50,
      icon: 'holy_water.png',
    },
    [Resource.COAL]: {
      name: 'Coal',
      description: 'Fuel for furnaces and explosives.',
      stackSize: 500,
      icon: 'coal.png',
    },
    [Resource.TAR]: {
      name: 'Tar',
      description: 'Sticky substance from swamp expansions.',
      stackSize: 200,
      icon: 'tar.png',
    },
    [Resource.GRAVE_DIRT]: {
      name: 'Grave Dirt',
      description: 'Special soil for premium zombie growth.',
      stackSize: 100,
      icon: 'grave_dirt.png',
    },
    [Resource.BONE_MEAL]: {
      name: 'Bone Meal',
      description: 'Processed bones. Powerful fertilizer.',
      stackSize: 200,
      icon: 'bone_meal.png',
    },
    [Resource.EMBALMING_FLUID]: {
      name: 'Embalming Fluid',
      description: 'Preservative that reduces zombie decay.',
      stackSize: 50,
      icon: 'embalming_fluid.png',
    },
    [Resource.DARK_ESSENCE]: {
      name: 'Dark Essence',
      description: 'Concentrated magical material for elite zombies.',
      stackSize: 50,
      icon: 'dark_essence.png',
    },
  },

  /**
   * Resource Node Configurations
   *
   * Per DOMAIN-FARM.md resource gathering mechanics.
   */
  RESOURCE_NODES: {
    deadTree: {
      type: ResourceNodeType.DEAD_TREE,
      yields: {
        [Resource.ROTTEN_WOOD]: { min: 5, max: 10 },
      },
      capacity: 3, // Can harvest 3 times
      cooldownMinutes: 60, // Respawns after 1 hour
    },
    graveMound: {
      type: ResourceNodeType.GRAVE_MOUND,
      yields: {
        [Resource.BONES]: { min: 3, max: 6 },
        [Resource.GRAVE_DIRT]: { min: 1, max: 2 },
      },
      capacity: 1,
      cooldownMinutes: 120,
    },
    bloodWell: {
      type: ResourceNodeType.BLOOD_WELL,
      yields: {
        [Resource.BLOOD_WATER]: { min: 10, max: 10 },
      },
      capacity: 10,
      refillRate: 1, // 1 unit per 5 minutes
      refillInterval: 5,
    },
    ruin: {
      type: ResourceNodeType.RUIN,
      yields: {
        [Resource.IRON_SCRAPS]: { min: 2, max: 5 },
        [Resource.CLOTH]: { min: 1, max: 3 },
      },
      capacity: 2,
      cooldownMinutes: 180,
    },
    bonePile: {
      type: ResourceNodeType.BONE_PILE,
      yields: {
        [Resource.BONES]: { min: 5, max: 8 },
      },
      capacity: 1,
      cooldownMinutes: 90,
    },
    swampTar: {
      type: ResourceNodeType.SWAMP_TAR,
      yields: {
        [Resource.TAR]: { min: 3, max: 5 },
      },
      capacity: 3,
      cooldownMinutes: 120,
    },
  },

  // ============================================================================
  // BUILDING DEFINITIONS
  // ============================================================================

  /**
   * Building Configurations
   *
   * Per DOMAIN-FARM.md structures and their effects.
   */
  BUILDINGS: {
    // ========== CORE BUILDINGS ==========
    commandCenter: {
      type: BuildingType.COMMAND_CENTER,
      name: 'Command Center',
      description: 'Main building. Unlocks research and upgrades.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 50,
          [Resource.BONES]: 30,
        },
        currencies: {
          [Currency.DARK_COINS]: 100,
        },
      },
      buildTimeMinutes: 5,
      maxLevel: 10,
      upgradeCosts: [], // Define per level
      effect: {
        unlocksResearch: true,
      },
      gridSize: { width: 3, height: 3 },
    },

    crypt: {
      type: BuildingType.CRYPT,
      name: 'Crypt',
      description: 'Stores inactive zombies with no decay.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 30,
          [Resource.BONES]: 20,
        },
        currencies: {
          [Currency.DARK_COINS]: 50,
        },
      },
      buildTimeMinutes: 3,
      maxLevel: 5,
      effect: {
        storageCapacity: Infinity, // Unlimited
        preventDecay: true,
      },
      gridSize: { width: 2, height: 2 },
    },

    zombiePlot: {
      type: BuildingType.ZOMBIE_PLOT,
      name: 'Zombie Plot',
      description: 'Plot for growing zombie seeds.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 5,
          [Resource.BONES]: 3,
        },
      },
      buildTimeMinutes: 0, // Instant
      maxLevel: 1,
      effect: {
        allowsPlanting: true,
      },
      gridSize: { width: 1, height: 1 },
    },

    // ========== PRODUCTION BUILDINGS ==========
    bloodWell: {
      type: BuildingType.BLOOD_WELL,
      name: 'Blood Well',
      description: 'Produces Blood Water over time.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 20,
          [Resource.BONES]: 15,
        },
        currencies: {
          [Currency.DARK_COINS]: 50,
        },
      },
      buildTimeMinutes: 5,
      maxLevel: 3,
      effect: {
        producesResource: Resource.BLOOD_WATER,
        productionRate: 1, // 1 unit per 5 minutes
        capacity: 10,
      },
      gridSize: { width: 2, height: 2 },
    },

    corpseComposter: {
      type: BuildingType.CORPSE_COMPOSTER,
      name: 'Corpse Composter',
      description: 'Converts organic waste to Corpse Dust.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 25,
          [Resource.BONES]: 10,
        },
        currencies: {
          [Currency.DARK_COINS]: 40,
        },
      },
      buildTimeMinutes: 4,
      maxLevel: 3,
      effect: {
        convertsResource: {
          input: { [Resource.ROTTEN_MEAT]: 5 },
          output: { [Resource.CORPSE_DUST]: 2 },
          timeMinutes: 30,
        },
      },
      gridSize: { width: 2, height: 2 },
    },

    boneMill: {
      type: BuildingType.BONE_MILL,
      name: 'Bone Mill',
      description: 'Processes bones into Bone Meal fertilizer.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 30,
          [Resource.IRON_SCRAPS]: 10,
        },
        currencies: {
          [Currency.DARK_COINS]: 60,
        },
      },
      buildTimeMinutes: 5,
      maxLevel: 3,
      effect: {
        convertsResource: {
          input: { [Resource.BONES]: 5 },
          output: { [Resource.BONE_MEAL]: 3 },
          timeMinutes: 20,
        },
      },
      gridSize: { width: 2, height: 2 },
    },

    // ========== CAPACITY BUILDINGS ==========
    mausoleum: {
      type: BuildingType.MAUSOLEUM,
      name: 'Mausoleum',
      description: 'Increases active zombie capacity by 5.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 40,
          [Resource.BONES]: 30,
        },
        currencies: {
          [Currency.DARK_COINS]: 80,
        },
      },
      buildTimeMinutes: 10,
      maxLevel: 10,
      effect: {
        zombieCapacityBonus: 5,
      },
      gridSize: { width: 2, height: 2 },
    },

    cryptExpansion: {
      type: BuildingType.CRYPT_EXPANSION,
      name: 'Crypt Expansion',
      description: 'Further increases Crypt efficiency.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 50,
          [Resource.BONES]: 40,
          [Resource.IRON_SCRAPS]: 20,
        },
        currencies: {
          [Currency.DARK_COINS]: 100,
        },
      },
      buildTimeMinutes: 15,
      maxLevel: 5,
      effect: {
        cryptEfficiencyBonus: 0.1, // 10% better preservation
      },
      gridSize: { width: 2, height: 2 },
    },

    // ========== TRAINING & SUPPORT ==========
    trainingDummy: {
      type: BuildingType.TRAINING_DUMMY,
      name: 'Training Dummy',
      description: 'Zombies can train here for XP.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 15,
          [Resource.CLOTH]: 5,
        },
      },
      buildTimeMinutes: 2,
      maxLevel: 1,
      effect: {
        providesTraining: true,
        xpPerHour: 5,
      },
      gridSize: { width: 1, height: 1 },
    },

    stitchingStation: {
      type: BuildingType.STITCHING_STATION,
      name: 'Stitching Station',
      description: 'Heals injured zombies over time.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 30,
          [Resource.CLOTH]: 15,
          [Resource.IRON_SCRAPS]: 10,
        },
        currencies: {
          [Currency.DARK_COINS]: 70,
        },
      },
      buildTimeMinutes: 8,
      maxLevel: 3,
      effect: {
        healsZombies: true,
        healRatePerHour: 10, // 10% HP per hour
        resourceCost: {
          [Resource.CLOTH]: 1,
        },
      },
      gridSize: { width: 2, height: 2 },
    },

    guardTower: {
      type: BuildingType.GUARD_TOWER,
      name: 'Guard Tower',
      description: 'Defensive structure. Increases farm defense.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 40,
          [Resource.BONES]: 20,
          [Resource.IRON_SCRAPS]: 15,
        },
        currencies: {
          [Currency.DARK_COINS]: 90,
        },
      },
      buildTimeMinutes: 12,
      maxLevel: 5,
      effect: {
        defenseBonus: 10,
      },
      gridSize: { width: 2, height: 3 },
    },

    // ========== DECORATIONS ==========
    bonfire: {
      type: BuildingType.BONFIRE,
      name: 'Bonfire',
      description: 'Decoration that boosts zombie happiness.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 10,
          [Resource.COAL]: 5,
        },
      },
      buildTimeMinutes: 1,
      maxLevel: 1,
      effect: {
        happinessBonus: 5,
        radius: 3, // tiles
      },
      gridSize: { width: 1, height: 1 },
    },

    pumpkinScarecrow: {
      type: BuildingType.PUMPKIN_SCARECROW,
      name: 'Pumpkin Scarecrow',
      description: 'Spooky decoration. Zombies like it.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 5,
          [Resource.CLOTH]: 3,
        },
      },
      buildTimeMinutes: 1,
      maxLevel: 1,
      effect: {
        happinessBonus: 3,
        radius: 2,
      },
      gridSize: { width: 1, height: 1 },
    },

    gallows: {
      type: BuildingType.GALLOWS,
      name: 'Gallows',
      description: 'Macabre decoration. Small happiness boost.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 8,
        },
      },
      buildTimeMinutes: 1,
      maxLevel: 1,
      effect: {
        happinessBonus: 2,
        radius: 2,
      },
      gridSize: { width: 1, height: 2 },
    },

    // ========== DEFENSIVE STRUCTURES ==========
    woodenSpikes: {
      type: BuildingType.WOODEN_SPIKES,
      name: 'Wooden Spikes',
      description: 'Basic defensive trap.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 15,
        },
      },
      buildTimeMinutes: 2,
      maxLevel: 1,
      effect: {
        defenseBonus: 3,
        damageToAttackers: 10,
      },
      gridSize: { width: 1, height: 1 },
    },

    stoneWall: {
      type: BuildingType.STONE_WALL,
      name: 'Stone Wall',
      description: 'Strong defensive barrier.',
      cost: {
        resources: {
          [Resource.BONES]: 20,
          [Resource.IRON_SCRAPS]: 10,
        },
        currencies: {
          [Currency.DARK_COINS]: 50,
        },
      },
      buildTimeMinutes: 5,
      maxLevel: 3,
      effect: {
        defenseBonus: 15,
        hp: 500,
      },
      gridSize: { width: 1, height: 1 },
    },

    trap: {
      type: BuildingType.TRAP,
      name: 'Trap',
      description: 'Hidden trap that damages intruders.',
      cost: {
        resources: {
          [Resource.ROTTEN_WOOD]: 10,
          [Resource.IRON_SCRAPS]: 5,
        },
      },
      buildTimeMinutes: 3,
      maxLevel: 1,
      effect: {
        trapDamage: 50,
        oneTimeUse: true,
      },
      gridSize: { width: 1, height: 1 },
    },
  },

  // ============================================================================
  // COMBAT BALANCE
  // ============================================================================

  /**
   * Combat Configuration
   *
   * Per DOMAIN-COMBAT.md damage types, status effects, and battle mechanics.
   */
  COMBAT: {
    /**
     * Damage Type Multipliers
     */
    DAMAGE_MULTIPLIERS: {
      [DamageType.PHYSICAL]: {
        vsArmor: 0.7, // Reduced by armor
      },
      [DamageType.TOXIC]: {
        armorPenetration: 0.5, // Bypasses 50% of armor
        appliesPoison: true,
      },
      [DamageType.FIRE]: {
        vsArmor: 0.8,
        isAoE: true,
        appliesBurning: true,
        spreadChance: 0.3, // 30% to spread to nearby
      },
      [DamageType.DARK]: {
        ignoresArmor: true, // Bypasses armor completely
        appliesFear: true,
        vsPeasants: 1.5, // 50% more vs weak-willed
      },
      [DamageType.EXPLOSIVE]: {
        isAoE: true,
        aoeRadius: 2, // tiles
        vsStructures: 2.0, // Double damage to buildings
      },
      [DamageType.HOLY]: {
        vsUndead: 2.0, // Double damage to zombies
        appliesWeakened: true,
        stunChance: 0.25, // 25% chance to stun
      },
    },

    /**
     * Status Effects
     */
    STATUS_EFFECTS: {
      [StatusEffect.POISONED]: {
        duration: 10, // seconds
        damagePerSecond: 2, // 2% max HP per second
        canStack: true,
        maxStacks: 3,
      },
      [StatusEffect.BURNING]: {
        duration: 5,
        damagePerSecond: 5, // 5% max HP per second
        canStack: false,
        spreadRadius: 1,
      },
      [StatusEffect.STUNNED]: {
        duration: 2,
        preventsAction: true,
        canStack: false,
      },
      [StatusEffect.FEAR]: {
        duration: 4,
        forcesRetreat: true,
        canStack: false,
      },
      [StatusEffect.BLEEDING]: {
        duration: 8,
        damagePerSecond: 1,
        canStack: true,
        maxStacks: 5,
      },
      [StatusEffect.WEAKENED]: {
        duration: 6,
        attackReduction: 0.3, // -30% attack
        canStack: false,
      },
      [StatusEffect.SLOWED]: {
        duration: 5,
        speedReduction: 0.5, // -50% speed
        canStack: false,
      },
      [StatusEffect.BUFFED]: {
        duration: 10,
        statBoost: 0.2, // +20% stats
        canStack: true,
        maxStacks: 3,
      },
    },

    /**
     * Squad Configuration
     */
    INITIAL_SQUAD_SIZE: 3,
    MAX_SQUAD_SIZE: 15,

    /**
     * Battle Mechanics
     */
    MINIMUM_DAMAGE: 1, // Always deal at least 1 damage
    RETREAT_COUNTDOWN_SECONDS: 10,
    RETREAT_COST: {
      currencies: {
        [Currency.DARK_COINS]: 10,
      },
    },

    /**
     * XP Rewards
     */
    XP_PER_PARTICIPATION: 50,
    XP_PER_KILL: 10,
    XP_PER_DAMAGE: 0.01, // 1 XP per 100 damage
    FLAWLESS_VICTORY_BONUS: 100, // No casualties
  },

  // ============================================================================
  // SEED CONFIGURATIONS
  // ============================================================================

  /**
   * Seed Definitions
   *
   * Links seeds to zombie types and defines acquisition.
   */
  SEEDS: {
    [SeedType.SHAMBLER_SEED]: {
      name: 'Shambler Seed',
      description: 'Basic zombie seed. Always available.',
      zombieType: ZombieType.SHAMBLER,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 10,
        },
      },
      availableFromStart: true,
    },
    [SeedType.RUNNER_SEED]: {
      name: 'Runner Seed',
      description: 'Fast zombie seed. Available from start.',
      zombieType: ZombieType.RUNNER,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 15,
        },
      },
      availableFromStart: true,
    },
    [SeedType.BRUTE_SEED]: {
      name: 'Brute Seed',
      description: 'Tank zombie seed. Unlocked at level 3.',
      zombieType: ZombieType.BRUTE,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 50,
        },
      },
      requiresUnlock: 'necromancer_level_3',
    },
    [SeedType.SPITTER_SEED]: {
      name: 'Spitter Seed',
      description: 'Toxic ranged zombie seed.',
      zombieType: ZombieType.SPITTER,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 40,
        },
      },
      requiresUnlock: 'necromancer_level_4',
    },
    [SeedType.GHOUL_SEED]: {
      name: 'Ghoul Seed',
      description: 'Life-stealing zombie seed.',
      zombieType: ZombieType.GHOUL,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 35,
        },
      },
      requiresUnlock: 'necromancer_level_3',
    },
    [SeedType.ABOMINATION_SEED]: {
      name: 'Abomination Seed',
      description: 'Massive undead construct seed. Very rare.',
      zombieType: ZombieType.ABOMINATION,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 150,
        },
      },
      requiresUnlock: 'necromancer_level_10',
    },
    [SeedType.LICH_SEED]: {
      name: 'Lich Seed',
      description: 'Powerful caster seed.',
      zombieType: ZombieType.LICH,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 120,
        },
      },
      requiresUnlock: 'necromancer_level_8',
    },
    [SeedType.BONE_KNIGHT_SEED]: {
      name: 'Bone Knight Seed',
      description: 'Armored warrior seed.',
      zombieType: ZombieType.BONE_KNIGHT,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 100,
        },
      },
      requiresUnlock: 'necromancer_level_7',
    },
    [SeedType.PRIEST_ZOMBIE_SEED]: {
      name: 'Priest Zombie Seed',
      description: 'Holy-undead hybrid seed. From Cathedral.',
      zombieType: ZombieType.PRIEST_ZOMBIE,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 80,
        },
      },
      requiresUnlock: 'cathedral_defeated',
    },
    [SeedType.EXPLOSIVE_ZOMBIE_SEED]: {
      name: 'Explosive Zombie Seed',
      description: 'Unstable explosive zombie seed.',
      zombieType: ZombieType.EXPLOSIVE_ZOMBIE,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 60,
        },
      },
      requiresUnlock: 'explosives_research',
    },
    [SeedType.NECROMANCER_ZOMBIE_SEED]: {
      name: 'Necromancer Zombie Seed',
      description: 'Rare spellcaster seed. Ultimate unlock.',
      zombieType: ZombieType.NECROMANCER_ZOMBIE,
      cost: {
        currencies: {
          [Currency.DARK_COINS]: 200,
        },
      },
      requiresUnlock: 'necromancy_mastery',
    },
  },

  // ============================================================================
  // PROGRESSION SYSTEM
  // ============================================================================

  /**
   * Player and Zombie Progression
   */
  PROGRESSION: {
    MAX_PLAYER_LEVEL: 50,
    MAX_ZOMBIE_LEVEL: 100,

    /**
     * Player XP Curve
     * XP required for next level = baseXP * level^1.5
     */
    PLAYER_XP_CURVE: (level: number) => Math.floor(100 * Math.pow(level, 1.5)),

    /**
     * Zombie XP Curve
     * XP required for next level = baseXP * level^1.3
     */
    ZOMBIE_XP_CURVE: (level: number) => Math.floor(50 * Math.pow(level, 1.3)),

    /**
     * Stat Growth Per Level (for zombies)
     */
    STATS_PER_LEVEL: {
      hp: 5, // +5 max HP per level
      attack: 1, // +1 attack per level
      defense: 0.5, // +0.5 defense per level
      speed: 0.01, // Minimal speed increase
    },
  },
} as const;

/**
 * Type for the entire game config (for type safety)
 */
export type GameConfig = typeof gameConfig;
