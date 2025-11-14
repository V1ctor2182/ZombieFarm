/**
 * Mock timer utilities for testing time-dependent code
 *
 * Provides convenient wrappers around Jest's fake timers to make
 * testing time-based functionality (growth timers, decay, cooldowns)
 * easier and more readable.
 *
 * @example
 * ```typescript
 * import { setupFakeTimers, advanceTime, teardownFakeTimers } from '@lib/test-utils/mocks';
 *
 * beforeEach(() => {
 *   setupFakeTimers();
 * });
 *
 * afterEach(() => {
 *   teardownFakeTimers();
 * });
 *
 * test('zombie growth completes after 1 hour', () => {
 *   plantZombie('shambler'); // Takes 1 hour to grow
 *   advanceTime(60 * 60 * 1000); // 1 hour in ms
 *   expect(isZombieReady()).toBe(true);
 * });
 * ```
 */

/**
 * Type for timer configuration
 */
export type TimerConfig = {
  /**
   * Whether to enable legacy timers (default: false)
   */
  legacyFakeTimers?: boolean;
  /**
   * Whether to advance timers automatically (default: false)
   */
  advanceTimers?: number;
  /**
   * Timer limit before error (default: none)
   */
  timerLimit?: number;
};

/**
 * Track whether fake timers are currently enabled
 */
let timersEnabled = false;

/**
 * Enable Jest fake timers
 *
 * Replaces real timers (setTimeout, setInterval, Date) with Jest-controlled
 * fake timers. This allows tests to advance time programmatically.
 *
 * @param config - Optional timer configuration
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   setupFakeTimers();
 * });
 * ```
 */
export function setupFakeTimers(config: TimerConfig = {}): void {
  if (timersEnabled) {
    console.warn('Fake timers already enabled. Call teardownFakeTimers() first.');
    return;
  }

  jest.useFakeTimers({
    legacyFakeTimers: config.legacyFakeTimers ?? false,
    advanceTimers: config.advanceTimers,
    timerLimit: config.timerLimit,
  });

  timersEnabled = true;
}

/**
 * Disable fake timers and restore real timers
 *
 * Always call this in afterEach to ensure proper cleanup.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   teardownFakeTimers();
 * });
 * ```
 */
export function teardownFakeTimers(): void {
  if (!timersEnabled) {
    return;
  }

  jest.useRealTimers();
  timersEnabled = false;
}

/**
 * Advance fake timers by a specified amount of time
 *
 * This will execute all timers (setTimeout, setInterval) that would fire
 * during this time period.
 *
 * @param ms - Milliseconds to advance
 *
 * @example
 * ```typescript
 * // Advance by 1 second
 * advanceTime(1000);
 *
 * // Advance by 1 hour
 * advanceTime(60 * 60 * 1000);
 *
 * // Advance by 1 day
 * advanceTime(24 * 60 * 60 * 1000);
 * ```
 */
export function advanceTime(ms: number): void {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  jest.advanceTimersByTime(ms);
}

/**
 * Advance timers to the next pending timer
 *
 * Runs only the next scheduled timer, useful for stepping through
 * timers one at a time.
 *
 * @returns The time (in ms) advanced
 *
 * @example
 * ```typescript
 * setTimeout(() => console.log('First'), 100);
 * setTimeout(() => console.log('Second'), 200);
 *
 * advanceToNextTimer(); // Logs "First", advances 100ms
 * advanceToNextTimer(); // Logs "Second", advances 100ms more
 * ```
 */
export function advanceToNextTimer(): number {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  const before = jest.now();
  jest.advanceTimersToNextTimer();
  return jest.now() - before;
}

/**
 * Run all pending timers
 *
 * Executes all pending timers until there are no more. Use with caution
 * with setInterval as it may run indefinitely.
 *
 * @example
 * ```typescript
 * setTimeout(() => doSomething(), 1000);
 * setTimeout(() => doSomethingElse(), 2000);
 *
 * runAllTimers(); // Both callbacks execute
 * ```
 */
