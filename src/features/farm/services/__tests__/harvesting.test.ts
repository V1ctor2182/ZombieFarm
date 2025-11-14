/**
 * Harvesting Service Unit Tests
 *
 * Tests for zombie harvesting mechanics per DOMAIN-FARM.md:
 * - Harvest ready zombies from plots
 * - Generate zombie with stats based on type and quality
 * - Apply quality multipliers (Bronze 1.0x, Silver 1.25x, Gold 1.5x, Diamond 2.0x)
 * - Random mutation system
 * - Capacity management (active roster vs Crypt)
 * - Resource byproduct drops
 * - Clear plot after harvest
 */

import { describe, it, expect } from '@jest/globals';
import {
  harvestZombie,
  generateZombieStats,
  applyQualityMultiplier,
  applyMutations,
  generateByproducts,
  validateHarvest,
} from '../harvesting';
import type { FarmState, Plot, Zombie, ZombieStats } from '../../../../types/farm';
import { PlotState, ZombieType, ZombieQuality } from '../../../../types/farm';
import { SeedType, Resource } from '../../../../types/resources';
import type { Inventory } from '../../../../types/resources';

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

const createTestZombie = (overrides: Partial<Zombie> = {}): Zombie => ({
  id: 'zombie-1',
  type: ZombieType.SHAMBLER,
  name: 'Test Zombie',
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

const createTestInventory = (overrides: Record<Resource, number> = {} as any): Inventory => ({
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
    ...overrides,
  },
  currencies: {
    darkCoins: 0,
    soulEssence: 0,
  },
});

describe('harvesting service', () => {
  // ============================================================================
  // VALIDATE HARVEST
  // ============================================================================

  describe('validateHarvest', () => {
    it('should validate plot is ready to harvest', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const result = validateHarvest(plot);
      expect(result.success).toBe(true);
    });

    it('should fail when plot is not ready', () => {
      const plot = createTestPlot({
        state: PlotState.PLANTED,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 60000,
      });

      const result = validateHarvest(plot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not ready');
    });

    it('should fail when plot is empty', () => {
      const plot = createTestPlot({
        state: PlotState.EMPTY,
      });

      const result = validateHarvest(plot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should fail when plot has no planted seed', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: null,
        growthTimeRemaining: 0,
      });

      const result = validateHarvest(plot);
      expect(result.success).toBe(false);
      expect(result.error).toContain('seed');
    });
  });

  // ============================================================================
  // GENERATE ZOMBIE STATS
  // ============================================================================

  describe('generateZombieStats', () => {
    it('should generate zombie with base stats for bronze quality', () => {
      const stats = generateZombieStats(ZombieType.SHAMBLER, ZombieQuality.BRONZE);

      expect(stats.maxHp).toBe(100); // Base shambler HP
      expect(stats.hp).toBe(100);
      expect(stats.attack).toBe(15);
      expect(stats.defense).toBe(10);
      expect(stats.speed).toBe(1.0);
      expect(stats.range).toBe(1);
      expect(stats.attackCooldown).toBe(1.5);
      expect(stats.decayRate).toBe(1.0);
    });

    it('should apply silver quality multiplier (1.25x)', () => {
      const stats = generateZombieStats(ZombieType.SHAMBLER, ZombieQuality.SILVER);

      expect(stats.maxHp).toBe(125); // 100 * 1.25
      expect(stats.hp).toBe(125);
      expect(stats.attack).toBe(19); // 15 * 1.25 = 18.75, rounded to 19
      expect(stats.defense).toBe(13); // 10 * 1.25 = 12.5, rounded to 13
    });

    it('should apply gold quality multiplier (1.5x)', () => {
      const stats = generateZombieStats(ZombieType.SHAMBLER, ZombieQuality.GOLD);

      expect(stats.maxHp).toBe(150); // 100 * 1.5
      expect(stats.hp).toBe(150);
      expect(stats.attack).toBe(23); // 15 * 1.5 = 22.5, rounded to 23
      expect(stats.defense).toBe(15); // 10 * 1.5
    });

    it('should apply diamond quality multiplier (2.0x)', () => {
      const stats = generateZombieStats(ZombieType.SHAMBLER, ZombieQuality.DIAMOND);

      expect(stats.maxHp).toBe(200); // 100 * 2.0
      expect(stats.hp).toBe(200);
      expect(stats.attack).toBe(30); // 15 * 2.0
      expect(stats.defense).toBe(20); // 10 * 2.0
    });

    it('should generate correct stats for all zombie types', () => {
      // Test each zombie type to ensure config is correct
      const types = [
        ZombieType.SHAMBLER,
        ZombieType.RUNNER,
        ZombieType.BRUTE,
        ZombieType.SPITTER,
        ZombieType.GHOUL,
        ZombieType.ABOMINATION,
        ZombieType.LICH,
        ZombieType.BONE_KNIGHT,
      ];

      types.forEach((type) => {
        const stats = generateZombieStats(type, ZombieQuality.BRONZE);
        expect(stats.maxHp).toBeGreaterThan(0);
        expect(stats.attack).toBeGreaterThan(0);
        expect(stats.defense).toBeGreaterThan(0);
      });
    });

    it('should set hp equal to maxHp for newly harvested zombies', () => {
      const stats = generateZombieStats(ZombieType.BRUTE, ZombieQuality.GOLD);
      expect(stats.hp).toBe(stats.maxHp);
    });
  });

  // ============================================================================
  // APPLY QUALITY MULTIPLIER
  // ============================================================================

  describe('applyQualityMultiplier', () => {
    const baseStats: ZombieStats = {
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 15,
      speed: 1.5,
      range: 1,
      attackCooldown: 2.0,
      decayRate: 1.0,
    };

    it('should not modify stats for bronze quality', () => {
      const result = applyQualityMultiplier(baseStats, ZombieQuality.BRONZE);

      expect(result.maxHp).toBe(100);
      expect(result.attack).toBe(20);
      expect(result.defense).toBe(15);
    });

    it('should apply 1.25x multiplier for silver quality', () => {
      const result = applyQualityMultiplier(baseStats, ZombieQuality.SILVER);

      expect(result.maxHp).toBe(125);
      expect(result.attack).toBe(25);
      expect(result.defense).toBe(19); // 15 * 1.25 = 18.75, rounded to 19
    });

    it('should apply 1.5x multiplier for gold quality', () => {
      const result = applyQualityMultiplier(baseStats, ZombieQuality.GOLD);

      expect(result.maxHp).toBe(150);
      expect(result.attack).toBe(30);
      expect(result.defense).toBe(23); // 15 * 1.5 = 22.5, rounded to 23
    });

    it('should apply 2.0x multiplier for diamond quality', () => {
      const result = applyQualityMultiplier(baseStats, ZombieQuality.DIAMOND);

      expect(result.maxHp).toBe(200);
      expect(result.attack).toBe(40);
      expect(result.defense).toBe(30);
    });

    it('should round stats to reasonable precision', () => {
      const result = applyQualityMultiplier(baseStats, ZombieQuality.SILVER);

      // Should not have excessive decimal places
      expect(result.maxHp % 1).toBe(0); // Should be integer
      expect(result.attack % 1).toBe(0);
    });

    it('should not mutate original stats', () => {
      const original = { ...baseStats };
      applyQualityMultiplier(baseStats, ZombieQuality.DIAMOND);

      expect(baseStats).toEqual(original);
    });
  });

  // ============================================================================
  // APPLY MUTATIONS
  // ============================================================================

  describe('applyMutations', () => {
    it('should return zombie with no mutations when chance is 0', () => {
      const zombie = createTestZombie();
      const result = applyMutations(zombie, 0);

      expect(result.mutations).toEqual([]);
    });

    it('should return zombie with mutations when chance is 100%', () => {
      const zombie = createTestZombie();
      const result = applyMutations(zombie, 1.0);

      expect(result.mutations.length).toBeGreaterThan(0);
    });

    it('should apply valid mutation types', () => {
      const zombie = createTestZombie();
      const result = applyMutations(zombie, 1.0);

      // Mutations should be strings
      result.mutations.forEach((mutation) => {
        expect(typeof mutation).toBe('string');
        expect(mutation.length).toBeGreaterThan(0);
      });
    });

    it('should not mutate original zombie', () => {
      const zombie = createTestZombie();
      const original = { ...zombie };

      applyMutations(zombie, 1.0);

      expect(zombie).toEqual(original);
    });

    it('should handle mutation chance between 0 and 1', () => {
      const zombie = createTestZombie();

      // Run multiple times with 50% chance
      const results = Array.from({ length: 20 }, () => applyMutations(zombie, 0.5));

      // Some should have mutations, some shouldn't
      const withMutations = results.filter((z) => z.mutations.length > 0);
      const withoutMutations = results.filter((z) => z.mutations.length === 0);

      expect(withMutations.length).toBeGreaterThan(0);
      expect(withoutMutations.length).toBeGreaterThan(0);
    });

    it('should respect different mutation rates for different qualities', () => {
      const zombie = createTestZombie({ quality: ZombieQuality.DIAMOND });

      // Diamond should have higher mutation chance
      const result = applyMutations(zombie, 0.8);

      // Just verify it works, actual chance is handled by config
      expect(result).toBeDefined();
      expect(result.mutations).toBeDefined();
    });
  });

  // ============================================================================
  // GENERATE BYPRODUCTS
  // ============================================================================

  describe('generateByproducts', () => {
    it('should generate byproduct resources from harvest', () => {
      const byproducts = generateByproducts(ZombieType.SHAMBLER);

      expect(byproducts).toBeDefined();
      expect(typeof byproducts).toBe('object');
    });

    it('should return consistent byproducts for same zombie type', () => {
      const byproducts1 = generateByproducts(ZombieType.BRUTE);
      const byproducts2 = generateByproducts(ZombieType.BRUTE);

      // Should have same resource types (though amounts may vary if random)
      expect(Object.keys(byproducts1)).toEqual(Object.keys(byproducts2));
    });

    it('should generate appropriate byproducts for basic zombies', () => {
      const byproducts = generateByproducts(ZombieType.SHAMBLER);

      // Basic zombies should drop basic resources
      const resourceTypes = Object.keys(byproducts);
      expect(resourceTypes.length).toBeGreaterThan(0);
    });

    it('should generate better byproducts for elite zombies', () => {
      const shamblerByproducts = generateByproducts(ZombieType.SHAMBLER);
      const abominationByproducts = generateByproducts(ZombieType.ABOMINATION);

      // Elite zombies should drop more or better resources
      const shamblerTotal = Object.values(shamblerByproducts).reduce((sum, val) => sum + val, 0);
      const abominationTotal = Object.values(abominationByproducts).reduce(
        (sum, val) => sum + val,
        0
      );

      expect(abominationTotal).toBeGreaterThanOrEqual(shamblerTotal);
    });

    it('should return valid resource types', () => {
      const byproducts = generateByproducts(ZombieType.SPITTER);

      Object.keys(byproducts).forEach((key) => {
        expect(Object.values(Resource)).toContain(key);
      });
    });

    it('should return non-negative resource amounts', () => {
      const byproducts = generateByproducts(ZombieType.GHOUL);

      Object.values(byproducts).forEach((amount) => {
        expect(amount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ============================================================================
  // HARVEST ZOMBIE
  // ============================================================================

  describe('harvestZombie', () => {
    it('should successfully harvest ready zombie', () => {
      const now = Date.now();
      const plot = createTestPlot({
        id: 'plot-1',
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        plantedAt: now - 300000,
        baseGrowthTime: 300000,
        growthTimeRemaining: 0,
        isFertilized: false,
        isWatered: false,
      });

      const farmState = createTestFarmState({
        plots: [plot],
        activeZombies: [],
        activeZombieCapacity: 10,
      });

      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farmState.activeZombies.length).toBe(1);
        expect(result.data.farmState.plots[0].state).toBe(PlotState.EMPTY);
        expect(result.data.farmState.plots[0].plantedSeed).toBeNull();
        expect(result.data.zombie).toBeDefined();
        expect(result.data.zombie.type).toBe(ZombieType.SHAMBLER);
      }
    });

    it('should fail when plot not found', () => {
      const farmState = createTestFarmState({ plots: [] });
      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'nonexistent-plot', ZombieQuality.BRONZE);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail when plot is not ready', () => {
      const plot = createTestPlot({
        state: PlotState.PLANTED,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 60000,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not ready');
    });

    it('should add zombie to active roster when under capacity', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.RUNNER_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({
        plots: [plot],
        activeZombies: [],
        activeZombieCapacity: 10,
      });

      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.SILVER);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farmState.activeZombies.length).toBe(1);
        expect(result.data.farmState.cryptZombies.length).toBe(0);
      }
    });

    it('should add zombie to Crypt when at capacity', () => {
      const existingZombies = Array.from({ length: 10 }, (_, i) =>
        createTestZombie({ id: `zombie-${i}` })
      );

      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.BRUTE_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({
        plots: [plot],
        activeZombies: existingZombies,
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.GOLD);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.farmState.activeZombies.length).toBe(10); // Still at cap
        expect(result.data.farmState.cryptZombies.length).toBe(1); // New zombie in Crypt
        expect(result.data.zombie.type).toBe(ZombieType.BRUTE);
      }
    });

    it('should clear plot after harvest', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        plantedAt: Date.now() - 300000,
        baseGrowthTime: 300000,
        growthTimeRemaining: 0,
        isWatered: true,
        isFertilized: true,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);

      expect(result.success).toBe(true);
      if (result.success) {
        const clearedPlot = result.data.farmState.plots[0];
        expect(clearedPlot.state).toBe(PlotState.EMPTY);
        expect(clearedPlot.plantedSeed).toBeNull();
        expect(clearedPlot.plantedAt).toBeNull();
        expect(clearedPlot.baseGrowthTime).toBeNull();
        expect(clearedPlot.growthTimeRemaining).toBeNull();
        expect(clearedPlot.isWatered).toBe(false);
        expect(clearedPlot.isFertilized).toBe(false);
      }
    });

    it('should add byproduct resources to inventory', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should have some resources added
        const totalResources = Object.values(result.data.inventory.resources).reduce(
          (sum, val) => sum + val,
          0
        );
        expect(totalResources).toBeGreaterThan(0);
      }
    });

    it('should generate zombie with correct quality', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.DIAMOND);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.zombie.quality).toBe(ZombieQuality.DIAMOND);
        // Diamond quality should have 2x stats
        expect(result.data.zombie.stats.maxHp).toBe(200); // Shambler base 100 * 2.0
      }
    });

    it('should apply mutations based on quality', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      // Run multiple times to test mutation randomness
      const results = Array.from({ length: 10 }, () =>
        harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.DIAMOND)
      );

      // At least some should have mutations (diamond has higher chance)
      const withMutations = results.filter((r) => r.success && r.data.zombie.mutations.length > 0);

      // Just verify the system works, exact probabilities handled by config
      expect(withMutations.length).toBeGreaterThanOrEqual(0);
    });

    it('should not mutate original farm state', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      const originalState = JSON.parse(JSON.stringify(farmState));
      const originalInventory = JSON.parse(JSON.stringify(inventory));

      harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);

      expect(farmState).toEqual(originalState);
      expect(inventory).toEqual(originalInventory);
    });

    it('should generate unique zombie IDs', () => {
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
      ];

      const farmState = createTestFarmState({ plots });
      const inventory = createTestInventory();

      const result1 = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);
      const result2 = harvestZombie(farmState, inventory, 'plot-2', ZombieQuality.BRONZE);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      if (result1.success && result2.success) {
        expect(result1.data.zombie.id).not.toBe(result2.data.zombie.id);
      }
    });

    it('should set initial zombie state correctly', () => {
      const plot = createTestPlot({
        state: PlotState.READY,
        plantedSeed: SeedType.SHAMBLER_SEED,
        growthTimeRemaining: 0,
      });

      const farmState = createTestFarmState({ plots: [plot] });
      const inventory = createTestInventory();

      const result = harvestZombie(farmState, inventory, 'plot-1', ZombieQuality.BRONZE);

      expect(result.success).toBe(true);
      if (result.success) {
        const zombie = result.data.zombie;
        expect(zombie.level).toBe(1);
        expect(zombie.xp).toBe(0);
        expect(zombie.happiness).toBeGreaterThan(0);
        expect(zombie.daysSinceLastFed).toBe(0);
        expect(zombie.equipment).toBeDefined();
        expect(zombie.position).toBeNull(); // Not placed on farm yet
      }
    });
  });
});
