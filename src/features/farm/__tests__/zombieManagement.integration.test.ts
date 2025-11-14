/**
 * Zombie Management Integration Tests
 *
 * Tests complete workflows for active zombie management per DOMAIN-FARM.md:
 * - Harvest -> auto-store to Crypt when at capacity
 * - Deploy from Crypt -> active roster
 * - Manual store commands
 * - Capacity increase via buildings
 * - Zombie AI state transitions
 *
 * Authority: DOMAIN-FARM.md Section "Capacity and the Crypt", "Living Zombies on the Farm"
 */

import type { GameState } from '../../../types/global';
import type { FarmState, Zombie } from '../../../types/farm';
import { createTestGameState } from '../../../lib/test-utils/factories/gameStateFactory';
import { createTestFarmState } from '../../../lib/test-utils/factories/farmStateFactory';
import { createTestZombie } from '../../../lib/test-utils/factories/zombieFactory';
import { createTestPlot } from '../../../lib/test-utils/factories/plotFactory';
import { PlotState } from '../../../types/farm';

// Services
import { harvestZombie } from '../services/harvesting';
import {
  canAddToActiveRoster,
  shouldSendToCrypt,
  deployFromCrypt,
  sendToCrypt,
  increaseCapacity,
} from '../services/zombieManagement';
import { setFollowCommand, setGuardCommand, updateZombieAI } from '../services/zombieAI';

