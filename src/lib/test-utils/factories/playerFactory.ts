/**
 * Player Factory
 *
 * Factory functions for creating test Player objects.
 * Per TESTING.md: Provides reusable test data for player progression scenarios.
 */

import type { Player, PlayerStats } from '../../../types';

/**
 * Creates default player stats
 */
const createDefaultPlayerStats = (): PlayerStats => ({
  totalZombiesHarvested: 0,
  totalBattlesWon: 0,
  totalBattlesLost: 0,
  totalDarkCoinsEarned: 0,
  totalPlayTime: 0,
});

/**
 * Creates a test Player with sensible defaults
 *
 * @param overrides - Partial Player to override defaults
 * @returns Complete Player object
 */
export function createTestPlayer(overrides?: Partial<Player>): Player {
  const defaultPlayer: Player = {
    id: 'test-player-1',
    name: 'Test Necromancer',
    level: 1,
    xp: 0,
    stats: createDefaultPlayerStats(),
    unlockedContent: ['shambler_seed', 'runner_seed'],
    achievements: [],
    quests: {
      active: [],
      completed: [],
    },
  };

  return {
    ...defaultPlayer,
    ...overrides,
    stats: overrides?.stats
      ? { ...defaultPlayer.stats, ...overrides.stats }
      : defaultPlayer.stats,
    quests: overrides?.quests
      ? {
          active: overrides.quests.active ?? defaultPlayer.quests.active,
          completed: overrides.quests.completed ?? defaultPlayer.quests.completed,
        }
      : defaultPlayer.quests,
  };
}

/**
 * Creates a new player (tutorial state)
 */
export function createNewPlayer(): Player {
  return createTestPlayer({
    level: 1,
    xp: 0,
    stats: createDefaultPlayerStats(),
    unlockedContent: ['shambler_seed'],
    achievements: [],
  });
}

/**
 * Creates a low-level player (early game)
 */
export function createLowLevelPlayer(): Player {
  return createTestPlayer({
    level: 3,
    xp: 450,
    stats: {
      totalZombiesHarvested: 15,
      totalBattlesWon: 2,
      totalBattlesLost: 1,
      totalDarkCoinsEarned: 500,
      totalPlayTime: 1000 * 60 * 60 * 2, // 2 hours
    },
    unlockedContent: ['shambler_seed', 'runner_seed', 'brute_seed'],
    achievements: ['first_harvest', 'first_victory'],
  });
}

/**
 * Creates a mid-level player
 */
export function createMidLevelPlayer(): Player {
  return createTestPlayer({
    level: 15,
    xp: 12000,
    stats: {
      totalZombiesHarvested: 150,
      totalBattlesWon: 30,
      totalBattlesLost: 5,
      totalDarkCoinsEarned: 10000,
      totalPlayTime: 1000 * 60 * 60 * 20, // 20 hours
    },
    unlockedContent: [
      'shambler_seed',
      'runner_seed',
      'brute_seed',
      'spitter_seed',
      'ghoul_seed',
      'bone_knight_seed',
      'necromancer_level_7',
    ],
    achievements: [
      'first_harvest',
      'first_victory',
      'harvest_100',
      'win_10_battles',
    ],
  });
}

/**
 * Creates a high-level player (late game)
 */
export function createHighLevelPlayer(): Player {
  return createTestPlayer({
    level: 35,
    xp: 85000,
    stats: {
      totalZombiesHarvested: 800,
      totalBattlesWon: 150,
      totalBattlesLost: 15,
      totalDarkCoinsEarned: 100000,
      totalPlayTime: 1000 * 60 * 60 * 80, // 80 hours
    },
    unlockedContent: [
      'shambler_seed',
      'runner_seed',
      'brute_seed',
      'spitter_seed',
      'ghoul_seed',
      'abomination_seed',
      'lich_seed',
      'bone_knight_seed',
      'priest_zombie_seed',
      'explosive_zombie_seed',
      'necromancer_level_10',
      'cathedral_defeated',
    ],
    achievements: [
      'first_harvest',
      'first_victory',
      'harvest_100',
      'harvest_500',
      'win_10_battles',
      'win_50_battles',
      'win_100_battles',
      'defeat_cathedral',
    ],
  });
}

/**
 * Creates a max-level player (endgame)
 */
export function createMaxLevelPlayer(): Player {
  return createTestPlayer({
    level: 50,
    xp: 250000,
    stats: {
      totalZombiesHarvested: 2000,
      totalBattlesWon: 500,
      totalBattlesLost: 25,
      totalDarkCoinsEarned: 500000,
      totalPlayTime: 1000 * 60 * 60 * 200, // 200 hours
    },
    unlockedContent: [
      'shambler_seed',
      'runner_seed',
      'brute_seed',
      'spitter_seed',
      'ghoul_seed',
      'abomination_seed',
      'lich_seed',
      'bone_knight_seed',
      'priest_zombie_seed',
      'explosive_zombie_seed',
      'necromancer_zombie_seed',
      'necromancer_level_10',
      'cathedral_defeated',
      'explosives_research',
      'necromancy_mastery',
    ],
    achievements: [
      'first_harvest',
      'first_victory',
      'harvest_100',
      'harvest_500',
      'harvest_1000',
      'win_10_battles',
      'win_50_battles',
      'win_100_battles',
      'win_500_battles',
      'defeat_cathedral',
      'defeat_capital',
      'max_level',
      'horde_master',
    ],
  });
}

/**
 * Creates a player with specific level
 */
export function createPlayerAtLevel(level: number, xp: number = 0): Player {
  return createTestPlayer({
    level,
    xp,
  });
}

/**
 * Creates a player with specific stats
 */
export function createPlayerWithStats(stats: Partial<PlayerStats>): Player {
  return createTestPlayer({
    stats: {
      ...createDefaultPlayerStats(),
      ...stats,
    },
  });
}

/**
 * Creates a player with specific unlocks
 */
export function createPlayerWithUnlocks(unlockedContent: string[]): Player {
  return createTestPlayer({
    unlockedContent,
  });
}

/**
 * Creates a player with active quests
 */
export function createPlayerWithQuests(
  activeQuests: string[],
  completedQuests: string[] = []
): Player {
  return createTestPlayer({
    quests: {
      active: activeQuests,
      completed: completedQuests,
    },
  });
}

/**
 * Creates a player with achievements
 */
export function createPlayerWithAchievements(achievements: string[]): Player {
  return createTestPlayer({
    achievements,
  });
}
