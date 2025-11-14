/**
 * Collections Utilities
 *
 * Functions for array and object manipulation.
 * All functions are immutable - they return new values without modifying originals.
 *
 * @module lib/utils/collections
 */

/**
 * Shuffles an array using Fisher-Yates algorithm.
 * Returns a new shuffled array without modifying the original.
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array
 *
 * @example
 * shuffle([1, 2, 3, 4, 5]); // [3, 1, 5, 2, 4] (random order)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Selects a random element from an array, or multiple random elements.
 *
 * @param array - The array to sample from
 * @param count - Number of elements to sample (default: 1, returns single element)
 * @returns A random element, or array of random elements if count > 1
 * @throws Error if array is empty
 *
 * @example
 * sample([1, 2, 3, 4, 5]); // 3 (random element)
 * sample([1, 2, 3, 4, 5], 3); // [2, 5, 1] (random elements)
 */
export function sample<T>(array: T[], count?: number): T | T[] {
  if (array.length === 0) {
    throw new Error('Cannot sample from empty array');
  }

  if (count === undefined) {
    // Single sample
    return array[Math.floor(Math.random() * array.length)];
  }

  // Multiple samples (without replacement)
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Returns an array with unique values.
 * Optionally use a key function to determine uniqueness.
 *
 * @param array - The array to filter
 * @param keyFn - Optional function to generate a unique key for each element
 * @returns Array with unique values
 *
 * @example
 * unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
 * unique([{id: 1}, {id: 2}, {id: 1}], x => x.id); // [{id: 1}, {id: 2}]
 */
export function unique<T>(array: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) {
    return Array.from(new Set(array));
  }

  const seen = new Set<unknown>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Splits an array into chunks of specified size.
 *
 * @param array - The array to chunk
 * @param size - The size of each chunk
 * @returns Array of chunks
 * @throws Error if size is less than 1
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size < 1) {
    throw new Error('Chunk size must be at least 1');
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Flattens a nested array to specified depth.
 *
 * @param array - The array to flatten
 * @param depth - How many levels to flatten (default: 1)
 * @returns Flattened array
 *
 * @example
 * flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
 * flatten([[1, [2, [3]]]], Infinity); // [1, 2, 3]
 */
export function flatten<T>(array: T[], depth: number = 1): T[] {
  if (depth === 0) {
    return array;
  }

  return array.reduce<T[]>((acc, item) => {
    if (Array.isArray(item)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      acc.push(...flatten(item as any, depth - 1));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

/**
 * Creates a deep clone of a value.
 * Handles arrays, objects, dates, regexes, and circular references.
 *
 * @param value - The value to clone
 * @returns A deep clone of the value
 *
 * @example
 * const original = { a: { b: { c: 3 } } };
 * const cloned = deepClone(original);
 * cloned.a.b.c = 99;
 * console.log(original.a.b.c); // 3 (unchanged)
 */
export function deepClone<T>(value: T, seen = new WeakMap()): T {
  // Handle primitives and null
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Handle circular references
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  if (seen.has(value as any)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
    return seen.get(value as any);
  }

  // Handle Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  // Handle Array
  if (Array.isArray(value)) {
    const cloned: unknown[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    seen.set(value as any, cloned as T);
    value.forEach((item) => {
      cloned.push(deepClone(item, seen));
    });
    return cloned as T;
  }

  // Handle Object
  const cloned: Record<string, unknown> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  seen.set(value as any, cloned as T);

  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      cloned[key] = deepClone(value[key], seen);
    }
  }

  return cloned as T;
}

/**
 * Deep merges multiple objects into a new object.
 * Does not modify the original objects.
 * Arrays are replaced, not merged.
 *
 * @param objects - Objects to merge
 * @returns Merged object
 *
 * @example
 * deepMerge({a: 1}, {b: 2}); // {a: 1, b: 2}
 * deepMerge({x: {a: 1}}, {x: {b: 2}}); // {x: {a: 1, b: 2}}
 */
export function deepMerge<T extends Record<string, unknown>>(...objects: Partial<T>[]): T {
  const result: Record<string, unknown> = {};

  for (const obj of objects) {
    if (!obj || typeof obj !== 'object') continue;

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

      const value = obj[key];
      const existing = result[key];

      // If both are plain objects, merge recursively
      if (
        existing &&
        typeof existing === 'object' &&
        !Array.isArray(existing) &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        result[key] = deepMerge(
          existing as Record<string, unknown>,
          value as Record<string, unknown>
        );
      } else {
        // Otherwise, replace (including arrays)
        result[key] = value;
      }
    }
  }

  return result as T;
}

/**
 * Change record for object diff.
 */
export interface DiffChange {
  key: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Added property for object diff.
 */
export interface DiffAdded {
  key: string;
  value: unknown;
}

/**
 * Removed property for object diff.
 */
export interface DiffRemoved {
  key: string;
  value: unknown;
}

/**
 * Result of object diff operation.
 */
export interface DiffResult {
  changed: DiffChange[];
  added: DiffAdded[];
  removed: DiffRemoved[];
}

/**
 * Computes the difference between two objects.
 * Useful for debugging state changes.
 *
 * @param oldObj - The old object
 * @param newObj - The new object
 * @returns Object containing changed, added, and removed properties
 *
 * @example
 * const old = {a: 1, b: 2, c: 3};
 * const current = {a: 1, b: 99, d: 4};
 * objectDiff(old, current);
 * // {
 * //   changed: [{key: 'b', oldValue: 2, newValue: 99}],
 * //   added: [{key: 'd', value: 4}],
 * //   removed: [{key: 'c', value: 3}]
 * // }
 */
export function objectDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): DiffResult {
  const changed: DiffChange[] = [];
  const added: DiffAdded[] = [];
  const removed: DiffRemoved[] = [];

  // Find changed and removed
  for (const key in oldObj) {
    if (Object.prototype.hasOwnProperty.call(oldObj, key)) {
      if (!Object.prototype.hasOwnProperty.call(newObj, key)) {
        removed.push({ key, value: oldObj[key] });
      } else if (oldObj[key] !== newObj[key]) {
        changed.push({ key, oldValue: oldObj[key], newValue: newObj[key] });
      }
    }
  }

  // Find added
  for (const key in newObj) {
    if (
      Object.prototype.hasOwnProperty.call(newObj, key) &&
      !Object.prototype.hasOwnProperty.call(oldObj, key)
    ) {
      added.push({ key, value: newObj[key] });
    }
  }

  return { changed, added, removed };
}

/**
 * Picks specified properties from an object.
 *
 * @param obj - The object to pick from
 * @param keys - Keys to pick
 * @returns New object with only the picked properties
 *
 * @example
 * pick({a: 1, b: 2, c: 3}, ['a', 'c']); // {a: 1, c: 3}
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omits specified properties from an object.
 *
 * @param obj - The object to omit from
 * @param keys - Keys to omit
 * @returns New object without the omitted properties
 *
 * @example
 * omit({a: 1, b: 2, c: 3}, ['b']); // {a: 1, c: 3}
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;

  for (const key of keys) {
    delete (result as Record<string, unknown>)[key as string];
  }

  return result;
}

/**
 * Groups array elements by a key function.
 *
 * @param array - The array to group
 * @param keyFn - Function that returns the group key for each element
 * @returns Object with keys as group names and values as arrays of elements
 *
 * @example
 * const zombies = [{type: 'shambler', hp: 50}, {type: 'runner', hp: 30}, {type: 'shambler', hp: 60}];
 * groupBy(zombies, z => z.type);
 * // {
 * //   shambler: [{type: 'shambler', hp: 50}, {type: 'shambler', hp: 60}],
 * //   runner: [{type: 'runner', hp: 30}]
 * // }
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string | number): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const item of array) {
    const key = String(keyFn(item));
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}
