/**
 * Combat Type Definitions
 *
 * Defines all combat-related types: battles, units, enemies, damage, and combat state.
 * Based on DOMAIN-COMBAT.md specifications.
 */

import type { ZombieId, EnemyId, BattleId, LocationId, Position } from './global';
import type { Zombie } from './farm';
import type { ResourceReward } from './resources';

/**
 * Combat State
 *
 * State of the current battle (null when no battle is active).
 */
export interface CombatState {
  /** Unique battle ID */
  readonly battleId: BattleId;

  /** Target location being raided */
  readonly locationId: LocationId;

  /** Current battle phase */
  readonly phase: BattlePhase;

  /** Player's zombie squad */
  readonly playerSquad: ReadonlyArray<CombatUnit>;

  /** Enemy units */
  readonly enemies: ReadonlyArray<Enemy>;

  /** Obstacles and fortifications */
  readonly obstacles: ReadonlyArray<Obstacle>;

  /** Current wave number */
  readonly currentWave: number;

  /** Total waves in this battle */
  readonly totalWaves: number;

  /** Battle duration in seconds */
  readonly battleDuration: number;

  /** Active status effects */
  readonly activeEffects: ReadonlyArray<ActiveStatusEffect>;

  /** Battle log entries */
  readonly battleLog: ReadonlyArray<BattleLogEntry>;

  /** Battle started at timestamp */
  readonly startedAt: number;

  /** Is retreat in progress? */
  readonly isRetreating: boolean;

  /** Retreat countdown (seconds) */
  readonly retreatCountdown: number;
}

/**
 * Battle Phase
 */
export enum BattlePhase {
  PREPARATION = 'preparation', // Squad selection, pre-battle
  ACTIVE = 'active', // Battle in progress
  VICTORY = 'victory', // Player won
  DEFEAT = 'defeat', // Player lost
  RETREAT = 'retreat', // Retreating
}

// ============================================================================
// UNITS (COMMON)
// ============================================================================

/**
 * Combat Unit
 *
 * Common interface for both zombie and enemy units in combat.
 */
export interface CombatUnit {
  /** Unique unit ID */
  readonly id: string;

  /** Unit type identifier */
  readonly type: string;

  /** Display name */
  readonly name: string;

  /** Current position on battlefield */
  readonly position: Position;

  /** Current stats */
  readonly stats: CombatStats;

  /** Current status effects */
  readonly statusEffects: ReadonlyArray<StatusEffect>;

  /** Current AI state */
  readonly aiState: UnitAIState;

  /** Current target ID (if engaging) */
  readonly targetId: string | null;

  /** Time of last attack */
  readonly lastAttackAt: number;

  /** Is this unit dead? */
  readonly isDead: boolean;
}

/**
 * Combat Stats
 *
 * Stats used during combat.
 */
export interface CombatStats {
  /** Current hit points */
  readonly hp: number;

  /** Maximum hit points */
  readonly maxHp: number;

  /** Attack power */
  readonly attack: number;

  /** Defense/armor */
  readonly defense: number;

  /** Movement speed (tiles/second) */
  readonly speed: number;

  /** Attack range (tiles) */
  readonly range: number;

  /** Attack cooldown (seconds) */
  readonly attackCooldown: number;

  /** Resistances by damage type */
  readonly resistances: Readonly<Partial<Record<DamageType, number>>>;
}

/**
 * Unit AI State
 */
export enum UnitAIState {
  IDLE = 'idle', // No action
  ADVANCING = 'advancing', // Moving forward
  ENGAGING = 'engaging', // In combat with target
  RETREATING = 'retreating', // Moving backward
  FLEEING = 'fleeing', // Running away (fear)
  STUNNED = 'stunned', // Cannot act
  DEAD = 'dead', // Defeated
}

// ============================================================================
// ENEMIES
// ============================================================================

/**
 * Enemy
 *
 * Human or other hostile unit.
 */
export interface Enemy {
  /** Unique enemy ID */
  readonly id: EnemyId;

  /** Enemy type */
  readonly type: EnemyType;

  /** Display name */
  readonly name: string;

  /** Current position */
  readonly position: Position;

  /** Combat stats */
  readonly stats: CombatStats;

  /** Status effects */
  readonly statusEffects: ReadonlyArray<StatusEffect>;

  /** AI behavior profile */
  readonly aiProfile: EnemyAIProfile;

  /** Current AI state */
  readonly aiState: UnitAIState;

  /** Current target ID */
  readonly targetId: string | null;

  /** Time of last attack */
  readonly lastAttackAt: number;

  /** Special abilities */
  readonly abilities: ReadonlyArray<EnemyAbility>;

  /** Is dead? */
  readonly isDead: boolean;
}

/**
 * Enemy Type
 */