export function runAllTimers(): void {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  jest.runAllTimers();
}

/**
 * Run only currently pending timers
 *
 * Unlike runAllTimers(), this will not execute newly scheduled timers
 * that are created during execution.
 *
 * @example
 * ```typescript
 * setTimeout(() => {
 *   console.log('First');
 *   setTimeout(() => console.log('Second'), 100);
 * }, 100);
 *
 * runOnlyPendingTimers(); // Logs "First" only
 * ```
 */
export function runOnlyPendingTimers(): void {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  jest.runOnlyPendingTimers();
}

/**
 * Get the number of pending timers
 *
 * Useful for assertions or debugging.
 *
 * @returns Number of pending timers
 *
 * @example
 * ```typescript
 * setTimeout(() => {}, 1000);
 * setTimeout(() => {}, 2000);
 *
 * expect(getTimerCount()).toBe(2);
 *
 * advanceTime(1000);
 * expect(getTimerCount()).toBe(1);
 * ```
 */
export function getTimerCount(): number {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  return jest.getTimerCount();
}

/**
 * Get the current fake time
 *
 * Returns the current time according to fake timers.
 *
 * @returns Current fake time in milliseconds since epoch
 *
 * @example
 * ```typescript
 * const start = getCurrentTime();
 * advanceTime(5000);
 * expect(getCurrentTime() - start).toBe(5000);
 * ```
 */
export function getCurrentTime(): number {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  return jest.now();
}

/**
 * Set the fake time to a specific value
 *
 * Sets the current time for fake timers. Does not execute pending timers.
 *
 * @param timestamp - The time to set (milliseconds since epoch)
 *
 * @example
 * ```typescript
 * // Set to a specific date
 * setCurrentTime(new Date('2025-11-12').getTime());
 * ```
 */
export function setCurrentTime(timestamp: number): void {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  jest.setSystemTime(timestamp);
}

/**
 * Clear all pending timers
 *
 * Removes all scheduled timers without executing them.
 *
 * @example
 * ```typescript
 * setTimeout(() => {}, 1000);
 * setTimeout(() => {}, 2000);
 *
 * clearAllTimers();
 * expect(getTimerCount()).toBe(0);
 * ```
 */
export function clearAllTimers(): void {
  if (!timersEnabled) {
    throw new Error('Fake timers not enabled. Call setupFakeTimers() first.');
  }

  jest.clearAllTimers();
}

/**
 * Helper: Advance time by seconds
 *
 * @param seconds - Number of seconds to advance
 *
 * @example
 * ```typescript
 * advanceTimeBySeconds(30); // Advance 30 seconds
 * ```
 */
export function advanceTimeBySeconds(seconds: number): void {
  advanceTime(seconds * 1000);
}

/**
 * Helper: Advance time by minutes
 *
 * @param minutes - Number of minutes to advance
 *
 * @example
 * ```typescript
 * advanceTimeByMinutes(5); // Advance 5 minutes
 * ```
 */
export function advanceTimeByMinutes(minutes: number): void {
  advanceTime(minutes * 60 * 1000);
}

/**
 * Helper: Advance time by hours
 *
 * @param hours - Number of hours to advance
 *
 * @example
 * ```typescript
 * advanceTimeByHours(2); // Advance 2 hours
 * ```
 */
export function advanceTimeByHours(hours: number): void {
  advanceTime(hours * 60 * 60 * 1000);
}

/**
 * Helper: Advance time by days
 *
 * @param days - Number of days to advance
 *
 * @example
 * ```typescript
 * advanceTimeByDays(1); // Advance 1 day (useful for decay testing)
 * ```
 */
export function advanceTimeByDays(days: number): void {
  advanceTime(days * 24 * 60 * 60 * 1000);
}

/**
 * Check if fake timers are currently enabled
 *
 * @returns True if fake timers are enabled
 *
 * @example
 * ```typescript
 * if (areTimersEnabled()) {
 *   advanceTime(1000);
 * }
 * ```
 */
export function areTimersEnabled(): boolean {
  return timersEnabled;
}
