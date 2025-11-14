/**
 * Save/Load System
 *
 * Handles game state persistence to localStorage.
 * Provides save, load, validation, and migration functionality.
 *
 * Per ARCHITECTURE.md:
 * - Local-only persistence (no server)
 * - JSON serialization with versioning
 * - Migration support for old saves
 * - Error handling and recovery
 */

import type { GameState, SaveMetadata } from '../../types';

/**
 * Current save version (semantic versioning)
 */
export const CURRENT_SAVE_VERSION = '1.0.0';

/**
 * localStorage key for save data
 */
export const SAVE_KEY = 'zombiefarm_save';

/**
 * Error codes for save/load operations
 */
export enum SaveLoadErrorCode {
  NO_SAVE_FOUND = 'NO_SAVE_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_STRUCTURE = 'INVALID_STRUCTURE',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  STORAGE_FULL = 'STORAGE_FULL',
  MIGRATION_ERROR = 'MIGRATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Custom error class for save/load operations
 */
export class SaveLoadError extends Error {
  constructor(
    message: string,
    public code: SaveLoadErrorCode
  ) {
    super(message);
    this.name = 'SaveLoadError';
    Object.setPrototypeOf(this, SaveLoadError.prototype);
  }
}

/**
 * Result type for save/load operations
 */
export type SaveLoadResult<T = void> =
  | { success: true; data?: T; error?: never }
  | { success: false; error: SaveLoadError; data?: never };

/**
 * Validation result type
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Save data structure (wraps GameState with metadata)
 */
type SaveData = {
  meta: SaveMetadata;
  state: GameState;
};

/**
 * Saves game state to localStorage
 *
 * @param gameState - The game state to save
 * @returns Result indicating success or error
 */
export function saveGame(gameState: GameState): SaveLoadResult {
  try {
    // Get existing save count if any
    let saveCount = 1;
    try {
      const existing = localStorage.getItem(SAVE_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        saveCount = (parsed.meta?.saveCount || 0) + 1;
      }
    } catch {
      // If parsing fails, start fresh with count 1
    }

    // Create save data with metadata
    const saveData: SaveData = {
      meta: {
        version: CURRENT_SAVE_VERSION,
        lastSaved: Date.now(),
        saveCount,
        createdAt: gameState.meta?.createdAt || Date.now(),
      },
      state: gameState,
    };

    // Serialize to JSON
    let serialized: string;
    try {
      serialized = JSON.stringify(saveData);
    } catch (error) {
      throw new SaveLoadError(
        `Failed to serialize game state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SaveLoadErrorCode.SERIALIZATION_ERROR
      );
    }

    // Save to localStorage
    try {
      localStorage.setItem(SAVE_KEY, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new SaveLoadError(
          'localStorage quota exceeded. Please free up storage space.',
          SaveLoadErrorCode.STORAGE_FULL
        );
      }
      throw new SaveLoadError(
        `Failed to write to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SaveLoadErrorCode.STORAGE_FULL
      );
    }

    return { success: true };
  } catch (error) {
    if (error instanceof SaveLoadError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new SaveLoadError(
        `Unexpected error during save: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SaveLoadErrorCode.SERIALIZATION_ERROR
      ),
    };
  }
}

/**
 * Loads game state from localStorage
 *
 * @returns Result with loaded game state or error
 */
export function loadGame(): SaveLoadResult<GameState> {
  try {
    // Check if save exists
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) {
      throw new SaveLoadError('No save data found', SaveLoadErrorCode.NO_SAVE_FOUND);
    }

    // Parse JSON
    let parsed: SaveData;
    try {
      parsed = JSON.parse(savedData);
    } catch (error) {
      throw new SaveLoadError(
        'Save data is corrupted (invalid JSON)',
        SaveLoadErrorCode.INVALID_JSON
      );
    }

    // Validate structure
    const validation = validateSaveData(parsed.state);
    if (!validation.valid) {
      throw new SaveLoadError(
        `Save data structure is invalid: ${validation.errors.join(', ')}`,
        SaveLoadErrorCode.INVALID_STRUCTURE
      );
    }

    // Migrate if necessary
    const version = parsed.meta?.version || '0.0.0';
    let gameState = parsed.state;
    if (version !== CURRENT_SAVE_VERSION) {
      try {
        gameState = migrateSaveData(gameState, version);
      } catch (error) {
        throw new SaveLoadError(
          `Failed to migrate save from version ${version}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          SaveLoadErrorCode.MIGRATION_ERROR
        );
      }
    }

    return { success: true, data: gameState };
  } catch (error) {
    if (error instanceof SaveLoadError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new SaveLoadError(
        `Unexpected error during load: ${error instanceof Error ? error.message : 'Unknown error'}`,
        SaveLoadErrorCode.INVALID_JSON
      ),
    };
  }
}

