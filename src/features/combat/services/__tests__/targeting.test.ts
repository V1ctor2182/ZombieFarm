/**
 * Target Selection System Tests
 *
 * Tests for combat targeting algorithms, range checking, line of sight,
 * target prioritization, and re-targeting logic.
 *
 * Per DOMAIN-COMBAT.md Engagement & Targeting specifications.
 */

import {
  findTargetsInRange,
  hasLineOfSight,
  selectTarget,
  prioritizeTargets,
  shouldRetarget,
  calculateDistance,
  isInRange,
  getTargetsInRadius,
} from '../targeting';
import type { CombatUnit, Enemy, Obstacle } from '../../../../types/combat';
import { TargetPriority, UnitAIState, EnemyType, DamageType } from '../../../../types/combat';
import { ZombieType } from '../../../../types/farm';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a mock zombie combat unit for testing
 */
function createMockZombie(id: string, overrides: Partial<CombatUnit> = {}): CombatUnit {
  return {
    id,
    type: overrides.type ?? ZombieType.SHAMBLER,
    name: `Zombie ${id}`,
    position: { x: 0, y: 0 },
    stats: {
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    statusEffects: [],
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    isDead: false,
    ...overrides,
  };
}

/**
 * Create a mock enemy for testing
 */
function createMockEnemy(id: string, overrides: Partial<Enemy> = {}): Enemy {
  return {
    id,
    type: overrides.type ?? EnemyType.PEASANT,
    name: `Enemy ${id}`,
    position: { x: 10, y: 0 },
    stats: {
      hp: 80,
      maxHp: 80,
      attack: 15,
      defense: 5,
      speed: 1.0,
      range: 1,
      attackCooldown: 1.5,
      resistances: {},
    },
    statusEffects: [],
    aiProfile: {
      aggression: 0.5,
      targetPriority: TargetPriority.CLOSEST,
      preferredRange: 1,
      canRetreat: false,
      useAbilities: true,
    },
    aiState: UnitAIState.IDLE,
    targetId: null,
    lastAttackAt: 0,
    abilities: [],
    isDead: false,
    ...overrides,
  };
}

/**
 * Create a mock obstacle for LOS testing
 */
function createMockObstacle(
  id: string,
  position: { x: number; y: number },
  blocksLOS: boolean = true
): Obstacle {
  return {
    id,
    type: 'wall',
    name: 'Wall',
    position,
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
    blocksLineOfSight: blocksLOS,
    isDead: false,
  };
}

// ============================================================================
// DISTANCE CALCULATION TESTS
// ============================================================================

describe('calculateDistance', () => {
  it('calculates distance between two positions', () => {
    const pos1 = { x: 0, y: 0 };
    const pos2 = { x: 3, y: 4 };

    const distance = calculateDistance(pos1, pos2);

    expect(distance).toBe(5); // Pythagorean theorem: 3² + 4² = 5²
  });

  it('returns 0 for same position', () => {
    const pos = { x: 5, y: 5 };

    const distance = calculateDistance(pos, pos);

    expect(distance).toBe(0);
  });

  it('handles negative coordinates', () => {
    const pos1 = { x: -3, y: -4 };
    const pos2 = { x: 0, y: 0 };

    const distance = calculateDistance(pos1, pos2);

    expect(distance).toBe(5);
  });
});

// ============================================================================
// RANGE CHECKING TESTS
// ============================================================================

describe('isInRange', () => {
  it('returns true if target is within range', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 5 },
    });
    const target = createMockEnemy('e1', {
      position: { x: 3, y: 0 },
    });

    const result = isInRange(unit, target);

    expect(result).toBe(true);
  });

  it('returns false if target is out of range', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 2 },
    });
    const target = createMockEnemy('e1', {
      position: { x: 5, y: 0 },
    });

    const result = isInRange(unit, target);

    expect(result).toBe(false);
  });

  it('returns true if target is exactly at range boundary', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 5 },
    });
    const target = createMockEnemy('e1', {
      position: { x: 3, y: 4 }, // Distance = 5
    });

    const result = isInRange(unit, target);

    expect(result).toBe(true);
  });

  it('handles melee range (1 tile)', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 1 },
    });
    const target = createMockEnemy('e1', {
      position: { x: 1, y: 0 },
    });

    const result = isInRange(unit, target);

    expect(result).toBe(true);
  });
});

// ============================================================================
// FIND TARGETS IN RANGE TESTS
// ============================================================================

