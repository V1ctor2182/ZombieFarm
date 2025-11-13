/**
 * 🧟 Raise Zombie Event
 * When a zombie is "harvested", it comes alive and starts wandering the farm!
 * This is the key moment - zombies become autonomous entities
 */

import { produce } from "immer";
import Decimal from "decimal.js-light";
import { GameState } from "features/game/types/game";
import {
  Zombie,
  ZombieStage,
  ZombieStatus,
  ZombieMood,
  getZombieGrowthStage,
  ZombieQuality,
  calculateZombieQuality,
  ZOMBIE_GROWTH
} from "features/game/types/zombies";

export type RaiseZombieAction = {
  type: "zombie.raised";
  plotId: string;
};

type Options = {
  state: Readonly<GameState>;
  action: RaiseZombieAction;
  createdAt?: number;
};

export function raiseZombie({ state, action, createdAt = Date.now() }: Options): GameState {
  return produce(state, (stateCopy) => {
    const { plotId } = action;
    const plot = stateCopy.zombiePlots[plotId];

    // 1. Validate plot exists
    if (!plot) {
      throw new Error(`Plot ${plotId} does not exist`);
    }

    // 2. Validate zombie is growing
    if (!plot.zombie) {
      throw new Error("No zombie to raise in this plot");
    }

    const raisingZombie = plot.zombie;

    // 3. Check if zombie is ready to harvest
    const growthStage = getZombieGrowthStage({
      plantedAt: raisingZombie.buriedAt,
      type: raisingZombie.type
    } as any, createdAt);

    if (growthStage !== ZombieStage.READY_TO_HARVEST) {
      throw new Error("Zombie is not ready to raise yet");
    }

    // 4. Get base stats
    const zombieData = ZOMBIE_GROWTH[raisingZombie.type];
    const baseStats = zombieData.baseStats;

    // 5. Calculate stat modifiers from care and happiness
    const happinessMultiplier = 1 + (raisingZombie.happiness - 50) / 100;  // -50% to +50%
    const careMultiplier = plot.careLevel ? 1 + (plot.careLevel - 50) / 100 : 1.0;

    // 6. Create the fully-raised zombie
    const zombie: Zombie = {
      id: raisingZombie.id,
      type: raisingZombie.type,
      tier: zombieData.tier,

      // Timestamps
      plantedAt: raisingZombie.buriedAt,
      maturedAt: createdAt,
      harvestedAt: createdAt,
      stage: ZombieStage.READY_TO_HARVEST,
      growthTime: zombieData.growthTime,

      // Position (starts at plot location)
      position: plot.coordinates!,
      targetPosition: getRandomWanderTarget(plot.coordinates!),

      // Stats with modifiers
      maxHP: Math.floor(baseStats.hp * happinessMultiplier * careMultiplier),
      currentHP: Math.floor(baseStats.hp * happinessMultiplier * careMultiplier),
      attack: Math.floor(baseStats.attack * happinessMultiplier),
      defense: Math.floor(baseStats.defense * careMultiplier),
      speed: baseStats.speed,

      // Initial state
      level: 1,
      experience: 0,
      invasionsSurvived: 0,
      isMaster: false,
      status: ZombieStatus.WANDERING,
      mood: ZombieMood.HAPPY,  // Happy to be alive!
      isWandering: true,

      // Permanent consequences (none yet)
      permanentInjuries: [],
      battleScars: 0,
      combatRefusalChance: 0,

      // Mutations (none yet - will be added via mutation system)
      mutations: {},
      mutationCount: 0,
      abilities: [],
    };

    // 7. Add to raised zombies collection
    stateCopy.raisedZombies[zombie.id] = zombie;

    // 8. Clear the plot for replanting
    plot.zombie = undefined;
    plot.careLevel = undefined;

    // 9. Grant experience to necromancer
    const xpGained = 10;
    if (stateCopy.bumpkin) {
      stateCopy.bumpkin.experience = (stateCopy.bumpkin.experience || 0) + xpGained;
    }

    // 10. Track activity
    stateCopy.farmActivity = stateCopy.farmActivity || {};
    stateCopy.farmActivity["Zombie Raised"] =
      (stateCopy.farmActivity["Zombie Raised"] || 0) + 1;

    return stateCopy;
  });
}

/**
 * Get random wander target within farm boundaries
 */
function getRandomWanderTarget(currentPos: { x: number; y: number }): { x: number; y: number } {
  const wanderRadius = 10; // How far zombie can wander from current position
  return {
    x: currentPos.x + (Math.random() - 0.5) * wanderRadius * 2,
    y: currentPos.y + (Math.random() - 0.5) * wanderRadius * 2
  };
}

/**
 * Check if a zombie plot has a ready zombie
 */
export function hasReadyZombie(plot: any, now: number = Date.now()): boolean {
  if (!plot.zombie) return false;
  const stage = getZombieGrowthStage({
    plantedAt: plot.zombie.buriedAt,
    type: plot.zombie.type
  } as any, now);
  return stage === ZombieStage.READY_TO_HARVEST;
}

/**
 * Get all zombie plots with ready zombies
 */
export function getReadyZombiePlots(state: GameState): string[] {
  const zombiePlots = state.zombiePlots || {};
  const now = Date.now();

  return Object.entries(zombiePlots)
    .filter(([_, plot]) => hasReadyZombie(plot, now))
    .map(([plotId]) => plotId);
}