---
title: 'Combat Module TODO'
module: Combat (DOMAIN-COMBAT)
priority: High
last updated: 2025-11-12
---

# Combat Module Implementation TODO

This document tracks all tasks for implementing the Combat module following DOMAIN-COMBAT.md specifications. All tasks follow TDD methodology: tests first, then implementation.

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked/Needs attention

---

## Phase 1: Combat Foundation & Setup

### 1.1 Combat Types & Interfaces ✅ COMPLETE (2025-11-12)

- [x] Define combat types in `src/types/combat.ts`: (442 lines)
  - [x] Unit interface (zombie or enemy with stats, position, status)
  - [x] UnitStats (HP, Attack, Defense, Speed, Range, Accuracy, Evasion, CritRate, CritMultiplier)
  - [x] DamageType enum (Physical, Toxic, Fire, Dark, Explosive, Holy)
  - [x] StatusEffect enum (Poisoned, Burning, Stunned, Fear, Bleeding, Rooted, Slowed, Weakened, Strengthened, Shielded)
  - [x] EnemyType enum (Peasant, Soldier, Archer, Knight, Mage, Priest, Paladin, Champion, Boss)
  - [x] BattlePhase enum (Preparation, Active, Victory, Defeat, Retreat)
  - [x] TargetType enum (Single, AoE, Line, Cone, Self, AllEnemies, AllAllies)
  - [x] Ability interface (with targeting, cooldown, effects)
  - [x] BattleState interface (units, phase, wave, terrain, weather)
  - [x] BattleResult interface (victory status, survivors, casualties, rewards)
  - [x] CombatState interface (current battle, history, unlocked locations)
- [x] Define combat event types in `src/types/events.ts`
  - [x] CombatEvent discriminated union (BATTLE_STARTED, UNIT_ATTACKED, etc.)
  - [x] Type-safe event payloads for all combat actions
- [x] Combat configuration available in `src/lib/config/zombieFarmConfig.ts`
  - [x] All damage type multipliers defined
  - [x] Status effect durations and values
  - [x] Enemy type stats and abilities
  - [x] XP curves and reward tables

**Status:** COMPLETE - All combat types available for implementation
**Tests:** 72 type validation tests passing (part of Core Phase 3.1)

### 1.2 Combat Testing Setup ✅ COMPLETE (2025-11-13)

- [x] Create combat test utilities:
  - [x] Mock unit factory (zombies and enemies) - testHelpers.ts (103 tests)
  - [x] Battle simulator for testing - combatTestUtils.ts (38 tests)
  - [x] Damage calculator test helpers - damageTestUtils.ts (21 tests)
  - [x] Status effect helpers - statusEffectTestUtils.ts (15 tests)
- [x] Create test fixtures for common scenarios (integrated in fixtures.ts)
- [x] Set up fake timers for battle simulation (mockTimers from TEST module)

**Test Coverage:**
- 177 comprehensive combat helper tests passing
- testHelpers.ts: 103 tests (createMockZombie, createMockEnemy, createMockBattle, etc.)
- combatTestUtils.ts: 38 tests (simulateCombatRound, applyDamage, checkVictoryConditions, etc.)
- damageTestUtils.ts: 21 tests (calculateExpectedDamage, verifyDamageCalculation, etc.)
- statusEffectTestUtils.ts: 15 tests (applyStatusEffect, verifyStatusEffect, etc.)

**Deliverables:**
- Complete combat testing toolkit
- Integration with TEST module utilities
- Ready for Phase 2.1 (Battle Initialization)

---

## Phase 2: Battle Preparation & Deployment

### 2.1 Battle Initialization ✅ COMPLETE (2025-11-13)

- [x] Write tests for battle initialization:
  - [x] Test: Squad composition validation
  - [x] Test: Enemy composition loading
  - [x] Test: Battle state initialization
  - [x] Test: Unit positioning
  - [x] Test: Initial formations
  - [x] Test: Battle phase transitions

**Test Results:**
- 57 tests passing (unit + integration)
- Battle state machine working correctly
- Squad and enemy composition validated
- Positioning system operational

**Deliverables:**
- battleInitialization.ts implementation
- Full battle setup functionality
- Integration with game state

