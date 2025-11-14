# Integration Tests

This directory contains integration tests that verify interactions between multiple modules and end-to-end workflows in Zombie Farm.

## Overview

Integration tests validate that different parts of the system work together correctly. Unlike unit tests (which test isolated functions) or module tests (which test within a single domain), integration tests verify:

- **Cross-module communication** (Farm → Combat → Farm)
- **State machine transitions** across features
- **Complete user workflows** (plant → grow → harvest → deploy → battle → return)
- **Event propagation** between systems
- **Game loop integration** (all systems working together)

Integration tests are critical for catching issues that only appear when modules interact, ensuring that the modular architecture delivers a cohesive game experience.

## Testing Strategy

### 1. Test Organization

Integration tests are organized by workflow type:

- **Core Game Loop**: Start game → Farm → Combat → Return cycle
- **Farm-Combat Integration**: Zombie deployment, battle outcomes, casualties, XP
- **State Persistence**: Save/load cycles across modules
- **Time System Integration**: Day/night affecting multiple systems
- **Resource Flow**: Resources used across modules (crafting → building → combat)
- **Event System Integration**: Event bus propagation and subscriptions

### 2. Test Coverage Goals

Per **TESTING.md** standards:
- **Critical Workflows**: ~100% coverage (main game loop, combat integration)
- **Overall Integration**: 80%+ coverage minimum

### 3. Test Scope

Integration tests should:
- **DO** test multiple modules interacting
- **DO** test complete workflows start-to-finish
- **DO** test event communication between modules
- **DO** validate state consistency across boundaries
- **NOT** duplicate unit test coverage
- **NOT** test implementation details

## Authority

Integration tests must respect ALL domain documents:
- **DOMAIN-FARM.md** - Farm mechanics
- **DOMAIN-COMBAT.md** - Combat mechanics
- **ARCHITECTURE.md** - Module boundaries and event contracts

## Writing Integration Tests

### AAA Pattern with Multiple Phases

Integration tests follow **Arrange-Act-Assert** but often have multiple Act/Assert cycles:

```typescript
describe('farm to combat workflow', () => {
  it('deploys zombies from farm to battle and returns with XP', () => {
    // Arrange - Set up initial game state
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'zombie-1', stats: { maxHp: 100 }, xp: 0 }),
          createTestZombie({ id: 'zombie-2', stats: { maxHp: 100 }, xp: 0 }),
        ],
      },
    });

    // Act 1: Deploy zombies to combat
    const deployResult = deployZombiesToCombat(gameState, ['zombie-1', 'zombie-2']);

    // Assert 1: Farm updated, Combat has zombies
    expect(deployResult.farm.activeZombies).toHaveLength(0);
    expect(deployResult.combat.deployedZombies).toHaveLength(2);

    // Act 2: Simulate battle victory
    const battleResult = simulateBattle(deployResult.combat, {
      enemies: createEnemyWave(5),
      outcome: 'VICTORY',
    });

    // Assert 2: Combat state reflects victory
    expect(battleResult.phase).toBe(BattlePhase.VICTORY);
    expect(battleResult.survivors).toHaveLength(2);

    // Act 3: Return zombies to farm with battle outcome
    const returnResult = handleBattleEnd(gameState, battleResult);

    // Assert 3: Zombies returned with XP, no casualties
    expect(returnResult.farm.activeZombies).toHaveLength(2);
    expect(returnResult.farm.activeZombies[0].xp).toBeGreaterThan(0);
    expect(returnResult.combat.deployedZombies).toHaveLength(0);
  });
});
```

### Farm-Combat Integration Patterns

#### Deployment Flow

```typescript
describe('farm-combat deployment', () => {
  it('validates zombie availability before deployment', () => {
    // Arrange
    const gameState = createTestGameState({
      farm: {
        activeZombies: [createTestZombie({ id: 'zombie-1' })],
        cryptZombies: [createTestZombie({ id: 'zombie-2' })],
      },
    });

    // Act - Try to deploy Crypt zombie
    const result = deployZombiesToCombat(gameState, ['zombie-2']);

    // Assert - Deployment fails, only active zombies deployable
    expect(result.error).toBe('ZOMBIE_NOT_AVAILABLE');
    expect(gameState.combat.deployedZombies).toHaveLength(0);
  });

  it('transfers zombie stats correctly to combat', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      type: ZombieType.BRUTE,
      stats: { maxHp: 150, attack: 30, defense: 20 },
    });
    const gameState = createTestGameState({
      farm: { activeZombies: [zombie] },
    });

    // Act
    const result = deployZombiesToCombat(gameState, ['zombie-1']);

    // Assert - Combat unit has same stats
    const combatUnit = result.combat.deployedZombies[0];
    expect(combatUnit.id).toBe('zombie-1');
    expect(combatUnit.stats.maxHp).toBe(150);
    expect(combatUnit.stats.attack).toBe(30);
    expect(combatUnit.stats.defense).toBe(20);
  });
});
```

