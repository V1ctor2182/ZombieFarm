/**
 * Inventory Factory Tests
 */

import {
  createTestInventory,
  createTestInventoryWithResources,
  createInventoryWithCurrencies,
  createEmptyInventory,
  createRichInventory,
  createStarterInventory,
  createInventoryWithSeeds,
} from './inventoryFactory';
import { Resource, Currency, SeedType } from '../../../types';

describe('inventoryFactory', () => {
  describe('createTestInventory', () => {
    it('creates valid Inventory with defaults', () => {
      const inv = createTestInventory();
      expect(inv).toBeDefined();
      expect(inv.currencies[Currency.DARK_COINS]).toBe(100);
    });

    it('creates empty resource object', () => {
      const inv = createTestInventory();
      expect(inv.resources).toEqual({});
    });

    it('allows overriding resources', () => {
      const inv = createTestInventory({
        resources: { [Resource.BONES]: 50 },
      });
      expect(inv.resources[Resource.BONES]).toBe(50);
    });

    it('allows overriding currencies', () => {
      const inv = createTestInventory({
        currencies: { [Currency.DARK_COINS]: 500, [Currency.SOUL_ESSENCE]: 10 },
      });
      expect(inv.currencies[Currency.DARK_COINS]).toBe(500);
    });
  });

  describe('createTestInventoryWithResources', () => {
    it('creates inventory with specified resources', () => {
      const inv = createTestInventoryWithResources({
        [Resource.ROTTEN_WOOD]: 100,
        [Resource.BONES]: 50,
      });
      expect(inv.resources[Resource.ROTTEN_WOOD]).toBe(100);
      expect(inv.resources[Resource.BONES]).toBe(50);
    });
  });

  describe('createInventoryWithCurrencies', () => {
    it('creates inventory with specified currencies', () => {
      const inv = createInventoryWithCurrencies(1000, 50);
      expect(inv.currencies[Currency.DARK_COINS]).toBe(1000);
      expect(inv.currencies[Currency.SOUL_ESSENCE]).toBe(50);
    });

    it('defaults to 100 Dark Coins', () => {
      const inv = createInventoryWithCurrencies();
      expect(inv.currencies[Currency.DARK_COINS]).toBe(100);
    });
  });

  describe('createEmptyInventory', () => {
    it('creates inventory with 0 currencies', () => {
      const inv = createEmptyInventory();
      expect(inv.currencies[Currency.DARK_COINS]).toBe(0);
      expect(inv.currencies[Currency.SOUL_ESSENCE]).toBe(0);
    });
  });

  describe('createRichInventory', () => {
    it('has large amounts of resources', () => {
      const inv = createRichInventory();
      expect(inv.resources[Resource.ROTTEN_WOOD]).toBeGreaterThan(100);
    });

    it('has many Dark Coins', () => {
      const inv = createRichInventory();
      expect(inv.currencies[Currency.DARK_COINS]).toBeGreaterThan(1000);
    });

    it('has multiple seed types', () => {
      const inv = createRichInventory();
      expect(Object.keys(inv.seeds).length).toBeGreaterThan(2);
    });
  });

  describe('createStarterInventory', () => {
    it('has 50 starting coins', () => {
      const inv = createStarterInventory();
      expect(inv.currencies[Currency.DARK_COINS]).toBe(50);
    });

    it('has 3 shambler seeds', () => {
      const inv = createStarterInventory();
      expect(inv.seeds[SeedType.SHAMBLER_SEED]).toBe(3);
    });
  });

  describe('createInventoryWithSeeds', () => {
    it('creates inventory with specified seeds', () => {
      const inv = createInventoryWithSeeds({
        [SeedType.SHAMBLER_SEED]: 10,
        [SeedType.BRUTE_SEED]: 5,
      });
      expect(inv.seeds[SeedType.SHAMBLER_SEED]).toBe(10);
      expect(inv.seeds[SeedType.BRUTE_SEED]).toBe(5);
    });
  });
});
