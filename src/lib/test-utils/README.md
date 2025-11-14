# Test Utilities

This directory contains testing utilities, helpers, and mock implementations for the Zombie Farm project. These utilities support Test-Driven Development (TDD) and ensure consistent, reliable testing practices across all modules.

## Table of Contents

- [Overview](#overview)
- [Test Data Factories](#test-data-factories)
  - [Factory Functions](#factory-functions)
  - [Using Factories](#using-factories)
- [Test Fixtures and Scenarios](#test-fixtures-and-scenarios)
  - [Constants](#constants)
  - [Scenarios](#scenarios)
- [Custom Matchers](#custom-matchers)
- [Mock Utilities](#mock-utilities)
  - [localStorage Mocking](#localstorage-mocking)
  - [Timer Mocking](#timer-mocking)
  - [Random Number Mocking](#random-number-mocking)
  - [XState Testing](#xstate-testing)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Reference](#reference)

---

## Overview

The test utilities are organized into several categories:

- **Factories** (`/factories`) - Test data factories for creating game objects (GameState, Zombie, Enemy, etc.)
- **Fixtures** (`/fixtures`) - Predefined test constants and scenarios
- **Matchers** (`/matchers`) - Custom Jest matchers for domain-specific assertions
- **Mocks** (`/mocks`) - Mock implementations for browser APIs, timers, and game systems

All utilities follow the **AAA pattern** (Arrange, Act, Assert) and are designed to be:

- **Isolated** - Each test gets fresh, independent state
- **Deterministic** - Tests produce the same results every time
- **Fast** - No real timers, network calls, or expensive operations
- **Readable** - Clear APIs with descriptive function names

---

## Test Data Factories

Factories create test data objects with sensible defaults and support partial overrides for flexibility.

### Factory Functions

Import all factories from a single location:

```typescript
import {
  createTestGameState,
  createTestPlayer,
  createTestZombie,
  createTestEnemy,
  createTestInventory,
  createTestFarmState,
  createTestCombatState,
} from '@lib/test-utils/factories';
```

#### Available Factories

**createTestGameState(overrides?)**
Creates a complete GameState with player, farm, combat, and world data.

```typescript
const gameState = createTestGameState({
  player: { level: 5, xp: 1000 },
  farm: { activeZombies: ['zombie-1', 'zombie-2'] },
});
```

**createTestPlayer(overrides?)**
Creates a Player with level, XP, and progression data.

```typescript
const player = createTestPlayer({
  level: 10,
  xp: 5000,
  name: 'TestPlayer',
});
```

**createTestZombie(overrides?)**
Creates a Zombie with stats, type, and status.

```typescript
const zombie = createTestZombie({
  type: ZombieType.BRUTE,
  stats: { maxHp: 150, attack: 25 },
  happiness: 100,
});
```

**createTestEnemy(overrides?)**
Creates an Enemy unit with type, stats, and AI settings.

```typescript
const enemy = createTestEnemy({
  type: EnemyType.KNIGHT,
  stats: { maxHp: 100, defense: 30 },
});
```

**createTestInventory(overrides?)**
Creates an Inventory with resources, currencies, and items.

```typescript
const inventory = createTestInventory({
  resources: { [Resource.BONES]: 100 },
  currencies: { [Currency.DARK_COINS]: 500 },
});
```

**createTestFarmState(overrides?)**
Creates a FarmState with plots, zombies, and buildings.

```typescript
const farmState = createTestFarmState({
  activeZombies: ['zombie-1', 'zombie-2'],
  capacity: 20,
});
```

**createTestCombatState(overrides?)**
Creates a CombatState for battle scenarios.

```typescript
const combatState = createTestCombatState({
  phase: CombatPhase.FIGHTING,
  currentWave: 2,
});
```

### Using Factories

Factories use the **builder pattern** for flexible test data creation:

```typescript
// Minimal - use all defaults
const zombie = createTestZombie();

// Partial override - customize specific fields
const strongZombie = createTestZombie({
  stats: { attack: 50, maxHp: 200 },
});

// Deep override - customize nested objects
const customGameState = createTestGameState({
  player: { level: 10 },
  farm: {
    activeZombies: ['z1', 'z2'],
  },
  inventory: {
    resources: { [Resource.BONES]: 500 },
  },
});

// Combine with other utilities
mockRandomValue(0.5);
const mutatedZombie = createTestZombie({ hasMutation: true });
```

**Benefits of Factories:**
- Consistent test data structure
- Type-safe overrides
- Reduce boilerplate
- Easy to read and maintain
- Automatically valid data

---

## Test Fixtures and Scenarios

Fixtures provide predefined test data for common scenarios and edge cases.

### Constants

Import test constants:

```typescript
import {
  TEST_GAME_STATE,
  TEST_PLAYER,
  TEST_ZOMBIE,
  TEST_ENEMY,
  TEST_INVENTORY,
} from '@lib/test-utils/fixtures';
```

These are frozen (immutable) objects representing standard game states.

**TEST_GAME_STATE**
A complete, valid game state with:
- Level 1 player with 0 XP
- Empty farm (no zombies)
- Starting inventory (100 bones, 50 dark coins)
- Initial world state

**TEST_PLAYER**
A baseline player:
- Level 1, 0 XP
- Default name

**TEST_ZOMBIE**
A standard Shambler zombie:
- Type: Shambler
- Full health (100 HP)
- Balanced stats

**TEST_ENEMY**
A standard Villager enemy:
- Type: Villager
- Medium difficulty
- Balanced stats

**TEST_INVENTORY**
Starting inventory:
- 100 Bones
- 50 Dark Coins
- Empty item slots

### Scenarios

Import test scenarios:

```typescript
import {
  createSimpleBattleScenario,
  createMultiWaveBattleScenario,
  createBossFightScenario,
  createGrowingZombieScenario,
  createDecayingZombieScenario,
  createEmptyGameStateScenario,
  createMaxCapacityScenario,
} from '@lib/test-utils/fixtures';
```

**Battle Scenarios:**
- `createSimpleBattleScenario()` - 1v1 zombie vs enemy
- `createMultiWaveBattleScenario()` - 3 zombies vs 2 waves of enemies
- `createBossFightScenario()` - Squad vs single strong boss

**Farm Scenarios:**
- `createGrowingZombieScenario()` - Zombie in growth phase
- `createDecayingZombieScenario()` - Zombie with low happiness (decay active)

**Edge Case Scenarios:**
- `createEmptyGameStateScenario()` - Completely empty game state
- `createMaxCapacityScenario()` - Farm at maximum zombie capacity

**Using Scenarios:**

```typescript
test('combat victory awards loot', async () => {
  // Arrange
  const scenario = createSimpleBattleScenario();
  const actor = createTestActor(combatMachine, scenario);
  actor.start();

  // Act
  await sendEventAndWait(actor, { type: 'START_BATTLE' }, 'fighting');
  // ... simulate battle ...

  // Assert
  expect(actor.getSnapshot().context.loot).toBeDefined();
});
```

---

## Custom Matchers

Custom Jest matchers provide domain-specific assertions with better error messages.

### Available Matchers

Import and register matchers in your test setup:

```typescript
import { registerCustomMatchers } from '@lib/test-utils/matchers';

// In setupTests.ts or beforeAll
registerCustomMatchers();
```

**toHaveResource(resource, amount?)**
Check if inventory has a specific resource.

```typescript
expect(inventory).toHaveResource(Resource.BONES);
expect(inventory).toHaveResource(Resource.BONES, 100); // Exact amount
```

**toBeInState(stateName)**
Check if an object is in a specific state.

```typescript
expect(plot).toBeInState('growing');
expect(zombie).toBeInState('idle');
```

**toHaveZombie(zombieId)**
Check if GameState or farm contains a zombie.

```typescript
expect(gameState).toHaveZombie('zombie-1');
expect(farmState).toHaveZombie('zombie-2');
```

**toHaveStats(stats)**
Verify unit stats match expected values.

```typescript
expect(zombie).toHaveStats({ maxHp: 100, attack: 15 });
expect(enemy).toHaveStats({ defense: 25 });
```

**toHaveCurrency(currency, amount)**
Check if inventory has sufficient currency.

```typescript
expect(inventory).toHaveCurrency(Currency.DARK_COINS, 100);
```

**toBeHealthy(threshold?)**
Check if a unit is at full or near-full health.

```typescript
expect(zombie).toBeHealthy(); // >= 90% HP
expect(zombie).toBeHealthy(0.8); // >= 80% HP
```

### Benefits of Custom Matchers

- More readable test assertions
- Better error messages
- Domain-specific semantics
- Reduces test boilerplate

---

## Mock Utilities

Import all mocks from a single location:

```typescript
import {
  mockLocalStorage,
  setupFakeTimers,
  mockRandomValue,
  createTestActor,
} from '@lib/test-utils/mocks';
```

### localStorage Mocking

Mock the browser's localStorage API for testing save/load functionality without affecting real storage.

#### Basic Usage

```typescript
import { mockLocalStorage, restoreLocalStorage } from '@lib/test-utils/mocks';

beforeEach(() => {
  mockLocalStorage();
});

afterEach(() => {
  restoreLocalStorage();
});

test('saves game state to localStorage', () => {
  const gameState = { level: 5, zombies: 3 };
  localStorage.setItem('gameState', JSON.stringify(gameState));

  const retrieved = JSON.parse(localStorage.getItem('gameState')!);
  expect(retrieved).toEqual(gameState);
});
```

#### Helper Functions

```typescript
import {
  getMockStorageContents,
  setMockStorageContents,
  clearMockStorage
} from '@lib/test-utils/mocks';

// Set up test data
setMockStorageContents({
  gameState: JSON.stringify({ level: 1 }),
  settings: JSON.stringify({ sound: true }),
});

// Inspect storage
const contents = getMockStorageContents();
expect(contents).toHaveProperty('gameState');

// Clear storage without full teardown
clearMockStorage();
```

#### API Reference

- `mockLocalStorage()` - Install the mock
- `restoreLocalStorage()` - Restore original localStorage
- `getMockStorageContents()` - Get all stored items as an object
- `setMockStorageContents(items)` - Set multiple items at once
- `clearMockStorage()` - Clear storage without restoring

---

### Timer Mocking

Control time in tests using Jest fake timers for testing growth timers, decay, cooldowns, and other time-dependent features.

#### Basic Usage

```typescript
import { setupFakeTimers, advanceTime, teardownFakeTimers } from '@lib/test-utils/mocks';

beforeEach(() => {
  setupFakeTimers();
});

afterEach(() => {
  teardownFakeTimers();
});

test('zombie grows after 1 hour', () => {
  plantZombie('shambler'); // Takes 1 hour

  // Fast-forward time by 1 hour
  advanceTime(60 * 60 * 1000);

  expect(isZombieReady()).toBe(true);
});
```

#### Time Helpers

```typescript
import {
  advanceTimeBySeconds,
  advanceTimeByMinutes,
  advanceTimeByHours,
  advanceTimeByDays
} from '@lib/test-utils/mocks';

// Advance by convenient units
advanceTimeBySeconds(30);
advanceTimeByMinutes(5);
advanceTimeByHours(2);
advanceTimeByDays(1); // Useful for decay testing
```

#### Advanced Timer Control

```typescript
import {
  advanceToNextTimer,
  runAllTimers,
  getTimerCount,
  getCurrentTime,
} from '@lib/test-utils/mocks';

// Step through timers one by one
setTimeout(() => console.log('First'), 100);
setTimeout(() => console.log('Second'), 200);
advanceToNextTimer(); // Logs "First"
advanceToNextTimer(); // Logs "Second"

// Check pending timers
expect(getTimerCount()).toBe(0); // All timers executed

// Run all timers at once
runAllTimers();

// Get current fake time
const now = getCurrentTime();
```

#### API Reference

- `setupFakeTimers(config?)` - Enable fake timers
- `teardownFakeTimers()` - Restore real timers
- `advanceTime(ms)` - Advance time by milliseconds
- `advanceToNextTimer()` - Run next pending timer
- `runAllTimers()` - Run all pending timers
- `runOnlyPendingTimers()` - Run currently pending timers only
- `getTimerCount()` - Number of pending timers
- `getCurrentTime()` - Current fake time
- `setCurrentTime(timestamp)` - Set the fake time
- `clearAllTimers()` - Clear all pending timers
- `advanceTimeBySeconds/Minutes/Hours/Days(n)` - Time helpers

---

### Random Number Mocking

Make random behavior deterministic for testing mutations, critical hits, loot drops, and other RNG-dependent mechanics.

#### Basic Usage

```typescript
import { mockRandomValue, resetRandom } from '@lib/test-utils/mocks';

beforeEach(() => {
  mockRandomValue(0.5); // All Math.random() calls return 0.5
});

afterEach(() => {
  resetRandom();
});

test('mutation occurs at 50% threshold', () => {
  const hasMutation = checkMutation(0.5); // Uses mocked 0.5
  expect(hasMutation).toBe(true);
});
```

#### Sequence-based Random

```typescript
import { mockRandomSequence } from '@lib/test-utils/mocks';

// Return specific values in order
mockRandomSequence([0.1, 0.5, 0.9]);

expect(Math.random()).toBe(0.1);
expect(Math.random()).toBe(0.5);
expect(Math.random()).toBe(0.9);
expect(Math.random()).toBe(0.1); // Cycles back
```

#### Seeded Random

```typescript
import { mockRandomSeed } from '@lib/test-utils/mocks';

// Deterministic but varied randomness
mockRandomSeed(12345);
const values1 = [Math.random(), Math.random(), Math.random()];

mockRandomSeed(12345); // Same seed
const values2 = [Math.random(), Math.random(), Math.random()];

expect(values1).toEqual(values2); // Identical sequence
```

#### Random Helpers

```typescript
import { randomInt, randomFloat, chance, randomPick } from '@lib/test-utils/mocks';

mockRandomValue(0.5);

// Generate deterministic values
const diceRoll = randomInt(1, 6); // 3
const damage = randomFloat(50, 100); // 75
const isCritical = chance(0.15); // false (0.5 >= 0.15)
const loot = randomPick(['bone', 'flesh', 'gem']); // 'flesh'
```

#### API Reference

- `mockRandomValue(value)` - Always return this value
- `mockRandomSequence(values)` - Return values in sequence (cycles)
- `mockRandomSeed(seed)` - Seeded random number generator
- `resetRandom()` - Restore original Math.random
- `getNextRandom()` - Peek at next sequence value
- `getSequenceIndex()` - Current sequence position
- `isRandomMocked()` - Check if random is mocked
- `randomInt(min, max)` - Random integer helper
- `randomFloat(min, max)` - Random float helper
- `chance(probability)` - Probability check helper
- `randomPick(array)` - Random array element helper

---

### XState Testing

Test state machines and actors with utilities for waiting on transitions, asserting states, and tracking events.

#### Basic Usage

```typescript
import {
  createTestActor,
  expectState,
  waitForState
} from '@lib/test-utils/mocks';
import { myMachine } from './myMachine';

test('state machine transitions correctly', async () => {
  // Arrange
  const actor = createTestActor(myMachine);
  actor.start();

  // Assert initial state
  expectState(actor, 'idle');

  // Act
  actor.send({ type: 'START' });

  // Wait for transition
  await waitForState(actor, 'running');

  // Assert final state
  expectState(actor, 'running');

  // Cleanup
  actor.stop();
});
```

#### Custom Initial Context

```typescript
// Use machine.provide() to customize context
const customMachine = farmMachine.provide({
  context: {
    zombies: [],
    resources: { bones: 100, darkCoins: 500 },
  },
});

const actor = createTestActor(customMachine);
actor.start();
```

#### Send and Wait

```typescript
import { sendEventAndWait } from '@lib/test-utils/mocks';

// Combine sending event and waiting for state
await sendEventAndWait(actor, { type: 'PLANT_SEED' }, 'growing');
expectState(actor, 'growing');
```

#### Inspecting State

```typescript
import { getMachineSnapshot, getContext, getStateValue } from '@lib/test-utils/mocks';

const snapshot = getMachineSnapshot(actor);
const context = getContext(snapshot);
const state = getStateValue(snapshot);

expect(state).toBe('running');
expect(context.zombieCount).toBe(5);
```

#### Spying on Transitions

```typescript
import { createTransitionSpy } from '@lib/test-utils/mocks';

const spy = createTransitionSpy();
actor.subscribe(spy.track);

actor.send({ type: 'START' });
actor.send({ type: 'PAUSE' });

expect(spy.transitions).toHaveLength(2);
expect(getStateValue(spy.transitions[0])).toBe('running');
expect(getStateValue(spy.transitions[1])).toBe('paused');
```

#### Spying on Events

```typescript
import { createEventSpy } from '@lib/test-utils/mocks';

const spy = createEventSpy();
const wrappedSend = spy.wrap(actor.send.bind(actor));

wrappedSend({ type: 'START' });
wrappedSend({ type: 'PAUSE' });

expect(spy.events).toHaveLength(2);
expect(spy.events[0]).toEqual({ type: 'START' });
```

#### API Reference

- `createTestActor(machine, initialContext?)` - Create actor for testing
- `waitForState(actor, stateName, timeout?)` - Wait for state transition
- `expectState(actor, stateName)` - Assert current state
- `sendEventAndWait(actor, event, expectedState, timeout?)` - Send and wait
- `getMachineSnapshot(actor)` - Get current snapshot
- `getStateValue(snapshot)` - Extract state value as string
- `isInState(snapshot, stateName)` - Check if in state
- `getContext(snapshot)` - Extract context from snapshot
- `canSendEvent(actor, eventType)` - Check if event can be sent
- `createTransitionSpy()` - Spy on state transitions
- `createEventSpy()` - Spy on sent events

---

## Usage Examples

### Testing Zombie Growth with Timers

```typescript
import { setupFakeTimers, advanceTimeByHours, teardownFakeTimers } from '@lib/test-utils/mocks';

beforeEach(() => {
  setupFakeTimers();
});

afterEach(() => {
  teardownFakeTimers();
});

test('zombie completes growth after specified time', () => {
  // Arrange
  const zombie = plantZombie({ type: 'shambler', growthTime: 1 }); // 1 hour

  // Act
  advanceTimeByHours(1);

  // Assert
  expect(zombie.status).toBe('ready');
});
```

### Testing Mutation Chance

```typescript
import { mockRandomValue, resetRandom } from '@lib/test-utils/mocks';

afterEach(() => {
  resetRandom();
});

test('mutation occurs when random < mutation chance', () => {
  // Arrange
  mockRandomValue(0.04); // Below 5% threshold

  // Act
  const zombie = harvestZombie();

  // Assert
  expect(zombie.hasMutation).toBe(true);
});

test('no mutation when random >= mutation chance', () => {
  // Arrange
  mockRandomValue(0.06); // Above 5% threshold

  // Act
  const zombie = harvestZombie();

  // Assert
  expect(zombie.hasMutation).toBe(false);
});
```

### Testing Save/Load

```typescript
import { mockLocalStorage, restoreLocalStorage } from '@lib/test-utils/mocks';

beforeEach(() => {
  mockLocalStorage();
});

afterEach(() => {
  restoreLocalStorage();
});

test('game state persists across save and load', () => {
  // Arrange
  const originalState = {
    player: { level: 5, xp: 1000 },
    zombies: [{ id: '1', type: 'shambler' }],
  };

  // Act
  saveGame(originalState);
  const loadedState = loadGame();

  // Assert
  expect(loadedState).toEqual(originalState);
});
```

### Testing State Machine with Multiple Transitions

```typescript
import { createTestActor, expectState, sendEventAndWait } from '@lib/test-utils/mocks';
import { combatMachine } from '@features/combat';

test('combat flows from preparation to victory', async () => {
  // Arrange
  const actor = createTestActor(combatMachine, {
    squad: [createTestZombie()],
    enemies: [createTestEnemy()],
  });
  actor.start();

  // Act & Assert
  expectState(actor, 'preparation');

  await sendEventAndWait(actor, { type: 'START_BATTLE' }, 'fighting');
  expectState(actor, 'fighting');

  await sendEventAndWait(actor, { type: 'ENEMY_DEFEATED' }, 'fighting');
  await sendEventAndWait(actor, { type: 'VICTORY' }, 'rewards');
  expectState(actor, 'rewards');

  // Cleanup
  actor.stop();
});
```

---

## Best Practices

### 1. Always Clean Up

```typescript
// ✅ Good
beforeEach(() => {
  mockLocalStorage();
  setupFakeTimers();
  mockRandomValue(0.5);
});

afterEach(() => {
  restoreLocalStorage();
  teardownFakeTimers();
  resetRandom();
});

// ❌ Bad - no cleanup, mocks leak between tests
beforeEach(() => {
  mockLocalStorage();
});
```

### 2. Use Descriptive Test Names

```typescript
// ✅ Good
test('zombie growth completes after 1 hour of game time', () => {});
test('mutation occurs when random value is below 5% threshold', () => {});

// ❌ Bad
test('it works', () => {});
test('test 1', () => {});
```

### 3. Follow AAA Pattern

```typescript
test('feeding zombie increases happiness', () => {
  // Arrange - Set up test data
  const zombie = createTestZombie({ happiness: 50 });
  const food = { type: 'flesh', happiness: 20 };

  // Act - Perform the action
  feedZombie(zombie, food);

  // Assert - Check the outcome
  expect(zombie.happiness).toBe(70);
});
```

### 4. Test One Thing Per Test

```typescript
// ✅ Good - focused tests
test('planting seed creates a growing zombie', () => {
  const zombie = plantSeed('shambler');
  expect(zombie.status).toBe('growing');
});

test('planting seed consumes the seed from inventory', () => {
  plantSeed('shambler');
  expect(inventory.seeds.shambler).toBe(0);
});

// ❌ Bad - testing multiple things
test('planting seed', () => {
  const zombie = plantSeed('shambler');
  expect(zombie.status).toBe('growing');
  expect(inventory.seeds.shambler).toBe(0);
  expect(farm.plots[0].occupied).toBe(true);
});
```

### 5. Make Tests Deterministic

```typescript
// ✅ Good - uses mock random
mockRandomValue(0.1);
const damage = calculateDamage(baseAttack);
expect(damage).toBe(expectedValue);

// ❌ Bad - relies on real random
const damage = calculateDamage(baseAttack);
// This test might fail randomly!
```

### 6. Keep Tests Fast

```typescript
// ✅ Good - uses fake timers
setupFakeTimers();
startGrowth();
advanceTimeByHours(1);
expect(isGrown()).toBe(true);

// ❌ Bad - waits for real time
await new Promise(resolve => setTimeout(resolve, 3600000)); // 1 hour!
```

---

## Reference

### Related Documentation

- **META/TESTING.md** - Comprehensive testing standards and philosophy
- **META/WORKFLOW.md** - TDD workflow and agent collaboration
- **TODO-TEST.md** - Testing infrastructure roadmap

### Testing Tools

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing (future)
- **XState** - State machine testing

### Coverage Goals

- **Critical code** (Farm, Combat logic): ~100% coverage
- **Overall project**: 80%+ coverage
- **UI components**: Meaningful tests over snapshots

### Common Patterns

#### Testing Time-Dependent Features

```typescript
setupFakeTimers();
// ... test code ...
advanceTimeByDays(1);
teardownFakeTimers();
```

#### Testing Probability-Based Features

```typescript
mockRandomValue(0.3);
// ... test code ...
resetRandom();
```

#### Testing State Machines

```typescript
const actor = createTestActor(machine);
actor.start();
// ... test code ...
actor.stop();
```

#### Testing Persistence

```typescript
mockLocalStorage();
// ... test code ...
restoreLocalStorage();
```

---

## Future Additions

The following utilities are planned for future phases:

- **Phaser Mocks** - Mock Phaser objects for UI testing (deferred until Phaser integration)
- **Integration Helpers** - Multi-step game flow testing utilities
- **Performance Testing** - Benchmarking utilities for critical paths

See **TODO-TEST.md** Phase 5-9 for the complete testing roadmap.

---

## Related Documentation

- **EXAMPLES.md** - Comprehensive testing pattern examples
- **templates/** - Test file templates for quick starting
- **META/TESTING.md** - Testing standards and philosophy
- **META/WORKFLOW.md** - TDD workflow
- **TODO-TEST.md** - Testing infrastructure roadmap

---

**Remember**: Good tests are the foundation of maintainable code. These utilities make testing easier, faster, and more reliable. Use them consistently across all modules!