#### Battle Outcome Flow

```typescript
describe('battle outcome integration', () => {
  it('handles permadeath by removing zombies from farm', () => {
    // Arrange
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'zombie-1' }),
          createTestZombie({ id: 'zombie-2' }),
        ],
      },
    });

    // Deploy zombies
    const deployed = deployZombiesToCombat(gameState, ['zombie-1', 'zombie-2']);

    // Act - Simulate battle with casualties
    const battleResult = simulateBattle(deployed.combat, {
      casualties: ['zombie-1'], // zombie-1 dies
      survivors: ['zombie-2'],  // zombie-2 survives
    });

    const finalState = handleBattleEnd(deployed, battleResult);

    // Assert - Only survivor returned to farm
    expect(finalState.farm.activeZombies).toHaveLength(1);
    expect(finalState.farm.activeZombies[0].id).toBe('zombie-2');
    expect(finalState.farm.activeZombies).not.toContainEqual(
      expect.objectContaining({ id: 'zombie-1' })
    );
  });

  it('applies XP gains to surviving zombies', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      xp: 0,
      level: 1,
    });
    const gameState = createTestGameState({
      farm: { activeZombies: [zombie] },
    });

    const deployed = deployZombiesToCombat(gameState, ['zombie-1']);

    // Act - Victory grants XP
    const battleResult = simulateBattle(deployed.combat, {
      outcome: 'VICTORY',
      xpGained: 100,
      survivors: ['zombie-1'],
    });

    const finalState = handleBattleEnd(deployed, battleResult);

    // Assert - Zombie gained XP
    const returnedZombie = finalState.farm.activeZombies[0];
    expect(returnedZombie.xp).toBe(100);
  });

  it('carries over HP damage from battle', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      stats: { maxHp: 100, currentHp: 100 },
    });
    const gameState = createTestGameState({
      farm: { activeZombies: [zombie] },
    });

    const deployed = deployZombiesToCombat(gameState, ['zombie-1']);

    // Act - Zombie takes damage in battle
    const battleResult = simulateBattle(deployed.combat, {
      survivors: [{ id: 'zombie-1', currentHp: 30 }], // Survived with 30 HP
    });

    const finalState = handleBattleEnd(deployed, battleResult);

    // Assert - Damage persists on farm
    const returnedZombie = finalState.farm.activeZombies[0];
    expect(returnedZombie.stats.currentHp).toBe(30);
    expect(returnedZombie.stats.maxHp).toBe(100);
  });
});
```

### State Machine Integration

Test XState state machine transitions across modules:

```typescript
describe('game state machine integration', () => {
  it('transitions through complete game flow', () => {
    // Arrange
    const machine = createGameMachine();
    const service = interpret(machine).start();

    // Assert initial state
    expect(service.state.value).toBe('idle');

    // Act: Start game
    service.send({ type: 'START_GAME' });
    expect(service.state.value).toBe('farm');

    // Act: Enter combat
    service.send({
      type: 'START_COMBAT',
      zombies: ['zombie-1', 'zombie-2'],
    });
    expect(service.state.value).toBe('combat');

    // Act: Complete battle
    service.send({
      type: 'BATTLE_ENDED',
      result: { outcome: 'VICTORY' },
    });
    expect(service.state.value).toBe('farm');

    service.stop();
  });

  it('prevents invalid state transitions', () => {
    // Arrange
    const machine = createGameMachine();
    const service = interpret(machine).start();

    // Assert: Cannot go to combat from idle
    service.send({ type: 'START_COMBAT' });
    expect(service.state.value).toBe('idle'); // No transition
  });
});
```

### Event System Integration

Test event propagation between modules:

