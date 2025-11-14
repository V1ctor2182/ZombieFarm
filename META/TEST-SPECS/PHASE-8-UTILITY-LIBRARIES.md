---
title: 'Test Specifications - Phase 8: Utility Libraries'
phase: 'Core Phase 8'
module: 'CORE'
created: 2025-11-13
author: 'TEST Agent (test-qa-guardian)'
status: 'Ready for Implementation'
---

# Test Specifications: Phase 8 - Utility Libraries

## Overview

This document provides comprehensive test specifications for all four utility modules in Phase 8 of the CORE module:

- **8.1 Math & Random Utilities** (`src/lib/utils/math.ts`)
- **8.2 Formatting Utilities** (`src/lib/utils/format.ts`)
- **8.3 Validation Utilities** (`src/lib/utils/validation.ts`)
- **8.4 Array & Object Utilities** (`src/lib/utils/collections.ts`)

### Testing Approach

Following TDD methodology from `/Users/victor/work/ZombieFarm/META/TESTING.md`:

- **Coverage Target**: ~100% for utility functions (critical infrastructure code)
- **Test Structure**: AAA pattern (Arrange, Act, Assert)
- **Edge Cases**: Extensive coverage of boundary conditions, invalid inputs, and error states
- **Performance**: Tests for computationally intensive operations
- **Immutability**: Verification that pure functions don't mutate inputs

### Test File Locations

```
src/lib/utils/
├── math.ts               # Implementation
├── math.test.ts          # Tests (this spec)
├── format.ts             # Implementation
├── format.test.ts        # Tests (this spec)
├── validation.ts         # Implementation
├── validation.test.ts    # Tests (this spec)
├── collections.ts        # Implementation
└── collections.test.ts   # Tests (this spec)
```

---

## 8.1 Math & Random Utilities

**File**: `src/lib/utils/math.ts`
**Test File**: `src/lib/utils/math.test.ts`

### Function: `clamp(value: number, min: number, max: number): number`

**Description**: Constrains a number to be within specified bounds.

**Test Scenarios**:

```typescript
describe('clamp', () => {
  describe('normal cases', () => {
    it('returns value when within bounds', () => {
      // Arrange
      const value = 5;
      const min = 0;
      const max = 10;

      // Act
      const result = clamp(value, min, max);

      // Assert
      expect(result).toBe(5);
    });

    it('returns min when value is below minimum', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above maximum', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns min when value equals minimum', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it('returns max when value equals maximum', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('handles negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it('handles zero as min or max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, -10, 0)).toBe(-5);
    });

    it('handles min === max (degenerate case)', () => {
      expect(clamp(5, 7, 7)).toBe(7);
      expect(clamp(7, 7, 7)).toBe(7);
    });

    it('handles very large numbers', () => {
      expect(clamp(Number.MAX_SAFE_INTEGER + 1, 0, 100)).toBe(100);
      expect(clamp(1e308, 0, 100)).toBe(100);
    });

    it('handles very small numbers', () => {
      expect(clamp(Number.MIN_SAFE_INTEGER - 1, 0, 100)).toBe(0);
      expect(clamp(-1e308, 0, 100)).toBe(0);
    });
  });

  describe('special values', () => {
    it('returns NaN when value is NaN', () => {
      expect(clamp(NaN, 0, 10)).toBeNaN();
    });

    it('returns Infinity when clamping Infinity within infinite bounds', () => {
      expect(clamp(Infinity, -Infinity, Infinity)).toBe(Infinity);
      expect(clamp(-Infinity, -Infinity, Infinity)).toBe(-Infinity);
    });

    it('clamps Infinity to max when max is finite', () => {
      expect(clamp(Infinity, 0, 10)).toBe(10);
    });

    it('clamps -Infinity to min when min is finite', () => {
      expect(clamp(-Infinity, 0, 10)).toBe(0);
    });
  });

  describe('error cases', () => {
    it('throws error when min > max', () => {
      expect(() => clamp(5, 10, 0)).toThrow('min cannot be greater than max');
    });
  });
});
```

---

### Function: `lerp(start: number, end: number, t: number): number`

**Description**: Linear interpolation between two values. Returns `start + (end - start) * t`.

**Test Scenarios**:

```typescript
describe('lerp', () => {
  describe('normal cases', () => {
    it('returns start when t is 0', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(5, 15, 0)).toBe(5);
    });

    it('returns end when t is 1', () => {
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(5, 15, 1)).toBe(15);
    });

    it('returns midpoint when t is 0.5', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.5)).toBe(15);
    });

    it('interpolates correctly at arbitrary t', () => {
      expect(lerp(0, 100, 0.25)).toBe(25);
      expect(lerp(0, 100, 0.75)).toBe(75);
    });

    it('works with negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
      expect(lerp(-100, -50, 0.5)).toBe(-75);
    });

    it('works when start > end (reverse interpolation)', () => {
      expect(lerp(10, 0, 0.5)).toBe(5);
      expect(lerp(100, 50, 0.25)).toBe(87.5);
    });
  });

  describe('extrapolation', () => {
    it('extrapolates when t < 0', () => {
      expect(lerp(0, 10, -0.5)).toBe(-5);
      expect(lerp(5, 15, -1)).toBe(-5);
    });

    it('extrapolates when t > 1', () => {
      expect(lerp(0, 10, 1.5)).toBe(15);
      expect(lerp(5, 15, 2)).toBe(25);
    });
  });

  describe('edge cases', () => {
    it('handles start === end', () => {
      expect(lerp(5, 5, 0)).toBe(5);
      expect(lerp(5, 5, 0.5)).toBe(5);
      expect(lerp(5, 5, 1)).toBe(5);
    });

    it('handles very small t values', () => {
      expect(lerp(0, 100, 0.0001)).toBeCloseTo(0.01, 5);
    });

    it('handles floating point precision', () => {
      expect(lerp(0, 1, 0.1 + 0.2)).toBeCloseTo(lerp(0, 1, 0.3), 10);
    });
  });

  describe('special values', () => {
    it('returns NaN when start is NaN', () => {
      expect(lerp(NaN, 10, 0.5)).toBeNaN();
    });

    it('returns NaN when end is NaN', () => {
      expect(lerp(0, NaN, 0.5)).toBeNaN();
    });

    it('returns NaN when t is NaN', () => {
      expect(lerp(0, 10, NaN)).toBeNaN();
    });

    it('handles Infinity', () => {
      expect(lerp(0, Infinity, 0.5)).toBe(Infinity);
      expect(lerp(-Infinity, 0, 0.5)).toBe(-Infinity);
    });
  });
});
```

---

### Function: `percentage(value: number, total: number): number`

**Description**: Calculates what percentage `value` is of `total`. Returns `(value / total) * 100`.

**Test Scenarios**:

```typescript
describe('percentage', () => {
  describe('normal cases', () => {
    it('calculates basic percentages', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(75, 100)).toBe(75);
    });

    it('calculates percentages with non-100 totals', () => {
      expect(percentage(1, 4)).toBe(25);
      expect(percentage(3, 4)).toBe(75);
      expect(percentage(5, 20)).toBe(25);
    });

    it('returns 0 when value is 0', () => {
      expect(percentage(0, 100)).toBe(0);
      expect(percentage(0, 1)).toBe(0);
    });

    it('returns 100 when value equals total', () => {
      expect(percentage(100, 100)).toBe(100);
      expect(percentage(50, 50)).toBe(100);
    });

    it('returns values > 100 when value > total', () => {
      expect(percentage(150, 100)).toBe(150);
      expect(percentage(200, 100)).toBe(200);
    });

    it('handles decimal results', () => {
      expect(percentage(1, 3)).toBeCloseTo(33.333333, 5);
      expect(percentage(2, 3)).toBeCloseTo(66.666667, 5);
    });
  });

  describe('negative values', () => {
    it('handles negative value', () => {
      expect(percentage(-50, 100)).toBe(-50);
    });

    it('handles negative total', () => {
      expect(percentage(50, -100)).toBe(-50);
    });

    it('handles both negative', () => {
      expect(percentage(-50, -100)).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('throws error when total is 0', () => {
      expect(() => percentage(50, 0)).toThrow('Cannot calculate percentage of zero');
    });

    it('handles very small totals', () => {
      expect(percentage(1, 0.01)).toBe(10000);
    });

    it('handles very large values', () => {
      expect(percentage(1e10, 1e11)).toBe(10);
    });
  });

  describe('special values', () => {
    it('returns NaN when value is NaN', () => {
      expect(percentage(NaN, 100)).toBeNaN();
    });

    it('returns NaN when total is NaN', () => {
      expect(percentage(50, NaN)).toBeNaN();
    });

    it('returns Infinity when value is Infinity', () => {
      expect(percentage(Infinity, 100)).toBe(Infinity);
    });
  });
});
```

---

### Function: `percentageOf(percentage: number, total: number): number`

**Description**: Calculates what value represents a given percentage of a total. Returns `(percentage / 100) * total`.

**Test Scenarios**:

