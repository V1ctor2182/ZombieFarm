/**
 * Tests for mockTimers utility
 *
 * Validates that the timer utilities work correctly with Jest fake timers
 * and provide convenient helpers for time-based testing.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  setupFakeTimers,
  teardownFakeTimers,
  advanceTime,
  advanceToNextTimer,
  runAllTimers,
  runOnlyPendingTimers,
  getTimerCount,
  getCurrentTime,
  setCurrentTime,
  clearAllTimers,
  advanceTimeBySeconds,
  advanceTimeByMinutes,
  advanceTimeByHours,
  advanceTimeByDays,
  areTimersEnabled,
} from './mockTimers';

describe('mockTimers', () => {
  describe('Setup and teardown', () => {
    it('should enable fake timers', () => {
      // Act
      setupFakeTimers();

      // Assert
      expect(areTimersEnabled()).toBe(true);

      // Cleanup
      teardownFakeTimers();
    });

    it('should disable fake timers', () => {
      // Arrange
      setupFakeTimers();
      expect(areTimersEnabled()).toBe(true);

      // Act
      teardownFakeTimers();

      // Assert
      expect(areTimersEnabled()).toBe(false);
    });

    it('should handle double setup gracefully', () => {
      // Arrange
      setupFakeTimers();

      // Act & Assert (should not throw, but may warn)
      expect(() => setupFakeTimers()).not.toThrow();

      // Cleanup
      teardownFakeTimers();
    });

    it('should handle teardown without setup gracefully', () => {
      // Act & Assert
      expect(() => teardownFakeTimers()).not.toThrow();
    });

    it('should accept configuration options', () => {
      // Act & Assert
      expect(() => {
        setupFakeTimers({
          legacyFakeTimers: false,
          timerLimit: 1000,
        });
      }).not.toThrow();

      // Cleanup
      teardownFakeTimers();
    });
  });

  describe('advanceTime', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should advance time and trigger setTimeout', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 1000);

      // Act
      advanceTime(1000);

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should trigger multiple setTimeout callbacks', () => {
      // Arrange
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      setTimeout(callback1, 500);
      setTimeout(callback2, 1000);
      setTimeout(callback3, 1500);

      // Act
      advanceTime(1000);

      // Assert
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(0);

      // Act - advance more
      advanceTime(500);

      // Assert
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('should trigger setInterval callbacks multiple times', () => {
      // Arrange
      const callback = jest.fn();
      setInterval(callback, 100);

      // Act
      advanceTime(350);

      // Assert
      expect(callback).toHaveBeenCalledTimes(3); // At 100, 200, 300ms
    });

    it('should not trigger callbacks before their time', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 1000);

      // Act
      advanceTime(999);

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });

    it('should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => advanceTime(1000)).toThrow('Fake timers not enabled');
    });
  });

  describe('advanceToNextTimer', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should advance to the next pending timer', () => {
      // Arrange
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      setTimeout(callback1, 100);
      setTimeout(callback2, 200);

      // Act
      const advanced = advanceToNextTimer();

      // Assert
      expect(advanced).toBe(100);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should step through timers one at a time', () => {
      // Arrange
      const order: number[] = [];
      setTimeout(() => order.push(1), 100);
      setTimeout(() => order.push(2), 200);
      setTimeout(() => order.push(3), 300);

      // Act & Assert
      advanceToNextTimer();
      expect(order).toEqual([1]);

      advanceToNextTimer();
      expect(order).toEqual([1, 2]);

      advanceToNextTimer();
      expect(order).toEqual([1, 2, 3]);
    });

    it('should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => advanceToNextTimer()).toThrow('Fake timers not enabled');
    });
  });

  describe('runAllTimers', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should run all pending timers', () => {
      // Arrange
      const callbacks = [jest.fn(), jest.fn(), jest.fn()];
      setTimeout(callbacks[0], 100);
      setTimeout(callbacks[1], 1000);
      setTimeout(callbacks[2], 10000);

      // Act
      runAllTimers();

      // Assert
      callbacks.forEach((cb) => {
        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear interval timers after running', () => {
      // Arrange
      const callback = jest.fn();
      const intervalId = setInterval(callback, 100);

      // Act
      setTimeout(() => clearInterval(intervalId), 500);
      runAllTimers();

      // Assert
      expect(callback).toHaveBeenCalledTimes(5); // At 100, 200, 300, 400, 500
    });

    it('should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => runAllTimers()).toThrow('Fake timers not enabled');
    });
  });

  describe('runOnlyPendingTimers', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should run only currently pending timers', () => {
      // Arrange
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      setTimeout(() => {
        callback1();
        setTimeout(callback2, 100); // Scheduled during execution
      }, 100);

      // Act
      runOnlyPendingTimers();

      // Assert
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled(); // Not run because it was scheduled during execution
    });

    it('should not run newly scheduled timers', () => {
      // Arrange
      const order: string[] = [];

      setTimeout(() => {
        order.push('first');
        setTimeout(() => order.push('nested'), 100);
      }, 100);

      // Act
      runOnlyPendingTimers();

      // Assert
      expect(order).toEqual(['first']); // 'nested' not executed
    });

    it('should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => runOnlyPendingTimers()).toThrow('Fake timers not enabled');
    });
  });

  describe('getTimerCount', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should return 0 when no timers are pending', () => {
      expect(getTimerCount()).toBe(0);
    });

    it('should count pending setTimeout timers', () => {
      // Arrange
      setTimeout(() => {}, 1000);
      setTimeout(() => {}, 2000);
      setTimeout(() => {}, 3000);

      // Assert
      expect(getTimerCount()).toBe(3);
    });

    it('should count pending setInterval timers', () => {
      // Arrange
      setInterval(() => {}, 1000);
      setInterval(() => {}, 2000);

      // Assert
      expect(getTimerCount()).toBe(2);
    });

    it('should decrease count when timers execute', () => {
      // Arrange
      setTimeout(() => {}, 1000);
      setTimeout(() => {}, 2000);
      expect(getTimerCount()).toBe(2);

      // Act
      advanceTime(1000);

      // Assert
      expect(getTimerCount()).toBe(1);
    });

    it('should not count cleared timers', () => {
      // Arrange
      const timer1 = setTimeout(() => {}, 1000);
      setTimeout(() => {}, 2000);
      expect(getTimerCount()).toBe(2);

      // Act
      clearTimeout(timer1);

      // Assert
      expect(getTimerCount()).toBe(1);
    });

    it('should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => getTimerCount()).toThrow('Fake timers not enabled');
    });
  });

  describe('getCurrentTime and setCurrentTime', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should return current fake time', () => {
      // Arrange
      const startTime = getCurrentTime();

      // Act
      advanceTime(5000);

      // Assert
      expect(getCurrentTime()).toBe(startTime + 5000);
    });

    it('should allow setting specific time', () => {
      // Arrange
      const targetTime = new Date('2025-11-12T12:00:00Z').getTime();

      // Act
      setCurrentTime(targetTime);

      // Assert
      expect(getCurrentTime()).toBe(targetTime);
      expect(new Date(getCurrentTime()).toISOString()).toContain('2025-11-12T12:00:00');
    });

    it('should not execute timers when setting time', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 1000);

      // Act
      setCurrentTime(getCurrentTime() + 5000);

      // Assert
      expect(callback).not.toHaveBeenCalled(); // setSystemTime doesn't execute timers
    });

    it('getCurrentTime should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => getCurrentTime()).toThrow('Fake timers not enabled');
    });

    it('setCurrentTime should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => setCurrentTime(Date.now())).toThrow('Fake timers not enabled');
    });
  });

  describe('clearAllTimers', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should clear all pending timers without executing them', () => {
      // Arrange
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      setTimeout(callback1, 1000);
      setTimeout(callback2, 2000);
      setInterval(callback3, 500);

      expect(getTimerCount()).toBe(3);

      // Act
      clearAllTimers();

      // Assert
      expect(getTimerCount()).toBe(0);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });

    it('should allow new timers after clearing', () => {
      // Arrange
      setTimeout(() => {}, 1000);
      clearAllTimers();

      // Act
      const callback = jest.fn();
      setTimeout(callback, 100);

      // Assert
      expect(getTimerCount()).toBe(1);
      advanceTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should throw if timers not enabled', () => {
      // Arrange
      teardownFakeTimers();

      // Act & Assert
      expect(() => clearAllTimers()).toThrow('Fake timers not enabled');
    });
  });

  describe('Time convenience helpers', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('advanceTimeBySeconds should advance by seconds', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 5000); // 5 seconds

      // Act
      advanceTimeBySeconds(5);

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('advanceTimeByMinutes should advance by minutes', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 3 * 60 * 1000); // 3 minutes

      // Act
      advanceTimeByMinutes(3);

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('advanceTimeByHours should advance by hours', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 2 * 60 * 60 * 1000); // 2 hours

      // Act
      advanceTimeByHours(2);

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('advanceTimeByDays should advance by days', () => {
      // Arrange
      const callback = jest.fn();
      setTimeout(callback, 24 * 60 * 60 * 1000); // 1 day

      // Act
      advanceTimeByDays(1);

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should combine multiple time advances', () => {
      // Arrange
      const startTime = getCurrentTime();

      // Act
      advanceTimeBySeconds(30);
      advanceTimeByMinutes(2);
      advanceTimeByHours(1);

      // Assert
      const expectedTime = startTime + 30 * 1000 + 2 * 60 * 1000 + 1 * 60 * 60 * 1000;
      expect(getCurrentTime()).toBe(expectedTime);
    });
  });

  describe('Real-world game scenarios', () => {
    beforeEach(() => {
      setupFakeTimers();
    });

    afterEach(() => {
      teardownFakeTimers();
    });

    it('should simulate zombie growth timer (1 hour)', () => {
      // Arrange
      const zombieGrowthTime = 60 * 60 * 1000; // 1 hour
      let zombieGrown = false;

      setTimeout(() => {
        zombieGrown = true;
      }, zombieGrowthTime);

      // Assert - not grown yet
      expect(zombieGrown).toBe(false);

      // Act - advance 30 minutes
      advanceTimeByMinutes(30);
      expect(zombieGrown).toBe(false);

      // Act - advance another 30 minutes
      advanceTimeByMinutes(30);
      expect(zombieGrown).toBe(true);
    });

    it('should simulate daily decay timer', () => {
      // Arrange
      let decayCount = 0;
      const applyDailyDecay = () => {
        decayCount++;
      };

      // Daily decay check
      setInterval(applyDailyDecay, 24 * 60 * 60 * 1000); // 1 day

      // Act - advance 5 days
      advanceTimeByDays(5);

      // Assert
      expect(decayCount).toBe(5);
    });

    it('should simulate combat cooldown (10 seconds)', () => {
      // Arrange
      let cooldownExpired = false;
      const cooldownTime = 10 * 1000; // 10 seconds

      setTimeout(() => {
        cooldownExpired = true;
      }, cooldownTime);

      // Act & Assert
      expect(cooldownExpired).toBe(false);

      advanceTimeBySeconds(9);
      expect(cooldownExpired).toBe(false);

      advanceTimeBySeconds(1);
      expect(cooldownExpired).toBe(true);
    });

    it('should simulate day/night cycle (30 min real-time)', () => {
      // Arrange
      const dayNightCycle = 30 * 60 * 1000; // 30 minutes
      let cycleCount = 0;

      setInterval(() => {
        cycleCount++;
      }, dayNightCycle);

      // Act - simulate 2 hours of gameplay
      advanceTimeByHours(2);

      // Assert - should have 4 cycles (2 hours = 120 min, 120/30 = 4)
      expect(cycleCount).toBe(4);
    });

    it('should handle multiple concurrent timers', () => {
      // Arrange - simulate multiple zombies growing
      const zombies = [
        { id: 1, grown: false, time: 30 * 60 * 1000 }, // 30 min
        { id: 2, grown: false, time: 60 * 60 * 1000 }, // 60 min
        { id: 3, grown: false, time: 90 * 60 * 1000 }, // 90 min
      ];

      zombies.forEach((zombie) => {
        setTimeout(() => {
          zombie.grown = true;
        }, zombie.time);
      });

      // Act & Assert
      advanceTimeByMinutes(30);
      expect(zombies[0].grown).toBe(true);
      expect(zombies[1].grown).toBe(false);
      expect(zombies[2].grown).toBe(false);

      advanceTimeByMinutes(30);
      expect(zombies[1].grown).toBe(true);
      expect(zombies[2].grown).toBe(false);

      advanceTimeByMinutes(30);
      expect(zombies[2].grown).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw descriptive errors when timers not enabled', () => {
      // Ensure timers are not enabled
      teardownFakeTimers();

      // Test each function throws with correct message
      expect(() => advanceTime(1000)).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => advanceToNextTimer()).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => runAllTimers()).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => runOnlyPendingTimers()).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => getTimerCount()).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => getCurrentTime()).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => setCurrentTime(0)).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
      expect(() => clearAllTimers()).toThrow(
        'Fake timers not enabled. Call setupFakeTimers() first.'
      );
    });
  });
});
