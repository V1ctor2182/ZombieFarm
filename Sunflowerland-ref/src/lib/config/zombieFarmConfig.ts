/**
 * Zombie Farm Configuration Override
 * Disables blockchain/API dependencies for local-only gameplay
 */

import { CONFIG as ORIGINAL_CONFIG } from "../config";

// Override configuration for Zombie Farm mode
export const ZOMBIE_FARM_CONFIG = {
  ...ORIGINAL_CONFIG,

  // Disable API endpoints
  API_URL: undefined,
  PORTAL_API_URL: undefined,

  // Disable blockchain
  NETWORK: "local" as const,
  POLYGON_CHAIN_ID: 0,

  // Enable offline mode
  OFFLINE_MODE: true,

  // Disable Web3 features
  ENABLE_BLOCKCHAIN: false,
  ENABLE_DEPOSITS: false,
  ENABLE_WITHDRAWALS: false,
  ENABLE_MARKETPLACE: false,

  // Local storage only
  STORAGE_MODE: "local" as const,

  // Game settings
  ZOMBIE_FARM_MODE: true,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds

  // Debug settings
  DEBUG_MODE: true,
  SHOW_TIMERS: false,
};

// Export as default CONFIG for easy replacement
export const CONFIG = ZOMBIE_FARM_CONFIG;

/**
 * Check if we're in Zombie Farm mode
 */
export function isZombieFarmMode(): boolean {
  return ZOMBIE_FARM_CONFIG.ZOMBIE_FARM_MODE === true;
}

/**
 * Get save interval
 */
export function getAutoSaveInterval(): number {
  return ZOMBIE_FARM_CONFIG.AUTO_SAVE_INTERVAL;
}