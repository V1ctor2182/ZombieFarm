/**
 * Inventory Factory
 *
 * Factory functions for creating test Inventory objects.
 * Per DOMAIN-FARM.md: Inventory tracks resources, currencies, seeds, and items.
 */

import type { Inventory } from '../../../types';
import { Resource, Currency, SeedType } from '../../../types';

/**
 * Creates a test Inventory with sensible defaults
 */
export function createTestInventory(overrides?: Partial<Inventory>): Inventory {
  const defaultInventory: Inventory = {
    resources: {},
    currencies: {
      [Currency.DARK_COINS]: 100,
      [Currency.SOUL_ESSENCE]: 0,
    },
    seeds: {},
    items: {},
    equipment: {},
  };

  return {
    ...defaultInventory,
    ...overrides,
    resources: overrides?.resources
      ? { ...defaultInventory.resources, ...overrides.resources }
      : defaultInventory.resources,
    currencies: overrides?.currencies
      ? { ...defaultInventory.currencies, ...overrides.currencies }
      : defaultInventory.currencies,
    seeds: overrides?.seeds ? { ...defaultInventory.seeds, ...overrides.seeds } : defaultInventory.seeds,
  };
}

/**
 * Creates inventory with specific resources
 */
export function createTestInventoryWithResources(
  resources: Partial<Record<Resource, number>>
): Inventory {
  return createTestInventory({ resources });
}

/**
 * Creates inventory with specific currencies
 */
export function createInventoryWithCurrencies(
  darkCoins: number = 100,
  soulEssence: number = 0
): Inventory {
  return createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: darkCoins,
      [Currency.SOUL_ESSENCE]: soulEssence,
    },
  });
}

/**
 * Creates empty inventory
 */
export function createEmptyInventory(): Inventory {
  return createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 0,
      [Currency.SOUL_ESSENCE]: 0,
    },
  });
}

/**
 * Creates rich inventory (lots of resources)
 */
export function createRichInventory(): Inventory {
  return createTestInventory({
    resources: {
      [Resource.ROTTEN_WOOD]: 500,
      [Resource.BONES]: 300,
      [Resource.BLOOD_WATER]: 100,
      [Resource.CORPSE_DUST]: 50,
      [Resource.SOUL_FRAGMENTS]: 25,
      [Resource.IRON_SCRAPS]: 150,
    },
    currencies: {
      [Currency.DARK_COINS]: 10000,
      [Currency.SOUL_ESSENCE]: 100,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 20,
      [SeedType.RUNNER_SEED]: 15,
      [SeedType.BRUTE_SEED]: 10,
      [SeedType.SPITTER_SEED]: 8,
    },
  });
}

/**
 * Creates starter inventory (new player)
 */
export function createStarterInventory(): Inventory {
  return createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 50,
      [Currency.SOUL_ESSENCE]: 0,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 3,
    },
  });
}

/**
 * Creates inventory with specific seeds
 */
export function createInventoryWithSeeds(seeds: Partial<Record<SeedType, number>>): Inventory {
  return createTestInventory({ seeds });
}
