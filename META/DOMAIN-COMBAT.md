---
title: "Combat Domain Rules"
last updated: 2025-11-12
author: Solo Dev
---

# Combat Domain Rules

This document outlines the rules and mechanics governing the **Combat** portion of Zombie Farm – specifically the castle siege raids the player sends their zombies on. The combat system is an auto-battler style engagement with minimal direct player control. These domain rules ensure the Combat AI agent implements battles consistent with the game design document.

## Battle Preparation and Deployment
**Initiating a Raid:** To start a combat, the player selects a human target on the world map (village, town, castle, etc.). Each location has a recommended difficulty and may require certain prerequisites (e.g., unlocked by defeating previous location). Starting a raid consumes some **Stamina** or simply begins when the player confirms.

**Squad Selection:** Before combat, the player chooses which zombies to send into battle (their **squad**). There is a limit to squad size based on progression:
- Early game battles might allow only **3 zombies** to be deployed, increasing as the Command Center is upgraded. Late-game raids could allow 10 or more zombies at once.
- The UI shows available zombies (active on farm, not in Crypt) and the player fills the deployment slots. They should consider zombie types and synergy (e.g., include some tanks like Brutes to protect fragile high-damage units).
- Deployment Order: The order in which zombies are placed in the slots often matters, as it determines their starting formation on the battlefield. By default, slot 1 (leftmost) might start at the front. The player can thereby put a Brute in slot 1 to lead the charge, with ranged or weaker units in later slots so they spawn slightly behind.
- Once confirmed, those zombies are committed. They effectively leave the farm for the duration of the battle (so they won’t defend the farm or be available for other tasks until the battle ends).

**Enemy Composition:** Each human location has a predefined set of enemy units and possibly defenses:
- **Enemy Types:** These include peasant militia, armed soldiers, archers, knights (heavily armored), mages/priests (with holy attacks), and sometimes special bosses. For example, a Village might have mostly peasants with a couple archers, while a Castle has many knights, archers on battlements, and a Paladin boss.
- **Enemy Stats:** Human enemies have stats like HP, Attack, Defense, etc. They are generally weaker individually than zombies but appear in greater numbers. Enemies with **Holy** abilities (priests, paladins) are particularly dangerous to zombies (see Damage Types below).
- **Fortifications:** Some battles include static defenses: walls, gates, towers or traps:
  - **Gates/Walls:** Obstacles that zombies must destroy to progress. They have high HP and armor, stalling the horde. Brute-type zombies do extra damage to structures, making them valuable to break through.
  - **Traps:** Pre-placed hazards such as spike pits or fire traps that trigger when a zombie reaches them. A trap might instantly kill one zombie or deal significant damage (bypassing armor). Zombies cannot directly attack traps; they trigger and then are expended.
  - **Towers:** Enemy archers or siege equipment may be on towers, dealing damage at range until zombies move into range or destroy the tower (if destructible).

**Beginning of Battle:** Once the battle starts:
- Zombies spawn on the left side of the 2D battlefield, typically in the order selected (frontliner first) and line up.
- Enemies spawn or are present on the right side. Some enemies might start farther back (e.g., archers behind footmen).
- If there are multiple waves, initially only the first wave is present. Subsequent waves spawn after a timer or when the previous wave is largely defeated (the domain rules for this could be location-specific; e.g., “after 30 seconds, reinforcements arrive” or “when only 2 enemies of wave 1 remain, spawn wave 2”).

## Real-Time Combat Mechanics
Once battle begins, it plays out in real time without active input (aside from possibly a rare ultimate ability trigger). The core mechanics:

**Movement and Formation:**
- Zombies continuously **advance to the right** (toward the enemy’s side). Enemies move to the left when they decide to engage (melee units will march out to meet the horde, ranged units may hang back at their position).
- Movement speed differs: e.g., Runners move fast, Brutes slowly. This can cause formation changes (fast zombies may surge ahead if not managed).
- By default, zombies will stay in a loose formation based on their deploy order, but terrain or obstacles can funnel them (e.g., a narrow bridge might force them single-file, affecting who fights first).
- If a zombie reaches the far right (where presumably a key structure or boss is) and no enemies remain, the battle ends in victory (breached the defense fully).

