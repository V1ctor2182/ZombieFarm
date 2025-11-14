/**
 * Combat Test Helpers
 *
 * Utilities for creating and manipulating combat test scenarios.
 * Provides mock battles, squads, enemy waves, and battle simulation.
 *
 * Per DOMAIN-COMBAT.md and TESTING.md standards.
 */

import {
  type CombatState,
  type CombatUnit,
  type Enemy,
  BattlePhase,
  UnitAIState,
  type DamageType,
  type StatusEffect,
  EnemyType,
  TargetPriority,
} from '../../../types/combat';
import type { Position, BattleId, LocationId, ZombieId } from '../../../types/global';
import type { Zombie, ZombieType } from '../../../types/farm';
import type { Location, LocationEnemy } from '../../../types/world';
import { LocationType } from '../../../types/world';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

// ============================================================================
// MOCK FACTORIES
// ============================================================================

/**
 * Creates a mock position
 */
export function createMockPosition(overrides?: Partial<Position>): Position {
  return {
    x: 0,
    y: 0,
    ...overrides,
  };
}

/**
 * Creates a mock combat unit (zombie in battle)
 */
export function createMockCombatUnit(
  overrides?: Partial<CombatUnit>
): CombatUnit {
  return {
    id: `zombie-${Math.random().toString(36).substr(2, 9)}`,
    type: 'shambler',
    name: 'Test Zombie',
    position: createMockPosition(),
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
    statusEffects: [],
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    isDead: false,
    ...overrides,
  };
}

/**
 * Creates a mock enemy unit
 */
