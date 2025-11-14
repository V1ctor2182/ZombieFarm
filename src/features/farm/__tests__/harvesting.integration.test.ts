/**
 * Harvesting Integration Tests
 *
 * Tests complete harvesting workflows:
 * - Harvest event handling
 * - State machine integration
 * - Multiple harvests
 * - Capacity management scenarios
 * - Error handling
 */

import { describe, it, expect } from '@jest/globals';
import { handleHarvestEvent, handleBatchHarvestEvent } from '../events/harvestingEvents';
import type { GameState } from '../../../types/global';
import type { Plot } from '../../../types/farm';
import { PlotState, ZombieType, ZombieQuality } from '../../../types/farm';
import { SeedType, Resource } from '../../../types/resources';

// Test fixtures
const createTestPlot = (overrides: Partial<Plot> = {}): Plot => ({
  id: 'plot-1',
  position: { x: 0, y: 0 },
  state: PlotState.EMPTY,
  plantedSeed: null,
  plantedAt: null,
  baseGrowthTime: null,
  growthTimeRemaining: null,
  isWatered: false,
  isFertilized: false,
  zombieId: null,
  ...overrides,
});

const createTestGameState = (overrides: Partial<GameState> = {}): GameState => ({
  player: {
    id: 'player-1',
    name: 'Test Player',
    necromancerLevel: 1,
    xp: 0,
    xpToNextLevel: 100,
    unlockedZombieTypes: [ZombieType.SHAMBLER, ZombieType.RUNNER],
    unlockedBuildings: [],
    questsCompleted: [],
    achievements: [],
    stats: {
      zombiesHarvested: 0,
      battlesWon: 0,
      battlesLost: 0,
      locationsConquered: 0,
      totalDarkCoinsEarned: 0,
      totalSoulEssenceEarned: 0,
      playTime: 0,
    },
  },
  farm: {
    plots: [],
    activeZombies: [],
    cryptZombies: [],
    buildings: [],
    resourceNodes: [],
    activeZombieCapacity: 10,
    expansionLevel: 0,
    gridSize: { width: 20, height: 15 },
  },
  inventory: {
    seeds: {},
    resources: {
      [Resource.ROTTEN_WOOD]: 0,
      [Resource.BONES]: 0,
      [Resource.BLOOD_WATER]: 0,
      [Resource.CORPSE_DUST]: 0,
      [Resource.SOUL_FRAGMENTS]: 0,
      [Resource.IRON_SCRAPS]: 0,
      [Resource.CLOTH]: 0,
      [Resource.BRAINS]: 0,
      [Resource.ROTTEN_MEAT]: 0,
      [Resource.HOLY_WATER]: 0,
      [Resource.COAL]: 0,
      [Resource.TAR]: 0,
      [Resource.DARK_ESSENCE]: 0,
    },
    currencies: {
      darkCoins: 100,
      soulEssence: 0,
    },
  },
  world: {
    currentLocation: null,
    unlockedLocations: [],
    activeRaid: null,
  },
  time: {
    currentTime: Date.now(),
    lastUpdateTime: Date.now(),
    dayNightCycle: 0,
    weather: 'clear' as any,
  },
  ...overrides,
});