describe('findTargetsInRange', () => {
  it('finds all enemies within range', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 5 },
    });
    const enemies = [
      createMockEnemy('e1', { position: { x: 2, y: 0 } }),
      createMockEnemy('e2', { position: { x: 3, y: 3 } }),
      createMockEnemy('e3', { position: { x: 10, y: 10 } }),
    ];
    const obstacles: Obstacle[] = [];

    const targets = findTargetsInRange(unit, enemies, obstacles);

    expect(targets).toHaveLength(2);
    expect(targets.map((t) => t.id)).toContain('e1');
    expect(targets.map((t) => t.id)).toContain('e2');
    expect(targets.map((t) => t.id)).not.toContain('e3');
  });

  it('excludes dead enemies', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 5 },
    });
    const enemies = [
      createMockEnemy('e1', { position: { x: 2, y: 0 } }),
      createMockEnemy('e2', { position: { x: 3, y: 0 }, isDead: true }),
    ];
    const obstacles: Obstacle[] = [];

    const targets = findTargetsInRange(unit, enemies, obstacles);

    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe('e1');
  });

  it('returns empty array if no enemies in range', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 2 },
    });
    const enemies = [createMockEnemy('e1', { position: { x: 10, y: 10 } })];
    const obstacles: Obstacle[] = [];

    const targets = findTargetsInRange(unit, enemies, obstacles);

    expect(targets).toHaveLength(0);
  });

  it('excludes enemies blocked by obstacles (LOS)', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 10 },
    });
    const enemies = [createMockEnemy('e1', { position: { x: 5, y: 0 } })];
    const obstacles: Obstacle[] = [createMockObstacle('wall1', { x: 2, y: 0 }, true)];

    const targets = findTargetsInRange(unit, enemies, obstacles);

    expect(targets).toHaveLength(0); // Blocked by wall
  });
});

// ============================================================================
// LINE OF SIGHT TESTS
// ============================================================================

describe('hasLineOfSight', () => {
  it('returns true when no obstacles block LOS', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 0 };
    const obstacles: Obstacle[] = [];

    const result = hasLineOfSight(from, to, obstacles);

    expect(result).toBe(true);
  });

  it('returns false when obstacle blocks direct line', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 0 };
    const obstacles: Obstacle[] = [createMockObstacle('wall1', { x: 2, y: 0 }, true)];

    const result = hasLineOfSight(from, to, obstacles);

    expect(result).toBe(false);
  });

  it('returns true when obstacle does not block LOS', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 0 };
    const obstacles: Obstacle[] = [
      createMockObstacle('debris1', { x: 2, y: 5 }, false), // Doesn't block LOS
    ];

    const result = hasLineOfSight(from, to, obstacles);

    expect(result).toBe(true);
  });

  it('returns true when obstacle is behind target', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 0 };
    const obstacles: Obstacle[] = [
      createMockObstacle('wall1', { x: 10, y: 0 }, true), // Behind target
    ];

    const result = hasLineOfSight(from, to, obstacles);

    expect(result).toBe(true);
  });

  it('returns true when obstacle is off the line', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 0 };
    const obstacles: Obstacle[] = [
      createMockObstacle('wall1', { x: 2, y: 5 }, true), // Off line
    ];

    const result = hasLineOfSight(from, to, obstacles);

    expect(result).toBe(true);
  });

  it('handles diagonal LOS', () => {
    const from = { x: 0, y: 0 };
    const to = { x: 5, y: 5 };
    const obstacles: Obstacle[] = [
      createMockObstacle('wall1', { x: 2, y: 2 }, true), // On diagonal line
    ];

    const result = hasLineOfSight(from, to, obstacles);

    expect(result).toBe(false);
  });
});

// ============================================================================
// TARGET PRIORITIZATION TESTS
// ============================================================================

