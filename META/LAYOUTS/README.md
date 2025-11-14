---
title: 'Layout Documents Index'
last updated: 2025-11-12
version: 1.0
---

# Layout Documents - Visual Design & UI Architecture

This directory contains comprehensive layout and UI design documents for the Zombie Farm game. These documents bridge the gap between game design (PRD), domain mechanics (DOMAIN docs), and technical implementation (ARCHITECTURE).

## Purpose

Layout documents provide:
- **Visual specifications**: Screen layouts, component positioning, UI hierarchy
- **Interaction patterns**: How players interact with different systems
- **Integration guidelines**: How UI connects with game logic and state
- **Implementation blueprints**: Technical details for building UI components
- **Reusable component identification**: Which Sunflower Land components can be adapted

## Document Overview

### LAYOUT-CORE.md
**Main Game UI and Navigation**

- Primary game screen structure (header, canvas, footer)
- HUD component design and positioning
- Scene transition patterns (Farm ↔ Combat ↔ World)
- Modal layer architecture
- Notification system
- State flow between React and Phaser
- Responsive behavior

**Use This When:**
- Building the main game container
- Implementing HUD overlays
- Creating scene transitions
- Setting up modal and notification systems

---

### LAYOUT-FARM.md
**Farm System Visual Layout**

- Tile-based grid system (32x32px tiles)
- Farm zones (plots, buildings, resource nodes, zombies)
- Plot interaction UI (plant, water, fertilize, harvest)
- Zombie management interface (active roster, Crypt storage)
- Building placement system with preview
- Resource gathering interactions
- Farm HUD components
- Day/night and weather visual effects

**Use This When:**
- Implementing the Phaser FarmScene
- Building farm-related UI components
- Creating plot placement and interaction systems
- Designing zombie management screens
- Implementing building placement mechanics

**Key Systems:**
- Grid coordinate system for placement
- Plot state visualization (empty, growing, ready)
- Active zombie roster and Crypt UI
- Building menu and placement preview
- Resource node indicators

---

### LAYOUT-COMBAT.md
**Combat System Battlefield Design**

- Battlefield layout (1920x1080, side-scrolling)
- Zone breakdown (zombie spawn, combat zone, enemy spawn)
- Pre-battle UI (target selection, squad formation)
- Battle screen HUD and controls
- Unit rendering and animation system
- Damage type visual effects (fire, toxic, holy, etc.)
- Status effect indicators (poison, burning, stunned, etc.)
- Fortification and obstacle rendering
- Victory/defeat screens and rewards

**Use This When:**
- Implementing the Phaser CombatScene
- Building pre-battle squad selection UI
- Creating battle HUD and controls
- Implementing damage effects and animations
- Designing post-battle reward screens

**Key Systems:**
- Side-scrolling battlefield with lanes
- Unit sprite rendering with health bars
- Damage numbers and projectile systems
- Status effect visual feedback
- Wave progress indicator
- Post-battle summary screen

---

## Relationship to Other Documents

### Layout Documents vs Domain Documents

**Domain Documents (DOMAIN-FARM.md, DOMAIN-COMBAT.md):**
- Define WHAT features do (game rules, mechanics, formulas)
- Authoritative for game logic
- Focus on behavior and calculations
- Example: "Zombies decay 1% per day without feeding"

**Layout Documents (LAYOUT-FARM.md, LAYOUT-COMBAT.md):**
- Define HOW features are presented visually
- Authoritative for UI/UX implementation
- Focus on player interaction and visual feedback
- Example: "Decay is shown via a health bar overlay with red tint animation"

### Layout Documents vs PRD

**PRD (Zombie-Farm-PRD.md):**
- High-level game design vision
- Feature descriptions and player experience
- Design intent and rationale

**Layout Documents:**
- Detailed visual specifications
- Concrete implementation details
- Technical UI architecture

### Layout Documents vs Architecture

**ARCHITECTURE.md:**
- System-wide technical architecture
- Code organization and patterns
- State management approach
- General tech stack details

**Layout Documents:**
- Specific UI component hierarchy
- Visual layout specifications
- User interaction flows
- Scene-specific implementation

---

## Document Hierarchy

