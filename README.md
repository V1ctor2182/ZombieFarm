# Zombie Farm

A dark twist on farming simulation games where you grow zombies instead of crops, manage an undead horde, and send them into strategic auto-battler combat to defend your necromantic empire.

## Overview

Zombie Farm combines the addictive farming gameplay of games like Sunflower Land with strategic auto-battler combat mechanics. Grow zombies from seeds, nurture them through their lifecycle, manage decay and happiness, then deploy them in tactical battles against enemy castles.

### Key Features

- **Zombie Cultivation**: Plant zombie seeds, manage growth cycles, and harvest unique undead minions
- **Living Farm Management**: Maintain an active zombie horde with happiness, feeding, and decay mechanics
- **Strategic Auto-Battler Combat**: Deploy zombies in castle siege battles with real-time combat
- **Resource Economy**: Gather dark resources like Rotten Wood, Bones, Blood Water, and Soul Essence
- **Day/Night Cycles**: 30-minute real-time cycles affecting zombie and enemy stats
- **Permadeath Stakes**: Zombies lost in battle are gone forever - strategic risk/reward
- **Progressive Unlocks**: Expand your farm, discover mutations, unlock new zombie types
- **Offline Progress**: Your farm continues while you're away

## Tech Stack

- **React 18** - UI framework with TypeScript for type safety
- **Vite** - Fast build tool and dev server
- **Phaser 3** - 2D game engine for interactive farm and combat scenes
- **XState** - State machines for complex game logic and state management
- **Tailwind CSS** - Utility-first styling with custom dark/undead theme
- **Jest + React Testing Library** - Comprehensive testing framework
- **Immer** - Immutable state updates

## Project Structure

```
ZombieFarm/
├── src/
│   ├── features/          # Feature modules (domain logic)
│   │   ├── game/         # Core game state machine and orchestration
│   │   ├── farm/         # Farming mechanics (planting, zombies, decay)
│   │   ├── combat/       # Battle system (auto-battler, damage, AI)
│   │   └── world/        # Phaser world rendering
│   ├── components/       # Reusable UI components
│   ├── lib/             # Shared libraries
│   │   ├── config/      # Game configuration and balance
│   │   ├── storage/     # Local save system
│   │   └── utils/       # Utilities (math, formatting, validation)
│   ├── types/           # TypeScript type definitions
│   └── assets/          # Static assets (sprites, audio, data)
├── META/                # Documentation
│   ├── ARCHITECTURE.md  # System architecture
│   ├── DOMAIN-FARM.md   # Farm mechanics specification
│   ├── DOMAIN-COMBAT.md # Combat mechanics specification
│   ├── TESTING.md       # Testing standards
│   ├── WORKFLOW.md      # Development process (TDD)
│   └── TODOs/           # Task tracking
├── CLAUDE.md            # AI agent documentation directory
└── Zombie-Farm-PRD.md   # Complete game design document
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher (LTS recommended)
- **npm** 9.x or higher (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ZombieFarm.git
cd ZombieFarm

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Start dev server with HMR
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Workflow

This project follows **Test-Driven Development (TDD)** methodology:

1. **Red**: Write failing test for new feature
2. **Green**: Implement code to pass test
3. **Blue**: Refactor while keeping tests green
4. **Commit**: Atomic commits with descriptive messages
5. **Document**: Update relevant documentation

See [META/WORKFLOW.md](META/WORKFLOW.md) for detailed development process.

## Game Mechanics

### Zombie Lifecycle

1. **Plant Seeds**: Purchase and plant zombie seeds in plots
2. **Growth**: Water and fertilize to optimize growth (30min - 3+ hours)
3. **Harvest**: Zombies emerge with randomized stats and traits
4. **Maintenance**: Feed zombies, manage happiness, prevent decay
5. **Combat**: Deploy zombies in castle sieges for rewards
6. **Permadeath**: Lost zombies cannot be recovered

### Combat System

- **Auto-Battler**: Real-time combat with AI-controlled units
- **Strategic Deployment**: Formation, positioning, unit synergies matter
- **Damage Types**: Physical, Toxic, Fire, Dark, Explosive, Holy
- **Status Effects**: Poison, Burn, Stun, Fear, Bleeding
- **High Stakes**: Zombies that fall in battle are permanently lost

### Resources

- **Dark Coins**: Primary currency for purchases
- **Soul Essence**: Premium currency from difficult content
- **Rotten Wood**: Building and crafting material
- **Bones**: Upgrade and crafting material
- **Blood Water**: Fertilizer and special crafting
- **Corpse Dust**: Advanced crafting material
- **Soul Fragments**: Rare mutation material

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - AI agent documentation directory
- **[Zombie-Farm-PRD.md](Zombie-Farm-PRD.md)** - Complete game design document
- **[META/ARCHITECTURE.md](META/ARCHITECTURE.md)** - System architecture
- **[META/DOMAIN-FARM.md](META/DOMAIN-FARM.md)** - Farm mechanics specification
- **[META/DOMAIN-COMBAT.md](META/DOMAIN-COMBAT.md)** - Combat mechanics specification
- **[META/TESTING.md](META/TESTING.md)** - Testing standards
- **[META/WORKFLOW.md](META/WORKFLOW.md)** - Development process
- **[META/GLOSSARY.md](META/GLOSSARY.md)** - Terminology reference

## Code Quality

- **TypeScript Strict Mode**: Full type safety
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit and pre-push hooks
- **80%+ Test Coverage**: Comprehensive testing
- **TDD**: Test-first development approach

## Architecture Principles

1. **Modular Design**: Domain-driven feature modules with clear boundaries
2. **Event-Driven**: Loose coupling through event bus/state machine
3. **Unidirectional Data Flow**: Predictable state updates
4. **Separation of Concerns**: UI, logic, and state cleanly separated
5. **Reusability**: Shared components and utilities
6. **Testability**: Built with testing as a first-class concern

## Current Status

**Phase**: Project Initialization (Phase 1)
**Next Milestone**: Core infrastructure setup complete
**See**: [META/TODOs/TODO-CORE.md](META/TODOs/TODO-CORE.md) for detailed progress

## Contributing

This is currently a solo development project. Contributions are not being accepted at this time.

## License

All rights reserved. This project is not licensed for distribution or modification.

## Credits

- Inspired by [Sunflower Land](https://sunflower-land.com/) farming mechanics
- Built with modern web technologies and game development best practices

---

**Note**: This game is in active development. Features and documentation are subject to change.
