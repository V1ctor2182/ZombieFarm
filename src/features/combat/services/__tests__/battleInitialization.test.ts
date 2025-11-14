/**
 * Battle Initialization Tests
 *
 * Tests for Phase 2.1: Battle Initialization
 * - Squad validation (size, composition)
 * - Enemy wave generation
 * - Position assignment
 * - Battle state creation
 * - Pre-battle validation
 *
 * Following TDD methodology per TESTING.md standards.
 */

import { describe, it, expect } from '@jest/globals';
import type { Zombie } from '../../../../types/farm';
import type { Location, LocationEnemy } from '../../../../types/world';
import type { CombatState, Enemy, Obstacle } from '../../../../types/combat';
import { BattlePhase, EnemyType, UnitAIState } from '../../../../types/combat';
import { ZombieType } from '../../../../types/farm';
import { LocationType } from '../../../../types/world';
import { createMockZombie, createMockLocation } from '../../test-utils/combatTestHelpers';

// Import functions to test (these will be implemented after tests)
import {
  validateSquad,
  generateEnemyWave,
  assignPositions,
  initializeBattle,
  checkBattleRequirements,
  type SquadValidationResult,
  type FormationType,
} from '../battleInitialization';

// ============================================================================
// SQUAD VALIDATION TESTS
// ============================================================================

