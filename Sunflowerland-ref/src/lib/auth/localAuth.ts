/**
 * Simplified Local Authentication for Zombie Farm
 * Replaces Web3 wallet authentication with local user system
 */

import { randomID } from "lib/utils/random";

export interface LocalUser {
  id: string;
  username: string;
  farmId: string;
  createdAt: number;
  lastLogin: number;
}

export class LocalAuthManager {
  private readonly STORAGE_KEY = "zombie_farm_user";
  private currentUser: LocalUser | null = null;

  constructor() {
    this.loadUser();
  }

  /**
   * Load existing user from localStorage
   */
  private loadUser(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        // Update last login
        if (this.currentUser) {
          this.currentUser.lastLogin = Date.now();
          this.saveUser();
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      this.currentUser = null;
    }
  }

  /**
   * Save user to localStorage
   */
  private saveUser(): void {
    if (this.currentUser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    }
  }

  /**
   * Create a new user (replaces wallet connection)
   */
  public async createUser(username?: string): Promise<LocalUser> {
    const userId = `user_${randomID()}`;
    const farmId = `farm_${randomID()}`;

    this.currentUser = {
      id: userId,
      username: username || `Necromancer${Math.floor(Math.random() * 9999)}`,
      farmId,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };

    this.saveUser();
    console.log("🧟 Created new necromancer:", this.currentUser.username);

    return this.currentUser;
  }

  /**
   * Sign in (automatically creates user if none exists)
   */
  public async signIn(): Promise<LocalUser> {
    if (this.currentUser) {
      console.log("🧟 Welcome back,", this.currentUser.username);
      return this.currentUser;
    }

    return this.createUser();
  }

  /**
   * Sign out (just clears current session, doesn't delete user)
   */
  public signOut(): void {
    console.log("👋 Goodbye,", this.currentUser?.username);
    // Note: We keep the user data for next login
    // Just clear the current session reference
    this.currentUser = null;
  }

  /**
   * Delete user account completely
   */
  public deleteAccount(): void {
    console.log("💀 Deleting account:", this.currentUser?.username);
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser = null;
  }

  /**
   * Get current user
   */
  public getCurrentUser(): LocalUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get a mock "address" for compatibility
   * (Some parts of the code expect an address)
   */
  public getAddress(): string {
    return this.currentUser?.id || "0x0000000000000000000000000000000000000000";
  }

  /**
   * Update username
   */
  public updateUsername(newUsername: string): void {
    if (this.currentUser) {
      this.currentUser.username = newUsername;
      this.saveUser();
      console.log("✏️ Username updated to:", newUsername);
    }
  }
}

// Singleton instance
export const authManager = new LocalAuthManager();

// Mock wallet provider for compatibility
export const mockWalletProvider = {
  address: () => authManager.getAddress(),
  isConnected: () => authManager.isAuthenticated(),
  connect: async () => {
    const user = await authManager.signIn();
    return user.id;
  },
  disconnect: () => authManager.signOut(),
  switchNetwork: async () => true,
  getBalance: async () => "0",
  sendTransaction: async () => {
    throw new Error("Blockchain transactions disabled in Zombie Farm");
  },
};

/**
 * Replace Web3 authentication with local auth
 */
export async function authenticateUser(): Promise<{
  success: boolean;
  user?: LocalUser;
  error?: string;
}> {
  try {
    const user = await authManager.signIn();
    return { success: true, user };
  } catch (error) {
    console.error("Authentication failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}