```typescript
describe('event bus integration', () => {
  it('propagates zombie.harvested event to all subscribers', () => {
    // Arrange
    const eventBus = createEventBus();
    const farmHandler = jest.fn();
    const uiHandler = jest.fn();

    eventBus.subscribe('zombie.harvested', farmHandler);
    eventBus.subscribe('zombie.harvested', uiHandler);

    // Act
    eventBus.emit('zombie.harvested', {
      zombieId: 'zombie-1',
      type: ZombieType.SHAMBLER,
    });

    // Assert - Both handlers called
    expect(farmHandler).toHaveBeenCalledWith({
      zombieId: 'zombie-1',
      type: ZombieType.SHAMBLER,
    });
    expect(uiHandler).toHaveBeenCalledWith({
      zombieId: 'zombie-1',
      type: ZombieType.SHAMBLER,
    });
  });

  it('handles battle.ended event with farm state update', () => {
    // Arrange
    const eventBus = createEventBus();
    let farmState = createTestFarmState();

    eventBus.subscribe('battle.ended', (event) => {
      farmState = handleBattleEndedEvent(farmState, event);
    });

    // Act
    eventBus.emit('battle.ended', {
      survivors: ['zombie-1'],
      casualties: ['zombie-2'],
      xpGained: 50,
    });

    // Assert - Farm updated via event
    expect(farmState.activeZombies).toHaveLength(1);
    expect(farmState.activeZombies[0].id).toBe('zombie-1');
  });
});
```

### Time System Integration

Test day/night cycle affecting multiple modules:

```typescript
describe('time system integration', () => {
  it('day/night transition affects farm and combat', () => {
    // Arrange
    setupMockTimers();
    const gameState = createTestGameState({
      timeOfDay: 'DAY',
    });

    // Act - Advance to night (20 minutes)
    advanceTimeBy(20 * 60 * 1000);
    const updated = updateGameTime(gameState);

    // Assert - Time changed
    expect(updated.timeOfDay).toBe('NIGHT');

    // Assert - Farm zombies affected
    const farmZombie = updated.farm.activeZombies[0];
    expect(farmZombie.modifiers.nightBonus).toBeDefined();

    // Assert - Combat stats affected
    if (updated.combat.deployedZombies.length > 0) {
      const combatZombie = updated.combat.deployedZombies[0];
      expect(combatZombie.stats.speed).toBeGreaterThan(
        combatZombie.baseStats.speed
      );
    }
  });

  it('weather effects propagate to all modules', () => {
    // Arrange
    const gameState = createTestGameState();

    // Act - Blood rain event
    const weatherEvent = {
      type: 'BLOOD_RAIN',
      duration: 600, // 10 minutes
    };
    const updated = applyWeatherEvent(gameState, weatherEvent);

    // Assert - Farm affected
    expect(updated.farm.weather.active).toBe(true);
    expect(updated.farm.weather.type).toBe('BLOOD_RAIN');

    // Assert - Combat affected
    expect(updated.combat.environmentModifiers.bloodRain).toBeDefined();
  });
});
```

### Resource Flow Integration

Test resources flowing between systems:

```typescript
describe('resource flow integration', () => {
  it('farm resources used in combat preparation', () => {
    // Arrange
    const gameState = createTestGameState({
      inventory: createTestInventory({
        resources: [{ type: 'DARK_ESSENCE', quantity: 10 }],
      }),
    });

    // Act - Use resource for combat buff
    const buffed = applyCombatBuff(gameState, {
      buffType: 'DARK_BLESSING',
      cost: { type: 'DARK_ESSENCE', amount: 5 },
    });

    // Assert - Resource consumed, combat buff applied
    expect(buffed.inventory).toHaveResource('DARK_ESSENCE', 5);
    expect(buffed.combat.activeBuffs).toContainEqual(
      expect.objectContaining({ type: 'DARK_BLESSING' })
    );
  });

  it('battle rewards add to farm inventory', () => {
    // Arrange
    const gameState = createTestGameState({
      inventory: createTestInventory({
        resources: [{ type: 'DARK_COINS', quantity: 100 }],
      }),
    });

    // Act - Battle victory with loot
    const battleResult = {
      outcome: 'VICTORY',
      loot: [
        { type: 'DARK_COINS', quantity: 50 },
        { type: 'SOUL_FRAGMENTS', quantity: 2 },
      ],
    };

    const updated = processBattleRewards(gameState, battleResult);

    // Assert - Loot added to inventory
    expect(updated.inventory).toHaveResource('DARK_COINS', 150);
    expect(updated.inventory).toHaveResource('SOUL_FRAGMENTS', 2);
  });
});
```

### Complete Gameplay Workflow

Test full user journey from start to finish:

