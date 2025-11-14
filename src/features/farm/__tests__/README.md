# Farm Module Tests

This directory contains all tests for the farm module, the core system where zombies are grown, managed, and maintained.

## Overview

The farm module implements the **zombie cultivation and management** mechanics for Zombie Farm, where players plant seeds, harvest zombies, manage decay/happiness, and build their undead horde. All farm logic is tested comprehensively following **Test-Driven Development (TDD)** principles.

## Testing Strategy

### 1. Test Organization

Tests are organized by domain functionality:

- **Planting Tests**: Seed validation, plot availability, planting actions
- **Growth Tests**: Time progression, watering, fertilizing, offline progress
- **Harvesting Tests**: Ready detection, zombie emergence, plot clearing
- **Decay Tests**: Daily stat loss, feeding mechanics, happiness system
- **Capacity Tests**: Active zombie cap, Crypt storage, deployment
- **Resource Tests**: Gathering, production, consumption, node timers
- **Building Tests**: Construction, placement, prerequisites, upgrades
- **Time System Tests**: Day/night cycles, weather effects, offline calculations

### 2. Test Coverage Goals

Per **TESTING.md** standards:
- **Farm Logic**: ~100% coverage (critical game mechanics)
- **Overall Module**: 80%+ coverage minimum

### 3. Test Utilities

All farm tests use helpers from `/lib/test-utils/`:

- `farmStateFactory.ts` - Farm state creation with defaults
- `zombieFactory.ts` - Zombie entities with stats, types, states
- `inventoryFactory.ts` - Player inventory and resource management
- `mockTimers.ts` - Time progression simulation
- `testScenarios.ts` - Common farm scenarios (TUTORIAL_FARM, LATE_GAME_FARM)

## Authority

All farm mechanics MUST match **DOMAIN-FARM.md** specifications:

### Zombie Lifecycle
```typescript
// Planting
plantSeed(plotId, seedType) -> Plot enters "growing" state

// Growth
baseGrowthTime = seedConfig[seedType].growthMinutes
// Can be accelerated by watering/fertilizing

// Harvesting
harvestZombie(plotId) -> Zombie joins activeZombies[]
```

### Decay Mechanics
- **Daily Decay**: -1% stats per day if not fed
- **Feeding**: Resets decay counter, prevents stat loss for 24h
- **Happiness Decay**: -10% per day if not fed
- **Decay Floor**: Stats cannot decay below 50% of original
- **Crypt Storage**: No decay while in Crypt

### Capacity Management
- **Starting Cap**: 10 active zombies
- **Max Cap**: ~100 (with all upgrades)
- **Overflow**: Excess zombies auto-sent to Crypt
- **Crypt**: Unlimited storage, no decay, no resource consumption

### Resources
- **Rotten Wood**: Basic building material
- **Bones**: Building and fertilizer ingredient
- **Blood Water**: Watering zombie crops
- **Corpse Dust**: Potent fertilizer
- **Soul Fragments**: Magical upgrades and mutations

### Time Systems
- **Day/Night Cycle**: 30 min real-time (20 day, 10 night)
- **Weather**: Blood Rain (growth boost), Bright Sunlight (decay increase), Fog
- **Offline Progress**: Calculate elapsed time, apply decay, update resources

## Writing Farm Tests

### AAA Pattern
All tests follow **Arrange-Act-Assert**:

```typescript
describe('plantSeed', () => {
  it('plants seed in empty plot and starts growth timer', () => {
    // Arrange
    const farmState = createTestFarmState({
      plots: [{ id: 'plot-1', state: PlotState.EMPTY }],
    });
    const inventory = createTestInventory({
      seeds: [{ type: ZombieType.SHAMBLER, quantity: 5 }],
    });

    // Act
    const result = plantSeed(farmState, inventory, 'plot-1', ZombieType.SHAMBLER);

    // Assert
    expect(result.plots[0].state).toBe(PlotState.GROWING);
    expect(result.plots[0].seedType).toBe(ZombieType.SHAMBLER);
    expect(result.plots[0].growthTimer).toBeGreaterThan(0);
  });
});
```

