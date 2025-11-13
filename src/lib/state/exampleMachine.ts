/**
 * Example State Machine
 *
 * A simple counter machine to demonstrate XState integration.
 * This will be replaced with actual game state machines.
 */

import { assign, setup } from 'xstate';

/**
 * Context type for the example machine
 */
interface ExampleContext {
  count: number;
  lastUpdated: number;
}

/**
 * Events for the example machine
 */
type ExampleEvent =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; value: number };

/**
 * Example Counter Machine
 *
 * Demonstrates XState v5 setup and usage.
 */
export const exampleMachine = setup({
  types: {
    context: {} as ExampleContext,
    events: {} as ExampleEvent,
  },
}).createMachine({
  context: {
    count: 0,
    lastUpdated: Date.now(),
  },

  id: 'example',

  initial: 'idle',

  states: {
    idle: {
      on: {
        INCREMENT: {
          actions: assign({
            count: ({ context }) => context.count + 1,
            lastUpdated: () => Date.now(),
          }),
        },
        DECREMENT: {
          actions: assign({
            count: ({ context }) => context.count - 1,
            lastUpdated: () => Date.now(),
          }),
        },
        RESET: {
          actions: assign({
            count: () => 0,
            lastUpdated: () => Date.now(),
          }),
        },
        SET: {
          actions: assign({
            count: ({ event }) => event.value,
            lastUpdated: () => Date.now(),
          }),
        },
      },
    },
  },
});
