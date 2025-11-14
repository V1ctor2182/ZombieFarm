/**
 * Battle Initialization Service
 *
 * Handles squad selection, validation, enemy wave generation,
 * position assignment, and battle state initialization.
 *
 * Per DOMAIN-COMBAT.md Battle Preparation specifications.
 */

import type { Zombie } from '../../../types/farm';
import type { Location, LocationEnemy } from '../../../types/world';
import type { CombatState, CombatUnit, Enemy, Obstacle } from '../../../types/combat';
import { BattlePhase, UnitAIState, EnemyType } from '../../../types/combat';
import type { BattleId, LocationId, Position } from '../../../types/global';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Formation types for positioning units
 */
export type FormationType = 'line' | 'staggered' | 'wedge';

/**
 * Squad validation result
 */
export interface SquadValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Battle requirements check result
 */
export interface BattleRequirementsResult {
  canStart: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Unit with position assigned
 */
export interface PositionedUnit<T> extends Omit<T, 'position'> {
  position: Position;
}

// ============================================================================
// SQUAD VALIDATION
// ============================================================================

/**
 * Validates squad composition and state
 *
 * @param zombies - Squad to validate
 * @param maxSquadSize - Maximum allowed squad size
 * @returns Validation result with errors and warnings
 */
export function validateSquad(zombies: Zombie[], maxSquadSize: number): SquadValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Size validation
  if (zombies.length === 0) {
    errors.push('Squad cannot be empty');
  }

  if (zombies.length > maxSquadSize) {
    errors.push(`Squad size exceeds maximum of ${maxSquadSize}`);
  }

  // Zombie state validation
  const hasDeadZombies = zombies.some((z) => z.stats.hp <= 0);
  if (hasDeadZombies) {
    errors.push('Squad contains dead zombies');
  }

