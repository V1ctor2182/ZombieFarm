/**
 * Game Machine Tests
 *
 * Test suite for the core game state machine (gameMachine.ts).
 * Covers all state transitions, events, guards, and actions.
 *
 * Following TDD methodology: these tests are written FIRST.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createActor, type ActorRef, type Snapshot } from 'xstate';
import { gameMachine } from '../gameMachine';
import type { GameState, GameMode } from '../../../types/global';
import type { GameEvent } from '../../../types/events';

describe('gameMachine', () => {
  let actor: ActorRef<typeof gameMachine, GameEvent>;

  beforeEach(() => {
    // Create a fresh actor for each test
    actor = createActor(gameMachine);
    actor.start();
  });

  afterEach(() => {
    // Clean up actor
    actor.stop();
  });

  // ============================================================================
  // STATE INITIALIZATION
  // ============================================================================

  describe('initialization', () => {
    it('should start in loading state', () => {
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('loading')).toBe(true);
    });

    it('should initialize with valid game state context', () => {
      const snapshot = actor.getSnapshot();
      const context = snapshot.context;

      // Verify context structure
      expect(context).toHaveProperty('player');
      expect(context).toHaveProperty('farm');
      expect(context).toHaveProperty('inventory');
      expect(context).toHaveProperty('world');
      expect(context).toHaveProperty('ui');
      expect(context).toHaveProperty('time');
      expect(context).toHaveProperty('meta');
      expect(context.combat).toBeNull(); // Combat starts null
    });

    it('should initialize player with default values', () => {
      const snapshot = actor.getSnapshot();
      const { player } = snapshot.context;

      expect(player.level).toBe(1);
      expect(player.xp).toBe(0);
      expect(player.achievements).toHaveLength(0);
      expect(player.completedQuests).toHaveLength(0);
      expect(player.activeQuests).toHaveLength(0);
    });

    it('should initialize time state with day 1', () => {
      const snapshot = actor.getSnapshot();
      const { time } = snapshot.context;

      expect(time.day).toBe(1);
      expect(time.hour).toBeGreaterThanOrEqual(0);
      expect(time.hour).toBeLessThan(24);
      expect(time.isDaytime).toBeDefined();
    });
  });

  // ============================================================================
  // STATE TRANSITIONS
  // ============================================================================

  describe('state transitions', () => {
    it('should transition from loading to tutorial on START_GAME (new player)', () => {
      // Arrange: Actor starts in loading
      expect(actor.getSnapshot().matches('loading')).toBe(true);

      // Act: Send START_GAME event
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Assert: Should be in tutorial (assuming new player)
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('tutorial') || snapshot.matches('farm')).toBe(true);
    });

    it('should transition from loading to farm on START_GAME (returning player)', () => {
      // This test assumes the context has tutorial completed
      // We'll need to set up the context accordingly
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // If tutorial is already completed, should go to farm
      // Implementation will handle this based on tutorialFlags
    });

    it('should transition from farm to combat on ENTER_COMBAT', () => {
      // Arrange: Get to farm state first
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Force to farm state if needed (may need to complete tutorial)
      if (!actor.getSnapshot().matches('farm')) {
        actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
      }

      // Act: Initiate combat
      actor.send({
        type: 'battle.initiated',
        payload: {
          battleId: 'battle-1',
          locationId: 'village-1',
          timestamp: Date.now(),
        },
      });

      // Assert: Should be in combat state
      expect(actor.getSnapshot().matches('combat')).toBe(true);
    });

    it('should transition from combat back to farm on EXIT_COMBAT', () => {
      // Arrange: Get to combat state
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      if (!actor.getSnapshot().matches('farm')) {
        actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
      }
      actor.send({
        type: 'battle.initiated',
        payload: {
          battleId: 'battle-1',
          locationId: 'village-1',
          timestamp: Date.now(),
        },
      });

      expect(actor.getSnapshot().matches('combat')).toBe(true);

      // Act: Exit combat
      actor.send({
        type: 'battle.ended',
        payload: {
          battleId: 'battle-1',
          result: {
            victory: true,
            survivors: [],
            casualties: [],
            rewards: {
              darkCoins: 100,
              resources: {},
              xp: 50,
            },
          },
          timestamp: Date.now(),
        },
      });

      // Assert: Should be back in farm state
      expect(actor.getSnapshot().matches('farm')).toBe(true);
    });

    it('should transition to paused state on PAUSE_GAME', () => {
      // Arrange: Get to farm state
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Act: Pause game
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });

      // Assert: Should be in paused state
      expect(actor.getSnapshot().matches('paused')).toBe(true);
    });

    it('should resume from paused state on RESUME_GAME', () => {
      // Arrange: Get to paused state
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });
      expect(actor.getSnapshot().matches('paused')).toBe(true);

      // Act: Resume game
      actor.send({ type: 'game.resumed', payload: { timestamp: Date.now() } });

      // Assert: Should return to previous state (farm)
      expect(actor.getSnapshot().matches('farm')).toBe(true);
    });

    it('should transition to gameOver state on game end', () => {
      // Arrange: Get to farm state
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Act: End game
      actor.send({
        type: 'game.over',
        payload: {
          reason: 'All zombies lost',
          timestamp: Date.now(),
        },
      });

      // Assert: Should be in gameOver state
      expect(actor.getSnapshot().matches('gameOver')).toBe(true);
    });

    it('should complete tutorial and transition to farm', () => {
      // Arrange: Start game and get to tutorial
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Act: Complete tutorial
      actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });

      // Assert: Should be in farm state
      expect(actor.getSnapshot().matches('farm')).toBe(true);
    });
  });

  // ============================================================================
  // CONTEXT UPDATES
  // ============================================================================

  describe('context updates', () => {
    it('should update player XP when xpGained event occurs', () => {
      // Arrange
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      const initialXp = actor.getSnapshot().context.player.xp;

      // Act: Gain XP
      actor.send({
        type: 'player.xpGained',
        payload: {
          amount: 100,
          source: 'combat',
          timestamp: Date.now(),
        },
      });

      // Assert: XP should increase
      const newXp = actor.getSnapshot().context.player.xp;
      expect(newXp).toBe(initialXp + 100);
    });

    it('should level up player when XP threshold reached', () => {
      // Arrange
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      const initialLevel = actor.getSnapshot().context.player.level;

      // Act: Trigger level up
      actor.send({
        type: 'player.levelUp',
        payload: {
          newLevel: initialLevel + 1,
          timestamp: Date.now(),
        },
      });

      // Assert: Level should increase
      const newLevel = actor.getSnapshot().context.player.level;
      expect(newLevel).toBe(initialLevel + 1);
    });

    it('should initialize combat state when entering combat', () => {
      // Arrange: Get to farm
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      if (!actor.getSnapshot().matches('farm')) {
        actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
      }

      // Act: Enter combat
      actor.send({
        type: 'battle.initiated',
        payload: {
          battleId: 'battle-1',
          locationId: 'village-1',
          timestamp: Date.now(),
        },
      });

      // Assert: Combat context should be initialized
      const combatState = actor.getSnapshot().context.combat;
      expect(combatState).not.toBeNull();
      expect(combatState?.battleId).toBe('battle-1');
      expect(combatState?.locationId).toBe('village-1');
    });

    it('should clear combat state when exiting combat', () => {
      // Arrange: Get to combat
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      if (!actor.getSnapshot().matches('farm')) {
        actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
      }
      actor.send({
        type: 'battle.initiated',
        payload: {
          battleId: 'battle-1',
          locationId: 'village-1',
          timestamp: Date.now(),
        },
      });

      expect(actor.getSnapshot().context.combat).not.toBeNull();

      // Act: Exit combat
      actor.send({
        type: 'battle.ended',
        payload: {
          battleId: 'battle-1',
          result: {
            victory: true,
            survivors: [],
            casualties: [],
            rewards: {
              darkCoins: 100,
              resources: {},
              xp: 50,
            },
          },
          timestamp: Date.now(),
        },
      });

      // Assert: Combat state should be cleared
      expect(actor.getSnapshot().context.combat).toBeNull();
    });

    it('should apply battle results to inventory and player', () => {
      // Arrange: Get to combat and complete battle
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      if (!actor.getSnapshot().matches('farm')) {
        actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
      }
      actor.send({
        type: 'battle.initiated',
        payload: {
          battleId: 'battle-1',
          locationId: 'village-1',
          timestamp: Date.now(),
        },
      });

      const initialCoins = actor.getSnapshot().context.inventory.currencies.darkCoins;
      const initialXp = actor.getSnapshot().context.player.xp;

      // Act: Complete battle with rewards
      actor.send({
        type: 'battle.ended',
        payload: {
          battleId: 'battle-1',
          result: {
            victory: true,
            survivors: [],
            casualties: [],
            rewards: {
              darkCoins: 100,
              resources: {},
              xp: 50,
            },
          },
          timestamp: Date.now(),
        },
      });

      // Assert: Rewards should be applied
      const newCoins = actor.getSnapshot().context.inventory.currencies.darkCoins;
      const newXp = actor.getSnapshot().context.player.xp;
      expect(newCoins).toBe(initialCoins + 100);
      expect(newXp).toBe(initialXp + 50);
    });
  });

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  describe('event handling', () => {
    it('should handle save game event', () => {
      // Arrange
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Act: Save game
      actor.send({ type: 'game.saved', payload: { timestamp: Date.now() } });

      // Assert: Meta should be updated with save timestamp
      const meta = actor.getSnapshot().context.meta;
      expect(meta.lastSavedAt).toBeGreaterThan(0);
    });

    it('should ignore invalid events for current state', () => {
      // Arrange: In loading state
      expect(actor.getSnapshot().matches('loading')).toBe(true);

      // Act: Try to pause (not allowed in loading)
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });

      // Assert: Should still be in loading state
      expect(actor.getSnapshot().matches('loading')).toBe(true);
    });

    it('should handle multiple events in sequence', () => {
      // Test a complete flow
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      actor.send({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
      actor.send({
        type: 'player.xpGained',
        payload: { amount: 50, source: 'tutorial', timestamp: Date.now() },
      });
      actor.send({ type: 'game.saved', payload: { timestamp: Date.now() } });

      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('farm')).toBe(true);
      expect(snapshot.context.player.xp).toBe(50);
    });
  });

  // ============================================================================
  // GUARDS AND ACTIONS
  // ============================================================================

  describe('guards and actions', () => {
    it('should only allow combat if zombies are available', () => {
      // This will be tested once we implement the guard logic
      // For now, we document the expected behavior
    });

    it('should prevent entering paused state from gameOver', () => {
      // Arrange: Get to gameOver state
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      actor.send({
        type: 'game.over',
        payload: { reason: 'test', timestamp: Date.now() },
      });

      // Act: Try to pause
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });

      // Assert: Should remain in gameOver
      expect(actor.getSnapshot().matches('gameOver')).toBe(true);
    });

    it('should execute initialization actions on game start', () => {
      // Arrange: Fresh actor
      const snapshot = actor.getSnapshot();

      // Act: Start game
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Assert: Initialization should have occurred
      const newSnapshot = actor.getSnapshot();
      expect(newSnapshot.context.time.lastUpdate).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('should handle rapid state transitions gracefully', () => {
      // Send multiple events quickly
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });
      actor.send({ type: 'game.resumed', payload: { timestamp: Date.now() } });
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });

      // Should handle all transitions properly
      expect(actor.getSnapshot().matches('paused')).toBe(true);
    });

    it('should maintain context integrity across transitions', () => {
      // Arrange: Set up initial state with data
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });
      actor.send({
        type: 'player.xpGained',
        payload: { amount: 100, source: 'test', timestamp: Date.now() },
      });

      const xpBeforePause = actor.getSnapshot().context.player.xp;

      // Act: Pause and resume
      actor.send({ type: 'game.paused', payload: { timestamp: Date.now() } });
      actor.send({ type: 'game.resumed', payload: { timestamp: Date.now() } });

      // Assert: Context should remain unchanged
      const xpAfterResume = actor.getSnapshot().context.player.xp;
      expect(xpAfterResume).toBe(xpBeforePause);
    });

    it('should handle concurrent events properly', () => {
      // This tests that events don't interfere with each other
      actor.send({ type: 'game.started', payload: { timestamp: Date.now() } });

      // Send multiple events that modify different parts of state
      actor.send({
        type: 'player.xpGained',
        payload: { amount: 50, source: 'a', timestamp: Date.now() },
      });
      actor.send({
        type: 'time.dayChanged',
        payload: { newDay: 2, timestamp: Date.now() },
      });

      const snapshot = actor.getSnapshot();
      expect(snapshot.context.player.xp).toBe(50);
      expect(snapshot.context.time.day).toBe(2);
    });
  });
});