**Engagement & Targeting:**
- Each unit (zombie or human) has an **attack range**. Melee units have range ~1 (adjacent), meaning they engage only when face-to-face. Ranged units have a larger range and will stop advancing once a target is within that range.
- When an enemy comes within range, a zombie will stop advancing and **attack** that target. Likewise, enemies target the closest or highest threat zombie within range.
- **Target Priority (Zombies):** By default, zombies attack the nearest enemy in front of them. However, AI profiles make certain types behave differently:
  - **Brutes/Aggressive**: target the first enemy in front (or structures if present).
  - **Runners/Flankers**: attempt to bypass front-line enemies and go for vulnerable backline units (archers, mages). Implementation: they might run past a fighting enemy if there's an opening and head straight for an archer behind.
  - **Spitters/Ranged**: stop at max range and pick targets (possibly weakest or lowest HP first).
  - **Necromancer/Support Zombies**: target according to their support role (e.g., a Lich might focus on buffing allies or debuffing a strong enemy rather than raw damage).
- **Target Priority (Enemies):** Humans often prioritize closest undead, but some have special behavior:
  - Archers target the least armored or most vulnerable-looking zombie (e.g., go after Runners or ranged zombies first).
  - Priests might focus healing on allies or target the most “evil” looking zombie (maybe the one with highest attack, to eliminate big threats).
  - If the player’s Necromancer were present (usually not in these raids), enemies would prioritize them (like a hero unit).
- Once engaged in melee, units generally stick to that fight until one side is defeated or another higher threat interrupts (e.g., a zombie might break off if a holy unit is blasting it from afar causing major damage).

**Attack and Damage:**
- Combat is resolved in discrete time steps or intervals. Each unit has an **attack cooldown** (rate of attack). For example, a Shambler attacks once every 1.5 seconds, a Runner every 1.0 sec, a Brute every 2 sec with higher damage, etc.
- On an attack, the sequence is:
  1. Attack roll (in our simplified design, we assume attacks always hit; no RNG unless we add crits or dodge).
  2. **Damage Calculation:** Determine damage based on attacker’s Attack stat and damage type versus defender’s Defense or resistance:
     - Basic formula: `Damage = Attack - Defense` (not below a minimum of e.g. 1). If an attacker’s Attack is 50 and defender’s Defense (armor) is 20, then 30 damage dealt.
     - If the target has resistance to the damage type, modify accordingly (see Damage Types below).
     - Some attacks have randomness or extra effects (a chance to crit for double damage, etc., if designed).
  3. Subtract damage from defender’s HP.
  4. If HP drops to 0 or below, the defender dies. Remove that unit from battle. Units attacking it will acquire new targets.
- **Damage Types & Effects:** Different attack types interact uniquely:
  - **Physical Damage:** Standard damage from bites, claws, swords, etc.. Effective against unarmored foes, but reduced by armor. Physical hits can sometimes **knock back** small enemies slightly due to force.
  - **Toxic Damage:** Caused by acid spit or poison. Bypasses some armor (corrodes it) and often inflicts a **Poisoned** status. Poisoned units take continuous damage over time (DOT) for a duration, which is usually long but low DPS. Living enemies (humans) are very susceptible, while undead (if they exist as enemies) might be immune or take reduced toxic damage.
  - **Fire Damage:** From explosions or flame attacks. Often does **Area of Effect (AoE)** splash damage and sets targets **Burning**. Burning units take ongoing damage and fire can spread to adjacent units (e.g., one zombie on fire could ignite another if very close). Armor provides some protection but fire still hurts armored knights, and can destroy wooden structures quickly.
  - **Dark Damage (Psychic):** Used by occult units (like a Lich or certain curses). Ignores physical armor entirely (hits mind or soul). Extremely effective against humans with weak will (peasants), less so against trained knights or priests (who may have spiritual protection). Dark damage might cause **Fear** in human units – a status where a human might flee temporarily instead of fighting.
  - **Explosive Damage:** A subtype of physical/fire (like grenades or zombies that explode). This deals heavy AoE damage and can demolish obstacles. Explosions hurt all units in radius, including your zombies if they’re caught. Usually non-discriminatory.
  - **Holy Damage:** Used by enemies only (priests, paladins). Extremely potent against undead – often dealing double or more damage to zombies. Holy attacks can also **Stun** undead or apply **Weakening** debuffs (reducing their attack for a short time):contentReference[oaicite:123]{index=123}. Zombies generally have no direct resistance to holy damage, so avoiding or quickly eliminating holy attackers is key.
