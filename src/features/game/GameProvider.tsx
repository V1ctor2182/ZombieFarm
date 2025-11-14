/**
 * Game Provider
 *
 * React context provider for the game state machine.
 * Wraps the XState game machine and provides hooks for components to access
 * game state and dispatch events.
 *
 * Provides:
 * - useGameState(): Access current game state snapshot
 * - useGameDispatch(): Send events to the machine
 * - useIsState(stateName): Check if machine is in specific state
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useActor, useSelector } from '@xstate/react';
import { createActor, type ActorRefFrom, type SnapshotFrom } from 'xstate';
import { gameMachine, type GameMachineEvent } from './gameMachine';
import type { GameState } from '../../types/global';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Actor type for the game machine
 */
export type GameActor = ActorRefFrom<typeof gameMachine>;

/**
 * Snapshot type for the game machine
 */
export type GameSnapshot = SnapshotFrom<typeof gameMachine>;

/**
 * Context value type
 */
interface GameContextValue {
  actor: GameActor;
}

// ============================================================================
// CONTEXT
// ============================================================================

const GameContext = createContext<GameContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface GameProviderProps {
  children: ReactNode;
}

/**
 * Game Provider Component
 *
 * Wraps the application with the game state machine context.
 */
export function GameProvider({ children }: GameProviderProps): JSX.Element {
  // Create actor ref (memoized to avoid recreating on every render)
  const [actor] = React.useState(() => {
    const newActor = createActor(gameMachine);
    newActor.start();
    return newActor;
  });

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      actor.stop();
    };
  }, [actor]);

  const value = React.useMemo(() => ({ actor }), [actor]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get game context (internal helper)
 */
function useGameContext(): GameContextValue {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }

  return context;
}

/**
 * useGameState Hook
 *
 * Returns the current state snapshot of the game machine.
 * Components will re-render when the state changes.
 *
 * @returns Current game state snapshot
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const state = useGameState();
 *   return <div>Player Level: {state.context.player.level}</div>;
 * }
 * ```
 */
export function useGameState(): GameSnapshot {
  const { actor } = useGameContext();
  const [state] = useActor(actor);
  return state;
}

/**
 * useGameDispatch Hook
 *
 * Returns a dispatch function to send events to the game machine.
 *
 * @returns Dispatch function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const dispatch = useGameDispatch();
 *
 *   const handleClick = () => {
 *     dispatch({
 *       type: 'player.xpGained',
 *       payload: { amount: 100, source: 'quest', timestamp: Date.now() }
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Gain XP</button>;
 * }
 * ```
 */
export function useGameDispatch() {
  const { actor } = useGameContext();

  return React.useCallback(
    (event: GameMachineEvent) => {
      actor.send(event);
    },
    [actor]
  );
}

/**
 * useIsState Hook
 *
 * Returns true if the machine is currently in the specified state.
 * Useful for conditional rendering based on game state.
 *
 * @param stateName - The state name to check
 * @returns True if currently in that state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isLoading = useIsState('loading');
 *   const isFarm = useIsState('farm');
 *
 *   if (isLoading) return <LoadingScreen />;
 *   if (isFarm) return <FarmScreen />;
 *   return null;
 * }
 * ```
 */
export function useIsState(stateName: string): boolean {
  const { actor } = useGameContext();

  return useSelector(actor, (state) => state.matches(stateName));
}

/**
 * useGameContext Hook (exported for advanced use cases)
 *
 * Returns the game context value including the actor.
 * Most components should use useGameState/useGameDispatch instead.
 *
 * @returns Game context value
 *
 * @example
 * ```tsx
 * function AdvancedComponent() {
 *   const { actor } = useGameContextExposed();
 *   // Direct access to actor for advanced use cases
 * }
 * ```
 */
export function useGameContextExposed(): GameContextValue {
  return useGameContext();
}