```typescript
describe('percentageOf', () => {
  describe('normal cases', () => {
    it('calculates values from percentages', () => {
      expect(percentageOf(50, 100)).toBe(50);
      expect(percentageOf(25, 100)).toBe(25);
      expect(percentageOf(75, 200)).toBe(150);
    });

    it('returns 0 when percentage is 0', () => {
      expect(percentageOf(0, 100)).toBe(0);
    });

    it('returns total when percentage is 100', () => {
      expect(percentageOf(100, 100)).toBe(100);
      expect(percentageOf(100, 50)).toBe(50);
    });

    it('handles fractional percentages', () => {
      expect(percentageOf(0.5, 100)).toBe(0.5);
      expect(percentageOf(33.33, 300)).toBeCloseTo(99.99, 2);
    });

    it('handles percentages > 100', () => {
      expect(percentageOf(150, 100)).toBe(150);
      expect(percentageOf(200, 50)).toBe(100);
    });
  });

  describe('inverse of percentage function', () => {
    it('is inverse of percentage()', () => {
      const value = 37;
      const total = 149;
      const pct = percentage(value, total);
      expect(percentageOf(pct, total)).toBeCloseTo(value, 10);
    });
  });

  describe('edge cases', () => {
    it('handles zero total', () => {
      expect(percentageOf(50, 0)).toBe(0);
    });

    it('handles negative percentage', () => {
      expect(percentageOf(-50, 100)).toBe(-50);
    });

    it('handles negative total', () => {
      expect(percentageOf(50, -100)).toBe(-50);
    });
  });

  describe('special values', () => {
    it('returns NaN when percentage is NaN', () => {
      expect(percentageOf(NaN, 100)).toBeNaN();
    });

    it('returns NaN when total is NaN', () => {
      expect(percentageOf(50, NaN)).toBeNaN();
    });
  });
});
```

---

### Function: `randomInt(min: number, max: number): number`

**Description**: Returns a random integer between `min` (inclusive) and `max` (inclusive).

**Test Scenarios**:

```typescript
describe('randomInt', () => {
  describe('normal cases', () => {
    it('returns integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('can return min value', () => {
      // Mock Math.random to return 0
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(randomInt(5, 10)).toBe(5);
      spy.mockRestore();
    });

    it('can return max value', () => {
      // Mock Math.random to return value just below 1
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
      expect(randomInt(5, 10)).toBe(10);
      spy.mockRestore();
    });

    it('returns min when min === max', () => {
      expect(randomInt(7, 7)).toBe(7);
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(-10, -5);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThanOrEqual(-5);
      }
    });

    it('handles ranges spanning zero', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(-5, 5);
        expect(result).toBeGreaterThanOrEqual(-5);
        expect(result).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('distribution', () => {
    it('produces roughly uniform distribution', () => {
      const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = randomInt(0, 4);
        counts[result]++;
      }

      // Each value should appear roughly 20% of the time (±5%)
      Object.values(counts).forEach((count) => {
        const percentage = (count / iterations) * 100;
        expect(percentage).toBeGreaterThan(15);
        expect(percentage).toBeLessThan(25);
      });
    });
  });

  describe('error cases', () => {
    it('throws error when min > max', () => {
      expect(() => randomInt(10, 5)).toThrow('min cannot be greater than max');
    });

    it('throws error when min is not an integer', () => {
      expect(() => randomInt(1.5, 10)).toThrow('min and max must be integers');
    });

    it('throws error when max is not an integer', () => {
      expect(() => randomInt(1, 10.5)).toThrow('min and max must be integers');
    });
  });
});
```

---

### Function: `randomFloat(min: number, max: number): number`

**Description**: Returns a random floating-point number between `min` (inclusive) and `max` (exclusive).

**Test Scenarios**:

```typescript
describe('randomFloat', () => {
  describe('normal cases', () => {
    it('returns float within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(10);
      }
    });

    it('can return min value', () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(randomFloat(5, 10)).toBe(5);
      spy.mockRestore();
    });

    it('does not return max value (exclusive)', () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
      const result = randomFloat(5, 10);
      expect(result).toBeLessThan(10);
      spy.mockRestore();
    });

    it('returns min when min === max', () => {
      expect(randomFloat(7.5, 7.5)).toBe(7.5);
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(-10.5, -5.2);
        expect(result).toBeGreaterThanOrEqual(-10.5);
        expect(result).toBeLessThan(-5.2);
      }
    });

    it('handles decimal values', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(0.1, 0.9);
        expect(result).toBeGreaterThanOrEqual(0.1);
        expect(result).toBeLessThan(0.9);
      }
    });
  });

  describe('error cases', () => {
    it('throws error when min > max', () => {
      expect(() => randomFloat(10, 5)).toThrow('min cannot be greater than max');
    });
  });
});
```

---

### Function: `randomChoice<T>(array: T[]): T`

**Description**: Returns a random element from an array.

**Test Scenarios**:

```typescript
describe('randomChoice', () => {
  describe('normal cases', () => {
    it('returns element from array', () => {
      const arr = [1, 2, 3, 4, 5];
      for (let i = 0; i < 100; i++) {
        const result = randomChoice(arr);
        expect(arr).toContain(result);
      }
    });

    it('returns only element from single-element array', () => {
      expect(randomChoice(['only'])).toBe('only');
    });

    it('works with different types', () => {
      const strings = ['a', 'b', 'c'];
      expect(strings).toContain(randomChoice(strings));

      const objects = [{ id: 1 }, { id: 2 }];
      expect(objects).toContain(randomChoice(objects));
    });
  });

  describe('distribution', () => {
    it('produces roughly uniform distribution', () => {
      const arr = ['a', 'b', 'c', 'd'];
      const counts = { a: 0, b: 0, c: 0, d: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = randomChoice(arr);
        counts[result]++;
      }

      // Each element should appear roughly 25% of the time (±5%)
      Object.values(counts).forEach((count) => {
        const percentage = (count / iterations) * 100;
        expect(percentage).toBeGreaterThan(20);
        expect(percentage).toBeLessThan(30);
      });
    });
  });

  describe('error cases', () => {
    it('throws error when array is empty', () => {
      expect(() => randomChoice([])).toThrow('Cannot choose from empty array');
    });

    it('throws error when input is not an array', () => {
      expect(() => randomChoice(null as any)).toThrow('Input must be an array');
      expect(() => randomChoice(undefined as any)).toThrow('Input must be an array');
    });
  });
});
```

---

### Function: `weightedRandom<T>(items: WeightedItem<T>[]): T`

**Description**: Returns a random item based on weighted probabilities. Used for loot tables, mutation chances, etc.

**Type Definition**:

```typescript
interface WeightedItem<T> {
  value: T;
  weight: number;
}
```

**Test Scenarios**:

```typescript
describe('weightedRandom', () => {
  describe('normal cases', () => {
    it('returns items from weighted list', () => {
      const items = [
        { value: 'common', weight: 70 },
        { value: 'uncommon', weight: 25 },
        { value: 'rare', weight: 5 },
      ];

      for (let i = 0; i < 100; i++) {
        const result = weightedRandom(items);
        expect(['common', 'uncommon', 'rare']).toContain(result);
      }
    });

    it('returns only item from single-item list', () => {
      const items = [{ value: 'only', weight: 1 }];
      expect(weightedRandom(items)).toBe('only');
    });

    it('works with equal weights', () => {
      const items = [
        { value: 'a', weight: 1 },
        { value: 'b', weight: 1 },
        { value: 'c', weight: 1 },
      ];

      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(weightedRandom(items));
      }

      // Should eventually get all three values
      expect(results.size).toBe(3);
    });
  });

  describe('weight distribution', () => {
    it('respects weight probabilities', () => {
      const items = [
        { value: 'heavy', weight: 90 },
        { value: 'light', weight: 10 },
      ];

      const counts = { heavy: 0, light: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(items);
        counts[result]++;
      }

      // Heavy should appear ~90% of time (±5%)
      const heavyPercentage = (counts.heavy / iterations) * 100;
      expect(heavyPercentage).toBeGreaterThan(85);
      expect(heavyPercentage).toBeLessThan(95);

      // Light should appear ~10% of time (±5%)
      const lightPercentage = (counts.light / iterations) * 100;
      expect(lightPercentage).toBeGreaterThan(5);
      expect(lightPercentage).toBeLessThan(15);
    });

    it('handles fractional weights', () => {
      const items = [
        { value: 'a', weight: 0.5 },
        { value: 'b', weight: 0.3 },
        { value: 'c', weight: 0.2 },
      ];

      for (let i = 0; i < 100; i++) {
        const result = weightedRandom(items);
        expect(['a', 'b', 'c']).toContain(result);
      }
    });
  });

  describe('edge cases', () => {
    it('handles zero weights (item never selected)', () => {
      const items = [
        { value: 'always', weight: 1 },
        { value: 'never', weight: 0 },
      ];

      for (let i = 0; i < 100; i++) {
        expect(weightedRandom(items)).toBe('always');
      }
    });

    it('ignores negative weights (treats as zero)', () => {
      const items = [
        { value: 'positive', weight: 10 },
        { value: 'negative', weight: -5 },
      ];

      for (let i = 0; i < 100; i++) {
        expect(weightedRandom(items)).toBe('positive');
      }
    });
  });

  describe('error cases', () => {
    it('throws error when array is empty', () => {
      expect(() => weightedRandom([])).toThrow('Cannot choose from empty array');
    });

    it('throws error when all weights are zero', () => {
      const items = [
        { value: 'a', weight: 0 },
        { value: 'b', weight: 0 },
      ];
      expect(() => weightedRandom(items)).toThrow('Total weight must be greater than zero');
    });

    it('throws error when all weights are negative', () => {
      const items = [
        { value: 'a', weight: -1 },
        { value: 'b', weight: -2 },
      ];
      expect(() => weightedRandom(items)).toThrow('Total weight must be greater than zero');
    });
  });

  describe('game mechanic examples', () => {
    it('simulates loot table drops', () => {
      // Example: raid loot table
      const lootTable = [
        { value: 'Dark Coins', weight: 50 },
        { value: 'Rotten Wood', weight: 30 },
        { value: 'Soul Fragment', weight: 15 },
        { value: 'Soul Essence', weight: 5 },
      ];

      const drops = new Set();
      for (let i = 0; i < 1000; i++) {
        drops.add(weightedRandom(lootTable));
      }

      // Should get all types eventually
      expect(drops.size).toBe(4);
    });

    it('simulates mutation chances', () => {
      // Example: zombie mutation during growth
      const mutations = [
        { value: 'none', weight: 85 },
        { value: 'toxic-spit', weight: 10 },
        { value: 'extra-limbs', weight: 4 },
        { value: 'regeneration', weight: 1 },
      ];

      const results = { none: 0, 'toxic-spit': 0, 'extra-limbs': 0, regeneration: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        results[weightedRandom(mutations)]++;
      }

      // Most should be no mutation (~85%)
      expect(results.none).toBeGreaterThan(8000);

      // Rare mutation should be very uncommon (~1%)
      expect(results.regeneration).toBeLessThan(200);
    });
  });
});
```

