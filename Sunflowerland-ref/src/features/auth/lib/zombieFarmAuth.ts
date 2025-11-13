/**
 * Zombie Farm Authentication Override
 * Bypasses Web3/blockchain authentication for local play
 */

import { authManager } from "lib/auth/localAuth";
import { CONFIG } from "lib/config";
import { randomID } from "lib/utils/random";

// Mock token for compatibility
export interface ZombieToken {
  address: string;
  farmId: number;
  rawToken: string;
  userId: string;
  jwt: string;
}

/**
 * Quick auth bypass for Zombie Farm
 * Creates a local user and returns mock authentication
 */
export async function zombieFarmQuickAuth(): Promise<{
  success: boolean;
  token?: ZombieToken;
  error?: string;
}> {
  try {
    // Sign in with local auth
    const user = await authManager.signIn();

    // Create mock token that looks like the expected format
    const mockToken: ZombieToken = {
      address: user.id,
      farmId: parseInt(user.farmId.replace('farm_', '')) || Math.floor(Math.random() * 100000),
      rawToken: `zombie_token_${randomID()}`,
      userId: user.id,
      jwt: `mock_jwt_${randomID()}`,
    };

    // Store in session storage for compatibility
    sessionStorage.setItem("zombie_farm_auth", JSON.stringify({
      token: mockToken,
      user: user,
      timestamp: Date.now(),
    }));

    console.log("🧟 Zombie Farm authenticated:", user.username);

    return { success: true, token: mockToken };
  } catch (error) {
    console.error("Zombie Farm auth failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
}

/**
 * Check if Zombie Farm auth is active
 */
export function isZombieFarmMode(): boolean {
  // Always true for Zombie Farm
  return true;
}

/**
 * Get current zombie farm session
 */
export function getZombieFarmSession(): any {
  const stored = sessionStorage.getItem("zombie_farm_auth");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Clear zombie farm session
 */
export function clearZombieFarmSession(): void {
  sessionStorage.removeItem("zombie_farm_auth");
  authManager.signOut();
}

/**
 * Mock wallet connection for compatibility
 */
export const mockWallet = {
  address: null as string | null,
  isConnecting: false,
  isConnected: false,

  async connect(): Promise<string> {
    const auth = await zombieFarmQuickAuth();
    if (auth.success && auth.token) {
      this.address = auth.token.address;
      this.isConnected = true;
      return auth.token.address;
    }
    throw new Error("Failed to connect");
  },

  disconnect(): void {
    this.address = null;
    this.isConnected = false;
    clearZombieFarmSession();
  },

  async signMessage(message: string): Promise<string> {
    // Return a mock signature
    return `zombie_sig_${randomID()}`;
  },
};

// Auto-authenticate on load for seamless experience
if (typeof window !== "undefined") {
  window.addEventListener("load", async () => {
    console.log("🧟 Initializing Zombie Farm mode...");

    // Check if we already have a session
    const existingSession = getZombieFarmSession();
    if (!existingSession) {
      // Auto-create session for seamless play
      await zombieFarmQuickAuth();
    } else {
      console.log("🧟 Resuming session for:", existingSession.user.username);
    }
  });
}