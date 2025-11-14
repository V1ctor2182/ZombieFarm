/**
 * Growth Integration Tests
 *
 * Integration tests for growth system end-to-end workflows.
 * Tests full event flow through game state updates.
 */

import { describe, it, expect } from '@jest/globals';
import {
  handleGrowthUpdateEvent,
  handleOfflineGrowthEvent,
  handleGrowthCompleteEvent,
  type GrowthUpdateEvent,
  type OfflineGrowthEvent,
  type GrowthCompleteEvent,
} from '../events/growthEvents';
import type { GameState } from '../../../types/global';
import type { FarmState, Plot } from '../../../types/farm';
import { PlotState } from '../../../types/farm';
import { SeedType } from '../../../types/resources';
import { Weather } from '../../../types/global';

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

const createTestFarmState = (overrides: Partial<FarmState> = {}): FarmState => ({
  plots: [],
  activeZombies: [],
  cryptZombies: [],
  buildings: [],
  resourceNodes: [],
  activeZombieCapacity: 10,
  expansionLevel: 0,
  gridSize: { width: 20, height: 15 },
  ...overrides,
});

const createTestGameState = (overrides: Partial<GameState> = {}): GameState => ({
  farm: createTestFarmState(),
  inventory: {
    resources: {},
    currencies: {},
    seeds: {},
  },
  time: {
    currentDay: 1,
    timeOfDay: 'day',
    weather: Weather.CLEAR,
    dayNightCycleProgress: 0,
    totalDaysElapsed: 0,
  },
  player: {
    id: 'player-1',
    name: 'Test Player',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    unlockedFeatures: [],
    achievements: [],
    tutorialProgress: {
      completed: [],
      current: null,
    },
  },
  world: {
    locations: [],
    unlockedLocations: [],
    currentLocation: null,
  },
  ...overrides,
});

