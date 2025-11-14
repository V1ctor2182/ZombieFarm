/**
 * Test Mocking Utilities
 *
 * Central export file for all mock utilities used in testing.
 * Import from this file to get clean, organized access to all mocking helpers.
 *
 * @example
 * ```typescript
 * import {
 *   mockLocalStorage,
 *   setupFakeTimers,
 *   mockRandomValue,
 *   createTestActor
 * } from '@lib/test-utils/mocks';
 * ```
 */

// ============================================================================
// localStorage Mocking
// ============================================================================

export {
  mockLocalStorage,
  restoreLocalStorage,
  getMockStorageContents,
  setMockStorageContents,
  clearMockStorage,
} from './mockLocalStorage';

// ============================================================================
// Timer Mocking
// ============================================================================

export {
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
  type TimerConfig,
} from './mockTimers';

// ============================================================================
// Random Number Mocking
// ============================================================================

export {
  mockRandomValue,
  mockRandomSequence,
  mockRandomSeed,
  resetRandom,
  getNextRandom,
  getSequenceIndex,
  resetSequenceIndex,
  isRandomMocked,
  randomInt,
  randomFloat,
  chance,
  randomPick,
} from './mockRandom';

// ============================================================================
// XState Testing Utilities
// ============================================================================

export {
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
