/**
 * Unit Test Template
 *
 * Purpose: Test isolated functions, classes, or modules without external dependencies.
 * Use this template for pure functions, utility functions, and business logic.
 *
 * INSTRUCTIONS:
 * 1. Replace all [PLACEHOLDER] text with your actual values
 * 2. Remove sections that don't apply to your test
 * 3. Follow the AAA pattern: Arrange, Act, Assert
 * 4. Keep tests focused - one behavior per test
 * 5. Use descriptive test names that explain the scenario
 */

import { [FUNCTION_NAME] } from '@features/[MODULE]/[FILE]';
import { create[TYPE] } from '@lib/test-utils/factories';
import { mockRandomValue, resetRandom } from '@lib/test-utils/mocks';
import type { [TYPE] } from '@types';

describe('[FUNCTION_NAME]', () => {
  /**
   * SETUP AND TEARDOWN
   * Use beforeEach/afterEach for common setup and cleanup
   */
  beforeEach(() => {
    // Common setup for all tests in this suite
    // Example: mockRandomValue(0.5);
  });

  afterEach(() => {
    // Clean up after each test
    // Example: resetRandom();
  });

  /**
   * HAPPY PATH TESTS
   * Test the main functionality with valid inputs
   */
  describe('happy path', () => {
    it('should [EXPECTED_BEHAVIOR] when [CONDITION]', () => {
      // Arrange - Set up test data and conditions
      const input = create[TYPE]({
        // Override specific properties for this test
        [PROPERTY]: [VALUE],
      });

      // Act - Execute the function under test
      const result = [FUNCTION_NAME](input);

      // Assert - Verify the expected outcome
      expect(result).toBe([EXPECTED_VALUE]);
      expect(result).toHaveProperty('[PROPERTY]');
    });

    it('should return correct value for typical input', () => {
      // Arrange
      const input = [TYPICAL_INPUT];

      // Act
      const result = [FUNCTION_NAME](input);

      // Assert
      expect(result).toEqual([EXPECTED_OUTPUT]);
    });
  });

  /**
   * EDGE CASES
   * Test boundary conditions and unusual inputs
   */
  describe('edge cases', () => {
    it('should handle empty input', () => {
      // Arrange
      const input = [EMPTY_VALUE]; // [], {}, null, undefined, etc.

      // Act
      const result = [FUNCTION_NAME](input);

      // Assert
      expect(result).toBe([EXPECTED_FOR_EMPTY]);
    });

    it('should handle maximum values', () => {
      // Arrange
      const input = create[TYPE]({
        [PROPERTY]: Number.MAX_SAFE_INTEGER,
      });

      // Act
      const result = [FUNCTION_NAME](input);

      // Assert
      expect(result).toBeDefined();
      // Verify it handles large values gracefully
    });

    it('should handle minimum values', () => {
      // Arrange
      const input = create[TYPE]({
        [PROPERTY]: 0, // or Number.MIN_VALUE
      });

      // Act
      const result = [FUNCTION_NAME](input);

      // Assert
      expect(result).toBe([EXPECTED_FOR_MIN]);
    });
  });

  /**
   * ERROR HANDLING
   * Test how the function handles invalid inputs
   */
  describe('error handling', () => {
    it('should throw error when [INVALID_CONDITION]', () => {
      // Arrange
      const invalidInput = [INVALID_VALUE];

      // Act & Assert
      expect(() => {
        [FUNCTION_NAME](invalidInput);
      }).toThrow(/[ERROR_MESSAGE_PATTERN]/i);
    });

    it('should return error object when [ERROR_CONDITION]', () => {
      // Arrange
      const input = create[TYPE]({
        [PROPERTY]: [INVALID_VALUE],
      });

      // Act
      const result = [FUNCTION_NAME](input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('[ERROR_CODE]');
    });
  });

  /**
   * INTEGRATION WITH DEPENDENCIES
   * Test how the function works with mocked dependencies
   */
  describe('with mocked dependencies', () => {
    it('should use random value correctly', () => {
      // Arrange
      mockRandomValue(0.25);
      const input = create[TYPE]();

      // Act
      const result = [FUNCTION_NAME](input);

      // Assert
      expect(result.[RANDOM_DEPENDENT_PROPERTY]).toBe([EXPECTED_VALUE]);
    });

    it('should handle external state correctly', () => {
      // Arrange
      const externalState = { [KEY]: [VALUE] };
      const input = create[TYPE]();

      // Act
      const result = [FUNCTION_NAME](input, externalState);

      // Assert
      expect(result).toBeDefined();
      expect(externalState.[KEY]).toBe([MODIFIED_VALUE]); // If function modifies state
    });
  });

  /**
   * PERFORMANCE AND OPTIMIZATION (Optional)
   * Test performance characteristics if relevant
   */
  describe('performance', () => {
    it('should handle large datasets efficiently', () => {
      // Arrange
      const largeInput = Array(1000).fill(null).map(() => create[TYPE]());

      // Act
      const startTime = performance.now();
      const result = [FUNCTION_NAME](largeInput);
      const endTime = performance.now();

      // Assert
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Adjust threshold as needed
    });
  });
});

/**
 * EXAMPLES OF COMMON PATTERNS
 */

// Example 1: Testing a calculation function
describe('calculateDamage', () => {
  it('should apply armor reduction to physical damage', () => {
    const attacker = createTestZombie({ stats: { attack: 50 } });
    const defender = createTestEnemy({ stats: { defense: 20 } });

    const damage = calculateDamage(attacker, defender, 'physical');

    expect(damage).toBe(30); // 50 - 20
  });
});

// Example 2: Testing with factories
describe('processZombieStats', () => {
  it('should apply stat modifiers correctly', () => {
    const zombie = createTestZombie({
      stats: { attack: 10, maxHp: 100 },
      modifiers: { attackMultiplier: 1.5 },
    });

    const processed = processZombieStats(zombie);

    expect(processed.stats.attack).toBe(15); // 10 * 1.5
  });
});

// Example 3: Testing with mocked randomness
describe('rollForMutation', () => {
  afterEach(() => {
    resetRandom();
  });

  it('should mutate when roll is below threshold', () => {
    mockRandomValue(0.03); // Below 5% threshold

    const result = rollForMutation(0.05);

    expect(result.mutated).toBe(true);
  });
});
