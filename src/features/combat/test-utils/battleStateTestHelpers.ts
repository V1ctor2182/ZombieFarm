/**
 * Battle State Test Helpers
 *
 * Utilities for creating and manipulating battle state for testing.
 * Handles battle phases, time progression, wave management, and state transitions.
 *
 * Based on DOMAIN-COMBAT.md battle flow rules.
 * Per TESTING.md standards.
 */

import {
  type CombatState,
  BattlePhase,
  type BattleResult,
  type BattleStats,
} from '../../../types/combat';
import type { ZombieId } from '../../../types/global';
import { createMockBattle, getAliveUnits } from './combatTestHelpers';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

// ============================================================================
// BATTLE STATE FACTORIES
// ============================================================================

/**
 * Creates a test battle state with specific configuration
 */
export function createTestBattleState(
  overrides?: Partial<CombatState>
): CombatState {
  return createMockBattle(overrides);
}

/**
 * Creates a battle in preparation phase
 */
export function createPreparationBattle(): CombatState {
  return createMockBattle({
    phase: BattlePhase.PREPARATION,
    battleDuration: 0,
  });
}

/**
 * Creates a battle in active phase
 */
export function createActiveBattle(): CombatState {
  return createMockBattle({
    phase: BattlePhase.ACTIVE,
    battleDuration: 10,
  });
}

/**
 * Creates a victorious battle state
 */
export function createVictoryBattle(): CombatState {
  const battle = createMockBattle({
    phase: BattlePhase.VICTORY,
  });

  // Kill all enemies
  const deadEnemies = battle.enemies.map((e) => ({
    ...e,
    stats: { ...e.stats, hp: 0 },
    isDead: true,
    aiState: 'dead' as any,
  }));

  return {
    ...battle,
    enemies: deadEnemies,
  };
}

/**
 * Creates a defeat battle state
 */
export function createDefeatBattle(): CombatState {
  const battle = createMockBattle({
    phase: BattlePhase.DEFEAT,
  });

  // Kill all zombies
  const deadZombies = battle.playerSquad.map((z) => ({
    ...z,
    stats: { ...z.stats, hp: 0 },
    isDead: true,
    aiState: 'dead' as any,
  }));

  return {
    ...battle,
    playerSquad: deadZombies,
  };
}

/**
 * Creates a retreat battle state
 */
export function createRetreatBattle(): CombatState {
  return createMockBattle({
    phase: BattlePhase.RETREAT,
    isRetreating: true,
    retreatCountdown: gameConfig.COMBAT.RETREAT_COUNTDOWN_SECONDS,
  });
}

// ============================================================================
// BATTLE TIME PROGRESSION
// ============================================================================

/**
 * Advances battle time by specified seconds
 */
export function advanceBattleTime(
  battle: CombatState,
  seconds: number
): CombatState {
  return {
    ...battle,
    battleDuration: battle.battleDuration + seconds,
  };
}

/**
 * Sets battle to a specific duration
 */
export function setBattleDuration(
  battle: CombatState,
  duration: number
): CombatState {
  return {
    ...battle,
    battleDuration: duration,
  };
}

// ============================================================================
// WAVE MANAGEMENT
// ============================================================================

/**
 * Triggers wave completion
 */
export function triggerWaveCompletion(battle: CombatState): CombatState {
  const newWaveNumber = battle.currentWave + 1;

  // If this was the last wave, trigger victory check
  if (newWaveNumber > battle.totalWaves) {
    return battle; // No more waves
  }

  return {
    ...battle,
    currentWave: newWaveNumber,
  };
}

/**
 * Creates a multi-wave battle
 */
export function createMultiWaveBattle(waveCount: number): CombatState {
  return createMockBattle({
    currentWave: 1,
    totalWaves: waveCount,
  });
}

/**
 * Checks if battle is on final wave
 */
export function isOnFinalWave(battle: CombatState): boolean {
  return battle.currentWave === battle.totalWaves;
}

/**
 * Gets wave progress percentage
 */
export function getWaveProgress(battle: CombatState): number {
  return (battle.currentWave / battle.totalWaves) * 100;
}

// ============================================================================
// BATTLE RESULT GENERATION
// ============================================================================

/**
 * Generates a battle result from final battle state
 */
