/**
 * Farm State Factory Tests
 */

import {
  createTestFarmState,
  createFarmStateWithPlots,
  createFarmStateWithZombies,
  createEmptyFarmState,
  createAdvancedFarmState,
} from './farmStateFactory';
import { PlotState } from '../../../types';

describe('farmStateFactory', () => {
  describe('createTestFarmState', () => {
    it('creates valid FarmState', () => {
      const farm = createTestFarmState();
      expect(farm).toBeDefined();
      expect(farm.farmLevel).toBe(1);
    });

    it('has empty collections by default', () => {
      const farm = createTestFarmState();
      expect(farm.plots).toEqual([]);
      expect(farm.activeZombies).toEqual([]);
    });

    it('allows overriding farmLevel', () => {
      const farm = createTestFarmState({ farmLevel: 10 });
      expect(farm.farmLevel).toBe(10);
    });

    it('has lastDecayUpdate timestamp', () => {
      const farm = createTestFarmState();
      expect(farm.lastDecayUpdate).toBeGreaterThan(0);
    });
  });

  describe('createFarmStateWithPlots', () => {
    it('creates farm with specified plot count', () => {
      const farm = createFarmStateWithPlots(5);
      expect(farm.plots).toHaveLength(5);
    });

    it('all plots are EMPTY state', () => {
      const farm = createFarmStateWithPlots(3);
      expect(farm.plots.every((p) => p.state === PlotState.EMPTY)).toBe(true);
    });

    it('plots have unique IDs', () => {
      const farm = createFarmStateWithPlots(5);
      const ids = farm.plots.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('createFarmStateWithZombies', () => {
    it('creates farm with specified zombie IDs', () => {
      const farm = createFarmStateWithZombies(['z1', 'z2', 'z3']);
      expect(farm.activeZombies).toEqual(['z1', 'z2', 'z3']);
    });
  });

  describe('createEmptyFarmState', () => {
    it('has no plots', () => {
      const farm = createEmptyFarmState();
      expect(farm.plots).toEqual([]);
    });

    it('has no zombies', () => {
      const farm = createEmptyFarmState();
      expect(farm.activeZombies).toEqual([]);
      expect(farm.cryptZombies).toEqual([]);
    });
  });

  describe('createAdvancedFarmState', () => {
    it('has high farm level', () => {
      const farm = createAdvancedFarmState();
      expect(farm.farmLevel).toBe(15);
    });

    it('has expansions', () => {
      const farm = createAdvancedFarmState();
      expect(farm.farmExpansions).toBe(3);
    });
  });
});
