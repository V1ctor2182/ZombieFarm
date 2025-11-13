---
title: "Farm Domain Rules"
last updated: 2025-11-12
author: Solo Dev
---

# Farm Domain Rules

This document defines the game mechanics and rules that govern the **Farm** part of Zombie Farm. The farm is the player's base of operations where zombies are grown and managed. All behavior described here is derived from the game design document (Zombie Farm GDD) and represents what the Farm AI agent should enforce in code. 

## Zombie Lifecycle on the Farm
**Planting:** Players plant **zombie seeds** in **plots** (think of plots as haunted soil patches). A zombie seed is an item (like "Shambler Seed") that can be obtained or purchased. Planting a seed in an empty plot begins the growth process. Key rules:
- A plot must be available (empty) to plant a seed. If all plots are occupied, the player must build or free a plot.
- Upon planting, the seed is consumed and the plot enters a "growing" state. An initial sprout or grave marker appears on the plot as visual feedback.
- **Growth Time:** Each zombie type has a base growth duration (e.g., a basic Shambler might take 5 minutes to grow). This can be modified by factors like watering or fertilizer. For example, watering the seed with **Blood Water** (the dark equivalent of water) speeds up growth – the first tutorial seed grows almost instantly after watering for demonstration.
- The game should allow the player to water/fertilize a growing zombie to reduce its remaining time (subject to resource availability and perhaps a limit on how often).
- Growth continues even if the player is offline. When the player returns, any seeds that have completed their timer become ready to harvest.

**Harvesting:** When a zombie finishes growing, the plot changes to indicate a ready state (e.g., an undead hand reaching out of the soil). The player can then **harvest** it:
- Harvesting a zombie means the zombie emerges from the plot and joins the player's active collection on the farm. Visually, the zombie character climbs out of the ground.
- After harvest, the plot becomes empty (or fallow) again, requiring replanting for another zombie.
- A harvested zombie is now a **living undead** on the farm. It will wander around the farm autonomously unless given commands (creating that “living farm” feel).
- Harvesting yields not only the zombie itself but sometimes by-products. According to design, certain zombies or actions might drop resources on harvest (e.g. a chance to get **Rotten Wood** or **Bones** when a zombie crawls out, as flavor). Such drops feed into the resource system (see Resources section).

**Living Zombies on the Farm:** Once active, farm zombies follow simple AI behavior:
- They roam the farm area freely (though generally staying within the farm boundaries). Some personality variations exist (aggressive ones patrol, lazy ones idle more) – see “Zombie Personalities” for flavor differences, but core mechanics below apply to all.
- Zombies will automatically perform minor tasks if available: e.g., they might attack intruding enemies (like wild animals or an invading human raider) if that system is in scope, or help in resource gathering (design suggests possible small resource finds when happy).
- The player can interact with active zombies:
  - **Petting:** The player can approach and "pet" or otherwise affectionately interact with a zombie periodically. This increases the zombie’s **Happiness** (see Happiness section) but has a cooldown (e.g., each zombie can be pet once per in-game day).
  - **Feeding:** The player can feed a zombie with a resource (usually **Rotten Meat** or similar). Feeding immediately satisfies the zombie’s hunger for the day, preventing stat decay (covered below) and boosting happiness.
  - **Commands:** Players can give simple commands. In design, commands include “Follow me” (zombie follows the player character), “Go to Crypt” (stow the zombie away), or context-specific tasks like “Guard this area” or “Train at dummy”. These interactions don’t change core rules but allow the player to organize zombies. For instance, a commanded zombie to guard will stay near a spot (useful if raids happen).

**Death on Farm:** It’s actually difficult for a zombie to die while on the farm under normal conditions (since battles happen off-farm). However:
- If a raid or wild threat occurs on the farm and a zombie’s HP hits zero, that zombie is destroyed (true death). Farm defense mechanics (like base defense structures) are being considered, but currently, we assume minimal lethal threats on the farm.
- A zombie that decays completely (see Decay below) does not die outright but becomes extremely weak (to the point of being useless until restored or fed). We do not let them decay to 0% stats on the farm automatically (there’s a decay floor).
- The player can intentionally “sacrifice” or remove a zombie via certain structures or actions (not in initial scope, but e.g., converting a zombie into resources via a compost might be a future mechanic).

