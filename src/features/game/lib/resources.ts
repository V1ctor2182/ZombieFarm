/**
 * Resource & Inventory System
 *
 * Manages all game resources, currencies, seeds, and items.
 * Provides functions for adding, removing, and checking resource availability.
 *
 * Per ARCHITECTURE.md:
 * - Immutable operations (returns new inventory)
 * - Validation on all operations
 * - Type-safe resource management
 * - Supports resources, currencies, seeds, and items
 *
 * Resource types defined in src/types/resources.ts
 */

import {
  Resource,
  Currency,
  SeedType,
  type Inventory,
  type ResourceCost,
  type ResourceReward,
  type Item,
} from '../../../types';

/**
 * Default inventory capacity (can be expanded via upgrades)
 */
export const DEFAULT_INVENTORY_CAPACITY = 1000;

/**
 * Error codes for resource operations
 */
export enum ResourceOperationErrorCode {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  INVALID_OPERATION = 'INVALID_OPERATION',
}

/**
 * Custom error class for resource operations
 */
export class ResourceOperationError extends Error {
  constructor(
    message: string,
    public code: ResourceOperationErrorCode
  ) {
    super(message);
    this.name = 'ResourceOperationError';
    Object.setPrototypeOf(this, ResourceOperationError.prototype);
  }
}

/**
 * Result type for resource operations
 */
export type ResourceOperationResult =
  | { success: true; inventory: Inventory; error?: never }
  | { success: false; error: ResourceOperationError; inventory?: never };

/**
 * Creates an empty inventory with default values
 *
 * @param capacity - Maximum inventory capacity (default: 1000)
 * @returns New empty inventory
 */
export function createEmptyInventory(capacity: number = DEFAULT_INVENTORY_CAPACITY): Inventory {
  // Initialize all resources to 0
  const resources: Record<Resource, number> = {} as Record<Resource, number>;
  Object.values(Resource).forEach((resource) => {
    resources[resource as Resource] = 0;
  });

  // Initialize all currencies to 0
  const currencies: Record<Currency, number> = {} as Record<Currency, number>;
  Object.values(Currency).forEach((currency) => {
    currencies[currency as Currency] = 0;
  });

  // Initialize all seeds to 0
  const seeds: Record<SeedType, number> = {} as Record<SeedType, number>;
  Object.values(SeedType).forEach((seed) => {
    seeds[seed as SeedType] = 0;
  });

  return {
    resources,
    currencies,
    seeds,
    items: [],
    capacity,
    currentCount: 0,
  };
}

/**
 * Adds a resource to inventory
 *
 * @param inventory - Current inventory
 * @param resource - Resource type to add
 * @param amount - Amount to add (must be non-negative)
 * @returns Result with updated inventory or error
 */
export function addResource(
  inventory: Inventory,
  resource: Resource,
  amount: number
): ResourceOperationResult {
  // Validate amount
  if (amount < 0) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Cannot add negative amount of ${resource}`,
        ResourceOperationErrorCode.INVALID_AMOUNT
      ),
    };
  }

  // Check capacity
  const newCount = inventory.currentCount + amount;
  if (newCount > inventory.capacity) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Adding ${amount} ${resource} would exceed inventory capacity (${inventory.capacity})`,
        ResourceOperationErrorCode.CAPACITY_EXCEEDED
      ),
    };
  }

  // Add resource (immutable update)
  const newResources = {
    ...inventory.resources,
    [resource]: inventory.resources[resource] + amount,
  };

  return {
    success: true,
    inventory: {
      ...inventory,
      resources: newResources,
      currentCount: newCount,
    },
  };
}

/**
 * Removes a resource from inventory
 *
 * @param inventory - Current inventory
 * @param resource - Resource type to remove
 * @param amount - Amount to remove (must be non-negative)
 * @returns Result with updated inventory or error
 */