### Using Test Factories

```typescript
import {
  createTestFarmState,
  createTestZombie,
  createTestInventory,
} from '@lib/test-utils/factories';

it('prevents planting when no seeds available', () => {
  // Arrange - Use factory with no seeds
  const farmState = createTestFarmState();
  const inventory = createTestInventory({ seeds: [] });

  // Act
  const result = plantSeed(farmState, inventory, 'plot-1', ZombieType.SHAMBLER);

  // Assert
  expect(result.error).toBe('NO_SEEDS_AVAILABLE');
  expect(farmState.plots[0].state).toBe(PlotState.EMPTY);
});
```

### Testing Time-Dependent Features

Use **mockTimers** for deterministic time-based tests:

```typescript
import { setupMockTimers, advanceTimeBy } from '@lib/test-utils/mocks/mockTimers';

describe('zombie growth', () => {
  beforeEach(() => {
    setupMockTimers();
  });

  it('completes growth after exact growth duration', () => {
    // Arrange
    const farmState = createTestFarmState({
      plots: [{
        id: 'plot-1',
        state: PlotState.GROWING,
        seedType: ZombieType.SHAMBLER,
        growthTimer: 300, // 5 minutes in seconds
        plantedAt: Date.now(),
      }],
    });

    // Act - Advance time by 5 minutes
    advanceTimeBy(5 * 60 * 1000); // 5 minutes in ms
    const result = updateGrowthTimers(farmState);

    // Assert
    expect(result.plots[0].state).toBe(PlotState.READY_TO_HARVEST);
    expect(result.plots[0].growthTimer).toBe(0);
  });
});
```

### Testing Offline Progress

```typescript
describe('offline progress', () => {
  it('applies growth and decay for elapsed time', () => {
    // Arrange
    const farmState = createTestFarmState({
      plots: [{
        state: PlotState.GROWING,
        growthTimer: 600, // 10 minutes remaining
      }],
      activeZombies: [
        createTestZombie({
          id: 'zombie-1',
          lastFed: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
          stats: { maxHp: 100, attack: 20 },
        }),
      ],
    });

    // Act - Simulate 24 hours offline
    const elapsedMs = 24 * 60 * 60 * 1000;
    const result = calculateOfflineProgress(farmState, elapsedMs);

    // Assert - Plot completed growing
    expect(result.plots[0].state).toBe(PlotState.READY_TO_HARVEST);

    // Assert - Zombie decayed 2% (2 days unfed)
    const zombie = result.activeZombies[0];
    expect(zombie.stats.maxHp).toBe(98); // 100 - (2 * 1%)
    expect(zombie.stats.attack).toBe(19.6); // 20 - (2 * 1%)
  });
});
```

### Testing Decay and Feeding

```typescript
describe('zombie decay', () => {
  it('applies daily decay when zombie not fed', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      stats: { maxHp: 100, attack: 20, defense: 10 },
      lastFed: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
    });

    // Act
    const result = applyDailyDecay(zombie);

    // Assert
    expect(result.stats.maxHp).toBe(99); // -1%
    expect(result.stats.attack).toBe(19.8); // -1%
    expect(result.stats.defense).toBe(9.9); // -1%
  });

  it('prevents decay when zombie fed within 24h', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      stats: { maxHp: 100, attack: 20 },
      lastFed: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago
    });

    // Act
    const result = applyDailyDecay(zombie);

    // Assert - No decay applied
    expect(result.stats.maxHp).toBe(100);
    expect(result.stats.attack).toBe(20);
  });

  it('respects decay floor minimum', () => {
    // Arrange - Zombie already at 50% stats
    const zombie = createTestZombie({
      id: 'zombie-1',
      stats: { maxHp: 50, attack: 10 },
      originalStats: { maxHp: 100, attack: 20 },
      lastFed: Date.now() - (24 * 60 * 60 * 1000),
    });

    // Act
    const result = applyDailyDecay(zombie);

    // Assert - Cannot decay below 50% floor
    expect(result.stats.maxHp).toBe(50);
    expect(result.stats.attack).toBe(10);
  });

  it('feeding resets decay counter and boosts happiness', () => {
    // Arrange
    const zombie = createTestZombie({
      id: 'zombie-1',
      happiness: 60,
      lastFed: Date.now() - (48 * 60 * 60 * 1000), // 2 days ago
    });
    const inventory = createTestInventory({
      resources: [{ type: 'ROTTEN_MEAT', quantity: 5 }],
    });

    // Act
    const result = feedZombie(zombie, inventory);

    // Assert
    expect(result.zombie.lastFed).toBeCloseTo(Date.now(), -2);
    expect(result.zombie.happiness).toBe(70); // +10%
    expect(result.inventory.resources[0].quantity).toBe(4); // Consumed 1
  });
});
```