describe('harvesting integration', () => {
  // ============================================================================
  // HANDLE HARVEST EVENT
  // ============================================================================

  describe('handleHarvestEvent', () => {
    it('should successfully harvest zombie from ready plot', () => {
      const plot = createTestPlot({
        id: 'plot-1',
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        plantedAt: Date.now() - 300000,
        baseGrowthTime: 300000,
        growthTimeRemaining: 0,
      });

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots: [plot],
        },
      });

      const event = {
        type: 'HARVEST' as const,
        plotId: 'plot-1',
        quality: ZombieQuality.BRONZE,
      };

      const result = handleHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farm.activeZombies.length).toBe(1);
        expect(result.data.farm.plots[0].state).toBe(PlotState.EMPTY);
        expect(result.data.player.stats.zombiesHarvested).toBe(1);
      }
    });

    it('should update player stats after harvest', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.RUNNER_SEED,
        growthTimeRemaining: 0,
      });

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots: [plot],
        },
        player: {
          ...createTestGameState().player,
          stats: {
            ...createTestGameState().player.stats,
            zombiesHarvested: 5,
          },
        },
      });

      const event = {
        type: 'HARVEST' as const,
        plotId: 'plot-1',
        quality: ZombieQuality.SILVER,
      };

      const result = handleHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.player.stats.zombiesHarvested).toBe(6);
      }
    });

    it('should fail with invalid event structure', () => {
      const gameState = createTestGameState();

      const event = {
        type: 'HARVEST' as const,
        // Missing required fields
      } as any;

      const result = handleHarvestEvent(gameState, event);

      expect(result.success).toBe(false);
    });

    it('should fail when plot not found', () => {
      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots: [],
        },
      });

      const event = {
        type: 'HARVEST' as const,
        plotId: 'nonexistent',
        quality: ZombieQuality.BRONZE,
      };

      const result = handleHarvestEvent(gameState, event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should add zombie to Crypt when at capacity', () => {
      const existingZombies = Array.from({ length: 10 }, (_, i) => ({
        id: `zombie-${i}`,
        type: ZombieType.SHAMBLER,
        name: `Zombie ${i}`,
        quality: ZombieQuality.BRONZE,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 15,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          decayRate: 1.0,
        },
        happiness: 50,
        daysSinceLastFed: 0,
        lastFedAt: null,
        lastPetAt: null,
        mutations: [],
        equipment: {
          weapon: null,
          armor: null,
          accessory: null,
        },
        position: null,
        aiState: 'idle' as any,
        createdAt: Date.now(),
      }));

      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.BRUTE_SEED,
        growthTimeRemaining: 0,
      });

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots: [plot],
          activeZombies: existingZombies,
          activeZombieCapacity: 10,
        },
      });

      const event = {
        type: 'HARVEST' as const,
        plotId: 'plot-1',
        quality: ZombieQuality.GOLD,
      };

      const result = handleHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farm.activeZombies.length).toBe(10);
        expect(result.data.farm.cryptZombies.length).toBe(1);
        expect(result.data.farm.cryptZombies[0].type).toBe(ZombieType.BRUTE);
      }
    });

    it('should add byproduct resources to inventory', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots: [plot],
        },
      });

      const event = {
        type: 'HARVEST' as const,
        plotId: 'plot-1',
        quality: ZombieQuality.BRONZE,
      };

      const result = handleHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        const totalResources = Object.values(result.data.inventory.resources).reduce(
          (sum, val) => sum + val,
          0
        );
        expect(totalResources).toBeGreaterThan(0);
      }
    });

    it('should not mutate original game state', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots: [plot],
        },
      });

      const originalState = JSON.parse(JSON.stringify(gameState));

      const event = {
        type: 'HARVEST' as const,
        plotId: 'plot-1',
        quality: ZombieQuality.BRONZE,
      };

      handleHarvestEvent(gameState, event);

      expect(gameState).toEqual(originalState);
    });
  });

  // ============================================================================
  // HANDLE BATCH HARVEST EVENT
  // ============================================================================

  describe('handleBatchHarvestEvent', () => {
    it('should harvest multiple plots at once', () => {
      const plots = [
        createTestPlot({
          id: 'plot-1',
          state: PlotState.READY,
          plantedSeed: SeedType.SHAMBLER_SEED,
          growthTimeRemaining: 0,
        }),
        createTestPlot({
          id: 'plot-2',
          state: PlotState.READY,
          plantedSeed: SeedType.RUNNER_SEED,
          growthTimeRemaining: 0,
        }),
        createTestPlot({
          id: 'plot-3',
          state: PlotState.READY,
          plantedSeed: SeedType.BRUTE_SEED,
          growthTimeRemaining: 0,
        }),
      ];

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots,
        },
      });

      const event = {
        type: 'BATCH_HARVEST' as const,
        harvests: [
          { plotId: 'plot-1', quality: ZombieQuality.BRONZE },
          { plotId: 'plot-2', quality: ZombieQuality.SILVER },
          { plotId: 'plot-3', quality: ZombieQuality.GOLD },
        ],
      };

      const result = handleBatchHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farm.activeZombies.length).toBe(3);
        expect(result.data.farm.plots.every((p) => p.state === PlotState.EMPTY)).toBe(true);
        expect(result.data.player.stats.zombiesHarvested).toBe(3);
      }
    });

    it('should handle partial failures in batch harvest', () => {
      const plots = [
        createTestPlot({
          id: 'plot-1',
          state: PlotState.READY,
          plantedSeed: SeedType.SHAMBLER_SEED,
          growthTimeRemaining: 0,
        }),
        createTestPlot({
          id: 'plot-2',
          state: PlotState.PLANTED, // Not ready!
          plantedSeed: SeedType.RUNNER_SEED,
          growthTimeRemaining: 60000,
        }),
      ];

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots,
        },
      });

      const event = {
        type: 'BATCH_HARVEST' as const,
        harvests: [
          { plotId: 'plot-1', quality: ZombieQuality.BRONZE },
          { plotId: 'plot-2', quality: ZombieQuality.BRONZE },
        ],
      };

      const result = handleBatchHarvestEvent(gameState, event);

      // Should succeed for plot-1, fail for plot-2
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farm.activeZombies.length).toBe(1); // Only one harvested
        expect(result.data.farm.plots[0].state).toBe(PlotState.EMPTY); // plot-1 cleared
        expect(result.data.farm.plots[1].state).toBe(PlotState.PLANTED); // plot-2 unchanged
      }
    });

    it('should respect capacity when batch harvesting', () => {
      const existingZombies = Array.from({ length: 8 }, (_, i) => ({
        id: `zombie-${i}`,
        type: ZombieType.SHAMBLER,
        name: `Zombie ${i}`,
        quality: ZombieQuality.BRONZE,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 15,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          decayRate: 1.0,
        },
        happiness: 50,
        daysSinceLastFed: 0,
        lastFedAt: null,
        lastPetAt: null,
        mutations: [],
        equipment: {
          weapon: null,
          armor: null,
          accessory: null,
        },
        position: null,
        aiState: 'idle' as any,
        createdAt: Date.now(),
      }));

      const plots = [
        createTestPlot({
          id: 'plot-1',
          state: PlotState.READY,
          plantedSeed: SeedType.SHAMBLER_SEED,
          growthTimeRemaining: 0,
        }),
        createTestPlot({
          id: 'plot-2',
          state: PlotState.READY,
          plantedSeed: SeedType.RUNNER_SEED,
          growthTimeRemaining: 0,
        }),
        createTestPlot({
          id: 'plot-3',
          state: PlotState.READY,
          plantedSeed: SeedType.BRUTE_SEED,
          growthTimeRemaining: 0,
        }),
      ];

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots,
          activeZombies: existingZombies,
          activeZombieCapacity: 10,
        },
      });

      const event = {
        type: 'BATCH_HARVEST' as const,
        harvests: [
          { plotId: 'plot-1', quality: ZombieQuality.BRONZE },
          { plotId: 'plot-2', quality: ZombieQuality.BRONZE },
          { plotId: 'plot-3', quality: ZombieQuality.BRONZE },
        ],
      };

      const result = handleBatchHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        // 8 existing + 3 new = 11 total, but cap is 10
        expect(result.data.farm.activeZombies.length).toBe(10);
        expect(result.data.farm.cryptZombies.length).toBe(1); // One goes to Crypt
      }
    });

    it('should accumulate byproducts from multiple harvests', () => {
      const plots = [
        createTestPlot({
          id: 'plot-1',
          state: PlotState.READY,
          plantedSeed: SeedType.SHAMBLER_SEED,
          growthTimeRemaining: 0,
        }),
        createTestPlot({
          id: 'plot-2',
          state: PlotState.READY,
          plantedSeed: SeedType.SHAMBLER_SEED,
          growthTimeRemaining: 0,
        }),
      ];

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots,
        },
      });

      const event = {
        type: 'BATCH_HARVEST' as const,
        harvests: [
          { plotId: 'plot-1', quality: ZombieQuality.BRONZE },
          { plotId: 'plot-2', quality: ZombieQuality.BRONZE },
        ],
      };

      const result = handleBatchHarvestEvent(gameState, event);

      expect(result.success).toBe(true);
      if (result.success) {
        const totalResources = Object.values(result.data.inventory.resources).reduce(
          (sum, val) => sum + val,
          0
        );
        // Should have resources from both harvests
        expect(totalResources).toBeGreaterThan(0);
      }
    });

    it('should fail with empty harvest list', () => {
      const gameState = createTestGameState();

      const event = {
        type: 'BATCH_HARVEST' as const,
        harvests: [],
      };

      const result = handleBatchHarvestEvent(gameState, event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should not mutate original game state', () => {
      const plots = [
        createTestPlot({
          id: 'plot-1',
          state: PlotState.READY,
          plantedSeed: SeedType.SHAMBLER_SEED,
          growthTimeRemaining: 0,
        }),
      ];

      const gameState = createTestGameState({
        farm: {
          ...createTestGameState().farm,
          plots,
        },
      });

      const originalState = JSON.parse(JSON.stringify(gameState));

      const event = {
        type: 'BATCH_HARVEST' as const,
        harvests: [{ plotId: 'plot-1', quality: ZombieQuality.BRONZE }],
      };

      handleBatchHarvestEvent(gameState, event);

      expect(gameState).toEqual(originalState);
    });
  });
});