### 2.2 Target Selection System ✅ COMPLETE (2025-11-13)

- [x] Create `features/combat/services/targeting.ts`
  - [x] Implement range checking (calculateDistance, isInRange)
  - [x] Implement line of sight (hasLineOfSight)
  - [x] Implement findTargetsInRange with LOS validation
  - [x] Implement target prioritization (prioritizeTargets)
  - [x] Implement target selection (selectTarget)
  - [x] Implement re-targeting logic (shouldRetarget)
  - [x] Implement AoE targeting (getTargetsInRadius)
- [x] Create targeting.test.ts (37 comprehensive unit tests)
- [x] Create targeting.integration.test.ts (17 integration tests)

**Test Results:**
- 54 targeting tests passing (37 unit + 17 integration)
- Full targeting system operational
- All AI priority behaviors implemented
- LOS and range calculations working correctly

**Deliverables:**
- Complete targeting system with all algorithms
- AI target prioritization (CLOSEST, WEAKEST, HIGHEST_THREAT, LOWEST_ARMOR, SUPPORT, RANGED)
- Line of sight obstacle checking
- Re-targeting logic with thresholds
- AoE target selection for area attacks
- Ready for Phase 2.3 (Movement System)

### 2.3 Squad Selection - TEST PHASE ✅ COMPLETE (2025-11-13)

- [x] Write tests for squad deployment:
  - [x] Test: Squad size respects limit (3 early, 10+ late)
  - [x] Test: Only active farm zombies available
  - [x] Test: Deployment order affects formation
  - [x] Test: Cannot deploy same zombie twice
  - [x] Test: Squad composition tracked correctly
  - [x] Test: Command Center level affects squad size

**Test Results:**
- 45 deployment tests passing
- Full coverage of squad selection logic
- All edge cases and validation tested

### 2.4 Squad Selection - IMPLEMENTATION ✅ COMPLETE (2025-11-13)

- [x] Create `features/combat/services/deployment.ts`
  - [x] Implement squad size calculation (getMaxSquadSize)
  - [x] Create zombie availability filter (getAvailableZombies, isZombieAvailable)
  - [x] Implement deployment ordering (applyDeploymentOrder)
  - [x] Create squad validation (validateSquadComposition)
  - [x] Create squad statistics (calculateSquadStats)
  - [x] Add squad composition suggestions (suggestSquadComposition with strategies)
- [ ] Create squad selection UI (deferred to UI agent)
  - [ ] Show available zombies
  - [ ] Drag-and-drop or click to select
  - [ ] Show deployment slots
  - [ ] Display zombie stats preview

**Deliverables:**
- deployment.ts service (397 lines)
- 45 comprehensive tests passing
- Squad size calculation based on Command Center level (3-10 zombies)
- Zombie availability tracking (excludes dead, in-combat)
- Deployment order system with slot indices
- Squad composition validation (size, duplicates, availability)
- Squad statistics aggregation (HP, attack, defense, speed, composition)
- AI-powered squad suggestions (balanced, defensive, aggressive, fast strategies)
- Full integration with battleInitialization system

### 2.5 Enemy Composition - TEST & IMPLEMENTATION

- [ ] Test: Each location has defined enemy units
- [ ] Test: Enemy stats loaded correctly
- [ ] Test: Fortifications (walls, towers, traps) load
- [ ] Test: Enemy waves spawn correctly
- [ ] Implement enemy composition database
- [ ] Create fortification types
- [ ] Implement wave spawning system

---

## Phase 3: Core Battle Mechanics

### 3.1 Battle Initialization - TEST PHASE

- [ ] Write tests for battle start:
  - [ ] Test: Zombies spawn on left side
  - [ ] Test: Enemies spawn on right side
  - [ ] Test: Formation matches deployment order
  - [ ] Test: Initial positions set correctly
  - [ ] Test: Battle state initializes properly
  - [ ] Test: First wave enemies present

### 3.2 Battle State Machine - IMPLEMENTATION

- [ ] Create battle state machine (XState)
  - [ ] States: Preparation, Active, Victory, Defeat, Retreat
  - [ ] Transitions between states
  - [ ] Context: units, positions, timers
