/**
 * Combat State Factory
 * Creates test CombatState objects per DOMAIN-COMBAT.md
 */

import type { CombatState } from '../../../types';
import { BattlePhase } from '../../../types';

export function createTestCombatState(overrides?: Partial<CombatState>): CombatState {
  const defaultCombatState: CombatState = {
    isInBattle: false,
    currentBattle: null,
    battleHistory: [],
    availableLocations: [],
  } as CombatState;

  return { ...defaultCombatState, ...overrides };
}

export function createActiveCombatState(): CombatState {
  return createTestCombatState({
    isInBattle: true,
  });
}

export function createCombatStateInPreparation(): CombatState {
  return createTestCombatState({
    isInBattle: true,
  });
}

export function createCompletedCombatState(victories: number = 5): CombatState {
  const battleHistory = Array.from({ length: victories }, (_, i) => ({
    battleId: `battle-${i + 1}`,
    locationId: `location-${i + 1}`,
    result: 'victory' as const,
    timestamp: Date.now() - i * 1000 * 60 * 60,
  }));

  return createTestCombatState({
    battleHistory: battleHistory as any,
  });
}
