/**
 * 2D Side-Scrolling Combat Engine
 * Real-time combat where zombies advance from left, enemies from right
 * No turns - pure action!
 */

import { Zombie, ZombieType, ZombieStatus } from "../../game/types/zombies";

export interface BattlefieldConfig {
  width: number;
  height: number;
  lanes: number;
  gravity: number;
  friction: number;
}

export interface CombatUnit {
  id: string;
  type: 'zombie' | 'enemy';
  name: string;

  // Position & Movement
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  lane: number;
  facing: 'left' | 'right';

  // Combat Stats
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;

  // State
  state: 'idle' | 'moving' | 'attacking' | 'hurt' | 'dead';
  attackCooldown: number;
  stunDuration: number;

  // Visuals
  sprite?: any;
  width: number;
  height: number;

  // AI behavior
  ai: 'aggressive' | 'defensive' | 'ranged' | 'support';
  targetId?: string;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  type: 'arrow' | 'spit' | 'magic';
  piercing: boolean;
}

export interface BattleState {
  id: string;
  status: 'preparing' | 'fighting' | 'victory' | 'defeat';

  // Battlefield
  config: BattlefieldConfig;

  // Units
  zombies: CombatUnit[];
  enemies: CombatUnit[];
  projectiles: Projectile[];

  // Progress
  elapsedTime: number;
  leftBaseHealth: number;  // Your base
  rightBaseHealth: number; // Enemy base

  // Effects
  particles: Particle[];
  shakeIntensity: number;

  // Results (permanent consequences!)
  deadZombies: string[];
  injuredZombies: { id: string; injuries: any[] }[];
  loot: any[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'blood' | 'dust' | 'spark';
  lifetime: number;
}

export class CombatEngine {
  private state: BattleState;
  private updateInterval?: number;
  private onUpdate?: (state: BattleState) => void;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): BattleState {
    return {
      id: `battle_${Date.now()}`,
      status: 'preparing',

      config: {
        width: 1200,
        height: 400,
        lanes: 3,
        gravity: 0.5,
        friction: 0.9
      },

      zombies: [],
      enemies: [],
      projectiles: [],

      elapsedTime: 0,
      leftBaseHealth: 100,
      rightBaseHealth: 100,

      particles: [],
      shakeIntensity: 0,

      deadZombies: [],
      injuredZombies: [],
      loot: []
    };
  }

  /**
   * Deploy zombies for battle
   */
  deployZombies(zombies: Zombie[]): void {
    const laneHeight = this.state.config.height / this.state.config.lanes;

    zombies.forEach((zombie, index) => {
      const lane = index % this.state.config.lanes;
      const unit: CombatUnit = {
        id: zombie.id,
        type: 'zombie',
        name: zombie.type,

        // Start from left side
        x: 50 + (index * 30),
        y: (lane + 0.5) * laneHeight,
        vx: 0,
        vy: 0,
        lane,
        facing: 'right',

        // Use zombie's actual stats
        hp: zombie.currentHP,
        maxHp: zombie.maxHP,
        attack: zombie.attack,
        defense: zombie.defense,
        speed: zombie.speed,

        state: 'idle',
        attackCooldown: 0,
        stunDuration: 0,

        width: 32,
        height: 32,

        ai: this.getZombieAI(zombie.type),
        targetId: undefined
      };

      this.state.zombies.push(unit);
    });
  }

  /**
   * Spawn enemy defenders
   */
  spawnEnemies(difficulty: number): void {
    const enemyCount = 3 + Math.floor(difficulty * 2);
    const laneHeight = this.state.config.height / this.state.config.lanes;

    for (let i = 0; i < enemyCount; i++) {
      const lane = i % this.state.config.lanes;
      const enemy: CombatUnit = {
        id: `enemy_${i}`,
        type: 'enemy',
        name: this.getEnemyType(difficulty),

        // Start from right side
        x: this.state.config.width - 50 - (i * 30),
        y: (lane + 0.5) * laneHeight,
        vx: 0,
        vy: 0,
        lane,
        facing: 'left',

        hp: 50 + (difficulty * 20),
        maxHp: 50 + (difficulty * 20),
        attack: 10 + (difficulty * 5),
        defense: 5 + (difficulty * 2),
        speed: 3 + difficulty,

        state: 'idle',
        attackCooldown: 0,
        stunDuration: 0,

        width: 32,
        height: 32,

        ai: 'aggressive',
        targetId: undefined
      };

      this.state.enemies.push(enemy);
    }
  }