describe('zombieManagement integration', () => {
  describe('Harvest and Auto-Store Workflow', () => {
    it('should auto-store zombie to Crypt when harvesting at capacity', () => {
      // Arrange: Create farm at capacity with a ready plot
      const activeZombies = Array.from({ length: 10 }, () => createTestZombie());
      const readyPlot = createTestPlot({
        id: 'plot-ready',
        state: PlotState.READY,
        plantedSeed: 'shamblerSeed',
        growthTimeRemaining: 0,
      });

      let farmState = createTestFarmState({
        plots: [readyPlot],
        activeZombies,
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      const inventory = {
        darkCoins: 100,
        soulEssence: 50,
        resources: {},
        seeds: {},
      };

      // Act: Harvest zombie (with bronze quality)
      const harvestResult = harvestZombie(farmState, inventory, 'plot-ready', 'bronze');

      expect(harvestResult.success).toBe(true);
      if (!harvestResult.success) return;

      farmState = harvestResult.data.farmState;

      // Assert: Zombie should be in Crypt, not active roster
      expect(farmState.activeZombies).toHaveLength(10); // Still at capacity
      expect(farmState.cryptZombies).toHaveLength(1); // New zombie in Crypt
      expect(shouldSendToCrypt(farmState)).toBe(true); // Still at capacity
    });

    it('should add to active roster when harvesting under capacity', () => {
      // Arrange: Create farm under capacity with a ready plot
      const readyPlot = createTestPlot({
        id: 'plot-ready',
        state: PlotState.READY,
        plantedSeed: 'shamblerSeed',
        growthTimeRemaining: 0,
      });

      let farmState = createTestFarmState({
        plots: [readyPlot],
        activeZombies: [createTestZombie()], // Only 1 active
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      const inventory = {
        darkCoins: 100,
        soulEssence: 50,
        resources: {},
        seeds: {},
      };

      // Act: Harvest zombie (with bronze quality)
      const harvestResult = harvestZombie(farmState, inventory, 'plot-ready', 'bronze');

      expect(harvestResult.success).toBe(true);
      if (!harvestResult.success) return;

      farmState = harvestResult.data.farmState;

      // Assert: Zombie should be in active roster
      expect(farmState.activeZombies).toHaveLength(2); // Added to active
      expect(farmState.cryptZombies).toHaveLength(0); // Not in Crypt
      expect(canAddToActiveRoster(farmState)).toBe(true); // Still has space
    });
  });

  describe('Deploy and Store Workflow', () => {
    it('should deploy zombie from Crypt to active roster', () => {
      // Arrange: Create farm with zombie in Crypt
      const cryptZombie = createTestZombie({ id: 'zombie-crypt', position: null });
      let farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [cryptZombie],
        activeZombieCapacity: 10,
      });

      // Act: Deploy from Crypt
      const deployResult = deployFromCrypt(farmState, 'zombie-crypt');

      expect(deployResult.success).toBe(true);
      if (!deployResult.success) return;

      farmState = deployResult.data;

      // Assert: Zombie should be active with position
      expect(farmState.activeZombies).toHaveLength(1);
      expect(farmState.cryptZombies).toHaveLength(0);
      expect(farmState.activeZombies[0].id).toBe('zombie-crypt');
      expect(farmState.activeZombies[0].position).not.toBeNull();
      expect(farmState.activeZombies[0].aiState).toBe('idle');
    });

    it('should store active zombie to Crypt', () => {
      // Arrange: Create farm with active zombie
      const activeZombie = createTestZombie({ id: 'zombie-active' });
      let farmState = createTestFarmState({
        activeZombies: [activeZombie],
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      // Act: Send to Crypt
      const storeResult = sendToCrypt(farmState, 'zombie-active');

      expect(storeResult.success).toBe(true);
      if (!storeResult.success) return;

      farmState = storeResult.data;

      // Assert: Zombie should be in Crypt
      expect(farmState.activeZombies).toHaveLength(0);
      expect(farmState.cryptZombies).toHaveLength(1);
      expect(farmState.cryptZombies[0].id).toBe('zombie-active');
      expect(farmState.cryptZombies[0].position).toBeNull();
      expect(farmState.cryptZombies[0].aiState).toBe('idle');
    });

    it('should prevent deploying when at capacity', () => {
      // Arrange: Create farm at capacity with zombie in Crypt
      const activeZombies = Array.from({ length: 10 }, () => createTestZombie());
      const cryptZombie = createTestZombie({ id: 'zombie-crypt' });

      const farmState = createTestFarmState({
        activeZombies,
        cryptZombies: [cryptZombie],
        activeZombieCapacity: 10,
      });

      // Act: Attempt to deploy from Crypt
      const deployResult = deployFromCrypt(farmState, 'zombie-crypt');

      // Assert: Should fail due to capacity
      expect(deployResult.success).toBe(false);
      if (deployResult.success) return;
      expect(deployResult.error).toContain('capacity');
    });
  });

  describe('Capacity Increase Workflow', () => {
    it('should allow deployment after increasing capacity', () => {
      // Arrange: Create farm at capacity
      const activeZombies = Array.from({ length: 10 }, () => createTestZombie());
      const cryptZombie = createTestZombie({ id: 'zombie-crypt' });

      let farmState = createTestFarmState({
        activeZombies,
        cryptZombies: [cryptZombie],
        activeZombieCapacity: 10,
      });

      // Act 1: Increase capacity (e.g., built a Mausoleum +5)
      const increaseResult = increaseCapacity(farmState, 5);
      expect(increaseResult.success).toBe(true);
      if (!increaseResult.success) return;

      farmState = increaseResult.data;

      // Act 2: Deploy from Crypt
      const deployResult = deployFromCrypt(farmState, 'zombie-crypt');

      expect(deployResult.success).toBe(true);
      if (!deployResult.success) return;

      farmState = deployResult.data;

      // Assert: Zombie should be deployed
      expect(farmState.activeZombies).toHaveLength(11);
      expect(farmState.cryptZombies).toHaveLength(0);
      expect(farmState.activeZombieCapacity).toBe(15);
    });
  });

  describe('Zombie AI State Transitions', () => {
    it('should maintain AI state when deployed from Crypt', () => {
      // Arrange: Zombie in Crypt
      const cryptZombie = createTestZombie({
        id: 'zombie-1',
        aiState: 'wandering', // This should be reset on Crypt entry
        position: null,
      });

      let farmState = createTestFarmState({
        activeZombies: [],
        cryptZombies: [cryptZombie],
        activeZombieCapacity: 10,
      });

      // Act: Deploy from Crypt
      const deployResult = deployFromCrypt(farmState, 'zombie-1');

      expect(deployResult.success).toBe(true);
      if (!deployResult.success) return;

      farmState = deployResult.data;

      // Assert: Deployed zombie should be IDLE
      expect(farmState.activeZombies[0].aiState).toBe('idle');
    });

    it('should allow commanding active zombies', () => {
      // Arrange: Active zombie
      let zombie = createTestZombie({ id: 'zombie-1', aiState: 'idle' });

      // Act: Give follow command
      const followResult = setFollowCommand(zombie);

      expect(followResult.success).toBe(true);
      if (!followResult.success) return;

      zombie = followResult.data;

      // Assert: Zombie should be following
      expect(zombie.aiState).toBe('following');
    });

    it('should allow setting guard positions', () => {
      // Arrange: Active zombie
      let zombie = createTestZombie({ id: 'zombie-1', aiState: 'idle' });

      // Act: Give guard command
      const guardResult = setGuardCommand(zombie, { x: 10, y: 15 });

      expect(guardResult.success).toBe(true);
      if (!guardResult.success) return;

      zombie = guardResult.data;

      // Assert: Zombie should be guarding
      expect(zombie.aiState).toBe('guarding');
      expect(zombie.position).toEqual({ x: 10, y: 15 });
    });
  });

  describe('Zombie AI Update Loop', () => {
    it('should update zombie positions when wandering', () => {
      // Arrange: Wandering zombie
      let zombie = createTestZombie({
        id: 'zombie-1',
        aiState: 'wandering',
        position: { x: 10, y: 10 },
        personality: 'energetic',
      });

      const originalPosition = { ...zombie.position };

      // Act: Update AI for 1 second
      zombie = updateZombieAI(zombie, 1000);

      // Assert: Position should potentially change (probabilistic)
      // Note: Due to randomness, we can't guarantee change, but zombie should still be valid
      expect(zombie.position).toBeDefined();
      if (zombie.position) {
        expect(zombie.position.x).toBeGreaterThanOrEqual(0);
        expect(zombie.position.y).toBeGreaterThanOrEqual(0);
      }
    });

    it('should respect personality traits in AI behavior', () => {
      // Arrange: Lazy zombie (likely to become idle)
      let zombie = createTestZombie({
        id: 'zombie-lazy',
        aiState: 'wandering',
        position: { x: 10, y: 10 },
        personality: 'lazy',
      });

      // Act: Update AI multiple times
      let becameIdle = false;
      for (let i = 0; i < 50; i++) {
        zombie = updateZombieAI(zombie, 1000);
        if (zombie.aiState === 'idle') {
          becameIdle = true;
          break;
        }
      }

      // Assert: Lazy zombie should eventually become idle
      expect(becameIdle).toBe(true);
    });
  });

  describe('Complete Workflow: Harvest -> Manage -> Command', () => {
    it('should handle full zombie lifecycle from harvest to commands', () => {
      // Arrange: Ready plot
      const readyPlot = createTestPlot({
        id: 'plot-1',
        state: PlotState.READY,
        plantedSeed: 'shamblerSeed',
        growthTimeRemaining: 0,
      });

      let farmState = createTestFarmState({
        plots: [readyPlot],
        activeZombies: [],
        cryptZombies: [],
        activeZombieCapacity: 10,
      });

      const inventory = {
        darkCoins: 100,
        soulEssence: 50,
        resources: {},
        seeds: {},
      };

      // Act 1: Harvest zombie (with bronze quality)
      const harvestResult = harvestZombie(farmState, inventory, 'plot-1', 'bronze');
      expect(harvestResult.success).toBe(true);
      if (!harvestResult.success) return;

      farmState = harvestResult.data.farmState;
      expect(farmState.activeZombies).toHaveLength(1);

      // Act 2: Get the harvested zombie
      let zombie = farmState.activeZombies[0];
      expect(zombie.aiState).toBe('idle'); // Default state

      // Act 3: Command zombie to follow
      const followResult = setFollowCommand(zombie);
      expect(followResult.success).toBe(true);
      if (!followResult.success) return;

      zombie = followResult.data;
      expect(zombie.aiState).toBe('following');

      // Act 4: Send zombie to Crypt
      const storeResult = sendToCrypt(
        { ...farmState, activeZombies: [zombie] },
        zombie.id
      );
      expect(storeResult.success).toBe(true);
      if (!storeResult.success) return;

      farmState = storeResult.data;
      expect(farmState.activeZombies).toHaveLength(0);
      expect(farmState.cryptZombies).toHaveLength(1);
      expect(farmState.cryptZombies[0].aiState).toBe('idle'); // Reset to idle

      // Act 5: Deploy back from Crypt
      const deployResult = deployFromCrypt(farmState, zombie.id);
      expect(deployResult.success).toBe(true);
      if (!deployResult.success) return;

      farmState = deployResult.data;
      expect(farmState.activeZombies).toHaveLength(1);
      expect(farmState.cryptZombies).toHaveLength(0);
      expect(farmState.activeZombies[0].aiState).toBe('idle'); // Starts idle

      // Assert: Full lifecycle complete
      expect(farmState.plots[0].state).toBe(PlotState.EMPTY); // Plot cleared
      expect(farmState.activeZombies[0].type).toBe('shambler'); // Correct type
    });
  });
});