export function createMockEnemy(overrides?: Partial<Enemy>): Enemy {
  return {
    id: `enemy-${Math.random().toString(36).substr(2, 9)}`,
    type: EnemyType.PEASANT,
    name: 'Test Peasant',
    position: createMockPosition({ x: 20 }),
    stats: {
      hp: 50,
      maxHp: 50,
      attack: 10,
      defense: 5,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    statusEffects: [],
    aiProfile: {
      aggression: 0.5,
      targetPriority: TargetPriority.CLOSEST,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: false,
    },
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    abilities: [],
    isDead: false,
    ...overrides,
  };
}

/**
 * Creates a mock Zombie (farm zombie, not combat unit)
 */
export function createMockZombie(overrides?: Partial<Zombie>): Zombie {
  return {
    id: `zombie-${Math.random().toString(36).substr(2, 9)}` as ZombieId,
    name: 'Test Zombie',
    type: 'shambler' as any,
    quality: 'common' as any,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    stats: {
      hp: 100,
      maxHp: 100,
      attack: 15,
      defense: 10,
      speed: 1.0,
    },
    happiness: 75,
    lastFed: Date.now(),
    harvestedAt: Date.now(),
    decayMultiplier: 1.0,
    mutations: [],
    abilities: [],
    isInCrypt: false,
    position: createMockPosition(),
    ...overrides,
  } as Zombie;
}

/**
 * Creates a mock Location (raid target)
 */
export function createMockLocation(overrides?: Partial<Location>): Location {
  return {
    id: `location-${Math.random().toString(36).substr(2, 9)}` as LocationId,
    name: 'Test Village',
    description: 'A small test village',
    type: LocationType.VILLAGE,
    regionId: 'test-region',
    difficulty: 3,
    recommendedLevel: 5,
    mapPosition: createMockPosition({ x: 100, y: 100 }),
    isUnlocked: true,
    isConquered: false,
    enemies: [
      { type: EnemyType.PEASANT, count: 3, wave: 1 },
      { type: EnemyType.MILITIA, count: 2, wave: 1 },
    ],
    fortifications: [],
    waves: 1,
    firstTimeRewards: {
      currencies: {},
      resources: {},
      items: [],
    },
    repeatRewards: {
      currencies: {},
      resources: {},
      items: [],
    },
    unlocks: [],
    raidCooldown: 24,
    nextRaidAvailable: null,
    prerequisites: {},
    lore: 'Test location for combat',
    ...overrides,
  };
}

/**
 * Creates a mock squad of zombies
 */
export function createMockSquad(
  zombies?: Partial<CombatUnit>[]
): ReadonlyArray<CombatUnit> {
  if (!zombies || zombies.length === 0) {
    // Default squad: 1 Brute, 2 Shamblers
    return [
      createMockCombatUnit({
        id: 'zombie-1',
        type: 'brute',
        name: 'Brute',
        position: createMockPosition({ x: 0, y: 0 }),
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
      }),
      createMockCombatUnit({
        id: 'zombie-2',
        type: 'shambler',
        name: 'Shambler 1',
        position: createMockPosition({ x: 1, y: 0 }),
      }),
      createMockCombatUnit({
        id: 'zombie-3',
        type: 'shambler',
        name: 'Shambler 2',
        position: createMockPosition({ x: 2, y: 0 }),
      }),
    ];
  }

  return zombies.map((z) => createMockCombatUnit(z));
}

/**
 * Creates a mock enemy wave
 */
export function createMockEnemyWave(
  enemies?: Partial<Enemy>[]
): ReadonlyArray<Enemy> {
  if (!enemies || enemies.length === 0) {
    // Default wave: 2 Peasants, 1 Archer
    return [
      createMockEnemy({
        id: 'enemy-1',
        type: EnemyType.PEASANT,
        name: 'Peasant 1',
        position: createMockPosition({ x: 20, y: 0 }),
      }),
      createMockEnemy({
        id: 'enemy-2',
        type: EnemyType.PEASANT,
        name: 'Peasant 2',
        position: createMockPosition({ x: 21, y: 0 }),
      }),
      createMockEnemy({
        id: 'enemy-3',
        type: EnemyType.ARCHER,
        name: 'Archer',
        position: createMockPosition({ x: 22, y: 1 }),
        stats: {
          hp: 40,
          maxHp: 40,
          attack: 15,
          defense: 3,
          speed: 1.0,
          range: 5,
          attackCooldown: 2.0,
          resistances: {},
        },
        aiProfile: {
          aggression: 0.7,
          targetPriority: TargetPriority.LOWEST_ARMOR,
          preferredRange: 5,
          canRetreat: true,
          useAbilities: false,
        },
      }),
    ];
  }

  return enemies.map((e) => createMockEnemy(e));
}

/**
 * Creates a complete mock battle state
 */
export function createMockBattle(
  overrides?: Partial<CombatState>
): CombatState {
  const defaultSquad = createMockSquad();
  const defaultEnemies = createMockEnemyWave();

  return {
    battleId: `battle-${Math.random().toString(36).substr(2, 9)}` as BattleId,
    locationId: 'test-location' as LocationId,
    phase: BattlePhase.ACTIVE,
    playerSquad: defaultSquad,
    enemies: defaultEnemies,
    obstacles: [],
    currentWave: 1,
    totalWaves: 1,
    battleDuration: 0,
    activeEffects: [],
    battleLog: [],
    startedAt: Date.now(),
    isRetreating: false,
    retreatCountdown: 0,
    ...overrides,
  };
}

// ============================================================================
// BATTLE SIMULATION
// ============================================================================

/**
 * Simulates a single battle tick (frame update)
 *
 * This is a simplified simulation for testing - actual combat logic
 * will be more complex. This helper focuses on time progression and
 * basic state updates.
 */
export function simulateBattleTick(
  battle: CombatState,
  deltaTime: number
): CombatState {
  // Update battle duration
  const newDuration = battle.battleDuration + deltaTime;

  // Update retreat countdown if retreating
  let newRetreatCountdown = battle.retreatCountdown;
  if (battle.isRetreating) {
    newRetreatCountdown = Math.max(0, battle.retreatCountdown - deltaTime);
  }

  // Process active status effects (reduce duration)
  const updatedEffects = battle.activeEffects
    .map((effect) => ({
      ...effect,
      duration: effect.duration - deltaTime,
    }))
    .filter((effect) => effect.duration > 0);

  // Check victory/defeat conditions
  const aliveZombies = battle.playerSquad.filter((z) => !z.isDead);
  const aliveEnemies = battle.enemies.filter((e) => !e.isDead);

  let newPhase = battle.phase;
  if (battle.phase === BattlePhase.ACTIVE) {
    if (aliveZombies.length === 0) {
      newPhase = BattlePhase.DEFEAT;
    } else if (aliveEnemies.length === 0) {
      newPhase = BattlePhase.VICTORY;
    } else if (battle.isRetreating && newRetreatCountdown === 0) {
      newPhase = BattlePhase.DEFEAT; // Retreat complete = defeat
    }
  }

  return {
    ...battle,
    battleDuration: newDuration,
    phase: newPhase,
    retreatCountdown: newRetreatCountdown,
    activeEffects: updatedEffects,
  };
}

/**
 * Simulates multiple battle ticks
 */
export function simulateBattleTicks(
  battle: CombatState,
  deltaTime: number,
  tickCount: number
): CombatState {
  let currentBattle = battle;
  for (let i = 0; i < tickCount; i++) {
    currentBattle = simulateBattleTick(currentBattle, deltaTime);
  }
  return currentBattle;
}

/**
 * Kills a unit in battle (sets HP to 0, isDead to true)
 */
export function killUnit(
  battle: CombatState,
  unitId: string
): CombatState {
  const updatedSquad = battle.playerSquad.map((unit) =>
    unit.id === unitId
      ? {
          ...unit,
          stats: { ...unit.stats, hp: 0 },
          isDead: true,
          aiState: UnitAIState.DEAD,
        }
      : unit
  );

  const updatedEnemies = battle.enemies.map((enemy) =>
    enemy.id === unitId
      ? {
          ...enemy,
          stats: { ...enemy.stats, hp: 0 },
          isDead: true,
          aiState: UnitAIState.DEAD,
        }
      : enemy
  );

  return {
    ...battle,
    playerSquad: updatedSquad,
    enemies: updatedEnemies,
  };
}

/**
 * Damages a unit in battle
 */
export function damageUnit(
  battle: CombatState,
  unitId: string,
  damage: number
): CombatState {
  const updatedSquad = battle.playerSquad.map((unit) => {
    if (unit.id === unitId) {
      const newHp = Math.max(0, unit.stats.hp - damage);
      return {
        ...unit,
        stats: { ...unit.stats, hp: newHp },
        isDead: newHp === 0,
        aiState: newHp === 0 ? UnitAIState.DEAD : unit.aiState,
      };
    }
    return unit;
  });

  const updatedEnemies = battle.enemies.map((enemy) => {
    if (enemy.id === unitId) {
      const newHp = Math.max(0, enemy.stats.hp - damage);
      return {
        ...enemy,
        stats: { ...enemy.stats, hp: newHp },
        isDead: newHp === 0,
        aiState: newHp === 0 ? UnitAIState.DEAD : enemy.aiState,
      };
    }
    return enemy;
  });

  return {
    ...battle,
    playerSquad: updatedSquad,
    enemies: updatedEnemies,
  };
}

/**
 * Heals a unit in battle
 */
export function healUnit(
  battle: CombatState,
  unitId: string,
  healAmount: number
): CombatState {
  const updatedSquad = battle.playerSquad.map((unit) => {
    if (unit.id === unitId) {
      const newHp = Math.min(unit.stats.maxHp, unit.stats.hp + healAmount);
      return {
        ...unit,
        stats: { ...unit.stats, hp: newHp },
      };
    }
    return unit;
  });

  const updatedEnemies = battle.enemies.map((enemy) => {
    if (enemy.id === unitId) {
      const newHp = Math.min(enemy.stats.maxHp, enemy.stats.hp + healAmount);
      return {
        ...enemy,
        stats: { ...enemy.stats, hp: newHp },
      };
    }
    return enemy;
  });

  return {
    ...battle,
    playerSquad: updatedSquad,
    enemies: updatedEnemies,
  };
}

/**
 * Initiates retreat
 */
export function initiateRetreat(battle: CombatState): CombatState {
  return {
    ...battle,
    isRetreating: true,
    retreatCountdown: gameConfig.COMBAT.RETREAT_COUNTDOWN_SECONDS,
  };
}

/**
 * Finds a unit by ID in battle
 */
export function findUnit(
  battle: CombatState,
  unitId: string
): CombatUnit | Enemy | null {
  const zombie = battle.playerSquad.find((z) => z.id === unitId);
  if (zombie) return zombie;

  const enemy = battle.enemies.find((e) => e.id === unitId);
  if (enemy) return enemy;

  return null;
}

/**
 * Gets all alive units
 */
export function getAliveUnits(battle: CombatState): {
  zombies: ReadonlyArray<CombatUnit>;
  enemies: ReadonlyArray<Enemy>;
} {
  return {
    zombies: battle.playerSquad.filter((z) => !z.isDead),
    enemies: battle.enemies.filter((e) => !e.isDead),
  };
}

/**
 * Calculates distance between two positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a unit is in range of another
 */
export function isInRange(
  attacker: CombatUnit | Enemy,
  target: CombatUnit | Enemy
): boolean {
  const distance = calculateDistance(attacker.position, target.position);
  return distance <= attacker.stats.range;
}
