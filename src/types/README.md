# Type Definitions

This directory contains global TypeScript type definitions shared across the application.

## Structure

```
types/
├── global.ts              # Global game types (GameState, Player, etc.)
├── events.ts              # All game events (typed event system)
├── resources.ts           # Resource types and inventory
├── farm.ts                # Farm-specific types (delegated to farm module)
├── combat.ts              # Combat-specific types (delegated to combat module)
└── index.ts               # Re-export all types
```

## Type Categories

### Global Types (global.ts)

Core game types used everywhere:

- `GameState` - Complete game state
- `Player` - Player data (level, XP, achievements)
- `GameMode` - Game modes (tutorial, farm, combat, paused)
- `TimeState` - Day/night cycle, current time
- `UIState` - UI-related state

### Event Types (events.ts)

All game events in a typed system:

- `GameEvent` - Discriminated union of all events
- `FarmEvent` - Farm-specific events
- `CombatEvent` - Combat-specific events
- `SystemEvent` - System events (save, load, pause)

### Resource Types (resources.ts)

Resources and inventory:

- `ResourceType` - All resource types (enum)
- `Inventory` - Resource inventory
- `Currency` - Dark Coins, Soul Essence

### Domain Types

Farm and Combat types are defined in their respective modules but may be re-exported here for convenience.

## Guidelines

1. **Strict Typing**: Use strict TypeScript features
   - No `any` (use `unknown` if needed)
   - Discriminated unions for variants
   - Readonly where appropriate
2. **Discriminated Unions**: Use for events, variants
   ```typescript
   type GameEvent =
     | { type: 'seed.planted'; seedId: string; plotId: string }
     | { type: 'zombie.harvested'; zombieId: string }
     | { type: 'battle.started'; battleId: string };
   ```
3. **Immutability**: Use `Readonly`, `ReadonlyArray` for state
4. **Documentation**: JSDoc comments for complex types
5. **Consistency**: Follow naming conventions
   - Interfaces: `PascalCase`
   - Types: `PascalCase`
   - Enums: `PascalCase` (values UPPER_CASE)

## Example

```typescript
// global.ts
export interface GameState {
  readonly player: Player;
  readonly farm: FarmState;
  readonly combat: CombatState;
  readonly inventory: Inventory;
  readonly time: TimeState;
  readonly ui: UIState;
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly level: number;
  readonly xp: number;
  readonly achievements: ReadonlyArray<string>;
}

// events.ts
export type GameEvent = FarmEvent | CombatEvent | SystemEvent;

export type FarmEvent =
  | { type: 'seed.planted'; payload: { seedId: string; plotId: string } }
  | { type: 'zombie.harvested'; payload: { zombieId: string } }
  | { type: 'zombie.fed'; payload: { zombieId: string; foodItem: string } };
```

## Importing Types

Use path alias for consistency:

```typescript
import type { GameState, Player } from '@types';
import type { GameEvent, FarmEvent } from '@types/events';
```
