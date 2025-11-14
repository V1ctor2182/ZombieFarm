/**
 * Mock localStorage implementation for testing
 *
 * Provides a full localStorage API mock that can be used in tests
 * to simulate browser storage without affecting the real localStorage.
 * Each test gets an isolated storage instance.
 *
 * @example
 * ```typescript
 * import { mockLocalStorage, restoreLocalStorage } from '@lib/test-utils/mocks';
 *
 * beforeEach(() => {
 *   mockLocalStorage();
 * });
 *
 * afterEach(() => {
 *   restoreLocalStorage();
 * });
 *
 * test('saves game data', () => {
 *   localStorage.setItem('gameState', JSON.stringify({ level: 5 }));
 *   expect(localStorage.getItem('gameState')).toContain('level');
 * });
 * ```
 */

/**
 * Internal storage map for the mock
 */
let storage: Map<string, string> = new Map();

/**
 * Original localStorage reference (if it exists)
 */
let originalLocalStorage: Storage | undefined;

/**
 * Mock localStorage implementation
 */
const mockStorageImplementation: Storage = {
  /**
   * Get the number of items in storage
   */
  get length(): number {
    return storage.size;
  },

  /**
   * Get an item from storage
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null {
    return storage.get(key) ?? null;
  },

  /**
   * Set an item in storage
   * @param key - The key to store
   * @param value - The value to store (will be converted to string)
   */
  setItem(key: string, value: string): void {
    storage.set(key, String(value));
  },

  /**
   * Remove an item from storage
   * @param key - The key to remove
   */
  removeItem(key: string): void {
    storage.delete(key);
  },

  /**
   * Clear all items from storage
   */
  clear(): void {
    storage.clear();
  },

  /**
   * Get the key at a specific index
   * @param index - The index to retrieve
   * @returns The key at the index or null if out of bounds
   */
  key(index: number): string | null {
    if (index < 0 || index >= storage.size) {
      return null;
    }
    return Array.from(storage.keys())[index];
  },
};

/**
 * Install the localStorage mock
 *
 * Replaces the global localStorage with a mock implementation.
 * The mock starts with an empty storage map.
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   mockLocalStorage();
 * });
 * ```
 */
export function mockLocalStorage(): void {
  // Save original localStorage if it exists
  if (typeof window !== 'undefined' && window.localStorage) {
    originalLocalStorage = window.localStorage;
  }

  // Reset storage for fresh test
  storage = new Map();

  // Install mock
  Object.defineProperty(global, 'localStorage', {
    value: mockStorageImplementation,
    writable: true,
    configurable: true,
  });
}

/**
 * Restore the original localStorage
 *
 * Removes the mock and restores the original localStorage if it existed.
 * Always call this in afterEach to clean up properly.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   restoreLocalStorage();
 * });
 * ```
 */
export function restoreLocalStorage(): void {
  if (originalLocalStorage) {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    originalLocalStorage = undefined;
  } else {
    // Remove the mock if there was no original
    delete (global as any).localStorage;
  }

  // Clear storage
  storage.clear();
}

/**
 * Get the current mock storage contents as a plain object
 *
 * Useful for debugging or asserting on the entire storage state.
 *
 * @returns Object with all key-value pairs from storage
 *
 * @example
 * ```typescript
 * localStorage.setItem('user', 'Alice');
 * localStorage.setItem('score', '100');
 * const contents = getMockStorageContents();
 * // { user: 'Alice', score: '100' }
 * ```
 */
export function getMockStorageContents(): Record<string, string> {
  const contents: Record<string, string> = {};
  storage.forEach((value, key) => {
    contents[key] = value;
  });
  return contents;
}

/**
 * Set multiple items in mock storage at once
 *
 * Convenient for setting up test data.
 *
 * @param items - Object with key-value pairs to store
 *
 * @example
 * ```typescript
 * setMockStorageContents({
 *   gameState: JSON.stringify({ level: 5 }),
 *   settings: JSON.stringify({ sound: true })
 * });
 * ```
 */
export function setMockStorageContents(items: Record<string, string>): void {
  Object.entries(items).forEach(([key, value]) => {
    storage.set(key, value);
  });
}

/**
 * Clear the mock storage without restoring original localStorage
 *
 * Useful for resetting between tests without full teardown.
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   clearMockStorage();
 * });
 * ```
 */
export function clearMockStorage(): void {
  storage.clear();
}
