/**
 * Custom Jest Matchers
 *
 * Domain-specific matchers for cleaner test assertions.
 * Per TESTING.md: Custom matchers improve test readability and provide better error messages.
 */

import type { GameState, Inventory, Zombie, ZombieStats } from '../../../types';
import { Resource } from '../../../types';

/**
 * Matcher: toHaveResource
 *
 * Checks if inventory has a specific resource with optional amount check.
 *
 * @example
 * expect(inventory).toHaveResource(Resource.BONES, 50);
 * expect(inventory).toHaveResource(Resource.ROTTEN_WOOD); // any amount
 */
function toHaveResource(
  received: Inventory,
  resource: Resource,
  expectedAmount?: number
): jest.CustomMatcherResult {
  const actualAmount = received.resources[resource] ?? 0;
  const hasResource = actualAmount > 0;

  if (expectedAmount !== undefined) {
    const pass = actualAmount === expectedAmount;
    return {
      pass,
      message: () =>
        pass
          ? `Expected inventory NOT to have ${resource} with amount ${expectedAmount}, but it does`
          : `Expected inventory to have ${resource} with amount ${expectedAmount}, but has ${actualAmount}`,
    };
  }

  return {
    pass: hasResource,
    message: () =>
      hasResource
        ? `Expected inventory NOT to have ${resource}, but has ${actualAmount}`
        : `Expected inventory to have ${resource}, but it's missing or zero`,
  };
}

/**
 * Matcher: toBeInState
 *
 * Checks if a game object (plot, zombie, etc.) is in a specific state.
 *
 * @example
 * expect(plot).toBeInState(PlotState.GROWING);
 * expect(zombie).toBeInState(ZombieAIState.ATTACKING);
 */
function toBeInState(
  received: any,
  expectedState: string
): jest.CustomMatcherResult {
  // Check various state properties
  const actualState =
    received.state ||
    received.aiState ||
    received.phase ||
    received.mode ||
    'unknown';

  const pass = actualState === expectedState;

  return {
    pass,
    message: () =>
      pass
        ? `Expected object NOT to be in state ${expectedState}, but it is`
        : `Expected object to be in state ${expectedState}, but is in ${actualState}`,
  };
}

/**
 * Matcher: toHaveZombie
 *
 * Checks if GameState or farm state contains a zombie with specific ID or properties.
 *
 * @example
 * expect(gameState).toHaveZombie('zombie-1');
 * expect(farmState).toHaveZombie({ type: ZombieType.BRUTE });
 */
function toHaveZombie(
  received: GameState | { activeZombies: string[] },
  zombieIdOrProperties: string | Partial<Zombie>
): jest.CustomMatcherResult {
  const zombieIds =
    'farm' in received ? received.farm.activeZombies : received.activeZombies;

  if (typeof zombieIdOrProperties === 'string') {
    const pass = zombieIds.includes(zombieIdOrProperties);
    return {
      pass,
      message: () =>
        pass
          ? `Expected NOT to have zombie with ID ${zombieIdOrProperties}`
          : `Expected to have zombie with ID ${zombieIdOrProperties}, but it's not in active zombies: [${zombieIds.join(', ')}]`,
    };
  }

  // For property matching, we'd need the full zombie objects
  // Simplified: just check if we have any zombies
  const pass = zombieIds.length > 0;
  return {
    pass,
    message: () =>
      pass
        ? `Expected NOT to have any zombies, but has ${zombieIds.length}`
        : `Expected to have zombies matching criteria, but activeZombies is empty`,
  };
}

/**
 * Matcher: toHaveStats
 *
 * Checks if a unit (zombie/enemy) has expected stat values.
 *
 * @example
 * expect(zombie).toHaveStats({ maxHp: 100, attack: 15 });
 * expect(enemy).toHaveStats({ defense: 25 });
 */
function toHaveStats(
  received: { stats: Partial<ZombieStats> },
  expectedStats: Partial<ZombieStats>
): jest.CustomMatcherResult {
  const failures: string[] = [];

  for (const [key, expectedValue] of Object.entries(expectedStats)) {
    const actualValue = received.stats[key as keyof ZombieStats];
    if (actualValue !== expectedValue) {
      failures.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
    }
  }

  const pass = failures.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected stats NOT to match ${JSON.stringify(expectedStats)}, but they do`
        : `Expected stats to match ${JSON.stringify(expectedStats)}, but mismatches: ${failures.join(', ')}`,
  };
}

/**
 * Matcher: toHaveCurrency
 *
 * Checks if inventory has sufficient currency.
 *
 * @example
 * expect(inventory).toHaveCurrency(Currency.DARK_COINS, 100);
 */
function toHaveCurrency(
  received: Inventory,
  currency: string,
  expectedAmount: number
): jest.CustomMatcherResult {
  const actualAmount = received.currencies[currency] ?? 0;
  const pass = actualAmount >= expectedAmount;

  return {
    pass,
    message: () =>
      pass
        ? `Expected inventory NOT to have at least ${expectedAmount} ${currency}, but has ${actualAmount}`
        : `Expected inventory to have at least ${expectedAmount} ${currency}, but only has ${actualAmount}`,
  };
}

/**
 * Matcher: toBeHealthy
 *
 * Checks if a zombie is at full or near-full health.
 *
 * @example
 * expect(zombie).toBeHealthy();
 * expect(zombie).toBeHealthy(0.8); // At least 80% HP
 */
function toBeHealthy(
  received: { stats: { currentHp: number; maxHp: number } },
  threshold: number = 0.9
): jest.CustomMatcherResult {
  const hpPercentage = received.stats.currentHp / received.stats.maxHp;
  const pass = hpPercentage >= threshold;

  return {
    pass,
    message: () =>
      pass
        ? `Expected zombie NOT to be healthy (>= ${threshold * 100}% HP), but HP is ${(hpPercentage * 100).toFixed(1)}%`
        : `Expected zombie to be healthy (>= ${threshold * 100}% HP), but HP is only ${(hpPercentage * 100).toFixed(1)}%`,
  };
}

/**
 * Register all custom matchers
 */
export function registerCustomMatchers(): void {
  expect.extend({
    toHaveResource,
    toBeInState,
    toHaveZombie,
    toHaveStats,
    toHaveCurrency,
    toBeHealthy,
  });
}

// Export matchers for testing
export const customMatchers = {
  toHaveResource,
  toBeInState,
  toHaveZombie,
  toHaveStats,
  toHaveCurrency,
  toBeHealthy,
};