export enum EnemyType {
  // Common
  PEASANT = 'peasant', // Weak, low armor, basic attack
  MILITIA = 'militia', // Basic soldier, sword/shield

  // Ranged
  ARCHER = 'archer', // Ranged physical damage
  CROSSBOWMAN = 'crossbowman', // Slower, higher damage ranged

  // Melee
  SOLDIER = 'soldier', // Standard melee fighter
  KNIGHT = 'knight', // Heavy armor, high defense
  BRUTE = 'brute', // High HP, slow, heavy damage

  // Magic
  MAGE = 'mage', // Fire/ice magic, AoE
  PRIEST = 'priest', // Holy damage, healing
  NECROMANCER = 'necromancer', // Dark magic, summons

  // Elite
  PALADIN = 'paladin', // Holy warrior, very dangerous to undead
  GENERAL = 'general', // Buffs allies, tactical
  BOSS = 'boss', // Unique boss unit
}

/**
 * Enemy AI Profile
 *
 * Defines targeting and behavior priorities.
 */
export interface EnemyAIProfile {
  /** Aggression level (0-1, higher = more aggressive) */
  readonly aggression: number;

  /** Target priority (what to attack first) */
  readonly targetPriority: TargetPriority;

  /** Preferred range (melee, ranged, support) */
  readonly preferredRange: number;

  /** Will retreat if low HP? */
  readonly canRetreat: boolean;

  /** Will use abilities? */
  readonly useAbilities: boolean;
}

/**
 * Target Priority
 */
export enum TargetPriority {
  CLOSEST = 'closest', // Attack nearest unit
  WEAKEST = 'weakest', // Attack lowest HP
  HIGHEST_THREAT = 'highestThreat', // Attack highest attack
  LOWEST_ARMOR = 'lowestArmor', // Attack least defended
  SUPPORT = 'support', // Attack support units (healers, buffers)
  RANGED = 'ranged', // Attack ranged units
}

/**
 * Enemy Ability
 */
export interface EnemyAbility {
  /** Ability ID */
  readonly id: string;

  /** Ability name */
  readonly name: string;

  /** Cooldown in seconds */
  readonly cooldown: number;

  /** Time of last use */
  readonly lastUsedAt: number | null;

  /** Ability effect */
  readonly effect: AbilityEffect;
}

/**
 * Ability Effect
 */
export interface AbilityEffect {
  /** Effect type */
  readonly type: AbilityEffectType;

  /** Damage (if applicable) */
  readonly damage?: number;

  /** Damage type (if applicable) */
  readonly damageType?: DamageType;

  /** Heal amount (if applicable) */
  readonly heal?: number;

  /** Status effect to apply (if applicable) */
  readonly statusEffect?: StatusEffect;

  /** Area of effect radius (if applicable) */
  readonly aoeRadius?: number;

  /** Target type */
  readonly targetType: AbilityTargetType;
}

/**
 * Ability Effect Type
 */
export enum AbilityEffectType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  SUMMON = 'summon',
  RESURRECT = 'resurrect',
}

/**
 * Ability Target Type
 */
export enum AbilityTargetType {
  SINGLE = 'single',
  AOE = 'aoe',
  SELF = 'self',
  ALLY = 'ally',
  ALL_ALLIES = 'allAllies',
  ALL_ENEMIES = 'allEnemies',
}

// ============================================================================
// OBSTACLES & FORTIFICATIONS
// ============================================================================

/**
 * Obstacle
 *
 * Static objects on the battlefield (walls, gates, traps).
 */
export interface Obstacle {
  /** Unique obstacle ID */
  readonly id: string;

  /** Obstacle type */
  readonly type: ObstacleType;

  /** Position on battlefield */
  readonly position: Position;

  /** Current HP (if destructible) */
  readonly hp: number;

  /** Max HP (if destructible) */
  readonly maxHp: number;

  /** Armor/defense */
  readonly defense: number;

  /** Is destructible? */
  readonly isDestructible: boolean;

  /** Is destroyed? */
  readonly isDestroyed: boolean;

  /** Trap data (if trap) */
  readonly trapData?: TrapData;
}

/**
 * Obstacle Type
 */
export enum ObstacleType {
  GATE = 'gate', // Must be destroyed to pass
  WALL = 'wall', // Blocks movement
  TOWER = 'tower', // Houses ranged enemies
  SPIKE_PIT = 'spikePit', // Trap
  FIRE_TRAP = 'fireTrap', // Trap
  BARRICADE = 'barricade', // Destructible obstacle
}

/**
 * Trap Data
 */
export interface TrapData {
  /** Damage dealt when triggered */
  readonly damage: number;

  /** Damage type */
  readonly damageType: DamageType;

  /** Has been triggered? */
  readonly triggered: boolean;

  /** Status effect applied (if any) */
  readonly statusEffect?: StatusEffect;
}

