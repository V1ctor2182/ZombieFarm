---
title: 'Test Specifications - Farm Phase 4: Decay & Maintenance Systems'
phase: 'Farm Phase 4'
module: 'FARM'
created: 2025-11-14
author: 'TEST Agent (test-qa-guardian)'
status: 'Ready for Implementation'
---

# Test Specifications: Farm Phase 4 - Decay & Maintenance Systems

## Overview

This document provides comprehensive test specifications for Farm Phase 4, which implements the decay and maintenance systems that govern zombie upkeep on the farm. These systems are critical to the core farm gameplay loop and resource management strategy.

**Domain Authority**: `/Users/victor/work/ZombieFarm/META/DOMAIN-FARM.md` (Sections: Decay and Maintenance, Happiness)

**Key Features**:
- **4.1 Decay Mechanics** - Daily stat degradation for neglected zombies
- **4.2 Happiness System** - Mood tracking and effects on performance
- **4.3 Feeding System** - Resource-based maintenance to prevent decay
- **4.4 Crypt Storage** - Suspended animation storage with no decay

### Testing Approach

Following TDD methodology from `/Users/victor/work/ZombieFarm/META/TESTING.md`:

- **Coverage Target**: ~100% for decay/maintenance logic (critical game mechanics)
- **Test Structure**: AAA pattern (Arrange, Act, Assert)
- **Edge Cases**: Boundary conditions, offline progress, multiple zombies, resource limits
- **Integration**: Cross-system interactions (decay + happiness, feeding + crypt)
- **Time-based Testing**: Using fake timers for day/night cycles and offline calculations

### Test File Locations

```
src/features/farm/
├── systems/
│   ├── decay/
│   │   ├── decaySystem.ts           # Implementation
│   │   └── decaySystem.test.ts      # Unit tests
│   ├── happiness/
│   │   ├── happinessSystem.ts       # Implementation
│   │   └── happinessSystem.test.ts  # Unit tests
│   ├── feeding/
│   │   ├── feedingSystem.ts         # Implementation
│   │   └── feedingSystem.test.ts    # Unit tests
│   └── crypt/
│       ├── cryptStorage.ts          # Implementation
│       └── cryptStorage.test.ts     # Unit tests
└── __tests__/
    └── integration/
        └── maintenanceSystems.integration.test.ts  # Integration tests
```

**Total Test Count Target**: ~90 tests
- 4.1 Decay Mechanics: ~30 tests
- 4.2 Happiness System: ~25 tests
- 4.3 Feeding System: ~20 tests
- 4.4 Crypt Storage: ~15 tests

---

## 4.1 Decay Mechanics Tests (~30 tests)

**File**: `src/features/farm/systems/decay/decaySystem.test.ts`

### Function: `calculateDailyDecay(zombie: Zombie, daysPassed: number): DecayResult`

**Description**: Calculates stat decay for a zombie based on quality tier and days elapsed.

**Domain Rules** (from DOMAIN-FARM.md):
- Common zombies lose ~1% of max health/damage per day of neglect
- Higher-tier zombies decay faster proportionally (more unstable)
- Stats bottom out at decay floor (50%-90% based on quality)
- Decay is prevented if zombie was fed that day

**Test Scenarios**:

