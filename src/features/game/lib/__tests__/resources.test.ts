/**
 * Resource System Tests
 *
 * Comprehensive test suite for inventory and resource management.
 * Tests cover adding, removing, validating resources, currencies, and seeds.
 *
 * Per TESTING.md:
 * - Test all resource operations (add, remove, check)
 * - Test validation (no negatives, caps if any)
 * - Test currency tracking (Dark Coins, Soul Essence)
 * - Test inventory limits
 * - Use AAA pattern (Arrange, Act, Assert)
 */

import { describe, it, expect } from '@jest/globals';
import {
  createEmptyInventory,
  addResource,
  removeResource,
  hasResource,
  getResourceAmount,
  addCurrency,
  removeCurrency,
  getCurrencyAmount,
  addSeed,
  removeSeed,
  getSeedAmount,
  canAffordCost,
  deductCost,
  addReward,
  isInventoryFull,
  getInventoryCount,
  ResourceOperationError,
  ResourceOperationErrorCode,
} from '../resources';
import { Resource, Currency, SeedType } from '../../../../types';
import type { ResourceCost, ResourceReward } from '../../../../types';

describe('resources', () => {
  describe('createEmptyInventory', () => {
    it('should create an empty inventory with all resources at 0', () => {
      // Arrange & Act
      const inventory = createEmptyInventory();

      // Assert
      expect(inventory.resources[Resource.ROTTEN_WOOD]).toBe(0);
      expect(inventory.resources[Resource.BONES]).toBe(0);
      expect(inventory.resources[Resource.BLOOD_WATER]).toBe(0);
      expect(inventory.currencies[Currency.DARK_COINS]).toBe(0);
      expect(inventory.currencies[Currency.SOUL_ESSENCE]).toBe(0);
      expect(inventory.seeds[SeedType.SHAMBLER_SEED]).toBe(0);
      expect(inventory.items).toEqual([]);
      expect(inventory.currentCount).toBe(0);
    });

    it('should have a default capacity', () => {
      // Arrange & Act
      const inventory = createEmptyInventory();

      // Assert
      expect(inventory.capacity).toBeGreaterThan(0);
      expect(typeof inventory.capacity).toBe('number');
    });

    it('should allow custom capacity', () => {
      // Arrange & Act
      const inventory = createEmptyInventory(500);

      // Assert
      expect(inventory.capacity).toBe(500);
    });
  });

  describe('addResource', () => {
    it('should add resources to inventory', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addResource(inventory, Resource.ROTTEN_WOOD, 10);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.ROTTEN_WOOD]).toBe(10);
    });

    it('should accumulate resources across multiple adds', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result1 = addResource(inventory, Resource.BONES, 5);
      const result2 = addResource(result1.inventory!, Resource.BONES, 7);

      // Assert
      expect(result2.success).toBe(true);
      expect(result2.inventory?.resources[Resource.BONES]).toBe(12);
    });

    it('should handle adding zero amount', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addResource(inventory, Resource.BLOOD_WATER, 0);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.BLOOD_WATER]).toBe(0);
    });

    it('should reject negative amounts', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addResource(inventory, Resource.CORPSE_DUST, -5);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INVALID_AMOUNT);
      expect(result.error?.message).toContain('negative');
    });

    it('should update inventory count', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addResource(inventory, Resource.SOUL_FRAGMENTS, 3);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currentCount).toBe(3);
    });

    it('should enforce inventory capacity limits', () => {
      // Arrange
      const inventory = createEmptyInventory(10); // Small capacity

      // Act
      const result = addResource(inventory, Resource.IRON_SCRAPS, 20);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.CAPACITY_EXCEEDED);
    });
  });

  describe('removeResource', () => {
    it('should remove resources from inventory', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.ROTTEN_WOOD, 20).inventory!;

      // Act
      const result = removeResource(inventory, Resource.ROTTEN_WOOD, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.ROTTEN_WOOD]).toBe(15);
    });

    it('should update inventory count when removing', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BONES, 10).inventory!;

      // Act
      const result = removeResource(inventory, Resource.BONES, 3);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currentCount).toBe(7);
    });

    it('should reject removal if insufficient quantity', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BLOOD_WATER, 5).inventory!;

      // Act
      const result = removeResource(inventory, Resource.BLOOD_WATER, 10);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INSUFFICIENT_RESOURCES);
    });

    it('should reject negative amounts', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = removeResource(inventory, Resource.CORPSE_DUST, -3);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INVALID_AMOUNT);
    });

    it('should allow removing all of a resource', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.CLOTH, 7).inventory!;

      // Act
      const result = removeResource(inventory, Resource.CLOTH, 7);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.CLOTH]).toBe(0);
    });
  });

  describe('hasResource', () => {
    it('should return true if player has sufficient resource', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BRAINS, 10).inventory!;

      // Act & Assert
      expect(hasResource(inventory, Resource.BRAINS, 5)).toBe(true);
      expect(hasResource(inventory, Resource.BRAINS, 10)).toBe(true);
    });

    it('should return false if player has insufficient resource', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.ROTTEN_MEAT, 3).inventory!;

      // Act & Assert
      expect(hasResource(inventory, Resource.ROTTEN_MEAT, 5)).toBe(false);
    });

    it('should return false if resource is 0', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act & Assert
      expect(hasResource(inventory, Resource.HOLY_WATER, 1)).toBe(false);
    });
  });

  describe('getResourceAmount', () => {
    it('should return current amount of resource', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.COAL, 42).inventory!;

      // Act & Assert
      expect(getResourceAmount(inventory, Resource.COAL)).toBe(42);
    });

    it('should return 0 for resources not in inventory', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act & Assert
      expect(getResourceAmount(inventory, Resource.TAR)).toBe(0);
    });
  });

  describe('addCurrency', () => {
    it('should add Dark Coins', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addCurrency(inventory, Currency.DARK_COINS, 100);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currencies[Currency.DARK_COINS]).toBe(100);
    });

    it('should add Soul Essence', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addCurrency(inventory, Currency.SOUL_ESSENCE, 50);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currencies[Currency.SOUL_ESSENCE]).toBe(50);
    });

    it('should accumulate currency across multiple adds', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result1 = addCurrency(inventory, Currency.DARK_COINS, 100);
      const result2 = addCurrency(result1.inventory!, Currency.DARK_COINS, 250);

      // Assert
      expect(result2.success).toBe(true);
      expect(result2.inventory?.currencies[Currency.DARK_COINS]).toBe(350);
    });

    it('should reject negative currency amounts', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addCurrency(inventory, Currency.DARK_COINS, -50);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INVALID_AMOUNT);
    });
  });

  describe('removeCurrency', () => {
    it('should remove Dark Coins', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addCurrency(inventory, Currency.DARK_COINS, 500).inventory!;

      // Act
      const result = removeCurrency(inventory, Currency.DARK_COINS, 200);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currencies[Currency.DARK_COINS]).toBe(300);
    });

    it('should reject removal with insufficient currency', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addCurrency(inventory, Currency.SOUL_ESSENCE, 10).inventory!;

      // Act
      const result = removeCurrency(inventory, Currency.SOUL_ESSENCE, 20);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INSUFFICIENT_RESOURCES);
    });
  });

  describe('getCurrencyAmount', () => {
    it('should return current currency amount', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addCurrency(inventory, Currency.DARK_COINS, 999).inventory!;

      // Act & Assert
      expect(getCurrencyAmount(inventory, Currency.DARK_COINS)).toBe(999);
    });
  });

  describe('addSeed', () => {
    it('should add seeds to inventory', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addSeed(inventory, SeedType.SHAMBLER_SEED, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.seeds[SeedType.SHAMBLER_SEED]).toBe(5);
    });

    it('should accumulate seeds', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result1 = addSeed(inventory, SeedType.BRUTE_SEED, 2);
      const result2 = addSeed(result1.inventory!, SeedType.BRUTE_SEED, 3);

      // Assert
      expect(result2.success).toBe(true);
      expect(result2.inventory?.seeds[SeedType.BRUTE_SEED]).toBe(5);
    });

    it('should update inventory count for seeds', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addSeed(inventory, SeedType.RUNNER_SEED, 4);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currentCount).toBe(4);
    });

    it('should reject negative seed amounts', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const result = addSeed(inventory, SeedType.LICH_SEED, -1);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INVALID_AMOUNT);
    });
  });

  describe('removeSeed', () => {
    it('should remove seeds from inventory', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addSeed(inventory, SeedType.GHOUL_SEED, 10).inventory!;

      // Act
      const result = removeSeed(inventory, SeedType.GHOUL_SEED, 3);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.seeds[SeedType.GHOUL_SEED]).toBe(7);
    });

    it('should reject removal with insufficient seeds', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addSeed(inventory, SeedType.SPITTER_SEED, 1).inventory!;

      // Act
      const result = removeSeed(inventory, SeedType.SPITTER_SEED, 3);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INSUFFICIENT_RESOURCES);
    });
  });

  describe('getSeedAmount', () => {
    it('should return current seed amount', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addSeed(inventory, SeedType.ABOMINATION_SEED, 7).inventory!;

      // Act & Assert
      expect(getSeedAmount(inventory, SeedType.ABOMINATION_SEED)).toBe(7);
    });
  });

  describe('canAffordCost', () => {
    it('should return true if player can afford resource cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.ROTTEN_WOOD, 50).inventory!;
      inventory = addResource(inventory, Resource.BONES, 20).inventory!;

      const cost: ResourceCost = {
        resources: {
          [Resource.ROTTEN_WOOD]: 30,
          [Resource.BONES]: 10,
        },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(true);
    });

    it('should return false if player cannot afford resource cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.ROTTEN_WOOD, 10).inventory!;

      const cost: ResourceCost = {
        resources: {
          [Resource.ROTTEN_WOOD]: 50,
        },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(false);
    });

    it('should return true if player can afford currency cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addCurrency(inventory, Currency.DARK_COINS, 1000).inventory!;

      const cost: ResourceCost = {
        currencies: {
          [Currency.DARK_COINS]: 500,
        },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(true);
    });

    it('should return false if player cannot afford currency cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addCurrency(inventory, Currency.SOUL_ESSENCE, 5).inventory!;

      const cost: ResourceCost = {
        currencies: {
          [Currency.SOUL_ESSENCE]: 10,
        },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(false);
    });

    it('should return true if player can afford seed cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addSeed(inventory, SeedType.SHAMBLER_SEED, 10).inventory!;

      const cost: ResourceCost = {
        seeds: {
          [SeedType.SHAMBLER_SEED]: 5,
        },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(true);
    });

    it('should return true if player can afford combined cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BONES, 100).inventory!;
      inventory = addCurrency(inventory, Currency.DARK_COINS, 500).inventory!;
      inventory = addSeed(inventory, SeedType.RUNNER_SEED, 3).inventory!;

      const cost: ResourceCost = {
        resources: { [Resource.BONES]: 50 },
        currencies: { [Currency.DARK_COINS]: 250 },
        seeds: { [SeedType.RUNNER_SEED]: 2 },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(true);
    });

    it('should return false if player cannot afford any part of combined cost', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BONES, 100).inventory!;
      inventory = addCurrency(inventory, Currency.DARK_COINS, 100).inventory!; // Not enough

      const cost: ResourceCost = {
        resources: { [Resource.BONES]: 50 },
        currencies: { [Currency.DARK_COINS]: 500 },
      };

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(false);
    });

    it('should handle empty cost (always affordable)', () => {
      // Arrange
      const inventory = createEmptyInventory();
      const cost: ResourceCost = {};

      // Act & Assert
      expect(canAffordCost(inventory, cost)).toBe(true);
    });
  });

  describe('deductCost', () => {
    it('should deduct resource cost from inventory', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.ROTTEN_WOOD, 100).inventory!;
      inventory = addResource(inventory, Resource.BONES, 50).inventory!;

      const cost: ResourceCost = {
        resources: {
          [Resource.ROTTEN_WOOD]: 30,
          [Resource.BONES]: 10,
        },
      };

      // Act
      const result = deductCost(inventory, cost);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.ROTTEN_WOOD]).toBe(70);
      expect(result.inventory?.resources[Resource.BONES]).toBe(40);
    });

    it('should deduct currency cost from inventory', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addCurrency(inventory, Currency.DARK_COINS, 1000).inventory!;

      const cost: ResourceCost = {
        currencies: {
          [Currency.DARK_COINS]: 300,
        },
      };

      // Act
      const result = deductCost(inventory, cost);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currencies[Currency.DARK_COINS]).toBe(700);
    });

    it('should deduct seed cost from inventory', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addSeed(inventory, SeedType.BRUTE_SEED, 10).inventory!;

      const cost: ResourceCost = {
        seeds: {
          [SeedType.BRUTE_SEED]: 3,
        },
      };

      // Act
      const result = deductCost(inventory, cost);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.seeds[SeedType.BRUTE_SEED]).toBe(7);
    });

    it('should reject deduction if cannot afford', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BLOOD_WATER, 5).inventory!;

      const cost: ResourceCost = {
        resources: {
          [Resource.BLOOD_WATER]: 10,
        },
      };

      // Act
      const result = deductCost(inventory, cost);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.INSUFFICIENT_RESOURCES);
    });

    it('should handle combined cost deduction', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.IRON_SCRAPS, 50).inventory!;
      inventory = addCurrency(inventory, Currency.DARK_COINS, 500).inventory!;
      inventory = addSeed(inventory, SeedType.SHAMBLER_SEED, 10).inventory!;

      const cost: ResourceCost = {
        resources: { [Resource.IRON_SCRAPS]: 20 },
        currencies: { [Currency.DARK_COINS]: 100 },
        seeds: { [SeedType.SHAMBLER_SEED]: 5 },
      };

      // Act
      const result = deductCost(inventory, cost);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.IRON_SCRAPS]).toBe(30);
      expect(result.inventory?.currencies[Currency.DARK_COINS]).toBe(400);
      expect(result.inventory?.seeds[SeedType.SHAMBLER_SEED]).toBe(5);
    });
  });

  describe('addReward', () => {
    it('should add resource rewards', () => {
      // Arrange
      const inventory = createEmptyInventory();
      const reward: ResourceReward = {
        resources: {
          [Resource.SOUL_FRAGMENTS]: 10,
          [Resource.BONES]: 5,
        },
      };

      // Act
      const result = addReward(inventory, reward);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.SOUL_FRAGMENTS]).toBe(10);
      expect(result.inventory?.resources[Resource.BONES]).toBe(5);
    });

    it('should add currency rewards', () => {
      // Arrange
      const inventory = createEmptyInventory();
      const reward: ResourceReward = {
        currencies: {
          [Currency.DARK_COINS]: 250,
          [Currency.SOUL_ESSENCE]: 5,
        },
      };

      // Act
      const result = addReward(inventory, reward);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.currencies[Currency.DARK_COINS]).toBe(250);
      expect(result.inventory?.currencies[Currency.SOUL_ESSENCE]).toBe(5);
    });

    it('should add seed rewards', () => {
      // Arrange
      const inventory = createEmptyInventory();
      const reward: ResourceReward = {
        seeds: {
          [SeedType.BRUTE_SEED]: 3,
        },
      };

      // Act
      const result = addReward(inventory, reward);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.seeds[SeedType.BRUTE_SEED]).toBe(3);
    });

    it('should add combined rewards', () => {
      // Arrange
      const inventory = createEmptyInventory();
      const reward: ResourceReward = {
        resources: { [Resource.BRAINS]: 2 },
        currencies: { [Currency.DARK_COINS]: 100 },
        seeds: { [SeedType.GHOUL_SEED]: 1 },
      };

      // Act
      const result = addReward(inventory, reward);

      // Assert
      expect(result.success).toBe(true);
      expect(result.inventory?.resources[Resource.BRAINS]).toBe(2);
      expect(result.inventory?.currencies[Currency.DARK_COINS]).toBe(100);
      expect(result.inventory?.seeds[SeedType.GHOUL_SEED]).toBe(1);
    });

    it('should handle empty reward', () => {
      // Arrange
      const inventory = createEmptyInventory();
      const reward: ResourceReward = {};

      // Act
      const result = addReward(inventory, reward);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject reward if it would exceed capacity', () => {
      // Arrange
      const inventory = createEmptyInventory(5); // Very small capacity
      const reward: ResourceReward = {
        resources: {
          [Resource.ROTTEN_WOOD]: 10,
        },
      };

      // Act
      const result = addReward(inventory, reward);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ResourceOperationErrorCode.CAPACITY_EXCEEDED);
    });
  });

  describe('isInventoryFull', () => {
    it('should return false when inventory has space', () => {
      // Arrange
      let inventory = createEmptyInventory(100);
      inventory = addResource(inventory, Resource.BONES, 50).inventory!;

      // Act & Assert
      expect(isInventoryFull(inventory)).toBe(false);
    });

    it('should return true when inventory is at capacity', () => {
      // Arrange
      let inventory = createEmptyInventory(10);
      inventory = addResource(inventory, Resource.COAL, 10).inventory!;

      // Act & Assert
      expect(isInventoryFull(inventory)).toBe(true);
    });

    it('should return false for empty inventory', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act & Assert
      expect(isInventoryFull(inventory)).toBe(false);
    });
  });

  describe('getInventoryCount', () => {
    it('should return current inventory count', () => {
      // Arrange
      let inventory = createEmptyInventory();
      inventory = addResource(inventory, Resource.BONES, 25).inventory!;
      inventory = addSeed(inventory, SeedType.SHAMBLER_SEED, 5).inventory!;

      // Act
      const count = getInventoryCount(inventory);

      // Assert
      expect(count).toBe(30);
    });

    it('should return 0 for empty inventory', () => {
      // Arrange
      const inventory = createEmptyInventory();

      // Act
      const count = getInventoryCount(inventory);

      // Assert
      expect(count).toBe(0);
    });
  });

  describe('ResourceOperationError', () => {
    it('should create error with message and code', () => {
      // Arrange & Act
      const error = new ResourceOperationError(
        'Test error',
        ResourceOperationErrorCode.INVALID_AMOUNT
      );

      // Assert
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ResourceOperationErrorCode.INVALID_AMOUNT);
      expect(error.name).toBe('ResourceOperationError');
    });

    it('should be instanceof Error', () => {
      // Arrange & Act
      const error = new ResourceOperationError('Test', ResourceOperationErrorCode.INVALID_AMOUNT);

      // Assert
      expect(error instanceof Error).toBe(true);
      expect(error instanceof ResourceOperationError).toBe(true);
    });
  });
});