// ============================================================================
// DAMAGE & STATUS EFFECTS
// ============================================================================

/**
 * Damage Type
 *
 * Different damage types with unique interactions.
 */
export enum DamageType {
  PHYSICAL = 'physical', // Standard, reduced by armor
  TOXIC = 'toxic', // Bypasses armor, applies poison
  FIRE = 'fire', // AoE, applies burning
  DARK = 'dark', // Ignores armor, causes fear
  EXPLOSIVE = 'explosive', // AoE, damages all
  HOLY = 'holy', // 2x damage to undead, stun/weaken
}

/**
 * Status Effect
 */
export enum StatusEffect {
  POISONED = 'poisoned', // Continuous damage over time
  BURNING = 'burning', // DoT, can spread
  STUNNED = 'stunned', // Cannot move or attack
  FEAR = 'fear', // Flee from combat
  BLEEDING = 'bleeding', // Minor DoT
  WEAKENED = 'weakened', // Reduced attack
  SLOWED = 'slowed', // Reduced speed
  BUFFED = 'buffed', // Increased stats
}

/**
 * Active Status Effect
 *
 * Status effect currently applied to a unit.
 */
export interface ActiveStatusEffect {
  /** Effect type */
  readonly effect: StatusEffect;

  /** Unit ID affected */
  readonly unitId: string;

  /** Remaining duration (seconds) */
  readonly duration: number;

  /** Effect strength (damage/healing per tick, stat modifier, etc.) */
  readonly strength: number;

  /** When this effect was applied */
  readonly appliedAt: number;
}

// ============================================================================
// BATTLE RESULTS
// ============================================================================

/**
 * Battle Result
 *
 * Outcome of a battle.
 */
export interface BattleResult {
  /** Did player win? */
  readonly victory: boolean;

  /** Surviving zombie IDs */
  readonly survivors: ReadonlyArray<ZombieId>;

  /** Zombie IDs that died (permadeath) */
  readonly casualties: ReadonlyArray<ZombieId>;

  /** XP gained by survivors */
  readonly xpGained: Readonly<Record<ZombieId, number>>;

  /** Rewards earned */
  readonly rewards: ResourceReward;

  /** Special unlocks (blueprints, seeds, etc.) */
  readonly unlocks: ReadonlyArray<string>;

  /** Battle statistics */
  readonly stats: BattleStats;
}

/**
 * Battle Stats
 */
export interface BattleStats {
  /** Total damage dealt by zombies */
  readonly totalDamageDealt: number;

  /** Total damage taken by zombies */
  readonly totalDamageTaken: number;

  /** Total enemies killed */
  readonly enemiesKilled: number;

  /** Total obstacles destroyed */
  readonly obstaclesDestroyed: number;

  /** Battle duration in seconds */
  readonly duration: number;

  /** Was a flawless victory? (no casualties) */
  readonly flawless: boolean;
}

/**
 * Battle Log Entry
 *
 * A single event in the battle log.
 */
export interface BattleLogEntry {
  /** Timestamp of event */
  readonly timestamp: number;

  /** Event type */
  readonly type: BattleLogEventType;

  /** Event message */
  readonly message: string;

  /** Related unit IDs */
  readonly unitIds: ReadonlyArray<string>;

  /** Additional data */
  readonly data?: Record<string, unknown>;
}

/**
 * Battle Log Event Type
 */
export enum BattleLogEventType {
  BATTLE_START = 'battleStart',
  UNIT_SPAWNED = 'unitSpawned',
  UNIT_ATTACKED = 'unitAttacked',
  UNIT_DAMAGED = 'unitDamaged',
  UNIT_DIED = 'unitDied',
  ABILITY_USED = 'abilityUsed',
  STATUS_APPLIED = 'statusApplied',
  OBSTACLE_DESTROYED = 'obstacleDestroyed',
  WAVE_SPAWNED = 'waveSpawned',
  BATTLE_END = 'battleEnd',
}

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

/**
 * Damage Calculation
 *
 * Result of a damage calculation.
 */
export interface DamageCalculation {
  /** Raw damage before mitigation */
  readonly baseDamage: number;

  /** Final damage after all modifiers */
  readonly finalDamage: number;

  /** Damage type */
  readonly damageType: DamageType;

  /** Was this a critical hit? */
  readonly isCritical: boolean;

  /** Damage modifiers applied */
  readonly modifiers: DamageModifiers;
}

/**
 * Damage Modifiers
 */
export interface DamageModifiers {
  /** Armor reduction */
  readonly armorReduction: number;

  /** Type effectiveness multiplier */
  readonly typeMultiplier: number;

  /** Critical hit multiplier */
  readonly criticalMultiplier: number;

  /** Other modifiers */
  readonly other: number;
}
