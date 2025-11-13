/**
 * Zombie Types for Zombie Farm
 * Based on Zombie Farm V5.0 mechanics
 */

export enum ZombieType {
  // Green Tier (Basic)
  NORMAL = "Normal Zombie",
  HEADLESS = "Headless Zombie",
  ZOMBIE_GIRL = "Zombie Girl",
  MINI = "Mini Zombie",

  // Blue Tier (Advanced)
  PUMPKIN_HEAD = "Pumpkin Head Zombie",
  GARDENER = "Gardener Zombie",
  CRAZY = "Crazy Zombie",

  // Red Tier (Elite - Fusion only)
  MONSTER = "Monster Zombie",
  CUPID = "Cupid Zombie",      // Special event
  MAD = "Mad Zombie",           // Special event
  ZOMBIE_KING = "Zombie King",  // Premium
}

export enum ZombieTier {
  GREEN = "green",   // Basic zombies
  BLUE = "blue",     // Costs 2 brains
  RED = "red",       // Costs 4 brains, fusion only
}

export enum ZombieStage {
  GRAVE_MOUND = "grave_mound",      // Day 1: Fresh dirt mound
  BONE_SPROUT = "bone_sprout",      // Day 2: Bones poking through
  RISING_CORPSE = "rising_corpse",  // Day 3: Hand emerges
  HALF_RISEN = "half_risen",        // Day 4: Upper body visible
  READY_TO_HARVEST = "ready"        // Day 5+: Fully grown, glowing eyes
}

export enum ZombieStatus {
  IDLE = "idle",
  GROWING = "growing",
  READY = "ready",
  WANDERING = "wandering",
  IN_COMBAT = "in_combat",
  INJURED = "injured",
  DEAD = "dead"  // PERMANENT!
}

export enum ZombieMood {
  HAPPY = "happy",     // +20% combat stats
  NEUTRAL = "neutral", // Normal performance
  SAD = "sad",        // -20% stats, may refuse commands
  ANGRY = "angry"     // +30% attack, -10% defense
}

export interface Zombie {
  id: string;
  type: ZombieType;
  tier: ZombieTier;

  // Growth tracking
  plantedAt: number;
  maturedAt?: number;
  harvestedAt?: number;
  stage: ZombieStage;
  growthTime: number; // 24 hours like original game

  // Position on farm (for wandering)
  position: { x: number; y: number };
  targetPosition?: { x: number; y: number };

  // Combat stats
  currentHP: number;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;

  // Permanent consequences
  permanentInjuries: Injury[];
  battleScars: number;
  combatRefusalChance: number; // Trauma from near-death

  // Experience & Level
  level: number;
  experience: number;
  invasionsSurvived: number; // +5% stats per survival
  isMaster: boolean;         // After 5 successful invasions

  // State
  status: ZombieStatus;
  mood: ZombieMood;
  isWandering: boolean;
  lastInteraction?: number;

  // Mutations (5 body parts system)
  mutations: {
    hair?: PlantMutation;
    head?: PlantMutation;
    shoulders?: PlantMutation;
    body?: PlantMutation;
    arms?: PlantMutation;
  };
  mutationCount: number;

  // Abilities
  abilities: ZombieAbility[];
}