describe('prioritizeTargets', () => {
  describe('CLOSEST priority', () => {
    it('sorts targets by distance (closest first)', () => {
      const unit = createMockZombie('z1', { position: { x: 0, y: 0 } });
      const targets = [
        createMockEnemy('e1', { position: { x: 5, y: 0 } }),
        createMockEnemy('e2', { position: { x: 2, y: 0 } }),
        createMockEnemy('e3', { position: { x: 8, y: 0 } }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.CLOSEST, unit);

      expect(sorted[0].id).toBe('e2'); // Distance 2
      expect(sorted[1].id).toBe('e1'); // Distance 5
      expect(sorted[2].id).toBe('e3'); // Distance 8
    });
  });

  describe('WEAKEST priority', () => {
    it('sorts targets by HP (lowest first)', () => {
      const unit = createMockZombie('z1');
      const targets = [
        createMockEnemy('e1', {
          stats: { ...createMockEnemy('e1').stats, hp: 50, maxHp: 100 },
        }),
        createMockEnemy('e2', {
          stats: { ...createMockEnemy('e2').stats, hp: 20, maxHp: 100 },
        }),
        createMockEnemy('e3', {
          stats: { ...createMockEnemy('e3').stats, hp: 80, maxHp: 100 },
        }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.WEAKEST, unit);

      expect(sorted[0].id).toBe('e2'); // 20 HP
      expect(sorted[1].id).toBe('e1'); // 50 HP
      expect(sorted[2].id).toBe('e3'); // 80 HP
    });
  });

  describe('HIGHEST_THREAT priority', () => {
    it('sorts targets by attack stat (highest first)', () => {
      const unit = createMockZombie('z1');
      const targets = [
        createMockEnemy('e1', {
          stats: { ...createMockEnemy('e1').stats, attack: 20 },
        }),
        createMockEnemy('e2', {
          stats: { ...createMockEnemy('e2').stats, attack: 50 },
        }),
        createMockEnemy('e3', {
          stats: { ...createMockEnemy('e3').stats, attack: 10 },
        }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.HIGHEST_THREAT, unit);

      expect(sorted[0].id).toBe('e2'); // 50 attack
      expect(sorted[1].id).toBe('e1'); // 20 attack
      expect(sorted[2].id).toBe('e3'); // 10 attack
    });
  });

  describe('LOWEST_ARMOR priority', () => {
    it('sorts targets by defense (lowest first)', () => {
      const unit = createMockZombie('z1');
      const targets = [
        createMockEnemy('e1', {
          stats: { ...createMockEnemy('e1').stats, defense: 20 },
        }),
        createMockEnemy('e2', {
          stats: { ...createMockEnemy('e2').stats, defense: 5 },
        }),
        createMockEnemy('e3', {
          stats: { ...createMockEnemy('e3').stats, defense: 15 },
        }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.LOWEST_ARMOR, unit);

      expect(sorted[0].id).toBe('e2'); // 5 defense
      expect(sorted[1].id).toBe('e3'); // 15 defense
      expect(sorted[2].id).toBe('e1'); // 20 defense
    });
  });

  describe('SUPPORT priority', () => {
    it('prioritizes priests and healers', () => {
      const unit = createMockZombie('z1');
      const targets = [
        createMockEnemy('e1', { type: EnemyType.SOLDIER }),
        createMockEnemy('e2', { type: EnemyType.PRIEST }),
        createMockEnemy('e3', { type: EnemyType.ARCHER }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.SUPPORT, unit);

      expect(sorted[0].id).toBe('e2'); // Priest (support)
    });

    it('prioritizes mages after priests', () => {
      const unit = createMockZombie('z1');
      const targets = [
        createMockEnemy('e1', { type: EnemyType.SOLDIER }),
        createMockEnemy('e2', { type: EnemyType.MAGE }),
        createMockEnemy('e3', { type: EnemyType.PRIEST }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.SUPPORT, unit);

      expect(sorted[0].id).toBe('e3'); // Priest first
      expect(sorted[1].id).toBe('e2'); // Mage second
    });
  });

  describe('RANGED priority', () => {
    it('prioritizes archers and ranged units', () => {
      const unit = createMockZombie('z1');
      const targets = [
        createMockEnemy('e1', { type: EnemyType.SOLDIER }),
        createMockEnemy('e2', { type: EnemyType.ARCHER }),
        createMockEnemy('e3', { type: EnemyType.KNIGHT }),
      ];

      const sorted = prioritizeTargets(targets, TargetPriority.RANGED, unit);

      expect(sorted[0].id).toBe('e2'); // Archer (ranged)
    });
  });
});

// ============================================================================
// SELECT TARGET TESTS
// ============================================================================

describe('selectTarget', () => {
  it('selects closest target for CLOSEST priority', () => {
    const unit = createMockZombie('z1', { position: { x: 0, y: 0 } });
    const targets = [
      createMockEnemy('e1', { position: { x: 5, y: 0 } }),
      createMockEnemy('e2', { position: { x: 2, y: 0 } }),
    ];

    const selected = selectTarget(unit, targets, TargetPriority.CLOSEST);

    expect(selected?.id).toBe('e2');
  });

  it('selects weakest target for WEAKEST priority', () => {
    const unit = createMockZombie('z1');
    const targets = [
      createMockEnemy('e1', {
        stats: { ...createMockEnemy('e1').stats, hp: 50 },
      }),
      createMockEnemy('e2', {
        stats: { ...createMockEnemy('e2').stats, hp: 20 },
      }),
    ];

    const selected = selectTarget(unit, targets, TargetPriority.WEAKEST);

    expect(selected?.id).toBe('e2');
  });

  it('returns null if no targets available', () => {
    const unit = createMockZombie('z1');
    const targets: Enemy[] = [];

    const selected = selectTarget(unit, targets, TargetPriority.CLOSEST);

    expect(selected).toBeNull();
  });

  it('excludes dead targets', () => {
    const unit = createMockZombie('z1', { position: { x: 0, y: 0 } });
    const targets = [
      createMockEnemy('e1', { position: { x: 2, y: 0 }, isDead: true }),
      createMockEnemy('e2', { position: { x: 5, y: 0 } }),
    ];

    const selected = selectTarget(unit, targets, TargetPriority.CLOSEST);

    expect(selected?.id).toBe('e2');
  });
});

// ============================================================================
// RE-TARGETING TESTS
// ============================================================================

describe('shouldRetarget', () => {
  it('returns true if current target is dead', () => {
    const unit = createMockZombie('z1', { targetId: 'e1' });
    const currentTarget = createMockEnemy('e1', { isDead: true });
    const allTargets = [currentTarget];

    const result = shouldRetarget(unit, currentTarget, allTargets);

    expect(result).toBe(true);
  });

  it('returns true if current target is null', () => {
    const unit = createMockZombie('z1', { targetId: null });
    const allTargets = [createMockEnemy('e1')];

    const result = shouldRetarget(unit, null, allTargets);

    expect(result).toBe(true);
  });

  it('returns false if current target is alive and valid', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 15 }, // Enough range
      targetId: 'e1',
    });
    const currentTarget = createMockEnemy('e1', {
      position: { x: 10, y: 0 }, // Within range
      isDead: false,
    });
    const allTargets = [currentTarget];

    const result = shouldRetarget(unit, currentTarget, allTargets);

    expect(result).toBe(false);
  });

  it('returns true if current target is out of range', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 2 },
      targetId: 'e1',
    });
    const currentTarget = createMockEnemy('e1', {
      position: { x: 10, y: 0 }, // Out of range
    });
    const allTargets = [currentTarget];

    const result = shouldRetarget(unit, currentTarget, allTargets);

    expect(result).toBe(true);
  });

  it('returns true if higher priority target is available (for aggressive AI)', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 10 },
      targetId: 'e1',
    });
    const currentTarget = createMockEnemy('e1', {
      position: { x: 5, y: 0 },
      stats: { ...createMockEnemy('e1').stats, hp: 100 },
    });
    const higherPriorityTarget = createMockEnemy('e2', {
      position: { x: 2, y: 0 }, // Closer
      stats: { ...createMockEnemy('e2').stats, hp: 20 }, // Weaker
    });
    const allTargets = [currentTarget, higherPriorityTarget];

    // For WEAKEST priority, should retarget to weaker enemy
    const result = shouldRetarget(unit, currentTarget, allTargets, TargetPriority.WEAKEST);

    expect(result).toBe(true);
  });

  it('returns false if current target is still best match', () => {
    const unit = createMockZombie('z1', {
      position: { x: 0, y: 0 },
      stats: { ...createMockZombie('z1').stats, range: 15 }, // Enough range
      targetId: 'e1',
    });
    const currentTarget = createMockEnemy('e1', {
      position: { x: 2, y: 0 }, // 2 units away
    });
    const allTargets = [
      currentTarget,
      createMockEnemy('e2', { position: { x: 10, y: 0 } }), // 10 units away
    ];

    const result = shouldRetarget(unit, currentTarget, allTargets, TargetPriority.CLOSEST);

    expect(result).toBe(false); // e1 is still closest, and e2 is not 3+ tiles closer
  });
});

