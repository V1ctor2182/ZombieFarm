/**
 * Target Selection Integration Tests
 *
 * Tests targeting system integration with battle scenarios.
 * Tests realistic combat situations with multiple units, obstacles, and AI behaviors.
 *
 * Per DOMAIN-COMBAT.md combat flow specifications.
 */

import {
  findTargetsInRange,
  selectTarget,
  shouldRetarget,
} from '../services/targeting';
import type { CombatUnit, Enemy, Obstacle } from '../../../types/combat';
import {
  TargetPriority,
  UnitAIState,
  EnemyType,
  DamageType,
  BattlePhase,
} from '../../../types/combat';
import { ZombieType } from '../../../types/farm';
import type { Position } from '../../../types/global';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a battlefield scenario
 */
function createBattlefield(): {
  zombies: CombatUnit[];
  enemies: Enemy[];
  obstacles: Obstacle[];
} {
  // Zombies start on the left (x: 0-5)
  const zombies: CombatUnit[] = [
    {
      id: 'z1',
      type: ZombieType.BRUTE,
      name: 'Brute',
      position: { x: 2, y: 5 },
      stats: {
        hp: 150,
        maxHp: 150,
        attack: 30,
        defense: 25,
        speed: 0.8,
        range: 1,
        attackCooldown: 2.0,
        resistances: {},
      },
      statusEffects: [],
      aiState: UnitAIState.ADVANCING,
      targetId: null,
      lastAttackAt: 0,
      isDead: false,
    },
    {
      id: 'z2',
      type: ZombieType.RUNNER,
      name: 'Runner',
      position: { x: 1, y: 3 },
      stats: {
        hp: 80,
        maxHp: 80,
        attack: 25,
        defense: 8,
        speed: 2.0,
        range: 1,
        attackCooldown: 1.0,
        resistances: {},
      },
      statusEffects: [],
      aiState: UnitAIState.ADVANCING,
      targetId: null,
      lastAttackAt: 0,
      isDead: false,
    },
    {
      id: 'z3',
      type: ZombieType.SPITTER,
      name: 'Spitter',
      position: { x: 0, y: 5 },
      stats: {
        hp: 60,
        maxHp: 60,
        attack: 20,
        defense: 5,
        speed: 1.0,
        range: 8,
        attackCooldown: 2.5,
        resistances: {},
      },
      statusEffects: [],
      aiState: UnitAIState.ADVANCING,
      targetId: null,
      lastAttackAt: 0,
      isDead: false,
    },
  ];

  // Enemies on the right (x: 15-20)
  const enemies: Enemy[] = [
    {
      id: 'e1',
      type: EnemyType.SOLDIER,
      name: 'Soldier',
      position: { x: 15, y: 5 },
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 20,
        defense: 15,
        speed: 1.0,
        range: 1,
        attackCooldown: 1.5,
        resistances: {},
      },
      statusEffects: [],
      aiProfile: {
        aggression: 0.7,
        targetPriority: TargetPriority.CLOSEST,
        preferredRange: 1,
        canRetreat: false,
        useAbilities: true,
      },
      aiState: UnitAIState.ADVANCING,
      targetId: null,
      lastAttackAt: 0,
      abilities: [],
      isDead: false,
    },
    {
      id: 'e2',
      type: EnemyType.ARCHER,
      name: 'Archer',
      position: { x: 18, y: 3 },
      stats: {
        hp: 60,
        maxHp: 60,
        attack: 18,
        defense: 5,
        speed: 1.0,
        range: 10,
        attackCooldown: 2.0,
        resistances: {},
      },
      statusEffects: [],
      aiProfile: {
        aggression: 0.4,
        targetPriority: TargetPriority.LOWEST_ARMOR,
        preferredRange: 10,
        canRetreat: true,
        useAbilities: true,
      },
      aiState: UnitAIState.ENGAGING,
      targetId: null,
      lastAttackAt: 0,
      abilities: [],
      isDead: false,
    },
    {
      id: 'e3',
      type: EnemyType.PRIEST,
      name: 'Priest',
      position: { x: 20, y: 6 },
      stats: {
        hp: 70,
        maxHp: 70,
        attack: 15,
        defense: 8,
        speed: 0.9,
        range: 6,
        attackCooldown: 2.5,
        resistances: {},
      },
      statusEffects: [],
      aiProfile: {
        aggression: 0.3,
        targetPriority: TargetPriority.HIGHEST_THREAT,
        preferredRange: 6,
        canRetreat: true,
        useAbilities: true,
      },
      aiState: UnitAIState.ENGAGING,
      targetId: null,
      lastAttackAt: 0,
      abilities: [],
      isDead: false,
    },
  ];

  // Obstacles (wall in the middle)
  const obstacles: Obstacle[] = [
    {
      id: 'wall1',
      type: 'wall',
      name: 'Wall',
      position: { x: 10, y: 5 },
      stats: {
        hp: 500,
        maxHp: 500,
        attack: 0,
        defense: 50,
        speed: 0,
        range: 0,
        attackCooldown: 0,
        resistances: {},
      },
      blocksMovement: true,
      blocksLineOfSight: true,
      isDead: false,
    },
  ];

  return { zombies, enemies, obstacles };
}

