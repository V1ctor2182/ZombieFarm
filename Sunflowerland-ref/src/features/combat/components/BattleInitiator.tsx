import React, { useState } from "react";
import { useSelector } from "@xstate/react";
import { Context } from "../../game/GameProvider";
import { CombatView } from "./CombatView";
import { Zombie, ZombieStatus } from "../../game/types/zombies";
import "./BattleInitiator.css";

export const BattleInitiator: React.FC = () => {
  const { gameService } = React.useContext(Context);
  const [showCombat, setShowCombat] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    type: "victory" | "defeat";
    casualties: string[];
  } | null>(null);

  // Get zombies from game state
  const zombies = useSelector(gameService, (state) => {
    const gameState = state.context.state;
    if (!gameState.zombies) return [];

    // Only get wandering zombies (not growing ones)
    return Object.entries(gameState.zombies)
      .filter(([_, zombie]) => zombie.status === ZombieStatus.WANDERING)
      .map(([id, zombie]) => ({
        id,
        type: zombie.type,
        level: zombie.level || 1,
        permanentInjuries: zombie.permanentInjuries?.map(i => i.type) || [],
      }));
  });

  const startBattle = () => {
    if (zombies.length === 0) {
      alert("You need wandering zombies to start a battle! Harvest some zombies first.");
      return;
    }
    setShowCombat(true);
    setBattleResult(null);
  };

  const handleBattleEnd = (result: "victory" | "defeat", casualties: string[]) => {
    setBattleResult({ type: result, casualties });

    // Update game state to remove dead zombies
    if (casualties.length > 0) {
      gameService.send({
        type: "combat.ended",
        casualties,
        result,
      });
    }

    // Show result for 3 seconds then close
    setTimeout(() => {
      setShowCombat(false);
      setBattleResult(null);
    }, 3000);
  };

  return (
    <>
      {/* Battle Button - Always visible */}
      <div className="battle-initiator">
        <button
          className="battle-button"
          onClick={startBattle}
          disabled={zombies.length === 0}
        >
          <span className="battle-icon">⚔️</span>
          <span className="battle-text">ATTACK CASTLE</span>
          {zombies.length > 0 && (
            <span className="zombie-count">{zombies.length} zombies ready</span>
          )}
        </button>

        {battleResult && (
          <div className={`battle-result ${battleResult.type}`}>
            <h3>{battleResult.type === "victory" ? "🎉 VICTORY!" : "💀 DEFEAT!"}</h3>
            {battleResult.casualties.length > 0 && (
              <p className="casualties-count">
                Lost {battleResult.casualties.length} zombie{battleResult.casualties.length > 1 ? "s" : ""} permanently
              </p>
            )}
          </div>
        )}
      </div>

      {/* Combat View - Fullscreen overlay */}
      {showCombat && (
        <CombatView
          zombies={zombies}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </>
  );
};

// Quick Battle Button - Can be added anywhere in the UI
export const QuickBattleButton: React.FC = () => {
  const { gameService } = React.useContext(Context);

  const zombieCount = useSelector(gameService, (state) => {
    const gameState = state.context.state;
    if (!gameState.zombies) return 0;
    return Object.values(gameState.zombies).filter(
      z => z.status === ZombieStatus.WANDERING
    ).length;
  });

  const [showBattleInit, setShowBattleInit] = useState(false);

  if (zombieCount === 0) return null;

  return (
    <>
      <button
        className="quick-battle-btn"
        onClick={() => setShowBattleInit(!showBattleInit)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 999,
        }}
      >
        ⚔️ Battle ({zombieCount})
      </button>
      {showBattleInit && <BattleInitiator />}
    </>
  );
};