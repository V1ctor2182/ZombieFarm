/**
 * Test Scenarios Tests
 */

import {
  TUTORIAL_START_SCENARIO,
  TUTORIAL_COMPLETE_SCENARIO,
  FIRST_BATTLE_PREP_SCENARIO,
  GROWING_FARM_SCENARIO,
  MID_GAME_SCENARIO,
  LATE_GAME_SCENARIO,
  ENDGAME_SCENARIO,
  ALL_SCENARIOS,
} from './testScenarios';
import { Currency } from '../../../types';

describe('testScenarios', () => {
  describe('TUTORIAL_START_SCENARIO', () => {
    it('is valid GameState', () => {
      expect(TUTORIAL_START_SCENARIO).toBeDefined();
    });

    it('has level 1 player', () => {
      expect(TUTORIAL_START_SCENARIO.player.level).toBe(1);
    });

    it('has starting resources', () => {
      expect(TUTORIAL_START_SCENARIO.inventory.currencies[Currency.DARK_COINS]).toBe(50);
    });
  });

  describe('TUTORIAL_COMPLETE_SCENARIO', () => {
    it('has harvested 1 zombie', () => {
      expect(TUTORIAL_COMPLETE_SCENARIO.player.stats.totalZombiesHarvested).toBe(1);
    });

    it('has resources from tutorial', () => {
      expect(TUTORIAL_COMPLETE_SCENARIO.inventory.resources).toBeDefined();
    });
  });

  describe('FIRST_BATTLE_PREP_SCENARIO', () => {
    it('player is level 2+', () => {
      expect(FIRST_BATTLE_PREP_SCENARIO.player.level).toBeGreaterThanOrEqual(2);
    });

    it('has some Dark Coins', () => {
      expect(FIRST_BATTLE_PREP_SCENARIO.inventory.currencies[Currency.DARK_COINS]).toBeGreaterThan(
        0
      );
    });
  });

  describe('GROWING_FARM_SCENARIO', () => {
    it('has multiple zombie types unlocked', () => {
      expect(Object.keys(GROWING_FARM_SCENARIO.inventory.seeds).length).toBeGreaterThan(1);
    });

    it('has won battles', () => {
      expect(GROWING_FARM_SCENARIO.player.stats.totalBattlesWon).toBeGreaterThan(0);
    });
  });

  describe('MID_GAME_SCENARIO', () => {
    it('is mid-level player', () => {
      expect(MID_GAME_SCENARIO.player.level).toBeGreaterThanOrEqual(15);
    });

    it('has significant resources', () => {
      expect(MID_GAME_SCENARIO.inventory.currencies[Currency.DARK_COINS]).toBeGreaterThan(1000);
    });

    it('has advanced content unlocked', () => {
      expect(MID_GAME_SCENARIO.player.unlockedContent.length).toBeGreaterThan(3);
    });
  });

  describe('LATE_GAME_SCENARIO', () => {
    it('is high-level player', () => {
      expect(LATE_GAME_SCENARIO.player.level).toBeGreaterThanOrEqual(30);
    });

    it('has elite content unlocked', () => {
      expect(LATE_GAME_SCENARIO.player.unlockedContent).toContain('lich_seed');
    });

    it('has Soul Essence', () => {
      expect(LATE_GAME_SCENARIO.inventory.currencies[Currency.SOUL_ESSENCE]).toBeGreaterThan(50);
    });
  });

  describe('ENDGAME_SCENARIO', () => {
    it('is max level', () => {
      expect(ENDGAME_SCENARIO.player.level).toBe(50);
    });

    it('has massive resources', () => {
      expect(ENDGAME_SCENARIO.inventory.currencies[Currency.DARK_COINS]).toBeGreaterThan(10000);
    });

    it('has all content unlocked', () => {
      expect(ENDGAME_SCENARIO.player.unlockedContent).toContain('necromancy_mastery');
    });
  });

  describe('ALL_SCENARIOS', () => {
    it('contains all scenarios', () => {
      expect(ALL_SCENARIOS).toHaveLength(7);
    });

    it('all scenarios have names', () => {
      ALL_SCENARIOS.forEach((s) => {
        expect(s.name).toBeDefined();
        expect(s.name.length).toBeGreaterThan(0);
      });
    });

    it('all scenarios have valid GameStates', () => {
      ALL_SCENARIOS.forEach((s) => {
        expect(s.scenario).toBeDefined();
        expect(s.scenario.player).toBeDefined();
        expect(s.scenario.inventory).toBeDefined();
      });
    });

    it('scenarios progress in level', () => {
      for (let i = 1; i < ALL_SCENARIOS.length; i++) {
        expect(ALL_SCENARIOS[i].scenario.player.level).toBeGreaterThanOrEqual(
          ALL_SCENARIOS[i - 1].scenario.player.level
        );
      }
    });
  });
});
