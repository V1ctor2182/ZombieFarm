---
title: 'Core Layout Design - Main Island'
module: Core (UI/UX Architecture)
priority: High (Foundation for all UI)
last updated: 2025-11-12
version: 1.0
---

# Core Layout Design - Main Island

This document defines the primary layout structure for the Zombie Farm game, establishing the visual hierarchy, component organization, and navigation patterns that all modules will follow.

## Table of Contents

1. [Overview](#overview)
2. [Main Game Screen Layout](#main-game-screen-layout)
3. [HUD Components](#hud-components)
4. [Scene Transitions](#scene-transitions)
5. [Component Hierarchy](#component-hierarchy)
6. [State Flow Architecture](#state-flow-architecture)
7. [Responsive Behavior](#responsive-behavior)
8. [Technical Implementation](#technical-implementation)

---

## Overview

### Design Philosophy

- **Minimalist HUD**: Keep UI unobtrusive to focus on gameplay
- **Dark Theme**: Consistent zombie/undead aesthetic throughout
- **Context-Aware**: Show/hide elements based on current game mode
- **Performance-First**: Minimize re-renders and optimize critical paths

### Screen Real Estate

```
┌─────────────────────────────────────────────────────────────┐
│ [HEADER BAR - 60px]                                         │ Fixed
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                                                               │
│                  [GAME CANVAS / SCENE]                       │ Flex-grow
│                   (Farm / Combat / World)                    │
│                                                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ [FOOTER BAR - 40px]                                         │ Fixed
└─────────────────────────────────────────────────────────────┘
```

---

## Main Game Screen Layout

### Primary Container

```tsx
<div className="h-screen w-screen bg-dark-bg flex flex-col overflow-hidden">
  <TopBar />
  <MainCanvas />
  <BottomBar />
  <ModalLayer />
  <NotificationStack />
</div>
```

### Component Breakdown

#### 1. Top Bar (Header)

**Purpose**: Primary game information and quick actions
**Height**: 60-80px (fixed)
**Position**: Top of viewport, always visible
**Background**: `hud-element` (semi-transparent dark panel)

**Contents**:

- **Left Section**:
  - Game title / logo
  - Current scene indicator (Farm/Combat/World)
  - Day/Night indicator with time
- **Center Section**:
  - Primary resources (Dark Coins, Soul Essence)
  - Quick resource counts
- **Right Section**:
  - Settings button
  - Menu button (hamburger)
  - Save status indicator

**Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│ [🧟 Zombie Farm] | Day 5 - 🌙 Night     💰 1,250  👻 45    │
│ [Farm Mode]                                        [⚙️] [☰] │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Main Canvas Area

**Purpose**: Primary game rendering area (Phaser canvas)
**Height**: `flex-grow-1` (fills remaining space)
**Position**: Between header and footer

**Characteristics**:

- Houses the Phaser game canvas
- Adapts to different scenes (Farm, Combat, World map)
- Centered with aspect ratio preserved (16:9 preferred)
- Dark background when canvas doesn't fill entire area

**Scene Types**:

- **Farm Scene**: Top-down view of farm with zombies, plots, buildings
- **Combat Scene**: Real-time auto-battler battlefield view
- **World Scene**: Strategic map for selecting raid targets

#### 3. Bottom Bar (Footer)

**Purpose**: Contextual actions and secondary info
**Height**: 40-50px (fixed)
**Position**: Bottom of viewport, always visible
**Background**: `hud-element` (semi-transparent dark panel)

**Contents** (context-dependent):

**In Farm Mode**:

```
[🧟 Zombies: 12/20] | [🌾 Plots: 8/15] | [⚙️ Actions: Plant | Feed | Harvest | Crypt]
```

**In Combat Mode**:

```
[⚔️ Squad: 6] | [💀 Enemies: 12] | [❤️ HP: 87%] | [Actions: Auto | Retreat]
```

**In World Mode**:

```
[📍 Locations: 15] | [🗺️ Explored: 8/15] | [Actions: Raid | Scout | Return]
```

---

## HUD Components

### Resource Counter (Reusable Component)

```tsx
<ResourceCounter
  icon="💰"
  label="Dark Coins"
  value={1250}
  tooltip="Primary currency"
  variant="compact"
/>
```

**Variants**:

- `compact`: Icon + value only (for header)
- `detailed`: Icon + label + value + tooltip
- `large`: Full card with description

### Status Indicator

```tsx
<StatusIndicator label="Day 5" icon={<SunIcon />} color="zombie-flesh-400" pulse={true} />
```

**Use Cases**:

- Day/night cycle
- Game mode (Farm/Combat/World)
- Save status (Saved / Saving / Unsaved changes)

### Action Button Bar

```tsx
<ActionBar>
  <ActionButton icon="🌱" label="Plant" onClick={handlePlant} />
  <ActionButton icon="🍖" label="Feed" onClick={handleFeed} />
  <ActionButton icon="⚰️" label="Crypt" onClick={handleCrypt} />
</ActionBar>
```

**Behavior**:

- Context-aware: Changes based on current scene
- Keyboard shortcuts displayed on hover
- Disabled states when action unavailable

---

## Scene Transitions

### Navigation Flow

```
┌────────────┐
│   LOADING  │ (Initial app load)
└─────┬──────┘
      │
      v
┌────────────┐
│  TUTORIAL  │ (First-time players only)
└─────┬──────┘
      │
      v
┌────────────┐    ┌─────────────┐    ┌─────────────┐
│    FARM    │<-->│   COMBAT    │    │    WORLD    │
│  (Default) │    │ (On battle) │    │  (Planning) │
└────────────┘    └─────────────┘    └──────┬──────┘
      ^                                      |
      └──────────────────────────────────────┘
```

### Transition Types

1. **Fade Transition** (Farm ↔ World)
   - Duration: 300ms
   - Black screen fade
   - Used for strategic mode changes

2. **Slide Transition** (Farm → Combat)
   - Duration: 500ms
   - Slide right with dramatic effect
   - Used when initiating battle

3. **Instant Transition** (Combat → Farm)
   - Duration: 0ms (but with result screen overlay)
   - Immediate return after battle
   - Post-battle modal shows results

### State During Transitions

- Game time pauses during transitions
- Save state before entering combat
- Load appropriate assets for next scene
- Show loading indicator if needed (>100ms)

---

## Component Hierarchy

### React Component Tree

```
App
├── GameProvider (XState machine context)
│   ├── TopBar
│   │   ├── GameLogo
│   │   ├── ResourceDisplay
│   │   │   ├── ResourceCounter (Dark Coins)
│   │   │   └── ResourceCounter (Soul Essence)
│   │   ├── TimeDisplay
│   │   └── MenuButtons
│   │       ├── SettingsButton
│   │       └── HamburgerMenu
│   │
│   ├── MainCanvas
│   │   ├── PhaserGame
│   │   │   └── [Active Scene]
│   │   │       ├── FarmScene
│   │   │       ├── CombatScene
│   │   │       └── WorldScene
│   │   └── CanvasOverlay (HUD elements on top of Phaser)
│   │       ├── TooltipDisplay
│   │       └── FloatingActions
│   │
│   ├── BottomBar
│   │   ├── ContextInfo (changes per scene)
│   │   └── ActionBar (changes per scene)
│   │
│   ├── ModalLayer (Portal)
│   │   ├── SettingsModal
│   │   ├── PlantModal
│   │   ├── FeedModal
│   │   ├── CryptModal
│   │   ├── BattleResultsModal
│   │   └── ConfirmationModal
│   │
│   └── NotificationStack (Portal)
│       └── ToastNotification[] (stacked)
```

### Module Ownership

- **Core Module**: App, GameProvider, TopBar, BottomBar, ModalLayer, NotificationStack
- **Farm Module**: FarmScene, FarmActionBar, PlantModal, FeedModal, CryptModal
- **Combat Module**: CombatScene, CombatActionBar, BattleResultsModal
- **World Module**: WorldScene, WorldActionBar, RaidPlanningModal
- **UI Module**: All shared components (ResourceCounter, Button, Modal, Toast, etc.)

---

## State Flow Architecture

### Global State (XState)

```typescript
GameMachine
├── state: 'loading' | 'tutorial' | 'farm' | 'combat' | 'world' | 'paused'
└── context: GameState
    ├── player: Player
    ├── farm: FarmState
    ├── combat: CombatState
    ├── world: WorldState
    ├── inventory: Inventory
    ├── time: TimeState
    └── ui: UIState
```

### Event Flow

1. **User Action** (e.g., clicks "Plant" button)
   ↓
2. **UI Component** (dispatches event)
   ↓
3. **Event Bus** (routes to appropriate handler)
   ↓
4. **State Machine** (updates context, transitions state)
   ↓
5. **React Context** (notifies subscribed components)
   ↓
6. **Components Re-render** (UI updates)
   ↓
7. **Phaser Scene** (receives state update if needed)

### Data Flow Example: Planting a Zombie

```
User clicks "Plant" button
  → PlantButton dispatches: { type: 'OPEN_PLANT_MODAL' }
  → GameMachine updates: ui.activeModal = 'plant'
  → ModalLayer renders PlantModal
  → User selects seed, confirms
  → PlantModal dispatches: { type: 'PLANT_ZOMBIE', plotId: 5, seedType: 'shambler' }
  → GameMachine transitions: farm.plots[5].state = 'growing'
  → FarmState updates context
  → FarmScene receives update via event
  → Phaser renders zombie seed sprite on plot
  → ModalLayer closes PlantModal
  → ToastNotification: "Shambler seed planted!"
```

---

## Responsive Behavior

### Viewport Sizes

#### Desktop (Primary Target)

- **Min Width**: 1024px
- **Optimal**: 1920x1080 (16:9)
- **Canvas Size**: 1024x576 (scales with container)

#### Tablet (Future Support)

- **Min Width**: 768px
- **Adjustments**:
  - Smaller HUD text
  - Compact resource counters
  - Simplified action bar

#### Mobile (Post-MVP)

- **Min Width**: 375px
- **Adjustments**:
  - Vertical layout consideration
  - Touch-optimized controls
  - Full-screen game mode

### Scaling Strategy

- **Canvas**: Phaser `Scale.FIT` mode maintains 16:9 aspect ratio
- **HUD**: Uses Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- **Text**: Uses `rem` units for scalability
- **Icons**: SVG for crisp rendering at any size

---

## Technical Implementation

### CSS Architecture

#### Tailwind Classes (Primary)

```css
/* Layout structure */
.game-container {
  @apply h-screen w-screen bg-dark-bg flex flex-col overflow-hidden;
}
.top-bar {
  @apply hud-element h-16 px-6 flex items-center justify-between;
}
.main-canvas {
  @apply flex-1 flex items-center justify-center p-4;
}
.bottom-bar {
  @apply hud-element h-12 px-6 flex items-center justify-center;
}
```

#### Custom CSS Variables

```css
:root {
  --header-height: 64px;
  --footer-height: 48px;
  --canvas-aspect-ratio: 16/9;
  --hud-opacity: 0.9;
}
```

### React Context Pattern

```typescript
// GameProvider.tsx
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, send] = useMachine(gameMachine);

  return (
    <GameContext.Provider value={{ state, send }}>
      {children}
    </GameContext.Provider>
  );
};

// useGameState hook
export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameState must be used within GameProvider');
  return context;
};
```

### Phaser-React Integration

```typescript
// PhaserGame.tsx
const PhaserGame: React.FC<PhaserGameProps> = ({ scenes, onGameReady }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const { state } = useGameState();

  useEffect(() => {
    // Initialize Phaser game
    gameRef.current = new Phaser.Game(config);
    onGameReady?.(gameRef.current);

    // Cleanup
    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  // Listen for state changes and update Phaser
  useEffect(() => {
    if (gameRef.current) {
      // Send state updates to active Phaser scene
      const activeScene = gameRef.current.scene.getScene('active');
      activeScene?.events.emit('state-update', state);
    }
  }, [state]);

  return <div ref={containerRef} />;
};
```

### Modal Management

```typescript
// ModalLayer.tsx
export const ModalLayer: React.FC = () => {
  const { state } = useGameState();
  const activeModal = state.context.ui.activeModal;

  return createPortal(
    <>
      {activeModal === 'plant' && <PlantModal />}
      {activeModal === 'feed' && <FeedModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {/* ... other modals */}
    </>,
    document.body
  );
};
```

### Notification System

```typescript
// NotificationStack.tsx
export const NotificationStack: React.FC = () => {
  const { state } = useGameState();
  const notifications = state.context.ui.notifications;

  return createPortal(
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <ToastNotification key={notification.id} {...notification} />
      ))}
    </div>,
    document.body
  );
};
```

---

## Performance Considerations

### Optimization Strategies

1. **Component Memoization**
   - Use `React.memo` for HUD components that rarely change
   - Use `useMemo` for expensive calculations (resource totals)
   - Use `useCallback` for event handlers passed to children

2. **Selective Re-renders**
   - Split context by concern (farm, combat, ui)
   - Use selector pattern to subscribe only to needed state
   - Implement `useShallowEqual` for object comparisons

3. **Phaser Performance**
   - Limit active game objects (pool and recycle)
   - Use sprite atlases for all textures
   - Enable WebGL with Canvas fallback
   - Batch render calls when possible

4. **Bundle Optimization**
   - Code-split Phaser scenes (lazy load Combat/World)
   - Separate vendor chunks (React, Phaser, XState)
   - Tree-shake unused UI components

### Monitoring

- Track FPS in development mode
- Log state update frequency
- Monitor memory usage during long sessions
- Profile React renders with DevTools

---

## Future Enhancements

### Planned Features

1. **Multi-Window Support** (Post-MVP)
   - Separate windows for Farm and Combat simultaneously
   - Drag-and-drop between windows

2. **Custom Layouts** (Post-MVP)
   - User-configurable HUD positions
   - Save layout preferences

3. **Accessibility**
   - Screen reader support for all HUD elements
   - Keyboard-only navigation
   - High contrast mode
   - Text scaling options

4. **Themes** (Post-MVP)
   - Alternative color schemes (beyond default zombie theme)
   - Seasonal themes (Halloween, etc.)

---

## Implementation Checklist

### Phase 1: Core Layout Structure ✅

- [x] TopBar component with logo and resources
- [x] MainCanvas container with Phaser integration
- [x] BottomBar with context-aware actions
- [x] Responsive container layout

### Phase 2: HUD Components

- [ ] ResourceCounter component
- [ ] StatusIndicator component
- [ ] ActionButton and ActionBar
- [ ] TimeDisplay with day/night cycle

### Phase 3: Modal System

- [ ] ModalLayer with portal
- [ ] Base Modal component (reusable)
- [ ] SettingsModal
- [ ] ConfirmationModal

### Phase 4: Notifications

- [ ] NotificationStack with portal
- [ ] ToastNotification component
- [ ] Auto-dismiss logic
- [ ] Stack management (max 5)

### Phase 5: Scene Integration

- [ ] FarmScene HUD integration
- [ ] CombatScene HUD integration
- [ ] WorldScene HUD integration
- [ ] Scene transition animations

### Phase 6: State Management

- [ ] GameProvider with XState
- [ ] useGameState hook
- [ ] Event dispatcher
- [ ] State persistence

### Phase 7: Polish

- [ ] Animations and transitions
- [ ] Sound effects for UI actions
- [ ] Loading states
- [ ] Error boundaries

---

## Reusable Components from Sunflower Land

This section catalogs reusable UI components and patterns from the Sunflower Land reference codebase that can be adapted for Zombie Farm. All blockchain/Web3 dependencies must be removed during adaptation.

### UI Component Library

#### 1. Modal System

**Source**: `/Sunflowerland-ref/src/components/ui/Modal.tsx`

**What it does**:
- Full modal system built with @headlessui/react Dialog
- Backdrop blur with configurable behavior (dismissible or static)
- Size variants (sm, lg) and fullscreen support
- Transition animations (fade in/out)
- Sound effects on open/close
- Event prevention to avoid Phaser click-through

**Adaptation notes**:
- Remove `useSound` hook (implement our own sound system later)
- Remove blockchain-specific backdrop behavior
- Adapt to our zombie theme color scheme
- Keep the Phaser click-through prevention (critical!)

**Usage in Zombie Farm**:
- PlantModal (selecting zombie seeds)
- FeedModal (feeding zombies)
- CryptModal (managing stored zombies)
- BattleResultsModal (post-combat results)
- SettingsModal

**Dependencies**: `@headlessui/react` (add to package.json)

---

#### 2. Panel System

**Source**: `/Sunflowerland-ref/src/components/ui/Panel.tsx`

**What it does**:
- Layered panel components: `Panel`, `InnerPanel`, `OuterPanel`
- Pixel-art border styling with double-layered effect
- `ButtonPanel` with hover/pressed/disabled states
- `DropdownButtonPanel` and `DropdownOptionsPanel` for dropdowns
- Dark mode support via hook

**Adaptation notes**:
- Replace pixel border images with zombie-themed borders
- Remove `DynamicNFT` and Bumpkin parts (character portrait system)
- Adapt colors to our zombie theme (rot browns, flesh greens, blood reds)
- Keep pixel-perfect styling approach
- Remove `useIsDarkMode` hook (we're always dark themed)

**Usage in Zombie Farm**:
- All modal content containers
- Inventory panels
- Resource display panels
- Action button containers
- Settings panels

---

#### 3. Button Component

**Source**: `/Sunflowerland-ref/src/components/ui/Button.tsx`

**What it does**:
- Primary and secondary button variants
- Pixel-art border images with pressed state
- Disabled state with opacity
- Long-press support for repeated actions
- Sound effects on click
- Hover brightness effect

**Adaptation notes**:
- Replace button border images with zombie-themed buttons
- Remove `useSound` hook initially
- Remove `useLongPress` hook (implement later if needed)
- Adapt to Tailwind classes we've defined
- Keep active scale animation

**Usage in Zombie Farm**:
- All primary actions (Plant, Feed, Harvest, Raid)
- Modal confirm/cancel buttons
- Settings toggles
- Navigation buttons

---

#### 4. Portal Component

**Source**: `/Sunflowerland-ref/src/components/ui/ReactPortal.tsx`

**What it does**:
- React Portal wrapper for rendering modals outside main DOM tree
- Automatic wrapper element creation
- Cleanup on unmount
- Reusable for any portal needs

**Adaptation notes**:
- Can be used as-is, no blockchain dependencies
- Perfect for ModalLayer and NotificationStack

**Usage in Zombie Farm**:
- ModalLayer (render modals at document.body level)
- NotificationStack (render toasts at top level)
- Tooltips (if needed)

---

#### 5. Label Component

**Source**: `/Sunflowerland-ref/src/components/ui/Label.tsx`

**What it does**:
- Colored label badges with pixel-art borders
- Multiple types: default, success, danger, warning, info, vibrant, formula, chill
- Icon support (left and right icons)
- Popup support for copy feedback
- Click handler support

**Adaptation notes**:
- Adapt colors to zombie theme:
  - `danger` → Blood red (zombie-blood-500)
  - `success` → Toxic green (zombie-toxic-500)
  - `warning` → Rot orange/brown
  - `info` → Soul blue (soul-500)
  - `vibrant` → Necromantic purple (necro-500)
- Remove i18n translation hook (use simple strings initially)
- Replace pixel border styles with our border utilities

**Usage in Zombie Farm**:
- Resource counters (Dark Coins, Soul Essence)
- Status indicators (HP, Happiness, Decay)
- Buff/debuff indicators
- Quest/achievement badges
- Warning messages

---

#### 6. Progress Bar Component

**Source**: `/Sunflowerland-ref/src/components/ui/ProgressBar.tsx`

**What it does**:
- Multiple progress bar variants: `Bar`, `ResizableBar`, `AnimatedBar`, `LiveProgressBar`
- Color types: progress (green), health (blue), error (red), buff (purple), quantity (orange)
- Timer display with countdown text
- Animated progress transitions using react-spring
- Pixel-perfect rendering

**Adaptation notes**:
- Adapt colors to zombie theme
- Remove i18n language detection
- Keep the animated variants (great for zombie growth timers)
- Use for HP bars, growth progress, decay indicators

**Usage in Zombie Farm**:
- Zombie growth progress (planting → emergence)
- HP bars in combat
- Decay progress indicators
- Resource gathering progress
- Building construction progress

**Dependencies**: `react-spring` (add to package.json for animations)

---

#### 7. HUD Container

**Source**: `/Sunflowerland-ref/src/components/ui/HudContainer.tsx`

**What it does**:
- Container component for HUD overlays
- Positioned absolutely on top of game canvas
- Pointer-events handling to avoid interfering with Phaser

**Adaptation notes**:
- Use as-is as wrapper for our TopBar/BottomBar
- Ensure proper z-index layering

**Usage in Zombie Farm**:
- Wrap all HUD elements (TopBar, BottomBar, Modals, Notifications)

---

### State Management Patterns

#### 8. GameProvider Pattern

**Source**: `/Sunflowerland-ref/src/features/game/GameProvider.tsx`

**What it does**:
- React Context provider wrapping XState machine
- Uses `useInterpret` to create machine instance
- Provides `gameService` to entire app via Context
- Additional UI state (shortcuts, animations, settings)
- Event handlers for common actions

**Adaptation notes**:
- Remove Auth context dependency (no blockchain auth)
- Remove blockchain-specific methods (deposit, withdraw)
- Keep XState integration pattern with `useInterpret`
- Adapt context shape to our game state:
  - `player` (level, XP, unlocks)
  - `farm` (zombies, plots, buildings)
  - `combat` (active battle, squad)
  - `inventory` (resources, items)
  - `time` (day/night cycle)
  - `ui` (active modal, notifications)

**Usage in Zombie Farm**:
- Core state management wrapper
- Wrap entire App component
- Provide `gameService` via Context

**Implementation priority**: HIGH (Phase 3 - State Management)

---

#### 9. useActor Hook Pattern

**Source**: Multiple files using `useActor` from `@xstate/react`

**What it does**:
- Subscribe to XState machine state changes
- Returns `[state, send]` tuple
- Component re-renders on state changes

**Adaptation notes**:
- Use as-is from `@xstate/react` v6
- Pattern for all components that need game state

**Usage in Zombie Farm**:
```typescript
const { gameService } = useGameState();
const [state, send] = useActor(gameService);

// Access state
const zombieCount = state.context.farm.zombies.length;

// Dispatch events
send({ type: 'PLANT_ZOMBIE', plotId: 5, seedType: 'shambler' });
```

---

#### 10. Selector Pattern

**Source**: Multiple files using `useSelector` from `@xstate/react`

**What it does**:
- Subscribe to specific slices of state
- Prevents unnecessary re-renders
- More performant than `useActor` for read-only data

**Adaptation notes**:
- Use for components that only read state (not dispatch events)
- Example:

**Usage in Zombie Farm**:
```typescript
const farmAddress = useSelector(gameService, (state) => state.context.farmAddress);
const darkCoins = useSelector(gameService, (state) => state.context.inventory.darkCoins);
```

---

### Phaser Integration Patterns

#### 11. Phaser Event Bridge

**Source**: Multiple scene files in `/Sunflowerland-ref/src/features/game/scenes/`

**Pattern**:
- Phaser scenes listen for XState state changes
- React components send events to Phaser via scene.events
- Bidirectional communication

**Implementation**:
```typescript
// In PhaserGame.tsx
useEffect(() => {
  if (gameRef.current) {
    const activeScene = gameRef.current.scene.getScene('FarmScene');
    activeScene?.events.emit('state-update', state.context);
  }
}, [state]);

// In FarmScene.ts
create() {
  this.events.on('state-update', (gameState) => {
    this.updateZombies(gameState.farm.zombies);
  });
}
```

**Usage in Zombie Farm**:
- Update Phaser sprites when state changes
- Send Phaser events to React (e.g., plot clicked)

---

### Utility Components

#### 12. Time/Countdown Components

**Source**:
- `/Sunflowerland-ref/src/components/ui/CountdownLabel.tsx`
- `/Sunflowerland-ref/src/components/ui/TimeLeftPanel.tsx`

**What they do**:
- Countdown timers with auto-refresh
- Time formatting utilities (seconds to "5m 30s")
- Visual countdown displays

**Adaptation notes**:
- Remove i18n translations
- Adapt styling to zombie theme
- Use for zombie growth timers, decay countdowns

**Usage in Zombie Farm**:
- Zombie growth timers
- Decay countdown warnings
- Building construction timers
- Combat cooldowns

---

#### 13. Confirmation Modal

**Source**: `/Sunflowerland-ref/src/components/ui/ConfirmationModal.tsx`

**What it does**:
- Reusable confirmation dialog
- Configurable title, description, action buttons
- Cancel/confirm pattern

**Adaptation notes**:
- Adapt to our Modal system
- Zombie-themed styling

**Usage in Zombie Farm**:
- Confirm sending zombies to combat (permadeath warning)
- Confirm resource spending
- Confirm destructive actions

---

### Asset Organization

#### 14. Asset Constants Pattern

**Source**: `/Sunflowerland-ref/src/assets/sunnyside.ts`

**Pattern**:
- Central asset manifest
- Type-safe asset imports
- Grouped by category (ui, icons, crops, etc.)

**Adaptation notes**:
- Create `/src/assets/zombiefarm.ts` manifest
- Categories: ui, zombies, buildings, resources, combat

**Example**:
```typescript
export const ZOMBIEFARM = {
  ui: {
    panel: require('./ui/panel.png'),
    button: require('./ui/button.png'),
  },
  zombies: {
    shambler: require('./zombies/shambler.png'),
    runner: require('./zombies/runner.png'),
  },
  // etc.
};
```

---

### Custom Hooks

#### 15. Sound Hook Pattern

**Source**: `/Sunflowerland-ref/src/lib/utils/hooks/useSound.ts`

**What it does**:
- Play sound effects with volume control
- Mute/unmute support
- Preload sounds

**Adaptation notes**:
- Implement later (Phase 6+)
- Use Web Audio API or Howler.js

---

### Styling Utilities

#### 16. Pixel Border Styles

**Source**: `/Sunflowerland-ref/src/features/game/lib/style.ts`

**What they do**:
- CSS objects for pixel-art borders using `border-image`
- Variants: dark, light, red, orange, blue, green, gray, vibrant

**Adaptation notes**:
- Create zombie-themed border styles
- Use CSS variables in our `index.css`
- Examples:
  - `pixelFleshBorderStyle` (zombie green)
  - `pixelBloodBorderStyle` (blood red)
  - `pixelRotBorderStyle` (decay brown)
  - `pixelToxicBorderStyle` (poison green)
  - `pixelNecroBorderStyle` (necromantic purple)

**Implementation**:
```typescript
// src/lib/ui/styles.ts
export const pixelFleshBorderStyle: React.CSSProperties = {
  borderImage: `url(/assets/ui/borders/flesh_border.png) 3 3 4 3 fill`,
  borderStyle: 'solid',
  borderWidth: '8px 8px 10px 8px',
  imageRendering: 'pixelated',
  borderImageRepeat: 'stretch',
};
```

---

## Component Adaptation Priority

### Phase 1: Foundation (Immediate)
1. ReactPortal (no changes needed)
2. HudContainer (minimal changes)
3. Panel system (adapt theme)
4. Button component (adapt theme)

### Phase 2: Core UI (Next sprint)
5. Modal system (remove sound, adapt theme)
6. Label component (adapt colors)
7. ProgressBar (adapt colors)

### Phase 3: State Integration
8. GameProvider pattern (implement our game state)
9. useActor/useSelector hooks (use as-is)
10. Phaser event bridge (custom implementation)

### Phase 4: Enhanced UI
11. Confirmation modal
12. Time/countdown components
13. Pixel border styles

### Phase 5: Polish
14. Asset manifest system
15. Sound hook (if needed)

---

## Notes on Blockchain Removal

**Remove these entirely**:
- All Web3/blockchain imports
- Wallet connection logic
- Transaction components
- NFT/token components
- Crypto currency displays (SFL, MATIC, etc.)

**Keep and adapt**:
- UI components (panels, buttons, modals)
- XState patterns (state machines, context providers)
- Phaser integration patterns
- Time/countdown utilities
- Animation utilities
- Sound utilities (implement without blockchain)

---

## Testing Strategy for Adapted Components

1. **Visual Testing**: Ensure zombie theme applied correctly
2. **Interaction Testing**: Click handlers, animations work
3. **State Integration**: Components update when game state changes
4. **Phaser Integration**: No click-through issues, proper layering
5. **Performance**: No unnecessary re-renders

---

## Notes for Developers

- **Always use the `hud-element` class** for any overlay UI on top of Phaser canvas
- **Avoid absolute positioning** unless necessary for modals/tooltips (use flexbox)
- **Test with different aspect ratios** - canvas should always maintain 16:9
- **Keep HUD minimal** - game should be playable with HUD hidden (keyboard shortcuts)
- **Modals should pause game time** - ensure this in state machine transitions

---

## References

- **ARCHITECTURE.md**: Overall system design
- **UIUX.md**: Detailed UI component specifications (to be populated)
- **DOMAIN-FARM.md**: Farm-specific UI requirements
- **DOMAIN-COMBAT.md**: Combat-specific UI requirements
- **Zombie-Farm-PRD.md**: Game design reference
- **Sunflowerland-ref/**: Reference codebase for UI patterns

---

**Last Updated**: 2025-11-12
**Version**: 1.1
**Author**: Core Systems Agent (Claude)
