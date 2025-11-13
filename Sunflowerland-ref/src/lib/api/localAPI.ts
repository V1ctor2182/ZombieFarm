/**
 * Local API Client for Zombie Farm
 * Replaces server API calls with local operations
 */

import { LocalSaveSystem } from "../storage/localSaveSystem";
import { authManager } from "../auth/localAuth";
import { randomID } from "../utils/random";

const saveSystem = new LocalSaveSystem();

/**
 * Mock API responses for compatibility
 */
export class LocalAPI {
  /**
   * Load game session (from localStorage)
   */
  async loadSession(farmId?: number): Promise<any> {
    console.log("📂 Loading local session...");

    const user = authManager.getCurrentUser();
    if (!user) {
      throw new Error("No user authenticated");
    }

    const saveData = saveSystem.load();

    if (!saveData) {
      // Return new game state
      return {
        farm: {
          id: parseInt(user.farmId.replace('farm_', '')) || Math.floor(Math.random() * 100000),
          address: user.id,
          createdAt: user.createdAt,
        },
        state: this.getDefaultGameState(),
        sessionId: `session_${randomID()}`,
      };
    }

    return {
      farm: {
        id: saveData.farmId,
        address: user.id,
        createdAt: user.createdAt,
      },
      state: saveData.gameState,
      sessionId: `session_${randomID()}`,
    };
  }

  /**
   * Save game session (to localStorage)
   */
  async saveSession(state: any): Promise<{ success: boolean }> {
    console.log("💾 Saving local session...");

    try {
      saveSystem.save(state);
      return { success: true };
    } catch (error) {
      console.error("Failed to save session:", error);
      return { success: false };
    }
  }

  /**
   * Sync session (no-op in local mode)
   */
  async sync(state: any): Promise<any> {
    console.log("🔄 Syncing (local mode - saved to localStorage)");
    await this.saveSession(state);
    return { state, verified: true };
  }

  /**
   * Get default game state for new players
   */
  private getDefaultGameState(): any {
    return {
      balance: "0",
      inventory: {
        "Dark Seeds": "10", // Start with some zombie seeds
      },
      zombies: {}, // Empty zombie collection
      plots: {},
      trees: {},
      stones: {},
      iron: {},
      gold: {},
      buildings: {},
      collectibles: {},
      wardrobe: {},
      experience: 0,
      level: 1,
      battleStats: {
        totalBattles: 0,
        victories: 0,
        defeats: 0,
        zombiesLost: 0,
      },
      createdAt: Date.now(),
    };
  }

  /**
   * Get leaderboard (mock data)
   */
  async getLeaderboard(): Promise<any[]> {
    return [
      { rank: 1, username: "DarkLord666", victories: 100, zombies: 50 },
      { rank: 2, username: "NecroMaster", victories: 85, zombies: 42 },
      { rank: 3, username: "ZombieKing", victories: 72, zombies: 38 },
    ];
  }

  /**
   * Get game config (local config)
   */
  async getConfig(): Promise<any> {
    return {
      version: "1.0.0-zombie",
      features: {
        combat: true,
        zombies: true,
        blockchain: false,
        marketplace: false,
      },
    };
  }

  /**
   * Check blacklist status (always OK in local mode)
   */
  async checkBlacklist(): Promise<{ status: string }> {
    return { status: "OK" };
  }

  /**
   * Claim achievement (local only)
   */
  async claimAchievement(achievement: string): Promise<any> {
    console.log("🏆 Achievement claimed:", achievement);
    return { success: true, reward: {} };
  }

  /**
   * Get announcements (empty in local mode)
   */
  async getAnnouncements(): Promise<any[]> {
    return [];
  }

  /**
   * Submit feedback (log only)
   */
  async submitFeedback(feedback: string): Promise<{ success: boolean }> {
    console.log("📝 Feedback received:", feedback);
    return { success: true };
  }

  /**
   * Export save data
   */
  exportSave(): string {
    const data = saveSystem.load();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import save data
   */
  importSave(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      saveSystem.save(data.gameState);
      console.log("✅ Save imported successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to import save:", error);
      return false;
    }
  }

  /**
   * Reset game (clear all data)
   */
  resetGame(): void {
    localStorage.removeItem(saveSystem["SAVE_KEY"]);
    console.log("🔄 Game reset - all data cleared");
  }
}

// Singleton instance
export const localAPI = new LocalAPI();

// Export as default
export default localAPI;

/**
 * Auto-save helper
 */
export class AutoSaveManager {
  private interval: NodeJS.Timeout | null = null;
  private saveCallback: (() => void) | null = null;

  start(callback: () => void, intervalMs: number = 30000): void {
    this.stop(); // Clear any existing interval

    this.saveCallback = callback;
    this.interval = setInterval(() => {
      console.log("⏰ Auto-saving...");
      callback();
    }, intervalMs);

    console.log(`🔄 Auto-save enabled (every ${intervalMs / 1000}s)`);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("⏸️ Auto-save disabled");
    }
  }

  saveNow(): void {
    if (this.saveCallback) {
      console.log("💾 Manual save triggered");
      this.saveCallback();
    }
  }
}

export const autoSaveManager = new AutoSaveManager();