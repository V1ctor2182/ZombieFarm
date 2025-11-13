/**
 * Local Save System for Zombie Farm
 * Replaces all blockchain/Web3 functionality with local storage
 */

export interface SaveData {
  version: string;
  farmId: string;
  lastSaved: number;
  gameState: any; // Will be properly typed as GameState
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  autoSave: boolean;
}

export class LocalSaveSystem {
  private readonly SAVE_KEY = 'zombie_farm_save';
  private readonly BACKUP_KEY = 'zombie_farm_backup';
  private readonly SETTINGS_KEY = 'zombie_farm_settings';

  /**
   * Save the current game state
   */
  save(state: any): void {
    const saveData: SaveData = {
      version: '1.0.0',
      farmId: state.farmId || this.generateFarmId(),
      lastSaved: Date.now(),
      gameState: state,
      settings: this.getSettings()
    };

    // Create backup of previous save
    const current = localStorage.getItem(this.SAVE_KEY);
    if (current) {
      localStorage.setItem(this.BACKUP_KEY, current);
    }

    // Save new state
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    console.log('🧟 Game saved locally at', new Date().toLocaleTimeString());
  }

  /**
   * Load saved game state
   */
  load(): SaveData | null {
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (!saved) {
      console.log('🧟 No saved game found');
      return null;
    }

    try {
      const data = JSON.parse(saved);
      console.log('🧟 Game loaded from', new Date(data.lastSaved).toLocaleString());
      return data;
    } catch (e) {
      console.error('Failed to load save:', e);
      return this.loadBackup();
    }
  }

  /**
   * Load backup save if main save is corrupted
   */
  loadBackup(): SaveData | null {
    const backup = localStorage.getItem(this.BACKUP_KEY);
    if (!backup) return null;

    try {
      console.log('🧟 Loading from backup save');
      return JSON.parse(backup);
    } catch (e) {
      console.error('Backup save also corrupted:', e);
      return null;
    }
  }

  /**
   * Export save as base64 string for sharing
   */
  exportSave(): string {
    const save = this.load();
    if (!save) return '';
    return btoa(JSON.stringify(save));
  }

  /**
   * Import save from base64 string
   */
  importSave(encoded: string): boolean {
    try {
      const decoded = atob(encoded);
      const saveData = JSON.parse(decoded);

      // Validate save data
      if (!saveData.version || !saveData.farmId || !saveData.gameState) {
        throw new Error('Invalid save format');
      }

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('🧟 Save imported successfully');
      return true;
    } catch (e) {
      console.error('Failed to import save:', e);
      return false;
    }
  }

  /**
   * Clear all saves
   */
  clearSaves(): void {
    localStorage.removeItem(this.SAVE_KEY);
    localStorage.removeItem(this.BACKUP_KEY);
    console.log('🧟 All saves cleared');
  }

  /**
   * Get game settings
   */
  getSettings(): GameSettings {
    const saved = localStorage.getItem(this.SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    // Default settings
    return {
      soundEnabled: true,
      musicEnabled: true,
      graphicsQuality: 'medium',
      autoSave: true
    };
  }

  /**
   * Save game settings
   */
  saveSettings(settings: GameSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Generate a unique farm ID for new games
   */
  private generateFarmId(): string {
    return 'ZFARM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Check if save exists
   */
  hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Get save metadata without loading full game
   */
  getSaveInfo(): { farmId: string; lastSaved: Date } | null {
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (!saved) return null;

    try {
      const data = JSON.parse(saved);
      return {
        farmId: data.farmId,
        lastSaved: new Date(data.lastSaved)
      };
    } catch (e) {
      return null;
    }
  }
}

// Export singleton instance
export const saveSystem = new LocalSaveSystem();