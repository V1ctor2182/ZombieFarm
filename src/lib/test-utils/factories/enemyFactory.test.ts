/**
 * Enemy Factory Tests
 */

import {
  createTestEnemy,
  createTestEnemyWithType,
  createPeasant,
  createMilitia,
  createArcher,
  createKnight,
  createPriest,
  createPaladin,
  createBoss,
  createDamagedEnemy,
  createEnemyWave,
  createMixedEnemyGroup,
  createEliteEnemyGroup,
} from './enemyFactory';
import { EnemyType, UnitAIState } from '../../../types';

describe('enemyFactory', () => {
  describe('createTestEnemy', () => {
    it('creates a valid Enemy with defaults', () => {
      const enemy = createTestEnemy();
      expect(enemy).toBeDefined();
      expect(enemy.id).toMatch(/^test-enemy-\d+$/);
      expect(enemy.type).toBe(EnemyType.PEASANT);
    });

    it('creates Enemy with stats', () => {
      const enemy = createTestEnemy();
      expect(enemy.stats.maxHp).toBeGreaterThan(0);
      expect(enemy.stats.hp).toBe(enemy.stats.maxHp);
    });

    it('creates Enemy in IDLE state', () => {
      const enemy = createTestEnemy();
      expect(enemy.aiState).toBe(UnitAIState.IDLE);
    });

    it('creates alive Enemy', () => {
      const enemy = createTestEnemy();
      expect(enemy.isDead).toBe(false);
    });

    it('allows overriding type', () => {
      const enemy = createTestEnemy({ type: EnemyType.KNIGHT });
      expect(enemy.type).toBe(EnemyType.KNIGHT);
    });

    it('generates unique IDs', () => {
      const enemy1 = createTestEnemy();
      const enemy2 = createTestEnemy();
      expect(enemy1.id).not.toBe(enemy2.id);
    });
  });

  describe('createTestEnemyWithType', () => {
    it('creates enemy of specified type', () => {
      const enemy = createTestEnemyWithType(EnemyType.ARCHER);
      expect(enemy.type).toBe(EnemyType.ARCHER);
    });

    it('applies type-specific stats', () => {
      const archer = createTestEnemyWithType(EnemyType.ARCHER);
      expect(archer.stats.range).toBeGreaterThan(1); // Ranged
    });
  });

  describe('Type-Specific Factories', () => {
    it('createPeasant creates Peasant', () => {
      const enemy = createPeasant();
      expect(enemy.type).toBe(EnemyType.PEASANT);
    });

    it('createMilitia creates Militia', () => {
      const enemy = createMilitia();
      expect(enemy.type).toBe(EnemyType.MILITIA);
    });

    it('createArcher creates Archer with range', () => {
      const enemy = createArcher();
      expect(enemy.type).toBe(EnemyType.ARCHER);
      expect(enemy.stats.range).toBeGreaterThan(3);
    });

    it('createKnight creates heavily armored Knight', () => {
      const enemy = createKnight();
      expect(enemy.type).toBe(EnemyType.KNIGHT);
      expect(enemy.stats.defense).toBeGreaterThan(20);
    });

    it('createPriest creates Priest', () => {
      const enemy = createPriest();
      expect(enemy.type).toBe(EnemyType.PRIEST);
    });

    it('createPaladin creates powerful Paladin', () => {
      const enemy = createPaladin();
      expect(enemy.type).toBe(EnemyType.PALADIN);
      expect(enemy.stats.maxHp).toBeGreaterThan(200);
    });

    it('createBoss creates Boss with massive stats', () => {
      const enemy = createBoss();
      expect(enemy.type).toBe(EnemyType.BOSS);
      expect(enemy.stats.maxHp).toBeGreaterThanOrEqual(500);
    });
  });

  describe('createDamagedEnemy', () => {
    it('creates enemy with 30% HP', () => {
      const enemy = createDamagedEnemy();
      expect(enemy.stats.hp).toBe(Math.floor(enemy.stats.maxHp * 0.3));
    });

    it('accepts type parameter', () => {
      const enemy = createDamagedEnemy(EnemyType.KNIGHT);
      expect(enemy.type).toBe(EnemyType.KNIGHT);
    });
  });

  describe('createEnemyWave', () => {
    it('creates array of enemies', () => {
      const wave = createEnemyWave(5);
      expect(wave).toHaveLength(5);
    });

    it('defaults to 5 enemies', () => {
      const wave = createEnemyWave();
      expect(wave).toHaveLength(5);
    });

    it('all enemies have unique IDs', () => {
      const wave = createEnemyWave(3);
      const ids = wave.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('createMixedEnemyGroup', () => {
    it('creates mixed enemy group', () => {
      const group = createMixedEnemyGroup();
      const types = group.map((e) => e.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });

    it('includes Knight', () => {
      const group = createMixedEnemyGroup();
      expect(group.some((e) => e.type === EnemyType.KNIGHT)).toBe(true);
    });

    it('includes Priest', () => {
      const group = createMixedEnemyGroup();
      expect(group.some((e) => e.type === EnemyType.PRIEST)).toBe(true);
    });
  });

  describe('createEliteEnemyGroup', () => {
    it('includes elite enemies', () => {
      const group = createEliteEnemyGroup();
      expect(group.some((e) => e.type === EnemyType.PALADIN)).toBe(true);
    });

    it('all enemies are powerful', () => {
      const group = createEliteEnemyGroup();
      const allPowerful = group.every((e) => e.stats.maxHp > 80);
      expect(allPowerful).toBe(true);
    });
  });
});