  /**
   * Start the battle!
   */
  startBattle(onUpdate?: (state: BattleState) => void): void {
    this.state.status = 'fighting';
    this.onUpdate = onUpdate;

    // Run at 60 FPS
    this.updateInterval = window.setInterval(() => {
      this.update(1/60);
    }, 16);

    console.log("⚔️ BATTLE STARTED!");
  }

  /**
   * Main update loop
   */
  private update(deltaTime: number): void {
    if (this.state.status !== 'fighting') return;

    this.state.elapsedTime += deltaTime;

    // Update all units
    [...this.state.zombies, ...this.state.enemies].forEach(unit => {
      if (unit.state !== 'dead') {
        this.updateUnit(unit, deltaTime);
      }
    });

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Check victory/defeat
    this.checkBattleEnd();

    // Update particles
    this.updateParticles(deltaTime);

    // Decay screen shake
    this.state.shakeIntensity *= 0.95;

    // Callback
    if (this.onUpdate) {
      this.onUpdate(this.state);
    }
  }

  /**
   * Update a single unit
   */
  private updateUnit(unit: CombatUnit, deltaTime: number): void {
    // Reduce cooldowns
    unit.attackCooldown = Math.max(0, unit.attackCooldown - deltaTime);
    unit.stunDuration = Math.max(0, unit.stunDuration - deltaTime);

    if (unit.stunDuration > 0) {
      unit.state = 'hurt';
      return;
    }

    // Find target
    const enemies = unit.type === 'zombie' ? this.state.enemies : this.state.zombies;
    const validEnemies = enemies.filter(e => e.state !== 'dead');

    if (validEnemies.length === 0) {
      // No enemies, move to enemy base
      unit.state = 'moving';
      const targetX = unit.type === 'zombie' ? this.state.config.width - 50 : 50;

      if (Math.abs(unit.x - targetX) > 5) {
        unit.vx = unit.facing === 'right' ? unit.speed : -unit.speed;
      } else {
        // Reached enemy base - attack it!
        this.attackBase(unit);
      }
    } else {
      // Find closest enemy in same or adjacent lane
      const target = this.findClosestEnemy(unit, validEnemies);

      if (target) {
        unit.targetId = target.id;
        const distance = Math.abs(unit.x - target.x);

        // Check if in attack range
        const attackRange = unit.ai === 'ranged' ? 200 : 40;

        if (distance <= attackRange) {
          // Attack!
          if (unit.attackCooldown <= 0) {
            this.performAttack(unit, target);
          } else {
            unit.state = 'idle';
          }
        } else {
          // Move towards target
          unit.state = 'moving';
          unit.vx = unit.x < target.x ? unit.speed : -unit.speed;
          unit.facing = unit.x < target.x ? 'right' : 'left';
        }
      } else {
        // No valid target, advance
        unit.state = 'moving';
        unit.vx = unit.facing === 'right' ? unit.speed : -unit.speed;
      }
    }

    // Apply physics
    unit.x += unit.vx * deltaTime * 60;
    unit.y += unit.vy * deltaTime * 60;

    // Apply friction
    unit.vx *= this.state.config.friction;
    unit.vy *= this.state.config.friction;

    // Keep in bounds
    unit.x = Math.max(0, Math.min(this.state.config.width, unit.x));
    unit.y = Math.max(0, Math.min(this.state.config.height, unit.y));
  }

  /**
   * Perform an attack
   */
  private performAttack(attacker: CombatUnit, target: CombatUnit): void {
    attacker.state = 'attacking';
    attacker.attackCooldown = 1.0; // 1 second cooldown

    if (attacker.ai === 'ranged') {
      // Create projectile
      this.createProjectile(attacker, target);
    } else {
      // Melee attack
      const damage = Math.max(1, attacker.attack - target.defense * 0.5);
      this.dealDamage(target, damage);

      // Knockback
      const knockback = attacker.attack / 10;
      target.vx = attacker.facing === 'right' ? knockback * 10 : -knockback * 10;

      // Screen shake on hit
      this.state.shakeIntensity = Math.min(10, this.state.shakeIntensity + 2);
    }

    // Special abilities based on zombie type
    this.triggerSpecialAbility(attacker, target);
  }