- [ ] Implement battle initialization
- [ ] Create battlefield coordinate system
- [ ] Set up unit spawning

### 3.3 Movement System - TEST PHASE

- [ ] Write tests for movement:
  - [ ] Test: Zombies advance rightward
  - [ ] Test: Enemies advance leftward (melee)
  - [ ] Test: Movement speed differs by unit type
  - [ ] Test: Units stop when in range of target
  - [ ] Test: Fast units (Runners) outpace slow (Brutes)
  - [ ] Test: Obstacles funnel units
  - [ ] Test: Formation changes based on movement

### 3.4 Movement System - IMPLEMENTATION

- [ ] Create `features/combat/lib/movement.ts`
  - [ ] Implement movement tick handler
  - [ ] Apply speed modifiers
  - [ ] Handle collision/stopping
  - [ ] Update positions each frame
- [ ] Integrate with Phaser physics (optional)
- [ ] Add movement animations

### 3.5 Targeting & Engagement - TEST PHASE

- [ ] Write tests for targeting:
  - [ ] Test: Melee units target nearest enemy
  - [ ] Test: Ranged units stop at max range
  - [ ] Test: Brutes prioritize front-line enemies
  - [ ] Test: Runners attempt to flank backline
  - [ ] Test: Ranged zombies target weak/low HP
  - [ ] Test: Enemies prioritize closest zombie
  - [ ] Test: Archers target low-armor zombies
  - [ ] Test: Priests heal allies or target high-threat

### 3.6 Targeting System - IMPLEMENTATION

- [ ] Create `features/combat/lib/targeting.ts`
  - [ ] Implement range checking
  - [ ] Create AI priority logic per unit type
  - [ ] Implement flanking behavior
  - [ ] Handle target switching
  - [ ] Create threat calculation
- [ ] Add targeting visual indicators

---

## Phase 4: Damage & Combat Resolution

### 4.1 Basic Damage Calculation - TEST PHASE

- [ ] Write tests for damage:
  - [ ] Test: Physical damage = Attack - Defense (min 1)
  - [ ] Test: Attack cooldown per unit type
  - [ ] Test: Damage reduces target HP
  - [ ] Test: HP at 0 = unit death
  - [ ] Test: Dead units removed from battle
  - [ ] Test: Surviving units retarget after kill

### 4.2 Damage System - IMPLEMENTATION

- [ ] Create `features/combat/lib/damage.ts`
  - [ ] Implement base damage formula
  - [ ] Apply attack cooldowns
  - [ ] Handle HP reduction
  - [ ] Implement unit death logic
  - [ ] Create damage events
- [ ] Add damage numbers display
- [ ] Create death animations

### 4.3 Damage Types - TEST PHASE

- [ ] Write tests for each damage type:
  - [ ] Test: Physical - reduced by armor
  - [ ] Test: Toxic - bypasses armor, applies Poison
  - [ ] Test: Fire - AoE damage, applies Burning, spreads
  - [ ] Test: Dark - ignores armor, causes Fear
  - [ ] Test: Explosive - AoE, damages all in radius
  - [ ] Test: Holy - double damage to undead, applies Stun
  - [ ] Test: Damage type resistances applied

### 4.4 Damage Types - IMPLEMENTATION

- [ ] Extend damage calculator for types
  - [ ] Physical damage modifier
  - [ ] Toxic damage (armor bypass)
  - [ ] Fire AoE and spread mechanics
  - [ ] Dark/Psychic damage
  - [ ] Explosive radius damage
  - [ ] Holy damage vs undead multiplier
- [ ] Add damage type visual effects
- [ ] Implement resistance system

---

## Phase 5: Status Effects

### 5.1 Status Effect Framework - TEST PHASE

- [ ] Write tests for status effects:
  - [ ] Test: Poisoned - continuous damage over time
  - [ ] Test: Burning - high DoT, spreads to adjacent
  - [ ] Test: Stunned - cannot move/attack for duration
  - [ ] Test: Fear - unit flees temporarily
  - [ ] Test: Bleeding - minor DoT
  - [ ] Test: Multiple status effects can stack
  - [ ] Test: Status duration tracked correctly
  - [ ] Test: Status can be cleansed/resisted

