import React, { useEffect, useRef, useState } from "react";
import { CombatEngine, CombatUnit } from "../lib/combatEngine";
import { ZombieType } from "../../game/types/zombies";
import "./CombatView.css";

interface CombatViewProps {
  zombies: Array<{
    id: string;
    type: ZombieType;
    level: number;
    permanentInjuries?: string[];
  }>;
  onBattleEnd: (result: "victory" | "defeat", casualties: string[]) => void;
}

export const CombatView: React.FC<CombatViewProps> = ({ zombies, onBattleEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CombatEngine | null>(null);
  const animationRef = useRef<number>(0);
  const [battleState, setBattleState] = useState<"preparing" | "fighting" | "ended">("preparing");
  const [selectedZombies, setSelectedZombies] = useState<string[]>([]);
  const [casualties, setCasualties] = useState<string[]>([]);

  // Initialize combat engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 400;

    engineRef.current = new CombatEngine({
      width: canvas.width,
      height: canvas.height,
      lanes: 3,
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Deploy selected zombies
  const deployZombies = () => {
    if (!engineRef.current || selectedZombies.length === 0) return;

    selectedZombies.forEach((zombieId, index) => {
      const zombie = zombies.find(z => z.id === zombieId);
      if (!zombie) return;

      // Convert to combat unit
      const unit: CombatUnit = {
        id: zombie.id,
        type: "zombie",
        zombieType: zombie.type,
        x: 50 + (index * 30),
        y: 100 + (index % 3) * 100, // Distribute across lanes
        hp: getZombieHP(zombie.type, zombie.level),
        maxHp: getZombieHP(zombie.type, zombie.level),
        damage: getZombieDamage(zombie.type, zombie.level),
        speed: getZombieSpeed(zombie.type),
        lane: index % 3,
        team: "player",
        state: "idle",
        attackCooldown: 0,
      };

      engineRef.current.addUnit(unit);
    });

    // Add enemy defenders
    for (let i = 0; i < 5; i++) {
      const defender: CombatUnit = {
        id: `defender-${i}`,
        type: "human",
        x: 1000 + (i * 40),
        y: 100 + (i % 3) * 100,
        hp: 50,
        maxHp: 50,
        damage: 10,
        speed: 0,
        lane: i % 3,
        team: "enemy",
        state: "idle",
        attackCooldown: 0,
      };

      engineRef.current.addUnit(defender);
    }

    setBattleState("fighting");
    startBattle();
  };

  // Game loop
  const startBattle = () => {
    const gameLoop = () => {
      if (!engineRef.current || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d")!;
      const engine = engineRef.current;

      // Update game state
      engine.update();

      // Check win/lose conditions
      const result = engine.checkVictoryCondition();
      if (result) {
        setBattleState("ended");
        const deadZombies = engine.getState().deadZombies;
        setCasualties(deadZombies);
        onBattleEnd(result, deadZombies);
        return;
      }

      // Render
      render(ctx, engine);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  };

  // Render the battle
  const render = (ctx: CanvasRenderingContext2D, engine: CombatEngine) => {
    const state = engine.getState();

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw lane lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 133);
      ctx.lineTo(ctx.canvas.width, i * 133);
      ctx.stroke();
    }

    // Draw castle
    ctx.fillStyle = "#4a4a4a";
    ctx.fillRect(1100, 50, 80, 300);
    ctx.fillStyle = "#660000";
    ctx.fillRect(1110, 80, 60, 40); // Gate

    // Draw units
    state.units.forEach(unit => {
      if (unit.state === "dead") return;

      // Unit body
      ctx.fillStyle = unit.team === "player" ? "#4B5320" : "#8B4513";
      if (unit.type === "zombie") {
        // Different colors for zombie types
        switch (unit.zombieType) {
          case ZombieType.HEADLESS:
            ctx.fillStyle = "#2F4F2F";
            break;
          case ZombieType.GIANT:
            ctx.fillStyle = "#355E3B";
            break;
          case ZombieType.NINJA:
            ctx.fillStyle = "#1C1C1C";
            break;
          default:
            ctx.fillStyle = "#4B5320";
        }
      }

      ctx.fillRect(unit.x - 15, unit.y - 15, 30, 30);

      // Health bar
      const healthPercent = unit.hp / unit.maxHp;
      ctx.fillStyle = "#000";
      ctx.fillRect(unit.x - 20, unit.y - 25, 40, 4);
      ctx.fillStyle = healthPercent > 0.5 ? "#0f0" : healthPercent > 0.25 ? "#ff0" : "#f00";
      ctx.fillRect(unit.x - 20, unit.y - 25, 40 * healthPercent, 4);

      // State indicator
      if (unit.state === "attacking") {
        ctx.strokeStyle = "#ff0";
        ctx.strokeRect(unit.x - 17, unit.y - 17, 34, 34);
      }
    });

    // Draw projectiles
    state.projectiles.forEach(proj => {
      ctx.fillStyle = proj.type === "acid" ? "#0f0" :
                      proj.type === "bone" ? "#fff" : "#666";
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw effects
    state.effects.forEach(effect => {
      ctx.save();
      ctx.globalAlpha = 0.5;

      if (effect.type === "explosion") {
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius || 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === "poison") {
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(effect.x - 10, effect.y - 10, 20, 20);
      }

      ctx.restore();
    });

    // Draw UI elements
    ctx.fillStyle = "#fff";
    ctx.font = "16px monospace";
    ctx.fillText(`Wave: ${state.wave}`, 10, 30);
    ctx.fillText(`Time: ${Math.floor(state.battleTime / 60)}s`, 10, 50);

    if (casualties.length > 0) {
      ctx.fillStyle = "#f00";
      ctx.fillText(`Casualties: ${casualties.length}`, 10, 70);
    }
  };

  // Helper functions for zombie stats
  const getZombieHP = (type: ZombieType, level: number): number => {
    const baseHP: Record<ZombieType, number> = {
      [ZombieType.NORMAL]: 100,
      [ZombieType.HEADLESS]: 80,
      [ZombieType.MINI]: 50,
      [ZombieType.CRAZY]: 120,
      [ZombieType.FAT]: 200,
      [ZombieType.GIANT]: 300,
      [ZombieType.PIRATE]: 110,
      [ZombieType.PILOT]: 90,
      [ZombieType.CYBORG]: 150,
      [ZombieType.NINJA]: 70,
      [ZombieType.MONSTER]: 250,
    };
    return baseHP[type] * (1 + level * 0.1);
  };

  const getZombieDamage = (type: ZombieType, level: number): number => {
    const baseDamage: Record<ZombieType, number> = {
      [ZombieType.NORMAL]: 15,
      [ZombieType.HEADLESS]: 20,
      [ZombieType.MINI]: 8,
      [ZombieType.CRAZY]: 25,
      [ZombieType.FAT]: 10,
      [ZombieType.GIANT]: 35,
      [ZombieType.PIRATE]: 18,
      [ZombieType.PILOT]: 12,
      [ZombieType.CYBORG]: 22,
      [ZombieType.NINJA]: 30,
      [ZombieType.MONSTER]: 40,
    };
    return baseDamage[type] * (1 + level * 0.15);
  };

  const getZombieSpeed = (type: ZombieType): number => {
    const speeds: Record<ZombieType, number> = {
      [ZombieType.NORMAL]: 1,
      [ZombieType.HEADLESS]: 1.5,
      [ZombieType.MINI]: 2,
      [ZombieType.CRAZY]: 1.8,
      [ZombieType.FAT]: 0.5,
      [ZombieType.GIANT]: 0.7,
      [ZombieType.PIRATE]: 1.2,
      [ZombieType.PILOT]: 1.3,
      [ZombieType.CYBORG]: 1.1,
      [ZombieType.NINJA]: 2.5,
      [ZombieType.MONSTER]: 0.8,
    };
    return speeds[type];
  };

  return (
    <div className="combat-view">
      <div className="combat-header">
        <h2>⚔️ BATTLE: Castle Siege</h2>
        <div className="battle-status">{battleState.toUpperCase()}</div>
      </div>

      {battleState === "preparing" && (
        <div className="zombie-selection">
          <h3>Select Your Zombies (Max 5)</h3>
          <div className="zombie-list">
            {zombies.map(zombie => (
              <div
                key={zombie.id}
                className={`zombie-card ${selectedZombies.includes(zombie.id) ? "selected" : ""}`}
                onClick={() => {
                  if (selectedZombies.includes(zombie.id)) {
                    setSelectedZombies(prev => prev.filter(id => id !== zombie.id));
                  } else if (selectedZombies.length < 5) {
                    setSelectedZombies(prev => [...prev, zombie.id]);
                  }
                }}
              >
                <div className="zombie-type">{zombie.type}</div>
                <div className="zombie-level">Lv.{zombie.level}</div>
                {zombie.permanentInjuries && zombie.permanentInjuries.length > 0 && (
                  <div className="injury-indicator">🩹</div>
                )}
              </div>
            ))}
          </div>
          <button
            className="deploy-button"
            disabled={selectedZombies.length === 0}
            onClick={deployZombies}
          >
            DEPLOY ZOMBIES ({selectedZombies.length}/5)
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="combat-canvas"
        style={{ display: battleState === "preparing" ? "none" : "block" }}
      />

      {battleState === "ended" && casualties.length > 0 && (
        <div className="casualty-report">
          <h3>⚰️ PERMANENT CASUALTIES</h3>
          <p>These zombies have fallen in battle and cannot be recovered:</p>
          <ul>
            {casualties.map(id => (
              <li key={id}>{zombies.find(z => z.id === id)?.type || id}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};