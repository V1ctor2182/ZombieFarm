/**
 * Zombie Factory
 *
 * Factory functions for creating test Zombie objects.
 * Per DOMAIN-FARM.md: Zombies have types, quality tiers, stats, and progression.
 * Per TESTING.md: Factories should match game config defaults.
 */

import type { Zombie, ZombieStats, ZombieEquipment } from '../../../types';
import { ZombieType, ZombieQuality, ZombieAIState } from '../../../types';
import { gameConfig } from '../../config/zombieFarmConfig';

/**
 * Generates a unique zombie ID for tests
 */
let zombieIdCounter = 1;
function generateZombieId(): string {
  return `test-zombie-${zombieIdCounter++}`;
}

/**
 * Creates default zombie stats for a given type and quality
 *
 * Per gameConfig: Base stats multiplied by quality multiplier
 */
function createZombieStats(
  type: ZombieType,
  quality: ZombieQuality = ZombieQuality.BRONZE
): ZombieStats {
  const baseStats = gameConfig.ZOMBIES[type].baseStats;
  const qualityMultiplier = gameConfig.QUALITY_MULTIPLIERS[quality];

  return {
    maxHp: Math.floor(baseStats.maxHp * qualityMultiplier),
    currentHp: Math.floor(baseStats.maxHp * qualityMultiplier),
    attack: Math.floor(baseStats.attack * qualityMultiplier),
    defense: Math.floor(baseStats.defense * qualityMultiplier),
    speed: baseStats.speed * qualityMultiplier,
    range: baseStats.range,
    attackCooldown: baseStats.attackCooldown,
    decayRate: baseStats.decayRate,
  };
}

/**
 * Creates a test Zombie with sensible defaults
 *
 * @param overrides - Partial Zombie to override defaults
 * @returns Complete Zombie object
 */
export function createTestZombie(overrides?: Partial<Zombie>): Zombie {
  const type = overrides?.type ?? ZombieType.SHAMBLER;
  const quality = overrides?.quality ?? ZombieQuality.BRONZE;

  const defaultZombie: Zombie = {
    id: generateZombieId(),
    type,
    quality,
    stats: createZombieStats(type, quality),
    level: 1,
    xp: 0,
    happiness: 75, // Default happy
    lastFed: Date.now(),
    lastPet: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago (ready to pet)
    aiState: ZombieAIState.IDLE,
    position: { x: 0, y: 0 },
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    abilities: gameConfig.ZOMBIES[type].abilities || [],
    createdAt: Date.now(),
    totalBattles: 0,
    totalKills: 0,
    totalDamageDealt: 0,
  };

  return {
    ...defaultZombie,
    ...overrides,
    stats: overrides?.stats ? { ...defaultZombie.stats, ...overrides.stats } : defaultZombie.stats,
    position:
      overrides?.position === null
        ? null
        : overrides?.position
        ? { ...defaultZombie.position, ...overrides.position }
        : defaultZombie.position,
    equipment: overrides?.equipment
      ? { ...defaultZombie.equipment, ...overrides.equipment }
      : defaultZombie.equipment,
  };
}

/**
 * Creates a zombie of specific type with quality
 *
 * Per DOMAIN-FARM.md: Quality affects stat multipliers
 */
export function createTestZombieWithQuality(type: ZombieType, quality: ZombieQuality): Zombie {
  return createTestZombie({
    type,
    quality,
    stats: createZombieStats(type, quality),
  });
}

/**
 * Creates a Shambler zombie (most basic)
 */
export function createShambler(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.SHAMBLER, quality);
}

/**
 * Creates a Runner zombie (fast, fragile)
 */
export function createRunner(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.RUNNER, quality);
}

/**
 * Creates a Brute zombie (tank)
 */
export function createBrute(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.BRUTE, quality);
}

/**
 * Creates a Spitter zombie (ranged, toxic)
 */
export function createSpitter(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.SPITTER, quality);
}

/**
 * Creates a Ghoul zombie (life steal)
 */
export function createGhoul(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.GHOUL, quality);
}

/**
 * Creates an Abomination zombie (massive HP)
 */
export function createAbomination(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.ABOMINATION, quality);
}

/**
 * Creates a Lich zombie (caster)
 */
export function createLich(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.LICH, quality);
}

/**
 * Creates a Bone Knight zombie (armored)
 */
export function createBoneKnight(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.BONE_KNIGHT, quality);
}

/**
 * Creates a Priest Zombie (holy-undead hybrid)
 */
export function createPriestZombie(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.PRIEST_ZOMBIE, quality);
}

/**
 * Creates an Explosive Zombie (bomb)
 */
export function createExplosiveZombie(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.EXPLOSIVE_ZOMBIE, quality);
}

/**
 * Creates a Necromancer Zombie (spellcaster)
 */
export function createNecromancerZombie(quality: ZombieQuality = ZombieQuality.BRONZE): Zombie {
  return createTestZombieWithQuality(ZombieType.NECROMANCER_ZOMBIE, quality);
}

