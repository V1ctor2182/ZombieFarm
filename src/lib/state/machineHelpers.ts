/**
 * XState Machine Helpers
 *
 * Type helpers and utilities for working with XState machines.
 * Provides type-safe machine creation and context management.
 */

import { setup } from 'xstate';

/**
 * Re-export setup for convenience
 * This is the main way to create machines in XState v5
 */
export { setup };

/**
 * Alias for setup to match v4 API
 */
export const createMachine = setup;