---

### Function: `rollDice(sides: number): number`

**Description**: Simulates rolling a die with specified number of sides (1 to sides, inclusive).

**Test Scenarios**:

```typescript
describe('rollDice', () => {
  describe('normal cases', () => {
    it('rolls d6 (1-6)', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice(6);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('rolls d20 (1-20)', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice(20);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
      }
    });

    it('rolls d100 (1-100)', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice(100);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(100);
      }
    });

    it('handles single-sided die', () => {
      expect(rollDice(1)).toBe(1);
    });
  });

  describe('error cases', () => {
    it('throws error when sides < 1', () => {
      expect(() => rollDice(0)).toThrow('Die must have at least 1 side');
      expect(() => rollDice(-6)).toThrow('Die must have at least 1 side');
    });

    it('throws error when sides is not an integer', () => {
      expect(() => rollDice(6.5)).toThrow('Sides must be an integer');
    });
  });
});
```

---

## 8.2 Formatting Utilities

**File**: `src/lib/utils/format.ts`
**Test File**: `src/lib/utils/format.test.ts`

### Function: `formatNumber(value: number, options?: FormatNumberOptions): string`

**Description**: Formats numbers with abbreviations (K, M, B, T) and decimal precision.

**Type Definition**:

```typescript
interface FormatNumberOptions {
  precision?: number; // Decimal places (default: 0)
  useAbbreviation?: boolean; // Use K, M, B, T (default: true)
  alwaysShowSign?: boolean; // Show + for positive (default: false)
}
```

**Test Scenarios**:

```typescript
describe('formatNumber', () => {
  describe('abbreviations', () => {
    it('formats numbers < 1000 without abbreviation', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(999)).toBe('999');
    });

    it('formats thousands with K', () => {
      expect(formatNumber(1000)).toBe('1K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(10000)).toBe('10K');
      expect(formatNumber(999999)).toBe('1000K');
    });

    it('formats millions with M', () => {
      expect(formatNumber(1000000)).toBe('1M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(25000000)).toBe('25M');
    });

    it('formats billions with B', () => {
      expect(formatNumber(1000000000)).toBe('1B');
      expect(formatNumber(1500000000)).toBe('1.5B');
    });

    it('formats trillions with T', () => {
      expect(formatNumber(1000000000000)).toBe('1T');
      expect(formatNumber(5500000000000)).toBe('5.5T');
    });
  });

  describe('precision option', () => {
    it('respects precision for abbreviated numbers', () => {
      expect(formatNumber(1234, { precision: 0 })).toBe('1K');
      expect(formatNumber(1234, { precision: 1 })).toBe('1.2K');
      expect(formatNumber(1234, { precision: 2 })).toBe('1.23K');
      expect(formatNumber(1234, { precision: 3 })).toBe('1.234K');
    });

    it('applies precision to non-abbreviated numbers when useAbbreviation is false', () => {
      expect(formatNumber(123.456, { useAbbreviation: false, precision: 0 })).toBe('123');
      expect(formatNumber(123.456, { useAbbreviation: false, precision: 1 })).toBe('123.5');
      expect(formatNumber(123.456, { useAbbreviation: false, precision: 2 })).toBe('123.46');
    });
  });

  describe('useAbbreviation option', () => {
    it('displays full number when abbreviation disabled', () => {
      expect(formatNumber(1000, { useAbbreviation: false })).toBe('1000');
      expect(formatNumber(1000000, { useAbbreviation: false })).toBe('1000000');
      expect(formatNumber(1500000, { useAbbreviation: false, precision: 0 })).toBe('1500000');
    });

    it('adds commas as thousand separators when abbreviation disabled', () => {
      expect(formatNumber(1234, { useAbbreviation: false })).toBe('1,234');
      expect(formatNumber(1234567, { useAbbreviation: false })).toBe('1,234,567');
    });
  });

  describe('alwaysShowSign option', () => {
    it('shows + sign for positive numbers', () => {
      expect(formatNumber(100, { alwaysShowSign: true })).toBe('+100');
      expect(formatNumber(1500, { alwaysShowSign: true })).toBe('+1.5K');
    });

    it('shows - sign for negative numbers', () => {
      expect(formatNumber(-100, { alwaysShowSign: true })).toBe('-100');
      expect(formatNumber(-1500, { alwaysShowSign: true })).toBe('-1.5K');
    });

    it('does not show sign for zero', () => {
      expect(formatNumber(0, { alwaysShowSign: true })).toBe('0');
    });
  });

  describe('negative numbers', () => {
    it('formats negative numbers with abbreviations', () => {
      expect(formatNumber(-1000)).toBe('-1K');
      expect(formatNumber(-1500000)).toBe('-1.5M');
    });

    it('preserves negative sign with precision', () => {
      expect(formatNumber(-1234, { precision: 2 })).toBe('-1.23K');
    });
  });

  describe('edge cases', () => {
    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(0, { precision: 2 })).toBe('0');
    });

    it('handles very small numbers', () => {
      expect(formatNumber(0.01)).toBe('0');
      expect(formatNumber(0.01, { precision: 2 })).toBe('0.01');
    });

    it('handles very large numbers', () => {
      expect(formatNumber(1e15)).toBe('1000T');
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toContain('T');
    });

    it('handles decimal values under 1000', () => {
      expect(formatNumber(123.45)).toBe('123');
      expect(formatNumber(123.45, { precision: 1 })).toBe('123.5');
      expect(formatNumber(123.45, { precision: 2 })).toBe('123.45');
    });
  });

  describe('special values', () => {
    it('returns "NaN" for NaN input', () => {
      expect(formatNumber(NaN)).toBe('NaN');
    });

    it('returns "∞" for Infinity', () => {
      expect(formatNumber(Infinity)).toBe('∞');
      expect(formatNumber(-Infinity)).toBe('-∞');
    });
  });

  describe('game currency examples', () => {
    it('formats Dark Coins', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(1200)).toBe('1.2K');
      expect(formatNumber(50000)).toBe('50K');
      expect(formatNumber(2500000)).toBe('2.5M');
    });

    it('formats Soul Essence (rare currency)', () => {
      expect(formatNumber(1, { precision: 0 })).toBe('1');
      expect(formatNumber(15, { precision: 0 })).toBe('15');
      expect(formatNumber(1000, { precision: 0 })).toBe('1K');
    });
  });
});
```

---

### Function: `formatTime(seconds: number, format?: 'short' | 'long' | 'compact'): string`

**Description**: Formats time duration in seconds to human-readable string.

**Test Scenarios**:

