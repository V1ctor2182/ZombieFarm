### **Zombie Farm – Game Design Document**

Got it – I’ve updated the plan to remove any Web3 elements from the game design.

# **🧟 Zombie Farm – Game Design Document**

## **Table of Contents**

1. [Core Concept](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
2. [Tutorial & Onboarding](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
3. [Player Character & Farm](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
4. [Zombie Growth System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 4.1 [Planting & Growing Zombies](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 4.2 [Harvesting Zombies](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 4.3 [Mutations & Evolution](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
5. [Living Zombies on the Farm](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 5.1 [Zombie Behavior](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 5.2 [Managing Farm Zombies](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 5.3 [Zombie Interactions](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
6. [Castle Siege Combat System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 6.1 [Human Targets & World Map](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 6.2 [Battle Preparation](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 6.3 [Real-Time Combat Mechanics](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 6.4 [Permanent Loss & Rewards](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 6.5 [Advanced Combat Details](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
7. [Resource Economy](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 7.1 [Primary Currencies](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 7.2 [Farming Resources](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 7.3 [Resource Generation & Sinks](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
8. [Farm Management & Layout](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 8.1 [Buildings & Construction](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 8.2 [Base Defense & Raids](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 8.3 [Farm Expansion](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
9. [Player Progression](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 9.1 [Leveling System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 9.2 [Skill Trees](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 9.3 [Research & Technology](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 9.4 [Achievements](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
10. [PvE World & Exploration](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 10.1 [Exploration & World Regions](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 10.2 [Dungeons & Special Locations](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 10.3 [NPCs & Quests](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 10.4 [Events & Tournaments](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
11. [Special Events](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 11.1 [Seasonal Events](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 11.2 [Limited-Time Modes](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
12. [Game Loop & Strategy](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 12.1 [Daily Routine](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 12.2 [Seasonal Gameplay](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 12.3 [Progression Phases & Tips](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 12.4 [Endgame Goals](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
13. [Detailed Mechanics](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 13.1 [Zombie Decay System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 13.2 [Weather System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)
    - 13.3 [Territory Control](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)

---

## **Core Concept**

### **Overview**

**Zombie Farm** is a dark twist on the farming simulation genre (inspired by games like Stardew Valley) where the player is a **necromancer farmer**. Instead of growing plants, you cultivate **zombie crops** on your farm:

- **Control a Necromancer** – A player avatar who moves around the farm in a top-down 2D world (WASD or touch controls).
- **Plant and grow zombies** – “Zombie seeds” are planted in plots, tended like crops, and harvested as undead creatures.
- **Living farm** – After harvesting, zombies roam your farm freely, creating a lively (or rather, undead) farm atmosphere.
- **Command undead armies** – Raise a horde and lead automatic assaults on human settlements and castles in a side-scrolling auto-battler combat system.
- **Build and decorate** – Construct spooky farm buildings (crypts, mausoleums, labs) and freely place them on your land. Design your farm layout for both functional efficiency and eerie aesthetics.
- **Explore a dark world** – Venture into surrounding regions to gather resources, discover new zombie types, and conquer human territories.

### **Key Game Features**

- **Farming Simulation with a Twist:** Core farming mechanics (planting, watering, harvesting) are retained but applied to growing undead creatures instead of crops.
- **Free Placement Base Building:** Players have control over farm layout. You can place plots, buildings, and decorations anywhere within your land grid, allowing creative and strategic designs.
- **Necromancer Character Control:** Directly move your character around the world (similar to Stardew Valley). Interact with objects, use tools, and personally engage with your zombies and environment.
- **Auto-Battler Combat:** Battles play out in real-time 2D side-scrolling scenes. Once you deploy your zombies, they fight automatically against human defenders. It’s about preparation and strategy rather than twitch reflexes.
- **PvE Focus:** The conflict is against AI-controlled human factions. There is **no traditional PvP** combat; however, asynchronous multiplayer elements exist (like other players potentially raiding your farm while you’re offline, and community events).
- **Progression & Collection:** Over time, unlock dozens of zombie types, mutations, and upgrades. Improve your necromancer’s skills and expand your undead army. There’s a strong element of collection (like completing a “zombie compendium”) and continuous farm expansion.

---

## **Tutorial & Onboarding**

### **Initial Gameplay Walkthrough**

The game begins by gently introducing the player to core mechanics in a guided tutorial, ensuring they learn by doing. The onboarding focuses on planting a zombie and getting familiar with free placement and basic controls:

1. **Arrival at the Farm:** The player starts at their **abandoned undead farmstead**. A short narrative sets the stage (e.g. *“After inheriting an old cursed farm, you set out to build a zombie horde…”*). The camera centers on the Necromancer character next to a small field.
2. **Basic Movement & Interaction:** A prompt instructs how to move (WASD or arrow keys on PC, virtual joystick on mobile). The player is guided to walk to a highlighted spot where a **farm plot** can be placed.
3. **Placing a Farm Plot:** The tutorial explains **free placement**: it highlights an empty area and opens the building menu to select a **Zombie Plot** (a patch of haunted soil). The player drags the plot and places it on the ground (the game shows a green highlight for a valid placement). This demonstrates the layout freedom – the plot can be placed anywhere in the cleared area. Once placed, the plot appears as a tilled grave mound.
4. **Planting a Zombie Seed:** The player is given a starter seed (e.g. a **Shambler Seed**, the most basic zombie type). They are prompted to select the seed from their hotbar/inventory and plant it in the new plot (by clicking or using the shovel tool). A visual indicator confirms the seed is planted (the plot changes appearance to a “fresh grave” stage).
5. **Watering the Seed:** The game provides a **Blood Bucket** item to water the growing zombie. A prompt directs the player to an existing water source – for example, a small blood well is provided near the start (or they have a bucket pre-filled). The player uses the watering action on the plot, demonstrating that proper care (watering, fertilizing) speeds up growth.
6. **Fast Growth Demo:** To keep the tutorial snappy, the first seed grows rapidly (within a few seconds) through its stages. The game can show a quick time-lapse or simply shorten the timer for this tutorial seed.
7. **Harvesting the Zombie:** When the zombie is ready (the plot indicates a fully-grown undead with an arm sticking out), a prompt appears to harvest. The player uses the **Scythe** (or simply interacts) to harvest. A short animation plays: the newly grown **Zombie** claws its way out of the ground and stands before the player.
8. **First Zombie Interaction:** The tutorial now highlights the harvested zombie wandering around. It explains that harvested zombies become autonomous characters on the farm. The player is prompted to approach the zombie and **“Pet”** it (interact key) to increase its happiness. A heart or happy skull icon shows feedback. This introduces the concept of zombie happiness and that you can interact with your undead workers.
9. **Feeding and Care:** The player is taught that zombies need maintenance. The tutorial might give a **bucket of rotten meat** and instruct the player to feed the zombie (using a right-click/secondary action). The zombie happily consumes it, demonstrating how feeding prevents decay (this foreshadows the decay mechanic without delving into numbers yet).
10. **Expanding the Farm:** Next, the game encourages the player to create a second plot to solidify the free placement concept. Perhaps some **resources are awarded** for completing the first harvest (e.g. a few units of *Rotten Wood* and *Bones*). The tutorial message: *“Use the wood and bones you found to craft another grave plot!”*. The player opens the build menu, crafts a **Zombie Plot** item (costing say 5 wood, 5 bones), and places it on any free ground of their choice. This reinforces that building placement is up to them – they could put it adjacent to the first plot or elsewhere.
11. **Growing More & Time Progression:** The player is given a second seed (maybe a different type like a **Runner Seed** to showcase variety, or another Shambler). They plant and water it. This time, the growth runs at normal speed (several minutes). A day/night cycle might be introduced here: the sky starts to dim, showing it’s getting late. The tutorial suggests the player can continue once the zombie grows or explore meanwhile.
12. **Using the Necromancer’s Hut (Saving):** As night falls, the tutorial arrow points to the **Necromancer’s Hut** (the player’s house, already placed at game start). It explains this is where you can **sleep to end the day and save**. The player enters the hut and is prompted to sleep. Sleeping advances time to the next morning (and by then, the second zombie will have finished growing overnight).
13. **Morning & Ongoing Play:** On the next day, the player harvests the new zombie (reinforcing the cycle). Now with two zombies wandering, the game suggests: *“Great! Your farm is coming alive. Happy zombies will help you and fight for you.”* The basic farming loop is now established.
14. **Introducing Combat (later in tutorial):** Once the player has a small group of zombies (say 3-5), the tutorial introduces combat. The player receives a quest or prompt about human enemies nearby (e.g. *“Scouts from a nearby village have been spotted. Prepare to defend your farm!”*). This could trigger a **practice battle** or guide the player to the **World Map** to attack a weak human **village**. The tutorial walks through selecting a couple of zombies and starting an auto-battle, demonstrating the combat system in a simplified scenario.
15. **Guidance and Goals:** The tutorial concludes by presenting short-term goals: *“Grow more zombies, build your farm, and conquer the human castles!”*. The player now has the freedom to play, with optional quests and the game’s UI guiding them toward the next objectives (like building a **Blood Well** at level 2, or unlocking the **Bone Mill** for fertilizer at level 3).

Throughout the onboarding, **tooltips and highlights** are used heavily to teach interface elements (e.g. pointing out the inventory, showing how to open the build menu, etc.). The player is never given too much text at once; each step is a quick action followed by immediate feedback (a harvested zombie, a built plot, etc.). By the end of the tutorial, they have learned how to **place objects freely**, **grow and harvest zombies**, **care for their undead**, and have had a taste of combat – setting the stage for the full game loop.

---

## **Player Character & Farm**

### **Necromancer Character**

### **Character Control**

The player’s avatar is a **Necromancer**, which the player directly controls on the farm and in certain exploration areas. Movement and interaction mirror classic farming RPGs:

- **Movement:** Use WASD or arrow keys on PC (or a virtual joystick on mobile) to move in four directions or click on the ground. The character’s base walking speed can be upgraded (e.g. via abilities or items). There may also be a sprint button unlocked early for faster travel.
- **Facing & Interaction:** The character faces the cursor (on PC) or movement direction. Press **E** (or tap) to interact with whatever is in front of you: talk to NPCs, open a building UI, pick up items, etc.
- **Tools:** The Necromancer uses thematic tools instead of the usual farming hoe and axe:
    - **Shovel** – Used to dig and plant zombie seeds (functions like a hoe to till soil if needed, and to bury seeds in plots).
    - **Scythe** – Used to harvest grown zombies (reaping the undead). It can also clear away dead vegetation or minor obstacles (e.g. cobwebs, grave weeds).
    - **Necromancer’s Staff** – Used to issue commands to zombies (selecting them for battles or directing them on the farm). Also might channel certain spells or abilities as the player levels up.
- **Inventory & Hotbar:** The player has a hotbar with ~10 slots for quick access (seeds, tools, consumables). A full inventory/backpack UI allows storing collected resources, crafted items, etc. The backpack size can be expanded through upgrades or crafted bags.
- **Player Actions:** Besides farming, the Necromancer can perform actions like **clearing obstacles** (e.g. digging up a skull pile for bones, chopping a dead tree for Rotten Wood using either the shovel or a context action), **building construction** (placing structures via the build mode), and **combat support** (though combat is mostly auto, the Necromancer might cast minor spells or buffs from the sidelines if we allow it as an upgrade).

### **Character Abilities & Progression**

As the player (Necromancer) gains experience, they unlock special abilities that make them a more effective undead master. These abilities are tied to the player’s level:

| **Ability** | **Unlock Level** | **Effect** |
| --- | --- | --- |
| **Dark Vision** | Level 1 | See clearly at night (farm is less dark, making night work easier). |
| **Summon Familiar** | Level 5 | A pet raven or bat follows you, providing light or minor bonuses. |
| **Necromantic Aura** | Level 10 | Zombies near you move faster and gain a slight combat buff, making you a mobile support unit. |
| **Harvest Soul** | Level 15 | When harvesting a zombie, there’s a small chance to gain an extra “soul” (essentially double harvest reward). |
| **Death’s Door** | Level 20 | Instantly teleport back to your Necromancer’s Hut (useful if you’re far afield or in danger). |
| **Mass Command** | Level 25 | Command all active zombies on your farm at once (useful to rally your horde quickly or send everyone to the Crypt). |

These abilities encourage the player to continue leveling up their character, as each new power makes farm management or combat easier. The **Summon Familiar** and **Necromantic Aura** in particular also add flavor, making the player feel more like an undead commander as they progress.

### **Farm Layout**

### **Starting Farm Area**

- **Initial Size:** The farm starts as a relatively small area (e.g. a 20x20 tile grid). It is visually themed as a graveyard with a few dilapidated tombstones, dead trees, and scattered bones on the ground (which serve as initial resources when cleared).
- **Pre-built Structures:** The Necromancer’s Hut (player’s home) is already present at the start (a small 3x3 shack or crypt where the player can sleep/save). Additionally, a basic **Zombie Crypt** (2x2, used for storing excess zombies) is provided or unlocked very early so new zombies have a place to go if the farm population limit is exceeded. These are placed near the starting area to form a little base for the player.
- **Environment and Biome:** The initial biome is a **Forgotten Graveyard** – expect dull green-brown ground, patches of fog, and creepy background elements. As the farm expands (see [Farm Expansion](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)), new biome tiles appear (e.g. a swampy section, a haunted forest corner, etc.), each with unique visuals and minor gameplay effects (like swamp might have slower movement, etc.).

### **Free Placement Building System**

One of the key features is the ability for players to **freely place** and arrange structures on their farm:

- The farm area is divided into a grid (for simplicity and collision), but the player can choose any open tiles to place a building or plot. There are **no predetermined “slots”** – the layout is entirely player-designed.
- **Build Mode UI:** Players can enter a build mode (via a menu button or hotkey). In this mode, the grid is highlighted and a catalog of buildable items appears (structures, farm plots, decor, etc.). Selecting an item shows a ghost preview that follows the cursor.
- **Placement Rules:** Buildings have a size (e.g. Necromancer’s Hut 3x3, plots 1x1, larger buildings up to 5x5, etc.) and cannot overlap other objects or blocked tiles. If the chosen spot is valid, the preview is green; if not (e.g. overlaps a rock or another building), it’s red. Players can rotate structures if orientation matters (e.g. some buildings might have a front side).
- **Construction Costs & Time:** Each building or plot requires resources (and sometimes a player level) to construct. For example, a basic **Grave Plot** might cost 5 Rotten Wood + 5 Bones. If the player has the resources, they can place it. Most small placements happen instantly, but larger buildings could have a build time where construction progress is shown (or a builder zombie NPC could build it). Initially, to keep things simple, placement might be instant with resources deducted.
- **Rearranging & Removal:** To encourage trying different layouts, players can move or remove structures. In build mode, a player can select a placed object to **relocate or rotate** it (if it’s empty or conditions allow) or to dismantle it (refunding some resources). This lets players optimize their farm layout over time without heavy penalty.
- **Design Considerations:** The free placement means players can optimize for efficiency (e.g. grouping all zombie plots together for easy watering) or aesthetics (designing a cool graveyard pattern). The game supports both by not imposing strict layout requirements. Some recommendations are given through tips or quests (for example, an NPC might suggest “placing your Well near your fields to save time” as a hint).
- **Space Management:** Early on, space is limited, so the player might need to clear obstacles (chop dead trees, dig rubble) to make room for new plots or buildings. As they expand the farm, more space opens but may come with new obstacles to clear as well. This creates a natural progression in designing the layout – from a cramped starter area to a sprawling undead farm complex.

### **Farm Areas & Zones**

Within the farm, the player can carve out functional zones. Some areas are implicitly defined by building placement:

- **Zombie Fields:** This is where you place your **farm plots** for growing zombies. In the beginning, it might be just a small patch near your hut. As you get more plots, you may dedicate a larger section of your land as “fields.” Because of free placement, it’s up to the player, but many will cluster plots for easier management.
- **Wandering Grounds:** An open area (like a courtyard or yard) where harvested zombies roam. You might intentionally leave this area free of obstacles so zombies can move around easily. Placing **paths** or road tiles can help define these wandering routes (zombies will tend to follow paths if available, making their movement more predictable).
- **Training Yard:** Unlocks at player level 5 – a special structure or area where zombies can spar and gain XP. The player might place a **Training Dummy** or a fenced yard. Zombies assigned here will spend time training instead of wandering. The player will likely position this near the center or a convenient spot so they can easily send zombies to train.
- **Mutation Laboratory:** Unlocked at level 15 – a building where you can mutate or upgrade zombies. This lab (3x3 structure) could be placed anywhere, but players might put it near their house or the fields for convenience. It’s the hub for advanced zombie modification, so it becomes a focal point when unlocked.
- **Bone Orchard (Decorative Garden):** At level 15+ the player can also build decorative areas that provide buffs (e.g. a creepy garden of bone sculptures that boosts nearby zombies’ happiness or your necromantic power). These don’t have strict placement rules; players might create a special section of their farm as a “garden” for these items.
- **Command Center:** At level 20, the player can construct a **Command Center** (4x4 building) – essentially a war room for planning sieges on the bigger human castles. This is a late-game building. Players will likely place it in a secure, central location on the farm (since it’s important). Its presence could also passively buff nearby defense structures or coordinate zombies when defending against raids.

Because of the free placement system, each player’s farm layout will be unique. Some might create a compact design where all functional buildings are near each other (for efficiency), while others might spread things out for role-playing or defensive reasons. The game supports both playstyles. As long as players manage space wisely and expand when able, they can customize the farm to their liking while ensuring it runs effectively.

---

## **Zombie Growth System**

Growing zombies is at the heart of the game’s farming loop. It mixes familiar crop-growing mechanics (timing, watering, fertilizing) with undead-specific twists (mutations, varying zombie types).

### **Planting & Growing Zombies**

### **Farm Plots**

To grow a zombie, the player needs an available **grave plot** on their farm:

- **Plot Creation:** Plots are essentially prepared grave mounds. The player starts with a few plots (e.g. 3 plots in a small starter area), and can craft/place more as needed. Crafting a plot requires basic materials like wood and bone, making it a simple early-game construction.
- **Plot Usage:** Each plot can hold one zombie seed at a time. Once a seed is planted, the plot is occupied until the zombie is fully grown and harvested (you can’t plant another until it’s free).
- **Upgrading Plots:** Down the line, players might unlock **enhanced plots** (for example, a **Mutation Plot** in the Mutation Garden unlocked at level 10, which has special properties to increase mutation chances, or a **Greenhouse plot** that allows winter growing, etc.). These could be separate structures or upgrades to existing plots.
- **Environmental Effects:** The farm’s biome areas can affect plot growth. For instance, a plot in the **Swamp section** of the farm might inherently provide more water (slower drying, so less manual watering needed), whereas a plot in a **Bone Desert** biome might grow tougher (higher defense stat zombie, but slower growth due to harsh conditions).

### **Zombie Seeds**

Zombie “seeds” are items that determine what type of zombie will grow from a plot. Different seeds have different growth requirements and times, similar to crop varieties:

- Seeds can be obtained via the in-game shop (bought with Dark Coins), found during exploration, or rewarded from quests/battles. Early on, only basic seeds are available; more powerful zombie seeds unlock as you progress.
- **Examples of Zombie Seeds:**

| **Seed Type** | **Growth Time** | **Grows Into** | **Water Needs** | **Preferred Season** |
| --- | --- | --- | --- | --- |
| **Shambler Seed** | ~2 minutes | Basic Shambler (slow, weak zombie) | Low | Any (common seed) |
| **Runner Seed** | ~5 minutes | Runner (fast zombie) | Medium | Spring / Summer |
| **Brute Seed** | ~10 minutes | Brute (tank zombie) | High | Any (year-round) |
| **Spitter Seed** | ~15 minutes | Spitter (ranged zombie) | Medium | Summer / Fall |
| **Ghoul Seed** | ~30 minutes | Ghoul (elite zombie) | High | Fall / Winter |
| **Lich Seed** | ~60 minutes | Lich (magical zombie) | Very High | Winter (prefers cold) |
| **Ancient Seed** | ~2 hours | Ancient One (legendary zombie) | Extreme (constant care) | Any (very rare) |
| **Mystery Seed** | ~30 minutes | Random type (could be any common/rare zombie) | Random each time | Any (fun unpredictable seed) |

Each seed’s growth time can be affected by the care you give (watering, fertilizer) and environmental factors. **Preferred season** means if you plant during those seasons, you might get a bonus (faster growth or better quality); off-season seeds still grow but perhaps slower or lower quality. This encourages planting different zombie types throughout the in-game year.

### **Growth Stages**

Zombies grow in stages, much like crops have sprouting, budding, etc., but with a morbid twist:

1. **Fresh Grave (Planting)** – Right after planting a seed, the plot appears as a mound of disturbed soil with maybe a small wooden gravemarker. (Day 0)
2. **Bone Sprout** – Bones and skeletal limbs begin to poke through the earth. This stage indicates the zombie is forming. (Day 1)
3. **Rising Corpse** – A zombie’s hand (or head) breaks the surface, moving slightly. This mid-growth stage confirms progress. (Day 2)
4. **Half-Risen** – The upper half of the zombie is visible out of the ground, eyes possibly glimmering. It’s almost ready, but not fully animated yet. (Day 3)
5. **Fully Grown (Ready)** – The zombie is fully formed and just waiting for the final command to pull itself out. Often indicated by the zombie moaning or the grave plot emitting an eerie glow. At this point the plot can be harvested at the player’s leisure. (Day 4+ or later depending on type)

*(Note: The day counts above assume a slower-growing zombie; a Shambler that takes 2 minutes might compress these stages into seconds or have fewer visible stages. The concept is to give visual feedback of growth.)*

During each stage, the player can interact (water or fertilize) and see visual hints of how well it’s doing (e.g. a parched plot looks cracked and dry, while a well-watered one is muddy; a fertilized plot might have greenish ghostly aura indicating boosted growth).

### **Care & Cultivation**

To get the best results, players should tend their zombie crops:

- **Watering:** Instead of a normal watering can with water, here you use things like **Blood** or **Slime** for watering (thematically). For simplicity, we can treat it like watering in any farm game – each plot needs watering once per day cycle to grow at normal speed. If not watered, growth may pause or slow significantly. Water sources could be **Blood Wells** on the farm or collected “blood water” from rain. Over-watering isn’t typically an issue, but perhaps watering more than once has no extra benefit (or only one dose counts).
- **Fertilizing:** Special fertilizers enhance growth or quality. Examples:
    - **Bone Meal:** Ground bones that boost growth speed slightly (common fertilizer).
    - **Corpse Dust:** Increases the chance of a higher-quality zombie upon harvest.
    - **Dark Essence:** Rare magical fertilizer that significantly boosts growth speed **and** mutation chance, at the cost of being hard to get.
    - **Soul Fragments:** Collected from defeated enemies, when sprinkled on a plot, these can imbue a growing zombie with more power (increasing its base stats or giving a chance at a unique trait).
        
        Fertilizers might be applied at planting or during specific stages. Typically one fertilizer per plot per growth cycle for balance.
        
- **Weeding/Pest Control:** Instead of weeds, the threat to your zombie crops might be **grave robbers** or **soul-stealing crows**. Occasionally, an event can occur where a crow tries to steal the seed (as if it were carrion) or a curious villager tries to tamper with the plot. The player might need to chase them off or have preventive measures like **Zombie Scarecrows** placed. These events add a bit of urgency and variability to farming.
- **Weather Influence:** Weather can dramatically affect growth:
    - **Blood Rain** (a rare weather event) drenches plots in rich nutrients, effectively watering all plots automatically and even accelerating growth (growth speed +100% during the rain).
    - **Foggy Days** might keep zombies more comfortable (slight quality boost due to less sunlight).
    - **Bone Storms** (a storm that showers bone shards) could act like a free bone meal fertilizer to all plots, but might also slightly damage exposed zombies or the player if caught outside.
    - On the flip side, **Bright Sunlight** (if it occurs in summer noon) might be harmful to undead, slowing growth slightly on those days (or requiring more water).
    - (See [Weather System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21) for more details on various weather effects.)
- **Growth Timing:** The day-night cycle (e.g. 20 minutes day, 10 minutes night in real time, as mentioned under Farm Layout) ties into growth. Perhaps crops only grow during the night (undead rise better in darkness), or they grow continuously but faster at night. This could encourage nighttime farming activities where the farm literally comes alive. For now, assume continuous growth, but with a night boost: e.g. zombies grow 25% faster during night hours.

All these factors make farming engaging. A player who diligently waters and fertilizes will see faster and higher-quality results, while a neglectful farmer will get puny, low-quality zombies (or it will just take much longer). The goal is to make the farming system familiar enough to be intuitive, but with enough twists (mutations, weather, unique pests) to feel fresh and on-theme.

### **Harvesting Zombies**

### **Harvest Time**

Harvesting is the payoff moment for your farming efforts, and we make it exciting:

1. **Initiating Harvest:** When a zombie is fully grown (Ready stage), the player can harvest by using the **Scythe** or interacting with the plot. The game may prompt “Press [E] to harvest your zombie!” when you’re close to a ready plot.
2. **Harvest Animation:** Upon harvest, a mini cutscene or animation plays:
    - The player plunges the Scythe into the grave (or performs a spell).
    - The zombie bursts forth from the ground in a cloud of dirt and necrotic energy.
    - The zombie stands upright, letting out a groan or roar. At this moment, the zombie is added to the player’s roster of active zombies and will start roaming.
    - If it’s the first time harvesting that zombie type, a **“New Zombie Discovered!”** banner might appear, adding an entry to the collection log.
3. **Quality Outcome:** After harvest, the game shows the zombie’s **quality** (akin to crop quality in Stardew Valley, but here it affects the zombie’s stats). The quality is determined by how well you cared for it:
    - **Bronze (Common)** – if you did the bare minimum (or the seed is common) – the zombie has baseline stats and perhaps looks a bit shabby (missing an arm, slower shuffle).
    - **Silver (Uncommon)** – good care (watered regularly, maybe one fertilizer) – stats maybe ~+20% above base and the zombie model looks more robust.
    - **Gold (Rare)** – excellent care (watered daily, fertilized, ideal weather or season) – stats ~+50%, zombie is notably stronger and maybe has a special trait (e.g. slight damage resistance).
    - **Iridium (Legendary)** – perfect care plus some luck (all needs met, rare fertilizers used, maybe a lucky event like blood rain) – stats +100% (double strength) and possibly a unique ability or mutation. These zombies might have visual effects (glowing eyes, aura) to show they’re special.
        
        The quality system gives players a reason to maximize care. Even common zombie types can become formidable if grown to Gold quality or higher.
        
4. **XP and Rewards:** Harvesting might grant the player some XP (for their necromancer level) and occasionally byproducts. For example, harvesting a zombie could yield **Dark Coins** (the in-game currency) or a resource like **Soul Fragment**, representing the residual soul energy harvested along with the corpse. Higher-quality harvests yield more/better byproducts. This makes farming a source of not just army units but also resources.
5. **Zombie Joins the Farm:** Once harvested, the zombie is now a living entity on your farm (see next section). Immediately, the player can interact with it – the tutorial had them pet it, but generally you’ll see it wandering. If you have **exceeded your active zombie limit**, the zombie will automatically go to the **Crypt (storage)** and remain there until you have room (the game would warn “Farm at zombie capacity! Zombie sent to crypt storage.” if that happens).
6. **Emotional Feedback:** Harvesting zombies is positioned as a positive, satisfying action (the equivalent of picking ripe crops). We can even have the necromancer character do a little cheer or evil laugh. If multiple zombies become ready at the same time, the player might harvest them in succession for efficiency, which could chain animations.

Harvesting is generally always successful once the zombie is fully grown. Unlike traditional crops, there’s typically no scenario where a grown zombie “withers” from staying too long. If anything, leaving a zombie in the ground could be beneficial (maybe it slowly continues to gain strength until harvested), but to encourage actually harvesting, we don’t want players to just leave them indefinitely. We might implement that zombies stop improving after hitting ready, so there’s no reason to delay harvest aside from inventory management.

### **Random Harvest Outcomes**

While quality is one variable outcome, another layer of randomness comes in the form of **mutations or special traits** that can manifest upon harvest:

- There’s a base **5% chance** (modifiable by seeds, fertilizers, etc.) that any given zombie will undergo a **Natural Mutation** at the moment of harvest (detailed in [Mutations & Evolution](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)). This could mean the zombie develops an unusual ability or physical mutation (e.g. extra limbs, toxic attack, etc.).
- Rarely, a harvest could yield **twins** – two zombies from one seed! Perhaps a 1% chance event or triggered by a special fertilizer or ability. In this case, the plot produces two smaller (maybe lower-quality) zombies instead of one. This is a fun surprise that effectively multiplies your yield.
- Conversely, a **failed harvest** is possible if the crop was seriously neglected or cursed by an event – e.g. an event like a **Holy Light** shining on your farm could “purify” a growing zombie, causing it to crumble on harvest (a loss). These are rare and mostly avoidable occurrences to keep players on their toes.

Overall, harvesting is meant to be rewarding and the primary way to build your undead forces. The random elements (mutations, twins, etc.) create memorable moments and variation, ensuring not every harvest is identical.

### **Mutations & Evolution**

As an advanced feature of the growth system, zombies can mutate or be enhanced, adding depth to the farming gameplay. Mutations can occur naturally or be induced by the player.

### **Natural Mutations (Random Growth Outcomes)**

Even without player intervention, there’s a chance a zombie seed produces something unexpected:

- **Mutation Chance:** By default, any zombie has a small chance (e.g. 5%) to mutate when it finishes growing. This represents the unpredictability of dark magic and necrotic energy during growth.
- **Triggers for Higher Chance:** Various factors can increase this chance:
    - Planting in special plots or areas (e.g. a Mutation Garden plot might raise mutation chance to 15%).
    - Applying certain catalysts as fertilizer. For example, **Radiation Slime** or **Unstable Serum** could specifically boost mutation probability for that plot.
    - Environmental events: a **Radiation Fog** weather event might globally double all mutation chances during that time.
- **Mutation Outcomes:** Mutations can be **physical** or **ability-based**:
    - *Physical mutations* alter the zombie’s body and stats. For instance, **Armored Skin** mutation might cause a zombie to grow thick bone plates (+50% defense)【source】, or **Extra Arms** mutation gives a zombie an additional set of arms to attack with (double attack hits).
    - *Ability mutations* grant a new skill or effect. For example, a mutation might let a normally melee-only zombie spit acid (gaining a ranged attack), or bestow a self-healing regeneration ability.
- **Rarity:** Not all mutations are equally likely. We categorize them by rarity:
    - *Common Mutations:* Moderate stat boosts or simple abilities. (e.g. Razor Claws = +30% attack damage, Acid Spit = a weak ranged attack added) – these might occur say 70% of the time a mutation triggers.
    - *Rare Mutations:* More significant changes. (e.g. Regeneration = heals 5% HP per second, Berserker = increases damage as health lowers) – maybe 25% of mutation outcomes.
    - *Epic/Legendary Mutations:* Very powerful, game-changing traits. (e.g. **Explosive** – zombie explodes on death dealing massive AOE damage; **Necromancer** – the zombie itself can resurrect one allied fallen zombie per battle) – only a 5% of mutations, or perhaps require special conditions to ever occur.
- **Visual Changes:** Mutated zombies often have distinct appearances (different color, extra body parts, glow effects) so players immediately recognize them on the farm and in battle.

Natural mutations ensure that even routine farming can yield exciting surprises, and players will talk about that time they got a rare **two-headed zombie** from an ordinary seed.

### **Forced Mutations (Using the Mutation Lab)**

Around mid-game, players gain access to a **Mutation Lab** building (unlocked at Level 15). This facility allows more control over the mutation process:

- **How it Works:** The player can take a grown zombie (harvested and active on the farm) and place it into the Mutation Lab’s chamber. In the Lab UI, the player chooses a **Catalyst** item to use and starts the mutation process.
- **Catalysts:** These are special resources gathered from exploration or battles which drive specific kinds of mutations. For example:
    - **Radioactive Waste:** Increases the chance of a random physical mutation. Costs some units of toxic waste resource.
    - **Corrupted DNA Sample:** Has a chance to bestow a random new ability (ability mutation).
    - **Evolution Serum:** A rarer item that allows the player to **target** a specific mutation (you choose the desired outcome from a list of known mutations). However, these serums are expensive to craft (requiring DNA + zombie parts, etc.).
    - **Primal Essence:** An end-game catalyst that guarantees a high-tier mutation (epic or legendary) if the mutation succeeds.
- **Process & Time:** When initiated, the mutation process may take a certain amount of in-game time (e.g. 2 hours for a basic attempt, up to 24 hours for high-end processes). This functions like a “crafting timer” – you can leave and do other things while your zombie is mutating.
- **Success Rates:** Not all forced mutations are guaranteed. There might be a success probability depending on the catalyst quality. Failure could mean the zombie remains unchanged (or in harsh cases, the zombie could even die or degenerate, though that might be too punishing unless clearly communicated).
- **Results:** On success, the zombie emerges with the new mutation trait. You might also allow multiple mutations on one zombie, though that could get overpowered – perhaps limit each zombie to one physical and one ability mutation max. If multiple are allowed, successive mutations might have lower success odds or higher costs.

The Mutation Lab gives players a sense of agency to pursue specific powerful builds (e.g. “I want a super tanky zombie with Armored Skin and Regeneration, so I’ll target those mutations.”). It serves as a resource sink and a goal for advanced players who want the ultimate undead army.

### **Zombie Fusion**

Another late-game mechanic is **Zombie Fusion**, unlocked via research or a special quest. Fusion lets you combine two zombies into one stronger zombie, potentially of a higher tier:

- **Prerequisites:** Typically, only high-level zombies can be fused (for example, both zombies must be max level in terms of their individual XP progression, and possibly of a similar type or tier).
- **Fusion Process:** This occurs in a special fusion chamber (could be part of the Mutation Lab or a separate structure like a “Altar of Fusion” unlocked in endgame). You select two compatible zombies from your roster. They are sacrificed (consumed) in order to create a new zombie.
- **Resulting Zombie:** The new fused zombie inherits traits from both “parents”:
    - Its base stats might be roughly the sum or an average of the two, plus a bonus (e.g. the new zombie has 70% of combined stats of both, so it’s stronger than either was alone).
    - It may **inherit one mutation** from each parent (whichever is “stronger” or maybe at random if both had many).
    - There’s also a chance for a brand new mutation to occur during fusion due to the unstable magic involved.
    - The type/tier of the zombie might elevate: e.g. fusing two common zombies could yield an uncommon of a different type. Fusing rare ones might yield an epic tier zombie, etc. For instance, fusing a Runner and a Brute might create a unique hybrid with the speed of one and strength of the other.
- **Costs & Limits:** Fusion likely costs some rare resources or currency as well (like Soul Essence) to prevent spamming it. Also, fused zombies might not be fusible again immediately or maybe at all (to avoid infinite power looping).
- **Strategic Use:** Fusion is essentially a way to get **Legendary zombies** or very high-tier units that are otherwise very hard to obtain by random seeds alone. Players will use it to push the limits of their army’s strength. It also creates a sink for surplus zombies – if your farm has dozens of lower-tier zombies, you can fuse some into a more manageable number of super-zombies.

Between natural mutations, lab mutations, and fusion, the game offers a rich “breeding” or cultivation meta-game. Players who enjoy optimizing and creating the ultimate creatures will have a lot to experiment with, while casual players can partake in these systems at a lighter level (enjoying occasional lucky mutations without necessarily min-maxing everything).

---

## **Living Zombies on the Farm**

Once zombies are harvested, they don’t just vanish into an inventory – they become active inhabitants of the farm. Managing these undead workers is a unique aspect of gameplay, blending pet simulation and resource management.

### **Zombie Behavior**

### **Wandering & Autonomy**

Harvested zombies have basic AI that causes them to **wander around the farm** within defined areas:

- **Movement:** Zombies walk slowly by default (with variations: Runners move faster, Brutes lumber heavily, etc.). They will randomly choose directions but avoid obviously blocked paths. The player will see them stumbling along paths, between buildings, occasionally stopping.
- **Pathfinding:** The AI uses the layout the player has built. If you’ve created clear **paths or roads**, zombies tend to follow them (preferring a clear route). If the farm is cluttered, zombies might bump into obstacles and turn around. They cannot walk through fences, walls, or closed gates (unless they’re specialized like ghosts).
- **Day/Night Cycle Behavior:** Zombies are **nocturnal by nature**. During the **daytime**, zombies become a bit sluggish – their movement is slower and they might even find a quiet spot to loiter or “rest” (essentially idle animations where they sway in place or lie down). At **night**, they become more active: movement speed increases to normal, and they roam more widely. This feels thematic (undead awakened by night) and also balances that the player might do more combat at night.
- **Idle Animations:** To give them personality, zombies have a variety of idle behaviors:
    - A Shambler might occasionally trip and fall, then get back up.
    - Two zombies might bump into each other and both groan in confusion, then change direction.
    - Some might approach a decorative item (like a bone pile decoration) and investigate it (e.g. pick up a bone, chew on it).
    - If near the farm’s edge, a zombie might stand and stare off into the distance towards human lands, as if drawn by the smell of humans.
- **Grouping:** Zombies sometimes form small groups. You might see two or three shamblers unintentionally clustering and moving together for a while, essentially forming a mini-horde. Certain personality types or traits influence this (explained below). Conversely, some zombies avoid others and wander solo at the far corners if not reined in.

### **Zombie Activities on the Farm**

Idle zombies aren’t just scenery; they can perform simple tasks or behaviors that can benefit the player:

- **Patrolling:** If your farm has a defined perimeter (fences or natural boundaries), some zombies will walk along the edges. This patrolling behavior can deter certain pests or intruders. For example, wandering zombies might automatically chase off those soul-stealing crows or a stray villager NPC that comes snooping. This gives a minor defensive utility to having zombies just roaming.
- **Training:** If you have built a **Training Grounds** and assign a zombie to it (or if the zombie wanders into that area on its own), it will engage in training behavior. This could look like a zombie sparring with a training dummy or practicing swings. Over time (say, a small amount of XP per hour), the zombie slowly gains experience levels by itself. This passive training is slower than actual combat XP, but it’s a way to gradually improve your horde between battles.
- **Socializing:** Zombies might occasionally gather in small circles (perhaps around a fire pit decoration or at random) and exhibit what looks like “social” behavior—grunting at each other, maybe even playing tug-of-war with a piece of meat. This has no direct gameplay effect except one: a happiness boost. Social zombies tend to be happier, meaning if they congregate now and then, it prevents their mood from dropping due to loneliness.
- **Helping with Farm Tasks:** Though not intelligent, zombies can be directed to assist with simple chores:
    - If a zombie with a **“Helper” personality** (see below) wanders near a crop plot that’s dry, it might automatically dump a bucket of water on it (assuming you have a water source and bucket available). This represents zombies doing rudimentary farm work. You might enable this by crafting a special item like a **Blood Bucket Station** that zombies can use to fetch and pour water.
    - Similarly, a zombie might carry resources from one spot to another if you set up a task (like moving bones from a bone pile to your storage). This is more of a stretch goal feature (automating resource transport), but at minimum watering assistance and pest control are nice touches.
- **Resting:** Zombies don’t need sleep like humans, but they do have a concept of rest for recovery:
    - If severely injured (perhaps from a battle), a zombie that is back on the farm may go to a **Mausoleum or Crypt** (if you have one placed as a structure) to rest. While resting (standing idle inside or near the structure), the zombie regenerates health over time. You might see them lie in an open grave or coffin as an animation.
    - Even uninjured zombies might occasionally stand in designated “rest areas” (like a quiet corner of the graveyard or under a dead tree) during daytime, symbolically recharging. Resting could also tie into the decay system (a resting zombie decays slower).
- **Emoting:** Though undead, they can show simple emotions. A happy zombie might bounce a little in its step or have a less gurgly groan, whereas an unhappy one drags its limbs and sighs (in a guttural way). Visual icons could appear overhead too (smiley face, frowny face, etc., albeit stylized for undead, like a skull grin or skull frown).

These behaviors make the farm feel “alive” (or “undead alive”) and also give functional benefits to keeping zombies content and having good farm infrastructure (feeding stations, training dummies, etc., to facilitate these behaviors).

### **Managing Farm Zombies**

### **Zombie Needs & Care**

Even in undeath, some basic needs must be met to keep your zombies in top form:

- **Feeding:** Zombies require a small amount of **meat** daily. This isn’t about nutrition so much as curbing their hunger for human flesh (so they don’t wander off or turn on your farm animals, if any). The player can fulfill this by:
    - **Meat Buckets/Feeding Troughs:** Place these around the farm. Each holds a chunk of meat (which could be crafted from animal carcasses or bought). A zombie will automatically eat from the nearest feeding station once per day. Each station has a limited number of servings, so the player must refill them periodically with meat resources.
    - **Manual Feeding:** The player can also directly feed a zombie by using a meat item on them (this might give an instant happiness boost in addition to counting as their meal).
    - If zombies are not fed for a day, they begin to **decay faster** (see Decay System below) and their happiness drops.
- **Shelter:** While zombies don’t mind rain or sun too much, providing **shelter** keeps them from literally falling apart. The player can build structures like **Mausoleums** or simple **Canopies**. At night or during harsh weather, zombies will gravitate to these shelters (you might see a couple of zombies standing under a gazebo or inside a crypt). Shelter slows down any decay and could even slowly restore their health. It’s also a cosmetic way to show your farm has infrastructure for the horde.
- **Entertainment/Enrichment:** Bored zombies can be restless or depressed (unhappy). The player is encouraged to build some “toys” or points of interest:
    - **Bone Piles:** A pile of bones that zombies can pick at or play fetch with (some zombies might toss a femur and fetch it themselves!).
    - **Training Dummies:** As mentioned, doubles as combat training and a way to vent aggression.
    - **Graveyard Decorations:** e.g. a mysterious idol or a lantern that plays spooky music; zombies might gather around it curiously. These can be event rewards or crafted items that boost mood in an area.
- **Medical Care:** Even though they’re undead, they can lose limbs or sustain damage. The player can set up a **Stitching Station** or **Butcher’s Table** where you (or a special NPC like a Frankenstein-esque doctor) can repair zombies:
    - A UI might show a list of injured zombies; the player can spend resources (like needle & thread, spare parts) to heal them instantly, or they heal slowly over time if resting as mentioned.
    - Severe injuries like lost limbs might reduce a zombie’s effectiveness until repaired (e.g. a one-armed zombie does less damage). Repairing might restore them to full ability.
    - If a zombie has a **trauma** (like they died and were resurrected by a lich ally, causing them madness), maybe a special tonic is needed to cure that. This is more edge-case.

### **Zombie Happiness & Mood**

Zombie mood is a measure of how well you are caring for your minions. It affects their performance:

- **Mood States:** We can simplify to three states with icons/color coding:
    - 😊 **Happy (Green)** – The zombie’s needs are met (fed, not badly injured, has socialized or been petted recently). Happy zombies fight better (+20% to all combat stats as a motivation bonus) and move a bit faster on the farm. They also are more obedient (less likely to ignore commands).
    - 😐 **Neutral (Yellow)** – This is the default if needs are average. Zombies here perform normally, with no penalties or bonuses.
    - 😞 **Unhappy (Red)** – The zombie is starving or neglected (or perhaps witnessed many fellow zombies die in battle, causing morale loss). Unhappy zombies suffer a -20% stat penalty, move sluggishly, and sometimes might even **refuse commands** (for example, an unhappy zombie might not respond when you try to add it to a siege squad, effectively saying “meh” and staying put). You might see unique idle behavior like the zombie sitting down moaning sadly.
- **Improving Happiness:**
    - **Feeding and Petting** are the quickest ways to boost mood. The player can pet each zombie once in a while (cooldown on each for effect, say you can pet each zombie once per day for + mood). Feeding gives an instant happiness plus satisfies hunger.
    - **Clean Environment:** If the farm is littered with corpses or too messy (say you haven’t cleaned up after battles or there are holy artifacts causing them discomfort), zombies get unhappy. Keeping the farm tidy and suitably dark (place torches with green flame instead of bright fire, etc.) can keep them content.
    - **Social & Entertainment:** Let zombies socialize or use the entertainment items. A lone zombie by itself all the time will get unhappy, whereas ones that mingle stay neutral or happy. So having at least a few zombies out at a time is good (if you only have one zombie and keep the rest in storage, that one might become lonely/unhappy).
- **Effects of Happiness:** As mentioned, it directly affects combat performance. Additionally, happiness could tie into **productivity** if we implement any resource gathering by zombies. For example, a happy zombie might yield a small resource (like occasionally find a bone and give it to you) whereas an unhappy one definitely won’t. It’s similar to how in some games animals produce more when happy.

### **Farm Zombie Capacity**

To maintain performance and device limits, there is a cap to how many zombies can wander on your farm at once:

- **Starting Cap:** Initially, the player can support maybe **10 active zombies** on the farm. This is both for balance and to not overwhelm new players.
- **Increasing Cap:** The capacity grows as the player upgrades the farm:
    - Building more **housing** (like Crypt expansions, more mausoleums) increases the cap.
    - Certain research or player level milestones can also raise it.
    - Each farm expansion might inherently boost capacity a bit by providing more space.
- **Absolute Max:** Ultimately, perhaps around **100 active zombies** could roam at endgame with a fully upgraded farm and high-level player. This would truly feel like a horde. (We ensure performance can handle that by keeping AI simple and possibly despawning purely cosmetic far-off ones if needed.)
- **Crypt Storage:** What happens if the player has more zombies grown than the active cap? We use the **Crypt** building as storage (like a barn for animals in Stardew). The Crypt UI shows all zombies not currently active. Zombies in the crypt are essentially in stasis (they do not decay or contribute until released). The player can swap zombies in and out: if you want a particular zombie for a battle, you’d make sure to **“deploy”** it to the farm beforehand.
- **Auto-Storage:** Any time a new zombie is harvested that would exceed the cap, the game automatically sends it to storage (with a note like “Too many zombies! Zombie sent to Crypt.”). Likewise, if you come back from a battle with more zombies than cap (maybe you resurrected some?), the extras go to storage.

This system encourages players to expand wisely and also potentially specialize (you might not need all 100 out if you only use certain ones for fights, but having many out makes the farm lively and safe).

### **Zombie Interactions**

### **Player Commands & Interaction**

The player has several direct ways to interact with and manage individual zombies on the farm:

- **Petting (E key when near zombie):** As mentioned, this is a friendly interaction to raise happiness. The Necromancer gives the zombie a gentle pat or scratch (in a morbid comedic way, perhaps patting their head or arm falls off and you reattach it, etc.). This solidifies that you care for your minions.
- **Feeding (Use meat item on zombie):** This instantly satisfies that zombie’s hunger for the day and gives a happiness boost. It’s useful if a particular zombie is unhappy or if you’re about to send it to a tough battle (you want it in top mood).
- **Command (Q key or via Staff):** This enters a “command mode” where the player can **select a zombie**. When selected, options appear such as:
    - **Add to Army** – marks that zombie for the next battle deployment (it might follow you to the Command Center or just be tagged in UI).
    - **Follow Me** – the zombie will temporarily follow the player character around the farm (useful if you want to reposition one manually or bring it to another area).
    - **Assign Task** – if you click on a structure after selecting a zombie, you could assign it there. For example, select zombie then click on Training Dummy = send zombie to train. Or select then click on a feeding station = that becomes its “home” station so it knows where to eat.
- **Dismiss to Crypt (X key or a menu):** Sometimes you might want to reduce active numbers or retire an injured zombie from active duty. Using dismiss on a zombie instantly sends it back into storage (crypt). The zombie will disappear from the farm and become inactive. You can retrieve it later from the Crypt menu. This is useful for organizing who is out and also perhaps for protecting a beloved zombie from raids (store them so they can’t be killed by an attacker).
- **Name/Inspect:** Though not mentioned yet, a nice feature is the ability to **name your zombies** or at least inspect their stats. By interacting (maybe holding E or via a context menu), you open a panel showing that zombie’s details: name (auto-generated like “Zombie #12” which you can click to rename “Bob the Zombie”), its type, level, mutations, stats, kills, etc. This fosters attachment and management at a granular level.

These controls ensure the player is the master of their horde, able to direct as needed, but can also let them roam freely when micromanagement isn’t needed.

### **Zombie Personalities**

To further differentiate individual zombies, each one gets a semi-randomized “personality” at creation. This gives small behavioral quirks:

- **Aggressive:** This zombie is hyper-aware of enemies. On the farm, they might patrol the boundary more often and, if a battle starts near the farm or an intruder comes, they’ll be the first to engage. In combat deployment, maybe they have a slight initiative boost. They tend to roam faster and rarely rest.
- **Lazy:** This one loves to loaf. It often tries to find a resting spot and stays there. It moves slowly, even at night. Upside: lazy zombies might conserve energy such that their decay is slightly slower (not using themselves up). They might need extra prodding to participate (could tie into occasionally ignoring commands if unhappy).
- **Friendly:** A friendly zombie likes to follow the player or other NPCs. You’ll notice it trailing you more often even without being explicitly told. It might also engage in social idle behaviors more and gets a bigger happiness boost from being petted. Friendly zombies could also act as “leaders” that other zombies follow around on the farm.
- **Independent:** This zombie does its own thing. It wanders to far corners, maybe trying to explore beyond the usual area (testing the bounds of your farm). It might not join group activities. In battle, perhaps it’s more likely to break from formation and chase a target. The benefit is maybe it can operate at longer range from the Necromancer’s aura without penalty.
- **Loyal:** Loyal zombies tend to hang around the **Command Center or the Necromancer’s Hut**. It’s like they guard the important spots. They respond immediately to player commands and never refuse an order (even if unhappy, they’ll still obey). This is great for key defense roles – for example, assign a loyal zombie to guard a gate and it will actually stick there reliably.

Personality is mostly for flavor and slight behavior variation, so the player’s farm doesn’t feel like it has 50 identical AI clones. It also adds a light strategic consideration: e.g. maybe you’d prefer aggressive ones on patrol and lazy ones stored away when not needed, etc.

---

## **Castle Siege Combat System**

One of the most exciting parts of the game is sending your zombies to attack human settlements. The combat is presented as a **2D side-scrolling auto-battler**: think of a tug-of-war style battle where your units march from the left and enemies come from the right.

### **Human Targets & World Map**

The world beyond your farm is populated by various human strongholds, increasing in difficulty:

- **World Map:** The game features a map view where you can see different regions and the human settlements within them (villages, towns, castles, etc.). You start with only the nearest area visible (maybe a **Village** at the edge of your farm’s region). As you defeat locations or explore, more become known.
- **Settlement Tiers:** Progression of targets:
    - **Villages:** Small, lightly defended areas (peasants, maybe a few militia). These serve as the introductory battles/tutorial. Little to no fortifications.
    - **Towns:** Moderately defended (city guards, a few archers, perhaps wooden palisades or barricades to slow your assault).
    - **Fortresses:** Heavily defended outposts or forts with trained soldiers (swordsmen, crossbowmen) and stone walls/gates that your zombies must break through.
    - **Castles:** Major strongholds of human lords. These have elite knights, mages or alchemists using holy water, etc., and multiple defense layers (moats, drawbridges, high walls).
    - **Capital City:** The final zone (level) might be the king’s city – a multi-stage battle with the toughest resistance, essentially the “boss fight” of the PvE campaign.
- **Defenders Variety:** Each region might introduce unique enemies or twists:
    - In the Haunted Forest region, the humans might use **Foresters and Trappers** (who set traps for your zombies).
    - In the Frozen Tundra region, human **Ice Mages** might be present (with attacks that slow your units).
    - Some castle fights might feature **boss characters** (like a Paladin hero that requires many zombies to take down).
- **Reward and Unlock:** Conquering a settlement often yields resources and sometimes new **blueprints or seeds**. For example, sacking a **Cathedral** might give you Holy Water (as a resource to maybe use in mutations ironically) and unlock the ability to grow **Priest Zombies** (zombies that have consumed priests, just as a fun concept). The world map also often has **resource nodes** – e.g. capturing a Mine could generate metal for you daily, etc.

The world map and sequence of battles provide a structured campaign for the player to progress through, steadily requiring a larger and stronger horde.

### **Battle Preparation**

Before a battle, you must choose which zombies will fight and how to deploy them:

### **Forming Your Zombie Squad**

Typically, battles allow a certain number of zombies to be deployed (like an “army size” limit that grows as you progress or based on the Command Center upgrades):

1. The player goes to the **Command Center** on their farm (unlocked by mid-game, but early battles might be initiated via a simpler menu or NPC if the Command Center isn’t built yet). This opens the **Squad Selection** interface.
2. The interface shows **Available Zombies** (a list of your active farm zombies, possibly with their stats and types) and **Deployment Slots** (empty slots where you drag zombies into).
3. The player selects up to X zombies for this battle. For instance, early on you might only send 3, whereas later you could send 10 or more at once.
4. **Squad Composition Strategy:** The game may give hints about the upcoming battle (like “This village has many archers” – clue to bring shielded or fast zombies). The player should choose a mix: maybe a Brute to soak damage, a couple Shamblers for bulk, a Runner to quickly reach archers, etc. There could be preset “formations” or just manual selection.
5. **Deployment Order:** The order you place them might be the order they appear on the battlefield. You might set it so your tanky Brute is in front, followed by damage dealers, etc. Alternatively, some games let you deploy in waves – here we can simulate that by letting players arrange an ordered list or even multiple waves (like first wave 5 zombies, second wave 5 after some time).
6. Confirming the squad locks those zombies in; at this point, those zombies might leave the farm and move to a staging area (in fiction, they are now en route to battle).

### **Deployment & Waves**

When the actual battle begins (on the battle screen), zombies enter from the left side:

- We can have a short **Deployment Phase** at the start of battle (a few seconds slow-mo or a setup screen) where you see the battlefield layout and can choose which lane or formation to start your zombies in. Some side-scrolling auto-battlers have multiple lanes (like Plant vs Zombies), but we might keep it simpler with one main lane and vertical positioning. If we allow lanes: maybe up to 3 lanes height-wise, and you can assign which lane each zombie starts in (to potentially avoid obstacles or match enemy positions).
- **Waves:** If the battle is complex, we could allow multiple waves of your units. For example:
    - First wave: 3 zombies (maybe the tougher ones) go in first.
    - 10 seconds later, second wave: 2 more zombies enter (perhaps your fast movers who hang back initially).
    - This could be preset or player-controlled (like a timeline where you schedule entries). For simplicity early on, probably all chosen zombies just go together, but later battles might need staggering to counter defenses or to keep reserves.
- For major sieges, the player might hold some units in reserve if needed, sending them in when the time is right by pressing a button.

**Summary of Deployment Strategy:** The player should consider:

- Putting **tanky zombies upfront** to soak initial enemy hits.
- Keeping **ranged or support zombies** slightly behind so they can fire over others.
- Using **fast zombies** to flank or quickly reach enemy backliners (if there are multiple lanes or if enemies retreat).
- Possibly saving a few units as **reserve** in case the first push fails (if the game allows mid-battle reinforcement).

In essence, the battle is won or lost often by who you send and in what order, since once it starts you have limited direct control.

### **Real-Time Combat Mechanics**

Once battle begins, it plays out in real time without active input (aside from possibly triggering a rare ultimate ability or deciding on reinforcements if allowed). The camera shows a 2D side view of the battlefield:

```xml
[ Your Base / Spawn ] ------------------------------------------- [Enemy Base]
Zombies emerge from left, moving right ->       <- Enemies spawn on the right
```

### **Combat Flow**

1. **Advance:** Your zombies continuously walk toward the right (enemy side). Enemies continuously move toward the left (your side) when they spawn. When opposing units meet, they fight.
2. **Auto-Attacks:** Each unit (zombie or human) automatically attacks when an enemy is in range. Melee units need to be adjacent; ranged units will shoot projectiles at the nearest target. The game engine handles targeting (generally focusing the closest enemy).
3. **Abilities:** Some units have special behaviors:
    - **Brutes** might have a charge attack that triggers every few seconds, knocking enemies back.
    - **Spitters** continuously fire acid glob projectiles from behind other zombies.
    - **Liches** periodically cast spells (like a burst of dark energy hitting a group of enemies).
    - **Ghouls** might leap over frontline enemies after a short delay, attacking archers behind.
        
        Each ability has its own cooldown/trigger conditions but is automated. The player doesn’t press buttons for them, it’s all AI-driven according to preset patterns.
        
4. **Physics & Lanes:** We can implement the concept of lanes or vertical positioning:
    - If lanes are used (say 3 horizontal lanes on the battlefield), units generally stick to their lane unless knocked into another. Melee can only fight if in the same lane. Ranged can shoot to adjacent lanes with some penalty possibly.
    - **Collision:** Units block each other. A large zombie like a Brute can physically block a narrow lane, meaning enemies can’t pass until it’s dead (or they have a special skill to bypass).
    - **Knockback:** Heavy hits (like Brute charge or an enemy knight’s shield bash) can shove units backward. This might change lane position slightly or just push them along the lane. Zombies with high weight (Brutes, golems) are resistant to being knocked back.
5. **Battlefield Elements:** Some levels have destructible obstacles:
    - **Barricades/Walls:** e.g. a wooden barricade that your zombies must destroy to progress. They have their own HP and occupy space. Ranged units might shoot over them, but melee must break them down.
    - **Turrets/Towers:** An archer tower might be placed on the enemy side that shoots arrows periodically until a zombie reaches and destroys it.
    - **Traps:** Spikes on the ground that trigger and damage zombies, or pits that might kill one outright if they fall (maybe avoidable by lanes or deactivation via a lever your zombie can trip if we wanted puzzles).
6. **Victory Condition:** Usually, you win the battle if your zombies manage to push all the way to the right side, meaning all defenders are dead and the enemy’s base (like a keep or final building) is destroyed. This often entails breaking a final gate or door.
7. **Defeat Condition:** If all your deployed zombies are destroyed before achieving victory, you lose the battle. In some cases, battles could have a timer (e.g. you have 3 minutes before reinforcements force you to retreat), though a timer is optional. If time runs out, it’s also a loss (or at least not a win).

Battles are intended to be fairly quick (maybe 1-3 minutes for a normal encounter, up to 5 for a big siege) to keep the pace of the game.

### **Zombie Combat AI**

We design each zombie type with a specific AI profile to make them distinct:

- **Shambler (basic zombie):** AI is straightforward – walk forward until an enemy is in melee range, then attack. No special maneuvers. If that enemy dies, continue forward.
- **Runner:** Prefers to **skip ahead** of your slower units. AI could make it try to pass others, and it might even dodge attacks (chance to avoid a melee hit). It targets squishier enemies first if possible (e.g. will run past a frontline soldier to attack an archer behind, effectively flanking).
- **Brute:** Slow moving, but when it gets close to an enemy cluster, AI triggers its **charge** – it will rush forward a short distance, plowing through minion enemies (small ones get knocked aside or instantly killed) and stopping when hitting something heavy (like a wall or a particularly large enemy). The Brute focuses on **clearing obstacles**: if it sees a barricade or gate, it beelines for that and starts smashing it.
- **Spitter:** This zombie hangs back. Its AI keeps a minimum distance from the nearest enemy (so it doesn’t get into melee if possible). It spits acid loogies in an arc. It will prioritize high-value targets (maybe ones with less armor since acid could do DOT). If an enemy comes too close, the Spitter might retreat a bit (kiting behavior) while allies are in front.
- **Lich:** A lich stays near the middle of your formation, not too front, not all the way back. It periodically casts spells:
    - Offensive spell (e.g. a small AoE blast damaging a group of enemies).
    - Support spell (e.g. a shield or buff to nearby zombies, or maybe a minor heal to undead).
        
        The AI decides which based on context (lots of enemies clumped -> offensive, otherwise buff).
        
        Liches might also target enemy priests or mages first with spells (because they hate holy magic users).
        
- **Ghoul:** Ghouls are feral and agile. Their AI will cause them to **jump** when they encounter an enemy – effectively leaping over the frontline to attack from behind (so they often end up behind enemy lines sowing chaos among archers or engineers). This is high-risk, high-reward as the ghoul can get surrounded. If it survives, it might then attack enemies from rear or open a gate from inside.
- (If there are more types like a **Zombie Giant** or **Necromancer zombie**, those would have their own pattern too.)

This variety requires the player to think about synergies (e.g. a Brute breaks the gate while Ghouls hop over walls, etc.) and counters (some human units will be strong against certain behaviors).

### **Permanent Loss & Rewards**

Combat in Zombie Farm has stakes – your zombies can die for good in battle, adding a layer of risk management to the game.

### **Zombie Death and Permanent Loss**

- **Permadeath:** When a zombie’s HP is brought to zero in combat, that zombie is destroyed (undead “killed”). Unlike many games where you could heal up later, here the zombie is gone permanently from your roster. The battle will show an animation of it collapsing into a pile of bones or being vaporized if hit by holy magic, etc.
- **Aftermath:** You do not get the zombie back after the battle. This means all the effort to grow and level that zombie is lost. This dramatically raises the tension of battles, especially for high-level or rare zombies. (Players who grow attached to a particular zombie must weigh sending it to a risky fight or keeping it safe.)
- **Emotional/Morale Impact:** To reinforce this, you might have farm reactions to deaths:
    - After a battle where some zombies died, back on the farm other zombies might gather at a **grave marker** for their fallen comrade (if you have something like that) and “mourn” briefly. It’s a small touch: maybe they stand sadly around a new tombstone (the game could let you place a tombstone decoration and dedicate it to a fallen named zombie).
    - Zombies could have a temporary happiness debuff if many allies died. For example, if you lost half your army, the survivors return with an “Aura of Dread” where they and others are shaken (-happiness for a day or until you pet/comfort them or a victory in battle raises morale).
- **Mitigation:** There could be late-game ways to mitigate permadeath slightly:
    - **Resurrection Spells:** Perhaps a very high-level Lich or an expensive scroll could resurrect a fallen zombie after a battle (maybe within a short time window, or only 1 per battle). This would be rare.
    - **Soulbound Artifacts:** An item you can equip to a zombie that, if it dies, it resurrects back on the farm but maybe loses a level or mutation as a consequence (so some cost). These would also be rare and costly.
    - These options ensure the player isn’t entirely hopeless if their favorite zombie dies, but for the most part, death is a real consequence.

### **Injuries and Healing**

Not all zombies who survive come home unscathed:

- **Injury System:** A zombie that finishes a battle with less than full HP may carry injuries.
    - Light injury: just needs some rest on the farm (as described in zombie behavior, they will heal over a day or two).
    - Heavy injury: max HP of that zombie is temporarily or permanently reduced (like they lost an arm or part of themselves). You might see them with a missing limb on the farm. They could require manual repair at the Stitching Station to restore their full capabilities.
    - Critical injury: the zombie survived but is badly broken – perhaps it has 1 HP and will not survive another fight unless healed. You might keep it off duty until fixed.
- **Scars:** We can have fun with persistent battle damage: a zombie that has been through many fights might accumulate scars or visual damage (even if healed). Example: A zombie could have an eyepatch or a limp animation if at one point it got severely hurt. This doesn’t necessarily have a gameplay effect beyond maybe becoming slightly more prone to damage (if we want to simulate wear and tear). Mostly it’s for storytelling on that unit.
- **Refusing to Fight:** A trauma system – if a zombie was brought to near-death or saw many allies die, maybe it gains a quirk “Cowardly” where it won’t go above a certain threshold of engagement. This might be too punishing so it could be an optional narrative layer (like they act skittish on farm).

### **Victory and Rewards**

Winning battles yields multiple rewards that make the risk worthwhile:

- **Resource Loot:** Human settlements contain valuables:
    - **Dark Coins:** The common currency (maybe looted as **Gold Coins** which you then convert or melt down into Dark Coins for your use).
    - **Materials:** If you raided a blacksmith, you get **Iron**, **Steel weapons**, etc. From a village, you might get **Grain or Livestock** (could be converted to zombie feed or left alive for other uses).
    - **Unique Drops:** Specific enemy types might drop special items:
        - Priests drop **Holy Water** (a rare item, possibly used as a mutation catalyst or to craft anti-holy talismans).
        - Knights drop **Armor pieces** which you can use to **equip your zombies** or melt down into metal.
        - Alchemists drop **Ancient Tomes** (unlock new tech or crafting recipes).
        - Castle Lords drop **Royal Blood** (a potent ingredient, maybe used to grow rare vampires or liches).
- **Territory Control:** Once you defeat a location, it becomes under your control. This could mean:
    - On the world map, a banner or marker changes to your necromancer symbol.
    - It might provide a **passive income** (like the village pays you tribute in Dark Coins, or the mine gives you X ore per day).
    - It could unlock new units: e.g. if you conquer a **Graveyard** in the world, perhaps it gives you an extra spot to grow zombies off-site or spawns a free zombie occasionally.
- **Experience:** Surviving zombies gain XP from battle. Possibly, the player (Necromancer) also gains some XP for leading the attack.
    - Zombies might level up after enough fights, improving their stats (like +5% HP, +5% attack per level or unlocking a minor ability at higher levels). This is separate from quality; it’s like training them through combat.
    - Leveled-up zombies are more precious, making you even more careful not to lose them.
- **Reputation & Progression:** Each victory might progress a storyline or add to your infamy. For example, after conquering 3 villages, the humans become aware of “the undead farm in the area,” possibly increasing difficulty slightly or unlocking a bigger retaliation event. But it also unlocks access to attack the next tier (like a Town becomes available on the map).
- **New Zombie Types:** Occasionally, you might capture something from the enemy that lets you create new zombies. For instance:
    - Defeat a Fortress that had captive **Werewolves**, now you can grow a Werewolf-type undead (if that’s in design).
    - Sack the Alchemy Lab of a town to get a **Mutagen** that unlocks **Mutant Zombies**.
    - Basically, some zombie seeds or recipes might only be obtainable by conquering specific locations.

Losing a battle simply means you don’t get these rewards and you lost any zombies that died. Typically you would regroup, maybe grow some replacements, and try again later when stronger. There’s no additional penalty like losing resources (unless we have a mechanic where failing a siege triggers a counter-attack on your farm, which could be interesting but might frustrate players, so probably not for base design).

### **Advanced Combat Details**

For those interested in the mechanics under the hood, here are more details on combat calculations and effects:

### **Damage Types & Effects**

Different attacks may have different damage types, which interact with certain enemies or environments:

- **Physical Damage:** Standard damage from bites, claws, swords, etc. This is most common. It’s very effective against unarmored foes but reduced by armor/defense stats. Physical attacks often have a chance to **knockback** smaller enemies.
- **Toxic Damage:** From things like the Spitter’s acid or a zombie with a poison mutation. This is great against living organic enemies (it bypasses some armor by corroding or causing poison DoT). It’s less useful on constructs or undead enemies (should you ever fight enemy undead). Toxic attacks typically inflict a **Poisoned** status (damage over time).
- **Fire Damage:** Could come from a burning zombie or environmental hazard. Fire excels at damaging groups (splash damage) and causes **Burning** (damage over time that can spread). However, heavily armored knights might resist fire a bit (plate armor doesn’t burn, though the human inside might cook, so maybe not too much resistance).
- **Psychic/Dark Damage:** Used by Liches or certain mutations. This type bypasses physical armor entirely (hits the mind or soul). It’s super effective against humans with low willpower (like peasants) but less so against disciplined knights or priests who have mental training or holy protection. Psychic attacks might **Confuse** enemies (make them wander or attack incorrectly for a moment).
- **Explosive Damage:** From zombies that explode or thrown grenades by enemy engineers. This is area damage that’s very effective against tightly clustered units. It is generally non-discriminatory (your zombies can also be hurt by explosions if caught). It can also destroy obstacles quickly. Explosions might apply a strong **Knockback** to anyone surviving the hit.
- **Holy Damage:** Only enemies use this (priests, paladins). It’s extremely dangerous to your zombies – often dealing double damage to undead. Holy attacks might also **Stun** your units or even cause a debuff like **Weakening** (reducing their attack). You have to target holy damage dealers quickly with your forces.

### **Status Effects**

During battles, certain attacks cause status ailments:

- **Bleeding:** A unit loses a fixed amount of HP per second for a short duration. For example, getting slashed by a knight’s sword might make a zombie bleed (since they do have fluids/ichor). Zombies, being undead, might have some resistance to bleeding (since they don’t need blood circulation), but it still represents structural damage over time.
- **Poisoned:** As mentioned, continuous damage over time, usually longer duration but lower DPS than bleeding. It represents toxic corruption. Human enemies are very susceptible (some might even die just from running away poisoned).
- **Burning:** Takes damage over time and can **spread** to nearby units. If a zombie is on fire, any other zombie in close proximity might catch fire too (same for humans). Burning typically lasts until extinguished (maybe a unit will eventually pat it out or it ends after X seconds). Fire is double-edged because if your Brute is on fire and charges into a group of enemies, he spreads fire to them (which might actually be a perk if you don’t mind your Brute taking some damage).
- **Stunned:** The unit is briefly unable to move or attack. This can happen from heavy blunt hits (a giant’s club, or a trap) or holy flashes. Stun might last ~2 seconds typically, enough to break an attack rhythm. High-tier zombies could have resistance or faster recovery from stun.
- **Confused:** The unit loses sense of friend vs foe or direction. A confused enemy might walk the wrong way or even swing at an ally once. For zombies, confusion might make them wander aimlessly for a moment (effectively a short disable). This can be caused by psychic attacks or certain chemicals.
- **Frozen:** Mostly from environmental effects or an ice mage – the unit’s movement is greatly reduced (e.g. -50% speed) and maybe attack speed too for a short time. It might also make them more brittle (extra damage from next hit).
- **Fear/Morale (unique to humans):** We could have a mechanic where some human units **flee in fear** if things look bad (like a fear status that just makes them run away off the screen). Zombies typically don’t feel fear (unless some rare holy effect instills it, but that would be extremely rare).

Players don’t directly manage these statuses but understanding them is key (e.g. bring toxic attacks to poison tough enemies, or use fire carefully).

### **Combat Calculations (How Damage is Computed)**

To provide transparency in design:

- **Attack Damage:** Each unit has an Attack stat. When it hits, base damage is typically equal to that stat (maybe with a small random variance ±10%). Certain attacks might be a multiplier of that (e.g. a critical hit or a special ability like Brute’s charge could be 1.5x damage).
- **Defense/Mitigation:** Each unit has a Defense stat (or armor). A simple formula could be used: *Damage taken = Attack - (Defense)*, but usually we make it percentage based to avoid zero or negative damage.
    - For instance, effective damage might = Attack * (100 / (100 + Defense)). So if a zombie with 50 attack hits a knight with 50 defense, damage is 50 * (100/(150)) ≈ 33. If the knight had 200 defense, damage would be 50 * (100/300) ≈ 16. This formula means high defense greatly reduces but never totally nullifies damage.
- **Critical Hits:** We can give some units (maybe Runners or certain mutations like Razor Claws) a chance to crit, doubling their damage for that hit. This adds some unpredictability.
- **Range Modifier:** Ranged attacks might do slightly less damage than an equivalent melee (since their advantage is range). e.g. We could say ranged attacks deal 80% of the unit’s Attack stat as damage (unless headshot critical etc).
- **Area Damage Calculation:** If an explosive does 100 damage in its center, units at the edge might take less (falloff). We can simplify and say all in radius take full damage, or do linear falloff down to 50% at edge.
- **Healing:** If any healing abilities exist (like a Lich could heal or a mutation that regenerates), they might restore a fixed HP per second or a percentage. This simply adds to HP but likely cannot exceed the unit’s max HP.

### **Combat Priority & AI Targeting**

The logic each unit uses in deciding what to do:

```xml
For each unit (zombie or human) on battlefield:
    If there is an enemy in attack range:
         Attack the closest enemy (or in some cases, the weakest enemy, depending on AI).
    Else if no enemy in range:
         Move forward toward the enemy base.
```

- Zombies typically go for the closest enemy. This means if an enemy comes to them, they stop and fight.
- Some specialized targeting:
    - Ranged units (like archers or spitters) might prioritize targets with the **lowest health** (to finish them off) or **highest threat** (like an enemy priest) depending on their AI design.
    - A Paladin (human) might prioritize the strongest undead first (like go after the biggest zombie on field).
    - But for simplicity, closest is the default for melee.

We can incorporate lane preference too:

- A zombie will generally stick to its lane and fight enemies in that lane first. If that lane is clear, it might shift to an adjacent lane if an enemy is very close there.
- Vertical positioning might allow interesting scenarios (e.g. zombies spread out to multiple lanes to avoid all being hit by one AoE attack, etc., though player doesn’t control that, it emerges from initial placement).

This automated priority means battles play out largely by formation and composition, which is what we want – the player’s strategy comes in squad selection and positioning, not mircomanaging individual attacks.

---

## **Resource Economy**

The game features a variety of resources and currencies that players must manage to grow their farm, raise their horde, and wage war. The economy is designed to encourage active engagement (raiding, farming, exploring) rather than passive accumulation alone. **Note:** The game is not using any blockchain or Web3 elements – all currencies are in-game and used for gameplay progression, not speculative trade.

### **Primary Currencies**

### **Dark Coins**

- **Description:** Dark Coins are the common currency of Zombie Farm (imagine them as the “gold” equivalent). They might be visually represented as tarnished coins with skull motifs.
- **Earning Dark Coins:**
    - Completing battles and raids yields coins (plundering human settlements).
    - Selling surplus materials or crafted items to NPC merchants (for example, trading excess bone meal or zombie byproducts).
    - Quest rewards and daily login bonuses often give Dark Coins.
    - Possibly a small amount from passive income sources like controlled villages paying tribute.
- **Uses of Dark Coins:**
    - Purchasing basic **Zombie Seeds** from the in-game store or merchants.
    - Buying building materials or tools (if you don’t want to gather).
    - Paying for **farm expansions** (there could be a coin cost to unlock new land).
    - Transaction medium for trading with NPCs (if there’s a market).
- We ensure that Dark Coins are abundant enough through gameplay that players can progress without feeling overly grindy, but large upgrades will require saving up or doing big raids.

### **Soul Essence**

- **Description:** Soul Essence is a rare, premium-quality currency – essentially crystallized souls. Think of it like a high-value currency akin to gems in some games.
- **Obtaining Soul Essence:**
    - Defeating powerful foes, like castle bosses or champion enemies, may drop Soul Essence.
    - Special events and community challenges might reward it.
    - Achievements or milestones (e.g. reaching a new player level tier) could grant some.
    - If this game were F2P, this could also be the currency bought with real money, but since we’re not focusing on monetization here, we treat it as just a rare in-game reward.
- **Uses of Soul Essence:**
    - Buying **special zombie seeds** (e.g. an Ancient Seed or Mystery Seed might cost Essence instead of or in addition to Dark Coins, reflecting their rarity).
    - **Instant grow** items: If a player is impatient, they could spend Essence to immediately finish a zombie’s growth or a building’s construction.
    - **Unique buildings or upgrades:** Some high-end structures (like a second Mutation Lab or a Teleporter) might only be purchasable with Essence or at least require some.
    - **Gacha-like random packs:** Perhaps a “Dark Summoning Ritual” item that gives a random rare zombie could be bought with Soul Essence, for those who like chance.
- Soul Essence is intentionally scarce to maintain a progression balance and sense of specialness. It’s never strictly required to progress (you can do everything via normal resources given enough time), but it accelerates and provides access to some fancy extras.

### **Farming Resources**

These are resources mainly related to the farming and growing side of the game, analogous to how in other farm games you have wood, stone, water, etc., but with a dark twist:

### **Growing & Crafting Materials**

| **Resource** | **Source / How to Obtain** | **Usage** |
| --- | --- | --- |
| **Rotten Wood** | Chop dead trees on farm or in forest areas; sometimes loot from villages (wooden structures) | Used for constructing farm plots, basic buildings, crafting simple tools. It’s like the wood of this world. |
| **Bones** | Dig up graves, defeat skeleton enemies, or find bone piles | Another primary building material (in place of stone/metal early on). Crafting fertilizer (bone meal), building undead structures (fences, etc.). |
| **Blood Water** | Collected from Blood Wells (refill over time), barrels during Blood Rain, or by processing animal carcasses | Used for watering zombie crops (can be put in buckets). Also a component in some alchemical recipes. |
| **Corpse Dust** | Produced by the Corpse Composter (by decomposing spare body parts), or found in ancient crypts | Acts as a fertilizer to boost growth and quality. Also used in potions or mutation catalysts. |
| **Soul Fragments** | Gained from defeated human enemies (each human might release a fragment), or by harvesting particularly high-quality zombies (maybe Iridium quality gives a fragment because it had excess soul energy) | Used for magical purposes: high-end fertilizer, mutation catalysts, or crafting dark spells. Possibly also needed for some upgrades (infusing soul power into a building). |
| **Dark Seeds** | These refer to zombie seeds in general; basic ones (Shambler, etc.) are bought with coins or found | Planting to grow zombies. Sometimes crafted (maybe you combine resources to make a basic seed if you run out, though generally you buy/find seeds). |
| **Mutagenic Gel** (possible resource) | Collected in Toxic Wasteland region or from mutant creatures | Used specifically for mutation catalysts or to water plants for higher mutation chance. |
| **Iron Scraps** | Salvaged from human weapons/armor, or mine nodes in world | Used to craft better farm tools (e.g. an iron shovel for faster tilling) or build defensive traps. Also needed for advanced buildings (like reinforcing structures). |
| **Fabric/Cloth** | Loot from villages (old clothes) or trading with a merchant | Used for certain structures (maybe making a tent or banner) and possibly for zombie uniforms/armor. |
| **Brainz** (fun optional resource) | Harvested from particularly fresh corpses (maybe a byproduct of some battles or if you butcher an animal) | Could be a special treat to instantly boost a zombie’s XP or mood (feeding a zombie a fresh brain makes it VERY happy). Alternatively used in advanced crafting (brain stew potion). |

*(We can add more as needed, like stone, metal variants, but these cover a lot of basics.)*

### **Castle Loot & Rare Items**

When raiding human settlements, beyond coins and basic materials, you’ll encounter special loot that can be repurposed:

- **Holy Water:** Dropped by priests or found in churches. Ironically, you can use this as a high-end mutation catalyst (the extreme reaction of holy water on a zombie in a controlled lab might induce rare mutations), or as an ingredient to craft items that protect your zombies from holy damage.
- **Royal Blood:** A potent substance from high-value targets (like the blood of a king or noble). This can be used to create **Royal Zombies** or vampire-like undead. In game terms, maybe collecting this unlocks a recipe for an advanced seed or can be applied to a growing zombie to instantly make it gold quality (since noble blood is rich).
- **Ancient Tomes:** Found in libraries, mage towers, or universities in human cities. These books unlock new **tech research** options or crafting recipes. For example, an ancient tome on fortifications might let you upgrade your walls, or a tome on necromancy might teach a new zombie type recipe.
- **Knight’s Armor:** Pieces of metal armor from knights. You could **equip** some to your larger zombies (improving their defense) or melt them for iron. A full set might be combinable to outfit a Brute zombie as an “Armored Brute” for instance.
- **Gunpowder or Explosives:** From enemy arsenals, used to craft **Traps or Bombs** for base defense, or perhaps to arm a Suicide Bomber zombie unit. If humans have early firearms or cannons, you might capture those too and repurpose them.
- **Gold and Jewels:** Treasure that doesn’t have direct use but can be sold for a lot of Dark Coins, or maybe used to decorate your farm (hey, who says necromancers can’t have some bling).
- **Livestock:** Sometimes raids might yield cows, pigs, etc. The game could allow you to keep them (to produce meat for feeding zombies) or sacrifice them for resources. A dark farm might have a pen of “food animals” essentially.

### **Crafted Resources & Items**

As you progress, you’ll craft more complex items combining basic resources:

- **Bone Meal Fertilizer:** Combine bones (and maybe corpse dust) to create fertilizer that boosts crop growth.
- **Mutation Serum:** Crafted in the lab by mixing rare herbs, mutagenic gel, and perhaps a drop of royal blood, this serum guarantees a mutation when used, or at least raises chances dramatically.
- **Reinforced Barrier (Wall sections):** Using wood + iron scraps you make strong fences or walls for defense.
- **Combat Stims:** Potions that you can feed to your zombies before battle to buff them (maybe made from brains, herbs, and essence). Could increase speed or damage temporarily.
- **Virus Bombs:** Essentially a bio-weapon crafted from disease samples, that you can throw at enemies during battles or raids to weaken them (causing poison).
- **Necrostone Blocks:** If you gather stone from somewhere and infuse it with dark essence, you get necrostone, a building material for high-tier structures (like the Command Center or huge monuments).
- **Zombie Gear:** Simple weapons or armor for zombies. E.g., craft a **Rusty Sword** from iron scraps and a zombie can use it to get +Attack, or a **Wooden Shield** from wood to increase a zombie’s defense (especially useful to equip some frontline shamblers to act as makeshift shield zombies). This introduces a light equipment system.

The crafting system ties resources together and gives purpose to loot. It encourages players to raid different places to get ingredients for these powerful items, and then invest those into improving farming or combat efficacy.

### **Resource Generation & Sinks**

### **Active Resource Generation**

Players must take action to gather most resources:

- **Scavenging Missions:** Aside from big battles, you might send a couple of zombies on short scavenging runs (this could be an automated mission where you dispatch zombies to e.g. a nearby forest to fetch wood or a graveyard to collect bones). They return after X minutes with some loot. This feature would consume those zombies’ time but yields resources without a full battle.
- **Exploration Harvesting:** When you personally explore the PvE world, you can find resource nodes like ore veins, herb plants, etc., and gather them (with appropriate tools).
- **Combat Rewards:** As covered, battles yield a lot of resources, making combat a primary way to advance your economy (which differs from pure farm-sim where you’d mostly grow/sell crops).
- **Quests:** NPCs might ask for certain items and reward resources or coins. E.g., Grave Keeper says “I need 10 bones to reinforce the cemetery gates” and gives you some Corpse Dust and Dark Coins in return – a net positive trade.
- **Events:** Seasonal events might provide bursts of materials (e.g. during Blood Moon, every battle gives double resources, or a special meteor shower event might litter your farm with rare minerals to pick up).

### **Passive Resource Generation**

As you build your domain, some things will produce resources over time:

- **Resource Nodes on Farm:** For example, you might have a **Graveyard Pit** that slowly generates bones over time (maybe one bone per minute or something) as skeletons crawl out and you harvest them. Or a **Blood Vat** that refills with blood water over time.
- **Captured Territories:** Many conquered human locations function like resource generators:
    - A captured **Mine** gives a certain amount of iron ore or gold per hour.
    - A **Farmstead** might give regular meat or grain (grain could be used to feed animals or brew something).
    - A **Library** under your control might periodically yield a random research scroll or tome.
- **Trade Routes:** In a later progression, you might establish trade with friendly NPC factions (maybe goblins or other necromancers). For instance, you can send excess bones to a Goblin trader in exchange for wood on a daily route. This effectively converts resources over time automatically.
- **Ally Tributes:** If there’s a concept of allied survivor camps (maybe you intimidate some humans into serving you instead of wiping them out), they could pay you a tax in resources for protection (like a classic protection racket).
- **Automated Production Buildings:** e.g. a **Bone Mill** building might passively generate a bit of bone meal from any corpses you’ve collected (over time), or a **Blood Bank** might preserve and gradually distill collected blood into higher quality essence.

Passive generation ensures that while you’re focusing on other tasks, your empire is still growing. It prevents stagnation if, say, you take a break from battles to focus on farm layout for a while – you’ll come back to some accumulated goodies.

### **Economic Balance & Resource Sinks**

To avoid the player hoarding massive resources with nothing to spend on, the game includes many sinks (resource expenditures):

- **Zombie Maintenance:** Feeding, as discussed, consumes meat daily. If you have 50 zombies, that’s 50 meat per day you need to supply either via farming animals or buying/trading. This scales with horde size.
- **Decay Prevention:** If using special items to preserve zombies (like a magical seal or embalming fluid to reduce decay), those items use resources too. (We’ll cover decay in [Zombie Decay System](https://www.notion.so/1f46f9db4a0c8038bb03e00864213281?pvs=21)).
- **Building and Repairs:** Constructing new buildings or defenses eats a lot of wood, bone, metal. Additionally, if your base is attacked (either by NPC events or other players in raids), things might get damaged or destroyed – requiring resources to repair or rebuild. Traps that trigger in defense often need to be reset or replaced (costing some material each time).
- **Research:** Advancing your tech via the Research Center might consume resources per project. E.g., researching “Advanced Necromancy” costs 5 Soul Fragments, 100 Dark Coins, and 10 Ancient Tomes and takes 3 days. So accumulating those is necessary to progress.
- **Crafting High-End Items:** Making the best gear, mutations, or expansions will intentionally cost large amounts of resources, serving as goals to save up for.
- **Guild/Alliance Contributions:** If the game has guilds, they might have collective projects (like building a giant effigy or contributing to a territory defense) where players dump resources for communal rewards or status.
- **No Easy Selling for Profit:** Importantly, unlike some farm games where you can produce infinite crops and sell for money, here you **cannot sell zombies** or even most resources on an open market freely. Zombies are your army, not trade goods. And resources are generally better used than sold. We deliberately avoid an easy money-making loop by selling farm products. Any selling to NPC (like selling extra bones) is at modest rates just to clear inventory, not to grind wealth. This maintains focus on usage (growing zombies to fight, not to become a tycoon).
- **Expiration/Decay of Resources:** To further discourage infinite hoarding, certain resources could decay or spoil over time:
    - Meat might rot if not used in a few days (forcing you to continually gather rather than stockpile a year’s supply).
    - Blood water could coagulate or evaporate if kept too long.
    - Magical resources like Soul Fragments might lose potency if not used (or attract unwanted attention like ghosts if you stockpile too many, creating hazards).
        
        This softly nudges players to use what they have rather than sit on it.
        

The economy is tuned so that a diligent player usually has enough to do what they need, but choices still matter. If you spend all your iron on fancy armor for zombies, you might lack iron to build traps for base defense, etc. This creates interesting strategy decisions.

---

## **Farm Management & Layout**

Managing the home base (the farm) involves constructing buildings, setting up defenses, and expanding your territory. Given the free placement system, players have a lot of freedom in how they design their base, but they must also consider functionality and security.

### **Buildings & Construction**

### **Essential Buildings**

These are the core structures every necromancer’s farm will eventually have. They provide vital functions and unlock new gameplay aspects. All buildings are freely placeable (respecting their footprint size), and the player can build multiples of some (like plots, walls, etc.) if desired:

| **Building** | **Function** | **Unlock Requirements** | **Size (tiles)** |
| --- | --- | --- | --- |
| **Necromancer’s Hut** | The player’s home. Used to sleep (save game, skip night), restore player health, and access personal storage. Often includes a small basement lab for flavor. | Starting building (already present at game start). | 3x3 |
| **Zombie Crypt** | Storage for inactive zombies. Allows you to exceed active zombie cap by storing extras. UI to manage zombie roster. | Starting building (or unlock via early quest). | 2x2 |
| **Blood Well** | Provides Blood Water for watering zombies. Refills slowly over time with blood (especially during blood rain). Acts as an infinite water source on farm. | Player Level 2 (basic survival skill). Costs some wood & stone to build. | 1x1 |
| **Bone Mill** | Grinds bones into Bone Meal fertilizer. Increases farming efficiency by providing a steady fertilizer supply. | Player Level 3. Requires bones & wood to construct (maybe also metal for the grinder). | 2x2 |
| **Corpse Composter** | Turns corpse parts into Corpse Dust fertilizer over time. Useful for quality boosts. | Level 5. Requires building materials plus maybe an iron cage or acid vat. | 2x2 |
| **Command Center** | War room to plan and launch large-scale sieges on human settlements. Provides the UI for advanced battle squad management and possibly strategic info on enemy defenses. | Player Level 20. Requires significant resources (wood, stone, metal) as it’s like building a fortress room. | 4x4 |
| **Training Grounds** | An area (with dummies, targets) where zombies passively gain XP. Can assign zombies here to slowly level up. May also improve combat readiness (like slight buff to those trained). | Level 10. Needs wood, straw (for dummies), etc. This might be more of a “zone” you place rather than a building, can be 5x5 fenced area. | 5x5 (including fence) |
| **Mutation Lab** | Facility to perform controlled mutations on zombies (as described earlier). Has an interface for catalysts, etc. | Level 15 and completion of a specific quest (e.g. help a Mad Scientist NPC). Needs some rare parts to build (glass, metal, arcane relics). | 3x3 (plus maybe needs adjacent empty space for safety!) |
| **Infirmary (Stitching Station)** | Place to heal and repair zombies faster. You can send injured zombies here for treatment (using resources to heal quicker than natural rest). | Level 12. Requires cloth, needles (metal), and maybe a trained helper NPC (or an automated system). | 2x2 |
| **Mausoleum** | Acts as shelter/house for zombies. Each Mausoleum might increase zombie cap by +5 and gives them a place to rest. Zombies will go here at night if idle. | Level 8. Requires stone primarily. You can build multiple as needed. | 3x3 |

*(The above are “essential” in that they cover major needs: rest, water, storage, planning war, training, mutation, etc.)*

### **Production & Resource Buildings**

These buildings help generate or process resources for the player’s economy:

| **Building** | **Function** | **Production/output** | **Unlock (Level or requirement)** |
| --- | --- | --- | --- |
| **Graveyard Pit** | A deep pit or mass grave that slowly generates basic zombie parts or bones (could be where you throw useless corpses and occasionally something crawls out). | +1 Bone per minute (for example), chance of zombie parts or low-tier zombie spawning occasionally (maybe an uncontrolled zombie could emerge as an event!). | Level 5 (after first few battles when you have spare corpses). |
| **Flesh Farm (Butcher Shed)** | Houses some animals or meat processing to generate zombie feed. Essentially lets you convert say crops or animals into daily meat portions. | e.g. 5 meat per day if supplied with some input like grain or if you have livestock. | Level 7. Could be tied to acquiring some animals. |
| **Scrap Yard** | A workshop to break down loot (weapons, armor) into raw materials like iron or cloth, and to craft basic equipment for zombies. | Allows crafting of gear (weapons, armor) and yields scrap from salvage. | Level 10 or after finding a blacksmith in world. |
| **Research Library** | A place to accumulate knowledge and generate tech points for research over time. Maybe you can assign an NPC or zombie scholar here. | Generates a small amount of research points per day towards tech tree. Also where you read Ancient Tomes to unlock things. | Level 18. Needs lots of books (tomes from raids) to build. |
| **Greenhouse (Dark Greenhouse)** | Enables growing zombies out of season or speeding up growth using controlled environment (also perhaps needed to grow certain plant-like zombies). | Reduces growth time by 50% for any plot inside it. Allows winter growing of those that normally only grow in other seasons. | Level 25, expensive (glass from sand maybe needed, metal frame). |
| **Blood Bank** | Stores large amounts of blood and preserves it. Also could convert blood into more potent forms (like distilling blood into **Blood Essence**). | Essentially increases capacity of blood water you can store, and could passively turn excess blood into special items. | Level 15. Requires glass and cooling (tech from research). |
| **Alchemy Lab** | (If Mutation Lab doesn’t cover all crafting) – a place to craft potions, stims, bombs using resources. | Crafting of consumables for combat or farm buffs. | Level 14, maybe included as part of mutation lab or separate. |

Players will choose which production buildings to focus on first based on needs. If combat is challenging, building a Scrap Yard to get better gear might be priority. If farming is slow, a Bone Mill and Greenhouse are important.

All buildings when placed can later be moved if you want to reorganize (except maybe the Hut which might be fixed). Some may also have **upgrade levels** – e.g. upgrade the Bone Mill to process more bones at once or the Training Grounds to handle more zombies concurrently – which would cost more resources.

### **Free Placement and Layout Considerations**

The player’s freedom to place buildings means they must think about the layout:

- **Centralization vs. Spread:** Keeping key buildings like the Hut, Crypt, Well, etc. in a central hub can minimize travel time when managing things. On the other hand, spreading out might be useful to protect against attacks (don’t put all eggs in one basket where one breach could damage everything).
- **Roads and Paths:** The player can place path tiles (purely cosmetic in some games, but here they actually speed up movement for the necromancer and zombies slightly). Designing a network of paths connecting fields, storage, and buildings will make your farm operate more efficiently. Zombies will prefer paths if available (we program their AI to treat path tiles as lower cost).
- **Decorations:** While decorative items (gravestones, creepy statues, pumpkins, etc.) are mostly aesthetic, some might offer minor buffs (like a statue that slightly increases fear caused to raiders, or a fountain that slightly boosts happiness in an area). These can be placed freely. Players who invest time in decorating can both make a cool-looking farm and get these small benefits.
- **Spacing:** Some buildings might benefit from being near each other:
    - E.g., having the Blood Well near your fields saves walking when watering.
    - The Mutation Lab might be best placed a bit away from other buildings (maybe occasionally an experiment goes wrong and causes a small explosion – giving a reason to not cluster it with sleeping quarters).
    - Storage (Crypt) near the Command Center would ease moving troops in and out for war.
- **Multiple Instances:** The player might build multiple of certain structures if needed (like two Bone Mills to grind bones faster if bone is in surplus, or several Mausoleums for capacity/housing). Layout needs to accommodate that.
- **Farm Aesthetics vs Efficiency:** Some players might make a neat grid (fields on one side, housing on another, defenses at perimeter). Others might go wild with a labyrinthine graveyard for fun. The game allows both, but we give subtle cues that a bit of organization helps (via tooltips or NPC hints as mentioned).

### **Base Defense & Raids**

While the primary threat is from AI human armies in their bases, we also include a feature where **other players** (or AI raiders if PvP is disabled) can attack your farm when you’re not actively defending. This encourages players to set up defenses and not just focus on offense.

### **Raid System Overview**

- **Asynchronous PvP:** If enabled, players can raid each other’s farms. If a player is offline (or opt-in during certain windows), another player can send their zombies to attempt a raid on that base. The defending player’s zombies and traps will be controlled by AI according to how they set it up.
- **AI Faction Raids:** For players who don’t want PvP, or in addition, there could be roaming bands of human survivors or rival necromancers that occasionally raid your farm as a PvE challenge. This can be on a timer or triggered if your infamy gets high.
- **Raid Intent:** Raiders usually want to steal resources rather than wipe you out completely. They might target your storage buildings (like trying to break your resource storage or crypt) and will leave once they grab something or suffer too many losses.
- **Notification:** If you get raided while offline, you log in to a report of what happened (did they steal anything? how many zombies died defending?). You might see some buildings damaged and need to repair them.

### **Defense Setup by Player**

You have control over how your farm is defended:

1. **Defensive Structures:** You can build walls, gates, and traps:
    - Walls (wooden fences early on, stone walls later) to funnel enemy movement. Free placement means you can literally design a maze or perimeter wall around your farm.
    - Gates that you can open/close (AI will close them during raids, open when needed for pathfinding otherwise).
    - Traps like spike pits, landmines (crafted with gunpowder), arrow traps (perhaps built on towers or walls).
    - **Graveyard Guardians:** Possibly stationary defense like a gargoyle statue that shoots at enemies, or summoning circles that spawn a temporary skeleton during a raid.
2. **Assign Defender Zombies:** In the defense UI (maybe via Command Center or a smaller “Defense Post” structure), you can assign certain zombies as **guards**. Those zombies will patrol or stand guard at set points and will be the ones that engage enemies during a raid. Other zombies not assigned might hide or not be counted for defense (to simulate not every worker zombie fights unless told). This way you can choose your defense team separate from your main attack team if you want.
3. **Patrol Routes:** If you have enough guards, you can set patrols – e.g. two zombies walk clockwise around the perimeter. This increases chance to intercept raiders early. The UI might let you place waypoints on the farm layout to define a patrol path.
4. **Kill Zones:** A smart base design might herd attackers into a particular area (say a courtyard) where you concentrate traps and can have zombies ambush them from all sides. You might leave a section of wall intentionally weak-looking as a lure, and then have bombs buried there.
5. **Hide Valuables:** You can decide where to store resources; for example, build multiple smaller storage caches instead of one big warehouse, so a raider might only find one cache and the rest is safe. There’s also a concept of decoy: e.g. chests filled with junk labeled “treasure” to mislead human raiders.
6. **Upgrade Defenses:** As you progress, you’ll strengthen your defenses: taller walls, moats (maybe a moat of toxic waste around the base?), scarecrows that actually scare human attackers (reducing their morale). Ensure to keep them upgraded since raiders get tougher too.

### **Running a Defense (AI side)**

- When a raid begins, if you’re online it might alert “Raid incoming in 1 minute!” giving you time to quickly position yourself or trigger alarm (maybe you ring a bell that calls all wandering zombies to defense positions).
- If offline, it just happens with AI.
- The raiders spawn at the edge of your farm and attempt to break through or go around obstacles toward key targets (likely your storage buildings or to kill your zombies).
- Your assigned guard zombies will move to engage as they detect the intruders. Traps will trigger as raiders step on them.
- Ideally, we make it so players can watch a replay of the raid later (to see how their defense did and adjust).
- If the raiders reach a storage building (like your warehouse or coin vault), they will grab whatever they can (we can say each raider can carry X resources, and they prioritize rare stuff). Then they try to leave.
- A raid might last a few minutes at most. If defenders kill all raiders, you successfully defended (perhaps you even get a small reward or at least you kept your stuff). If raiders escape with loot, those resources are deducted from your totals.

The key is to balance it so raids are a fun challenge and incentive to build defenses, but not so punitive that you lose everything overnight. Perhaps limit that they can only take a small percentage of your resources, and zombies lost in defense maybe don’t permanently die (maybe they are considered not fully dead or easier to resurrect because you find their parts on your own land)? This could be a difference between PvE and PvP: in PvP maybe there’s an agreement or magic that prevents permanent death of defending zombies to not discourage players from participating.

### **Defense Strategy Tips**

Players will learn to:

- Create **choke points** where their Brutes can block a narrow gap and hold off many humans.
- Place **traps in front of walls** so if enemies try to break through, they get spiked.
- Use **elevated positions** (if any, maybe towers) for Spitter zombies to rain down acid safely.
- **Decentralize storage** so one breach doesn’t lose everything.
- Keep some **fast response zombies** (like Runners or Fliers if any flying zombie) unassigned so they can rush to any point that’s breached.
- Possibly **ally with others**: maybe you can have a friend’s base send reinforcements if you’re in a guild, as an advanced idea (not core but could be later feature).

### **Farm Expansion**

Your farm’s land is not static. As you become more powerful, you can claim more of the surrounding area to expand your base and grow more zombies.

### **Expansion System**

Instead of a fixed map from the start, we adopt a progressive expansion similar in spirit to **Sunflower Land** or other farm games, but with thematic zones:

- The farm is divided into chunks or rings that become available as you level up or meet conditions. For example, you start in the central **Ruined Graveyard** (20x20).
- When you’re ready (say Level 5 or after a quest), you can expand to the **Old Farmland** to the north, adding 10 more rows of land. That might introduce some old farmhouse ruins to clear and space for more plots.
- Each expansion might require resources to unlock (like 500 Dark Coins and 50 Wood to clear the area) or completing a battle to secure it (maybe there was a bandit camp there you must clear).
- The expansions not only increase space but also change environment:

| **Expansion #** | **Name** | **Unlock Criteria** | **Features Gained** |
| --- | --- | --- | --- |
| 1 (starting) | **Cursed Core** (Ruined Graveyard) | Start with it | Basic 20x20 area, comes with Necro Hut, Crypt, some graves/trees. |
| 2 | **Haunted Grove** (Forest edge) | Level 5 + resource cost | Adds 10x20 area to one side with dense dead trees (gather wood), introduces new seed: Tree Zombie perhaps. |
| 3 | **Bog of Decay** (Swamp) | Level 10 + complete a quest to drain swamp | Adds marshy terrain (slower movement, natural mutagen pools increasing mutation chance in plots here). New resource: swamp tar (for fire bombs). |
| 4 | **Abandoned Village** (ruins) | Level 15 + defeat a local village so no one occupies it | Adds some ruined human structures on your farm that you can use or scrap for resources. Possibly a source of human prisoners to turn into zombies. |
| 5 | **Bone Fields** (Bone Desert) | Level 20 + resource cost | A wide open space littered with bones (great for bone harvesting). Easier to spot enemies approaching (clear line of sight). |
| … | … | … | … |
| Final (~20) | **Wasteland Expanse** (full 100x100) | Level 50 and major quest/battle | The final expansion giving max area, possibly including an old military base or research lab that becomes yours (yielding tech or nuclear material for ultimate zombies). |

(This table is illustrative; actual number of expansions and specifics can vary.)

Each expansion increases the buildable area, letting players greatly enlarge their farm. It also provides new opportunities (and maybe new challenges like more points to defend).

### **Utilizing New Land**

When you gain a new area:

- You often need to **clear it**: remove obstacles (trees, rocks, wrecks) using tools or resources.
- Then you can place new plots/buildings there. Perhaps certain expansions are ideal for certain uses (e.g. swamp area might have fertile soil for particular seeds, desert area might be good for building solar panels or something if that existed).
- Visually, your farm becomes more varied and impressive – from a tiny graveyard to an entire necropolis.

Expansions also signal progression in narrative – you’re literally spreading the influence of death further. By the endgame, your farm might look more like a fortress or a dark city, compared to the humble graveyard you started with.

---

## **Player Progression**

The game must have a sense of progression for the player themselves (beyond just the zombies). This is achieved through a leveling system, skill upgrades, research, and achievements that provide long-term goals.

### **Leveling System (Survivor/Necromancer Level)**

### **Gaining Experience**

The player (Necromancer) has an experience level that represents their overall progress and power. Ways to gain XP:

- **Combat victories:** Each battle won grants a chunk of XP. Tougher battles give more. Even if you lose but kill some enemies, you might get partial XP.
- **Quests and Missions:** Completing story quests or NPC tasks gives XP.
- **Farm activities:** To ensure pure farmers aren’t left behind, significant farming milestones (like harvesting your first 10 zombies, or growing an Iridium-quality zombie) give XP. Regular actions like each harvest could give a tiny bit.
- **Exploration:** Discovering a new region or dungeon can reward XP, as can solving puzzles or finding lore items.
- **Daily activities:** Perhaps a small daily XP bonus for logging in or completing a daily challenge (like feed all your zombies, or harvest X zombies).

The XP curve likely grows such that early levels are quick (tutorial might get you to level 3-5), mid levels take moderate effort, and late levels (50+) require a lot of endgame content.

### **Level Rewards & Unlocks**

Each level typically provides something, so leveling always feels meaningful:

- **Base Stats:** The Necromancer’s own stats might improve (if the player character is involved in combat or survival, e.g., more HP, faster move, higher aura buff range, etc.). This is more relevant if the necromancer can be hurt in raids or perhaps in exploration by hostile creatures.
- **New Buildings/Items:** Many buildings we listed have a required player level. So hitting that level unlocks the ability to build them (assuming resources available). Similarly, new seed types might become available at certain levels in the shop.
- **Increase max squads or horde:** Some levels could directly increase your limits, such as +5 to max active zombies (in case you haven’t built enough mausoleums, this ensures a baseline growth), or +1 zombie deployable in battle.
- **Skill Points:** If we have skill trees (next section), each level (or every few levels) grants a skill point to spend.
- **Energy/Stamina:** If the game uses an energy system for exploration actions, leveling could increase your max energy or regen rate, allowing more actions per day.

A sample breakdown of key level milestones:

| **Level Range** | **New Content Unlocked** | **Bonus example** |
| --- | --- | --- |
| 1-5 | Basic zombie types (Shambler, Runner), Blood Well, basic farm plots expansion. Tutorial range. | Horde size +5 by level 5 (start 10 -> 15). |
| 6-10 | Intermediate buildings (Bone Mill, Training Grounds), new regions (Haunted Forest), PvP raids feature unlocks (if any). | +1 squad slot (i.e., can deploy one more zombie in battle). |
| 11-20 | Advanced zombies (Ghoul, Brute), Mutation Lab, Command Center at 20, mid-tier human targets unlock. | +10% resource gain (efficiency bonus by lvl 20). |
| 21-30 | Elite zombie seeds (Lich, etc.), Greenhouse, stronger traps, Frozen Tundra region. | Minor combat ability unlocked (e.g., Necromancer can cast a weak spell in battle). |
| 31-40 | Legendary content: Ancient Seed, special mutations, guild features, etc. Volcano region unlock at high 30s or 40. | Another +horde size or +squad size increment. Possibly start prestige eligibility at 40-50. |
| 41-50 | Endgame: Capital City battle around lvl50, apocalypse events unlock. Perhaps prestige system at 50 (with option to reset for bonuses). | Access to prestige or legendary upgrades. |

These are illustrative; the idea is to ensure a steady stream of new toys so the game remains engaging.

### **Skill Trees**

To add customization, we can include skill trees where players allocate points to match their playstyle. There could be three main branches reflecting combat, economy, and necromancy specializations:

### **Combat (Warfare) Tree**

Focuses on improving your effectiveness in battles:

- **Tactical Genius:** Increase damage of all your zombies by +2% per rank in battles. At max rank maybe +10%. (It’s like you command them better.)
- **Quick Deployment:** Zombies enter the battlefield 1 second faster per rank (or first wave starts ahead). At high rank maybe they get a headstart in positioning.
- **Rallying Cry:** Unlocks an ability where the Necromancer can boost all zombies’ speed/damage mid-battle once per battle. Higher ranks increase buff amount or decrease cooldown (if multiple uses in long fights).
- **Berserker Horde:** Your zombies deal more damage as they lose HP (say +1% damage for each 10% missing, per rank or something). Fits aggressive style.
- **Fortitude:** Reduces damage your zombies take from traps or ranged attacks by a small percent per rank.
- Possibly an ultimate skill at end of tree: e.g. **Army of the Dead** – once per day, instantly resurrect a portion of fallen zombies after a battle (not usable in battle, but after a battle you lost, you can recover some losses).

### **Survival (Economy/Base) Tree**

Focuses on farm productivity and defense:

- **Scavenger:** Increases amount of resources found from scavenging and exploration by +X%. (At max maybe +20% to all resource yields).
- **Builder:** Reduces building costs and build time by X%. Also maybe increase repair speed.
- **Fortification:** All walls and defensive structures have +10% HP per rank. Traps do more damage.
- **Efficient Brewer:** Crafting consumables or fertilizer yields more output (e.g., get 2 potions instead of 1, or fertilizer gives double effect).
- **Logistics:** Increase how much you can store or how fast passive resources accumulate (like mines produce more).
- **Undead Resilience:** Decrease zombie daily decay rate (makes maintenance easier).
- Perhaps an ultimate: **Undying Loyalty** – once per raid, if a defending zombie “dies”, it instead revives with some HP (like a second chance). This only in base defense scenarios.

### **Necromancy (Research/Magic) Tree**

Focuses on zombie quality, mutations, and magical aspects:

- **Mad Scientist:** +% success rate on mutations in lab, and +% chance on natural mutations. At high ranks, maybe guarantee that even failures don’t result in death.
- **Accelerated Growth:** Reduces grow time of zombies by a flat amount or percentage. E.g. -5% grow time per rank.
- **Empowered Minions:** Zombies you harvest start at +1 level or with some bonus stat if grown under your mastery. Essentially buffs the output of your farm.
- **Enhanced Strains:** Improves the base stats of each zombie type by a bit. E.g., all Shamblers now come out with +10% HP by having this skill.
- **Fusion Master:** Increases the efficiency of zombie fusion – maybe the resulting zombie keeps more of the parents’ combined stats (like 80% instead of 70%). Or reduces the cost of fusion.
- Ultimate: **Lichdom:** The Necromancer themself transcends to lich, granting an aura where any zombie that dies in your presence in battle has a chance to immediately resurrect once (could be game-breaking, so maybe a low chance or something, but it’s a capstone).

Players can mix trees, but maybe not enough points to max all, so choices matter. For example, going heavy into Combat tree makes battles easier but your farm might be less efficient. A balanced approach is viable too.

### **Research & Technology**

Parallel to the skill tree which is more about the necromancer’s innate abilities, a **Research system** allows unlocking new tech, building upgrades, and zombie improvements via time and resource investment:

- The Research Center/Library building is where you conduct research. Research is divided into branches like:
    1. **Military Tech:** Improving combat gear and defenses. (E.g., unlock the ability to craft steel traps, research “Advanced Tactics” to increase number of zombies deployable, develop plague catapults for sieges, etc.)
    2. **Biology (Zombiology):** Focus on zombie improvements. (Unlock new zombie types or tiers, research better feeding methods to slow decay, improved fertilizers, etc.)
    3. **Engineering:** Focus on base and economy. (Unlock automated resource collectors, improved buildings like a level 2 Bone Mill that works faster, new structures like a Meat Farm, etc.)
    4. **Magic (Forbidden Arts):** Focus on spells and supernatural upgrades. (Unlock rituals like summoning skeletons in battle, weather control devices, artifacts to equip, etc.)
- **Research Points:** To research an item, you might need to accumulate a certain number of points in that category. Points are generated by the Research Center over time, and can be boosted by doing things like finding tomes or running specific tasks. For example, to unlock “Steel Trap”, you need 100 Engineering points. Your base generates 5 per hour, plus you found a tome giving 20, so it takes a day roughly.
- **Costs:** Research also often requires resource inputs or prerequisites. Unlocking a new zombie type might require you to have captured a live specimen or its DNA (i.e., maybe you had to defeat a boss that then allows research on that type). Or researching a tech might consume some rare items like an Ancient Tome or Soul Fragments, as mentioned.
- **Time:** Even after paying costs, research might take real time to complete, similar to mutation. More advanced tech = longer wait. You can only research one thing at a time (unless you build multiple labs or have multiple researchers NPCs).
- **Tree Progression:** Some techs require prior techs. E.g., you can’t research “Elite Zombies” if you didn’t first research “Intermediate Zombies”. So players progress down branches.
- **Outputs:** Research can unlock:
    - New buildable structures or upgrades (e.g., upgrade walls to iron walls).
    - New zombie seeds or the ability to occasionally get a special zombie from existing seeds (like research how to create a zombie giant).
    - Efficiency improvements (like +10 max storage for resources, or +1 zombie cap on farm).
    - Utility items (like a potion that reveals all enemies on the minimap during battles).
- This system ensures that even if a player has resources, they need the knowledge to use them, pacing out progression and rewarding comprehensive play (exploring to find research items, etc.).

### **Achievements**

Achievements serve both as guidance for long-term goals and as a way to reward players for mastery:

- **Categories:**
    - *Horde Master:* achievements for collecting zombies (e.g., “Raise 50 zombies,” “Have at least one of each zombie type,” “Own 10 gold-quality zombies”).
    - *Warlord:* achievements for combat (e.g., “Conquer all villages,” “Win a battle with no zombie casualties,” “Destroy 1000 human units total”).
    - *Defender:* base defense achievements (e.g., “Repel 10 raids,” “Kill 50 raiders with traps,” “Go 30 days without losing a raid”).
    - *Mad Scientist:* mutation and fusion achievements (e.g., “Perform 20 successful mutations,” “Create a Legendary mutation,” “Fuse a zombie of each tier”).
    - *Survivor:* general progression (e.g., “Survive 1 in-game year,” “Reach player level 50,” “Complete all main storyline quests”).
    - *Builder:* economy/base (e.g., “Build every type of structure,” “Expand farm to maximum size,” “Have 100 traps active at once”).
- **Milestone Rewards:** Many achievements give tangible rewards:
    - Resources or currency (some Dark Coins or Essence for each milestone).
    - Unique cosmetic items or decorations (e.g., a trophy statue for beating the final boss).
    - Exclusive **Zombie skins** or slight variants: Perhaps an achievement gives you a special cosmetic appearance you can apply to one zombie (like a golden armor skin for a brute).
    - Titles or badges displayed on your profile if multiplayer (e.g., “The Undying” title for surviving 100 days without a loss).
    - Some might even unlock new mutations or a secret seed (like a hidden zombie type unlocked only if you complete a specific hard achievement, encouraging completionists).

Achievements encourage players to experience all parts of the game (not just focus on one thing). They also provide bragging rights and stretch goals after you’ve done most other content.

---

## **PvE World & Exploration**

Beyond the farm and structured castle sieges, the game offers a PvE open-world component. This allows players to explore, gather resources, and face challenges on their own terms, rather than only in the pre-set battles.

### **Exploration & World Regions**

### **World Map & Travel**

The world is divided into distinct regions around your farm (which is roughly central):

- The player can click on the world map or walk their necromancer character off the edge of the farm to enter an **exploration mode**. In this mode, you travel to a selected location. It might be handled via a simple travel time or a separate exploration screen.
- **Energy/Stamina:** To prevent infinite roaming in one session, there could be an energy system. For example, the necromancer has 100 stamina per day dedicated to exploring. Walking to a nearby forest might consume 10, entering a dungeon costs 20, etc. This recharges each day or through rest.
- Travel between known points could be instant or take some in-game time. We might not simulate walking in real-time across a huge map (unless we design actual connecting maps), instead treat it like point-and-click to go there. Possibly encountering random events on the way.

### **Region Types**

Each region has a level range and unique resources or zombies:

| **Region** | **Recommended Level Range** | **Description & Resources** | **Unique Zombie Types (to encounter or unlock)** |
| --- | --- | --- | --- |
| **Forgotten Cemetery** (Starting area) | 1-10 | The area just outside your farm. Old graves, small abandoned church. Basic resources: lots of bones, a bit of wood, low-tier seeds. Minor ghosts or skeleton enemies roam. | Shamblers (wild ones), maybe some Skeleton warriors. |
| **Haunted Forest** | 10-20 | Twisted woods with perpetual fog. Resources: **Dark Wood** (special wood tough as bone), mushrooms for potions. Contains a mini-boss: The Headless Huntsman. | Tree Zombies (undead treants), Wolf Zombies (zombified wolves). |
| **Abandoned City** | 20-30 | Ruins of a city partially destroyed by earlier zombie outbreaks. Resources: Scrap metal, electronics (if slightly modern tech is in game), lots of cloth from shops. Danger: human scavengers might attack. | Riot Zombie (from old police), new Runner variants, maybe an undead dog. |
| **Toxic Wasteland** | 30-40 | An industrial area leaking chemicals. Acid pools and mutated flora/fauna. Resources: **Mutagen** barrels, toxic waste, irradiated metal. Good place for mutation catalysts. | Mutant Zombies (fused abominations), perhaps Zombie Spiders (mutated bugs). |
| **Frozen Tundra** | 40-50 | A cold region with an old military outpost. Resources: Ice crystals, oil from machinery (maybe used to fuel some contraptions), and ancient relics frozen in ice. Weather: constant snowstorms that slow you. | Frost Zombies (slower but tough), Ice Golems (not undead but hostile). Can unlock Frost Lich. |
| **Volcano Lair** | 50+ | Endgame region inside an active volcano where a Necromancer Lord once lived. Resources: Obsidian, dragon bones, fire essence. Very dangerous environment with lava. | Fire Zombies (burning undead that are hostile), possibly a Dragon Lich (boss). |
|  |  |  |  |

Each region is basically a zone with an environment. Within each, you might find:

- Gathering nodes (e.g., trees to chop, ore to mine).
- Small puzzles or platforming (like cross the broken bridge, unlock a gate by finding keys).
- Enemies to fight in real-time as the necromancer (if we allow the player to do some ARPG-like combat themselves, or maybe you always bring a small party of zombies with you that you directly control in exploration? That’s another design choice. Possibly safer to say exploration is mostly the player alone or with one follower, and any combat is simpler than the big battles).
- Random events: e.g., meet a traveling merchant or find a wounded traveler (choice to kill or help? If help, maybe recruit them as a ghoul later…).

Exploration is optional but rewarding. It breaks up the cycle of just farming and battling, by adding an adventure mode.

### **Dungeons & Special Locations**

Scattered in the world are special spots often needing exploration and sometimes puzzle-solving:

- **Ancient Crypts:** These are like mini-dungeons in the Forgotten Cemetery or Haunted Forest region. They have a few rooms, some locked doors, and require finding levers or keys. Inside you fight some skeletons or ghosts and at the end find a treasure chest (with maybe a rare seed or artifact).
- **Military Bunkers:** In the city or tundra, these act as tougher dungeons with mechanical traps, maybe automated turrets (since the humans prepared these against zombies). You might take a small team of zombies with you to clear it. Rewards include lots of scrap, weapons, or even a **tank** (maybe not drivable but parts).
- **Research Labs:** Likely in the wasteland or city – labs where humans researched the zombie virus. Contains lore and recipes for mutation serums. Possibly there’s a surviving mad scientist NPC or maybe a mutated boss (like a giant mutant blob) to fight.
- **Cathedral Ruins:** Holy sites where priests tried to hold out. Extremely dangerous for the undead (the ground might be consecrated causing constant damage to your zombies if you bring them). But clearing one could yield Holy Water and the opportunity to corrupt the shrine (which might then give you ongoing power or convert it to a Dark Shrine that buffs your zombies).
- **Royal Tombs:** Hidden in various regions, these tombs of kings/queens hold powerful relics and sometimes the spirits of the royals. For example, the Tomb of the Mad King might have his undead form as a boss, which if defeated, gives you an **Ancient Seed** (to grow an Ancient One zombie). These are like endgame side quests.

Dungeon mechanics:

- **Mini-map & Navigation:** The player sees a small area or enters an instance. They navigate room by room. Could be turn-based or live movement depending on complexity.
- **Puzzles:** Could be lever pulling in correct order, pushing statues, riddles given by ghosts (e.g. a ghost asks you to place items in a certain way to unlock).
- **Traps:** Pressure plates that shoot arrows, floors that collapse (maybe losing a follower zombie if it falls in), etc. The player can disarm traps if they have a tool or sacrifice a lesser zombie to trigger it safely.
- **Checkpoints:** Longer dungeons might have a mid-way safe room.
- **Boss Fights:** Often a unique boss at the end that doesn’t fit in normal battles. Possibly the necromancer has to fight them directly or with a limited squad. Example: a **Crypt Lich** that teleports around and summons skeletons – a more action RPG style fight than the auto-battles (giving a bit of variety).
- **Loot:** Guaranteed treasure chest or artifact at end. Also lots of minor loot along the way (like crates to break for coins, etc.). Dungeons might be the only source of certain high-level items (like a “Necromancer’s Ring” that gives a passive bonus when worn, or a “Mutation Recipe” scroll unlocking a new forced mutation option).

Dungeons are typically instanced for the player (not competitive or anything, except maybe leaderboards for time). They often have a **cooldown** or are one-time completion. E.g., you can only loot a tomb once, then it’s done permanently or it might reset after a long period with lesser loot.

### **NPCs & Quests**

While much of the world is hostile, there are a few neutral or even friendly NPCs scattered around:

- **Death Merchant:** A mysterious salesman (perhaps a demon or a lich in disguise) who appears at certain locations or events. He sells rare items like unique seeds, catalysts, or even offers to buy certain loot from you. Essentially a traveling shop with special stock.
- **Bone Collector:** An undead tinkerer who loves bones. If you meet him (maybe at the cemetery region), he’ll trade things – e.g., give him 100 bones and he gives you a piece of bone armor or a blueprint for an improved bone mill. He might visit your farm occasionally as well.
- **Mad Scientist:** A human (or ghoul) who is obsessed with zombie experiments. Found in a lab or shack in the world, after some quest he might move to your farm as an NPC (perhaps to operate the Mutation Lab). He provides quests like gathering mutant samples or testing a serum on a zombie, and rewards you with new mutation options or a unique zombie variant.
- **Grave Keeper:** The old caretaker of a cemetery who somehow survived or became partially undead but keeps his mind. He might give daily quests (demanding you clear out some wild spirits or bring him grave flowers). In return, he gives small rewards or hints at treasure locations.
- **Wandering Spirits:** Sometimes on the world map you encounter ghostly NPCs. They might be former victims or just random ghosts. They can trigger mini-quests like “Find my body and bury it so I can rest” – which might involve retrieving a corpse (maybe converting that corpse into a zombie after you do the burial, as a twist).
- **Merchant Caravan (Goblin Traders):** Perhaps a neutral faction of goblins or shady merchants that aren’t hostile to you. They set up camp occasionally in a region (maybe changes weekly). They can trade resources (e.g., trade wood for metal at some rate) and sell exotic pet animals or decorative items.

### **Quest System**

The game offers quests to guide and reward the player:

- **Story Quests:** These drive the main narrative (like conquering the human kingdoms, discovering the source of the zombie virus, etc.). They often tie into attacking key locations or performing certain research. They give big rewards (like unlocking expansions or major features).
- **Side Quests:** Provided by NPCs like above. They might be multi-step (e.g., the Mad Scientist has a chain of quests to gather things from each region and finally gives you the Mutation Lab plans).
- **Daily Quests:** Simple tasks generated each day to encourage varied gameplay:
    - “Grow X zombies of type Y today.”
    - “Win a battle without using more than 3 zombies.”
    - “Collect 50 wood and 50 bones.”
    - “Use the Mutation Lab to mutate a zombie.”
    - These give small rewards (coins, a random seed, a bit of XP, maybe a small amount of premium currency occasionally).
- **Weekly Quests/Challenges:** Harder goals for bigger rewards:
    - Could align with events or just be bigger versions (like “Conquer 3 settlements this week” or “Raise a zombie to level 10”).
- **Quest Interface:** The game should have a journal or notice board UI listing active quests, their objectives, and rewards, so players can track what to do.

Quests serve not only to give direction (especially to new players who might be overwhelmed by open-ended sandbox) but also to entice trying all systems (e.g., a quest might explicitly ask you to use the Fusion system once, ensuring players experiment with it).

### **Tournaments & Leaderboards**

Though PvP is not a focus, friendly competition can be introduced:

- **Tournaments (PvE):** For example, a weekly “Zombie Arena” event where players send a team of zombies into a special auto-battle against waves of enemies or another AI-controlled horde. It’s essentially a survival mode. Players are ranked by how long they last or how many waves cleared.
    - Daily tournaments might be simpler (“Today’s challenge: only Shamblers allowed, survive as long as you can!”).
    - Weekly tournament might allow your best team, and top performers get unique rewards like cosmetics or soul essence.
- **Seasonal Leaderboards:** If seasons (in real life or game) are a thing, you can rank players on certain metrics:
    - Combat Rating: points for each battle won, tougher battles give more. Resets each season with a prize to top X players.
    - Zombies Collected: a fun one, who has the largest variety (though that might encourage just breadth).
    - Mutations Discovered: tracking how many different mutation types a player has obtained.
    - Defense Success: maybe track how many raids you defended vs failed.
    - These are optional competitive layers. They provide bragging rights and maybe minor rewards, but we have to be careful not to ruin the cooperative/PvE spirit.
- If guilds/factions exist (maybe not planned but could be later), leaderboards could also be group-based (which guild collectively raided the most, etc.).

These features ensure that even after a player “finishes” the main content, there’s repeatable and competitive content to keep them engaged.

---

## **Special Events**

To keep the game dynamic and players engaged over time, we include special events and limited-time modes that introduce temporary changes or challenges. These can align with real-world seasons or be fictional events in the game world.

### **Seasonal Events**

We can mirror some real-world seasons (with a dark twist) for major events each month or so:

### **Blood Moon (Monthly Event)**

- Occurrence: Perhaps once a month (like a full moon cycle) or as a scheduled event for a week.
- Effects:
    - **Zombie Growth Boost:** During Blood Moon, all zombie growth times are halved (or zombies grow twice as fast). This encourages players to plant a lot during this period.
    - **Mutation Frenzy:** Mutation chance is doubled as well. You’ll see a lot more random mutations happening【source】.
    - **Unique Zombies:** Special “blood zombies” (maybe zombies with a red aura) can appear. For example, harvesting any zombie during Blood Moon might have a 10% chance to yield a Blood variant of that zombie with slightly enhanced stats or unique look.
    - **Combat Changes:** Human enemies are weaker or terrified during a Blood Moon (maybe they have -10% attack), OR perhaps undead are empowered with +20% stats at night during the Blood Moon. Also double loot from raids because it’s a time of chaos.
    - **Community Boss:** A global event boss could appear – e.g., The Blood Moon Werewolf that players can collectively contribute to defeating (everyone fights it in their own battle instance and the damage is summed). If it is defeated by the community, all participants get a reward (like a unique decoration or some Soul Essence).
- Theme: The Blood Moon is all about empowering the undead and is a great time for players to advance their farm quickly. Visually, the sky turns red at night and maybe even daytime has an eerie crimson tint.

### **Radiation Storm (Random Event)**

- Occurrence: Randomly in the world (not scheduled, maybe a low chance each day after a certain point). Lasts a short period (like a day or two).
- Effects:
    - **Temporary Mutations:** All zombies currently on your farm suddenly get a random mutation for the duration of the storm (24-48 hours). This could be positive (like extra arms) or weird (maybe cosmetic, like glowing).
    - **Resource Surplus:** Resource nodes produce more during the storm. Perhaps your Bone Pit churns out double bones, your blood wells overflow, etc., due to the chaotic energy.
    - **Accelerated Decay:** The downside is zombies decay faster (maybe double decay rate during this time) since radiation destabilizes them. If not managed (feeding, etc.), some might degrade in quality or stats.
    - Strategic Aspect: This event makes your horde very strong (due to extra mutations) so it might be the perfect time to attack a tough castle. But you have to manage the increased maintenance needs.
- Visual: Greenish storm clouds swirl, occasional lightning strikes that are a sickly green. Random lightning might even strike on battles or the farm causing damage (risky to be outside).

### **Horde Invasion (Global Community Event)**

- Occurrence: Perhaps once a quarter or during a story chapter. All players are alerted about a huge invasion.
- Concept: Instead of players invading humans, a massive army of AI-controlled undead (or maybe rival necromancer’s horde, or even demonic entities) threatens the world. Both players and humans are under threat.
- Mechanics:
    - A sequence of special battles or defense missions appears. For example, a Demon King is trying to conquer the world, and undead and humans might have to weirdly both fight it. But since we focus on PvE, players fight off waves of super-enemies that attack everyone’s farms or territories.
    - Community contribution: Each player’s success in these missions adds to a global progress. If enough are defeated, the invasion is repelled.
    - There could be leaderboards for who contributed most (like who killed the most invaders).
- Rewards: Participation yields nice rewards (resources, unique items). Top contributors or all who exceed a threshold get an **exclusive zombie** (like a Demon Zombie or a special skin) and maybe a title “Hero of the Invasion”.
- This event is cooperative in spirit (all players vs. environment) and can drive engagement as everyone works toward a common goal for a limited time.

*(Other seasonal events could include things like Halloween event – maybe “The Pumpking’s Revenge” where you fight pumpkin-headed zombies and unlock a pumpkin zombie seed, or a Christmas event “Zombie Santa” where you defend against a crazed Santa who hunts zombies with holy candy canes, etc. We can be creative with holiday themes in a dark comedic way.)*

### **Limited-Time Modes**

These are special gameplay modes that aren’t normally available, activated during events or weekends to mix up the routine:

### **Survival Challenge (Time-limited mode)**

- A mode where you start with a fresh scenario (not using your main farm, but a separate challenge instance) with nothing and see how many days you can survive as waves of enemies attack.
- It’s like a rogue-lite mini game: you get a small plot of land, minimal resources, you must quickly grow some basic zombies, defend a small shack, and each night increasingly large waves of humans or monsters attack. You gather what you can between waves to build more defenses or grow more zombies.
- There’s no permanent loss to your main game; it’s a self-contained mode. When you finally fail (the horde is overrun), you get rewards scaled by how long you lasted.
- Leaderboards can rank who survived the most waves.
- This mode tests understanding of mechanics and efficiency under pressure, since it compresses the game loop into a fast-paced scenario.

### **Zombie Rush (Mega-Battle mode)**

- This mode gives you unlimited resources for a short session to create the largest battle possible.
- For example, in Zombie Rush, the game might let you spawn as many zombies as you want (of types you’ve unlocked) and pit them against an endless stream of human army units.
- It’s sandboxy: players can enjoy seeing 100 vs 100 battles that normally the game’s balance wouldn’t allow.
- It could be just for fun or tied to a challenge of how many enemies you can defeat before your horde falls.
- Likely an event mode because such mass battles might be too heavy to run frequently, but as a special event it could be very cool. Possibly done on a separate simple battlefield map to handle more units.

### **Mutation Mayhem (Experimental mode)**

- During this event, all mutation possibilities are unlocked and easier to get. Perhaps for a weekend, any zombie you grow can come out with any mutation (even ones you haven’t discovered).
- The mode could encourage experimentation: e.g., “For the next 3 days, the Mutation Lab allows you to pick any mutation freely at no cost, and natural mutation chance is 100%.”
- This lets players toy around with crazy combinations without the usual costs. They won’t keep those super-mutants forever (maybe when the event ends, any impossible combos revert or something?), or maybe they do keep them but since everyone can do it during that time it’s okay.
- It’s sort of like a free trial of endgame power, and it could be tied to a contest like “Show us your most absurd mutated zombie” on social or just personal enjoyment.

These limited modes provide variety and excitement, ensuring that at any given time there might be something novel to try beyond the core loop.

---

## **Game Loop & Strategy**

Now that all major systems have been described, it’s important to understand how they come together in the daily gameplay loop and long-term strategy. We want players to have a routine but also seasonal variety and progression milestones.

### **Daily Routine**

Much like **Stardew Valley** or other farm sims, Zombie Farm will likely encourage a cycle of activities each in-game day. A possible day (which might be, say, 30 minutes real time if 20 min day + 10 min night):

**6:00 AM – Morning: Planning & Farm Chores**

- The player (Necromancer) wakes up (if they chose to sleep to save, or perhaps if online continuously there’s a daybreak event). They might check their **mailbox** outside the hut for any letters (maybe NPC quest letters or raid reports).
- **Tend to Crops:** Walk the farm to water any plots that need it (if they didn’t have auto-watering or rain). If a Blood Well is built, refill the bucket there and water each growing zombie crop. If any **zombies are ready to harvest**, morning is a good time to do it – harvest them and welcome new zombies to the farm.
- **Replanting:** For each zombie harvested, decide what to plant next. The player might have some seasonal strategy (e.g., it’s Summer, so plant more Spitter Seeds which thrive now). They plant seeds in the now-empty plots and apply any fertilizer they have.
- **Feeding Time:** Check the feeding stations – fill them with meat if needed so all zombies will get their meal for the day. Maybe do a round of petting a few zombies to keep them happy (especially any that are crucial to your army).
- **Resource Collection:** Visit production buildings – collect Bone Meal from the Bone Mill, Corpse Dust from the composter, etc. Gather any passive resources like the bone pit or blood that accumulated overnight.
- **Check on Injuries:** If any zombies returned injured from last night’s raid or battle, send them to the Infirmary or Mausoleum to heal. Possibly apply some quick fixes if planning to use them later that day.

**12:00 PM – Afternoon: Exploring & Quests**

- By midday, farm chores are done, so the player might **leave the farm** for tasks:
- **Exploration Trip:** Use some energy to travel to a nearby region. For example, go to the Haunted Forest to gather dark wood and hunt a bit. On the way, maybe complete a side quest (like fetch an ingredient for the Mad Scientist).
- **Resource Gathering:** Chop a few dead trees, mine an ore node, fight off a small group of feral zombies or wild beasts. Possibly discover a hidden chest or event (like saving a wandering spirit for a reward).
- **NPC Visit:** Swing by an NPC location (like the Death Merchant’s current spot) to trade resources or buy a rare seed he’s selling that day.
- **Dungeon Delve (if time):** If near a known dungeon and prepared, do a quick run through a small crypt for treasures.
- The player keeps an eye on the time (if the day-night matters for returning).

**6:00 PM – Evening: Combat & Expansion**

- Back to the farm with gathered resources. Now perhaps prepare for an offensive:
- **Army Prep:** Head to the Command Center and review available zombies. Choose a target on the world map to attack (maybe a Town you’ve been eyeing). Select a squad based on intel (e.g., bring more armored zombies if the town has many archers).
- **Siege Battle:** Initiate the attack. Watch the auto-battle play out. Perhaps it’s victorious with some losses. Claim the rewards – new materials and maybe a new territory if captured.
- **Post-Battle:** Any surviving zombies gain XP (some might level up). The player sees which zombies died and takes note to possibly grow replacements. If a key high-level zombie died, consider using a rare item to revive it or just mourn and move on.
- **Resource Management:** Use the loot from the battle. Example: got some iron, go to Scrap Yard and craft a couple of swords to equip your zombies; got holy water, use it in the Mutation Lab for an experiment, etc.
- **Building & Expansion:** If enough resources and maybe just got to a new level, initiate a construction project. For instance, build that new Mausoleum for more capacity or start the next farm expansion (clearing the Old Farmland to the north).
- **Decorate/Tweak Layout:** Spend a bit of time rearranging or adding any new decorations or moving buildings if something felt inconvenient (players often do this in evenings in such games, organizing for efficiency or looks).

**10:00 PM – Night: Maintenance & Defense**

- Night falls (things get dark, possibly foggy). At this time, zombies get more active.
- **Final Farm Check:** Make sure all plots are watered (maybe one was planted late and needed an evening water), and everything is in order.
- **Set Overnight Tasks:** Perhaps start a long process like a high-tier research in the Library or a Fusion of two zombies in the lab, since those can run while you’re offline or sleeping.
- **Defense Readiness:** If you suspect a raid (or scheduled event like Blood Moon at midnight), ensure your guard zombies are at their posts and maybe close your gates. If a manual action, ring the bell to gather zombies in defensive positions.
- **Optional Night Battle:** Maybe launch one more smaller raid at night if you have spare zombies, since zombies fight better at night and you might catch a village off-guard in the dark.
- **Midnight Save:** The player goes to the Necro Hut and “sleeps” (this saves game and advances to next morning). If multiplayer, maybe players don’t need to sleep to progress time, but if they log off, time will still move for passive stuff.

This routine can of course vary – some days you might skip exploration and do two battles; some days you focus purely on farming and rebuilding your forces after heavy losses; other days are quest-driven (story events might occupy a whole day).

The time ratio of farming vs combat vs other can be tuned to player preference (some may focus on farming more and do fewer fights, which should be viable albeit slower progression; others might rush combat and only do minimal farming to sustain it).

### **Seasonal Gameplay**

Each in-game season (if we use a seasonal calendar like Spring, Summer, Fall, Winter as in Stardew) lasts a certain number of in-game days (say 15 days each to make a 60-day year, or we could do a 28-day month system, depending on design). Seasons bring changes:

### **Spring – “Reawakening”**

- **Growth Season:** After a possibly harsh winter, spring means things grow faster. Zombie growth speed +20% generally in this season.
- **Rainy Weather:** Frequent Blood Rain events in spring provide natural watering. This helps your farming a lot.
- **New Seeds:** Runner Seeds might only be available in Spring/Summer, so spring is the first chance to plant fast zombies. Some event like Easter could be twisted into a “Zombie Egg Hunt” where you find hidden caches of resources on your farm or around the world.
- **Enemies:** Human villages might be weaker in spring (recovering from winter shortages) making it a good time to attack early targets.
- **Strategy:** Plant and expand plots now to capitalize on growth bonus. It’s a building and preparation season.

### **Summer – “Warfare”**

- **War Season:** Humans historically campaign in summer, so this is when they are active and your zombies can fight in good weather.
- **Thinner Castle Defenses:** A fun twist: perhaps in summer some castles send troops away (on campaigns elsewhere), meaning certain battles have fewer defenders or special opportunities. Maybe timed events like “The Southern Fortress is celebrating a festival, guards are distracted - attack now!”
- **High Activity:** Exploration is easiest (no cold or constant rain to slow you). You can travel further (maybe energy cost -50% due to long days).
- **Special Zombies:** Some seeds only grow in summer heat, e.g., Spitter Seeds love the heat and have higher yield now.
- **Summer Event:** Could have a beach or fire theme – maybe a “Beachhead Assault” where you attack a coastal fort that’s only accessible in summer, or a Midsummer undead festival.
- **Strategy:** Best time to go on the offensive and conquer territory. Also gather resources like crazy during long days.

### **Fall – “Harvest & Mutation”**

- **Harvest Season:** Many of your long-growing zombies (like Ghouls or those planted in earlier seasons) are ready now. Perhaps a mechanic: zombies grown in Fall have a higher chance to be high quality (like nature’s bounty effect).
- **Mutation Increase:** The ambient magic of fall (think Halloween vibe) could increase mutation rates by +30%. It’s a spooky time; maybe the veil between worlds is thin, causing odd effects (which can be both good and bad).
- **Resources:** It’s time to gather last crops (if any plant-like resources existed) and prepare for winter. So maybe you focus on stocking up meat and materials.
- **Halloween Event:** Absolutely, we have fun here. During late Fall, a Halloween event with special quests (carve jack-o-lanterns that act as scarecrow, fight a Pumpkin King boss, gain a pumpkin-headed zombie skin).
- **Strategy:** Use the mutation boon to experiment in the lab. Also, this might be a good time to complete any remaining conquests before winter slows things down. Harvest and either fuse or store enough zombies to get through winter’s challenges.

### **Winter – “Survival & Endgame”**

- **Survival Season:** Winter is tough. If we simulate, maybe zombie growth is -50% speed unless you have a Greenhouse or other magical aid. Many seeds won’t grow at all outside (except winter-special ones).
- **Weather Challenges:** Snow and cold might reduce all production (farms produce less, maybe blood wells freeze partially, making watering harder). Zombies might move slower when farm is snow-covered unless you clear paths.
- **Frost Zombies:** On the flip side, Winter unlocks Frost Lich or other winter-themed undead that thrive now. Human castles in winter might have fewer patrols (they hunker down) but the ones present are stronger (defending against cold and your attacks).
- **Christmas Event:** A dark holiday event – perhaps “Zombie Santa” or Krampus that you either fight or get gifts from. Like maybe every in-game winter day an undead Santa rides by dropping random loot (or you have to defend your farm from him stealing your stuff in a fun mini-game).
- **Strategy:** Focus on maintenance and defense. Good time to do research (since farm chores are less). Prepare for spring by planning upgrades. Also maybe handle tough boss fights now that aren’t time-sensitive (like tackling that Frozen Tundra dungeon).
- **Winter Combat:** Could be the final story push – e.g., capital city might be attacked in winter when the humans are starving. However, you have to manage that your zombies are weaker in cold (unless you got them gear or specific traits).

By having these seasonal differences, the game encourages changing up play: heavy farming in one season, heavy combat in another, etc., preventing monotony.

### **Progression Phases & Tips**

Let’s break the game roughly into early, mid, late game and consider key focuses and strategies for each:

### **Early Game (Days 1-30, Player Level 1-10)**

**Focus:** Establishing basics and learning systems.

- **Zombies:** Mostly Shamblers and a few Runners. Work on getting a small balanced squad. Quality matters: try for Silver quality at least by watering and maybe some bone meal.
- **Farm Building:** Get the essential buildings up: Well (for water), Bone Mill (for fertilizer), maybe an extra Crypt space if you somehow hit cap. Expand a little (maybe first expansion if cheap).
- **Combat:** Conquer the nearest villages. They should be doable with a handful of zombies. Use sheer numbers if needed; you can regrow basic zombies quickly if some die.
- **Economy:** Coins might be tight early on. Do quests for NPCs and sell any truly excess items. But as per design, you won’t have many sellable goods besides maybe trading bones for coins with the Bone Collector.
- **Tips:**
    1. **Quality Over Quantity:** It’s better to have 5 strong zombies than 10 weak ones early on, because resource to feed 10 might be an issue and they’ll die easy. So take care of the ones you grow.
    2. **Complete Tutorial Quests:** They give you seeds and resources that jumpstart you (like a free Runner seed or some soul essence).
    3. **Scout Enemies:** If possible, gather intel on a location (maybe an NPC tells you “that village has only a few guards”). Start with easiest battles.
    4. **Manage Time:** Plant zombies before you log off or before sleeping in game, so they grow while you’re inactive. Idle time = growth time.

### **Mid Game (Days 30-100, Level 10-30)**

**Focus:** Expand and diversify.

- **Zombies:** Now you have multiple types. Work on specialized roles: have at least a couple Brutes for tanking, some Runners for flanking, a Spitter for range. Mid-game might introduce Ghouls or Liches – if you get one, protect it and use its powers.
- **Farm & Research:** Unlock and build the Mutation Lab by mid-game to start enhancing your horde. Build Training Grounds so idle zombies gain XP. Expand your farm area significantly – you’ll need space for more plots and defenses. Also start research on better tech (like improved walls, gear for zombies).
- **Combat:** Take down towns and fortresses. This requires strategy: you might need to send waves or use some consumables (like bombs) to help. Learn the patterns of tougher enemies (e.g., how to handle knights with shields or archers on walls). Multi-wave battles may appear – ensure to keep a reserve unit to clutch win.
- **Economy:** You should have steady Dark Coin income from conquered territories and selling unneeded loot. Manage Soul Essence carefully for important uses (like maybe buying that Ancient Seed or speeding up a critical research).
- **Tips:**
    1. **Diversify Zombie Types:** Each new enemy type might require a different answer (ranged enemies? use fast zombies to close distance; heavy armored? use Brutes or acid from Spitters). So maintain a variety.
    2. **Keep Zombies Happy:** As your army grows, don’t neglect feeding and housing. A large unhappy horde can actually be weaker than a smaller happy one. Build enough Mausoleums and feeding spots to keep up.
    3. **Upgrade Defenses:** Mid-game, other players might start raiding you or NPC raids get stronger. Set up at least basic walls and a kill zone. Losing resources to raids will slow you down.
    4. **Plan Mutations:** Use the Mutation Lab for key units. For example, giving your Brute “Armored Skin” and your Spitter “Toxic Cloud” ability can significantly boost your battle performance.
    5. **Use Allies/Items:** By now you have some consumables or maybe an NPC ally (like the Mad Scientist) – use their benefits. E.g., brew combat stims to use on your best zombie before a tough fight, or bring a temporary summon scroll from a quest.

### **Late Game (Day 100+, Level 30-50)**

**Focus:** Optimize, complete collection, tackle endgame challenges.

- **Zombies:** By late game you might have dozens of high-level zombies. Aim to create some **Legendary zombies** through fusion and rare seeds. Perhaps you’ll have one or two “super zombies” – like a Titan with epic mutations that anchors your army. Also, raise level caps: get many zombies to max level.
- **Farm & Base:** The farm should be at max size or close. This shifts gameplay to optimizing layout for efficiency or aesthetic perfection. All buildings should be built and many upgraded. Base defense should be formidable – think layered walls, multiple traps, and guard rotations. You might even design a **maze** that slows invaders to a crawl while automated defenses pick them off.
- **Combat:** Now you face capital cities and world bosses. These likely need full use of your forces: e.g., 3 waves of 10 zombies each, plus maybe manual triggering of a special power. You might suffer casualties in these epic fights, so prepare backups. PvP (if any) might also be a thing – maybe you test your army against another player’s defense in friendly competition.
- **Apocalypse / Prestige:** After beating the main storyline (defeating the human capital, etc.), the game might offer **Prestige mode** (reset with some benefits for replayability) or an endless **Apocalypse** mode (survive as long as possible against infinite waves). Only attempt these if you’ve min-maxed everything.
- **Tips:**
    1. **Maximize Efficiency:** Little things add up now. Use **min-max techniques**: e.g., always plant something in every plot (never leave plot idle), always have a research running, keep training grounds full, rotate zombies so none sit maxed doing nothing unless for defense.
    2. **Specialize Squads:** You might have enough zombies to form multiple specialized squads (e.g., a fast strike team, a heavy siege team, etc.). Use the right squad for the right battle. This reduces losses and speeds up conquests.
    3. **Stockpile for Events:** Have a buffer of resources and maybe weaker spare zombies in storage. When a special event or Apocalypse hits, you can afford some losses or quick build traps. Basically, expect the unexpected and be ready.
    4. **Complete the Collection:** Try breeding any zombies or mutations you haven’t seen yet. The achievements might reward you for 100% collection (all zombie types, all mutation types). Use your endgame resources to gamble on Mystery Seeds or high-risk fusions just to see if you get something new.
    5. **Experiment with Layout:** Now that you have everything, you might redesign the farm purely for aesthetic, since functional needs are handled. This keeps creativity going – e.g., arrange your graves in a skull shape or create a labyrinth garden. Share screenshots with the community events perhaps.

The game loop thus evolves: early on every zombie is precious and you focus on survival; mid-game you become more of a commander managing an army and an economy; late-game you’re an overlord optimizing an undead empire and facing world-scale threats.

### **Endgame Goals**

Even after finishing the main storyline and maxing out levels, the game provides goals for completionists:

### **Collection Achievements (checklist style)**

- **All Zombie Types:** Grow or obtain every type of zombie in the game (including secret ones). For instance, that might include the standard ones plus special event zombies (Pumpkinhead, etc.). This encourages participating in events and using all systems (some types might only come from fusion or mutations).
- **All Mutations Unlocked:** Achieve every mutation on some zombie at least once. There could be dozens, especially if combining physical and ability mutations, so this is a true mastery goal.
- **All Castles Defeated:** Ensure you have taken over every human settlement including optional ones (maybe some hidden or optional super-boss fights).
- **All Regions Explored:** Uncover 100% of the world map, complete all dungeons, found all secret locations.
- **All NPCs Befriended:** Complete quest lines for every NPC such that they all acknowledge you (for friendly ones) or are defeated (for adversarial ones). Possibly recruiting all possible friendly characters to your farm (like you might end up with a little community of weirdos at your farm: the Mad Scientist, Bone Collector, etc. all hanging out).
- Reward for full collection could be something like a special ending or a cinematic, plus the satisfaction. Maybe a super legendary seed that is basically a vanity thing (like grow the “Zombie King” which is ridiculously OP but you have nothing left to fight except show it off).

### **Farm Perfection**

- **100% Farm Rating:** If there’s a farm rating system (some games have something like that depending on decoration, happiness, etc.), achieve the maximum. This likely requires everything: all zombies happy, all decorations placed, no mess, full expansion.
- **All Buildings Constructed:** Build at least one of every structure and fully upgrade it if upgrades exist.
- **Maximum Zombie Happiness:** Keep your entire active horde at happy status for e.g. 10 consecutive days. (Tricky if you have 100 zombies, means flawless maintenance.)
- **Perfect Aesthetic Design:** More subjective, but could be measured by having at least X decorations, no two decorations of same type adjacent (for variation), etc. Or simply an achievement triggers if you place like 50+ decorative items.
- **All Achievements Unlocked:** Ultimately, you might get something for literally 100% achievements.

Farm perfection goals cater to the creative and thoughtful players who enjoy optimizing every detail of their base.

### **Combat Mastery**

- **Defeat the Capital City (Final Boss) with no losses:** A tough challenge, requiring top strategy or maybe a bit of luck with crits and such.
- **Win X battle in a row without any zombie deaths:** E.g., 10 battles streak flawless victory.
- **Fastest Speedrun:** Possibly a leaderboard or personal record for how quickly you conquered the entire world (in in-game days or real time). Some players enjoy resetting (via Prestige) and trying to do it faster using knowledge.
- **Try All Army Compositions:** Perhaps a fun achievement is to win a battle using only one type of zombie (e.g., “All-Shambler Army Victory” or “Only Brutes Victory”). Another could be using exactly one of each type in a big battle. This encourages varied play and not just using one meta comp always.
- **Legendary Zombies Collected:** If there are, say, 5 unique Legendary zombies (like special named ones or very rare seeds), collect them all.

These ensure that even the combat-heavy players have something to strive for after beating everything easily with their powerful horde – they can impose challenges on themselves or aim for bragging rights accomplishments.

Once the player has truly done all of the above, they might engage in prestige or just enjoy their sandbox, or move on satisfied. The game thus offers both a strong directed experience and open-ended play.

---

## **Detailed Mechanics**

In this section, we provide extra details on certain systems for the sake of completeness, including formulas and behind-the-scenes mechanics for decay, weather, etc., which have been hinted at earlier.

### **Zombie Decay System**

Even though zombies are undead, they are not entirely immortal. The **decay system** ensures that if you completely neglect your zombies, they will gradually weaken, encouraging players to maintain their horde.

### **How Decay Works**

- **Stat Decay:** Each zombie has a “freshness” or integrity value (not explicitly shown to player, but reflected by star quality and stats). Every in-game day that a zombie remains active and not properly cared for, they lose a small percentage of their stats (max HP, damage output, etc.) representing their body falling apart.
- **Decay Rate by Tier:** Higher-tier zombies (which are stronger and perhaps more unstable) decay faster if unfed:
    - Common (basic) zombies: lose ~1% of their base stats per day without maintenance.
    - Rare zombies: lose ~2% per day.
    - Epic zombies: ~3% per day.
    - Legendary zombies: ~5% per day (power comes at a maintenance cost).
- These values assume zero maintenance (no food). With feeding and care, you essentially reset the decay each day.
- **Decay Floor:** We probably don’t let a zombie decay below a certain point (maybe 50% of original stats) from neglect alone, otherwise they become useless. Alternatively, if they would go below say Bronze quality threshold, maybe they just “collapse” and need reanimation (like they effectively die on the farm and you must re-harvest them from a grave, which could be an interesting consequence).
- **Visual Decay:** As a zombie decays, its appearance could change: fresh zombies have more flesh and better posture; decayed ones look skeletal, parts missing, slower movement. This gives the player a visual cue to feed them.

### **Preventing Decay (Maintenance Recap)**

- **Feeding:** Giving a zombie its daily meat prevents that day’s decay entirely (and possibly even restores a small percentage if they had decayed some). So a well-fed zombie remains at peak condition indefinitely.
- **Resting (Crypt Storage):** If you won’t use a zombie for a while, putting it in the Crypt (basically cryo-sleep for zombies) **pauses decay**. In storage, they neither decay nor consume resources (could be explained as the crypt’s magic preserves them).
- **Upkeep Costs:** You can think of food as an upkeep cost. For example:
    - Common: 1 meat/day,
    - Rare: 2 meat/day,
    - Epic: 5 meat/day,
    - Legendary: 10 meat/day.
        
        This is a lot for Legendary, but that ensures players can’t maintain 10 legendary zombies easily without a huge food income, balancing their power.
        
- **Special Items:** There could be items like **Preservation Amulets** you can equip on a zombie to reduce its decay rate (like 50% less decay, meant for those you can’t feed often). Also building a high-level **Embalming Chamber** that can permanently preserve up to X zombies with no decay (for a steep cost) as a late-game solution for your favorite units.
- **Decay & Happiness:** If a zombie decays (i.e. goes unfed and loses stats), it likely also drops in happiness (hunger makes it grumpy). This is another feedback loop to get player attention.

The decay system adds a slight upkeep management aspect (like caring for farm animals in Stardew). It prevents scenarios where a player raises a giant horde and then ignores the farm entirely while still having maximum power. Instead, if you go heavy on combat, you either need to also ramp up your food production or accept that some of your zombies will weaken over time and need replacing or repairing.

### **Weather System**

We touched on weather in farming and combat context. Here’s a more organized list of potential weather events and their effects globally:

| **Weather Event** | **Duration (game time)** | **Effects on Farm** | **Effects on Combat** |
| --- | --- | --- | --- |
| **Clear** (Normal) | Typical default | No special effects. Normal growth rates, etc. | No modifiers in battles. |
| **Fog** | 4-8 hours (often night/morning) | Farm visibility reduced (screen has mist). Slight growth quality boost for undead crops (they like gloom). | In combat: Zombies move 20% faster (they thrive in mist), ranged human accuracy -10%. |
| **Blood Rain** | 3-6 hours (random rain) | All crops are watered automatically. Growth speed +25% during rain. Can collect blood water in barrels. Zombies’ happiness slightly increases (they dance in the blood!). | Combat: Reduces visibility, maybe ranged attacks less accurate for both sides. If battle happens in blood rain, zombies might slowly regenerate HP over time due to absorbing blood (say 1% HP per second). |
| **Toxic Rain** | 6 hours (special event) | Similar to blood rain watering, plus soil becomes infused: +50% mutation chance for crops planted that day. But unfed zombies take slight damage if outside (acidic). | Combat: Anyone not under cover takes small DoT. Zombies have some resistance, humans suffer more. This can disrupt battles, making it risky but could favor you if your zombies are regen. |
| **Radiation Fog** | 4 hours (rare) | As mentioned, huge mutation chance boost and random temporary mutations for zombies. Crops grow weirdly (could result in random type outcome even if it wasn’t a mystery seed?). | Combat: Zombies +20% speed (energetic), humans - some effect maybe confusion chance because the fog messes with them. Possibly some zombies might spawn crazy (like a mutant appears mid-battle on your side or as a hazard). |
| **Sunshine** | Daytime clear | If extremely bright (maybe after a long rain), could impose slight penalty: zombies on farm move slower, growth might slightly slow (they prefer dark). But solar panels (if any tech) work if you had them. | Humans get +10% damage in combat in bright daylight (morale boost), zombies -10% stats. So attacking at noon might be disadvantageous (encouraging night attacks). |
| **Storm** (Thunderstorm) | 2-4 hours | High winds and lightning. Chance that structures on farm get struck (maybe minor damage or free electricity if you harness it). Rain gives water but storm could knock down weak walls. | Combat: Random lightning strikes could hit battlefield, damaging whoever is there (could be enemy or your zombie). Could also break shields or cause stuns. Adds unpredictability. |
| **Snow** (Winter default) | Constant during winter | Crops (zombies) grow 50% slower unless greenhouse. Need to clear snow to keep farm functional (maybe shovel snow off plots or else growth halts). Zombies outside move slower (unless have cold resistance). However, no weeds/pests in winter (crows not active). | Combat: Movement speed for all ground units -20% (trudging in snow), except those with adaptations (like Frost zombies move normally). Cold can cause occasional **Frozen** status on units not adapted (short stuns). Humans in heavy armor might be slowed more than your lighter zombies, etc. |
| **Blizzard** | Few hours (extreme winter event) | Possibly deadly: if a blizzard hits, any crops not in greenhouse will pause growth, and could even take damage (chance to revert a growth stage). You might need to bring zombies indoors (crypt) or they take decay damage from cold. | Combat: practically zero visibility, ranged combat almost impossible (shots miss 90%). Zombies might use this to ambush as humans can’t see them. But pathing could be random due to white-out (units wander off lane?). Likely rare to have battles in a blizzard unless triggered. |
| **Blood Moon** | 8 hours (night event) | As in event, growth 2x at night, mutation 2x, etc. A special sky and everything is red. | Zombies +15% stats in battle at night under blood moon, humans maybe panic. Also 2x rewards from combat as noted. |

Managing weather: The player might get forecasts (maybe an NPC or a crafted device, like a weather vane, can predict tomorrow’s weather so you can plan planting or attacks accordingly). Weather makes the world more immersive and adds another layer to strategy (e.g., hold off a siege until a foggy night for best results).

### **Territory Control**

This feature touches on multiplayer guild warfare and might be a bit beyond core, but since it was in earlier design notes:

### **Zone Control Mechanic**

- The world map is divided into territories (perhaps each region or sub-region). When players conquer human settlements in a territory, they can claim that territory.
- If playing solo, you basically “own” it, yielding extra resources as mentioned.
- If in a guild or if multiple players can influence same world (this depends on design whether it’s single-player or partially shared world):
    - A territory could be contested. Guild A and Guild B might both want it for bonuses.
    - This could introduce PvP or competitive PvE (like whoever contributes more to defeating NPC patrols controls it).
- Owning a territory might grant:
    - **Resource Bonus:** e.g., +10% wood gathered in that region, or a daily package of materials from the locals.
    - **Strategic Advantage:** easier access to further regions (like if you hold the midlands, you can reach the capital easier).
    - **Prestige:** leaderboards or statuses showing which guild controls most territory.

For simplicity, if the game is largely single-player, territory control is essentially just content unlocking and bonus resources. If we allow an online component, it becomes a guild endgame (like clans of players could coordinate to hold parts of the map, perhaps facing AI uprisings or other clans).

### **Guild Prestige & Structures**

- Guilds (if any) could build special structures on controlled territories (like a gigantic idol that buffs all members’ zombies in battles within that territory).
- Also guild control might be required for some endgame events (like the Apocalypse mode might depend on how many territories players as whole have; if too few controlled, the apocalypse goes worse).

This is speculative as an expansion of the idea. It’s not central to the core game but adds a layer for those interested in community play.

### **Combat Abilities Combinations**

We’ve listed abilities individually, but some interesting emergent combos or designed synergies:

- **Bite + Infect:** If one zombie has a bite attack that applies an **Infected** status (for example, some zombies could turn killed enemies into zombie units), and another ability or situation allows an enemy to survive a bite long enough to turn, you could theoretically swell your ranks mid-battle. Perhaps a necromancer skill or legendary zombie could “convert” a slain human to fight for you temporarily. So the combo is: injure but don’t overkill enemies, let infection spread, and suddenly an enemy soldier becomes a zombie fighting for you.
- **Roar + Charge:** Suppose Brutes have a “Roar” ability that can buff or rally other zombies for a moment (increasing their speed). If a Brute roars and then charges, all Runners behind it also get a speed boost and can follow through the breach quickly – a devastating one-two punch to break enemy lines.
- **Toxic + Explosive:** If you have an **Explosive Zombie** (one that detonates on death) and others with toxic attacks, you can do a combo where the explosive zombie runs in, you ensure some enemies are poisoned (maybe by a Spitter or toxic cloud), then when it explodes, the explosion spreads the poison even more (like igniting a gas). Or vice versa: you drop toxic sludge via a zombie, then another ignites it causing a big area damage event.
- **Regeneration + Armor:** A zombie with both regeneration and armored skin is extremely hard to kill – the armor reduces incoming damage, and regeneration heals what does get through. This combo might be something players strive for on a tank unit to hold the line nearly indefinitely.
- **Stun + Flank:** Some zombies might have attacks that stun enemies (for example, a special mutation could be a thunderclap that stuns a group). Following that, fast zombies can flank around stunned heavy units to take out vulnerable backline. Essentially CC (crowd control) combos like in MOBA games – one zombie disables, another capitalizes.
- **Necromancer + Horde:** If the player gets involved via an ability (like an aura or a curse spell), combining it with zombie attacks is key. For example, Necromancer casts a fear curse on enemies (making them run), and simultaneously you send your fastest zombies to run them down from behind. Or necro casts a vulnerability hex (+50% damage taken by target) and then your heavy hitter lands a blow.
- **Teamwork Combos:** Perhaps certain zombies have synergy if deployed together:
    - If a Lich and a bunch of skeleton-type zombies are together, the Lich’s presence empowers skeletons (they could get a damage boost).
    - A “Swarm” combo: multiple weak zombies like Shamblers gain attack speed when adjacent to each other (encouraging pack tactics).
    - A “Pack Leader” mutation on one zombie could buff all nearby lesser zombies’ stats, so having one leader in a group of shamblers makes that group far more effective than those shamblers alone.

These combos would not be explicitly needed to beat the game, but discovering and using them can make higher difficulties more manageable and give players satisfying “aha!” moments when they coordinate abilities effectively.

They also add depth to combat for advanced players who are paying attention – even though it’s an auto-battler, your setup determines if such combos can happen.

---

*(At this point, the game design document has thoroughly covered all requested aspects: tutorial, free placement and layout design, building unlocking, growing and random mutation mechanics, and all major game systems. The design is meant to be comprehensive and detailed, giving a clear vision of “Zombie Farm” gameplay.)*