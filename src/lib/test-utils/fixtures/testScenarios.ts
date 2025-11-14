/**
 * Test Scenarios
 *
 * Pre-built game scenarios for integration and E2E testing.
 * Per TESTING.md: Test fixtures should represent realistic game states.
 */

import type { GameState } from '../../../types';
import {
  createTestGameState,
  createNewPlayerGameState,
  createTestPlayer,
  createShambler,
  createRunner,
  createBrute,
} from '../factories';
import { createTestInventory } from '../factories/inventoryFactory';
import { TEST_IDS, TEST_TIMESTAMPS } from './testConstants';
import { Resource, Currency, SeedType, ZombieQuality } from '../../../types';

/**
 * Tutorial Start - Player just began the game
 */
export const TUTORIAL_START_SCENARIO: GameState = createNewPlayerGameState();

/**
 * Tutorial Complete - Player finished tutorial, has first zombie
 */
export const TUTORIAL_COMPLETE_SCENARIO: GameState = createTestGameState({
  player: createTestPlayer({
    level: 1,
    xp: 50,
    stats: {
      totalZombiesHarvested: 1,
      totalBattlesWon: 0,
      totalBattlesLost: 0,
      totalDarkCoinsEarned: 0,
      totalPlayTime: 1000 * 60 * 10, // 10 minutes
    },
  }),
  inventory: createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 75,
      [Currency.SOUL_ESSENCE]: 0,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 2,
    },
    resources: {
      [Resource.ROTTEN_WOOD]: 10,
      [Resource.BONES]: 5,
    },
  }),
});

/**
 * First Battle Prep - Player ready for first battle
 */
export const FIRST_BATTLE_PREP_SCENARIO: GameState = createTestGameState({
  player: createTestPlayer({
    level: 2,
    xp: 150,
  }),
  inventory: createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 100,
      [Currency.SOUL_ESSENCE]: 0,
    },
  }),
});

/**
 * Growing Farm - Active farm with multiple zombies growing
 */
export const GROWING_FARM_SCENARIO: GameState = createTestGameState({
  player: createTestPlayer({
    level: 5,
    xp: 800,
    stats: {
      totalZombiesHarvested: 10,
      totalBattlesWon: 2,
      totalBattlesLost: 0,
      totalDarkCoinsEarned: 500,
      totalPlayTime: 1000 * 60 * 60 * 3, // 3 hours
    },
  }),
  inventory: createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 350,
      [Currency.SOUL_ESSENCE]: 2,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 5,
      [SeedType.RUNNER_SEED]: 3,
    },
    resources: {
      [Resource.ROTTEN_WOOD]: 50,
      [Resource.BONES]: 30,
      [Resource.BLOOD_WATER]: 20,
    },
  }),
});

/**
 * Mid-Game Progression - Established player with variety
 */
export const MID_GAME_SCENARIO: GameState = createTestGameState({
  player: createTestPlayer({
    level: 15,
    xp: 12000,
    stats: {
      totalZombiesHarvested: 150,
      totalBattlesWon: 30,
      totalBattlesLost: 5,
      totalDarkCoinsEarned: 10000,
      totalPlayTime: 1000 * 60 * 60 * 20,
    },
    unlockedContent: [
      'shambler_seed',
      'runner_seed',
      'brute_seed',
      'spitter_seed',
      'ghoul_seed',
      'necromancer_level_7',
    ],
  }),
  inventory: createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 2500,
      [Currency.SOUL_ESSENCE]: 15,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 10,
      [SeedType.RUNNER_SEED]: 8,
      [SeedType.BRUTE_SEED]: 4,
      [SeedType.SPITTER_SEED]: 3,
    },
    resources: {
      [Resource.ROTTEN_WOOD]: 200,
      [Resource.BONES]: 150,
      [Resource.BLOOD_WATER]: 80,
      [Resource.CORPSE_DUST]: 40,
      [Resource.SOUL_FRAGMENTS]: 15,
    },
  }),
});

/**
 * Late Game - Powerful player with elite zombies
 */
export const LATE_GAME_SCENARIO: GameState = createTestGameState({
  player: createTestPlayer({
    level: 35,
    xp: 85000,
    stats: {
      totalZombiesHarvested: 800,
      totalBattlesWon: 150,
      totalBattlesLost: 15,
      totalDarkCoinsEarned: 100000,
      totalPlayTime: 1000 * 60 * 60 * 80,
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
      'necromancer_level_10',
      'cathedral_defeated',
    ],
  }),
  inventory: createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 15000,
      [Currency.SOUL_ESSENCE]: 75,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 20,
      [SeedType.RUNNER_SEED]: 15,
      [SeedType.BRUTE_SEED]: 10,
      [SeedType.SPITTER_SEED]: 8,
      [SeedType.LICH_SEED]: 3,
      [SeedType.ABOMINATION_SEED]: 2,
    },
    resources: {
      [Resource.ROTTEN_WOOD]: 500,
      [Resource.BONES]: 400,
      [Resource.BLOOD_WATER]: 200,
      [Resource.CORPSE_DUST]: 100,
      [Resource.SOUL_FRAGMENTS]: 50,
      [Resource.IRON_SCRAPS]: 200,
    },
  }),
});

/**
 * Endgame - Max level player
 */
export const ENDGAME_SCENARIO: GameState = createTestGameState({
  player: createTestPlayer({
    level: 50,
    xp: 250000,
    stats: {
      totalZombiesHarvested: 2000,
      totalBattlesWon: 500,
      totalBattlesLost: 25,
      totalDarkCoinsEarned: 500000,
      totalPlayTime: 1000 * 60 * 60 * 200,
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
      'necromancy_mastery',
    ],
  }),
  inventory: createTestInventory({
    currencies: {
      [Currency.DARK_COINS]: 50000,
      [Currency.SOUL_ESSENCE]: 200,
    },
    seeds: {
      [SeedType.SHAMBLER_SEED]: 50,
      [SeedType.RUNNER_SEED]: 40,
      [SeedType.BRUTE_SEED]: 25,
      [SeedType.SPITTER_SEED]: 20,
      [SeedType.LICH_SEED]: 10,
      [SeedType.ABOMINATION_SEED]: 5,
      [SeedType.NECROMANCER_ZOMBIE_SEED]: 2,
    },
    resources: {
      [Resource.ROTTEN_WOOD]: 1000,
      [Resource.BONES]: 800,
      [Resource.BLOOD_WATER]: 400,
      [Resource.CORPSE_DUST]: 200,
      [Resource.SOUL_FRAGMENTS]: 150,
      [Resource.IRON_SCRAPS]: 500,
      [Resource.DARK_ESSENCE]: 25,
    },
  }),
});

/**
 * Export all scenarios as array for iteration
 */
export const ALL_SCENARIOS = [
  { name: 'Tutorial Start', scenario: TUTORIAL_START_SCENARIO },
  { name: 'Tutorial Complete', scenario: TUTORIAL_COMPLETE_SCENARIO },
  { name: 'First Battle Prep', scenario: FIRST_BATTLE_PREP_SCENARIO },
  { name: 'Growing Farm', scenario: GROWING_FARM_SCENARIO },
  { name: 'Mid Game', scenario: MID_GAME_SCENARIO },
  { name: 'Late Game', scenario: LATE_GAME_SCENARIO },
  { name: 'Endgame', scenario: ENDGAME_SCENARIO },
] as const;