// ============================================================================
// INTEGRATION TEST SCENARIOS
// ============================================================================

describe('Targeting Integration', () => {
  describe('Battlefield targeting scenarios', () => {
    it('ranged units can target across battlefield', () => {
      const { zombies, enemies, obstacles } = createBattlefield();
      const spitter = zombies[2]; // Range 8

      const targets = findTargetsInRange(spitter, enemies, obstacles);

      // Spitter at x:0, enemies at x:15+ (distance 15+)
      // With range 8, should not reach any enemies initially
      expect(targets).toHaveLength(0);
    });

    it('ranged units find targets when advanced', () => {
      const { zombies, enemies, obstacles } = createBattlefield();
      const spitter = { ...zombies[2], position: { x: 8, y: 8 } }; // Moved forward and to side

      const targets = findTargetsInRange(spitter, enemies, obstacles);

      // At y:8 (off from wall at y:5), can see around wall to enemies
      // Wall at x:10, y:5 doesn't block sight to enemies at different y positions
      expect(targets.length).toBeGreaterThan(0);
    });

    it('wall blocks line of sight between units', () => {
      const { zombies, enemies, obstacles } = createBattlefield();
      const brute = { ...zombies[0], position: { x: 8, y: 5 } }; // In front of wall
      const modifiedBrute = {
        ...brute,
        stats: { ...brute.stats, range: 15 }, // Long range for testing
      };

      const targets = findTargetsInRange(modifiedBrute, enemies, obstacles);

      // Wall at x:10 blocks sight to enemies at x:15+
      expect(targets).toHaveLength(0);
    });

    it('units can target enemies not blocked by wall', () => {
      const { zombies, enemies, obstacles } = createBattlefield();
      const runner = { ...zombies[1], position: { x: 8, y: 8 } }; // Off to the side
      const modifiedRunner = {
        ...runner,
        stats: { ...runner.stats, range: 12 },
      };

      const targets = findTargetsInRange(modifiedRunner, enemies, obstacles);

      // Wall is at y:5, runner at y:8, so can see around it
      expect(targets.length).toBeGreaterThan(0);
    });
  });

  describe('AI targeting behavior', () => {
    it('aggressive AI targets closest enemy', () => {
      const { zombies, enemies } = createBattlefield();
      const brute = { ...zombies[0], position: { x: 12, y: 5 } }; // Advanced
      const modifiedBrute = {
        ...brute,
        stats: { ...brute.stats, range: 10 },
      };

      const target = selectTarget(
        modifiedBrute,
        enemies,
        TargetPriority.CLOSEST
      );

      expect(target?.id).toBe('e1'); // Soldier is closest
    });

    it('ranged zombie targets low armor enemy', () => {
      const { zombies, enemies } = createBattlefield();
      const spitter = { ...zombies[2], position: { x: 10, y: 5 } };
      const modifiedSpitter = {
        ...spitter,
        stats: { ...spitter.stats, range: 15 },
      };

      const target = selectTarget(
        modifiedSpitter,
        enemies,
        TargetPriority.LOWEST_ARMOR
      );

      expect(target?.id).toBe('e2'); // Archer has lowest defense (5)
    });

    it('support-targeting AI prioritizes priests', () => {
      const { zombies, enemies } = createBattlefield();
      const runner = { ...zombies[1], position: { x: 12, y: 5 } };
      const modifiedRunner = {
        ...runner,
        stats: { ...runner.stats, range: 15 },
      };

      const target = selectTarget(
        modifiedRunner,
        enemies,
        TargetPriority.SUPPORT
      );

      expect(target?.id).toBe('e3'); // Priest is support unit
    });
  });

  describe('Re-targeting during combat', () => {
    it('does not retarget if current target is still valid', () => {
      const { zombies, enemies } = createBattlefield();
      const brute = {
        ...zombies[0],
        position: { x: 12, y: 5 },
        targetId: 'e1',
        stats: { ...zombies[0].stats, range: 10 },
      };

      const shouldChange = shouldRetarget(brute, enemies[0], enemies);

      expect(shouldChange).toBe(false);
    });

    it('retargets when current target dies', () => {
      const { zombies, enemies } = createBattlefield();
      const brute = {
        ...zombies[0],
        position: { x: 12, y: 5 },
        targetId: 'e1',
        stats: { ...zombies[0].stats, range: 10 },
      };
      const deadEnemy = { ...enemies[0], isDead: true };

      const shouldChange = shouldRetarget(brute, deadEnemy, enemies);

      expect(shouldChange).toBe(true);
    });

    it('retargets when significantly better target appears', () => {
      const { zombies, enemies } = createBattlefield();
      const runner = {
        ...zombies[1],
        position: { x: 12, y: 5 },
        targetId: 'e1', // Currently targeting soldier
        stats: { ...zombies[1].stats, range: 15 },
      };

      // Add a very weak enemy
      const weakEnemy: Enemy = {
        id: 'e4',
        type: EnemyType.PEASANT,
        name: 'Weak Peasant',
        position: { x: 13, y: 5 },
        stats: {
          hp: 10, // Very low HP
          maxHp: 100,
          attack: 5,
          defense: 2,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          resistances: {},
        },
        statusEffects: [],
        aiProfile: {
          aggression: 0.2,
          targetPriority: TargetPriority.CLOSEST,
          preferredRange: 1,
          canRetreat: true,
          useAbilities: false,
        },
        aiState: UnitAIState.ADVANCING,
        targetId: null,
        lastAttackAt: 0,
        abilities: [],
        isDead: false,
      };

      const allEnemies = [...enemies, weakEnemy];

      const shouldChange = shouldRetarget(
        runner,
        enemies[0],
        allEnemies,
        TargetPriority.WEAKEST
      );

      expect(shouldChange).toBe(true); // Should switch to weak enemy
    });

    it('does not retarget if current target is best for priority', () => {
      const { zombies, enemies } = createBattlefield();
      const spitter = {
        ...zombies[2],
        position: { x: 10, y: 5 },
        targetId: 'e2', // Currently targeting archer (low armor)
        stats: { ...zombies[2].stats, range: 15 },
      };

      const shouldChange = shouldRetarget(
        spitter,
        enemies[1], // Archer
        enemies,
        TargetPriority.LOWEST_ARMOR
      );

      expect(shouldChange).toBe(false); // Archer still has lowest armor
    });
  });

  describe('Multi-unit targeting coordination', () => {
    it('multiple units can target same enemy', () => {
      const { zombies, enemies } = createBattlefield();
      const advancedZombies = zombies.map((z) => ({
        ...z,
        position: { x: 12, y: z.position.y },
        stats: { ...z.stats, range: 10 },
      }));

      const targets = advancedZombies.map((z) =>
        selectTarget(z, enemies, TargetPriority.CLOSEST)
      );

      // All should target soldier (closest)
      expect(targets.every((t) => t?.id === 'e1')).toBe(true);
    });

    it('units with different priorities target different enemies', () => {
      const { zombies, enemies } = createBattlefield();
      const advancedZombies = zombies.map((z) => ({
        ...z,
        position: { x: 12, y: z.position.y },
        stats: { ...z.stats, range: 15 },
      }));

      const closestTarget = selectTarget(
        advancedZombies[0],
        enemies,
        TargetPriority.CLOSEST
      );
      const weakestTarget = selectTarget(
        advancedZombies[1],
        enemies,
        TargetPriority.WEAKEST
      );
      const supportTarget = selectTarget(
        advancedZombies[2],
        enemies,
        TargetPriority.SUPPORT
      );

      expect(closestTarget?.id).toBe('e1'); // Soldier
      expect(weakestTarget?.id).toBe('e2'); // Archer (60 HP)
      expect(supportTarget?.id).toBe('e3'); // Priest
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles empty enemy array', () => {
      const { zombies } = createBattlefield();
      const brute = zombies[0];

      const target = selectTarget(brute, [], TargetPriority.CLOSEST);

      expect(target).toBeNull();
    });

    it('handles all enemies dead', () => {
      const { zombies, enemies } = createBattlefield();
      const deadEnemies = enemies.map((e) => ({ ...e, isDead: true }));
      const brute = zombies[0];

      const target = selectTarget(brute, deadEnemies, TargetPriority.CLOSEST);

      expect(target).toBeNull();
    });

    it('handles zombie with zero range (should find nothing far away)', () => {
      const { zombies, enemies } = createBattlefield();
      const zeroRangeZombie = {
        ...zombies[0],
        stats: { ...zombies[0].stats, range: 0 },
      };

      const targets = findTargetsInRange(zeroRangeZombie, enemies, []);

      expect(targets).toHaveLength(0);
    });

    it('handles retargeting with no alternative targets', () => {
      const { zombies, enemies } = createBattlefield();
      const brute = {
        ...zombies[0],
        position: { x: 12, y: 5 },
        targetId: 'e1',
        stats: { ...zombies[0].stats, range: 10 },
      };

      const singleEnemy = [enemies[0]];

      const shouldChange = shouldRetarget(
        brute,
        enemies[0],
        singleEnemy,
        TargetPriority.CLOSEST
      );

      expect(shouldChange).toBe(false); // Only one target, can't switch
    });
  });
});
