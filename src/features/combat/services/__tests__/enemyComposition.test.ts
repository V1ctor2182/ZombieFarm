/**
 * Enemy Composition Service Tests
 *
 * Tests for location-based enemy composition, stat loading,
 * and difficulty scaling.
 *
 * Per DOMAIN-COMBAT.md enemy composition specifications.
 */

import { describe, it, expect } from '@jest/globals';
import {
  getLocationEnemies,
  generateEnemyUnit,
  scaleEnemyStats,
  getEnemyBaseStats,
  validateEnemyComposition,
} from '../enemyComposition';
import { EnemyType } from '../../../../types/combat';
import type { Location } from '../../../../types/world';
import { LocationType } from '../../../../types/world';

describe('Enemy Composition Service', () => {
  // ============================================================================
  // ENEMY BASE STATS
  // ============================================================================

  describe('getEnemyBaseStats', () => {
    it('should return base stats for peasant', () => {
      const stats = getEnemyBaseStats(EnemyType.PEASANT);

      expect(stats).toBeDefined();
      expect(stats.maxHp).toBeGreaterThan(0);
      expect(stats.attack).toBeGreaterThan(0);
      expect(stats.defense).toBeGreaterThanOrEqual(0);
      expect(stats.speed).toBeGreaterThan(0);
      expect(stats.range).toBeGreaterThan(0);
    });

    it('should return base stats for archer (ranged unit)', () => {
      const stats = getEnemyBaseStats(EnemyType.ARCHER);

      expect(stats).toBeDefined();
      expect(stats.range).toBeGreaterThan(1); // Ranged has higher range
      expect(stats.attack).toBeGreaterThan(0);
    });

    it('should return base stats for knight (heavy armor)', () => {
      const stats = getEnemyBaseStats(EnemyType.KNIGHT);

      expect(stats).toBeDefined();
      expect(stats.defense).toBeGreaterThan(10); // Knights have high defense
      expect(stats.maxHp).toBeGreaterThan(50);
    });

    it('should return base stats for priest (holy damage)', () => {
      const stats = getEnemyBaseStats(EnemyType.PRIEST);

      expect(stats).toBeDefined();
      expect(stats.attack).toBeGreaterThan(0);
      expect(stats.range).toBeGreaterThan(1); // Priests are ranged
    });

    it('should return base stats for paladin (elite)', () => {
      const stats = getEnemyBaseStats(EnemyType.PALADIN);

      expect(stats).toBeDefined();
      expect(stats.maxHp).toBeGreaterThan(100); // Paladins are tough
      expect(stats.defense).toBeGreaterThan(15);
      expect(stats.attack).toBeGreaterThan(20);
    });

    it('should return base stats for mage (magic)', () => {
      const stats = getEnemyBaseStats(EnemyType.MAGE);

      expect(stats).toBeDefined();
      expect(stats.range).toBeGreaterThan(2); // Mages have long range
    });

    it('should return base stats for all enemy types', () => {
      const allTypes = Object.values(EnemyType);

      for (const type of allTypes) {
        const stats = getEnemyBaseStats(type);
        expect(stats).toBeDefined();
        expect(stats.maxHp).toBeGreaterThan(0);
        expect(stats.attack).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // ENEMY STAT SCALING
  // ============================================================================

  describe('scaleEnemyStats', () => {
    const baseStats = getEnemyBaseStats(EnemyType.PEASANT);

    it('should scale stats based on location difficulty', () => {
      const difficulty = 5;
      const scaled = scaleEnemyStats(baseStats, difficulty);

      expect(scaled.maxHp).toBeGreaterThan(baseStats.maxHp);
      expect(scaled.attack).toBeGreaterThan(baseStats.attack);
      expect(scaled.defense).toBeGreaterThan(baseStats.defense);
    });

    it('should scale stats more at higher difficulty', () => {
      const lowDifficulty = scaleEnemyStats(baseStats, 2);
      const highDifficulty = scaleEnemyStats(baseStats, 8);

      expect(highDifficulty.maxHp).toBeGreaterThan(lowDifficulty.maxHp);
      expect(highDifficulty.attack).toBeGreaterThan(lowDifficulty.attack);
      expect(highDifficulty.defense).toBeGreaterThan(lowDifficulty.defense);
    });

    it('should not scale below base stats (difficulty 1)', () => {
      const scaled = scaleEnemyStats(baseStats, 1);

      expect(scaled.maxHp).toBeGreaterThanOrEqual(baseStats.maxHp);
      expect(scaled.attack).toBeGreaterThanOrEqual(baseStats.attack);
      expect(scaled.defense).toBeGreaterThanOrEqual(baseStats.defense);
    });

    it('should apply level modifier when provided', () => {
      const levelModifier = 1.5;
      const scaled = scaleEnemyStats(baseStats, 3, levelModifier);

      const withoutModifier = scaleEnemyStats(baseStats, 3);

      expect(scaled.maxHp).toBeGreaterThan(withoutModifier.maxHp);
      expect(scaled.attack).toBeGreaterThan(withoutModifier.attack);
    });

    it('should keep non-combat stats unchanged (speed, range)', () => {
      const scaled = scaleEnemyStats(baseStats, 5);

      expect(scaled.speed).toBe(baseStats.speed);
      expect(scaled.range).toBe(baseStats.range);
    });

    it('should handle extreme difficulty values', () => {
      const minDifficulty = scaleEnemyStats(baseStats, 1);
      const maxDifficulty = scaleEnemyStats(baseStats, 10);

      expect(minDifficulty.maxHp).toBeGreaterThan(0);
      expect(maxDifficulty.maxHp).toBeGreaterThan(0);
      expect(maxDifficulty.maxHp).toBeGreaterThan(minDifficulty.maxHp);
    });
  });

  // ============================================================================
  // LOCATION ENEMY COMPOSITION
  // ============================================================================

  describe('getLocationEnemies', () => {
    const mockVillage: Location = {
      id: 'village_1' as any,
      name: 'Peaceful Village',
      description: 'A small village',
      type: LocationType.VILLAGE,
      regionId: 'grassland',
      difficulty: 1,
      recommendedLevel: 1,
      mapPosition: { x: 0, y: 0 },
      isUnlocked: true,
      isConquered: false,
      enemies: [
        {
          type: EnemyType.PEASANT,
          count: 5,
          wave: 1,
        },
        {
          type: EnemyType.MILITIA,
          count: 2,
          wave: 1,
        },
      ],
      fortifications: [],
      waves: 1,
      firstTimeRewards: { darkCoins: 50 },
      repeatRewards: { darkCoins: 25 },
      unlocks: [],
      raidCooldown: 24,
      nextRaidAvailable: null,
      prerequisites: {},
    };

    it('should load enemies from location definition', () => {
      const enemies = getLocationEnemies(mockVillage);

      expect(enemies).toHaveLength(2); // 2 enemy types
      expect(enemies[0].type).toBe(EnemyType.PEASANT);
      expect(enemies[1].type).toBe(EnemyType.MILITIA);
    });

    it('should scale enemy stats based on location difficulty', () => {
      const enemies = getLocationEnemies(mockVillage);
      const baseStats = getEnemyBaseStats(EnemyType.PEASANT);

      // At difficulty 1, stats should be close to base
      expect(enemies[0].stats.maxHp).toBeGreaterThanOrEqual(baseStats.maxHp);
    });

    it('should respect enemy count from location', () => {
      const enemies = getLocationEnemies(mockVillage);

      expect(enemies[0].count).toBe(5); // 5 peasants
      expect(enemies[1].count).toBe(2); // 2 militia
    });

    it('should assign enemies to correct waves', () => {
      const enemies = getLocationEnemies(mockVillage);

      expect(enemies[0].wave).toBe(1);
      expect(enemies[1].wave).toBe(1);
    });

    it('should handle locations with multiple waves', () => {
      const multiWaveLocation: Location = {
        ...mockVillage,
        enemies: [
          {
            type: EnemyType.PEASANT,
            count: 3,
            wave: 1,
          },
          {
            type: EnemyType.SOLDIER,
            count: 2,
            wave: 2,
          },
          {
            type: EnemyType.KNIGHT,
            count: 1,
            wave: 3,
            isBoss: true,
          },
        ],
        waves: 3,
      };

      const enemies = getLocationEnemies(multiWaveLocation);

      expect(enemies).toHaveLength(3);
      expect(enemies[0].wave).toBe(1);
      expect(enemies[1].wave).toBe(2);
      expect(enemies[2].wave).toBe(3);
      expect(enemies[2].isBoss).toBe(true);
    });

    it('should apply level modifier to boss units', () => {
      const bossLocation: Location = {
        ...mockVillage,
        enemies: [
          {
            type: EnemyType.PALADIN,
            count: 1,
            wave: 1,
            isBoss: true,
            levelModifier: 2.0,
          },
        ],
      };

      const enemies = getLocationEnemies(bossLocation);
      const baseStats = getEnemyBaseStats(EnemyType.PALADIN);

      expect(enemies[0].stats.maxHp).toBeGreaterThan(baseStats.maxHp * 1.5);
    });

    it('should handle empty enemy list', () => {
      const emptyLocation: Location = {
        ...mockVillage,
        enemies: [],
      };

      const enemies = getLocationEnemies(emptyLocation);

      expect(enemies).toHaveLength(0);
    });

    it('should preserve spawn zone information', () => {
      const zoneLocation: Location = {
        ...mockVillage,
        enemies: [
          {
            type: EnemyType.ARCHER,
            count: 2,
            wave: 1,
            spawnZone: 'backline',
          },
        ],
      };

      const enemies = getLocationEnemies(zoneLocation);

      expect(enemies[0].spawnZone).toBe('backline');
    });
  });

  // ============================================================================
  // ENEMY UNIT GENERATION
  // ============================================================================

  describe('generateEnemyUnit', () => {
    it('should generate enemy unit with correct type', () => {
      const enemy = generateEnemyUnit(EnemyType.PEASANT, { x: 100, y: 50 });

      expect(enemy.type).toBe(EnemyType.PEASANT);
      expect(enemy.position).toEqual({ x: 100, y: 50 });
    });

    it('should generate unique IDs for each enemy', () => {
      const enemy1 = generateEnemyUnit(EnemyType.SOLDIER, { x: 0, y: 0 });
      const enemy2 = generateEnemyUnit(EnemyType.SOLDIER, { x: 0, y: 0 });

      expect(enemy1.id).not.toBe(enemy2.id);
    });

    it('should initialize enemy with base stats', () => {
      const enemy = generateEnemyUnit(EnemyType.KNIGHT, { x: 0, y: 0 });

      expect(enemy.stats.maxHp).toBeGreaterThan(0);
      expect(enemy.stats.attack).toBeGreaterThan(0);
      expect(enemy.stats.currentHp).toBe(enemy.stats.maxHp);
    });

    it('should apply difficulty scaling when provided', () => {
      const baseEnemy = generateEnemyUnit(EnemyType.MILITIA, { x: 0, y: 0 });
      const scaledEnemy = generateEnemyUnit(EnemyType.MILITIA, { x: 0, y: 0 }, 5);

      expect(scaledEnemy.stats.maxHp).toBeGreaterThan(baseEnemy.stats.maxHp);
    });

    it('should apply level modifier when provided', () => {
      const normalEnemy = generateEnemyUnit(EnemyType.BOSS, { x: 0, y: 0 }, 5, 1.0);
      const bossEnemy = generateEnemyUnit(EnemyType.BOSS, { x: 0, y: 0 }, 5, 2.5);

      expect(bossEnemy.stats.maxHp).toBeGreaterThan(normalEnemy.stats.maxHp);
      expect(bossEnemy.stats.attack).toBeGreaterThan(normalEnemy.stats.attack);
    });

    it('should set appropriate AI profile for enemy type', () => {
      const archer = generateEnemyUnit(EnemyType.ARCHER, { x: 0, y: 0 });
      const knight = generateEnemyUnit(EnemyType.KNIGHT, { x: 0, y: 0 });

      expect(archer.aiProfile.preferredRange).toBeGreaterThan(knight.aiProfile.preferredRange);
    });

    it('should initialize enemy in idle state', () => {
      const enemy = generateEnemyUnit(EnemyType.SOLDIER, { x: 0, y: 0 });

      expect(enemy.aiState).toBe('idle');
      expect(enemy.targetId).toBeNull();
      expect(enemy.isDead).toBe(false);
    });

    it('should assign appropriate abilities based on type', () => {
      const mage = generateEnemyUnit(EnemyType.MAGE, { x: 0, y: 0 });
      const priest = generateEnemyUnit(EnemyType.PRIEST, { x: 0, y: 0 });

      expect(mage.abilities.length).toBeGreaterThan(0);
      expect(priest.abilities.length).toBeGreaterThan(0);
    });

    it('should handle peasant (basic unit) generation', () => {
      const peasant = generateEnemyUnit(EnemyType.PEASANT, { x: 50, y: 50 });

      expect(peasant).toBeDefined();
      expect(peasant.type).toBe(EnemyType.PEASANT);
      expect(peasant.abilities.length).toBe(0); // Peasants have no special abilities
    });
  });

  // ============================================================================
  // ENEMY COMPOSITION VALIDATION
  // ============================================================================

  describe('validateEnemyComposition', () => {
    const mockLocation: Location = {
      id: 'test_location' as any,
      name: 'Test Location',
      description: 'Test',
      type: LocationType.VILLAGE,
      regionId: 'test',
      difficulty: 3,
      recommendedLevel: 2,
      mapPosition: { x: 0, y: 0 },
      isUnlocked: true,
      isConquered: false,
      enemies: [
        {
          type: EnemyType.PEASANT,
          count: 5,
          wave: 1,
        },
      ],
      fortifications: [],
      waves: 1,
      firstTimeRewards: { darkCoins: 50 },
      repeatRewards: { darkCoins: 25 },
      unlocks: [],
      raidCooldown: 24,
      nextRaidAvailable: null,
      prerequisites: {},
    };

    it('should validate correct enemy composition', () => {
      const result = validateEnemyComposition(mockLocation);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject location with no enemies', () => {
      const emptyLocation: Location = {
        ...mockLocation,
        enemies: [],
      };

      const result = validateEnemyComposition(emptyLocation);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Location has no enemies defined');
    });

    it('should reject enemies with invalid wave numbers', () => {
      const invalidLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.SOLDIER,
            count: 3,
            wave: 0, // Invalid: waves are 1-based
          },
        ],
      };

      const result = validateEnemyComposition(invalidLocation);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject enemies with wave > total waves', () => {
      const invalidLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.KNIGHT,
            count: 1,
            wave: 5,
          },
        ],
        waves: 3,
      };

      const result = validateEnemyComposition(invalidLocation);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject enemies with zero or negative count', () => {
      const invalidLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.ARCHER,
            count: 0,
            wave: 1,
          },
        ],
      };

      const result = validateEnemyComposition(invalidLocation);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about multiple boss units', () => {
      const bossLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.PALADIN,
            count: 1,
            wave: 1,
            isBoss: true,
          },
          {
            type: EnemyType.GENERAL,
            count: 1,
            wave: 2,
            isBoss: true,
          },
        ],
        waves: 2,
      };

      const result = validateEnemyComposition(bossLocation);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate boss is in final wave', () => {
      const bossLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.BOSS,
            count: 1,
            wave: 1,
            isBoss: true,
          },
          {
            type: EnemyType.SOLDIER,
            count: 3,
            wave: 2,
          },
        ],
        waves: 2,
      };

      const result = validateEnemyComposition(bossLocation);

      expect(result.warnings).toContain('Boss unit not in final wave (may be intentional)');
    });
  });
});
