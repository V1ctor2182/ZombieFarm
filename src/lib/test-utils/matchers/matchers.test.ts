/**
 * Custom Matchers Tests
 */

import { customMatchers } from './matchers';
import { createTestInventory, createTestZombie, createTestGameState } from '../factories';
import { Resource, Currency, ZombieType, ZombieAIState, PlotState } from '../../../types';

// Register matchers for testing
beforeAll(() => {
  expect.extend(customMatchers);
});

describe('Custom Matchers', () => {
  describe('toHaveResource', () => {
    it('passes when inventory has resource', () => {
      const inventory = createTestInventory({
        resources: { [Resource.BONES]: 50 },
      });

      const result = customMatchers.toHaveResource(inventory, Resource.BONES);
      expect(result.pass).toBe(true);
    });

    it('fails when inventory missing resource', () => {
      const inventory = createTestInventory();

      const result = customMatchers.toHaveResource(inventory, Resource.BONES);
      expect(result.pass).toBe(false);
    });

    it('passes when resource amount matches', () => {
      const inventory = createTestInventory({
        resources: { [Resource.BONES]: 50 },
      });

      const result = customMatchers.toHaveResource(inventory, Resource.BONES, 50);
      expect(result.pass).toBe(true);
    });

    it('fails when resource amount differs', () => {
      const inventory = createTestInventory({
        resources: { [Resource.BONES]: 30 },
      });

      const result = customMatchers.toHaveResource(inventory, Resource.BONES, 50);
      expect(result.pass).toBe(false);
    });

    it('provides clear error message for missing resource', () => {
      const inventory = createTestInventory();

      const result = customMatchers.toHaveResource(inventory, Resource.BONES);
      expect(result.message()).toContain('missing');
    });

    it('provides clear error message for amount mismatch', () => {
      const inventory = createTestInventory({
        resources: { [Resource.BONES]: 30 },
      });

      const result = customMatchers.toHaveResource(inventory, Resource.BONES, 50);
      expect(result.message()).toContain('30');
    });
  });

  describe('toBeInState', () => {
    it('passes when state matches', () => {
      const zombie = createTestZombie({ aiState: ZombieAIState.ATTACKING });

      const result = customMatchers.toBeInState(zombie, ZombieAIState.ATTACKING);
      expect(result.pass).toBe(true);
    });

    it('fails when state differs', () => {
      const zombie = createTestZombie({ aiState: ZombieAIState.IDLE });

      const result = customMatchers.toBeInState(zombie, ZombieAIState.ATTACKING);
      expect(result.pass).toBe(false);
    });

    it('works with plot state', () => {
      const plot = { state: PlotState.EMPTY };

      const result = customMatchers.toBeInState(plot, PlotState.EMPTY);
      expect(result.pass).toBe(true);
    });

    it('provides clear error message', () => {
      const zombie = createTestZombie({ aiState: ZombieAIState.IDLE });

      const result = customMatchers.toBeInState(zombie, ZombieAIState.ATTACKING);
      expect(result.message()).toContain('idle');
      expect(result.message()).toContain('attacking');
    });
  });

  describe('toHaveZombie', () => {
    it('passes when zombie ID exists in active zombies', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: ['zombie-1', 'zombie-2'],
        } as any,
      });

      const result = customMatchers.toHaveZombie(gameState, 'zombie-1');
      expect(result.pass).toBe(true);
    });

    it('fails when zombie ID missing', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: ['zombie-2'],
        } as any,
      });

      const result = customMatchers.toHaveZombie(gameState, 'zombie-1');
      expect(result.pass).toBe(false);
    });

    it('works with farm state directly', () => {
      const farmState = { activeZombies: ['zombie-1'] };

      const result = customMatchers.toHaveZombie(farmState, 'zombie-1');
      expect(result.pass).toBe(true);
    });

    it('passes when checking for any zombie with properties', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: ['zombie-1'],
        } as any,
      });

      const result = customMatchers.toHaveZombie(gameState, { type: ZombieType.BRUTE });
      expect(result.pass).toBe(true);
    });

    it('fails when no zombies present', () => {
      const gameState = createTestGameState();

      const result = customMatchers.toHaveZombie(gameState, { type: ZombieType.BRUTE });
      expect(result.pass).toBe(false);
    });
  });

  describe('toHaveStats', () => {
    it('passes when all stats match', () => {
      const zombie = createTestZombie({ type: ZombieType.SHAMBLER });

      const result = customMatchers.toHaveStats(zombie, { maxHp: 100, attack: 15 });
      expect(result.pass).toBe(true);
    });

    it('fails when any stat differs', () => {
      const zombie = createTestZombie({ type: ZombieType.SHAMBLER });

      const result = customMatchers.toHaveStats(zombie, { maxHp: 200 });
      expect(result.pass).toBe(false);
    });

    it('passes when checking single stat', () => {
      const zombie = createTestZombie({ type: ZombieType.SHAMBLER });

      const result = customMatchers.toHaveStats(zombie, { maxHp: 100 });
      expect(result.pass).toBe(true);
    });

    it('provides detailed error message', () => {
      const zombie = createTestZombie({ type: ZombieType.SHAMBLER });

      const result = customMatchers.toHaveStats(zombie, { maxHp: 200, attack: 50 });
      expect(result.message()).toContain('maxHp');
      expect(result.message()).toContain('attack');
    });
  });

  describe('toHaveCurrency', () => {
    it('passes when currency amount sufficient', () => {
      const inventory = createTestInventory({
        currencies: { [Currency.DARK_COINS]: 100 },
      });

      const result = customMatchers.toHaveCurrency(inventory, Currency.DARK_COINS, 50);
      expect(result.pass).toBe(true);
    });

    it('passes when currency amount exact', () => {
      const inventory = createTestInventory({
        currencies: { [Currency.DARK_COINS]: 100 },
      });

      const result = customMatchers.toHaveCurrency(inventory, Currency.DARK_COINS, 100);
      expect(result.pass).toBe(true);
    });

    it('fails when currency insufficient', () => {
      const inventory = createTestInventory({
        currencies: { [Currency.DARK_COINS]: 50 },
      });

      const result = customMatchers.toHaveCurrency(inventory, Currency.DARK_COINS, 100);
      expect(result.pass).toBe(false);
    });

    it('fails when currency missing', () => {
      const inventory = createTestInventory({
        currencies: { [Currency.DARK_COINS]: 0 },
      });

      const result = customMatchers.toHaveCurrency(inventory, Currency.DARK_COINS, 1);
      expect(result.pass).toBe(false);
    });

    it('provides clear error message', () => {
      const inventory = createTestInventory({
        currencies: { [Currency.DARK_COINS]: 50 },
      });

      const result = customMatchers.toHaveCurrency(inventory, Currency.DARK_COINS, 100);
      expect(result.message()).toContain('50');
      expect(result.message()).toContain('100');
    });
  });

  describe('toBeHealthy', () => {
    it('passes when at full health', () => {
      const zombie = createTestZombie();

      const result = customMatchers.toBeHealthy(zombie);
      expect(result.pass).toBe(true);
    });

    it('passes when above threshold', () => {
      const zombie = createTestZombie();
      zombie.stats.currentHp = zombie.stats.maxHp * 0.95;

      const result = customMatchers.toBeHealthy(zombie, 0.9);
      expect(result.pass).toBe(true);
    });

    it('fails when below threshold', () => {
      const zombie = createTestZombie();
      zombie.stats.currentHp = zombie.stats.maxHp * 0.5;

      const result = customMatchers.toBeHealthy(zombie, 0.9);
      expect(result.pass).toBe(false);
    });

    it('uses 90% default threshold', () => {
      const zombie = createTestZombie();
      zombie.stats.currentHp = zombie.stats.maxHp * 0.85;

      const result = customMatchers.toBeHealthy(zombie);
      expect(result.pass).toBe(false);
    });

    it('provides HP percentage in message', () => {
      const zombie = createTestZombie();
      zombie.stats.currentHp = zombie.stats.maxHp * 0.5;

      const result = customMatchers.toBeHealthy(zombie);
      expect(result.message()).toContain('50');
    });
  });
});
