---
title: 'Combat System Layout & Mechanisms'
last updated: 2025-11-12
author: Combat Mechanics Specialist (AI Agent)
version: 1.0
---

# Combat System Layout & Mechanisms

This document provides a comprehensive technical specification for the combat system's visual layout, UI components, state flow, and implementation details. It serves as the authoritative reference for implementing the castle siege auto-battler combat in Zombie Farm.

**Related Documents:**

- `/META/DOMAIN-COMBAT.md` - Combat mechanics and rules (authoritative for game logic)
- `/META/ARCHITECTURE.md` - System architecture patterns
- `/Zombie-Farm-PRD.md` - Game design vision

---

## Table of Contents

1. [Combat Visual Layout](#1-combat-visual-layout)
2. [Pre-Battle Screen Layout](#2-pre-battle-screen-layout)
3. [Battle Screen Layout](#3-battle-screen-layout)
4. [Combat Flow Mechanics](#4-combat-flow-mechanics)
5. [Unit Rendering & Animation](#5-unit-rendering--animation)
6. [Damage Type Visual Effects](#6-damage-type-visual-effects)
7. [Status Effect Indicators](#7-status-effect-indicators)
8. [Fortification Layout](#8-fortification-layout)
9. [Victory/Defeat Screens](#9-victorydefeat-screens)
10. [UI Component Hierarchy](#10-ui-component-hierarchy)
11. [State Flow](#11-state-flow)
12. [Phaser Scene Structure](#12-phaser-scene-structure)
13. [Performance Considerations](#13-performance-considerations)
14. [Integration with Farm & Core](#14-integration-with-farm--core)
15. [Technical Implementation Notes](#15-technical-implementation-notes)

---

## 1. Combat Visual Layout

### 1.1 Battlefield Design

**Canvas Dimensions:**

- **Base Resolution:** 1920x1080 (scalable/responsive)
- **Aspect Ratio:** 16:9 (maintains ratio on different screens)
- **Minimum Safe Area:** 1280x720 (for smaller displays)

**Battlefield Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                          BATTLEFIELD                             │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ Left Side          Middle Zone          Right Side        ║  │
│  ║ (Zombie Spawn)    (Combat Zone)        (Enemy Spawn)      ║  │
│  ║                                                            ║  │
│  ║    🧟               ⚔️                    🏰              ║  │
│  ║   Zombies      Active Combat           Enemies           ║  │
│  ║  (Player)      (400px width)          (Defenders)        ║  │
│  ║                                                            ║  │
│  ║  Spawn X=50    Engagement: X=200-1700   Spawn X=1850     ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────┘
```

**Zone Breakdown:**

- **Left Spawn Zone (0-200px):** Zombie units spawn here, organize formation
- **Combat Zone (200-1700px):** Active battle, movement, engagements
- **Right Spawn Zone (1700-1920px):** Enemy units, fortifications, objectives
- **Sky/Background Layer:** Parallax scrolling background (dark sky, dead trees)
- **Ground Layer:** Battle terrain (cracked earth, bones, blood)

**Visual Theme:**

- Dark, gothic aesthetic with undead/horror elements
- Blood-stained battlefield
- Moonlit or twilight sky
- Ruined structures and debris
- Color palette: dark grays, browns, blood reds, sickly greens, bone whites

### 1.2 Lanes & Positioning

**Lane System: SINGLE LANE (Side-Scrolling)**

- All units operate on a single horizontal plane (Y-axis fixed per unit type)
- Ground melee units: Y=600-800 (on the ground)
- Ranged units (standing back): Y=650 (slightly elevated visual perspective)
- Flying units (if implemented): Y=300-500 (above ground layer)
- Z-index sorting: Units with lower Y values render behind units with higher Y

**Positioning System:**

- **Coordinate-Based:** Units have (X, Y) positions in pixels
- **Collision Detection:** Circular hitboxes for melee range checks
- **Grid Overlay (Optional):** Invisible 64x64px grid for AI pathfinding

**Movement Rules:**

- Zombies move RIGHT (toward enemies)
- Enemies move LEFT (toward zombies) or hold position
- Units stop when target is in attack range
- Collisions cause units to stop/queue behind each other

---

## 2. Pre-Battle Screen Layout

### 2.1 Target Selection Screen

**Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│                        TARGET SELECTION                         │
│  ┌────────────────────┬─────────────────────────────────────┐  │
│  │                    │  LOCATION INFO PANEL                │  │
│  │                    │  ┌───────────────────────────────┐  │  │
│  │     WORLD MAP      │  │ Forsaken Village              │  │  │
│  │   (Clickable       │  │ Difficulty: ⭐⭐ (Easy)      │  │  │
│  │    Locations)      │  │ Recommended Level: 3-5        │  │  │
│  │                    │  │                               │  │  │
│  │   🗺️ Interactive   │  │ Enemy Preview:                │  │  │
│  │   Nodes showing    │  │ - 8x Peasants                 │  │  │
│  │   conquered vs     │  │ - 4x Archers                  │  │  │
│  │   available raids  │  │ - 1x Village Elder (Boss)     │  │  │
│  │                    │  │                               │  │  │
│  │   [✅ Conquered]   │  │ Fortifications:               │  │  │
│  │   [🔓 Available]   │  │ - Wooden Barricade (HP: 200)  │  │  │
│  │   [🔒 Locked]      │  │ - Watchtower (2 Archers)      │  │  │
│  │                    │  │                               │  │  │
│  │                    │  │ Rewards on Victory:           │  │  │
│  │                    │  │ - 75-100 Dark Coins           │  │  │
│  │                    │  │ - 50 Rotten Wood              │  │  │
│  │                    │  │ - 20 Bones                    │  │  │
│  │                    │  │                               │  │  │
│  │                    │  └───────────────────────────────┘  │  │
│  │                    │  [ATTACK] [BACK TO FARM]          │  │
│  └────────────────────┴─────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Components:**

- **World Map (Left Panel 60%):**
  - React component rendering Phaser map or static SVG
  - Clickable location nodes
  - Visual connection lines showing progression path
  - Hover tooltips with basic info

- **Location Info Panel (Right Panel 40%):**
  - Selected location name and icon
  - Difficulty rating (stars/skulls)
  - Recommended level range
  - Enemy composition list with icons
  - Fortifications preview
  - Rewards breakdown
  - Action buttons

**Interaction Flow:**

1. Player clicks location on map
2. Info panel updates with location details
3. Player reviews enemy composition and rewards
4. Player clicks [ATTACK] to proceed to Squad Selection

### 2.2 Squad Selection Screen

**Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│                       SQUAD SELECTION                           │
│  ┌──────────────────────────┬─────────────────────────────┐    │
│  │  AVAILABLE ZOMBIES       │   DEPLOYMENT SLOTS          │    │
│  │  ┌────────────────────┐  │   ┌────┬────┬────┬────┐    │    │
│  │  │ 🧟 Shambler Lvl 3 │  │   │ 1  │ 2  │ 3  │ 4  │    │    │
│  │  │ HP: 120/120       │  │   │🧟  │🏃  │💪  │🤮  │    │    │
│  │  │ ATK: 15  DEF: 8   │  │   └────┴────┴────┴────┘    │    │
│  │  └────────────────────┘  │   Slot 5-10 (Locked)       │    │
│  │                          │                             │    │
│  │  🧟 Shambler Lvl 5       │   Formation Preview:        │    │
│  │  🏃 Runner Lvl 4         │   [Visual representation    │    │
│  │  💪 Brute Lvl 3          │    showing deployment       │    │
│  │  🤮 Spitter Lvl 2        │    order left-to-right]     │    │
│  │  🧟 Shambler Lvl 2       │                             │    │
│  │  🏃 Runner Lvl 3         │   Squad Stats:              │    │
│  │  ... (scrollable)        │   Total HP: 520             │    │
│  │                          │   Avg ATK: 18               │    │
│  │  [Filters: Type/Level]   │   Avg DEF: 10               │    │
│  │  [Sort: Level/HP/Name]   │   Avg Speed: 3.5            │    │
│  └──────────────────────────┴─────────────────────────────┘    │
│                                                                 │
│  [BACK] [CLEAR SQUAD] [AUTO-FILL] [READY FOR BATTLE]           │
└────────────────────────────────────────────────────────────────┘
```

**Components:**

**Left Panel - Available Zombies (50%):**

- Scrollable list of all active zombies on farm
- Each zombie card shows:
  - Type icon and name
  - Current level
  - HP (current/max)
  - Primary stats (ATK, DEF, SPD)
  - Status indicators (injured, low happiness)
- Filters: Type dropdown (All, Shambler, Runner, etc.)
- Sort: Level, HP, Name, Type
- Click or drag zombie to add to deployment slots

**Right Panel - Deployment Slots (50%):**

- **Deployment Slots:** 3-10+ slots depending on player progression
  - Early game: 3 slots
  - Mid game: 5-7 slots
  - Late game: 10+ slots
  - Locked slots shown grayed out
- Each slot shows:
  - Zombie icon and name
  - Quick stats
  - Remove button (X)
- **Formation Preview:** Visual representation showing spawn positions
- **Squad Stats Summary:**
  - Total combined HP
  - Average ATK/DEF/Speed
  - Type composition (e.g., "2 Melee, 2 Ranged")

**Interaction Flow:**

1. Click zombie from left list to add to first empty slot
2. Drag and drop to reorder slots (changes spawn order)
3. Click X on slot to remove zombie
4. [AUTO-FILL] button: AI suggests optimal squad based on enemy composition
5. [CLEAR SQUAD] button: Remove all zombies from slots
6. [READY FOR BATTLE] button: Validates squad (at least 1 zombie), starts battle

**Validation:**

- Must have at least 1 zombie in squad
- Cannot deploy same zombie twice
- Cannot deploy zombies already in other activities (though typically only active zombies shown)

---

## 3. Battle Screen Layout

### 3.1 Main Battlefield (Phaser Canvas)

**Full-Screen Phaser Canvas:**

- Renders at 1920x1080 base resolution
- Scales responsively to fit viewport
- Maintains 16:9 aspect ratio
- Letterbox or pillarbox if needed

**Visual Layers (Z-index order, bottom to top):**

1. **Background Layer (Z=0):** Static or parallax scrolling background
2. **Ground Layer (Z=10):** Terrain, blood stains, bones
3. **Shadow Layer (Z=20):** Unit shadows beneath sprites
4. **Fortification Layer (Z=30):** Walls, gates, towers (back structures)
5. **Unit Layer - Back Row (Z=40):** Units with lower Y positions
6. **Unit Layer - Front Row (Z=50):** Units with higher Y positions
7. **Projectile Layer (Z=60):** Arrows, spells, ranged attacks
8. **Effect Layer (Z=70):** Explosions, fire, poison clouds
9. **UI Layer - Phaser (Z=80):** Health bars, damage numbers (rendered in Phaser)
10. **Foreground Layer (Z=90):** Particles, screen effects

**Unit Rendering:**

- Units rendered as animated sprites
- Health bars above each unit (green/yellow/red gradient)
- Status effect icons above health bars
- Floating combat text (damage numbers, "MISS", "CRIT")

### 3.2 Battle HUD (React Overlay)

**HUD Components (React components overlaid on Phaser canvas):**

```
┌────────────────────────────────────────────────────────────────┐
│  Wave 1/3        FORSAKEN VILLAGE         🧟: 5    👤: 8      │
│  ─────────                                                      │
│                                                                 │
│                                                                 │
│                    [PHASER BATTLEFIELD]                         │
│                                                                 │
│                                                                 │
│                                                                 │
│  ⏸️ PAUSE    🎵 SOUND: ON         ⏩ Speed: 2x    🏳️ RETREAT   │
└────────────────────────────────────────────────────────────────┘
```

**HUD Element Details:**

**Top Bar (Full Width):**

- **Top Left:**
  - Wave indicator: "Wave 1/3" with progress bar
  - Battle timer (optional): "02:35" elapsed

- **Top Center:**
  - Location name: "FORSAKEN VILLAGE"
  - Battle status messages: "Reinforcements arriving!", "Victory!"

- **Top Right:**
  - Zombie count: 🧟: 5 (alive zombies)
  - Enemy count: 👤: 8 (alive enemies)
  - Casualty counter (optional): ☠️: 2 (zombies lost)

**Bottom Bar (Full Width):**

- **Bottom Left:**
  - Pause button: ⏸️ PAUSE (opens pause menu)
  - Sound toggle: 🎵 SOUND: ON/OFF

- **Bottom Center:**
  - Battle log (optional): Scrolling text of recent events
    - "Brute destroyed Gate!"
    - "Runner took 45 damage from Archer!"

- **Bottom Right:**
  - Speed controls: 1x, 2x, 4x buttons (highlighted current speed)
  - Retreat button: 🏳️ RETREAT (red, requires confirmation)

**Side Panel - Unit Info (Toggleable, Right Side):**

```
┌─────────────────────────┐
│  SELECTED UNIT          │
│  ─────────────────────  │
│  🧟 Brute "Crusher"     │
│  Level 5                │
│                         │
│  HP: ███████░░░ 180/250 │
│  ATK: 45  DEF: 25       │
│  SPD: 1.5               │
│                         │
│  Status Effects:        │
│  🔥 Burning (3s)        │
│  💪 Enraged (+50% ATK)  │
│                         │
│  Abilities:             │
│  💥 Smash (Ready)       │
│  🛡️ Thick Skin (Passive)│
│                         │
│  [CLOSE]                │
└─────────────────────────┘
```

- Only appears when unit is clicked
- Shows detailed stats and status
- Ability cooldown indicators

### 3.3 Battle Status Messages

**Center Screen Overlays (React Toast/Modal):**

- **Wave Start:** "Wave 2 Incoming!" (large text, 2 seconds)
- **Boss Appearance:** "PALADIN EMERGED!" (dramatic text with boss portrait)
- **Special Events:** "Your Brute destroyed the Gate!" (achievement-style)
- **Battle End:** "VICTORY!" or "DEFEAT" (large banner)

**Message Queue System:**

- Messages appear in center-top
- Fade in, display 2-3 seconds, fade out
- Queue multiple messages if simultaneous events
- Critical messages (boss spawn) interrupt queue

---

## 4. Combat Flow Mechanics

### 4.1 Phase 1: Battle Initialization

**Sequence:**

```
1. Load Battle Data
   ├─ Load enemy composition from location config
   ├─ Load zombie squad from selected units
   ├─ Load fortifications and objectives
   └─ Initialize battle state machine

2. Transition to BattleScene (Phaser)
   ├─ Fade out pre-battle UI
   ├─ Load battlefield background for location
   ├─ Initialize Phaser scene with layers
   └─ Set camera position

3. Spawn Units (Animation Sequence)
   ├─ ZOMBIES (Left Side):
   │  ├─ Spawn slot 1 zombie at X=50, Y=700 with fade-in
   │  ├─ After 0.3s, spawn slot 2 zombie at X=50, Y=700
   │  ├─ Continue for all zombies in deployment order
   │  └─ Units walk to formation positions (spread out)
   │
   └─ ENEMIES (Right Side):
      ├─ Spawn enemies based on composition
      ├─ Front-line units (peasants, soldiers) at X=1600
      ├─ Ranged units (archers) at X=1700
      ├─ Boss/Elite units at X=1750
      └─ Fortifications pre-placed at fixed positions

4. Camera Pan & Intro
   ├─ Camera pans from left (zombies) to right (enemies)
   ├─ Briefly show entire battlefield (2 seconds)
   ├─ Display location name banner: "FORSAKEN VILLAGE"
   └─ Return camera to center view

5. Battle Start
   ├─ Display "BATTLE START!" message (1 second)
   ├─ Enable unit AI and movement
   ├─ Start combat loop
   └─ Transition to Active Combat Phase
```

**Spawn Positions:**

- **Zombies:** All spawn at X=50 (left edge), staggered by 0.3s intervals
- **Formation Spacing:** After spawn, units spread to maintain 100px horizontal spacing
- **Enemies:** Pre-positioned based on type and role
  - Melee (front): X=1400-1500
  - Ranged (back): X=1600-1700
  - Boss: X=1750 (behind all)

**Initialization Data Contracts:**

```typescript
interface BattleInitData {
  location: {
    id: string;
    name: string;
    backgroundImage: string;
    difficulty: number;
  };
  zombieSquad: ZombieUnit[]; // From farm state
  enemyComposition: EnemyUnit[];
  fortifications: Fortification[];
  waves: WaveConfig[];
  rewards: RewardConfig;
}
```

### 4.2 Phase 2: Active Combat Loop

**Game Loop (60 FPS, ~16ms per frame):**

```
function battleLoop(deltaTime: number) {
  // 1. INPUT PHASE (handled by HUD, not units)
  handlePlayerInput(); // Pause, speed change, retreat

  // 2. AI & MOVEMENT PHASE
  for (const unit of allUnits) {
    if (!unit.isStunned) {
      updateUnitAI(unit, deltaTime);
      moveUnit(unit, deltaTime);
    }
  }

  // 3. ENGAGEMENT PHASE
  for (const unit of allUnits) {
    if (unit.isAlive && !unit.isStunned) {
      const target = findTarget(unit);
      if (target && isInRange(unit, target)) {
        if (unit.attackCooldown <= 0) {
          executeAttack(unit, target);
          unit.attackCooldown = unit.attackSpeed;
        }
      }
    }
  }

  // 4. ABILITY PHASE
  for (const unit of allUnits) {
    if (unit.hasAbility && unit.abilityCooldown <= 0) {
      if (shouldUseAbility(unit)) {
        activateAbility(unit);
      }
    }
  }

  // 5. STATUS EFFECT TICK
  updateStatusEffects(deltaTime);
  applyDamageOverTime(deltaTime);

  // 6. COOLDOWN UPDATES
  for (const unit of allUnits) {
    unit.attackCooldown -= deltaTime;
    unit.abilityCooldown -= deltaTime;
  }

  // 7. DEATH CHECK
  for (const unit of allUnits) {
    if (unit.hp <= 0 && !unit.isDead) {
      killUnit(unit);
      removeFromBattle(unit);
    }
  }

  // 8. WAVE SPAWN CHECK
  if (shouldSpawnNextWave()) {
    spawnWave(nextWaveIndex);
  }

  // 9. VICTORY/DEFEAT CHECK
  if (allEnemiesDead()) {
    transitionToVictory();
  } else if (allZombiesDead()) {
    transitionToDefeat();
  }

  // 10. RENDER UPDATE
  updateAnimations(deltaTime);
  updateHealthBars();
  updateEffects(deltaTime);
}
```

**AI Decision Making (Per Unit):**

```typescript
function updateUnitAI(unit: Unit, deltaTime: number) {
  switch (unit.state) {
    case 'idle':
      // No target, advance forward
      unit.state = 'advancing';
      break;

    case 'advancing':
      // Move toward enemy side
      moveToward(unit, enemyDirection);

      // Check for targets in range
      const target = findTarget(unit);
      if (target && isInRange(unit, target)) {
        unit.state = 'engaging';
        unit.currentTarget = target;
      }
      break;

    case 'engaging':
      // Face target and attack
      if (!unit.currentTarget.isAlive) {
        // Target died, find new target
        unit.state = 'advancing';
        unit.currentTarget = null;
      } else if (!isInRange(unit, unit.currentTarget)) {
        // Target moved out of range
        moveToward(unit, unit.currentTarget.position);
      } else {
        // In range, attacking handled in engagement phase
        faceTarget(unit, unit.currentTarget);
      }
      break;

    case 'retreating':
      // Move away from combat (fear status)
      moveToward(unit, retreatDirection);
      // Status effect manager will restore to 'idle' when fear expires
      break;
  }
}
```

**Targeting Priorities:**

```typescript
function findTarget(unit: Unit): Unit | null {
  const enemies = getEnemiesInRange(unit);
  if (enemies.length === 0) return null;

  // Apply unit-specific targeting logic
  switch (unit.aiProfile) {
    case 'aggressive': // Brutes, Shamblers
      // Target nearest enemy
      return enemies.sort((a, b) => distance(unit, a) - distance(unit, b))[0];

    case 'flanker': // Runners
      // Target backline (archers, mages)
      const backline = enemies.filter((e) => e.isRanged);
      if (backline.length > 0) {
        return backline.sort((a, b) => distance(unit, a) - distance(unit, b))[0];
      }
      return enemies[0]; // Fallback to nearest

    case 'ranged': // Spitters
      // Target weakest (lowest HP%)
      return enemies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

    case 'support': // Liches, Necromancers
      // Target strongest enemy (highest ATK) to debuff
      return enemies.sort((a, b) => b.attack - a.attack)[0];

    default:
      return enemies[0];
  }
}
```

### 4.3 Phase 3: Battle Resolution

**Victory Sequence:**

```
1. All Enemies Eliminated
   ├─ Pause combat loop
   ├─ Play victory sound/music
   └─ Trigger victory animation

2. Victory Animation (3 seconds)
   ├─ Remaining zombies play "cheer" animation
   ├─ Camera slow-motion pan over battlefield
   ├─ Particle effects (dark energy rising)
   └─ Display "VICTORY!" banner

3. Calculate Results
   ├─ XP gains per surviving zombie
   ├─ Loot calculation (coins, resources, special items)
   ├─ Casualties list (zombies that died)
   └─ Location conquest flag

4. Transition to Victory Screen
   └─ Fade to Victory Screen UI (React)
```

**Defeat Sequence:**

```
1. All Zombies Eliminated
   ├─ Pause combat loop
   ├─ Play defeat sound
   └─ Camera shows last zombie falling

2. Defeat Animation (2 seconds)
   ├─ Camera slow zoom on fallen zombies
   ├─ Screen desaturates (gray filter)
   └─ Display "DEFEAT" banner

3. Calculate Casualties
   ├─ All deployed zombies are dead (permadeath)
   └─ No rewards earned

4. Transition to Defeat Screen
   └─ Fade to Defeat Screen UI (React)
```

**Retreat Sequence:**

```
1. Player Triggers Retreat
   ├─ Confirmation dialog: "Retreat? (10s countdown)"
   └─ If confirmed, start countdown

2. Retreat Countdown (10 seconds)
   ├─ Display countdown timer in center
   ├─ Combat continues (enemies still attack)
   ├─ Zombies start moving left (toward escape)
   └─ Any zombies killed during countdown are lost

3. Retreat Complete
   ├─ Battle ends when countdown hits 0
   ├─ All surviving zombies saved
   ├─ Display "RETREATED" banner
   └─ No rewards

4. Transition to Retreat Screen
   └─ Fade to Retreat Screen UI (React)
```

---

## 5. Unit Rendering & Animation

### 5.1 Zombie Unit Sprites

**Sprite Specifications:**

- **Sprite Size:** 64x64px base (some larger units 96x96px or 128x128px)
- **Frame Rate:** 8-12 FPS for animations (pixel art style)
- **Sprite Sheet Layout:** Horizontal strip or grid layout

**Zombie Types & Animation States:**

**1. Shambler (Basic Melee)**

- **Idle:** 4 frames, slow breathing
- **Walk:** 6 frames, slow shuffle (1.5 units/sec)
- **Attack:** 8 frames, bite lunge animation
- **Hit:** 2 frames, flinch backward
- **Death:** 8 frames, collapse to ground, fade out
- **Special:** None

**2. Runner (Fast Melee)**

- **Idle:** 4 frames, agitated stance
- **Run:** 8 frames, fast sprint (4 units/sec)
- **Attack:** 6 frames, claw swipe
- **Hit:** 2 frames, slight stumble
- **Death:** 6 frames, tumble forward
- **Special:** Dash animation (streak effect)

**3. Brute (Tank Melee)**

- **Idle:** 4 frames, heavy breathing, ground shakes subtly
- **Walk:** 6 frames, slow stomp (1 unit/sec), screen shake on steps
- **Attack:** 10 frames, heavy overhead smash
- **Hit:** 3 frames, minimal flinch (tough)
- **Death:** 10 frames, slow fall, crater on impact
- **Special:** Smash AoE (ground pound, shockwave rings)

**4. Spitter (Ranged Toxic)**

- **Idle:** 4 frames, throat bulges
- **Walk:** 6 frames, normal shamble (2 units/sec)
- **Attack:** 8 frames, throat expands, spits projectile
- **Hit:** 2 frames, recoil
- **Death:** 8 frames, explodes in toxic burst
- **Special:** Acid spit projectile animation

**5. Ghoul (Elite Melee)**

- **Idle:** 6 frames, crouched predatory stance
- **Run:** 8 frames, quadruped run (3.5 units/sec)
- **Attack:** 8 frames, vicious multi-hit combo
- **Hit:** 2 frames, quick recovery
- **Death:** 8 frames, dissolves into dark mist
- **Special:** Pounce animation (leap forward)

**6. Lich (Ranged Magic/Support)**

- **Idle:** 6 frames, floating hover, staff glows
- **Walk:** 6 frames, gliding float (2 units/sec)
- **Attack:** 10 frames, staff raises, dark beam fires
- **Hit:** 3 frames, barrier flickers
- **Death:** 12 frames, dramatic explosion, soul escapes
- **Special:** Curse AoE (purple wave emanates), Resurrection (summons skeleton)

### 5.2 Enemy Unit Sprites

**Enemy Types & Animations:**

**1. Peasant (Weak Melee)**

- **Idle:** 4 frames, nervous stance, pitchfork
- **Walk:** 6 frames, cautious advance
- **Attack:** 6 frames, pitchfork jab
- **Hit:** 2 frames, flinch
- **Death:** 6 frames, falls backward
- **Special:** Flee animation (drops weapon, runs)

**2. Soldier (Standard Melee)**

- **Idle:** 4 frames, ready stance, sword/shield
- **Walk:** 6 frames, marching
- **Attack:** 8 frames, sword slash
- **Hit:** 2 frames, shield block or flinch
- **Death:** 8 frames, sword clatters, falls
- **Special:** Shield block (deflects attack)

**3. Archer (Ranged Physical)**

- **Idle:** 4 frames, bow ready
- **Walk:** 6 frames, side-step (maintains distance)
- **Attack:** 8 frames, draw bow, release arrow
- **Hit:** 2 frames, stumble
- **Death:** 6 frames, drops bow, falls
- **Special:** Rapid fire (3 quick arrows)

**4. Knight (Heavy Melee)**

- **Idle:** 4 frames, armored stance, greatsword
- **Walk:** 6 frames, heavy march
- **Attack:** 10 frames, powerful overhead strike
- **Hit:** 1 frame, armor absorbs (minimal reaction)
- **Death:** 10 frames, armor clatters, slow fall
- **Special:** Shield bash (stuns target)

**5. Mage (Ranged Magic)**

- **Idle:** 6 frames, staff glows, robes flow
- **Walk:** 6 frames, staff in hand
- **Attack:** 12 frames, staff raised, fireball cast
- **Hit:** 3 frames, barrier flickers
- **Death:** 8 frames, robes collapse, staff falls
- **Special:** Fireball (AoE explosion on impact)

**6. Priest (Support/Holy)**

- **Idle:** 6 frames, praying, holy glow
- **Walk:** 6 frames, staff tapping
- **Attack:** 10 frames, holy symbol raised, light beam
- **Hit:** 2 frames, divine shield absorbs
- **Death:** 10 frames, ascends (soul rises, body fades)
- **Special:** Heal (green light on ally), Smite (holy explosion)

**7. Paladin (Boss - Heavy Melee/Holy)**

- **Idle:** 8 frames, radiant armor, divine aura
- **Walk:** 8 frames, confident stride
- **Attack:** 12 frames, divine sword combo
- **Hit:** 2 frames, barely flinches (armored + divine)
- **Death:** 16 frames, armor shatters, divine ascension
- **Special:** Divine Strike (golden shockwave), Guardian Angel (revive at 50% HP once)

### 5.3 Animation State Machine

**Per-Unit Animation Controller:**

```typescript
class UnitAnimator {
  currentAnimation: string;
  sprite: Phaser.Sprite;

  setState(newState: string) {
    if (this.currentAnimation === newState) return;

    // Transition logic
    switch (newState) {
      case 'idle':
        this.sprite.play('idle', true); // Loop
        break;
      case 'walk':
        this.sprite.play('walk', true); // Loop
        break;
      case 'attack':
        this.sprite.play('attack', false); // Once
        this.sprite.once('animationcomplete', () => {
          this.setState('idle'); // Return to idle after attack
        });
        break;
      case 'hit':
        // Interrupt current animation briefly
        this.sprite.play('hit', false);
        this.sprite.once('animationcomplete', () => {
          this.setState('idle');
        });
        break;
      case 'death':
        this.sprite.play('death', false);
        this.sprite.once('animationcomplete', () => {
          this.sprite.setAlpha(0.5); // Fade
          // Remove after 2 seconds
          this.sprite.scene.time.delayedCall(2000, () => {
            this.sprite.destroy();
          });
        });
        break;
    }

    this.currentAnimation = newState;
  }
}
```

**Animation Priorities:**

```
Death (highest priority) > Hit > Attack > Walk > Idle (lowest)
```

- Death cannot be interrupted
- Hit briefly interrupts current animation
- Attack completes before returning to idle/walk
- Idle is default state

---

## 6. Damage Type Visual Effects

### 6.1 Physical Damage

**Effect:** Slash/Impact Flash

- **Animation:** White flash on target sprite (2 frames)
- **Particle:** Small dust/debris burst on impact
- **Sound:** Melee hit sound (thud, slash, crunch)
- **Damage Number:** White text, pops up from impact point

**Heavy Physical (Brute Smash):**

- **Animation:** Screen shake (intensity based on damage)
- **Particle:** Larger debris burst, shockwave ring
- **Sound:** Heavy impact sound, low rumble

### 6.2 Toxic Damage

**Effect:** Green Bubbles & Poison Drip

- **Animation:** Green splash on target
- **Particle:** Green toxic bubbles rise from target
- **Liquid Effect:** Green goo drips down target sprite
- **Sound:** Sizzling, acid burn sound
- **Damage Number:** Green text
- **Ongoing Effect:** Green bubbles continuously emit from poisoned unit

### 6.3 Fire Damage

**Effect:** Flames & Burning

- **Animation:** Orange/red explosion on impact
- **Particle:** Fire particles spread from impact
- **Burning State:** Target sprite overlaid with fire sprite (loops)
- **Sound:** Explosion sound (impact), crackling fire (ongoing)
- **Damage Number:** Orange/red text
- **Spread Mechanic:** If adjacent units close (<50px), fire jumps (spark particles)

**Fire AoE (Fireball):**

- **Projectile:** Fireball sprite travels in arc
- **Impact:** Large explosion radius (circle area)
- **Shockwave:** Orange expanding ring
- **Screen Effect:** Brief orange flash

### 6.4 Dark/Psychic Damage

**Effect:** Purple/Black Energy Waves

- **Animation:** Dark purple energy ripples emanate from attacker
- **Particle:** Purple/black wisps swirl around target
- **Target Effect:** Target sprite briefly darkens, flickers
- **Sound:** Eerie whisper sound, dark energy hum
- **Damage Number:** Purple text
- **Fear Effect:** If causes fear, target has panic icon (!) above head

### 6.5 Explosive Damage

**Effect:** Large Explosion, Shockwave

- **Animation:** Bright flash, expanding fireball
- **Particle:** Explosion debris in all directions
- **Shockwave:** Expanding circle, knocks back nearby units
- **Screen Effect:** Screen shake (heavy), brief white flash
- **Sound:** Loud explosion sound
- **Damage Number:** Yellow text, affects all units in radius
- **Crater:** Leave scorch mark on ground (decal)

### 6.6 Holy Damage

**Effect:** Golden/White Light Burst

- **Animation:** Divine light beams strike from above
- **Particle:** Golden sparkles, white rays
- **Target Effect:** Target sprite flashes white, appears "scorched"
- **Sound:** Divine chime sound, angelic choir
- **Damage Number:** Yellow/gold text (large, as it's often high damage to undead)
- **Stun Effect:** Golden chains briefly appear around stunned unit

**Holy AoE (Divine Strike):**

- **Animation:** Golden shockwave expands from caster
- **Particle:** Light rays in all directions
- **Ground Effect:** Golden runes appear on ground briefly
- **Sound:** Powerful divine impact

---

## 7. Status Effect Indicators

### 7.1 Visual Indicator System

**Above Health Bar (Icon Row):**

```
┌────────────────┐
│ 🧟 Unit Name   │
│ ████████░░ 80% │  ← Health Bar
│ 🤢 🔥 ⚡       │  ← Status Icons (up to 5 shown)
└────────────────┘
```

**Icon Specifications:**

- **Size:** 16x16px icons
- **Position:** Centered above health bar
- **Max Visible:** 5 icons (if more, show "..." or tooltip)
- **Animation:** Icons gently pulse/animate to indicate active status

### 7.2 Status Effect Details

**1. Poisoned 🤢 (Green)**

- **Icon:** Green bubbling skull
- **Particle:** Green bubbles float upward from unit (continuous)
- **Sprite Effect:** Green tint overlay (10% opacity)
- **Duration Display:** Small timer on icon (e.g., "7s")
- **Visual Feedback:** Damage numbers pop up on DoT ticks (green, small)

**2. Burning 🔥 (Orange/Red)**

- **Icon:** Orange flame icon
- **Particle:** Fire sprite overlaid on unit (animated flames)
- **Sprite Effect:** Orange glow around unit, smoke rises
- **Duration Display:** Timer on icon
- **Visual Feedback:** Red damage numbers on DoT ticks, unit sprite flickers
- **Spread:** If spreads to adjacent unit, fire spark particle jumps between them

**3. Stunned ⚡ (Yellow)**

- **Icon:** Yellow stars or lightning bolt
- **Particle:** Stars circle above unit's head (cartoon style)
- **Sprite Effect:** Unit sprite frozen (no animation), slight vibration
- **Duration Display:** Timer on icon
- **Visual Feedback:** Unit cannot move or attack, "ZZZ" or stars particle

**4. Fear 😱 (Purple)**

- **Icon:** Purple terrified face or skull
- **Particle:** Purple wavy lines (shaking effect)
- **Sprite Effect:** Unit runs away (plays retreat animation)
- **Duration Display:** Timer on icon
- **Visual Feedback:** "!" exclamation mark above head, unit moves opposite direction

**5. Bleeding 🩸 (Dark Red)**

- **Icon:** Red droplet
- **Particle:** Blood drips fall from unit periodically
- **Sprite Effect:** Red splatter marks on sprite
- **Duration Display:** Timer on icon
- **Visual Feedback:** Small red damage numbers on DoT ticks

**6. Buffed ⬆️ (Blue/Positive)**

- **Icon:** Blue upward arrow or shield
- **Particle:** Blue sparkles around unit
- **Sprite Effect:** Unit glows slightly blue
- **Duration Display:** Timer on icon
- **Examples:** Attack boost, defense boost, speed boost

**7. Debuffed ⬇️ (Gray/Negative)**

- **Icon:** Gray downward arrow or broken shield
- **Particle:** Gray smoke/dust
- **Sprite Effect:** Unit appears darker/duller
- **Duration Display:** Timer on icon
- **Examples:** Attack reduced, defense reduced, slowed

---

## 8. Fortification Layout

### 8.1 Fortification Types & Visuals

**1. Gate (Major Obstacle)**

```
Visual Layout:
┌─────────┐
│  GATE   │  ← Large wooden/metal gate
│  ████   │  ← HP: 500-1000
│  ████   │  ← Blocks passage
└─────────┘
```

- **Position:** X=1200-1300 (mid-battlefield)
- **Size:** 128x192px (tall obstacle)
- **HP Bar:** Large health bar above gate
- **Destruction:** Gate splinters, breaks in half, collapses (animation)
- **Strategy:** Zombies must destroy to proceed; Brutes deal bonus damage

**2. Wall (Partial Cover)**

```
Visual Layout:
──────────────  ← Wall extends horizontally
█████████████  ← HP: 300-600
──────────────  ← Enemies can stand behind for cover
```

- **Position:** X=1400-1600 (behind enemy front line)
- **Size:** Variable width (256-512px) x 64px height
- **HP Bar:** Multiple segments (each segment = section of wall)
- **Effect:** Enemies behind wall take 50% reduced damage from ranged attacks
- **Destruction:** Wall sections crumble individually (stone debris)

**3. Tower (Elevated Ranged Position)**

```
Visual Layout:
    🏹      ← Archer on top
   ┌───┐
   │   │    ← Tower structure
   │   │    ← HP: 200-400
   └───┘
```

- **Position:** X=1500-1700 (back of battlefield)
- **Size:** 96x128px
- **HP Bar:** Above tower
- **Function:** Archer on top shoots arrows (increased range)
- **Destruction:** Tower collapses, archer falls and takes damage (or dies)
- **Strategy:** High priority target; Spitters can reach tower from distance

**4. Traps (Triggered Hazards)**

```
Visual Layout:
  ⚠️ ⚠️      ← Warning markers (visible to player in pre-battle)
 ┌─────┐
 │ 🔥/⚔️│    ← Fire trap or spike pit
 └─────┘
```

- **Position:** Scattered at X=800-1200 (mid-battlefield)
- **Size:** 64x64px floor area
- **Types:**
  - **Spike Pit:** Springs when zombie walks over, deals 50-100 damage, stuns briefly
  - **Fire Trap:** Explodes when triggered, deals fire damage in AoE, sets on fire
  - **Net Trap:** Captures unit, stuns for 5 seconds
- **Visual:** Pre-triggered: faint outline/glow; Triggered: animation plays, trap disappears
- **Strategy:** Cannot be targeted/destroyed; zombies trigger by walking over
- **Counterplay:** Runners fast enough to avoid some traps (speed check)

### 8.2 Fortification Interaction

**Targeting Priority:**

```typescript
function shouldTargetFortification(zombie: Unit): boolean {
  // Brutes prioritize fortifications
  if (zombie.type === 'brute') {
    const nearestFortification = findNearestFortification(zombie);
    const nearestEnemy = findNearestEnemy(zombie);

    // If fortification is closer or blocking path, target it
    if (
      nearestFortification &&
      distance(zombie, nearestFortification) < distance(zombie, nearestEnemy)
    ) {
      return true;
    }
  }

  // Other zombies only target fortifications if blocking and no enemies in range
  if (isBlocked(zombie) && !hasEnemyInRange(zombie)) {
    return true;
  }

  return false;
}
```

**Destruction Effects:**

- **Gate Destroyed:** Loud crash sound, wood splinters fly, all zombies gain 10% move speed boost (morale)
- **Wall Section Destroyed:** Stone debris, dust cloud
- **Tower Destroyed:** Archer falls (takes damage), tower crumbles

---

## 9. Victory/Defeat Screens

### 9.1 Victory Screen

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                       🎉 VICTORY! 🎉                            │
│                                                                  │
│              ═══ Forsaken Village Conquered ═══                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BATTLE SUMMARY                                          │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  Duration: 02:35                                         │   │
│  │  Casualties: 1 zombie lost                               │   │
│  │  Survivors: 3 zombies                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REWARDS                                                 │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  💰 Dark Coins: +87                                     │   │
│  │  🪵 Rotten Wood: +50                                    │   │
│  │  🦴 Bones: +25                                          │   │
│  │  ✨ Soul Fragment: +1 (Rare!)                           │   │
│  │                                                          │   │
│  │  🔓 UNLOCKED: Priest Zombie Seed                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EXPERIENCE GAINED                                       │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  🧟 Shambler "Biter": +75 XP (Level 3 → 4) ⬆️           │   │
│  │  🏃 Runner "Sprint": +65 XP                             │   │
│  │  💪 Brute "Crusher": +80 XP (MVP: Most Damage)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CASUALTIES                                              │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  ☠️ Shambler "Bitey" - Fell to Archer volleys           │   │
│  │     [May they rest in pieces...]                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│                  [CONTINUE TO FARM] [RAID AGAIN]                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Victory Screen Components:**

**1. Victory Banner:**

- Large animated text: "VICTORY!" with particle effects
- Location name: "Forsaken Village Conquered"
- Optional: Star rating (1-3 stars based on performance)

**2. Battle Summary Panel:**

- Battle duration
- Total casualties (zombies lost)
- Survivors count
- Optional stats: Total damage dealt, enemies killed, etc.

**3. Rewards Panel:**

- **Dark Coins:** Primary reward, large font
- **Resources:** Each resource with icon and amount
- **Special Items:** Highlighted (Soul Essence, blueprints)
- **Unlocks:** New content unlocked (seeds, structures, abilities)

**4. Experience Gained Panel:**

- List each surviving zombie with:
  - Name and type
  - XP gained
  - Level up indicator (if leveled up)
  - Special achievements (MVP, Most Kills, etc.)
- Zombies that leveled up show "Level 3 → 4 ⬆️"

**5. Casualties Panel:**

- List fallen zombies with:
  - Name and type
  - Cause of death (flavor text: "Fell to Paladin's divine wrath")
  - Memorial message
- If no casualties: "No Casualties - Flawless Victory! ⭐"

**6. Action Buttons:**

- **[CONTINUE TO FARM]:** Return to farm (primary action)
- **[RAID AGAIN]:** Replay this battle (if available)
- **[SHARE VICTORY]:** (Optional) Share screenshot/stats

### 9.2 Defeat Screen

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                        ☠️ DEFEAT ☠️                             │
│                                                                  │
│              ─── The Horde Has Been Destroyed ───                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BATTLE REPORT                                           │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  Duration: 01:47                                         │   │
│  │  All zombies perished in battle.                         │   │
│  │  The village defenses were too strong.                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FALLEN ZOMBIES                                          │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  ☠️ Shambler "Biter" - Slain by Knight's blade          │   │
│  │  ☠️ Runner "Sprint" - Burned by Mage's fireball         │   │
│  │  ☠️ Brute "Crusher" - Holy strike from Paladin          │   │
│  │  ☠️ Spitter "Gob" - Shot down by Archers                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  "Regroup and grow stronger. The dead shall rise again." │   │
│  │                                                           │   │
│  │  💡 TIP: Try training your zombies more before this raid.│   │
│  │     Consider including a Brute to break fortifications.  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│                  [RETURN TO FARM] [TRY EASIER RAID]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Defeat Screen Components:**

**1. Defeat Banner:**

- Text: "DEFEAT" with dark, ominous styling
- Subtitle: "The Horde Has Been Destroyed"
- No rewards displayed

**2. Battle Report:**

- Battle duration
- Brief summary of defeat
- Narrative flavor text

**3. Fallen Zombies:**

- List all zombies that were in squad (all died)
- Each zombie with:
  - Name, type, level
  - Cause of death (flavor text)
  - Memorial icon

**4. Encouragement Panel:**

- Motivational message
- Tips for improvement:
  - "Try upgrading your zombies"
  - "Consider different squad composition"
  - "Include tanks (Brutes) to absorb damage"
  - "Target archers and mages first with Runners"

**5. Action Buttons:**

- **[RETURN TO FARM]:** Go back to farm (primary action)
- **[TRY EASIER RAID]:** Suggest easier location (if available)

### 9.3 Retreat Screen

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                      🏳️ RETREATED 🏳️                           │
│                                                                  │
│               ─── You Lived to Fight Another Day ───             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RETREAT SUMMARY                                         │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  Duration: 01:12 before retreat                          │   │
│  │  You retreated to save your remaining forces.            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SURVIVORS (Returned to Farm)                            │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  🧟 Shambler "Biter" - HP: 35/120 (Injured)             │   │
│  │  💪 Brute "Crusher" - HP: 180/300 (Injured)             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CASUALTIES                                              │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │  ☠️ Runner "Sprint" - Fell before retreat               │   │
│  │  ☠️ Spitter "Gob" - Died during retreat countdown       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  "Sometimes survival is the best strategy."              │   │
│  │                                                           │   │
│  │  💡 Heal your wounded zombies before raiding again.      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│                       [RETURN TO FARM]                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Retreat Screen Components:**

**1. Retreat Banner:**

- Text: "RETREATED" with white flag icon
- Subtitle: "You Lived to Fight Another Day"

**2. Retreat Summary:**

- Battle duration before retreat
- Retreat message

**3. Survivors Panel:**

- List zombies that survived and returned
- Show current HP (likely injured)
- "Returned to Farm" status

**4. Casualties Panel:**

- List zombies that died before or during retreat
- Cause of death

**5. Encouragement Panel:**

- Positive message about survival
- Tips: Heal wounded zombies, prepare better next time

**6. Action Button:**

- **[RETURN TO FARM]:** Go back to farm

---

## 10. UI Component Hierarchy

### 10.1 React Component Structure

```typescript
<CombatModule>

  {/* PRE-BATTLE PHASE */}
  {phase === 'target-selection' && (
    <PreBattlePhase>
      <TargetSelectionUI>
        <WorldMapPanel />
        <LocationInfoPanel>
          <LocationHeader />
          <EnemyComposition />
          <Fortifications />
          <RewardsPreview />
          <ActionButtons />
        </LocationInfoPanel>
      </TargetSelectionUI>
    </PreBattlePhase>
  )}

  {phase === 'squad-selection' && (
    <PreBattlePhase>
      <SquadSelectionUI>
        <AvailableZombiesPanel>
          <ZombieFilters />
          <ZombieSortControls />
          <ZombieList>
            {zombies.map(z => <ZombieCard key={z.id} zombie={z} />)}
          </ZombieList>
        </AvailableZombiesPanel>

        <DeploymentPanel>
          <DeploymentSlots>
            {slots.map(s => <DeploymentSlot key={s.id} slot={s} />)}
          </DeploymentSlots>
          <FormationPreview />
          <SquadStats />
          <ActionButtons />
        </DeploymentPanel>
      </SquadSelectionUI>
    </PreBattlePhase>
  )}

  {/* BATTLE PHASE */}
  {phase === 'battle' && (
    <BattlePhase>
      {/* Phaser Canvas (Full Screen) */}
      <PhaserBattlefield
        onMount={(scene) => initBattle(scene)}
        onUpdate={(delta) => battleLoop(delta)}
      >
        {/* Rendered in Phaser: */}
        {/* - Background layers */}
        {/* - Fortifications */}
        {/* - Unit sprites */}
        {/* - Projectiles */}
        {/* - Effects */}
        {/* - Health bars (Phaser UI) */}
        {/* - Damage numbers (Phaser UI) */}
      </PhaserBattlefield>

      {/* React HUD Overlay */}
      <BattleHUD>
        <TopBar>
          <WaveIndicator wave={currentWave} total={totalWaves} />
          <LocationName name={location.name} />
          <UnitCounters zombies={aliveZombies} enemies={aliveEnemies} />
        </TopBar>

        <BottomBar>
          <PauseButton onClick={pauseBattle} />
          <SoundToggle />
          <BattleLog messages={recentLogs} />
          <SpeedControls speed={battleSpeed} onChange={setSpeed} />
          <RetreatButton onClick={confirmRetreat} />
        </BottomBar>
      </BattleHUD>

      {/* Side Panel (Toggleable) */}
      {selectedUnit && (
        <UnitInfoPanel unit={selectedUnit} onClose={deselectUnit}>
          <UnitHeader />
          <UnitStats />
          <StatusEffects />
          <Abilities />
        </UnitInfoPanel>
      )}

      {/* Battle Status Messages (Center Overlay) */}
      <BattleMessages>
        {messages.map(m => <BattleMessage key={m.id} message={m} />)}
      </BattleMessages>

      {/* Pause Menu (Modal) */}
      {paused && (
        <PauseMenu>
          <ResumeButton />
          <RestartButton />
          <SettingsButton />
          <QuitButton />
        </PauseMenu>
      )}
    </BattlePhase>
  )}

  {/* POST-BATTLE PHASE */}
  {phase === 'victory' && (
    <PostBattlePhase>
      <VictoryScreen>
        <VictoryBanner />
        <BattleSummary />
        <RewardsPanel />
        <ExperiencePanel />
        <CasualtiesPanel />
        <ActionButtons />
      </VictoryScreen>
    </PostBattlePhase>
  )}

  {phase === 'defeat' && (
    <PostBattlePhase>
      <DefeatScreen>
        <DefeatBanner />
        <BattleReport />
        <FallenZombies />
        <EncouragementPanel />
        <ActionButtons />
      </DefeatScreen>
    </PostBattlePhase>
  )}

  {phase === 'retreat' && (
    <PostBattlePhase>
      <RetreatScreen>
        <RetreatBanner />
        <RetreatSummary />
        <SurvivorsPanel />
        <CasualtiesPanel />
        <EncouragementPanel />
        <ActionButtons />
      </RetreatScreen>
    </PostBattlePhase>
  )}

</CombatModule>
```

### 10.2 Component Responsibilities

**CombatModule (Parent Container):**

- Manages combat phase state
- Coordinates data flow between phases
- Handles event dispatching to/from farm

**PreBattlePhase:**

- Target selection and squad composition
- Pure React components (no Phaser)
- Form validation before battle start

**BattlePhase:**

- Phaser canvas for rendering battle
- React HUD overlay for controls and info
- Event handlers for player input (pause, retreat, speed)

**PostBattlePhase:**

- Results screens (victory, defeat, retreat)
- Data presentation components
- Dispatch results to farm module

---

## 11. State Flow

### 11.1 Combat State Machine

**XState Machine Definition:**

```typescript
import { createMachine, assign } from 'xstate';

const combatMachine = createMachine({
  id: 'combat',
  initial: 'idle',
  context: {
    location: null,
    zombieSquad: [],
    enemyComposition: [],
    battleState: null,
    results: null,
  },
  states: {
    idle: {
      on: {
        INITIATE_RAID: {
          target: 'targetSelection',
          actions: 'loadWorldMap',
        },
      },
    },

    targetSelection: {
      on: {
        SELECT_LOCATION: {
          target: 'squadSelection',
          actions: 'setLocation',
        },
        CANCEL: 'idle',
      },
    },

    squadSelection: {
      on: {
        ADD_ZOMBIE: {
          actions: 'addToSquad',
        },
        REMOVE_ZOMBIE: {
          actions: 'removeFromSquad',
        },
        CONFIRM_SQUAD: {
          target: 'battleInitialization',
          cond: 'isSquadValid',
        },
        BACK: 'targetSelection',
      },
    },

    battleInitialization: {
      invoke: {
        src: 'initializeBattle',
        onDone: {
          target: 'battleActive',
          actions: 'setBattleState',
        },
        onError: 'squadSelection', // Error: go back
      },
    },

    battleActive: {
      on: {
        PAUSE: 'battlePaused',
        RETREAT_CONFIRM: 'retreating',
        BATTLE_VICTORY: {
          target: 'battleVictory',
          actions: 'calculateResults',
        },
        BATTLE_DEFEAT: {
          target: 'battleDefeat',
          actions: 'calculateCasualties',
        },
      },
    },

    battlePaused: {
      on: {
        RESUME: 'battleActive',
        QUIT: 'idle',
      },
    },

    retreating: {
      after: {
        10000: {
          // 10 second countdown
          target: 'battleRetreat',
          actions: 'calculateRetreatResults',
        },
      },
      on: {
        CANCEL_RETREAT: 'battleActive', // Cancel if changed mind
      },
    },

    battleVictory: {
      on: {
        CONTINUE: {
          target: 'idle',
          actions: 'applyResults',
        },
        RAID_AGAIN: 'squadSelection',
      },
    },

    battleDefeat: {
      on: {
        RETURN: {
          target: 'idle',
          actions: 'applyCasualties',
        },
      },
    },

    battleRetreat: {
      on: {
        RETURN: {
          target: 'idle',
          actions: 'applyCasualties',
        },
      },
    },
  },
});
```

### 11.2 Event Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         COMBAT EVENT FLOW                         │
└──────────────────────────────────────────────────────────────────┘

FARM MODULE                    COMBAT MODULE                  PHASER SCENE
     │                              │                               │
     │  combat.initiate            │                               │
     ├─────────────────────────────>│                               │
     │                              │                               │
     │                              │  Load World Map               │
     │                              │  (targetSelection state)      │
     │                              │                               │
     │  combat.locationSelected     │                               │
     ├─────────────────────────────>│                               │
     │                              │                               │
     │                              │  Load Squad Selection         │
     │                              │  (squadSelection state)       │
     │                              │                               │
     │  combat.squadConfirmed       │                               │
     ├─────────────────────────────>│                               │
     │                              │                               │
     │                              │  Initialize Battle            │
     │                              ├──────────────────────────────>│
     │                              │                               │
     │                              │       Load Assets             │
     │                              │       Spawn Units             │
     │                              │       Start Battle Loop       │
     │                              │<──────────────────────────────┤
     │                              │  battle.initialized           │
     │                              │                               │
     │                              │  (battleActive state)         │
     │                              │                               │
     │                              │       Unit Events:            │
     │                              │<──────────────────────────────┤
     │                              │       - unit.attacked         │
     │                              │       - unit.damaged          │
     │                              │       - unit.died             │
     │                              │       - wave.spawned          │
     │                              │                               │
     │                              │  battle.ended                 │
     │                              │<──────────────────────────────┤
     │                              │  (victory/defeat)             │
     │                              │                               │
     │  combat.result              │                               │
     │<─────────────────────────────┤                               │
     │  {                           │                               │
     │    survivors: Zombie[],      │                               │
     │    casualties: Zombie[],     │                               │
     │    rewards: Rewards,         │                               │
     │    xpGains: XPGain[]         │                               │
     │  }                           │                               │
     │                              │                               │
     │  Update Farm State:          │                               │
     │  - Remove casualties         │                               │
     │  - Update survivor HP        │                               │
     │  - Add rewards to inventory  │                               │
     │  - Apply XP gains            │                               │
     │                              │                               │
```

### 11.3 Data Contracts

**Battle Initialization Data (Farm → Combat):**

```typescript
interface BattleInitData {
  location: {
    id: string;
    name: string;
    difficulty: number;
    backgroundImage: string;
  };
  zombieSquad: ZombieUnit[];
  enemyComposition: EnemyUnit[];
  fortifications: Fortification[];
  waves: WaveConfig[];
  rewards: RewardConfig;
}

interface ZombieUnit {
  id: string;
  type: ZombieType; // 'shambler', 'runner', 'brute', etc.
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: Ability[];
  aiProfile: AIProfile;
}
```

**Battle Result Data (Combat → Farm):**

```typescript
interface BattleResult {
  outcome: 'victory' | 'defeat' | 'retreat';
  duration: number; // Seconds
  location: {
    id: string;
    conquered: boolean; // True if victory
  };
  survivors: {
    zombieId: string;
    hp: number; // Current HP after battle
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
  }[];
  casualties: {
    zombieId: string;
    name: string;
    causeOfDeath: string; // Flavor text
  }[];
  rewards?: {
    // Only if victory
    darkCoins: number;
    resources: { type: string; amount: number }[];
    specialItems: { type: string; id: string }[];
    unlocks: string[]; // New content unlocked
  };
  stats: {
    totalDamageDealt: number;
    enemiesKilled: number;
    wavesCompleted: number;
  };
}
```

---

## 12. Phaser Scene Structure

### 12.1 Scene Organization

**Phaser Scenes:**

```typescript
// src/features/combat/phaser/scenes/

// 1. PreloadScene (loads all assets before battle)
class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Load all sprite sheets
    this.load.spritesheet('zombie-shambler', '/assets/sprites/zombies/shambler.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('enemy-peasant', '/assets/sprites/enemies/peasant.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    // ... load all units, effects, backgrounds

    // Load audio
    this.load.audio('hit-sound', '/assets/audio/hit.mp3');
    // ... etc
  }

  create() {
    // Once loaded, start BattleScene
    this.scene.start('BattleScene', battleInitData);
  }
}

// 2. BattleScene (main battle rendering and logic)
class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: BattleInitData) {
    this.battleData = data;
  }

  create() {
    // Setup battlefield
    this.createBackground();
    this.createFortifications();
    this.spawnUnits();

    // Start battle loop
    this.startBattle();
  }

  update(time: number, delta: number) {
    // Main battle loop (see Section 4.2)
    this.battleLoop(delta);
  }

  // Methods for battle logic
  createBackground() {
    /* ... */
  }
  createFortifications() {
    /* ... */
  }
  spawnUnits() {
    /* ... */
  }
  battleLoop(delta: number) {
    /* ... */
  }
  // ... etc
}
```

### 12.2 Phaser Layer Management

**Render Layers (using Phaser depth):**

```typescript
// In BattleScene.create()

// Background
this.backgroundLayer = this.add.layer();
this.backgroundLayer.setDepth(0);
this.backgroundLayer.add(this.add.image(960, 540, 'battlefield-bg'));

// Ground
this.groundLayer = this.add.layer();
this.groundLayer.setDepth(10);
// Add ground sprites, blood decals, etc.

// Shadows
this.shadowLayer = this.add.layer();
this.shadowLayer.setDepth(20);

// Fortifications
this.fortificationLayer = this.add.layer();
this.fortificationLayer.setDepth(30);

// Units (dynamically sorted by Y position)
this.unitContainer = this.add.container(0, 0);
this.unitContainer.setDepth(40);

// Projectiles
this.projectileLayer = this.add.layer();
this.projectileLayer.setDepth(60);

// Effects (explosions, fire, etc.)
this.effectLayer = this.add.layer();
this.effectLayer.setDepth(70);

// UI (health bars, damage numbers rendered in Phaser)
this.uiLayer = this.add.layer();
this.uiLayer.setDepth(80);

// Foreground (particles, screen effects)
this.foregroundLayer = this.add.layer();
this.foregroundLayer.setDepth(90);
```

### 12.3 Unit Sprite Management

**Unit GameObject Class:**

```typescript
class UnitSprite extends Phaser.GameObjects.Container {
  sprite: Phaser.GameObjects.Sprite;
  healthBar: Phaser.GameObjects.Graphics;
  statusIcons: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;

  unitData: UnitData;

  constructor(scene: Phaser.Scene, x: number, y: number, unitData: UnitData) {
    super(scene, x, y);
    this.unitData = unitData;

    // Shadow
    this.shadow = scene.add.ellipse(0, 20, 40, 15, 0x000000, 0.3);
    this.add(this.shadow);

    // Main sprite
    this.sprite = scene.add.sprite(0, 0, unitData.spriteKey);
    this.sprite.play(unitData.idleAnimation);
    this.add(this.sprite);

    // Health bar
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    // Status icons container
    this.statusIcons = scene.add.container(0, -40);
    this.add(this.statusIcons);

    scene.add.existing(this);
  }

  updateHealthBar() {
    const hpPercent = this.unitData.hp / this.unitData.maxHp;
    const barWidth = 50;
    const barHeight = 5;
    const x = -barWidth / 2;
    const y = -35;

    this.healthBar.clear();

    // Background (gray)
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(x, y, barWidth, barHeight);

    // HP fill (color based on HP%)
    let color = 0x00ff00; // Green
    if (hpPercent < 0.5) color = 0xffff00; // Yellow
    if (hpPercent < 0.25) color = 0xff0000; // Red

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);

    // Border
    this.healthBar.lineStyle(1, 0xffffff, 1);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);
  }

  takeDamage(amount: number, damageType: string) {
    this.unitData.hp -= amount;
    if (this.unitData.hp < 0) this.unitData.hp = 0;

    this.updateHealthBar();
    this.showDamageNumber(amount, damageType);
    this.playHitAnimation();

    if (this.unitData.hp <= 0) {
      this.die();
    }
  }

  showDamageNumber(amount: number, damageType: string) {
    // Create floating damage text
    const color = getDamageColor(damageType);
    const text = this.scene.add.text(0, -20, `-${amount}`, {
      fontSize: '20px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.add(text);

    // Animate upward and fade
    this.scene.tweens.add({
      targets: text,
      y: -60,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  playHitAnimation() {
    // Flash white briefly
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    // Play hit animation if available
    if (this.sprite.anims.exists(`${this.unitData.spriteKey}-hit`)) {
      this.sprite.play(`${this.unitData.spriteKey}-hit`);
    }
  }

  die() {
    this.sprite.play(`${this.unitData.spriteKey}-death`);
    this.sprite.once('animationcomplete', () => {
      // Fade out and destroy
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 1000,
        onComplete: () => this.destroy(),
      });
    });
  }
}
```

### 12.4 Projectile System

**Projectile Pool:**

```typescript
class ProjectilePool {
  scene: Phaser.Scene;
  pool: Projectile[] = [];

  constructor(scene: Phaser.Scene, initialSize: number = 20) {
    this.scene = scene;
    for (let i = 0; i < initialSize; i++) {
      const projectile = new Projectile(scene);
      projectile.setActive(false);
      projectile.setVisible(false);
      this.pool.push(projectile);
    }
  }

  get(): Projectile | null {
    const projectile = this.pool.find((p) => !p.active);
    if (projectile) {
      projectile.setActive(true);
      projectile.setVisible(true);
      return projectile;
    }
    // If pool exhausted, create new one
    const newProjectile = new Projectile(this.scene);
    this.pool.push(newProjectile);
    return newProjectile;
  }

  release(projectile: Projectile) {
    projectile.setActive(false);
    projectile.setVisible(false);
  }
}

class Projectile extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'projectile-arrow');
    scene.add.existing(this);
  }

  fire(fromX: number, fromY: number, toX: number, toY: number, speed: number, onHit: () => void) {
    this.setPosition(fromX, fromY);

    // Calculate angle
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    this.setRotation(angle);

    // Move toward target
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: (Phaser.Math.Distance.Between(fromX, fromY, toX, toY) / speed) * 1000,
      onComplete: () => {
        onHit();
        // Return to pool
        projectilePool.release(this);
      },
    });
  }
}
```

---

## 13. Performance Considerations

### 13.1 Optimization Strategies

**1. Sprite Pooling:**

- Reuse sprite objects instead of creating/destroying
- Maintain pools for:
  - Units (20-30 sprites)
  - Projectiles (50-100 sprites)
  - Damage numbers (30-50 text objects)
  - Particles (100+ particles)

**2. Texture Atlases:**

- Combine all unit sprites into texture atlases
- Reduces draw calls and texture swaps
- Use tools like TexturePacker

**3. Particle System Optimization:**

- Use Phaser particle emitters with limited max particles
- Recycle particles automatically
- Limit simultaneous particle effects (max 5-10 active)

**4. Culling:**

- Only render units within camera view
- Disable physics/AI for off-screen units if battlefield scrollable
- For fixed camera, all units always visible (no culling needed)

**5. Animation Frame Rate:**

- Cap animations at 12 FPS (pixel art doesn't need 60 FPS animations)
- Use `frameRate: 12` in animation config
- Reduces processing and looks appropriate for style

**6. Update Loop Optimization:**

```typescript
update(time: number, delta: number) {
  // Only update every 2-3 frames for non-critical logic
  if (time % 3 === 0) {
    this.updateAI();
    this.checkTargeting();
  }

  // Critical updates every frame
  this.updateMovement(delta);
  this.updateAnimations(delta);
  this.updateEffects(delta);
}
```

**7. LOD (Level of Detail):**

- Distant units (if camera zooms out) use lower-res sprites
- Reduce particle count for distant effects
- Disable shadows for distant units

**8. Damage Number Pooling:**

```typescript
class DamageNumberPool {
  pool: Phaser.GameObjects.Text[] = [];

  get(): Phaser.GameObjects.Text {
    const text = this.pool.find((t) => !t.active);
    if (text) {
      text.setActive(true);
      text.setVisible(true);
      return text;
    }
    // Create new if pool empty
    const newText = scene.add.text(0, 0, '', damageNumberStyle);
    this.pool.push(newText);
    return newText;
  }

  release(text: Phaser.GameObjects.Text) {
    text.setActive(false);
    text.setVisible(false);
  }
}
```

**9. Limit Simultaneous Sounds:**

- Max 5-10 sound effects playing at once
- Prioritize important sounds (player units over enemies)
- Use sound pooling

**10. Canvas Rendering Mode:**

- Use WebGL renderer (default for Phaser 3)
- Fallback to Canvas renderer for older browsers
- Enable multi-texture rendering

### 13.2 Performance Targets

**Target Metrics:**

- **FPS:** Maintain 60 FPS on modern hardware (30 FPS minimum on low-end)
- **Unit Count:** Support up to 30 simultaneous units (15 zombies + 15 enemies)
- **Projectiles:** Up to 20 simultaneous projectiles
- **Particles:** Up to 200 active particles
- **Memory:** Keep memory usage under 200 MB

**Profiling:**

- Use Phaser's built-in debug renderer
- Monitor FPS with `game.loop.actualFps`
- Profile with browser DevTools Performance tab
- Identify bottlenecks (rendering, logic, GC)

---

## 14. Integration with Farm & Core

### 14.1 Data Flow: Farm → Combat

**When Battle Starts:**

```typescript
// Farm module dispatches event
gameStateMachine.send({
  type: 'INITIATE_BATTLE',
  data: {
    location: selectedLocation,
    availableZombies: farmState.activeZombies, // Zombies currently on farm
  },
});

// Combat module receives and transitions to squad selection
// Squad selection UI fetches zombie data from farm state via context

// After squad confirmed, combat requests full zombie data
const zombieSquad = selectedZombieIds.map((id) => farmState.zombies.find((z) => z.id === id));

// Combat module now owns this battle instance
// Zombies are marked as "in combat" in farm state (unavailable for other actions)
```

**Zombie Data Contract:**

```typescript
interface ZombieData {
  // Identity
  id: string;
  type: ZombieType;
  name: string;
  level: number;

  // Combat Stats (from farm state)
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;

  // Abilities
  abilities: Ability[];

  // AI Profile (derived from type)
  aiProfile: 'aggressive' | 'flanker' | 'ranged' | 'support';

  // Visual
  spriteKey: string; // e.g., 'zombie-shambler'

  // Farm State (not used in combat, but preserved)
  happiness: number;
  xp: number;
  // ... other farm attributes
}
```

### 14.2 Data Flow: Combat → Farm

**When Battle Ends:**

```typescript
// Combat module calculates results
const battleResult: BattleResult = {
  outcome: 'victory', // or 'defeat', 'retreat'
  survivors: [
    { zombieId: 'z1', hp: 45, xpGained: 75, leveledUp: true, newLevel: 4 },
    { zombieId: 'z2', hp: 120, xpGained: 65, leveledUp: false },
  ],
  casualties: [{ zombieId: 'z3', name: 'Bitey', causeOfDeath: 'Slain by Paladin' }],
  rewards: {
    darkCoins: 87,
    resources: [
      { type: 'rottenWood', amount: 50 },
      { type: 'bones', amount: 25 },
    ],
    specialItems: [{ type: 'seed', id: 'priest-zombie-seed' }],
    unlocks: ['priest-zombie-seed'],
  },
  stats: {
    totalDamageDealt: 2450,
    enemiesKilled: 13,
    wavesCompleted: 3,
  },
};

// Dispatch result event to core/farm
gameStateMachine.send({
  type: 'BATTLE_COMPLETED',
  data: battleResult,
});
```

**Farm Module Processes Results:**

```typescript
// In farm state machine event handler

onBattleCompleted(context, event) {
  const result = event.data;

  // 1. Remove casualties
  result.casualties.forEach(casualty => {
    removeZombie(context, casualty.zombieId);
  });

  // 2. Update survivors
  result.survivors.forEach(survivor => {
    const zombie = context.zombies.find(z => z.id === survivor.zombieId);
    if (zombie) {
      zombie.hp = survivor.hp; // Update HP
      zombie.xp += survivor.xpGained; // Add XP

      if (survivor.leveledUp) {
        levelUpZombie(zombie, survivor.newLevel);
      }

      // Mark as no longer in combat
      zombie.inCombat = false;
    }
  });

  // 3. Add rewards
  if (result.rewards) {
    context.inventory.darkCoins += result.rewards.darkCoins;

    result.rewards.resources.forEach(resource => {
      addResource(context.inventory, resource.type, resource.amount);
    });

    result.rewards.unlocks.forEach(unlockId => {
      unlockContent(context, unlockId);
    });
  }

  // 4. Update location status (if conquered)
  if (result.outcome === 'victory') {
    const location = context.worldMap.locations.find(l => l.id === result.location.id);
    if (location) {
      location.conquered = true;
      location.cooldownUntil = Date.now() + (24 * 60 * 60 * 1000); // 1 day cooldown
    }
  }

  // 5. Morale effects
  if (result.outcome === 'victory') {
    context.zombies.forEach(z => z.happiness += 5); // Boost morale
  } else {
    context.zombies.forEach(z => z.happiness -= 3); // Lower morale
  }
}
```

### 14.3 Event Types

**Combat Events Dispatched:**

```typescript
// From Farm/Core to Combat
type CombatEvent =
  | { type: 'INITIATE_BATTLE'; data: { location: Location } }
  | { type: 'SELECT_LOCATION'; data: { locationId: string } }
  | { type: 'CONFIRM_SQUAD'; data: { zombieIds: string[] } }
  | { type: 'RETREAT_BATTLE' }
  | { type: 'PAUSE_BATTLE' }
  | { type: 'RESUME_BATTLE' };

// From Combat to Farm/Core
type BattleResultEvent =
  | { type: 'BATTLE_COMPLETED'; data: BattleResult }
  | { type: 'BATTLE_ABORTED'; data: { reason: string } }; // If error occurs
```

---

## 15. Technical Implementation Notes

### 15.1 File Structure

```
src/features/combat/
├── index.ts                          # Module exports
├── CombatModule.tsx                  # Main React component (phase router)
│
├── components/                       # React UI components
│   ├── pre-battle/
│   │   ├── TargetSelectionUI.tsx
│   │   ├── WorldMapPanel.tsx
│   │   ├── LocationInfoPanel.tsx
│   │   ├── SquadSelectionUI.tsx
│   │   ├── AvailableZombiesPanel.tsx
│   │   ├── DeploymentPanel.tsx
│   │   └── FormationPreview.tsx
│   │
│   ├── battle/
│   │   ├── BattlePhase.tsx          # Wrapper for Phaser + HUD
│   │   ├── PhaserBattlefield.tsx    # Phaser React integration
│   │   ├── BattleHUD.tsx
│   │   ├── TopBar.tsx
│   │   ├── BottomBar.tsx
│   │   ├── UnitInfoPanel.tsx
│   │   ├── BattleMessages.tsx
│   │   └── PauseMenu.tsx
│   │
│   └── post-battle/
│       ├── VictoryScreen.tsx
│       ├── DefeatScreen.tsx
│       └── RetreatScreen.tsx
│
├── phaser/                           # Phaser game logic
│   ├── game.ts                       # Phaser game configuration
│   ├── scenes/
│   │   ├── PreloadScene.ts           # Asset preloading
│   │   └── BattleScene.ts            # Main battle scene
│   │
│   ├── entities/                     # Game objects
│   │   ├── UnitSprite.ts             # Unit sprite class
│   │   ├── Projectile.ts             # Projectile class
│   │   ├── Fortification.ts          # Fortification objects
│   │   └── EffectEmitter.ts          # Particle effects
│   │
│   ├── systems/                      # Game systems
│   │   ├── CombatSystem.ts           # Combat calculations
│   │   ├── AISystem.ts               # AI decision making
│   │   ├── MovementSystem.ts         # Unit movement
│   │   ├── AnimationSystem.ts        # Animation state management
│   │   ├── StatusEffectSystem.ts     # Status effects (poison, burn, etc.)
│   │   └── ProjectileSystem.ts       # Projectile management
│   │
│   └── utils/
│       ├── DamageCalculator.ts       # Damage formulas
│       ├── TargetingUtils.ts         # Target selection logic
│       └── PoolManager.ts            # Object pooling
│
├── lib/                              # Business logic
│   ├── combatMachine.ts              # XState state machine
│   ├── combatLogic.ts                # Combat rules implementation
│   ├── battleCalculations.ts         # XP, rewards, etc.
│   └── combatConfig.ts               # Combat configuration
│
├── types/                            # TypeScript types
│   ├── combat.types.ts               # Combat domain types
│   ├── unit.types.ts                 # Unit data structures
│   ├── battle.types.ts               # Battle state types
│   └── events.types.ts               # Combat events
│
└── assets/                           # Combat-specific assets
    └── (could be here or global /assets)
```

### 15.2 Key Technical Decisions

**1. Phaser-React Integration:**

- Use `react-phaser-fiber` or manual Phaser instance management
- Phaser canvas embedded as React component
- React handles UI overlay (HUD, menus)
- Event bridge between Phaser and React via custom event emitter

**2. State Management:**

- XState for combat state machine (phases, battle flow)
- Phaser manages battle simulation state (unit positions, HP, etc.)
- React Context for UI state (selected unit, HUD visibility)

**3. Rendering Strategy:**

- Phaser renders all game visuals (units, effects)
- React renders UI overlay (HUD, panels)
- Health bars rendered in Phaser for performance (closer to units)
- Damage numbers rendered in Phaser (better performance)

**4. Testing Strategy:**

- Unit tests for combat calculations (damage, XP, rewards)
- Unit tests for AI logic (targeting, decision making)
- Integration tests for state machine transitions
- Manual/visual testing for Phaser rendering

**5. Asset Loading:**

- All assets loaded in PreloadScene before battle
- Loading screen shown during asset load
- Fallback to placeholder sprites if assets fail to load

### 15.3 Performance Budget

**Asset Sizes:**

- Sprite sheets: Max 2MB each (use texture atlases)
- Background images: Max 1MB each
- Sound effects: Max 100KB each
- Music: Max 5MB (optional battle music)

**Runtime Limits:**

- Max 30 active units on screen
- Max 20 projectiles simultaneously
- Max 200 particles active
- Max 50 damage numbers on screen

**Memory Target:**

- Total memory usage: < 200 MB
- Texture memory: < 100 MB
- Audio memory: < 30 MB

---

## Conclusion

This combat layout document provides a comprehensive blueprint for implementing the castle siege auto-battler combat system in Zombie Farm. All visual layouts, component structures, state flows, and technical details are specified to enable systematic implementation.

**Next Steps for Implementation:**

1. Set up Phaser-React integration
2. Implement combat state machine
3. Create pre-battle UI components
4. Build BattleScene with unit rendering
5. Implement combat loop and AI
6. Add visual effects and animations
7. Create post-battle result screens
8. Integrate with farm module
9. Test and balance

**Reference Documents:**

- `/META/DOMAIN-COMBAT.md` - All combat mechanics and formulas
- `/META/ARCHITECTURE.md` - Project architecture patterns
- `/META/TESTING.md` - Testing standards
- `/Zombie-Farm-PRD.md` - Game design vision

---

## 16. Reusable Components from Sunflower Land

This section identifies all components, patterns, and utilities from the Sunflower Land reference codebase that are directly applicable to the Combat system. These components have been vetted for reusability and will significantly accelerate development.

### 16.1 Phaser Integration & Architecture

#### 1. Phaser-React Integration Pattern
- **Source:** `Sunflowerland-ref/src/features/world/Phaser.tsx`
- **Purpose:** Manages Phaser game instance within React application lifecycle
- **Reusability:** **CRITICAL - Core pattern for combat system**
- **Adaptations Needed:**
  - Remove blockchain/Web3 dependencies
  - Simplify multiplayer/MMO logic (not needed for single-player combat)
  - Keep Phaser game registry pattern for passing React state to Phaser
  - Keep event bridge pattern between Phaser and React
- **Target Location:** `src/features/combat/components/battle/PhaserBattlefield.tsx`
- **Integration Notes:**
  ```typescript
  // Key pattern to reuse:
  game.current.registry.set("gameState", state);
  game.current.registry.set("gameService", gameService);

  // Event bridge:
  const listener = (e: EventObject) => {
    // Handle game events
  };
  gameService.onEvent(listener);
  ```

**Config Pattern:**
```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  fps: { target: 30, smoothStep: true },
  backgroundColor: "#000000",
  parent: "game-content",
  autoRound: true,
  pixelArt: true,
  plugins: {
    global: [
      { key: "rexNinePatchPlugin", plugin: NinePatchPlugin, start: true },
    ],
  },
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: { debug: false, gravity: { x: 0, y: 0 } },
  },
  scene: [PreloadScene, BattleScene],
  loader: { crossOrigin: "anonymous" },
};
```

#### 2. Base Scene Architecture
- **Source:** `Sunflowerland-ref/src/features/world/scenes/BaseScene.ts`
- **Purpose:** Foundation for all Phaser scenes with common functionality
- **Reusability:** **HIGH - Template for BattleScene**
- **Adaptations Needed:**
  - Remove MMO/networking logic
  - Remove joystick controls (not needed for auto-battler)
  - Keep: Camera management, audio controller, layer management, collision system
  - Simplify: Remove navmesh (no player movement in auto-battler)
- **Target Location:** `src/features/combat/phaser/scenes/BaseCombatScene.ts`
- **Integration Notes:**
  - Reuse layer depth management system
  - Reuse audio controller pattern
  - Reuse scene initialization lifecycle
  - Adapt collision system for unit interactions

**Key Patterns to Reuse:**
```typescript
// Layer depth management
this.layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};

// Audio system
soundEffects: AudioController[] = [];

// Scene lifecycle
abstract sceneId: SceneId;
init(data) { /* ... */ }
create() { /* ... */ }
update(time, delta) { /* ... */ }
```

#### 3. Preloader Scene
- **Source:** `Sunflowerland-ref/src/features/world/scenes/Preloader.ts`
- **Purpose:** Asset preloading before main scene
- **Reusability:** **HIGH - Essential for battle assets**
- **Adaptations Needed:**
  - Load combat-specific assets (zombie sprites, enemy sprites, effects)
  - Remove farm/world assets
  - Add loading progress bar
- **Target Location:** `src/features/combat/phaser/scenes/PreloadScene.ts`
- **Integration Notes:**
  - Use for loading all sprite sheets before battle
  - Show loading screen during asset load
  - Handle load errors gracefully

### 16.2 Sprite & Animation Systems

#### 4. BumpkinContainer (Character Sprite Management)
- **Source:** `Sunflowerland-ref/src/features/world/containers/BumpkinContainer.ts`
- **Purpose:** Manages character sprites with animations, health bars, labels, and effects
- **Reusability:** **VERY HIGH - Perfect template for unit sprites**
- **Adaptations Needed:**
  - Rename to `UnitContainer` or `ZombieContainer`
  - Simplify clothing/customization system (zombies have fixed types)
  - Keep: Health bar rendering, shadow, label, animation state management
  - Add: Status effect icons, damage number display
- **Target Location:** `src/features/combat/phaser/entities/UnitSprite.ts`
- **Integration Notes:**
  - This container pattern is PERFECT for our unit sprites
  - Handles sprite, shadow, health bar, label, and effects in one container
  - Already supports animation state management

**Reusable Pattern:**
```typescript
export class UnitSprite extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public shadow: Phaser.GameObjects.Sprite;
  public healthBar: Phaser.GameObjects.Graphics;
  public label: Label;
  public statusIcons: Phaser.GameObjects.Container;

  constructor(scene, x, y, unitData) {
    super(scene, x, y);
    // Add shadow
    this.shadow = scene.add.sprite(0, 8, "shadow");
    this.add(this.shadow).moveTo(this.shadow, 0);

    // Add main sprite
    this.sprite = scene.add.sprite(0, 0, unitData.spriteKey);
    this.add(this.sprite);

    // Add health bar
    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();
  }

  updateHealthBar() {
    const hpPercent = this.hp / this.maxHp;
    // Draw health bar
  }

  takeDamage(amount, damageType) {
    // Show damage number, play hit animation
  }
}
```

#### 5. SpriteAnimator Component
- **Source:** `Sunflowerland-ref/src/components/animation/SpriteAnimator.tsx`
- **Purpose:** React component for playing sprite sheet animations
- **Reusability:** **MEDIUM - Useful for UI animations**
- **Adaptations Needed:**
  - Use for post-battle victory/defeat animations
  - Use for zombie/enemy portraits in UI
  - Not needed for Phaser sprites (Phaser handles its own animations)
- **Target Location:** `src/features/combat/components/animations/SpriteAnimator.tsx`
- **Integration Notes:**
  - Use in React UI components (menus, victory screens)
  - Good for animated icons and portraits
  - Supports FPS control, looping, callbacks

**Use Cases:**
- Animated unit portraits in squad selection
- Victory screen celebrations
- Animated icons for abilities/items

#### 6. Label Component
- **Source:** `Sunflowerland-ref/src/features/world/containers/Label.ts`
- **Purpose:** Pixel-art text labels with background panels
- **Reusability:** **HIGH - Great for unit name tags**
- **Adaptations Needed:**
  - Use for unit names above health bars
  - Use for HUD labels
  - Theme colors for dark/undead aesthetic
- **Target Location:** `src/features/combat/phaser/entities/Label.ts`
- **Integration Notes:**
  - Already integrated in BumpkinContainer
  - Supports different panel styles
  - Text rendering optimized for pixel fonts

#### 7. Progress Bar Container
- **Source:** `Sunflowerland-ref/src/features/world/containers/ProgressBarContainer.ts`
- **Purpose:** Phaser-rendered progress bars (health, cooldowns)
- **Reusability:** **VERY HIGH - Essential for health bars**
- **Adaptations Needed:**
  - Use for unit health bars above sprites
  - Use for ability cooldown indicators
  - Add damage type color coding (toxic green, fire red, holy gold)
- **Target Location:** `src/features/combat/phaser/entities/HealthBar.ts`
- **Integration Notes:**
  - Renders directly in Phaser for performance
  - Supports color gradients
  - Smooth animation transitions

### 16.3 UI Components (React)

#### 8. Modal Component
- **Source:** `Sunflowerland-ref/src/components/ui/Modal.tsx`
- **Purpose:** Accessible modal dialog with transitions
- **Reusability:** **VERY HIGH - Essential for all screens**
- **Adaptations Needed:**
  - Remove multiplayer-related features
  - Keep accessibility features (Dialog, focus management)
  - Keep sound effects (open/close)
  - Use for pre-battle, post-battle, pause menus
- **Target Location:** `src/features/combat/components/ui/Modal.tsx`
- **Integration Notes:**
  - Uses Headless UI for accessibility
  - Smooth fade transitions
  - Backdrop click handling
  - Prevents click-through to Phaser

**Key Features:**
- Fade in/out transitions
- Sound effects on open/close
- Backdrop options
- Focus management
- Size variants (sm, default, lg, fullscreen)

#### 9. Panel Components
- **Source:** `Sunflowerland-ref/src/components/ui/Panel.tsx`
- **Purpose:** Styled pixel-art panels with borders
- **Reusability:** **VERY HIGH - Foundation for all UI panels**
- **Adaptations Needed:**
  - Change color scheme to dark/undead theme
  - Keep border styles (pixelDarkBorderStyle, pixelLightBorderStyle)
  - Keep InnerPanel, OuterPanel, ButtonPanel variants
- **Target Location:** `src/features/combat/components/ui/Panel.tsx`
- **Integration Notes:**
  - Pixel-perfect border rendering
  - Support for nested panels
  - Button variants with hover/active states

**Panel Variants:**
- `Panel`: Double-layered with outer and inner borders
- `OuterPanel`: Single layer, darker border
- `InnerPanel`: Light border, for content areas
- `ButtonPanel`: Clickable panel with pressed state
- `DropdownButtonPanel` / `DropdownOptionsPanel`: Dropdown menus

**Color Theme Adaptation:**
```typescript
// Original (farm theme):
background: "#e4a672" (tan)

// Combat theme (dark/undead):
background: "#2a1a1f" (dark purple-gray)
borderColor: "#8b4a4a" (blood red tint)
```

#### 10. Progress Bar (React)
- **Source:** `Sunflowerland-ref/src/components/ui/ProgressBar.tsx`
- **Purpose:** React-based progress bars for UI (not Phaser)
- **Reusability:** **HIGH - Great for HUD and menus**
- **Adaptations Needed:**
  - Use in HUD overlays (wave progress, retreat countdown)
  - Use in squad selection (stat bars)
  - Use in post-battle screens (XP bars)
  - Add combat-specific color schemes
- **Target Location:** `src/features/combat/components/ui/ProgressBar.tsx`
- **Integration Notes:**
  - Multiple types: progress, health, error, buff, quantity
  - Resizable variants
  - Animated variants with react-spring
  - Timer display support

**Progress Types Available:**
- `progress`: Green (standard progress)
- `health`: Blue (HP bars)
- `error`: Red (danger, damage, defeat)
- `buff`: Purple (positive effects)
- `quantity`: Orange (item counts)

**Variants:**
- `ResizableBar`: Scales to any size, for HUD
- `Bar`: Fixed 15x7px, for Phaser overlays
- `AnimatedBar`: Smooth animated transitions
- `LiveProgressBar`: Self-updating countdown timer

#### 11. Button Component
- **Source:** `Sunflowerland-ref/src/components/ui/Button.tsx`
- **Purpose:** Styled pixel-art buttons
- **Reusability:** **HIGH - All interactive buttons**
- **Adaptations Needed:**
  - Theme to dark/undead aesthetic
  - Keep hover/active states
  - Keep disabled states
- **Target Location:** `src/features/combat/components/ui/Button.tsx`
- **Integration Notes:**
  - Consistent styling across all screens
  - Sound effects on click
  - Loading states support

#### 12. HudContainer
- **Source:** `Sunflowerland-ref/src/components/ui/HudContainer.tsx`
- **Purpose:** Container for absolutely positioned HUD elements
- **Reusability:** **HIGH - Essential for battle HUD**
- **Adaptations Needed:**
  - None - use as-is for HUD overlay
- **Target Location:** `src/features/combat/components/battle/HudContainer.tsx`
- **Integration Notes:**
  - Prevents click-through to Phaser
  - Proper z-index management
  - Positioned absolutely over canvas

### 16.4 Phaser Game Object Patterns

#### 13. Speech Bubble
- **Source:** `Sunflowerland-ref/src/features/world/containers/SpeechBubble.ts`
- **Purpose:** Displays speech bubbles above characters
- **Reusability:** **MEDIUM - Useful for battle messages**
- **Adaptations Needed:**
  - Use for special battle events ("BOSS INCOMING!", "VICTORY!")
  - Use for unit callouts (critical hits, ability activated)
  - Theme to combat aesthetic
- **Target Location:** `src/features/combat/phaser/entities/BattleMessage.ts`
- **Integration Notes:**
  - Floating text above units
  - Auto-fade after duration
  - Queue support for multiple messages

#### 14. Particle Effects (from Phaser emitters)
- **Source:** Various uses in Sunflowerland-ref
- **Purpose:** Particle effects for visual feedback
- **Reusability:** **HIGH - Essential for combat effects**
- **Adaptations Needed:**
  - Create combat-specific particles (blood, fire, poison, holy light)
  - Use Phaser particle emitters
  - Pool particles for performance
- **Target Location:** `src/features/combat/phaser/entities/EffectEmitter.ts`
- **Integration Notes:**
  - Use for damage effects
  - Use for status effects (burning, poisoned)
  - Use for explosions and AoE

**Combat Particle Types Needed:**
- Blood splatter (physical damage)
- Green bubbles (poison)
- Fire particles (burning)
- Purple dark energy (psychic)
- Golden sparks (holy)
- Explosion debris

### 16.5 Audio System

#### 15. Audio Controller
- **Source:** `Sunflowerland-ref/src/features/world/lib/AudioController.ts`
- **Purpose:** Manages sound effects with pooling and priority
- **Reusability:** **VERY HIGH - Essential for combat audio**
- **Adaptations Needed:**
  - Load combat sound effects (sword clangs, explosions, screams)
  - Implement sound pooling (limit simultaneous sounds)
  - Priority system (player actions > enemy actions)
- **Target Location:** `src/features/combat/lib/AudioController.ts`
- **Integration Notes:**
  - Prevents audio spam
  - Respects mute settings
  - Sound pooling for performance
  - Supports positional audio

**Pattern:**
```typescript
class AudioController {
  soundEffects: Phaser.Sound.BaseSound[] = [];

  play(soundKey: string, options?: Phaser.Types.Sound.SoundConfig) {
    if (isMuted) return;
    if (this.soundEffects.length > MAX_SOUNDS) {
      this.soundEffects[0].stop();
      this.soundEffects.shift();
    }
    const sound = this.scene.sound.add(soundKey, options);
    sound.play();
    this.soundEffects.push(sound);
  }
}
```

### 16.6 State Machine Integration

#### 16. XState Machine Patterns
- **Source:** Multiple XState machines throughout Sunflowerland-ref
- **Purpose:** State management for complex flows
- **Reusability:** **VERY HIGH - Essential for combat state**
- **Adaptations Needed:**
  - Create combat-specific state machine
  - States: idle, targetSelection, squadSelection, battleActive, battleVictory, battleDefeat, battleRetreat
  - Events: START_BATTLE, UNIT_DIED, RETREAT, VICTORY, DEFEAT
- **Target Location:** `src/features/combat/lib/combatMachine.ts`
- **Integration Notes:**
  - Already specified in LAYOUT-COMBAT.md Section 11.1
  - Follow existing game state machine pattern
  - Integrate with game registry

### 16.7 Utility Functions

#### 17. Time Formatting
- **Source:** `Sunflowerland-ref/lib/utils/time.ts`
- **Purpose:** Formats time remaining in readable format
- **Reusability:** **MEDIUM - Useful for cooldowns**
- **Adaptations Needed:**
  - Use for retreat countdown display
  - Use for battle duration tracking
- **Target Location:** `src/lib/utils/time.ts`

#### 18. Number Formatting
- **Source:** `Sunflowerland-ref/lib/utils/formatNumber.ts`
- **Purpose:** Formats large numbers (1000 → 1K)
- **Reusability:** **MEDIUM - Useful for damage/rewards**
- **Adaptations Needed:**
  - Use for damage numbers (10000 → 10K)
  - Use for rewards display
- **Target Location:** `src/lib/utils/formatNumber.ts`

---

## 17. Components NOT Applicable to Combat

These Sunflower Land features are **NOT** relevant to our combat system and should be **excluded**:

### Farming-Specific Components
- Crop planting/harvesting systems
- Garden plot management
- Watering/fertilizing mechanics
- Fruit tree systems
- Greenhouse management

### Blockchain/Web3 Components
- Wallet connection (Metamask, WalletConnect)
- Smart contract interactions
- NFT minting/burning
- Blockchain transaction management
- Token (SFL) management
- Marketplace listing/trading

### Multiplayer/MMO Components
- Colyseus server integration
- Player synchronization
- Chat systems (not needed for single-player combat)
- Social features (friend lists, guilds)
- PvP arena systems

### Land/Territory Management
- Island expansion
- Land plot purchasing
- Territory claiming
- Building placement on farm

### Complex Trading Systems
- Marketplace UI
- Player-to-player trading
- Auction systems
- Trade history

### Quest/Delivery Systems
- NPC delivery quests
- Order board mechanics
- Quest tracking UI
- Delivery routing

---

## 18. Adaptation Strategy

### High Priority (Implement First)
1. **Phaser-React Integration** - Foundation for combat system
2. **BumpkinContainer → UnitSprite** - Core unit rendering
3. **Modal & Panel Components** - All UI screens need these
4. **BaseScene → BaseCombatScene** - Scene architecture
5. **ProgressBar (both React and Phaser)** - Health bars, XP, progress
6. **AudioController** - Combat sound effects

### Medium Priority (Implement Second)
7. **SpriteAnimator** - UI animations (victory screens, portraits)
8. **Button Component** - Consistent button styling
9. **Label Component** - Unit name tags
10. **HudContainer** - Battle HUD overlay
11. **Time/Number Formatting** - Display utilities
12. **Speech Bubble → BattleMessage** - Combat callouts

### Low Priority (Polish Phase)
13. **Particle Effects** - Visual polish
14. **Advanced animations** - Celebration effects
15. **Advanced audio** - Positional audio, music transitions

---

## 19. Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- Set up Phaser-React integration
- Adapt BaseScene to BaseCombatScene
- Implement Modal, Panel, Button UI components
- Create PreloadScene for asset loading

### Phase 2: Core Combat (Week 3-4)
- Adapt BumpkinContainer to UnitSprite
- Implement health bars (Phaser + React variants)
- Implement damage number display
- Set up audio controller

### Phase 3: Battle Flow (Week 5-6)
- Implement combat state machine
- Build pre-battle UI (target/squad selection)
- Build battle HUD
- Build post-battle screens

### Phase 4: Polish (Week 7-8)
- Add particle effects
- Add sound effects for all actions
- Add battle messages/callouts
- Animation polish
- Performance optimization

---

## 20. File Organization

```
src/
├── components/
│   └── ui/                     # Reused Sunflower Land UI
│       ├── Modal.tsx           ← Adapted from SFL
│       ├── Panel.tsx           ← Adapted from SFL
│       ├── Button.tsx          ← Adapted from SFL
│       ├── ProgressBar.tsx     ← Adapted from SFL
│       └── HudContainer.tsx    ← Reused as-is from SFL
│
├── features/
│   └── combat/
│       ├── components/
│       │   ├── battle/
│       │   │   ├── PhaserBattlefield.tsx  ← Adapted from SFL Phaser.tsx
│       │   │   ├── BattleHUD.tsx
│       │   │   └── HudContainer.tsx       ← Reference SFL pattern
│       │   │
│       │   ├── pre-battle/
│       │   │   ├── SquadSelectionUI.tsx   ← Uses Panel, Modal from SFL
│       │   │   └── TargetSelectionUI.tsx  ← Uses Panel, Modal from SFL
│       │   │
│       │   └── post-battle/
│       │       ├── VictoryScreen.tsx      ← Uses Modal, Panel from SFL
│       │       └── DefeatScreen.tsx       ← Uses Modal, Panel from SFL
│       │
│       └── phaser/
│           ├── scenes/
│           │   ├── BaseCombatScene.ts     ← Adapted from SFL BaseScene.ts
│           │   ├── PreloadScene.ts        ← Adapted from SFL Preloader.ts
│           │   └── BattleScene.ts         ← NEW (uses patterns from SFL)
│           │
│           ├── entities/
│           │   ├── UnitSprite.ts          ← Adapted from SFL BumpkinContainer.ts
│           │   ├── HealthBar.ts           ← Adapted from SFL ProgressBarContainer.ts
│           │   ├── Label.ts               ← Reused from SFL Label.ts
│           │   └── EffectEmitter.ts       ← NEW (uses Phaser particle patterns)
│           │
│           └── lib/
│               └── AudioController.ts     ← Adapted from SFL AudioController.ts
│
└── lib/
    └── utils/
        ├── time.ts              ← Reused from SFL
        └── formatNumber.ts      ← Reused from SFL
```

---

## 21. Code Reuse Benefits

By leveraging Sunflower Land components, we gain:

### Proven Patterns
- Battle-tested Phaser-React integration
- Robust event handling between Phaser and React
- Pixel-perfect UI component styling
- Performance-optimized sprite management

### Faster Development
- ~60% reduction in UI development time (Modal, Panel, Button already built)
- ~40% reduction in Phaser setup time (BaseScene, Preloader patterns)
- ~50% reduction in animation/audio time (Controllers and utilities ready)

### Consistent Quality
- Accessibility built-in (Modal uses Headless UI)
- Sound effects and transitions included
- Pixel-art aesthetic already perfected
- Responsive design patterns

### Reduced Bugs
- Proven code reduces risk of new bugs
- Edge cases already handled
- Performance optimizations already applied

---

**Document Metadata:**

- **Version:** 1.0
- **Last Updated:** 2025-11-12
- **Author:** Combat Mechanics Specialist (AI Agent)
- **Status:** Complete - Ready for Implementation