```typescript
describe('formatTime', () => {
  describe('short format (default: HH:MM:SS)', () => {
    it('formats seconds only', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(5)).toBe('00:00:05');
      expect(formatTime(30)).toBe('00:00:30');
      expect(formatTime(59)).toBe('00:00:59');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(60)).toBe('00:01:00');
      expect(formatTime(90)).toBe('00:01:30');
      expect(formatTime(600)).toBe('00:10:00');
      expect(formatTime(3599)).toBe('00:59:59');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatTime(3600)).toBe('01:00:00');
      expect(formatTime(3661)).toBe('01:01:01');
      expect(formatTime(7384)).toBe('02:03:04');
    });

    it('handles > 24 hours', () => {
      expect(formatTime(86400)).toBe('24:00:00'); // 1 day
      expect(formatTime(90061)).toBe('25:01:01'); // 1 day + 1 hour + 1 min + 1 sec
    });
  });

  describe('long format (e.g., "1 hour, 30 minutes, 15 seconds")', () => {
    it('formats seconds only', () => {
      expect(formatTime(0, 'long')).toBe('0 seconds');
      expect(formatTime(1, 'long')).toBe('1 second');
      expect(formatTime(30, 'long')).toBe('30 seconds');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(60, 'long')).toBe('1 minute');
      expect(formatTime(90, 'long')).toBe('1 minute, 30 seconds');
      expect(formatTime(120, 'long')).toBe('2 minutes');
      expect(formatTime(125, 'long')).toBe('2 minutes, 5 seconds');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatTime(3600, 'long')).toBe('1 hour');
      expect(formatTime(3660, 'long')).toBe('1 hour, 1 minute');
      expect(formatTime(3661, 'long')).toBe('1 hour, 1 minute, 1 second');
      expect(formatTime(7384, 'long')).toBe('2 hours, 3 minutes, 4 seconds');
    });

    it('omits zero values', () => {
      expect(formatTime(3600, 'long')).toBe('1 hour'); // No "0 minutes"
      expect(formatTime(3601, 'long')).toBe('1 hour, 1 second'); // No "0 minutes"
    });

    it('handles days', () => {
      expect(formatTime(86400, 'long')).toBe('1 day');
      expect(formatTime(90061, 'long')).toBe('1 day, 1 hour, 1 minute, 1 second');
      expect(formatTime(172800, 'long')).toBe('2 days');
    });
  });

  describe('compact format (e.g., "1h 30m", "45s")', () => {
    it('formats seconds only', () => {
      expect(formatTime(0, 'compact')).toBe('0s');
      expect(formatTime(30, 'compact')).toBe('30s');
      expect(formatTime(59, 'compact')).toBe('59s');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(60, 'compact')).toBe('1m');
      expect(formatTime(90, 'compact')).toBe('1m 30s');
      expect(formatTime(600, 'compact')).toBe('10m');
    });

    it('formats hours and minutes', () => {
      expect(formatTime(3600, 'compact')).toBe('1h');
      expect(formatTime(3660, 'compact')).toBe('1h 1m');
      expect(formatTime(5400, 'compact')).toBe('1h 30m');
    });

    it('omits seconds when hours are present (simplified)', () => {
      expect(formatTime(3661, 'compact')).toBe('1h 1m'); // Omits 1s for brevity
    });

    it('handles days', () => {
      expect(formatTime(86400, 'compact')).toBe('1d');
      expect(formatTime(90000, 'compact')).toBe('1d 1h');
    });
  });

  describe('edge cases', () => {
    it('handles zero', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(0, 'long')).toBe('0 seconds');
      expect(formatTime(0, 'compact')).toBe('0s');
    });

    it('handles negative values (shows as 0)', () => {
      expect(formatTime(-100)).toBe('00:00:00');
      expect(formatTime(-100, 'long')).toBe('0 seconds');
    });

    it('handles fractional seconds (rounds down)', () => {
      expect(formatTime(59.9)).toBe('00:00:59');
      expect(formatTime(90.5, 'long')).toBe('1 minute, 30 seconds');
    });

    it('handles very large durations', () => {
      expect(formatTime(999999)).toContain(':'); // Should not crash
      expect(formatTime(999999, 'long')).toContain('days');
    });
  });

  describe('special values', () => {
    it('returns "Invalid" for NaN', () => {
      expect(formatTime(NaN)).toBe('Invalid');
      expect(formatTime(NaN, 'long')).toBe('Invalid');
    });

    it('returns "∞" for Infinity', () => {
      expect(formatTime(Infinity)).toBe('∞');
      expect(formatTime(Infinity, 'long')).toBe('∞');
    });
  });

  describe('game mechanic examples', () => {
    it('formats zombie growth timers', () => {
      // Shambler: 2 minutes
      expect(formatTime(120, 'compact')).toBe('2m');

      // Brute: 5 minutes
      expect(formatTime(300, 'compact')).toBe('5m');

      // Lich: 10 minutes
      expect(formatTime(600, 'compact')).toBe('10m');
    });

    it('formats day/night cycle (30 min = 1800s)', () => {
      expect(formatTime(1800, 'compact')).toBe('30m');
      expect(formatTime(1200, 'compact')).toBe('20m'); // Day phase
      expect(formatTime(600, 'compact')).toBe('10m'); // Night phase
    });

    it('formats battle duration', () => {
      expect(formatTime(45, 'long')).toBe('45 seconds');
      expect(formatTime(180, 'long')).toBe('3 minutes');
    });
  });
});
```

---

### Function: `formatPercentage(value: number, options?: FormatPercentageOptions): string`

**Description**: Formats a decimal as a percentage string.

**Type Definition**:

```typescript
interface FormatPercentageOptions {
  precision?: number; // Decimal places (default: 0)
  includeSign?: boolean; // Include % symbol (default: true)
  alwaysShowSign?: boolean; // Show + for positive (default: false)
}
```

**Test Scenarios**:

```typescript
describe('formatPercentage', () => {
  describe('normal cases', () => {
    it('formats decimals as percentages', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(1)).toBe('100%');
      expect(formatPercentage(0.25)).toBe('25%');
      expect(formatPercentage(0.75)).toBe('75%');
    });

    it('handles values > 1 (over 100%)', () => {
      expect(formatPercentage(1.5)).toBe('150%');
      expect(formatPercentage(2)).toBe('200%');
      expect(formatPercentage(10)).toBe('1000%');
    });

    it('handles negative percentages', () => {
      expect(formatPercentage(-0.5)).toBe('-50%');
      expect(formatPercentage(-1)).toBe('-100%');
    });
  });

  describe('precision option', () => {
    it('formats with decimal precision', () => {
      expect(formatPercentage(0.1234, { precision: 0 })).toBe('12%');
      expect(formatPercentage(0.1234, { precision: 1 })).toBe('12.3%');
      expect(formatPercentage(0.1234, { precision: 2 })).toBe('12.34%');
      expect(formatPercentage(0.1234, { precision: 3 })).toBe('12.340%');
    });

    it('rounds correctly', () => {
      expect(formatPercentage(0.666, { precision: 0 })).toBe('67%');
      expect(formatPercentage(0.666, { precision: 1 })).toBe('66.6%');
      expect(formatPercentage(0.666, { precision: 2 })).toBe('66.60%');
    });
  });

  describe('includeSign option', () => {
    it('omits % symbol when disabled', () => {
      expect(formatPercentage(0.5, { includeSign: false })).toBe('50');
      expect(formatPercentage(1, { includeSign: false })).toBe('100');
      expect(formatPercentage(0.25, { includeSign: false, precision: 1 })).toBe('25.0');
    });
  });

  describe('alwaysShowSign option', () => {
    it('shows + for positive percentages', () => {
      expect(formatPercentage(0.5, { alwaysShowSign: true })).toBe('+50%');
      expect(formatPercentage(1, { alwaysShowSign: true })).toBe('+100%');
    });

    it('shows - for negative percentages', () => {
      expect(formatPercentage(-0.5, { alwaysShowSign: true })).toBe('-50%');
    });

    it('does not show sign for zero', () => {
      expect(formatPercentage(0, { alwaysShowSign: true })).toBe('0%');
    });
  });

  describe('edge cases', () => {
    it('handles very small percentages', () => {
      expect(formatPercentage(0.001)).toBe('0%');
      expect(formatPercentage(0.001, { precision: 1 })).toBe('0.1%');
      expect(formatPercentage(0.001, { precision: 2 })).toBe('0.10%');
    });

    it('handles very large percentages', () => {
      expect(formatPercentage(100)).toBe('10000%');
    });
  });

  describe('special values', () => {
    it('returns "NaN%" for NaN', () => {
      expect(formatPercentage(NaN)).toBe('NaN%');
    });

    it('returns "∞%" for Infinity', () => {
      expect(formatPercentage(Infinity)).toBe('∞%');
      expect(formatPercentage(-Infinity)).toBe('-∞%');
    });
  });

  describe('game mechanic examples', () => {
    it('formats zombie stat decay rate', () => {
      expect(formatPercentage(0.01, { precision: 1, alwaysShowSign: true })).toBe('+1.0%'); // Daily decay
    });

    it('formats happiness effects', () => {
      expect(formatPercentage(0.1, { precision: 0, alwaysShowSign: true })).toBe('+10%'); // Happiness boost
      expect(formatPercentage(-0.05, { precision: 0, alwaysShowSign: true })).toBe('-5%'); // Decay penalty
    });

    it('formats damage modifiers', () => {
      expect(formatPercentage(1, { precision: 0 })).toBe('100%'); // Holy damage to undead (2x = 200%, but showing base)
      expect(formatPercentage(0.5, { precision: 0 })).toBe('50%'); // Armor reduction
    });

    it('formats mutation chances', () => {
      expect(formatPercentage(0.05, { precision: 1 })).toBe('5.0%'); // Common mutation
      expect(formatPercentage(0.01, { precision: 1 })).toBe('1.0%'); // Rare mutation
    });
  });
});
```

---

### Function: `formatCurrency(amount: number, currency: 'darkCoins' | 'soulEssence', options?: FormatCurrencyOptions): string`

**Description**: Formats currency values with appropriate icons and formatting.

**Type Definition**:

```typescript
interface FormatCurrencyOptions {
  showIcon?: boolean; // Show currency icon (default: true)
  precision?: number; // Decimal places (default: 0)
  useAbbreviation?: boolean; // Use K, M, B notation (default: true)
}
```

**Test Scenarios**:

```typescript
describe('formatCurrency', () => {
  describe('Dark Coins', () => {
    it('formats with icon by default', () => {
      expect(formatCurrency(100, 'darkCoins')).toBe('💀 100');
      expect(formatCurrency(1500, 'darkCoins')).toBe('💀 1.5K');
    });

    it('formats without icon when disabled', () => {
      expect(formatCurrency(100, 'darkCoins', { showIcon: false })).toBe('100');
      expect(formatCurrency(1500, 'darkCoins', { showIcon: false })).toBe('1.5K');
    });

    it('uses abbreviations by default', () => {
      expect(formatCurrency(1000, 'darkCoins')).toBe('💀 1K');
      expect(formatCurrency(1000000, 'darkCoins')).toBe('💀 1M');
    });

    it('shows full number when abbreviation disabled', () => {
      expect(formatCurrency(1500, 'darkCoins', { useAbbreviation: false })).toBe('💀 1,500');
      expect(formatCurrency(1000000, 'darkCoins', { useAbbreviation: false })).toBe('💀 1,000,000');
    });

    it('respects precision', () => {
      expect(formatCurrency(1234, 'darkCoins', { precision: 2 })).toBe('💀 1.23K');
      expect(formatCurrency(999, 'darkCoins', { precision: 2 })).toBe('💀 999.00');
    });
  });

  describe('Soul Essence', () => {
    it('formats with icon by default', () => {
      expect(formatCurrency(5, 'soulEssence')).toBe('👻 5');
      expect(formatCurrency(1500, 'soulEssence')).toBe('👻 1.5K');
    });

    it('formats without icon when disabled', () => {
      expect(formatCurrency(5, 'soulEssence', { showIcon: false })).toBe('5');
    });

    it('uses abbreviations for large amounts', () => {
      expect(formatCurrency(1000, 'soulEssence')).toBe('👻 1K');
      expect(formatCurrency(1000000, 'soulEssence')).toBe('👻 1M');
    });
  });

  describe('edge cases', () => {
    it('handles zero', () => {
      expect(formatCurrency(0, 'darkCoins')).toBe('💀 0');
      expect(formatCurrency(0, 'soulEssence')).toBe('👻 0');
    });

    it('handles negative values (debt)', () => {
      expect(formatCurrency(-100, 'darkCoins')).toBe('💀 -100');
      expect(formatCurrency(-1500, 'darkCoins')).toBe('💀 -1.5K');
    });

    it('handles very large amounts', () => {
      expect(formatCurrency(1e12, 'darkCoins')).toBe('💀 1T');
    });

    it('handles fractional currency', () => {
      expect(formatCurrency(10.5, 'darkCoins', { precision: 1 })).toBe('💀 10.5');
      expect(formatCurrency(0.5, 'soulEssence', { precision: 1 })).toBe('👻 0.5');
    });
  });

  describe('special values', () => {
    it('returns "NaN" for NaN', () => {
      expect(formatCurrency(NaN, 'darkCoins')).toBe('💀 NaN');
    });

    it('returns "∞" for Infinity', () => {
      expect(formatCurrency(Infinity, 'darkCoins')).toBe('💀 ∞');
    });
  });

  describe('game UI examples', () => {
    it('formats shop prices', () => {
      expect(formatCurrency(500, 'darkCoins')).toBe('💀 500'); // Shambler seed
      expect(formatCurrency(5000, 'darkCoins')).toBe('💀 5K'); // Brute seed
      expect(formatCurrency(10, 'soulEssence')).toBe('👻 10'); // Premium item
    });

    it('formats raid rewards', () => {
      expect(formatCurrency(1250, 'darkCoins')).toBe('💀 1.3K'); // Default precision rounds
      expect(formatCurrency(1250, 'darkCoins', { precision: 1 })).toBe('💀 1.3K');
    });

    it('formats HUD display', () => {
      expect(formatCurrency(25000, 'darkCoins')).toBe('💀 25K');
      expect(formatCurrency(150, 'soulEssence')).toBe('👻 150');
    });
  });
});
```

