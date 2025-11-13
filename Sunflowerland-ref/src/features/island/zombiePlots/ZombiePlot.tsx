/**
 * 🧟 Zombie Plot Component
 * Renders a grave plot that can grow zombies
 * Based on Plot.tsx but adapted for zombie mechanics
 */

import React, { useContext, useState, useRef, useCallback } from "react";
import { useSelector } from "@xstate/react";
import { v4 as uuidv4 } from "uuid";

import { Context } from "features/game/GameProvider";
import { ZoomContext } from "components/ZoomProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { MapPlacement } from "features/game/expansion/components/MapPlacement";
import { getZombieGrowthStage, ZombieStage } from "features/game/types/zombies";
import { ZombieSeedName } from "features/game/types/zombieResources";

import { SUNNYSIDE } from "assets/sunnyside";

interface Props {
  id: string;
}

// Selector for zombie plots
const _zombiePlots = (state: any) => state.context.state.zombiePlots;

export const ZombiePlot: React.FC<Props> = ({ id }) => {
  const { scale } = useContext(ZoomContext);
  const { gameService, selectedItem } = useContext(Context);
  const [touchCount, setTouchCount] = useState(0);
  const clickedAt = useRef<number>(0);

  // Select zombie plot data by ID
  const zombiePlots = useSelector(gameService, _zombiePlots, (prev: any, next: any) => {
    return JSON.stringify(prev?.[id]) === JSON.stringify(next?.[id]);
  });

  const plot = zombiePlots?.[id];

  if (!plot || !plot.coordinates) {
    return null;
  }

  const zombie = plot.zombie;
  const now = Date.now();

  // Determine growth stage if zombie is growing
  let growthStage: ZombieStage | null = null;
  if (zombie) {
    growthStage = getZombieGrowthStage(
      {
        plantedAt: zombie.buriedAt,
        type: zombie.type,
      } as any,
      now
    );
  }

  const readyToHarvest = growthStage === ZombieStage.READY_TO_HARVEST;

  // Handle clicking the plot
  const handleClick = useCallback(
    (seed: ZombieSeedName = selectedItem as ZombieSeedName) => {
      const now = Date.now();

      // Prevent double-click spam
      if (now - clickedAt.current < 100) {
        return;
      }

      clickedAt.current = now;

      if (!zombie) {
        // Plant a zombie seed
        try {
          gameService.send({
            type: "zombie.spawned",
            seed,
            plotId: id,
            zombieId: uuidv4().slice(0, 8),
          });
        } catch (error) {
          console.error("Failed to spawn zombie:", error);
        }
      } else if (readyToHarvest) {
        // Raise the zombie (harvest)
        try {
          gameService.send({
            type: "zombie.raised",
            plotId: id,
          });
        } catch (error) {
          console.error("Failed to raise zombie:", error);
        }
      }
    },
    [selectedItem, zombie, readyToHarvest, gameService, id]
  );

  // Get visual representation based on state
  const getPlotVisual = () => {
    if (!zombie) {
      // Empty grave plot
      return (
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-80"
          style={{
            background: "#4a3c28",
            border: "2px solid #2a1c18",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: `${12 * PIXEL_SCALE}px`, color: "#8b7355" }}>
            ⚰️
          </span>
        </div>
      );
    }

    // Zombie is growing - show stage
    const stageEmojis: Record<ZombieStage, string> = {
      [ZombieStage.GRAVE_MOUND]: "🪦",
      [ZombieStage.BONE_SPROUT]: "🦴",
      [ZombieStage.RISING_CORPSE]: "🧟",
      [ZombieStage.HALF_RISEN]: "🧟‍♂️",
      [ZombieStage.READY_TO_HARVEST]: "🧟‍♀️",
    };

    const emoji = stageEmojis[growthStage!] || "🪦";
    const isReady = readyToHarvest;

    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center cursor-pointer ${
          isReady ? "animate-pulse" : ""
        }`}
        style={{
          background: isReady ? "#3a2c18" : "#4a3c28",
          border: `2px solid ${isReady ? "#6b5340" : "#2a1c18"}`,
          borderRadius: "8px",
        }}
      >
        <span style={{ fontSize: `${16 * PIXEL_SCALE}px` }}>{emoji}</span>
        {isReady && (
          <span
            style={{
              fontSize: `${8 * PIXEL_SCALE}px`,
              color: "#90ee90",
              marginTop: `${2 * PIXEL_SCALE}px`,
            }}
          >
            Ready!
          </span>
        )}
        {plot.careLevel !== undefined && (
          <div
            style={{
              position: "absolute",
              top: `${2 * PIXEL_SCALE}px`,
              right: `${2 * PIXEL_SCALE}px`,
              fontSize: `${6 * PIXEL_SCALE}px`,
              background: "rgba(0,0,0,0.5)",
              padding: `${1 * PIXEL_SCALE}px`,
              borderRadius: "2px",
              color: "#fff",
            }}
          >
            {plot.careLevel}%
          </div>
        )}
      </div>
    );
  };

  return (
    <MapPlacement
      x={plot.coordinates.x}
      y={plot.coordinates.y}
      height={1}
      width={1}
    >
      <div
        onClick={handleClick}
        style={{
          width: `${PIXEL_SCALE * 16}px`,
          height: `${PIXEL_SCALE * 16}px`,
        }}
      >
        {getPlotVisual()}
      </div>
    </MapPlacement>
  );
};