  /**
   * Deal damage to a unit
   */
  private dealDamage(unit: CombatUnit, damage: number): void {
    unit.hp -= damage;
    unit.state = 'hurt';
    unit.stunDuration = 0.2; // Brief stun

    // Create blood particles
    for (let i = 0; i < 5; i++) {
      this.state.particles.push({
        x: unit.x,
        y: unit.y,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 5,
        type: 'blood',
        lifetime: 1.0
      });
    }

    // Check if dead
    if (unit.hp <= 0) {
      unit.state = 'dead';

      // PERMANENT DEATH FOR ZOMBIES!
      if (unit.type === 'zombie') {
        this.state.deadZombies.push(unit.id);
        console.log(`💀 ZOMBIE ${unit.name} HAS DIED PERMANENTLY!`);
      } else {
        // Enemy died, add loot
        this.state.loot.push({
          type: 'coins',
          amount: Math.floor(Math.random() * 10 + 5)
        });
      }
    } else if (unit.hp < unit.maxHp * 0.3 && unit.type === 'zombie') {
      // Zombie is heavily injured - permanent consequences
      const existing = this.state.injuredZombies.find(z => z.id === unit.id);
      if (!existing) {
        this.state.injuredZombies.push({
          id: unit.id,
          injuries: [{
            type: 'battle_scar',
            severity: 1 - (unit.hp / unit.maxHp)
          }]
        });
      }
    }
  }