---

## 8.3 Validation Utilities

**File**: `src/lib/utils/validation.ts`
**Test File**: `src/lib/utils/validation.test.ts`

### Type Guards

#### Function: `isString(value: unknown): value is string`

**Test Scenarios**:

```typescript
describe('isString', () => {
  it('returns true for strings', () => {
    expect(isString('')).toBe(true);
    expect(isString('hello')).toBe(true);
    expect(isString('123')).toBe(true);
    expect(isString(String(42))).toBe(true);
  });

  it('returns false for non-strings', () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(() => {})).toBe(false);
  });

  it('narrows TypeScript type', () => {
    const value: unknown = 'test';
    if (isString(value)) {
      // Should compile: value is now typed as string
      const upper: string = value.toUpperCase();
      expect(upper).toBe('TEST');
    }
  });
});
```

---

#### Function: `isNumber(value: unknown): value is number`

**Test Scenarios**:

```typescript
describe('isNumber', () => {
  it('returns true for numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(123)).toBe(true);
    expect(isNumber(-456)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
    expect(isNumber(Number(42))).toBe(true);
  });

  it('returns true for special numeric values', () => {
    expect(isNumber(NaN)).toBe(true);
    expect(isNumber(Infinity)).toBe(true);
    expect(isNumber(-Infinity)).toBe(true);
  });

  it('returns false for non-numbers', () => {
    expect(isNumber('123')).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
  });

  it('narrows TypeScript type', () => {
    const value: unknown = 42;
    if (isNumber(value)) {
      const doubled: number = value * 2;
      expect(doubled).toBe(84);
    }
  });
});
```

---

#### Function: `isFiniteNumber(value: unknown): value is number`

**Description**: Returns true only for finite numbers (excludes NaN, Infinity).

**Test Scenarios**:

```typescript
describe('isFiniteNumber', () => {
  it('returns true for finite numbers', () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(123)).toBe(true);
    expect(isFiniteNumber(-456)).toBe(true);
    expect(isFiniteNumber(3.14)).toBe(true);
  });

  it('returns false for non-finite numbers', () => {
    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber(Infinity)).toBe(false);
    expect(isFiniteNumber(-Infinity)).toBe(false);
  });

  it('returns false for non-numbers', () => {
    expect(isFiniteNumber('123')).toBe(false);
    expect(isFiniteNumber(null)).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
  });
});
```

---

#### Function: `isInteger(value: unknown): value is number`

**Test Scenarios**:

```typescript
describe('isInteger', () => {
  it('returns true for integers', () => {
    expect(isInteger(0)).toBe(true);
    expect(isInteger(123)).toBe(true);
    expect(isInteger(-456)).toBe(true);
  });

  it('returns false for non-integers', () => {
    expect(isInteger(3.14)).toBe(false);
    expect(isInteger(1.5)).toBe(false);
    expect(isInteger(NaN)).toBe(false);
    expect(isInteger(Infinity)).toBe(false);
  });

  it('returns false for non-numbers', () => {
    expect(isInteger('123')).toBe(false);
    expect(isInteger(null)).toBe(false);
  });
});
```

---

#### Function: `isBoolean(value: unknown): value is boolean`

**Test Scenarios**:

```typescript
describe('isBoolean', () => {
  it('returns true for booleans', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(Boolean(1))).toBe(true);
  });

  it('returns false for non-booleans', () => {
    expect(isBoolean(1)).toBe(false);
    expect(isBoolean(0)).toBe(false);
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean(null)).toBe(false);
    expect(isBoolean(undefined)).toBe(false);
  });
});
```

---

#### Function: `isArray(value: unknown): value is unknown[]`

**Test Scenarios**:

```typescript
describe('isArray', () => {
  it('returns true for arrays', () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray(['a', 'b'])).toBe(true);
    expect(isArray(new Array(5))).toBe(true);
  });

  it('returns false for non-arrays', () => {
    expect(isArray('array')).toBe(false);
    expect(isArray({ length: 0 })).toBe(false); // Array-like but not array
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
  });

  it('narrows TypeScript type', () => {
    const value: unknown = [1, 2, 3];
    if (isArray(value)) {
      const length: number = value.length;
      expect(length).toBe(3);
    }
  });
});
```

---

#### Function: `isObject(value: unknown): value is Record<string, unknown>`

**Description**: Returns true for plain objects (excludes arrays, null, functions).

**Test Scenarios**:

```typescript
describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: 'value' })).toBe(true);
    expect(isObject(new Object())).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('object')).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });

  it('returns false for functions', () => {
    expect(isObject(() => {})).toBe(false);
    expect(isObject(function () {})).toBe(false);
  });

  it('returns true for class instances', () => {
    class TestClass {}
    expect(isObject(new TestClass())).toBe(true);
  });
});
```

---

#### Function: `isFunction(value: unknown): value is Function`

**Test Scenarios**:

```typescript
describe('isFunction', () => {
  it('returns true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction(Math.max)).toBe(true);
  });

  it('returns false for non-functions', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction('function')).toBe(false);
    expect(isFunction(null)).toBe(false);
  });
});
```

---

### Range Validation

#### Function: `isInRange(value: number, min: number, max: number): boolean`

**Test Scenarios**:

```typescript
describe('isInRange', () => {
  it('returns true when value is within range', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
    expect(isInRange(0, 0, 10)).toBe(true);
    expect(isInRange(10, 0, 10)).toBe(true);
  });

  it('returns false when value is outside range', () => {
    expect(isInRange(-1, 0, 10)).toBe(false);
    expect(isInRange(11, 0, 10)).toBe(false);
  });

  it('handles negative ranges', () => {
    expect(isInRange(-5, -10, 0)).toBe(true);
    expect(isInRange(-11, -10, 0)).toBe(false);
  });

  it('throws error when min > max', () => {
    expect(() => isInRange(5, 10, 0)).toThrow('min cannot be greater than max');
  });
});
```

---

#### Function: `isPositive(value: number): boolean`

**Test Scenarios**:

```typescript
describe('isPositive', () => {
  it('returns true for positive numbers', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(100)).toBe(true);
    expect(isPositive(0.001)).toBe(true);
  });

  it('returns false for zero', () => {
    expect(isPositive(0)).toBe(false);
  });

  it('returns false for negative numbers', () => {
    expect(isPositive(-1)).toBe(false);
    expect(isPositive(-0.001)).toBe(false);
  });
});
```

---

#### Function: `isNonNegative(value: number): boolean`

**Test Scenarios**:

```typescript
describe('isNonNegative', () => {
  it('returns true for positive numbers', () => {
    expect(isNonNegative(1)).toBe(true);
    expect(isNonNegative(100)).toBe(true);
  });

  it('returns true for zero', () => {
    expect(isNonNegative(0)).toBe(true);
  });

  it('returns false for negative numbers', () => {
    expect(isNonNegative(-1)).toBe(false);
    expect(isNonNegative(-0.001)).toBe(false);
  });
});
```

---

### Enum Validation

#### Function: `isValidEnum<T>(value: unknown, enumObj: T): value is T[keyof T]`

**Test Scenarios**:

```typescript
describe('isValidEnum', () => {
  enum ZombieType {
    Shambler = 'SHAMBLER',
    Runner = 'RUNNER',
    Brute = 'BRUTE',
    Spitter = 'SPITTER',
  }

  it('returns true for valid enum values', () => {
    expect(isValidEnum('SHAMBLER', ZombieType)).toBe(true);
    expect(isValidEnum('RUNNER', ZombieType)).toBe(true);
    expect(isValidEnum(ZombieType.Brute, ZombieType)).toBe(true);
  });

  it('returns false for invalid enum values', () => {
    expect(isValidEnum('INVALID', ZombieType)).toBe(false);
    expect(isValidEnum('shambler', ZombieType)).toBe(false); // Case-sensitive
    expect(isValidEnum(123, ZombieType)).toBe(false);
    expect(isValidEnum(null, ZombieType)).toBe(false);
  });

  it('works with numeric enums', () => {
    enum Priority {
      Low = 0,
      Medium = 1,
      High = 2,
    }

    expect(isValidEnum(0, Priority)).toBe(true);
    expect(isValidEnum(1, Priority)).toBe(true);
    expect(isValidEnum(3, Priority)).toBe(false);
  });
});
```

