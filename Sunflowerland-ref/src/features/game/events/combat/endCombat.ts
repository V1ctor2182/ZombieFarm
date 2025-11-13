import Decimal from "decimal.js";
import { GameState } from "../../types/game";
import { ZombieStatus } from "../../types/zombies";

export type EndCombatAction = {
  type: "combat.ended";
  casualties: string[]; // IDs of permanently dead zombies
  result: "victory" | "defeat";
};

type Options = {
  state: Readonly<GameState>;
  action: EndCombatAction;
  createdAt?: number;
};

export function endCombat({ state, action }: Options): GameState {
  const stateCopy = { ...state };

  // Initialize zombies if needed
  if (!stateCopy.zombies) {
    stateCopy.zombies = {};
  }

  // Remove dead zombies permanently
  action.casualties.forEach(zombieId => {
    if (stateCopy.zombies[zombieId]) {
      // Mark as DEAD - they're gone forever!
      stateCopy.zombies[zombieId].status = ZombieStatus.DEAD;

      // Could also completely remove them:
      // delete stateCopy.zombies[zombieId];

      console.log(`☠️ Zombie ${zombieId} has fallen in battle and is lost forever!`);
    }
  });

  // Track battle statistics
  if (!stateCopy.battleStats) {
    stateCopy.battleStats = {
      totalBattles: 0,
      victories: 0,
      defeats: 0,
      zombiesLost: 0,
    };
  }

  stateCopy.battleStats.totalBattles += 1;
  stateCopy.battleStats.zombiesLost += action.casualties.length;

  if (action.result === "victory") {
    stateCopy.battleStats.victories += 1;

    // Reward for victory
    if (!stateCopy.inventory["Soul Essence"]) {
      stateCopy.inventory["Soul Essence"] = new Decimal(0);
    }

    // Gain souls based on battle performance
    const soulsGained = Math.max(10, 50 - action.casualties.length * 10);
    stateCopy.inventory["Soul Essence"] = stateCopy.inventory["Soul Essence"].add(soulsGained);

    console.log(`🎉 Victory! Gained ${soulsGained} Soul Essence`);

    // Also give some dark seeds as rewards
    if (!stateCopy.inventory["Dark Seeds"]) {
      stateCopy.inventory["Dark Seeds"] = new Decimal(0);
    }
    stateCopy.inventory["Dark Seeds"] = stateCopy.inventory["Dark Seeds"].add(3);

  } else {
    stateCopy.battleStats.defeats += 1;
    console.log("💀 Defeat! The human castle stands strong...");
  }

  // Add injuries to surviving zombies (trauma from battle)
  Object.values(stateCopy.zombies).forEach(zombie => {
    if (zombie.status === ZombieStatus.WANDERING && !action.casualties.includes(zombie.id)) {
      // Random chance of battle trauma
      if (Math.random() < 0.3) {
        if (!zombie.permanentInjuries) {
          zombie.permanentInjuries = [];
        }

        const injuries = [
          { type: "Battle Trauma", effect: "combatRefusal", severity: 0.2 },
          { type: "Shell Shock", effect: "speedReduction", severity: 0.15 },
          { type: "War Wound", effect: "damageReduction", severity: 0.1 },
        ];

        const injury = injuries[Math.floor(Math.random() * injuries.length)];
        zombie.permanentInjuries.push(injury);
        zombie.battleScars = (zombie.battleScars || 0) + 1;

        // Increase chance of refusing future combat
        zombie.combatRefusalChance = Math.min(0.5, (zombie.combatRefusalChance || 0) + 0.1);
      }
    }
  });

  // Update last battle timestamp
  stateCopy.lastBattleTime = Date.now();

  return stateCopy;
}