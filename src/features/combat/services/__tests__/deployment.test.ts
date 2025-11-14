/**
 * Deployment System Tests
 *
 * Tests for squad selection, validation, and deployment logic.
 * Per DOMAIN-COMBAT.md Battle Preparation specifications.
 */

import { describe, it, expect } from '@jest/globals';
import {
  getMaxSquadSize,
  getAvailableZombies,
  isZombieAvailable,
  validateSquadComposition,
  hasZombieDuplicates,
  calculateSquadStats,
  suggestSquadComposition,
  applyDeploymentOrder,
  type DeploymentSlot,
  type SquadCompositionResult,
  type SquadSuggestion,
} from '../deployment';
import { createTestZombie } from '../../../../lib/test-utils/factories/zombieFactory';
import type { Zombie } from '../../../../types/farm';
import { ZombieType } from '../../../../types/farm';

describe('deployment', () => {
  describe('getMaxSquadSize', () => {
    it('returns 3 for no Command Center', () => {
      const maxSize = getMaxSquadSize(0);
      expect(maxSize).toBe(3);
    });

    it('returns 3 for Command Center level 1', () => {
      const maxSize = getMaxSquadSize(1);
      expect(maxSize).toBe(3);
    });

    it('increases size with Command Center level', () => {
      expect(getMaxSquadSize(2)).toBe(4);
      expect(getMaxSquadSize(3)).toBe(5);
      expect(getMaxSquadSize(5)).toBe(7);
    });

    it('caps at maximum squad size of 10', () => {
      expect(getMaxSquadSize(10)).toBe(10);
      expect(getMaxSquadSize(15)).toBe(10);
      expect(getMaxSquadSize(100)).toBe(10);
    });

    it('handles negative levels gracefully', () => {
      expect(getMaxSquadSize(-1)).toBe(3);
      expect(getMaxSquadSize(-5)).toBe(3);
    });
  });

  describe('getAvailableZombies', () => {
    it('returns only alive zombies', () => {
      const zombies: Zombie[] = [
        createTestZombie({ id: 'z1', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z2', stats: { hp: 0, maxHp: 100 } }),
        createTestZombie({ id: 'z3', stats: { hp: 50, maxHp: 100 } }),
      ];

      const available = getAvailableZombies(zombies);
      expect(available).toHaveLength(2);
      expect(available.map((z) => z.id)).toEqual(['z1', 'z3']);
    });

    it('excludes dead zombies', () => {
      const zombies: Zombie[] = [
        createTestZombie({ id: 'z1', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z2', stats: { hp: 0, maxHp: 100 } }),
        createTestZombie({ id: 'z3', stats: { hp: 50, maxHp: 100 } }),
      ];

      const available = getAvailableZombies(zombies);
      expect(available).toHaveLength(2);
      expect(available.map((z) => z.id)).toEqual(['z1', 'z3']);
    });

    it('excludes zombies in combat', () => {
      const zombies: Zombie[] = [
        createTestZombie({ id: 'z1', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z2', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z3', stats: { hp: 100, maxHp: 100 } }),
      ];

      const inCombat = new Set(['z2']);
      const available = getAvailableZombies(zombies, inCombat);
      expect(available).toHaveLength(2);
      expect(available.map((z) => z.id)).toEqual(['z1', 'z3']);
    });

    it('returns empty array if all zombies dead', () => {
      const zombies: Zombie[] = [
        createTestZombie({ stats: { hp: 0, maxHp: 100 } }),
        createTestZombie({ stats: { hp: 0, maxHp: 100 } }),
      ];

      const available = getAvailableZombies(zombies);
      expect(available).toHaveLength(0);
    });

    it('returns all zombies if all are available', () => {
      const zombies: Zombie[] = [
        createTestZombie({ id: 'z1', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z2', stats: { hp: 80, maxHp: 100 } }),
        createTestZombie({ id: 'z3', stats: { hp: 90, maxHp: 100 } }),
      ];

      const available = getAvailableZombies(zombies);
      expect(available).toHaveLength(3);
    });
  });

  describe('isZombieAvailable', () => {
    it('returns true for zombie with HP', () => {
      const zombie = createTestZombie({
        id: 'z1',
        stats: { hp: 50, maxHp: 100 },
      });

      expect(isZombieAvailable(zombie)).toBe(true);
    });

    it('returns false for dead zombie', () => {
      const zombie = createTestZombie({
        id: 'z1',
        stats: { hp: 0, maxHp: 100 },
      });

      expect(isZombieAvailable(zombie)).toBe(false);
    });

    it('returns false when zombie is in combat', () => {
      const zombie = createTestZombie({
        id: 'z1',
        stats: { hp: 100, maxHp: 100 },
      });

      const inCombat = new Set(['z1']);
      expect(isZombieAvailable(zombie, inCombat)).toBe(false);
    });

    it('returns true when different zombie is in combat', () => {
      const zombie = createTestZombie({
        id: 'z1',
        stats: { hp: 100, maxHp: 100 },
      });

      const inCombat = new Set(['z2']);
      expect(isZombieAvailable(zombie, inCombat)).toBe(true);
    });

    it('returns true when no zombies in combat', () => {
      const zombie = createTestZombie({
        id: 'z1',
        stats: { hp: 100, maxHp: 100 },
      });

      expect(isZombieAvailable(zombie, new Set())).toBe(true);
    });
  });

  describe('validateSquadComposition', () => {
    it('accepts valid squad within size limits', () => {
      const squad: Zombie[] = [
        createTestZombie({ id: 'z1' }),
        createTestZombie({ id: 'z2' }),
        createTestZombie({ id: 'z3' }),
      ];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects squad exceeding max size', () => {
      const squad: Zombie[] = [
        createTestZombie({ id: 'z1' }),
        createTestZombie({ id: 'z2' }),
        createTestZombie({ id: 'z3' }),
        createTestZombie({ id: 'z4' }),
      ];

      const result = validateSquadComposition(squad, 3);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad size (4) exceeds maximum (3)');
    });

    it('rejects empty squad', () => {
      const result = validateSquadComposition([], 5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad cannot be empty');
    });

    it('rejects squad with duplicate zombies', () => {
      const zombie = createTestZombie({ id: 'z1' });
      const squad: Zombie[] = [zombie, zombie, createTestZombie({ id: 'z2' })];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad contains duplicate zombies');
    });

    it('rejects squad with unavailable zombies (dead)', () => {
      const squad: Zombie[] = [
        createTestZombie({ id: 'z1', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z2', stats: { hp: 0, maxHp: 100 } }),
        createTestZombie({ id: 'z3', stats: { hp: 50, maxHp: 100 } }),
      ];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad contains unavailable zombies');
    });

    it('rejects squad with zombies in combat', () => {
      const squad: Zombie[] = [
        createTestZombie({ id: 'z1', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z2', stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ id: 'z3', stats: { hp: 100, maxHp: 100 } }),
      ];

      const inCombat = new Set(['z2']);
      const result = validateSquadComposition(squad, 5, inCombat);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad contains unavailable zombies');
    });

    it('warns about lack of tanks', () => {
      const squad: Zombie[] = [
        createTestZombie({ type: ZombieType.SHAMBLER, stats: { defense: 5, hp: 80, maxHp: 100 } }),
        createTestZombie({ type: ZombieType.SHAMBLER, stats: { defense: 5, hp: 80, maxHp: 100 } }),
      ];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Squad has no tank units (consider adding Brute or high-defense zombies)');
    });

    it('warns about lack of ranged units', () => {
      const squad: Zombie[] = [
        createTestZombie({ type: ZombieType.BRUTE, stats: { defense: 30, hp: 80, maxHp: 100 } }),
        createTestZombie({ type: ZombieType.SHAMBLER, stats: { defense: 10, hp: 80, maxHp: 100 } }),
      ];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Squad has no ranged units (consider adding Spitter)');
    });

    it('warns about low average HP', () => {
      const squad: Zombie[] = [
        createTestZombie({ type: ZombieType.BRUTE, stats: { defense: 30, hp: 20, maxHp: 100 } }),
        createTestZombie({ type: ZombieType.SHAMBLER, stats: { defense: 10, hp: 30, maxHp: 100 } }),
      ];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Squad average HP is low (below 50%)');
    });

    it('does not warn for well-balanced squad', () => {
      const squad: Zombie[] = [
        createTestZombie({ type: ZombieType.BRUTE, stats: { defense: 30, hp: 100, maxHp: 100 } }),
        createTestZombie({ type: ZombieType.SPITTER, stats: { defense: 5, hp: 80, maxHp: 80 } }),
        createTestZombie({ type: ZombieType.SHAMBLER, stats: { defense: 10, hp: 90, maxHp: 100 } }),
      ];

      const result = validateSquadComposition(squad, 5);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('hasZombieDuplicates', () => {
    it('returns false for squad with unique zombies', () => {
      const squad: Zombie[] = [
        createTestZombie({ id: 'z1' }),
        createTestZombie({ id: 'z2' }),
        createTestZombie({ id: 'z3' }),
      ];

      expect(hasZombieDuplicates(squad)).toBe(false);
    });

    it('returns true for squad with duplicate IDs', () => {
      const zombie1 = createTestZombie({ id: 'z1' });
      const zombie2 = createTestZombie({ id: 'z2' });
      const squad: Zombie[] = [zombie1, zombie2, zombie1];

      expect(hasZombieDuplicates(squad)).toBe(true);
    });

    it('returns false for empty squad', () => {
      expect(hasZombieDuplicates([])).toBe(false);
    });

    it('returns false for single zombie squad', () => {
      const squad: Zombie[] = [createTestZombie({ id: 'z1' })];
      expect(hasZombieDuplicates(squad)).toBe(false);
    });
  });

  describe('calculateSquadStats', () => {
    it('calculates total HP', () => {
      const squad: Zombie[] = [
        createTestZombie({ stats: { hp: 100, maxHp: 100 } }),
        createTestZombie({ stats: { hp: 80, maxHp: 100 } }),
        createTestZombie({ stats: { hp: 120, maxHp: 150 } }),
      ];

      const stats = calculateSquadStats(squad);
      expect(stats.totalHp).toBe(300);
      expect(stats.totalMaxHp).toBe(350);
    });

    it('calculates average attack', () => {
      const squad: Zombie[] = [
        createTestZombie({ stats: { attack: 20 } }),
        createTestZombie({ stats: { attack: 30 } }),
        createTestZombie({ stats: { attack: 40 } }),
      ];

      const stats = calculateSquadStats(squad);
      expect(stats.avgAttack).toBe(30);
    });

    it('calculates average defense', () => {
      const squad: Zombie[] = [
        createTestZombie({ stats: { defense: 10 } }),
        createTestZombie({ stats: { defense: 20 } }),
        createTestZombie({ stats: { defense: 30 } }),
      ];

      const stats = calculateSquadStats(squad);
      expect(stats.avgDefense).toBe(20);
    });

    it('calculates average speed', () => {
      const squad: Zombie[] = [
        createTestZombie({ stats: { speed: 1.0 } }),
        createTestZombie({ stats: { speed: 1.5 } }),
        createTestZombie({ stats: { speed: 2.0 } }),
      ];

      const stats = calculateSquadStats(squad);
      expect(stats.avgSpeed).toBeCloseTo(1.5, 1);
    });

    it('counts unit types', () => {
      const squad: Zombie[] = [
        createTestZombie({ type: 'brute' }),
        createTestZombie({ type: 'shambler' }),
        createTestZombie({ type: 'brute' }),
        createTestZombie({ type: 'spitter' }),
      ];

      const stats = calculateSquadStats(squad);
      expect(stats.composition.brute).toBe(2);
      expect(stats.composition.shambler).toBe(1);
      expect(stats.composition.spitter).toBe(1);
    });

    it('returns zeroed stats for empty squad', () => {
      const stats = calculateSquadStats([]);
      expect(stats.totalHp).toBe(0);
      expect(stats.avgAttack).toBe(0);
      expect(stats.avgDefense).toBe(0);
      expect(stats.avgSpeed).toBe(0);
      expect(Object.keys(stats.composition)).toHaveLength(0);
    });
  });

  describe('applyDeploymentOrder', () => {
    it('maintains order from deployment slots', () => {
      const slots: DeploymentSlot[] = [
        { slotIndex: 0, zombie: createTestZombie({ id: 'z1' }) },
        { slotIndex: 1, zombie: createTestZombie({ id: 'z2' }) },
        { slotIndex: 2, zombie: createTestZombie({ id: 'z3' }) },
      ];

      const ordered = applyDeploymentOrder(slots);
      expect(ordered.map((z) => z.id)).toEqual(['z1', 'z2', 'z3']);
    });

    it('sorts by slot index when out of order', () => {
      const slots: DeploymentSlot[] = [
        { slotIndex: 2, zombie: createTestZombie({ id: 'z3' }) },
        { slotIndex: 0, zombie: createTestZombie({ id: 'z1' }) },
        { slotIndex: 1, zombie: createTestZombie({ id: 'z2' }) },
      ];

      const ordered = applyDeploymentOrder(slots);
      expect(ordered.map((z) => z.id)).toEqual(['z1', 'z2', 'z3']);
    });

    it('handles gaps in slot indices', () => {
      const slots: DeploymentSlot[] = [
        { slotIndex: 0, zombie: createTestZombie({ id: 'z1' }) },
        { slotIndex: 2, zombie: createTestZombie({ id: 'z3' }) },
        { slotIndex: 5, zombie: createTestZombie({ id: 'z6' }) },
      ];

      const ordered = applyDeploymentOrder(slots);
      expect(ordered.map((z) => z.id)).toEqual(['z1', 'z3', 'z6']);
    });

    it('returns empty array for no slots', () => {
      const ordered = applyDeploymentOrder([]);
      expect(ordered).toHaveLength(0);
    });
  });

  describe('suggestSquadComposition', () => {
    it('suggests balanced squad for general combat', () => {
      const availableZombies: Zombie[] = [
        createTestZombie({ id: 'brute1', type: 'brute', stats: { defense: 30, attack: 35 } }),
        createTestZombie({ id: 'shambler1', type: 'shambler', stats: { defense: 10, attack: 15 } }),
        createTestZombie({ id: 'shambler2', type: 'shambler', stats: { defense: 10, attack: 15 } }),
        createTestZombie({ id: 'spitter1', type: 'spitter', stats: { defense: 5, attack: 20 } }),
        createTestZombie({ id: 'runner1', type: 'runner', stats: { defense: 8, attack: 12, speed: 2.0 } }),
      ];

      const suggestion = suggestSquadComposition(availableZombies, 3, 'balanced');
      expect(suggestion.squad).toHaveLength(3);
      expect(suggestion.reasoning).toContain('balanced');
    });

    it('suggests tank-heavy squad for defensive strategy', () => {
      const availableZombies: Zombie[] = [
        createTestZombie({ id: 'brute1', type: 'brute', stats: { defense: 30 } }),
        createTestZombie({ id: 'brute2', type: 'brute', stats: { defense: 30 } }),
        createTestZombie({ id: 'shambler1', type: 'shambler', stats: { defense: 10 } }),
        createTestZombie({ id: 'spitter1', type: 'spitter', stats: { defense: 5 } }),
      ];

      const suggestion = suggestSquadComposition(availableZombies, 3, 'defensive');
      expect(suggestion.squad).toHaveLength(3);

      // Count tanks in suggestion
      const tankCount = suggestion.squad.filter((z) => z.type === 'brute').length;
      expect(tankCount).toBeGreaterThanOrEqual(2);
    });

    it('suggests damage-focused squad for offensive strategy', () => {
      const availableZombies: Zombie[] = [
        createTestZombie({ id: 'brute1', type: 'brute', stats: { attack: 35 } }),
        createTestZombie({ id: 'shambler1', type: 'shambler', stats: { attack: 15 } }),
        createTestZombie({ id: 'spitter1', type: 'spitter', stats: { attack: 25 } }),
        createTestZombie({ id: 'runner1', type: 'runner', stats: { attack: 18, speed: 2.0 } }),
      ];

      const suggestion = suggestSquadComposition(availableZombies, 3, 'aggressive');
      expect(suggestion.squad).toHaveLength(3);

      // Average attack should be high
      const avgAttack =
        suggestion.squad.reduce((sum, z) => sum + z.stats.attack, 0) / suggestion.squad.length;
      expect(avgAttack).toBeGreaterThan(20);
    });

    it('handles insufficient zombies gracefully', () => {
      const availableZombies: Zombie[] = [
        createTestZombie({ id: 'z1' }),
        createTestZombie({ id: 'z2' }),
      ];

      const suggestion = suggestSquadComposition(availableZombies, 5, 'balanced');
      expect(suggestion.squad).toHaveLength(2);
      expect(suggestion.reasoning).toContain('Insufficient');
    });

    it('returns empty squad if no zombies available', () => {
      const suggestion = suggestSquadComposition([], 3, 'balanced');
      expect(suggestion.squad).toHaveLength(0);
      expect(suggestion.reasoning).toContain('No zombies available');
    });

    it('prioritizes high-level zombies', () => {
      const availableZombies: Zombie[] = [
        createTestZombie({ id: 'z1', level: 1, stats: { hp: 50, maxHp: 100, attack: 10 } }),
        createTestZombie({ id: 'z2', level: 5, stats: { hp: 100, maxHp: 100, attack: 20 } }),
        createTestZombie({ id: 'z3', level: 3, stats: { hp: 80, maxHp: 100, attack: 15 } }),
        createTestZombie({ id: 'z4', level: 7, stats: { hp: 100, maxHp: 100, attack: 25 } }),
      ];

      const suggestion = suggestSquadComposition(availableZombies, 2, 'balanced');
      expect(suggestion.squad).toHaveLength(2);

      // Should include highest level zombies
      const selectedIds = suggestion.squad.map((z) => z.id);
      expect(selectedIds).toContain('z4'); // Level 7
      expect(selectedIds).toContain('z2'); // Level 5
    });
  });
});
