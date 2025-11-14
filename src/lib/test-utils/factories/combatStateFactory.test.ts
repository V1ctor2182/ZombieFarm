/**
 * Combat State Factory Tests
 */

import {
  createTestCombatState,
  createActiveCombatState,
  createCombatStateInPreparation,
  createCompletedCombatState,
} from './combatStateFactory';

describe('combatStateFactory', () => {
  describe('createTestCombatState', () => {
    it('creates valid CombatState', () => {
      const combat = createTestCombatState();
      expect(combat).toBeDefined();
      expect(combat.isInBattle).toBe(false);
    });

    it('has no current battle by default', () => {
      const combat = createTestCombatState();
      expect(combat.currentBattle).toBeNull();
    });

    it('has empty battle history', () => {
      const combat = createTestCombatState();
      expect(combat.battleHistory).toEqual([]);
    });

    it('allows overriding isInBattle', () => {
      const combat = createTestCombatState({ isInBattle: true });
      expect(combat.isInBattle).toBe(true);
    });
  });

  describe('createActiveCombatState', () => {
    it('creates combat state with active battle', () => {
      const combat = createActiveCombatState();
      expect(combat.isInBattle).toBe(true);
    });
  });

  describe('createCombatStateInPreparation', () => {
    it('creates combat state in preparation', () => {
      const combat = createCombatStateInPreparation();
      expect(combat.isInBattle).toBe(true);
    });
  });

  describe('createCompletedCombatState', () => {
    it('has battle history', () => {
      const combat = createCompletedCombatState(5);
      expect(combat.battleHistory).toHaveLength(5);
    });

    it('defaults to 5 victories', () => {
      const combat = createCompletedCombatState();
      expect(combat.battleHistory).toHaveLength(5);
    });

    it('all battles have IDs', () => {
      const combat = createCompletedCombatState(3);
      expect(combat.battleHistory.every((b) => b.battleId)).toBe(true);
    });
  });
});
