/**
 * Game Feature Module - Barrel Export
 *
 * Central exports for the game feature module.
 * This file provides convenient imports for all game-related functionality.
 */

// Machine
export { gameMachine } from './gameMachine';
export type { GameMachineEvent, GameMachineContext, GameMachineState } from './gameMachine';

// Provider and Core Hooks
export {
  GameProvider,
  useGameState,
  useGameDispatch,
  useIsState,
  useGameContextExposed,
  useGameSelector,
  useGameMode,
  usePlayer,
  useInventory,
  useFarm,
  useCombat,
  useTime,
} from './GameProvider';
export type { GameActor, GameSnapshot } from './GameProvider';

// Custom Hooks
export {
  // Player
  usePlayerActions,
  // Game Controls
  useGameControls,
  useTutorialActions,
  // Combat
  useCombatActions,
  useIsInCombat,
  // Time
  useTimeActions,
  useIsDaytime,
  useCurrentDay,
  // Resources
  useCurrency,
  useResource,
  // Farm
  useZombieCount,
  useZombie,
  useActiveZombies,
  // UI
  useSelectedZombie,
  useCanAfford,
} from './hooks';
