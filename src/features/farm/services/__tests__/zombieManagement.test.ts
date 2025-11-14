/**
 * Zombie Management Service - Unit Tests
 *
 * Tests active zombie management system per DOMAIN-FARM.md:
 * - Active zombie capacity (starts at 10, expandable)
 * - Crypt storage overflow handling
 * - Deploy/store zombies
 * - Capacity checks and validation
 *
 * Authority: DOMAIN-FARM.md Section "Capacity and the Crypt"
 */

import type { FarmState, Zombie } from '../../../../types/farm';
import type { GameState } from '../../../../types/global';
import { createTestZombie } from '../../../../lib/test-utils/factories/zombieFactory';
import { createTestFarmState } from '../../../../lib/test-utils/factories/farmStateFactory';
import { createTestGameState } from '../../../../lib/test-utils/factories/gameStateFactory';

// Import functions to test (will be implemented)
import {
  canAddToActiveRoster,
  shouldSendToCrypt,
  deployFromCrypt,
  sendToCrypt,
  increaseCapacity,
  getAvailableCapacity,
} from '../zombieManagement';

describe('zombieManagement', () => {
  describe('getAvailableCapacity', () => {
    it('should return correct available capacity', () => {
      const farmState = createTestFarmState({
        activeZombies: [createTestZombie(), createTestZombie()],
        activeZombieCapacity: 10,
      });

      const result = getAvailableCapacity(farmState);

      expect(result).toBe(8); // 10 - 2 = 8
    });

    it('should return 0 when at capacity', () => {
      const farmState = createTestFarmState({
        activeZombies: Array.from({ length: 10 }, () => createTestZombie()),
        activeZombieCapacity: 10,
      });

      const result = getAvailableCapacity(farmState);

      expect(result).toBe(0);
    });

    it('should return capacity when no active zombies', () => {
      const farmState = createTestFarmState({
        activeZombies: [],
        activeZombieCapacity: 10,
      });

      const result = getAvailableCapacity(farmState);

      expect(result).toBe(10);
    });
  });

  describe('canAddToActiveRoster', () => {
    it('should return true when under capacity', () => {
      const farmState = createTestFarmState({
        activeZombies: [createTestZombie()],
        activeZombieCapacity: 10,
      });

      const result = canAddToActiveRoster(farmState);

      expect(result).toBe(true);
    });

    it('should return false when at capacity', () => {
      const farmState = createTestFarmState({
        activeZombies: Array.from({ length: 10 }, () => createTestZombie()),
        activeZombieCapacity: 10,
      });

      const result = canAddToActiveRoster(farmState);

      expect(result).toBe(false);
    });

    it('should return false when over capacity (edge case)', () => {
      const farmState = createTestFarmState({
        activeZombies: Array.from({ length: 12 }, () => createTestZombie()),
        activeZombieCapacity: 10,
      });

      const result = canAddToActiveRoster(farmState);

      expect(result).toBe(false);
    });
  });

  describe('shouldSendToCrypt', () => {
    it('should return true when at capacity', () => {
      const farmState = createTestFarmState({
        activeZombies: Array.from({ length: 10 }, () => createTestZombie()),
        activeZombieCapacity: 10,
      });

      const result = shouldSendToCrypt(farmState);

      expect(result).toBe(true);
    });

    it('should return false when under capacity', () => {
      const farmState = createTestFarmState({
        activeZombies: [createTestZombie()],
        activeZombieCapacity: 10,
      });

      const result = shouldSendToCrypt(farmState);

      expect(result).toBe(false);
    });
  });

  describe('sendToCrypt', () => {
    it('should move zombie from active roster to Crypt', () => {
      const zombie = createTestZombie({ id: 'zombie-1' });
      const farmState = createTestFarmState({
        activeZombies: [zombie],
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      const result = sendToCrypt(farmState, 'zombie-1');

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.activeZombies).toHaveLength(0);
      expect(result.data.cryptZombies).toHaveLength(1);
      expect(result.data.cryptZombies[0].id).toBe('zombie-1');
    });

    it('should fail when zombie not found in active roster', () => {
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [],
      });

      const result = sendToCrypt(farmState, 'zombie-not-found');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('not found');
    });

    it('should not mutate original farm state', () => {
      const zombie = createTestZombie({ id: 'zombie-1' });
      const farmState = createTestFarmState({
        activeZombies: [zombie],
        cryptZombies: [],
      });

      const originalActiveCount = farmState.activeZombies.length;
      const originalCryptCount = farmState.cryptZombies.length;

      sendToCrypt(farmState, 'zombie-1');

      expect(farmState.activeZombies).toHaveLength(originalActiveCount);
      expect(farmState.cryptZombies).toHaveLength(originalCryptCount);
    });

    it('should reset zombie position when sent to Crypt', () => {
      const zombie = createTestZombie({
        id: 'zombie-1',
        position: { x: 10, y: 15 },
      });
      const farmState = createTestFarmState({
        activeZombies: [zombie],
        cryptZombies: [],
      });

      const result = sendToCrypt(farmState, 'zombie-1');

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.cryptZombies[0].position).toBeNull();
    });

    it('should reset zombie AI state to IDLE when sent to Crypt', () => {
      const zombie = createTestZombie({
        id: 'zombie-1',
        aiState: 'wandering',
      });
      const farmState = createTestFarmState({
        activeZombies: [zombie],
        cryptZombies: [],
      });

      const result = sendToCrypt(farmState, 'zombie-1');

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.cryptZombies[0].aiState).toBe('idle');
    });
  });

  describe('deployFromCrypt', () => {
    it('should move zombie from Crypt to active roster when under capacity', () => {
      const zombie = createTestZombie({ id: 'zombie-1', position: null });
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [zombie],
        activeZombieCapacity: 10,
      });

      const result = deployFromCrypt(farmState, 'zombie-1');

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.activeZombies).toHaveLength(1);
      expect(result.data.cryptZombies).toHaveLength(0);
      expect(result.data.activeZombies[0].id).toBe('zombie-1');
    });

    it('should fail when at capacity', () => {
      const cryptZombie = createTestZombie({ id: 'zombie-crypt' });
      const farmState = createTestFarmState({
        activeZombies: Array.from({ length: 10 }, () => createTestZombie()),
        cryptZombies: [cryptZombie],
        activeZombieCapacity: 10,
      });

      const result = deployFromCrypt(farmState, 'zombie-crypt');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('capacity');
    });

    it('should fail when zombie not found in Crypt', () => {
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [],
      });

      const result = deployFromCrypt(farmState, 'zombie-not-found');

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('not found');
    });

    it('should not mutate original farm state', () => {
      const zombie = createTestZombie({ id: 'zombie-1' });
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [zombie],
        activeZombieCapacity: 10,
      });

      const originalActiveCount = farmState.activeZombies.length;
      const originalCryptCount = farmState.cryptZombies.length;

      deployFromCrypt(farmState, 'zombie-1');

      expect(farmState.activeZombies).toHaveLength(originalActiveCount);
      expect(farmState.cryptZombies).toHaveLength(originalCryptCount);
    });

    it('should set default position when deploying from Crypt', () => {
      const zombie = createTestZombie({ id: 'zombie-1', position: null });
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [zombie],
        activeZombieCapacity: 10,
      });

      const result = deployFromCrypt(farmState, 'zombie-1');

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.activeZombies[0].position).not.toBeNull();
      expect(result.data.activeZombies[0].position?.x).toBeGreaterThanOrEqual(0);
      expect(result.data.activeZombies[0].position?.y).toBeGreaterThanOrEqual(0);
    });

    it('should set AI state to IDLE when deploying from Crypt', () => {
      const zombie = createTestZombie({ id: 'zombie-1', position: null });
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [zombie],
        activeZombieCapacity: 10,
      });

      const result = deployFromCrypt(farmState, 'zombie-1');

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.activeZombies[0].aiState).toBe('idle');
    });
  });

  describe('increaseCapacity', () => {
    it('should increase active zombie capacity by specified amount', () => {
      const farmState = createTestFarmState({
        activeZombieCapacity: 10,
      });

      const result = increaseCapacity(farmState, 5);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.activeZombieCapacity).toBe(15);
    });

    it('should fail with negative increase amount', () => {
      const farmState = createTestFarmState({
        activeZombieCapacity: 10,
      });

      const result = increaseCapacity(farmState, -5);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('positive');
    });

    it('should fail with zero increase amount', () => {
      const farmState = createTestFarmState({
        activeZombieCapacity: 10,
      });

      const result = increaseCapacity(farmState, 0);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('positive');
    });

    it('should not exceed maximum capacity (100)', () => {
      const farmState = createTestFarmState({
        activeZombieCapacity: 95,
      });

      const result = increaseCapacity(farmState, 10);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.activeZombieCapacity).toBe(100);
    });

    it('should not mutate original farm state', () => {
      const farmState = createTestFarmState({
        activeZombieCapacity: 10,
      });

      const originalCapacity = farmState.activeZombieCapacity;

      increaseCapacity(farmState, 5);

      expect(farmState.activeZombieCapacity).toBe(originalCapacity);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty active roster', () => {
      const farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      expect(canAddToActiveRoster(farmState)).toBe(true);
      expect(getAvailableCapacity(farmState)).toBe(10);
    });

    it('should handle empty Crypt', () => {
      const farmState = createTestFarmState({
        activeZombies: [createTestZombie()],
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      const result = deployFromCrypt(farmState, 'zombie-not-found');

      expect(result.success).toBe(false);
    });

    it('should handle capacity of 1', () => {
      const farmState = createTestFarmState({
        activeZombies: [],
        activeZombieCapacity: 1,
      });

      expect(canAddToActiveRoster(farmState)).toBe(true);

      const zombie = createTestZombie({ id: 'zombie-1' });
      const withZombie = createTestFarmState({
        activeZombies: [zombie],
        activeZombieCapacity: 1,
      });

      expect(canAddToActiveRoster(withZombie)).toBe(false);
    });

    it('should handle maximum capacity (100)', () => {
      const farmState = createTestFarmState({
        activeZombies: Array.from({ length: 100 }, () => createTestZombie()),
        activeZombieCapacity: 100,
      });

      expect(canAddToActiveRoster(farmState)).toBe(false);
      expect(getAvailableCapacity(farmState)).toBe(0);
    });
  });
});