// ============================================================================
// AoE TARGET SELECTION TESTS
// ============================================================================

describe('getTargetsInRadius', () => {
  it('finds all targets within radius of center point', () => {
    const center = { x: 5, y: 5 };
    const radius = 3;
    const targets = [
      createMockEnemy('e1', { position: { x: 5, y: 5 } }), // Center
      createMockEnemy('e2', { position: { x: 7, y: 5 } }), // 2 units away
      createMockEnemy('e3', { position: { x: 10, y: 10 } }), // Far away
      createMockEnemy('e4', { position: { x: 5, y: 7 } }), // 2 units away
    ];

    const inRadius = getTargetsInRadius(center, radius, targets);

    expect(inRadius).toHaveLength(3);
    expect(inRadius.map((t) => t.id)).toContain('e1');
    expect(inRadius.map((t) => t.id)).toContain('e2');
    expect(inRadius.map((t) => t.id)).toContain('e4');
    expect(inRadius.map((t) => t.id)).not.toContain('e3');
  });

  it('excludes dead targets', () => {
    const center = { x: 5, y: 5 };
    const radius = 3;
    const targets = [
      createMockEnemy('e1', { position: { x: 5, y: 5 } }),
      createMockEnemy('e2', { position: { x: 7, y: 5 }, isDead: true }),
    ];

    const inRadius = getTargetsInRadius(center, radius, targets);

    expect(inRadius).toHaveLength(1);
    expect(inRadius[0].id).toBe('e1');
  });

  it('returns empty array if no targets in radius', () => {
    const center = { x: 0, y: 0 };
    const radius = 2;
    const targets = [createMockEnemy('e1', { position: { x: 10, y: 10 } })];

    const inRadius = getTargetsInRadius(center, radius, targets);

    expect(inRadius).toHaveLength(0);
  });
});
