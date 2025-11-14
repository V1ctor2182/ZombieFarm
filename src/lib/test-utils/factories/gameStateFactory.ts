/**
 * Game State Factory
 *
 * Factory functions for creating test GameState objects.
 * Provides sensible defaults with override capability for comprehensive testing.
 *
 * Per TESTING.md: Use factories to reduce test boilerplate and ensure consistent test data.
 */

import type {
  GameState,
  Player,
  TimeState,
  SaveMetadata,
  FarmState,
  CombatState,
  WorldState,
  UIState,
} from '../../../types';
import { GameMode, Season, Weather } from '../../../types';

/**
 * Default time state for tests
 */
const createDefaultTimeState = (): TimeState => ({
  currentTime: Date.now(),
  gameStartTime: Date.now() - 1000 * 60 * 60, // Started 1 hour ago
  dayNightCycle: {
    currentPhase: 'day',
    phaseStartTime: Date.now() - 1000 * 60 * 10, // Day started 10 minutes ago
    cycleDuration: 30 * 60 * 1000, // 30 minutes
    dayDuration: 20 * 60 * 1000, // 20 minutes
    nightDuration: 10 * 60 * 1000, // 10 minutes
  },
  lastSaveTime: Date.now(),
  totalPlayTime: 1000 * 60 * 60, // 1 hour total play time
});

/**
 * Default save metadata for tests
 */
const createDefaultSaveMetadata = (): SaveMetadata => ({
  version: '1.0.0',
  lastSaved: Date.now(),
  saveCount: 5,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // Created 7 days ago
});

/**
 * Default player data for tests
 */
const createDefaultPlayer = (): Player => ({
  id: 'test-player-1',
  name: 'Test Necromancer',
  level: 1,
  xp: 0,
  stats: {
    totalZombiesHarvested: 0,
    totalBattlesWon: 0,
    totalBattlesLost: 0,
    totalDarkCoinsEarned: 0,
    totalPlayTime: 0,
  },
  unlockedContent: ['shambler_seed', 'runner_seed'],
  achievements: [],
  quests: {
    active: [],
    completed: [],
  },
});

/**
 * Creates a minimal GameState for testing
 *
 * @param overrides - Partial GameState to override defaults
 * @returns Complete GameState object
 */
export function createTestGameState(overrides?: Partial<GameState>): GameState {
  const defaultState: GameState = {
    // Mode and version
    mode: GameMode.FARM,
    version: '1.0.0',

    // Player data
    player: createDefaultPlayer(),

    // Time system
    time: createDefaultTimeState(),

    // Farm state (minimal - use farmStateFactory for detailed farm tests)
    farm: {
      plots: [],
      activeZombies: [],
      cryptZombies: [],
      buildings: [],
      resourceNodes: [],
      farmLevel: 1,
      farmExpansions: 0,
      lastDecayUpdate: Date.now(),
    } as FarmState,

    // Combat state (minimal - use combatStateFactory for combat tests)
    combat: {
      isInBattle: false,
      currentBattle: null,
      battleHistory: [],
      availableLocations: [],
    } as CombatState,

    // World state (minimal)
    world: {
      unlockedRegions: ['starting_region'],
      unlockedLocations: ['village_1'],
      discoveredLocations: ['village_1'],
      currentRegion: 'starting_region',
    } as WorldState,

    // UI state (minimal)
    ui: {
      activeModal: null,
      notifications: [],
      tooltip: null,
      loading: { isLoading: false, message: null, progress: null },
      confirmDialog: null,
      hudVisible: true,
      contextMenu: null,
      dragState: null,
    } as UIState,

    // Inventory (use inventoryFactory for detailed inventory tests)
    inventory: {
      resources: {},
      currencies: {
        DARK_COINS: 100,
        SOUL_ESSENCE: 0,
      },
      seeds: {},
      items: {},
      equipment: {},
    },

    // Meta
    save: createDefaultSaveMetadata(),
    season: Season.AUTUMN,
    weather: Weather.CLEAR,
  };

  // Deep merge overrides
  return {
    ...defaultState,
    ...overrides,
    player: overrides?.player
      ? { ...defaultState.player, ...overrides.player }
      : defaultState.player,
    time: overrides?.time
      ? { ...defaultState.time, ...overrides.time }
      : defaultState.time,
    farm: overrides?.farm
      ? { ...defaultState.farm, ...overrides.farm }
      : defaultState.farm,
    combat: overrides?.combat
      ? { ...defaultState.combat, ...overrides.combat }
      : defaultState.combat,
    world: overrides?.world
      ? { ...defaultState.world, ...overrides.world }
      : defaultState.world,
    ui: overrides?.ui ? { ...defaultState.ui, ...overrides.ui } : defaultState.ui,
    inventory: overrides?.inventory
      ? { ...defaultState.inventory, ...overrides.inventory }
      : defaultState.inventory,
    save: overrides?.save
      ? { ...defaultState.save, ...overrides.save }
      : defaultState.save,
  };
}

