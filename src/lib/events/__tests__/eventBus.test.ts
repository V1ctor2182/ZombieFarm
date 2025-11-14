/**
 * EventBus Tests
 *
 * Comprehensive test suite for the event bus system.
 */

import { EventBus } from '../eventBus';
import type { GameEvent } from '../../../types/events';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.clear();
  });

  describe('Basic Subscription and Dispatch', () => {
    it('subscribes and receives events', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler);
      await eventBus.dispatch(testEvent);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(testEvent);
    });

    it('unsubscribes correctly', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      const unsubscribe = eventBus.on('zombie.harvested', handler);
      unsubscribe();
      await eventBus.dispatch(testEvent);

      expect(handler).not.toHaveBeenCalled();
    });

    it('supports multiple subscribers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler1);
      eventBus.on('zombie.harvested', handler2);
      eventBus.on('zombie.harvested', handler3);

      await eventBus.dispatch(testEvent);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('does not call handlers for different event types', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.fed', handler);
      await eventBus.dispatch(testEvent);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Wildcard Subscriptions', () => {
    it('receives all events with wildcard subscription', async () => {
      const handler = jest.fn();

      eventBus.on('*', handler);

      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await eventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('wildcard and specific subscriptions both receive events', async () => {
      const wildcardHandler = jest.fn();
      const specificHandler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('*', wildcardHandler);
      eventBus.on('zombie.harvested', specificHandler);

      await eventBus.dispatch(testEvent);

      expect(wildcardHandler).toHaveBeenCalledTimes(1);
      expect(specificHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Priority Handling', () => {
    it('executes handlers in priority order (highest first)', async () => {
      const executionOrder: number[] = [];
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', () => executionOrder.push(1), { priority: 1 });
      eventBus.on('zombie.harvested', () => executionOrder.push(3), { priority: 3 });
      eventBus.on('zombie.harvested', () => executionOrder.push(2), { priority: 2 });

      await eventBus.dispatch(testEvent);

      expect(executionOrder).toEqual([3, 2, 1]);
    });

    it('defaults to priority 0 when not specified', async () => {
      const executionOrder: number[] = [];
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', () => executionOrder.push(10), { priority: 10 });
      eventBus.on('zombie.harvested', () => executionOrder.push(0)); // No priority = 0
      eventBus.on('zombie.harvested', () => executionOrder.push(-5), { priority: -5 });

      await eventBus.dispatch(testEvent);

      expect(executionOrder).toEqual([10, 0, -5]);
    });
  });

  describe('Once Subscription', () => {
    it('calls handler only once then unsubscribes', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.once('zombie.harvested', handler);

      await eventBus.dispatch(testEvent);
      await eventBus.dispatch(testEvent);
      await eventBus.dispatch(testEvent);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('AbortSignal Support', () => {
    it('automatically unsubscribes when signal is aborted', async () => {
      const handler = jest.fn();
      const controller = new AbortController();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler, { signal: controller.signal });

      await eventBus.dispatch(testEvent);
      expect(handler).toHaveBeenCalledTimes(1);

      controller.abort();
      await eventBus.dispatch(testEvent);
      expect(handler).toHaveBeenCalledTimes(1); // Not called again after abort
    });
  });

  describe('Error Handling', () => {
    it('continues dispatching to other handlers when one throws', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn(() => {
        throw new Error('Handler 2 error');
      });
      const handler3 = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler1);
      eventBus.on('zombie.harvested', handler2);
      eventBus.on('zombie.harvested', handler3);

      // Should not throw
      await eventBus.dispatch(testEvent);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event History', () => {
    it('tracks dispatched events in history', async () => {
      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await eventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      const history = eventBus.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].event.type).toBe('zombie.harvested');
      expect(history[1].event.type).toBe('battle.initiated');
    });

    it('limits history to specified size', async () => {
      const history = eventBus.getHistory(1);

      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await eventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      const limited = eventBus.getHistory(1);

      expect(limited).toHaveLength(1);
      expect(limited[0].event.type).toBe('battle.initiated'); // Most recent
    });

    it('clears history when requested', async () => {
      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      eventBus.clearHistory();

      const history = eventBus.getHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('tracks total events dispatched', async () => {
      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await eventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      const stats = eventBus.getStats();

      expect(stats.totalEvents).toBe(2);
    });

    it('tracks event counts by type', async () => {
      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      });

      await eventBus.dispatch({
        type: 'zombie.harvested',
        payload: { plotId: 'plot-2', zombieId: 'zombie-2', timestamp: Date.now() },
      });

      await eventBus.dispatch({
        type: 'battle.initiated',
        payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() },
      });

      const stats = eventBus.getStats();

      expect(stats.eventCounts['zombie.harvested']).toBe(2);
      expect(stats.eventCounts['battle.initiated']).toBe(1);
    });

    it('tracks total subscriptions', () => {
      eventBus.on('zombie.harvested', jest.fn());
      eventBus.on('zombie.harvested', jest.fn());
      eventBus.on('battle.initiated', jest.fn());
      eventBus.on('*', jest.fn());

      const stats = eventBus.getStats();

      expect(stats.totalSubscriptions).toBe(4);
    });
  });

  describe('Enable/Disable', () => {
    it('does not dispatch events when disabled', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler);
      eventBus.setEnabled(false);

      await eventBus.dispatch(testEvent);

      expect(handler).not.toHaveBeenCalled();
    });

    it('resumes dispatching when re-enabled', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler);
      eventBus.setEnabled(false);
      await eventBus.dispatch(testEvent);

      eventBus.setEnabled(true);
      await eventBus.dispatch(testEvent);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('reports enabled status correctly', () => {
      expect(eventBus.getEnabled()).toBe(true);

      eventBus.setEnabled(false);
      expect(eventBus.getEnabled()).toBe(false);

      eventBus.setEnabled(true);
      expect(eventBus.getEnabled()).toBe(true);
    });
  });

  describe('Clear', () => {
    it('removes all subscriptions', async () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler);
      eventBus.clear();

      await eventBus.dispatch(testEvent);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Emit (Fire and Forget)', () => {
    it('dispatches event without waiting', () => {
      const handler = jest.fn();
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', handler);
      eventBus.emit(testEvent);

      // Handler will be called asynchronously, so we can't assert immediately
      // This test just verifies emit doesn't throw
      expect(() => eventBus.emit(testEvent)).not.toThrow();
    });
  });

  describe('Async Handlers', () => {
    it('waits for async handlers to complete', async () => {
      const executionOrder: number[] = [];
      const testEvent: GameEvent = {
        type: 'zombie.harvested',
        payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() },
      };

      eventBus.on('zombie.harvested', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push(1);
      });

      eventBus.on('zombie.harvested', async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        executionOrder.push(2);
      });

      await eventBus.dispatch(testEvent);

      expect(executionOrder).toEqual([1, 2]); // Executed in order despite timing
    });
  });
});
