/**
 * Auto-Save System
 *
 * Handles automatic saving of game state at regular intervals.
 * Provides configurable intervals, manual triggers, and throttling.
 *
 * Per ARCHITECTURE.md:
 * - Auto-save at configurable intervals
 * - Manual save triggers on significant events
 * - Error handling and callbacks
 */

import type { GameState } from '../../types';
import { saveGame, SaveLoadError } from './saveLoad';

/**
 * Auto-save configuration
 */
export type AutoSaveConfig = {
  /** Whether auto-save is enabled */
  enabled: boolean;
  /** Interval between saves in milliseconds (default: 5 minutes) */
  intervalMs?: number;
  /** Minimum time between saves in milliseconds (throttling) */
  minIntervalMs?: number;
  /** Callback when save succeeds */
  onSuccess?: () => void;
  /** Callback when save fails */
  onError?: (error: SaveLoadError) => void;
};

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<AutoSaveConfig> = {
  enabled: false,
  intervalMs: 5 * 60 * 1000, // 5 minutes
  minIntervalMs: 30 * 1000, // 30 seconds
  onSuccess: () => {},
  onError: () => {},
};

/**
 * Internal state
 */
let autoSaveTimer: NodeJS.Timeout | null = null;
let getStateFunction: (() => GameState) | null = null;
let currentConfig: Required<AutoSaveConfig> = { ...DEFAULT_CONFIG };
let lastSaveTime: number | null = null;
let enabled = false;

/**
 * Sets up auto-save system
 *
 * @param getState - Function that returns current game state
 * @param config - Auto-save configuration
 */
export function setupAutoSave(getState: () => GameState, config: AutoSaveConfig): void {
  // Stop existing auto-save if running
  stopAutoSave();

  // Store state getter and config
  getStateFunction = getState;
  currentConfig = { ...DEFAULT_CONFIG, ...config };
  enabled = config.enabled;

  // Start timer if enabled
  if (enabled) {
    startAutoSaveTimer();
  }
}

/**
 * Stops auto-save system
 */
export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
  enabled = false;
}

/**
 * Manually triggers a save immediately
 */
export function triggerAutoSave(): void {
  if (!getStateFunction) {
    console.warn('Auto-save not initialized. Call setupAutoSave first.');
    return;
  }

  // Check throttling
  if (lastSaveTime && currentConfig.minIntervalMs) {
    const timeSinceLastSave = Date.now() - lastSaveTime;
    if (timeSinceLastSave < currentConfig.minIntervalMs) {
      // Too soon since last save, skip
      return;
    }
  }

  performSave();
}

/**
 * Changes the auto-save interval
 *
 * @param intervalMs - New interval in milliseconds
 */
export function setAutoSaveInterval(intervalMs: number): void {
  if (intervalMs <= 0) {
    throw new Error('Auto-save interval must be positive');
  }

  currentConfig.intervalMs = intervalMs;

  // Restart timer with new interval if enabled
  if (enabled) {
    stopAutoSave();
    enabled = true;
    startAutoSaveTimer();
  }
}

/**
 * Checks if auto-save is currently enabled
 *
 * @returns True if auto-save is running
 */
export function isAutoSaveEnabled(): boolean {
  return enabled;
}

/**
 * Gets timestamp of last auto-save
 *
 * @returns Timestamp in milliseconds, or null if no saves yet
 */
export function getLastAutoSaveTime(): number | null {
  return lastSaveTime;
}

/**
 * Internal: Starts the auto-save timer
 */
function startAutoSaveTimer(): void {
  autoSaveTimer = setInterval(() => {
    performSave();
  }, currentConfig.intervalMs);
}

/**
 * Internal: Performs the actual save operation
 */
function performSave(): void {
  if (!getStateFunction) {
    return;
  }

  try {
    // Get current game state
    const gameState = getStateFunction();

    // Save to localStorage
    const result = saveGame(gameState);

    // Update last save time
    lastSaveTime = Date.now();

    // Call appropriate callback
    if (result.success) {
      currentConfig.onSuccess();
    } else if (result.error) {
      currentConfig.onError(result.error);
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Auto-save error:', error);
    const saveError =
      error instanceof SaveLoadError
        ? error
        : new SaveLoadError(
            error instanceof Error ? error.message : 'Unknown error',
            'SERIALIZATION_ERROR' as any
          );
    currentConfig.onError(saveError);
  }
}

/**
 * Cleanup function for page unload
 * Should be called in beforeunload handler
 */
export function autoSaveCleanup(): void {
  // Perform final save
  if (enabled && getStateFunction) {
    try {
      const gameState = getStateFunction();
      saveGame(gameState);
    } catch (error) {
      console.error('Final auto-save failed:', error);
    }
  }

  // Stop auto-save
  stopAutoSave();
}
