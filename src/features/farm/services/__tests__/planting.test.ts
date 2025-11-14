/**
 * Planting System Unit Tests
 *
 * Tests all planting logic per DOMAIN-FARM.md:
 * - Plot validation (empty, occupied, invalid)
 * - Seed inventory checks
 * - Growth timer initialization
 * - Quality calculation
 * - Soil quality effects
 * - Weather effects
 * - Edge cases
 *
 * Following TDD: These tests are written BEFORE implementation.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { FarmState, Plot } from '../../../../types/farm';
import { PlotState } from '../../../../types/farm';
import type { Inventory, SeedType } from '../../../../types/resources';
import { Weather } from '../../../../types/global';
import { Resource, Currency } from '../../../../types/resources';

// Import functions to be implemented (will fail until implemented)
import {
  plantSeed,
  validatePlot,
  validateSeedAvailability,
  calculatePlantingBonus,
  startGrowthTimer,
  type PlantingResult,
  type GrowthTimer,
} from '../planting';

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

const createTestInventory = (seedOverrides: Partial<Record<string, number>> = {}): Inventory => ({
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
    ...seedOverrides,
  } as Record<SeedType, number>,
  items: [],
  capacity: 1000,
  currentCount: 0,
});

const createTestFarmState = (overrides: Partial<FarmState> = {}): FarmState => ({
  plots: [createTestPlot()],
  activeZombies: [],
  cryptZombies: [],
  buildings: [],
  resourceNodes: [],
  activeZombieCapacity: 10,
  expansionLevel: 0,
  gridSize: { width: 20, height: 15 },
  ...overrides,
});

describe('planting service', () => {
  describe('validatePlot', () => {
    it('should return true for empty plot', () => {
      const plot = createTestPlot({ state: PlotState.EMPTY });
      expect(validatePlot(plot)).toBe(true);
    });

    it('should return false for planted plot', () => {
      const plot = createTestPlot({
        state: PlotState.PLANTED,
        plantedSeed: 'shamblerSeed' as SeedType,
      });
      expect(validatePlot(plot)).toBe(false);
    });

    it('should return false for ready plot', () => {
      const plot = createTestPlot({ state: PlotState.READY });
      expect(validatePlot(plot)).toBe(false);
    });

    it('should return false for null plot', () => {
      expect(validatePlot(null as unknown as Plot)).toBe(false);
    });

    it('should return false for undefined plot', () => {
      expect(validatePlot(undefined as unknown as Plot)).toBe(false);
    });
  });

  describe('validateSeedAvailability', () => {
    it('should return true when seed is available', () => {
      const inventory = createTestInventory({ shamblerSeed: 5 });
      expect(validateSeedAvailability(inventory, 'shamblerSeed' as SeedType)).toBe(true);
    });

    it('should return false when seed count is 0', () => {
      const inventory = createTestInventory({ shamblerSeed: 0 });
      expect(validateSeedAvailability(inventory, 'shamblerSeed' as SeedType)).toBe(false);
    });

    it('should return false when seed is not in inventory', () => {
      const inventory = createTestInventory();
      expect(validateSeedAvailability(inventory, 'invalidSeed' as SeedType)).toBe(false);
    });

    it('should return false for negative seed count (edge case)', () => {
      const inventory = createTestInventory({ shamblerSeed: -1 });
      expect(validateSeedAvailability(inventory, 'shamblerSeed' as SeedType)).toBe(false);
    });

    it('should return false for null inventory', () => {
      expect(
        validateSeedAvailability(null as unknown as Inventory, 'shamblerSeed' as SeedType)
      ).toBe(false);
    });
  });

  describe('calculatePlantingBonus', () => {
    const basePlot = createTestPlot();

    it('should return 0 bonus for default conditions', () => {
      const bonus = calculatePlantingBonus(basePlot, Weather.CLEAR);
      expect(bonus).toBe(0);
    });

    it('should return 0.5 bonus when watered (50% speed boost)', () => {
      const plot = createTestPlot({ isWatered: true });
      const bonus = calculatePlantingBonus(plot, Weather.CLEAR);
      expect(bonus).toBeCloseTo(0.5);
    });

    it('should return 0.3 bonus when fertilized (30% speed boost)', () => {
      const plot = createTestPlot({ isFertilized: true });
      const bonus = calculatePlantingBonus(plot, Weather.CLEAR);
      expect(bonus).toBeCloseTo(0.3);
    });

    it('should stack watering and fertilizer bonuses', () => {
      const plot = createTestPlot({ isWatered: true, isFertilized: true });
      const bonus = calculatePlantingBonus(plot, Weather.CLEAR);
      // 50% + 30% = 80% = 0.8
      expect(bonus).toBeCloseTo(0.8);
    });

    it('should apply blood rain weather bonus (faster growth)', () => {
      const bonus = calculatePlantingBonus(basePlot, Weather.BLOOD_RAIN);
      // Blood rain should provide a bonus (e.g., 0.2 = 20% faster)
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeCloseTo(0.2);
    });

    it('should apply bright sun penalty (slower growth)', () => {
      const bonus = calculatePlantingBonus(basePlot, Weather.BRIGHT_SUN);
      // Bright sun should be negative (e.g., -0.1 = 10% slower)
      expect(bonus).toBeLessThan(0);
      expect(bonus).toBeCloseTo(-0.1);
    });

    it('should combine all bonuses correctly', () => {
      const plot = createTestPlot({ isWatered: true, isFertilized: true });
      const bonus = calculatePlantingBonus(plot, Weather.BLOOD_RAIN);
      // 0.5 (water) + 0.3 (fertilizer) + 0.2 (blood rain) = 1.0
      expect(bonus).toBeCloseTo(1.0);
    });
  });

  describe('startGrowthTimer', () => {
    const timestamp = Date.now();

    it('should create growth timer with base time for shambler', () => {
      const timer = startGrowthTimer('plot-1', 'shamblerSeed' as SeedType, 0, timestamp);

      expect(timer.plotId).toBe('plot-1');
      expect(timer.seedType).toBe('shamblerSeed');
      expect(timer.startedAt).toBe(timestamp);
      expect(timer.baseGrowthTime).toBe(5 * 60 * 1000); // 5 minutes in ms
      expect(timer.remainingTime).toBe(5 * 60 * 1000);
    });

    it('should apply bonus to growth time (50% faster)', () => {
      const timer = startGrowthTimer('plot-1', 'shamblerSeed' as SeedType, 0.5, timestamp);

      const baseTime = 5 * 60 * 1000; // 5 minutes
      const expectedTime = baseTime / (1 + 0.5); // 50% faster = divide by 1.5

      expect(timer.remainingTime).toBeCloseTo(expectedTime);
    });

    it('should apply penalty correctly (slower growth)', () => {
      const timer = startGrowthTimer('plot-1', 'shamblerSeed' as SeedType, -0.1, timestamp);

      const baseTime = 5 * 60 * 1000;
      const expectedTime = baseTime / (1 - 0.1); // 10% slower = divide by 0.9

      expect(timer.remainingTime).toBeCloseTo(expectedTime);
    });

    it('should handle different zombie types correctly', () => {
      const runnerTimer = startGrowthTimer('plot-1', 'runnerSeed' as SeedType, 0, timestamp);
      const bruteTimer = startGrowthTimer('plot-2', 'bruteSeed' as SeedType, 0, timestamp);

      // Runner: 4 minutes, Brute: 15 minutes
      expect(runnerTimer.baseGrowthTime).toBe(4 * 60 * 1000);
      expect(bruteTimer.baseGrowthTime).toBe(15 * 60 * 1000);
    });

    it('should not allow negative time (minimum 1 second)', () => {
      // Extreme bonus would cause negative time
      const timer = startGrowthTimer('plot-1', 'shamblerSeed' as SeedType, 10, timestamp);

      expect(timer.remainingTime).toBeGreaterThanOrEqual(1000); // At least 1 second
    });
  });

  describe('plantSeed', () => {
    let farmState: FarmState;
    let inventory: Inventory;
    const timestamp = Date.now();

    beforeEach(() => {
      farmState = createTestFarmState();
      inventory = createTestInventory();
    });

    it('should successfully plant seed in empty plot', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.farmState).toBeDefined();
      expect(result.inventory).toBeDefined();
      expect(result.growthTimer).toBeDefined();
    });

    it('should update plot state to PLANTED', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      const plot = result.farmState?.plots.find((p) => p.id === 'plot-1');
      expect(plot?.state).toBe(PlotState.PLANTED);
      expect(plot?.plantedSeed).toBe('shamblerSeed');
      expect(plot?.plantedAt).toBe(timestamp);
    });

    it('should decrement seed count in inventory', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.inventory?.seeds.shamblerSeed).toBe(9); // Was 10, now 9
    });

    it('should initialize growth timer', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.growthTimer?.plotId).toBe('plot-1');
      expect(result.growthTimer?.seedType).toBe('shamblerSeed');
      expect(result.growthTimer?.startedAt).toBe(timestamp);
    });

    it('should fail when plot does not exist', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'invalid-plot',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plot not found');
      expect(result.farmState).toBeUndefined();
    });

    it('should fail when plot is not empty', () => {
      const occupiedFarm = createTestFarmState({
        plots: [createTestPlot({ state: PlotState.PLANTED })],
      });

      const result = plantSeed(
        occupiedFarm,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plot is not empty');
    });

    it('should fail when seed is not available', () => {
      const noSeedsInventory = createTestInventory({ shamblerSeed: 0 });

      const result = plantSeed(
        farmState,
        noSeedsInventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Seed not available');
    });

    it('should fail when seed type is invalid', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'plot-1',
        'invalidSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid seed type');
    });

    it('should apply watering bonus to growth time', () => {
      const wateredFarm = createTestFarmState({
        plots: [createTestPlot({ isWatered: true })],
      });

      const result = plantSeed(
        wateredFarm,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      const baseTime = 5 * 60 * 1000;
      const expectedTime = baseTime / 1.5; // 50% faster

      expect(result.growthTimer?.remainingTime).toBeCloseTo(expectedTime);
    });

    it('should apply fertilizer bonus to growth time', () => {
      const fertilizedFarm = createTestFarmState({
        plots: [createTestPlot({ isFertilized: true })],
      });

      const result = plantSeed(
        fertilizedFarm,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      const baseTime = 5 * 60 * 1000;
      const expectedTime = baseTime / 1.3; // 30% faster

      expect(result.growthTimer?.remainingTime).toBeCloseTo(expectedTime);
    });

    it('should preserve other plots when planting', () => {
      const multiPlotFarm = createTestFarmState({
        plots: [
          createTestPlot({ id: 'plot-1' }),
          createTestPlot({ id: 'plot-2', state: PlotState.PLANTED }),
          createTestPlot({ id: 'plot-3' }),
        ],
      });

      const result = plantSeed(
        multiPlotFarm,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.farmState?.plots).toHaveLength(3);
      expect(result.farmState?.plots.find((p) => p.id === 'plot-2')?.state).toBe(PlotState.PLANTED);
    });

    it('should preserve other seeds in inventory', () => {
      const result = plantSeed(
        farmState,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.inventory?.seeds.runnerSeed).toBe(5); // Unchanged
      expect(result.inventory?.seeds.bruteSeed).toBe(3); // Unchanged
    });

    it('should handle planting multiple seeds in different plots', () => {
      const multiPlotFarm = createTestFarmState({
        plots: [createTestPlot({ id: 'plot-1' }), createTestPlot({ id: 'plot-2' })],
      });

      const result1 = plantSeed(
        multiPlotFarm,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );
      expect(result1.success).toBe(true);

      const result2 = plantSeed(
        result1.farmState,
        result1.inventory,
        'plot-2',
        'runnerSeed' as SeedType,
        timestamp
      );
      expect(result2.success).toBe(true);

      const plot1 = result2.farmState?.plots.find((p) => p.id === 'plot-1');
      const plot2 = result2.farmState?.plots.find((p) => p.id === 'plot-2');

      expect(plot1?.plantedSeed).toBe('shamblerSeed');
      expect(plot2?.plantedSeed).toBe('runnerSeed');
      expect(result2.inventory?.seeds.shamblerSeed).toBe(9);
      expect(result2.inventory?.seeds.runnerSeed).toBe(4);
    });

    it('should not mutate original farm state', () => {
      const originalPlots = [...farmState.plots];
      plantSeed(farmState, inventory, 'plot-1', 'shamblerSeed' as SeedType, timestamp);

      expect(farmState.plots).toEqual(originalPlots);
    });

    it('should not mutate original inventory', () => {
      const originalSeeds = { ...inventory.seeds };
      plantSeed(farmState, inventory, 'plot-1', 'shamblerSeed' as SeedType, timestamp);

      expect(inventory.seeds).toEqual(originalSeeds);
    });

    it('should handle edge case of last seed', () => {
      const lastSeedInventory = createTestInventory({ shamblerSeed: 1 });

      const result = plantSeed(
        farmState,
        lastSeedInventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(true);
      expect(result.inventory?.seeds.shamblerSeed).toBe(0);
    });

    it('should fail gracefully with null farm state', () => {
      const result = plantSeed(
        null as unknown as FarmState,
        inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail gracefully with null inventory', () => {
      const result = plantSeed(
        farmState,
        null as unknown as Inventory,
        'plot-1',
        'shamblerSeed' as SeedType,
        timestamp
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