- **Status Effects:** As alluded:
  - **Poisoned:** Target takes continuous damage over time (e.g., -2% HP per second for 10 seconds). Stacks from multiple applications might either refresh duration or increase rate slightly, depending on design. Poison is shown via a green bubbling icon.
  - **Burning:** Target takes DOT (higher burst than poison, e.g., -5% HP per second for 5 seconds) and can spread if near others. A burning unit might also have reduced defense (busy patting flames). Indicated by a fire icon; can be quenched early by certain actions or just ends after duration.
  - **Stunned:** Target is unable to move or attack for a short duration (say 2 seconds):contentReference[oaicite:126]{index=126}. Indicated by stars or a shock icon. Caused by heavy blunt attacks, some traps, or holy flashes. Stun can be resisted by high-tier zombies occasionally.
  - **Fear:** A status mostly affecting human enemies (some may flee if things look bad). If we implement fear, a feared unit runs away from the fight for a brief period (or cowers), effectively removing them temporarily.
  - **Bleeding:** Not explicitly detailed in design but often paired with physical damage. A bleed could be a minor DOT like poison but shorter.
  - The Combat agent should handle applying these effects and their durations. Multiple statuses can stack (a zombie could be both poisoned and stunned at once, etc.).

**Unit Special Abilities:**
- Some units have one-off abilities:
  - E.g., a **Zombie Brute** might have a smash attack cooldown that deals AoE damage in melee.
  - A **Paladin** enemy might have a once-per-battle heal or shield for allies when his health drops low.
  - A **Necromancer Zombie** (if any) could potentially resurrect one fallen ally mid-battle (rare).
- Domain rules for these: they typically trigger automatically under conditions (no player input in auto-battle). The Combat agent will include logic for when to fire these. For instance, every 10 seconds a Mage enemy casts a fireball (ranged AoE).

**Victory Condition:**
- The battle is won when all enemies are defeated and any key structures (like a castle gate or boss) are destroyed. Practically, this means no active enemy units remain. If enemy reinforcements were scheduled but you already met victory conditions, those reinforcements might retreat or not appear.
- Some locations might have an alternate win condition, such as reaching a certain point on the map. But generally in sieges, it's eliminate all opposition.
- After victory, any surviving zombies will **loot** the area (see Rewards section). Surviving zombies carry over their remaining HP back to the farm (they do not automatically heal between battles except via farm mechanics or time).
- If a particular objective was present (like "destroy the catapult"), victory also requires that objective is done. But again, usually killing all enemies achieves that because zombies would naturally break obstacles to get to the last enemies.

**Defeat Condition:**
- The battle is lost if all deployed zombies are destroyed or if a condition like a time limit runs out (if the design had timed missions, though generally not mentioned).
- When defeat happens, any zombies that were destroyed are **permanently lost** (permadeath – they will not return to the farm). This consequence is what makes sending your horde to battle risky.
- If any zombies somehow remained alive but you choose to retreat manually, those survivors return (retreat is a voluntary loss to save troops).
- On defeat, no loot is gained. The location remains unconquered and the player may try again after rebuilding forces. There’s no additional penalty beyond lost units, though the game might narratively require the player to attempt easier targets if they fail repeatedly.

