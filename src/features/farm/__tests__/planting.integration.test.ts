/**
 * Planting System Integration Tests
 *
 * Tests the full planting workflow including:
 * - State machine integration
 * - Event handling
 * - Inventory updates
 * - Plot state transitions
 * - Cross-module interactions
 *
 * Following TDD: These tests are written BEFORE implementation.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { GameState } from '../../../types/global';
import type { FarmState } from '../../../types/farm';
import { PlotState } from '../../../types/farm';
import type { Inventory, SeedType } from '../../../types/resources';
import { GameMode, Weather } from '../../../types/global';
import { Resource, Currency } from '../../../types/resources';

// Import the event system (to be implemented)
import {
  handlePlantSeedEvent,
  type PlantSeedEvent,
  type PlantSeedEventResult,
} from '../events/plantingEvents';

// Test utilities
const createMinimalGameState = (overrides: Partial<GameState> = {}): GameState => ({
  mode: GameMode.FARM,
  player: {
    id: 'player-1',
    name: 'Test Necromancer',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    achievements: [],
    completedQuests: [],
    activeQuests: [],
    unlockedTech: [],
    tutorialFlags: {},
    stats: {
      zombiesHarvested: 0,
      zombiesLost: 0,
      battlesWon: 0,
      battlesLost: 0,
      locationsConquered: 0,
      darkCoinsEarned: 0,
      resourcesGathered: {},
      highestZombieLevel: 0,
      totalPlayTime: 0,
    },
  },
  farm: {
    plots: [
      {
        id: 'plot-1',
        position: { x: 0, y: 0 },
        state: 'empty' as PlotState,
        plantedSeed: null,
        plantedAt: null,
        baseGrowthTime: null,
        growthTimeRemaining: null,
        isWatered: false,
        isFertilized: false,
        zombieId: null,
      },
    ],
    activeZombies: [],
    cryptZombies: [],
    buildings: [],
    resourceNodes: [],
    activeZombieCapacity: 10,
    expansionLevel: 0,
    gridSize: { width: 20, height: 15 },
  },
  combat: null,
  inventory: {
    resources: {
      [Resource.ROTTEN_WOOD]: 100,
      [Resource.BONES]: 50,
      [Resource.BLOOD_WATER]: 20,
      [Resource.CORPSE_DUST]: 10,
      [Resource.SOUL_FRAGMENTS]: 5,
      [Resource.IRON_SCRAPS]: 30,
      [Resource.CLOTH]: 15,
      [Resource.BRAINS]: 5,
      [Resource.ROTTEN_MEAT]: 25,
      [Resource.HOLY_WATER]: 2,
      [Resource.COAL]: 10,
      [Resource.TAR]: 8,
      [Resource.GRAVE_DIRT]: 5,
      [Resource.BONE_MEAL]: 3,
      [Resource.EMBALMING_FLUID]: 1,
      [Resource.DARK_ESSENCE]: 2,
    },
    currencies: {
      [Currency.DARK_COINS]: 500,
      [Currency.SOUL_ESSENCE]: 50,
    },
    seeds: {
      shamblerSeed: 10,
      runnerSeed: 5,
      bruteSeed: 3,
      spitterSeed: 2,
      ghoulSeed: 4,
      abominationSeed: 1,
      lichSeed: 1,
      boneKnightSeed: 1,
      priestZombieSeed: 0,
      explosiveZombieSeed: 2,
      necromancerZombieSeed: 0,
    } as Record<SeedType, number>,
    items: [],
    capacity: 1000,
    currentCount: 0,
  },
  world: {
    locations: [],
    unlockedLocations: [],
    conqueredLocations: [],
    currentRegion: 'grassland',
    unlockedRegions: ['grassland'],
  },
  ui: {
    activeModal: null,
    notifications: [],
    activePanels: [],
    hudVisible: true,
    tooltip: null,
    loading: {
      isLoading: false,
      cancellable: false,
    },
    confirmDialog: null,
  },
  time: {
    day: 1,
    hour: 12,
    minute: 0,
    season: 'spring' as any,
    isDaytime: true,
    weather: Weather.CLEAR,
    lastUpdate: Date.now(),
  },
  meta: {
    version: '1.0.0',
    createdAt: Date.now(),
    lastSavedAt: Date.now(),
    totalPlayTime: 0,
  },
  ...overrides,
});

describe('planting integration', () => {
  let gameState: GameState;
  const timestamp = Date.now();

  beforeEach(() => {
    gameState = createMinimalGameState();
  });

  describe('handlePlantSeedEvent', () => {
    it('should handle full planting workflow', () => {
      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();
      expect(result.growthTimer).toBeDefined();
    });

    it('should update game state with planted plot', () => {
      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(gameState, event);

      const plot = result.updatedState?.farm.plots.find((p) => p.id === 'plot-1');
      expect(plot?.state).toBe('planted');
      expect(plot?.plantedSeed).toBe('shamblerSeed');
      expect(plot?.plantedAt).toBe(timestamp);
    });

    it('should update inventory with decremented seed count', () => {
      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(gameState, event);

      expect(result.updatedState?.inventory.seeds.shamblerSeed).toBe(9);
    });

    it('should create growth timer with correct configuration', () => {
      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(gameState, event);

      expect(result.growthTimer?.plotId).toBe('plot-1');
      expect(result.growthTimer?.seedType).toBe('shamblerSeed');
      expect(result.growthTimer?.baseGrowthTime).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should fail when plot is already occupied', () => {
      const occupiedState = createMinimalGameState({
        farm: {
          ...gameState.farm,
          plots: [
            {
              ...gameState.farm.plots[0],
              state: 'planted' as PlotState,
              plantedSeed: 'runnerSeed' as SeedType,
            },
          ],
        },
      });

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(occupiedState, event);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail when seed is not available', () => {
      const noSeedsState = createMinimalGameState({
        inventory: {
          ...gameState.inventory,
          seeds: {
            ...gameState.inventory.seeds,
            shamblerSeed: 0,
          },
        },
      });

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(noSeedsState, event);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should preserve other state when planting', () => {
      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(gameState, event);

      // Check that other state is preserved
      expect(result.updatedState?.player).toEqual(gameState.player);
      expect(result.updatedState?.time).toEqual(gameState.time);
      expect(result.updatedState?.mode).toBe(gameState.mode);
    });

    it('should handle watered plot with speed bonus', () => {
      const wateredState = createMinimalGameState({
        farm: {
          ...gameState.farm,
          plots: [
            {
              ...gameState.farm.plots[0],
              isWatered: true,
            },
          ],
        },
      });

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(wateredState, event);

      const baseTime = 5 * 60 * 1000;
      const expectedTime = baseTime / 1.5; // 50% faster

      expect(result.growthTimer?.remainingTime).toBeCloseTo(expectedTime);
    });

    it('should handle fertilized plot with speed bonus', () => {
      const fertilizedState = createMinimalGameState({
        farm: {
          ...gameState.farm,
          plots: [
            {
              ...gameState.farm.plots[0],
              isFertilized: true,
            },
          ],
        },
      });

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(fertilizedState, event);

      const baseTime = 5 * 60 * 1000;
      const expectedTime = baseTime / 1.3; // 30% faster

      expect(result.growthTimer?.remainingTime).toBeCloseTo(expectedTime);
    });

    it('should handle blood rain weather bonus', () => {
      const bloodRainState = createMinimalGameState({
        time: {
          ...gameState.time,
          weather: Weather.BLOOD_RAIN,
        },
      });

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(bloodRainState, event);

      const baseTime = 5 * 60 * 1000;
      const expectedTime = baseTime / 1.2; // 20% faster

      expect(result.growthTimer?.remainingTime).toBeLessThan(baseTime);
    });

    it('should handle bright sun weather penalty', () => {
      const brightSunState = createMinimalGameState({
        time: {
          ...gameState.time,
          weather: Weather.BRIGHT_SUN,
        },
      });

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result = handlePlantSeedEvent(brightSunState, event);

      const baseTime = 5 * 60 * 1000;

      expect(result.growthTimer?.remainingTime).toBeGreaterThan(baseTime);
    });

    it('should support planting multiple seeds sequentially', () => {
      const multiPlotState = createMinimalGameState({
        farm: {
          ...gameState.farm,
          plots: [
            { ...gameState.farm.plots[0], id: 'plot-1' },
            { ...gameState.farm.plots[0], id: 'plot-2' },
            { ...gameState.farm.plots[0], id: 'plot-3' },
          ],
        },
      });

      const event1: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      const result1 = handlePlantSeedEvent(multiPlotState, event1);
      expect(result1.success).toBe(true);

      const event2: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-2',
        seedType: 'runnerSeed' as SeedType,
        timestamp: timestamp + 1000,
      };

      const result2 = handlePlantSeedEvent(result1.updatedState!, event2);
      expect(result2.success).toBe(true);

      const plot1 = result2.updatedState?.farm.plots.find((p) => p.id === 'plot-1');
      const plot2 = result2.updatedState?.farm.plots.find((p) => p.id === 'plot-2');

      expect(plot1?.plantedSeed).toBe('shamblerSeed');
      expect(plot2?.plantedSeed).toBe('runnerSeed');
      expect(result2.updatedState?.inventory.seeds.shamblerSeed).toBe(9);
      expect(result2.updatedState?.inventory.seeds.runnerSeed).toBe(4);
    });

    it('should not mutate original game state', () => {
      const originalFarm = { ...gameState.farm };
      const originalInventory = { ...gameState.inventory };

      const event: PlantSeedEvent = {
        type: 'PLANT_SEED',
        plotId: 'plot-1',
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      };

      handlePlantSeedEvent(gameState, event);

      expect(gameState.farm.plots).toEqual(originalFarm.plots);
      expect(gameState.inventory.seeds).toEqual(originalInventory.seeds);
    });

    it('should validate event structure', () => {
      const invalidEvent = {
        type: 'PLANT_SEED',
        // Missing plotId
        seedType: 'shamblerSeed' as SeedType,
        timestamp,
      } as PlantSeedEvent;

      const result = handlePlantSeedEvent(gameState, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
