/**
 * Game State Factory Tests
 *
 * Comprehensive tests for gameStateFactory functions.
 * Validates that factories create valid GameState objects with correct defaults and overrides.
 */

import {
  createTestGameState,
  createFarmModeGameState,
  createCombatModeGameState,
  createWorldModeGameState,
  createNewPlayerGameState,
  createAdvancedPlayerGameState,
  createNighttimeGameState,
  createGameStateWithWeather,
  createGameStateWithSeason,
} from './gameStateFactory';
import { GameMode, Season, Weather } from '../../../types';

describe('gameStateFactory', () => {
  describe('createTestGameState', () => {
    it('creates a valid GameState with defaults', () => {
      const gameState = createTestGameState();

      expect(gameState).toBeDefined();
      expect(gameState.mode).toBe(GameMode.FARM);
      expect(gameState.version).toBe('1.0.0');
    });

    it('creates GameState with default player', () => {
      const gameState = createTestGameState();

      expect(gameState.player).toBeDefined();
      expect(gameState.player.id).toBe('test-player-1');
      expect(gameState.player.name).toBe('Test Necromancer');
      expect(gameState.player.level).toBe(1);
      expect(gameState.player.xp).toBe(0);
    });

    it('creates GameState with default time state', () => {
      const gameState = createTestGameState();

      expect(gameState.time).toBeDefined();
      expect(gameState.time.currentTime).toBeGreaterThan(0);
      expect(gameState.time.dayNightCycle.currentPhase).toBe('day');
      expect(gameState.time.dayNightCycle.cycleDuration).toBe(30 * 60 * 1000);
    });

    it('creates GameState with default inventory', () => {
      const gameState = createTestGameState();

      expect(gameState.inventory).toBeDefined();
      expect(gameState.inventory.currencies.DARK_COINS).toBe(100);
      expect(gameState.inventory.currencies.SOUL_ESSENCE).toBe(0);
    });

    it('creates GameState with default farm state', () => {
      const gameState = createTestGameState();

      expect(gameState.farm).toBeDefined();
      expect(gameState.farm.plots).toEqual([]);
      expect(gameState.farm.activeZombies).toEqual([]);
      expect(gameState.farm.cryptZombies).toEqual([]);
      expect(gameState.farm.farmLevel).toBe(1);
    });

    it('creates GameState with default combat state', () => {
      const gameState = createTestGameState();

      expect(gameState.combat).toBeDefined();
      expect(gameState.combat.isInBattle).toBe(false);
      expect(gameState.combat.currentBattle).toBeNull();
      expect(gameState.combat.battleHistory).toEqual([]);
    });

    it('creates GameState with default world state', () => {
      const gameState = createTestGameState();

      expect(gameState.world).toBeDefined();
      expect(gameState.world.unlockedRegions).toContain('starting_region');
      expect(gameState.world.unlockedLocations).toContain('village_1');
      expect(gameState.world.currentRegion).toBe('starting_region');
    });

    it('creates GameState with default UI state', () => {
      const gameState = createTestGameState();

      expect(gameState.ui).toBeDefined();
      expect(gameState.ui.activeModal).toBeNull();
      expect(gameState.ui.notifications).toEqual([]);
      expect(gameState.ui.hudVisible).toBe(true);
    });

    it('creates GameState with save metadata', () => {
      const gameState = createTestGameState();

      expect(gameState.save).toBeDefined();
      expect(gameState.save.version).toBe('1.0.0');
      expect(gameState.save.saveCount).toBe(5);
      expect(gameState.save.createdAt).toBeGreaterThan(0);
    });

    it('creates GameState with default season and weather', () => {
      const gameState = createTestGameState();

      expect(gameState.season).toBe(Season.AUTUMN);
      expect(gameState.weather).toBe(Weather.CLEAR);
    });

    it('allows overriding mode', () => {
      const gameState = createTestGameState({ mode: GameMode.COMBAT });

      expect(gameState.mode).toBe(GameMode.COMBAT);
    });

    it('allows overriding player properties', () => {
      const gameState = createTestGameState({
        player: { level: 10, xp: 5000 } as any,
      });

      expect(gameState.player.level).toBe(10);
      expect(gameState.player.xp).toBe(5000);
      expect(gameState.player.name).toBe('Test Necromancer'); // Other props preserved
    });

    it('allows overriding inventory', () => {
      const gameState = createTestGameState({
        inventory: {
          currencies: { DARK_COINS: 500, SOUL_ESSENCE: 10 },
        } as any,
      });

      expect(gameState.inventory.currencies.DARK_COINS).toBe(500);
      expect(gameState.inventory.currencies.SOUL_ESSENCE).toBe(10);
    });

    it('allows overriding season', () => {
      const gameState = createTestGameState({ season: Season.WINTER });

      expect(gameState.season).toBe(Season.WINTER);
    });

    it('allows overriding weather', () => {
      const gameState = createTestGameState({ weather: Weather.BLOOD_RAIN });

      expect(gameState.weather).toBe(Weather.BLOOD_RAIN);
    });

    it('allows overriding multiple properties at once', () => {
      const gameState = createTestGameState({
        mode: GameMode.WORLD,
        season: Season.SPRING,
        weather: Weather.FOG,
        player: { level: 15 } as any,
      });

      expect(gameState.mode).toBe(GameMode.WORLD);
      expect(gameState.season).toBe(Season.SPRING);
      expect(gameState.weather).toBe(Weather.FOG);
      expect(gameState.player.level).toBe(15);
    });
  });

  describe('createFarmModeGameState', () => {
    it('creates GameState in FARM mode', () => {
      const gameState = createFarmModeGameState();

      expect(gameState.mode).toBe(GameMode.FARM);
    });

    it('allows overriding other properties while preserving FARM mode', () => {
      const gameState = createFarmModeGameState({
        player: { level: 5 } as any,
      });

      expect(gameState.mode).toBe(GameMode.FARM);
      expect(gameState.player.level).toBe(5);
    });
  });

  describe('createCombatModeGameState', () => {
    it('creates GameState in COMBAT mode', () => {
      const gameState = createCombatModeGameState();

      expect(gameState.mode).toBe(GameMode.COMBAT);
    });

    it('sets isInBattle to true', () => {
      const gameState = createCombatModeGameState();

      expect(gameState.combat.isInBattle).toBe(true);
    });

    it('allows overriding combat state', () => {
      const gameState = createCombatModeGameState({
        combat: {
          isInBattle: true,
          currentBattle: { id: 'battle-1' } as any,
        } as any,
      });

      expect(gameState.combat.currentBattle).toBeDefined();
      expect(gameState.combat.currentBattle?.id).toBe('battle-1');
    });
  });

  describe('createWorldModeGameState', () => {
    it('creates GameState in WORLD mode', () => {
      const gameState = createWorldModeGameState();

      expect(gameState.mode).toBe(GameMode.WORLD);
    });

    it('preserves default world state', () => {
      const gameState = createWorldModeGameState();

      expect(gameState.world.currentRegion).toBe('starting_region');
    });
  });

  describe('createNewPlayerGameState', () => {
    it('creates GameState for a new player', () => {
      const gameState = createNewPlayerGameState();

      expect(gameState.player.level).toBe(1);
      expect(gameState.player.xp).toBe(0);
    });

    it('gives new player starting resources', () => {
      const gameState = createNewPlayerGameState();

      expect(gameState.inventory.currencies.DARK_COINS).toBe(50);
      expect(gameState.inventory.seeds.SHAMBLER_SEED).toBe(3);
    });

    it('gives new player only shambler seed unlocked', () => {
      const gameState = createNewPlayerGameState();

      expect(gameState.player.unlockedContent).toContain('shambler_seed');
      expect(gameState.player.unlockedContent).toHaveLength(1);
    });

    it('sets totalPlayTime to 0 for new player', () => {
      const gameState = createNewPlayerGameState();

      expect(gameState.time.totalPlayTime).toBe(0);
    });

    it('initializes all player stats to 0', () => {
      const gameState = createNewPlayerGameState();

      expect(gameState.player.stats.totalZombiesHarvested).toBe(0);
      expect(gameState.player.stats.totalBattlesWon).toBe(0);
      expect(gameState.player.stats.totalBattlesLost).toBe(0);
      expect(gameState.player.stats.totalDarkCoinsEarned).toBe(0);
    });
  });

  describe('createAdvancedPlayerGameState', () => {
    it('creates GameState for an advanced player', () => {
      const gameState = createAdvancedPlayerGameState();

      expect(gameState.player.level).toBe(25);
      expect(gameState.player.xp).toBe(50000);
    });

    it('gives advanced player significant resources', () => {
      const gameState = createAdvancedPlayerGameState();

      expect(gameState.inventory.currencies.DARK_COINS).toBe(10000);
      expect(gameState.inventory.currencies.SOUL_ESSENCE).toBe(50);
    });

    it('gives advanced player multiple seed types', () => {
      const gameState = createAdvancedPlayerGameState();

      expect(gameState.inventory.seeds.SHAMBLER_SEED).toBe(10);
      expect(gameState.inventory.seeds.RUNNER_SEED).toBe(10);
      expect(gameState.inventory.seeds.BRUTE_SEED).toBe(5);
      expect(gameState.inventory.seeds.LICH_SEED).toBe(2);
    });

    it('unlocks advanced content for advanced player', () => {
      const gameState = createAdvancedPlayerGameState();

      expect(gameState.player.unlockedContent).toContain('lich_seed');
      expect(gameState.player.unlockedContent).toContain('bone_knight_seed');
      expect(gameState.player.unlockedContent).toContain('necromancer_level_8');
    });

    it('has significant play stats for advanced player', () => {
      const gameState = createAdvancedPlayerGameState();

      expect(gameState.player.stats.totalZombiesHarvested).toBe(500);
      expect(gameState.player.stats.totalBattlesWon).toBe(100);
      expect(gameState.player.stats.totalDarkCoinsEarned).toBe(50000);
    });
  });

  describe('createNighttimeGameState', () => {
    it('creates GameState during nighttime', () => {
      const gameState = createNighttimeGameState();

      expect(gameState.time.dayNightCycle.currentPhase).toBe('night');
    });

    it('preserves day/night cycle configuration', () => {
      const gameState = createNighttimeGameState();

      expect(gameState.time.dayNightCycle.cycleDuration).toBe(30 * 60 * 1000);
      expect(gameState.time.dayNightCycle.dayDuration).toBe(20 * 60 * 1000);
      expect(gameState.time.dayNightCycle.nightDuration).toBe(10 * 60 * 1000);
    });

    it('allows overriding other time properties', () => {
      const gameState = createNighttimeGameState({
        time: { totalPlayTime: 50000 } as any,
      });

      expect(gameState.time.dayNightCycle.currentPhase).toBe('night');
      expect(gameState.time.totalPlayTime).toBe(50000);
    });
  });

  describe('createGameStateWithWeather', () => {
    it('creates GameState with CLEAR weather', () => {
      const gameState = createGameStateWithWeather(Weather.CLEAR);

      expect(gameState.weather).toBe(Weather.CLEAR);
    });

    it('creates GameState with BLOOD_RAIN weather', () => {
      const gameState = createGameStateWithWeather(Weather.BLOOD_RAIN);

      expect(gameState.weather).toBe(Weather.BLOOD_RAIN);
    });

    it('creates GameState with FOG weather', () => {
      const gameState = createGameStateWithWeather(Weather.FOG);

      expect(gameState.weather).toBe(Weather.FOG);
    });

    it('creates GameState with BRIGHT_SUNLIGHT weather', () => {
      const gameState = createGameStateWithWeather(Weather.BRIGHT_SUNLIGHT);

      expect(gameState.weather).toBe(Weather.BRIGHT_SUNLIGHT);
    });
  });

  describe('createGameStateWithSeason', () => {
    it('creates GameState with SPRING season', () => {
      const gameState = createGameStateWithSeason(Season.SPRING);

      expect(gameState.season).toBe(Season.SPRING);
    });

    it('creates GameState with SUMMER season', () => {
      const gameState = createGameStateWithSeason(Season.SUMMER);

      expect(gameState.season).toBe(Season.SUMMER);
    });

    it('creates GameState with AUTUMN season', () => {
      const gameState = createGameStateWithSeason(Season.AUTUMN);

      expect(gameState.season).toBe(Season.AUTUMN);
    });

    it('creates GameState with WINTER season', () => {
      const gameState = createGameStateWithSeason(Season.WINTER);

      expect(gameState.season).toBe(Season.WINTER);
    });
  });
});
