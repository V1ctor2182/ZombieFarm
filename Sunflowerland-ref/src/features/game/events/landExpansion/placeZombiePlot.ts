/**
 * 🧟 Place Zombie Plot Event
 * Places a grave plot on the farm for raising zombies
 * Based on placePlot.ts but adapted for zombie mechanics
 */

import { Coordinates } from "features/game/expansion/components/MapPlacement";
import { GameState } from "features/game/types/game";
import { produce } from "immer";
import Decimal from "decimal.js-light";

export type PlaceZombiePlotAction = {
  type: "zombiePlot.placed";
  name: "Zombie Plot";
  id: string;
  coordinates: Coordinates;
};

type Options = {
  state: Readonly<GameState>;
  action: PlaceZombiePlotAction;
  createdAt?: number;
};

export function placeZombiePlot({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  return produce(state, (game) => {
    // 1. Check if zombie plots are available in inventory
    const available = (game.inventory["Zombie Plot"] || new Decimal(0)).minus(
      Object.values(game.zombiePlots).filter(
        (plot) => plot.coordinates?.x !== undefined && plot.coordinates?.y !== undefined
      ).length
    );

    if (available.lt(1)) {
      throw new Error("No zombie plots available");
    }

    // 2. Try to find an existing unplaced zombie plot
    const existingPlot = Object.entries(game.zombiePlots).find(
      ([_, plot]) =>
        plot.coordinates?.x === undefined && plot.coordinates?.y === undefined
    );

    if (existingPlot) {
      // 3a. Update existing plot with coordinates
      const [id, plot] = existingPlot;
      const updatedPlot = {
        ...plot,
        coordinates: {
          x: action.coordinates.x,
          y: action.coordinates.y,
        },
      };

      // Preserve zombie growth progress if moving a plot with a growing zombie
      if (updatedPlot.zombie && updatedPlot.removedAt) {
        const existingProgress = updatedPlot.removedAt - updatedPlot.zombie.buriedAt;
        updatedPlot.zombie.buriedAt = createdAt - existingProgress;
      }

      delete updatedPlot.removedAt;
      game.zombiePlots[id] = updatedPlot;

      return game;
    }

    // 3b. Create a new zombie plot
    game.zombiePlots = {
      ...game.zombiePlots,
      [action.id]: {
        createdAt,
        coordinates: {
          x: action.coordinates.x,
          y: action.coordinates.y,
        },
      },
    };

    return game;
  });
}