```typescript
describe('complete gameplay workflow', () => {
  it('executes full game loop: plant → grow → harvest → battle → return', () => {
    // Arrange
    setupMockTimers();
    const gameState = createTestGameState({
      farm: {
        plots: [{ id: 'plot-1', state: PlotState.EMPTY }],
      },
      inventory: createTestInventory({
        seeds: [{ type: ZombieType.SHAMBLER, quantity: 1 }],
      }),
    });

    // Step 1: Plant seed
    const planted = plantSeed(gameState, 'plot-1', ZombieType.SHAMBLER);
    expect(planted.farm.plots[0].state).toBe(PlotState.GROWING);

    // Step 2: Wait for growth
    advanceTimeBy(5 * 60 * 1000); // 5 minutes
    const grown = updateFarmTimers(planted);
    expect(grown.farm.plots[0].state).toBe(PlotState.READY_TO_HARVEST);

    // Step 3: Harvest zombie
    const harvested = harvestZombie(grown, 'plot-1');
    expect(harvested.farm.activeZombies).toHaveLength(1);
    const zombieId = harvested.farm.activeZombies[0].id;

    // Step 4: Deploy to combat
    const deployed = deployZombiesToCombat(harvested, [zombieId]);
    expect(deployed.combat.deployedZombies).toHaveLength(1);

    // Step 5: Fight battle (victory)
    const battleResult = simulateBattle(deployed.combat, {
      enemies: createEnemyWave(3),
      outcome: 'VICTORY',
      xpGained: 50,
    });
    expect(battleResult.phase).toBe(BattlePhase.VICTORY);

    // Step 6: Return to farm with XP
    const completed = handleBattleEnd(deployed, battleResult);
    expect(completed.farm.activeZombies).toHaveLength(1);
    expect(completed.farm.activeZombies[0].xp).toBe(50);
    expect(completed.combat.deployedZombies).toHaveLength(0);

    // Step 7: Verify plot cleared
    expect(completed.farm.plots[0].state).toBe(PlotState.EMPTY);
  });

  it('handles defeat with permadeath correctly', () => {
    // Arrange
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'zombie-1' }),
          createTestZombie({ id: 'zombie-2' }),
        ],
      },
    });

    // Deploy
    const deployed = deployZombiesToCombat(gameState, ['zombie-1', 'zombie-2']);

    // Battle - all zombies die
    const battleResult = simulateBattle(deployed.combat, {
      outcome: 'DEFEAT',
      casualties: ['zombie-1', 'zombie-2'],
      survivors: [],
    });

    // Return
    const completed = handleBattleEnd(deployed, battleResult);

    // Assert - No zombies returned
    expect(completed.farm.activeZombies).toHaveLength(0);
    expect(completed.combat.deployedZombies).toHaveLength(0);
  });
});
```

### Save/Load Integration

Test state persistence across modules:

```typescript
describe('save/load integration', () => {
  it('saves and restores complete game state', () => {
    // Arrange - Complex game state
    const gameState = createTestGameState({
      farm: {
        activeZombies: [createTestZombie({ id: 'zombie-1', xp: 50 })],
        plots: [{ id: 'plot-1', state: PlotState.GROWING }],
      },
      combat: {
        completedBattles: 5,
      },
      inventory: createTestInventory({
        resources: [{ type: 'DARK_COINS', quantity: 1000 }],
      }),
    });

    // Act - Save
    const saved = saveGameState(gameState);
    expect(saved).toBeDefined();

    // Act - Load
    const loaded = loadGameState(saved);

    // Assert - All state restored
    expect(loaded.farm.activeZombies).toHaveLength(1);
    expect(loaded.farm.activeZombies[0].xp).toBe(50);
    expect(loaded.farm.plots[0].state).toBe(PlotState.GROWING);
    expect(loaded.combat.completedBattles).toBe(5);
    expect(loaded.inventory).toHaveResource('DARK_COINS', 1000);
  });

  it('handles save during combat correctly', () => {
    // Arrange - Mid-battle
    const gameState = createTestGameState({
      combat: {
        phase: BattlePhase.ACTIVE,
        deployedZombies: [createTestZombie({ id: 'zombie-1' })],
        enemies: createEnemyWave(5),
      },
    });

    // Act - Save and load
    const saved = saveGameState(gameState);
    const loaded = loadGameState(saved);

    // Assert - Battle state preserved
    expect(loaded.combat.phase).toBe(BattlePhase.ACTIVE);
    expect(loaded.combat.deployedZombies).toHaveLength(1);
    expect(loaded.combat.enemies).toHaveLength(5);
  });
});
```

## Testing Edge Cases

Integration tests MUST cover cross-module edge cases:

