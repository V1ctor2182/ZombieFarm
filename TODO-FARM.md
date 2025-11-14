# Farm Module Development TODO

This document tracks the development progress of the Farm module for Zombie Farm.

## Overview

The Farm module implements all farming-related gameplay features per DOMAIN-FARM.md specifications:
- Zombie cultivation (planting, growth, harvesting)
- Resource management
- Upkeep and decay systems
- Plot and building management
- Farm economy

## Development Phases

### Phase 1: Core Types & Configuration (COMPLETE)

**Status:** COMPLETE
**Completed:** 2025-11-13

- [x] Phase 1.1: Global type definitions (src/types/global.ts)
- [x] Phase 1.2: Resource type definitions (src/types/resources.ts)
- [x] Phase 1.3: Farm type definitions (src/types/farm.ts)
- [x] Phase 1.4: Combat type definitions (src/types/combat.ts)
- [x] Phase 1.5: World type definitions (src/types/world.ts)
- [x] Phase 1.6: UI type definitions (src/types/ui.ts)

**Deliverables:**
- Complete TypeScript type system
- All game types documented and structured
- Types match DOMAIN-FARM.md and DOMAIN-COMBAT.md specifications

---

### Phase 2: Zombie Lifecycle

**Status:** IN PROGRESS

#### Phase 2.1: Planting System (COMPLETE)

**Status:** COMPLETE
**Completed:** 2025-11-13

**Implemented:**
- [x] Planting service (src/features/farm/services/planting.ts)
  - validatePlot() - Plot availability validation
  - validateSeedAvailability() - Seed inventory checks
  - calculatePlantingBonus() - Growth modifiers (watering, fertilizer, weather)
  - startGrowthTimer() - Growth timer initialization
  - plantSeed() - Main planting function
- [x] Planting events (src/features/farm/events/plantingEvents.ts)
  - handlePlantSeedEvent() - Event handler for PLANT_SEED events
  - handleMultiplePlantSeedEvents() - Batch planting support
- [x] Unit tests (src/features/farm/services/__tests__/planting.test.ts)
  - 40 unit tests covering all functions and edge cases
  - 100% coverage of planting service
- [x] Integration tests (src/features/farm/__tests__/planting.integration.test.ts)
  - 14 integration tests covering full workflow
  - State machine integration
  - Weather effects
  - Multi-seed planting scenarios

**Test Results:**
- 54 tests total: 54 passing, 0 failing
- Unit tests: 40/40 passing
- Integration tests: 14/14 passing

**Deliverables:**
- Fully functional seed planting system
- Plot validation and seed inventory management
- Growth time calculations with bonuses
- Weather effects (Blood Rain, Bright Sun)
- Immutable state updates
- Comprehensive test coverage

**Key Features:**
- Validates plot availability (must be empty)
- Checks seed inventory before planting
- Applies growth modifiers:
  - Watering: 50% faster growth
  - Fertilizer: 30% faster growth
  - Blood Rain weather: 20% faster growth
  - Bright Sun weather: 10% slower growth
  - Bonuses stack additively
- Creates growth timer with calculated remaining time
- Updates farm state and inventory immutably
- Emits events for state machine integration

---

#### Phase 2.2: Growth System (COMPLETE)

**Status:** COMPLETE
**Completed:** 2025-11-13

**Implemented:**
- [x] Growth tracking service (src/features/farm/services/growth.ts)
  - [x] updateGrowth() - Advance growth timers
  - [x] checkGrowthComplete() - Detect ready zombies
  - [x] calculateOfflineGrowth() - Handle offline time
  - [x] determineQuality() - Calculate zombie quality at harvest
- [x] Growth events (src/features/farm/events/growthEvents.ts)
  - [x] handleGrowthUpdateEvent() - Update growth progress
  - [x] handleOfflineGrowthEvent() - Calculate offline progress
  - [x] handleGrowthCompleteEvent() - Mark zombie ready
- [x] Tests
  - [x] Unit tests (src/features/farm/services/__tests__/growth.test.ts) - 23 tests
  - [x] Integration tests (src/features/farm/__tests__/growth.integration.test.ts) - 15 tests

**Test Results:**
- 38 tests total: 38 passing, 0 failing
- Unit tests: 23/23 passing
- Integration tests: 15/15 passing

**Deliverables:**
- Fully functional growth system with timer countdown
- Offline progress calculation working correctly
- Growth completion detection
- Quality determination (Bronze/Silver/Gold/Diamond)
- Event-driven architecture for growth updates
- Comprehensive test coverage

