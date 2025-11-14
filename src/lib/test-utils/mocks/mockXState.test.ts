/**
 * Tests for mockXState utility
 *
 * Validates that the XState testing helpers work correctly for testing
 * state machines and actors.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createMachine, assign } from 'xstate';
import {
  createTestActor,
  waitForState,
  expectState,
  sendEventAndWait,
  getMachineSnapshot,
  getStateValue,
  isInState,
  waitForSnapshot,
  getContext,
  canSendEvent,
  createTransitionSpy,
  createEventSpy,
} from './mockXState';

/**
 * Simple test machine for testing the utilities
 */
const createTestMachine = () =>
  createMachine({
    id: 'testMachine',
    initial: 'idle',
    context: {
      count: 0,
      message: '',
    },
    states: {
      idle: {
        on: {
          START: 'running',
          INCREMENT: {
            actions: assign({
              count: ({ context }) => context.count + 1,
            }),
          },
        },
      },
      running: {
        on: {
          PAUSE: 'paused',
          STOP: 'idle',
          SET_MESSAGE: {
            actions: assign({
              message: ({ event }) => (event as any).message,
            }),
          },
        },
      },
      paused: {
        on: {
          RESUME: 'running',
          STOP: 'idle',
        },
      },
    },
  });

/**
 * Machine with nested states for testing
 */
const createNestedMachine = () =>
  createMachine({
    id: 'nestedMachine',
    initial: 'farm',
    states: {
      farm: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              PLANT: 'planting',
            },
          },
          planting: {
            on: {
              DONE: 'growing',
            },
          },
          growing: {
            on: {
              HARVEST: '#nestedMachine.combat',
            },
          },
        },
      },
      combat: {
        id: 'combat',
        on: {
          RETURN: 'farm',
        },
      },
    },
  });

