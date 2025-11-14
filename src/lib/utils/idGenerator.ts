/**
 * ID Generator Utility
 *
 * Simple utility for generating unique IDs.
 */

let counter = 0;

/**
 * Generate a unique ID
 *
 * @returns Unique string ID
 */
export function generateId(): string {
  return `${Date.now()}-${counter++}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Reset the counter (useful for testing)
 */
export function resetIdCounter(): void {
  counter = 0;
}
