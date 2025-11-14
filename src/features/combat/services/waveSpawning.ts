/**
 * Wave Spawning Service
 *
 * Handles enemy wave definitions, sequential spawning,
 * spawn position calculation, and wave completion detection
 * per DOMAIN-COMBAT.md.
 *
 * Responsibilities:
 * - Create wave definitions from location data
 * - Calculate spawn positions
 * - Spawn enemy units for a wave
 * - Detect wave completion
 * - Manage wave progression
 */

import type { Location, LocationEnemy } from '../../../types/world';
import type { Enemy } from '../../../types/combat';
import type { Position } from '../../../types/global';
import { generateEnemyUnit } from './enemyComposition';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Wave definition
 */
export interface WaveDefinition {
  waveNumber: number;
  enemies: LocationEnemy[];
  totalEnemies: number;
  isBossWave: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Right edge of battlefield (enemy spawn area) */
const ENEMY_SPAWN_X_MIN = 1600;
const ENEMY_SPAWN_X_MAX = 1850;

/** Battlefield height */
const BATTLEFIELD_HEIGHT = 1080;

/** Vertical spacing between spawned enemies */
const SPAWN_VERTICAL_SPACING = 60;

/** Spawn zone offsets */
const SPAWN_ZONES: Record<string, number> = {
  frontline: 1600,
  midline: 1700,
  backline: 1800,
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create wave definitions from location
 *
 * Groups enemies by wave number and calculates totals.
 *
 * @param location Location definition
 * @returns Array of wave definitions
 */
export function createWaveDefinitions(location: Location): WaveDefinition[] {
  if (location.waves === 0 || location.enemies.length === 0) {
    return [];
  }

  const waves: WaveDefinition[] = [];

  // Group enemies by wave
  for (let waveNum = 1; waveNum <= location.waves; waveNum++) {
    const waveEnemies = location.enemies.filter((e) => e.wave === waveNum);

    if (waveEnemies.length > 0) {
      const totalEnemies = waveEnemies.reduce((sum, enemy) => sum + enemy.count, 0);
      const isBossWave = waveEnemies.some((e) => e.isBoss === true);

      waves.push({
        waveNumber: waveNum,
        enemies: waveEnemies,
        totalEnemies,
        isBossWave,
      });
    }
  }

  return waves;
}

/**
 * Get enemies for a specific wave
 *
 * @param waves All wave definitions
 * @param waveNumber Wave number to retrieve
 * @returns Enemies in that wave
 */
export function getWaveEnemies(waves: WaveDefinition[], waveNumber: number): LocationEnemy[] {
  const wave = waves.find((w) => w.waveNumber === waveNumber);
  return wave ? wave.enemies : [];
}

/**
 * Calculate spawn position for an enemy
 *
 * Distributes enemies vertically across the spawn area.
 *
 * @param enemyIndex Index of this enemy in spawn sequence (0-based)
 * @param totalEnemies Total enemies in this wave
 * @param spawnZone Optional spawn zone (frontline, midline, backline)
 * @returns Spawn position
 */
export function calculateSpawnPosition(
  enemyIndex: number,
  totalEnemies: number,
  spawnZone?: string
): Position {
  // Determine X position based on spawn zone
  let x: number;
  if (spawnZone && SPAWN_ZONES[spawnZone]) {
    x = SPAWN_ZONES[spawnZone];
  } else {
    // Default spawn area (random within range)
    x = ENEMY_SPAWN_X_MIN + Math.random() * (ENEMY_SPAWN_X_MAX - ENEMY_SPAWN_X_MIN);
  }

  // Distribute Y position evenly
  const availableHeight = BATTLEFIELD_HEIGHT - 100; // Leave margins
  const startY = 50;

  let y: number;
  if (totalEnemies === 1) {
    // Single enemy: center
    y = BATTLEFIELD_HEIGHT / 2;
  } else {
    // Multiple enemies: distribute evenly
    const spacing = Math.min(SPAWN_VERTICAL_SPACING, availableHeight / (totalEnemies - 1));
    y = startY + enemyIndex * spacing;
  }

  // Ensure within bounds
  y = Math.max(50, Math.min(BATTLEFIELD_HEIGHT - 50, y));

  return { x, y };
}

/**
 * Check if a wave is complete (all enemies dead)
 *
 * @param enemies Current enemies in battle
 * @param waveNumber Wave number to check
 * @returns True if wave is complete
 */
export function isWaveComplete(enemies: Enemy[], waveNumber: number): boolean {
  // If no enemies, wave is complete
  if (enemies.length === 0) {
    return true;
  }

  // Check if all enemies are dead
  return enemies.every((enemy) => enemy.isDead);
}

/**
 * Get the next wave definition
 *
 * @param waves All wave definitions
 * @param currentWave Current wave number
 * @returns Next wave or null if no more waves
 */
export function getNextWave(waves: WaveDefinition[], currentWave: number): WaveDefinition | null {
  const nextWaveNum = currentWave + 1;
  const nextWave = waves.find((w) => w.waveNumber === nextWaveNum);
  return nextWave || null;
}

/**
 * Check if next wave should spawn
 *
 * @param currentWaveEnemies Enemies from current wave
 * @param currentWave Current wave number
 * @param totalWaves Total waves in location
 * @returns True if should spawn next wave
 */
export function shouldSpawnNextWave(
  currentWaveEnemies: Enemy[],
  currentWave: number,
  totalWaves: number
): boolean {
  // If current wave is 0, spawn first wave
  if (currentWave === 0) {
    return true;
  }

  // If already on final wave or past it, no more waves
  if (currentWave >= totalWaves) {
    return false;
  }

  // Check if current wave is complete
  return isWaveComplete(currentWaveEnemies, currentWave);
}

/**
 * Spawn all enemies for a wave
 *
 * @param waves All wave definitions
 * @param waveNumber Wave number to spawn
 * @param difficulty Location difficulty for stat scaling
 * @returns Array of spawned enemy units
 */
export function spawnWave(
  waves: WaveDefinition[],
  waveNumber: number,
  difficulty: number
): Enemy[] {
  const wave = waves.find((w) => w.waveNumber === waveNumber);

  if (!wave) {
    return [];
  }

  const spawnedEnemies: Enemy[] = [];
  let enemyIndex = 0;

  for (const enemyGroup of wave.enemies) {
    for (let i = 0; i < enemyGroup.count; i++) {
      const position = calculateSpawnPosition(enemyIndex, wave.totalEnemies, enemyGroup.spawnZone);

      const enemy = generateEnemyUnit(
        enemyGroup.type,
        position,
        difficulty,
        enemyGroup.levelModifier
      );

      spawnedEnemies.push(enemy);
      enemyIndex++;
    }
  }

  return spawnedEnemies;
}
