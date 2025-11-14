/**
 * Mock random number generator for deterministic testing
 *
 * Provides utilities to control random number generation in tests,
 * ensuring predictable behavior for features like mutations, critical hits,
 * and other RNG-dependent game mechanics.
 *
 * @example
 * ```typescript
 * import { mockRandomValue, resetRandom } from '@lib/test-utils/mocks';
 *
 * beforeEach(() => {
 *   mockRandomValue(0.5); // All Math.random() calls return 0.5
 * });
 *
 * afterEach(() => {
 *   resetRandom();
 * });
 *
 * test('mutation occurs at 50% threshold', () => {
 *   const result = checkMutation(0.5); // Uses mocked 0.5
 *   expect(result).toBe(true);
 * });
 * ```
 */

/**
 * Original Math.random function
 */
let originalRandom: () => number;

/**
 * Current mock random function
 */
let mockRandomFn: (() => number) | null = null;

/**
 * Sequence of values for mockRandomSequence
 */
let sequenceValues: number[] = [];
let sequenceIndex = 0;

/**
 * Simple seeded random number generator (LCG algorithm)
 * Used for mockRandomSeed
 *
 * @param seed - The seed value
 * @returns A seeded random function
 */
function createSeededRandom(seed: number): () => number {
  // Use absolute value to ensure positive state
  let state = Math.abs(seed) || 1;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  return () => {
    state = (a * state + c) % m;
    return state / m;
  };
}

/**
 * Mock Math.random to always return a specific value
 *
 * Useful for testing specific probability outcomes.
 *
 * @param value - The value to return (should be between 0 and 1)
 *
 * @example
 * ```typescript
 * mockRandomValue(0.1); // 10% chance events will trigger
 * mockRandomValue(0.9); // 90% chance events will trigger
 * mockRandomValue(0); // Always minimum random value
 * mockRandomValue(0.999999); // Always maximum random value
 * ```
 */
export function mockRandomValue(value: number): void {
  if (value < 0 || value >= 1) {
    throw new Error('Random value must be >= 0 and < 1');
  }

  if (!originalRandom) {
    originalRandom = Math.random;
  }

  mockRandomFn = () => value;
  Math.random = mockRandomFn;
}

/**
 * Mock Math.random to return a specific sequence of values
 *
 * Each call to Math.random() will return the next value in the sequence.
 * After the sequence is exhausted, it cycles back to the beginning.
 *
 * @param values - Array of values to return in sequence
 *
 * @example
 * ```typescript
 * mockRandomSequence([0.1, 0.5, 0.9]);
 * Math.random(); // 0.1
 * Math.random(); // 0.5
 * Math.random(); // 0.9
 * Math.random(); // 0.1 (cycles back)
 * ```
 */
export function mockRandomSequence(values: number[]): void {
  if (values.length === 0) {
    throw new Error('Sequence must contain at least one value');
  }

  if (values.some((v) => v < 0 || v >= 1)) {
    throw new Error('All sequence values must be >= 0 and < 1');
  }

  if (!originalRandom) {
    originalRandom = Math.random;
  }

  sequenceValues = [...values];
  sequenceIndex = 0;

  mockRandomFn = () => {
    const value = sequenceValues[sequenceIndex];
    sequenceIndex = (sequenceIndex + 1) % sequenceValues.length;
    return value;
  };

  Math.random = mockRandomFn;
}

/**
 * Mock Math.random to use a seeded random number generator
 *
 * Provides deterministic randomness - the same seed will always
 * produce the same sequence of random numbers.
 *
 * @param seed - The seed value (any number)
 *
 * @example
 * ```typescript
 * mockRandomSeed(12345);
 * const values1 = [Math.random(), Math.random(), Math.random()];
 *
 * mockRandomSeed(12345); // Same seed
 * const values2 = [Math.random(), Math.random(), Math.random()];
 *
 * expect(values1).toEqual(values2); // Same sequence
 * ```
 */
