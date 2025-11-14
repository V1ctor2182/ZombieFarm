/**
 * Tests for Game Configuration
 *
 * Validates all game balance values, zombie definitions, resource costs,
 * and building configurations match DOMAIN-FARM.md and DOMAIN-COMBAT.md specifications.
 */

import { describe, it, expect } from '@jest/globals';
import { gameConfig } from '../zombieFarmConfig';
import { ZombieType, ZombieQuality } from '../../../types/farm';
import { Resource, Currency, SeedType } from '../../../types/resources';
import { DamageType, StatusEffect } from '../../../types/combat';

describe('Game Configuration', () => {
  describe('Game Constants', () => {
    it('should define day/night cycle constants', () => {
      expect(gameConfig.TIME.DAY_NIGHT_CYCLE_DURATION).toBe(30 * 60 * 1000); // 30 minutes in ms
      expect(gameConfig.TIME.DAY_DURATION).toBe(20 * 60 * 1000); // 20 minutes
      expect(gameConfig.TIME.NIGHT_DURATION).toBe(10 * 60 * 1000); // 10 minutes
    });

    it('should define zombie capacity limits', () => {
      expect(gameConfig.CAPACITY.INITIAL_ZOMBIE_CAP).toBe(10);
      expect(gameConfig.CAPACITY.MAX_ZOMBIE_CAP).toBe(100);
      expect(gameConfig.CAPACITY.CRYPT_STORAGE_UNLIMITED).toBe(true);
    });

    it('should define decay rates', () => {
      expect(gameConfig.DECAY.DAILY_STAT_DECAY_RATE).toBe(0.01); // 1% per day
      expect(gameConfig.DECAY.DECAY_FLOOR).toBe(0.5); // 50% minimum
      expect(gameConfig.DECAY.DAILY_HAPPINESS_DECAY).toBe(5); // -5 per day unfed
      expect(gameConfig.DECAY.CRYPT_DECAY_RATE).toBe(0); // No decay in Crypt
    });

    it('should define happiness modifiers', () => {
      expect(gameConfig.HAPPINESS.FEEDING_BOOST).toBe(10);
      expect(gameConfig.HAPPINESS.PETTING_BOOST).toBe(5);
      expect(gameConfig.HAPPINESS.PETTING_COOLDOWN_HOURS).toBe(24);
      expect(gameConfig.HAPPINESS.SOCIAL_BOOST).toBe(5);
      expect(gameConfig.HAPPINESS.ENVIRONMENT_BOOST).toBe(5);
      expect(gameConfig.HAPPINESS.INJURED_PENALTY).toBe(-10);
    });

    it('should define farm expansion', () => {
      expect(gameConfig.FARM.INITIAL_GRID_SIZE.width).toBeGreaterThan(0);
      expect(gameConfig.FARM.INITIAL_GRID_SIZE.height).toBeGreaterThan(0);
      expect(gameConfig.FARM.MAX_EXPANSIONS).toBeGreaterThan(0);
    });
  });

  describe('Zombie Type Definitions', () => {
    it('should define all 11 zombie types', () => {
      const zombieTypes = Object.keys(gameConfig.ZOMBIES);
      expect(zombieTypes).toHaveLength(11);

      // Basic Tier
      expect(zombieTypes).toContain(ZombieType.SHAMBLER);
      expect(zombieTypes).toContain(ZombieType.RUNNER);

      // Advanced Tier
      expect(zombieTypes).toContain(ZombieType.BRUTE);
      expect(zombieTypes).toContain(ZombieType.SPITTER);
      expect(zombieTypes).toContain(ZombieType.GHOUL);

      // Elite Tier
      expect(zombieTypes).toContain(ZombieType.ABOMINATION);
      expect(zombieTypes).toContain(ZombieType.LICH);
      expect(zombieTypes).toContain(ZombieType.BONE_KNIGHT);

      // Special
      expect(zombieTypes).toContain(ZombieType.PRIEST_ZOMBIE);
      expect(zombieTypes).toContain(ZombieType.EXPLOSIVE_ZOMBIE);
      expect(zombieTypes).toContain(ZombieType.NECROMANCER_ZOMBIE);
    });

    it('should have valid stats for Shambler (basic zombie)', () => {
      const shambler = gameConfig.ZOMBIES[ZombieType.SHAMBLER];

      expect(shambler.name).toBe('Shambler');
      expect(shambler.description).toBeDefined();
      expect(shambler.tier).toBe('basic');

      // Base stats
      expect(shambler.baseStats.maxHp).toBeGreaterThan(0);
      expect(shambler.baseStats.attack).toBeGreaterThan(0);
      expect(shambler.baseStats.defense).toBeGreaterThan(0);
      expect(shambler.baseStats.speed).toBeGreaterThan(0);
      expect(shambler.baseStats.range).toBe(1); // Melee
      expect(shambler.baseStats.attackCooldown).toBeGreaterThan(0);

      // Growth and cost
      expect(shambler.growthTimeMinutes).toBeGreaterThan(0);
      expect(shambler.seedCost).toHaveProperty('currencies');
      expect(shambler.feedCost).toHaveProperty('resources');
    });

    it('should have Runner be faster than Shambler', () => {
      const shambler = gameConfig.ZOMBIES[ZombieType.SHAMBLER];
      const runner = gameConfig.ZOMBIES[ZombieType.RUNNER];

      expect(runner.baseStats.speed).toBeGreaterThan(shambler.baseStats.speed);
      expect(runner.baseStats.attackCooldown).toBeLessThan(shambler.baseStats.attackCooldown);
    });

    it('should have Brute be tankier than basic zombies', () => {
      const shambler = gameConfig.ZOMBIES[ZombieType.SHAMBLER];
      const brute = gameConfig.ZOMBIES[ZombieType.BRUTE];

      expect(brute.baseStats.maxHp).toBeGreaterThan(shambler.baseStats.maxHp);
      expect(brute.baseStats.defense).toBeGreaterThan(shambler.baseStats.defense);
      expect(brute.baseStats.speed).toBeLessThan(shambler.baseStats.speed); // Slow
    });

    it('should have Spitter as ranged unit', () => {
      const spitter = gameConfig.ZOMBIES[ZombieType.SPITTER];

      expect(spitter.baseStats.range).toBeGreaterThan(1); // Ranged
      expect(spitter.damageType).toBe(DamageType.TOXIC);
    });

    it('should have Lich as magical ranged caster', () => {
      const lich = gameConfig.ZOMBIES[ZombieType.LICH];

      expect(lich.baseStats.range).toBeGreaterThan(3); // Long range
      expect(lich.damageType).toBe(DamageType.DARK);
      expect(lich.tier).toBe('elite');
    });

    it('should apply quality multipliers correctly', () => {
      expect(gameConfig.QUALITY_MULTIPLIERS[ZombieQuality.BRONZE]).toBe(1.0);
      expect(gameConfig.QUALITY_MULTIPLIERS[ZombieQuality.SILVER]).toBe(1.25);
      expect(gameConfig.QUALITY_MULTIPLIERS[ZombieQuality.GOLD]).toBe(1.5);
      expect(gameConfig.QUALITY_MULTIPLIERS[ZombieQuality.DIAMOND]).toBe(2.0);
    });

    it('should define quality chances for zombie growth', () => {
      const chances = gameConfig.ZOMBIE_GROWTH.qualityChances;

      expect(chances[ZombieQuality.BRONZE]).toBeGreaterThan(0);
      expect(chances[ZombieQuality.SILVER]).toBeGreaterThan(0);
      expect(chances[ZombieQuality.GOLD]).toBeGreaterThan(0);
      expect(chances[ZombieQuality.DIAMOND]).toBeGreaterThan(0);

      // Should sum to ~100%
      const total = Object.values(chances).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1.0, 2);
    });

    it('should have watering and fertilizer boost growth', () => {
      expect(gameConfig.ZOMBIE_GROWTH.wateringSpeedBoost).toBeGreaterThan(0);
      expect(gameConfig.ZOMBIE_GROWTH.wateringSpeedBoost).toBeLessThanOrEqual(1);

      expect(gameConfig.ZOMBIE_GROWTH.fertilizerSpeedBoost).toBeGreaterThan(0);
      expect(gameConfig.ZOMBIE_GROWTH.fertilizerSpeedBoost).toBeLessThanOrEqual(1);

      expect(gameConfig.ZOMBIE_GROWTH.fertilizerQualityBoost).toBeGreaterThan(0);
    });
  });

  describe('Resource Definitions', () => {
    it('should define primary farm resources', () => {
      expect(gameConfig.RESOURCES[Resource.ROTTEN_WOOD]).toBeDefined();
      expect(gameConfig.RESOURCES[Resource.BONES]).toBeDefined();
      expect(gameConfig.RESOURCES[Resource.BLOOD_WATER]).toBeDefined();
      expect(gameConfig.RESOURCES[Resource.CORPSE_DUST]).toBeDefined();
      expect(gameConfig.RESOURCES[Resource.SOUL_FRAGMENTS]).toBeDefined();
    });

    it('should have valid resource metadata', () => {
      const rottenWood = gameConfig.RESOURCES[Resource.ROTTEN_WOOD];

      expect(rottenWood.name).toBe('Rotten Wood');
      expect(rottenWood.description).toBeDefined();
      expect(rottenWood.stackSize).toBeGreaterThan(0);
      expect(rottenWood.icon).toBeDefined();
    });

    it('should define resource node configurations', () => {
      const deadTree = gameConfig.RESOURCE_NODES.deadTree;

      expect(deadTree.yields).toHaveProperty(Resource.ROTTEN_WOOD);
      expect(deadTree.capacity).toBeGreaterThan(0);
      expect(deadTree.cooldownMinutes).toBeGreaterThan(0);
    });

    it('should define Blood Well refill rate', () => {
      const bloodWell = gameConfig.RESOURCE_NODES.bloodWell;

      expect(bloodWell.yields).toHaveProperty(Resource.BLOOD_WATER);
      expect(bloodWell.refillRate).toBeDefined(); // Units per minute
      expect(bloodWell.capacity).toBeGreaterThan(0);
    });
  });

  describe('Building Definitions', () => {
    it('should define core buildings', () => {
      expect(gameConfig.BUILDINGS.commandCenter).toBeDefined();
      expect(gameConfig.BUILDINGS.crypt).toBeDefined();
      expect(gameConfig.BUILDINGS.zombiePlot).toBeDefined();
    });

    it('should have valid building costs', () => {
      const zombiePlot = gameConfig.BUILDINGS.zombiePlot;

      expect(zombiePlot.name).toBe('Zombie Plot');
      expect(zombiePlot.cost).toBeDefined();
      expect(zombiePlot.cost.resources).toBeDefined();
      expect(zombiePlot.buildTimeMinutes).toBeGreaterThanOrEqual(0);
    });

    it('should define capacity-increasing buildings', () => {
      const mausoleum = gameConfig.BUILDINGS.mausoleum;

      expect(mausoleum.effect).toHaveProperty('zombieCapacityBonus');
      expect(mausoleum.effect.zombieCapacityBonus).toBeGreaterThan(0);
    });

    it('should define production buildings', () => {
      const bloodWell = gameConfig.BUILDINGS.bloodWell;
      const corpseComposter = gameConfig.BUILDINGS.corpseComposter;

      expect(bloodWell.effect).toHaveProperty('producesResource');
      expect(corpseComposter.effect).toHaveProperty('convertsResource');
    });

    it('should define training and support buildings', () => {
      const trainingDummy = gameConfig.BUILDINGS.trainingDummy;
      const stitchingStation = gameConfig.BUILDINGS.stitchingStation;

      expect(trainingDummy).toBeDefined();
      expect(stitchingStation).toBeDefined();
      expect(stitchingStation.effect).toHaveProperty('healsZombies');
    });

    it('should define defensive structures', () => {
      expect(gameConfig.BUILDINGS.guardTower).toBeDefined();
      expect(gameConfig.BUILDINGS.woodenSpikes).toBeDefined();
      expect(gameConfig.BUILDINGS.stoneWall).toBeDefined();
    });

    it('should define happiness-boosting decorations', () => {
      const bonfire = gameConfig.BUILDINGS.bonfire;

      expect(bonfire.effect).toHaveProperty('happinessBonus');
      expect(bonfire.effect.happinessBonus).toBeGreaterThan(0);
    });

    it('should allow building upgrades', () => {
      const commandCenter = gameConfig.BUILDINGS.commandCenter;

      expect(commandCenter.maxLevel).toBeGreaterThan(1);
      expect(commandCenter.upgradeCosts).toBeDefined();
    });
  });

  describe('Combat Balance', () => {
    it('should define damage type multipliers', () => {
      expect(gameConfig.COMBAT.DAMAGE_MULTIPLIERS).toBeDefined();

      // Holy damage should be 2x against undead
      expect(gameConfig.COMBAT.DAMAGE_MULTIPLIERS[DamageType.HOLY].vsUndead).toBe(2.0);

      // Physical damage reduced by armor
      expect(gameConfig.COMBAT.DAMAGE_MULTIPLIERS[DamageType.PHYSICAL].vsArmor).toBeLessThan(1.0);

      // Toxic bypasses some armor
      expect(
        gameConfig.COMBAT.DAMAGE_MULTIPLIERS[DamageType.TOXIC].armorPenetration
      ).toBeGreaterThan(0);
    });

    it('should define status effect durations', () => {
      expect(gameConfig.COMBAT.STATUS_EFFECTS[StatusEffect.POISONED].duration).toBeGreaterThan(0);
      expect(gameConfig.COMBAT.STATUS_EFFECTS[StatusEffect.BURNING].duration).toBeGreaterThan(0);
      expect(gameConfig.COMBAT.STATUS_EFFECTS[StatusEffect.STUNNED].duration).toBeGreaterThan(0);
      expect(gameConfig.COMBAT.STATUS_EFFECTS[StatusEffect.FEAR].duration).toBeGreaterThan(0);
    });

    it('should define status effect damage rates', () => {
      const poisoned = gameConfig.COMBAT.STATUS_EFFECTS[StatusEffect.POISONED];
      const burning = gameConfig.COMBAT.STATUS_EFFECTS[StatusEffect.BURNING];

      expect(poisoned.damagePerSecond).toBeGreaterThan(0);
      expect(burning.damagePerSecond).toBeGreaterThan(poisoned.damagePerSecond); // Burning stronger
    });

    it('should define squad size limits', () => {
      expect(gameConfig.COMBAT.INITIAL_SQUAD_SIZE).toBe(3);
      expect(gameConfig.COMBAT.MAX_SQUAD_SIZE).toBeGreaterThanOrEqual(10);
    });

    it('should define retreat mechanics', () => {
      expect(gameConfig.COMBAT.RETREAT_COUNTDOWN_SECONDS).toBe(10);
      expect(gameConfig.COMBAT.RETREAT_COST).toBeDefined();
    });

    it('should define XP gain formula', () => {
      expect(gameConfig.COMBAT.XP_PER_PARTICIPATION).toBeGreaterThan(0);
      expect(gameConfig.COMBAT.XP_PER_KILL).toBeGreaterThan(0);
      expect(gameConfig.COMBAT.XP_PER_DAMAGE).toBeGreaterThan(0);
    });

    it('should define minimum damage (cannot be zero)', () => {
      expect(gameConfig.COMBAT.MINIMUM_DAMAGE).toBe(1);
    });
  });

  describe('Seed Configurations', () => {
    it('should define seed types for all zombie types', () => {
      expect(gameConfig.SEEDS[SeedType.SHAMBLER_SEED]).toBeDefined();
      expect(gameConfig.SEEDS[SeedType.RUNNER_SEED]).toBeDefined();
      expect(gameConfig.SEEDS[SeedType.BRUTE_SEED]).toBeDefined();
      expect(gameConfig.SEEDS[SeedType.LICH_SEED]).toBeDefined();
    });

    it('should link seeds to zombie types', () => {
      const shamblerSeed = gameConfig.SEEDS[SeedType.SHAMBLER_SEED];

      expect(shamblerSeed.zombieType).toBe(ZombieType.SHAMBLER);
      expect(shamblerSeed.name).toBeDefined();
      expect(shamblerSeed.description).toBeDefined();
    });

    it('should have basic seeds cheaply available', () => {
      const shamblerSeed = gameConfig.SEEDS[SeedType.SHAMBLER_SEED];
      const runnerSeed = gameConfig.SEEDS[SeedType.RUNNER_SEED];

      // Basic seeds should cost Dark Coins
      expect(shamblerSeed.cost.currencies?.[Currency.DARK_COINS]).toBeGreaterThan(0);
      expect(runnerSeed.cost.currencies?.[Currency.DARK_COINS]).toBeGreaterThan(0);
    });

    it('should have elite seeds be expensive or unlock-gated', () => {
      const lichSeed = gameConfig.SEEDS[SeedType.LICH_SEED];
      const abominationSeed = gameConfig.SEEDS[SeedType.ABOMINATION_SEED];

      // Elite seeds should require special unlocks or be very expensive
      expect(lichSeed.requiresUnlock).toBeDefined();
      expect(abominationSeed.requiresUnlock).toBeDefined();
    });

    it('should have special seeds require specific unlocks', () => {
      const priestSeed = gameConfig.SEEDS[SeedType.PRIEST_ZOMBIE_SEED];

      // Priest zombie seed from Cathedral
      expect(priestSeed.requiresUnlock).toContain('cathedral');
    });
  });

  describe('Progression and Leveling', () => {
    it('should define player XP curve', () => {
      expect(gameConfig.PROGRESSION.PLAYER_XP_CURVE).toBeDefined();
      expect(typeof gameConfig.PROGRESSION.PLAYER_XP_CURVE).toBe('function');

      // XP required should increase with level
      const level1XP = gameConfig.PROGRESSION.PLAYER_XP_CURVE(1);
      const level10XP = gameConfig.PROGRESSION.PLAYER_XP_CURVE(10);
      expect(level10XP).toBeGreaterThan(level1XP);
    });

    it('should define zombie XP curve', () => {
      expect(gameConfig.PROGRESSION.ZOMBIE_XP_CURVE).toBeDefined();
      expect(typeof gameConfig.PROGRESSION.ZOMBIE_XP_CURVE).toBe('function');

      const level1XP = gameConfig.PROGRESSION.ZOMBIE_XP_CURVE(1);
      const level50XP = gameConfig.PROGRESSION.ZOMBIE_XP_CURVE(50);
      expect(level50XP).toBeGreaterThan(level1XP);
    });

    it('should define stat growth per level', () => {
      expect(gameConfig.PROGRESSION.STATS_PER_LEVEL.hp).toBeGreaterThan(0);
      expect(gameConfig.PROGRESSION.STATS_PER_LEVEL.attack).toBeGreaterThan(0);
      expect(gameConfig.PROGRESSION.STATS_PER_LEVEL.defense).toBeGreaterThan(0);
    });

    it('should have max level caps', () => {
      expect(gameConfig.PROGRESSION.MAX_PLAYER_LEVEL).toBeGreaterThan(0);
      expect(gameConfig.PROGRESSION.MAX_ZOMBIE_LEVEL).toBe(100);
    });
  });

  describe('Configuration Consistency', () => {
    it('should have all zombie types reference valid resources in costs', () => {
      Object.values(gameConfig.ZOMBIES).forEach((zombie) => {
        if (zombie.feedCost.resources) {
          Object.keys(zombie.feedCost.resources).forEach((resourceKey) => {
            expect(Object.values(Resource)).toContain(resourceKey);
          });
        }
      });
    });

    it('should have all buildings reference valid resources in costs', () => {
      Object.values(gameConfig.BUILDINGS).forEach((building) => {
        if (building.cost.resources) {
          Object.keys(building.cost.resources).forEach((resourceKey) => {
            expect(Object.values(Resource)).toContain(resourceKey);
          });
        }
      });
    });

    it('should have no negative values in stats', () => {
      Object.values(gameConfig.ZOMBIES).forEach((zombie) => {
        expect(zombie.baseStats.maxHp).toBeGreaterThan(0);
        expect(zombie.baseStats.attack).toBeGreaterThan(0);
        expect(zombie.baseStats.defense).toBeGreaterThanOrEqual(0);
        expect(zombie.baseStats.speed).toBeGreaterThan(0);
        expect(zombie.baseStats.range).toBeGreaterThan(0);
        expect(zombie.baseStats.attackCooldown).toBeGreaterThan(0);
      });
    });

    it('should have growth times be reasonable (not instant, not too long)', () => {
      Object.values(gameConfig.ZOMBIES).forEach((zombie) => {
        expect(zombie.growthTimeMinutes).toBeGreaterThan(0);
        expect(zombie.growthTimeMinutes).toBeLessThan(24 * 60); // Less than 24 hours
      });
    });
  });
});
