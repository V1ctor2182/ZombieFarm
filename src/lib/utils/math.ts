/**
 * Math & Random Utilities
 *
 * Pure mathematical helper functions for game calculations.
 * All functions are side-effect free and deterministic (except random functions).
 *
 * @module lib/utils/math
 */

/**
 * Clamps a value between a minimum and maximum bound.
 * Ensures the value never exceeds the bounds.
 *
 * @param value - The value to clamp
 * @param min - The minimum bound
 * @param max - The maximum bound
 * @returns The clamped value
 *
 * @example
 * clamp(5, 0, 10); // 5
 * clamp(15, 0, 10); // 10
 * clamp(-5, 0, 10); // 0
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 * Returns a value that is t% between start and end.
 *
 * @param start - The starting value
 * @param end - The ending value
 * @param t - The interpolation factor (0-1, but can extrapolate outside this range)
 * @returns The interpolated value
 *
 * @example
 * lerp(0, 10, 0.5); // 5
 * lerp(0, 10, 0); // 0
 * lerp(0, 10, 1); // 10
 * lerp(0, 10, 1.5); // 15 (extrapolation)
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculates what percentage `value` is of `total`.
 *
 * @param value - The value to calculate percentage for
 * @param total - The total value (100%)
 * @returns The percentage (0-100, or greater if value > total)
 *
 * @example
 * percentage(50, 100); // 50
 * percentage(25, 100); // 25
 * percentage(1, 3); // 33.33...
 */
export function percentage(value: number, total: number): number {
  if (total === 0) {
    return value === 0 ? 0 : Infinity;
  }
  return (value / total) * 100;
}

/**
 * Calculates a percentage of a value.
 * Inverse of `percentage()`.
 *
 * @param value - The value to take percentage of
 * @param percent - The percentage (0-100)
 * @returns The calculated amount
 *
 * @example
 * percentageOf(100, 50); // 50
 * percentageOf(100, 25); // 25
 * percentageOf(50, 10); // 5
 */
export function percentageOf(value: number, percent: number): number {
  return (value * percent) / 100;
}

/**
 * Generates a random integer between min (inclusive) and max (exclusive).
 * Uses Math.random() - for seeded random, use SeededRandom class.
 *
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns A random integer in [min, max)
 *
 * @example
 * randomInt(0, 10); // 0-9
 * randomInt(1, 7); // 1-6 (like a die)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generates a random float between min (inclusive) and max (exclusive).
 * Uses Math.random() - for seeded random, use SeededRandom class.
 *
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns A random float in [min, max)
 *
 * @example
 * randomFloat(0, 1); // 0.0-0.999...
 * randomFloat(5.0, 10.0); // 5.0-9.999...
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random boolean value.
 * Uses Math.random() - for seeded random, use SeededRandom class.
 *
 * @returns true or false with equal probability
 *
 * @example
 * randomBoolean(); // true or false
 */
export function randomBoolean(): boolean {
  return Math.random() < 0.5;
}

/**
 * Selects a random element from an array.
 * Uses Math.random() - for seeded random, use SeededRandom class.
 *
 * @param array - The array to select from
 * @returns A random element from the array
 * @throws Error if array is empty
 *
 * @example
 * randomFromArray([1, 2, 3, 4, 5]); // Random element
 * randomFromArray(['a', 'b', 'c']); // Random letter
 */
export function randomFromArray<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  return array[randomInt(0, array.length)];
}

/**
 * Weighted item for use with weightedRandom().
 */
export interface WeightedItem<T> {
  /** The value to return if selected */
  value: T;
  /** The weight (relative probability) - higher = more likely */
  weight: number;
}

/**
 * Selects an item from a weighted list based on probability.
 * Higher weight = higher probability of selection.
 * Useful for loot tables, spawn rates, mutation chances, etc.
 *
 * Uses Math.random() - for seeded random, use SeededRandom class.
 *
 * @param items - Array of weighted items
 * @returns The selected value
 * @throws Error if array is empty or all weights are zero
 *
 * @example
 * const loot = [
 *   { value: 'common', weight: 70 },
 *   { value: 'rare', weight: 25 },
 *   { value: 'legendary', weight: 5 }
 * ];
 * weightedRandom(loot); // Mostly returns 'common'
 */
export function weightedRandom<T>(items: WeightedItem<T>[]): T {
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    throw new Error('Total weight must be greater than zero');
  }

  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random < 0) {
      return item.value;
    }
  }

  // Fallback (should never reach here due to floating point precision)
  return items[items.length - 1].value;
}

/**
 * Seeded pseudo-random number generator.
 * Produces deterministic sequences for testing and procedural generation.
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 *
 * @example
 * const rng = new SeededRandom(12345);
 * rng.next(); // 0.0-0.999... (deterministic)
 * rng.nextInt(0, 10); // 0-9 (deterministic)
 * rng.reset(); // Reset to initial seed
 */
export class SeededRandom {
  private seed: number;
  private initialSeed: number;

  /**
   * Creates a new seeded random number generator.
   *
   * @param seed - The seed value (any number)
   */
  constructor(seed: number) {
    this.seed = seed;
    this.initialSeed = seed;
  }

  /**
   * Generates the next random number in the sequence.
   * Uses Linear Congruential Generator algorithm.
   *
   * @returns A pseudo-random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    // LCG formula: seed = (a * seed + c) % m
    // Using parameters from Numerical Recipes
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  /**
   * Generates a random integer between min (inclusive) and max (exclusive).
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (exclusive)
   * @returns A random integer in [min, max)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min);
  }

  /**
   * Generates a random float between min (inclusive) and max (exclusive).
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (exclusive)
   * @returns A random float in [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Generates a random boolean value.
   *
   * @returns true or false
   */
  nextBoolean(): boolean {
    return this.next() < 0.5;
  }

  /**
   * Resets the generator to its initial seed.
   * Allows reproducing the same sequence from the beginning.
   */
  reset(): void {
    this.seed = this.initialSeed;
  }
}