/**
 * Creates a GameState in FARM mode
 */
export function createFarmModeGameState(overrides?: Partial<GameState>): GameState {
  return createTestGameState({
    ...overrides,
    mode: GameMode.FARM,
  });
}

/**
 * Creates a GameState in COMBAT mode
 */
export function createCombatModeGameState(overrides?: Partial<GameState>): GameState {
  return createTestGameState({
    ...overrides,
    mode: GameMode.COMBAT,
    combat: {
      ...overrides?.combat,
      isInBattle: true,
    } as CombatState,
  });
}

/**
 * Creates a GameState in WORLD mode
 */
export function createWorldModeGameState(overrides?: Partial<GameState>): GameState {
  return createTestGameState({
    ...overrides,
    mode: GameMode.WORLD,
  });
}

/**
 * Creates a GameState for a new player (tutorial state)
 */
export function createNewPlayerGameState(): GameState {
  return createTestGameState({
    player: {
      ...createDefaultPlayer(),
      level: 1,
      xp: 0,
      stats: {
        totalZombiesHarvested: 0,
        totalBattlesWon: 0,
        totalBattlesLost: 0,
        totalDarkCoinsEarned: 0,
        totalPlayTime: 0,
      },
      unlockedContent: ['shambler_seed'],
    },
    inventory: {
      resources: {},
      currencies: {
        DARK_COINS: 50, // Starting coins
        SOUL_ESSENCE: 0,
      },
      seeds: {
        SHAMBLER_SEED: 3, // Tutorial seeds
      },
      items: {},
      equipment: {},
    },
    time: {
      ...createDefaultTimeState(),
      totalPlayTime: 0,
      gameStartTime: Date.now(),
    },
  });
}

/**
 * Creates a GameState for an advanced player
 */
export function createAdvancedPlayerGameState(): GameState {
  return createTestGameState({
    player: {
      ...createDefaultPlayer(),
      level: 25,
      xp: 50000,
      stats: {
        totalZombiesHarvested: 500,
        totalBattlesWon: 100,
        totalBattlesLost: 10,
        totalDarkCoinsEarned: 50000,
        totalPlayTime: 1000 * 60 * 60 * 50, // 50 hours
      },
      unlockedContent: [
        'shambler_seed',
        'runner_seed',
        'brute_seed',
        'spitter_seed',
        'ghoul_seed',
        'lich_seed',
        'bone_knight_seed',
        'necromancer_level_7',
        'necromancer_level_8',
      ],
    },
    inventory: {
      resources: {},
      currencies: {
        DARK_COINS: 10000,
        SOUL_ESSENCE: 50,
      },
      seeds: {
        SHAMBLER_SEED: 10,
        RUNNER_SEED: 10,
        BRUTE_SEED: 5,
        SPITTER_SEED: 5,
        GHOUL_SEED: 5,
        LICH_SEED: 2,
      },
      items: {},
      equipment: {},
    },
  });
}

/**
 * Creates a GameState during nighttime
 */
export function createNighttimeGameState(overrides?: Partial<GameState>): GameState {
  return createTestGameState({
    ...overrides,
    time: {
      ...createDefaultTimeState(),
      ...overrides?.time,
      dayNightCycle: {
        currentPhase: 'night',
        phaseStartTime: Date.now() - 1000 * 60 * 5, // Night started 5 minutes ago
        cycleDuration: 30 * 60 * 1000,
        dayDuration: 20 * 60 * 1000,
        nightDuration: 10 * 60 * 1000,
      },
    },
  });
}

/**
 * Creates a GameState with specific weather
 */
export function createGameStateWithWeather(weather: Weather): GameState {
  return createTestGameState({
    weather,
  });
}

/**
 * Creates a GameState with specific season
 */
export function createGameStateWithSeason(season: Season): GameState {
  return createTestGameState({
    season,
  });
}