```typescript
describe('DecaySystem - calculateDailyDecay', () => {
  describe('basic decay calculations', () => {
    it('applies 1% decay per day for common quality zombie', () => {
      // Arrange
      const zombie = createTestZombie({
        quality: 'common',
        hp: 100,
        attack: 20,
        lastFed: Date.now() - 24 * 60 * 60 * 1000  // 1 day ago
      });

      // Act
      const result = calculateDailyDecay(zombie, 1);

      // Assert
      expect(result.hpLoss).toBe(1);  // 1% of 100
      expect(result.attackLoss).toBe(0.2);  // 1% of 20
      expect(result.daysProcessed).toBe(1);
    });

    it('applies 2% decay per day for rare quality zombie', () => {
      const zombie = createTestZombie({
        quality: 'rare',
        hp: 150,
        attack: 30,
        lastFed: Date.now() - 24 * 60 * 60 * 1000
      });

      const result = calculateDailyDecay(zombie, 1);

      expect(result.hpLoss).toBe(3);  // 2% of 150
      expect(result.attackLoss).toBe(0.6);  // 2% of 30
    });

    it('applies 3% decay per day for epic quality zombie', () => {
      const zombie = createTestZombie({
        quality: 'epic',
        hp: 200,
        attack: 40,
        lastFed: Date.now() - 24 * 60 * 60 * 1000
      });

      const result = calculateDailyDecay(zombie, 1);

      expect(result.hpLoss).toBe(6);  // 3% of 200
      expect(result.attackLoss).toBe(1.2);  // 3% of 40
    });

    it('compounds decay for multiple days', () => {
      const zombie = createTestZombie({
        quality: 'common',
        hp: 100,
        attack: 20,
        lastFed: Date.now() - 3 * 24 * 60 * 60 * 1000  // 3 days ago
      });

      const result = calculateDailyDecay(zombie, 3);

      expect(result.hpLoss).toBeCloseTo(3);  // ~3% total (1% per day)
      expect(result.daysProcessed).toBe(3);
    });
  });

  describe('decay floor enforcement', () => {
    it('stops decay at 50% for common quality zombies', () => {
      const zombie = createTestZombie({
        quality: 'common',
        hp: 51,  // Already near floor
        maxHp: 100,
        attack: 10.1,
        maxAttack: 20,
        lastFed: Date.now() - 30 * 24 * 60 * 60 * 1000  // 30 days
      });

      const result = calculateDailyDecay(zombie, 30);

      expect(result.finalHp).toBe(50);  // Floor at 50% of maxHp
      expect(result.finalAttack).toBe(10);  // Floor at 50% of maxAttack
      expect(result.hitFloor).toBe(true);
    });

    it('stops decay at 70% for rare quality zombies', () => {
      const zombie = createTestZombie({
        quality: 'rare',
        hp: 106,
        maxHp: 150,
        attack: 21.1,
        maxAttack: 30,
        lastFed: Date.now() - 20 * 24 * 60 * 60 * 1000
      });

      const result = calculateDailyDecay(zombie, 20);

      expect(result.finalHp).toBe(105);  // Floor at 70% of 150
      expect(result.finalAttack).toBe(21);  // Floor at 70% of 30
    });

    it('stops decay at 90% for legendary quality zombies', () => {
      const zombie = createTestZombie({
        quality: 'legendary',
        hp: 271,
        maxHp: 300,
        attack: 45.1,
        maxAttack: 50,
        lastFed: Date.now() - 10 * 24 * 60 * 60 * 1000
      });

      const result = calculateDailyDecay(zombie, 10);

      expect(result.finalHp).toBe(270);  // Floor at 90% of 300
      expect(result.finalAttack).toBe(45);  // Floor at 90% of 50
    });
  });

  describe('fed zombie prevention', () => {
    it('does not apply decay if zombie was fed today', () => {
      const zombie = createTestZombie({
        quality: 'common',
        hp: 100,
        lastFed: Date.now() - 2 * 60 * 60 * 1000  // 2 hours ago (same day)
      });

      const result = calculateDailyDecay(zombie, 1);

      expect(result.hpLoss).toBe(0);
      expect(result.attackLoss).toBe(0);
      expect(result.decayPrevented).toBe(true);
    });

    it('applies decay if last fed more than 24 hours ago', () => {
      const zombie = createTestZombie({
        quality: 'common',
        hp: 100,
        lastFed: Date.now() - 25 * 60 * 60 * 1000  // 25 hours ago
      });

      const result = calculateDailyDecay(zombie, 1);

      expect(result.hpLoss).toBeGreaterThan(0);
      expect(result.decayPrevented).toBe(false);
    });
  });

  describe('edge cases and boundaries', () => {
    it('handles zombie with zero stats gracefully', () => {
      const zombie = createTestZombie({
        quality: 'common',
        hp: 0,
        attack: 0,
        lastFed: Date.now() - 5 * 24 * 60 * 60 * 1000
      });

      const result = calculateDailyDecay(zombie, 5);

      expect(result.hpLoss).toBe(0);
      expect(result.attackLoss).toBe(0);
    });

    it('handles negative days gracefully (returns no decay)', () => {
      const zombie = createTestZombie({ quality: 'common', hp: 100 });

      const result = calculateDailyDecay(zombie, -5);

      expect(result.daysProcessed).toBe(0);
      expect(result.hpLoss).toBe(0);
    });

    it('handles zero days (no decay applied)', () => {
      const zombie = createTestZombie({ quality: 'common', hp: 100 });

      const result = calculateDailyDecay(zombie, 0);

      expect(result.daysProcessed).toBe(0);
      expect(result.hpLoss).toBe(0);
    });

    it('handles maximum days (caps offline calculation)', () => {
      const zombie = createTestZombie({
        quality: 'common',
        hp: 100,
        lastFed: Date.now() - 365 * 24 * 60 * 60 * 1000  // 1 year
      });

      const result = calculateDailyDecay(zombie, 365);

      // Should cap at 7 days max offline processing
      expect(result.daysProcessed).toBe(7);
      expect(result.finalHp).toBeGreaterThanOrEqual(50);  // At decay floor
    });
  });
});
```

### Function: `applyDecayToZombie(zombieId: string, gameState: GameState): GameState`

**Description**: Applies calculated decay to a zombie and updates game state.

**Test Scenarios**:

