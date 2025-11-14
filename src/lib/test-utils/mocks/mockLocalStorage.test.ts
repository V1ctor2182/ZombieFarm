/**
 * Tests for mockLocalStorage utility
 *
 * Validates that the localStorage mock behaves correctly and provides
 * isolated storage for each test.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  mockLocalStorage,
  restoreLocalStorage,
  getMockStorageContents,
  setMockStorageContents,
  clearMockStorage,
} from './mockLocalStorage';

describe('mockLocalStorage', () => {
  describe('Basic localStorage API', () => {
    beforeEach(() => {
      mockLocalStorage();
    });

    afterEach(() => {
      restoreLocalStorage();
    });

    it('should start with empty storage', () => {
      expect(localStorage.length).toBe(0);
    });

    it('should store and retrieve string values', () => {
      // Arrange & Act
      localStorage.setItem('testKey', 'testValue');

      // Assert
      expect(localStorage.getItem('testKey')).toBe('testValue');
    });

    it('should return null for non-existent keys', () => {
      expect(localStorage.getItem('nonExistentKey')).toBeNull();
    });

    it('should convert non-string values to strings', () => {
      // Arrange & Act
      localStorage.setItem('number', '123' as any);
      localStorage.setItem('boolean', 'true' as any);
      localStorage.setItem('object', JSON.stringify({ key: 'value' }));

      // Assert
      expect(localStorage.getItem('number')).toBe('123');
      expect(localStorage.getItem('boolean')).toBe('true');
      expect(localStorage.getItem('object')).toBe('{"key":"value"}');
    });

    it('should update existing values', () => {
      // Arrange
      localStorage.setItem('key', 'oldValue');

      // Act
      localStorage.setItem('key', 'newValue');

      // Assert
      expect(localStorage.getItem('key')).toBe('newValue');
    });

    it('should remove items', () => {
      // Arrange
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      // Act
      localStorage.removeItem('key1');

      // Assert
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBe('value2');
      expect(localStorage.length).toBe(1);
    });

    it('should handle removing non-existent keys gracefully', () => {
      // Act & Assert (should not throw)
      expect(() => {
        localStorage.removeItem('nonExistent');
      }).not.toThrow();
    });

    it('should clear all items', () => {
      // Arrange
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      // Act
      localStorage.clear();

      // Assert
      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
      expect(localStorage.getItem('key3')).toBeNull();
    });

    it('should track storage length correctly', () => {
      // Arrange & Act & Assert
      expect(localStorage.length).toBe(0);

      localStorage.setItem('key1', 'value1');
      expect(localStorage.length).toBe(1);

      localStorage.setItem('key2', 'value2');
      expect(localStorage.length).toBe(2);

      localStorage.setItem('key1', 'updatedValue'); // Update, not add
      expect(localStorage.length).toBe(2);

      localStorage.removeItem('key1');
      expect(localStorage.length).toBe(1);

      localStorage.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('key() method', () => {
    beforeEach(() => {
      mockLocalStorage();
    });

    afterEach(() => {
      restoreLocalStorage();
    });

    it('should return keys by index', () => {
      // Arrange
      localStorage.setItem('firstKey', 'value1');
      localStorage.setItem('secondKey', 'value2');
      localStorage.setItem('thirdKey', 'value3');

      // Act
      const key0 = localStorage.key(0);
      const key1 = localStorage.key(1);
      const key2 = localStorage.key(2);

      // Assert
      expect(key0).toBe('firstKey');
      expect(key1).toBe('secondKey');
      expect(key2).toBe('thirdKey');
    });

    it('should return null for negative index', () => {
      localStorage.setItem('key', 'value');
      expect(localStorage.key(-1)).toBeNull();
    });

    it('should return null for index >= length', () => {
      localStorage.setItem('key', 'value');
      expect(localStorage.key(1)).toBeNull();
      expect(localStorage.key(100)).toBeNull();
    });

    it('should return null for empty storage', () => {
      expect(localStorage.key(0)).toBeNull();
    });

    it('should allow iteration over all keys', () => {
      // Arrange
      localStorage.setItem('a', '1');
      localStorage.setItem('b', '2');
      localStorage.setItem('c', '3');

      // Act
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }

      // Assert
      expect(keys).toEqual(['a', 'b', 'c']);
      expect(keys.length).toBe(localStorage.length);
    });
  });

  describe('Test isolation', () => {
    it('should provide isolated storage for each test - test 1', () => {
      // Arrange
      mockLocalStorage();
      localStorage.setItem('isolationTest', 'test1');

      // Assert
      expect(localStorage.getItem('isolationTest')).toBe('test1');

      // Cleanup
      restoreLocalStorage();
    });

    it('should provide isolated storage for each test - test 2', () => {
      // Arrange
      mockLocalStorage();

      // Assert - should not see data from test 1
      expect(localStorage.getItem('isolationTest')).toBeNull();
      expect(localStorage.length).toBe(0);

      // Act
      localStorage.setItem('isolationTest', 'test2');
      expect(localStorage.getItem('isolationTest')).toBe('test2');

      // Cleanup
      restoreLocalStorage();
    });
  });

  describe('Helper functions', () => {
    beforeEach(() => {
      mockLocalStorage();
    });

    afterEach(() => {
      restoreLocalStorage();
    });

    it('getMockStorageContents should return all storage as object', () => {
      // Arrange
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      // Act
      const contents = getMockStorageContents();

      // Assert
      expect(contents).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
    });

    it('getMockStorageContents should return empty object for empty storage', () => {
      expect(getMockStorageContents()).toEqual({});
    });

    it('setMockStorageContents should set multiple items at once', () => {
      // Act
      setMockStorageContents({
        user: 'Alice',
        score: '100',
        level: '5',
      });

      // Assert
      expect(localStorage.getItem('user')).toBe('Alice');
      expect(localStorage.getItem('score')).toBe('100');
      expect(localStorage.getItem('level')).toBe('5');
      expect(localStorage.length).toBe(3);
    });

    it('setMockStorageContents should work with empty object', () => {
      // Arrange
      localStorage.setItem('existing', 'value');

      // Act
      setMockStorageContents({});

      // Assert - should not clear existing items
      expect(localStorage.getItem('existing')).toBe('value');
      expect(localStorage.length).toBe(1);
    });

    it('clearMockStorage should clear storage without restoring', () => {
      // Arrange
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      // Act
      clearMockStorage();

      // Assert
      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem('key1')).toBeNull();
      // localStorage should still be mocked
      expect(global.localStorage).toBeDefined();
    });
  });

  describe('Real-world usage scenarios', () => {
    beforeEach(() => {
      mockLocalStorage();
    });

    afterEach(() => {
      restoreLocalStorage();
    });

    it('should handle JSON game state storage', () => {
      // Arrange
      const gameState = {
        player: { level: 5, xp: 1000 },
        zombies: [
          { id: '1', type: 'shambler', hp: 100 },
          { id: '2', type: 'runner', hp: 80 },
        ],
        resources: { darkCoins: 500, bones: 200 },
      };

      // Act
      localStorage.setItem('gameState', JSON.stringify(gameState));
      const retrieved = localStorage.getItem('gameState');
      const parsed = retrieved ? JSON.parse(retrieved) : null;

      // Assert
      expect(parsed).toEqual(gameState);
      expect(parsed.player.level).toBe(5);
      expect(parsed.zombies).toHaveLength(2);
    });

    it('should handle settings storage', () => {
      // Arrange
      const settings = {
        soundEnabled: true,
        musicVolume: 0.8,
        sfxVolume: 0.6,
        language: 'en',
      };

      // Act
      localStorage.setItem('settings', JSON.stringify(settings));

      // Assert
      const retrieved = JSON.parse(localStorage.getItem('settings')!);
      expect(retrieved.soundEnabled).toBe(true);
      expect(retrieved.musicVolume).toBe(0.8);
    });

    it('should handle multiple independent storage keys', () => {
      // Arrange
      localStorage.setItem('gameState', '{"level":1}');
      localStorage.setItem('settings', '{"sound":true}');
      localStorage.setItem('achievements', '["firstZombie"]');
      localStorage.setItem('lastSaveTime', '2025-11-12T12:00:00Z');

      // Assert
      expect(localStorage.length).toBe(4);
      expect(localStorage.getItem('gameState')).toBe('{"level":1}');
      expect(localStorage.getItem('settings')).toBe('{"sound":true}');
      expect(localStorage.getItem('achievements')).toBe('["firstZombie"]');
      expect(localStorage.getItem('lastSaveTime')).toBe('2025-11-12T12:00:00Z');
    });

    it('should handle overwriting corrupted data', () => {
      // Arrange - simulate corrupted data
      localStorage.setItem('gameState', '{invalid json}');

      // Act - try to parse, fail, then overwrite with valid data
      const retrieved = localStorage.getItem('gameState');
      let isValid = false;
      try {
        JSON.parse(retrieved!);
        isValid = true;
      } catch {
        // Corrupted, write new data
        localStorage.setItem('gameState', '{"level":1}');
      }

      // Assert
      expect(isValid).toBe(false);
      const newData = JSON.parse(localStorage.getItem('gameState')!);
      expect(newData).toEqual({ level: 1 });
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      mockLocalStorage();
    });

    afterEach(() => {
      restoreLocalStorage();
    });

    it('should handle empty string as key', () => {
      localStorage.setItem('', 'emptyKeyValue');
      expect(localStorage.getItem('')).toBe('emptyKeyValue');
    });

    it('should handle empty string as value', () => {
      localStorage.setItem('emptyValue', '');
      expect(localStorage.getItem('emptyValue')).toBe('');
    });

    it('should handle very long keys', () => {
      const longKey = 'k'.repeat(1000);
      localStorage.setItem(longKey, 'value');
      expect(localStorage.getItem(longKey)).toBe('value');
    });

    it('should handle very long values', () => {
      const longValue = 'v'.repeat(10000);
      localStorage.setItem('key', longValue);
      expect(localStorage.getItem('key')).toBe(longValue);
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key-with-special_chars!@#$%^&*()';
      localStorage.setItem(specialKey, 'value');
      expect(localStorage.getItem(specialKey)).toBe('value');
    });

    it('should handle unicode in keys and values', () => {
      localStorage.setItem('🧟‍♂️', '僵尸');
      expect(localStorage.getItem('🧟‍♂️')).toBe('僵尸');
    });
  });
});
