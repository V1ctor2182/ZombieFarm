/**
 * Mock Wallet Client for Zombie Farm
 * Replaces Web3 wallet (Metamask, WalletConnect, etc.)
 */

import { authManager, LocalUser } from "../auth/localAuth";
import { randomID } from "../utils/random";

export interface MockWalletAccount {
  address: string;
  connector: {
    id: string;
    name: string;
  };
}

export class MockWalletClient {
  private isConnecting = false;
  private _isConnected = false;
  private currentAccount: MockWalletAccount | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // Auto-restore session if exists
    this.restoreSession();
  }

  /**
   * Restore previous session
   */
  private restoreSession(): void {
    const user = authManager.getCurrentUser();
    if (user) {
      this.currentAccount = {
        address: user.id,
        connector: {
          id: "zombie-local",
          name: "Zombie Farm Local",
        },
      };
      this._isConnected = true;
    }
  }

  /**
   * Connect "wallet" (actually just creates/loads local user)
   */
  async connect(): Promise<MockWalletAccount> {
    if (this.isConnecting) {
      throw new Error("Connection already in progress");
    }

    if (this._isConnected && this.currentAccount) {
      return this.currentAccount;
    }

    this.isConnecting = true;

    try {
      // Sign in with local auth
      const user = await authManager.signIn();

      this.currentAccount = {
        address: user.id,
        connector: {
          id: "zombie-local",
          name: "Zombie Farm Local",
        },
      };

      this._isConnected = true;
      this.isConnecting = false;

      // Emit connect event
      this.emit("connect", this.currentAccount);

      console.log("🧟 Wallet connected:", user.username);

      return this.currentAccount;
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Disconnect "wallet"
   */
  disconnect(): void {
    if (!this._isConnected) return;

    const previousAccount = this.currentAccount;
    this.currentAccount = null;
    this._isConnected = false;

    // Emit disconnect event
    this.emit("disconnect", previousAccount);

    console.log("👋 Wallet disconnected");
  }

  /**
   * Get current account
   */
  getAccount(): MockWalletAccount | null {
    return this.currentAccount;
  }

  /**
   * Get address
   */
  getAddress(): string | null {
    return this.currentAccount?.address || null;
  }

  /**
   * Check if connected
   */
  isConnectedWallet(): boolean {
    return this._isConnected;
  }

  /**
   * Sign a message (mock)
   */
  async signMessage(message: string): Promise<string> {
    if (!this._isConnected) {
      throw new Error("Wallet not connected");
    }

    // Generate a deterministic "signature" based on message and user ID
    const user = authManager.getCurrentUser();
    const signature = `0x${Buffer.from(
      `${user?.id}_${message}_${randomID()}`
    ).toString("hex")}`;

    console.log("✍️ Message signed:", message.substring(0, 50) + "...");

    return signature;
  }

  /**
   * Get chain ID (always "local")
   */
  getChainId(): number {
    return 0; // Local chain
  }

  /**
   * Switch network (no-op for local)
   */
  async switchNetwork(chainId: number): Promise<void> {
    console.log("🔗 Network switch requested (ignored in local mode)");
    // No-op for local mode
  }

  /**
   * Get balance (always 0 since no real tokens)
   */
  async getBalance(): Promise<string> {
    return "0";
  }

  /**
   * Send transaction (disabled)
   */
  async sendTransaction(tx: any): Promise<string> {
    throw new Error(
      "Blockchain transactions are disabled in Zombie Farm. All game state is stored locally."
    );
  }

  /**
   * Event emitter
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  /**
   * Watch account changes
   */
  watchAccount(callback: (account: MockWalletAccount | null) => void): () => void {
    this.on("connect", callback);
    this.on("disconnect", () => callback(null));

    // Return cleanup function
    return () => {
      this.off("connect", callback);
      this.off("disconnect", callback);
    };
  }
}

// Singleton instance
export const mockWallet = new MockWalletClient();

// Export as default for easy import
export default mockWallet;

/**
 * Hook-like interface for React compatibility
 */
export function useMockWallet() {
  return {
    address: mockWallet.getAddress(),
    isConnected: mockWallet.isConnectedWallet(),
    connect: () => mockWallet.connect(),
    disconnect: () => mockWallet.disconnect(),
    signMessage: (msg: string) => mockWallet.signMessage(msg),
  };
}

/**
 * Provider component helper (for compatibility)
 */
export const MockWalletProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};