export function mockRandomSeed(seed: number): void {
  if (!originalRandom) {
    originalRandom = Math.random;
  }

  mockRandomFn = createSeededRandom(seed);
  Math.random = mockRandomFn;
}

/**
 * Restore the original Math.random function
 *
 * Always call this in afterEach to clean up properly.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   resetRandom();
 * });
 * ```
 */
export function resetRandom(): void {
  if (originalRandom) {
    Math.random = originalRandom;
    originalRandom = undefined as any;
  }

  mockRandomFn = null;
  sequenceValues = [];
  sequenceIndex = 0;
}

/**
 * Get the next random value without consuming it
 *
 * Useful for debugging or assertions. Only works with mockRandomSequence.
 *
 * @returns The next value that will be returned, or null if not using sequence
 *
 * @example
 * ```typescript
 * mockRandomSequence([0.1, 0.5, 0.9]);
 * expect(getNextRandom()).toBe(0.1);
 * Math.random(); // Consumes 0.1
 * expect(getNextRandom()).toBe(0.5);
 * ```
 */
export function getNextRandom(): number | null {
  if (sequenceValues.length === 0) {
    return null;
  }

  return sequenceValues[sequenceIndex];
}

/**
 * Get the current sequence index
 *
 * Useful for debugging sequence-based tests.
 *
 * @returns Current index in the sequence, or -1 if not using sequence
 *
 * @example
 * ```typescript
 * mockRandomSequence([0.1, 0.5, 0.9]);
 * expect(getSequenceIndex()).toBe(0);
 * Math.random();
 * expect(getSequenceIndex()).toBe(1);
 * ```
 */
export function getSequenceIndex(): number {
  if (sequenceValues.length === 0) {
    return -1;
  }

  return sequenceIndex;
}

/**
 * Reset the sequence index to the beginning
 *
 * Restarts the sequence without changing the values.
 *
 * @example
 * ```typescript
 * mockRandomSequence([0.1, 0.5, 0.9]);
 * Math.random(); // 0.1
 * Math.random(); // 0.5
 * resetSequenceIndex();
 * Math.random(); // 0.1 (back to start)
 * ```
 */
export function resetSequenceIndex(): void {
  sequenceIndex = 0;
}

/**
 * Check if random is currently mocked
 *
 * @returns True if Math.random is mocked
 *
 * @example
 * ```typescript
 * expect(isRandomMocked()).toBe(false);
 * mockRandomValue(0.5);
 * expect(isRandomMocked()).toBe(true);
 * resetRandom();
 * expect(isRandomMocked()).toBe(false);
 * ```
 */
export function isRandomMocked(): boolean {
  return mockRandomFn !== null;
}

/**
 * Generate a deterministic random integer between min and max (inclusive)
 *
 * Helper that uses the current mock or real random.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max
 *
 * @example
 * ```typescript
 * mockRandomValue(0.5);
 * const value = randomInt(0, 10); // Deterministic based on mock
 * ```
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a deterministic random float between min and max
 *
 * Helper that uses the current mock or real random.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random float between min and max
 *
 * @example
 * ```typescript
 * mockRandomValue(0.5);
 * const value = randomFloat(0, 100); // Returns 50
 * ```
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Simulate a probability check
 *
 * Helper that returns true if random value is less than the threshold.
 *
 * @param probability - Probability threshold (0 to 1)
 * @returns True if random value < probability
 *
 * @example
 * ```typescript
 * mockRandomValue(0.3);
 * expect(chance(0.5)).toBe(true); // 0.3 < 0.5
 * expect(chance(0.2)).toBe(false); // 0.3 >= 0.2
 * ```
 */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Pick a random element from an array
 *
 * Helper that uses the current mock or real random.
 *
 * @param array - Array to pick from
 * @returns Random element from array
 *
 * @example
 * ```typescript
 * mockRandomValue(0.5);
 * const items = ['a', 'b', 'c', 'd'];
 * const picked = randomPick(items); // Deterministic based on mock
 * ```
 */
export function randomPick<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
  }

  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