---

### Schema Validation

#### Function: `validateGameState(state: unknown): ValidationResult<GameState>`

**Description**: Validates that an unknown object conforms to the GameState schema.

**Type Definition**:

```typescript
interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors?: ValidationError[];
}

interface ValidationError {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}
```

**Test Scenarios**:

```typescript
describe('validateGameState', () => {
  describe('valid states', () => {
    it('validates complete valid game state', () => {
      const validState = {
        player: { id: 'p1', level: 5, xp: 1000, name: 'Necromancer' },
        farm: { plots: [], activeZombies: [], resources: {} },
        inventory: { darkCoins: 500, soulEssence: 10, seeds: {} },
        time: { day: 1, timeOfDay: 0 },
      };

      const result = validateGameState(validState);

      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validState);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('invalid states', () => {
    it('rejects state missing required fields', () => {
      const invalidState = {
        player: { id: 'p1', level: 5 },
        // Missing farm, inventory, time
      };

      const result = validateGameState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors![0]).toMatchObject({
        path: 'farm',
        message: 'Required field missing',
      });
    });

    it('rejects state with wrong types', () => {
      const invalidState = {
        player: { id: 'p1', level: '5' }, // level should be number
        farm: 'not an object',
        inventory: {},
        time: {},
      };

      const result = validateGameState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some((e) => e.path === 'player.level')).toBe(true);
      expect(result.errors!.some((e) => e.path === 'farm')).toBe(true);
    });

    it('rejects null', () => {
      const result = validateGameState(null);
      expect(result.valid).toBe(false);
    });

    it('rejects non-objects', () => {
      expect(validateGameState('string').valid).toBe(false);
      expect(validateGameState(123).valid).toBe(false);
      expect(validateGameState([]).valid).toBe(false);
    });
  });

  describe('nested validation', () => {
    it('validates nested player object', () => {
      const state = {
        player: {
          id: 123, // Should be string
          level: 5,
          xp: 'not a number',
        },
        farm: {},
        inventory: {},
        time: {},
      };

      const result = validateGameState(state);

      expect(result.valid).toBe(false);
      expect(result.errors!.some((e) => e.path === 'player.id')).toBe(true);
      expect(result.errors!.some((e) => e.path === 'player.xp')).toBe(true);
    });
  });

  describe('error messages', () => {
    it('provides detailed error information', () => {
      const state = {
        player: { id: 'p1', level: -5 }, // Negative level invalid
        farm: {},
        inventory: {},
        time: {},
      };

      const result = validateGameState(state);

      const levelError = result.errors!.find((e) => e.path === 'player.level');
      expect(levelError).toMatchObject({
        path: 'player.level',
        message: expect.stringContaining('must be non-negative'),
        expected: 'number >= 0',
        received: '-5',
      });
    });
  });
});
```

---

#### Function: `validateZombie(zombie: unknown): ValidationResult<Zombie>`

**Test Scenarios**:

```typescript
describe('validateZombie', () => {
  it('validates complete valid zombie', () => {
    const validZombie = {
      id: 'z1',
      type: 'SHAMBLER',
      stats: { hp: 100, attack: 20, defense: 10, speed: 5 },
      happiness: 80,
      age: 3,
    };

    const result = validateZombie(validZombie);

    expect(result.valid).toBe(true);
    expect(result.data).toEqual(validZombie);
  });

  it('rejects zombie with invalid type', () => {
    const zombie = {
      id: 'z1',
      type: 'INVALID_TYPE',
      stats: { hp: 100, attack: 20, defense: 10, speed: 5 },
    };

    const result = validateZombie(zombie);

    expect(result.valid).toBe(false);
    expect(result.errors![0].path).toBe('type');
  });

  it('rejects zombie with invalid stats', () => {
    const zombie = {
      id: 'z1',
      type: 'SHAMBLER',
      stats: { hp: -10, attack: 20, defense: 10, speed: 5 }, // Negative HP
    };

    const result = validateZombie(zombie);

    expect(result.valid).toBe(false);
    expect(result.errors![0].path).toBe('stats.hp');
  });
});
```

---

### Custom Validation

#### Function: `validate<T>(value: unknown, validator: Validator<T>): ValidationResult<T>`

**Description**: Generic validation function that accepts custom validator objects.

**Type Definition**:

```typescript
interface Validator<T> {
  validate(value: unknown): ValidationResult<T>;
}
```

**Test Scenarios**:

```typescript
describe('validate', () => {
  it('uses custom validator', () => {
    const numberValidator: Validator<number> = {
      validate(value: unknown) {
        if (typeof value !== 'number') {
          return {
            valid: false,
            errors: [{ path: 'root', message: 'Expected number' }],
          };
        }
        return { valid: true, data: value };
      },
    };

    expect(validate(123, numberValidator).valid).toBe(true);
    expect(validate('123', numberValidator).valid).toBe(false);
  });

  it('supports chainable validators', () => {
    const positiveNumberValidator: Validator<number> = {
      validate(value: unknown) {
        if (typeof value !== 'number') {
          return {
            valid: false,
            errors: [{ path: 'root', message: 'Expected number' }],
          };
        }
        if (value <= 0) {
          return {
            valid: false,
            errors: [{ path: 'root', message: 'Must be positive' }],
          };
        }
        return { valid: true, data: value };
      },
    };

    expect(validate(5, positiveNumberValidator).valid).toBe(true);
    expect(validate(-5, positiveNumberValidator).valid).toBe(false);
    expect(validate(0, positiveNumberValidator).valid).toBe(false);
  });
});
```

---

## 8.4 Array & Object Utilities

**File**: `src/lib/utils/collections.ts`
**Test File**: `src/lib/utils/collections.test.ts`

### Array Operations

#### Function: `shuffle<T>(array: T[]): T[]`

**Description**: Randomly shuffles an array (Fisher-Yates algorithm). Returns a new array.

**Test Scenarios**:

```typescript
describe('shuffle', () => {
  describe('immutability', () => {
    it('does not mutate original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      const shuffled = shuffle(original);

      expect(original).toEqual(copy);
      expect(shuffled).not.toBe(original); // Different reference
    });
  });

  describe('correctness', () => {
    it('returns array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);

      expect(shuffled).toHaveLength(5);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles single-element array', () => {
      const arr = ['only'];
      expect(shuffle(arr)).toEqual(['only']);
    });

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('handles two-element array', () => {
      const arr = [1, 2];
      const shuffled = shuffle(arr);
      expect(shuffled).toHaveLength(2);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain(2);
    });
  });

  describe('randomness', () => {
    it('produces different orderings', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();

      for (let i = 0; i < 100; i++) {
        results.add(JSON.stringify(shuffle(original)));
      }

      // Should get at least 50 different orderings out of 100 shuffles
      expect(results.size).toBeGreaterThan(50);
    });

    it('each element can appear in any position', () => {
      const original = [1, 2, 3, 4, 5];
      const positions = {
        1: new Set<number>(),
        2: new Set<number>(),
        3: new Set<number>(),
        4: new Set<number>(),
        5: new Set<number>(),
      };

      for (let i = 0; i < 1000; i++) {
        const shuffled = shuffle(original);
        shuffled.forEach((value, index) => {
          positions[value].add(index);
        });
      }

      // Each element should have appeared in all 5 positions
      Object.values(positions).forEach((posSet) => {
        expect(posSet.size).toBe(5);
      });
    });
  });

  describe('performance', () => {
    it('handles large arrays efficiently', () => {
      const large = Array.from({ length: 10000 }, (_, i) => i);
      const start = Date.now();
      shuffle(large);
      const duration = Date.now() - start;

      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
```

---

#### Function: `sample<T>(array: T[], count: number): T[]`

**Description**: Returns `count` random elements from array (without replacement).

**Test Scenarios**:

```typescript
describe('sample', () => {
  describe('normal cases', () => {
    it('returns specified number of elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const sampled = sample(arr, 3);

      expect(sampled).toHaveLength(3);
      sampled.forEach((item) => {
        expect(arr).toContain(item);
      });
    });

    it('returns all elements when count equals array length', () => {
      const arr = [1, 2, 3, 4, 5];
      const sampled = sample(arr, 5);

      expect(sampled).toHaveLength(5);
      expect(sampled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('returns empty array when count is 0', () => {
      expect(sample([1, 2, 3], 0)).toEqual([]);
    });

    it('samples without replacement (no duplicates)', () => {
      const arr = [1, 2, 3, 4, 5];
      const sampled = sample(arr, 5);

      const unique = [...new Set(sampled)];
      expect(unique).toHaveLength(5);
    });
  });

  describe('immutability', () => {
    it('does not mutate original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      sample(original, 3);

      expect(original).toEqual(copy);
    });
  });

  describe('randomness', () => {
    it('produces different samples', () => {
      const arr = [1, 2, 3, 4, 5];
      const results = new Set<string>();

      for (let i = 0; i < 100; i++) {
        results.add(JSON.stringify(sample(arr, 3)));
      }

      // Should get many different samples
      expect(results.size).toBeGreaterThan(20);
    });
  });

  describe('error cases', () => {
    it('throws when count exceeds array length', () => {
      expect(() => sample([1, 2, 3], 5)).toThrow('Cannot sample more elements than array contains');
    });

    it('throws when count is negative', () => {
      expect(() => sample([1, 2, 3], -1)).toThrow('Count must be non-negative');
    });

    it('throws when array is empty and count > 0', () => {
      expect(() => sample([], 1)).toThrow('Cannot sample from empty array');
    });
  });
});
```

