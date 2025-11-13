# Features

This directory contains feature modules that encapsulate domain-specific logic for Zombie Farm.

## Structure

Each feature module follows a consistent structure:

```
feature-name/
├── lib/                    # Business logic, state machines, utilities
│   ├── actions.ts         # XState actions
│   ├── guards.ts          # XState guards
│   ├── services.ts        # Async services
│   └── utils.ts           # Feature-specific utilities
├── components/            # Feature-specific React components
├── types/                 # Feature-specific TypeScript types
├── featureMachine.ts      # XState state machine (if applicable)
└── index.ts               # Public API exports
```

## Modules

### game/

Core game orchestration, global state machine, and event coordination.

- Game initialization and lifecycle
- Global state management
- Event bus and dispatching
- Mode transitions (tutorial, farm, combat)

### farm/

Farming simulation mechanics.

- Zombie lifecycle (planting, growth, harvesting)
- Active zombie management (feeding, happiness, decay)
- Resource gathering
- Farm buildings and structures
- Time-based events

### combat/

Auto-battler combat system.

- Battle initiation and preparation
- Real-time combat mechanics
- Damage calculations
- Enemy AI
- Battle outcomes and rewards

### world/

Phaser-based world rendering and exploration.

- Farm exploration scene
- Combat battle scene
- Map rendering
- Character sprites and animations
- Visual effects

## Guidelines

1. **Domain Boundaries**: Each module should have clear boundaries. Communicate via events, not direct imports.
2. **State Management**: Use XState for complex workflows. Use React state for simple UI state.
3. **Event-Driven**: Emit events for cross-module communication.
4. **Testability**: Write testable, pure functions. Mock Phaser and external dependencies in tests.
5. **Reusability**: Extract common logic to `src/lib/` for sharing across features.