describe('validateSquad', () => {
  describe('size validation', () => {
    it('accepts squad within size limits', () => {
      const zombies: Zombie[] = [
        createMockZombie({ type: ZombieType.SHAMBLER }),
        createMockZombie({ type: ZombieType.RUNNER }),
        createMockZombie({ type: ZombieType.BRUTE }),
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('rejects empty squad', () => {
      const zombies: Zombie[] = [];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad cannot be empty');
    });

    it('rejects squad exceeding size limit', () => {
      const zombies: Zombie[] = [
        createMockZombie(),
        createMockZombie(),
        createMockZombie(),
        createMockZombie(),
        createMockZombie(),
        createMockZombie(), // 6 zombies
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad size exceeds maximum of 5');
    });

    it('accepts squad at exact maximum size', () => {
      const zombies: Zombie[] = [createMockZombie(), createMockZombie(), createMockZombie()];
      const maxSquadSize = 3;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('accepts single zombie squad', () => {
      const zombies: Zombie[] = [createMockZombie()];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('zombie state validation', () => {
    it('rejects dead zombies in squad', () => {
      const zombies: Zombie[] = [
        createMockZombie({ stats: { hp: 0, maxHp: 100 } }),
        createMockZombie({ stats: { hp: 50, maxHp: 100 } }),
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad contains dead zombies');
    });

    it('accepts zombies with low but non-zero HP', () => {
      const zombies: Zombie[] = [
        createMockZombie({ stats: { hp: 1, maxHp: 100 } }),
        createMockZombie({ stats: { hp: 50, maxHp: 100 } }),
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('rejects zombies with negative HP', () => {
      const zombies: Zombie[] = [createMockZombie({ stats: { hp: -10, maxHp: 100 } })];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squad contains dead zombies');
    });
  });

  describe('composition validation', () => {
    it('validates all zombie types are recognized', () => {
      const zombies: Zombie[] = [
        createMockZombie({ type: ZombieType.SHAMBLER }),
        createMockZombie({ type: ZombieType.RUNNER }),
        createMockZombie({ type: ZombieType.BRUTE }),
        createMockZombie({ type: ZombieType.SPITTER }),
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it('warns if squad has no tanks (high defense units)', () => {
      const zombies: Zombie[] = [
        createMockZombie({ type: ZombieType.RUNNER, stats: { defense: 5 } }),
        createMockZombie({ type: ZombieType.SPITTER, stats: { defense: 3 } }),
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Squad has no tank units (high defense)');
    });

    it('does not warn if squad has tank', () => {
      const zombies: Zombie[] = [
        createMockZombie({ type: ZombieType.BRUTE, stats: { defense: 30 } }),
        createMockZombie({ type: ZombieType.RUNNER, stats: { defense: 5 } }),
      ];
      const maxSquadSize = 5;

      const result = validateSquad(zombies, maxSquadSize);

      expect(result.isValid).toBe(true);
      expect(result.warnings).not.toContain('Squad has no tank units (high defense)');
    });
  });
});

// ============================================================================
// ENEMY WAVE GENERATION TESTS
// ============================================================================

describe('generateEnemyWave', () => {
  describe('basic enemy generation', () => {
    it('generates enemies from location data', () => {
      const location = createMockLocation({
        enemies: [
          { type: EnemyType.PEASANT, count: 3, wave: 1 },
          { type: EnemyType.MILITIA, count: 2, wave: 1 },
        ],
        waves: 1,
      });
      const waveNumber = 1;

      const enemies = generateEnemyWave(location, waveNumber);

      expect(enemies).toHaveLength(5);
      const peasants = enemies.filter((e) => e.type === EnemyType.PEASANT);
      const militia = enemies.filter((e) => e.type === EnemyType.MILITIA);
      expect(peasants).toHaveLength(3);
      expect(militia).toHaveLength(2);
    });

    it('generates only enemies for specified wave', () => {
      const location = createMockLocation({
        enemies: [
          { type: EnemyType.PEASANT, count: 3, wave: 1 },
          { type: EnemyType.KNIGHT, count: 2, wave: 2 },
        ],
        waves: 2,
      });
      const waveNumber = 1;

      const enemies = generateEnemyWave(location, waveNumber);

      expect(enemies).toHaveLength(3);
      expect(enemies.every((e) => e.type === EnemyType.PEASANT)).toBe(true);
    });

    it('generates second wave enemies correctly', () => {
      const location = createMockLocation({
        enemies: [
          { type: EnemyType.PEASANT, count: 3, wave: 1 },
          { type: EnemyType.KNIGHT, count: 2, wave: 2 },
        ],
        waves: 2,
      });
      const waveNumber = 2;

      const enemies = generateEnemyWave(location, waveNumber);

      expect(enemies).toHaveLength(2);
      expect(enemies.every((e) => e.type === EnemyType.KNIGHT)).toBe(true);
    });

    it('returns empty array for non-existent wave', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.PEASANT, count: 3, wave: 1 }],
        waves: 1,
      });
      const waveNumber = 2;

      const enemies = generateEnemyWave(location, waveNumber);

      expect(enemies).toHaveLength(0);
    });

    it('assigns unique IDs to each enemy', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.PEASANT, count: 5, wave: 1 }],
        waves: 1,
      });

      const enemies = generateEnemyWave(location, 1);

      const ids = enemies.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('enemy stats and configuration', () => {
    it('applies base stats from enemy config', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.KNIGHT, count: 1, wave: 1 }],
      });

      const enemies = generateEnemyWave(location, 1);

      expect(enemies[0].stats.defense).toBeGreaterThan(0);
      expect(enemies[0].stats.attack).toBeGreaterThan(0);
      expect(enemies[0].stats.hp).toBeGreaterThan(0);
    });

    it('applies level modifier to enemy stats', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.PEASANT, count: 1, wave: 1, levelModifier: 2.0 }],
      });

      const enemies = generateEnemyWave(location, 1);
      const baseEnemy = generateEnemyWave(
        createMockLocation({
          enemies: [{ type: EnemyType.PEASANT, count: 1, wave: 1 }],
        }),
        1
      )[0];

      expect(enemies[0].stats.hp).toBeGreaterThan(baseEnemy.stats.hp);
      expect(enemies[0].stats.attack).toBeGreaterThan(baseEnemy.stats.attack);
    });

    it('marks boss enemies correctly', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.PALADIN, count: 1, wave: 1, isBoss: true }],
      });

      const enemies = generateEnemyWave(location, 1);

      // Boss marker would be in enemy properties
      expect(enemies[0].type).toBe(EnemyType.PALADIN);
    });

    it('assigns abilities based on enemy type', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.MAGE, count: 1, wave: 1 }],
      });

      const enemies = generateEnemyWave(location, 1);

      expect(enemies[0].abilities.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// POSITION ASSIGNMENT TESTS
// ============================================================================

describe('assignPositions', () => {
  describe('zombie positioning', () => {
    it('positions zombies in line formation', () => {
      const zombies: Zombie[] = [createMockZombie(), createMockZombie(), createMockZombie()];
      const formation: FormationType = 'line';
      const side: 'left' | 'right' = 'left';

      const positioned = assignPositions(zombies, formation, side);

      expect(positioned).toHaveLength(3);
      // Zombies should be on left side (x < 500)
      expect(positioned.every((z) => z.position.x < 500)).toBe(true);
      // Zombies should have different y positions (vertical spread)
      const yPositions = positioned.map((z) => z.position.y);
      const uniqueY = new Set(yPositions);
      expect(uniqueY.size).toBe(3);
    });

    it('positions zombies in staggered formation', () => {
      const zombies: Zombie[] = [
        createMockZombie(),
        createMockZombie(),
        createMockZombie(),
        createMockZombie(),
      ];
      const formation: FormationType = 'staggered';
      const side: 'left' | 'right' = 'left';

      const positioned = assignPositions(zombies, formation, side);

      expect(positioned).toHaveLength(4);
      // Staggered means different x positions within side
      const xPositions = positioned.map((z) => z.position.x);
      const uniqueX = new Set(xPositions);
      expect(uniqueX.size).toBeGreaterThan(1);
    });

    it('positions zombies in wedge formation', () => {
      const zombies: Zombie[] = [
        createMockZombie({ type: ZombieType.BRUTE }), // Tank at front
        createMockZombie(),
        createMockZombie(),
      ];
      const formation: FormationType = 'wedge';
      const side: 'left' | 'right' = 'left';

      const positioned = assignPositions(zombies, formation, side);

      expect(positioned).toHaveLength(3);
      // First zombie (tank) should be furthest forward
      const firstZombie = positioned[0];
      const others = positioned.slice(1);
      expect(others.every((z) => z.position.x < firstZombie.position.x)).toBe(true);
    });

    it('respects deployment order', () => {
      const zombies: Zombie[] = [
        createMockZombie({ name: 'First' }),
        createMockZombie({ name: 'Second' }),
        createMockZombie({ name: 'Third' }),
      ];
      const formation: FormationType = 'line';
      const side: 'left' | 'right' = 'left';

      const positioned = assignPositions(zombies, formation, side);

      expect(positioned[0].name).toBe('First');
      expect(positioned[1].name).toBe('Second');
      expect(positioned[2].name).toBe('Third');
    });
  });

  describe('enemy positioning', () => {
    it('positions enemies on right side', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.PEASANT, count: 3, wave: 1 }],
      });
      const enemies = generateEnemyWave(location, 1);
      const formation: FormationType = 'line';
      const side: 'left' | 'right' = 'right';

      const positioned = assignPositions(enemies as any[], formation, side);

      // Enemies should be on right side (x > 500)
      expect(positioned.every((e) => e.position.x > 500)).toBe(true);
    });

    it('spreads enemies vertically', () => {
      const location = createMockLocation({
        enemies: [{ type: EnemyType.PEASANT, count: 5, wave: 1 }],
      });
      const enemies = generateEnemyWave(location, 1);

      const positioned = assignPositions(enemies as any[], 'line', 'right');

      const yPositions = positioned.map((e) => e.position.y);
      const uniqueY = new Set(yPositions);
      expect(uniqueY.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('edge cases', () => {
    it('handles single unit positioning', () => {
      const zombies: Zombie[] = [createMockZombie()];

      const positioned = assignPositions(zombies, 'line', 'left');

      expect(positioned).toHaveLength(1);
      expect(positioned[0].position).toBeDefined();
    });

    it('handles large squad positioning', () => {
      const zombies: Zombie[] = Array.from({ length: 10 }, () => createMockZombie());

      const positioned = assignPositions(zombies, 'line', 'left');

      expect(positioned).toHaveLength(10);
      // All should have valid positions
      expect(positioned.every((z) => z.position.x >= 0 && z.position.y >= 0)).toBe(true);
    });

    it('keeps units within battlefield bounds', () => {
      const zombies: Zombie[] = Array.from({ length: 20 }, () => createMockZombie());

      const positioned = assignPositions(zombies, 'line', 'left');

      // Assuming battlefield height is 1080
      expect(positioned.every((z) => z.position.y >= 0 && z.position.y <= 1080)).toBe(true);
    });
  });
});

// ============================================================================
// BATTLE STATE INITIALIZATION TESTS
// ============================================================================

describe('initializeBattle', () => {
  it('creates complete battle state', () => {
    const squad: Zombie[] = [createMockZombie(), createMockZombie()];
    const location = createMockLocation({
      enemies: [{ type: EnemyType.PEASANT, count: 3, wave: 1 }],
    });

    const battleState = initializeBattle(squad, location);

    expect(battleState.battleId).toBeDefined();
    expect(battleState.locationId).toBe(location.id);
    expect(battleState.phase).toBe(BattlePhase.PREPARATION);
    expect(battleState.playerSquad).toHaveLength(2);
    expect(battleState.enemies).toHaveLength(3);
    expect(battleState.currentWave).toBe(1);
    expect(battleState.totalWaves).toBe(location.waves);
  });

  it('initializes battle duration to zero', () => {
    const squad = [createMockZombie()];
    const location = createMockLocation();

    const battleState = initializeBattle(squad, location);

    expect(battleState.battleDuration).toBe(0);
  });

  it('sets startedAt timestamp', () => {
    const squad = [createMockZombie()];
    const location = createMockLocation();
    const beforeTime = Date.now();

    const battleState = initializeBattle(squad, location);

    expect(battleState.startedAt).toBeGreaterThanOrEqual(beforeTime);
    expect(battleState.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it('initializes with no status effects', () => {
    const squad = [createMockZombie()];
    const location = createMockLocation();

    const battleState = initializeBattle(squad, location);

    expect(battleState.activeEffects).toHaveLength(0);
  });

  it('initializes retreat flags to false', () => {
    const squad = [createMockZombie()];
    const location = createMockLocation();

    const battleState = initializeBattle(squad, location);

    expect(battleState.isRetreating).toBe(false);
    expect(battleState.retreatCountdown).toBe(0);
  });

  it('converts zombies to combat units', () => {
    const squad = [createMockZombie({ name: 'TestZombie', stats: { hp: 50, maxHp: 100 } })];
    const location = createMockLocation();

    const battleState = initializeBattle(squad, location);

    expect(battleState.playerSquad[0].name).toBe('TestZombie');
    expect(battleState.playerSquad[0].stats.hp).toBe(50);
    expect(battleState.playerSquad[0].stats.maxHp).toBe(100);
    expect(battleState.playerSquad[0].isDead).toBe(false);
    expect(battleState.playerSquad[0].aiState).toBe(UnitAIState.IDLE);
  });

  it('initializes battle log as empty', () => {
    const squad = [createMockZombie()];
    const location = createMockLocation();

    const battleState = initializeBattle(squad, location);

    expect(battleState.battleLog).toHaveLength(0);
  });

  it('creates obstacles from location fortifications', () => {
    const squad = [createMockZombie()];
    const location = createMockLocation({
      fortifications: ['gate', 'wall', 'tower'],
    });

    const battleState = initializeBattle(squad, location);

    expect(battleState.obstacles.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// PRE-BATTLE VALIDATION TESTS
// ============================================================================

describe('checkBattleRequirements', () => {
  describe('squad requirements', () => {
    it('passes with valid squad and location', () => {
      const squad = [createMockZombie(), createMockZombie()];
      const location = createMockLocation();

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('fails if squad is empty', () => {
      const squad: Zombie[] = [];
      const location = createMockLocation();

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(false);
      expect(result.errors).toContain('Squad cannot be empty');
    });

    it('fails if squad exceeds max size', () => {
      const squad = Array.from({ length: 6 }, () => createMockZombie());
      const location = createMockLocation();

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(false);
      expect(result.errors).toContain('Squad size exceeds maximum of 5');
    });
  });

  describe('location requirements', () => {
    it('fails if location is locked', () => {
      const squad = [createMockZombie()];
      const location = createMockLocation({ isUnlocked: false });

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(false);
      expect(result.errors).toContain('Location is not unlocked');
    });

    it('passes if location is unlocked', () => {
      const squad = [createMockZombie()];
      const location = createMockLocation({ isUnlocked: true });

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(true);
    });

    it('warns if location difficulty is high', () => {
      const squad = [createMockZombie({ level: 1 })];
      const location = createMockLocation({
        difficulty: 8,
        recommendedLevel: 10,
      });

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(true);
      expect(result.warnings.some((w) => w.includes('difficulty'))).toBe(true);
    });

    it('fails if location is on cooldown', () => {
      const squad = [createMockZombie()];
      const futureTime = Date.now() + 3600000; // 1 hour from now
      const location = createMockLocation({ nextRaidAvailable: futureTime });

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(false);
      expect(result.errors.some((e) => e.includes('cooldown'))).toBe(true);
    });
  });

  describe('zombie state requirements', () => {
    it('fails if any zombie is dead', () => {
      const squad = [
        createMockZombie({ stats: { hp: 50, maxHp: 100 } }),
        createMockZombie({ stats: { hp: 0, maxHp: 100 } }),
      ];
      const location = createMockLocation();

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(false);
      expect(result.errors).toContain('Squad contains dead zombies');
    });

    it('warns if zombies have low HP', () => {
      const squad = [createMockZombie({ stats: { hp: 10, maxHp: 100 } })];
      const location = createMockLocation();

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(true);
      expect(result.warnings.some((w) => w.includes('low HP'))).toBe(true);
    });
  });

  describe('level recommendations', () => {
    it('warns if squad average level is below recommended', () => {
      const squad = [createMockZombie({ level: 1 }), createMockZombie({ level: 2 })];
      const location = createMockLocation({ recommendedLevel: 10 });

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(true);
      expect(result.warnings.some((w) => w.includes('level'))).toBe(true);
    });

    it('does not warn if squad level is sufficient', () => {
      const squad = [createMockZombie({ level: 10 }), createMockZombie({ level: 12 })];
      const location = createMockLocation({ recommendedLevel: 10 });

      const result = checkBattleRequirements(squad, location, 5);

      expect(result.canStart).toBe(true);
      expect(result.warnings).toEqual([]);
    });
  });
});