/**
 * Creates a damaged zombie (low HP)
 *
 * Per DOMAIN-COMBAT.md: Zombies can take damage in battle
 */
export function createDamagedZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  const zombie = createTestZombie({ type });
  return {
    ...zombie,
    stats: {
      ...zombie.stats,
      currentHp: Math.floor(zombie.stats.maxHp * 0.3), // 30% HP
    },
  };
}

/**
 * Creates a nearly dead zombie (critical HP)
 */
export function createNearlyDeadZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  const zombie = createTestZombie({ type });
  return {
    ...zombie,
    stats: {
      ...zombie.stats,
      currentHp: 1, // 1 HP left
    },
  };
}

/**
 * Creates a high-level zombie
 */
export function createHighLevelZombie(
  type: ZombieType = ZombieType.SHAMBLER,
  level: number = 50
): Zombie {
  const zombie = createTestZombie({ type, level });

  // Apply level stat bonuses per gameConfig
  const statBonus = {
    maxHp: gameConfig.PROGRESSION.STATS_PER_LEVEL.hp * (level - 1),
    attack: gameConfig.PROGRESSION.STATS_PER_LEVEL.attack * (level - 1),
    defense: gameConfig.PROGRESSION.STATS_PER_LEVEL.defense * (level - 1),
    speed: zombie.stats.speed + gameConfig.PROGRESSION.STATS_PER_LEVEL.speed * (level - 1),
  };

  return {
    ...zombie,
    stats: {
      ...zombie.stats,
      maxHp: zombie.stats.maxHp + statBonus.maxHp,
      currentHp: zombie.stats.currentHp + statBonus.maxHp,
      attack: zombie.stats.attack + statBonus.attack,
      defense: zombie.stats.defense + statBonus.defense,
      speed: statBonus.speed,
    },
    totalBattles: level * 2, // Assume 2 battles per level
    totalKills: level * 5, // Assume 5 kills per level
  };
}

/**
 * Creates an unhappy zombie
 *
 * Per DOMAIN-FARM.md: Happiness affects zombie performance
 */
export function createUnhappyZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  return createTestZombie({
    type,
    happiness: 20, // Very unhappy
    lastFed: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days since fed
  });
}

/**
 * Creates a happy zombie
 */
export function createHappyZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  return createTestZombie({
    type,
    happiness: 95, // Very happy
    lastFed: Date.now() - 1000 * 60 * 60, // Fed 1 hour ago
    lastPet: Date.now() - 1000 * 60 * 30, // Pet 30 min ago
  });
}

/**
 * Creates a zombie with equipment
 */
export function createEquippedZombie(
  type: ZombieType = ZombieType.SHAMBLER,
  equipment: Partial<ZombieEquipment> = {}
): Zombie {
  return createTestZombie({
    type,
    equipment: {
      weapon: equipment.weapon || null,
      armor: equipment.armor || null,
      accessory: equipment.accessory || null,
    },
  });
}

/**
 * Creates a decayed zombie (needs feeding)
 *
 * Per DOMAIN-FARM.md: Zombies decay if not fed
 */
export function createDecayedZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  const zombie = createTestZombie({ type });
  const decayMultiplier = 0.6; // 60% of original stats (40% decay)

  return {
    ...zombie,
    stats: {
      ...zombie.stats,
      maxHp: Math.floor(zombie.stats.maxHp * decayMultiplier),
      currentHp: Math.floor(zombie.stats.currentHp * decayMultiplier),
      attack: Math.floor(zombie.stats.attack * decayMultiplier),
      defense: Math.floor(zombie.stats.defense * decayMultiplier),
    },
    happiness: 30, // Unhappy from decay
    lastFed: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days since fed
  };
}

/**
 * Creates a zombie in combat
 */
export function createCombatZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  return createTestZombie({
    type,
    aiState: ZombieAIState.ATTACKING,
  });
}

/**
 * Creates a veteran zombie (many battles)
 */
export function createVeteranZombie(type: ZombieType = ZombieType.SHAMBLER): Zombie {
  return createTestZombie({
    type,
    level: 25,
    xp: 30000,
    totalBattles: 50,
    totalKills: 250,
    totalDamageDealt: 50000,
  });
}

/**
 * Creates an array of zombies for squad testing
 */
export function createZombieSquad(count: number = 3): Zombie[] {
  const squad: Zombie[] = [];
  for (let i = 0; i < count; i++) {
    squad.push(createTestZombie());
  }
  return squad;
}

/**
 * Creates a mixed zombie squad (different types)
 */
export function createMixedZombieSquad(): Zombie[] {
  return [
    createBrute(), // Tank
    createRunner(), // DPS
    createRunner(), // DPS
    createSpitter(), // Ranged
    createGhoul(), // Support
  ];
}

/**
 * Creates an elite zombie squad (all high quality)
 */
export function createEliteZombieSquad(): Zombie[] {
  return [
    createBrute(ZombieQuality.GOLD),
    createLich(ZombieQuality.GOLD),
    createBoneKnight(ZombieQuality.SILVER),
    createAbomination(ZombieQuality.SILVER),
  ];
}