describe('mockXState', () => {
  describe('createTestActor', () => {
    it('should create an actor from a machine', () => {
      // Arrange
      const machine = createTestMachine();

      // Act
      const actor = createTestActor(machine);

      // Assert
      expect(actor).toBeDefined();
      expect(actor.start).toBeDefined();
      expect(actor.send).toBeDefined();
    });

    it('should create actor in initial state with default context', () => {
      // Arrange
      const machine = createTestMachine();

      // Act
      const actor = createTestActor(machine);
      actor.start();

      // Assert
      const snapshot = getMachineSnapshot(actor);
      const context = getContext(snapshot);
      expect(context.count).toBe(0); // Default from machine
      expect(context.message).toBe(''); // Default from machine
    });

    it('should create actor in initial state', () => {
      // Arrange
      const machine = createTestMachine();

      // Act
      const actor = createTestActor(machine);
      actor.start();

      // Assert
      const snapshot = getMachineSnapshot(actor);
      expect(getStateValue(snapshot)).toBe('idle');
    });
  });

  describe('expectState', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should pass when actor is in expected state', () => {
      // Assert
      expect(() => expectState(actor, 'idle')).not.toThrow();
    });

    it('should throw when actor is not in expected state', () => {
      // Act & Assert
      expect(() => expectState(actor, 'running')).toThrow(
        "Expected state 'running', but current state is 'idle'",
      );
    });

    it('should work after state transition', () => {
      // Act
      actor.send({ type: 'START' });

      // Assert
      expect(() => expectState(actor, 'running')).not.toThrow();
    });
  });

  describe('waitForState', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should resolve immediately if already in target state', async () => {
      // Act & Assert
      await expect(waitForState(actor, 'idle', 1000)).resolves.toBeUndefined();
    });

    it('should wait for state transition', async () => {
      // Arrange
      const waitPromise = waitForState(actor, 'running', 1000);

      // Act
      actor.send({ type: 'START' });

      // Assert
      await expect(waitPromise).resolves.toBeUndefined();
    });

    it('should reject if timeout exceeded', async () => {
      // Act & Assert
      await expect(waitForState(actor, 'nonExistentState', 100)).rejects.toThrow(
        "Timeout waiting for state 'nonExistentState' after 100ms",
      );
    });

    it('should handle multiple state transitions', async () => {
      // Arrange
      const waitPromise = waitForState(actor, 'paused', 1000);

      // Act
      actor.send({ type: 'START' });
      actor.send({ type: 'PAUSE' });

      // Assert
      await expect(waitPromise).resolves.toBeUndefined();
    });
  });

  describe('sendEventAndWait', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should send event and wait for target state', async () => {
      // Act
      await sendEventAndWait(actor, { type: 'START' }, 'running', 1000);

      // Assert
      expectState(actor, 'running');
    });

    it('should work with multiple transitions', async () => {
      // Act
      await sendEventAndWait(actor, { type: 'START' }, 'running');
      await sendEventAndWait(actor, { type: 'PAUSE' }, 'paused');

      // Assert
      expectState(actor, 'paused');
    });

    it('should reject if target state not reached', async () => {
      // Act & Assert
      await expect(sendEventAndWait(actor, { type: 'START' }, 'paused', 100)).rejects.toThrow(
        "Timeout waiting for state 'paused'",
      );
    });
  });

  describe('getMachineSnapshot', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should return current snapshot', () => {
      // Act
      const snapshot = getMachineSnapshot(actor);

      // Assert
      expect(snapshot).toBeDefined();
      expect(snapshot.value).toBeDefined();
      expect(snapshot.context).toBeDefined();
    });

    it('should reflect current state in snapshot', () => {
      // Arrange
      actor.send({ type: 'START' });

      // Act
      const snapshot = getMachineSnapshot(actor);

      // Assert
      expect(getStateValue(snapshot)).toBe('running');
    });

    it('should reflect current context in snapshot', () => {
      // Arrange
      actor.send({ type: 'INCREMENT' });
      actor.send({ type: 'INCREMENT' });

      // Act
      const snapshot = getMachineSnapshot(actor);
      const context = getContext(snapshot);

      // Assert
      expect(context.count).toBe(2);
    });
  });

  describe('getStateValue', () => {
    it('should return simple state value as string', () => {
      // Arrange
      const machine = createTestMachine();
      const actor = createTestActor(machine);
      actor.start();

      // Act
      const snapshot = getMachineSnapshot(actor);
      const stateValue = getStateValue(snapshot);

      // Assert
      expect(stateValue).toBe('idle');

      actor.stop();
    });

    it('should handle nested state values', () => {
      // Arrange
      const machine = createNestedMachine();
      const actor = createTestActor(machine);
      actor.start();

      // Act
      const snapshot = getMachineSnapshot(actor);
      const stateValue = getStateValue(snapshot);

      // Assert
      expect(stateValue).toBe('farm.idle');

      actor.stop();
    });
  });

  describe('isInState', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should return true for exact state match', () => {
      // Act
      const snapshot = getMachineSnapshot(actor);

      // Assert
      expect(isInState(snapshot, 'idle')).toBe(true);
    });

    it('should return false for non-matching state', () => {
      // Act
      const snapshot = getMachineSnapshot(actor);

      // Assert
      expect(isInState(snapshot, 'running')).toBe(false);
    });

    it('should handle nested state matching', () => {
      // Arrange
      const machine = createNestedMachine();
      const nestedActor = createTestActor(machine);
      nestedActor.start();

      // Act
      const snapshot = getMachineSnapshot(nestedActor);

      // Assert
      expect(isInState(snapshot, 'farm')).toBe(true);
      expect(isInState(snapshot, 'farm.idle')).toBe(true);
      expect(isInState(snapshot, 'combat')).toBe(false);

      nestedActor.stop();
    });
  });

  describe('waitForSnapshot', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should resolve with next snapshot', async () => {
      // Arrange
      const snapshotPromise = waitForSnapshot(actor, 1000);

      // Act
      actor.send({ type: 'START' });

      // Assert
      const snapshot = await snapshotPromise;
      expect(getStateValue(snapshot)).toBe('running');
    });

    it('should reject on timeout', async () => {
      // Act & Assert (no events sent, so should timeout)
      await expect(waitForSnapshot(actor, 100)).rejects.toThrow('Timeout waiting for snapshot after 100ms');
    });
  });

  describe('getContext', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
      // Increment a few times to set up context
      actor.send({ type: 'INCREMENT' });
      actor.send({ type: 'INCREMENT' });
      actor.send({ type: 'INCREMENT' });
    });

    afterEach(() => {
      actor.stop();
    });

    it('should extract context from snapshot', () => {
      // Act
      const snapshot = getMachineSnapshot(actor);
      const context = getContext<{ count: number; message: string }>(snapshot);

      // Assert
      expect(context.count).toBe(3); // Incremented 3 times
      expect(context.message).toBe(''); // Default value
    });

    it('should reflect context changes', () => {
      // Arrange
      actor.send({ type: 'INCREMENT' });

      // Act
      const snapshot = getMachineSnapshot(actor);
      const context = getContext<{ count: number; message: string }>(snapshot);

      // Assert
      expect(context.count).toBe(4); // Was 3, incremented once more
    });
  });

  describe('canSendEvent', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should return true for valid event in current state', () => {
      // Assert
      expect(canSendEvent(actor, 'START')).toBe(true);
      expect(canSendEvent(actor, 'INCREMENT')).toBe(true);
    });

    it('should return false for invalid event in current state', () => {
      // Assert
      expect(canSendEvent(actor, 'PAUSE')).toBe(false); // Only available in running state
    });

    it('should update after state transition', () => {
      // Arrange
      expect(canSendEvent(actor, 'PAUSE')).toBe(false);

      // Act
      actor.send({ type: 'START' });

      // Assert
      expect(canSendEvent(actor, 'PAUSE')).toBe(true);
      expect(canSendEvent(actor, 'START')).toBe(false); // No longer in idle
    });
  });

  describe('createTransitionSpy', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should track state transitions', () => {
      // Arrange
      const spy = createTransitionSpy();
      actor.subscribe(spy.track);

      // Act
      actor.send({ type: 'START' });
      actor.send({ type: 'PAUSE' });

      // Assert
      expect(spy.transitions).toHaveLength(2);
      expect(getStateValue(spy.transitions[0])).toBe('running');
      expect(getStateValue(spy.transitions[1])).toBe('paused');
    });

    it('should clear transitions', () => {
      // Arrange
      const spy = createTransitionSpy();
      actor.subscribe(spy.track);
      actor.send({ type: 'START' });
      expect(spy.transitions).toHaveLength(1);

      // Act
      spy.clear();

      // Assert
      expect(spy.transitions).toHaveLength(0);
    });

    it('should track context changes in transitions', () => {
      // Arrange
      const spy = createTransitionSpy();
      actor.subscribe(spy.track);

      // Act
      actor.send({ type: 'INCREMENT' });
      actor.send({ type: 'INCREMENT' });

      // Assert
      expect(spy.transitions).toHaveLength(2);
      expect(getContext(spy.transitions[0]).count).toBe(1);
      expect(getContext(spy.transitions[1]).count).toBe(2);
    });
  });

  describe('createEventSpy', () => {
    let actor: any;

    beforeEach(() => {
      const machine = createTestMachine();
      actor = createTestActor(machine);
      actor.start();
    });

    afterEach(() => {
      actor.stop();
    });

    it('should track events sent to actor', () => {
      // Arrange
      const spy = createEventSpy();
      const wrappedSend = spy.wrap(actor.send.bind(actor));

      // Act
      wrappedSend({ type: 'START' });
      wrappedSend({ type: 'PAUSE' });

      // Assert
      expect(spy.events).toHaveLength(2);
      expect(spy.events[0]).toEqual({ type: 'START' });
      expect(spy.events[1]).toEqual({ type: 'PAUSE' });
    });

    it('should track event payloads', () => {
      // Arrange
      const spy = createEventSpy();
      const wrappedSend = spy.wrap(actor.send.bind(actor));

      // Act
      actor.send({ type: 'START' });
      wrappedSend({ type: 'SET_MESSAGE', message: 'Hello World' });

      // Assert
      expect(spy.events).toHaveLength(1);
      expect(spy.events[0]).toEqual({ type: 'SET_MESSAGE', message: 'Hello World' });
    });

    it('should clear events', () => {
      // Arrange
      const spy = createEventSpy();
      const wrappedSend = spy.wrap(actor.send.bind(actor));
      wrappedSend({ type: 'START' });
      expect(spy.events).toHaveLength(1);

      // Act
      spy.clear();

      // Assert
      expect(spy.events).toHaveLength(0);
    });
  });

  describe('Real-world game scenarios', () => {
    it('should test zombie growth state machine', async () => {
      // Arrange - simplified zombie growth machine
      const zombieMachine = createMachine({
        id: 'zombie',
        initial: 'seed',
        context: {
          growthTime: 0,
          readyToHarvest: false,
        },
        states: {
          seed: {
            on: {
              PLANT: 'growing',
            },
          },
          growing: {
            on: {
              COMPLETE: {
                target: 'ready',
                actions: assign({
                  readyToHarvest: true,
                }),
              },
            },
          },
          ready: {
            on: {
              HARVEST: 'harvested',
            },
          },
          harvested: {
            type: 'final',
          },
        },
      });

      const actor = createTestActor(zombieMachine);
      actor.start();

      // Act & Assert
      expectState(actor, 'seed');

      await sendEventAndWait(actor, { type: 'PLANT' }, 'growing');
      expectState(actor, 'growing');

      await sendEventAndWait(actor, { type: 'COMPLETE' }, 'ready');
      expectState(actor, 'ready');

      const snapshot = getMachineSnapshot(actor);
      const context = getContext(snapshot);
      expect(context.readyToHarvest).toBe(true);

      await sendEventAndWait(actor, { type: 'HARVEST' }, 'harvested');
      expectState(actor, 'harvested');

      actor.stop();
    });

    it('should test combat state machine transitions', async () => {
      // Arrange
      const combatMachine = createMachine({
        id: 'combat',
        initial: 'idle',
        context: {
          enemiesDefeated: 0,
        },
        states: {
          idle: {
            on: {
              START_BATTLE: 'fighting',
            },
          },
          fighting: {
            on: {
              ENEMY_DEFEATED: {
                actions: assign({
                  enemiesDefeated: ({ context }) => context.enemiesDefeated + 1,
                }),
              },
              VICTORY: 'victory',
              DEFEAT: 'defeat',
            },
          },
          victory: {
            type: 'final',
          },
          defeat: {
            type: 'final',
          },
        },
      });

      const actor = createTestActor(combatMachine);
      const spy = createTransitionSpy();
      actor.subscribe(spy.track);
      actor.start();

      // Act
      await sendEventAndWait(actor, { type: 'START_BATTLE' }, 'fighting');
      actor.send({ type: 'ENEMY_DEFEATED' });
      actor.send({ type: 'ENEMY_DEFEATED' });
      actor.send({ type: 'ENEMY_DEFEATED' });
      await sendEventAndWait(actor, { type: 'VICTORY' }, 'victory');

      // Assert
      const finalSnapshot = getMachineSnapshot(actor);
      const context = getContext(finalSnapshot);
      expect(context.enemiesDefeated).toBe(3);
      expect(spy.transitions.length).toBeGreaterThan(0);

      actor.stop();
    });
  });
});