---

#### Function: `unique<T>(array: T[]): T[]`

**Description**: Returns array with duplicate elements removed (preserves order).

**Test Scenarios**:

```typescript
describe('unique', () => {
  describe('primitive types', () => {
    it('removes duplicate numbers', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique([5, 1, 5, 2, 1])).toEqual([5, 1, 2]);
    });

    it('removes duplicate strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('removes duplicate booleans', () => {
      expect(unique([true, false, true, false])).toEqual([true, false]);
    });

    it('handles mixed types', () => {
      expect(unique([1, '1', 1, '1'])).toEqual([1, '1']);
    });
  });

  describe('order preservation', () => {
    it('preserves first occurrence order', () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
      expect(unique(['z', 'a', 'm', 'a'])).toEqual(['z', 'a', 'm']);
    });
  });

  describe('edge cases', () => {
    it('handles empty array', () => {
      expect(unique([])).toEqual([]);
    });

    it('handles array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('handles array with all duplicates', () => {
      expect(unique([5, 5, 5, 5])).toEqual([5]);
    });

    it('handles single element', () => {
      expect(unique([1])).toEqual([1]);
    });
  });

  describe('immutability', () => {
    it('does not mutate original array', () => {
      const original = [1, 2, 2, 3];
      const copy = [...original];
      unique(original);

      expect(original).toEqual(copy);
    });

    it('returns new array reference', () => {
      const original = [1, 2, 3];
      const result = unique(original);

      expect(result).not.toBe(original);
    });
  });

  describe('object references', () => {
    it('removes duplicate object references', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const arr = [obj1, obj2, obj1, obj2];

      expect(unique(arr)).toEqual([obj1, obj2]);
    });

    it('does not dedupe structurally equal objects', () => {
      const arr = [{ id: 1 }, { id: 1 }];
      expect(unique(arr)).toHaveLength(2); // Different references
    });
  });
});
```

---

#### Function: `chunk<T>(array: T[], size: number): T[][]`

**Description**: Splits array into chunks of specified size.

**Test Scenarios**:

```typescript
describe('chunk', () => {
  describe('normal cases', () => {
    it('chunks array evenly', () => {
      expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
      expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });

    it('handles remainder elements', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('handles chunk size equal to array length', () => {
      expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    });

    it('handles chunk size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('handles chunk size larger than array', () => {
      expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });
  });

  describe('edge cases', () => {
    it('handles empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe('immutability', () => {
    it('does not mutate original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      chunk(original, 2);

      expect(original).toEqual(copy);
    });
  });

  describe('error cases', () => {
    it('throws when size is 0', () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow('Chunk size must be at least 1');
    });

    it('throws when size is negative', () => {
      expect(() => chunk([1, 2, 3], -1)).toThrow('Chunk size must be at least 1');
    });

    it('throws when size is not an integer', () => {
      expect(() => chunk([1, 2, 3], 1.5)).toThrow('Chunk size must be an integer');
    });
  });

  describe('game mechanic examples', () => {
    it('chunks zombie squad into waves', () => {
      const squad = [
        { id: 'z1', type: 'SHAMBLER' },
        { id: 'z2', type: 'RUNNER' },
        { id: 'z3', type: 'BRUTE' },
        { id: 'z4', type: 'SHAMBLER' },
        { id: 'z5', type: 'RUNNER' },
      ];

      const waves = chunk(squad, 2);

      expect(waves).toHaveLength(3);
      expect(waves[0]).toHaveLength(2);
      expect(waves[1]).toHaveLength(2);
      expect(waves[2]).toHaveLength(1);
    });
  });
});
```

---

#### Function: `flatten<T>(array: (T | T[])[]): T[]`

**Description**: Flattens nested arrays by one level.

**Test Scenarios**:

```typescript
describe('flatten', () => {
  describe('normal cases', () => {
    it('flattens one level of nesting', () => {
      expect(
        flatten([
          [1, 2],
          [3, 4],
        ])
      ).toEqual([1, 2, 3, 4]);
      expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });

    it('handles mixed nested and non-nested elements', () => {
      expect(flatten([1, [2, 3], 4, [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles empty nested arrays', () => {
      expect(flatten([[], [1, 2], []])).toEqual([1, 2]);
    });

    it('only flattens one level', () => {
      expect(flatten([[1, [2, 3]], [4]])).toEqual([1, [2, 3], 4]);
    });
  });

  describe('edge cases', () => {
    it('handles empty array', () => {
      expect(flatten([])).toEqual([]);
    });

    it('handles already flat array', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('immutability', () => {
    it('does not mutate original array', () => {
      const original = [
        [1, 2],
        [3, 4],
      ];
      const copy = original.map((arr) => [...arr]);
      flatten(original);

      expect(original).toEqual(copy);
    });
  });
});
```

---

### Object Operations

#### Function: `deepClone<T>(obj: T): T`

**Description**: Creates a deep copy of an object or array (handles nested structures).

**Test Scenarios**:

```typescript
describe('deepClone', () => {
  describe('primitives', () => {
    it('clones numbers', () => {
      expect(deepClone(42)).toBe(42);
    });

    it('clones strings', () => {
      expect(deepClone('test')).toBe('test');
    });

    it('clones booleans', () => {
      expect(deepClone(true)).toBe(true);
    });

    it('clones null', () => {
      expect(deepClone(null)).toBe(null);
    });

    it('clones undefined', () => {
      expect(deepClone(undefined)).toBe(undefined);
    });
  });

  describe('arrays', () => {
    it('clones shallow arrays', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr); // Different reference
    });

    it('clones nested arrays', () => {
      const arr = [
        [1, 2],
        [3, 4],
      ];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[0]).not.toBe(arr[0]);
    });
  });

  describe('objects', () => {
    it('clones shallow objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('clones nested objects', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
      expect(cloned.b.d).not.toBe(obj.b.d);
    });

    it('clones objects with array properties', () => {
      const obj = { arr: [1, 2, 3] };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned.arr).not.toBe(obj.arr);
    });

    it('clones arrays with object elements', () => {
      const arr = [{ id: 1 }, { id: 2 }];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned[0]).not.toBe(arr[0]);
    });
  });

  describe('mutations do not affect original', () => {
    it('mutating cloned object does not affect original', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      cloned.a = 99;
      cloned.b.c = 99;

      expect(original.a).toBe(1);
      expect(original.b.c).toBe(2);
    });

    it('mutating cloned array does not affect original', () => {
      const original = [
        [1, 2],
        [3, 4],
      ];
      const cloned = deepClone(original);

      cloned[0][0] = 99;

      expect(original[0][0]).toBe(1);
    });
  });

  describe('special cases', () => {
    it('handles Date objects', () => {
      const date = new Date('2025-01-01');
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('handles functions (returns same reference)', () => {
      const fn = () => 'test';
      const cloned = deepClone(fn);

      expect(cloned).toBe(fn); // Functions are not cloned, same reference
    });

    it('throws error on circular references', () => {
      const obj: any = { a: 1 };
      obj.self = obj;

      expect(() => deepClone(obj)).toThrow('Circular reference detected');
    });
  });

  describe('performance', () => {
    it('handles large objects efficiently', () => {
      const large = {
        zombies: Array.from({ length: 1000 }, (_, i) => ({
          id: `z${i}`,
          stats: { hp: 100, attack: 20, defense: 10 },
        })),
      };

      const start = Date.now();
      deepClone(large);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('game state examples', () => {
    it('clones game state without mutation', () => {
      const gameState = {
        player: { id: 'p1', level: 5 },
        farm: {
          zombies: [
            { id: 'z1', stats: { hp: 100 } },
            { id: 'z2', stats: { hp: 80 } },
          ],
        },
      };

      const cloned = deepClone(gameState);
      cloned.farm.zombies[0].stats.hp = 50;

      expect(gameState.farm.zombies[0].stats.hp).toBe(100);
    });
  });
});
```

---

#### Function: `deepMerge<T>(target: T, source: Partial<T>): T`

**Description**: Deep merges source object into target (immutable, returns new object).

**Test Scenarios**:

