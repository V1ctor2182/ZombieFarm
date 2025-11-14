/**
 * Wave Spawning Service Tests
 *
 * Tests for enemy wave definitions, sequential spawning,
 * wave completion, and boss waves.
 *
 * Per DOMAIN-COMBAT.md wave spawning specifications.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  createWaveDefinitions,
  getWaveEnemies,
  calculateSpawnPosition,
  isWaveComplete,
  getNextWave,
  shouldSpawnNextWave,
  spawnWave,
} from '../waveSpawning';
import { EnemyType } from '../../../../types/combat';
import type { Location } from '../../../../types/world';
import { LocationType } from '../../../../types/world';

describe('Wave Spawning Service', () => {
  let mockLocation: Location;

  beforeEach(() => {
    mockLocation = {
      id: 'test_castle' as any,
      name: 'Test Castle',
      description: 'A test location',
      type: LocationType.CASTLE,
      regionId: 'test',
      difficulty: 5,
      recommendedLevel: 5,
      mapPosition: { x: 0, y: 0 },
      isUnlocked: true,
      isConquered: false,
      enemies: [
        {
          type: EnemyType.SOLDIER,
          count: 5,
          wave: 1,
        },
        {
          type: EnemyType.ARCHER,
          count: 3,
          wave: 1,
        },
        {
          type: EnemyType.KNIGHT,
          count: 3,
          wave: 2,
        },
        {
          type: EnemyType.PALADIN,
          count: 1,
          wave: 3,
          isBoss: true,
        },
      ],
      fortifications: [],
      waves: 3,
      firstTimeRewards: { darkCoins: 200 },
      repeatRewards: { darkCoins: 100 },
      unlocks: [],
      raidCooldown: 48,
      nextRaidAvailable: null,
      prerequisites: {},
    };
  });

  // ============================================================================
  // WAVE DEFINITION CREATION
  // ============================================================================

  describe('createWaveDefinitions', () => {
    it('should create wave definitions from location', () => {
      const waves = createWaveDefinitions(mockLocation);

      expect(waves).toHaveLength(3);
      expect(waves[0].waveNumber).toBe(1);
      expect(waves[1].waveNumber).toBe(2);
      expect(waves[2].waveNumber).toBe(3);
    });

    it('should group enemies by wave number', () => {
      const waves = createWaveDefinitions(mockLocation);

      expect(waves[0].enemies).toHaveLength(2); // Soldier + Archer
      expect(waves[1].enemies).toHaveLength(1); // Knight
      expect(waves[2].enemies).toHaveLength(1); // Paladin
    });

    it('should identify boss waves', () => {
      const waves = createWaveDefinitions(mockLocation);

      expect(waves[0].isBossWave).toBe(false);
      expect(waves[1].isBossWave).toBe(false);
      expect(waves[2].isBossWave).toBe(true);
    });

    it('should calculate total enemy count per wave', () => {
      const waves = createWaveDefinitions(mockLocation);

      expect(waves[0].totalEnemies).toBe(8); // 5 soldiers + 3 archers
      expect(waves[1].totalEnemies).toBe(3); // 3 knights
      expect(waves[2].totalEnemies).toBe(1); // 1 paladin
    });

    it('should handle single wave locations', () => {
      const singleWaveLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.PEASANT,
            count: 10,
            wave: 1,
          },
        ],
        waves: 1,
      };

      const waves = createWaveDefinitions(singleWaveLocation);

      expect(waves).toHaveLength(1);
      expect(waves[0].waveNumber).toBe(1);
    });

    it('should handle empty location (no enemies)', () => {
      const emptyLocation: Location = {
        ...mockLocation,
        enemies: [],
        waves: 0,
      };

      const waves = createWaveDefinitions(emptyLocation);

      expect(waves).toHaveLength(0);
    });

    it('should preserve spawn zone information', () => {
      const zoneLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.ARCHER,
            count: 3,
            wave: 1,
            spawnZone: 'backline',
          },
          {
            type: EnemyType.KNIGHT,
            count: 2,
            wave: 1,
            spawnZone: 'frontline',
          },
        ],
        waves: 1,
      };

      const waves = createWaveDefinitions(zoneLocation);

      expect(waves[0].enemies[0].spawnZone).toBe('backline');
      expect(waves[0].enemies[1].spawnZone).toBe('frontline');
    });
  });

  // ============================================================================
  // WAVE ENEMY RETRIEVAL
  // ============================================================================

  describe('getWaveEnemies', () => {
    it('should return enemies for wave 1', () => {
      const waves = createWaveDefinitions(mockLocation);
      const enemies = getWaveEnemies(waves, 1);

      expect(enemies).toHaveLength(2);
      expect(enemies[0].type).toBe(EnemyType.SOLDIER);
      expect(enemies[1].type).toBe(EnemyType.ARCHER);
    });

    it('should return enemies for wave 2', () => {
      const waves = createWaveDefinitions(mockLocation);
      const enemies = getWaveEnemies(waves, 2);

      expect(enemies).toHaveLength(1);
      expect(enemies[0].type).toBe(EnemyType.KNIGHT);
    });

    it('should return boss enemies for wave 3', () => {
      const waves = createWaveDefinitions(mockLocation);
      const enemies = getWaveEnemies(waves, 3);

      expect(enemies).toHaveLength(1);
      expect(enemies[0].type).toBe(EnemyType.PALADIN);
      expect(enemies[0].isBoss).toBe(true);
    });

    it('should return empty array for invalid wave number', () => {
      const waves = createWaveDefinitions(mockLocation);
      const enemies = getWaveEnemies(waves, 999);

      expect(enemies).toHaveLength(0);
    });

    it('should return empty array for wave 0', () => {
      const waves = createWaveDefinitions(mockLocation);
      const enemies = getWaveEnemies(waves, 0);

      expect(enemies).toHaveLength(0);
    });
  });

  // ============================================================================
  // SPAWN POSITION CALCULATION
  // ============================================================================

  describe('calculateSpawnPosition', () => {
    it('should calculate spawn position for first enemy', () => {
      const position = calculateSpawnPosition(0, 5);

      expect(position.x).toBeGreaterThan(1500); // Right side of battlefield
      expect(position.y).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(1080);
    });

    it('should spread enemies vertically', () => {
      const pos1 = calculateSpawnPosition(0, 5);
      const pos2 = calculateSpawnPosition(1, 5);
      const pos3 = calculateSpawnPosition(2, 5);

      expect(pos1.y).not.toBe(pos2.y);
      expect(pos2.y).not.toBe(pos3.y);
    });

    it('should handle single enemy spawn', () => {
      const position = calculateSpawnPosition(0, 1);

      expect(position.x).toBeGreaterThan(1500);
      expect(position.y).toBeGreaterThan(0);
    });

    it('should handle many enemies spawn', () => {
      const positions = [];
      for (let i = 0; i < 10; i++) {
        positions.push(calculateSpawnPosition(i, 10));
      }

      expect(positions).toHaveLength(10);
      // All should be on right side
      positions.forEach((pos) => {
        expect(pos.x).toBeGreaterThan(1500);
      });
    });

    it('should use spawn zone when provided', () => {
      const frontline = calculateSpawnPosition(0, 3, 'frontline');
      const backline = calculateSpawnPosition(0, 3, 'backline');

      expect(backline.x).toBeGreaterThan(frontline.x);
    });

    it('should keep positions within battlefield bounds', () => {
      for (let i = 0; i < 20; i++) {
        const pos = calculateSpawnPosition(i, 20);
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(1920);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(1080);
      }
    });
  });

  // ============================================================================
  // WAVE COMPLETION
  // ============================================================================

  describe('isWaveComplete', () => {
    it('should return true when all enemies defeated', () => {
      const deadEnemies = [
        { id: '1', isDead: true },
        { id: '2', isDead: true },
        { id: '3', isDead: true },
      ];

      expect(isWaveComplete(deadEnemies as any, 1)).toBe(true);
    });

    it('should return false when enemies still alive', () => {
      const enemies = [
        { id: '1', isDead: true },
        { id: '2', isDead: false },
        { id: '3', isDead: true },
      ];

      expect(isWaveComplete(enemies as any, 1)).toBe(false);
    });

    it('should return true for empty enemy list', () => {
      expect(isWaveComplete([], 1)).toBe(true);
    });

    it('should return false when all enemies alive', () => {
      const aliveEnemies = [
        { id: '1', isDead: false },
        { id: '2', isDead: false },
      ];

      expect(isWaveComplete(aliveEnemies as any, 1)).toBe(false);
    });
  });

  // ============================================================================
  // NEXT WAVE RETRIEVAL
  // ============================================================================

  describe('getNextWave', () => {
    it('should return wave 2 after wave 1', () => {
      const waves = createWaveDefinitions(mockLocation);
      const nextWave = getNextWave(waves, 1);

      expect(nextWave).toBeDefined();
      expect(nextWave!.waveNumber).toBe(2);
    });

    it('should return wave 3 after wave 2', () => {
      const waves = createWaveDefinitions(mockLocation);
      const nextWave = getNextWave(waves, 2);

      expect(nextWave).toBeDefined();
      expect(nextWave!.waveNumber).toBe(3);
    });

    it('should return null after final wave', () => {
      const waves = createWaveDefinitions(mockLocation);
      const nextWave = getNextWave(waves, 3);

      expect(nextWave).toBeNull();
    });

    it('should return wave 1 when current is 0', () => {
      const waves = createWaveDefinitions(mockLocation);
      const nextWave = getNextWave(waves, 0);

      expect(nextWave).toBeDefined();
      expect(nextWave!.waveNumber).toBe(1);
    });

    it('should return null for invalid current wave', () => {
      const waves = createWaveDefinitions(mockLocation);
      const nextWave = getNextWave(waves, 999);

      expect(nextWave).toBeNull();
    });
  });

  // ============================================================================
  // WAVE SPAWN TRIGGERING
  // ============================================================================

  describe('shouldSpawnNextWave', () => {
    it('should return true when current wave is complete', () => {
      const deadEnemies = [
        { id: '1', isDead: true },
        { id: '2', isDead: true },
      ];

      expect(shouldSpawnNextWave(deadEnemies as any, 1, 3)).toBe(true);
    });

    it('should return false when current wave has live enemies', () => {
      const enemies = [
        { id: '1', isDead: true },
        { id: '2', isDead: false },
      ];

      expect(shouldSpawnNextWave(enemies as any, 1, 3)).toBe(false);
    });

    it('should return false when already on final wave', () => {
      const deadEnemies = [{ id: '1', isDead: true }];

      expect(shouldSpawnNextWave(deadEnemies as any, 3, 3)).toBe(false);
    });

    it('should return true for wave 0 (initial spawn)', () => {
      const noEnemies: any[] = [];

      expect(shouldSpawnNextWave(noEnemies, 0, 3)).toBe(true);
    });

    it('should return false when past total waves', () => {
      const deadEnemies = [{ id: '1', isDead: true }];

      expect(shouldSpawnNextWave(deadEnemies as any, 5, 3)).toBe(false);
    });
  });

  // ============================================================================
  // WAVE SPAWNING
  // ============================================================================

  describe('spawnWave', () => {
    it('should spawn all enemies in wave 1', () => {
      const waves = createWaveDefinitions(mockLocation);
      const spawned = spawnWave(waves, 1, mockLocation.difficulty);

      expect(spawned).toHaveLength(8); // 5 soldiers + 3 archers
    });

    it('should assign unique IDs to spawned enemies', () => {
      const waves = createWaveDefinitions(mockLocation);
      const spawned = spawnWave(waves, 1, mockLocation.difficulty);

      const ids = spawned.map((e) => e.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(spawned.length);
    });

    it('should spawn enemies at calculated positions', () => {
      const waves = createWaveDefinitions(mockLocation);
      const spawned = spawnWave(waves, 1, mockLocation.difficulty);

      spawned.forEach((enemy) => {
        expect(enemy.position.x).toBeGreaterThan(1500);
        expect(enemy.position.y).toBeGreaterThan(0);
      });
    });

    it('should apply difficulty scaling to spawned enemies', () => {
      const waves = createWaveDefinitions(mockLocation);
      const lowDiff = spawnWave(waves, 1, 2);
      const highDiff = spawnWave(waves, 1, 8);

      expect(highDiff[0].stats.maxHp).toBeGreaterThan(lowDiff[0].stats.maxHp);
    });

    it('should spawn boss enemies in wave 3', () => {
      const waves = createWaveDefinitions(mockLocation);
      const spawned = spawnWave(waves, 3, mockLocation.difficulty);

      expect(spawned).toHaveLength(1);
      expect(spawned[0].type).toBe(EnemyType.PALADIN);
    });

    it('should initialize spawned enemies in idle state', () => {
      const waves = createWaveDefinitions(mockLocation);
      const spawned = spawnWave(waves, 1, mockLocation.difficulty);

      spawned.forEach((enemy) => {
        expect(enemy.aiState).toBe('idle');
        expect(enemy.isDead).toBe(false);
      });
    });

    it('should return empty array for invalid wave', () => {
      const waves = createWaveDefinitions(mockLocation);
      const spawned = spawnWave(waves, 999, mockLocation.difficulty);

      expect(spawned).toHaveLength(0);
    });

    it('should handle spawn zones correctly', () => {
      const zoneLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.ARCHER,
            count: 2,
            wave: 1,
            spawnZone: 'backline',
          },
          {
            type: EnemyType.KNIGHT,
            count: 2,
            wave: 1,
            spawnZone: 'frontline',
          },
        ],
      };

      const waves = createWaveDefinitions(zoneLocation);
      const spawned = spawnWave(waves, 1, 3);

      const archers = spawned.filter((e) => e.type === EnemyType.ARCHER);
      const knights = spawned.filter((e) => e.type === EnemyType.KNIGHT);

      expect(archers.length).toBe(2);
      expect(knights.length).toBe(2);
      expect(archers[0].position.x).toBeGreaterThan(knights[0].position.x);
    });

    it('should apply level modifiers to boss units', () => {
      const bossLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.BOSS,
            count: 1,
            wave: 1,
            isBoss: true,
            levelModifier: 3.0,
          },
        ],
      };

      const waves = createWaveDefinitions(bossLocation);
      const spawned = spawnWave(waves, 1, 5);

      expect(spawned[0].stats.maxHp).toBeGreaterThan(100);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Wave System Integration', () => {
    it('should progress through all waves sequentially', () => {
      const waves = createWaveDefinitions(mockLocation);

      // Wave 1
      const wave1 = spawnWave(waves, 1, mockLocation.difficulty);
      expect(wave1.length).toBeGreaterThan(0);

      // Simulate wave 1 complete
      const wave1Dead = wave1.map((e) => ({ ...e, isDead: true }));
      expect(isWaveComplete(wave1Dead, 1)).toBe(true);
      expect(shouldSpawnNextWave(wave1Dead, 1, 3)).toBe(true);

      // Wave 2
      const wave2 = spawnWave(waves, 2, mockLocation.difficulty);
      expect(wave2.length).toBeGreaterThan(0);

      // Simulate wave 2 complete
      const wave2Dead = wave2.map((e) => ({ ...e, isDead: true }));
      expect(shouldSpawnNextWave(wave2Dead, 2, 3)).toBe(true);

      // Wave 3 (final boss)
      const wave3 = spawnWave(waves, 3, mockLocation.difficulty);
      expect(wave3.length).toBe(1);

      // After wave 3, no more waves
      const wave3Dead = wave3.map((e) => ({ ...e, isDead: true }));
      expect(shouldSpawnNextWave(wave3Dead, 3, 3)).toBe(false);
    });

    it('should handle single-wave battle', () => {
      const singleWaveLocation: Location = {
        ...mockLocation,
        enemies: [
          {
            type: EnemyType.PEASANT,
            count: 5,
            wave: 1,
          },
        ],
        waves: 1,
      };

      const waves = createWaveDefinitions(singleWaveLocation);
      const spawned = spawnWave(waves, 1, 2);

      expect(spawned.length).toBe(5);

      const allDead = spawned.map((e) => ({ ...e, isDead: true }));
      expect(shouldSpawnNextWave(allDead, 1, 1)).toBe(false);
    });
  });
});