```
PRD (What game should be)
  ↓
DOMAIN Docs (How mechanics work)
  ↓
LAYOUT Docs (How UI looks and interacts)
  ↓
ARCHITECTURE (How code is structured)
  ↓
Implementation (Actual code)
```

**Authority Chain:**
1. **PRD** defines the game design intent
2. **DOMAIN** documents specify mechanics precisely
3. **LAYOUT** documents specify visual presentation
4. **ARCHITECTURE** documents specify technical implementation
5. **Code** implements following all above

---

## When to Use Layout Documents

### During Design Phase
- Understanding how systems should look
- Planning UI component structure
- Identifying reusable patterns from Sunflower Land

### During Development
- Implementing Phaser scenes (Farm, Combat, World)
- Building React UI components (HUD, modals, menus)
- Creating interaction systems (clicking, dragging, hovering)
- Positioning UI elements correctly

### During Integration
- Connecting UI to game state
- Setting up event handlers
- Implementing state synchronization
- Bridging Phaser and React

### During Testing
- Verifying UI behaves as specified
- Testing interaction patterns
- Validating visual feedback
- Ensuring responsive behavior

---

## Sunflower Land Component Reuse

All layout documents identify which Sunflower Land components can be reused:

**From LAYOUT-CORE.md:**
- Modal system (`Modal.tsx`)
- HUD panels (`Panel.tsx`)
- Notification toast (`InnerPanel.tsx`, `Label.tsx`)
- Resource counters
- Settings menu

**From LAYOUT-FARM.md:**
- Grid-based placement system
- Building UI components (`BuildingModal.tsx`)
- Resource indicators
- Timer displays (`TimeLeftPanel.tsx`)
- Inventory panels (`InventoryItemName.tsx`)

**From LAYOUT-COMBAT.md:**
- Health bars
- Damage number animations (`ResourceDropAnimator.tsx`)
- Sprite animations (`SpriteAnimator.tsx`)
- Status effect icons
- Progress bars

---

## How to Read Layout Documents

Each layout document follows this structure:

1. **Visual Layout**: ASCII diagrams and dimensions
2. **Component Breakdown**: Detailed descriptions of each UI element
3. **Interaction Mechanics**: How players interact with the system
4. **State Flow**: How UI connects to game logic
5. **Technical Implementation**: Code structure and patterns
6. **Sunflower Land References**: Reusable components identified

**Reading Tips:**
- Start with visual diagrams to understand overall structure
- Read component descriptions for positioning details
- Study interaction mechanics for event handling
- Review state flow for integration points
- Check Sunflower Land references for code reuse

---

## Updating Layout Documents

Layout documents should be updated when:

**Visual Changes:**
- Screen layout changes
- Component positioning changes
- New UI elements added
- Interaction patterns modified

**Implementation Reveals Issues:**
- Original design proves impractical
- Performance requires optimization
- User testing shows confusion
- Technical constraints discovered

**Feature Additions:**
- New game modes added
- New UI components created
- New interaction patterns needed
- New visual effects implemented

**Update Guidelines:**
1. Explain WHY the change is needed
2. Update diagrams and descriptions
3. Verify consistency with DOMAIN docs
4. Update affected code references
5. Note in document version history

---

## Version History

- **v1.0** (2025-11-12) - Initial creation
  - LAYOUT-CORE.md created
  - LAYOUT-FARM.md created
  - LAYOUT-COMBAT.md created
  - README.md (this file) created

---

## Notes for Developers

**When Building UI:**
1. Read the relevant layout document completely
2. Review Sunflower Land components for reuse
3. Follow the specified component hierarchy
4. Use the documented interaction patterns
5. Connect UI to state as specified in state flow diagrams

**When Stuck:**
1. Check if the layout document covers your scenario
2. Review Sunflower Land reference for similar patterns
3. Consult ARCHITECTURE.md for technical patterns
4. Ask developer for clarification if unclear

**Best Practices:**
- Layout documents are implementation blueprints, not suggestions
- Visual specifications should match final implementation
- Deviations should be discussed and documented
- Update layout docs when implementation reveals better approaches

---

**Remember:** Layout documents are the bridge between design intent and code implementation. They ensure consistency, guide development, and preserve design decisions for future reference.