describe('growth integration', () => {
  describe('handleGrowthUpdateEvent', () => {
    it('should update growth timers for all planted plots', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 240000,
            }),
          ],
        }),
      });

      const event: GrowthUpdateEvent = {
        type: 'GROWTH_UPDATE',
        deltaTime: 60000, // 1 minute
        timestamp: now,
      };

      const result = handleGrowthUpdateEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();
      if (result.updatedState) {
        const plot = result.updatedState.farm.plots[0];
        expect(plot.growthTimeRemaining).toBe(180000); // 3 minutes left
      }
    });

    it('should identify newly completed plots', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 30000, // 30 seconds left
            }),
          ],
        }),
      });

      const event: GrowthUpdateEvent = {
        type: 'GROWTH_UPDATE',
        deltaTime: 60000, // 1 minute (more than remaining)
        timestamp: now,
      };

      const result = handleGrowthUpdateEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.completedPlots).toContain('plot-1');
      if (result.updatedState) {
        const plot = result.updatedState.farm.plots[0];
        expect(plot.growthTimeRemaining).toBe(0);
      }
    });

    it('should handle multiple plots at different growth stages', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 240000,
            }),
            createTestPlot({
              id: 'plot-2',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.RUNNER_SEED,
              plantedAt: now,
              baseGrowthTime: 240000,
              growthTimeRemaining: 30000, // Will complete
            }),
            createTestPlot({
              id: 'plot-3',
              state: PlotState.EMPTY,
            }),
          ],
        }),
      });

      const event: GrowthUpdateEvent = {
        type: 'GROWTH_UPDATE',
        deltaTime: 60000,
        timestamp: now,
      };

      const result = handleGrowthUpdateEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.completedPlots).toContain('plot-2');
      expect(result.completedPlots).not.toContain('plot-1');
      if (result.updatedState) {
        expect(result.updatedState.farm.plots[0].growthTimeRemaining).toBe(180000);
        expect(result.updatedState.farm.plots[1].growthTimeRemaining).toBe(0);
        expect(result.updatedState.farm.plots[2].growthTimeRemaining).toBeNull();
      }
    });

    it('should fail with invalid event structure', () => {
      const gameState = createTestGameState();

      const invalidEvent = {
        type: 'INVALID_EVENT',
        deltaTime: 60000,
        timestamp: Date.now(),
      } as any;

      const result = handleGrowthUpdateEvent(gameState, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should fail with negative delta time', () => {
      const gameState = createTestGameState();

      const event: GrowthUpdateEvent = {
        type: 'GROWTH_UPDATE',
        deltaTime: -60000,
        timestamp: Date.now(),
      };

      const result = handleGrowthUpdateEvent(gameState, event);

      expect(result.success).toBe(false);
    });

    it('should not mutate original game state', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 240000,
            }),
          ],
        }),
      });

      const originalRemaining = gameState.farm.plots[0].growthTimeRemaining;

      const event: GrowthUpdateEvent = {
        type: 'GROWTH_UPDATE',
        deltaTime: 60000,
        timestamp: now,
      };

      handleGrowthUpdateEvent(gameState, event);

      expect(gameState.farm.plots[0].growthTimeRemaining).toBe(originalRemaining);
    });
  });

  describe('handleOfflineGrowthEvent', () => {
    it('should calculate offline growth for all planted plots', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now - 120000,
              baseGrowthTime: 300000,
              growthTimeRemaining: 180000, // 3 minutes left
            }),
          ],
        }),
      });

      const event: OfflineGrowthEvent = {
        type: 'OFFLINE_GROWTH',
        offlineTime: 120000, // 2 minutes offline
        timestamp: now,
      };

      const result = handleOfflineGrowthEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.updatedState).toBeDefined();
      if (result.updatedState) {
        const plot = result.updatedState.farm.plots[0];
        expect(plot.growthTimeRemaining).toBe(60000); // 1 minute left
      }
    });

    it('should complete growth when offline time exceeds remaining time', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now - 120000,
              baseGrowthTime: 300000,
              growthTimeRemaining: 60000, // 1 minute left
            }),
          ],
        }),
      });

      const event: OfflineGrowthEvent = {
        type: 'OFFLINE_GROWTH',
        offlineTime: 120000, // 2 minutes offline (more than remaining)
        timestamp: now,
      };

      const result = handleOfflineGrowthEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.completedPlots).toContain('plot-1');
      if (result.updatedState) {
        const plot = result.updatedState.farm.plots[0];
        expect(plot.growthTimeRemaining).toBe(0);
      }
    });

    it('should identify all plots that completed during offline period', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 50000, // Will complete
            }),
            createTestPlot({
              id: 'plot-2',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.RUNNER_SEED,
              plantedAt: now,
              baseGrowthTime: 240000,
              growthTimeRemaining: 40000, // Will complete
            }),
            createTestPlot({
              id: 'plot-3',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.BRUTE_SEED,
              plantedAt: now,
              baseGrowthTime: 900000,
              growthTimeRemaining: 120000, // Will NOT complete
            }),
          ],
        }),
      });

      const event: OfflineGrowthEvent = {
        type: 'OFFLINE_GROWTH',
        offlineTime: 60000, // 1 minute offline
        timestamp: now,
      };

      const result = handleOfflineGrowthEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.completedPlots).toContain('plot-1');
      expect(result.completedPlots).toContain('plot-2');
      expect(result.completedPlots).not.toContain('plot-3');
    });

    it('should fail with invalid event structure', () => {
      const gameState = createTestGameState();

      const invalidEvent = {
        type: 'INVALID_EVENT',
        offlineTime: 60000,
        timestamp: Date.now(),
      } as any;

      const result = handleOfflineGrowthEvent(gameState, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should not mutate original game state', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 180000,
            }),
          ],
        }),
      });

      const originalRemaining = gameState.farm.plots[0].growthTimeRemaining;

      const event: OfflineGrowthEvent = {
        type: 'OFFLINE_GROWTH',
        offlineTime: 60000,
        timestamp: now,
      };

      handleOfflineGrowthEvent(gameState, event);

      expect(gameState.farm.plots[0].growthTimeRemaining).toBe(originalRemaining);
    });
  });

  describe('handleGrowthCompleteEvent', () => {
    it('should successfully process growth complete for ready plot', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now - 300000,
              baseGrowthTime: 300000,
              growthTimeRemaining: 0, // Complete
            }),
          ],
        }),
      });

      const event: GrowthCompleteEvent = {
        type: 'GROWTH_COMPLETE',
        plotId: 'plot-1',
        timestamp: now,
      };

      const result = handleGrowthCompleteEvent(gameState, event);

      expect(result.success).toBe(true);
      expect(result.completedPlots).toContain('plot-1');
    });

    it('should fail when plot is not found', () => {
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
            }),
          ],
        }),
      });

      const event: GrowthCompleteEvent = {
        type: 'GROWTH_COMPLETE',
        plotId: 'nonexistent-plot',
        timestamp: Date.now(),
      };

      const result = handleGrowthCompleteEvent(gameState, event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail when growth is not complete', () => {
      const now = Date.now();
      const gameState = createTestGameState({
        farm: createTestFarmState({
          plots: [
            createTestPlot({
              id: 'plot-1',
              state: PlotState.PLANTED,
              plantedSeed: SeedType.SHAMBLER_SEED,
              plantedAt: now,
              baseGrowthTime: 300000,
              growthTimeRemaining: 120000, // NOT complete
            }),
          ],
        }),
      });

      const event: GrowthCompleteEvent = {
        type: 'GROWTH_COMPLETE',
        plotId: 'plot-1',
        timestamp: now,
      };

      const result = handleGrowthCompleteEvent(gameState, event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not complete');
    });

    it('should fail with invalid event structure', () => {
      const gameState = createTestGameState();

      const invalidEvent = {
        type: 'INVALID_EVENT',
        plotId: 'plot-1',
        timestamp: Date.now(),
      } as any;

      const result = handleGrowthCompleteEvent(gameState, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });
});