### 5.2 Status Effect System - IMPLEMENTATION

- [ ] Create `features/combat/lib/statusEffects.ts`
  - [ ] Implement status effect data structure
  - [ ] Create status application logic
  - [ ] Implement DoT tick system
  - [ ] Handle status duration countdown
  - [ ] Implement status removal
  - [ ] Add stacking rules
- [ ] Create status icons/indicators
- [ ] Add status visual effects (poison bubbles, fire, etc.)

### 5.3 Individual Status Effects - IMPLEMENTATION

- [ ] Implement Poisoned effect
  - [ ] DoT calculation (-2% HP/sec for 10 sec)
  - [ ] Stacking/refresh logic
  - [ ] Green bubbling visual
- [ ] Implement Burning effect
  - [ ] Higher DoT (-5% HP/sec for 5 sec)
  - [ ] Spread to adjacent units
  - [ ] Fire animation
- [ ] Implement Stunned effect
  - [ ] Disable movement/attacks for 2 sec
  - [ ] Stun stars visual
- [ ] Implement Fear effect
  - [ ] Unit runs away temporarily
  - [ ] Affects mostly human enemies
- [ ] Implement Bleeding effect
  - [ ] Minor DoT
  - [ ] Blood drip visual

---

## Phase 6: Special Abilities

### 6.1 Unit Abilities - TEST PHASE

- [ ] Write tests for special abilities:
  - [ ] Test: Zombie Brute smash AoE attack
  - [ ] Test: Paladin heal/shield ability
  - [ ] Test: Necromancer Zombie resurrect fallen ally
  - [ ] Test: Mage fireball ranged AoE
  - [ ] Test: Abilities trigger under conditions
  - [ ] Test: Abilities have cooldowns
  - [ ] Test: Abilities auto-cast (no player input)

### 6.2 Ability System - IMPLEMENTATION

- [ ] Create ability framework
  - [ ] Define ability interface
  - [ ] Implement ability trigger conditions
  - [ ] Create cooldown system
  - [ ] Implement ability effects
- [ ] Implement specific abilities:
  - [ ] Brute: Smash (AoE melee)
  - [ ] Paladin: Divine Shield (heal + buff)
  - [ ] Lich: Dark Bolt (ranged dark damage)
  - [ ] Mage: Fireball (ranged AoE fire)
  - [ ] Runner: Leap (gap closer)
- [ ] Add ability animations and effects

---

## Phase 7: Battle Outcomes

### 7.1 Victory Conditions - TEST PHASE

- [ ] Write tests for victory:
  - [ ] Test: Victory when all enemies defeated
  - [ ] Test: Objectives completed = victory
  - [ ] Test: Boss defeated = victory
  - [ ] Test: Surviving zombies tracked
  - [ ] Test: Survivors return to farm with current HP
  - [ ] Test: Loot area after victory

### 7.2 Victory System - IMPLEMENTATION

- [ ] Create victory condition checker
- [ ] Implement survivor tracking
- [ ] Create battle result summary
- [ ] Implement victory rewards calculation
- [ ] Create victory UI screen

### 7.3 Defeat Conditions - TEST PHASE

- [ ] Write tests for defeat:
  - [ ] Test: Defeat when all zombies destroyed
  - [ ] Test: Time limit defeat (if applicable)
  - [ ] Test: Destroyed zombies are permanently lost
  - [ ] Test: No loot on defeat
  - [ ] Test: Location remains unconquered

### 7.4 Defeat System - IMPLEMENTATION

- [ ] Create defeat condition checker
- [ ] Implement permadeath logic
- [ ] Track lost zombies
- [ ] Create defeat UI screen
- [ ] Add defeat consequences

### 7.5 Retreat Mechanic - TEST PHASE

- [ ] Write tests for retreat:
  - [ ] Test: Can retreat if any zombie alive
  - [ ] Test: 10-second countdown after retreat trigger
  - [ ] Test: Enemies attack during countdown
  - [ ] Test: Survivors escape after countdown
  - [ ] Test: Dead zombies during retreat are lost
  - [ ] Test: Retreat counts as defeat (no rewards)
  - [ ] Test: Cooldown or cost for reattempt

### 7.6 Retreat System - IMPLEMENTATION

