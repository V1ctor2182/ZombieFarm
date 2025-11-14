/**
 * Smoke Test - Testing Infrastructure Verification
 *
 * This is a basic smoke test to verify the testing infrastructure works.
 * Tests basic module imports and a simple component render.
 *
 * Note: The App component uses Phaser which triggers async useEffect calls.
 * For Phase 1, we test that the module can be imported. Full App component
 * testing will be addressed when we implement proper test utilities for
 * components with async effects (Phase 2-3 of testing roadmap).
 */

import { describe, it, expect } from '@jest/globals';

describe('Testing Infrastructure', () => {
  it('Jest is configured and running', () => {
    // Arrange
    const value = true;

    // Act & Assert
    expect(value).toBe(true);
  });

  it('TypeScript compiles correctly', () => {
    // Arrange
    const testFunction = (x: number): number => x * 2;

    // Act
    const result = testFunction(21);

    // Assert
    expect(result).toBe(42);
  });

  it('Jest matchers work correctly', () => {
    // Arrange
    const testObject = { name: 'Zombie Farm', active: true };

    // Assert - test various matchers
    expect(testObject).toBeDefined();
    expect(testObject.name).toBe('Zombie Farm');
    expect(testObject.active).toBeTruthy();
    expect(testObject).toEqual({ name: 'Zombie Farm', active: true });
  });

  it('can import from App module', () => {
    // This verifies that the module system is working
    // and that App.tsx compiles correctly
    const { App } = require('./App');

    // Assert
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
});