## Decay and Maintenance
Zombies are undead but **not immortal** – they **decay** if neglected. Decay represents the gradual loss of a zombie’s effectiveness (their flesh rots further, they get sluggish). The farm gameplay involves mitigating decay through care:
- **Stat Decay:** Each zombie has an internal integrity or freshness value (which influences their stats like health and damage). Every in-game day a zombie goes without care, a portion of its stats are reduced. For example, a common zombie might lose ~1% of its max health and damage per day of neglect. Stronger or higher-tier zombies decay faster proportionally (because they are more “unstable”).
- **Happiness Decay:** Neglect also lowers the zombie’s Happiness metric daily. Happiness and decay are linked; an unhappy zombie might exhibit slightly worse performance.
- **Feeding:** The primary way to prevent decay is feeding the zombie once per day. If a zombie is fed (with the appropriate item, e.g., a portion of rotten meat or brain), its daily stat decay is **fully prevented for that day**. Essentially, feeding resets the decay counter and can even restore a small amount of any stats lost to decay. This keeps the zombie “fresh”. 
  - Upkeep cost: Each zombie consumes one unit of feed per day for optimal maintenance. The player must manage to have enough feed resources for the horde or let some go hungry (and thus weaken).
- **Rest and Shelter:** Zombies that have shelter decay slower. If a zombie is placed in a **Crypt** (basically removed from active duty and stored, see capacity section), its decay is paused entirely:contentReference[oaicite:58]{index=58}. On the farm, if you have built structures like gazebos or resting areas, zombies using them might have reduced decay rate (e.g., 50% less) since they’re quite literally resting in a controlled environment. This encourages building shelters.
- **Other Decay Reducers:** Special items can reduce decay. The design mentions things like embalming fluid or magical seals that could be equipped to a zombie to slow its decay. In gameplay terms, these would be rare upgrades the farm agent would check: if a zombie has a “Preservation Talisman”, maybe apply only 0.5% decay instead of 1%.
- **Decay Floor:** A zombie’s stats won’t decay below a certain threshold from neglect alone (they won’t decay to absolute 0 strength just by not feeding). For instance, we might say stats bottom out at 50% of their original value if never fed. This ensures zombies aren’t permanently useless if you skip feeding, but they’ll be much weaker until cared for.
- **Recovery:** If a zombie has decayed and then you resume feeding it daily, it will stop further decay. Some slight recovery of stats might occur (design suggests feeding could even restore a small amount of lost stats, perhaps slowly over multiple feedings). However, major decay might only be reversible through special items or leveling up the zombie (if RPG-like progression is included).

**Happiness:** Separate from physical decay, each zombie has a **Happiness** meter (mood):
- Happiness ranges from very unhappy to very happy. In design, this is tied to face icons/colors (e.g., green happy, yellow neutral, red unhappy).
- Factors that increase happiness: 
  - Petting the zombie (+ small boost, with cooldown).
  - Feeding (in addition to preventing decay, a fed zombie gets a happiness boost because it’s not hungry).
  - A clean, safe environment – if the farm is kept clear of gore/trash and has decorations, zombies are happier.
  - Social & Entertainment – zombies are happier if not alone. Keeping at least a few zombies out on the farm means they mingle (in their own undead way) and stay more content.
- Factors that decrease happiness:
  - Not feeding (hunger) makes them grumpy (one day unfed might drop happiness significantly).
  - Being attacked or injured (a zombie that got hurt in a raid might lose happiness).
  - Boredom or loneliness – if only one zombie is active and the rest are in storage, that zombie can become lonely over time.
  - Unpleasant environment – e.g., if the farm is littered with corpses or holy artifacts causing discomfort, zombies get unhappy.
- **Effects of Happiness:** Happiness directly impacts productivity and performance:
  - A happy zombie fights better (we interpret this as a small buff to combat stats or faster attack rate when happiness is high).
  - Happy zombies might occasionally yield bonus resources on the farm – design suggests a happy zombie might find a bone and give it to you, whereas an unhappy one definitely won’t.
  - Unhappy zombies can develop negative behaviors: an extremely unhappy zombie might ignore commands or be slower to respond (there’s mention of potential “cowardly” trait or refusal to fight if morale is low:contentReference[oaicite:74]{index=74}).
- The farm gameplay loop encourages keeping zombies at least neutral to happy. It’s a soft mechanic – unhappy zombies don’t die (unless through combat or extreme neglect), but they become less useful.
- **Recovery of Happiness:** It naturally recovers if conditions improve. If you start feeding and caring for an unhappy zombie, each day its mood will step up. Petting gives an immediate small jump. We cap how quickly it can change – e.g., it might take a few days of good care to go from very unhappy to very happy.

## Capacity and the Crypt
Managing the number of zombies is a key farm rule:
- **Active Zombie Cap:** There is a limit to how many zombies can wander on your farm at once. This starts at a base value (e.g., **10 active zombies** at game start). The cap exists for both game balance and performance reasons.
- **Exceeding Cap - Crypt Storage:** If the player has more zombies than the active cap (through continuous harvesting), any extra zombies are automatically placed into **storage** in the **Crypt**. The Crypt is analogous to a barn or stable in farming games – an off-screen storage for your surplus undead. A message will inform the player: “Too many zombies! Zombie sent to Crypt.” when this happens.
  - Zombies in the Crypt are inactive: they do not roam, do not decay, and do not consume resources:contentReference[oaicite:79]{index=79}. It’s essentially suspended animation (the crypt’s magic preserves them).
  - The player can manage which zombies are in the Crypt via a UI (likely a Crypt menu listing all stored zombies). They can **deploy** a zombie from the Crypt back to the farm (if there is free cap space) or **dismiss** an active zombie to the Crypt to free space.
  - Example use: Before a battle, the player might swap specific zombies out of the Crypt to have them available for combat.