- [ ] Implement retreat button/trigger
- [ ] Create retreat countdown timer
- [ ] Handle zombie survival during retreat
- [ ] Apply retreat penalties
- [ ] Create retreat UI feedback

---

## Phase 8: Post-Battle Systems

### 8.1 Experience & Leveling - TEST PHASE

- [ ] Write tests for XP:
  - [ ] Test: Survivors gain base XP for participation
  - [ ] Test: Bonus XP per kill
  - [ ] Test: Bonus XP for damage dealt
  - [ ] Test: Level-up increases stats
  - [ ] Test: XP processed after battle
  - [ ] Test: Dead zombies don't gain XP

### 8.2 XP System - IMPLEMENTATION

- [ ] Create `features/combat/lib/experience.ts`
  - [ ] Calculate XP earned
  - [ ] Apply XP to survivors
  - [ ] Implement level-up logic
  - [ ] Apply stat increases per level
- [ ] Create XP gain notifications
- [ ] Add level-up animations

### 8.3 Battle Rewards - TEST PHASE

- [ ] Write tests for rewards:
  - [ ] Test: Dark Coins reward per location
  - [ ] Test: Resource rewards based on location
  - [ ] Test: Bonus rewards for efficiency (no casualties)
  - [ ] Test: First-time victory yields special items
  - [ ] Test: Blueprint/seed unlocks on specific victories
  - [ ] Test: Soul Essence from boss fights
  - [ ] Test: Rewards added to inventory

### 8.4 Rewards System - IMPLEMENTATION

- [ ] Create rewards calculator
  - [ ] Base Dark Coins per location
  - [ ] Resource loot tables
  - [ ] Efficiency bonuses
  - [ ] First-time rewards
  - [ ] Special drops (seeds, blueprints)
- [ ] Implement reward distribution
- [ ] Create rewards summary UI

### 8.5 Post-Battle State - TEST PHASE

- [ ] Write tests for post-battle:
  - [ ] Test: Survivors return to farm
  - [ ] Test: HP carries over (not auto-healed)
  - [ ] Test: Dead zombies removed from farm state
  - [ ] Test: Location marked as conquered
  - [ ] Test: Unlocks triggered (new regions, shops)
  - [ ] Test: Cooldown for re-raiding location
  - [ ] Test: Farm morale affected (victory/defeat)

### 8.6 Post-Battle Integration - IMPLEMENTATION

- [ ] Update farm state with results
  - [ ] Return survivors with HP
  - [ ] Remove casualties permanently
  - [ ] Mark location conquered
- [ ] Implement conquest unlocks
- [ ] Add cooldown timers
- [ ] Create morale effects on farm
- [ ] Generate battle log/memorial

---

## Phase 9: Enemy AI & Behaviors

### 9.1 Enemy AI - TEST PHASE

- [ ] Write tests for enemy behaviors:
  - [ ] Test: Peasants attack nearest zombie
  - [ ] Test: Archers prioritize low-armor targets
  - [ ] Test: Knights hold front line
  - [ ] Test: Mages cast spells from backline
  - [ ] Test: Priests heal/support allies
  - [ ] Test: Paladins use abilities at low HP
  - [ ] Test: Boss units have unique patterns

### 9.2 Enemy AI - IMPLEMENTATION

- [ ] Create AI behavior system
  - [ ] Peasant AI (basic melee)
  - [ ] Archer AI (ranged, target selection)
  - [ ] Knight AI (defensive, hold line)
  - [ ] Mage AI (spell casting, positioning)
  - [ ] Priest AI (healing, buff priority)
  - [ ] Paladin AI (ability usage, tanking)
  - [ ] Boss AI (special patterns)
- [ ] Implement threat table
- [ ] Add AI decision-making logic

---

## Phase 10: Fortifications & Obstacles

### 10.1 Fortifications - TEST PHASE

- [ ] Write tests for fortifications:
  - [ ] Test: Gates block zombie advance
  - [ ] Test: Gates have high HP and armor
  - [ ] Test: Brutes deal extra damage to structures
  - [ ] Test: Walls provide cover to enemies
  - [ ] Test: Towers shoot zombies at range
  - [ ] Test: Destroying structure grants progress

