/**
 * Persistence Integration Tests
 *
 * End-to-end tests for save/load integration with game state.
 * Tests full workflows including state machines, events, and persistence.
 *
 * Per TESTING.md:
 * - Integration tests cover sequence of actions
 * - Test state machine integration
 * - Test event system integration
 * - Use AAA pattern
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { saveGame, loadGame, clearSaveData, hasSaveData } from '../../../lib/storage/saveLoad';
import { setupAutoSave, stopAutoSave, triggerAutoSave } from '../../../lib/storage/autoSave';
import { createTestGameState } from '../../../lib/test-utils/factories/gameStateFactory';
import { createTestZombie } from '../../../lib/test-utils/factories/zombieFactory';
import {
  mockLocalStorage,
  restoreLocalStorage,
} from '../../../lib/test-utils/mocks/mockLocalStorage';
import type { GameState } from '../../../types';
import { GameMode } from '../../../types';

describe('Persistence Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockLocalStorage();
  });

  afterEach(() => {
    stopAutoSave();
    clearSaveData();
    jest.useRealTimers();
    restoreLocalStorage();
  });

  describe('Complete Save/Load Workflow', () => {
    it('should save and restore complete game state', () => {
      // Arrange
      const originalState = createTestGameState({
        mode: GameMode.FARM,
        player: {
          id: 'integration-player',
          name: 'Integration Test',
          level: 15,
          xp: 5000,
        } as any,
      });

      // Act - save
      const saveResult = saveGame(originalState);
      expect(saveResult.success).toBe(true);

      // Act - load
      const loadResult = loadGame();

      // Assert
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data?.player.id).toBe('integration-player');
      expect(loadResult.data?.player.level).toBe(15);
      expect(loadResult.data?.mode).toBe(GameMode.FARM);
    });

    it('should preserve zombies across save/load', () => {
      // Arrange
      const zombie1 = createTestZombie({ id: 'zombie-1', type: 'shambler' });
      const zombie2 = createTestZombie({ id: 'zombie-2', type: 'runner' });
      const state = createTestGameState({
        farm: {
          zombies: [zombie1, zombie2],
        } as any,
      });

      // Act
      saveGame(state);
      const loaded = loadGame();

      // Assert
      expect(loaded.data?.farm.zombies).toHaveLength(2);
      expect(loaded.data?.farm.zombies[0].id).toBe('zombie-1');
      expect(loaded.data?.farm.zombies[1].id).toBe('runner');
    });

    it('should preserve inventory across save/load', () => {
      // Arrange
      const state = createTestGameState({
        inventory: {
          resources: {
            dark_coins: 1000,
            soul_essence: 50,
            rotten_wood: 200,
          },
          seeds: {
            shambler_seed: 10,
            runner_seed: 5,
          },
        } as any,
      });

      // Act
      saveGame(state);
      const loaded = loadGame();

      // Assert
      expect(loaded.data?.inventory.resources.dark_coins).toBe(1000);
      expect(loaded.data?.inventory.resources.soul_essence).toBe(50);
      expect(loaded.data?.inventory.seeds.shambler_seed).toBe(10);
    });

    it('should preserve time state across save/load', () => {
      // Arrange
      const now = Date.now();
      const state = createTestGameState({
        time: {
          currentTime: now,
          gameStartTime: now - 3600000,
          lastSaveTime: now,
          totalPlayTime: 3600000,
        } as any,
      });

      // Act
      saveGame(state);
      const loaded = loadGame();

      // Assert
      expect(loaded.data?.time.currentTime).toBe(now);
      expect(loaded.data?.time.totalPlayTime).toBe(3600000);
    });
  });

  describe('Auto-Save Integration', () => {
    it('should auto-save at intervals', () => {
      // Arrange
      let currentState = createTestGameState();
      const getState = () => currentState;
      setupAutoSave(getState, { enabled: true, intervalMs: 60000 });

      // Act - modify state and advance time
      currentState = {
        ...currentState,
        player: { ...currentState.player, xp: 1000 } as any,
      };
      jest.advanceTimersByTime(60000);

      // Assert - state should be saved
      const loaded = loadGame();
      expect(loaded.data?.player.xp).toBe(1000);
    });

    it('should handle state changes between auto-saves', () => {
      // Arrange
      let currentState = createTestGameState({ player: { xp: 0 } as any });
      const getState = () => currentState;
      setupAutoSave(getState, { enabled: true, intervalMs: 30000 });

      // Act - simulate gameplay with state changes
      jest.advanceTimersByTime(30000);
      currentState = { ...currentState, player: { ...currentState.player, xp: 100 } as any };

      jest.advanceTimersByTime(30000);
      currentState = { ...currentState, player: { ...currentState.player, xp: 250 } as any };

      jest.advanceTimersByTime(30000);

      // Assert - latest state should be saved
      const loaded = loadGame();
      expect(loaded.data?.player.xp).toBe(250);
    });

    it('should trigger manual save on significant events', () => {
      // Arrange
      let currentState = createTestGameState({ player: { level: 1 } as any });
      const getState = () => currentState;
      setupAutoSave(getState, { enabled: true });

      // Act - simulate level up (significant event)
      currentState = { ...currentState, player: { ...currentState.player, level: 2 } as any };
      triggerAutoSave();

      // Assert
      const loaded = loadGame();
      expect(loaded.data?.player.level).toBe(2);
    });

    it('should handle save errors without crashing', () => {
      // Arrange
      const getState = () => {
        throw new Error('State error');
      };
      const onError = jest.fn();
      setupAutoSave(getState, { enabled: true, intervalMs: 30000, onError });

      // Act - advance time to trigger save
      jest.advanceTimersByTime(30000);

      // Assert - error callback should be called
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Multiple Save Slots (Future Feature)', () => {
    it('should support checking for save existence', () => {
      // Arrange - no save initially
      expect(hasSaveData()).toBe(false);

      // Act - create save
      saveGame(createTestGameState());

      // Assert
      expect(hasSaveData()).toBe(true);
    });

    it('should allow clearing and recreating saves', () => {
      // Arrange
      const state1 = createTestGameState({ player: { id: 'player1' } as any });
      saveGame(state1);

      // Act - clear and create new save
      clearSaveData();
      const state2 = createTestGameState({ player: { id: 'player2' } as any });
      saveGame(state2);

      // Assert
      const loaded = loadGame();
      expect(loaded.data?.player.id).toBe('player2');
    });
  });

  describe('State Consistency', () => {
    it('should maintain referential integrity of IDs', () => {
      // Arrange
      const zombieId = 'test-zombie-123';
      const state = createTestGameState({
        farm: {
          zombies: [createTestZombie({ id: zombieId })],
        } as any,
        combat: {
          squad: [zombieId], // References same zombie
        } as any,
      });

      // Act
      saveGame(state);
      const loaded = loadGame();

      // Assert
      expect(loaded.data?.farm.zombies[0].id).toBe(zombieId);
      expect(loaded.data?.combat.squad[0]).toBe(zombieId);
    });

    it('should preserve enum values correctly', () => {
      // Arrange
      const state = createTestGameState({
        mode: GameMode.COMBAT,
        time: {
          dayNightCycle: {
            currentPhase: 'night',
          },
        } as any,
      });

      // Act
      saveGame(state);
      const loaded = loadGame();

      // Assert
      expect(loaded.data?.mode).toBe(GameMode.COMBAT);
      expect(loaded.data?.time.dayNightCycle.currentPhase).toBe('night');
    });

    it('should handle nested arrays and objects', () => {
      // Arrange
      const state = createTestGameState({
        farm: {
          buildings: [
            {
              id: 'building-1',
              upgrades: ['speed', 'capacity'],
              production: { rate: 10, output: 'rotten_wood' },
            },
          ],
        } as any,
      });

      // Act
      saveGame(state);
      const loaded = loadGame();

      // Assert
      expect(loaded.data?.farm.buildings[0].upgrades).toEqual(['speed', 'capacity']);
      expect(loaded.data?.farm.buildings[0].production.rate).toBe(10);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large save files efficiently', () => {
      // Arrange - create large state
      const largeZombieArray = Array(500)
        .fill(null)
        .map((_, i) => createTestZombie({ id: `zombie-${i}` }));
      const state = createTestGameState({
        farm: { zombies: largeZombieArray } as any,
      });

      // Act
      const start = Date.now();
      saveGame(state);
      const saveTime = Date.now() - start;

      const loadStart = Date.now();
      const loaded = loadGame();
      const loadTime = Date.now() - loadStart;

      // Assert - should complete in reasonable time (< 100ms each)
      expect(saveTime).toBeLessThan(100);
      expect(loadTime).toBeLessThan(100);
      expect(loaded.data?.farm.zombies).toHaveLength(500);
    });

    it('should recover from corrupted auto-save', () => {
      // Arrange
      let saveCount = 0;
      const getState = () => {
        saveCount++;
        if (saveCount === 2) {
          // Corrupt the save on second attempt
          localStorage.setItem('zombiefarm_save', 'corrupted');
        }
        return createTestGameState({ player: { xp: saveCount * 100 } as any });
      };

      const onError = jest.fn();
      setupAutoSave(getState, { enabled: true, intervalMs: 30000, onError });

      // Act - trigger multiple saves
      jest.advanceTimersByTime(30000); // First save succeeds
      jest.advanceTimersByTime(30000); // Second save corrupts
      jest.advanceTimersByTime(30000); // Third save should still work

      // Assert - system should recover
      const loaded = loadGame();
      expect(loaded.data?.player.xp).toBe(300); // Latest save
    });

    it('should handle rapid save/load cycles', () => {
      // Arrange & Act
      for (let i = 0; i < 10; i++) {
        const state = createTestGameState({ player: { xp: i * 10 } as any });
        saveGame(state);
        const loaded = loadGame();
        expect(loaded.data?.player.xp).toBe(i * 10);
      }

      // Assert - final state
      const final = loadGame();
      expect(final.data?.player.xp).toBe(90);
    });
  });

  describe('Error Recovery', () => {
    it('should provide meaningful error when save fails', () => {
      // Arrange
      const state = createTestGameState();
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError');
      };

      // Act
      const result = saveGame(state);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('quota');

      // Cleanup
      localStorage.setItem = originalSetItem;
    });

    it('should continue auto-saving after single failure', () => {
      // Arrange
      let failCount = 0;
      const getState = () => {
        failCount++;
        if (failCount === 2) {
          throw new Error('Temporary failure');
        }
        return createTestGameState({ player: { xp: failCount * 100 } as any });
      };

      const onError = jest.fn();
      setupAutoSave(getState, { enabled: true, intervalMs: 30000, onError });

      // Act
      jest.advanceTimersByTime(30000); // Save 1: succeeds
      jest.advanceTimersByTime(30000); // Save 2: fails
      jest.advanceTimersByTime(30000); // Save 3: succeeds

      // Assert
      expect(onError).toHaveBeenCalledTimes(1);
      const loaded = loadGame();
      expect(loaded.data?.player.xp).toBe(300); // Latest successful save
    });
  });
});
