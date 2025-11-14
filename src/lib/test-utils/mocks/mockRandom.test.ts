/**
 * Tests for mockRandom utility
 *
 * Validates that the random mocking utilities provide deterministic
 * random number generation for testing RNG-dependent game mechanics.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  mockRandomValue,
  mockRandomSequence,
  mockRandomSeed,
  resetRandom,
  getNextRandom,
  getSequenceIndex,
  resetSequenceIndex,
  isRandomMocked,
  randomInt,
  randomFloat,
  chance,
  randomPick,
} from './mockRandom';

describe('mockRandom', () => {
  afterEach(() => {
    resetRandom();
  });

  describe('mockRandomValue', () => {
    it('should make Math.random return a specific value', () => {
      // Act
      mockRandomValue(0.5);

      // Assert
      expect(Math.random()).toBe(0.5);
      expect(Math.random()).toBe(0.5);
      expect(Math.random()).toBe(0.5);
    });

    it('should work with edge values', () => {
      // Test minimum
      mockRandomValue(0);
      expect(Math.random()).toBe(0);

      resetRandom();

      // Test near maximum
      mockRandomValue(0.999999);
      expect(Math.random()).toBe(0.999999);
    });

    it('should throw error for value < 0', () => {
      expect(() => mockRandomValue(-0.1)).toThrow('Random value must be >= 0 and < 1');
    });

    it('should throw error for value >= 1', () => {
      expect(() => mockRandomValue(1)).toThrow('Random value must be >= 0 and < 1');
      expect(() => mockRandomValue(1.5)).toThrow('Random value must be >= 0 and < 1');
    });

    it('should allow changing the mocked value', () => {
      // Arrange
      mockRandomValue(0.1);
      expect(Math.random()).toBe(0.1);

      // Act
      mockRandomValue(0.9);

      // Assert
      expect(Math.random()).toBe(0.9);
    });
  });

  describe('mockRandomSequence', () => {
    it('should return values in sequence', () => {
      // Arrange
      mockRandomSequence([0.1, 0.5, 0.9]);

      // Act & Assert
      expect(Math.random()).toBe(0.1);
      expect(Math.random()).toBe(0.5);
      expect(Math.random()).toBe(0.9);
    });

    it('should cycle back to start after sequence exhausted', () => {
      // Arrange
      mockRandomSequence([0.1, 0.2, 0.3]);

      // Act & Assert
      expect(Math.random()).toBe(0.1);
      expect(Math.random()).toBe(0.2);
      expect(Math.random()).toBe(0.3);
      expect(Math.random()).toBe(0.1); // Cycles
      expect(Math.random()).toBe(0.2);
    });

    it('should work with single value sequence', () => {
      // Arrange
      mockRandomSequence([0.5]);

      // Act & Assert
      expect(Math.random()).toBe(0.5);
      expect(Math.random()).toBe(0.5);
    });

    it('should throw error for empty sequence', () => {
      expect(() => mockRandomSequence([])).toThrow('Sequence must contain at least one value');
    });

    it('should throw error if sequence contains invalid values', () => {
      expect(() => mockRandomSequence([0.5, -0.1])).toThrow(
        'All sequence values must be >= 0 and < 1'
      );
      expect(() => mockRandomSequence([0.5, 1.0])).toThrow(
        'All sequence values must be >= 0 and < 1'
      );
    });

    it('should allow changing the sequence', () => {
      // Arrange
      mockRandomSequence([0.1, 0.2]);
      expect(Math.random()).toBe(0.1);

      // Act
      mockRandomSequence([0.7, 0.8, 0.9]);

      // Assert
      expect(Math.random()).toBe(0.7);
      expect(Math.random()).toBe(0.8);
      expect(Math.random()).toBe(0.9);
    });
  });

  describe('mockRandomSeed', () => {
    it('should produce deterministic sequence with same seed', () => {
      // Arrange
      mockRandomSeed(12345);
      const sequence1 = [Math.random(), Math.random(), Math.random(), Math.random()];

      resetRandom();

      mockRandomSeed(12345); // Same seed
      const sequence2 = [Math.random(), Math.random(), Math.random(), Math.random()];

      // Assert
      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      // Arrange
      mockRandomSeed(111);
      const sequence1 = [Math.random(), Math.random(), Math.random()];

      resetRandom();

      mockRandomSeed(222); // Different seed
      const sequence2 = [Math.random(), Math.random(), Math.random()];

      // Assert
      expect(sequence1).not.toEqual(sequence2);
    });

    it('should produce values in valid range [0, 1)', () => {
      // Arrange
      mockRandomSeed(9999);

      // Act & Assert
      for (let i = 0; i < 100; i++) {
        const value = Math.random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should work with seed 0', () => {
      // Act
      mockRandomSeed(0);

      // Assert
      const value = Math.random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should work with negative seed', () => {
      // Act - negative seeds are converted to positive via Math.abs
      mockRandomSeed(-12345);

      // Assert - should produce valid random values
      const value = Math.random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);

      // Verify same negative seed produces same sequence
      resetRandom();
      mockRandomSeed(-12345);
      const value2 = Math.random();
      resetRandom();
      mockRandomSeed(-12345);
      const value3 = Math.random();
      expect(value2).toBe(value3);
    });
  });

  describe('resetRandom', () => {
    it('should restore original Math.random', () => {
      // Arrange
      const originalRandom = Math.random;
      mockRandomValue(0.5);

      // Act
      resetRandom();

      // Assert
      expect(Math.random).toBe(originalRandom);
      // Should produce different values (real random)
      const value1 = Math.random();
      const value2 = Math.random();
      // Very unlikely to be equal (though theoretically possible)
      expect(value1 !== value2 || value1 !== 0.5).toBe(true);
    });

    it('should clear sequence state', () => {
      // Arrange
      mockRandomSequence([0.1, 0.2, 0.3]);
      Math.random(); // Consume one value

      // Act
      resetRandom();

      // Assert
      expect(getNextRandom()).toBeNull();
      expect(getSequenceIndex()).toBe(-1);
    });

    it('should handle being called multiple times', () => {
      // Act & Assert
      expect(() => {
        resetRandom();
        resetRandom();
        resetRandom();
      }).not.toThrow();
    });

    it('should work after different mock types', () => {
      // Test after mockRandomValue
      mockRandomValue(0.5);
      resetRandom();
      expect(isRandomMocked()).toBe(false);

      // Test after mockRandomSequence
      mockRandomSequence([0.1, 0.2]);
      resetRandom();
      expect(isRandomMocked()).toBe(false);

      // Test after mockRandomSeed
      mockRandomSeed(123);
      resetRandom();
      expect(isRandomMocked()).toBe(false);
    });
  });

  describe('Sequence helpers', () => {
    beforeEach(() => {
      mockRandomSequence([0.1, 0.2, 0.3, 0.4]);
    });

    it('getNextRandom should return next value without consuming', () => {
      // Assert
      expect(getNextRandom()).toBe(0.1);
      expect(getNextRandom()).toBe(0.1); // Still 0.1

      // Act
      Math.random();

      // Assert
      expect(getNextRandom()).toBe(0.2); // Now 0.2
    });

    it('getNextRandom should return null when not using sequence', () => {
      // Arrange
      resetRandom();
      mockRandomValue(0.5);

      // Assert
      expect(getNextRandom()).toBeNull();
    });

    it('getSequenceIndex should track current position', () => {
      // Assert
      expect(getSequenceIndex()).toBe(0);

      Math.random();
      expect(getSequenceIndex()).toBe(1);

      Math.random();
      expect(getSequenceIndex()).toBe(2);

      Math.random();
      expect(getSequenceIndex()).toBe(3);

      Math.random(); // Cycles back
      expect(getSequenceIndex()).toBe(0);
    });

    it('getSequenceIndex should return -1 when not using sequence', () => {
      // Arrange
      resetRandom();

      // Assert
      expect(getSequenceIndex()).toBe(-1);
    });

    it('resetSequenceIndex should restart sequence', () => {
      // Arrange
      Math.random(); // 0.1
      Math.random(); // 0.2
      Math.random(); // 0.3
      expect(getSequenceIndex()).toBe(3);

      // Act
      resetSequenceIndex();

      // Assert
      expect(getSequenceIndex()).toBe(0);
      expect(Math.random()).toBe(0.1); // Back to start
    });
  });

  describe('isRandomMocked', () => {
    it('should return false when not mocked', () => {
      expect(isRandomMocked()).toBe(false);
    });

    it('should return true when using mockRandomValue', () => {
      mockRandomValue(0.5);
      expect(isRandomMocked()).toBe(true);
    });

    it('should return true when using mockRandomSequence', () => {
      mockRandomSequence([0.1, 0.2]);
      expect(isRandomMocked()).toBe(true);
    });

    it('should return true when using mockRandomSeed', () => {
      mockRandomSeed(123);
      expect(isRandomMocked()).toBe(true);
    });

    it('should return false after reset', () => {
      mockRandomValue(0.5);
      expect(isRandomMocked()).toBe(true);

      resetRandom();
      expect(isRandomMocked()).toBe(false);
    });
  });

  describe('Helper functions', () => {
    describe('randomInt', () => {
      it('should generate integer in range', () => {
        mockRandomValue(0.5);
        const value = randomInt(0, 10);
        expect(value).toBe(5); // floor(0.5 * 11) + 0 = 5
      });

      it('should respect min and max bounds', () => {
        mockRandomValue(0);
        expect(randomInt(5, 10)).toBe(5); // Minimum

        mockRandomValue(0.999999);
        expect(randomInt(5, 10)).toBe(10); // Maximum
      });

      it('should work with negative numbers', () => {
        mockRandomValue(0.5);
        const value = randomInt(-10, 10);
        expect(value).toBe(0); // floor(0.5 * 21) - 10 = 0
      });

      it('should work when min equals max', () => {
        const value = randomInt(5, 5);
        expect(value).toBe(5);
      });
    });

    describe('randomFloat', () => {
      it('should generate float in range', () => {
        mockRandomValue(0.5);
        const value = randomFloat(0, 100);
        expect(value).toBe(50);
      });

      it('should respect min and max bounds', () => {
        mockRandomValue(0);
        expect(randomFloat(10, 20)).toBe(10); // Minimum

        mockRandomValue(0.999999);
        const value = randomFloat(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThan(20);
      });

      it('should work with negative numbers', () => {
        mockRandomValue(0.5);
        const value = randomFloat(-100, 100);
        expect(value).toBe(0);
      });
    });

    describe('chance', () => {
      it('should return true when random < probability', () => {
        mockRandomValue(0.3);
        expect(chance(0.5)).toBe(true); // 0.3 < 0.5
      });

      it('should return false when random >= probability', () => {
        mockRandomValue(0.7);
        expect(chance(0.5)).toBe(false); // 0.7 >= 0.5
      });

      it('should always return true for probability 1', () => {
        mockRandomValue(0.999999);
        expect(chance(1)).toBe(true);
      });

      it('should always return false for probability 0', () => {
        mockRandomValue(0);
        expect(chance(0)).toBe(false);
      });

      it('should handle edge cases', () => {
        mockRandomValue(0.5);
        expect(chance(0.5)).toBe(false); // 0.5 is not < 0.5

        mockRandomValue(0.4999);
        expect(chance(0.5)).toBe(true); // 0.4999 < 0.5
      });
    });

    describe('randomPick', () => {
      it('should pick element from array', () => {
        mockRandomValue(0.5);
        const array = ['a', 'b', 'c', 'd'];
        const picked = randomPick(array);
        expect(picked).toBe('c'); // floor(0.5 * 4) = 2, array[2] = 'c'
      });

      it('should pick first element when random is 0', () => {
        mockRandomValue(0);
        const array = [1, 2, 3, 4, 5];
        expect(randomPick(array)).toBe(1);
      });

      it('should pick last element when random is near 1', () => {
        mockRandomValue(0.999999);
        const array = [1, 2, 3, 4, 5];
        expect(randomPick(array)).toBe(5);
      });

      it('should work with single element array', () => {
        const array = ['only'];
        expect(randomPick(array)).toBe('only');
      });

      it('should throw error for empty array', () => {
        expect(() => randomPick([])).toThrow('Cannot pick from empty array');
      });

      it('should work with different types', () => {
        mockRandomValue(0.5);

        // Objects
        const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
        expect(randomPick(objects)).toEqual({ id: 2 });

        // Numbers
        const numbers = [10, 20, 30, 40];
        expect(randomPick(numbers)).toBe(30);
      });
    });
  });

  describe('Real-world game scenarios', () => {
    it('should test mutation chance (5% probability)', () => {
      // Arrange - mutation happens at < 0.05
      const mutationChance = 0.05;

      // Act & Assert - should NOT mutate
      mockRandomValue(0.1);
      expect(chance(mutationChance)).toBe(false);

      // Act & Assert - SHOULD mutate
      mockRandomValue(0.01);
      expect(chance(mutationChance)).toBe(true);
    });

    it('should test critical hit (15% probability)', () => {
      // Arrange
      const criticalChance = 0.15;

      // Test multiple scenarios
      mockRandomSequence([0.1, 0.14, 0.15, 0.2]);

      expect(chance(criticalChance)).toBe(true); // 0.1 < 0.15
      expect(chance(criticalChance)).toBe(true); // 0.14 < 0.15
      expect(chance(criticalChance)).toBe(false); // 0.15 >= 0.15
      expect(chance(criticalChance)).toBe(false); // 0.2 >= 0.15
    });

    it('should test loot drop selection', () => {
      // Arrange - different loot rarities
      const commonLoot = ['bone', 'flesh', 'cloth'];
      const rareLoot = ['soul_fragment', 'cursed_gem'];
      const epicLoot = ['legendary_skull'];

      // Test with specific values
      mockRandomValue(0.1);
      expect(randomPick(commonLoot)).toBe('bone'); // floor(0.1 * 3) = 0

      mockRandomValue(0.5);
      expect(randomPick(commonLoot)).toBe('flesh'); // floor(0.5 * 3) = 1

      mockRandomValue(0.5);
      expect(randomPick(rareLoot)).toBe('cursed_gem'); // floor(0.5 * 2) = 1

      mockRandomValue(0);
      expect(randomPick(epicLoot)).toBe('legendary_skull');
    });

    it('should test zombie stat variation', () => {
      // Arrange - stats vary by +/- 20%
      const baseHP = 100;
      const variation = 0.2;

      mockRandomValue(0.5);
      const minHP = baseHP * (1 - variation);
      const maxHP = baseHP * (1 + variation);
      const actualHP = randomFloat(minHP, maxHP);

      // Assert - should be exactly in the middle
      expect(actualHP).toBe(100); // 0.5 * (120 - 80) + 80 = 100
    });

    it('should test damage variance (90%-110%)', () => {
      // Arrange
      const baseDamage = 50;

      // Test minimum variance (90%)
      mockRandomValue(0);
      const minDamage = randomFloat(baseDamage * 0.9, baseDamage * 1.1);
      expect(minDamage).toBe(45);

      // Test maximum variance (110%)
      mockRandomValue(0.999999);
      const maxDamage = randomFloat(baseDamage * 0.9, baseDamage * 1.1);
      expect(maxDamage).toBeCloseTo(55, 1);

      // Test middle variance (100%)
      mockRandomValue(0.5);
      const midDamage = randomFloat(baseDamage * 0.9, baseDamage * 1.1);
      expect(midDamage).toBe(50);
    });

    it('should test enemy spawn selection', () => {
      // Arrange
      const enemyTypes = ['human_warrior', 'human_archer', 'human_mage', 'human_cleric'];

      // Deterministic spawn pattern
      mockRandomSeed(42);
      const wave = [];
      for (let i = 0; i < 5; i++) {
        wave.push(randomPick(enemyTypes));
      }

      // Assert - should get same pattern with same seed
      mockRandomSeed(42);
      const wave2 = [];
      for (let i = 0; i < 5; i++) {
        wave2.push(randomPick(enemyTypes));
      }

      expect(wave).toEqual(wave2);
    });
  });
});