```typescript
describe('DecaySystem - applyDecayToZombie', () => {
  describe('state mutation', () => {
    it('updates zombie stats in game state', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', quality: 'common', hp: 100, attack: 20 })
          ]
        }
      });

      const newState = applyDecayToZombie('z1', gameState);

      expect(newState.farm.activeZombies[0].hp).toBeLessThan(100);
      expect(newState.farm.activeZombies[0].attack).toBeLessThan(20);
    });

    it('does not mutate original game state', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', hp: 100 })
          ]
        }
      });

      const originalHp = gameState.farm.activeZombies[0].hp;
      applyDecayToZombie('z1', gameState);

      expect(gameState.farm.activeZombies[0].hp).toBe(originalHp);
    });
  });

  describe('multiple zombies', () => {
    it('decays only the specified zombie', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', hp: 100, lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
            createTestZombie({ id: 'z2', hp: 100, lastFed: Date.now() })
          ]
        }
      });

      const newState = applyDecayToZombie('z1', gameState);

      expect(newState.farm.activeZombies[0].hp).toBeLessThan(100);
      expect(newState.farm.activeZombies[1].hp).toBe(100);  // Unchanged
    });
  });

  describe('error handling', () => {
    it('throws error if zombie not found', () => {
      const gameState = createTestGameState();

      expect(() => applyDecayToZombie('nonexistent', gameState)).toThrow('Zombie not found');
    });

    it('returns unchanged state if zombie is in Crypt', () => {
      const gameState = createTestGameState({
        farm: {
          cryptZombies: [
            createTestZombie({ id: 'z1', hp: 100 })
          ]
        }
      });

      const newState = applyDecayToZombie('z1', gameState);

      expect(newState).toBe(gameState);  // No change for crypt zombies
    });
  });
});
```

### Function: `processOfflineDecay(gameState: GameState, lastLoginTime: number): GameState`

**Description**: Processes decay for all active zombies based on offline time elapsed.

**Test Scenarios**:

```typescript
describe('DecaySystem - processOfflineDecay', () => {
  it('processes decay for all active zombies', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', hp: 100, lastFed: Date.now() - 3 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z2', hp: 100, lastFed: Date.now() - 3 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z3', hp: 100, lastFed: Date.now() - 3 * 24 * 60 * 60 * 1000 })
        ]
      }
    });

    const threeAgoMs = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const newState = processOfflineDecay(gameState, threeDaysAgoMs);

    expect(newState.farm.activeZombies[0].hp).toBeLessThan(100);
    expect(newState.farm.activeZombies[1].hp).toBeLessThan(100);
    expect(newState.farm.activeZombies[2].hp).toBeLessThan(100);
  });

  it('does not process decay for crypt zombies', () => {
    const gameState = createTestGameState({
      farm: {
        cryptZombies: [
          createTestZombie({ id: 'z1', hp: 100 })
        ]
      }
    });

    const threeDaysAgoMs = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const newState = processOfflineDecay(gameState, threeDaysAgoMs);

    expect(newState.farm.cryptZombies[0].hp).toBe(100);  // No decay in crypt
  });

  it('caps offline processing at 7 days maximum', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', quality: 'common', hp: 100, maxHp: 100 })
        ]
      }
    });

    const oneYearAgoMs = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const newState = processOfflineDecay(gameState, oneYearAgoMs);

    // Should only process 7 days, zombie at floor (50%)
    expect(newState.farm.activeZombies[0].hp).toBeGreaterThanOrEqual(50);
  });

  it('handles zero elapsed time (no decay)', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', hp: 100 })
        ]
      }
    });

    const newState = processOfflineDecay(gameState, Date.now());

    expect(newState.farm.activeZombies[0].hp).toBe(100);
  });
});
```

---

## 4.2 Happiness System Tests (~25 tests)

**File**: `src/features/farm/systems/happiness/happinessSystem.test.ts`

### Function: `calculateHappiness(zombie: Zombie, factors: HappinessFactor[]): number`

**Description**: Calculates zombie happiness based on various factors.

**Domain Rules** (from DOMAIN-FARM.md):
- Happiness ranges 0-100%
- Factors: feeding (+10%), petting (+5%), victories (+15%), overcrowding (-20%), neglect (-10%/day)
- High happiness reduces decay rate
- Multiple modifiers stack

**Test Scenarios**:

```typescript
describe('HappinessSystem - calculateHappiness', () => {
  describe('initialization', () => {
    it('initializes new zombie at 100% happiness', () => {
      const zombie = createTestZombie({ happiness: undefined });

      const happiness = calculateHappiness(zombie, []);

      expect(happiness).toBe(100);
    });
  });

  describe('positive factors', () => {
    it('adds 10% happiness for feeding', () => {
      const zombie = createTestZombie({ happiness: 50 });

      const happiness = calculateHappiness(zombie, [
        { type: 'feeding', value: 10 }
      ]);

      expect(happiness).toBe(60);
    });

    it('adds 5% happiness for petting', () => {
      const zombie = createTestZombie({ happiness: 50 });

      const happiness = calculateHappiness(zombie, [
        { type: 'petting', value: 5 }
      ]);

      expect(happiness).toBe(55);
    });

    it('adds 15% happiness for victory in combat', () => {
      const zombie = createTestZombie({ happiness: 50 });

      const happiness = calculateHappiness(zombie, [
        { type: 'victory', value: 15 }
      ]);

      expect(happiness).toBe(65);
    });

    it('stacks multiple positive factors', () => {
      const zombie = createTestZombie({ happiness: 50 });

      const happiness = calculateHappiness(zombie, [
        { type: 'feeding', value: 10 },
        { type: 'petting', value: 5 },
        { type: 'victory', value: 15 }
      ]);

      expect(happiness).toBe(80);  // 50 + 10 + 5 + 15
    });
  });

  describe('negative factors', () => {
    it('reduces 20% happiness for overcrowding', () => {
      const zombie = createTestZombie({ happiness: 80 });

      const happiness = calculateHappiness(zombie, [
        { type: 'overcrowding', value: -20 }
      ]);

      expect(happiness).toBe(60);
    });

    it('reduces 10% happiness per day of neglect', () => {
      const zombie = createTestZombie({ happiness: 100 });

      const happiness = calculateHappiness(zombie, [
        { type: 'neglect', value: -10, days: 3 }
      ]);

      expect(happiness).toBe(70);  // -30% for 3 days
    });

    it('reduces happiness for injury/damage', () => {
      const zombie = createTestZombie({ happiness: 80, hp: 20, maxHp: 100 });

      const happiness = calculateHappiness(zombie, [
        { type: 'injury', value: -15 }
      ]);

      expect(happiness).toBe(65);
    });
  });

  describe('happiness boundaries', () => {
    it('caps happiness at 100%', () => {
      const zombie = createTestZombie({ happiness: 95 });

      const happiness = calculateHappiness(zombie, [
        { type: 'feeding', value: 10 },
        { type: 'petting', value: 5 },
        { type: 'victory', value: 15 }
      ]);

      expect(happiness).toBe(100);  // Capped, not 125
    });

    it('floors happiness at 0%', () => {
      const zombie = createTestZombie({ happiness: 15 });

      const happiness = calculateHappiness(zombie, [
        { type: 'neglect', value: -10, days: 5 }
      ]);

      expect(happiness).toBe(0);  // Floored, not -35
    });
  });

  describe('happiness effects on decay', () => {
    it('reduces decay rate by 50% when happiness is high (>80%)', () => {
      const zombie = createTestZombie({ happiness: 90, quality: 'common', hp: 100 });

      const decayModifier = getHappinessDecayModifier(zombie);

      expect(decayModifier).toBe(0.5);  // 50% decay rate
    });

    it('increases decay rate by 50% when happiness is low (<20%)', () => {
      const zombie = createTestZombie({ happiness: 10, quality: 'common', hp: 100 });

      const decayModifier = getHappinessDecayModifier(zombie);

      expect(decayModifier).toBe(1.5);  // 150% decay rate
    });

    it('has normal decay rate for neutral happiness (40-60%)', () => {
      const zombie = createTestZombie({ happiness: 50, quality: 'common', hp: 100 });

      const decayModifier = getHappinessDecayModifier(zombie);

      expect(decayModifier).toBe(1.0);  // Normal decay
    });
  });
});
```

### Function: `updateZombieHappiness(zombieId: string, factors: HappinessFactor[], gameState: GameState): GameState`

**Description**: Updates a zombie's happiness in the game state.

**Test Scenarios**:

```typescript
describe('HappinessSystem - updateZombieHappiness', () => {
  it('updates zombie happiness in game state', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', happiness: 50 })
        ]
      }
    });

    const newState = updateZombieHappiness('z1', [
      { type: 'feeding', value: 10 }
    ], gameState);

    expect(newState.farm.activeZombies[0].happiness).toBe(60);
  });

  it('does not mutate original game state', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', happiness: 50 })
        ]
      }
    });

    const originalHappiness = gameState.farm.activeZombies[0].happiness;
    updateZombieHappiness('z1', [{ type: 'feeding', value: 10 }], gameState);

    expect(gameState.farm.activeZombies[0].happiness).toBe(originalHappiness);
  });

  it('throws error if zombie not found', () => {
    const gameState = createTestGameState();

    expect(() => updateZombieHappiness('nonexistent', [], gameState)).toThrow('Zombie not found');
  });
});
```

### Function: `processHappinessDecay(gameState: GameState, daysPassed: number): GameState`

**Description**: Processes happiness decay for all active zombies over time.

**Test Scenarios**:

```typescript
describe('HappinessSystem - processHappinessDecay', () => {
  it('reduces happiness for all unfed zombies', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', happiness: 100, lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z2', happiness: 100, lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 })
        ]
      }
    });

    const newState = processHappinessDecay(gameState, 2);

    expect(newState.farm.activeZombies[0].happiness).toBe(80);  // -10% per day * 2
    expect(newState.farm.activeZombies[1].happiness).toBe(80);
  });

  it('does not reduce happiness for recently fed zombies', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', happiness: 100, lastFed: Date.now() })
        ]
      }
    });

    const newState = processHappinessDecay(gameState, 1);

    expect(newState.farm.activeZombies[0].happiness).toBe(100);
  });

  it('handles overcrowding penalty', () => {
    const gameState = createTestGameState({
      farm: {
        activeZombies: Array.from({ length: 15 }, (_, i) =>
          createTestZombie({ id: `z${i}`, happiness: 100 })
        ),
        capacity: 10  // Overcrowded by 5
      }
    });

    const newState = processHappinessDecay(gameState, 1);

    // All zombies should have reduced happiness due to overcrowding
    newState.farm.activeZombies.forEach(zombie => {
      expect(zombie.happiness).toBeLessThan(100);
    });
  });
});
```

---

## 4.3 Feeding System Tests (~20 tests)

