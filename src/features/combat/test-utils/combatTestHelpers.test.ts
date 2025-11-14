/**
 * Combat Test Helpers - Tests
 *
 * Comprehensive tests for combat test helper utilities.
 * Validates all mock factories and battle simulation functions.
 */

import {
  createMockPosition,
  createMockCombatUnit,
  createMockEnemy,
  createMockSquad,
  createMockEnemyWave,
  createMockBattle,
  simulateBattleTick,
  simulateBattleTicks,
  killUnit,
  damageUnit,
  healUnit,
  initiateRetreat,
  findUnit,
  getAliveUnits,
  calculateDistance,
  isInRange,
} from './combatTestHelpers';
import { BattlePhase, UnitAIState, EnemyType } from '../../../types/combat';

describe('combatTestHelpers', () => {
  // ========== MOCK FACTORIES ==========

  describe('createMockPosition', () => {
    it('creates default position at origin', () => {
      const pos = createMockPosition();
      expect(pos).toEqual({ x: 0, y: 0 });
    });

    it('applies overrides', () => {
      const pos = createMockPosition({ x: 10, y: 5 });
      expect(pos).toEqual({ x: 10, y: 5 });
    });

    it('partially overrides coordinates', () => {
      const pos = createMockPosition({ x: 7 });
      expect(pos).toEqual({ x: 7, y: 0 });
    });
  });

  describe('createMockCombatUnit', () => {
    it('creates a valid combat unit with defaults', () => {
      const unit = createMockCombatUnit();

      expect(unit.id).toMatch(/^zombie-/);
      expect(unit.type).toBe('shambler');
      expect(unit.name).toBe('Test Zombie');
      expect(unit.stats.hp).toBe(100);
      expect(unit.stats.maxHp).toBe(100);
      expect(unit.stats.attack).toBe(15);
      expect(unit.stats.defense).toBe(10);
      expect(unit.aiState).toBe(UnitAIState.IDLE);
      expect(unit.isDead).toBe(false);
    });

    it('applies overrides', () => {
      const unit = createMockCombatUnit({
        type: 'brute',
        name: 'Big Brute',
        stats: {
          hp: 250,
          maxHp: 250,
          attack: 35,
          defense: 20,
          speed: 0.7,
          range: 1,
          attackCooldown: 2.5,
          resistances: {},
        },
      });

      expect(unit.type).toBe('brute');
      expect(unit.name).toBe('Big Brute');
      expect(unit.stats.hp).toBe(250);
      expect(unit.stats.attack).toBe(35);
    });

    it('generates unique IDs for each unit', () => {
      const unit1 = createMockCombatUnit();
      const unit2 = createMockCombatUnit();

      expect(unit1.id).not.toBe(unit2.id);
    });

    it('creates unit with custom position', () => {
      const unit = createMockCombatUnit({
        position: { x: 5, y: 3 },
      });

      expect(unit.position).toEqual({ x: 5, y: 3 });
    });

    it('creates unit with status effects', () => {
      const unit = createMockCombatUnit({
        statusEffects: ['poisoned', 'burning'],
      });

      expect(unit.statusEffects).toEqual(['poisoned', 'burning']);
    });

    it('creates dead unit', () => {
      const unit = createMockCombatUnit({
        stats: {
          hp: 0,
          maxHp: 100,
          attack: 15,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
        isDead: true,
        aiState: UnitAIState.DEAD,
      });

      expect(unit.isDead).toBe(true);
      expect(unit.stats.hp).toBe(0);
      expect(unit.aiState).toBe(UnitAIState.DEAD);
    });
  });

  describe('createMockEnemy', () => {
    it('creates a valid enemy with defaults', () => {
      const enemy = createMockEnemy();

      expect(enemy.id).toMatch(/^enemy-/);
      expect(enemy.type).toBe(EnemyType.PEASANT);
      expect(enemy.name).toBe('Test Peasant');
      expect(enemy.stats.hp).toBe(50);
      expect(enemy.position.x).toBe(20); // Default far right
      expect(enemy.aiState).toBe(UnitAIState.IDLE);
      expect(enemy.isDead).toBe(false);
    });

    it('generates unique IDs for each enemy', () => {
      const enemy1 = createMockEnemy();
      const enemy2 = createMockEnemy();

      expect(enemy1.id).not.toBe(enemy2.id);
    });

    it('creates enemy with custom type', () => {
      const enemy = createMockEnemy({
        type: EnemyType.KNIGHT,
        name: 'Sir Knight',
      });

      expect(enemy.type).toBe(EnemyType.KNIGHT);
      expect(enemy.name).toBe('Sir Knight');
    });

    it('creates enemy with abilities', () => {
      const enemy = createMockEnemy({
        abilities: [
          {
            id: 'heal',
            name: 'Heal',
            cooldown: 10,
            lastUsedAt: null,
            effect: {
              type: 'heal' as any,
              heal: 50,
              targetType: 'self' as any,
            },
          },
        ],
      });

      expect(enemy.abilities).toHaveLength(1);
      expect(enemy.abilities[0].name).toBe('Heal');
    });
  });

  describe('createMockSquad', () => {
    it('creates default squad with 3 zombies', () => {
      const squad = createMockSquad();

      expect(squad).toHaveLength(3);
      expect(squad[0].type).toBe('brute');
      expect(squad[1].type).toBe('shambler');
      expect(squad[2].type).toBe('shambler');
    });

    it('creates squad from custom specs', () => {
      const squad = createMockSquad([
        { type: 'runner', name: 'Fast 1' },
        { type: 'runner', name: 'Fast 2' },
      ]);

      expect(squad).toHaveLength(2);
      expect(squad[0].type).toBe('runner');
      expect(squad[0].name).toBe('Fast 1');
      expect(squad[1].type).toBe('runner');
      expect(squad[1].name).toBe('Fast 2');
    });

    it('creates empty squad from empty array', () => {
      const squad = createMockSquad([]);

      // Should return default squad when empty
      expect(squad).toHaveLength(3);
    });

    it('positions zombies in formation', () => {
      const squad = createMockSquad();

      expect(squad[0].position).toEqual({ x: 0, y: 0 });
      expect(squad[1].position).toEqual({ x: 1, y: 0 });
      expect(squad[2].position).toEqual({ x: 2, y: 0 });
    });
  });

  describe('createMockEnemyWave', () => {
    it('creates default wave with 3 enemies', () => {
      const wave = createMockEnemyWave();

      expect(wave).toHaveLength(3);
      expect(wave[0].type).toBe(EnemyType.PEASANT);
      expect(wave[1].type).toBe(EnemyType.PEASANT);
      expect(wave[2].type).toBe(EnemyType.ARCHER);
    });

    it('creates wave from custom specs', () => {
      const wave = createMockEnemyWave([
        { type: EnemyType.KNIGHT, name: 'Knight 1' },
        { type: EnemyType.MAGE, name: 'Mage' },
      ]);

      expect(wave).toHaveLength(2);
      expect(wave[0].type).toBe(EnemyType.KNIGHT);
      expect(wave[1].type).toBe(EnemyType.MAGE);
    });

    it('positions enemies on right side', () => {
      const wave = createMockEnemyWave();

      expect(wave[0].position.x).toBe(20);
      expect(wave[1].position.x).toBe(21);
      expect(wave[2].position.x).toBe(22);
    });
  });

  describe('createMockBattle', () => {
    it('creates a complete battle state', () => {
      const battle = createMockBattle();

      expect(battle.battleId).toMatch(/^battle-/);
      expect(battle.locationId).toBe('test-location');
      expect(battle.phase).toBe(BattlePhase.ACTIVE);
      expect(battle.playerSquad).toHaveLength(3);
      expect(battle.enemies).toHaveLength(3);
      expect(battle.currentWave).toBe(1);
      expect(battle.totalWaves).toBe(1);
      expect(battle.battleDuration).toBe(0);
      expect(battle.isRetreating).toBe(false);
    });

    it('applies overrides', () => {
      const battle = createMockBattle({
        phase: BattlePhase.VICTORY,
        currentWave: 2,
        totalWaves: 3,
      });

      expect(battle.phase).toBe(BattlePhase.VICTORY);
      expect(battle.currentWave).toBe(2);
      expect(battle.totalWaves).toBe(3);
    });
  });

  // ========== BATTLE SIMULATION ==========

  describe('simulateBattleTick', () => {
    it('increments battle duration', () => {
      const battle = createMockBattle();
      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.battleDuration).toBe(1.0);
    });

    it('accumulates duration over multiple ticks', () => {
      let battle = createMockBattle();
      battle = simulateBattleTick(battle, 0.5);
      battle = simulateBattleTick(battle, 0.3);

      expect(battle.battleDuration).toBeCloseTo(0.8);
    });

    it('detects victory when all enemies dead', () => {
      let battle = createMockBattle();
      // Kill all enemies
      battle.enemies.forEach((enemy) => {
        battle = killUnit(battle, enemy.id);
      });

      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.phase).toBe(BattlePhase.VICTORY);
    });

    it('detects defeat when all zombies dead', () => {
      let battle = createMockBattle();
      // Kill all zombies
      battle.playerSquad.forEach((zombie) => {
        battle = killUnit(battle, zombie.id);
      });

      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.phase).toBe(BattlePhase.DEFEAT);
    });

    it('does not change phase if battle still active', () => {
      const battle = createMockBattle();
      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.phase).toBe(BattlePhase.ACTIVE);
    });

    it('decrements retreat countdown', () => {
      let battle = createMockBattle();
      battle = initiateRetreat(battle);

      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.retreatCountdown).toBeLessThan(battle.retreatCountdown);
    });

    it('completes retreat and ends battle', () => {
      let battle = createMockBattle();
      battle = initiateRetreat(battle);

      // Simulate enough time to complete retreat
      const updated = simulateBattleTicks(battle, 1.0, 15);

      expect(updated.phase).toBe(BattlePhase.DEFEAT);
      expect(updated.retreatCountdown).toBe(0);
    });

    it('removes expired status effects', () => {
      const battle = createMockBattle({
        activeEffects: [
          {
            effect: 'poisoned' as any,
            unitId: 'zombie-1',
            duration: 0.5,
            strength: 2,
            appliedAt: Date.now(),
          },
        ],
      });

      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.activeEffects).toHaveLength(0);
    });

    it('keeps active status effects', () => {
      const battle = createMockBattle({
        activeEffects: [
          {
            effect: 'poisoned' as any,
            unitId: 'zombie-1',
            duration: 5.0,
            strength: 2,
            appliedAt: Date.now(),
          },
        ],
      });

      const updated = simulateBattleTick(battle, 1.0);

      expect(updated.activeEffects).toHaveLength(1);
      expect(updated.activeEffects[0].duration).toBe(4.0);
    });
  });

  describe('simulateBattleTicks', () => {
    it('simulates multiple ticks', () => {
      const battle = createMockBattle();
      const updated = simulateBattleTicks(battle, 0.1, 10);

      expect(updated.battleDuration).toBeCloseTo(1.0);
    });
  });

  describe('killUnit', () => {
    it('kills a zombie', () => {
      const battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;

      const updated = killUnit(battle, zombieId);

      const zombie = updated.playerSquad.find((z) => z.id === zombieId);
      expect(zombie?.isDead).toBe(true);
      expect(zombie?.stats.hp).toBe(0);
      expect(zombie?.aiState).toBe(UnitAIState.DEAD);
    });

    it('kills an enemy', () => {
      const battle = createMockBattle();
      const enemyId = battle.enemies[0].id;

      const updated = killUnit(battle, enemyId);

      const enemy = updated.enemies.find((e) => e.id === enemyId);
      expect(enemy?.isDead).toBe(true);
      expect(enemy?.stats.hp).toBe(0);
      expect(enemy?.aiState).toBe(UnitAIState.DEAD);
    });

    it('does not affect other units', () => {
      const battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;

      const updated = killUnit(battle, zombieId);

      const otherZombies = updated.playerSquad.filter((z) => z.id !== zombieId);
      expect(otherZombies.every((z) => !z.isDead)).toBe(true);
    });
  });

  describe('damageUnit', () => {
    it('reduces unit HP', () => {
      const battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;
      const initialHp = battle.playerSquad[0].stats.hp;

      const updated = damageUnit(battle, zombieId, 50);

      const zombie = updated.playerSquad.find((z) => z.id === zombieId);
      expect(zombie?.stats.hp).toBe(initialHp - 50);
    });

    it('kills unit if damage exceeds HP', () => {
      const battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;
      const initialHp = battle.playerSquad[0].stats.hp;

      const updated = damageUnit(battle, zombieId, initialHp + 100);

      const zombie = updated.playerSquad.find((z) => z.id === zombieId);
      expect(zombie?.stats.hp).toBe(0);
      expect(zombie?.isDead).toBe(true);
    });

    it('does not reduce HP below 0', () => {
      const battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;

      const updated = damageUnit(battle, zombieId, 99999);

      const zombie = updated.playerSquad.find((z) => z.id === zombieId);
      expect(zombie?.stats.hp).toBe(0);
    });
  });

  describe('healUnit', () => {
    it('restores unit HP', () => {
      let battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;

      battle = damageUnit(battle, zombieId, 50);
      const damagedHp = battle.playerSquad[0].stats.hp;

      battle = healUnit(battle, zombieId, 30);

      const zombie = battle.playerSquad.find((z) => z.id === zombieId);
      expect(zombie?.stats.hp).toBe(damagedHp + 30);
    });

    it('does not exceed max HP', () => {
      let battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;
      const maxHp = battle.playerSquad[0].stats.maxHp;

      battle = damageUnit(battle, zombieId, 20);
      battle = healUnit(battle, zombieId, 99999);

      const zombie = battle.playerSquad.find((z) => z.id === zombieId);
      expect(zombie?.stats.hp).toBe(maxHp);
    });
  });

  describe('initiateRetreat', () => {
    it('sets retreat flag', () => {
      const battle = createMockBattle();
      const updated = initiateRetreat(battle);

      expect(updated.isRetreating).toBe(true);
      expect(updated.retreatCountdown).toBeGreaterThan(0);
    });
  });

  describe('findUnit', () => {
    it('finds a zombie by ID', () => {
      const battle = createMockBattle();
      const zombieId = battle.playerSquad[0].id;

      const found = findUnit(battle, zombieId);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(zombieId);
    });

    it('finds an enemy by ID', () => {
      const battle = createMockBattle();
      const enemyId = battle.enemies[0].id;

      const found = findUnit(battle, enemyId);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(enemyId);
    });

    it('returns null for nonexistent ID', () => {
      const battle = createMockBattle();
      const found = findUnit(battle, 'nonexistent-id');

      expect(found).toBeNull();
    });
  });

  describe('getAliveUnits', () => {
    it('returns all alive units', () => {
      const battle = createMockBattle();
      const { zombies, enemies } = getAliveUnits(battle);

      expect(zombies).toHaveLength(3);
      expect(enemies).toHaveLength(3);
    });

    it('excludes dead units', () => {
      let battle = createMockBattle();
      battle = killUnit(battle, battle.playerSquad[0].id);
      battle = killUnit(battle, battle.enemies[0].id);

      const { zombies, enemies } = getAliveUnits(battle);

      expect(zombies).toHaveLength(2);
      expect(enemies).toHaveLength(2);
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two positions', () => {
      const pos1 = createMockPosition({ x: 0, y: 0 });
      const pos2 = createMockPosition({ x: 3, y: 4 });

      const distance = calculateDistance(pos1, pos2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('returns 0 for same position', () => {
      const pos = createMockPosition({ x: 5, y: 5 });
      const distance = calculateDistance(pos, pos);

      expect(distance).toBe(0);
    });
  });

  describe('isInRange', () => {
    it('returns true when target in range', () => {
      const attacker = createMockCombatUnit({
        position: { x: 0, y: 0 },
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 15,
          defense: 10,
          speed: 1.0,
          range: 5,
          attackCooldown: 1.5,
          resistances: {},
        },
      });
      const target = createMockEnemy({
        position: { x: 3, y: 4 },
      });

      const inRange = isInRange(attacker, target);

      expect(inRange).toBe(true);
    });

    it('returns false when target out of range', () => {
      const attacker = createMockCombatUnit({
        position: { x: 0, y: 0 },
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 15,
          defense: 10,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
      });
      const target = createMockEnemy({
        position: { x: 10, y: 10 },
      });

      const inRange = isInRange(attacker, target);

      expect(inRange).toBe(false);
    });
  });
});
