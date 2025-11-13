/**
 * Test Setup File
 *
 * This file runs before each test suite to configure the testing environment.
 * It sets up custom matchers, global utilities, and any necessary test infrastructure.
 */

// Import jest-dom matchers for DOM assertions
// Adds custom matchers like toBeInTheDocument(), toHaveTextContent(), etc.
import '@testing-library/jest-dom';

// Global test configuration
// Configure fake timers by default (can be overridden in individual tests)
beforeEach(() => {
  // Reset all mocks before each test for isolation
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  // If tests use fake timers, restore them
  if (jest.isMockFunction(setTimeout)) {
    jest.useRealTimers();
  }
});

// Suppress console errors in tests unless explicitly testing error handling
// This keeps test output clean while still allowing intentional error logging
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Allow specific expected errors through
    const message = args[0]?.toString() || '';

    // Suppress React 18 act() warnings that are often false positives
    if (message.includes('Warning: ReactDOM.render')) {
      return;
    }
    if (message.includes('Not implemented: HTMLFormElement.prototype.submit')) {
      return;
    }

    // Call original for all other errors
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities can be added here as needed
// For example:
// - Custom test data generators
// - Global mocks for browser APIs
// - Test environment configuration

// Note: Specific test utilities (factories, fixtures, custom matchers)
// will be organized in src/lib/test-utils/ and imported as needed by tests.
