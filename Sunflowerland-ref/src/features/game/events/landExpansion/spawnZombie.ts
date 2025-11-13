/**
 * 🧟 Spawn Zombie Event
 * Plant a zombie seed in a grave plot
 * Based on plant.ts but adapted for zombie mechanics
 */

import { produce } from "immer";
import Decimal from "decimal.js-light";
import { GameState, ZombiePlot, RaisingZombie } from "features/game/types/game";
import {
  ZombieSeedName,
  SEED_TO_ZOMBIE_MAP,
  ZOMBIE_SEEDS,
} from "features/game/types/zombieResources";
import { ZOMBIE_GROWTH, ZombieStage, ZombieType } from "features/game/types/zombies";

export type SpawnZombieAction = {
  type: "zombie.spawned";
  seed: ZombieSeedName;
  plotId: string;
  zombieId: string;
};

type Options = {
  state: Readonly<GameState>;
  action: SpawnZombieAction;
  createdAt?: number;
};

/**
 * Calculate growth time boosts from necromancer skills and buildings
 */
function calculateZombieBoosts(state: GameState, coordinates?: { x: number; y: number }): number {
  let multiplier = 1.0;

  // TODO: Add boost calculations when necromancer skills are implemented
  // Examples:
  // - Dark Vision skill: -5% growth time
  // - Necromantic Aura: -10% growth time when near player
  // - Blood Well: -15% growth time for nearby plots
  // - Mutation Lab: -20% growth time for nearby plots

  return multiplier;
}

/**
 * Spawn (plant) a zombie seed in a grave plot
 */
export function spawnZombie({ state, action, createdAt = Date.now() }: Options): GameState {
  return produce(state, (stateCopy) => {
    const { zombiePlots } = stateCopy;
    const plot = zombiePlots[action.plotId];

    // 1. Validate plot exists
    if (!plot) {
      throw new Error(`Plot ${action.plotId} does not exist`);
    }

    // 2. Validate plot is placed (has coordinates)
    if (!plot.coordinates) {
      throw new Error("Plot must be placed on the map first");
    }

    // 3. Check plot is empty
    if (plot.zombie) {
      throw new Error("A zombie is already growing here");
    }

    // 4. Validate seed type
    if (!(action.seed in ZOMBIE_SEEDS)) {
      throw new Error(`${action.seed} is not a valid zombie seed`);
    }

    // 5. Check player has seed in inventory
    const seedCount = stateCopy.inventory[action.seed] || new Decimal(0);
    if (seedCount.lessThan(1)) {
      throw new Error(`You don't have any ${action.seed}`);
    }

    // 6. Determine zombie type from seed
    const zombieType: ZombieType = SEED_TO_ZOMBIE_MAP[action.seed];
    const growthConfig = ZOMBIE_GROWTH[zombieType];

    if (!growthConfig) {
      throw new Error(`No growth config for ${zombieType}`);
    }

    // 7. Calculate growth time with boosts
    const baseGrowthTime = growthConfig.growthTime;
    const boostMultiplier = calculateZombieBoosts(stateCopy, plot.coordinates);
    const adjustedGrowthTime = baseGrowthTime * boostMultiplier;
    const boostedTime = baseGrowthTime - adjustedGrowthTime;

    // 8. Create raising zombie
    const raisingZombie: RaisingZombie = {
      id: action.zombieId,
      type: zombieType,
      buriedAt: createdAt,
      stage: ZombieStage.GRAVE_MOUND,
      happiness: 50,  // Starts at neutral happiness
      boostedTime: boostedTime,
    };

    // 9. Plant zombie in plot
    plot.zombie = raisingZombie;
    plot.careLevel = 50;  // Starts at neutral care level

    // 10. Deduct seed from inventory
    stateCopy.inventory[action.seed] = seedCount.sub(1);

    // 11. Track activity
    stateCopy.farmActivity = stateCopy.farmActivity || {};
    stateCopy.farmActivity["Zombie Spawned"] =
      (stateCopy.farmActivity["Zombie Spawned"] || 0) + 1;

    return stateCopy;
  });
}