### 10.2 Fortifications - IMPLEMENTATION

- [ ] Implement structure types:
  - [ ] Gate (blockage, high HP)
  - [ ] Wall (cover, HP)
  - [ ] Tower (ranged attack)
- [ ] Create structure targeting
- [ ] Add Brute bonus vs structures
- [ ] Implement structure destruction

### 10.3 Traps - TEST PHASE

- [ ] Write tests for traps:
  - [ ] Test: Spike pit triggers on proximity
  - [ ] Test: Trap deals instant damage/kill
  - [ ] Test: Trap bypasses armor
  - [ ] Test: Fire trap applies burning
  - [ ] Test: Traps are expended after trigger

### 10.4 Traps - IMPLEMENTATION

- [ ] Create trap system
  - [ ] Spike pit (instant damage)
  - [ ] Fire trap (burning AoE)
  - [ ] Other trap types
- [ ] Implement trigger detection
- [ ] Add trap visual warnings
- [ ] Create trap animations

---

## Phase 11: Battle Rendering (Phaser Integration)

### 11.1 Phaser Scene Setup

- [ ] Create combat Phaser scene
- [ ] Set up battlefield dimensions
- [ ] Implement camera controls
- [ ] Create background layers
- [ ] Add UI overlays

### 11.2 Unit Rendering

- [ ] Create sprite system for units
  - [ ] Zombie sprites per type
  - [ ] Enemy sprites per type
  - [ ] Animations (idle, walk, attack, death)
- [ ] Implement sprite pools for performance
- [ ] Add health bars above units
- [ ] Create unit selection/highlight

### 11.3 Effects Rendering

- [ ] Implement damage numbers
- [ ] Create projectile systems
  - [ ] Arrows (archers)
  - [ ] Fireballs (mages)
  - [ ] Acid spit (Spitters)
- [ ] Add status effect visuals
- [ ] Create AoE effect circles
- [ ] Implement death/destruction effects

### 11.4 UI Overlays

- [ ] Create battle HUD
  - [ ] Unit count display
  - [ ] Wave indicator
  - [ ] Timer (if applicable)
  - [ ] Retreat button
- [ ] Add battle controls (pause, speed)
- [ ] Create unit info panels
- [ ] Add combat log (optional)

---

## Phase 12: Advanced Combat Features

### 12.1 Multi-Wave Battles - TEST & IMPLEMENTATION

- [ ] Test: Waves spawn after timer
- [ ] Test: Waves spawn when previous defeated
- [ ] Test: Wave composition defined per location
- [ ] Implement wave spawning system
- [ ] Add wave announcements
- [ ] Create reinforcement mechanics

### 12.2 Boss Battles - TEST & IMPLEMENTATION

- [ ] Test: Boss units have enhanced stats
- [ ] Test: Boss has special abilities
- [ ] Test: Boss triggers phase changes
- [ ] Test: Boss victory yields rare rewards
- [ ] Implement boss mechanics
- [ ] Create boss-specific abilities
- [ ] Add boss health bar UI

### 12.3 Battle Modifiers

- [ ] Weather effects in combat
  - [ ] Blood Rain: zombies regen slowly
  - [ ] Fog: zombies faster, ranged less accurate
  - [ ] Sunshine: humans stronger, zombies weaker
  - [ ] Snow: all units slowed
- [ ] Time of day effects
  - [ ] Night: zombies +15% stats
  - [ ] Day: humans +10% morale
- [ ] Terrain modifiers (future)

---

## Phase 13: Combat UI/UX

### 13.1 Pre-Battle UI

- [ ] Create target selection screen
  - [ ] World map with locations
  - [ ] Location info panel
  - [ ] Enemy composition preview
  - [ ] Recommended level/difficulty
- [ ] Create squad selection screen
  - [ ] Available zombie list
  - [ ] Deployment slots
  - [ ] Formation preview
  - [ ] Stats comparison

### 13.2 Battle UI

- [ ] Create in-battle HUD
- [ ] Add pause/play controls
- [ ] Add speed controls (1x, 2x, 4x)
- [ ] Create unit selection info
- [ ] Add mini-map (optional)

### 13.3 Post-Battle UI