/**
 * useGameSelector Hook
 *
 * Select a specific slice of game state with a selector function.
 * Only re-renders when the selected value changes (performance optimization).
 *
 * @param selector - Function that selects a slice of state
 * @returns Selected value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const playerLevel = useGameSelector(state => state.context.player.level);
 *   const darkCoins = useGameSelector(state => state.context.inventory.currencies.darkCoins);
 *
 *   return (
 *     <div>
 *       <p>Level: {playerLevel}</p>
 *       <p>Coins: {darkCoins}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGameSelector<T>(selector: (state: GameSnapshot) => T): T {
  const { actor } = useGameContext();
  return useSelector(actor, selector);
}

/**
 * useGameMode Hook
 *
 * Returns the current game mode.
 * Convenience hook for accessing the mode without selecting full state.
 *
 * @returns Current game mode
 *
 * @example
 * ```tsx
 * function GameUI() {
 *   const mode = useGameMode();
 *
 *   switch (mode) {
 *     case GameMode.FARM:
 *       return <FarmUI />;
 *     case GameMode.COMBAT:
 *       return <CombatUI />;
 *     default:
 *       return <LoadingUI />;
 *   }
 * }
 * ```
 */
export function useGameMode() {
  return useGameSelector((state) => state.context.mode);
}

/**
 * usePlayer Hook
 *
 * Returns the player data.
 * Convenience hook for accessing player without selecting full state.
 *
 * @returns Player data
 *
 * @example
 * ```tsx
 * function PlayerHUD() {
 *   const player = usePlayer();
 *   return (
 *     <div>
 *       <h1>{player.name}</h1>
 *       <p>Level {player.level}</p>
 *       <p>XP: {player.xp} / {player.xpToNextLevel}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePlayer() {
  return useGameSelector((state) => state.context.player);
}

/**
 * useInventory Hook
 *
 * Returns the inventory data.
 * Convenience hook for accessing inventory without selecting full state.
 *
 * @returns Inventory data
 *
 * @example
 * ```tsx
 * function InventoryPanel() {
 *   const inventory = useInventory();
 *   return (
 *     <div>
 *       <p>Dark Coins: {inventory.currencies.darkCoins}</p>
 *       <p>Soul Essence: {inventory.currencies.soulEssence}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useInventory() {
  return useGameSelector((state) => state.context.inventory);
}

/**
 * useFarm Hook
 *
 * Returns the farm state data.
 * Convenience hook for accessing farm without selecting full state.
 *
 * @returns Farm state
 *
 * @example
 * ```tsx
 * function FarmPanel() {
 *   const farm = useFarm();
 *   return (
 *     <div>
 *       <p>Active Zombies: {farm.activeZombieIds.length} / {farm.capacity.max}</p>
 *       <p>Crypt Storage: {farm.cryptZombieIds.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFarm() {
  return useGameSelector((state) => state.context.farm);
}

/**
 * useCombat Hook
 *
 * Returns the combat state (null if not in combat).
 * Convenience hook for accessing combat state.
 *
 * @returns Combat state or null
 *
 * @example
 * ```tsx
 * function BattleUI() {
 *   const combat = useCombat();
 *
 *   if (!combat) {
 *     return <div>No active battle</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Battle ID: {combat.battleId}</p>
 *       <p>Wave: {combat.currentWave} / {combat.totalWaves}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCombat() {
  return useGameSelector((state) => state.context.combat);
}

/**
 * useTime Hook
 *
 * Returns the time state.
 * Convenience hook for accessing time/weather data.
 *
 * @returns Time state
 *
 * @example
 * ```tsx
 * function TimeDisplay() {
 *   const time = useTime();
 *   return (
 *     <div>
 *       <p>Day {time.day}</p>
 *       <p>{time.hour}:{time.minute.toString().padStart(2, '0')}</p>
 *       <p>{time.isDaytime ? '☀️' : '🌙'}</p>
 *       <p>Weather: {time.weather}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTime() {
  return useGameSelector((state) => state.context.time);
}