### Testing Capacity and Crypt

```typescript
describe('zombie capacity', () => {
  it('sends overflow zombies to Crypt automatically', () => {
    // Arrange - Farm at capacity
    const farmState = createTestFarmState({
      activeZombies: Array(10).fill(null).map((_, i) =>
        createTestZombie({ id: `zombie-${i}` })
      ),
      zombieCapacity: 10,
      cryptZombies: [],
    });
    const newZombie = createTestZombie({ id: 'zombie-overflow' });

    // Act
    const result = addZombieToFarm(farmState, newZombie);

    // Assert
    expect(result.activeZombies).toHaveLength(10);
    expect(result.cryptZombies).toHaveLength(1);
    expect(result.cryptZombies[0].id).toBe('zombie-overflow');
  });

  it('allows deployment from Crypt when capacity available', () => {
    // Arrange
    const farmState = createTestFarmState({
      activeZombies: [createTestZombie({ id: 'zombie-1' })],
      cryptZombies: [createTestZombie({ id: 'zombie-2' })],
      zombieCapacity: 10,
    });

    // Act
    const result = deployFromCrypt(farmState, 'zombie-2');

    // Assert
    expect(result.activeZombies).toHaveLength(2);
    expect(result.cryptZombies).toHaveLength(0);
    expect(result.activeZombies[1].id).toBe('zombie-2');
  });

  it('prevents deployment when at capacity', () => {
    // Arrange - Farm at max capacity
    const farmState = createTestFarmState({
      activeZombies: Array(10).fill(null).map((_, i) =>
        createTestZombie({ id: `zombie-${i}` })
      ),
      cryptZombies: [createTestZombie({ id: 'zombie-crypt' })],
      zombieCapacity: 10,
    });

    // Act
    const result = deployFromCrypt(farmState, 'zombie-crypt');

    // Assert
    expect(result.error).toBe('CAPACITY_REACHED');
    expect(result.activeZombies).toHaveLength(10);
    expect(result.cryptZombies).toHaveLength(1);
  });
});
```

### Testing Resource Gathering

```typescript
describe('resource gathering', () => {
  it('gathers resources from node and starts cooldown', () => {
    // Arrange
    const farmState = createTestFarmState({
      resourceNodes: [
        {
          id: 'node-1',
          type: 'BLOOD_WELL',
          available: true,
          quantity: 10,
        },
      ],
    });

    // Act
    const result = gatherResource(farmState, 'node-1');

    // Assert
    expect(result.inventory).toHaveResource('BLOOD_WATER', 10);
    expect(result.farmState.resourceNodes[0].available).toBe(false);
    expect(result.farmState.resourceNodes[0].cooldownRemaining).toBeGreaterThan(0);
  });

  it('node regenerates after cooldown expires', () => {
    // Arrange
    setupMockTimers();
    const farmState = createTestFarmState({
      resourceNodes: [
        {
          id: 'node-1',
          type: 'BLOOD_WELL',
          available: false,
          cooldownRemaining: 300, // 5 minutes
        },
      ],
    });

    // Act - Advance time by 5 minutes
    advanceTimeBy(5 * 60 * 1000);
    const result = updateResourceNodes(farmState);

    // Assert
    expect(result.resourceNodes[0].available).toBe(true);
    expect(result.resourceNodes[0].cooldownRemaining).toBe(0);
    expect(result.resourceNodes[0].quantity).toBeGreaterThan(0);
  });
});
```