- [ ] Create victory screen
  - [ ] Rewards summary
  - [ ] XP gains per zombie
  - [ ] Casualties list
  - [ ] Continue/replay buttons
- [ ] Create defeat screen
  - [ ] Casualties memorial
  - [ ] Retry/return options
- [ ] Create retreat confirmation

---

## Phase 14: Integration & Polish

### 14.1 Combat-Farm Integration

- [ ] Test: Zombies sent to combat leave farm
- [ ] Test: Combat updates zombie stats on farm
- [ ] Test: Dead zombies removed from farm
- [ ] Test: XP reflected in farm zombie info
- [ ] Test: Rewards added to farm inventory
- [ ] Implement state synchronization
- [ ] Add event bridge between modules

### 14.2 Save/Load (Combat Data)

- [ ] Test: Battle state can be paused/saved
- [ ] Test: Can resume interrupted battles
- [ ] Test: Battle history persists
- [ ] Test: Location conquest status saves
- [ ] Implement combat save serialization
- [ ] Add battle resume logic

### 14.3 Performance Optimization

- [ ] Profile 10v10+ battles
- [ ] Optimize damage calculations
- [ ] Implement unit pooling
- [ ] Optimize rendering (Phaser)
- [ ] Add LOD for effects
- [ ] Reduce memory allocations in battle loop

### 14.4 Animations & Effects

- [ ] Attack animations per unit type
- [ ] Death animations
- [ ] Ability cast animations
- [ ] Victory/defeat cinematics
- [ ] Screen shake on big hits
- [ ] Slow-mo on critical moments

### 14.5 Audio

- [ ] Battle background music
- [ ] Attack sound effects
- [ ] Ability sounds
- [ ] Status effect sounds
- [ ] Victory/defeat music
- [ ] Ambient battle sounds

---

## Phase 15: Testing & Quality Assurance

### 15.1 Comprehensive Combat Testing

- [ ] Achieve 100% coverage for critical combat logic
- [ ] Achieve 80%+ overall combat module coverage
- [ ] Integration tests for full battle scenarios
  - [ ] Simple 3v3 battle
  - [ ] Multi-wave fortress siege
  - [ ] Boss battle
  - [ ] Retreat scenario
- [ ] Test all damage type combinations
- [ ] Test all status effect interactions
- [ ] Performance benchmarks

### 15.2 Balance Testing

- [ ] Test zombie vs enemy balance
- [ ] Ensure progression curve feels fair
- [ ] Verify no unbeatable encounters
- [ ] Test edge cases (all Runners vs all Archers, etc.)
- [ ] Validate reward scaling

### 15.3 Edge Cases & Error Handling

- [ ] Test: Invalid battle state recovery
- [ ] Test: Unit with 0 or negative stats
- [ ] Test: Extremely long battles (timeout?)
- [ ] Test: Rapid ability spam
- [ ] Add error boundaries
- [ ] Validate all battle inputs

### 15.4 Documentation

- [ ] Update DOMAIN-COMBAT.md if needed
- [ ] Document any balance changes
- [ ] Add inline comments for complex logic
- [ ] Create combat system overview doc
- [ ] Update GLOSSARY.md with combat terms

---

## Future Enhancements (Post-MVP)

- [ ] PvP or async multiplayer battles
- [ ] More enemy types and bosses
- [ ] Player-controlled abilities (manual mode)
- [ ] Formation presets
- [ ] Combat replays
- [ ] Achievements for combat feats
- [ ] Seasonal combat events
- [ ] Special battle modifiers/mutators
- [ ] Combo system bonuses
- [ ] Tactical pause with ability targeting

---

## Notes

- **Follow TDD strictly:** Write tests before implementation
- **Combat agent:** Use combat-mechanics-specialist agent for implementation
- **Test agent:** Use test-qa-guardian for test generation
- **Phaser integration:** Balance between Phaser and React logic
- **Incremental commits:** Commit after each phase
- **Documentation sync:** Update docs when needed
- **Dependency:** Requires Core systems (state machine, save/load)
- **Farm dependency:** Requires zombie data from Farm module

---

## Current Status