```typescript
describe('deepMerge', () => {
  describe('shallow merges', () => {
    it('merges top-level properties', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('adds new properties', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('overwrites existing properties', () => {
      const target = { a: 1, b: 2 };
      const source = { a: 99 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 99, b: 2 });
    });
  });

  describe('deep merges', () => {
    it('merges nested objects', () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { c: 3, d: 4 } };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
    });

    it('merges deeply nested objects', () => {
      const target = { a: { b: { c: 1 } } };
      const source = { a: { b: { d: 2 } } };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
    });

    it('handles mixed depths', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });
  });

  describe('array handling', () => {
    it('replaces arrays (does not merge)', () => {
      const target = { arr: [1, 2, 3] };
      const source = { arr: [4, 5] };
      const result = deepMerge(target, source);

      expect(result.arr).toEqual([4, 5]);
    });

    it('handles nested arrays in objects', () => {
      const target = { a: { arr: [1, 2] } };
      const source = { a: { arr: [3, 4] } };
      const result = deepMerge(target, source);

      expect(result.a.arr).toEqual([3, 4]);
    });
  });

  describe('immutability', () => {
    it('does not mutate target', () => {
      const target = { a: 1, b: { c: 2 } };
      const copy = deepClone(target);
      const source = { b: { d: 3 } };

      deepMerge(target, source);

      expect(target).toEqual(copy);
    });

    it('does not mutate source', () => {
      const target = { a: 1 };
      const source = { b: { c: 2 } };
      const copy = deepClone(source);

      deepMerge(target, source);

      expect(source).toEqual(copy);
    });

    it('returns new object', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = deepMerge(target, source);

      expect(result).not.toBe(target);
      expect(result).not.toBe(source);
    });
  });

  describe('edge cases', () => {
    it('handles empty source', () => {
      const target = { a: 1 };
      const result = deepMerge(target, {});

      expect(result).toEqual({ a: 1 });
    });

    it('handles empty target', () => {
      const source = { a: 1 };
      const result = deepMerge({}, source);

      expect(result).toEqual({ a: 1 });
    });

    it('overwrites primitives with objects', () => {
      const target = { a: 1 };
      const source = { a: { b: 2 } };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: { b: 2 } });
    });

    it('overwrites objects with primitives', () => {
      const target = { a: { b: 2 } };
      const source = { a: 1 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe('game mechanic examples', () => {
    it('applies stat modifiers to zombie', () => {
      const zombie = {
        id: 'z1',
        stats: { hp: 100, attack: 20, defense: 10 },
      };
      const modifier = {
        stats: { attack: 25, speed: 5 },
      };

      const result = deepMerge(zombie, modifier);

      expect(result).toEqual({
        id: 'z1',
        stats: { hp: 100, attack: 25, defense: 10, speed: 5 },
      });
    });

    it('applies partial game state update', () => {
      const gameState = {
        player: { level: 1, xp: 0 },
        farm: { zombies: [] },
      };
      const update = {
        player: { xp: 100 },
      };

      const result = deepMerge(gameState, update);

      expect(result.player).toEqual({ level: 1, xp: 100 });
      expect(result.farm).toEqual({ zombies: [] });
    });
  });
});
```

---

#### Function: `objectDiff<T>(obj1: T, obj2: T): Diff`

**Description**: Returns an object showing differences between two objects (for debugging).

**Type Definition**:

```typescript
interface Diff {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, { from: unknown; to: unknown }>;
}
```

**Test Scenarios**:

```typescript
describe('objectDiff', () => {
  describe('added properties', () => {
    it('detects added top-level properties', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 2 };
      const diff = objectDiff(obj1, obj2);

      expect(diff.added).toEqual({ b: 2 });
      expect(diff.removed).toEqual({});
      expect(diff.changed).toEqual({});
    });

    it('detects added nested properties', () => {
      const obj1 = { a: { b: 1 } };
      const obj2 = { a: { b: 1, c: 2 } };
      const diff = objectDiff(obj1, obj2);

      expect(diff.added).toEqual({ 'a.c': 2 });
    });
  });

  describe('removed properties', () => {
    it('detects removed top-level properties', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1 };
      const diff = objectDiff(obj1, obj2);

      expect(diff.removed).toEqual({ b: 2 });
      expect(diff.added).toEqual({});
      expect(diff.changed).toEqual({});
    });

    it('detects removed nested properties', () => {
      const obj1 = { a: { b: 1, c: 2 } };
      const obj2 = { a: { b: 1 } };
      const diff = objectDiff(obj1, obj2);

      expect(diff.removed).toEqual({ 'a.c': 2 });
    });
  });

  describe('changed properties', () => {
    it('detects changed top-level properties', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      const diff = objectDiff(obj1, obj2);

      expect(diff.changed).toEqual({ a: { from: 1, to: 2 } });
      expect(diff.added).toEqual({});
      expect(diff.removed).toEqual({});
    });

    it('detects changed nested properties', () => {
      const obj1 = { a: { b: 1 } };
      const obj2 = { a: { b: 2 } };
      const diff = objectDiff(obj1, obj2);

      expect(diff.changed).toEqual({ 'a.b': { from: 1, to: 2 } });
    });

    it('detects type changes', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 'string' };
      const diff = objectDiff(obj1, obj2);

      expect(diff.changed).toEqual({ a: { from: 1, to: 'string' } });
    });
  });

  describe('complex diffs', () => {
    it('detects multiple types of changes', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 99, d: 4 };
      const diff = objectDiff(obj1, obj2);

      expect(diff.added).toEqual({ d: 4 });
      expect(diff.removed).toEqual({ c: 3 });
      expect(diff.changed).toEqual({ b: { from: 2, to: 99 } });
    });

    it('handles nested changes', () => {
      const obj1 = { a: { b: 1, c: 2 }, d: 3 };
      const obj2 = { a: { b: 99, e: 4 }, f: 5 };
      const diff = objectDiff(obj1, obj2);

      expect(diff.added).toEqual({ 'a.e': 4, f: 5 });
      expect(diff.removed).toEqual({ 'a.c': 2, d: 3 });
      expect(diff.changed).toEqual({ 'a.b': { from: 1, to: 99 } });
    });
  });

  describe('edge cases', () => {
    it('handles identical objects', () => {
      const obj = { a: 1, b: 2 };
      const diff = objectDiff(obj, obj);

      expect(diff.added).toEqual({});
      expect(diff.removed).toEqual({});
      expect(diff.changed).toEqual({});
    });

    it('handles empty objects', () => {
      const diff = objectDiff({}, {});

      expect(diff.added).toEqual({});
      expect(diff.removed).toEqual({});
      expect(diff.changed).toEqual({});
    });

    it('handles one empty object', () => {
      const diff1 = objectDiff({ a: 1 }, {});
      expect(diff1.removed).toEqual({ a: 1 });

      const diff2 = objectDiff({}, { a: 1 });
      expect(diff2.added).toEqual({ a: 1 });
    });

    it('handles null and undefined values', () => {
      const obj1 = { a: null, b: undefined };
      const obj2 = { a: 1, b: 2 };
      const diff = objectDiff(obj1, obj2);

      expect(diff.changed.a).toEqual({ from: null, to: 1 });
      expect(diff.changed.b).toEqual({ from: undefined, to: 2 });
    });
  });

  describe('array handling', () => {
    it('treats arrays as values (shows full change)', () => {
      const obj1 = { arr: [1, 2, 3] };
      const obj2 = { arr: [1, 2, 3, 4] };
      const diff = objectDiff(obj1, obj2);

      expect(diff.changed.arr).toEqual({
        from: [1, 2, 3],
        to: [1, 2, 3, 4],
      });
    });
  });

  describe('debugging examples', () => {
    it('debugs zombie stat changes after combat', () => {
      const before = {
        id: 'z1',
        stats: { hp: 100, attack: 20 },
        happiness: 80,
      };
      const after = {
        id: 'z1',
        stats: { hp: 65, attack: 20 },
        happiness: 75,
      };

      const diff = objectDiff(before, after);

      expect(diff.changed['stats.hp']).toEqual({ from: 100, to: 65 });
      expect(diff.changed.happiness).toEqual({ from: 80, to: 75 });
    });

    it('debugs game state changes', () => {
      const stateBefore = {
        player: { level: 1, xp: 0 },
        inventory: { darkCoins: 100 },
      };
      const stateAfter = {
        player: { level: 2, xp: 150 },
        inventory: { darkCoins: 80 },
      };

      const diff = objectDiff(stateBefore, stateAfter);

      expect(diff.changed['player.level']).toEqual({ from: 1, to: 2 });
      expect(diff.changed['player.xp']).toEqual({ from: 0, to: 150 });
      expect(diff.changed['inventory.darkCoins']).toEqual({ from: 100, to: 80 });
    });
  });
});
```

---

## Summary

This test specification document provides comprehensive test cases for all four Phase 8 utility modules:

### Test Coverage Summary

1. **Math & Random Utilities** (8 functions):
   - `clamp()` - 25+ tests
   - `lerp()` - 20+ tests
   - `percentage()` - 18+ tests
   - `percentageOf()` - 12+ tests
   - `randomInt()` - 15+ tests
   - `randomFloat()` - 12+ tests
   - `randomChoice()` - 10+ tests
   - `weightedRandom()` - 25+ tests
   - `rollDice()` - 8+ tests
   - **Total: ~145 test cases**

2. **Formatting Utilities** (4 functions):
   - `formatNumber()` - 30+ tests
   - `formatTime()` - 35+ tests
   - `formatPercentage()` - 20+ tests
   - `formatCurrency()` - 25+ tests
   - **Total: ~110 test cases**

3. **Validation Utilities** (15+ functions):
   - Type guards (8 functions) - 40+ tests
   - Range validation (3 functions) - 15+ tests
   - Enum validation - 10+ tests
   - Schema validation (2 functions) - 25+ tests
   - Custom validation - 5+ tests
   - **Total: ~95 test cases**

4. **Array & Object Utilities** (9 functions):
   - `shuffle()` - 15+ tests
   - `sample()` - 12+ tests
   - `unique()` - 15+ tests
   - `chunk()` - 12+ tests
   - `flatten()` - 8+ tests
   - `deepClone()` - 25+ tests
   - `deepMerge()` - 25+ tests
   - `objectDiff()` - 20+ tests
   - **Total: ~132 test cases**

### Grand Total: ~482 Test Cases

### Implementation Notes for CORE Agent

1. **Test-First Approach**: Implement tests before code
2. **All tests should initially fail** (Red phase of TDD)
3. **Edge cases are critical** - utilities are used throughout the codebase
4. **Performance matters** - these utilities will be called frequently
5. **Immutability** - most functions should not mutate inputs
6. **Type safety** - leverage TypeScript for compile-time safety
7. **Documentation** - add JSDoc comments to all functions

### Next Steps

1. CORE agent implements test files following these specifications
2. CORE agent verifies all tests fail (no implementation yet)
3. CORE agent implements utility functions to pass tests
4. CORE agent verifies 100% test coverage for all utility modules
5. CORE agent updates TODO-CORE.md to mark Phase 8 complete

---

**Document Status**: Ready for Implementation
**Target Coverage**: 100% (critical infrastructure code)
**TDD Workflow**: Red → Green → Refactor
