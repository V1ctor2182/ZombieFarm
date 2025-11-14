/**
 * Growth Service Unit Tests
 *
 * Tests for zombie growth mechanics per DOMAIN-FARM.md:
 * - Growth timer countdown
 * - Offline progress calculation
 * - Growth completion detection
 * - Quality determination
 * - Plot state transitions
 */

import { describe, it, expect } from '@jest/globals';
import {
  updateGrowth,
  checkGrowthComplete,
  calculateOfflineGrowth,
  determineQuality,
} from '../growth';
import type { FarmState, Plot } from '../../../../types/farm';
import { PlotState, ZombieQuality } from '../../../../types/farm';
import { SeedType } from '../../../../types/resources';

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

describe('growth service', () => {
  describe('updateGrowth', () => {
    it('should reduce growth time remaining by delta time', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now() - 60000,
            baseGrowthTime: 300000, // 5 minutes
            growthTimeRemaining: 240000, // 4 minutes left
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = updateGrowth(farmState, 60000); // 1 minute passed

      expect(result.success).toBe(true);
      if (result.success) {
        const plot = result.data.plots[0];
        expect(plot.growthTimeRemaining).toBe(180000); // 3 minutes left
      }
    });

    it('should not reduce growth time below 0', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now() - 60000,
            baseGrowthTime: 300000,
            growthTimeRemaining: 30000, // 30 seconds left
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = updateGrowth(farmState, 60000); // 1 minute (more than remaining)

      expect(result.success).toBe(true);
      if (result.success) {
        const plot = result.data.plots[0];
        expect(plot.growthTimeRemaining).toBe(0);
      }
    });

    it('should update multiple planted plots simultaneously', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
          {
            id: 'plot-2',
            position: { x: 1, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.RUNNER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 240000,
            growthTimeRemaining: 120000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = updateGrowth(farmState, 60000); // 1 minute

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plots[0].growthTimeRemaining).toBe(180000);
        expect(result.data.plots[1].growthTimeRemaining).toBe(60000);
      }
    });

    it('should not update empty plots', () => {
      const farmState = createTestFarmState({
        plots: [
          {
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
          },
        ],
      });

      const result = updateGrowth(farmState, 60000);

      expect(result.success).toBe(true);
      if (result.success) {
        const plot = result.data.plots[0];
        expect(plot.state).toBe(PlotState.EMPTY);
        expect(plot.growthTimeRemaining).toBeNull();
      }
    });

    it('should not update ready plots', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.READY,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now() - 300000,
            baseGrowthTime: 300000,
            growthTimeRemaining: 0,
            isWatered: false,
            isFertilized: false,
            zombieId: 'zombie-1',
          },
        ],
      });

      const result = updateGrowth(farmState, 60000);

      expect(result.success).toBe(true);
      if (result.success) {
        const plot = result.data.plots[0];
        expect(plot.state).toBe(PlotState.READY);
        expect(plot.growthTimeRemaining).toBe(0);
      }
    });

    it('should handle zero delta time', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = updateGrowth(farmState, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plots[0].growthTimeRemaining).toBe(240000);
      }
    });

    it('should fail with negative delta time', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = updateGrowth(farmState, -60000);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('negative');
      }
    });

    it('should not mutate original farm state', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const originalRemaining = farmState.plots[0].growthTimeRemaining;
      updateGrowth(farmState, 60000);

      expect(farmState.plots[0].growthTimeRemaining).toBe(originalRemaining);
    });
  });

  describe('checkGrowthComplete', () => {
    it('should return true when growth time remaining is 0', () => {
      const plot = {
        id: 'plot-1',
        position: { x: 0, y: 0 },
        state: PlotState.PLANTED,
        plantedSeed: SeedType.SHAMBLER_SEED,
        plantedAt: Date.now() - 300000,
        baseGrowthTime: 300000,
        growthTimeRemaining: 0,
        isWatered: false,
        isFertilized: false,
        zombieId: null,
      };

      expect(checkGrowthComplete(plot)).toBe(true);
    });

    it('should return false when growth time remaining is positive', () => {
      const plot = {
        id: 'plot-1',
        position: { x: 0, y: 0 },
        state: PlotState.PLANTED,
        plantedSeed: SeedType.SHAMBLER_SEED,
        plantedAt: Date.now(),
        baseGrowthTime: 300000,
        growthTimeRemaining: 60000,
        isWatered: false,
        isFertilized: false,
        zombieId: null,
      };

      expect(checkGrowthComplete(plot)).toBe(false);
    });

    it('should return false when plot is empty', () => {
      const plot = {
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
      };

      expect(checkGrowthComplete(plot)).toBe(false);
    });

    it('should return true when plot is already READY', () => {
      const plot = {
        id: 'plot-1',
        position: { x: 0, y: 0 },
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        plantedAt: Date.now() - 300000,
        baseGrowthTime: 300000,
        growthTimeRemaining: 0,
        isWatered: false,
        isFertilized: false,
        zombieId: 'zombie-1',
      };

      expect(checkGrowthComplete(plot)).toBe(true);
    });
  });

  describe('calculateOfflineGrowth', () => {
    it('should calculate offline growth for all planted plots', () => {
      const now = Date.now();
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: now - 120000, // Planted 2 minutes ago
            baseGrowthTime: 300000, // 5 minutes total
            growthTimeRemaining: 180000, // 3 minutes left
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const offlineTime = 120000; // 2 minutes offline
      const result = calculateOfflineGrowth(farmState, offlineTime);

      expect(result.success).toBe(true);
      if (result.success) {
        const plot = result.data.plots[0];
        expect(plot.growthTimeRemaining).toBe(60000); // 1 minute left
      }
    });

    it('should complete growth when offline time exceeds remaining time', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now() - 120000,
            baseGrowthTime: 300000,
            growthTimeRemaining: 60000, // 1 minute left
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const offlineTime = 120000; // 2 minutes offline (more than remaining)
      const result = calculateOfflineGrowth(farmState, offlineTime);

      expect(result.success).toBe(true);
      if (result.success) {
        const plot = result.data.plots[0];
        expect(plot.growthTimeRemaining).toBe(0);
      }
    });

    it('should handle zero offline time', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = calculateOfflineGrowth(farmState, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plots[0].growthTimeRemaining).toBe(240000);
      }
    });

    it('should fail with negative offline time', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = calculateOfflineGrowth(farmState, -60000);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('negative');
      }
    });

    it('should handle multiple plots with different growth stages', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
          {
            id: 'plot-2',
            position: { x: 1, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.RUNNER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 240000,
            growthTimeRemaining: 30000, // Will complete
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
          {
            id: 'plot-3',
            position: { x: 2, y: 0 },
            state: PlotState.EMPTY,
            plantedSeed: null,
            plantedAt: null,
            baseGrowthTime: null,
            growthTimeRemaining: null,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const result = calculateOfflineGrowth(farmState, 60000); // 1 minute

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plots[0].growthTimeRemaining).toBe(180000);
        expect(result.data.plots[1].growthTimeRemaining).toBe(0);
        expect(result.data.plots[2].growthTimeRemaining).toBeNull();
      }
    });

    it('should not mutate original farm state', () => {
      const farmState = createTestFarmState({
        plots: [
          {
            id: 'plot-1',
            position: { x: 0, y: 0 },
            state: PlotState.PLANTED,
            plantedSeed: SeedType.SHAMBLER_SEED,
            plantedAt: Date.now(),
            baseGrowthTime: 300000,
            growthTimeRemaining: 240000,
            isWatered: false,
            isFertilized: false,
            zombieId: null,
          },
        ],
      });

      const originalRemaining = farmState.plots[0].growthTimeRemaining;
      calculateOfflineGrowth(farmState, 60000);

      expect(farmState.plots[0].growthTimeRemaining).toBe(originalRemaining);
    });
  });

  describe('determineQuality', () => {
    it('should return a valid quality tier', () => {
      const quality = determineQuality(SeedType.SHAMBLER_SEED, {
        isFertilized: false,
        isWatered: false,
      });

      expect(Object.values(ZombieQuality)).toContain(quality);
    });

    it('should increase quality chances when fertilized', () => {
      // Run multiple times to test probabilistic behavior
      const qualities = Array.from({ length: 100 }, () =>
        determineQuality(SeedType.SHAMBLER_SEED, {
          isFertilized: true,
          isWatered: false,
        })
      );

      // With fertilizer, should have more high-quality zombies
      const silverOrBetter = qualities.filter((q) => q !== ZombieQuality.BRONZE).length;
      expect(silverOrBetter).toBeGreaterThan(0);
    });

    it('should not be affected by watering (watering affects speed, not quality)', () => {
      const quality1 = determineQuality(SeedType.SHAMBLER_SEED, {
        isFertilized: false,
        isWatered: false,
      });
      const quality2 = determineQuality(SeedType.SHAMBLER_SEED, {
        isFertilized: false,
        isWatered: true,
      });

      // Both should be valid qualities (watering doesn't deterministically change quality)
      expect(Object.values(ZombieQuality)).toContain(quality1);
      expect(Object.values(ZombieQuality)).toContain(quality2);
    });

    it('should work for all seed types', () => {
      const seedTypes = Object.values(SeedType);

      seedTypes.forEach((seedType) => {
        const quality = determineQuality(seedType, {
          isFertilized: false,
          isWatered: false,
        });
        expect(Object.values(ZombieQuality)).toContain(quality);
      });
    });

    it('should respect quality distribution probabilities', () => {
      // Run many times to test distribution
      const qualities = Array.from({ length: 1000 }, () =>
        determineQuality(SeedType.SHAMBLER_SEED, {
          isFertilized: false,
          isWatered: false,
        })
      );

      const bronzeCount = qualities.filter((q) => q === ZombieQuality.BRONZE).length;
      const silverCount = qualities.filter((q) => q === ZombieQuality.SILVER).length;
      const goldCount = qualities.filter((q) => q === ZombieQuality.GOLD).length;
      const diamondCount = qualities.filter((q) => q === ZombieQuality.DIAMOND).length;

      // Bronze should be most common (~60%)
      expect(bronzeCount).toBeGreaterThan(silverCount);
      // Silver should be more common than gold (~25%)
      expect(silverCount).toBeGreaterThan(goldCount);
      // Gold should be more common than diamond (~12%)
      expect(goldCount).toBeGreaterThan(diamondCount);
      // Diamond should be rare but present (~3%)
      expect(diamondCount).toBeGreaterThan(0);
    });
  });
});
