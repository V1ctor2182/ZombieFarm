/**
 * Plot Factory
 *
 * Factory functions for creating test Plot objects.
 * Per DOMAIN-FARM.md: Plots are farming locations for zombie seeds.
 */

import type { Plot } from '../../../types/farm';
import { PlotState } from '../../../types/farm';

/**
 * Generates a unique plot ID for tests
 */
let plotIdCounter = 1;
function generatePlotId(): string {
  return `test-plot-${plotIdCounter++}`;
}

/**
 * Creates a test Plot with sensible defaults
 *
 * @param overrides - Partial Plot to override defaults
 * @returns Complete Plot object
 */
export function createTestPlot(overrides?: Partial<Plot>): Plot {
  const defaultPlot: Plot = {
    id: generatePlotId(),
    position: { x: 0, y: 0 },
    state: PlotState.EMPTY,
    plantedSeed: null,
    plantedAt: null,
    baseGrowthTime: null,
    growthTimeRemaining: null,
    isWatered: false,
    isFertilized: false,
    zombieId: null,
  };

  return {
    ...defaultPlot,
    ...overrides,
  };
}

/**
 * Creates a plot with planted seed (PLANTED state)
 */
export function createPlantedPlot(overrides?: Partial<Plot>): Plot {
  return createTestPlot({
    state: PlotState.PLANTED,
    plantedSeed: 'shamblerSeed',
    plantedAt: Date.now(),
    baseGrowthTime: 300000, // 5 minutes
    growthTimeRemaining: 300000,
    ...overrides,
  });
}

/**
 * Creates a plot ready to harvest (READY state)
 */
export function createReadyPlot(overrides?: Partial<Plot>): Plot {
  return createTestPlot({
    state: PlotState.READY,
    plantedSeed: 'shamblerSeed',
    plantedAt: Date.now() - 300000, // Planted 5 minutes ago
    baseGrowthTime: 300000,
    growthTimeRemaining: 0,
    zombieId: 'zombie-ready',
    ...overrides,
  });
}
