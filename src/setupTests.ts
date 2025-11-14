/**
 * Test Setup File
 *
 * This file runs before each test suite to configure the testing environment.
 * It sets up custom matchers, global utilities, and any necessary test infrastructure.
 */

// Import jest-dom matchers for DOM assertions
// Adds custom matchers like toBeInTheDocument(), toHaveTextContent(), etc.
import '@testing-library/jest-dom';

// Import and register custom game-specific matchers
import { registerCustomMatchers } from './lib/test-utils/matchers';
registerCustomMatchers();

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

// Suppress console output in tests to keep test output clean
const originalError = console.error;
const originalLog = console.log;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress console.log in tests
  console.log = jest.fn();

  // Suppress console.warn in tests
  console.warn = jest.fn();

  // Suppress console.error but allow specific errors through
  console.error = (...args: unknown[]) => {
    // Allow specific expected errors through
    const message = args[0]?.toString() || '';

    // Suppress React act() warnings that are often false positives with async effects
    if (message.includes('Warning: ReactDOM.render')) {
      return;
    }
    if (message.includes('Not implemented: HTMLFormElement.prototype.submit')) {
      return;
    }
    if (message.includes('act(')) {
      return;
    }

    // Call original for all other errors
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
  console.warn = originalWarn;
});

// Global test utilities can be added here as needed
// For example:
// - Custom test data generators
// - Global mocks for browser APIs
// - Test environment configuration

// Note: Specific test utilities (factories, fixtures, custom matchers)
// will be organized in src/lib/test-utils/ and imported as needed by tests.