export interface Injury {
  type: 'battle_wound' | 'critical_damage' | 'trauma';
  date: number;
  statReductions: {
    maxHP?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
  visualScar: boolean;
}

export interface PlantMutation {
  plant: MutationPlant;
  bonus: MutationBonus;
  visual: string; // Asset path
}

export enum MutationPlant {
  POTATO = "potato",       // +HP
  GARLIC = "garlic",       // +ATK
  BROCCOLI = "broccoli",   // Hair mutation
  CAULIFLOWER = "cauliflower", // Hair mutation
  VENUS_FLYTRAP = "venus_flytrap", // Shoulder mutation
  PUMPKIN = "pumpkin",     // Special for Headless
}

export interface MutationBonus {
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  special?: string;
}

export interface ZombieAbility {
  name: string;
  tier: number; // 1-4 progression levels
  description: string;
  cooldown?: number;
  damage?: number;
  effect?: string;
}

// Zombie growth requirements (replacing CROPS constants)
export const ZOMBIE_GROWTH: Record<ZombieType, {
  growthTime: number;  // in seconds
  brainCost: number;   // resource cost to plant
  tier: ZombieTier;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}> = {
  [ZombieType.NORMAL]: {
    growthTime: 2 * 60,  // 2 minutes for testing (24 hours in production)
    brainCost: 1,
    tier: ZombieTier.GREEN,
    baseStats: {
      hp: 100,
      attack: 10,
      defense: 5,
      speed: 3
    }
  },
  [ZombieType.HEADLESS]: {
    growthTime: 5 * 60,
    brainCost: 1,
    tier: ZombieTier.GREEN,
    baseStats: {
      hp: 150,  // Tank
      attack: 8,
      defense: 10,
      speed: 2
    }
  },
  [ZombieType.ZOMBIE_GIRL]: {
    growthTime: 5 * 60,
    brainCost: 1,
    tier: ZombieTier.GREEN,
    baseStats: {
      hp: 80,
      attack: 15,  // Glass cannon
      defense: 3,
      speed: 5
    }
  },
  [ZombieType.MINI]: {
    growthTime: 3 * 60,
    brainCost: 1,
    tier: ZombieTier.GREEN,
    baseStats: {
      hp: 60,
      attack: 12,
      defense: 4,
      speed: 7  // Fast
    }
  },
  [ZombieType.PUMPKIN_HEAD]: {
    growthTime: 10 * 60,
    brainCost: 2,
    tier: ZombieTier.BLUE,
    baseStats: {
      hp: 120,
      attack: 18,  // Boxing zombie
      defense: 8,
      speed: 4
    }
  },
  [ZombieType.GARDENER]: {
    growthTime: 10 * 60,
    brainCost: 2,
    tier: ZombieTier.BLUE,
    baseStats: {
      hp: 100,
      attack: 10,
      defense: 6,
      speed: 3
      // Special: Heals nearby zombies
    }
  },
  [ZombieType.CRAZY]: {
    growthTime: 10 * 60,
    brainCost: 2,
    tier: ZombieTier.BLUE,
    baseStats: {
      hp: 90,
      attack: 20,  // High damage
      defense: 2,  // Low defense
      speed: 6
    }
  },
  [ZombieType.MONSTER]: {
    growthTime: 30 * 60,  // 30 min (fusion only)
    brainCost: 4,
    tier: ZombieTier.RED,
    baseStats: {
      hp: 200,
      attack: 25,
      defense: 15,
      speed: 4
      // Special: Self-destruct ability
    }
  },
  [ZombieType.CUPID]: {
    growthTime: 20 * 60,
    brainCost: 4,
    tier: ZombieTier.RED,
    baseStats: {
      hp: 150,
      attack: 22,
      defense: 10,
      speed: 5
      // Special: Valentine's Day event
    }
  },
  [ZombieType.MAD]: {
    growthTime: 20 * 60,
    brainCost: 4,
    tier: ZombieTier.RED,
    baseStats: {
      hp: 180,
      attack: 30,  // Highest attack
      defense: 5,
      speed: 3
    }
  },
  [ZombieType.ZOMBIE_KING]: {
    growthTime: 60 * 60,  // 1 hour (premium)
    brainCost: 10,
    tier: ZombieTier.RED,
    baseStats: {
      hp: 300,  // Boss stats
      attack: 35,
      defense: 20,
      speed: 2
      // Special: Commands other zombies
    }
  }
};

// Helper functions
export function getZombieGrowthTime(type: ZombieType): number {
  return ZOMBIE_GROWTH[type].growthTime;
}

export function getZombieCost(type: ZombieType): number {
  return ZOMBIE_GROWTH[type].brainCost;
}

export function isZombieReady(zombie: Zombie): boolean {
  return zombie.stage === ZombieStage.READY_TO_HARVEST;
}

export function canHarvestZombie(zombie: Zombie, now: number = Date.now()): boolean {
  if (!zombie.plantedAt || !zombie.maturedAt) return false;
  return now >= zombie.maturedAt && zombie.stage === ZombieStage.READY_TO_HARVEST;
}

// Quality system based on care during growth
export enum ZombieQuality {
  BRONZE = "bronze",   // Basic stats
  SILVER = "silver",   // +20% stats
  GOLD = "gold",      // +50% stats
  IRIDIUM = "iridium" // +100% stats, special abilities
}

export function calculateZombieQuality(zombie: Zombie): ZombieQuality {
  // Based on mutations, care, and growth conditions
  if (zombie.mutationCount >= 4) return ZombieQuality.IRIDIUM;
  if (zombie.mutationCount >= 2) return ZombieQuality.GOLD;
  if (zombie.mutationCount >= 1) return ZombieQuality.SILVER;
  return ZombieQuality.BRONZE;
}

export function getZombieGrowthStage(zombie: Zombie, now: number = Date.now()): ZombieStage {
  if (!zombie.plantedAt) return ZombieStage.GRAVE_MOUND;

  const growthTime = ZOMBIE_GROWTH[zombie.type].growthTime * 1000; // Convert to ms
  const elapsed = now - zombie.plantedAt;
  const progress = elapsed / growthTime;

  if (progress >= 1.0) return ZombieStage.READY_TO_HARVEST;
  if (progress >= 0.75) return ZombieStage.HALF_RISEN;
  if (progress >= 0.50) return ZombieStage.RISING_CORPSE;
  if (progress >= 0.25) return ZombieStage.BONE_SPROUT;
  return ZombieStage.GRAVE_MOUND;
}