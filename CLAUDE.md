---
title: "Zombie Farm - Claude Agent Documentation Directory"
last updated: 2025-11-12
author: Claude (AI Assistant)
version: 1.0
---

# CLAUDE.md - Documentation Directory for AI Subagents

This document serves as the central reference guide for all Claude AI subagents working on the Zombie Farm project. It maps out all project documentation, explains the purpose of each document, and provides guidance on when and how to use them.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Document Descriptions](#document-descriptions)
3. [Agent-Specific Usage Guide](#agent-specific-usage-guide)
4. [Development Workflow](#development-workflow)
5. [Document Hierarchy](#document-hierarchy)

---

## Quick Reference

### Core Documents (Read These First)

| Document | Location | Purpose | Primary Users |
|----------|----------|---------|---------------|
| **CLAUDE.md** | `/CLAUDE.md` | This file - Agent documentation directory | All agents |
| **Zombie-Farm-PRD.md** | `/Zombie-Farm-PRD.md` | Complete game design document | All agents |
| **ARCHITECTURE.md** | `/META/ARCHITECTURE.md` | System architecture & tech stack | Architecture, all dev agents |
| **WORKFLOW.md** | `/META/WORKFLOW.md` | Development process & TDD methodology | All agents |
| **TESTING.md** | `/META/TESTING.md` | Testing standards & practices | Test agent, all dev agents |
| **GLOSSARY.md** | `/META/GLOSSARY.md` | Terminology definitions | All agents |

### Domain-Specific Documents

| Document | Location | Purpose | Primary Users |
|----------|----------|---------|---------------|
| **DOMAIN-FARM.md** | `/META/DOMAIN-FARM.md` | Farm mechanics & rules | Farm agent, Test agent |
| **DOMAIN-COMBAT.md** | `/META/DOMAIN-COMBAT.md` | Combat mechanics & rules | Combat agent, Test agent |
| **UIUX.md** | `/META/UIUX.md` | UI/UX design guidelines | UI/UX agent (currently empty) |

### Reference Materials

| Document | Location | Purpose |
|----------|----------|---------|
| **sunflowerland-ref.md** | `/sunflowerland-ref.md` | Directory structure of reference codebase |
| **Sunflowerland-ref/** | `/Sunflowerland-ref/` | Complete Sunflower Land reference codebase |

---

## Document Descriptions

### 1. CLAUDE.md (This Document)

**File:** `/CLAUDE.md`
**Purpose:** Central navigation and reference guide for all Claude AI subagents
**When to Use:**
- First document to read when starting any task
- When uncertain which document to reference
- When onboarding new agents to the project

**Contents:**
- Documentation map and directory
- Agent-specific usage guidelines
- Document hierarchy and relationships
- Quick reference tables

---

### 2. Zombie-Farm-PRD.md

**File:** `/Zombie-Farm-PRD.md`
**Full Name:** Zombie Farm - Product Requirements Document / Game Design Document
**Purpose:** Complete specification of game design, mechanics, and features
**When to Use:**
- Understanding overall game vision and goals
- Clarifying game mechanics and rules
- Validating feature implementation against design intent
- Resolving ambiguities in domain documents

**Contents:**
- Core concept and game overview
- Tutorial and onboarding flow
- Zombie growth system (planting, harvesting, mutations)
- Living zombies on the farm (behavior, management)
- Castle siege combat system (battles, mechanics)
- Resource economy (currencies, materials)
- Farm management and building
- Player progression systems
- PvE world and exploration
- Special events and seasonal content
- Game loop and strategy
- Detailed mechanics (decay, weather, territory)

**Key Sections for Agents:**
- Farm Agent: Sections 3-5, 7-8, 13.1-13.2
- Combat Agent: Section 6, 6.5, parts of 13.3
- UI/UX Agent: All sections (for interface design)
- Test Agent: All sections (for test case generation)
- Architecture Agent: Sections 1, 12 (game loop)

**Size Note:** This is a large document (47,830+ tokens). Read specific sections as needed rather than the entire file at once.

---

### 3. ARCHITECTURE.md

**File:** `/META/ARCHITECTURE.md`
**Full Name:** System Architecture
**Purpose:** Technical architecture, project structure, and technology stack
**When to Use:**
- Understanding system design patterns
- Adding new modules or features
- Refactoring code
- Setting up new components
- Understanding data flow

**Contents:**
- Project overview and architectural principles
- Project structure (src/ organization)
- Module interaction and boundaries
- Tech stack (React, TypeScript, Vite, Phaser, XState, Jest)
- State management approach
- Reusing Sunflower Land components
- Data flow examples
- Event-driven architecture

**Key Principles:**
- Modular, domain-driven architecture
- Event-driven state management with XState
- Clear separation of concerns (Farm, Combat, World, UI)
- Unidirectional data flow
- Test-driven development
- Local-only (no blockchain/server)

**For New Features:**
1. Check project structure to understand where code belongs
2. Review module interaction patterns
3. Follow event-driven architecture
4. Reuse existing components where possible

---

### 4. WORKFLOW.md

**File:** `/META/WORKFLOW.md`
**Full Name:** Development Workflow
**Purpose:** Defines how developers and AI agents collaborate using TDD
**When to Use:**
- Starting any new task
- Understanding the TDD cycle
- Knowing when to invoke which agent
- Managing git commits and documentation updates
- Handling test failures

**Contents:**
- Roles of AI sub-agents (Architecture, Test, UI/UX, Farm, Combat)
- Test-Driven Development cycle (Red-Green-Refactor)
- Using agents effectively
- Handling failing tests and bugs
- Documentation and source control practices
- Example workflow scenarios

**TDD Cycle (Core Workflow):**
1. **Red:** Write failing test for new feature
2. **Green:** Implement code to pass test (use appropriate agent)
3. **Blue:** Refactor if needed (ensure tests still pass)
4. **Commit:** Commit changes with descriptive message
5. **Document:** Update relevant documentation

**Agent Invocation Guidelines:**
- **Architecture Agent:** Major features, refactoring, system design
- **Test Agent:** Generate test cases, edge cases, test scenarios
- **UI/UX Agent:** Implement UI components, styling, layout
- **Farm Agent:** Farm logic, zombie lifecycle, resources
- **Combat Agent:** Battle logic, damage calculation, AI behavior

---

### 5. TESTING.md

**File:** `/META/TESTING.md`
**Full Name:** Testing Standards
**Purpose:** Testing methodology, standards, and best practices
**When to Use:**
- Writing any test
- Understanding coverage goals
- Setting up test utilities
- Debugging test failures
- Ensuring test quality

**Contents:**
- Tools and setup (Jest, React Testing Library)
- Test structure and naming conventions
- What to test (domain logic, UI, integration, regression)
- Mocking and test isolation
- Coverage goals (80%+ overall, ~100% for critical logic)
- Testing examples
- Continuous testing practices

**Key Standards:**
- Use Jest for unit/integration tests
- Use React Testing Library for component tests
- Name test files: `*.test.ts` or `*.test.tsx`
- Follow AAA pattern: Arrange, Act, Assert
- Focus on behavior, not implementation
- Mock external dependencies
- Use fake timers for time-dependent logic

**Coverage Requirements:**
- Critical code (Farm, Combat logic): ~100%
- Overall project: 80%+ (statements, functions, lines)
- UI: Meaningful tests over snapshot tests

---

### 6. GLOSSARY.md

**File:** `/META/GLOSSARY.md`
**Full Name:** Glossary
**Purpose:** Definitions of game terminology and technical terms
**When to Use:**
- Clarifying unfamiliar terms
- Ensuring consistent terminology
- Understanding game-specific concepts
- Writing documentation or code comments

**Contents:**

**Game Terminology:**
- Auto-Battler, Crypt, Dark Coins, Decay, Happiness
- HP, Necromancer, Mutation, Permadeath
- Plot, Raid, Resources, Soul Essence
- Zombie types (Shambler, Runner, Brute, Spitter, etc.)
- Zombie quality tiers

**Technical Terms:**
- AI (agent vs game AI), Claude, CI/CD, DOM
- DoT (Damage over Time), FPS, HUD
- Jest, React, RTL, TDD, TypeScript
- XState, XP, Yield

**Usage:** Reference this when encountering unfamiliar terms in any document or when ensuring consistent naming in code.

---

### 7. DOMAIN-FARM.md

**File:** `/META/DOMAIN-FARM.md`
**Full Name:** Farm Domain Rules
**Purpose:** Authoritative specification of all farm-related game mechanics
**When to Use:**
- Implementing any farm feature
- Understanding zombie lifecycle
- Implementing decay/maintenance systems
- Building structures or resource systems
- Writing tests for farm logic

**Contents:**

**Zombie Lifecycle:**
- Planting (seeds, plots, requirements)
- Growth (timers, watering, fertilizing)
- Harvesting (emergence, yields)
- Living zombies on farm (roaming, AI, interactions)
- Death on farm (rare conditions)

**Decay and Maintenance:**
- Stat decay mechanics (daily percentage loss)
- Happiness system (factors, effects, recovery)
- Feeding (prevents decay, boosts happiness)
- Rest and shelter (Crypt storage, decay reduction)
- Decay floor (minimum stat values)

**Capacity Management:**
- Active zombie cap (starts at 10, expandable to ~100)
- Crypt storage (unlimited, no decay, no resource consumption)
- Increasing capacity (structures, upgrades, research)

**Resources and Structures:**
- Primary farm resources (Rotten Wood, Bones, Blood Water, Corpse Dust, Soul Fragments)
- Resource gathering mechanics
- Building and construction
- Farm expansion

**Time and Progression:**
- Day/night cycle (30 min real-time: 20 day, 10 night)
- Weather system (Blood Rain, Bright Sunlight, Fog)
- Offline progress
- Player progression (XP, quests, achievements, tech tree)

**Authority:** This is the **authoritative source** for farm mechanics. All farm implementations must match these rules exactly.

---

### 8. DOMAIN-COMBAT.md

**File:** `/META/DOMAIN-COMBAT.md`
**Full Name:** Combat Domain Rules
**Purpose:** Authoritative specification of all combat-related game mechanics
**When to Use:**
- Implementing any combat feature
- Understanding battle flow
- Implementing damage calculations
- Creating enemy AI
- Writing tests for combat logic

**Contents:**

**Battle Preparation:**
- Initiating raids (target selection, prerequisites)
- Squad selection (size limits, deployment order, formation)
- Enemy composition (types, stats, fortifications)
- Beginning of battle (spawn positions, waves)

**Real-Time Combat Mechanics:**
- Movement and formation
- Engagement and targeting (range, AI priorities)
- Attack and damage (cooldowns, calculations, formulas)
- Damage types:
  - Physical (standard, armor-reduced)
  - Toxic (bypasses armor, poison DoT)
  - Fire (AoE, burning, spreads)
  - Dark/Psychic (ignores armor, causes fear)
  - Explosive (AoE, damages all)
  - Holy (double damage to undead, stun/weaken)
- Status effects (Poisoned, Burning, Stunned, Fear, Bleeding)
- Unit special abilities

**Battle Outcomes:**
- Victory conditions (eliminate all enemies)
- Defeat conditions (all zombies destroyed)
- Retreat mechanics (save survivors, 10-second countdown)

**Post-Battle:**
- Permadeath (zombies at 0 HP are lost forever)
- Experience gain (XP for survivors)
- Rewards (Dark Coins, resources, seeds, blueprints, Soul Essence)
- Post-battle state (HP carried over, location conquest, cooldowns)
- Farm morale effects

**Authority:** This is the **authoritative source** for combat mechanics. All combat implementations must match these rules exactly.

---

### 9. UIUX.md

**File:** `/META/UIUX.md`
**Full Name:** UI/UX Design Guidelines
**Purpose:** UI/UX design standards, patterns, and guidelines
**Status:** Currently empty (to be populated)
**When to Use:**
- Implementing UI components
- Designing layouts
- Applying consistent styling
- Creating user interactions

**Future Contents (Planned):**
- Design system and theme (dark/undead aesthetic)
- Component library
- Layout patterns
- Animation guidelines
- Accessibility standards
- Responsive design approach

---

### 10. Reference Materials

#### sunflowerland-ref.md
**File:** `/sunflowerland-ref.md`
**Purpose:** Directory structure listing of Sunflower Land reference codebase
**When to Use:** Quick reference to find specific assets or components in the reference codebase

#### Sunflowerland-ref/
**Directory:** `/Sunflowerland-ref/`
**Purpose:** Complete Sunflower Land codebase for reference
**When to Use:**
- Finding reusable components
- Understanding implementation patterns
- Borrowing UI elements
- Studying state machine examples
- Learning asset organization

**Note:** All blockchain/Web3 components should be removed. Only use farming sim mechanics, UI patterns, and offline systems.

---

## Agent-Specific Usage Guide

### For Architecture Agent

**Primary Documents:**
1. ARCHITECTURE.md - System design reference
2. WORKFLOW.md - Development process
3. Zombie-Farm-PRD.md - Feature understanding
4. Sunflowerland-ref/ - Reference patterns

**Responsibilities:**
- Design module structure and APIs
- Plan major features and refactoring
- Ensure architectural consistency
- Optimize performance
- Guide technology choices

**Workflow:**
1. Review ARCHITECTURE.md for current patterns
2. Consult PRD for feature requirements
3. Check Sunflowerland-ref/ for proven patterns
4. Design solution following modular, event-driven principles
5. Document architectural decisions

---

### For Test Agent

**Primary Documents:**
1. TESTING.md - Testing standards and practices
2. DOMAIN-FARM.md - Farm logic to test
3. DOMAIN-COMBAT.md - Combat logic to test
4. Zombie-Farm-PRD.md - Feature specifications
5. GLOSSARY.md - Terminology

**Responsibilities:**
- Generate comprehensive test cases
- Write edge case scenarios
- Ensure coverage goals met
- Create test utilities and fixtures
- Validate implementations against specs

**Workflow:**
1. Review feature specification in PRD or DOMAIN docs
2. Identify all scenarios (normal, edge, error cases)
3. Follow TESTING.md standards (naming, structure, AAA pattern)
4. Write failing tests first (TDD red phase)
5. Verify tests fail for correct reasons
6. After implementation, verify tests pass
7. Check coverage reports

**Test Categories:**
- Unit tests for domain logic (farm rules, combat calculations)
- Component tests for UI (RTL)
- Integration tests for workflows
- Regression tests for bugs

---

### For UI/UX Agent

**Primary Documents:**
1. UIUX.md - Design guidelines (to be populated)
2. Zombie-Farm-PRD.md - Feature requirements and flows
3. ARCHITECTURE.md - Component structure
4. GLOSSARY.md - Terminology
5. Sunflowerland-ref/ - UI component examples

**Responsibilities:**
- Implement React components
- Apply consistent styling (Tailwind CSS)
- Create responsive layouts
- Implement animations
- Ensure accessibility

**Workflow:**
1. Review feature requirements in PRD
2. Check UIUX.md for design patterns (when populated)
3. Follow ARCHITECTURE.md component structure
4. Use Sunflowerland-ref/ for UI inspiration
5. Implement with React + TypeScript + Tailwind
6. Test with React Testing Library
7. Ensure dark/undead theme consistency

**Key Patterns:**
- Reuse modal, HUD, and menu components
- Follow pixel-art style guidelines
- Use event-driven interactions
- Implement responsive grid layouts

---

### For Farm Agent (farm-module-dev)

**Primary Documents:**
1. DOMAIN-FARM.md - **PRIMARY AUTHORITY** for farm mechanics
2. TESTING.md - Testing standards
3. ARCHITECTURE.md - Module structure
4. Zombie-Farm-PRD.md - Overall game context
5. GLOSSARY.md - Terminology

**Responsibilities:**
- Implement all farm-related features
- Zombie lifecycle (planting, growth, harvesting)
- Decay and maintenance systems
- Resource gathering and management
- Farm structures and expansion
- Integration hooks for other modules

**Workflow:**
1. **ALWAYS** consult DOMAIN-FARM.md as authoritative source
2. Receive test specifications from Test Agent
3. Implement features following TDD (tests first)
4. Follow ARCHITECTURE.md patterns (events, state machines)
5. Update DOMAIN-FARM.md if implementation reveals needed adjustments
6. Provide clean hooks for Combat and UI modules

**Critical Rules:**
- Never implement features outside the farm domain (no combat logic)
- All mechanics must match DOMAIN-FARM.md exactly
- Use XState for complex lifecycle state machines
- Emit events for cross-module communication
- Never write tests (Test Agent does that)

---

### For Combat Agent (combat-mechanics-specialist)

**Primary Documents:**
1. DOMAIN-COMBAT.md - **PRIMARY AUTHORITY** for combat mechanics
2. TESTING.md - Testing standards
3. ARCHITECTURE.md - Module structure
4. Zombie-Farm-PRD.md - Overall game context
5. GLOSSARY.md - Terminology

**Responsibilities:**
- Implement all combat-related features
- Battle state machine and flow
- Damage calculations and formulas
- Enemy AI and targeting
- Status effects and abilities
- Battle outcomes and rewards
- Integration with Farm module (zombie stats, permadeath)

**Workflow:**
1. **ALWAYS** consult DOMAIN-COMBAT.md as authoritative source
2. Receive test specifications from Test Agent
3. Implement features following TDD (tests first)
4. Follow ARCHITECTURE.md patterns (events, state machines)
5. Update DOMAIN-COMBAT.md if implementation reveals needed adjustments
6. Coordinate with Farm Agent for zombie data contracts

**Critical Rules:**
- Never implement features outside the combat domain (no farming logic)
- All mechanics must match DOMAIN-COMBAT.md exactly
- Use Phaser for 2D battle rendering
- Emit events for battle outcomes (XP, loot, casualties)
- Never write tests (Test Agent does that)

**Damage Formula Example:**
```typescript
// From DOMAIN-COMBAT.md
const baseDamage = attackerAttack - defenderDefense;
const finalDamage = Math.max(1, baseDamage); // Minimum 1 damage
// Apply type modifiers (holy 2x vs undead, etc.)
```

---

### For General-Purpose Agent (Explore)

**Primary Documents:**
1. CLAUDE.md - This file for orientation
2. All META/ documents as needed
3. Zombie-Farm-PRD.md for context

**Responsibilities:**
- Codebase exploration and analysis
- Finding files and patterns
- Answering questions about code
- Research and investigation

**Thoroughness Levels:**
- **Quick:** Basic searches, specific file patterns
- **Medium:** Moderate exploration, multiple locations
- **Very thorough:** Comprehensive analysis, all naming conventions

**Workflow:**
1. Start with CLAUDE.md to understand project
2. Use Glob for file pattern searches
3. Use Grep for code keyword searches
4. Read relevant documentation for context
5. Provide findings with file paths and line numbers

---

## Development Workflow

### Standard Feature Development Flow

```
1. PLAN (Architecture Agent if needed)
   ├─ Review PRD for requirements
   ├─ Check DOMAIN docs for rules
   └─ Design approach per ARCHITECTURE.md

2. TEST (Test Agent)
   ├─ Write failing tests per TESTING.md
   ├─ Cover normal, edge, and error cases
   └─ Verify tests fail correctly

3. IMPLEMENT (Domain Agent: Farm/Combat/UI)
   ├─ Follow domain rules exactly
   ├─ Use ARCHITECTURE.md patterns
   ├─ Write code to pass tests
   └─ Ensure no test failures

4. REFACTOR (Any Agent + Architecture)
   ├─ Improve code clarity
   ├─ Remove duplication
   └─ Verify tests still pass

5. DOCUMENT (Developer)
   ├─ Update DOMAIN docs if needed
   ├─ Add to GLOSSARY if new terms
   └─ Update ARCHITECTURE if structure changed

6. COMMIT (Developer)
   └─ Descriptive conventional commit message
```

### Example: Adding Zombie Feeding

```
1. Architecture Agent reviews DOMAIN-FARM.md
   → Feeding mechanics defined (resets decay, boosts happiness)

2. Test Agent writes tests:
   test("feeding zombie resets daily decay counter")
   test("feeding zombie increases happiness by 10%")
   test("feeding fails if no food in inventory")
   test("feeding already-fed zombie does nothing")

3. Farm Agent implements:
   - feedZombie(zombieId, foodItem) function
   - Checks inventory, validates zombie state
   - Resets decay counter, increases happiness
   - Emits zombie.fed event
   - Updates state

4. Tests pass → Refactor if needed

5. Update DOMAIN-FARM.md if implementation details differ

6. Commit: "feat(farm): implement zombie feeding mechanic"
```

---

## Document Hierarchy

### Authority Levels

**Level 1 - Product Authority:**
- Zombie-Farm-PRD.md
  - Defines WHAT the game is and should do
  - Final word on game design intent

**Level 2 - Domain Authority:**
- DOMAIN-FARM.md (for farm mechanics)
- DOMAIN-COMBAT.md (for combat mechanics)
  - Define HOW features work (rules, formulas, behaviors)
  - **Must match PRD**, but add implementation detail
  - Authority for their specific domains

**Level 3 - Technical Authority:**
- ARCHITECTURE.md (how system is structured)
- TESTING.md (how we test)
- WORKFLOW.md (how we work)
  - Define technical approach and standards
  - Support implementation of domain rules

**Level 4 - Reference:**
- GLOSSARY.md (definitions)
- UIUX.md (design patterns)
- Sunflowerland-ref/ (examples)
  - Support understanding and consistency

### Conflict Resolution

If documents conflict:
1. **PRD > DOMAIN docs** - Game design intent wins
2. **DOMAIN > CODE** - Specs win over implementation
3. **Update docs** - If implementation reveals better approach, update docs first
4. **Ask developer** - If genuine conflict, clarify with human

### Document Updates

**When to Update:**
- DOMAIN docs: When mechanics change or new features added
- ARCHITECTURE.md: When structure or patterns change
- TESTING.md: When testing approach changes
- GLOSSARY.md: When new terms introduced
- WORKFLOW.md: When process changes
- PRD: Rarely (usually only for major design pivots)

**Who Updates:**
- Solo Developer makes final edits
- Agents can propose updates
- Keep docs in sync with code

---

## Quick Start for New Agents

### First Time Working on Zombie Farm?

1. **Read this file** (CLAUDE.md) completely
2. **Skim Zombie-Farm-PRD.md** - understand the game
3. **Read ARCHITECTURE.md** - understand the codebase
4. **Read WORKFLOW.md** - understand the process
5. **Read TESTING.md** - understand testing standards
6. **Read GLOSSARY.md** - learn the terminology
7. **Read your domain doc:**
   - Farm Agent → DOMAIN-FARM.md
   - Combat Agent → DOMAIN-COMBAT.md
   - UI Agent → UIUX.md
   - Test Agent → All domain docs

### Before Starting Any Task:

1. ✓ Read task requirements
2. ✓ Check relevant domain doc for rules
3. ✓ Review ARCHITECTURE.md for patterns
4. ✓ Check GLOSSARY.md for terms
5. ✓ Follow WORKFLOW.md TDD process
6. ✓ Apply TESTING.md standards

### When Stuck:

1. Check CLAUDE.md for document pointers
2. Search GLOSSARY.md for term definitions
3. Review relevant DOMAIN doc for mechanics
4. Check Sunflowerland-ref/ for examples
5. Ask developer for clarification

---

## Version History

- **v1.0** (2025-11-12) - Initial creation
  - Complete documentation directory
  - Agent-specific usage guides
  - Workflow and hierarchy definitions

---

## Notes for Solo Developer

This document is designed to:
- Onboard new AI agents quickly
- Reduce redundant explanations
- Ensure consistent understanding across agents
- Provide clear authority hierarchy
- Support efficient TDD workflow

Keep this updated as:
- New documents are added
- Document purposes change
- Agent roles evolve
- Project structure shifts

---

**Remember:** This is a living document. Update it as the project evolves to keep all agents aligned and efficient.
