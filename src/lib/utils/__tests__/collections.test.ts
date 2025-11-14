/**
 * Collections Utilities Test Suite
 *
 * Tests for array and object manipulation functions including:
 * - Array shuffle, sample, unique, chunk, flatten
 * - Deep clone (handles circular references)
 * - Deep merge (immutable)
 * - Object diff (for debugging)
 *
 * All functions should be immutable (return new values, not modify originals).
 */

import {
  shuffle,
  sample,
  unique,
  chunk,
  flatten,
  deepClone,
  deepMerge,
  objectDiff,
  pick,
  omit,
  groupBy,
} from '../collections';

describe('Collections Utilities', () => {
  describe('shuffle', () => {
    it('returns array with same elements', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle(array);

      expect(shuffled).toHaveLength(array.length);
      expect(shuffled.sort()).toEqual(array.sort());
    });

    it('does not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      shuffle(original);

      expect(original).toEqual(copy);
    });

    it('shuffles array (probably)', () => {
      // Shuffle many times and check that we get different results
      const array = [1, 2, 3, 4, 5];
      const results = new Set<string>();

      for (let i = 0; i < 100; i++) {
        results.add(shuffle(array).join(','));
      }

      // Should have multiple different orderings
      expect(results.size).toBeGreaterThan(1);
    });

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('handles single element', () => {
      expect(shuffle([1])).toEqual([1]);
    });
  });

  describe('sample', () => {
    it('returns random element from array', () => {
      const array = [1, 2, 3, 4, 5];
      const sampled = sample(array);

      expect(array).toContain(sampled);
    });

    it('returns all elements over many samples', () => {
      const array = ['a', 'b', 'c'];
      const results = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        results.add(sample(array));
      }

      expect(results.size).toBe(3);
    });

    it('returns single element for single-item array', () => {
      expect(sample([42])).toBe(42);
    });

    it('throws on empty array', () => {
      expect(() => sample([])).toThrow();
    });

    it('samples multiple elements', () => {
      const array = [1, 2, 3, 4, 5];
      const sampled = sample(array, 3);

      expect(sampled).toHaveLength(3);
      if (Array.isArray(sampled)) {
        sampled.forEach((item) => expect(array).toContain(item));
      }
    });

    it('returns all elements when count >= length', () => {
      const array = [1, 2, 3];
      const sampled = sample(array, 5);

      expect(sampled).toHaveLength(3);
    });

    it('returns unique elements when sampling multiple', () => {
      const array = [1, 2, 3, 4, 5];
      const sampled = sample(array, 3);

      expect(new Set(sampled).size).toBe(sampled.length);
    });
  });

  describe('unique', () => {
    it('removes duplicate primitives', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('handles empty array', () => {
      expect(unique([])).toEqual([]);
    });

    it('handles array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('preserves order (first occurrence)', () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
    });

    it('handles mixed types', () => {
      expect(unique([1, '1', 2, '2', 1])).toEqual([1, '1', 2, '2']);
    });

    it('uses custom key function', () => {
      const objects = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ];

      const uniqueById = unique(objects, (obj) => obj.id);
      expect(uniqueById).toHaveLength(2);
      expect(uniqueById.map((o) => o.id)).toEqual([1, 2]);
    });
  });

  describe('chunk', () => {
    it('splits array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    it('handles chunk size equal to array length', () => {
      expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
    });

    it('handles chunk size greater than array length', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('handles empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('handles chunk size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('throws on invalid chunk size', () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow();
      expect(() => chunk([1, 2, 3], -1)).toThrow();
    });
  });

  describe('flatten', () => {
    it('flattens one level by default', () => {
      expect(
        flatten([
          [1, 2],
          [3, 4],
        ])
      ).toEqual([1, 2, 3, 4]);
      expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });

    it('flattens deeply nested arrays', () => {
      expect(flatten([[1, [2, [3, [4]]]]], Infinity)).toEqual([1, 2, 3, 4]);
    });

    it('flattens to specified depth', () => {
      expect(flatten([[1, [2, [3]]]], 1)).toEqual([1, [2, [3]]]);
      expect(flatten([[1, [2, [3]]]], 2)).toEqual([1, 2, [3]]);
      expect(flatten([[1, [2, [3]]]], 3)).toEqual([1, 2, 3]);
    });

    it('handles empty arrays', () => {
      expect(flatten([])).toEqual([]);
      expect(flatten([[], []])).toEqual([]);
    });

    it('handles mixed nesting', () => {
      expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('deepClone', () => {
    it('clones primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it('clones arrays', () => {
      const original = [1, 2, 3];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('clones nested arrays', () => {
      const original = [1, [2, [3, 4]]];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
    });

    it('clones objects', () => {
      const original = { a: 1, b: 2 };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('clones nested objects', () => {
      const original = { a: { b: { c: 3 } } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned.a).not.toBe(original.a);
      expect(cloned.a.b).not.toBe(original.a.b);
    });

    it('clones mixed structures', () => {
      const original = {
        number: 42,
        string: 'test',
        array: [1, 2, 3],
        nested: { a: 1, b: [4, 5] },
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.array).not.toBe(original.array);
      expect(cloned.nested).not.toBe(original.nested);
    });

    it('handles circular references', () => {
      interface CircularObject {
        a: number;
        self?: CircularObject;
      }
      const original: CircularObject = { a: 1 };
      original.self = original;

      const cloned = deepClone(original);

      expect(cloned.a).toBe(1);
      expect(cloned.self).toBe(cloned);
      expect(cloned).not.toBe(original);
    });

    it('handles Date objects', () => {
      const original = new Date('2025-01-01');
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('handles RegExp objects', () => {
      const original = /test/gi;
      const cloned = deepClone(original);

      expect(cloned.source).toBe(original.source);
      expect(cloned.flags).toBe(original.flags);
      expect(cloned).not.toBe(original);
    });
  });

  describe('deepMerge', () => {
    it('merges flat objects', () => {
      const a = { x: 1, y: 2 };
      const b = { y: 3, z: 4 };

      expect(deepMerge(a, b)).toEqual({ x: 1, y: 3, z: 4 });
    });

    it('does not modify original objects', () => {
      const a = { x: 1 };
      const b = { y: 2 };
      const originalA = { ...a };
      const originalB = { ...b };

      deepMerge(a, b);

      expect(a).toEqual(originalA);
      expect(b).toEqual(originalB);
    });

    it('merges nested objects', () => {
      const a = { x: { a: 1, b: 2 } };
      const b = { x: { b: 3, c: 4 } };

      expect(deepMerge(a, b)).toEqual({ x: { a: 1, b: 3, c: 4 } });
    });

    it('merges deeply nested objects', () => {
      const a = { x: { y: { z: 1 } } };
      const b = { x: { y: { w: 2 } } };

      expect(deepMerge(a, b)).toEqual({ x: { y: { z: 1, w: 2 } } });
    });

    it('merges arrays by replacement', () => {
      const a = { arr: [1, 2, 3] };
      const b = { arr: [4, 5] };

      expect(deepMerge(a, b)).toEqual({ arr: [4, 5] });
    });

    it('handles null and undefined', () => {
      expect(deepMerge({ a: 1 }, { a: null })).toEqual({ a: null });
      expect(deepMerge({ a: 1 }, { a: undefined })).toEqual({ a: undefined });
    });

    it('merges multiple objects', () => {
      const a = { x: 1 };
      const b = { y: 2 };
      const c = { z: 3 };

      expect(deepMerge(a, b, c)).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('objectDiff', () => {
    it('detects changed values', () => {
      const old = { a: 1, b: 2 };
      const current = { a: 1, b: 3 };

      const diff = objectDiff(old, current);
      expect(diff.changed).toHaveLength(1);
      expect(diff.changed[0]).toMatchObject({ key: 'b', oldValue: 2, newValue: 3 });
    });

    it('detects added properties', () => {
      const old = { a: 1 };
      const current = { a: 1, b: 2 };

      const diff = objectDiff(old, current);
      expect(diff.added).toHaveLength(1);
      expect(diff.added[0]).toMatchObject({ key: 'b', value: 2 });
    });

    it('detects removed properties', () => {
      const old = { a: 1, b: 2 };
      const current = { a: 1 };

      const diff = objectDiff(old, current);
      expect(diff.removed).toHaveLength(1);
      expect(diff.removed[0]).toMatchObject({ key: 'b', value: 2 });
    });

    it('detects all types of changes', () => {
      const old = { a: 1, b: 2, c: 3 };
      const current = { a: 1, b: 99, d: 4 };

      const diff = objectDiff(old, current);
      expect(diff.changed).toHaveLength(1);
      expect(diff.added).toHaveLength(1);
      expect(diff.removed).toHaveLength(1);
    });

    it('returns empty diff for identical objects', () => {
      const old = { a: 1, b: 2 };
      const current = { a: 1, b: 2 };

      const diff = objectDiff(old, current);
      expect(diff.changed).toHaveLength(0);
      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  });

  describe('pick', () => {
    it('picks specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('ignores non-existent properties', () => {
      const obj = { a: 1, b: 2 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      expect(pick(obj, ['a', 'c'] as any)).toEqual({ a: 1 });
    });

    it('returns empty object for empty keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, [])).toEqual({});
    });

    it('handles empty object', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      expect(pick({}, ['a'] as any)).toEqual({});
    });
  });

  describe('omit', () => {
    it('omits specified properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('ignores non-existent properties', () => {
      const obj = { a: 1, b: 2 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      expect(omit(obj, ['c'] as any)).toEqual({ a: 1, b: 2 });
    });

    it('returns empty object when all keys omitted', () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, ['a', 'b'])).toEqual({});
    });

    it('returns copy when no keys omitted', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, []);
      expect(result).toEqual(obj);
      expect(result).not.toBe(obj);
    });
  });

  describe('groupBy', () => {
    it('groups by key function', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];

      const grouped = groupBy(items, (item) => item.type);
      expect(grouped).toEqual({
        a: [
          { type: 'a', value: 1 },
          { type: 'a', value: 3 },
        ],
        b: [{ type: 'b', value: 2 }],
      });
    });

    it('handles empty array', () => {
      expect(groupBy([], (x) => x)).toEqual({});
    });

    it('groups by property', () => {
      const zombies = [
        { id: 1, level: 1 },
        { id: 2, level: 2 },
        { id: 3, level: 1 },
      ];

      const byLevel = groupBy(zombies, (z) => z.level);
      expect(byLevel[1]).toHaveLength(2);
      expect(byLevel[2]).toHaveLength(1);
    });

    it('handles numeric keys', () => {
      const items = [1, 2, 3, 4, 5];
      const grouped = groupBy(items, (x) => (x % 2 === 0 ? 'even' : 'odd'));

      expect(grouped.even).toEqual([2, 4]);
      expect(grouped.odd).toEqual([1, 3, 5]);
    });
  });
});