```typescript
describe('cross-module edge cases', () => {
  it('handles deploying zombie that decayed during combat prep', () => {
    // Arrange - Zombie near decay threshold
    const zombie = createTestZombie({
      id: 'zombie-1',
      stats: { maxHp: 51 }, // Just above 50% floor
      lastFed: Date.now() - (48 * 60 * 60 * 1000), // 2 days ago
    });

    const gameState = createTestGameState({
      farm: { activeZombies: [zombie] },
    });

    // Act - Try to deploy (should apply decay first)
    const deployed = deployZombiesToCombat(gameState, ['zombie-1']);

    // Assert - Zombie stats reduced by decay before deployment
    const combatUnit = deployed.combat.deployedZombies[0];
    expect(combatUnit.stats.maxHp).toBeLessThan(51);
  });

  it('handles concurrent farm and combat time progression', () => {
    // Arrange
    setupMockTimers();
    const gameState = createTestGameState({
      farm: {
        plots: [{ id: 'plot-1', state: PlotState.GROWING, growthTimer: 300 }],
      },
      combat: {
        phase: BattlePhase.ACTIVE,
        battleDuration: 0,
      },
    });

    // Act - Advance time affects both
    advanceTimeBy(5 * 60 * 1000); // 5 minutes
    const updated = updateAllTimers(gameState);

    // Assert - Farm plot completed
    expect(updated.farm.plots[0].state).toBe(PlotState.READY_TO_HARVEST);

    // Assert - Combat duration updated
    expect(updated.combat.battleDuration).toBe(300); // 5 minutes
  });

  it('handles capacity overflow during battle return', () => {
    // Arrange - Farm at capacity with zombies in battle
    const gameState = createTestGameState({
      farm: {
        activeZombies: Array(10).fill(null).map((_, i) =>
          createTestZombie({ id: `zombie-home-${i}` })
        ),
        zombieCapacity: 10,
      },
      combat: {
        deployedZombies: [createTestZombie({ id: 'zombie-battle-1' })],
      },
    });

    // Act - Return from battle (would exceed capacity)
    const battleResult = {
      outcome: 'VICTORY',
      survivors: ['zombie-battle-1'],
    };
    const returned = handleBattleEnd(gameState, battleResult);

    // Assert - Returning zombie sent to Crypt (capacity full)
    expect(returned.farm.activeZombies).toHaveLength(10);
    expect(returned.farm.cryptZombies).toContainEqual(
      expect.objectContaining({ id: 'zombie-battle-1' })
    );
  });
});
```

## Test Naming Conventions

- **File Names**: `*.integration.test.ts`
- **Describe Blocks**: Workflow or integration scenario
- **Test Names**: Complete sentence describing end-to-end behavior

```typescript
describe('farm to combat integration', () => {
  it('deploys healthy zombies and returns with battle scars');
  it('handles permadeath by removing zombie from farm permanently');
  it('applies XP to survivors and levels them up');
});
```

## Running Tests

### All Integration Tests
```bash
npm test src/__tests__
```

### Specific Integration Test
```bash
npm test src/__tests__/farm-combat.integration.test.ts
```

### Watch Mode
```bash
npm test -- --watch src/__tests__
```

### Coverage Report
```bash
npm test -- --coverage src/__tests__
```

## Performance Considerations

Integration tests can be slower than unit tests. Optimize by:

- Using test factories to minimize setup
- Mocking time instead of real delays
- Resetting state between tests efficiently
- Running critical integration tests first

```typescript
it('completes full game loop in <100ms', () => {
  const start = performance.now();

  // Run full workflow
  const result = executeGameLoop({
    plant: true,
    grow: true,
    harvest: true,
    battle: true,
  });

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
  expect(result.success).toBe(true);
});
```

## Debugging Tips

### Enable Event Logging
```typescript
const eventBus = createEventBus({ debug: true });
// Logs all events to console
```

### Trace State Changes
```typescript
const history = [];
let state = initialState;

for (const action of actions) {
  state = executeAction(state, action);
  history.push({ action, state: cloneDeep(state) });
}

console.log('State history:', history);
```

### Visualize Module Communication
```typescript
const communication = trackModuleCommunication();
// Records all cross-module calls and events
console.table(communication.summary());
```

## CI/CD Integration

Integration tests are critical gates:

- Run on every PR
- Must pass before merge
- Monitor performance (flag slow tests)
- Generate integration coverage report

## Documentation Updates

When adding new integration workflows:

1. Document integration contract in **ARCHITECTURE.md**
2. Write integration tests (Test Agent)
3. Implement integration (relevant domain agents)
4. Update this README with new patterns

---

**Remember**: Integration tests verify that the modular architecture delivers a cohesive game. They catch issues that unit tests miss by validating that modules cooperate correctly. If modules can't work together, the game doesn't work - making integration tests essential guardians of quality.
