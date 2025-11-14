/**
 * Auto-Save System Tests
 *
 * Tests for automatic game state saving at intervals and on events.
 * Validates timer-based saves and manual triggers.
 *
 * Per TESTING.md:
 * - Use fake timers for time-dependent logic
 * - Test interval triggers
 * - Test manual triggers
 * - Test cleanup and disposal
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  setupAutoSave,
  stopAutoSave,
  triggerAutoSave,
  setAutoSaveInterval,
  isAutoSaveEnabled,
  getLastAutoSaveTime,
  AutoSaveConfig,
} from '../autoSave';
import { saveGame } from '../saveLoad';
import { createTestGameState } from '../../test-utils/factories/gameStateFactory';
import { mockLocalStorage, restoreLocalStorage } from '../../test-utils/mocks/mockLocalStorage';

// Mock saveGame to track calls
jest.mock('../saveLoad', () => ({
  saveGame: jest.fn(() => ({ success: true })),
}));

describe('autoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockLocalStorage();
    jest.clearAllMocks();
  });

  afterEach(() => {
    stopAutoSave();
    jest.useRealTimers();
    restoreLocalStorage();
  });

  describe('setupAutoSave', () => {
    it('should start auto-save with default interval', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = { enabled: true };

      // Act
      setupAutoSave(getState, config);

      // Assert
      expect(isAutoSaveEnabled()).toBe(true);
    });

    it('should save at specified intervals', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 60000, // 1 minute
      };
      setupAutoSave(getState, config);

      // Act - advance time by 1 minute
      jest.advanceTimersByTime(60000);

      // Assert
      expect(saveGame).toHaveBeenCalledTimes(1);
    });

    it('should save multiple times at regular intervals', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 30000, // 30 seconds
      };
      setupAutoSave(getState, config);

      // Act - advance time by 2 minutes (4 intervals)
      jest.advanceTimersByTime(120000);

      // Assert
      expect(saveGame).toHaveBeenCalledTimes(4);
    });

    it('should not save when disabled', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = { enabled: false };

      // Act
      setupAutoSave(getState, config);
      jest.advanceTimersByTime(300000); // 5 minutes

      // Assert
      expect(saveGame).not.toHaveBeenCalled();
    });

    it('should call getState function on each save', () => {
      // Arrange
      const mockGetState = jest.fn(() => createTestGameState());
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 60000,
      };
      setupAutoSave(mockGetState, config);

      // Act
      jest.advanceTimersByTime(60000);

      // Assert
      expect(mockGetState).toHaveBeenCalled();
    });

    it('should handle getState errors gracefully', () => {
      // Arrange
      const errorGetState = () => {
        throw new Error('State error');
      };
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 60000,
      };

      // Act & Assert - should not throw
      expect(() => setupAutoSave(errorGetState, config)).not.toThrow();
      expect(() => jest.advanceTimersByTime(60000)).not.toThrow();
    });

    it('should update last save time after each save', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 60000,
      };
      setupAutoSave(getState, config);
      const timeBefore = Date.now();

      // Act
      jest.advanceTimersByTime(60000);

      // Assert
      const lastSave = getLastAutoSaveTime();
      expect(lastSave).toBeGreaterThanOrEqual(timeBefore);
    });
  });

  describe('stopAutoSave', () => {
    it('should stop auto-saving', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 60000,
      };
      setupAutoSave(getState, config);

      // Act
      stopAutoSave();
      jest.advanceTimersByTime(300000); // 5 minutes

      // Assert
      expect(saveGame).not.toHaveBeenCalled();
      expect(isAutoSaveEnabled()).toBe(false);
    });

    it('should be safe to call multiple times', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });

      // Act & Assert - should not throw
      expect(() => {
        stopAutoSave();
        stopAutoSave();
        stopAutoSave();
      }).not.toThrow();
    });

    it('should be safe to call when never started', () => {
      // Act & Assert - should not throw
      expect(() => stopAutoSave()).not.toThrow();
    });
  });

  describe('triggerAutoSave', () => {
    it('should immediately save game state', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });
      jest.clearAllMocks();

      // Act
      triggerAutoSave();

      // Assert
      expect(saveGame).toHaveBeenCalledTimes(1);
    });

    it('should work even when auto-save is disabled', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: false });

      // Act
      triggerAutoSave();

      // Assert
      expect(saveGame).toHaveBeenCalledTimes(1);
    });

    it('should update last save time', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });
      const timeBefore = Date.now();

      // Act
      triggerAutoSave();

      // Assert
      const lastSave = getLastAutoSaveTime();
      expect(lastSave).toBeGreaterThanOrEqual(timeBefore);
    });

    it('should not throw on save errors', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });
      (saveGame as jest.Mock).mockReturnValueOnce({
        success: false,
        error: new Error('Save failed'),
      });

      // Act & Assert
      expect(() => triggerAutoSave()).not.toThrow();
    });

    it('should call onError callback when save fails', () => {
      // Arrange
      const onError = jest.fn();
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true, onError });
      (saveGame as jest.Mock).mockReturnValueOnce({
        success: false,
        error: { message: 'Storage full' },
      });

      // Act
      triggerAutoSave();

      // Assert
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Storage full' }));
    });

    it('should call onSuccess callback when save succeeds', () => {
      // Arrange
      const onSuccess = jest.fn();
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true, onSuccess });

      // Act
      triggerAutoSave();

      // Assert
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('setAutoSaveInterval', () => {
    it('should change the save interval', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true, intervalMs: 60000 });
      jest.clearAllMocks();

      // Act
      setAutoSaveInterval(30000); // Change to 30 seconds

      // Assert
      jest.advanceTimersByTime(30000);
      expect(saveGame).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(30000);
      expect(saveGame).toHaveBeenCalledTimes(2);
    });

    it('should restart timer with new interval', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true, intervalMs: 60000 });
      jest.advanceTimersByTime(30000); // Half way through first interval
      jest.clearAllMocks();

      // Act
      setAutoSaveInterval(60000); // Reset to same interval

      // Assert - old timer should be cancelled, new one starts fresh
      jest.advanceTimersByTime(30000); // Complete the original interval
      expect(saveGame).not.toHaveBeenCalled(); // Timer was reset
    });

    it('should throw on invalid intervals', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });

      // Act & Assert
      expect(() => setAutoSaveInterval(0)).toThrow();
      expect(() => setAutoSaveInterval(-1000)).toThrow();
    });
  });

  describe('isAutoSaveEnabled', () => {
    it('should return false by default', () => {
      // Assert
      expect(isAutoSaveEnabled()).toBe(false);
    });

    it('should return true when enabled', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });

      // Assert
      expect(isAutoSaveEnabled()).toBe(true);
    });

    it('should return false after stopping', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });

      // Act
      stopAutoSave();

      // Assert
      expect(isAutoSaveEnabled()).toBe(false);
    });
  });

  describe('getLastAutoSaveTime', () => {
    it('should return null when no saves have occurred', () => {
      // Assert
      expect(getLastAutoSaveTime()).toBeNull();
    });

    it('should return timestamp after save', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });
      const before = Date.now();

      // Act
      triggerAutoSave();

      // Assert
      const lastSave = getLastAutoSaveTime();
      expect(lastSave).toBeGreaterThanOrEqual(before);
      expect(lastSave).toBeLessThanOrEqual(Date.now());
    });

    it('should update after each auto-save', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true, intervalMs: 60000 });

      // Act
      jest.advanceTimersByTime(60000);
      const firstSave = getLastAutoSaveTime();

      jest.advanceTimersByTime(60000);
      const secondSave = getLastAutoSaveTime();

      // Assert
      expect(secondSave).toBeGreaterThan(firstSave!);
    });
  });

  describe('AutoSaveConfig', () => {
    it('should respect minIntervalMs setting', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = {
        enabled: true,
        intervalMs: 60000,
        minIntervalMs: 30000,
      };
      setupAutoSave(getState, config);
      jest.clearAllMocks();

      // Act - try to trigger saves rapidly
      triggerAutoSave();
      triggerAutoSave(); // Should be throttled
      triggerAutoSave(); // Should be throttled

      // Assert - only first save should go through
      expect(saveGame).toHaveBeenCalledTimes(1);
    });

    it('should allow saves after minInterval has passed', () => {
      // Arrange
      const getState = () => createTestGameState();
      const config: AutoSaveConfig = {
        enabled: true,
        minIntervalMs: 5000, // 5 seconds
      };
      setupAutoSave(getState, config);

      // Act
      triggerAutoSave();
      jest.advanceTimersByTime(6000); // Wait past minInterval
      triggerAutoSave();

      // Assert
      expect(saveGame).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid setup/stop cycles', () => {
      // Arrange
      const getState = () => createTestGameState();

      // Act & Assert - should not throw or leak timers
      expect(() => {
        setupAutoSave(getState, { enabled: true });
        stopAutoSave();
        setupAutoSave(getState, { enabled: true });
        stopAutoSave();
        setupAutoSave(getState, { enabled: true });
        stopAutoSave();
      }).not.toThrow();
    });

    it('should handle timer overflow gracefully', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true, intervalMs: 1000 });

      // Act - advance by a huge amount
      jest.advanceTimersByTime(Number.MAX_SAFE_INTEGER);

      // Assert - should not crash (may save many times)
      expect(saveGame).toHaveBeenCalled();
    });

    it('should clear timers on page unload simulation', () => {
      // Arrange
      const getState = () => createTestGameState();
      setupAutoSave(getState, { enabled: true });

      // Act - simulate cleanup
      stopAutoSave();
      jest.clearAllTimers();

      // Assert - advancing time should not trigger saves
      jest.advanceTimersByTime(300000);
      expect(saveGame).not.toHaveBeenCalled();
    });
  });
});
