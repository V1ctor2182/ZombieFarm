/**
 * 🧟 Zombie Farm Resources
 * Replaces traditional farming resources with zombie-themed items
 */

import Decimal from "decimal.js-light";
import { ZombieType } from "./zombies";

// Zombie-specific resources
export type ZombieResourceName =
  | "Dark Seed"
  | "Blood"
  | "Rotten Meat"
  | "Bones"
  | "Rotten Wood"
  | "Soul Essence"
  | "Blood Meal"
  | "Bone Meal"
  | "Rotten Compost";

// Different seed types for different zombies
export type ZombieSeedName =
  | "Dark Seed"           // Basic - grows Normal Zombie
  | "Shambler Seed"       // Basic - grows Normal Zombie
  | "Headless Seed"       // Green tier
  | "Mini Seed"           // Green tier
  | "Runner Seed"         // Green tier (Zombie Girl)
  | "Pumpkin Head Seed"   // Blue tier
  | "Gardener Seed"       // Blue tier
  | "Crazy Seed"          // Blue tier
  | "Monster Seed"        // Red tier
  | "Cupid Seed"          // Red tier (event)
  | "Mad Seed"            // Red tier (event)
  | "King Seed";          // Red tier (premium)

// Map seeds to zombie types
export const SEED_TO_ZOMBIE_MAP: Record<ZombieSeedName, ZombieType> = {
  "Dark Seed": ZombieType.NORMAL,
  "Shambler Seed": ZombieType.NORMAL,
  "Headless Seed": ZombieType.HEADLESS,
  "Mini Seed": ZombieType.MINI,
  "Runner Seed": ZombieType.ZOMBIE_GIRL,
  "Pumpkin Head Seed": ZombieType.PUMPKIN_HEAD,
  "Gardener Seed": ZombieType.GARDENER,
  "Crazy Seed": ZombieType.CRAZY,
  "Monster Seed": ZombieType.MONSTER,
  "Cupid Seed": ZombieType.CUPID,
  "Mad Seed": ZombieType.MAD,
  "King Seed": ZombieType.ZOMBIE_KING,
};

// Resource details
export const ZOMBIE_RESOURCES: Record<ZombieResourceName, {
  description: string;
  icon?: string;
}> = {
  "Dark Seed": {
    description: "Plant to grow zombies",
    icon: "seeds/dark_seed.png",
  },
  "Blood": {
    description: "Used to water zombie plots",
    icon: "resources/blood.png",
  },
  "Rotten Meat": {
    description: "Feed zombies to keep them happy",
    icon: "resources/rotten_meat.png",
  },
  "Bones": {
    description: "Building material for structures",
    icon: "resources/bones.png",
  },
  "Rotten Wood": {
    description: "Building material for structures",
    icon: "resources/rotten_wood.png",
  },
  "Soul Essence": {
    description: "Mystical currency from battles",
    icon: "resources/soul_essence.png",
  },
  "Blood Meal": {
    description: "Fertilizer that speeds growth",
    icon: "resources/blood_meal.png",
  },
  "Bone Meal": {
    description: "Fertilizer that improves stats",
    icon: "resources/bone_meal.png",
  },
  "Rotten Compost": {
    description: "Fertilizer that increases happiness",
    icon: "resources/compost.png",
  },
};

// Seed details
export const ZOMBIE_SEEDS: Record<ZombieSeedName, {
  description: string;
  brainCost: number;  // Cost to acquire seed
  tier: "green" | "blue" | "red";
}> = {
  "Dark Seed": {
    description: "Grows a Normal Zombie",
    brainCost: 1,
    tier: "green",
  },
  "Shambler Seed": {
    description: "Grows a Normal Zombie",
    brainCost: 1,
    tier: "green",
  },
  "Headless Seed": {
    description: "Grows a Headless Zombie (Tank)",
    brainCost: 1,
    tier: "green",
  },
  "Mini Seed": {
    description: "Grows a Mini Zombie (Fast)",
    brainCost: 1,
    tier: "green",
  },
  "Runner Seed": {
    description: "Grows a Zombie Girl (Glass Cannon)",
    brainCost: 1,
    tier: "green",
  },
  "Pumpkin Head Seed": {
    description: "Grows a Pumpkin Head Zombie (Boxing)",
    brainCost: 2,
    tier: "blue",
  },
  "Gardener Seed": {
    description: "Grows a Gardener Zombie (Healer)",
    brainCost: 2,
    tier: "blue",
  },
  "Crazy Seed": {
    description: "Grows a Crazy Zombie (High Damage)",
    brainCost: 2,
    tier: "blue",
  },
  "Monster Seed": {
    description: "Grows a Monster Zombie (Elite)",
    brainCost: 4,
    tier: "red",
  },
  "Cupid Seed": {
    description: "Grows a Cupid Zombie (Event)",
    brainCost: 4,
    tier: "red",
  },
  "Mad Seed": {
    description: "Grows a Mad Zombie (Highest Attack)",
    brainCost: 4,
    tier: "red",
  },
  "King Seed": {
    description: "Grows a Zombie King (Boss)",
    brainCost: 10,
    tier: "red",
  },
};

// Starting inventory for tutorial
export const ZOMBIE_FARM_STARTER_INVENTORY = {
  "Dark Seed": new Decimal(5),      // 5 starter seeds
  "Blood": new Decimal(10),          // 10 blood for watering
  "Rotten Meat": new Decimal(5),     // 5 meat for feeding
  "Bones": new Decimal(20),          // 20 bones for building
  "Rotten Wood": new Decimal(20),    // 20 wood for building
  "Soul Essence": new Decimal(0),    // Start with no essence
};