/**
 * Validates game state structure
 *
 * @param data - The data to validate
 * @returns Validation result with any errors
 */
export function validateSaveData(data: any): ValidationResult {
  const errors: string[] = [];

  // Check top-level structure
  if (!data || typeof data !== 'object') {
    errors.push('Save data must be an object');
    return { valid: false, errors };
  }

  // Validate player
  if (!data.player || typeof data.player !== 'object') {
    errors.push('Missing or invalid player data');
  } else {
    if (!data.player.id || typeof data.player.id !== 'string') {
      errors.push('Player missing valid id');
    }
    if (!data.player.name || typeof data.player.name !== 'string') {
      errors.push('Player missing valid name');
    }
    if (typeof data.player.level !== 'number' || data.player.level < 1) {
      errors.push('Player missing valid level');
    }
    if (typeof data.player.xp !== 'number' || data.player.xp < 0) {
      errors.push('Player missing valid xp');
    }
  }

  // Validate farm (flexible structure)
  if (!data.farm || typeof data.farm !== 'object') {
    errors.push('Missing or invalid farm data');
  } else {
    // Check for either 'plots' or 'activeZombies' patterns
    if (data.farm.plots !== undefined && !Array.isArray(data.farm.plots)) {
      errors.push('Farm plots must be an array');
    }
    if (data.farm.activeZombies !== undefined && !Array.isArray(data.farm.activeZombies)) {
      errors.push('Farm activeZombies must be an array');
    }
    if (data.farm.buildings !== undefined && !Array.isArray(data.farm.buildings)) {
      errors.push('Farm buildings must be an array');
    }
  }

  // Validate inventory
  if (!data.inventory || typeof data.inventory !== 'object') {
    errors.push('Missing or invalid inventory data');
  }

  // Validate time
  if (!data.time || typeof data.time !== 'object') {
    errors.push('Missing or invalid time data');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Migrates save data from an old version to current version
 *
 * @param data - The old save data
 * @param fromVersion - The version to migrate from
 * @returns Migrated game state
 */
export function migrateSaveData(data: GameState, fromVersion: string): GameState {
  let migrated = { ...data };

  // If already current version, return as-is
  if (fromVersion === CURRENT_SAVE_VERSION) {
    return migrated;
  }

  // Migration from 0.8.x to 0.9.x
  if (compareVersions(fromVersion, '0.9.0') < 0) {
    migrated = migrate_0_8_to_0_9(migrated);
  }

  // Migration from 0.9.x to 1.0.0
  if (compareVersions(fromVersion, '1.0.0') < 0) {
    migrated = migrate_0_9_to_1_0(migrated);
  }

  return migrated;
}

/**
 * Migration: 0.8.x → 0.9.x
 */
function migrate_0_8_to_0_9(data: GameState): GameState {
  const migrated = { ...data };

  // Add player stats if missing
  if (!migrated.player.stats) {
    migrated.player = {
      ...migrated.player,
      stats: {
        totalZombiesHarvested: 0,
        totalBattlesWon: 0,
        totalBattlesLost: 0,
        totalDarkCoinsEarned: 0,
        totalPlayTime: 0,
      },
    };
  }

  return migrated;
}

/**
 * Migration: 0.9.x → 1.0.0
 */
function migrate_0_9_to_1_0(data: GameState): GameState {
  const migrated = { ...data };

  // Update metadata version
  if (migrated.meta) {
    migrated.meta.version = '1.0.0';
  }

  return migrated;
}

/**
 * Compares two semantic version strings
 *
 * @param v1 - First version
 * @param v2 - Second version
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }

  return 0;
}

/**
 * Clears all save data from localStorage
 */
export function clearSaveData(): void {
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Checks if save data exists
 *
 * @returns True if valid save data exists
 */
export function hasSaveData(): boolean {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return false;

    // Try to parse to verify it's valid JSON
    JSON.parse(savedData);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets save metadata without loading full game state
 *
 * @returns Save metadata or null if no save exists
 */
export function getSaveMetadata(): SaveMetadata | null {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;

    const parsed: SaveData = JSON.parse(savedData);
    return parsed.meta || null;
  } catch {
    return null;
  }
}
