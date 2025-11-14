/**
 * Enemy Factory
 *
 * Factory functions for creating test Enemy objects.
 * Per DOMAIN-COMBAT.md: Enemies are human opponents with various types and abilities.
 */

import type { Enemy, EnemyAIProfile, CombatStats } from '../../../types';
import { EnemyType, UnitAIState, TargetPriority, DamageType } from '../../../types';

let enemyIdCounter = 1;
function generateEnemyId(): string {
  return `test-enemy-${enemyIdCounter++}`;
}

/**
 * Creates default enemy AI profile
 */
function createDefaultAIProfile(): EnemyAIProfile {
  return {
    aggression: 0.7,
    targetPriority: TargetPriority.CLOSEST,
    preferredRange: 1,
    canRetreat: false,
  };
}

/**
 * Creates enemy stats based on type
 */
function createEnemyStats(type: EnemyType): CombatStats {
  const statsByType: Record<EnemyType, CombatStats> = {
    [EnemyType.PEASANT]: {
      hp: 50,
      maxHp: 50,
      attack: 10,
      defense: 2,
      speed: 1.5,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    [EnemyType.MILITIA]: {
      hp: 80,
      maxHp: 80,
      attack: 15,
      defense: 8,
      speed: 1.3,
      range: 1,
      attackCooldown: 1.3,
      resistances: {},
    },
    [EnemyType.ARCHER]: {
      hp: 60,
      maxHp: 60,
      attack: 20,
      defense: 3,
      speed: 1.2,
      range: 6,
      attackCooldown: 2.0,
      resistances: {},
    },
    [EnemyType.CROSSBOWMAN]: {
      hp: 70,
      maxHp: 70,
      attack: 30,
      defense: 5,
      speed: 1.0,
      range: 7,
      attackCooldown: 3.0,
      resistances: {},
    },
    [EnemyType.SOLDIER]: {
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 12,
      speed: 1.2,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    [EnemyType.KNIGHT]: {
      hp: 150,
      maxHp: 150,
      attack: 25,
      defense: 25,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.8,
      resistances: {},
    },
    [EnemyType.BRUTE]: {
      hp: 200,
      maxHp: 200,
      attack: 40,
      defense: 15,
      speed: 0.8,
      range: 1,
      attackCooldown: 2.5,
      resistances: {},
    },
    [EnemyType.MAGE]: {
      hp: 70,
      maxHp: 70,
      attack: 35,
      defense: 5,
      speed: 1.0,
      range: 8,
      attackCooldown: 3.0,
      resistances: { [DamageType.FIRE]: 0.5 },
    },
    [EnemyType.PRIEST]: {
      hp: 90,
      maxHp: 90,
      attack: 30,
      defense: 8,
      speed: 1.1,
      range: 5,
      attackCooldown: 2.5,
      resistances: { [DamageType.HOLY]: 0.8 },
    },
    [EnemyType.NECROMANCER]: {
      hp: 80,
      maxHp: 80,
      attack: 25,
      defense: 6,
      speed: 1.0,
      range: 7,
      attackCooldown: 2.8,
      resistances: { [DamageType.DARK]: 0.9 },
    },
    [EnemyType.PALADIN]: {
      hp: 250,
      maxHp: 250,
      attack: 40,
      defense: 30,
      speed: 1.2,
      range: 1,
      attackCooldown: 1.5,
      resistances: { [DamageType.HOLY]: 1.0, [DamageType.DARK]: -0.5 },
    },
    [EnemyType.GENERAL]: {
      hp: 200,
      maxHp: 200,
      attack: 30,
      defense: 20,
      speed: 1.1,
      range: 1,
      attackCooldown: 1.6,
      resistances: {},
    },
    [EnemyType.BOSS]: {
      hp: 500,
      maxHp: 500,
      attack: 50,
      defense: 35,
      speed: 1.0,
      range: 1,
      attackCooldown: 2.0,
      resistances: {},
    },
  };

  return { ...statsByType[type] };
}

/**
 * Creates a test Enemy with sensible defaults
 */
export function createTestEnemy(overrides?: Partial<Enemy>): Enemy {
  const type = overrides?.type ?? EnemyType.PEASANT;

  const defaultEnemy: Enemy = {
    id: generateEnemyId(),
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
    position: { x: 100, y: 50 },
    stats: createEnemyStats(type),
    statusEffects: [],
    aiProfile: createDefaultAIProfile(),
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    abilities: [],
    isDead: false,
  };

  return {
    ...defaultEnemy,
    ...overrides,
    stats: overrides?.stats ? { ...defaultEnemy.stats, ...overrides.stats } : defaultEnemy.stats,
    position: overrides?.position
      ? { ...defaultEnemy.position, ...overrides.position }
      : defaultEnemy.position,
    aiProfile: overrides?.aiProfile
      ? { ...defaultEnemy.aiProfile, ...overrides.aiProfile }
      : defaultEnemy.aiProfile,
  };
}

/**
 * Creates enemy of specific type
 */
export function createTestEnemyWithType(type: EnemyType): Enemy {
  return createTestEnemy({ type });
}

// Type-specific factories
export const createPeasant = () => createTestEnemyWithType(EnemyType.PEASANT);
export const createMilitia = () => createTestEnemyWithType(EnemyType.MILITIA);
export const createArcher = () => createTestEnemyWithType(EnemyType.ARCHER);
export const createCrossbowman = () => createTestEnemyWithType(EnemyType.CROSSBOWMAN);
export const createSoldier = () => createTestEnemyWithType(EnemyType.SOLDIER);
export const createKnight = () => createTestEnemyWithType(EnemyType.KNIGHT);
export const createBrute = () => createTestEnemyWithType(EnemyType.BRUTE);
export const createMage = () => createTestEnemyWithType(EnemyType.MAGE);
export const createPriest = () => createTestEnemyWithType(EnemyType.PRIEST);
export const createNecromancer = () => createTestEnemyWithType(EnemyType.NECROMANCER);
export const createPaladin = () => createTestEnemyWithType(EnemyType.PALADIN);
export const createGeneral = () => createTestEnemyWithType(EnemyType.GENERAL);
export const createBoss = () => createTestEnemyWithType(EnemyType.BOSS);

/**
 * Creates damaged enemy
 */
export function createDamagedEnemy(type: EnemyType = EnemyType.SOLDIER): Enemy {
  const enemy = createTestEnemyWithType(type);
  return {
    ...enemy,
    stats: {
      ...enemy.stats,
      hp: Math.floor(enemy.stats.maxHp * 0.3),
    },
  };
}

/**
 * Creates enemy wave
 */
export function createEnemyWave(count: number = 5): Enemy[] {
  const enemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    enemies.push(createTestEnemy());
  }
  return enemies;
}

/**
 * Creates mixed enemy group
 */
export function createMixedEnemyGroup(): Enemy[] {
  return [
    createKnight(),
    createSoldier(),
    createSoldier(),
    createArcher(),
    createArcher(),
    createPriest(),
  ];
}

/**
 * Creates elite enemy group
 */
export function createEliteEnemyGroup(): Enemy[] {
  return [createPaladin(), createKnight(), createKnight(), createMage(), createPriest()];
}