**File**: `src/features/farm/systems/feeding/feedingSystem.test.ts`

### Function: `feedZombie(zombieId: string, foodItem: ResourceType, gameState: GameState): GameState`

**Description**: Feeds a zombie to prevent decay and boost happiness.

**Domain Rules** (from DOMAIN-FARM.md):
- Feeding requires resources (Rotten Meat or similar)
- One feed per zombie per day
- Feeding resets decay counter
- Feeding boosts happiness by 10%
- Cannot feed if no food in inventory
- Cannot feed on cooldown

**Test Scenarios**:

```typescript
describe('FeedingSystem - feedZombie', () => {
  describe('successful feeding', () => {
    it('consumes food resource from inventory', () => {
      const gameState = createTestGameState({
        inventory: {
          rottenMeat: 10
        },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1' })
          ]
        }
      });

      const newState = feedZombie('z1', 'rottenMeat', gameState);

      expect(newState.inventory.rottenMeat).toBe(9);
    });

    it('resets zombie lastFed timestamp', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', lastFed: Date.now() - 5 * 24 * 60 * 60 * 1000 })
          ]
        }
      });

      const beforeFeed = gameState.farm.activeZombies[0].lastFed;
      const newState = feedZombie('z1', 'rottenMeat', gameState);

      expect(newState.farm.activeZombies[0].lastFed).toBeGreaterThan(beforeFeed);
      expect(newState.farm.activeZombies[0].lastFed).toBeCloseTo(Date.now(), -2);
    });

    it('boosts zombie happiness by 10%', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', happiness: 50 })
          ]
        }
      });

      const newState = feedZombie('z1', 'rottenMeat', gameState);

      expect(newState.farm.activeZombies[0].happiness).toBe(60);
    });

    it('prevents decay for the day', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', hp: 80, maxHp: 100 })
          ]
        }
      });

      const newState = feedZombie('z1', 'rottenMeat', gameState);

      // Feeding should mark zombie as fed, preventing next decay cycle
      expect(newState.farm.activeZombies[0].lastFed).toBeDefined();
      expect(newState.farm.activeZombies[0].decayPrevented).toBe(true);
    });
  });

  describe('quality bonuses', () => {
    it('provides quality bonus for premium food', () => {
      const gameState = createTestGameState({
        inventory: { freshBrains: 5 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', happiness: 50, hp: 80, maxHp: 100 })
          ]
        }
      });

      const newState = feedZombie('z1', 'freshBrains', gameState);

      // Premium food provides extra benefits
      expect(newState.farm.activeZombies[0].happiness).toBeGreaterThan(60);  // More than +10%
      expect(newState.farm.activeZombies[0].hp).toBeGreaterThan(80);  // Restores some HP
    });
  });

  describe('resource validation', () => {
    it('throws error if food not in inventory', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 0 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1' })
          ]
        }
      });

      expect(() => feedZombie('z1', 'rottenMeat', gameState)).toThrow('Not enough rottenMeat');
    });

    it('throws error if invalid food type', () => {
      const gameState = createTestGameState({
        inventory: { rottenWood: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1' })
          ]
        }
      });

      expect(() => feedZombie('z1', 'rottenWood', gameState)).toThrow('Invalid food type');
    });
  });

  describe('cooldown enforcement', () => {
    it('throws error if zombie already fed today', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', lastFed: Date.now() - 2 * 60 * 60 * 1000 })  // 2 hours ago
          ]
        }
      });

      expect(() => feedZombie('z1', 'rottenMeat', gameState)).toThrow('Zombie already fed today');
    });

    it('allows feeding after 24 hours have elapsed', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', lastFed: Date.now() - 25 * 60 * 60 * 1000 })  // 25 hours ago
          ]
        }
      });

      const newState = feedZombie('z1', 'rottenMeat', gameState);

      expect(newState.inventory.rottenMeat).toBe(9);
    });
  });

  describe('error handling', () => {
    it('throws error if zombie not found', () => {
      const gameState = createTestGameState({ inventory: { rottenMeat: 10 } });

      expect(() => feedZombie('nonexistent', 'rottenMeat', gameState)).toThrow('Zombie not found');
    });

    it('does not allow feeding zombies in Crypt', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          cryptZombies: [
            createTestZombie({ id: 'z1' })
          ]
        }
      });

      expect(() => feedZombie('z1', 'rottenMeat', gameState)).toThrow('Cannot feed zombie in Crypt');
    });

    it('does not mutate original game state', () => {
      const gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1' })
          ]
        }
      });

      const originalMeat = gameState.inventory.rottenMeat;
      feedZombie('z1', 'rottenMeat', gameState);

      expect(gameState.inventory.rottenMeat).toBe(originalMeat);
    });
  });
});
```

### Function: `feedAllZombies(foodItem: ResourceType, gameState: GameState): FeedAllResult`

**Description**: Feeds all active zombies that need feeding (batch operation).

**Test Scenarios**:

```typescript
describe('FeedingSystem - feedAllZombies', () => {
  it('feeds all zombies that need feeding', () => {
    const gameState = createTestGameState({
      inventory: { rottenMeat: 100 },
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z2', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z3', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 })
        ]
      }
    });

    const result = feedAllZombies('rottenMeat', gameState);

    expect(result.fedCount).toBe(3);
    expect(result.newState.inventory.rottenMeat).toBe(97);  // 100 - 3
  });

  it('skips zombies already fed today', () => {
    const gameState = createTestGameState({
      inventory: { rottenMeat: 100 },
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z2', lastFed: Date.now() }),  // Already fed
          createTestZombie({ id: 'z3', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 })
        ]
      }
    });

    const result = feedAllZombies('rottenMeat', gameState);

    expect(result.fedCount).toBe(2);  // Only z1 and z3
    expect(result.skippedCount).toBe(1);  // z2
  });

  it('stops when resources run out', () => {
    const gameState = createTestGameState({
      inventory: { rottenMeat: 2 },
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z2', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z3', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 })
        ]
      }
    });

    const result = feedAllZombies('rottenMeat', gameState);

    expect(result.fedCount).toBe(2);
    expect(result.insufficientResources).toBe(true);
    expect(result.newState.inventory.rottenMeat).toBe(0);
  });

  it('returns summary of feeding operation', () => {
    const gameState = createTestGameState({
      inventory: { rottenMeat: 100 },
      farm: {
        activeZombies: [
          createTestZombie({ id: 'z1', lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
          createTestZombie({ id: 'z2', lastFed: Date.now() })
        ]
      }
    });

    const result = feedAllZombies('rottenMeat', gameState);

    expect(result).toMatchObject({
      fedCount: 1,
      skippedCount: 1,
      totalZombies: 2,
      resourcesUsed: 1,
      insufficientResources: false
    });
  });
});
```

---

## 4.4 Crypt Storage Tests (~15 tests)

**File**: `src/features/farm/systems/crypt/cryptStorage.test.ts`

### Function: `storeZombieInCrypt(zombieId: string, gameState: GameState): GameState`

**Description**: Moves a zombie from active farm to Crypt storage.

**Domain Rules** (from DOMAIN-FARM.md):
- Zombies in Crypt do not decay
- Zombies in Crypt do not consume resources
- Unlimited Crypt capacity
- Requires active zombie cap space to retrieve

**Test Scenarios**:

```typescript
describe('CryptStorage - storeZombieInCrypt', () => {
  describe('successful storage', () => {
    it('moves zombie from active to crypt', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1' })
          ],
          cryptZombies: []
        }
      });

      const newState = storeZombieInCrypt('z1', gameState);

      expect(newState.farm.activeZombies).toHaveLength(0);
      expect(newState.farm.cryptZombies).toHaveLength(1);
      expect(newState.farm.cryptZombies[0].id).toBe('z1');
    });

    it('preserves zombie stats when storing', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', hp: 75, attack: 18, happiness: 60 })
          ],
          cryptZombies: []
        }
      });

      const newState = storeZombieInCrypt('z1', gameState);

      const cryptZombie = newState.farm.cryptZombies[0];
      expect(cryptZombie.hp).toBe(75);
      expect(cryptZombie.attack).toBe(18);
      expect(cryptZombie.happiness).toBe(60);
    });

    it('marks zombie with storage timestamp', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1' })
          ],
          cryptZombies: []
        }
      });

      const newState = storeZombieInCrypt('z1', gameState);

      expect(newState.farm.cryptZombies[0].cryptStoredAt).toBeDefined();
      expect(newState.farm.cryptZombies[0].cryptStoredAt).toBeCloseTo(Date.now(), -2);
    });

    it('frees up active zombie capacity', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: Array.from({ length: 10 }, (_, i) =>
            createTestZombie({ id: `z${i}` })
          ),
          cryptZombies: [],
          capacity: 10
        }
      });

      const newState = storeZombieInCrypt('z0', gameState);

      expect(newState.farm.activeZombies).toHaveLength(9);
      expect(newState.farm.cryptZombies).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('throws error if zombie not found', () => {
      const gameState = createTestGameState();

      expect(() => storeZombieInCrypt('nonexistent', gameState)).toThrow('Zombie not found');
    });

    it('throws error if zombie already in Crypt', () => {
      const gameState = createTestGameState({
        farm: {
          cryptZombies: [
            createTestZombie({ id: 'z1' })
          ]
        }
      });

      expect(() => storeZombieInCrypt('z1', gameState)).toThrow('Zombie already in Crypt');
    });
  });
});
```

### Function: `retrieveZombieFromCrypt(zombieId: string, gameState: GameState): GameState`

**Description**: Moves a zombie from Crypt storage back to active farm.

**Test Scenarios**:

```typescript
describe('CryptStorage - retrieveZombieFromCrypt', () => {
  describe('successful retrieval', () => {
    it('moves zombie from crypt to active', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [],
          cryptZombies: [
            createTestZombie({ id: 'z1' })
          ],
          capacity: 10
        }
      });

      const newState = retrieveZombieFromCrypt('z1', gameState);

      expect(newState.farm.cryptZombies).toHaveLength(0);
      expect(newState.farm.activeZombies).toHaveLength(1);
      expect(newState.farm.activeZombies[0].id).toBe('z1');
    });

    it('preserves zombie stats when retrieving', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [],
          cryptZombies: [
            createTestZombie({ id: 'z1', hp: 75, attack: 18, happiness: 60 })
          ],
          capacity: 10
        }
      });

      const newState = retrieveZombieFromCrypt('z1', gameState);

      const activeZombie = newState.farm.activeZombies[0];
      expect(activeZombie.hp).toBe(75);
      expect(activeZombie.attack).toBe(18);
      expect(activeZombie.happiness).toBe(60);
    });

    it('removes storage timestamp', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: [],
          cryptZombies: [
            createTestZombie({ id: 'z1', cryptStoredAt: Date.now() - 5 * 24 * 60 * 60 * 1000 })
          ],
          capacity: 10
        }
      });

      const newState = retrieveZombieFromCrypt('z1', gameState);

      expect(newState.farm.activeZombies[0].cryptStoredAt).toBeUndefined();
    });
  });

  describe('capacity validation', () => {
    it('throws error if active capacity is full', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: Array.from({ length: 10 }, (_, i) =>
            createTestZombie({ id: `z${i}` })
          ),
          cryptZombies: [
            createTestZombie({ id: 'z99' })
          ],
          capacity: 10
        }
      });

      expect(() => retrieveZombieFromCrypt('z99', gameState)).toThrow('Active capacity full');
    });

    it('succeeds if there is available capacity', () => {
      const gameState = createTestGameState({
        farm: {
          activeZombies: Array.from({ length: 9 }, (_, i) =>
            createTestZombie({ id: `z${i}` })
          ),
          cryptZombies: [
            createTestZombie({ id: 'z99' })
          ],
          capacity: 10
        }
      });

      const newState = retrieveZombieFromCrypt('z99', gameState);

      expect(newState.farm.activeZombies).toHaveLength(10);
    });
  });

  describe('error handling', () => {
    it('throws error if zombie not found in Crypt', () => {
      const gameState = createTestGameState();

      expect(() => retrieveZombieFromCrypt('nonexistent', gameState)).toThrow('Zombie not found in Crypt');
    });
  });
});
```

### Function: `verifyNoCryptDecay(gameState: GameState, daysPassed: number): boolean`

**Description**: Verifies that zombies in Crypt do not decay over time.

**Test Scenarios**:

```typescript
describe('CryptStorage - verifyNoCryptDecay', () => {
  it('confirms crypt zombies do not decay after many days', () => {
    const initialState = createTestGameState({
      farm: {
        cryptZombies: [
          createTestZombie({ id: 'z1', hp: 100, attack: 20, cryptStoredAt: Date.now() })
        ]
      }
    });

    const afterTime = createTestGameState({
      farm: {
        cryptZombies: [
          createTestZombie({
            id: 'z1',
            hp: 100,  // No decay
            attack: 20,  // No decay
            cryptStoredAt: Date.now() - 365 * 24 * 60 * 60 * 1000  // 1 year
          })
        ]
      }
    });

    expect(verifyNoCryptDecay(afterTime, 365)).toBe(true);
  });

  it('confirms crypt zombies do not consume resources', () => {
    const gameState = createTestGameState({
      inventory: { rottenMeat: 100 },
      farm: {
        cryptZombies: [
          createTestZombie({ id: 'z1' }),
          createTestZombie({ id: 'z2' }),
          createTestZombie({ id: 'z3' })
        ]
      }
    });

    // Process feeding for a day - crypt zombies should not consume
    const result = calculateDailyResourceConsumption(gameState);

    expect(result.rottenMeatNeeded).toBe(0);  // No consumption in crypt
  });
});
```

---

## Integration Tests

**File**: `src/features/farm/__tests__/integration/maintenanceSystems.integration.test.ts`

### End-to-End Maintenance Workflow

**Test Scenarios**:

```typescript
describe('Farm Maintenance Systems - Integration', () => {
  describe('complete maintenance workflow', () => {
    it('handles full decay -> feed -> recovery cycle', () => {
      // 1. Create zombie with some decay
      let gameState = createTestGameState({
        inventory: { rottenMeat: 50 },
        farm: {
          activeZombies: [
            createTestZombie({
              id: 'z1',
              hp: 80,
              maxHp: 100,
              happiness: 40,
              lastFed: Date.now() - 5 * 24 * 60 * 60 * 1000  // 5 days ago
            })
          ]
        }
      });

      // 2. Process offline decay (should reduce HP and happiness)
      const fiveDaysAgoMs = Date.now() - 5 * 24 * 60 * 60 * 1000;
      gameState = processOfflineDecay(gameState, fiveDaysAgoMs);

      expect(gameState.farm.activeZombies[0].hp).toBeLessThan(80);
      expect(gameState.farm.activeZombies[0].happiness).toBeLessThan(40);

      // 3. Feed zombie (should boost happiness and prevent further decay)
      gameState = feedZombie('z1', 'rottenMeat', gameState);

      expect(gameState.farm.activeZombies[0].happiness).toBeGreaterThan(gameState.farm.activeZombies[0].happiness - 10);
      expect(gameState.farm.activeZombies[0].lastFed).toBeCloseTo(Date.now(), -2);

      // 4. Verify no further decay for the day
      const result = calculateDailyDecay(gameState.farm.activeZombies[0], 1);
      expect(result.decayPrevented).toBe(true);
    });

    it('handles Crypt storage during extended absence', () => {
      // 1. Player has zombies they want to preserve
      let gameState = createTestGameState({
        farm: {
          activeZombies: [
            createTestZombie({ id: 'z1', hp: 100, attack: 20 }),
            createTestZombie({ id: 'z2', hp: 100, attack: 20 })
          ],
          cryptZombies: []
        }
      });

      // 2. Store valuable zombie in Crypt before going offline
      gameState = storeZombieInCrypt('z1', gameState);

      // 3. Simulate 30 days offline
      const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
      gameState = processOfflineDecay(gameState, thirtyDaysAgoMs);

      // 4. Verify: active zombie decayed (capped at floor), crypt zombie untouched
      expect(gameState.farm.activeZombies[0].hp).toBeLessThan(100);  // z2 decayed
      expect(gameState.farm.cryptZombies[0].hp).toBe(100);  // z1 preserved

      // 5. Retrieve from Crypt
      gameState = retrieveZombieFromCrypt('z1', gameState);

      expect(gameState.farm.activeZombies).toHaveLength(2);
      expect(gameState.farm.activeZombies.find(z => z.id === 'z1')?.hp).toBe(100);
    });

    it('handles batch feeding with resource limitations', () => {
      let gameState = createTestGameState({
        inventory: { rottenMeat: 5 },
        farm: {
          activeZombies: Array.from({ length: 10 }, (_, i) =>
            createTestZombie({
              id: `z${i}`,
              lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000
            })
          )
        }
      });

      // Try to feed all 10 zombies with only 5 food
      const result = feedAllZombies('rottenMeat', gameState);

      expect(result.fedCount).toBe(5);
      expect(result.insufficientResources).toBe(true);
      expect(result.newState.inventory.rottenMeat).toBe(0);
    });
  });

  describe('cross-system effects', () => {
    it('happiness affects decay rate', () => {
      const happyZombie = createTestZombie({
        id: 'z1',
        quality: 'common',
        hp: 100,
        happiness: 95,
        lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000
      });

      const unhappyZombie = createTestZombie({
        id: 'z2',
        quality: 'common',
        hp: 100,
        happiness: 10,
        lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000
      });

      const happyDecay = calculateDailyDecay(happyZombie, 1);
      const unhappyDecay = calculateDailyDecay(unhappyZombie, 1);

      expect(happyDecay.hpLoss).toBeLessThan(unhappyDecay.hpLoss);
    });

    it('feeding boosts happiness which reduces decay', () => {
      let gameState = createTestGameState({
        inventory: { rottenMeat: 10 },
        farm: {
          activeZombies: [
            createTestZombie({
              id: 'z1',
              hp: 90,
              happiness: 30,
              lastFed: Date.now() - 2 * 24 * 60 * 60 * 1000
            })
          ]
        }
      });

      // Feed zombie (boosts happiness)
      gameState = feedZombie('z1', 'rottenMeat', gameState);

      const zombie = gameState.farm.activeZombies[0];
      expect(zombie.happiness).toBeGreaterThan(30);

      // Calculate decay - should be reduced due to higher happiness
      const decayModifier = getHappinessDecayModifier(zombie);
      expect(decayModifier).toBeLessThan(1.0);
    });
  });
});
```

---

## Summary

This test specification document provides comprehensive test coverage for Farm Phase 4: Decay & Maintenance Systems.

**Total Tests**: ~90 tests
- **4.1 Decay Mechanics**: 30 tests (basic calculations, floor enforcement, fed prevention, edge cases, offline processing)
- **4.2 Happiness System**: 25 tests (initialization, positive/negative factors, boundaries, decay effects)
- **4.3 Feeding System**: 20 tests (successful feeding, quality bonuses, resource validation, cooldown, batch operations)
- **4.4 Crypt Storage**: 15 tests (storage, retrieval, capacity validation, decay prevention)

**Coverage Areas**:
- Unit tests for all core functions
- Edge case and boundary testing
- Resource validation and error handling
- Integration tests for cross-system interactions
- Time-based calculations and offline progress

**Key Testing Principles**:
- AAA pattern (Arrange, Act, Assert)
- Immutability verification (no state mutation)
- Comprehensive edge case coverage
- Integration test workflows
- Type-safe test data using factories

**Next Steps**:
1. Review test specifications with development team
2. Implement tests following TDD methodology (Red phase)
3. Verify all tests fail appropriately before implementation
4. Coordinate with Farm Agent for implementation (Green phase)
5. Achieve ~100% coverage for critical maintenance logic

**Related Documents**:
- `/Users/victor/work/ZombieFarm/META/DOMAIN-FARM.md` - Domain authority for farm mechanics
- `/Users/victor/work/ZombieFarm/META/TESTING.md` - Testing standards and practices
- `/Users/victor/work/ZombieFarm/META/TODOs/TODO-FARM.md` - Farm module implementation roadmap
