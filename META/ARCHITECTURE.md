---
title: "Zombie Farm - System Architecture"
last updated: 2025-11-12
author: Solo Dev
---

# System Architecture

## Overview
Zombie Farm is built as a modular, single-page web application using **React** and **TypeScript** for the user interface and game logic. The project adopts an event-driven architecture and a layered design to separate concerns:
- **Domain Modules:** The game’s logic is divided into feature modules (e.g. Farm, Combat) under a common game state manager.
- **Game Engine Integration:** The interactive game world (farm exploration and combat scenes) uses the **Phaser** 2D engine embedded within React components for rendering.
- **State Management:** A global finite state machine (using **XState**) orchestrates game state transitions and events.
- **Persistence:** All game state is saved locally (no blockchain or server needed) via a local save system (similar to Sunflower Land’s `localSaveSystem.ts` utility).

## Project Structure
The codebase is organized into domain-driven folders for clarity and modularity:
```plaintext
src/
├── features/                 # Feature modules grouping domain logic
│   ├── game/                 # Core game logic (global state machine, events)
│   ├── farm/                 # Farm simulation (planting, harvesting, zombies)
│   ├── combat/               # Combat system (castle siege battles)
│   ├── world/                # World rendering (Phaser scenes, map)
│   └── [... other features as needed ...]
├── components/               # Reusable UI components (modals, HUD, etc.)
├── lib/                      # Shared libraries and utilities
│   ├── config/               # Game configuration (e.g. `zombieFarmConfig.ts`)
│   ├── storage/              # Persistence (e.g. `localSaveSystem.ts` for saves)
│   └── utils/                # Helper functions (formatting, random, etc.)
├── assets/                   # Static assets (sprites, images, audio)
└── types/                    # Global TypeScript type declarations


This structure follows the pattern from the Sunflower Land reference project. Each feature (farm, combat, etc.) contains its own logic (lib/ with business rules, state machines), UI (components/ for React views), and types. This modular approach ensures separation of concerns and makes each part of the game (farming vs combat) relatively self-contained.
Module Interaction
The main modules (Farm, Combat, World, etc.) interact through a central game state and event system:
Central Game State: A global state machine (the game module) tracks overall progress and orchestrates between farm and combat modes. For example, when a battle is initiated from the farm, the game state transitions to a combat state and loads the combat scene.
Events and Actions: Common actions (planting a seed, zombie harvested, battle started, etc.) are represented as events dispatched to the game state machine. The event-driven architecture means each user action triggers an event, which is validated and then updates the state. For instance, a zombie.planted event would reduce inventory seeds and start a growth timer in the Farm module.
Data Flow: Data flows unidirectionally: User Input -> Event Dispatch -> State Update -> UI Render. React components subscribe to relevant state slices (via context or hooks) and update automatically when state changes. This ensures a clear separation between logic and presentation.
Feature Boundaries: Modules communicate via the global state or explicit event calls rather than direct cross-module calls. For example, the Combat module will read the list of zombies (with their stats) from the global state when a battle starts, but it doesn’t directly modify the Farm module’s internals. Instead, results of combat (e.g. zombie death or loot gained) are dispatched as events (like combat.result) that the Farm and Inventory systems respond to.
Tech Stack
Zombie Farm’s architecture leverages a modern web tech stack, reusing proven patterns from Sunflower Land:
React 18 with TypeScript 5 for building UI components and implementing game logic in a type-safe manner. The component model fits well for interface elements (menus, HUD, dialogs) and also wraps game canvas elements.
Vite as the bundler and dev server for fast iteration. This provides hot-reload during development and efficient production builds (with code splitting, PWA support, etc.).
Tailwind CSS with a custom theme for pixel-art style UI. We maintain a consistent design (e.g. a dark “undead” theme defined in zombie-theme.css) and responsive layouts through utility classes.
Phaser 3 for the game world engine. Phaser is used to render the farm exploration (top-down view) and combat scenes (side-scrolling battles) within a <Canvas> element inside React. We utilize Phaser plugins like pathfinding for zombie movement and possibly a physics engine for combat interactions.
XState (state machines) for complex game logic. As in Sunflower Land, we use a finite state machine (gameMachine) to manage global game phases and critical logic (e.g. growth cycles, combat sequence). XState helps model game progression and ensures all events cause predictable state transitions.
Immer for immutable state updates (particularly if using Redux or context to store state slices), ensuring state modifications are done without side effects.
Jest and React Testing Library for test-driven development (see META-TESTING document for details). Tests ensure architecture integrity as we refactor or extend modules.
All blockchain and multiplayer components from Sunflower Land have been removed for this project. The game runs fully offline/local. We do plan for async multiplayer features (like other players raiding your farm asynchronously), but those will be implemented via local simulations or future server integration. There is no realtime network requirement in the current architecture.
State Management & Data
State in Zombie Farm is categorized to keep concerns separate:
Game State Machine: High-level state (tutorial progress, current mode = farming or combat, etc.) and core variables (e.g. current day, player level) live in a centralized machine. This machine references sub-states or modules as needed.
Farm State: Tracks all farm-specific data such as planted zombie seeds, growing timers, harvested zombies (their stats, happiness, etc.), structures built, and available resources. This could be encapsulated in a context or part of the game machine’s context. We also have config values (in zombieFarmConfig.ts) defining parameters like growth time, decay rates, etc., loaded on initialization.
Combat State: Manages data for an ongoing battle: the lineup of zombies chosen, enemy waves, current health of units, etc. This state exists only during combat sequences and is reset or saved as needed when combat ends.
Persistent Save Data: A local save file (likely in localStorage) stores the player’s progress, inventory, zombies, etc., so that the game can be reloaded. We reuse the approach from Sunflower Land’s localSaveSystem.ts to handle saving and loading JSON state to local storage seamlessly. Save operations are triggered at key events (end of day, after combat, on manual save request) to minimize data loss.
Temporal Data: Short-lived state (like currently selected tool or a transient UI panel open) is kept in React component state or context, not in the long-term game state.
Reusing Sunflower Land Components
Where possible, we incorporate or adapt components from the Sunflower Land reference:
UI Elements: Common UI patterns such as modals, menus, and error notifications are reused. For example, the ErrorMessage.tsx component (for displaying errors) and loading spinners can be integrated into our components library. Similarly, Sunflower Land’s HUD components (health bars, resource icons) are adapted for Zombie Farm’s theme.
Animation System: We plan to utilize the sprite animation utilities from the reference. The SpriteAnimator.tsx component in Sunflower Land (which animates sprite frame sequences) will be repurposed for animating zombie sprites and effects. Likewise, the ResourceDropAnimator.tsx used for showing resource pickups can be adapted to animate dropped brains or coins in our farm.
State Machines & Logic: The reference’s game event handlers serve as a blueprint. For example, the planting logic in Sunflower Land’s farming events (which checks inventory and updates plots) can be mirrored for zombie planting. We mirror their Action -> Validation -> State update flow for consistency. The large number of existing events (e.g. Sunflower Land had 366+ events for various actions) informs us which actions we need to implement (like planting, feeding, combat start, etc.).
Configuration & Balancing: Sunflower Land’s balance or config files provide a starting point for tuning. The zombieFarmConfig.ts includes constants for things like default zombie stats, growth durations, and decay rates which we derive from the design document. By centralizing these in a config, we can easily adjust game balance or difficulty in one place.
File and Asset Structure: We follow the reference project’s conventions for assets (e.g., storing map images under public/world/, character sprites under public/animals/ or a similar path). This consistency makes it easier to integrate any existing asset pipeline or tools from Sunflower Land.
Data Flow Example
To illustrate how the architecture works in practice, consider the flow of planting a zombie seed:
User Action: The player clicks on an empty farm plot and selects a “Shambler Seed” to plant.
Event Dispatch: This triggers a seed.planted event with details (seed type, plot id). The event is dispatched to the game state machine.
Validation & State Update: The Farm module’s logic (within the state machine or a reducer) handles the event. It checks that the player has a Shambler Seed in their inventory and that the plot is empty. If valid, it deducts one seed item, marks the plot as planted with a timer for growth, and creates a new zombie entry in a growing state.
UI Update: React UI components subscribed to farm state (the plot component and inventory HUD) detect the changes. The plot now shows a “seedling” graphic and maybe a progress bar, and the inventory count for Shambler Seeds decreases by one.
Timer & Growth: A timed event (e.g., using XState’s delayed events or a JavaScript timer) triggers a zombie.matured event after the growth duration. This event updates the state: the plot becomes harvestable and the sprite changes to a “ready” zombie emerging graphic (using our animation system).
Harvest: The player interacts to harvest, dispatching zombie.harvested. The Farm logic then replaces the plot with an empty state and adds a new zombie to the roaming horde on the farm. The UI removes the ready sprite and adds a zombie character to the world (via Phaser).
Persistence: At day’s end or on event completion, the new state (one less seed, one more active zombie) is saved via the save system.
This example shows how different parts (UI, game logic, animation, persistence) work together under the event-driven architecture. By designing the system in this modular way, we ensure that adding new features (say, a new resource type or a new combat ability) can be done by adding new events and handlers in the appropriate module, without tightly coupling everything.
Conclusion
The architecture of Zombie Farm emphasizes modularity, clarity, and reuse. By leveraging the Sunflower Land codebase and adhering to a test-driven approach, we can build a robust game where farm simulation and auto-battler combat coexist seamlessly. The structure outlined above will support ongoing development as new zombie types, mechanics, or UI improvements are introduced, keeping the code maintainable and scalable.