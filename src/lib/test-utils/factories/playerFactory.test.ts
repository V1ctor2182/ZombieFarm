/**
 * Player Factory Tests
 *
 * Comprehensive tests for playerFactory functions.
 */

import {
  createTestPlayer,
  createNewPlayer,
  createLowLevelPlayer,
  createMidLevelPlayer,
  createHighLevelPlayer,
  createMaxLevelPlayer,
  createPlayerAtLevel,
  createPlayerWithStats,
  createPlayerWithUnlocks,
  createPlayerWithQuests,
  createPlayerWithAchievements,
} from './playerFactory';

describe('playerFactory', () => {
  describe('createTestPlayer', () => {
    it('creates a valid Player with defaults', () => {
      const player = createTestPlayer();

      expect(player).toBeDefined();
      expect(player.id).toBe('test-player-1');
      expect(player.name).toBe('Test Necromancer');
      expect(player.level).toBe(1);
      expect(player.xp).toBe(0);
    });

    it('creates Player with default stats', () => {
      const player = createTestPlayer();

      expect(player.stats).toBeDefined();
      expect(player.stats.totalZombiesHarvested).toBe(0);
      expect(player.stats.totalBattlesWon).toBe(0);
      expect(player.stats.totalBattlesLost).toBe(0);
      expect(player.stats.totalDarkCoinsEarned).toBe(0);
      expect(player.stats.totalPlayTime).toBe(0);
    });

    it('creates Player with default unlocked content', () => {
      const player = createTestPlayer();

      expect(player.unlockedContent).toContain('shambler_seed');
      expect(player.unlockedContent).toContain('runner_seed');
      expect(player.unlockedContent).toHaveLength(2);
    });

    it('creates Player with empty achievements', () => {
      const player = createTestPlayer();

      expect(player.achievements).toEqual([]);
    });

    it('creates Player with empty quests', () => {
      const player = createTestPlayer();

      expect(player.quests.active).toEqual([]);
      expect(player.quests.completed).toEqual([]);
    });

    it('allows overriding level', () => {
      const player = createTestPlayer({ level: 10 });

      expect(player.level).toBe(10);
    });

    it('allows overriding xp', () => {
      const player = createTestPlayer({ xp: 5000 });

      expect(player.xp).toBe(5000);
    });

    it('allows overriding name', () => {
      const player = createTestPlayer({ name: 'Dark Overlord' });

      expect(player.name).toBe('Dark Overlord');
    });

    it('allows overriding stats', () => {
      const player = createTestPlayer({
        stats: { totalZombiesHarvested: 100, totalBattlesWon: 50 } as any,
      });

      expect(player.stats.totalZombiesHarvested).toBe(100);
      expect(player.stats.totalBattlesWon).toBe(50);
    });

    it('allows overriding unlocked content', () => {
      const player = createTestPlayer({
        unlockedContent: ['brute_seed', 'lich_seed'],
      });

      expect(player.unlockedContent).toContain('brute_seed');
      expect(player.unlockedContent).toContain('lich_seed');
      expect(player.unlockedContent).toHaveLength(2);
    });

    it('allows overriding achievements', () => {
      const player = createTestPlayer({
        achievements: ['first_harvest', 'first_victory'],
      });

      expect(player.achievements).toContain('first_harvest');
      expect(player.achievements).toContain('first_victory');
    });

    it('allows overriding quests', () => {
      const player = createTestPlayer({
        quests: { active: ['quest_1'], completed: ['tutorial'] },
      });

      expect(player.quests.active).toContain('quest_1');
      expect(player.quests.completed).toContain('tutorial');
    });
  });

  describe('createNewPlayer', () => {
    it('creates a new player at level 1', () => {
      const player = createNewPlayer();

      expect(player.level).toBe(1);
      expect(player.xp).toBe(0);
    });

    it('gives new player only shambler seed', () => {
      const player = createNewPlayer();

      expect(player.unlockedContent).toContain('shambler_seed');
      expect(player.unlockedContent).toHaveLength(1);
    });

    it('initializes new player stats to 0', () => {
      const player = createNewPlayer();

      expect(player.stats.totalZombiesHarvested).toBe(0);
      expect(player.stats.totalBattlesWon).toBe(0);
      expect(player.stats.totalBattlesLost).toBe(0);
    });

    it('gives new player no achievements', () => {
      const player = createNewPlayer();

      expect(player.achievements).toEqual([]);
    });
  });

  describe('createLowLevelPlayer', () => {
    it('creates a low-level player', () => {
      const player = createLowLevelPlayer();

      expect(player.level).toBe(3);
      expect(player.xp).toBe(450);
    });

    it('gives low-level player some progress', () => {
      const player = createLowLevelPlayer();

      expect(player.stats.totalZombiesHarvested).toBe(15);
      expect(player.stats.totalBattlesWon).toBe(2);
    });

    it('unlocks basic content for low-level player', () => {
      const player = createLowLevelPlayer();

      expect(player.unlockedContent).toContain('shambler_seed');
      expect(player.unlockedContent).toContain('runner_seed');
      expect(player.unlockedContent).toContain('brute_seed');
    });

    it('gives low-level player some achievements', () => {
      const player = createLowLevelPlayer();

      expect(player.achievements).toContain('first_harvest');
      expect(player.achievements).toContain('first_victory');
    });
  });

  describe('createMidLevelPlayer', () => {
    it('creates a mid-level player', () => {
      const player = createMidLevelPlayer();

      expect(player.level).toBe(15);
      expect(player.xp).toBe(12000);
    });

    it('gives mid-level player substantial progress', () => {
      const player = createMidLevelPlayer();

      expect(player.stats.totalZombiesHarvested).toBe(150);
      expect(player.stats.totalBattlesWon).toBe(30);
    });

    it('unlocks advanced content for mid-level player', () => {
      const player = createMidLevelPlayer();

      expect(player.unlockedContent).toContain('spitter_seed');
      expect(player.unlockedContent).toContain('ghoul_seed');
      expect(player.unlockedContent).toContain('bone_knight_seed');
    });

    it('gives mid-level player multiple achievements', () => {
      const player = createMidLevelPlayer();

      expect(player.achievements.length).toBeGreaterThan(2);
      expect(player.achievements).toContain('harvest_100');
    });
  });

  describe('createHighLevelPlayer', () => {
    it('creates a high-level player', () => {
      const player = createHighLevelPlayer();

      expect(player.level).toBe(35);
      expect(player.xp).toBe(85000);
    });

    it('gives high-level player significant progress', () => {
      const player = createHighLevelPlayer();

      expect(player.stats.totalZombiesHarvested).toBe(800);
      expect(player.stats.totalBattlesWon).toBe(150);
      expect(player.stats.totalDarkCoinsEarned).toBe(100000);
    });

    it('unlocks elite content for high-level player', () => {
      const player = createHighLevelPlayer();

      expect(player.unlockedContent).toContain('lich_seed');
      expect(player.unlockedContent).toContain('abomination_seed');
      expect(player.unlockedContent).toContain('priest_zombie_seed');
    });

    it('gives high-level player many achievements', () => {
      const player = createHighLevelPlayer();

      expect(player.achievements.length).toBeGreaterThan(5);
      expect(player.achievements).toContain('win_100_battles');
    });
  });

  describe('createMaxLevelPlayer', () => {
    it('creates a max-level player', () => {
      const player = createMaxLevelPlayer();

      expect(player.level).toBe(50);
      expect(player.xp).toBe(250000);
    });

    it('gives max-level player massive progress', () => {
      const player = createMaxLevelPlayer();

      expect(player.stats.totalZombiesHarvested).toBe(2000);
      expect(player.stats.totalBattlesWon).toBe(500);
      expect(player.stats.totalDarkCoinsEarned).toBe(500000);
    });

    it('unlocks all content for max-level player', () => {
      const player = createMaxLevelPlayer();

      expect(player.unlockedContent).toContain('necromancer_zombie_seed');
      expect(player.unlockedContent).toContain('necromancy_mastery');
      expect(player.unlockedContent.length).toBeGreaterThan(10);
    });

    it('gives max-level player all major achievements', () => {
      const player = createMaxLevelPlayer();

      expect(player.achievements.length).toBeGreaterThan(10);
      expect(player.achievements).toContain('max_level');
      expect(player.achievements).toContain('horde_master');
    });
  });

  describe('createPlayerAtLevel', () => {
    it('creates player at specified level', () => {
      const player = createPlayerAtLevel(25);

      expect(player.level).toBe(25);
    });

    it('creates player at level 1', () => {
      const player = createPlayerAtLevel(1);

      expect(player.level).toBe(1);
    });

    it('creates player at level 50', () => {
      const player = createPlayerAtLevel(50);

      expect(player.level).toBe(50);
    });

    it('allows specifying xp', () => {
      const player = createPlayerAtLevel(10, 3000);

      expect(player.level).toBe(10);
      expect(player.xp).toBe(3000);
    });

    it('defaults xp to 0', () => {
      const player = createPlayerAtLevel(10);

      expect(player.xp).toBe(0);
    });
  });

  describe('createPlayerWithStats', () => {
    it('creates player with specific stats', () => {
      const player = createPlayerWithStats({
        totalZombiesHarvested: 250,
        totalBattlesWon: 75,
      });

      expect(player.stats.totalZombiesHarvested).toBe(250);
      expect(player.stats.totalBattlesWon).toBe(75);
    });

    it('preserves default stats for unspecified fields', () => {
      const player = createPlayerWithStats({
        totalZombiesHarvested: 100,
      });

      expect(player.stats.totalZombiesHarvested).toBe(100);
      expect(player.stats.totalBattlesWon).toBe(0);
      expect(player.stats.totalBattlesLost).toBe(0);
    });
  });

  describe('createPlayerWithUnlocks', () => {
    it('creates player with specific unlocks', () => {
      const unlocks = ['brute_seed', 'lich_seed', 'necromancer_level_8'];
      const player = createPlayerWithUnlocks(unlocks);

      expect(player.unlockedContent).toEqual(unlocks);
    });

    it('handles empty unlocks', () => {
      const player = createPlayerWithUnlocks([]);

      expect(player.unlockedContent).toEqual([]);
    });
  });

  describe('createPlayerWithQuests', () => {
    it('creates player with active quests', () => {
      const player = createPlayerWithQuests(['quest_1', 'quest_2']);

      expect(player.quests.active).toContain('quest_1');
      expect(player.quests.active).toContain('quest_2');
    });

    it('creates player with completed quests', () => {
      const player = createPlayerWithQuests(['quest_3'], ['tutorial', 'first_battle']);

      expect(player.quests.active).toContain('quest_3');
      expect(player.quests.completed).toContain('tutorial');
      expect(player.quests.completed).toContain('first_battle');
    });

    it('defaults completed quests to empty array', () => {
      const player = createPlayerWithQuests(['quest_1']);

      expect(player.quests.completed).toEqual([]);
    });
  });

  describe('createPlayerWithAchievements', () => {
    it('creates player with specific achievements', () => {
      const achievements = ['first_harvest', 'first_victory', 'harvest_100'];
      const player = createPlayerWithAchievements(achievements);

      expect(player.achievements).toEqual(achievements);
    });

    it('handles empty achievements', () => {
      const player = createPlayerWithAchievements([]);

      expect(player.achievements).toEqual([]);
    });

    it('handles single achievement', () => {
      const player = createPlayerWithAchievements(['max_level']);

      expect(player.achievements).toContain('max_level');
      expect(player.achievements).toHaveLength(1);
    });
  });
});