### Testing Day/Night Cycle

```typescript
describe('day/night cycle', () => {
  it('transitions from day to night after 20 minutes', () => {
    // Arrange
    setupMockTimers();
    const farmState = createTestFarmState({
      timeOfDay: 'DAY',
      cycleStartTime: Date.now(),
    });

    // Act - Advance 20 minutes
    advanceTimeBy(20 * 60 * 1000);
    const result = updateTimeOfDay(farmState);

    // Assert
    expect(result.timeOfDay).toBe('NIGHT');
  });

  it('applies night bonuses to zombie activity', () => {
    // Arrange
    const zombie = createTestZombie({
      stats: { speed: 10 },
    });
    const timeOfDay = 'NIGHT';

    // Act
    const result = applyTimeOfDayModifiers(zombie, timeOfDay);

    // Assert - Zombies faster at night
    expect(result.stats.speed).toBeGreaterThan(10);
  });

  it('applies bright sunlight decay penalty', () => {
    // Arrange
    const zombie = createTestZombie({
      stats: { maxHp: 100 },
    });
    const weather = { type: 'BRIGHT_SUNLIGHT', active: true };

    // Act
    const result = applyWeatherEffects(zombie, weather);

    // Assert - Extra decay in bright sun
    expect(result.stats.maxHp).toBeLessThan(100);
  });
});
```

### Testing Edge Cases

ALWAYS test edge cases per **TESTING.md**:

- **Empty Inventory**: Cannot plant without seeds
- **Full Capacity**: Overflow to Crypt
- **Zero Growth Time**: Instant harvest (tutorial mechanics)
- **Maximum Decay**: Respects 50% floor
- **Invalid Plot IDs**: Graceful error handling
- **Concurrent Actions**: Multiple harvests/plantings
- **Extreme Offline Time**: Capped simulation (7 days max)

```typescript
describe('edge cases', () => {
  it('handles extreme offline time with cap', () => {
    // Arrange
    const farmState = createTestFarmState({
      lastOnline: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
    });

    // Act
    const result = calculateOfflineProgress(farmState, 30 * 24 * 60 * 60 * 1000);

    // Assert - Only applies 7 days of decay
    const maxDaysApplied = 7;
    expect(result.daysProcessed).toBe(maxDaysApplied);
  });

  it('handles watering same plot multiple times', () => {
    // Arrange
    const plot = {
      id: 'plot-1',
      state: PlotState.GROWING,
      growthTimer: 300,
      wateredToday: false,
    };

    // Act - Water twice
    const result1 = waterPlot(plot);
    const result2 = waterPlot(result1);

    // Assert - Second watering has no effect
    expect(result1.growthTimer).toBeLessThan(300);
    expect(result2.growthTimer).toBe(result1.growthTimer);
  });
});
```

## Test Naming Conventions

- **File Names**: `*.test.ts` or `*.integration.test.ts`
- **Describe Blocks**: Function or feature name
- **Test Names**: Clear, descriptive behavior

```typescript
describe('harvestZombie', () => {
  it('harvests zombie from ready plot');
  it('clears plot after harvest');
  it('adds zombie to active roster');
  it('respects capacity and overflows to Crypt');
  it('fails gracefully when plot not ready');
});
```

## Running Tests

### All Farm Tests
```bash
npm test src/features/farm
```

### Specific Test File
```bash
npm test src/features/farm/__tests__/planting.integration.test.ts
```

### Watch Mode
```bash
npm test -- --watch src/features/farm
```

### Coverage Report
```bash
npm test -- --coverage src/features/farm
```

## Integration with TDD Workflow

### Red-Green-Refactor Cycle

1. **RED**: Test Agent writes failing test
2. **GREEN**: Farm Agent implements to pass test
3. **BLUE**: Refactor while keeping tests green

### Example Workflow