export function removeResource(
  inventory: Inventory,
  resource: Resource,
  amount: number
): ResourceOperationResult {
  // Validate amount
  if (amount < 0) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Cannot remove negative amount of ${resource}`,
        ResourceOperationErrorCode.INVALID_AMOUNT
      ),
    };
  }

  // Check if sufficient resources
  const currentAmount = inventory.resources[resource];
  if (currentAmount < amount) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Insufficient ${resource}: have ${currentAmount}, need ${amount}`,
        ResourceOperationErrorCode.INSUFFICIENT_RESOURCES
      ),
    };
  }

  // Remove resource (immutable update)
  const newResources = {
    ...inventory.resources,
    [resource]: currentAmount - amount,
  };

  return {
    success: true,
    inventory: {
      ...inventory,
      resources: newResources,
      currentCount: inventory.currentCount - amount,
    },
  };
}

/**
 * Checks if inventory has sufficient amount of a resource
 *
 * @param inventory - Current inventory
 * @param resource - Resource type to check
 * @param amount - Amount needed
 * @returns True if inventory has sufficient amount
 */
export function hasResource(inventory: Inventory, resource: Resource, amount: number): boolean {
  return inventory.resources[resource] >= amount;
}

/**
 * Gets the current amount of a resource
 *
 * @param inventory - Current inventory
 * @param resource - Resource type to check
 * @returns Current amount of resource
 */
export function getResourceAmount(inventory: Inventory, resource: Resource): number {
  return inventory.resources[resource];
}

/**
 * Adds currency to inventory
 *
 * @param inventory - Current inventory
 * @param currency - Currency type to add
 * @param amount - Amount to add (must be non-negative)
 * @returns Result with updated inventory or error
 */
