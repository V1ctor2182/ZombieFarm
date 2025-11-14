/**
 * Math & Random Utilities Test Suite
 *
 * Tests for mathematical helper functions including:
 * - Clamp (keep values within bounds)
 * - Linear interpolation (lerp)
 * - Percentage calculations
 * - Random number generators
 * - Weighted random selection (for loot tables)
 *
 * All functions should be pure (no side effects).
 */

import {
  clamp,
  lerp,
  percentage,
  percentageOf,
  randomInt,
  randomFloat,
  randomBoolean,
  randomFromArray,
  weightedRandom,
  SeededRandom,
} from '../math';

describe('Math Utilities', () => {
  describe('clamp', () => {
    it('keeps value within min-max bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('handles edge cases at boundaries', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('works with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it('works with decimal values', () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(10.1, 0, 10)).toBe(10);
      expect(clamp(-0.1, 0, 10)).toBe(0);
    });

    it('handles NaN and Infinity', () => {
      expect(clamp(NaN, 0, 10)).toBe(NaN);
      expect(clamp(Infinity, 0, 10)).toBe(10);
      expect(clamp(-Infinity, 0, 10)).toBe(0);
    });

    it('handles inverted min/max (returns max)', () => {
      // When min > max, standard behavior is to return max
      expect(clamp(5, 10, 0)).toBe(0);
      expect(clamp(15, 10, 0)).toBe(0);
    });
  });

  describe('lerp', () => {
    it('interpolates between two values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('works with negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
      expect(lerp(-5, 5, 0.25)).toBe(-2.5);
    });

    it('extrapolates beyond 0-1 range', () => {
      expect(lerp(0, 10, 1.5)).toBe(15);
      expect(lerp(0, 10, -0.5)).toBe(-5);
    });

    it('handles same start and end values', () => {
      expect(lerp(5, 5, 0)).toBe(5);
      expect(lerp(5, 5, 0.5)).toBe(5);
      expect(lerp(5, 5, 1)).toBe(5);
    });

    it('works with decimal values', () => {
      expect(lerp(1.5, 2.5, 0.5)).toBe(2);
      expect(lerp(0.1, 0.9, 0.25)).toBeCloseTo(0.3, 5);
    });
  });

  describe('percentage', () => {
    it('calculates percentage correctly', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(100, 100)).toBe(100);
    });

    it('handles zero total', () => {
      expect(percentage(0, 0)).toBe(0);
      expect(percentage(5, 0)).toBe(Infinity);
    });

    it('handles decimal results', () => {
      expect(percentage(1, 3)).toBeCloseTo(33.33, 2);
      expect(percentage(2, 3)).toBeCloseTo(66.67, 2);
    });

    it('handles values greater than total', () => {
      expect(percentage(150, 100)).toBe(150);
    });

    it('handles negative values', () => {
      expect(percentage(-50, 100)).toBe(-50);
      expect(percentage(50, -100)).toBe(-50);
    });
  });

  describe('percentageOf', () => {
    it('calculates percentage of a value', () => {
      expect(percentageOf(100, 50)).toBe(50);
      expect(percentageOf(100, 25)).toBe(25);
      expect(percentageOf(100, 100)).toBe(100);
    });

    it('handles decimal percentages', () => {
      expect(percentageOf(100, 33.33)).toBeCloseTo(33.33, 2);
      expect(percentageOf(50, 10)).toBe(5);
    });

    it('handles zero value', () => {
      expect(percentageOf(0, 50)).toBe(0);
    });

    it('handles negative values', () => {
      expect(percentageOf(100, -50)).toBe(-50);
      expect(percentageOf(-100, 50)).toBe(-50);
    });
  });

  describe('randomInt', () => {
    it('returns integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(0, 10);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(10);
      }
    });

    it('handles single value range', () => {
      for (let i = 0; i < 10; i++) {
        expect(randomInt(5, 6)).toBe(5);
      }
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(-10, 0);
        expect(value).toBeGreaterThanOrEqual(-10);
        expect(value).toBeLessThan(0);
      }
    });

    it('inclusive min, exclusive max', () => {
      const results = new Set<number>();
      for (let i = 0; i < 1000; i++) {
        results.add(randomInt(0, 5));
      }
      expect(results.has(0)).toBe(true);
      expect(results.has(4)).toBe(true);
      expect(results.has(5)).toBe(false);
    });
  });

  describe('randomFloat', () => {
    it('returns float within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomFloat(0, 10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(10);
      }
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomFloat(-5, 5);
        expect(value).toBeGreaterThanOrEqual(-5);
        expect(value).toBeLessThan(5);
      }
    });

    it('returns non-integer values', () => {
      let hasDecimal = false;
      for (let i = 0; i < 100; i++) {
        const value = randomFloat(0, 10);
        if (!Number.isInteger(value)) {
          hasDecimal = true;
          break;
        }
      }
      expect(hasDecimal).toBe(true);
    });
  });

  describe('randomBoolean', () => {
    it('returns boolean values', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomBoolean();
        expect(typeof value).toBe('boolean');
      }
    });

    it('returns both true and false over many iterations', () => {
      const results = new Set<boolean>();
      for (let i = 0; i < 1000; i++) {
        results.add(randomBoolean());
      }
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });
  });

  describe('randomFromArray', () => {
    it('returns element from array', () => {
      const array = [1, 2, 3, 4, 5];
      for (let i = 0; i < 100; i++) {
        const value = randomFromArray(array);
        expect(array).toContain(value);
      }
    });

    it('returns all elements over many iterations', () => {
      const array = ['a', 'b', 'c'];
      const results = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        results.add(randomFromArray(array));
      }
      expect(results.size).toBe(3);
    });

    it('handles single element array', () => {
      const array = [42];
      expect(randomFromArray(array)).toBe(42);
    });

    it('throws on empty array', () => {
      expect(() => randomFromArray([])).toThrow();
    });
  });

  describe('weightedRandom', () => {
    it('selects items based on weights', () => {
      const items = [
        { value: 'common', weight: 70 },
        { value: 'rare', weight: 25 },
        { value: 'legendary', weight: 5 },
      ];

      const results = new Map<string, number>();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const selected = weightedRandom(items);
        results.set(selected, (results.get(selected) || 0) + 1);
      }

      // Common should appear ~70% of the time
      const commonCount = results.get('common');
      expect(commonCount).toBeDefined();
      if (commonCount !== undefined) {
        const commonPercent = (commonCount / iterations) * 100;
        expect(commonPercent).toBeGreaterThan(65);
        expect(commonPercent).toBeLessThan(75);
      }

      // Rare should appear ~25% of the time
      const rareCount = results.get('rare');
      expect(rareCount).toBeDefined();
      if (rareCount !== undefined) {
        const rarePercent = (rareCount / iterations) * 100;
        expect(rarePercent).toBeGreaterThan(20);
        expect(rarePercent).toBeLessThan(30);
      }

      // Legendary should appear ~5% of the time
      const legendaryCount = results.get('legendary');
      expect(legendaryCount).toBeDefined();
      if (legendaryCount !== undefined) {
        const legendaryPercent = (legendaryCount / iterations) * 100;
        expect(legendaryPercent).toBeGreaterThan(2);
        expect(legendaryPercent).toBeLessThan(8);
      }
    });

    it('handles single item', () => {
      const items = [{ value: 'only', weight: 1 }];
      expect(weightedRandom(items)).toBe('only');
    });

    it('handles zero weights (should skip)', () => {
      const items = [
        { value: 'a', weight: 0 },
        { value: 'b', weight: 1 },
      ];
      // Should always return 'b' since 'a' has zero weight
      for (let i = 0; i < 10; i++) {
        expect(weightedRandom(items)).toBe('b');
      }
    });

    it('throws on empty array', () => {
      expect(() => weightedRandom([])).toThrow();
    });

    it('throws on all zero weights', () => {
      const items = [
        { value: 'a', weight: 0 },
        { value: 'b', weight: 0 },
      ];
      expect(() => weightedRandom(items)).toThrow();
    });
  });

  describe('SeededRandom', () => {
    it('produces deterministic results with same seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const sequence1 = Array.from({ length: 10 }, () => rng1.next());
      const sequence2 = Array.from({ length: 10 }, () => rng2.next());

      expect(sequence1).toEqual(sequence2);
    });

    it('produces different results with different seeds', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      const sequence1 = Array.from({ length: 10 }, () => rng1.next());
      const sequence2 = Array.from({ length: 10 }, () => rng2.next());

      expect(sequence1).not.toEqual(sequence2);
    });

    it('returns values between 0 and 1', () => {
      const rng = new SeededRandom(12345);
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('nextInt returns integers within range', () => {
      const rng = new SeededRandom(12345);
      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(0, 10);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(10);
      }
    });

    it('nextFloat returns floats within range', () => {
      const rng = new SeededRandom(12345);
      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(0, 10);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(10);
      }
    });

    it('nextBoolean returns booleans', () => {
      const rng = new SeededRandom(12345);
      const results = new Set<boolean>();
      for (let i = 0; i < 1000; i++) {
        results.add(rng.nextBoolean());
      }
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });

    it('can be reset to initial state', () => {
      const rng = new SeededRandom(12345);
      const sequence1 = Array.from({ length: 10 }, () => rng.next());

      rng.reset();
      const sequence2 = Array.from({ length: 10 }, () => rng.next());

      expect(sequence1).toEqual(sequence2);
    });
  });
});
