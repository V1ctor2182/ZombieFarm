# Testing Pattern Examples

This document provides comprehensive examples of testing patterns for the Zombie Farm project. These examples demonstrate best practices, common patterns, and how to use the test utilities effectively.

## Table of Contents

- [Unit Testing Patterns](#unit-testing-patterns)
  - [Pure Function Testing](#pure-function-testing)
  - [Using Factories](#using-factories)
  - [Testing with Mocked Dependencies](#testing-with-mocked-dependencies)
- [Component Testing Patterns](#component-testing-patterns)
  - [Basic Component Rendering](#basic-component-rendering)
  - [User Interaction Testing](#user-interaction-testing)
  - [Testing with State Management](#testing-with-state-management)
- [Integration Testing Patterns](#integration-testing-patterns)
  - [Multi-Step Workflows](#multi-step-workflows)
  - [State Machine Testing](#state-machine-testing)
  - [Cross-Module Integration](#cross-module-integration)
- [Testing Time-Dependent Features](#testing-time-dependent-features)
- [Testing Randomness](#testing-randomness)
- [Testing Persistence](#testing-persistence)
- [Advanced Patterns](#advanced-patterns)

---

## Unit Testing Patterns

### Pure Function Testing

Test pure functions that calculate values without side effects.

```typescript
import { calculateDamage } from '@features/combat/damageCalculation';
import { DamageType } from '@types';

describe('calculateDamage', () => {
  it('calculates physical damage with armor reduction', () => {
    // Arrange
    const attacker = { attack: 50 };
    const defender = { defense: 20 };
    const damageType = DamageType.PHYSICAL;

    // Act
    const damage = calculateDamage(attacker, defender, damageType);

    // Assert
    expect(damage).toBe(30); // 50 - 20
  });

  it('enforces minimum damage of 1', () => {
    // Arrange
    const attacker = { attack: 10 };
    const defender = { defense: 50 };
    const damageType = DamageType.PHYSICAL;

    // Act
    const damage = calculateDamage(attacker, defender, damageType);

    // Assert
    expect(damage).toBe(1); // Never 0 or negative
  });

  it('ignores armor for holy damage against undead', () => {
    // Arrange
    const attacker = { attack: 50 };
    const defender = { defense: 20, isUndead: true };
    const damageType = DamageType.HOLY;

    // Act
    const damage = calculateDamage(attacker, defender, damageType);

    // Assert
    expect(damage).toBe(100); // 50 * 2 (holy vs undead), ignores armor
  });
});
```

**Pattern:** Use descriptive test names that explain the scenario and expected outcome. Follow AAA pattern clearly.

---

### Using Factories

Use test factories to create complex objects with minimal boilerplate.

```typescript
import { createTestZombie, createTestEnemy } from '@lib/test-utils/factories';
import { ZombieType, EnemyType } from '@types';
import { resolveAttack } from '@features/combat/attackResolution';

describe('resolveAttack', () => {
  it('applies damage to target and returns updated stats', () => {
    // Arrange - Use factories for test data
    const attacker = createTestZombie({
      type: ZombieType.BRUTE,
      stats: { attack: 30 },
    });

    const defender = createTestEnemy({
      type: EnemyType.KNIGHT,
      stats: { maxHp: 100, currentHp: 100, defense: 10 },
    });

    // Act
    const result = resolveAttack(attacker, defender);

    // Assert
    expect(result.damage).toBe(20); // 30 - 10
    expect(result.defender.stats.currentHp).toBe(80); // 100 - 20
  });

  it('triggers status effects when applicable', () => {
    // Arrange - Factory makes it easy to configure specific scenarios
    const poisonZombie = createTestZombie({
      type: ZombieType.SPITTER,
      abilities: ['poison'],
    });

    const enemy = createTestEnemy({
      stats: { currentHp: 100 },
    });

    // Act
    const result = resolveAttack(poisonZombie, enemy);

    // Assert
    expect(result.defender.statusEffects).toContain('poisoned');
  });
});
```

**Pattern:** Factories reduce setup boilerplate and make tests more readable. Only specify values that matter for the test.

---

### Testing with Mocked Dependencies

Mock external dependencies to isolate units under test.

```typescript
import { mockRandomValue, resetRandom } from '@lib/test-utils/mocks';
import { attemptMutation } from '@features/farm/mutations';
import { createTestZombie } from '@lib/test-utils/factories';
import { ZombieType, MutationType } from '@types';

describe('attemptMutation', () => {
  afterEach(() => {
    resetRandom(); // Clean up after each test
  });

  it('applies mutation when random value is below mutation chance', () => {
    // Arrange
    const zombie = createTestZombie({
      type: ZombieType.SHAMBLER,
    });
    const mutationChance = 0.05; // 5%
    mockRandomValue(0.03); // Below threshold

    // Act
    const result = attemptMutation(zombie, mutationChance);

    // Assert
    expect(result.hasMutation).toBe(true);
    expect(result.mutationType).toBeDefined();
  });

  it('does not mutate when random value is above threshold', () => {
    // Arrange
    const zombie = createTestZombie();
    const mutationChance = 0.05;
    mockRandomValue(0.06); // Above threshold

    // Act
    const result = attemptMutation(zombie, mutationChance);

    // Assert
    expect(result.hasMutation).toBe(false);
    expect(result.mutationType).toBeUndefined();
  });

  it('selects mutation type deterministically', () => {
    // Arrange
    const zombie = createTestZombie();
    mockRandomValue(0.01); // Trigger mutation

    // Act
    const result1 = attemptMutation(zombie, 0.1);

    // Reset and use same seed
    mockRandomValue(0.01);
    const result2 = attemptMutation(zombie, 0.1);

    // Assert
    expect(result1.mutationType).toBe(result2.mutationType);
  });
});
```

**Pattern:** Mock randomness, time, and external APIs to make tests deterministic. Always clean up mocks in `afterEach`.

---

## Component Testing Patterns

### Basic Component Rendering

Test that React components render correctly.

```typescript
import { render, screen } from '@testing-library/react';
import { ZombieCard } from '@components/ZombieCard';
import { createTestZombie } from '@lib/test-utils/factories';
import { ZombieType } from '@types';

describe('ZombieCard', () => {
  it('renders zombie name and type', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      type: ZombieType.BRUTE,
      name: 'Brutus',
    });

    // Act
    render(<ZombieCard zombie={zombie} />);

    // Assert
    expect(screen.getByText('Brutus')).toBeInTheDocument();
    expect(screen.getByText(/brute/i)).toBeInTheDocument();
  });

  it('displays health bar with correct percentage', () => {
    // Arrange
    const zombie = createTestZombie({
      stats: { currentHp: 75, maxHp: 100 },
    });

    // Act
    render(<ZombieCard zombie={zombie} />);

    // Assert
    const healthBar = screen.getByRole('progressbar');
    expect(healthBar).toHaveAttribute('aria-valuenow', '75');
    expect(healthBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows status effect icons when zombie has effects', () => {
    // Arrange
    const zombie = createTestZombie({
      statusEffects: ['poisoned', 'burning'],
    });

    // Act
    render(<ZombieCard zombie={zombie} />);

    // Assert
    expect(screen.getByTestId('status-poisoned')).toBeInTheDocument();
    expect(screen.getByTestId('status-burning')).toBeInTheDocument();
  });

  it('does not render when zombie is undefined', () => {
    // Arrange & Act
    const { container } = render(<ZombieCard zombie={undefined} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
```

**Pattern:** Test what users see, not implementation details. Use `screen` queries for accessibility. Test edge cases like empty/undefined props.

---

### User Interaction Testing

Test user interactions like clicks, typing, and form submissions.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlantSeedModal } from '@components/PlantSeedModal';
import { Resource } from '@types';

describe('PlantSeedModal', () => {
  it('calls onPlant callback when user confirms planting', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPlant = jest.fn();
    const onCancel = jest.fn();
    const availableSeeds = [
      { type: 'shambler', count: 5, growthTime: 3600 },
      { type: 'runner', count: 2, growthTime: 7200 },
    ];

    render(
      <PlantSeedModal
        isOpen={true}
        availableSeeds={availableSeeds}
        onPlant={onPlant}
        onCancel={onCancel}
      />
    );

    // Act
    await user.click(screen.getByText('Shambler'));
    await user.click(screen.getByRole('button', { name: /plant/i }));

    // Assert
    expect(onPlant).toHaveBeenCalledTimes(1);
    expect(onPlant).toHaveBeenCalledWith('shambler');
  });

  it('disables plant button when no seed is selected', () => {
    // Arrange
    const onPlant = jest.fn();
    const availableSeeds = [{ type: 'shambler', count: 5 }];

    render(
      <PlantSeedModal
        isOpen={true}
        availableSeeds={availableSeeds}
        onPlant={onPlant}
        onCancel={jest.fn()}
      />
    );

    // Assert
    expect(screen.getByRole('button', { name: /plant/i })).toBeDisabled();
  });

  it('shows seed count and growth time for each option', () => {
    // Arrange
    const availableSeeds = [
      { type: 'shambler', count: 3, growthTime: 3600 },
    ];

    render(
      <PlantSeedModal
        isOpen={true}
        availableSeeds={availableSeeds}
        onPlant={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Assert
    expect(screen.getByText(/3 available/i)).toBeInTheDocument();
    expect(screen.getByText(/1 hour/i)).toBeInTheDocument();
  });
});
```

**Pattern:** Use `userEvent` for realistic user interactions. Test callbacks, disabled states, and dynamic content.

---

### Testing with State Management

Test components that use XState or context.

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameProvider } from '@features/game/GameProvider';
import { FarmView } from '@features/farm/FarmView';
import { createTestGameState } from '@lib/test-utils/factories';

describe('FarmView with GameProvider', () => {
  it('displays active zombie count from game state', () => {
    // Arrange
    const gameState = createTestGameState({
      farm: {
        activeZombies: ['z1', 'z2', 'z3'],
      },
    });

    // Act
    render(
      <GameProvider initialState={gameState}>
        <FarmView />
      </GameProvider>
    );

    // Assert
    expect(screen.getByText(/3 active zombies/i)).toBeInTheDocument();
  });

  it('updates UI when zombie is planted', async () => {
    // Arrange
    const user = userEvent.setup();
    const gameState = createTestGameState({
      inventory: {
        resources: { [Resource.SEEDS]: 5 },
      },
      farm: {
        activeZombies: [],
      },
    });

    render(
      <GameProvider initialState={gameState}>
        <FarmView />
      </GameProvider>
    );

    // Act
    await user.click(screen.getByRole('button', { name: /plant/i }));
    await user.click(screen.getByText('Shambler'));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/1 active zombie/i)).toBeInTheDocument();
    });
  });
});
```

**Pattern:** Wrap components with providers when testing. Use `waitFor` for async state updates. Test state-driven UI changes.

---

## Integration Testing Patterns

### Multi-Step Workflows

Test complete user workflows across multiple actions.

```typescript
import { setupFakeTimers, advanceTimeByHours, teardownFakeTimers } from '@lib/test-utils/mocks';
import { createTestGameState } from '@lib/test-utils/factories';
import { plantZombie, harvestZombie } from '@features/farm/zombieLifecycle';
import { ZombieType, Resource } from '@types';

describe('Plant-to-Harvest Workflow', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    teardownFakeTimers();
  });

  it('completes full zombie lifecycle from planting to harvest', () => {
    // Arrange
    const gameState = createTestGameState({
      inventory: {
        resources: { [Resource.SEEDS]: 1 },
      },
    });

    // Act & Assert - Step 1: Plant
    const plantResult = plantZombie(gameState, {
      type: ZombieType.SHAMBLER,
      plotId: 'plot-1',
    });

    expect(plantResult.success).toBe(true);
    expect(plantResult.plot.status).toBe('growing');
    expect(plantResult.gameState.inventory.resources[Resource.SEEDS]).toBe(0);

    // Act & Assert - Step 2: Wait for growth
    advanceTimeByHours(1); // Shambler grows in 1 hour

    expect(plantResult.plot.status).toBe('ready');

    // Act & Assert - Step 3: Harvest
    const harvestResult = harvestZombie(plantResult.gameState, 'plot-1');

    expect(harvestResult.success).toBe(true);
    expect(harvestResult.zombie.type).toBe(ZombieType.SHAMBLER);
    expect(harvestResult.gameState.farm.activeZombies).toContain(harvestResult.zombie.id);
    expect(harvestResult.plot.status).toBe('empty');
  });

  it('handles partial workflow when harvest fails due to capacity', () => {
    // Arrange
    const gameState = createTestGameState({
      farm: {
        activeZombies: Array(10).fill('zombie'), // At max capacity
        capacity: 10,
      },
    });

    // Act - Plant succeeds
    const plantResult = plantZombie(gameState, {
      type: ZombieType.SHAMBLER,
      plotId: 'plot-1',
    });

    advanceTimeByHours(1);

    // Act - Harvest fails
    const harvestResult = harvestZombie(plantResult.gameState, 'plot-1');

    // Assert
    expect(harvestResult.success).toBe(false);
    expect(harvestResult.error).toMatch(/capacity/i);
    expect(plantResult.plot.status).toBe('ready'); // Zombie still growing
  });
});
```

**Pattern:** Test complete workflows with multiple steps. Test both happy paths and failure scenarios. Use time mocking for time-dependent workflows.

---

### State Machine Testing

Test XState state machines with comprehensive state coverage.

```typescript
import { createTestActor, expectState, sendEventAndWait, waitForState } from '@lib/test-utils/mocks';
import { combatMachine } from '@features/combat/combatMachine';
import { createTestZombie, createTestEnemy } from '@lib/test-utils/factories';

describe('combatMachine', () => {
  it('transitions from preparation to fighting to victory', async () => {
    // Arrange
    const squad = [createTestZombie({ stats: { attack: 50 } })];
    const enemies = [createTestEnemy({ stats: { currentHp: 10 } })]; // Weak enemy

    const actor = createTestActor(
      combatMachine.provide({
        context: {
          squad,
          enemies,
          currentWave: 1,
        },
      })
    );

    actor.start();

    // Assert initial state
    expectState(actor, 'preparation');

    // Act - Start battle
    actor.send({ type: 'START_BATTLE' });
    await waitForState(actor, 'fighting');

    // Assert
    expectState(actor, 'fighting');

    // Act - Defeat enemy (automatic or via event)
    actor.send({ type: 'ATTACK', attackerId: squad[0].id, targetId: enemies[0].id });
    await waitForState(actor, 'victory');

    // Assert
    expectState(actor, 'victory');
    const snapshot = actor.getSnapshot();
    expect(snapshot.context.result).toBe('victory');
  });

  it('handles retreat by transitioning to retreat state', async () => {
    // Arrange
    const actor = createTestActor(combatMachine);
    actor.start();

    actor.send({ type: 'START_BATTLE' });
    await waitForState(actor, 'fighting');

    // Act
    actor.send({ type: 'RETREAT' });

    // Assert
    await waitForState(actor, 'retreating');
    expectState(actor, 'retreating');
  });

  it('guards prevent starting battle without squad', async () => {
    // Arrange
    const actor = createTestActor(
      combatMachine.provide({
        context: {
          squad: [], // Empty squad
          enemies: [createTestEnemy()],
        },
      })
    );

    actor.start();
    expectState(actor, 'preparation');

    // Act
    actor.send({ type: 'START_BATTLE' });

    // Assert - Should stay in preparation
    await new Promise(resolve => setTimeout(resolve, 100));
    expectState(actor, 'preparation');
  });

  afterEach(() => {
    // Clean up actors
  });
});
```

**Pattern:** Test all state transitions, guard conditions, and context updates. Use `expectState` and `waitForState` for clear assertions.

---

### Cross-Module Integration

Test interactions between Farm and Combat modules.

```typescript
import { createTestGameState, createTestZombie } from '@lib/test-utils/factories';
import { sendZombiesToCombat } from '@features/farm/combatIntegration';
import { startBattle } from '@features/combat/battleController';
import { applyBattleResults } from '@features/farm/battleResults';

describe('Farm-Combat Integration', () => {
  it('zombies sent to combat are removed from farm temporarily', () => {
    // Arrange
    const zombie1 = createTestZombie({ id: 'z1' });
    const zombie2 = createTestZombie({ id: 'z2' });
    const gameState = createTestGameState({
      farm: {
        activeZombies: ['z1', 'z2'],
        zombies: { z1: zombie1, z2: zombie2 },
      },
    });

    // Act
    const result = sendZombiesToCombat(gameState, ['z1']);

    // Assert
    expect(result.farm.activeZombies).toEqual(['z2']); // z1 removed
    expect(result.combat.squad).toContainEqual(zombie1); // z1 in combat
  });

  it('surviving zombies return to farm after battle', () => {
    // Arrange
    const zombie1 = createTestZombie({ id: 'z1', stats: { currentHp: 80 } });
    const gameState = createTestGameState({
      combat: {
        squad: [zombie1],
        result: 'victory',
      },
      farm: {
        activeZombies: [],
      },
    });

    // Act
    const result = applyBattleResults(gameState);

    // Assert
    expect(result.farm.activeZombies).toContain('z1');
    expect(result.farm.zombies.z1.stats.currentHp).toBe(80); // HP preserved
  });

  it('defeated zombies are permanently lost (permadeath)', () => {
    // Arrange
    const zombie1 = createTestZombie({ id: 'z1', stats: { currentHp: 0 } });
    const gameState = createTestGameState({
      combat: {
        squad: [zombie1],
        casualties: ['z1'],
        result: 'defeat',
      },
      farm: {
        zombies: { z1: zombie1 },
      },
    });

    // Act
    const result = applyBattleResults(gameState);

    // Assert
    expect(result.farm.zombies.z1).toBeUndefined(); // Zombie removed
    expect(result.farm.activeZombies).not.toContain('z1');
  });
});
```

**Pattern:** Test boundaries between modules. Verify data flows correctly and state is consistent across modules.

---

## Testing Time-Dependent Features

### Zombie Growth Timers

```typescript
import { setupFakeTimers, advanceTimeByHours, teardownFakeTimers, getCurrentTime } from '@lib/test-utils/mocks';
import { startGrowth, checkGrowthComplete } from '@features/farm/growth';
import { createTestGameState } from '@lib/test-utils/factories';
import { ZombieType } from '@types';

describe('Zombie Growth System', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    teardownFakeTimers();
  });

  it('completes growth after specified time period', () => {
    // Arrange
    const gameState = createTestGameState();
    const plot = startGrowth(gameState, {
      type: ZombieType.SHAMBLER,
      plotId: 'plot-1',
    });

    expect(plot.status).toBe('growing');
    const startTime = getCurrentTime();

    // Act - Advance by growth duration (1 hour for Shambler)
    advanceTimeByHours(1);

    // Assert
    const isComplete = checkGrowthComplete(plot, getCurrentTime());
    expect(isComplete).toBe(true);
    expect(getCurrentTime() - startTime).toBe(3600000); // 1 hour in ms
  });

  it('does not complete before growth time elapses', () => {
    // Arrange
    const gameState = createTestGameState();
    const plot = startGrowth(gameState, {
      type: ZombieType.BRUTE,
      plotId: 'plot-1',
    });

    // Act - Advance by half the growth time (Brute takes 3 hours)
    advanceTimeByHours(1.5);

    // Assert
    const isComplete = checkGrowthComplete(plot, getCurrentTime());
    expect(isComplete).toBe(false);
    expect(plot.status).toBe('growing');
  });
});
```

---

### Daily Decay System

```typescript
import { setupFakeTimers, advanceTimeByDays, teardownFakeTimers } from '@lib/test-utils/mocks';
import { applyDailyDecay } from '@features/farm/decay';
import { createTestZombie } from '@lib/test-utils/factories';

describe('Daily Decay System', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    teardownFakeTimers();
  });

  it('reduces zombie stats by 1% per day when not fed', () => {
    // Arrange
    const zombie = createTestZombie({
      stats: { maxHp: 100, attack: 50, defense: 30 },
      lastFed: Date.now(),
    });

    // Act - Advance 1 day
    advanceTimeByDays(1);
    const decayed = applyDailyDecay(zombie, Date.now());

    // Assert - 1% decay
    expect(decayed.stats.maxHp).toBe(99);
    expect(decayed.stats.attack).toBe(49.5);
    expect(decayed.stats.defense).toBe(29.7);
  });

  it('applies cumulative decay over multiple days', () => {
    // Arrange
    const zombie = createTestZombie({
      stats: { maxHp: 100 },
      lastFed: Date.now(),
    });

    // Act - Advance 10 days
    advanceTimeByDays(10);
    const decayed = applyDailyDecay(zombie, Date.now());

    // Assert - Approximately 10% total decay (compound)
    expect(decayed.stats.maxHp).toBeCloseTo(90.44, 1); // 100 * 0.99^10
  });

  it('does not decay below minimum floor (20% of max)', () => {
    // Arrange
    const zombie = createTestZombie({
      stats: { maxHp: 100 },
      lastFed: Date.now(),
    });

    // Act - Advance 365 days (extreme decay)
    advanceTimeByDays(365);
    const decayed = applyDailyDecay(zombie, Date.now());

    // Assert - Stopped at 20% floor
    expect(decayed.stats.maxHp).toBeGreaterThanOrEqual(20);
  });
});
```

**Pattern:** Use `setupFakeTimers` and time advance helpers to test time-based mechanics. Test edge cases like long durations and decay floors.

---

## Testing Randomness

### Mutation System

```typescript
import { mockRandomValue, mockRandomSequence, resetRandom } from '@lib/test-utils/mocks';
import { rollMutation } from '@features/farm/mutations';
import { createTestZombie } from '@lib/test-utils/factories';
import { MutationType } from '@types';

describe('Mutation System', () => {
  afterEach(() => {
    resetRandom();
  });

  it('applies mutation when random roll succeeds', () => {
    // Arrange
    const zombie = createTestZombie();
    mockRandomValue(0.03); // Below 5% threshold

    // Act
    const result = rollMutation(zombie);

    // Assert
    expect(result.mutated).toBe(true);
    expect(result.mutationType).toBeDefined();
  });

  it('does not mutate when random roll fails', () => {
    // Arrange
    const zombie = createTestZombie();
    mockRandomValue(0.95); // Well above threshold

    // Act
    const result = rollMutation(zombie);

    // Assert
    expect(result.mutated).toBe(false);
    expect(result.mutationType).toBeUndefined();
  });

  it('selects mutation types with correct probabilities', () => {
    // Arrange
    const zombie = createTestZombie();

    // Sequence: first roll triggers mutation, second roll selects type
    mockRandomSequence([0.01, 0.25]); // Mutation succeeds, mid-range type

    // Act
    const result = rollMutation(zombie);

    // Assert
    expect(result.mutated).toBe(true);
    // Verify type selection based on probability distribution
    expect([
      MutationType.SPEED_BOOST,
      MutationType.ARMOR_PLATES,
      MutationType.REGENERATION,
    ]).toContain(result.mutationType);
  });
});
```

---

### Combat Critical Hits

```typescript
import { mockRandomValue, resetRandom } from '@lib/test-utils/mocks';
import { calculateAttackDamage } from '@features/combat/damage';
import { createTestZombie, createTestEnemy } from '@lib/test-utils/factories';

describe('Critical Hit System', () => {
  afterEach(() => {
    resetRandom();
  });

  it('deals double damage on critical hit', () => {
    // Arrange
    const attacker = createTestZombie({ stats: { attack: 50 } });
    const defender = createTestEnemy({ stats: { defense: 10 } });
    mockRandomValue(0.05); // Below 10% crit chance

    // Act
    const result = calculateAttackDamage(attacker, defender);

    // Assert
    expect(result.damage).toBe(80); // (50 - 10) * 2
    expect(result.isCritical).toBe(true);
  });

  it('deals normal damage on non-critical hit', () => {
    // Arrange
    const attacker = createTestZombie({ stats: { attack: 50 } });
    const defender = createTestEnemy({ stats: { defense: 10 } });
    mockRandomValue(0.50); // Above crit chance

    // Act
    const result = calculateAttackDamage(attacker, defender);

    // Assert
    expect(result.damage).toBe(40); // 50 - 10
    expect(result.isCritical).toBe(false);
  });
});
```

**Pattern:** Use `mockRandomValue` and `mockRandomSequence` to control random outcomes. Test probability thresholds and edge cases.

---

## Testing Persistence

### Save and Load Game State

```typescript
import { mockLocalStorage, restoreLocalStorage } from '@lib/test-utils/mocks';
import { saveGame, loadGame } from '@features/game/persistence';
import { createTestGameState } from '@lib/test-utils/factories';

describe('Game Persistence', () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  afterEach(() => {
    restoreLocalStorage();
  });

  it('saves complete game state to localStorage', () => {
    // Arrange
    const gameState = createTestGameState({
      player: { level: 5, xp: 1500 },
      farm: { activeZombies: ['z1', 'z2'] },
    });

    // Act
    saveGame(gameState);

    // Assert
    const saved = localStorage.getItem('zombieFarm_gameState');
    expect(saved).toBeDefined();
    const parsed = JSON.parse(saved!);
    expect(parsed.player.level).toBe(5);
    expect(parsed.farm.activeZombies).toHaveLength(2);
  });

  it('loads game state from localStorage', () => {
    // Arrange
    const originalState = createTestGameState({
      player: { level: 10 },
    });
    saveGame(originalState);

    // Act
    const loadedState = loadGame();

    // Assert
    expect(loadedState).toBeDefined();
    expect(loadedState.player.level).toBe(10);
  });

  it('handles missing save data gracefully', () => {
    // Arrange - No data saved

    // Act
    const loadedState = loadGame();

    // Assert
    expect(loadedState).toBeNull();
    // OR returns default state, depending on implementation
  });

  it('handles corrupted save data', () => {
    // Arrange
    localStorage.setItem('zombieFarm_gameState', 'invalid-json{');

    // Act
    const loadedState = loadGame();

    // Assert
    expect(loadedState).toBeNull(); // Safely handles error
  });
});
```

**Pattern:** Use `mockLocalStorage` for persistence testing. Test save, load, missing data, and corrupted data scenarios.

---

## Advanced Patterns

### Testing Error Handling

```typescript
import { plantZombie } from '@features/farm/planting';
import { createTestGameState } from '@lib/test-utils/factories';
import { Resource } from '@types';

describe('Error Handling', () => {
  it('throws descriptive error when inventory is insufficient', () => {
    // Arrange
    const gameState = createTestGameState({
      inventory: {
        resources: { [Resource.SEEDS]: 0 }, // No seeds
      },
    });

    // Act & Assert
    expect(() => {
      plantZombie(gameState, { type: 'shambler', plotId: 'plot-1' });
    }).toThrow(/insufficient seeds/i);
  });

  it('returns error object instead of throwing (alternative pattern)', () => {
    // Arrange
    const gameState = createTestGameState({
      farm: { capacity: 10, activeZombies: Array(10).fill('zombie') },
    });

    // Act
    const result = plantZombie(gameState, { type: 'shambler', plotId: 'plot-1' });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('CAPACITY_FULL');
  });
});
```

---

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react';
import { createTestActor, waitForState } from '@lib/test-utils/mocks';
import { gameMachine } from '@features/game/gameMachine';

describe('Async State Transitions', () => {
  it('waits for async state transition to complete', async () => {
    // Arrange
    const actor = createTestActor(gameMachine);
    actor.start();

    // Act
    actor.send({ type: 'LOAD_GAME' });

    // Assert - Wait for async transition
    await waitForState(actor, 'loaded', 5000); // 5 second timeout
    expect(actor.getSnapshot().value).toBe('loaded');
  });

  it('handles timeout when state transition takes too long', async () => {
    // Arrange
    const actor = createTestActor(gameMachine);
    actor.start();

    // Act & Assert
    actor.send({ type: 'SLOW_OPERATION' });

    await expect(
      waitForState(actor, 'completed', 100) // Short timeout
    ).rejects.toThrow(/timeout/i);
  });
});
```

---

### Testing Edge Cases

```typescript
import { calculateDamage } from '@features/combat/damage';
import { createTestZombie, createTestEnemy } from '@lib/test-utils/factories';

describe('Edge Cases', () => {
  it('handles zero attack value', () => {
    // Arrange
    const attacker = createTestZombie({ stats: { attack: 0 } });
    const defender = createTestEnemy();

    // Act
    const damage = calculateDamage(attacker, defender);

    // Assert
    expect(damage).toBe(1); // Minimum damage
  });

  it('handles extremely high defense', () => {
    // Arrange
    const attacker = createTestZombie({ stats: { attack: 50 } });
    const defender = createTestEnemy({ stats: { defense: 9999 } });

    // Act
    const damage = calculateDamage(attacker, defender);

    // Assert
    expect(damage).toBe(1); // Still deals minimum
  });

  it('handles NaN and undefined values safely', () => {
    // Arrange
    const attacker = createTestZombie({ stats: { attack: NaN } });
    const defender = createTestEnemy();

    // Act & Assert
    expect(() => {
      calculateDamage(attacker, defender);
    }).not.toThrow();
  });
});
```

---

## Summary of Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Factories**: Reduce boilerplate with test data factories
3. **Mock External Dependencies**: Time, randomness, localStorage
4. **Test Behavior, Not Implementation**: Focus on outcomes users/systems observe
5. **Clean Up After Tests**: Use `afterEach` to reset mocks and timers
6. **Test Edge Cases**: Empty states, invalid inputs, boundary conditions
7. **Use Descriptive Names**: Test names should explain scenario and expectation
8. **Keep Tests Fast**: Use fake timers, avoid real delays
9. **Test One Thing Per Test**: Focused tests are easier to debug
10. **Use Custom Matchers**: Improve readability with domain-specific assertions

---

For more information, see:
- **README.md** - Complete test utilities reference
- **META/TESTING.md** - Testing standards and philosophy
- **templates/** - Test file templates for quick starting