  /**
   * Create a projectile
   */
  private createProjectile(shooter: CombatUnit, target: CombatUnit): void {
    const angle = Math.atan2(target.y - shooter.y, target.x - shooter.x);
    const speed = 8;

    this.state.projectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      ownerId: shooter.id,
      x: shooter.x,
      y: shooter.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: shooter.attack,
      type: shooter.ai === 'ranged' ? 'spit' : 'arrow',
      piercing: false
    });
  }

  /**
   * Update projectiles
   */
  private updateProjectiles(deltaTime: number): void {
    this.state.projectiles = this.state.projectiles.filter(proj => {
      // Move projectile
      proj.x += proj.vx * deltaTime * 60;
      proj.y += proj.vy * deltaTime * 60;

      // Check if out of bounds
      if (proj.x < 0 || proj.x > this.state.config.width ||
          proj.y < 0 || proj.y > this.state.config.height) {
        return false; // Remove projectile
      }

      // Check for hits
      const targets = [...this.state.zombies, ...this.state.enemies]
        .filter(u => u.state !== 'dead' && u.id !== proj.ownerId);

      for (const target of targets) {
        const dist = Math.sqrt(
          Math.pow(target.x - proj.x, 2) +
          Math.pow(target.y - proj.y, 2)
        );

        if (dist < 20) {
          // Hit!
          this.dealDamage(target, proj.damage);
          return !proj.piercing; // Remove if not piercing
        }
      }

      return true; // Keep projectile
    });
  }

  /**
   * Check unit collisions
   */
  private checkCollisions(): void {
    // Simple collision between units
    const allUnits = [...this.state.zombies, ...this.state.enemies]
      .filter(u => u.state !== 'dead');

    for (let i = 0; i < allUnits.length; i++) {
      for (let j = i + 1; j < allUnits.length; j++) {
        const a = allUnits[i];
        const b = allUnits[j];

        const dist = Math.sqrt(
          Math.pow(a.x - b.x, 2) +
          Math.pow(a.y - b.y, 2)
        );

        if (dist < 30 && Math.abs(a.lane - b.lane) < 0.5) {
          // Push apart
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          const force = (30 - dist) / 2;

          a.vx -= Math.cos(angle) * force;
          b.vx += Math.cos(angle) * force;
        }
      }
    }
  }

  /**
   * Attack base
   */
  private attackBase(unit: CombatUnit): void {
    if (unit.attackCooldown <= 0) {
      const damage = unit.attack / 2;

      if (unit.type === 'zombie') {
        this.state.rightBaseHealth -= damage;
      } else {
        this.state.leftBaseHealth -= damage;
      }

      unit.attackCooldown = 1.0;
      this.state.shakeIntensity = 5;
    }
  }

  /**
   * Check if battle has ended
   */
  private checkBattleEnd(): void {
    // Check base health
    if (this.state.rightBaseHealth <= 0) {
      this.endBattle('victory');
    } else if (this.state.leftBaseHealth <= 0) {
      this.endBattle('defeat');
    }

    // Check if all zombies are dead
    const aliveZombies = this.state.zombies.filter(z => z.state !== 'dead');
    if (aliveZombies.length === 0) {
      this.endBattle('defeat');
    }

    // Check if all enemies are dead and no base damage
    const aliveEnemies = this.state.enemies.filter(e => e.state !== 'dead');
    if (aliveEnemies.length === 0 && this.state.rightBaseHealth > 0) {
      this.endBattle('victory');
    }
  }

  /**
   * End the battle
   */
  private endBattle(result: 'victory' | 'defeat'): void {
    this.state.status = result;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    console.log(`⚔️ BATTLE ${result.toUpperCase()}!`);

    if (result === 'victory') {
      console.log(`🏆 Loot gained:`, this.state.loot);
    } else {
      console.log(`💀 Zombies lost forever:`, this.state.deadZombies);
    }

    console.log(`🩹 Injured zombies:`, this.state.injuredZombies);
  }

  /**
   * Update particles
   */
  private updateParticles(deltaTime: number): void {
    this.state.particles = this.state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += this.state.config.gravity;
      p.lifetime -= deltaTime;

      return p.lifetime > 0;
    });
  }

  /**
   * Get AI type for zombie
   */
  private getZombieAI(type: ZombieType): CombatUnit['ai'] {
    switch (type) {
      case ZombieType.PUMPKIN_HEAD:
      case ZombieType.ZOMBIE_GIRL:
        return 'ranged';
      case ZombieType.GARDENER:
        return 'support';
      case ZombieType.HEADLESS:
        return 'defensive';
      default:
        return 'aggressive';
    }
  }

  /**
   * Get enemy type based on difficulty
   */
  private getEnemyType(difficulty: number): string {
    const types = ['Peasant', 'Guard', 'Knight', 'Archer', 'Mage'];
    return types[Math.min(difficulty, types.length - 1)];
  }

  /**
   * Find closest enemy
   */
  private findClosestEnemy(unit: CombatUnit, enemies: CombatUnit[]): CombatUnit | null {
    let closest: CombatUnit | null = null;
    let minDist = Infinity;

    enemies.forEach(enemy => {
      const laneDiff = Math.abs(enemy.lane - unit.lane);
      if (laneDiff <= 1) { // Same or adjacent lane
        const dist = Math.abs(enemy.x - unit.x) + laneDiff * 50; // Penalize lane switches
        if (dist < minDist) {
          minDist = dist;
          closest = enemy;
        }
      }
    });

    return closest;
  }

  /**
   * Trigger special abilities
   */
  private triggerSpecialAbility(attacker: CombatUnit, target: CombatUnit): void {
    // Zombie-specific abilities
    if (attacker.type === 'zombie') {
      switch (attacker.name) {
        case ZombieType.MONSTER:
          // Explode when low health
          if (attacker.hp < attacker.maxHp * 0.3 && Math.random() < 0.3) {
            console.log("💥 MONSTER ZOMBIE SELF-DESTRUCTS!");
            const enemies = this.state.enemies.filter(e => e.state !== 'dead');
            enemies.forEach(enemy => {
              const dist = Math.sqrt(
                Math.pow(enemy.x - attacker.x, 2) +
                Math.pow(enemy.y - attacker.y, 2)
              );
              if (dist < 100) {
                this.dealDamage(enemy, attacker.attack * 3);
              }
            });
            attacker.hp = 0;
            attacker.state = 'dead';
          }
          break;

        case ZombieType.GARDENER:
          // Heal nearby zombies
          if (Math.random() < 0.1) {
            const allies = this.state.zombies.filter(z =>
              z.state !== 'dead' && z.id !== attacker.id
            );
            allies.forEach(ally => {
              const dist = Math.sqrt(
                Math.pow(ally.x - attacker.x, 2) +
                Math.pow(ally.y - attacker.y, 2)
              );
              if (dist < 80) {
                ally.hp = Math.min(ally.maxHp, ally.hp + 5);
              }
            });
          }
          break;
      }
    }
  }

  /**
   * Get current battle state
   */
  getState(): BattleState {
    return this.state;
  }

  /**
   * Stop the battle
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }
}

// Export singleton
export const combatEngine = new CombatEngine();