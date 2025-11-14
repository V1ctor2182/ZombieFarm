/**
 * Custom Game Hooks
 *
 * Additional convenience hooks for common game state operations.
 * These hooks provide type-safe, convenient access to game functionality.
 */

import React from 'react';
import { useGameDispatch, useGameSelector, useGameState } from './GameProvider';
import type { GameEvent } from '../../types/events';
import type { ZombieId, PlotId, LocationId, BuildingId } from '../../types/global';
import type { BattleResult } from '../../types/combat';

// ============================================================================
// PLAYER HOOKS
// ============================================================================

/**
 * usePlayerActions Hook
 *
 * Returns type-safe action dispatchers for player-related events.
 *
 * @example
 * ```tsx
 * function QuestButton() {
 *   const { gainXp, levelUp } = usePlayerActions();
 *
 *   return (
 *     <button onClick={() => gainXp(100, 'quest')}>
 *       Complete Quest
 *     </button>
 *   );
 * }
 * ```
 */
export function usePlayerActions() {
  const dispatch = useGameDispatch();

  return React.useMemo(
    () => ({
      /**
       * Gain XP from a source
       */
      gainXp: (amount: number, source: string) => {
        dispatch({
          type: 'player.xpGained',
          payload: { amount, source, timestamp: Date.now() },
        });
      },

      /**
       * Level up player
       */
      levelUp: (newLevel: number) => {
        dispatch({
          type: 'player.levelUp',
          payload: { newLevel, timestamp: Date.now() },
        });
      },

      /**
       * Unlock achievement
       */
      unlockAchievement: (achievementId: string) => {
        dispatch({
          type: 'achievement.unlocked',
          payload: { achievementId, timestamp: Date.now() },
        });
      },

      /**
       * Start quest
       */
      startQuest: (questId: string) => {
        dispatch({
          type: 'quest.started',
          payload: { questId, timestamp: Date.now() },
        });
      },

      /**
       * Complete quest
       */
      completeQuest: (questId: string, rewards: unknown) => {
        dispatch({
          type: 'quest.completed',
          payload: { questId, rewards, timestamp: Date.now() },
        });
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// GAME CONTROL HOOKS
// ============================================================================

/**
 * useGameControls Hook
 *
 * Returns type-safe action dispatchers for game control events.
 *
 * @example
 * ```tsx
 * function PauseMenu() {
 *   const { pauseGame, resumeGame, saveGame } = useGameControls();
 *
 *   return (
 *     <div>
 *       <button onClick={pauseGame}>Pause</button>
 *       <button onClick={resumeGame}>Resume</button>
 *       <button onClick={saveGame}>Save</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGameControls() {
  const dispatch = useGameDispatch();

  return React.useMemo(
    () => ({
      /**
       * Start the game
       */
      startGame: () => {
        dispatch({
          type: 'game.started',
          payload: { timestamp: Date.now() },
        });
      },

      /**
       * Pause the game
       */
      pauseGame: () => {
        dispatch({
          type: 'game.paused',
          payload: { timestamp: Date.now() },
        });
      },

      /**
       * Resume the game
       */
      resumeGame: () => {
        dispatch({
          type: 'game.resumed',
          payload: { timestamp: Date.now() },
        });
      },

      /**
       * Save the game
       */
      saveGame: () => {
        dispatch({
          type: 'game.saved',
          payload: { timestamp: Date.now() },
        });
      },

      /**
       * End the game
       */
      endGame: (reason: string) => {
        dispatch({
          type: 'game.over',
          payload: { reason, timestamp: Date.now() },
        });
      },
    }),
    [dispatch]
  );
}

/**
 * useTutorialActions Hook
 *
 * Returns type-safe action dispatchers for tutorial events.
 *
 * @example
 * ```tsx
 * function Tutorial() {
 *   const { completeStep, completeTutorial } = useTutorialActions();
 *
 *   return (
 *     <button onClick={() => completeStep('planting')}>
 *       Next Step
 *     </button>
 *   );
 * }
 * ```
 */
export function useTutorialActions() {
  const dispatch = useGameDispatch();

  return React.useMemo(
    () => ({
      /**
       * Start tutorial
       */
      startTutorial: () => {
        dispatch({
          type: 'tutorial.started',
          payload: { timestamp: Date.now() },
        });
      },

      /**
       * Complete tutorial step
       */
      completeStep: (stepId: string) => {
        dispatch({
          type: 'tutorial.stepCompleted',
          payload: { stepId, timestamp: Date.now() },
        });
      },

      /**
       * Complete entire tutorial
       */
      completeTutorial: () => {
        dispatch({
          type: 'tutorial.completed',
          payload: { timestamp: Date.now() },
        });
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// COMBAT HOOKS
// ============================================================================

/**
 * useCombatActions Hook
 *
 * Returns type-safe action dispatchers for combat events.
 *
 * @example
 * ```tsx
 * function RaidButton() {
 *   const { initiateBattle, endBattle, retreat } = useCombatActions();
 *
 *   return (
 *     <button onClick={() => initiateBattle('village-1')}>
 *       Raid Village
 *     </button>
 *   );
 * }
 * ```
 */
export function useCombatActions() {
  const dispatch = useGameDispatch();

  return React.useMemo(
    () => ({
      /**
       * Initiate a battle
       */
      initiateBattle: (locationId: LocationId) => {
        const battleId = `battle-${Date.now()}`;
        dispatch({
          type: 'battle.initiated',
          payload: { battleId, locationId, timestamp: Date.now() },
        });
        return battleId;
      },

      /**
       * Select zombies for squad
       */
      selectSquad: (battleId: string, zombieIds: readonly ZombieId[]) => {
        dispatch({
          type: 'battle.squadSelected',
          payload: { battleId, zombieIds },
        });
      },

      /**
       * Start the battle
       */
      startBattle: (battleId: string) => {
        dispatch({
          type: 'battle.started',
          payload: { battleId, timestamp: Date.now() },
        });
      },

      /**
       * End battle with result
       */
      endBattle: (battleId: string, result: BattleResult) => {
        dispatch({
          type: 'battle.ended',
          payload: { battleId, result, timestamp: Date.now() },
        });
      },

      /**
       * Retreat from battle
       */
      retreat: (battleId: string, survivors: readonly ZombieId[]) => {
        dispatch({
          type: 'battle.retreated',
          payload: { battleId, survivors, timestamp: Date.now() },
        });
      },
    }),
    [dispatch]
  );
}

/**
 * useIsInCombat Hook
 *
 * Returns true if currently in combat mode.
 *
 * @example
 * ```tsx
 * function GameUI() {
 *   const isInCombat = useIsInCombat();
 *
 *   if (isInCombat) {
 *     return <CombatUI />;
 *   }
 *
 *   return <FarmUI />;
 * }
 * ```
 */
export function useIsInCombat(): boolean {
  return useGameSelector((state) => state.matches('combat'));
}

// ============================================================================
// TIME HOOKS
// ============================================================================

/**
 * useTimeActions Hook
 *
 * Returns type-safe action dispatchers for time events.
 *
 * @example
 * ```tsx
 * function TimeController() {
 *   const { advanceDay, changeWeather } = useTimeActions();
 *
 *   return (
 *     <button onClick={() => advanceDay()}>
 *       Advance Day
 *     </button>
 *   );
 * }
 * ```
 */
export function useTimeActions() {
  const dispatch = useGameDispatch();

  return React.useMemo(
    () => ({
      /**
       * Advance to next day
       */
      advanceDay: (newDay: number) => {
        dispatch({
          type: 'time.dayChanged',
          payload: { newDay, timestamp: Date.now() },
        });
      },

      /**
       * Update hour
       */
      updateHour: (newHour: number, isDaytime: boolean) => {
        dispatch({
          type: 'time.hourChanged',
          payload: { newHour, isDaytime, timestamp: Date.now() },
        });
      },

      /**
       * Change weather
       */
      changeWeather: (newWeather: string, duration: number) => {
        dispatch({
          type: 'weather.changed',
          payload: { newWeather, duration, timestamp: Date.now() },
        });
      },
    }),
    [dispatch]
  );
}

/**
 * useIsDaytime Hook
 *
 * Returns true if it's currently daytime.
 *
 * @example
 * ```tsx
 * function SkyBackground() {
 *   const isDaytime = useIsDaytime();
 *
 *   return (
 *     <div className={isDaytime ? 'bg-sky-blue' : 'bg-night-dark'}>
 *       {isDaytime ? '☀️' : '🌙'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsDaytime(): boolean {
  return useGameSelector((state) => state.context.time.isDaytime);
}

/**
 * useCurrentDay Hook
 *
 * Returns the current day number.
 *
 * @example
 * ```tsx
 * function DayCounter() {
 *   const day = useCurrentDay();
 *   return <div>Day {day}</div>;
 * }
 * ```
 */
export function useCurrentDay(): number {
  return useGameSelector((state) => state.context.time.day);
}

// ============================================================================
// RESOURCE HOOKS
// ============================================================================

/**
 * useCurrency Hook
 *
 * Returns the amount of a specific currency.
 *
 * @param currencyType - Currency type ('darkCoins' or 'soulEssence')
 * @returns Currency amount
 *
 * @example
 * ```tsx
 * function CoinDisplay() {
 *   const coins = useCurrency('darkCoins');
 *   return <div>💰 {coins}</div>;
 * }
 * ```
 */
export function useCurrency(currencyType: 'darkCoins' | 'soulEssence'): number {
  return useGameSelector((state) => state.context.inventory.currencies[currencyType]);
}

/**
 * useResource Hook
 *
 * Returns the amount of a specific resource.
 *
 * @param resourceType - Resource type
 * @returns Resource amount (0 if not present)
 *
 * @example
 * ```tsx
 * function ResourceDisplay({ resourceType }: { resourceType: string }) {
 *   const amount = useResource(resourceType);
 *   return <div>{resourceType}: {amount}</div>;
 * }
 * ```
 */
export function useResource(resourceType: string): number {
  return useGameSelector((state) => state.context.inventory.resources[resourceType] || 0);
}

// ============================================================================
// FARM HOOKS
// ============================================================================

/**
 * useZombieCount Hook
 *
 * Returns zombie count statistics.
 *
 * @example
 * ```tsx
 * function ZombieCounter() {
 *   const { active, total, maxCapacity, inCrypt } = useZombieCount();
 *
 *   return (
 *     <div>
 *       <p>Active: {active} / {maxCapacity}</p>
 *       <p>In Crypt: {inCrypt}</p>
 *       <p>Total: {total}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useZombieCount() {
  return useGameSelector((state) => {
    const farm = state.context.farm;
    return {
      active: farm.activeZombieIds.length,
      inCrypt: farm.cryptZombieIds.length,
      total: farm.activeZombieIds.length + farm.cryptZombieIds.length,
      maxCapacity: farm.capacity.max,
      availableSlots: farm.capacity.max - farm.activeZombieIds.length,
    };
  });
}

/**
 * useZombie Hook
 *
 * Returns a specific zombie by ID.
 *
 * @param zombieId - Zombie ID
 * @returns Zombie data or undefined
 *
 * @example
 * ```tsx
 * function ZombieCard({ zombieId }: { zombieId: string }) {
 *   const zombie = useZombie(zombieId);
 *
 *   if (!zombie) return null;
 *
 *   return (
 *     <div>
 *       <h3>{zombie.name}</h3>
 *       <p>Level {zombie.level}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useZombie(zombieId: ZombieId) {
  return useGameSelector((state) => state.context.farm.zombies[zombieId]);
}

/**
 * useActiveZombies Hook
 *
 * Returns all active zombies (not in crypt).
 *
 * @example
 * ```tsx
 * function ZombieList() {
 *   const zombies = useActiveZombies();
 *
 *   return (
 *     <ul>
 *       {zombies.map(zombie => (
 *         <li key={zombie.id}>{zombie.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useActiveZombies() {
  return useGameSelector((state) => {
    const { zombies, activeZombieIds } = state.context.farm;
    return activeZombieIds.map((id) => zombies[id]).filter(Boolean);
  });
}

// ============================================================================
// UI STATE HOOKS
// ============================================================================

/**
 * useSelectedZombie Hook
 *
 * Returns the currently selected zombie ID and a setter function.
 *
 * @example
 * ```tsx
 * function ZombieSelection() {
 *   const { selectedId, setSelected, zombie } = useSelectedZombie();
 *
 *   return (
 *     <div>
 *       {zombie && <ZombieDetails zombie={zombie} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSelectedZombie() {
  const selectedId = useGameSelector((state) => state.context.ui.selectedZombieId);
  const zombie = useGameSelector((state) =>
    selectedId ? state.context.farm.zombies[selectedId] : null
  );

  // Note: We'd need to add UI update events to the machine for setSelected
  // For now, this returns read-only data
  return {
    selectedId,
    zombie,
  };
}

/**
 * useCanAfford Hook
 *
 * Check if player can afford a cost (currencies + resources).
 *
 * @param cost - Cost object with currencies and resources
 * @returns True if can afford
 *
 * @example
 * ```tsx
 * function BuyButton({ cost }: { cost: Cost }) {
 *   const canAfford = useCanAfford(cost);
 *
 *   return (
 *     <button disabled={!canAfford}>
 *       Buy Item
 *     </button>
 *   );
 * }
 * ```
 */
export function useCanAfford(cost: {
  currencies?: Record<string, number>;
  resources?: Record<string, number>;
}): boolean {
  return useGameSelector((state) => {
    const inventory = state.context.inventory;

    // Check currencies
    if (cost.currencies) {
      for (const [currency, amount] of Object.entries(cost.currencies)) {
        const available = inventory.currencies[currency as keyof typeof inventory.currencies] || 0;
        if (available < amount) return false;
      }
    }

    // Check resources
    if (cost.resources) {
      for (const [resource, amount] of Object.entries(cost.resources)) {
        const available = inventory.resources[resource] || 0;
        if (available < amount) return false;
      }
    }

    return true;
  });
}
