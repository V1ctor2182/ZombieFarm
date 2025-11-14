/**
 * XState testing utilities
 *
 * Provides helpers for testing XState state machines, including utilities
 * for waiting for state transitions, asserting states, and creating test actors.
 *
 * @example
 * ```typescript
 * import { createTestActor, waitForState, expectState } from '@lib/test-utils/mocks';
 * import { myMachine } from './myMachine';
 *
 * test('machine transitions correctly', async () => {
 *   const actor = createTestActor(myMachine);
 *   actor.start();
 *
 *   expectState(actor, 'idle');
 *   actor.send({ type: 'START' });
 *   await waitForState(actor, 'running');
 *   expectState(actor, 'running');
 * });
 * ```
 */

import { type Actor, type AnyStateMachine, createActor, type EventObject, type Snapshot } from 'xstate';

/**
 * Default timeout for waiting operations (ms)
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * Wait for a state machine actor to enter a specific state
 *
 * Returns a promise that resolves when the machine enters the target state.
 * Rejects if timeout is exceeded.
 *
 * @param actor - The XState actor to monitor
 * @param stateName - The state name to wait for (e.g., 'idle', 'running')
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise that resolves when state is reached
 *
 * @example
 * ```typescript
 * actor.send({ type: 'START_GROWTH' });
 * await waitForState(actor, 'growing', 10000);
 * expect(actor.getSnapshot().value).toBe('growing');
 * ```
 */
export async function waitForState(
  actor: Actor<AnyStateMachine>,
  stateName: string,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already in target state
    const currentSnapshot = actor.getSnapshot();
    if (isInState(currentSnapshot, stateName)) {
      resolve();
      return;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      subscription.unsubscribe();
      reject(new Error(`Timeout waiting for state '${stateName}' after ${timeout}ms`));
    }, timeout);

    // Subscribe to state changes
    const subscription = actor.subscribe((snapshot) => {
      if (isInState(snapshot, stateName)) {
        clearTimeout(timeoutId);
        subscription.unsubscribe();
        resolve();
      }
    });
  });
}

/**
 * Assert that an actor is currently in a specific state
 *
 * Throws an error if the actor is not in the expected state.
 *
 * @param actor - The XState actor to check
 * @param stateName - The expected state name
 *
 * @example
 * ```typescript
 * expectState(actor, 'idle');
 * actor.send({ type: 'START' });
 * expectState(actor, 'running');
 * ```
 */
export function expectState(actor: Actor<AnyStateMachine>, stateName: string): void {
  const snapshot = actor.getSnapshot();
  if (!isInState(snapshot, stateName)) {
    const currentState = getStateValue(snapshot);
    throw new Error(`Expected state '${stateName}', but current state is '${currentState}'`);
  }
}

/**
 * Send an event to an actor and wait for a specific state
 *
 * Convenience function that combines sending an event and waiting for the result state.
 *
 * @param actor - The XState actor
 * @param event - The event to send
 * @param expectedState - The state to wait for
 * @param timeout - Maximum time to wait (default: 5000ms)
 *
 * @example
 * ```typescript
 * await sendEventAndWait(actor, { type: 'PLANT_SEED' }, 'growing');
 * expectState(actor, 'growing');
 * ```
 */
export async function sendEventAndWait(
  actor: Actor<AnyStateMachine>,
  event: EventObject,
  expectedState: string,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  actor.send(event);
  await waitForState(actor, expectedState, timeout);
}

/**
 * Get a snapshot of the current machine state
 *
 * Returns the complete snapshot including state value and context.
 *
 * @param actor - The XState actor
 * @returns Current snapshot
 *
 * @example
 * ```typescript
 * const snapshot = getMachineSnapshot(actor);
 * expect(snapshot.context.zombieCount).toBe(5);
 * ```
 */
export function getMachineSnapshot<TMachine extends AnyStateMachine>(
  actor: Actor<TMachine>,
): Snapshot<unknown> {
  return actor.getSnapshot();
}

/**
 * Create a test actor from a machine
 *
 * Creates and returns an XState actor for testing. The actor is not started
 * automatically - call actor.start() when ready.
 *
 * To customize initial context, use machine.provide() before passing to this function.
 *
 * @param machine - The XState machine definition
 * @returns The created actor (not started)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const actor = createTestActor(farmMachine);
 * actor.start();
 *
 * // With custom context
 * const customMachine = farmMachine.provide({
 *   context: { zombies: [], resources: { bones: 100 } }
 * });
 * const actor = createTestActor(customMachine);
 * actor.start();
 * ```
 */
export function createTestActor<TMachine extends AnyStateMachine>(machine: TMachine): Actor<TMachine> {
  return createActor(machine);
}

