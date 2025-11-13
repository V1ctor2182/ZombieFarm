---
title: 'Farm Layout & Mechanisms'
last updated: 2025-11-12
author: Farm Agent (farm-module-dev)
version: 1.0
---

# Farm Layout & Mechanisms

This document defines the visual layout, UI structure, and interaction mechanisms for the Farm module in Zombie Farm. It serves as the implementation blueprint for rendering the farm, managing player interactions, and organizing farm-related UI components.

---

## Table of Contents

1. [Farm Visual Layout](#1-farm-visual-layout)
2. [Farm Zones & Areas](#2-farm-zones--areas)
3. [Plot System Mechanics](#3-plot-system-mechanics)
4. [Zombie Management on Farm](#4-zombie-management-on-farm)
5. [Building Placement System](#5-building-placement-system)
6. [Resource Gathering Mechanics](#6-resource-gathering-mechanics)
7. [Farm HUD Design](#7-farm-hud-design)
8. [Time & Weather Visual Effects](#8-time--weather-visual-effects)
9. [UI Component Hierarchy](#9-ui-component-hierarchy)
10. [State Flow](#10-state-flow)

---

## 1. Farm Visual Layout

### Farm Grid System

The farm uses a **tile-based grid system** for placement, collision detection, and pathfinding:

**Grid Specifications:**

- **Initial Dimensions:** 20x20 tiles (400 tiles total)
- **Tile Size:** 32x32 pixels (standard for pixel art games)
- **Total Initial Area:** 640x640 pixels
- **Expansion:** Can expand to 50x50 tiles (endgame farm)
- **Coordinate System:** Origin (0,0) at top-left corner

**Tile Types:**

| Tile Type         | Walkable | Buildable | Description                                       |
| ----------------- | -------- | --------- | ------------------------------------------------- |
| **Empty**         | Yes      | Yes       | Default grass/dirt tile, nothing placed           |
| **Plot**          | No       | No        | Occupied by zombie plot (1x1)                     |
| **Building**      | No       | No        | Occupied by structure (varies size)               |
| **Path**          | Yes      | No        | Player-placed walkway (cosmetic/pathfinding hint) |
| **Decoration**    | Yes      | No        | Decorative items (gravestones, skulls)            |
| **Obstacle**      | No       | No        | Natural obstacles (dead trees, rocks, rubble)     |
| **Resource Node** | No       | No        | Harvestable resources (grave mounds, bone piles)  |

**Grid Visualization:**

```
[Sample 10x10 starting area]

O O O O O O O O O O    Legend:
O . . . . . . . . O    O = Obstacle (dead tree, rock)
O . P P P . H H H O    . = Empty (buildable/walkable)
O . P P P . H C H O    P = Plot (zombie growing)
O . P P P . H H H O    H = Necromancer's Hut (3x3)
O . . . . . . . . O    C = Crypt (1x1 entrance)
O . W W . . . . . O    W = Blood Well (2x2)
O . W W . . . . . O    R = Resource node
O . R . . . . . . O    Z = Roaming zombie
O O O O O O O O O O
```

**Plot Placement Rules:**

- Plots must be on **Empty** or cleared tiles
- Cannot overlap other structures or obstacles
- Must have 0 tile spacing between plots (can be adjacent)
- No maximum clustering limit (players can create large plot farms)

**Building Footprints:**

| Building          | Size (tiles) | Rotatable | Special Notes                          |
| ----------------- | ------------ | --------- | -------------------------------------- |
| Zombie Plot       | 1x1          | No        | Basic growing location                 |
| Necromancer's Hut | 3x3          | Yes       | Player's home, center must be walkable |
| Crypt             | 2x2          | Yes       | Zombie storage entrance                |
| Blood Well        | 2x2          | No        | Resource generator                     |
| Corpse Composter  | 2x2          | Yes       | Resource converter                     |
| Mausoleum         | 3x3          | Yes       | Capacity increase structure            |
| Training Dummy    | 1x1          | No        | Zombie training facility               |
| Command Center    | 4x4          | Yes       | Late-game strategic building           |
| Bone Mill         | 2x2          | Yes       | Fertilizer production                  |
| Mutation Lab      | 3x3          | Yes       | Zombie enhancement station             |
| Guard Tower       | 2x2          | Yes       | Defense structure                      |
| Decorations       | 1x1 to 2x2   | Varies    | Happiness boosters                     |

### Camera View

**Perspective:** **Top-down 2D orthogonal view** (like Stardew Valley, not isometric)

- Easier for pixel art production
- Simpler pathfinding and collision detection
- Clearer for tile-based building placement
- More accessible for mobile touch controls

**Camera System:**

- **Initial Zoom:** 1.0x (shows ~15x12 tiles on 1920x1080 screen)
- **Zoom Levels:** 0.5x (far), 1.0x (normal), 1.5x (close), 2.0x (very close)
- **Zoom Controls:**
  - Mouse wheel / pinch gesture
  - Buttons: [+] and [-] on UI
  - Keyboard: `=` and `-` keys
- **Smooth Zoom:** 300ms ease-in-out transition

**Panning/Scrolling:**

- **Mouse:** Click and drag background (middle mouse button)
- **Keyboard:** WASD or Arrow keys move camera
- **Touch:** Single-finger drag (when not interacting with object)
- **Edge Scrolling:** Optional - moving cursor to screen edge pans camera
- **Auto-Center:** Double-click Necromancer portrait to center on player character

**Camera Bounds:**

- Camera restricted to farm boundaries (cannot scroll beyond farm edges)
- Smart focus: Camera follows player character during movement
- Camera "catch-up" speed: 0.2s delay for smooth following

**Minimap:**

- **Position:** Bottom-right corner of screen
- **Size:** 150x150 pixels (shows entire farm at once)
- **Opacity:** 80% (semi-transparent)
- **Features:**
  - White dot: Player character position
  - Green squares: Plots with ready zombies
  - Blue squares: Plots growing
  - Red dots: Roaming zombies
  - Yellow icons: Important buildings
  - Click to jump camera to that location
- **Toggle:** `M` key or button to show/hide

---

## 2. Farm Zones & Areas

The farm can be conceptually divided into functional zones, though placement is entirely player-driven.

### Core Farm Area (Starting Zone)

**Initial Biome:** Forgotten Graveyard

- **Size:** 20x20 tiles (expanded from center)
- **Theme:** Dark soil, scattered tombstones, dead grass, creepy fog
- **Pre-placed Structures:**
  - Necromancer's Hut (3x3) at coordinates (8, 8) - center-left
  - Small Crypt entrance (2x2) at (15, 8) - right side
  - 3 Empty Plots at (5, 10), (6, 10), (7, 10) - tutorial starter plots
- **Initial Obstacles:**
  - 8-12 Dead Trees (choppable for Rotten Wood)
  - 5-8 Grave Mounds (diggable for Bones)
  - 3-5 Rubble Piles (clearable for space, minor resources)

### Expansion Zones

As players expand, new biome tiles unlock at the edges:

**Expansion Order:**

1. **North Expansion (Level 5):** Adds 20x10 tiles - Haunted Forest theme
2. **East Expansion (Level 8):** Adds 10x20 tiles - Bone Desert theme
3. **South Expansion (Level 12):** Adds 20x10 tiles - Toxic Swamp theme
4. **West Expansion (Level 15):** Adds 10x20 tiles - Ruins theme
5. **Additional Expansions (Level 20+):** Fill in corners to reach 50x50

**Expansion Costs:**

- First Expansion: 100 Dark Coins, 50 Rotten Wood, 50 Bones
- Second: 250 Dark Coins, 100 Wood, 100 Bones, 25 Blood Water
- Third: 500 Dark Coins, 200 Wood, 200 Bones, 50 Blood Water, 25 Corpse Dust
- Fourth+: Scaling costs with additional rare resources

**Biome Effects:**

| Biome              | Visual Theme                  | Gameplay Effect                                 |
| ------------------ | ----------------------------- | ----------------------------------------------- |
| **Graveyard**      | Gray soil, tombstones, fog    | Balanced, no modifiers                          |
| **Haunted Forest** | Dead trees, dark green        | +10% zombie growth speed at night               |
| **Bone Desert**    | Sand, sun-bleached bones      | Zombies grown here: +15% defense, -10% speed    |
| **Toxic Swamp**    | Murky water, green mist       | Plots auto-water once/day, +15% mutation chance |
| **Ruins**          | Broken columns, ancient stone | +5% XP from harvests, rare artifact finds       |

### Functional Zones (Player-Defined)

**Planting Area (Zombie Fields):**

- **Suggested Location:** North or east section for space
- **Typical Size:** 20-50 plots endgame (starting with 3-10 early game)
- **Organization Strategies:**
  - Grid pattern: Plots in neat rows (efficient)
  - Cluster pattern: Groups by zombie type (Shamblers together, etc.)
  - Mixed pattern: Random placement (aesthetic but harder to manage)

**Production Area (Resource Buildings):**

- **Key Buildings:** Blood Well, Corpse Composter, Bone Mill
- **Suggested Location:** Central, near Necromancer's Hut
- **Layout:** Cluster production buildings for quick access

**Storage Area (Crypt & Inventory):**

- **Crypt Building:** Zombies enter/exit here for storage
- **Suggested Location:** Safe spot (away from farm edge if raids can occur)
- **Expansion:** Can build additional Mausoleums to increase capacity (decorative but functional)

**Living Area (Zombie Roaming Grounds):**

- **Open Space:** 30-40% of farm should remain open for zombies to wander
- **Paths:** Player-placed path tiles guide zombie movement (optional)
- **Decorations:** Bonfire, scarecrows, skull piles - boost happiness
- **Social Zones:** Zombies naturally congregate near decorations

**Training Area:**

- **Training Dummy:** 1x1 structure where zombies idle to gain XP
- **Training Yard (future):** Fenced area (player builds fence tiles around space)
- **Capacity:** Multiple dummies can be placed; 1 zombie per dummy

**Mutation Laboratory (Level 15+):**

- **Building:** 3x3 Mutation Lab structure
- **Purpose:** Interface to apply mutations, upgrades, or evolution to zombies
- **Location:** Often near Crypt for easy access to stored zombies

**Command Center (Level 20+):**

- **Building:** 4x4 Command Center
- **Purpose:** War room for planning raids, researching upgrades
- **Strategic Placement:** Central or near Crypt; acts as rally point

**Defense Perimeter (Raid Defense):**

- **Structures:** Guard Towers, Spike Walls, Traps
- **Layout:** Perimeter around farm edges or protecting key buildings
- **Triggered:** Only relevant if player farm can be raided (future feature)

---

## 3. Plot System Mechanics

Plots are the core farming element where zombies are grown.

### Plot States

Each plot has a state machine governing its lifecycle:

```
EMPTY → PLANTED → GROWING → READY → HARVESTED → EMPTY
```

**State Definitions:**

| State         | Visual Representation                                        | Player Actions Available    |
| ------------- | ------------------------------------------------------------ | --------------------------- |
| **EMPTY**     | Bare tilled grave mound, dark soil                           | Plant seed                  |
| **PLANTED**   | Fresh grave with small marker, seed just added               | Water, Fertilize            |
| **GROWING**   | Progressive stages: Bone Sprout → Rising Corpse → Half-Risen | Water, Fertilize, Inspect   |
| **READY**     | Fully formed zombie hand/head visible, eerie glow            | Harvest                     |
| **HARVESTED** | (Transitions immediately to EMPTY after harvest)             | (None - instant transition) |

**Growing Sub-States (Visual Progression):**

For a zombie with 10-minute growth time:

1. **Fresh Grave (0-25%):** Just planted, grave marker visible
2. **Bone Sprout (25-50%):** Skeletal fingers poke through soil
3. **Rising Corpse (50-75%):** Zombie arm extended from ground
4. **Half-Risen (75-99%):** Zombie upper body visible, head emerged
5. **Ready (100%):** Fully formed zombie, moaning, ready indicator (sparkle effect)

**State Transition Timers:**

- Timer starts when plot enters **PLANTED** state
- Timer decreases based on:
  - Base growth time (from seed config)
  - Water bonus: -20% time if watered (applied once per day cycle)
  - Fertilizer bonus: -10% to -50% depending on fertilizer type
  - Weather bonus: Blood Rain = -100% remaining time (instant ready)
  - Biome bonus: e.g., Haunted Forest = -10% at night
- Timer paused if: (optional) player is offline and hasn't enabled offline progression setting

**Visual Indicators:**

- **Progress Bar:** Hover over plot shows growth progress (e.g., "75% grown - 2m 30s remaining")
- **Status Icons:**
  - Water droplet icon if watered today (blue)
  - Fertilizer icon if fertilized (green leaf)
  - Warning icon if neglected (no water 2+ days) - red exclamation
- **Ready State:** Glowing green aura + sparkle particle effect + sound cue (moaning)

### Plot Interactions

**Click/Tap Behaviors:**

| Plot State  | Action                          | Result                                                             |
| ----------- | ------------------------------- | ------------------------------------------------------------------ |
| **EMPTY**   | Click with seed selected        | Opens seed selection modal → Plant seed                            |
| **PLANTED** | Click with water bucket         | Apply water → +20% growth speed for this cycle                     |
| **GROWING** | Click with fertilizer           | Apply fertilizer → Apply growth/quality bonus                      |
| **GROWING** | Click (no tool)                 | Open info panel: Shows zombie type, growth progress, stats preview |
| **READY**   | Click with scythe (or any time) | Harvest animation → Zombie emerges → Transitions to EMPTY          |

**Seed Selection UI:**

1. Player clicks empty plot or presses hotkey `P` (Plant)
2. Modal opens: "Select Seed to Plant"
   - Grid of seed icons (owned seeds only, grayed out if none)
   - Each seed shows: Icon, Name, Growth Time, Quantity Owned
   - Hover for tooltip: Zombie type details, preferred season, water needs
3. Click seed → Confirm → Seed planted, inventory decremented, plot state = PLANTED

**Watering Mechanics:**

- **Requirement:** Player must have Blood Water in inventory (or be near Blood Well)
- **Action:** Select water bucket tool → Click plot
- **Effect:** Plot gains "Watered" status for 1 day cycle (20 minutes real-time day)
- **Visual:** Plot becomes darker/muddier, water droplet icon appears
- **Benefit:** Growth speed +20% for this day cycle
- **Limit:** Can only water once per day cycle per plot (additional watering has no effect)
- **Neglect:** If not watered for 2+ day cycles, growth pauses until watered

**Fertilizing Mechanics:**

- **Types of Fertilizer:**
  - **Bone Meal (Common):** +10% growth speed, costs 5 Bones
  - **Corpse Dust (Uncommon):** +25% growth speed, +1 quality tier chance, costs 10 Corpse Dust
  - **Dark Essence (Rare):** +50% growth speed, +20% mutation chance, costs 5 Dark Essence
  - **Soul Fragment (Epic):** +100% growth speed, guarantees +1 quality tier, costs 1 Soul Fragment
- **Application:** Select fertilizer → Click plot → Choose to apply
- **Timing:** Can be applied once per plot per growth cycle (at any stage, but best at planting)
- **Stacking:** Only one fertilizer type per plot (applying another replaces previous)

**Plot Inspection:**

- **Hover Tooltip:** Quick info - "Shambler (Growing) - 65% - 3m 12s remaining"
- **Detailed Panel (click):**
  ```
  [Zombie Preview Image]
  Type: Shambler
  Quality Estimate: Silver (Good Care)
  Growth Progress: 65% (3m 12s remaining)
  Care Status:
    - Watered Today: Yes ✓
    - Fertilized: Bone Meal (Active)
    - Weather Bonus: None
  Expected Stats: HP: 120-150, ATK: 15-20, DEF: 8-12
  [Close Button]
  ```

---

## 4. Zombie Management on Farm

Once harvested, zombies become autonomous entities on the farm.

### Active Zombies

**Spawn Behavior:**

- Upon harvest, zombie spawns at plot location
- Plays emergence animation (climbs out of ground, 2s)
- Transitions to idle state, begins roaming

**Zombie Representation:**

- **Sprite:** 32x32 animated sprite (idle, walk, interaction animations)
- **Nameplate:** Optional floating name (e.g., "Shambler #7") - toggle in settings
- **Quality Indicator:** Visual differences by quality:
  - Bronze: Standard sprite, slight decay
  - Silver: Cleaner sprite, full limbs
  - Gold: Glowing eyes, polished bones
  - Iridium: Aura effect, particle trail
- **Type Visual:** Different sprites per zombie type (Shambler, Runner, Brute, etc.)

**Roaming AI (Simple State Machine):**

```
States: IDLE → WANDER → SOCIAL → TASK → IDLE
```

**AI Behaviors:**

| State      | Duration           | Behavior                                                                    |
| ---------- | ------------------ | --------------------------------------------------------------------------- |
| **IDLE**   | 5-10s              | Stand still, play idle animation (looking around, scratching)               |
| **WANDER** | 10-20s             | Pathfind to random nearby point (within 5-10 tiles), walk there             |
| **SOCIAL** | 10-15s             | If near another zombie (<3 tiles), face each other, play social animation   |
| **TASK**   | Varies             | If near Training Dummy, interact with it; if near decoration, gather around |
| **FOLLOW** | Until command ends | If player commands "Follow", zombie pathfinds to stay near player           |

**Pathfinding:**

- Use A\* pathfinding on farm grid
- Avoid obstacles (buildings, plots, resource nodes)
- Can walk on paths (prefer paths if available)
- Collision: Zombies push each other slightly if too close (soft collision)

**Zombie Count Display:**

- **HUD Element:** "Zombies: 7/10" (active/capacity)
- **Color Coding:**
  - Green: Below 70% capacity
  - Yellow: 70-90% capacity
  - Red: 90-100% capacity
  - Flashing red: At max capacity (new harvests go to Crypt)

**Capacity Indicator:**

- **Starting Cap:** 10 active zombies
- **Increase Methods:**
  - Build Mausoleum: +5 capacity per building
  - Research "Horde Management I-V": +5/10/15/20/25 capacity
  - Necromancer level milestone: +2 per 5 levels
- **Max Capacity:** ~100 active zombies (endgame)

**Visual Differentiation:**

- **By Type:** Shamblers (slow, hunched), Runners (lean, fast), Brutes (large, muscular)
- **By Quality:** Bronze (gray tone), Silver (normal color), Gold (slight glow), Iridium (aura)
- **By Happiness:**
  - Very Happy: Green heart icon floating above, bouncy walk
  - Happy: Occasional heart icon
  - Neutral: Normal behavior
  - Unhappy: Red frown icon, slouched posture
  - Very Unhappy: Red angry icon, slower movement, occasional refuse command

### Interactions with Zombies

**Click Zombie Actions:**

| Click Type       | Action Menu Opens                               |
| ---------------- | ----------------------------------------------- |
| **Single Click** | Selects zombie, shows info panel                |
| **Right Click**  | Context menu: Pet, Feed, Command, Send to Crypt |

**Info Panel (Left Side Slide-Out):**

```
[Zombie Sprite Animation]

Name: Shambler #7
Type: Shambler (Common)
Quality: Gold
Level: 3 (XP: 245/500)

Stats:
  HP: 150/150
  Attack: 20
  Defense: 12
  Speed: 5

Status:
  Happiness: 😊 Happy (85%)
  Last Fed: 2h ago
  Decay: 0% (Well Fed)

Traits:
  - Regeneration I (Heals 1 HP/s)

[Pet Button] [Feed Button] [Close]
```

**Pet Action:**

- **Cooldown:** Once per zombie per day cycle (20 min real-time)
- **Effect:** +10% Happiness immediately
- **Animation:** Player character pats zombie head, heart icon appears
- **Sound:** Happy moan sound effect
- **Feedback:** "Shambler #7 enjoyed that! +10% Happiness"

**Feed Action:**

1. Click "Feed" or right-click → "Feed"
2. Opens feed selection modal:

   ```
   Feed Shambler #7

   Select Food:
   [ Rotten Meat (x15) ] - Restores hunger, +5% Happiness
   [ Brain Morsel (x3) ] - Restores hunger, +15% Happiness, +10 XP
   [ Soul Essence (x1) ] - Restores hunger, +25% Happiness, +50 XP (rare)

   [Cancel] [Confirm]
   ```

3. Select food → Confirm → Zombie eats (animation), hunger reset, happiness boost
4. **Effect:** Resets daily decay counter, prevents stat decay for 24h (1 in-game day)

**Command Actions:**

| Command         | Hotkey | Effect                                                                                 |
| --------------- | ------ | -------------------------------------------------------------------------------------- |
| **Follow Me**   | F      | Zombie follows player character (pathfinds to stay within 2 tiles)                     |
| **Stay Here**   | S      | Zombie stops at current location, enters IDLE state permanently until commanded again  |
| **Go to Crypt** | C      | Zombie pathfinds to Crypt entrance, enters storage (removed from active farm)          |
| **Train**       | T      | Zombie pathfinds to nearest Training Dummy, begins training (gains XP over time)       |
| **Guard Area**  | G      | Zombie patrols small area around current location (useful for defense, future feature) |

**Mass Selection:**

- Click and drag rectangle to select multiple zombies
- Selected zombies highlighted with green outline
- Mass commands apply to all selected (e.g., "Send All to Crypt")

### Crypt Storage

**Purpose:** Store excess zombies beyond active capacity limit

**Access Methods:**

1. Click Crypt building on farm → Opens Crypt UI
2. Press hotkey `V` (Vault) → Opens Crypt UI
3. Right-click zombie → "Send to Crypt" (quick store)

**Crypt Management UI (Modal):**

```
=== CRYPT STORAGE ===

Active Zombies: 10/10 (Full!)
Stored Zombies: 23

[Filter: All Types ▼] [Sort: Level ▼] [Search: _____]

Stored Zombies:
┌─────────────────────────────────────────────┐
│ [Sprite] Shambler #1  | Lvl 5 | Gold        │ [Deploy]
│ [Sprite] Runner #2    | Lvl 8 | Silver      │ [Deploy]
│ [Sprite] Brute #3     | Lvl 12| Iridium     │ [Deploy]
│ ...                                          │
└─────────────────────────────────────────────┘

[Deploy Selected (5)] [Close]
```

**Deploy Mechanic:**

- Click "Deploy" next to zombie → If space available, zombie spawns at Crypt entrance on farm
- If no space: "Cannot deploy - farm at max capacity (10/10)"
- **Auto-Store:** When harvesting and farm is full, zombie auto-stores in Crypt with notification

**Storage Benefits:**

- **No Decay:** Zombies in Crypt do not decay (suspended animation)
- **No Resource Consumption:** Don't need to feed stored zombies
- **Unlimited Capacity:** Crypt can hold infinite zombies (no storage limit)
- **Preservation:** Stats, level, happiness frozen until deployed

---

## 5. Building Placement System

Free placement system allows players to design their farm layout.

### Build Mode

**Activation:**

- Press `B` key (Build Mode) or click "Build" button on HUD
- Farm enters Build Mode: Grid overlay appears (semi-transparent)

**Build Mode UI:**

**Left Sidebar (Build Menu):**

```
=== BUILD MENU ===

[Search: _____]

Categories:
► Plots & Gardens (5)
  - Zombie Plot (5 Wood, 5 Bones)
  - Enhanced Plot (15 Wood, 10 Bones, 5 Corpse Dust)

► Production (4)
  - Blood Well (25 Wood, 15 Bones, 10 Blood Water)
  - Corpse Composter (30 Wood, 20 Bones)
  - Bone Mill (40 Wood, 30 Bones, 10 Iron)

► Storage (3)
  - Crypt (50 Wood, 40 Bones) [Capacity +5]
  - Mausoleum (100 Wood, 80 Bones, 50 Stone) [Capacity +10]

► Training (2)
  - Training Dummy (15 Wood, 10 Bones)
  - Training Yard (80 Wood, 60 Bones) [+20% XP in area]

► Defense (3)
  - Guard Tower (60 Wood, 40 Stone, 20 Iron)
  - Spike Wall (20 Wood, 15 Bones)

► Decorations (12)
  - Skull Pile (5 Bones) [+5% Happiness nearby]
  - Bonfire (10 Wood) [+10% Happiness nearby]
  - Gravestone (8 Stone) [Aesthetic]

[Exit Build Mode]
```

**Building Selection:**

1. Click building in menu
2. Ghost preview appears at cursor (semi-transparent, follows mouse)
3. Preview color:
   - **Green:** Valid placement
   - **Red:** Invalid (collision, insufficient space, blocked)
4. Grid squares under preview highlighted to show footprint

**Placement Validation:**

- Check all tiles under building footprint
- Must all be EMPTY, WALKABLE, and BUILDABLE
- Cannot overlap other buildings, plots, obstacles
- Special rules:
  - Crypt must be accessible (at least 1 adjacent walkable tile)
  - Blood Well cannot be adjacent to another Blood Well (minimum 2 tile spacing)

**Confirm Placement:**

- **Left Click:** Place building at current location
  - Deduct resources from inventory
  - Building appears instantly (or with construction animation)
  - Play construction sound effect
  - Show confirmation: "Blood Well constructed!"
- **Right Click / ESC:** Cancel, return to build menu

**Rotation (if applicable):**

- **R Key:** Rotate building 90° clockwise before placement
- Buildings with rotation: Necromancer's Hut, Crypt, Mausoleum, Command Center
- Buildings without rotation (symmetrical): Blood Well, Training Dummy, Plots

### Building Types Layout

**Detailed Building Specifications:**

**1. Zombie Plot (1x1)**

- **Cost:** 5 Rotten Wood, 5 Bones
- **Build Time:** Instant
- **Function:** Single plot for growing one zombie
- **Unlock:** Available from start

**2. Blood Well (2x2)**

- **Cost:** 25 Rotten Wood, 15 Bones, 10 Blood Water
- **Build Time:** 30s
- **Function:** Generates 1 Blood Water every 5 minutes (max capacity: 10)
- **Interaction:** Click to collect accumulated Blood Water
- **Visual:** Animated well with blood dripping
- **Unlock:** Level 2

**3. Corpse Composter (2x2)**

- **Cost:** 30 Rotten Wood, 20 Bones
- **Build Time:** 45s
- **Function:** Converts organic waste into Corpse Dust
  - Input: 10 Rotten Meat or 5 Zombie Parts
  - Output: 5 Corpse Dust
  - Processing Time: 1 hour
- **Interaction:** Click to open composter UI (add input, collect output)
- **Unlock:** Level 4

**4. Mausoleum (3x3)**

- **Cost:** 100 Rotten Wood, 80 Bones, 50 Stone
- **Build Time:** 2 minutes
- **Function:** +10 active zombie capacity
- **Aesthetic:** Large ornate crypt building
- **Unlock:** Level 8

**5. Training Dummy (1x1)**

- **Cost:** 15 Rotten Wood, 10 Bones
- **Build Time:** Instant
- **Function:** Zombie can interact to gain XP over time
  - Rate: 10 XP per minute while training
  - Capacity: 1 zombie per dummy
- **Visual:** Scarecrow-like dummy with target
- **Unlock:** Level 5

**6. Command Center (4x4)**

- **Cost:** 200 Rotten Wood, 150 Bones, 100 Stone, 50 Iron, 10 Soul Essence
- **Build Time:** 5 minutes
- **Function:** Unlocks raid planning UI, research tech tree
- **Interaction:** Click to open Command Center interface
- **Unlock:** Level 20

**7. Mutation Lab (3x3)**

- **Cost:** 150 Rotten Wood, 100 Bones, 50 Dark Essence
- **Build Time:** 3 minutes
- **Function:** Interface to mutate zombies, apply enhancements
- **Interaction:** Click to open mutation UI
- **Unlock:** Level 15

**8. Guard Tower (2x2)**

- **Cost:** 60 Rotten Wood, 40 Stone, 20 Iron
- **Build Time:** 90s
- **Function:** Defense building for raid protection (+25 defense rating)
- **Visual:** Tall tower with zombie guard at top
- **Unlock:** Level 12

**9. Decorations (Various 1x1 or 2x2)**

- **Skull Pile (1x1):** 5 Bones - +5% Happiness to zombies within 5 tiles
- **Bonfire (1x1):** 10 Wood - +10% Happiness within 5 tiles, light source at night
- **Gravestone (1x1):** 8 Stone - Aesthetic, no function
- **Bone Sculpture (2x2):** 20 Bones - +15% Happiness within 8 tiles
- **Death Totem (1x1):** 15 Bones, 5 Dark Essence - +10% mutation chance for plots within 5 tiles

### Rearranging & Removal

**Move Building:**

1. Enter Build Mode
2. Click existing building → Highlight in yellow
3. Drag to new location (ghost preview follows)
4. If valid (same rules as initial placement) → Building moves
5. **Cost:** Free to move (encourage experimentation)
6. **Restriction:** Cannot move while building is in use (e.g., plot with growing zombie, composter processing)

**Remove Building:**

1. Enter Build Mode
2. Click building → Opens context menu: [Move] [Remove] [Cancel]
3. Click "Remove" → Confirmation modal: "Remove Blood Well? Refund: 12 Wood, 7 Bones"
4. Confirm → Building removed, partial resource refund (50% of original cost)
5. Tile becomes EMPTY again

**Refund Logic:**

- Refund 50% of construction costs (rounded down)
- Instant removal (no deconstruction time)
- Cannot remove Necromancer's Hut (main building)

---

## 6. Resource Gathering Mechanics

Resources are collected from nodes on the farm and through production buildings.

### Resource Nodes

**Types of Nodes:**

| Node Type        | Resource Yield             | Respawn Time | Tool Required           |
| ---------------- | -------------------------- | ------------ | ----------------------- |
| **Dead Tree**    | 5-8 Rotten Wood            | 2 hours      | Axe (or Scythe)         |
| **Grave Mound**  | 3-6 Bones                  | 90 minutes   | Shovel                  |
| **Debris Pile**  | 2-4 Rotten Wood, 1-2 Bones | 1 hour       | Shovel or Scythe        |
| **Bone Pile**    | 4-7 Bones                  | 2 hours      | None (click to collect) |
| **Blood Puddle** | 2-3 Blood Water            | 30 minutes   | Bucket (or click)       |

**Gathering Flow:**

**1. Dead Tree (Choppable):**

- **Visual:** Gnarled dead tree, 1x1 tile obstacle
- **Interaction:**
  1. Player equips Axe or Scythe tool (select from hotbar)
  2. Click dead tree
  3. Progress bar appears: "Chopping... [==== ] 40%" (5 seconds duration)
  4. Player character plays chopping animation (3 swings)
  5. On completion: Tree disappears, resources pop out with animation
  6. Floating text: "+6 Rotten Wood"
  7. Resources auto-collected (added to inventory)
  8. Tile becomes EMPTY
  9. After 2 hours: Tree respawns at same location (or new trees spawn randomly in cleared areas)

**2. Grave Mound (Diggable):**

- **Visual:** Small mound of dirt with skull marker, 1x1 tile
- **Interaction:**
  1. Equip Shovel tool
  2. Click grave mound
  3. Progress bar: "Digging... [====== ] 60%" (4 seconds)
  4. Player character digs animation (2 shovels)
  5. Completion: Mound removed, bones pop out
  6. "+5 Bones"
  7. Tile becomes EMPTY
  8. Respawn: 90 minutes later at same or nearby location

**3. Blood Well (Time-Based Accumulation):**

- **Visual:** 2x2 stone well filled with blood, animated drip effect
- **Mechanic:** Passive generation
  - Generates 1 Blood Water every 5 minutes (real-time)
  - Max capacity: 10 Blood Water stored
  - If at max, stops generating until collected
- **Interaction:**
  1. Click Blood Well
  2. If resources available: "Collect 7 Blood Water?"
  3. Click "Collect" → Resources added to inventory, well resets to 0
  4. Visual: Blood level in well lowers to empty
- **Indicator:** Number floating above well shows current stored amount (e.g., "7/10")

**4. Corpse Composter (Conversion):**

- **Visual:** 2x2 wooden structure with grinding mechanism
- **Interaction (Input):**
  1. Click Composter → Opens UI:

     ```
     === CORPSE COMPOSTER ===

     Input Slot: [Empty]
     (Place Rotten Meat or Zombie Parts)

     Output Slot: [Empty]

     Recipe: 10 Rotten Meat → 5 Corpse Dust (1 hour)

     [Start Processing] (grayed out until input added)
     ```

  2. Drag 10 Rotten Meat from inventory to Input Slot
  3. Click "Start Processing"
  4. Progress bar begins: "Processing... [== ] 33% - 40m remaining"
  5. Player can close UI, composter continues processing
  6. After 1 hour: Notification "Composter finished! Collect Corpse Dust."
  7. Click Composter → Output Slot shows 5 Corpse Dust
  8. Click "Collect" → Resources added to inventory

**Visual Feedback:**

- **Progress Indicator:** Smoke particle effect from composter while processing
- **Completion:** Glowing green indicator when ready to collect
- **Sound:** Grinding sound effect during processing (ambient)

### Automatic Gathering (Optional Future Feature)

**Zombie Workers:**

- Assign zombies to gather resources automatically
- Zombie with "Worker" trait can chop trees/dig mounds
- Slower than player but passive income
- Requires Level 10+ and specific research unlock

---

## 7. Farm HUD Design

The Heads-Up Display provides constant information and quick access to actions.

### Top Bar (Resource Display)

**Layout:** Horizontal bar across top of screen, semi-transparent dark background

**Left Side (Primary Resources):**

```
[Icon] Rotten Wood: 145  [Icon] Bones: 78  [Icon] Blood Water: 23  [Icon] Corpse Dust: 12  [Icon] Soul Fragments: 3
```

**Right Side (Currencies):**

```
[Icon] Dark Coins: 1,450  [Icon] Soul Essence: 8
```

**Display Format:**

- Icons: 24x24 pixel art icons for each resource
- Numbers: White text, large font (16px)
- Tooltips on hover: Full resource name and description
- Color coding: Numbers turn red if below critical threshold (e.g., <5 for commonly used resources)

**Animations:**

- When resource gained: Number flashes green, scales up 120% briefly, returns to normal
- When resource spent: Number flashes red, scales down 80% briefly
- Floating "+X" text animation when collecting resources

### Side Panel (Right Side)

**Zombie Counter:**

```
┌─────────────────────────┐
│ 🧟 ZOMBIES: 7/10        │
│ [████████░░] 70%        │
│                         │
│ [Manage Crypt]          │
└─────────────────────────┘
```

- Bar color: Green (0-70%), Yellow (70-90%), Red (90-100%)
- Click "Manage Crypt" → Opens Crypt UI

**Time Display:**

```
┌─────────────────────────┐
│ ☀️ DAY 5 - 14:32        │
│ [████████████░░░░]      │
│ (6m 28s until night)    │
└─────────────────────────┘
```

- Icon changes: Sun (day), Moon (night)
- Progress bar: Fills from left to right as day progresses
- Tooltip: "In-game day/night cycle: 20m day, 10m night"

**Weather Indicator:**

```
┌─────────────────────────┐
│ ☁️ WEATHER: Foggy       │
│ Effects:                │
│ • Zombies +5% Happiness │
└─────────────────────────┘
```

- Icon changes based on weather (sun, rain, fog, storm)
- Lists active weather effects
- Click for detailed weather forecast (next 3 cycles)

**Quick Actions:**

```
┌─────────────────────────┐
│ [🔨 Build]              │
│ [📦 Crypt]              │
│ [⚙️ Settings]           │
│ [❓ Help]               │
└─────────────────────────┘
```

- Large buttons (60x40px each)
- Hotkeys shown on hover (B, V, Esc, F1)

### Bottom Bar (Tools & Hotbar)

**Tool Selection:**

```
[1: Shovel] [2: Scythe] [3: Axe] [4: Water Bucket] [5: Fertilizer] [6-0: Empty Slots]
```

**Display:**

- 10 slots total (numbered 1-0)
- Currently equipped tool highlighted with golden border
- Empty slots gray
- Items/tools have quantity indicator (bottom-right corner) if stackable
- Drag-and-drop from inventory to assign items to hotbar

**Tool Cursor:**

- When tool selected, cursor changes to tool icon
- Hover over valid targets highlights them (green outline)
- Hover over invalid targets shows red X

---

## 8. Time & Weather Visual Effects

### Day/Night Cycle

**Cycle Duration:** 30 minutes real-time

- **Day:** 20 minutes (66%)
- **Night:** 10 minutes (33%)

**Lighting Changes:**

**Day (Morning 0-25%, Noon 25-75%, Evening 75-100%):**

- **Morning (0-25%):** Soft orange light, long shadows, fog dissipating
- **Noon (25-75%):** Bright ambient light, minimal shadows, full visibility
- **Evening (75-100%):** Warm red-orange light, shadows lengthen, fog returns

**Night (100-130% of cycle):**

- **Early Night (0-40%):** Dim blue-purple ambient light, stars appear, moon rises
- **Midnight (40-60%):** Very dark, only moonlight and building lights, heavy shadows
- **Late Night (60-100%):** Slightly brighter, moon high in sky, pre-dawn

**Lighting Effects:**

- **Global Ambient Light:** Tints entire scene
  - Day: 100% brightness, neutral white
  - Evening: 80% brightness, orange tint
  - Night: 30% brightness, blue tint
- **Point Lights:**
  - Bonfire: 5-tile radius orange glow
  - Necromancer's Hut windows: Warm yellow light
  - Blood Well: Faint red glow at night
  - Mutation Lab: Eerie green glow from windows
- **Player Character:** Holds lantern at night (3-tile radius light)

**Sky Color Transitions:**

- Dawn: Dark blue → Orange → Light blue
- Day: Light blue → Bright cyan
- Dusk: Light blue → Orange → Purple
- Night: Purple → Dark blue → Black (with stars)
- Smooth gradient transitions over 2-minute periods

**Zombie Activity Changes:**

- **Day:** Zombies move 10% slower, animation speed reduced (sluggish in daylight)
- **Night:** Zombies move 10% faster, more energetic animations, occasional howl sounds
- Visual: Zombie eyes glow brighter at night

### Weather Effects

**Weather Types:**

**1. Clear (Default - 60% occurrence)**

- No special effects
- Baseline for all mechanics

**2. Blood Rain (10% occurrence, lasts 10 minutes)**

- **Visual:**
  - Red particle rain effect (density: 200 particles)
  - Ground becomes darker red/wet
  - Puddles form (visual only)
  - Sky tinted dark crimson
- **Gameplay Effect:**
  - All plots auto-watered
  - Growth speed +100% (effectively doubles growth during rain)
  - Blood Wells fill 2x faster
  - Zombies +10% Happiness (love blood rain)
- **Sound:** Rain patter sound (ominous ambient)

**3. Fog (20% occurrence, lasts 15 minutes)**

- **Visual:**
  - Thick fog particle layer (reduces visibility)
  - Objects >10 tiles away are heavily obscured (alpha 50%)
  - Soft focus effect
  - Sky gray-white
- **Gameplay Effect:**
  - Zombies +5% Happiness (prefer low visibility)
  - Slight growth bonus +10% (less harsh light)
  - No negative effects (atmospheric)
- **Sound:** Distant wind, eerie ambience

**4. Bright Sunlight (5% occurrence, lasts 10 minutes)**

- **Visual:**
  - Intense white-yellow lighting
  - Washed-out colors (high contrast)
  - Harsh shadows
  - Heat shimmer effect (optional post-processing)
- **Gameplay Effect:**
  - Zombie growth -10% speed (undead dislike bright sun)
  - Zombies -10% Happiness while active (seek shelter)
  - Zombies near buildings/shade unaffected
  - Plots require 2x water to stay hydrated
- **Sound:** Loud cicada/bug sounds, oppressive silence

**5. Bone Storm (5% occurrence, lasts 5 minutes)**

- **Visual:**
  - Bone shard particles flying across screen
  - Strong wind effect (trees sway, objects shake)
  - Dark brown-gray sky
  - Lightning flashes occasionally
- **Gameplay Effect:**
  - All plots gain Bone Meal fertilizer effect (free boost)
  - Player movement speed -20% (fighting wind)
  - Zombies unaffected (they're heavy enough)
  - Resource nodes destroyed during storm drop resources immediately
- **Sound:** Howling wind, bone clatter, thunder

**Weather Transitions:**

- Weather changes at the end of current weather duration
- 2-minute fade transition between weather types
- Notification: "Blood Rain approaching..." (1 minute warning)
- Weather forecast available in HUD (shows next 3 weather events)

**Seasonal Variations (Future):**

- Spring: More Fog, less Bright Sun
- Summer: More Bright Sun, less Bone Storm
- Fall: Balanced weather
- Winter: More Bone Storm, rare Blood Rain (frozen blood)

---

## 9. UI Component Hierarchy

### React Component Structure

```
<App>
  <GameProvider> (XState game machine context)
    <FarmScreen> (main farm view)
      │
      ├─ <PhaserCanvas> (Phaser 3 game engine)
      │   ├─ FarmScene.ts (Phaser scene for farm rendering)
      │   ├─ PlotSprites (Phaser sprites for plots)
      │   ├─ ZombieSprites (Phaser sprites for zombies with pathfinding)
      │   ├─ BuildingSprites (Phaser sprites for structures)
      │   ├─ WeatherEffects (Phaser particle systems)
      │   └─ LightingSystem (Phaser lighting for day/night)
      │
      ├─ <FarmHUD> (React overlay UI)
      │   ├─ <TopBar>
      │   │   ├─ <ResourceDisplay />
      │   │   └─ <CurrencyDisplay />
      │   │
      │   ├─ <SidePanel>
      │   │   ├─ <ZombieCounter />
      │   │   ├─ <TimeDisplay />
      │   │   ├─ <WeatherIndicator />
      │   │   └─ <QuickActions />
      │   │
      │   ├─ <BottomBar>
      │   │   └─ <Hotbar items={playerHotbar} />
      │   │
      │   └─ <Minimap position="bottom-right" />
      │
      ├─ <Modals> (Conditional rendering based on state)
      │   ├─ <PlotInteractionModal isOpen={plotSelected} />
      │   ├─ <SeedSelectionModal isOpen={selectingSeed} />
      │   ├─ <ZombieInfoPanel zombie={selectedZombie} />
      │   ├─ <CryptManagementUI isOpen={cryptOpen} />
      │   ├─ <BuildModeUI isOpen={buildModeActive} />
      │   ├─ <BuildingInfoModal building={selectedBuilding} />
      │   ├─ <FeedZombieModal zombie={feedingZombie} />
      │   └─ <ConfirmationDialog {...dialogProps} />
      │
      └─ <NotificationSystem>
          └─ <Toast /> (floating notifications)
</GameProvider>
</App>
```

### Key Component Responsibilities

**1. FarmScreen.tsx**

- Main container for farm view
- Manages Phaser canvas lifecycle
- Handles keyboard/mouse input routing
- Bridges Phaser events to React state

**2. PhaserCanvas.tsx**

- Wrapper component for Phaser game engine
- Creates Phaser game instance
- Loads FarmScene
- Handles resize events

**3. FarmScene.ts (Phaser Scene)**

- Renders farm grid, sprites, animations
- Handles sprite interactions (click detection on zombies/plots)
- Pathfinding for zombie movement
- Particle systems for weather
- Lighting system for day/night
- Camera controls (pan, zoom)

**4. FarmHUD.tsx**

- Pure React UI overlay (positioned absolute over Phaser canvas)
- Subscribes to game state (via XState context)
- Renders all UI elements (bars, panels, buttons)
- Handles UI interactions (button clicks, modal opens)

**5. PlotInteractionModal.tsx**

- Opens when plot is clicked
- Shows plot state, growth progress
- Provides actions: Water, Fertilize, Harvest, Inspect
- Dispatches events to game state machine

**6. ZombieInfoPanel.tsx**

- Slide-out panel from left side
- Shows detailed zombie stats, traits, happiness
- Provides actions: Pet, Feed, Command buttons
- Updates in real-time as zombie state changes

**7. CryptManagementUI.tsx**

- Full-screen modal for managing stored zombies
- List view with filtering/sorting
- Deploy/Store functionality
- Mass actions support

**8. BuildModeUI.tsx**

- Left sidebar with build menu
- Grid overlay on Phaser canvas
- Ghost preview rendering (Phaser or React-based)
- Placement validation feedback

**9. NotificationSystem.tsx**

- Toast notifications for events:
  - "Shambler #7 is ready to harvest!"
  - "Blood Well is full! Collect Blood Water."
  - "+6 Rotten Wood"
  - "Construction complete: Mausoleum built!"
- Auto-dismiss after 5s or manual close
- Stack multiple notifications

### Event Flow Examples

**Example 1: Planting a Seed**

```
User clicks empty plot on Phaser canvas
  → FarmScene detects click, finds plot at coordinates
  → FarmScene emits 'plotClicked' event with plotId
  → FarmScreen catches event, dispatches to state machine:
      dispatch({ type: 'SELECT_PLOT', plotId })
  → State machine transitions to 'plotSelected' state
  → React re-renders, <SeedSelectionModal> opens
  → User selects Shambler Seed from modal
  → Modal dispatches: dispatch({ type: 'PLANT_SEED', seedType: 'shambler', plotId })
  → State machine validates:
      - Check inventory for seed
      - Check plot is empty
      - If valid: Deduct seed, update plot state to PLANTED, start timer
      - If invalid: Error notification
  → State update propagates to React → Phaser
  → Phaser updates plot sprite to "planted" visual
  → Modal closes, notification: "Shambler Seed planted!"
```

**Example 2: Harvesting Zombie**

```
User clicks ready plot (glowing green)
  → FarmScene detects click, confirms plot state = READY
  → Dispatches: dispatch({ type: 'HARVEST_PLOT', plotId })
  → State machine:
      - Run harvest logic (quality calculation, random mutation check)
      - Create new zombie entity in farm zombies array
      - Update plot state to EMPTY
      - Add byproduct resources to inventory
      - Check active capacity: If full, move zombie to Crypt storage
  → State updates
  → Phaser:
      - Play harvest animation (zombie climbs out, 2s)
      - Remove plot sprite, replace with empty plot
      - Spawn zombie sprite at plot location
      - Zombie transitions to IDLE state, begins roaming AI
  → React:
      - Update resource display (+5 Dark Coins)
      - Update zombie counter (7/10 → 8/10)
      - Notification: "Shambler #7 harvested! [Gold Quality]"
      - If first time: "New Zombie Discovered! Check Compendium."
```

---

## 10. State Flow

### Farm State Structure

The farm state is managed by an XState state machine integrated with React context.

**State Schema (TypeScript):**

```typescript
interface FarmState {
  // Farm Grid
  grid: {
    width: number; // 20 initially, up to 50
    height: number;
    tiles: Tile[][]; // 2D array of tile data
  };

  // Plots
  plots: {
    [plotId: string]: Plot;
  };

  // Zombies
  zombies: {
    active: Zombie[]; // Zombies roaming on farm
    stored: Zombie[]; // Zombies in Crypt
    capacity: {
      current: number; // Current active count
      max: number; // Max active capacity
    };
  };

  // Buildings
  buildings: {
    [buildingId: string]: Building;
  };

  // Resources
  resources: ResourceInventory;

  // Time & Weather
  time: {
    dayCount: number; // Days elapsed since start
    currentCycle: number; // 0-100%, where 0-66% is day, 66-100% is night
    realTimeElapsed: number; // Milliseconds since game start
  };

  weather: {
    current: WeatherType; // 'clear' | 'blood_rain' | 'fog' | 'bright_sun' | 'bone_storm'
    duration: number; // Remaining duration in ms
    nextWeather: WeatherType;
  };

  // UI State
  ui: {
    selectedPlot: string | null;
    selectedZombie: string | null;
    buildModeActive: boolean;
    selectedBuildingType: string | null;
  };
}

interface Tile {
  x: number;
  y: number;
  type: 'empty' | 'plot' | 'building' | 'path' | 'obstacle' | 'resource';
  entityId: string | null; // Reference to plot/building/zombie occupying this tile
  biome: 'graveyard' | 'forest' | 'desert' | 'swamp' | 'ruins';
  walkable: boolean;
  buildable: boolean;
}

interface Plot {
  id: string;
  x: number; // Grid coordinates
  y: number;
  state: 'empty' | 'planted' | 'growing' | 'ready';
  seedType: string | null; // e.g., 'shambler'
  plantedAt: number; // Timestamp
  growthProgress: number; // 0-100%
  watered: boolean; // Watered today?
  fertilized: string | null; // Fertilizer type applied
  qualityModifier: number; // Accumulated quality bonus
}

interface Zombie {
  id: string;
  type: string; // 'shambler' | 'runner' | 'brute' | ...
  quality: 'bronze' | 'silver' | 'gold' | 'iridium';
  level: number;
  xp: number;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  happiness: number; // 0-100%
  lastFed: number; // Timestamp
  decayAmount: number; // 0-100% (0 = fresh, 100 = fully decayed)
  traits: string[]; // ['regeneration_I', 'armored_skin']
  mutations: string[]; // ['extra_arms']
  position: { x: number; y: number }; // Current position on farm (for active zombies)
  aiState: 'idle' | 'wander' | 'social' | 'task' | 'follow';
}

interface Building {
  id: string;
  type: string; // 'blood_well' | 'crypt' | 'mausoleum' | ...
  x: number; // Top-left corner grid position
  y: number;
  width: number; // Footprint size
  height: number;
  rotation: number; // 0, 90, 180, 270
  level: number; // Upgrade level (1 = base)
  state: any; // Building-specific state (e.g., Blood Well: { stored: 7, maxCapacity: 10 })
}

interface ResourceInventory {
  rottenWood: number;
  bones: number;
  bloodWater: number;
  corpseDust: number;
  soulFragments: number;
  darkCoins: number;
  soulEssence: number;
  // ... other resources
}
```

### Event-Driven State Updates

**Farm Events (XState Events):**

```typescript
type FarmEvent =
  // Plot Events
  | { type: 'SELECT_PLOT'; plotId: string }
  | { type: 'PLANT_SEED'; plotId: string; seedType: string }
  | { type: 'WATER_PLOT'; plotId: string }
  | { type: 'FERTILIZE_PLOT'; plotId: string; fertilizerType: string }
  | { type: 'HARVEST_PLOT'; plotId: string }

  // Zombie Events
  | { type: 'SELECT_ZOMBIE'; zombieId: string }
  | { type: 'PET_ZOMBIE'; zombieId: string }
  | { type: 'FEED_ZOMBIE'; zombieId: string; foodType: string }
  | {
      type: 'COMMAND_ZOMBIE';
      zombieId: string;
      command: 'follow' | 'stay' | 'crypt' | 'train' | 'guard';
    }
  | { type: 'DEPLOY_ZOMBIE'; zombieId: string } // From Crypt to farm
  | { type: 'STORE_ZOMBIE'; zombieId: string } // From farm to Crypt

  // Building Events
  | { type: 'ENTER_BUILD_MODE' }
  | { type: 'EXIT_BUILD_MODE' }
  | { type: 'SELECT_BUILDING_TYPE'; buildingType: string }
  | { type: 'PLACE_BUILDING'; buildingType: string; x: number; y: number; rotation: number }
  | { type: 'MOVE_BUILDING'; buildingId: string; x: number; y: number }
  | { type: 'REMOVE_BUILDING'; buildingId: string }
  | { type: 'INTERACT_BUILDING'; buildingId: string } // Open building UI

  // Resource Events
  | { type: 'GATHER_RESOURCE'; nodeId: string }
  | { type: 'COLLECT_FROM_BUILDING'; buildingId: string } // E.g., Blood Well collection

  // Time & Weather Events
  | { type: 'TICK'; deltaTime: number } // Game loop update
  | { type: 'ADVANCE_TIME'; hours: number }
  | { type: 'CHANGE_WEATHER'; weatherType: WeatherType }

  // UI Events
  | { type: 'OPEN_CRYPT' }
  | { type: 'CLOSE_CRYPT' }
  | { type: 'OPEN_PLOT_MODAL'; plotId: string }
  | { type: 'CLOSE_MODAL' };
```

### State Machine States

**Top-Level Farm States:**

```
farmMachine:
  idle (default)
    → plotSelected (when SELECT_PLOT)
    → zombieSelected (when SELECT_ZOMBIE)
    → buildMode (when ENTER_BUILD_MODE)
    → buildingInteraction (when INTERACT_BUILDING)

  plotSelected:
    - Shows plot modal
    - Can dispatch PLANT_SEED, WATER_PLOT, FERTILIZE_PLOT, HARVEST_PLOT
    → idle (when CLOSE_MODAL)

  zombieSelected:
    - Shows zombie info panel
    - Can dispatch PET_ZOMBIE, FEED_ZOMBIE, COMMAND_ZOMBIE
    → idle (when CLOSE_MODAL or DESELECT)

  buildMode:
    - Grid overlay active
    - Build menu open
    - Ghost preview follows cursor
    - Can dispatch PLACE_BUILDING, SELECT_BUILDING_TYPE
    → idle (when EXIT_BUILD_MODE)

  buildingInteraction:
    - Building-specific modal open (e.g., Composter UI, Blood Well collection)
    → idle (when CLOSE_MODAL)
```

**Parallel State Machines:**

- **timeSystem:** Continuously running, dispatches TICK every frame, updates time.currentCycle
- **weatherSystem:** Monitors weather duration, dispatches CHANGE_WEATHER when duration expires
- **growthSystem:** Updates plot growth progress, checks for ready plots, dispatches notifications
- **zombieAI:** Updates zombie positions/states based on AI behavior (idle, wander, etc.)
- **decaySystem:** Tracks zombie feeding timers, applies decay if unfed for 24h

### Integration with Core Game State

**Farm Module as Sub-Machine:**

- The farm machine is a child machine invoked by the core game machine
- Core game machine states: `tutorial` → `farm` → `combat` → `exploration`
- When in `farm` state, core machine delegates all events to farm machine
- Farm machine can send events back to parent: `INITIATE_RAID`, `COMPLETE_QUEST`, `LEVEL_UP`

**Save/Load:**

- On critical events (harvest, build, end of day), dispatch `SAVE_GAME` event
- Core machine serializes entire state (including farm sub-state) to localStorage
- On game load, hydrate farm machine with saved state
- Offline progress calculated: Compare current timestamp to lastPlayed timestamp, simulate ticks

**Example Save Trigger:**

```typescript
// In farm machine actions
actions: {
  onHarvest: (context, event) => {
    // ... harvest logic
    send({ type: 'SAVE_GAME' }); // Trigger save after harvest
  },
  onDayEnd: (context, event) => {
    // ... daily decay/maintenance logic
    send({ type: 'SAVE_GAME' });
  }
}
```

**Offline Progress Simulation:**

```typescript
function simulateOfflineProgress(state: FarmState, offlineMs: number): FarmState {
  let simulatedState = { ...state };

  // Simulate growth timers
  Object.values(simulatedState.plots).forEach((plot) => {
    if (plot.state === 'growing') {
      plot.growthProgress += calculateGrowthForDuration(offlineMs);
      if (plot.growthProgress >= 100) {
        plot.state = 'ready';
        // Queue notification
      }
    }
  });

  // Simulate resource generation (Blood Wells)
  Object.values(simulatedState.buildings).forEach((building) => {
    if (building.type === 'blood_well') {
      const generated = Math.floor(offlineMs / (5 * 60 * 1000)); // 1 per 5 min
      building.state.stored = Math.min(
        building.state.stored + generated,
        building.state.maxCapacity
      );
    }
  });

  // Simulate zombie decay (daily)
  const daysOffline = Math.floor(offlineMs / (30 * 60 * 1000)); // 30 min = 1 day
  simulatedState.zombies.active.forEach((zombie) => {
    const daysSinceFed = Math.floor((Date.now() - zombie.lastFed) / (30 * 60 * 1000));
    if (daysSinceFed > 0) {
      zombie.decayAmount += daysSinceFed * 1; // 1% decay per day unfed
      zombie.happiness -= daysSinceFed * 10; // -10% happiness per day
    }
  });

  return simulatedState;
}
```

---

## Implementation Notes

### Performance Considerations

**Large Farms (50x50 = 2500 tiles):**

- Use spatial partitioning (quadtree) for collision detection
- Only render zombies/sprites within camera view + buffer
- Limit active particle effects (max 500 particles on screen)
- Pathfinding: A\* with cached paths, recalculate only on obstacle change

**Zombie AI Optimization:**

- Update zombie AI in staggered batches (10 zombies per frame instead of all 100)
- Use simple state machine for zombies (5 states max)
- Pathfinding throttle: Only recalculate path every 2 seconds for wandering zombies

**State Updates:**

- Use Immer for immutable state updates (prevents accidental mutations)
- Batch multiple state changes in single dispatch when possible
- Memoize expensive selectors with Reselect or useMemo

### Accessibility

- **Keyboard Navigation:** All UI elements accessible via Tab, Enter, Esc
- **Screen Reader Support:** ARIA labels on buttons, modals
- **Color Blind Mode:** Alternative color schemes for plot states (not just green/red)
- **Text Scaling:** Support browser text scaling, UI scales with rem units

### Mobile Considerations

- **Touch Controls:** Virtual joystick for player movement (bottom-left)
- **Pinch Zoom:** Native support on canvas
- **Tap Interactions:** Single tap = select, long press = context menu
- **UI Scaling:** Larger buttons (60x60px minimum), increased spacing
- **Performance:** Lower particle counts, reduce shadow quality on mobile

---

## Summary

This document defines the complete farm layout and interaction system for Zombie Farm. Key takeaways:

1. **Grid-Based Layout:** 20x20 starting grid, expandable to 50x50, free placement system
2. **Top-Down Camera:** Orthogonal view with zoom and pan controls, minimap for navigation
3. **Plot Lifecycle:** EMPTY → PLANTED → GROWING → READY → HARVESTED, with watering/fertilizing
4. **Zombie Management:** Active roaming zombies with AI, Crypt storage for excess, happiness system
5. **Building Placement:** Free placement with validation, 15+ building types, rotate/move/remove functionality
6. **Resource Gathering:** Interactive nodes (trees, mounds), time-based generation (wells), conversion buildings (composter)
7. **Comprehensive HUD:** Top bar (resources), side panel (stats), bottom bar (hotbar), minimap
8. **Day/Night Cycle:** 30-minute cycles with lighting changes, zombie behavior shifts
9. **Weather System:** 5 weather types with visual/gameplay effects (Blood Rain, Fog, etc.)
10. **React + Phaser Architecture:** Phaser for rendering/physics, React for UI overlay, XState for state management

**File Locations for Implementation:**

- `/Users/victor/work/ZombieFarm/src/features/farm/` - Farm logic and state machine
- `/Users/victor/work/ZombieFarm/src/features/world/FarmScene.ts` - Phaser rendering
- `/Users/victor/work/ZombieFarm/src/components/farm/` - React UI components
- `/Users/victor/work/ZombieFarm/src/lib/config/farmConfig.ts` - Configuration constants

This document should be used alongside:

- **DOMAIN-FARM.md** for authoritative game rules and mechanics
- **ARCHITECTURE.md** for technical patterns and structure
- **TESTING.md** for test requirements

---

**Version History:**

- v1.0 (2025-11-12): Initial comprehensive farm layout design

**Next Steps:**

1. Implement farm grid and tile system (Phaser + React state)
2. Create plot state machine with growth timers
3. Build zombie roaming AI with pathfinding
4. Develop building placement system with validation
5. Design and implement HUD components
6. Integrate day/night and weather systems
7. Test on mobile devices for responsive layout
