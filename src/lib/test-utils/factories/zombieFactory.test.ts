/**
 * Zombie Factory Tests
 *
 * Comprehensive tests for zombieFactory functions.
 * Per DOMAIN-FARM.md and DOMAIN-COMBAT.md specifications.
 */

import {
  createTestZombie,
  createTestZombieWithQuality,
  createShambler,
  createRunner,
  createBrute,
  createSpitter,
  createGhoul,
  createAbomination,
  createLich,
  createBoneKnight,
  createPriestZombie,
  createExplosiveZombie,
  createNecromancerZombie,
  createDamagedZombie,
  createNearlyDeadZombie,
  createHighLevelZombie,
  createUnhappyZombie,
  createHappyZombie,
  createEquippedZombie,
  createDecayedZombie,
  createCombatZombie,
  createVeteranZombie,
  createZombieSquad,
  createMixedZombieSquad,
  createEliteZombieSquad,
} from './zombieFactory';
import { ZombieType, ZombieQuality, ZombieAIState } from '../../../types';
import { gameConfig } from '../../config/zombieFarmConfig';

describe('zombieFactory', () => {
  describe('createTestZombie', () => {
    it('creates a valid Zombie with defaults', () => {
      const zombie = createTestZombie();

      expect(zombie).toBeDefined();
      expect(zombie.id).toMatch(/^test-zombie-\d+$/);
      expect(zombie.type).toBe(ZombieType.SHAMBLER);
      expect(zombie.quality).toBe(ZombieQuality.BRONZE);
    });

    it('creates Zombie with default stats', () => {
      const zombie = createTestZombie();

      expect(zombie.stats).toBeDefined();
      expect(zombie.stats.maxHp).toBeGreaterThan(0);
      expect(zombie.stats.currentHp).toBe(zombie.stats.maxHp);
      expect(zombie.stats.attack).toBeGreaterThan(0);
      expect(zombie.stats.defense).toBeGreaterThan(0);
    });

    it('creates Zombie at level 1', () => {
      const zombie = createTestZombie();

      expect(zombie.level).toBe(1);
      expect(zombie.xp).toBe(0);
    });

    it('creates Zombie with default happiness', () => {
      const zombie = createTestZombie();

      expect(zombie.happiness).toBe(75);
    });

    it('creates Zombie in IDLE AI state', () => {
      const zombie = createTestZombie();

      expect(zombie.aiState).toBe(ZombieAIState.IDLE);
    });

    it('creates Zombie with zero battle stats', () => {
      const zombie = createTestZombie();

      expect(zombie.totalBattles).toBe(0);
      expect(zombie.totalKills).toBe(0);
      expect(zombie.totalDamageDealt).toBe(0);
    });

    it('creates Zombie with default position', () => {
      const zombie = createTestZombie();

      expect(zombie.position).toEqual({ x: 0, y: 0 });
    });

    it('creates Zombie with null equipment', () => {
      const zombie = createTestZombie();

      expect(zombie.equipment.weapon).toBeNull();
      expect(zombie.equipment.armor).toBeNull();
      expect(zombie.equipment.accessory).toBeNull();
    });

    it('creates Zombie with type-specific abilities', () => {
      const brute = createTestZombie({ type: ZombieType.BRUTE });

      expect(brute.abilities).toEqual(['Structure Breaker', 'AoE Smash']);
    });

    it('allows overriding type', () => {
      const zombie = createTestZombie({ type: ZombieType.RUNNER });

      expect(zombie.type).toBe(ZombieType.RUNNER);
    });

    it('allows overriding quality', () => {
      const zombie = createTestZombie({ quality: ZombieQuality.GOLD });

      expect(zombie.quality).toBe(ZombieQuality.GOLD);
    });

    it('allows overriding level', () => {
      const zombie = createTestZombie({ level: 10 });

      expect(zombie.level).toBe(10);
    });

    it('allows overriding happiness', () => {
      const zombie = createTestZombie({ happiness: 50 });

      expect(zombie.happiness).toBe(50);
    });

    it('allows overriding aiState', () => {
      const zombie = createTestZombie({ aiState: ZombieAIState.ATTACKING });

      expect(zombie.aiState).toBe(ZombieAIState.ATTACKING);
    });

    it('generates unique IDs for each zombie', () => {
      const zombie1 = createTestZombie();
      const zombie2 = createTestZombie();

      expect(zombie1.id).not.toBe(zombie2.id);
    });
  });

  describe('createTestZombieWithQuality', () => {
    it('creates zombie with Bronze quality', () => {
      const zombie = createTestZombieWithQuality(ZombieType.SHAMBLER, ZombieQuality.BRONZE);

      expect(zombie.quality).toBe(ZombieQuality.BRONZE);
      expect(zombie.stats.maxHp).toBe(gameConfig.ZOMBIES[ZombieType.SHAMBLER].baseStats.maxHp);
    });

    it('creates zombie with Silver quality (1.25x multiplier)', () => {
      const zombie = createTestZombieWithQuality(ZombieType.SHAMBLER, ZombieQuality.SILVER);

      expect(zombie.quality).toBe(ZombieQuality.SILVER);
      const expectedHp = Math.floor(gameConfig.ZOMBIES[ZombieType.SHAMBLER].baseStats.maxHp * 1.25);
      expect(zombie.stats.maxHp).toBe(expectedHp);
    });

    it('creates zombie with Gold quality (1.5x multiplier)', () => {
      const zombie = createTestZombieWithQuality(ZombieType.SHAMBLER, ZombieQuality.GOLD);

      expect(zombie.quality).toBe(ZombieQuality.GOLD);
      const expectedHp = Math.floor(gameConfig.ZOMBIES[ZombieType.SHAMBLER].baseStats.maxHp * 1.5);
      expect(zombie.stats.maxHp).toBe(expectedHp);
    });

    it('creates zombie with Diamond quality (2.0x multiplier)', () => {
      const zombie = createTestZombieWithQuality(ZombieType.SHAMBLER, ZombieQuality.DIAMOND);

      expect(zombie.quality).toBe(ZombieQuality.DIAMOND);
      const expectedHp = Math.floor(gameConfig.ZOMBIES[ZombieType.SHAMBLER].baseStats.maxHp * 2.0);
      expect(zombie.stats.maxHp).toBe(expectedHp);
    });
  });

  describe('Type-Specific Factories', () => {
    it('createShambler creates Shambler type', () => {
      const zombie = createShambler();

      expect(zombie.type).toBe(ZombieType.SHAMBLER);
    });

    it('createRunner creates Runner type', () => {
      const zombie = createRunner();

      expect(zombie.type).toBe(ZombieType.RUNNER);
      expect(zombie.stats.speed).toBeGreaterThan(2); // Runners are fast
    });

    it('createBrute creates Brute type', () => {
      const zombie = createBrute();

      expect(zombie.type).toBe(ZombieType.BRUTE);
      expect(zombie.stats.maxHp).toBeGreaterThan(200); // Brutes have high HP
    });

    it('createSpitter creates Spitter type', () => {
      const zombie = createSpitter();

      expect(zombie.type).toBe(ZombieType.SPITTER);
      expect(zombie.stats.range).toBeGreaterThan(1); // Spitters are ranged
    });

    it('createGhoul creates Ghoul type', () => {
      const zombie = createGhoul();

      expect(zombie.type).toBe(ZombieType.GHOUL);
      expect(zombie.abilities).toContain('Life Steal');
    });

    it('createAbomination creates Abomination type', () => {
      const zombie = createAbomination();

      expect(zombie.type).toBe(ZombieType.ABOMINATION);
      expect(zombie.stats.maxHp).toBeGreaterThanOrEqual(500); // Massive HP
    });

    it('createLich creates Lich type', () => {
      const zombie = createLich();

      expect(zombie.type).toBe(ZombieType.LICH);
      expect(zombie.stats.range).toBeGreaterThan(5); // Long range caster
    });

    it('createBoneKnight creates BoneKnight type', () => {
      const zombie = createBoneKnight();

      expect(zombie.type).toBe(ZombieType.BONE_KNIGHT);
      expect(zombie.stats.defense).toBeGreaterThan(30); // Heavily armored
    });

    it('createPriestZombie creates PriestZombie type', () => {
      const zombie = createPriestZombie();

      expect(zombie.type).toBe(ZombieType.PRIEST_ZOMBIE);
      expect(zombie.abilities).toContain('Heal Undead');
    });

    it('createExplosiveZombie creates ExplosiveZombie type', () => {
      const zombie = createExplosiveZombie();

      expect(zombie.type).toBe(ZombieType.EXPLOSIVE_ZOMBIE);
      expect(zombie.abilities).toContain('Death Explosion');
    });

    it('createNecromancerZombie creates NecromancerZombie type', () => {
      const zombie = createNecromancerZombie();

      expect(zombie.type).toBe(ZombieType.NECROMANCER_ZOMBIE);
      expect(zombie.abilities).toContain('Resurrect Ally');
    });

    it('type factories accept quality parameter', () => {
      const zombie = createRunner(ZombieQuality.GOLD);

      expect(zombie.type).toBe(ZombieType.RUNNER);
      expect(zombie.quality).toBe(ZombieQuality.GOLD);
    });
  });

  describe('createDamagedZombie', () => {
    it('creates zombie with 30% HP', () => {
      const zombie = createDamagedZombie();

      expect(zombie.stats.currentHp).toBe(Math.floor(zombie.stats.maxHp * 0.3));
    });

    it('preserves maxHp', () => {
      const zombie = createDamagedZombie();

      expect(zombie.stats.maxHp).toBeGreaterThan(zombie.stats.currentHp);
    });

    it('accepts type parameter', () => {
      const zombie = createDamagedZombie(ZombieType.BRUTE);

      expect(zombie.type).toBe(ZombieType.BRUTE);
    });
  });

  describe('createNearlyDeadZombie', () => {
    it('creates zombie with 1 HP', () => {
      const zombie = createNearlyDeadZombie();

      expect(zombie.stats.currentHp).toBe(1);
    });

    it('has full maxHp', () => {
      const zombie = createNearlyDeadZombie();

      expect(zombie.stats.maxHp).toBeGreaterThan(50);
    });
  });

  describe('createHighLevelZombie', () => {
    it('creates zombie at specified level', () => {
      const zombie = createHighLevelZombie(ZombieType.SHAMBLER, 30);

      expect(zombie.level).toBe(30);
    });

    it('applies stat bonuses for levels', () => {
      const baseZombie = createTestZombie({ type: ZombieType.SHAMBLER });
      const highLevelZombie = createHighLevelZombie(ZombieType.SHAMBLER, 20);

      expect(highLevelZombie.stats.maxHp).toBeGreaterThan(baseZombie.stats.maxHp);
      expect(highLevelZombie.stats.attack).toBeGreaterThan(baseZombie.stats.attack);
    });

    it('has battle experience for level', () => {
      const zombie = createHighLevelZombie(ZombieType.SHAMBLER, 25);

      expect(zombie.totalBattles).toBe(50); // 2 per level
      expect(zombie.totalKills).toBe(125); // 5 per level
    });

    it('defaults to level 50', () => {
      const zombie = createHighLevelZombie(ZombieType.SHAMBLER);

      expect(zombie.level).toBe(50);
    });
  });

  describe('createUnhappyZombie', () => {
    it('creates zombie with low happiness', () => {
      const zombie = createUnhappyZombie();

      expect(zombie.happiness).toBe(20);
    });

    it('has old lastFed timestamp', () => {
      const zombie = createUnhappyZombie();
      const daysSinceFed = (Date.now() - zombie.lastFed) / (1000 * 60 * 60 * 24);

      expect(daysSinceFed).toBeGreaterThan(4);
    });
  });

  describe('createHappyZombie', () => {
    it('creates zombie with high happiness', () => {
      const zombie = createHappyZombie();

      expect(zombie.happiness).toBe(95);
    });

    it('has recent lastFed timestamp', () => {
      const zombie = createHappyZombie();
      const hoursSinceFed = (Date.now() - zombie.lastFed) / (1000 * 60 * 60);

      expect(hoursSinceFed).toBeLessThan(2);
    });

    it('has recent lastPet timestamp', () => {
      const zombie = createHappyZombie();
      const minutesSincePet = (Date.now() - zombie.lastPet) / (1000 * 60);

      expect(minutesSincePet).toBeLessThan(60);
    });
  });

  describe('createEquippedZombie', () => {
    it('creates zombie with equipment', () => {
      const zombie = createEquippedZombie(ZombieType.SHAMBLER, {
        weapon: 'rusty_sword' as any,
        armor: 'leather_armor' as any,
      });

      expect(zombie.equipment.weapon).toBe('rusty_sword');
      expect(zombie.equipment.armor).toBe('leather_armor');
    });

    it('preserves null equipment for unspecified slots', () => {
      const zombie = createEquippedZombie(ZombieType.SHAMBLER, {
        weapon: 'rusty_sword' as any,
      });

      expect(zombie.equipment.weapon).toBe('rusty_sword');
      expect(zombie.equipment.armor).toBeNull();
      expect(zombie.equipment.accessory).toBeNull();
    });
  });

  describe('createDecayedZombie', () => {
    it('creates zombie with decayed stats', () => {
      const baseZombie = createTestZombie({ type: ZombieType.SHAMBLER });
      const decayedZombie = createDecayedZombie(ZombieType.SHAMBLER);

      expect(decayedZombie.stats.maxHp).toBeLessThan(baseZombie.stats.maxHp);
      expect(decayedZombie.stats.attack).toBeLessThan(baseZombie.stats.attack);
    });

    it('has low happiness from neglect', () => {
      const zombie = createDecayedZombie();

      expect(zombie.happiness).toBe(30);
    });

    it('has very old lastFed timestamp', () => {
      const zombie = createDecayedZombie();
      const daysSinceFed = (Date.now() - zombie.lastFed) / (1000 * 60 * 60 * 24);

      expect(daysSinceFed).toBeGreaterThan(9);
    });
  });

  describe('createCombatZombie', () => {
    it('creates zombie in ATTACKING state', () => {
      const zombie = createCombatZombie();

      expect(zombie.aiState).toBe(ZombieAIState.ATTACKING);
    });

    it('accepts type parameter', () => {
      const zombie = createCombatZombie(ZombieType.RUNNER);

      expect(zombie.type).toBe(ZombieType.RUNNER);
      expect(zombie.aiState).toBe(ZombieAIState.ATTACKING);
    });
  });

  describe('createVeteranZombie', () => {
    it('creates zombie with battle experience', () => {
      const zombie = createVeteranZombie();

      expect(zombie.totalBattles).toBe(50);
      expect(zombie.totalKills).toBe(250);
      expect(zombie.totalDamageDealt).toBe(50000);
    });

    it('is mid-level', () => {
      const zombie = createVeteranZombie();

      expect(zombie.level).toBe(25);
      expect(zombie.xp).toBe(30000);
    });
  });

  describe('createZombieSquad', () => {
    it('creates array of zombies', () => {
      const squad = createZombieSquad(3);

      expect(squad).toHaveLength(3);
      expect(squad[0]).toBeDefined();
      expect(squad[1]).toBeDefined();
      expect(squad[2]).toBeDefined();
    });

    it('defaults to 3 zombies', () => {
      const squad = createZombieSquad();

      expect(squad).toHaveLength(3);
    });

    it('creates squad of specified size', () => {
      const squad = createZombieSquad(10);

      expect(squad).toHaveLength(10);
    });

    it('all zombies have unique IDs', () => {
      const squad = createZombieSquad(5);
      const ids = squad.map((z) => z.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('createMixedZombieSquad', () => {
    it('creates squad with multiple types', () => {
      const squad = createMixedZombieSquad();

      const types = squad.map((z) => z.type);
      const uniqueTypes = new Set(types);

      expect(uniqueTypes.size).toBeGreaterThan(1);
    });

    it('includes Brute as tank', () => {
      const squad = createMixedZombieSquad();

      expect(squad.some((z) => z.type === ZombieType.BRUTE)).toBe(true);
    });

    it('includes ranged Spitter', () => {
      const squad = createMixedZombieSquad();

      expect(squad.some((z) => z.type === ZombieType.SPITTER)).toBe(true);
    });

    it('includes Runners for DPS', () => {
      const squad = createMixedZombieSquad();

      expect(squad.some((z) => z.type === ZombieType.RUNNER)).toBe(true);
    });
  });

  describe('createEliteZombieSquad', () => {
    it('creates squad with elite types', () => {
      const squad = createEliteZombieSquad();

      const hasElite = squad.some(
        (z) =>
          z.type === ZombieType.BRUTE ||
          z.type === ZombieType.LICH ||
          z.type === ZombieType.ABOMINATION
      );

      expect(hasElite).toBe(true);
    });

    it('all zombies are Silver or Gold quality', () => {
      const squad = createEliteZombieSquad();

      const allHighQuality = squad.every(
        (z) => z.quality === ZombieQuality.SILVER || z.quality === ZombieQuality.GOLD
      );

      expect(allHighQuality).toBe(true);
    });

    it('has powerful stats', () => {
      const squad = createEliteZombieSquad();

      // At least one zombie should have high HP
      const hasHighHp = squad.some((z) => z.stats.maxHp > 300);
      expect(hasHighHp).toBe(true);
    });
  });
});