/**
 * Get the current state value as a string
 *
 * Handles both simple states ('idle') and nested states ('farm.planting').
 *
 * @param snapshot - The state snapshot
 * @returns State value as string
 *
 * @example
 * ```typescript
 * const snapshot = actor.getSnapshot();
 * const state = getStateValue(snapshot);
 * expect(state).toBe('idle');
 * ```
 */
export function getStateValue(snapshot: Snapshot<unknown>): string {
  const value = snapshot.value;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    // Handle nested states (e.g., { farm: 'planting' } -> 'farm.planting')
    return Object.entries(value)
      .map(([key, val]) => (val ? `${key}.${val}` : key))
      .join('.');
  }

  return String(value);
}

/**
 * Check if a snapshot is in a specific state
 *
 * Handles both simple and nested state matching.
 *
 * @param snapshot - The state snapshot
 * @param stateName - The state to check for
 * @returns True if in the specified state
 *
 * @example
 * ```typescript
 * const snapshot = actor.getSnapshot();
 * if (isInState(snapshot, 'idle')) {
 *   // Do something
 * }
 * ```
 */
export function isInState(snapshot: Snapshot<unknown>, stateName: string): boolean {
  const currentState = getStateValue(snapshot);

  // Exact match
  if (currentState === stateName) {
    return true;
  }

  // Partial match for nested states (e.g., 'farm' matches 'farm.planting')
  if (currentState.startsWith(`${stateName}.`)) {
    return true;
  }

  return false;
}

/**
 * Wait for the actor to emit a snapshot (next state change)
 *
 * Useful for testing that an actor reacts to events or time.
 *
 * @param actor - The XState actor
 * @param timeout - Maximum time to wait (default: 5000ms)
 * @returns Promise that resolves with the next snapshot
 *
 * @example
 * ```typescript
 * actor.send({ type: 'START' });
 * const snapshot = await waitForSnapshot(actor);
 * expect(snapshot.value).toBe('running');
 * ```
 */
export async function waitForSnapshot(
  actor: Actor<AnyStateMachine>,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<Snapshot<unknown>> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      subscription.unsubscribe();
      reject(new Error(`Timeout waiting for snapshot after ${timeout}ms`));
    }, timeout);

    const subscription = actor.subscribe((snapshot) => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      resolve(snapshot);
    });
  });
}

/**
 * Get the context from a snapshot
 *
 * Type-safe helper to extract context from a snapshot.
 *
 * @param snapshot - The state snapshot
 * @returns The context object
 *
 * @example
 * ```typescript
 * const snapshot = actor.getSnapshot();
 * const context = getContext(snapshot);
 * expect(context.zombieCount).toBe(5);
 * ```
 */
export function getContext<TContext = any>(snapshot: Snapshot<unknown>): TContext {
  return snapshot.context as TContext;
}

/**
 * Check if an actor can accept a specific event in its current state
 *
 * Useful for testing guard conditions and state-dependent behavior.
 *
 * @param actor - The XState actor
 * @param eventType - The event type to check
 * @returns True if the event can be sent
 *
 * @example
 * ```typescript
 * if (canSendEvent(actor, 'HARVEST')) {
 *   actor.send({ type: 'HARVEST' });
 * }
 * ```
 */
export function canSendEvent(actor: Actor<AnyStateMachine>, eventType: string): boolean {
  const snapshot = actor.getSnapshot();
  // XState v5 provides a way to check if an event can be sent
  // This is a simplified version - you may need to adapt based on your machine setup
  return snapshot.can({ type: eventType } as EventObject);
}

/**
 * Create a spy that tracks all state transitions
 *
 * Returns a function that can be passed to actor.subscribe() to log all transitions.
 *
 * @returns Object with transitions array and subscribe function
 *
 * @example
 * ```typescript
 * const spy = createTransitionSpy();
 * actor.subscribe(spy.track);
 * actor.send({ type: 'START' });
 * expect(spy.transitions).toHaveLength(1);
 * expect(spy.transitions[0].value).toBe('running');
 * ```
 */
export function createTransitionSpy() {
  const transitions: Snapshot<unknown>[] = [];

  return {
    transitions,
    track: (snapshot: Snapshot<unknown>) => {
      transitions.push(snapshot);
    },
    clear: () => {
      transitions.length = 0;
    },
  };
}

/**
 * Create a spy that tracks all events sent to an actor
 *
 * Returns an object that can intercept and log events.
 *
 * @returns Object with events array and send wrapper
 *
 * @example
 * ```typescript
 * const spy = createEventSpy();
 * const wrappedSend = spy.wrap(actor.send.bind(actor));
 * wrappedSend({ type: 'START' });
 * expect(spy.events).toContainEqual({ type: 'START' });
 * ```
 */
export function createEventSpy() {
  const events: EventObject[] = [];

  return {
    events,
    wrap: (originalSend: (event: EventObject) => void) => {
      return (event: EventObject) => {
        events.push(event);
        originalSend(event);
      };
    },
    clear: () => {
      events.length = 0;
    },
  };
}