  // Composition validation
  const hasTank = zombies.some((z) => isTankUnit(z));
  if (!hasTank && zombies.length > 0) {
    warnings.push('Squad has no tank units (high defense)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// ENEMY WAVE GENERATION
// ============================================================================

/**
 * Generates enemy wave from location data
 *
 * @param location - Location being raided
 * @param waveNumber - Which wave to generate (1-based)
 * @returns Array of enemy units for this wave
 */
export function generateEnemyWave(location: Location, waveNumber: number): Enemy[] {
  // Filter enemies for this specific wave
  const waveEnemies = location.enemies.filter((e) => e.wave === waveNumber);

  const enemies: Enemy[] = [];

  // Generate each enemy type
  for (const enemySpec of waveEnemies) {
    for (let i = 0; i < enemySpec.count; i++) {
      const enemy = createEnemy(enemySpec, i);
      enemies.push(enemy);
    }
  }

  return enemies;
}

/**
 * Creates a single enemy from specification
 */
function createEnemy(spec: LocationEnemy, index: number): Enemy {
  const baseStats = getEnemyBaseStats(spec.type);
  const levelMod = spec.levelModifier ?? 1.0;

  // Apply level modifier to stats
  const stats = {
    hp: Math.floor(baseStats.hp * levelMod),
    maxHp: Math.floor(baseStats.maxHp * levelMod),
    attack: Math.floor(baseStats.attack * levelMod),
    defense: Math.floor(baseStats.defense * levelMod),
    speed: baseStats.speed,
    range: baseStats.range,
    attackCooldown: baseStats.attackCooldown,
    resistances: baseStats.resistances,
  };

  const enemy: Enemy = {
    id: `enemy-${spec.type}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
    type: spec.type,
    name: getEnemyName(spec.type, spec.isBoss),
    position: { x: 0, y: 0 }, // Will be assigned later
    stats,
    statusEffects: [],
    aiProfile: getEnemyAIProfile(spec.type),
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    abilities: getEnemyAbilities(spec.type),
    isDead: false,
  };

  return enemy;
}

// ============================================================================
// POSITION ASSIGNMENT
// ============================================================================

/**
 * Assigns battlefield positions to units
 *
 * @param units - Units to position (zombies or enemies)
 * @param formation - Formation type to use
 * @param side - Which side of battlefield ('left' for zombies, 'right' for enemies)
 * @returns Units with positions assigned
 */
export function assignPositions<T extends { position?: Position }>(
  units: T[],
  formation: FormationType,
  side: 'left' | 'right'
): PositionedUnit<T>[] {
  const BATTLEFIELD_WIDTH = 1920;
  const BATTLEFIELD_HEIGHT = 1080;
  const UNIT_SPACING = 80;

  // Base X position for each side
  const baseX = side === 'left' ? 100 : BATTLEFIELD_WIDTH - 100;

  // Center Y for formation
  const centerY = BATTLEFIELD_HEIGHT / 2;

  const positioned = units.map((unit, index) => {
    let position: Position;

    switch (formation) {
      case 'line': {
        // Vertical line formation
        const offsetY = (index - units.length / 2 + 0.5) * UNIT_SPACING;
        position = {
          x: baseX,
          y: centerY + offsetY,
        };
        break;
      }

      case 'staggered': {
        // Alternating X positions, vertical spread
        const offsetY = (index - units.length / 2 + 0.5) * UNIT_SPACING;
        const offsetX = (index % 2) * 50 * (side === 'left' ? 1 : -1);
        position = {
          x: baseX + offsetX,
          y: centerY + offsetY,
        };
        break;
      }

      case 'wedge': {
        // First unit at point, others spread back
        const row = index;
        const offsetX = row * 40 * (side === 'left' ? -1 : 1);
        const offsetY = (row - units.length / 2 + 0.5) * UNIT_SPACING * 0.5;
        position = {
          x: baseX + offsetX,
          y: centerY + offsetY,
        };
        break;
      }

      default:
        position = { x: baseX, y: centerY };
    }

    // Clamp to battlefield bounds
    position.y = Math.max(50, Math.min(BATTLEFIELD_HEIGHT - 50, position.y));

    return {
      ...unit,
      position,
    } as PositionedUnit<T>;
  });

  return positioned;
}

// ============================================================================
// BATTLE INITIALIZATION
// ============================================================================

/**
 * Initializes a complete battle state
 *
 * @param squad - Player's zombie squad
 * @param location - Location being raided
 * @param formation - Formation type (default: 'line')
 * @returns Complete initialized battle state
 */
export function initializeBattle(
  squad: Zombie[],
  location: Location,
  formation: FormationType = 'line'
): CombatState {
  // Convert zombies to combat units
  const combatZombies = squad.map(zombieToCombatUnit);

  // Position zombies on left side
  const positionedZombies = assignPositions(combatZombies, formation, 'left');

  // Generate and position first wave enemies
  const firstWaveEnemies = generateEnemyWave(location, 1);
  const positionedEnemies = assignPositions(firstWaveEnemies, 'line', 'right');

  // Create obstacles from fortifications
  const obstacles = location.fortifications.map(createObstacle);

  // Initialize battle state
  const battleState: CombatState = {
    battleId: `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    locationId: location.id,
    phase: BattlePhase.PREPARATION,
    playerSquad: positionedZombies,
    enemies: positionedEnemies,
    obstacles,
    currentWave: 1,
    totalWaves: location.waves,
    battleDuration: 0,
    activeEffects: [],
    battleLog: [],
    startedAt: Date.now(),
    isRetreating: false,
    retreatCountdown: 0,
  };

  return battleState;
}

// ============================================================================
// PRE-BATTLE VALIDATION
// ============================================================================

/**
 * Checks if battle can start
 *
 * Validates:
 * - Squad requirements
 * - Location availability
 * - Prerequisites met
 *
 * @param squad - Player's zombie squad
 * @param location - Target location
 * @param maxSquadSize - Maximum squad size
 * @returns Battle requirements check result
 */
export function checkBattleRequirements(
  squad: Zombie[],
  location: Location,
  maxSquadSize: number
): BattleRequirementsResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate squad
  const squadValidation = validateSquad(squad, maxSquadSize);
  errors.push(...squadValidation.errors);

  // Calculate average level first to determine if we should show composition warnings
  const avgLevel = calculateAverageLevel(squad);
  const levelSufficient = avgLevel >= location.recommendedLevel;

  // Only include tank warning if squad level is insufficient
  if (!levelSufficient) {
    warnings.push(...squadValidation.warnings);
  }

  // Check location unlock status
  if (!location.isUnlocked) {
    errors.push('Location is not unlocked');
  }

  // Check cooldown
  if (location.nextRaidAvailable !== null && location.nextRaidAvailable > Date.now()) {
    const hoursRemaining = Math.ceil((location.nextRaidAvailable - Date.now()) / (1000 * 60 * 60));
    errors.push(`Location is on cooldown (${hoursRemaining}h remaining)`);
  }

  // Warn about difficulty
  if (location.difficulty >= 7 || avgLevel < location.recommendedLevel - 2) {
    warnings.push(`High difficulty location (${location.difficulty}/10) or squad under-leveled`);
  }

  // Warn about low HP zombies
  const lowHpZombies = squad.filter((z) => z.stats.hp < z.stats.maxHp * 0.3);
  if (lowHpZombies.length > 0) {
    warnings.push(`${lowHpZombies.length} zombie(s) have low HP (below 30%)`);
  }

  // Warn if squad level is significantly below recommended
  if (avgLevel < location.recommendedLevel) {
    warnings.push(
      `Squad average level (${Math.floor(avgLevel)}) is below recommended (${
        location.recommendedLevel
      })`
    );
  }

  return {
    canStart: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts a Zombie to a CombatUnit
 */
function zombieToCombatUnit(zombie: Zombie): CombatUnit {
  return {
    id: zombie.id,
    type: zombie.type,
    name: zombie.name,
    position: zombie.position,
    stats: {
      hp: zombie.stats.hp,
      maxHp: zombie.stats.maxHp,
      attack: zombie.stats.attack,
      defense: zombie.stats.defense,
      speed: zombie.stats.speed,
      range: 1, // Default melee range
      attackCooldown: 1.5, // Default cooldown
      resistances: {},
    },
    statusEffects: [],
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    isDead: false,
  };
}

/**
 * Creates obstacle from fortification ID
 */
function createObstacle(fortificationId: string): Obstacle {
  // Basic obstacle creation - detailed implementation in Phase 10
  return {
    id: `obstacle-${fortificationId}-${Date.now()}`,
    type: fortificationId,
    name: fortificationId.charAt(0).toUpperCase() + fortificationId.slice(1),
    position: { x: 960, y: 540 }, // Center of battlefield
    hp: 200,
    maxHp: 200,
    defense: 50,
    isDestroyed: false,
  };
}

/**
 * Calculates squad average level
 */
function calculateAverageLevel(zombies: Zombie[]): number {
  if (zombies.length === 0) return 0;
  const totalLevel = zombies.reduce((sum, z) => sum + z.level, 0);
  return totalLevel / zombies.length;
}

/**
 * Checks if zombie has high defense (tank)
 */
function isTankUnit(zombie: Zombie): boolean {
  // Tank units are either high defense OR tank types (Brute, Bone Knight)
  const tankTypes = ['brute', 'boneKnight'];
  return zombie.stats.defense >= 20 || tankTypes.includes(zombie.type as string);
}

/**
 * Gets base stats for enemy type
 * Per DOMAIN-COMBAT.md specifications
 */
function getEnemyBaseStats(type: EnemyType) {
  const baseStats = {
    [EnemyType.PEASANT]: {
      hp: 50,
      maxHp: 50,
      attack: 10,
      defense: 5,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    [EnemyType.MILITIA]: {
      hp: 80,
      maxHp: 80,
      attack: 15,
      defense: 10,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    [EnemyType.ARCHER]: {
      hp: 40,
      maxHp: 40,
      attack: 15,
      defense: 3,
      speed: 1.0,
      range: 5,
      attackCooldown: 2.0,
      resistances: {},
    },
    [EnemyType.CROSSBOWMAN]: {
      hp: 45,
      maxHp: 45,
      attack: 25,
      defense: 5,
      speed: 0.9,
      range: 6,
      attackCooldown: 3.0,
      resistances: {},
    },
    [EnemyType.SOLDIER]: {
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 15,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    [EnemyType.KNIGHT]: {
      hp: 150,
      maxHp: 150,
      attack: 25,
      defense: 30,
      speed: 0.8,
      range: 1,
      attackCooldown: 2.0,
      resistances: {},
    },
    [EnemyType.BRUTE]: {
      hp: 200,
      maxHp: 200,
      attack: 35,
      defense: 20,
      speed: 0.7,
      range: 1,
      attackCooldown: 2.5,
      resistances: {},
    },
    [EnemyType.MAGE]: {
      hp: 60,
      maxHp: 60,
      attack: 30,
      defense: 5,
      speed: 1.0,
      range: 6,
      attackCooldown: 3.0,
      resistances: {},
    },
    [EnemyType.PRIEST]: {
      hp: 70,
      maxHp: 70,
      attack: 20,
      defense: 10,
      speed: 1.0,
      range: 5,
      attackCooldown: 2.5,
      resistances: {},
    },
    [EnemyType.NECROMANCER]: {
      hp: 80,
      maxHp: 80,
      attack: 25,
      defense: 10,
      speed: 1.0,
      range: 6,
      attackCooldown: 3.0,
      resistances: {},
    },
    [EnemyType.PALADIN]: {
      hp: 180,
      maxHp: 180,
      attack: 35,
      defense: 35,
      speed: 0.9,
      range: 1,
      attackCooldown: 2.0,
      resistances: {},
    },
    [EnemyType.GENERAL]: {
      hp: 120,
      maxHp: 120,
      attack: 25,
      defense: 20,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.8,
      resistances: {},
    },
    [EnemyType.BOSS]: {
      hp: 500,
      maxHp: 500,
      attack: 50,
      defense: 40,
      speed: 0.8,
      range: 2,
      attackCooldown: 2.5,
      resistances: {},
    },
  };

  return baseStats[type];
}

/**
 * Gets enemy display name
 */
function getEnemyName(type: EnemyType, isBoss?: boolean): string {
  const names = {
    [EnemyType.PEASANT]: 'Peasant',
    [EnemyType.MILITIA]: 'Militia',
    [EnemyType.ARCHER]: 'Archer',
    [EnemyType.CROSSBOWMAN]: 'Crossbowman',
    [EnemyType.SOLDIER]: 'Soldier',
    [EnemyType.KNIGHT]: 'Knight',
    [EnemyType.BRUTE]: 'Brute',
    [EnemyType.MAGE]: 'Mage',
    [EnemyType.PRIEST]: 'Priest',
    [EnemyType.NECROMANCER]: 'Necromancer',
    [EnemyType.PALADIN]: 'Paladin',
    [EnemyType.GENERAL]: 'General',
    [EnemyType.BOSS]: 'Boss',
  };

  const baseName = names[type];
  return isBoss ? `${baseName} (Boss)` : baseName;
}

/**
 * Gets AI profile for enemy type
 */
function getEnemyAIProfile(type: EnemyType) {
  const profiles = {
    [EnemyType.PEASANT]: {
      aggression: 0.3,
      targetPriority: 'closest' as any,
      preferredRange: 1,
      canRetreat: true,
      useAbilities: false,
    },
    [EnemyType.MILITIA]: {
      aggression: 0.5,
      targetPriority: 'closest' as any,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: false,
    },
    [EnemyType.ARCHER]: {
      aggression: 0.7,
      targetPriority: 'lowestArmor' as any,
      preferredRange: 5,
      canRetreat: true,
      useAbilities: false,
    },
    [EnemyType.CROSSBOWMAN]: {
      aggression: 0.6,
      targetPriority: 'lowestArmor' as any,
      preferredRange: 6,
      canRetreat: true,
      useAbilities: false,
    },
    [EnemyType.SOLDIER]: {
      aggression: 0.6,
      targetPriority: 'closest' as any,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: false,
    },
    [EnemyType.KNIGHT]: {
      aggression: 0.5,
      targetPriority: 'highestThreat' as any,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: false,
    },
    [EnemyType.BRUTE]: {
      aggression: 0.8,
      targetPriority: 'closest' as any,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: true,
    },
    [EnemyType.MAGE]: {
      aggression: 0.7,
      targetPriority: 'grouped' as any,
      preferredRange: 6,
      canRetreat: true,
      useAbilities: true,
    },
    [EnemyType.PRIEST]: {
      aggression: 0.4,
      targetPriority: 'support' as any,
      preferredRange: 5,
      canRetreat: true,
      useAbilities: true,
    },
    [EnemyType.NECROMANCER]: {
      aggression: 0.5,
      targetPriority: 'support' as any,
      preferredRange: 6,
      canRetreat: true,
      useAbilities: true,
    },
    [EnemyType.PALADIN]: {
      aggression: 0.7,
      targetPriority: 'undead' as any,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: true,
    },
    [EnemyType.GENERAL]: {
      aggression: 0.6,
      targetPriority: 'support' as any,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: true,
    },
    [EnemyType.BOSS]: {
      aggression: 0.8,
      targetPriority: 'highestThreat' as any,
      preferredRange: 2,
      canRetreat: false,
      useAbilities: true,
    },
  };

  return profiles[type];
}

/**
 * Gets abilities for enemy type
 */
function getEnemyAbilities(type: EnemyType) {
  // Most enemies don't have special abilities in MVP
  // Only mages, priests, paladins, and bosses have abilities
  const hasAbilities = [
    EnemyType.MAGE,
    EnemyType.PRIEST,
    EnemyType.PALADIN,
    EnemyType.BOSS,
    EnemyType.NECROMANCER,
    EnemyType.GENERAL,
  ];

  // Return placeholder ability for units that should have them
  if (hasAbilities.includes(type)) {
    return [
      {
        id: `${type}-ability-1`,
        name: `${type} Special`,
        cooldown: 10,
        range: 5,
        damageType: 'physical' as any,
        targetType: 'single' as any,
      } as any,
    ];
  }

  return [];
  // TODO: Implement actual abilities in Phase 6
}