**Key Features:**
- Growth timers update in real-time or offline
- Identifies newly completed plots
- Quality determination uses probabilistic weighted selection
- Fertilizer increases quality chances (+15%)
- Watering does NOT affect quality (only speed)
- Immutable state updates throughout
- All edge cases handled (negative time, empty plots, etc.)

---

#### Phase 2.3: Harvesting System (COMPLETE)

**Status:** COMPLETE
**Completed:** 2025-11-13

**Implemented:**
- [x] Harvesting service (src/features/farm/services/harvesting.ts)
  - [x] validateHarvest() - Validate plot is ready
  - [x] harvestZombie() - Main harvest function
  - [x] generateZombieStats() - Create zombie with stats based on type and quality
  - [x] applyQualityMultiplier() - Apply quality multipliers
  - [x] applyMutations() - Apply random mutations to zombies
  - [x] generateByproducts() - Generate resource drops
- [x] Harvesting events (src/features/farm/events/harvestingEvents.ts)
  - [x] handleHarvestEvent() - Single plot harvest
  - [x] handleBatchHarvestEvent() - Multiple plot harvest
  - [x] handleAutoHarvestEvent() - Auto-harvest all ready plots
- [x] Unit tests (src/features/farm/services/__tests__/harvesting.test.ts)
  - [x] 40 unit tests covering all functions and edge cases
  - [x] 100% coverage of harvesting service
- [x] Integration tests (src/features/farm/__tests__/harvesting.integration.test.ts)
  - [x] 13 integration tests covering full workflow
  - [x] State machine integration
  - [x] Capacity management scenarios
  - [x] Batch harvest scenarios

**Test Results:**
- 53 tests total: 53 passing, 0 failing
- Unit tests: 40/40 passing
- Integration tests: 13/13 passing

**Deliverables:**
- Fully functional zombie harvesting system
- Quality-based stat generation (Bronze 1.0x, Silver 1.25x, Gold 1.5x, Diamond 2.0x)
- Random mutation system with quality-based chances
- Capacity management (active roster vs Crypt storage)
- Resource byproduct generation
- Plot clearing for replanting
- Event-driven architecture for harvest actions
- Comprehensive test coverage

**Key Features:**
- Validates plot is ready before harvest
- Generates zombie with base stats from config
- Applies quality multipliers to stats (rounded to integers)
- Mutation system with 10 mutation types:
  - Bronze: 5% mutation chance
  - Silver: 10% mutation chance
  - Gold: 20% mutation chance
  - Diamond: 35% mutation chance
- Smart capacity management:
  - Adds to active roster if under capacity
  - Automatically stores in Crypt if at capacity
- Resource byproducts based on zombie tier:
  - Basic: Rotten Wood, Bones
  - Advanced: + Corpse Dust
  - Elite/Special: + Soul Fragments
- Batch harvest support for multiple plots
- Auto-harvest feature with quality determination
- Immutable state updates throughout
- All edge cases handled

---

### Phase 3: Farm Management (TODO)

**Status:** NOT STARTED

#### Phase 3.1: Building System (TODO)
- [ ] Building placement
- [ ] Building construction timers
- [ ] Building effects (capacity, production, etc.)

#### Phase 3.2: Resource Gathering (TODO)
- [ ] Resource node interactions
- [ ] Gathering mechanics
- [ ] Resource respawn/cooldown

#### Phase 3.3: Farm Expansion (TODO)
- [ ] Land expansion system
- [ ] Unlocking new areas
- [ ] Expansion costs and requirements

---

### Phase 4: Zombie Management (TODO)

**Status:** NOT STARTED

#### Phase 4.1: Active Zombie Management (TODO)
- [ ] Zombie roster management
- [ ] Crypt storage system
- [ ] Deploy/store zombies

#### Phase 4.2: Zombie Interactions (TODO)
- [ ] Feeding system
- [ ] Petting/happiness
- [ ] Commands and AI states

---

### Phase 5: Decay and Maintenance (TODO)

**Status:** NOT STARTED

#### Phase 5.1: Decay System (TODO)
- [ ] Daily stat decay
- [ ] Happiness decay
- [ ] Decay prevention (feeding)

#### Phase 5.2: Maintenance (TODO)
- [ ] Feeding mechanics
- [ ] Shelter benefits
- [ ] Decay recovery

---

### Phase 6: Time and Weather (TODO)

**Status:** NOT STARTED

#### Phase 6.1: Day/Night Cycle (TODO)
- [ ] Time progression
- [ ] Day/night effects
- [ ] Offline time calculation

#### Phase 6.2: Weather System (TODO)
- [ ] Weather generation
- [ ] Weather effects on gameplay
- [ ] Weather transitions

---

## Testing Standards