**Retreat:** 
- The player may have the option to retreat mid-battle (if things are going poorly). Domain rule: retreat can be initiated if at least one zombie is still alive. When triggered, the battle ends 10 seconds later (to prevent instant escape from a bad hit) – during which enemies might get a few last hits in.
- All zombies still alive at retreat end will escape and return to the farm (likely with injuries). Any zombies that died before or during the retreat countdown are lost.
- Retreat counts as a defeat (no rewards). To discourage abuse, we might impose a small Dark Coin cost or a cooldown on reattempting that location.
- This mechanic allows players to save part of their horde if a battle clearly cannot be won.

## Permanent Loss and Post-Battle
**Permadeath of Zombies:** As stated, any zombie whose HP reaches 0 in combat is gone for good. The Combat agent must mark those units as deceased so the Farm state can remove them. The player might get some consolation lore (e.g., “Zombie X fell in battle and its remains are lost”).

**Experience Gain:** Surviving zombies can gain **XP** from combat. Domain rules:
- Each zombie gains a base amount of XP for participating, plus bonus XP proportional to damage dealt or number of enemies killed (if we track that).
- For example, 50 XP for participating, +10 XP per kill, +1 XP per 100 damage dealt.
- Level-ups from XP should be processed after battle. A zombie that levels up gets stat increases (which will be reflected next time).
- This encourages taking lower-level zombies to battles to train them (at some risk).

**Rewards for Victory:** Winning a battle yields loot as designed:
- **Dark Coins:** The primary reward. Each location has a coin reward range. A small village might yield, say, 50–100 Dark Coins, a castle 500+. The reward can be fixed or partly random within a range, and possibly boosted by how efficiently you won (e.g., bonus for no casualties).
- **Resources:** Many battles provide resources relevant to that region:
  - E.g., victory at a Lumber Mill might yield a large batch of Rotten Wood.
  - A Mine might yield Iron Scraps or Coal.
  - A Cathedral (holy site) might drop **Holy Water** and scriptures (which interestingly you use to empower zombies in dark rituals).
- **New Zombie Seeds or Blueprints:** Often, conquering a location unlocks new content:
  - The first time you defeat a **Cathedral**, you might obtain a **Priest Zombie Seed** (allowing you to grow a zombie with holy powers).
  - Defeating a **Military Camp** could grant a blueprint for a new structure (like a training ground to improve zombie attack).
  - These special drops are typically guaranteed on first win, and perhaps not given on repeats.
- **Soul Essence:** Rarely, difficult battles or boss fights grant **Soul Essence**. This is a premium currency used for powerful upgrades. It’s not given every time; maybe each major boss or capital conquered yields 1-2 Soul Essence.
- The Combat agent will output a summary of loot (coins amount, resource items, any special items or unlock flags). The Farm logic will then add those to the player’s inventory/unlock list. (E.g., mark Priest Zombie as now available to plant).

**Post-Battle State:**
- Any zombies that survived return to the farm. Their HP remains whatever it was at battle end. Typically, they will heal back on the farm over time or can be healed via resources (e.g., a **Stitching Station** building could be used to heal injured zombies using resources).
- Zombies that died are removed. The player might get a log entry of fallen zombies. (Optionally, we could spawn a grave decoration on the farm as a memorial, but that’s cosmetic.)
- If the battle was part of a campaign (e.g., beating a certain castle unlocks a new region), the game should unlock that content now. The domain flag for the location is set to “conquered” – possibly enabling passive income or new shop items.
- There may be a **cooldown** for replaying or raiding the same location again if repeatable (to prevent farming it continuously). Domain rule: minor locations can be raided repeatedly but with diminishing returns or a cooldown of e.g. 1 day. Major story locations may only be conquered once (then marked cleared).
- **Farm Morale:** A victory could slightly raise happiness of all zombies on the farm (news of triumph boosts morale), whereas a defeat might drop happiness a bit (especially for zombies who saw allies perish). This is a subtle effect to give consequence beyond the lost units.

In essence, the combat domain rules ensure that battles in Zombie Farm are strategic, automated encounters where the player’s preparation in the farm phase pays off. The Combat AI controls the flow per these rules: zombies and enemies engage in real-time according to their AI profiles, damage and special effects are applied fairly, and the outcome (with permanent losses and valuable rewards) feeds back into the overall game loop.
x