```
Test Agent:
  - Writes test for zombie watering acceleration
  - Test fails (not implemented)

Farm Agent:
  - Reads DOMAIN-FARM.md for watering rules
  - Implements watering logic (reduces growth timer by 50%)
  - Test passes

Test Agent:
  - Verifies coverage, adds edge cases
  - All tests still pass
```

## Cross-Module Integration

Farm tests should:

- **NOT** directly test Combat module code
- **DO** emit events for Combat to consume (zombie.harvested, zombie.deployed)
- **DO** validate that zombies have correct stats for combat
- **DO** handle battle outcome events (casualties, XP gains)

Example integration point:
```typescript
// Farm emits event after harvest
const event: ZombieHarvestedEvent = {
  type: 'ZOMBIE_HARVESTED',
  zombie: {
    id: 'zombie-1',
    type: ZombieType.SHAMBLER,
    stats: { maxHp: 100, attack: 20, defense: 10 },
  },
  plotId: 'plot-1',
};

// Combat subscribes to these events and can use the zombie
```

## Integration Testing

Farm integration tests cover complete workflows:

```typescript
describe('farm workflow: plant → grow → harvest', () => {
  it('completes full zombie lifecycle', () => {
    // Arrange
    const farmState = createTestFarmState();
    const inventory = createTestInventory({
      seeds: [{ type: ZombieType.SHAMBLER, quantity: 1 }],
    });
    setupMockTimers();

    // Act 1: Plant
    const planted = plantSeed(farmState, inventory, 'plot-1', ZombieType.SHAMBLER);
    expect(planted.plots[0].state).toBe(PlotState.GROWING);

    // Act 2: Grow (advance time)
    advanceTimeBy(5 * 60 * 1000); // 5 minutes
    const grown = updateGrowthTimers(planted);
    expect(grown.plots[0].state).toBe(PlotState.READY_TO_HARVEST);

    // Act 3: Harvest
    const harvested = harvestZombie(grown, 'plot-1');

    // Assert final state
    expect(harvested.plots[0].state).toBe(PlotState.EMPTY);
    expect(harvested.activeZombies).toHaveLength(1);
    expect(harvested.activeZombies[0].type).toBe(ZombieType.SHAMBLER);
  });
});
```

## Performance Testing

Farm performance is critical (especially with 100 zombies):

```typescript
it('updates 100 zombies decay in <50ms', () => {
  const farmState = createTestFarmState({
    activeZombies: Array(100).fill(null).map((_, i) =>
      createTestZombie({ id: `zombie-${i}` })
    ),
  });

  const start = performance.now();
  const result = applyDailyDecayToAll(farmState);
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(50);
  expect(result.activeZombies).toHaveLength(100);
});
```

## Debugging Tips

### View Farm State
```typescript
console.log(JSON.stringify(farmState, null, 2));
```

### Step Through Days
```typescript
let state = createTestFarmState();
for (let day = 0; day < 7; day++) {
  console.log(`Day ${day}:`, {
    activeZombies: state.activeZombies.length,
    cryptZombies: state.cryptZombies.length,
    avgHappiness: calculateAverageHappiness(state),
  });
  state = simulateDay(state);
}
```

### Check Custom Matchers
```typescript
// Use custom matchers from test-utils
expect(inventory).toHaveResource('ROTTEN_WOOD', 50);
expect(farmState).toHaveZombie('zombie-1');
expect(zombie).toHaveStats({ maxHp: 100, attack: 20 });
expect(zombie).toBeHealthy(90); // >90% HP
```

## CI/CD Integration

All tests MUST pass before merging:

- Run automatically on commit
- Block PR if any test fails
- Enforce 80%+ coverage threshold

## Documentation Updates

When adding new farm features:

1. Update **DOMAIN-FARM.md** with rules
2. Write failing tests (Test Agent)
3. Implement feature (Farm Agent)
4. Update this README if new test patterns added

---

**Remember**: Farm tests are the contract between design and implementation. If DOMAIN-FARM.md says it, tests must verify it. The farm is the heart of the game - thorough testing ensures players can reliably grow, manage, and deploy their zombie horde.