- **Increasing Capacity:** The active zombie cap can be increased by investing in the farm:
  - **Structures:** Building more housing like **Mausoleums** or Crypt expansions increases the cap. Each structure might say “+5 zombie capacity”.
  - **Upgrades/Research:** The player can research necromancy techniques or upgrade their Command Center (a key building) to support a larger horde. E.g., a tech “Advanced Reanimation” might permanently +10 capacity.
  - **Farm Expansion:** Expanding the farm’s land area inherently allows more roaming space, potentially increasing cap slightly by providing more space.
  - By endgame, with all upgrades, the cap might reach around **100 active zombies**, truly a horde, which the game will support via simplified AI and performance optimizations.
- **Crypt Usage Strategy:** The design encourages players to not simply keep all zombies active. Storing some in Crypt (especially high-value ones you can’t feed due to resource limits or you want to protect from raids) is a valid strategy. The game rules reflect that by not penalizing crypt storage (no decay there). It’s essentially pausing those zombies. However, stored zombies provide no benefit until reactivated (they can’t defend or produce anything while stored).

## Resources and Structures on the Farm
The farm is also the place where players gather and utilize resources for progression:
- **Primary Farm Resources:** 
  - **Rotten Wood** – Sourced by chopping down dead trees on the farm or from destroyed wooden structures. It serves as a basic building material (used to construct new plots, build simple buildings like fences). It’s effectively the wood of this world.
  - **Bones** – Obtained by digging graves, defeating skeleton enemies, or finding bone piles. Used as a building material and in fertilizers (ground bones = bone meal). Functions akin to stone/metal in early game.
  - **Blood Water** – Collected from **Blood Wells** (which refill over time) or barrels during blood rain events. Used for watering zombie crops (speeds growth, analogous to water) and as an ingredient in certain potions.
  - **Corpse Dust** – Produced by the **Corpse Composter** structure (which decomposes spare body parts) or found in ancient crypts. Acts as a potent fertilizer to boost zombie growth or quality, and in crafting dark potions.
  - **Soul Fragments** – Gained from defeated human enemies (each human might release a fragment) or high-quality zombie harvests. Used for magical purposes: high-end fertilizer, mutation catalysts, or crafting dark spells. In late game, might also upgrade structures with soul energy.
  - *(Other resources exist like Iron Scraps, Cloth, Brains, etc., as listed in design, but the above are central farm resources.)*
- **Resource Gathering Mechanics:** On the farm, the player performs actions to gather resources:
  - **Chopping Deadwood:** Clicking on a dead tree obstacle will remove it (possibly after a short progress bar) and yield Rotten Wood. Trees might respawn over days or be limited per land expansion.
  - **Digging & Clearing:** Removing debris or grave mounds can yield Bones or other materials. For example, clearing a ruin might give cloth or metal scraps occasionally.
  - **Blood Well Collection:** The farm starts with or can build a Blood Well. It accumulates Blood Water over time (say 1 unit per 5 minutes). The player can collect from it (which resets it to empty). A UI indicator shows when it’s ready.
  - **Composting:** Using a Corpse Composter structure allows conversion of organic waste (spare zombie parts, rotten meat) into Corpse Dust over several hours. The player must load it with input and later retrieve the output.
  - The farm agent will have to implement timers for resource nodes (like wells refilling, composting taking time) and ensure resources can’t be exploited infinitely without time.
- **Building & Construction:**
  - Players can construct buildings on their farm grid. Buildings require resources (and often Dark Coins).
  - Construction is initiated via a build mode (the player selects a structure to build and places it on a valid location). When placed, either it is built instantly if small or has a build timer for larger structures.
  - Example structures and their gameplay effects:
    - **Zombie Plot:** The most basic “structure,” a plot costs some Rotten Wood and Bones to build and allows planting a zombie. Increasing plot count is essential to grow more zombies simultaneously.
    - **Crypt Upgrade/Mausoleum:** Increases zombie storage capacity (as discussed in capacity section). May also cosmetically change the Crypt building on the farm.
    - **Training Dummy:** Allows zombies to train/idle there, possibly converting idle time into a bit of XP or satisfying an entertainment need. (Design mentions training dummies as both decoration and minor combat training).
    - **Defensive Structures:** e.g., wooden spikes, walls, or a Guard Tower. These would play a role if/when raids on your farm occur, damaging or slowing enemies automatically. For now, they mainly serve as preparation (increasing your defense stat in raid calculations).
    - **Decorations:** Non-functional but can boost happiness (design suggests zombies gather around spooky decorations for socializing). E.g., a bonfire or pumpkin scarecrow might mildly improve nearby zombies’ happiness.
  - Building rules: The player must have enough resources and possibly meet prerequisites (e.g., need Command Center built to unlock advanced buildings). Once placed, a building usually occupies a certain number of grid tiles and cannot overlap other objects.
  - Some buildings can be upgraded to higher levels for improved effects (e.g., a Level 2 Bone Mill yields bone meal faster).
