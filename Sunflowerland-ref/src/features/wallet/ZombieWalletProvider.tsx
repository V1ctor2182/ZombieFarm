/**
 * 🧟 Zombie Farm Wallet Provider
 * Bypasses all Web3/blockchain wallet connections
 * Uses local authentication only
 */
import React from "react";

/**
 * Simplified wallet provider for Zombie Farm
 * No wagmi, no Web3 providers, no blockchain connections
 */
export const ZombieWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Simply render children without any Web3 setup
  // Zombie Farm uses local auth initialized in main.tsx
  return <>{children}</>;
};