export function addCurrency(
  inventory: Inventory,
  currency: Currency,
  amount: number
): ResourceOperationResult {
  // Validate amount
  if (amount < 0) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Cannot add negative amount of ${currency}`,
        ResourceOperationErrorCode.INVALID_AMOUNT
      ),
    };
  }

  // Add currency (currencies don't count toward inventory capacity)
  const newCurrencies = {
    ...inventory.currencies,
    [currency]: inventory.currencies[currency] + amount,
  };

  return {
    success: true,
    inventory: {
      ...inventory,
      currencies: newCurrencies,
    },
  };
}

/**
 * Removes currency from inventory
 *
 * @param inventory - Current inventory
 * @param currency - Currency type to remove
 * @param amount - Amount to remove (must be non-negative)
 * @returns Result with updated inventory or error
 */
export function removeCurrency(
  inventory: Inventory,
  currency: Currency,
  amount: number
): ResourceOperationResult {
  // Validate amount
  if (amount < 0) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Cannot remove negative amount of ${currency}`,
        ResourceOperationErrorCode.INVALID_AMOUNT
      ),
    };
  }

  // Check if sufficient currency
  const currentAmount = inventory.currencies[currency];
  if (currentAmount < amount) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Insufficient ${currency}: have ${currentAmount}, need ${amount}`,
        ResourceOperationErrorCode.INSUFFICIENT_RESOURCES
      ),
    };
  }

  // Remove currency
  const newCurrencies = {
    ...inventory.currencies,
    [currency]: currentAmount - amount,
  };

  return {
    success: true,
    inventory: {
      ...inventory,
      currencies: newCurrencies,
    },
  };
}

/**
 * Gets the current amount of a currency
 *
 * @param inventory - Current inventory
 * @param currency - Currency type to check
 * @returns Current amount of currency
 */
export function getCurrencyAmount(inventory: Inventory, currency: Currency): number {
  return inventory.currencies[currency];
}

/**
 * Adds seeds to inventory
 *
 * @param inventory - Current inventory
 * @param seed - Seed type to add
 * @param amount - Amount to add (must be non-negative)
 * @returns Result with updated inventory or error
 */
export function addSeed(
  inventory: Inventory,
  seed: SeedType,
  amount: number
): ResourceOperationResult {
  // Validate amount
  if (amount < 0) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Cannot add negative amount of ${seed}`,
        ResourceOperationErrorCode.INVALID_AMOUNT
      ),
    };
  }

  // Check capacity (seeds count toward inventory)
  const newCount = inventory.currentCount + amount;
  if (newCount > inventory.capacity) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Adding ${amount} ${seed} would exceed inventory capacity (${inventory.capacity})`,
        ResourceOperationErrorCode.CAPACITY_EXCEEDED
      ),
    };
  }

  // Add seed
  const newSeeds = {
    ...inventory.seeds,
    [seed]: inventory.seeds[seed] + amount,
  };

  return {
    success: true,
    inventory: {
      ...inventory,
      seeds: newSeeds,
      currentCount: newCount,
    },
  };
}

/**
 * Removes seeds from inventory
 *
 * @param inventory - Current inventory
 * @param seed - Seed type to remove
 * @param amount - Amount to remove (must be non-negative)
 * @returns Result with updated inventory or error
 */
export function removeSeed(
  inventory: Inventory,
  seed: SeedType,
  amount: number
): ResourceOperationResult {
  // Validate amount
  if (amount < 0) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Cannot remove negative amount of ${seed}`,
        ResourceOperationErrorCode.INVALID_AMOUNT
      ),
    };
  }

  // Check if sufficient seeds
  const currentAmount = inventory.seeds[seed];
  if (currentAmount < amount) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Insufficient ${seed}: have ${currentAmount}, need ${amount}`,
        ResourceOperationErrorCode.INSUFFICIENT_RESOURCES
      ),
    };
  }

  // Remove seed
  const newSeeds = {
    ...inventory.seeds,
    [seed]: currentAmount - amount,
  };

  return {
    success: true,
    inventory: {
      ...inventory,
      seeds: newSeeds,
      currentCount: inventory.currentCount - amount,
    },
  };
}

/**
 * Gets the current amount of a seed type
 *
 * @param inventory - Current inventory
 * @param seed - Seed type to check
 * @returns Current amount of seed
 */
export function getSeedAmount(inventory: Inventory, seed: SeedType): number {
  return inventory.seeds[seed];
}

/**
 * Checks if player can afford a given cost
 *
 * @param inventory - Current inventory
 * @param cost - Cost to check
 * @returns True if player can afford all parts of the cost
 */
export function canAffordCost(inventory: Inventory, cost: ResourceCost): boolean {
  // Check resources
  if (cost.resources) {
    for (const [resource, amount] of Object.entries(cost.resources)) {
      if (inventory.resources[resource as Resource] < amount) {
        return false;
      }
    }
  }

  // Check currencies
  if (cost.currencies) {
    for (const [currency, amount] of Object.entries(cost.currencies)) {
      if (inventory.currencies[currency as Currency] < amount) {
        return false;
      }
    }
  }

  // Check seeds
  if (cost.seeds) {
    for (const [seed, amount] of Object.entries(cost.seeds)) {
      if (inventory.seeds[seed as SeedType] < amount) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Deducts a cost from inventory
 *
 * @param inventory - Current inventory
 * @param cost - Cost to deduct
 * @returns Result with updated inventory or error
 */
export function deductCost(inventory: Inventory, cost: ResourceCost): ResourceOperationResult {
  // First check if can afford
  if (!canAffordCost(inventory, cost)) {
    return {
      success: false,
      error: new ResourceOperationError(
        'Cannot afford cost',
        ResourceOperationErrorCode.INSUFFICIENT_RESOURCES
      ),
    };
  }

  let currentInventory = inventory;

  // Deduct resources
  if (cost.resources) {
    for (const [resource, amount] of Object.entries(cost.resources)) {
      const result = removeResource(currentInventory, resource as Resource, amount);
      if (!result.success) {
        return result;
      }
      currentInventory = result.inventory;
    }
  }

  // Deduct currencies
  if (cost.currencies) {
    for (const [currency, amount] of Object.entries(cost.currencies)) {
      const result = removeCurrency(currentInventory, currency as Currency, amount);
      if (!result.success) {
        return result;
      }
      currentInventory = result.inventory;
    }
  }

  // Deduct seeds
  if (cost.seeds) {
    for (const [seed, amount] of Object.entries(cost.seeds)) {
      const result = removeSeed(currentInventory, seed as SeedType, amount);
      if (!result.success) {
        return result;
      }
      currentInventory = result.inventory;
    }
  }

  return {
    success: true,
    inventory: currentInventory,
  };
}

/**
 * Adds a reward to inventory
 *
 * @param inventory - Current inventory
 * @param reward - Reward to add
 * @returns Result with updated inventory or error
 */
export function addReward(inventory: Inventory, reward: ResourceReward): ResourceOperationResult {
  let currentInventory = inventory;

  // Add resources
  if (reward.resources) {
    for (const [resource, amount] of Object.entries(reward.resources)) {
      const result = addResource(currentInventory, resource as Resource, amount);
      if (!result.success) {
        return result;
      }
      currentInventory = result.inventory;
    }
  }

  // Add currencies
  if (reward.currencies) {
    for (const [currency, amount] of Object.entries(reward.currencies)) {
      const result = addCurrency(currentInventory, currency as Currency, amount);
      if (!result.success) {
        return result;
      }
      currentInventory = result.inventory;
    }
  }

  // Add seeds
  if (reward.seeds) {
    for (const [seed, amount] of Object.entries(reward.seeds)) {
      const result = addSeed(currentInventory, seed as SeedType, amount);
      if (!result.success) {
        return result;
      }
      currentInventory = result.inventory;
    }
  }

  // Add items (if any)
  if (reward.items && reward.items.length > 0) {
    currentInventory = {
      ...currentInventory,
      items: [...currentInventory.items, ...reward.items],
    };
  }

  return {
    success: true,
    inventory: currentInventory,
  };
}

/**
 * Checks if inventory is full
 *
 * @param inventory - Current inventory
 * @returns True if inventory is at capacity
 */
export function isInventoryFull(inventory: Inventory): boolean {
  return inventory.currentCount >= inventory.capacity;
}

/**
 * Gets the current inventory count
 *
 * @param inventory - Current inventory
 * @returns Current number of items in inventory
 */
export function getInventoryCount(inventory: Inventory): number {
  return inventory.currentCount;
}

/**
 * Adds an item to inventory
 *
 * @param inventory - Current inventory
 * @param item - Item to add
 * @returns Result with updated inventory or error
 */
export function addItem(inventory: Inventory, item: Item): ResourceOperationResult {
  // Items don't stack, so each counts as 1 toward capacity
  if (inventory.currentCount + 1 > inventory.capacity) {
    return {
      success: false,
      error: new ResourceOperationError(
        'Cannot add item: inventory full',
        ResourceOperationErrorCode.CAPACITY_EXCEEDED
      ),
    };
  }

  return {
    success: true,
    inventory: {
      ...inventory,
      items: [...inventory.items, item],
      currentCount: inventory.currentCount + 1,
    },
  };
}

/**
 * Removes an item from inventory by ID
 *
 * @param inventory - Current inventory
 * @param itemId - ID of item to remove
 * @returns Result with updated inventory or error
 */
export function removeItem(inventory: Inventory, itemId: string): ResourceOperationResult {
  const itemIndex = inventory.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return {
      success: false,
      error: new ResourceOperationError(
        `Item with ID ${itemId} not found in inventory`,
        ResourceOperationErrorCode.INSUFFICIENT_RESOURCES
      ),
    };
  }

  const newItems = [...inventory.items];
  newItems.splice(itemIndex, 1);

  return {
    success: true,
    inventory: {
      ...inventory,
      items: newItems,
      currentCount: inventory.currentCount - 1,
    },
  };
}

/**
 * Finds an item in inventory by ID
 *
 * @param inventory - Current inventory
 * @param itemId - ID of item to find
 * @returns Item if found, undefined otherwise
 */
export function getItem(inventory: Inventory, itemId: string): Item | undefined {
  return inventory.items.find((item) => item.id === itemId);
}

/**
 * Checks if inventory contains an item by ID
 *
 * @param inventory - Current inventory
 * @param itemId - ID of item to check
 * @returns True if item exists in inventory
 */
export function hasItem(inventory: Inventory, itemId: string): boolean {
  return inventory.items.some((item) => item.id === itemId);
}
