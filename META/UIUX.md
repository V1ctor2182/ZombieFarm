---
title: "Zombie Farm - UI/UX Design Standards"
last updated: 2025-11-12
author: Claude (AI Assistant)
---

# UI/UX Design Standards

This document describes the user interface and user experience guidelines for Zombie Farm. It covers the visual design system (colors, typography), layout patterns, accessibility considerations, and specifics for the farm and combat UIs. The goal is to ensure the game is not only visually appealing and thematic, but also intuitive and usable across devices.

## Design System

**Color Palette:** Zombie Farm’s color scheme leans into dark, spooky tones while maintaining sufficient contrast for clarity:
- **Primary Background:** Very dark gray or black (#101010, for example) as the base, creating a night-time mood on the farm.
- **Secondary Accents:** Eerie neon green and purple are used for highlights (e.g., progress bars, selection outlines) to evoke a necromantic feel. Green often indicates positive actions (growth, available resources) and purple for magical or special elements.
- **Alert Colors:** Use blood red (#B00000) for errors or critical warnings (like health low or a zombie dying), and a sickly yellow/orange for cautionary alerts (e.g., a zombie is hungry or an action not possible).
- **Text Colors:** Mostly light gray or white for standard text on dark backgrounds, to ensure readability (meet a11y contrast guidelines). Important keywords or values might be highlighted in the neon accent colors for emphasis.
- These colors should be defined in a central CSS (or Tailwind theme) so they remain consistent. We follow Sunflower Land’s practice of customizing Tailwind for our theme, replacing its brighter farm palette with our darker zombie palette.

**Typography:** 
- We use a legible **pixel-art font** for in-game text to match the retro aesthetic (for example, a font similar to Press Start 2P or a bitmap font). All text (UI labels, dialog text, numbers) should use this game font for consistency.
- Font size is kept relatively small (to match pixel art style), but not so small that it strains the eyes. On high DPI displays, ensure the font renders sharply (no anti-aliasing blur if possible – using CSS to preserve pixelated edges for the font if it’s a pixel font).
- Important headings (like section titles or important warnings) may use a stylized “horror” font or color treatment (e.g. dripping blood effect on the title “Zombie Farm”), but these are used sparingly for flavor. Most UI text prioritizes clarity over style.
- Avoid using too many font styles; stick to one or two at most (one for regular UI text, maybe one for decorative large titles). Consistency helps users parse information quickly.

**Iconography:**
- Use clear, pixel-art icons to represent resources, actions, and statuses. We inherit many icons from Sunflower Land’s asset library (e.g., wood, stone icons, etc.), modified to fit our theme (wood icon becomes “rotten wood”, etc.).
- Icons accompanying text (for example, a Dark Coin icon next to the currency amount) should be 16px or 32px in size (depending on context) and use flat colors or simple shading consistent with the pixel art style.
- All interactive icons should have an obvious affordance (e.g., a button icon should look pressable, possibly with a border or a background plate).

## Layout and Composition

We adopt a layered composition for the game UI:
- The **game world canvas** (Phaser canvas) runs in the background layer, occupying the full screen behind the UI.
- **UI Overlay Layers:** On top of the game canvas, we render React-based UI components. We use a combination of **Flexbox** and **Grid** layouts (via Tailwind CSS classes) to position these overlays in intuitive places (e.g., resource bars at the top, action buttons at the bottom).
- **Responsive Design:** The UI adjusts to different screen sizes:
  - On desktop, there is more horizontal real estate: HUD bars and panels can be spread out (for example, resources might be shown as a top bar with text labels).
  - On mobile, UI elements might collapse or reposition into a single column or popup. We ensure buttons are large enough on touch screens and spaced sufficiently to avoid mis-taps. Some interfaces may switch to icon-only on smaller screens to save space (with tooltips or labels on long-press).
  - We use relative units and Tailwind’s responsive utilities (e.g., `sm:`, `md:` breakpoints) to implement these adjustments without maintaining separate code.
- **Composition Patterns:** 
  - **Modularity:** Each UI element (inventory list, zombie status panel, etc.) is a self-contained component. We compose the HUD from these building blocks (e.g., <ResourceBar />, <ZombieCount />, <TimeOfDayIndicator />).
  - **Consistency:** Similar functions have similar UI. For example, all “action” buttons (plant, feed, attack) have a consistent style (color, shape) to be recognizable as interactive. Panels have a consistent background style (semi-transparent dark rectangle with a border) to clearly delineate UI from the game world.
  - **Layering and Z-index:** In-game UI (HUD, small popups) is one layer above the game; full-screen modals (inventory menu, settings) are another layer above (dimming the game); tooltips might be on top of all. We define z-index levels for these: game (base), HUD (medium), modals (high), tooltips (highest), so that interactions happen in the correct order.

## Accessibility and Feedback

Even though Zombie Farm is a visually rich game, we strive to incorporate basic accessibility:
- **Contrast and Readability:** As mentioned, text color on backgrounds is chosen for high contrast. We avoid putting red text on black for extended prose, for example, because that’s hard to read. Instead, use red sparingly for short warnings or icons.
- **Scaling Options:** Provide a UI scale setting if possible (small/medium/large UI) to help players on small screens or with vision impairments enlarge the interface. This could simply be a setting that increases all font-sizes and component sizes by a factor.
- **Keyboard Navigation:** While most of the game is played via mouse/touch and keyboard for character movement, the UI should not lock out keyboard users. Ensure that all interactive elements (buttons, menus) can be focused via Tab and activated via Enter/Space. For example, a Pause or Settings button in the HUD should be reachable without clicking (especially important if a player is primarily using keyboard to move).
- **Focus Indicators:** If an element is focusable (like a button), it should have a visible focus outline when selected via keyboard, distinct from the normal hover or selection. We can style this outline to fit the theme (e.g., a glowing green outline) but it must be present.
- **ARIA Labels:** Icons and important images should have accessible names. For instance, the Dark Coin icon in the top bar should have `aria-label="Dark Coins"` so screen readers can read out the currency status. Similarly, any purely visual indicator (like a happiness face icon) should have an aria-label or tooltip that conveys the info (“Zombie is happy”).
- **Feedback and Status:** The UI must give clear feedback for player actions:
  - When a player performs an action (like plants a seed), give immediate feedback: e.g., a sound plays, the plot visibly changes, and perhaps a small text “Planted!” appears briefly.
  - If an action cannot be done, show a message explaining why (and do so in a non-intrusive way). For example, if the player tries to plant without seeds, we might shake the seed button and show “No seeds available” via the ErrorMessage component, or display a toast notification at the bottom.
  - **Error States:** Use the standardized error display (a red outlined box or popup) for serious errors (e.g., “Failed to load game data”). Minor errors (like invalid action) can be indicated with smaller notifications or UI hints (like graying out a button and a tooltip “Requires 5 Dark Coins”).
  - **Loading States:** Whenever the game is doing something that takes more than a fraction of a second (e.g., generating a new world, loading assets, saving data), provide a loading indicator. This could be a spinner icon in the corner or a full-screen overlay. For instance, when transitioning to a combat scene, we might dim the screen and show “Sending horde to battle...” with a spinning skull icon. We have a `LoadingFallback` component (inspired by Sunflower Land’s `LoadingFallback.tsx`) to show a full-screen loading message during initial load or scene switches.
  - **Success Feedback:** Positive feedback for achievements should be noticeable: e.g., leveling up triggers a brief screen flash or animation, collecting rewards causes the Dark Coin icon to briefly sparkle or an indicator “+100” float above it.

By providing consistent feedback, players will learn to associate sounds/animations with outcomes (for example, a particular sound when a zombie harvest is successful, or the screen shake when a zombie takes damage).

## Screen Layouts

### Farm Screen UI
The farm screen is where the player spends most of their time. Its UI is designed to show farming information and controls without obscuring the core gameplay area:
- **Top Bar / HUD:** At the top of the screen (or top-left on larger displays) we display key resources and status:
  - **Currency Display:** An icon and count of Dark Coins, so players always know their current money. If we have premium currency (Soul Essence), that can be shown alongside or when acquired.
  - **Resource Bar:** Important farm resources (Rotten Wood, Bones, etc.) are shown here with small icons and quantities. We will limit to the most important 3-4 resources to avoid clutter; the rest can be viewed in an inventory menu.
  - **Day/Night Indicator:** A small sun/moon icon with time of day could appear to give context to the day-night cycle (e.g., “Day 3 - Night”). This helps players anticipate events (like more zombies decay overnight).
  - **Player Info:** Optionally show the player’s necromancer level or health if relevant, or a small avatar icon.
- **Main Game View:** The majority of the screen is the top-down farm rendered by Phaser. We keep persistent UI minimal here to let the player see the farm. Interactive elements in the game world (plots, zombies) are directly clickable/tappable.
- **Contextual Tooltips:** When hovering or tapping on an interactive object, a small tooltip or label is displayed. For instance, hovering a planted zombie plot might show “Shambler (2m until harvest)” in a small text box near the plot. This appears above the game world layer but is styled in-game (like an in-world tooltip).
- **Bottom Actions Bar:** At the bottom of the farm screen, we present action buttons and the menu:
  - **Tool/Action Buttons:** e.g., a “Plant” tool, “Harvest/Scythe” tool, “Build” mode toggle. These could be represented by icons (a shovel for plant, a scythe for harvest, a hammer for build). On desktop, the player might switch tools via keyboard numbers as well, but the icons provide a clear clickable interface (and show the current selection highlighted).
  - **Inventory/Menu Button:** An accessible button (often an icon like a backpack or chest) opens the full Inventory/Crafting menu. This menu (when opened) pauses or overlays the game and shows all items the player has, crafting options, etc. We ensure this button is reachable (e.g., top-right or bottom-right corner) and clearly indicated.
  - **Settings/Pause:** A gear icon or similar in a corner allows the player to open settings or pause the game. On pause, possibly dim the game and show pause menu options.
- **Farm Zoom/Pan Controls:** If the farm is larger than the screen, provide UI for navigation: perhaps a mini-map or simple zoom in/out buttons (magnifying glass icons) and panning by dragging. On mobile, pinch-to-zoom and drag should be enabled. On desktop, scrolling and click-drag can work. If included, these controls are small and placed bottom-left or bottom-right.
- **Notifications:** Non-critical alerts (like “Zombie ready to harvest!” or “New quest available”) can appear as small pop-up bubbles on the farm screen. For example, when a zombie finishes growing, a subtle notification could float up from that plot or appear as a small panel at the side. We use a consistent style for these notifications (perhaps a parchment-like bubble or a stylized text box) and auto-hide them after a few seconds to avoid clutter.
- **Touch Controls (Mobile):** On mobile devices, when the player’s Necromancer needs to move via touch, we show a virtual joystick (semi-transparent circle) on the bottom left for movement and perhaps buttons on bottom right for actions (like an attack or interact button). These controls are only shown on touch devices and are hidden on desktop. They are sized generously (to accommodate fingers) and semi-transparent so as not to block the view.
- **Placement Mode UI:** When building structures or placing plots on the farm, enter a special UI state:
  - The build button toggles a placement mode where available structures are listed (probably as a horizontal list or grid panel on the bottom). The player selects one (e.g. a Crypt building), and then the game world shows a translucent preview under the cursor.
  - A confirm/cancel UI (like a green check and red X button) appears near the bottom or the item panel to finalize or cancel placement.
  - This mode’s UI is designed such that it’s clear you are in a different mode (perhaps the HUD dims or a “Build Mode” label appears). We copy Sunflower Land’s free placement UX cues to ensure it feels intuitive (as in the tutorial example where placement was highlighted).

Overall, the farm screen UI should feel integrated with the game world – giving necessary info (resources, tool selected, etc.) without overwhelming the screen. Players should be able to manage their farm and see the action (zombies roaming) simultaneously.

### Combat Screen UI
When entering a combat (castle siege) scene, the UI shifts focus to battle-related information and controls, while hiding or minimizing farm-centric elements:
- **Minimal HUD:** We remove or minimize the farm resource bar during combat to declutter (the player doesn’t need wood/stone info in battle). Instead, we display combat-specific stats:
  - **Zombie Horde Status:** A display of your participating zombies, possibly as a row of small icons at the top. This could show each zombie type in the battle and maybe their remaining count or health. For example, an icon for each zombie type (Shambler x3, Brute x1) or a dynamic count of how many of your total zombies remain alive.
  - **Enemy Wave Indicator:** If the battle has waves or a boss, indicate it on the top (e.g., “Wave 2/3” or an icon for the boss enemy).
  - **Battle Timer or Progress:** If relevant, show a progress bar for battle progression (e.g., how close the zombies are to breaching the castle, or a timer until a condition).
  - **Necromancer Abilities:** If the player can do limited actions (like cast a buff or summon reinforcement), those appear as buttons usually at the bottom or side. For example, a spell icon that can be tapped when ready. If not applicable, omit this.
- **Health Bars:** In combat, it’s crucial to convey health of units:
  - Zombies and notable enemies have health bars rendered either above their sprites in the game canvas, or in a fixed UI panel. We use small green (for zombies) and red (for enemies) bars that diminish as health drops. These bars are pixel-style but clearly visible (perhaps with a black border for contrast).
  - If many units are on screen, we might only show health bars when units are injured or on hover to avoid visual overload.
- **Combat Controls:** 
  - A **“Retreat” button** is provided in case the player wants to flee the battle early (maybe at cost of losing the remaining zombies). This is a prominent button (possibly bottom-right) since it’s an important action. It could be styled in warning colors (to indicate the gravity of retreat).
  - A **Speed Toggle** (if we allow speeding up combat) could be a small 1x/2x icon. This would likely sit near the top or bottom corner, not to be pressed often but available.
  - If combat is largely automatic, we ensure the UI communicates that (maybe a caption “Auto-battle in progress…” at start).
- **Idle Animations:** Zombies and enemies might have idle animations or reaction animations that add life to the scene. These are handled by the game engine, but the UI should not obstruct them. Ensure that any overlays (like damage numbers or status effect icons) are small and positioned smartly (e.g., above the unit) so as not to cover the art.
- **Transient Alerts:** During battle, use small text or icons to highlight key events:
  - When a zombie dies, a skull icon could briefly pop up or a "-1" next to the horde count.
  - Critical hits or effective attacks might flash the enemy health bar or show an effect (like a “CRITICAL!” floating text).
  - These should be attention-grabbing but not so flashy that they obscure the actual combat. Use them sparingly for important feedback (the player should be able to tell how the fight is going at a glance).
- **Camera and Controls:** In a side-scrolling combat, the camera likely follows the action automatically. The player generally doesn’t need to control it, but if they can, UI arrows or allowing drag on mobile could let them peek ahead. We’ll default to auto-camera unless playtesting shows need for manual control.
- **No Building UI:** Unlike the farm, there’s no building or planting interface here, so the screen is cleaner. We hide the farm toolbars. The Pause button might remain available (to pause battle if needed).
- **Accessibility in Combat:** Ensure that color indicators (like red flashing for low health) also have an alternative indication (such as an icon or text “Low HP”). Combat can be hectic, but we don’t rely solely on color. Also, provide captions for important sounds (if a zombie growls on death, perhaps a small text “[Zombie Defeated]” could appear for those not hearing the sound).

The combat UI is designed to communicate the tactical situation clearly, without the need for the player to micro-manage. Since the combat is an auto-battler, the UI’s job is mostly to display information (health, progress, results) and allow a couple of strategic inputs (like retreat or special ability). It should be even more minimalist than the farm UI, focusing the player’s attention on the battle animation itself.

## Conclusion

By adhering to these UI/UX standards, we aim for a coherent experience where the player can intuitively interact with the game and get feedback from it. Consistency in design and layout means once a player learns one part of the interface, that knowledge carries over to other parts (e.g., modal dialogs all look alike and have the same close behavior). The mix of Sunflower Land’s proven patterns with Zombie Farm’s unique theme will produce a UI that is both familiar to farming game veterans and fresh in its undead twist. We will continue to refine the UI with user testing, ensuring that it remains accessible and enjoyable on both desktop and mobile platforms.
