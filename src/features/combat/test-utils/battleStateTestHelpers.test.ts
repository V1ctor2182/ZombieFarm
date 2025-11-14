/**
 * Battle State Test Helpers - Tests
 *
 * Comprehensive tests for battle state utilities.
 * Validates battle state creation, time progression, and result generation.
 */

import {
  createTestBattleState,
  createPreparationBattle,
  createActiveBattle,
  createVictoryBattle,
  createDefeatBattle,
  createRetreatBattle,
  advanceBattleTime,
  setBattleDuration,
  triggerWaveCompletion,
  createMultiWaveBattle,
  isOnFinalWave,
  getWaveProgress,
  generateBattleResult,
  generateFlawlessVictory,
  generateDefeatResult,
  isBattleOver,
  isBattleActive,
  getBattleWinner,
  getCasualtyRate,
  getSurvivalRate,
  getRemainingEnemyCount,
  getRemainingZombieCount,
  canRetreat,
  getBattleIntensity,
} from './battleStateTestHelpers';
import { BattlePhase } from '../../../types/combat';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

describe('battleStateTestHelpers', () => {
  // ========== BATTLE STATE FACTORIES ==========

  describe('createTestBattleState', () => {
    it('creates default battle state', () => {
      const battle = createTestBattleState();

      expect(battle.battleId).toBeDefined();
      expect(battle.playerSquad).toHaveLength(3);
      expect(battle.enemies).toHaveLength(3);
    });

    it('applies overrides', () => {
      const battle = createTestBattleState({
        currentWave: 2,
        totalWaves: 5,
      });

      expect(battle.currentWave).toBe(2);
      expect(battle.totalWaves).toBe(5);
    });
  });

  describe('createPreparationBattle', () => {
    it('creates battle in preparation phase', () => {
      const battle = createPreparationBattle();

      expect(battle.phase).toBe(BattlePhase.PREPARATION);
      expect(battle.battleDuration).toBe(0);
    });
  });

  describe('createActiveBattle', () => {
    it('creates battle in active phase', () => {
      const battle = createActiveBattle();

      expect(battle.phase).toBe(BattlePhase.ACTIVE);
      expect(battle.battleDuration).toBeGreaterThan(0);
    });
  });

  describe('createVictoryBattle', () => {
    it('creates victorious battle', () => {
      const battle = createVictoryBattle();

      expect(battle.phase).toBe(BattlePhase.VICTORY);
      expect(battle.enemies.every((e) => e.isDead)).toBe(true);
    });

    it('has surviving zombies', () => {
      const battle = createVictoryBattle();

      const survivors = battle.playerSquad.filter((z) => !z.isDead);
      expect(survivors.length).toBeGreaterThan(0);
    });
  });

  describe('createDefeatBattle', () => {
    it('creates defeat battle', () => {
      const battle = createDefeatBattle();

      expect(battle.phase).toBe(BattlePhase.DEFEAT);
      expect(battle.playerSquad.every((z) => z.isDead)).toBe(true);
    });
  });

  describe('createRetreatBattle', () => {
    it('creates retreat battle', () => {
      const battle = createRetreatBattle();

      expect(battle.phase).toBe(BattlePhase.RETREAT);
      expect(battle.isRetreating).toBe(true);
      expect(battle.retreatCountdown).toBe(
        gameConfig.COMBAT.RETREAT_COUNTDOWN_SECONDS
      );
    });
  });

  // ========== BATTLE TIME PROGRESSION ==========

  describe('advanceBattleTime', () => {
    it('advances battle time', () => {
      const battle = createActiveBattle();
      const initialDuration = battle.battleDuration;

      const updated = advanceBattleTime(battle, 5);

      expect(updated.battleDuration).toBe(initialDuration + 5);
    });

    it('accumulates time correctly', () => {
      let battle = createActiveBattle();
      battle = advanceBattleTime(battle, 3);
      battle = advanceBattleTime(battle, 7);

      expect(battle.battleDuration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('setBattleDuration', () => {
    it('sets specific duration', () => {
      const battle = createActiveBattle();
      const updated = setBattleDuration(battle, 42);

      expect(updated.battleDuration).toBe(42);
    });
  });

  // ========== WAVE MANAGEMENT ==========

  describe('triggerWaveCompletion', () => {
    it('advances to next wave', () => {
      const battle = createMultiWaveBattle(3);
      const updated = triggerWaveCompletion(battle);

      expect(updated.currentWave).toBe(2);
    });

    it('does not exceed total waves', () => {
      const battle = createMultiWaveBattle(3);
      const finalWave = setBattleDuration(
        { ...battle, currentWave: 3 },
        100
      );
      const updated = triggerWaveCompletion(finalWave);

      expect(updated.currentWave).toBe(3); // Stays at final wave
    });
  });

  describe('createMultiWaveBattle', () => {
    it('creates battle with multiple waves', () => {
      const battle = createMultiWaveBattle(5);

      expect(battle.currentWave).toBe(1);
      expect(battle.totalWaves).toBe(5);
    });
  });

  describe('isOnFinalWave', () => {
    it('returns true on final wave', () => {
      const battle = createMultiWaveBattle(3);
      const finalWave = { ...battle, currentWave: 3 };

      expect(isOnFinalWave(finalWave)).toBe(true);
    });

    it('returns false on earlier waves', () => {
      const battle = createMultiWaveBattle(3);

      expect(isOnFinalWave(battle)).toBe(false);
    });
  });

  describe('getWaveProgress', () => {
    it('calculates wave progress', () => {
      const battle = createMultiWaveBattle(4);

      expect(getWaveProgress(battle)).toBe(25); // Wave 1 of 4
    });

    it('returns 100 on final wave', () => {
      const battle = createMultiWaveBattle(2);
      const finalWave = { ...battle, currentWave: 2 };

      expect(getWaveProgress(finalWave)).toBe(100);
    });
  });

  // ========== BATTLE RESULT GENERATION ==========

  describe('generateBattleResult', () => {
    it('generates victory result', () => {
      const battle = createVictoryBattle();
      const result = generateBattleResult(battle);

      expect(result.victory).toBe(true);
      expect(result.survivors.length).toBeGreaterThan(0);
      expect(result.casualties.length).toBe(0);
    });

    it('includes rewards', () => {
      const battle = createVictoryBattle();
      const result = generateBattleResult(battle, {
        darkCoinsReward: 200,
      });

      expect(result.rewards.currencies.darkCoins).toBe(200);
    });

    it('awards XP to survivors', () => {
      const battle = createVictoryBattle();
      const result = generateBattleResult(battle, { xpPerZombie: 75 });

      result.survivors.forEach((zombieId) => {
        expect(result.xpGained[zombieId]).toBe(75);
      });
    });

    it('includes battle stats', () => {
      const battle = createVictoryBattle();
      const result = generateBattleResult(battle);

      expect(result.stats).toBeDefined();
      expect(result.stats.duration).toBe(battle.battleDuration);
      expect(result.stats.enemiesKilled).toBeGreaterThan(0);
    });
  });

  describe('generateFlawlessVictory', () => {
    it('generates flawless victory', () => {
      const battle = createVictoryBattle();
      const result = generateFlawlessVictory(battle);

      expect(result.victory).toBe(true);
      expect(result.stats.flawless).toBe(true);
      expect(result.casualties).toHaveLength(0);
    });

    it('awards bonus rewards', () => {
      const battle = createVictoryBattle();
      const result = generateFlawlessVictory(battle);

      expect(result.rewards.currencies.darkCoins).toBeGreaterThan(100);
    });
  });

  describe('generateDefeatResult', () => {
    it('generates defeat result', () => {
      const battle = createDefeatBattle();
      const result = generateDefeatResult(battle);

      expect(result.victory).toBe(false);
      expect(result.casualties.length).toBeGreaterThan(0);
    });

    it('provides minimal rewards', () => {
      const battle = createDefeatBattle();
      const result = generateDefeatResult(battle);

      expect(
        result.rewards.currencies.darkCoins ?? 0
      ).toBeLessThanOrEqual(0);
    });
  });

  // ========== BATTLE STATE QUERIES ==========

  describe('isBattleOver', () => {
    it('returns true for victory', () => {
      const battle = createVictoryBattle();

      expect(isBattleOver(battle)).toBe(true);
    });

    it('returns true for defeat', () => {
      const battle = createDefeatBattle();

      expect(isBattleOver(battle)).toBe(true);
    });

    it('returns false for active battle', () => {
      const battle = createActiveBattle();

      expect(isBattleOver(battle)).toBe(false);
    });
  });

  describe('isBattleActive', () => {
    it('returns true for active battle', () => {
      const battle = createActiveBattle();

      expect(isBattleActive(battle)).toBe(true);
    });

    it('returns false for finished battle', () => {
      const battle = createVictoryBattle();

      expect(isBattleActive(battle)).toBe(false);
    });
  });

  describe('getBattleWinner', () => {
    it('returns player for victory', () => {
      const battle = createVictoryBattle();

      expect(getBattleWinner(battle)).toBe('player');
    });

    it('returns enemy for defeat', () => {
      const battle = createDefeatBattle();

      expect(getBattleWinner(battle)).toBe('enemy');
    });

    it('returns none for active battle', () => {
      const battle = createActiveBattle();

      expect(getBattleWinner(battle)).toBe('none');
    });
  });

  describe('getCasualtyRate', () => {
    it('calculates casualty rate', () => {
      const battle = createDefeatBattle();
      const rate = getCasualtyRate(battle);

      expect(rate).toBe(100);
    });

    it('returns 0 for no casualties', () => {
      const battle = createVictoryBattle();
      const rate = getCasualtyRate(battle);

      expect(rate).toBe(0);
    });
  });

  describe('getSurvivalRate', () => {
    it('calculates survival rate', () => {
      const battle = createVictoryBattle();
      const rate = getSurvivalRate(battle);

      expect(rate).toBe(100);
    });

    it('returns 0 for total loss', () => {
      const battle = createDefeatBattle();
      const rate = getSurvivalRate(battle);

      expect(rate).toBe(0);
    });
  });

  describe('getRemainingEnemyCount', () => {
    it('counts alive enemies', () => {
      const battle = createActiveBattle();
      const count = getRemainingEnemyCount(battle);

      expect(count).toBe(3);
    });

    it('returns 0 after victory', () => {
      const battle = createVictoryBattle();
      const count = getRemainingEnemyCount(battle);

      expect(count).toBe(0);
    });
  });

  describe('getRemainingZombieCount', () => {
    it('counts alive zombies', () => {
      const battle = createActiveBattle();
      const count = getRemainingZombieCount(battle);

      expect(count).toBe(3);
    });

    it('returns 0 after defeat', () => {
      const battle = createDefeatBattle();
      const count = getRemainingZombieCount(battle);

      expect(count).toBe(0);
    });
  });

  describe('canRetreat', () => {
    it('returns true for active battle with survivors', () => {
      const battle = createActiveBattle();

      expect(canRetreat(battle)).toBe(true);
    });

    it('returns false if already retreating', () => {
      const battle = createRetreatBattle();

      expect(canRetreat(battle)).toBe(false);
    });

    it('returns false if battle is over', () => {
      const battle = createVictoryBattle();

      expect(canRetreat(battle)).toBe(false);
    });
  });

  describe('getBattleIntensity', () => {
    it('calculates battle intensity', () => {
      const battle = createActiveBattle();
      const intensity = getBattleIntensity(battle);

      expect(intensity).toBeGreaterThanOrEqual(0);
    });

    it('returns 0 for zero duration', () => {
      const battle = createTestBattleState({
        battleDuration: 0,
      });
      const intensity = getBattleIntensity(battle);

      expect(intensity).toBe(0);
    });
  });
});
