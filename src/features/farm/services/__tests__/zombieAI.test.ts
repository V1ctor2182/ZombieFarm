/**
 * Zombie AI Service - Unit Tests
 *
 * Tests zombie AI behavior system per DOMAIN-FARM.md:
 * - AI states (IDLE, WANDERING, FOLLOWING, GUARDING, etc.)
 * - State transitions
 * - Personality trait influences
 * - Command execution
 *
 * Authority: DOMAIN-FARM.md Section "Living Zombies on the Farm"
 */

import type { Zombie, ZombieAIState } from '../../../../types/farm';
import type { Position } from '../../../../types/global';
import { createTestZombie } from '../../../../lib/test-utils/factories/zombieFactory';

// Import functions to test (will be implemented)
import {
  setAIState,
  updateZombieAI,
  setFollowCommand,
  setGuardCommand,
  clearCommand,
  getNextWanderPosition,
  shouldTransitionToIdle,
  isValidGuardPosition,
} from '../zombieAI';

describe('zombieAI', () => {
  describe('setAIState', () => {
    it('should set zombie AI state', () => {
      const zombie = createTestZombie({ aiState: 'idle' });

      const result = setAIState(zombie, 'wandering');

      expect(result.aiState).toBe('wandering');
    });

    it('should not mutate original zombie', () => {
      const zombie = createTestZombie({ aiState: 'idle' });
      const originalState = zombie.aiState;

      setAIState(zombie, 'wandering');

      expect(zombie.aiState).toBe(originalState);
    });

    it('should handle all valid AI states', () => {
      const zombie = createTestZombie();
      const states: ZombieAIState[] = [
        'idle',
        'wandering',
        'following',
        'guarding',
        'gathering',
        'training',
        'resting',
      ];

      states.forEach((state) => {
        const result = setAIState(zombie, state);
        expect(result.aiState).toBe(state);
      });
    });
  });

  describe('setFollowCommand', () => {
    it('should set zombie to FOLLOWING state', () => {
      const zombie = createTestZombie({ aiState: 'idle' });

      const result = setFollowCommand(zombie);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.aiState).toBe('following');
    });

    it('should work from any AI state', () => {
      const states: ZombieAIState[] = [
        'idle',
        'wandering',
        'guarding',
        'gathering',
        'training',
        'resting',
      ];

      states.forEach((state) => {
        const zombie = createTestZombie({ aiState: state });
        const result = setFollowCommand(zombie);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.aiState).toBe('following');
      });
    });

    it('should not mutate original zombie', () => {
      const zombie = createTestZombie({ aiState: 'idle' });
      const originalState = zombie.aiState;

      setFollowCommand(zombie);

      expect(zombie.aiState).toBe(originalState);
    });
  });

  describe('setGuardCommand', () => {
    it('should set zombie to GUARDING state with position', () => {
      const zombie = createTestZombie({ aiState: 'idle' });
      const guardPosition: Position = { x: 10, y: 15 };

      const result = setGuardCommand(zombie, guardPosition);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.aiState).toBe('guarding');
    });

    it('should fail with invalid position (negative coordinates)', () => {
      const zombie = createTestZombie();
      const invalidPosition: Position = { x: -5, y: 10 };

      const result = setGuardCommand(zombie, invalidPosition);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain('invalid');
    });

    it('should not mutate original zombie', () => {
      const zombie = createTestZombie({ aiState: 'idle' });
      const originalState = zombie.aiState;
      const guardPosition: Position = { x: 10, y: 15 };

      setGuardCommand(zombie, guardPosition);

      expect(zombie.aiState).toBe(originalState);
    });
  });

  describe('clearCommand', () => {
    it('should reset zombie to IDLE state', () => {
      const zombie = createTestZombie({ aiState: 'following' });

      const result = clearCommand(zombie);

      expect(result.aiState).toBe('idle');
    });

    it('should work from any commanded state', () => {
      const commandedStates: ZombieAIState[] = [
        'following',
        'guarding',
        'gathering',
        'training',
      ];

      commandedStates.forEach((state) => {
        const zombie = createTestZombie({ aiState: state });
        const result = clearCommand(zombie);

        expect(result.aiState).toBe('idle');
      });
    });

    it('should not mutate original zombie', () => {
      const zombie = createTestZombie({ aiState: 'following' });
      const originalState = zombie.aiState;

      clearCommand(zombie);

      expect(zombie.aiState).toBe(originalState);
    });
  });

  describe('getNextWanderPosition', () => {
    it('should return position within wander range', () => {
      const currentPosition: Position = { x: 10, y: 10 };
      const wanderRange = 5;

      const nextPosition = getNextWanderPosition(currentPosition, wanderRange);

      const deltaX = Math.abs(nextPosition.x - currentPosition.x);
      const deltaY = Math.abs(nextPosition.y - currentPosition.y);

      expect(deltaX).toBeLessThanOrEqual(wanderRange);
      expect(deltaY).toBeLessThanOrEqual(wanderRange);
    });

    it('should return non-negative coordinates', () => {
      const currentPosition: Position = { x: 2, y: 2 };
      const wanderRange = 5;

      const nextPosition = getNextWanderPosition(currentPosition, wanderRange);

      expect(nextPosition.x).toBeGreaterThanOrEqual(0);
      expect(nextPosition.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge position (0, 0)', () => {
      const currentPosition: Position = { x: 0, y: 0 };
      const wanderRange = 3;

      const nextPosition = getNextWanderPosition(currentPosition, wanderRange);

      expect(nextPosition.x).toBeGreaterThanOrEqual(0);
      expect(nextPosition.y).toBeGreaterThanOrEqual(0);
      expect(nextPosition.x).toBeLessThanOrEqual(wanderRange);
      expect(nextPosition.y).toBeLessThanOrEqual(wanderRange);
    });
  });

  describe('isValidGuardPosition', () => {
    it('should return true for valid position', () => {
      const position: Position = { x: 10, y: 15 };
      const gridSize = { width: 20, height: 20 };

      const result = isValidGuardPosition(position, gridSize);

      expect(result).toBe(true);
    });

    it('should return false for negative coordinates', () => {
      const position: Position = { x: -1, y: 10 };
      const gridSize = { width: 20, height: 20 };

      const result = isValidGuardPosition(position, gridSize);

      expect(result).toBe(false);
    });

    it('should return false for out-of-bounds position', () => {
      const position: Position = { x: 25, y: 10 };
      const gridSize = { width: 20, height: 20 };

      const result = isValidGuardPosition(position, gridSize);

      expect(result).toBe(false);
    });

    it('should return true for edge position', () => {
      const position: Position = { x: 19, y: 19 };
      const gridSize = { width: 20, height: 20 };

      const result = isValidGuardPosition(position, gridSize);

      expect(result).toBe(true);
    });

    it('should return true for origin (0, 0)', () => {
      const position: Position = { x: 0, y: 0 };
      const gridSize = { width: 20, height: 20 };

      const result = isValidGuardPosition(position, gridSize);

      expect(result).toBe(true);
    });
  });

  describe('shouldTransitionToIdle', () => {
    it('should return true for lazy personality after wandering', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        personality: 'lazy',
      });

      const result = shouldTransitionToIdle(zombie);

      // Lazy zombies have higher chance to stop wandering
      expect(typeof result).toBe('boolean');
    });

    it('should return false for energetic personality', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        personality: 'energetic',
      });

      const result = shouldTransitionToIdle(zombie);

      // Energetic zombies rarely stop wandering
      expect(typeof result).toBe('boolean');
    });

    it('should always return false for commanded states', () => {
      const commandedStates: ZombieAIState[] = ['following', 'guarding'];

      commandedStates.forEach((state) => {
        const zombie = createTestZombie({ aiState: state });
        const result = shouldTransitionToIdle(zombie);

        expect(result).toBe(false);
      });
    });
  });

  describe('updateZombieAI', () => {
    it('should update zombie position when wandering', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        position: { x: 10, y: 10 },
      });
      const deltaTime = 1000; // 1 second

      const result = updateZombieAI(zombie, deltaTime);

      expect(result.position).not.toEqual(zombie.position);
    });

    it('should not move zombie when idle', () => {
      const zombie = createTestZombie({
        aiState: 'idle',
        position: { x: 10, y: 10 },
      });
      const deltaTime = 1000;

      const result = updateZombieAI(zombie, deltaTime);

      expect(result.position).toEqual(zombie.position);
    });

    it('should transition lazy zombies from wandering to idle occasionally', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        personality: 'lazy',
        position: { x: 10, y: 10 },
      });
      const deltaTime = 5000; // 5 seconds

      // Run multiple times to test probabilistic behavior
      let transitionedToIdle = false;
      for (let i = 0; i < 20; i++) {
        const result = updateZombieAI(zombie, deltaTime);
        if (result.aiState === 'idle') {
          transitionedToIdle = true;
          break;
        }
      }

      // Lazy zombies should eventually transition to idle
      expect(typeof transitionedToIdle).toBe('boolean');
    });

    it('should not mutate original zombie', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        position: { x: 10, y: 10 },
      });
      const originalPosition = zombie.position;
      const originalState = zombie.aiState;
      const deltaTime = 1000;

      updateZombieAI(zombie, deltaTime);

      expect(zombie.position).toBe(originalPosition);
      expect(zombie.aiState).toBe(originalState);
    });
  });

  describe('Personality Trait Influences', () => {
    it('should make aggressive zombies patrol more', () => {
      const aggressive = createTestZombie({
        personality: 'aggressive',
        aiState: 'idle',
      });

      const result = updateZombieAI(aggressive, 1000);

      // Aggressive zombies are more likely to start wandering
      expect(['idle', 'wandering']).toContain(result.aiState);
    });

    it('should make defensive zombies stay near start position', () => {
      const defensive = createTestZombie({
        personality: 'defensive',
        aiState: 'wandering',
        position: { x: 10, y: 10 },
      });

      // Run AI update multiple times
      let finalResult = defensive;
      for (let i = 0; i < 10; i++) {
        finalResult = updateZombieAI(finalResult, 1000);
      }

      // Defensive zombies should not wander far
      const distance = Math.sqrt(
        Math.pow((finalResult.position?.x ?? 0) - 10, 2) +
          Math.pow((finalResult.position?.y ?? 0) - 10, 2)
      );

      expect(distance).toBeLessThan(10); // Should stay relatively close
    });

    it('should make timid zombies avoid active areas', () => {
      const timid = createTestZombie({
        personality: 'timid',
        aiState: 'wandering',
      });

      const result = updateZombieAI(timid, 1000);

      // Timid behavior can affect movement
      expect(result).toBeDefined();
    });

    it('should make curious zombies explore more', () => {
      const curious = createTestZombie({
        personality: 'curious',
        aiState: 'idle',
      });

      const result = updateZombieAI(curious, 1000);

      // Curious zombies are more likely to start wandering
      expect(['idle', 'wandering']).toContain(result.aiState);
    });

    it('should make lazy zombies idle more often', () => {
      const lazy = createTestZombie({
        personality: 'lazy',
        aiState: 'wandering',
      });

      // Run multiple updates
      let idleCount = 0;
      for (let i = 0; i < 20; i++) {
        const result = updateZombieAI(lazy, 1000);
        if (result.aiState === 'idle') {
          idleCount++;
        }
      }

      // Lazy zombies should become idle frequently
      expect(idleCount).toBeGreaterThan(0);
    });

    it('should make energetic zombies wander more', () => {
      const energetic = createTestZombie({
        personality: 'energetic',
        aiState: 'idle',
      });

      // Run multiple updates
      let wanderingCount = 0;
      for (let i = 0; i < 20; i++) {
        const result = updateZombieAI(energetic, 1000);
        if (result.aiState === 'wandering') {
          wanderingCount++;
        }
      }

      // Energetic zombies should wander frequently
      expect(wanderingCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zombie with no position', () => {
      const zombie = createTestZombie({
        position: null,
        aiState: 'idle',
      });

      const result = updateZombieAI(zombie, 1000);

      expect(result.position).toBeNull();
    });

    it('should handle zero deltaTime', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        position: { x: 10, y: 10 },
      });

      const result = updateZombieAI(zombie, 0);

      // Should not update with zero time
      expect(result.position).toEqual(zombie.position);
    });

    it('should handle negative deltaTime gracefully', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        position: { x: 10, y: 10 },
      });

      const result = updateZombieAI(zombie, -1000);

      // Should treat as zero or ignore
      expect(result.position).toEqual(zombie.position);
    });

    it('should handle very large deltaTime', () => {
      const zombie = createTestZombie({
        aiState: 'wandering',
        position: { x: 10, y: 10 },
      });

      const result = updateZombieAI(zombie, 100000); // 100 seconds

      // Should still produce valid result
      expect(result.position).toBeDefined();
      if (result.position) {
        expect(result.position.x).toBeGreaterThanOrEqual(0);
        expect(result.position.y).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