export function generateBattleResult(
  battle: CombatState,
  options?: {
    darkCoinsReward?: number;
    xpPerZombie?: number;
  }
): BattleResult {
  const { darkCoinsReward = 100, xpPerZombie = 50 } = options || {};

  const { zombies: survivors } = getAliveUnits(battle);
  const casualties = battle.playerSquad
    .filter((z) => z.isDead)
    .map((z) => z.id as ZombieId);

  const xpGained: Record<ZombieId, number> = {};
  survivors.forEach((zombie) => {
    xpGained[zombie.id as ZombieId] = xpPerZombie;
  });

  const stats: BattleStats = {
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    enemiesKilled: battle.enemies.filter((e) => e.isDead).length,
    obstaclesDestroyed: battle.obstacles.filter((o) => o.isDestroyed).length,
    duration: battle.battleDuration,
    flawless: casualties.length === 0,
  };

  return {
    victory: battle.phase === BattlePhase.VICTORY,
    survivors: survivors.map((z) => z.id as ZombieId),
    casualties,
    xpGained,
    rewards: {
      currencies: {
        darkCoins: darkCoinsReward,
      },
      resources: {},
    },
    unlocks: [],
    stats,
  };
}

/**
 * Generates a flawless victory result
 */
export function generateFlawlessVictory(battle: CombatState): BattleResult {
  const result = generateBattleResult(battle, {
    darkCoinsReward: 150, // Bonus for flawless
    xpPerZombie: 100, // Bonus XP
  });

  return {
    ...result,
    stats: {
      ...result.stats,
      flawless: true,
    },
  };
}

/**
 * Generates a defeat result
 */
export function generateDefeatResult(battle: CombatState): BattleResult {
  const survivors = battle.playerSquad.filter((z) => !z.isDead);
  const casualties = battle.playerSquad
    .filter((z) => z.isDead)
    .map((z) => z.id as ZombieId);

  const xpGained: Record<ZombieId, number> = {};
  survivors.forEach((zombie) => {
    xpGained[zombie.id as ZombieId] = 10; // Minimal XP for surviving defeat
  });

  return {
    victory: false,
    survivors: survivors.map((z) => z.id as ZombieId),
    casualties,
    xpGained,
    rewards: {
      currencies: {},
      resources: {},
    },
    unlocks: [],
    stats: {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      enemiesKilled: battle.enemies.filter((e) => e.isDead).length,
      obstaclesDestroyed: 0,
      duration: battle.battleDuration,
      flawless: false,
    },
  };
}

// ============================================================================
// BATTLE STATE QUERIES
// ============================================================================

/**
 * Checks if battle is over
 */
export function isBattleOver(battle: CombatState): boolean {
  return (
    battle.phase === BattlePhase.VICTORY ||
    battle.phase === BattlePhase.DEFEAT
  );
}

/**
 * Checks if battle is active
 */
export function isBattleActive(battle: CombatState): boolean {
  return battle.phase === BattlePhase.ACTIVE;
}

/**
 * Gets battle winner
 */
export function getBattleWinner(
  battle: CombatState
): 'player' | 'enemy' | 'none' {
  if (battle.phase === BattlePhase.VICTORY) return 'player';
  if (battle.phase === BattlePhase.DEFEAT) return 'enemy';
  return 'none';
}

/**
 * Calculates casualty rate
 */
export function getCasualtyRate(battle: CombatState): number {
  const totalZombies = battle.playerSquad.length;
  const casualties = battle.playerSquad.filter((z) => z.isDead).length;
  return totalZombies > 0 ? (casualties / totalZombies) * 100 : 0;
}

/**
 * Calculates survival rate
 */
export function getSurvivalRate(battle: CombatState): number {
  return 100 - getCasualtyRate(battle);
}

/**
 * Gets remaining enemy count
 */
export function getRemainingEnemyCount(battle: CombatState): number {
  return battle.enemies.filter((e) => !e.isDead).length;
}

/**
 * Gets remaining zombie count
 */
export function getRemainingZombieCount(battle: CombatState): number {
  return battle.playerSquad.filter((z) => !z.isDead).length;
}

/**
 * Checks if player can retreat
 */
export function canRetreat(battle: CombatState): boolean {
  return (
    battle.phase === BattlePhase.ACTIVE &&
    !battle.isRetreating &&
    getRemainingZombieCount(battle) > 0
  );
}

/**
 * Calculates battle intensity (avg HP loss rate)
 */
export function getBattleIntensity(battle: CombatState): number {
  if (battle.battleDuration === 0) return 0;

  let totalHpLost = 0;
  battle.playerSquad.forEach((zombie) => {
    const hpLost = zombie.stats.maxHp - zombie.stats.hp;
    totalHpLost += hpLost;
  });

  return totalHpLost / battle.battleDuration; // HP lost per second
}
