/**
 * Save/Load System Tests
 *
 * Comprehensive test suite for game state persistence using localStorage.
 * Tests cover saving, loading, validation, corruption handling, and versioning.
 *
 * Per TESTING.md:
 * - Test serialization/deserialization
 * - Test localStorage integration
 * - Test error handling and recovery
 * - Test version migration
 * - Use AAA pattern (Arrange, Act, Assert)
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  saveGame,
  loadGame,
  validateSaveData,
  migrateSaveData,
  clearSaveData,
  hasSaveData,
  getSaveMetadata,
  SaveLoadError,
  SaveLoadErrorCode,
} from '../saveLoad';
import type { GameState } from '../../../types';
import { createTestGameState } from '../../test-utils/factories/gameStateFactory';
import {
  mockLocalStorage,
  restoreLocalStorage,
  clearMockStorage,
} from '../../test-utils/mocks/mockLocalStorage';

describe('saveLoad', () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  afterEach(() => {
    restoreLocalStorage();
  });

  describe('saveGame', () => {
    it('should serialize and save game state to localStorage', () => {
      // Arrange
      const gameState = createTestGameState({
        player: { id: 'test-player', name: 'Test Necromancer', level: 5 } as any,
      });

      // Act
      const result = saveGame(gameState);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      const savedData = localStorage.getItem('zombiefarm_save');
      expect(savedData).not.toBeNull();
      expect(savedData).toContain('test-player');
      expect(savedData).toContain('Test Necromancer');
    });

    it('should update save metadata on save', () => {
      // Arrange
      const gameState = createTestGameState();

      // Act
      const result = saveGame(gameState);

      // Assert
      expect(result.success).toBe(true);
      const savedData = JSON.parse(localStorage.getItem('zombiefarm_save')!);
      expect(savedData.meta.version).toBeDefined();
      expect(savedData.meta.lastSaved).toBeGreaterThan(0);
      expect(savedData.meta.saveCount).toBeGreaterThanOrEqual(1);
    });

    it('should increment save count on each save', () => {
      // Arrange
      const gameState = createTestGameState();

      // Act
      saveGame(gameState);
      const firstSave = JSON.parse(localStorage.getItem('zombiefarm_save')!);
      saveGame(gameState);
      const secondSave = JSON.parse(localStorage.getItem('zombiefarm_save')!);

      // Assert
      expect(secondSave.meta.saveCount).toBe(firstSave.meta.saveCount + 1);
    });

    it('should handle saving with complex nested state', () => {
      // Arrange
      const gameState = createTestGameState({
        farm: {
          plots: Array(20)
            .fill(null)
            .map((_, i) => ({
              id: `plot-${i}`,
              position: { x: i % 5, y: Math.floor(i / 5) },
              state: 'empty' as const,
              crop: null,
            })),
          zombies: [],
          buildings: [],
          capacity: { maxZombies: 10, maxPlots: 20 },
        } as any,
      });

      // Act
      const result = saveGame(gameState);

      // Assert
      expect(result.success).toBe(true);
      const savedData = JSON.parse(localStorage.getItem('zombiefarm_save')!);
      expect(savedData.state.farm.plots).toHaveLength(20);
    });

    it('should return error when localStorage is full', () => {
      // Arrange
      const gameState = createTestGameState();
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError');
      };

      // Act
      const result = saveGame(gameState);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(SaveLoadErrorCode.STORAGE_FULL);

      // Cleanup
      localStorage.setItem = originalSetItem;
    });

    it('should handle serialization errors gracefully', () => {
      // Arrange
      const gameState = createTestGameState();
      // Create circular reference to cause serialization error
      (gameState as any).circular = gameState;

      // Act
      const result = saveGame(gameState);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(SaveLoadErrorCode.SERIALIZATION_ERROR);
    });
  });

  describe('loadGame', () => {
    it('should load and deserialize game state from localStorage', () => {
      // Arrange
      const originalState = createTestGameState({
        player: { id: 'load-test', name: 'Load Test Player', level: 10 } as any,
      });
      saveGame(originalState);

      // Act
      const result = loadGame();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.player.id).toBe('load-test');
      expect(result.data?.player.name).toBe('Load Test Player');
      expect(result.data?.player.level).toBe(10);
    });

    it('should return error when no save data exists', () => {
      // Act
      const result = loadGame();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(SaveLoadErrorCode.NO_SAVE_FOUND);
    });

    it('should handle corrupted JSON gracefully', () => {
      // Arrange
      localStorage.setItem('zombiefarm_save', '{invalid json data}');

      // Act
      const result = loadGame();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(SaveLoadErrorCode.INVALID_JSON);
    });

    it('should handle incomplete save data', () => {
      // Arrange
      localStorage.setItem('zombiefarm_save', JSON.stringify({ player: {} }));

      // Act
      const result = loadGame();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(SaveLoadErrorCode.INVALID_STRUCTURE);
    });

    it('should restore complex nested state correctly', () => {
      // Arrange
      const originalState = createTestGameState({
        farm: {
          plots: [
            { id: 'plot-1', position: { x: 0, y: 0 }, state: 'planted' as const },
            { id: 'plot-2', position: { x: 1, y: 0 }, state: 'growing' as const },
          ],
        } as any,
      });
      saveGame(originalState);

      // Act
      const result = loadGame();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.farm.plots).toHaveLength(2);
      expect(result.data?.farm.plots[0].state).toBe('planted');
      expect(result.data?.farm.plots[1].state).toBe('growing');
    });
  });

  describe('validateSaveData', () => {
    it('should validate correct save data structure', () => {
      // Arrange
      const validData = createTestGameState();

      // Act
      const result = validateSaveData(validData);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data missing required player fields', () => {
      // Arrange
      const invalidData = { player: {}, farm: {}, combat: {}, inventory: {}, time: {} } as any;

      // Act
      const result = validateSaveData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('Player'))).toBe(true);
    });

    it('should reject data with invalid types', () => {
      // Arrange
      const invalidData = createTestGameState();
      (invalidData.player as any).level = 'not a number';

      // Act
      const result = validateSaveData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('level'))).toBe(true);
    });

    it('should validate nested structures', () => {
      // Arrange
      const data = createTestGameState();
      (data.farm as any).plots = 'not an array';

      // Act
      const result = validateSaveData(data);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('plots'))).toBe(true);
    });

    it('should accept data with optional fields missing', () => {
      // Arrange
      const data = createTestGameState();
      data.player.achievements = [];

      // Act
      const result = validateSaveData(data);

      // Assert
      expect(result.valid).toBe(true);
    });
  });

  describe('migrateSaveData', () => {
    it('should keep current version data unchanged', () => {
      // Arrange
      const currentData = createTestGameState();

      // Act
      const migrated = migrateSaveData(currentData, '1.0.0');

      // Assert
      expect(migrated).toEqual(currentData);
    });

    it('should migrate from v0.9.0 to v1.0.0', () => {
      // Arrange
      const oldData = {
        ...createTestGameState(),
        meta: { version: '0.9.0', lastSaved: Date.now() },
      } as any;

      // Act
      const migrated = migrateSaveData(oldData, '0.9.0');

      // Assert
      expect(migrated.meta.version).toBe('1.0.0');
      // Additional migration assertions would go here
    });

    it('should handle multiple version migrations', () => {
      // Arrange
      const oldData = {
        ...createTestGameState(),
        meta: { version: '0.8.0', lastSaved: Date.now() },
      } as any;

      // Act
      const migrated = migrateSaveData(oldData, '0.8.0');

      // Assert
      expect(migrated.meta.version).toBe('1.0.0');
    });

    it('should preserve data during migration', () => {
      // Arrange
      const oldData = createTestGameState({
        player: { id: 'migrate-test', name: 'Migration Test' } as any,
      });

      // Act
      const migrated = migrateSaveData(oldData, '0.9.0');

      // Assert
      expect(migrated.player.id).toBe('migrate-test');
      expect(migrated.player.name).toBe('Migration Test');
    });

    it('should add default values for new fields', () => {
      // Arrange
      const oldData = createTestGameState();
      delete (oldData.player as any).stats;

      // Act
      const migrated = migrateSaveData(oldData, '0.9.0');

      // Assert
      expect(migrated.player.stats).toBeDefined();
      expect(migrated.player.stats.totalZombiesHarvested).toBe(0);
    });
  });

  describe('clearSaveData', () => {
    it('should remove save data from localStorage', () => {
      // Arrange
      saveGame(createTestGameState());
      expect(localStorage.getItem('zombiefarm_save')).not.toBeNull();

      // Act
      clearSaveData();

      // Assert
      expect(localStorage.getItem('zombiefarm_save')).toBeNull();
    });

    it('should not throw if no save data exists', () => {
      // Act & Assert
      expect(() => clearSaveData()).not.toThrow();
    });
  });

  describe('hasSaveData', () => {
    it('should return true when save data exists', () => {
      // Arrange
      saveGame(createTestGameState());

      // Act
      const result = hasSaveData();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no save data exists', () => {
      // Act
      const result = hasSaveData();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when save data is corrupted', () => {
      // Arrange
      localStorage.setItem('zombiefarm_save', 'corrupted');

      // Act
      const result = hasSaveData();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getSaveMetadata', () => {
    it('should return metadata from save file', () => {
      // Arrange
      const gameState = createTestGameState();
      saveGame(gameState);

      // Act
      const metadata = getSaveMetadata();

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata?.version).toBeDefined();
      expect(metadata?.lastSaved).toBeGreaterThan(0);
      expect(metadata?.saveCount).toBeGreaterThanOrEqual(1);
    });

    it('should return null when no save exists', () => {
      // Act
      const metadata = getSaveMetadata();

      // Assert
      expect(metadata).toBeNull();
    });

    it('should return null when save is corrupted', () => {
      // Arrange
      localStorage.setItem('zombiefarm_save', 'invalid');

      // Act
      const metadata = getSaveMetadata();

      // Assert
      expect(metadata).toBeNull();
    });
  });

  describe('SaveLoadError', () => {
    it('should create error with correct properties', () => {
      // Act
      const error = new SaveLoadError('Test error message', SaveLoadErrorCode.INVALID_JSON);

      // Assert
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe(SaveLoadErrorCode.INVALID_JSON);
      expect(error.name).toBe('SaveLoadError');
    });

    it('should be instance of Error', () => {
      // Act
      const error = new SaveLoadError('Test', SaveLoadErrorCode.NO_SAVE_FOUND);

      // Assert
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large save files', () => {
      // Arrange
      const largeState = createTestGameState({
        farm: {
          zombies: Array(1000)
            .fill(null)
            .map((_, i) => ({
              id: `zombie-${i}`,
              type: 'shambler',
              stats: { hp: 100, attack: 10, defense: 5 },
            })),
        } as any,
      });

      // Act
      const saveResult = saveGame(largeState);
      const loadResult = loadGame();

      // Assert
      expect(saveResult.success).toBe(true);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data?.farm.zombies).toHaveLength(1000);
    });

    it('should handle unicode characters in player name', () => {
      // Arrange
      const state = createTestGameState({
        player: { name: '🧟‍♂️ Zombie Master 死霊術師' } as any,
      });

      // Act
      saveGame(state);
      const result = loadGame();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.player.name).toBe('🧟‍♂️ Zombie Master 死霊術師');
    });

    it('should handle empty arrays and objects', () => {
      // Arrange
      const state = createTestGameState({
        farm: { zombies: [], buildings: [], plots: [] } as any,
      });

      // Act
      saveGame(state);
      const result = loadGame();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.farm.zombies).toEqual([]);
    });

    it('should preserve timestamp precision', () => {
      // Arrange
      const timestamp = Date.now();
      const state = createTestGameState({
        time: { currentTime: timestamp } as any,
      });

      // Act
      saveGame(state);
      const result = loadGame();

      // Assert
      expect(result.data?.time.currentTime).toBe(timestamp);
    });
  });
});