- **Farm Expansion:**
  - The player can spend Dark Coins and resources to expand the farm’s boundaries. Each expansion adds new land tiles at the edges, potentially unlocking new biomes (design mentions different regions like swamp or ruins with unique resources).
  - Expanding the farm is a major progression milestone: it increases buildable area, might slightly raise zombie capacity, and reveals resource nodes (e.g., a swamp expansion might have a **Bog of Decay** resource that yields tar).
  - Domain-wise, expansion requires a substantial investment (e.g., 100 Dark Coins, 50 Wood, 50 Stone for the first expansion) and has a build time. Once completed, the new area becomes available for use.

## Time and Progression
- **Day/Night Cycle:** The farm operates on a day-night cycle (for atmosphere and certain mechanics). One full cycle is about **30 minutes real-time (20 min day, 10 min night)** by default. This can be tuned. During night, some mechanics change:
  - Zombies might become slightly more active or roam faster at night (undead prefer darkness).
  - Certain actions (like growth) might slow during the day if sunlight is harmful, and speed at night. For instance, the design notes bright sun might slow undead growth a bit:contentReference[oaicite:101]{index=101}.
  - No severe penalties are imposed, but players might plan to do certain tasks at day vs night (e.g., maybe higher chance of zombie mutation under a full moon at night).
- **Weather System:** Weather events add variability to farm gameplay:
  - **Blood Rain:** Occurs occasionally, turning rain into blood. This refills Blood Wells faster and could accelerate zombie growth or boost happiness slightly (zombies feel invigorated by blood rain).
  - **Bright Sunlight:** Rare midday event, a burst of intense sun that zombies dislike. If it happens, zombies on the farm might decay slightly faster that day or lose a bit of happiness:contentReference[oaicite:102]{index=102} (the player can mitigate by having them in shelters).
  - **Fog/Mist:** Cosmetic heavy fog might roll in some mornings or nights. It could slightly reduce raid chances or have no mechanical effect beyond atmosphere.
  - Weather is primarily an immersion layer for now; later it might tie into events (e.g., Blood Moon night might trigger a special raid).
- **Offline Progress:** The farm persists while the player is away. When the player logs back in, the game calculates how much time passed and advances the state:
  - Any zombie growth timers are reduced accordingly (zombies may have finished growing and be waiting to be harvested).
  - Daily decay is applied for each full day elapsed offline (with feeding considered if the player had automated feeding, though initially we don’t have automation – so likely zombies decay for each day you’re away unless you stored them).
  - Resource nodes like wells and composters update (e.g., if you were gone 3 hours, your Blood Well will be full and some).
  - For simplicity, we might cap the offline simulation to a certain limit (say, 7 days) so extreme absences don’t completely break balance (zombies won’t decay 100% if you come back after months – they’ll be at the decay floor and very unhappy, but not gone).
- **Player Progression:** While primarily covered in player progression docs, as it pertains to farm:
  - **Necromancer Level:** The player gains XP for farm actions (harvesting zombies, building structures, completing farm quests). Leveling up can unlock new buildings or increase cap. For example, reaching Necro Level 5 might unlock the Crypt upgrade structure.
  - **Quests:** The farm will have quests (possibly delivered by NPCs or a quest board) like “Harvest 10 zombies” or “Collect 100 Rotten Wood.” Completing these yields rewards (resources, Dark Coins, maybe a unique seed) and guides the early game.
  - **Achievements:** Long-term goals like “Harvest 1000 zombies” give cosmetic rewards or small boosts. This encourages continued farm engagement even in late game.
  - **Tech Tree / Research:** The Command Center building could allow researching improvements (like faster growth rituals, improved fertilizers, etc.), which the Farm agent would implement as passive bonuses once unlocked.
  
Each of these rules will be enforced by the Farm systems in code. The Farm AI agent uses this document as the authoritative reference when implementing features or validating game state. Consistency with these rules ensures that the farm gameplay in Zombie Farm matches the design vision: a blend of a farming sim (with undead twists) and a strategic management game where preparing and maintaining your horde is key to overall success.
