/**
 * Fortifications Service Tests
 *
 * Tests for fortification types (walls, towers, traps),
 * placement, and battlefield obstacles.
 *
 * Per DOMAIN-COMBAT.md fortification specifications.
 */

import { describe, it, expect } from '@jest/globals';
import {
  createFortification,
  canPlaceFortification,
  blocksLineOfSight,
  blocksMovement,
  getFortificationStats,
  triggerTrap,
  destroyFortification,
} from '../fortifications';
import { ObstacleType, DamageType } from '../../../../types/combat';
import type { Obstacle } from '../../../../types/combat';

describe('Fortifications Service', () => {
  // ============================================================================
  // FORTIFICATION CREATION
  // ============================================================================

  describe('createFortification', () => {
    it('should create a wall fortification', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });

      expect(wall.type).toBe(ObstacleType.WALL);
      expect(wall.position).toEqual({ x: 100, y: 50 });
      expect(wall.isDestructible).toBe(true);
      expect(wall.hp).toBeGreaterThan(0);
      expect(wall.maxHp).toBeGreaterThan(0);
      expect(wall.hp).toBe(wall.maxHp);
    });

    it('should create a gate fortification with high HP', () => {
      const gate = createFortification(ObstacleType.GATE, { x: 200, y: 100 });

      expect(gate.type).toBe(ObstacleType.GATE);
      expect(gate.maxHp).toBeGreaterThan(100); // Gates are sturdy
      expect(gate.defense).toBeGreaterThan(0);
      expect(gate.isDestructible).toBe(true);
    });

    it('should create a tower fortification', () => {
      const tower = createFortification(ObstacleType.TOWER, { x: 150, y: 75 });

      expect(tower.type).toBe(ObstacleType.TOWER);
      expect(tower.isDestructible).toBe(true);
      expect(tower.maxHp).toBeGreaterThan(0);
    });

    it('should create a spike pit trap', () => {
      const trap = createFortification(ObstacleType.SPIKE_PIT, {
        x: 50,
        y: 50,
      });

      expect(trap.type).toBe(ObstacleType.SPIKE_PIT);
      expect(trap.trapData).toBeDefined();
      expect(trap.trapData!.damage).toBeGreaterThan(0);
      expect(trap.trapData!.triggered).toBe(false);
    });

    it('should create a fire trap with burning effect', () => {
      const trap = createFortification(ObstacleType.FIRE_TRAP, {
        x: 75,
        y: 25,
      });

      expect(trap.type).toBe(ObstacleType.FIRE_TRAP);
      expect(trap.trapData).toBeDefined();
      expect(trap.trapData!.damageType).toBe(DamageType.FIRE);
      expect(trap.trapData!.triggered).toBe(false);
    });

    it('should create a barricade fortification', () => {
      const barricade = createFortification(ObstacleType.BARRICADE, {
        x: 120,
        y: 60,
      });

      expect(barricade.type).toBe(ObstacleType.BARRICADE);
      expect(barricade.isDestructible).toBe(true);
      expect(barricade.maxHp).toBeGreaterThan(0);
    });

    it('should generate unique IDs for each fortification', () => {
      const fort1 = createFortification(ObstacleType.WALL, { x: 0, y: 0 });
      const fort2 = createFortification(ObstacleType.WALL, { x: 0, y: 0 });

      expect(fort1.id).not.toBe(fort2.id);
    });

    it('should initialize fortification as not destroyed', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 0, y: 0 });

      expect(wall.isDestroyed).toBe(false);
    });
  });

  // ============================================================================
  // FORTIFICATION STATS
  // ============================================================================

  describe('getFortificationStats', () => {
    it('should return stats for wall', () => {
      const stats = getFortificationStats(ObstacleType.WALL);

      expect(stats.maxHp).toBeGreaterThan(0);
      expect(stats.defense).toBeGreaterThan(0);
    });

    it('should return higher HP for gate than wall', () => {
      const wallStats = getFortificationStats(ObstacleType.WALL);
      const gateStats = getFortificationStats(ObstacleType.GATE);

      expect(gateStats.maxHp).toBeGreaterThan(wallStats.maxHp);
    });

    it('should return stats for tower', () => {
      const stats = getFortificationStats(ObstacleType.TOWER);

      expect(stats.maxHp).toBeGreaterThan(0);
      expect(stats.defense).toBeGreaterThan(0);
    });

    it('should return trap damage for spike pit', () => {
      const stats = getFortificationStats(ObstacleType.SPIKE_PIT);

      expect(stats.trapDamage).toBeGreaterThan(0);
      expect(stats.damageType).toBe(DamageType.PHYSICAL);
    });

    it('should return fire trap stats with fire damage', () => {
      const stats = getFortificationStats(ObstacleType.FIRE_TRAP);

      expect(stats.trapDamage).toBeGreaterThan(0);
      expect(stats.damageType).toBe(DamageType.FIRE);
    });

    it('should return stats for barricade', () => {
      const stats = getFortificationStats(ObstacleType.BARRICADE);

      expect(stats.maxHp).toBeGreaterThan(0);
      expect(stats.defense).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // FORTIFICATION PLACEMENT
  // ============================================================================

  describe('canPlaceFortification', () => {
    const existingForts: Obstacle[] = [
      createFortification(ObstacleType.WALL, { x: 100, y: 50 }),
      createFortification(ObstacleType.GATE, { x: 200, y: 50 }),
    ];

    it('should allow placement in empty space', () => {
      const canPlace = canPlaceFortification({ x: 300, y: 100 }, existingForts);

      expect(canPlace).toBe(true);
    });

    it('should reject placement on existing fortification', () => {
      const canPlace = canPlaceFortification({ x: 100, y: 50 }, existingForts);

      expect(canPlace).toBe(false);
    });

    it('should reject placement too close to existing fortification', () => {
      const canPlace = canPlaceFortification({ x: 105, y: 50 }, existingForts);

      expect(canPlace).toBe(false);
    });

    it('should allow placement at minimum distance', () => {
      const canPlace = canPlaceFortification({ x: 132, y: 50 }, existingForts);

      expect(canPlace).toBe(true);
    });

    it('should reject out of bounds placement (negative)', () => {
      const canPlace = canPlaceFortification({ x: -10, y: 50 }, existingForts);

      expect(canPlace).toBe(false);
    });

    it('should reject out of bounds placement (too far)', () => {
      const canPlace = canPlaceFortification({ x: 10000, y: 50 }, existingForts);

      expect(canPlace).toBe(false);
    });

    it('should handle empty fortifications list', () => {
      const canPlace = canPlaceFortification({ x: 100, y: 50 }, []);

      expect(canPlace).toBe(true);
    });
  });

  // ============================================================================
  // LINE OF SIGHT BLOCKING
  // ============================================================================

  describe('blocksLineOfSight', () => {
    it('should return true for wall blocking LOS', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });

      expect(blocksLineOfSight(wall)).toBe(true);
    });

    it('should return true for gate blocking LOS', () => {
      const gate = createFortification(ObstacleType.GATE, { x: 200, y: 100 });

      expect(blocksLineOfSight(gate)).toBe(true);
    });

    it('should return true for tower blocking LOS', () => {
      const tower = createFortification(ObstacleType.TOWER, { x: 150, y: 75 });

      expect(blocksLineOfSight(tower)).toBe(true);
    });

    it('should return true for barricade blocking LOS', () => {
      const barricade = createFortification(ObstacleType.BARRICADE, {
        x: 120,
        y: 60,
      });

      expect(blocksLineOfSight(barricade)).toBe(true);
    });

    it('should return false for traps (do not block LOS)', () => {
      const trap = createFortification(ObstacleType.SPIKE_PIT, {
        x: 50,
        y: 50,
      });

      expect(blocksLineOfSight(trap)).toBe(false);
    });

    it('should return false for destroyed fortifications', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });
      const destroyed = { ...wall, isDestroyed: true };

      expect(blocksLineOfSight(destroyed)).toBe(false);
    });
  });

  // ============================================================================
  // MOVEMENT BLOCKING
  // ============================================================================

  describe('blocksMovement', () => {
    it('should return true for wall blocking movement', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });

      expect(blocksMovement(wall)).toBe(true);
    });

    it('should return true for gate blocking movement', () => {
      const gate = createFortification(ObstacleType.GATE, { x: 200, y: 100 });

      expect(blocksMovement(gate)).toBe(true);
    });

    it('should return true for barricade blocking movement', () => {
      const barricade = createFortification(ObstacleType.BARRICADE, {
        x: 120,
        y: 60,
      });

      expect(blocksMovement(barricade)).toBe(true);
    });

    it('should return false for tower (does not block movement)', () => {
      const tower = createFortification(ObstacleType.TOWER, { x: 150, y: 75 });

      expect(blocksMovement(tower)).toBe(false);
    });

    it('should return false for traps (do not block movement)', () => {
      const trap = createFortification(ObstacleType.FIRE_TRAP, {
        x: 75,
        y: 25,
      });

      expect(blocksMovement(trap)).toBe(false);
    });

    it('should return false for destroyed fortifications', () => {
      const gate = createFortification(ObstacleType.GATE, { x: 200, y: 100 });
      const destroyed = { ...gate, isDestroyed: true };

      expect(blocksMovement(destroyed)).toBe(false);
    });
  });

  // ============================================================================
  // TRAP TRIGGERING
  // ============================================================================

  describe('triggerTrap', () => {
    it('should trigger spike pit trap and deal damage', () => {
      const trap = createFortification(ObstacleType.SPIKE_PIT, {
        x: 50,
        y: 50,
      });

      const result = triggerTrap(trap);

      expect(result.triggered).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.damageType).toBe(DamageType.PHYSICAL);
      expect(result.updatedTrap.trapData!.triggered).toBe(true);
    });

    it('should trigger fire trap and return fire damage', () => {
      const trap = createFortification(ObstacleType.FIRE_TRAP, {
        x: 75,
        y: 25,
      });

      const result = triggerTrap(trap);

      expect(result.triggered).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.damageType).toBe(DamageType.FIRE);
    });

    it('should not trigger already triggered trap', () => {
      const trap = createFortification(ObstacleType.SPIKE_PIT, {
        x: 50,
        y: 50,
      });
      const triggeredTrap = {
        ...trap,
        trapData: { ...trap.trapData!, triggered: true },
      };

      const result = triggerTrap(triggeredTrap);

      expect(result.triggered).toBe(false);
      expect(result.damage).toBe(0);
    });

    it('should not trigger non-trap fortification', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });

      const result = triggerTrap(wall);

      expect(result.triggered).toBe(false);
      expect(result.damage).toBe(0);
    });

    it('should mark trap as triggered after activation', () => {
      const trap = createFortification(ObstacleType.SPIKE_PIT, {
        x: 50,
        y: 50,
      });

      const result = triggerTrap(trap);

      expect(result.updatedTrap.trapData!.triggered).toBe(true);
    });

    it('should return status effect for fire trap', () => {
      const trap = createFortification(ObstacleType.FIRE_TRAP, {
        x: 75,
        y: 25,
      });

      const result = triggerTrap(trap);

      expect(result.statusEffect).toBeDefined();
    });
  });

  // ============================================================================
  // FORTIFICATION DESTRUCTION
  // ============================================================================

  describe('destroyFortification', () => {
    it('should destroy fortification when HP reaches zero', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });
      const damaged = { ...wall, hp: 0 };

      const destroyed = destroyFortification(damaged);

      expect(destroyed.isDestroyed).toBe(true);
      expect(destroyed.hp).toBe(0);
    });

    it('should not destroy fortification with remaining HP', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });
      const damaged = { ...wall, hp: 10 };

      const result = destroyFortification(damaged);

      expect(result.isDestroyed).toBe(false);
    });

    it('should mark gate as destroyed when HP is zero', () => {
      const gate = createFortification(ObstacleType.GATE, { x: 200, y: 100 });
      const destroyed = destroyFortification({ ...gate, hp: 0 });

      expect(destroyed.isDestroyed).toBe(true);
    });

    it('should handle tower destruction', () => {
      const tower = createFortification(ObstacleType.TOWER, { x: 150, y: 75 });
      const destroyed = destroyFortification({ ...tower, hp: 0 });

      expect(destroyed.isDestroyed).toBe(true);
    });

    it('should handle barricade destruction', () => {
      const barricade = createFortification(ObstacleType.BARRICADE, {
        x: 120,
        y: 60,
      });
      const destroyed = destroyFortification({ ...barricade, hp: 0 });

      expect(destroyed.isDestroyed).toBe(true);
    });

    it('should keep trap data when trap is destroyed', () => {
      const trap = createFortification(ObstacleType.SPIKE_PIT, {
        x: 50,
        y: 50,
      });
      const destroyed = destroyFortification({ ...trap, hp: 0 });

      expect(destroyed.trapData).toBeDefined();
    });

    it('should not modify already destroyed fortifications', () => {
      const wall = createFortification(ObstacleType.WALL, { x: 100, y: 50 });
      const alreadyDestroyed = { ...wall, isDestroyed: true, hp: 0 };

      const result = destroyFortification(alreadyDestroyed);

      expect(result.isDestroyed).toBe(true);
    });
  });
});