All implementations follow strict TDD (Test-Driven Development):

1. **Write tests FIRST** - Before any implementation
2. **Red Phase** - Tests fail initially
3. **Green Phase** - Implement to make tests pass
4. **Blue Phase** - Refactor while keeping tests green

**Coverage Goals:**
- Unit tests: ~100% coverage of service functions
- Integration tests: All major workflows covered
- Edge cases: All boundary conditions tested
- Error handling: All failure paths tested

**Test Categories:**
- Unit tests: Individual function testing
- Integration tests: Full workflow testing
- Edge case tests: Boundary conditions
- Error tests: Failure scenarios

---

## Architecture

### Directory Structure

```
src/features/farm/
├── services/          # Business logic services
│   ├── __tests__/    # Unit tests
│   └── planting.ts   # Planting service (COMPLETE)
├── events/           # Event handlers
│   └── plantingEvents.ts  # Planting events (COMPLETE)
└── __tests__/        # Integration tests
    └── planting.integration.test.ts  # (COMPLETE)
```

### Design Patterns

- **Immutable State Updates**: All state changes return new objects
- **Result Types**: Functions return Result<Success, Error> patterns
- **Event-Driven**: State changes emit events for state machine
- **Type Safety**: Full TypeScript coverage
- **Test-First**: TDD methodology throughout

---

## Dependencies

### Internal Dependencies
- src/types/* - Type definitions
- src/lib/config/zombieFarmConfig.ts - Game configuration

### External Dependencies
- None - Pure TypeScript logic

---

## Documentation References

- **DOMAIN-FARM.md** - Primary authority for farm mechanics
- **ARCHITECTURE.md** - System architecture patterns
- **TESTING.md** - Testing standards and practices
- **CLAUDE.md** - Agent documentation and workflow

---

## Notes

### Implementation Decisions

**Phase 2.1 (Planting):**
- SeedType to ZombieType mapping implemented via helper function
- Weather effects integrated from game state context
- Growth timer uses milliseconds for precision
- Minimum growth time: 1 second (prevents edge cases)
- Bonuses stack additively (watering + fertilizer + weather)

**Phase 2.2 (Growth):**
- Growth timers use milliseconds for precision
- updateGrowth() and calculateOfflineGrowth() share same logic
- Quality determination uses weighted random selection
- Fertilizer redistributes probability from bronze to higher tiers
- Growth completion detected by checking growthTimeRemaining === 0
- Events return completedPlots array for UI notifications

### Technical Debt
- None identified in completed phases

### Future Enhancements
- Consider caching zombie config lookups
- Add event logging for debugging
- Implement planting animation hooks
- Add sound effect hooks

---

## Changelog

### 2025-11-13

**Phase 2.3 COMPLETE: Harvesting System**
- Implemented harvesting service with zombie generation
- Implemented quality-based stat multiplication
- Implemented mutation system with 10 mutation types
- Implemented capacity management (active/Crypt)
- Implemented resource byproduct generation
- Implemented harvest event handlers (single, batch, auto)
- 53 tests passing (40 unit + 13 integration)
- All harvesting mechanics working correctly
- Zombie lifecycle Phase 2 complete

**Phase 2.2 COMPLETE: Growth System**
- Implemented growth service with timer countdown
- Implemented offline progress calculation
- Implemented quality determination system
- Implemented growth event handlers
- 38 tests passing (23 unit + 15 integration)
- All growth mechanics working correctly
- Event-driven architecture in place

**Phase 2.1 COMPLETE: Planting System**
- Implemented planting service with full validation
- Implemented planting event handlers
- 54 tests passing (40 unit + 14 integration)
- Weather effects working correctly
- All edge cases handled

---

**Last Updated:** 2025-11-13
**Next Phase:** Phase 3 - Farm Management
**Status:** Phase 2 Complete (Zombie Lifecycle), Ready for Phase 3

---

## Project-Wide Test Status (2025-11-13)

**Total Tests Passing: 945+**

- **CORE Module:** 74/74 tests (100%)
  - Event system: 43 tests
  - Game machine + provider + hooks: 31 tests
  - All core functionality working
- **TEST Module:** 428/432 tests (99.07%)
  - Factories: 287 tests
  - Fixtures: 22 tests
  - Mocks: 165 tests
  - Matchers: 43 tests
- **FARM Module:** 145/145 tests (100%) ✅ UPDATED
  - Planting system complete (54 tests)
  - Growth system complete (38 tests)
  - Harvesting system complete (53 tests) ✅ NEW
- **COMBAT Module:** 234/234 tests (100%)
  - Battle initialization: 57 tests
  - Test helpers: 177 tests
