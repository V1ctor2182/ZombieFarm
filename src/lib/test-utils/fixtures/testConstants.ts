/**
 * Test Constants
 *
 * Common test values and constants used across test suites.
 * Per TESTING.md: Reduce duplication and ensure consistent test values.
 */

import { ZombieType, EnemyType, Resource, Currency, SeedType } from '../../../types';

/**
 * Common Test IDs
 */
export const TEST_IDS = {
  PLAYER: 'test-player-1',
  ZOMBIE_1: 'test-zombie-1',
  ZOMBIE_2: 'test-zombie-2',
  ENEMY_1: 'test-enemy-1',
  PLOT_1: 'test-plot-1',
  BUILDING_1: 'test-building-1',
  BATTLE_1: 'test-battle-1',
  LOCATION_1: 'test-location-1',
} as const;

/**
 * Common Test Timestamps
 */
export const TEST_TIMESTAMPS = {
  NOW: Date.now(),
  ONE_HOUR_AGO: Date.now() - 1000 * 60 * 60,
  ONE_DAY_AGO: Date.now() - 1000 * 60 * 60 * 24,
  ONE_WEEK_AGO: Date.now() - 1000 * 60 * 60 * 24 * 7,
} as const;

/**
 * Common Test Durations (milliseconds)
 */
export const TEST_DURATIONS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 1000 * 60,
  ONE_HOUR: 1000 * 60 * 60,
  ONE_DAY: 1000 * 60 * 60 * 24,
  ONE_WEEK: 1000 * 60 * 60 * 24 * 7,
} as const;

/**
 * Common Resource Amounts
 */
export const TEST_RESOURCE_AMOUNTS = {
  SMALL: 10,
  MEDIUM: 50,
  LARGE: 100,
  VERY_LARGE: 500,
} as const;

/**
 * Common Currency Amounts
 */
export const TEST_CURRENCY_AMOUNTS = {
  STARTER: 50,
  SMALL: 100,
  MEDIUM: 500,
  LARGE: 1000,
  VERY_LARGE: 10000,
} as const;

/**
 * Common Zombie Stats
 */
export const TEST_ZOMBIE_STATS = {
  SHAMBLER_HP: 100,
  RUNNER_HP: 60,
  BRUTE_HP: 250,
  LICH_HP: 100,
} as const;

/**
 * Common Enemy Stats
 */
export const TEST_ENEMY_STATS = {
  PEASANT_HP: 50,
  KNIGHT_HP: 150,
  PALADIN_HP: 250,
  BOSS_HP: 500,
} as const;

/**
 * Common Positions
 */
export const TEST_POSITIONS = {
  ORIGIN: { x: 0, y: 0 },
  CENTER: { x: 50, y: 50 },
  ZOMBIE_SPAWN: { x: 10, y: 50 },
  ENEMY_SPAWN: { x: 100, y: 50 },
} as const;

/**
 * Common Battle Values
 */
export const TEST_BATTLE_VALUES = {
  SQUAD_SIZE_SMALL: 3,
  SQUAD_SIZE_MEDIUM: 5,
  SQUAD_SIZE_LARGE: 10,
  ENEMY_WAVE_SMALL: 5,
  ENEMY_WAVE_MEDIUM: 10,
  ENEMY_WAVE_LARGE: 20,
} as const;

/**
 * Common Level Values
 */
export const TEST_LEVELS = {
  NEW_PLAYER: 1,
  LOW_LEVEL: 5,
  MID_LEVEL: 15,
  HIGH_LEVEL: 35,
  MAX_LEVEL: 50,
} as const;

/**
 * Common XP Values
 */
export const TEST_XP_VALUES = {
  NONE: 0,
  LOW: 500,
  MEDIUM: 5000,
  HIGH: 50000,
  MAX: 250000,
} as const;

/**
 * Happiness Thresholds
 */
export const TEST_HAPPINESS = {
  MIN: 0,
  VERY_LOW: 20,
  LOW: 40,
  MEDIUM: 60,
  HIGH: 80,
  VERY_HIGH: 95,
  MAX: 100,
} as const;

/**
 * Growth Times (minutes)
 */
export const TEST_GROWTH_TIMES = {
  SHAMBLER: 5,
  RUNNER: 4,
  BRUTE: 15,
  LICH: 25,
} as const;

/**
 * Common Zombie Types for Testing
 */
export const TEST_ZOMBIE_TYPES = {
  BASIC: ZombieType.SHAMBLER,
  FAST: ZombieType.RUNNER,
  TANK: ZombieType.BRUTE,
  RANGED: ZombieType.SPITTER,
  CASTER: ZombieType.LICH,
} as const;

/**
 * Common Enemy Types for Testing
 */
export const TEST_ENEMY_TYPES = {
  WEAK: EnemyType.PEASANT,
  BASIC: EnemyType.MILITIA,
  RANGED: EnemyType.ARCHER,
  TANK: EnemyType.KNIGHT,
  HOLY: EnemyType.PRIEST,
  ELITE: EnemyType.PALADIN,
} as const;

/**
 * Common Resources for Testing
 */
export const TEST_RESOURCES = {
  PRIMARY: Resource.ROTTEN_WOOD,
  SECONDARY: Resource.BONES,
  LIQUID: Resource.BLOOD_WATER,
  RARE: Resource.SOUL_FRAGMENTS,
} as const;

/**
 * Test Seed Types
 */
export const TEST_SEEDS = {
  STARTER: SeedType.SHAMBLER_SEED,
  BASIC: SeedType.RUNNER_SEED,
  ADVANCED: SeedType.BRUTE_SEED,
  ELITE: SeedType.LICH_SEED,
} as const;
