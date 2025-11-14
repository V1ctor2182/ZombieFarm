/**
 * EventLogger Tests
 *
 * Test suite for event logging and debugging utilities.
 */

import { EventLogger } from '../eventLogger';
import { EventBus, eventBus as globalEventBus } from '../eventBus';
import type { GameEvent } from '../../../types/events';

describe('EventLogger', () => {
  let logger: EventLogger;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new EventLogger({ enabled: true, logAll: true });
  });

  afterEach(() => {
    logger.detach();
    eventBus.clear();
    globalEventBus.clearHistory(); // Also clear global bus history
  });

  describe('Configuration', () => {
    it('initializes with default config', () => {
      const newLogger = new EventLogger();
      expect(newLogger).toBeDefined();
    });

    it('accepts custom config', () => {
      const customLogger = new EventLogger({
        enabled: false,
        logAll: false,
        include: ['zombie.*'],
        trackTiming: true,
      });

      expect(customLogger).toBeDefined();
    });

    it('can be enabled and disabled', () => {
      logger.disable();
      logger.enable();
      // If no errors, test passes
      expect(true).toBe(true);
    });

    it('can update configuration', () => {
      logger.configure({ collapsed: true, trackTiming: false });
      // If no errors, test passes
      expect(true).toBe(true);
    });
  });

  describe('Event Logging', () => {
    it('logs events manually', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      logger.logEvent(testEvent);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('does not log when disabled', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      logger.disable();
      logger.logEvent(testEvent);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Event Filtering', () => {
    it('filters events by include pattern', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();

      logger.configure({
        logAll: false,
        include: ['zombie\\..*'],
      });

      logger.logEvent({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      logger.logEvent({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      // Should only log zombie event
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });

    it('filters events by exclude pattern', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();

      logger.configure({
        logAll: true,
        exclude: ['time\\..*'],
      });

      logger.logEvent({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      logger.logEvent({
        type: 'time.dayChanged',
        payload: { newDay: 2, timestamp: Date.now() },
      });

      // Should only log zombie event (time event excluded)
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  describe('Timing Statistics', () => {
    it('tracks event timing when enabled', () => {
      logger.configure({ trackTiming: true });

      logger.logEvent({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      logger.logEvent({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-2', zombieId: 'zombie-2', timestamp: Date.now() },
      });

      const stats = logger.getTimingStats();

      expect(stats).toHaveLength(1);
      expect(stats[0].eventType).toBe('zombie.harvested');
      expect(stats[0].count).toBe(2);
    });

    it('calculates timing statistics correctly', () => {
      logger.configure({ trackTiming: true });

      // Log multiple events
      for (let i = 0; i < 5; i++) {
        logger.logEvent({
          type: 'zombie.harvested',
          payload: { plotId: `plot-${i}`, zombieId: `zombie-${i}`, timestamp: Date.now() },
        });
      }

      const stats = logger.getTimingStats();
      const zombieStats = stats.find((s) => s.eventType === 'zombie.harvested');

      expect(zombieStats).toBeDefined();
      expect(zombieStats!.count).toBe(5);
      expect(zombieStats!.avgTime).toBeGreaterThanOrEqual(0);
      expect(zombieStats!.minTime).toBeLessThanOrEqual(zombieStats!.maxTime);
    });

    it('prints timing stats without error', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();

      logger.configure({ trackTiming: true });
      logger.logEvent({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      logger.printTimingStats();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('clears timing stats', () => {
      logger.configure({ trackTiming: true });

      logger.logEvent({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      logger.clearTimingStats();

      const stats = logger.getTimingStats();
      expect(stats).toHaveLength(0);
    });
  });

  describe('Event History Integration', () => {
    it('prints event history without error', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();

      logger.printHistory(10);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('prints event bus stats without error', () => {
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();

      logger.printStats();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Event Filtering Utilities', () => {
    it('filters events by string pattern', async () => {
      // Use global event bus since logger uses it
      globalEventBus.clearHistory();

      await globalEventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await globalEventBus.dispatch({
        type: 'zombie.fed',
        payload: { zombieId: 'zombie-1', foodItem: 'RottenMeat', timestamp: Date.now() },
      });

      await globalEventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      const filtered = logger.filterEvents('zombie');

      expect(filtered.length).toBe(2);
      expect(filtered.every((e) => e.event.type.includes('zombie'))).toBe(true);
    });

    it('filters events by regex pattern', async () => {
      // Use global event bus since logger uses it
      globalEventBus.clearHistory();

      await globalEventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await globalEventBus.dispatch({
        type: 'zombie.fed',
        payload: { zombieId: 'zombie-1', foodItem: 'RottenMeat', timestamp: Date.now() },
      });

      await globalEventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      const filtered = logger.filterEvents(/^zombie\./);

      expect(filtered.length).toBe(2);
      expect(filtered.every((e) => e.event.type.startsWith('zombie.'))).toBe(true);
    });

    it('returns empty array when no matches', () => {
      globalEventBus.clearHistory();
      const filtered = logger.filterEvents('nonexistent');

      expect(filtered).toHaveLength(0);
    });
  });

  describe('Event Replay', () => {
    it('replays events without error', async () => {
      const events: GameEvent[] = [
        {
          type: 'zombie.harvested',
          payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
        },
        {
          type: 'battle.initiated',
          payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
        },
      ];

      await logger.replayEvents(events, 0);

      // If no errors, test passes
      expect(true).toBe(true);
    });

    it('replays events with delay', async () => {
      const events: GameEvent[] = [
        {
          type: 'zombie.harvested',
          payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
        },
      ];

      const startTime = Date.now();
      await logger.replayEvents(events, 50);
      const endTime = Date.now();

      // Should take at least 50ms (with some margin for test environment)
      expect(endTime - startTime).toBeGreaterThanOrEqual(45);
    });
  });

  describe('Lifecycle', () => {
    it('detaches from event bus', () => {
      logger.detach();
      // If no errors, test passes
      expect(true).toBe(true);
    });
  });
});
