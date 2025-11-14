/**
 * Farm State Factory
 * Creates test FarmState objects per DOMAIN-FARM.md
 */

import type { FarmState, Plot } from '../../../types';
import { PlotState } from '../../../types';

export function createTestFarmState(overrides?: Partial<FarmState>): FarmState {
  const defaultFarmState: FarmState = {
    plots: [],
    activeZombies: [],
    cryptZombies: [],
    buildings: [],
    resourceNodes: [],
    farmLevel: 1,
    farmExpansions: 0,
    lastDecayUpdate: Date.now(),
  };

  return { ...defaultFarmState, ...overrides };
}

export function createFarmStateWithPlots(plotCount: number): FarmState {
  const plots: Plot[] = [];
  for (let i = 0; i < plotCount; i++) {
    plots.push({
      id: `plot-${i + 1}`,
      position: { x: i * 2, y: 0 },
      state: PlotState.EMPTY,
      seed: null,
      zombieId: null,
      plantedAt: null,
      growthProgress: 0,
      lastWatered: null,
      lastFertilized: null,
    });
  }
  return createTestFarmState({ plots });
}

export function createFarmStateWithZombies(zombieIds: string[]): FarmState {
  return createTestFarmState({ activeZombies: zombieIds });
}

export function createEmptyFarmState(): FarmState {
  return createTestFarmState({
    plots: [],
    activeZombies: [],
    cryptZombies: [],
    buildings: [],
  });
}

export function createAdvancedFarmState(): FarmState {
  return createTestFarmState({
    farmLevel: 15,
    farmExpansions: 3,
  });
}