**Phase:** Phase 2.4 Complete ✅ (Squad Selection System)
**Next Task:** Phase 2.5 - Enemy Composition (or Phase 3.1 - Battle Initialization if squad UI deferred)
**Blockers:** None - All blockers resolved ✅

**Dependencies:**
- Core Phase 1-2 ✅ COMPLETE (infrastructure ready)
- Core Phase 3.1 ✅ COMPLETE (all type definitions available)
- Core Phase 3.2 ✅ COMPLETE (game configuration available)
- Core Phase 4 ✅ COMPLETE (event system operational)
- Farm Phase 1.3 ✅ COMPLETE (zombie type contracts available)

**Notes:**
- Core Phase 1-2 complete: project structure and dependencies ready ✅
- Testing infrastructure complete (test-qa-guardian) ✅
- Phaser 3 integrated and ready for combat rendering ✅
- LAYOUT-COMBAT.md created with comprehensive combat design ✅
- Sunflower Land reusable components identified in LAYOUT-COMBAT.md
- Phase 1.1 combat type definitions COMPLETE ✅ (2025-11-12)
- Phase 1.2 combat testing utilities COMPLETE ✅ (2025-11-13)
- Mock utilities available for testing (165 tests passing)
- Combat module can access zombie data via farm types
- Battle rendering system documented in LAYOUT-COMBAT.md
- **Phase 2.1 Battle Initialization COMPLETE ✅ (2025-11-13)**
  - 57 tests passing
  - Battle state machine working
  - Squad and enemy composition validated

**Recent Updates (2025-11-13):**
- Phase 2.1 (Battle Initialization) COMPLETE ✅
  - 57 comprehensive tests passing
  - battleInitialization.ts implementation complete
  - Full battle setup functionality working
  - Integration with game state operational
- Phase 1.2 (Combat Testing Setup) COMPLETE ✅
  - 177 comprehensive combat helper tests passing
  - testHelpers.ts: Mock unit factories (103 tests)
  - combatTestUtils.ts: Battle simulation utilities (38 tests)
  - damageTestUtils.ts: Damage calculation helpers (21 tests)
  - statusEffectTestUtils.ts: Status effect utilities (15 tests)
- Core Phase 4 (Event System) COMPLETE ✅
  - 43 tests passing
  - Event bus operational for combat module integration
- **Phase 2.2 Target Selection System COMPLETE ✅ (2025-11-13)**
  - 54 targeting tests passing (37 unit + 17 integration)
  - targeting.ts service implementation complete
  - All AI priority behaviors operational
  - LOS and range calculations working
- **Phase 2.3-2.4 Squad Selection System COMPLETE ✅ (2025-11-13)**
  - 45 deployment tests passing
  - deployment.ts service implementation complete (397 lines)
  - Squad size calculation (3-10 based on Command Center level)
  - Zombie availability filtering (excludes dead, in-combat)
  - Deployment order system with slot indices
  - Squad validation (size, duplicates, availability)
  - Squad statistics aggregation
  - AI-powered squad suggestions (4 strategies)
- **1000+ total tests passing across project**
  - CORE: 125 tests (state machine + event system + save system)
  - TEST: 428 tests (factories, fixtures, matchers)
  - FARM: 145 tests (54 planting + 38 growth + 53 harvesting) ✅
  - COMBAT: 333 tests (177 helpers + 57 battle init + 54 targeting + 45 deployment) ✅
  - UI/UX: 62 tests (component library)

**Previous Updates (2025-11-12):**
- Core Phase 3.1 (Global Type Definitions) COMPLETE ✅
  - All combat types defined in src/types/combat.ts (442 lines)
  - Unit, BattleState, BattleResult, Ability interfaces complete
  - DamageType, StatusEffect, EnemyType, BattlePhase enums defined
  - CombatEvent discriminated unions for type-safe events
  - 72 type validation tests passing
- Core Phase 3.2 (Game Configuration) COMPLETE ✅
  - All damage type multipliers defined and validated
  - All status effect definitions available
  - All enemy types defined
  - Combat balance values available
  - 46 config validation tests passing
- Test Phase 2 (Test Utilities) COMPLETE ✅
  - 428/432 tests passing (99.07%)
  - All factories, fixtures, mocks, and matchers production-ready
