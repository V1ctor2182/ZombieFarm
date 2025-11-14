# Combat Module Tests

This directory contains all tests for the combat module.

## Overview

The combat module implements the **auto-battler** mechanics for Zombie Farm, where players send their zombies to raid human settlements. All combat logic is tested comprehensively following **Test-Driven Development (TDD)** principles.

## Testing Strategy

### 1. Test Organization

Tests are organized by domain functionality:

- **Battle Flow Tests**: Initialization, phases, victory/defeat conditions
- **Damage Calculation Tests**: All damage types, modifiers, armor penetration
- **Status Effect Tests**: DoT effects, stacking, duration management
- **AI Behavior Tests**: Targeting, movement, decision-making
- **Battle Outcome Tests**: XP gains, loot distribution, permadeath

### 2. Test Coverage Goals

Per **TESTING.md** standards:
- **Combat Logic**: ~100% coverage (critical game mechanics)
- **Overall Module**: 80%+ coverage minimum

### 3. Test Utilities

All combat tests use helpers from `/test-utils/`:

- `combatTestHelpers.ts` - Battle state factories, simulation
- `damageCalculatorTestHelpers.ts` - Damage formulas and scenarios
- `statusEffectTestHelpers.ts` - Status effect application and verification
- `battleStateTestHelpers.ts` - Battle state management and queries

## Authority

All combat mechanics MUST match **DOMAIN-COMBAT.md** specifications:

### Damage Formula
```typescript
baseDamage = attackerAttack - defenderDefense
finalDamage = max(1, baseDamage) // Minimum 1 damage
// Apply type modifiers (Holy 2x vs undead, etc.)
```

### Status Effects
- **Poisoned**: -2% HP/sec for 10s (stackable up to 3x)
- **Burning**: -5% HP/sec for 5s (spreads to nearby)
- **Stunned**: Cannot act for 2s
- **Fear**: Flee for 4s
- **Weakened**: -30% attack for 6s
- **Slowed**: -50% speed for 5s
- **Buffed**: +20% stats for 10s (stackable up to 3x)

### Battle Phases
1. **PREPARATION**: Squad selection, pre-battle
2. **ACTIVE**: Battle in progress
3. **VICTORY**: All enemies defeated
4. **DEFEAT**: All zombies destroyed
5. **RETREAT**: Player initiated retreat (10s countdown)

## Writing Combat Tests

### AAA Pattern
All tests follow **Arrange-Act-Assert**:

```typescript
describe('damageCalculation', () => {
  it('applies holy damage bonus vs undead', () => {
    // Arrange
    const scenario = createHolyDamageScenario();

    // Act
    const result = calculateExpectedDamage(
      scenario.attacker,
      scenario.defender,
      DamageType.HOLY
    );

    // Assert
    expect(result.modifiers.typeMultiplier).toBe(2.0);
    expect(result.finalDamage).toBeGreaterThan(
      result.baseDamage
    );
  });
});
```

### Using Test Helpers

```typescript
import {
  createMockBattle,
  simulateBattleTick,
  killUnit,
} from '../test-utils/combatTestHelpers';

it('detects victory when all enemies dead', () => {
  // Arrange
  let battle = createMockBattle();

  // Act - kill all enemies
  battle.enemies.forEach((enemy) => {
    battle = killUnit(battle, enemy.id);
  });
  battle = simulateBattleTick(battle, 1.0);

  // Assert
  expect(battle.phase).toBe(BattlePhase.VICTORY);
});
```

### Testing Edge Cases

ALWAYS test edge cases per **TESTING.md**:

- Minimum damage (attack << defense)
- Overkill damage (damage >> HP)
- Zero HP scenarios
- Invalid state transitions
- Effect stacking beyond max
- Retreat during final enemy death

## Test Naming Conventions

- **File Names**: `*.test.ts`
- **Describe Blocks**: Function or feature name
- **Test Names**: Clear, descriptive behavior

```typescript
describe('calculateExpectedDamage', () => {
  it('enforces minimum damage of 1');
  it('applies critical hit multiplier');
  it('handles armor-ignoring attacks');
});
```

## Running Tests

### All Combat Tests
```bash
npm test src/features/combat
```

### Specific Test File
```bash
npm test src/features/combat/test-utils/damageCalculatorTestHelpers.test.ts
```

### Watch Mode
```bash
npm test -- --watch src/features/combat
```

### Coverage Report
```bash
npm test -- --coverage src/features/combat
```

## Integration with TDD Workflow

### Red-Green-Refactor Cycle

1. **RED**: Test Agent writes failing test
2. **GREEN**: Combat Agent implements to pass test
3. **BLUE**: Refactor while keeping tests green

### Example Workflow

```
Test Agent:
  - Writes test for toxic damage armor penetration
  - Test fails (not implemented)

Combat Agent:
  - Reads DOMAIN-COMBAT.md for toxic damage rules
  - Implements damage calculation with 50% armor bypass
  - Test passes

Test Agent:
  - Verifies coverage, adds edge cases
  - All tests still pass
```

## Cross-Module Integration

Combat tests should:

- **NOT** directly test Farm module code
- **DO** use Farm types (Zombie stats, ZombieId)
- **DO** emit events for Farm to consume
- **DO** validate integration contracts

Example integration point:
```typescript
// Combat emits event after battle
const event: BattleEndedEvent = {
  type: 'BATTLE_ENDED',
  result: generateBattleResult(battle),
  casualties: battle.casualties, // Farm removes these zombies
  survivors: battle.survivors,   // Farm updates their XP/HP
};
```

## Performance Testing

Combat performance is critical (60 FPS during battles):

```typescript
it('processes 100 battle ticks in <100ms', () => {
  const battle = createMockBattle();

  const start = performance.now();
  let current = battle;
  for (let i = 0; i < 100; i++) {
    current = simulateBattleTick(current, 0.016); // ~60 FPS
  }
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(100);
});
```

## Debugging Tips

### View Battle State
```typescript
console.log(JSON.stringify(battle, null, 2));
```

### Step Through Ticks
```typescript
let battle = createMockBattle();
for (let i = 0; i < 10; i++) {
  console.log(`Tick ${i}:`, {
    duration: battle.battleDuration,
    aliveZombies: getAliveUnits(battle).zombies.length,
    aliveEnemies: getAliveUnits(battle).enemies.length,
  });
  battle = simulateBattleTick(battle, 1.0);
}
```

## CI/CD Integration

All tests MUST pass before merging:

- Run automatically on commit
- Block PR if any test fails
- Enforce 80%+ coverage threshold

## Documentation Updates

When adding new combat features:

1. Update **DOMAIN-COMBAT.md** with rules
2. Write failing tests (Test Agent)
3. Implement feature (Combat Agent)
4. Update this README if new test patterns added

---

**Remember**: Combat tests are the contract between design and implementation. If DOMAIN-COMBAT.md says it, tests must verify it.
