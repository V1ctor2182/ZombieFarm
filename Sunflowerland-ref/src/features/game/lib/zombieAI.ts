/**
 * Zombie AI System
 * Makes zombies wander around the farm autonomously after harvest
 * This is what brings the farm to life - Stardew Valley style!
 */

import { Zombie, ZombieStatus, ZombieMood } from "../types/zombies";

export interface ZombieAIConfig {
  wanderSpeed: number;
  wanderRadius: number;
  updateInterval: number;
  avoidanceRadius: number;
}

export class ZombieAI {
  private zombies: Map<string, Zombie> = new Map();
  private updateTimer?: number;
  private config: ZombieAIConfig;

  constructor(config?: Partial<ZombieAIConfig>) {
    this.config = {
      wanderSpeed: 0.5,      // Units per second
      wanderRadius: 15,      // Max wander distance
      updateInterval: 100,   // Update every 100ms
      avoidanceRadius: 2,    // Distance to avoid other zombies
      ...config
    };
  }

  /**
   * Start the AI system
   */
  start(): void {
    if (this.updateTimer) return;

    this.updateTimer = window.setInterval(() => {
      this.updateAllZombies();
    }, this.config.updateInterval);

    console.log("🧟 Zombie AI system started");
  }

  /**
   * Stop the AI system
   */
  stop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
    console.log("🧟 Zombie AI system stopped");
  }

  /**
   * Add a zombie to the AI system
   */
  addZombie(zombie: Zombie): void {
    this.zombies.set(zombie.id, zombie);
    console.log(`🧟 Added ${zombie.type} to AI system`);
  }

  /**
   * Remove a zombie from the AI system
   */
  removeZombie(zombieId: string): void {
    this.zombies.delete(zombieId);
  }

  /**
   * Update all zombie behaviors
   */
  private updateAllZombies(): void {
    const deltaTime = this.config.updateInterval / 1000; // Convert to seconds

    this.zombies.forEach(zombie => {
      if (zombie.status === ZombieStatus.WANDERING && zombie.isWandering) {
        this.updateWandering(zombie, deltaTime);
        this.updateMood(zombie);
        this.checkInteractions(zombie);
      }
    });
  }

  /**
   * Update zombie wandering behavior
   */
  private updateWandering(zombie: Zombie, deltaTime: number): void {
    if (!zombie.targetPosition) {
      zombie.targetPosition = this.getNewWanderTarget(zombie);
    }

    // Calculate direction to target
    const dx = zombie.targetPosition.x - zombie.position.x;
    const dy = zombie.targetPosition.y - zombie.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if reached target
    if (distance < 0.5) {
      // Reached target, get new one
      zombie.targetPosition = this.getNewWanderTarget(zombie);

      // Sometimes stop and idle
      if (Math.random() < 0.2) {
        this.makeZombieIdle(zombie);
        return;
      }
    }

    // Move towards target
    if (distance > 0) {
      const moveSpeed = this.getZombieSpeed(zombie) * deltaTime;
      const moveRatio = Math.min(moveSpeed / distance, 1);

      zombie.position.x += dx * moveRatio;
      zombie.position.y += dy * moveRatio;

      // Update facing direction
      this.updateZombieDirection(zombie, dx, dy);
    }

    // Avoid other zombies
    this.applyAvoidance(zombie);
  }

  /**
   * Get new wander target for zombie
   */
  private getNewWanderTarget(zombie: Zombie): { x: number; y: number } {
    // Personality-based wandering
    let radius = this.config.wanderRadius;
    let centerX = zombie.position.x;
    let centerY = zombie.position.y;

    // Different personalities wander differently
    switch (zombie.mood) {
      case ZombieMood.HAPPY:
        radius *= 1.5; // Wander farther when happy
        break;
      case ZombieMood.SAD:
        radius *= 0.5; // Stay close when sad
        break;
      case ZombieMood.ANGRY:
        radius *= 2; // Roam widely when angry
        break;
    }

    // Random point within radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;

    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    };
  }

  /**
   * Get zombie movement speed based on type and mood
   */
  private getZombieSpeed(zombie: Zombie): number {
    let baseSpeed = zombie.speed * this.config.wanderSpeed;

    // Mood affects speed
    switch (zombie.mood) {
      case ZombieMood.HAPPY:
        baseSpeed *= 1.2;
        break;
      case ZombieMood.SAD:
        baseSpeed *= 0.7;
        break;
      case ZombieMood.ANGRY:
        baseSpeed *= 1.5;
        break;
    }

    // Injuries slow zombies
    if (zombie.permanentInjuries.length > 0) {
      baseSpeed *= 0.8;
    }

    return baseSpeed;
  }

  /**
   * Make zombie stop and idle for a bit
   */
  private makeZombieIdle(zombie: Zombie): void {
    // Stop for 2-5 seconds
    const idleTime = 2000 + Math.random() * 3000;

    zombie.targetPosition = undefined;

    setTimeout(() => {
      if (zombie.status === ZombieStatus.WANDERING) {
        zombie.targetPosition = this.getNewWanderTarget(zombie);
      }
    }, idleTime);
  }

  /**
   * Apply avoidance behavior to prevent zombie overlap
   */
  private applyAvoidance(zombie: Zombie): void {
    const avoidanceForce = { x: 0, y: 0 };

    this.zombies.forEach(otherZombie => {
      if (otherZombie.id === zombie.id) return;

      const dx = zombie.position.x - otherZombie.position.x;
      const dy = zombie.position.y - otherZombie.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.avoidanceRadius && distance > 0) {
        // Push away from other zombie
        const force = (this.config.avoidanceRadius - distance) / this.config.avoidanceRadius;
        avoidanceForce.x += (dx / distance) * force * 0.5;
        avoidanceForce.y += (dy / distance) * force * 0.5;
      }
    });

    // Apply avoidance
    zombie.position.x += avoidanceForce.x;
    zombie.position.y += avoidanceForce.y;
  }

  /**
   * Update zombie facing direction
   */
  private updateZombieDirection(zombie: Zombie, dx: number, dy: number): void {
    // Store direction for animation purposes
    if (Math.abs(dx) > Math.abs(dy)) {
      (zombie as any).facing = dx > 0 ? 'right' : 'left';
    } else {
      (zombie as any).facing = dy > 0 ? 'down' : 'up';
    }
  }

  /**
   * Update zombie mood based on conditions
   */
  private updateMood(zombie: Zombie): void {
    // Random mood changes
    if (Math.random() < 0.001) { // 0.1% chance per update
      const moods = [ZombieMood.HAPPY, ZombieMood.NEUTRAL, ZombieMood.SAD, ZombieMood.ANGRY];
      zombie.mood = moods[Math.floor(Math.random() * moods.length)];
    }

    // Low health makes zombies sad
    if (zombie.currentHP < zombie.maxHP * 0.3) {
      zombie.mood = ZombieMood.SAD;
    }

    // Battle scars make zombies angry
    if (zombie.battleScars > 3) {
      zombie.mood = ZombieMood.ANGRY;
    }
  }

  /**
   * Check for special interactions
   */
  private checkInteractions(zombie: Zombie): void {
    // Check if near player for petting
    // This would integrate with the character controller

    // Check if zombies are socializing
    this.zombies.forEach(otherZombie => {
      if (otherZombie.id === zombie.id) return;

      const distance = this.getDistance(zombie.position, otherZombie.position);
      if (distance < 2) {
        // Zombies are socializing!
        if (Math.random() < 0.01) {
          console.log(`🧟 ${zombie.type} is socializing with ${otherZombie.type}`);

          // Mood contagion
          if (otherZombie.mood === ZombieMood.HAPPY && zombie.mood !== ZombieMood.HAPPY) {
            zombie.mood = Math.random() < 0.3 ? ZombieMood.HAPPY : zombie.mood;
          }
        }
      }
    });
  }

  /**
   * Get distance between two points
   */
  private getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get all zombies in radius
   */
  getZombiesInRadius(center: { x: number; y: number }, radius: number): Zombie[] {
    const result: Zombie[] = [];

    this.zombies.forEach(zombie => {
      if (this.getDistance(zombie.position, center) <= radius) {
        result.push(zombie);
      }
    });

    return result;
  }

  /**
   * Command zombies to move to location
   */
  commandZombiesToLocation(zombieIds: string[], target: { x: number; y: number }): void {
    zombieIds.forEach(id => {
      const zombie = this.zombies.get(id);
      if (zombie) {
        zombie.targetPosition = target;
        console.log(`🎯 Commanding ${zombie.type} to move to (${target.x}, ${target.y})`);
      }
    });
  }

  /**
   * Debug: Get current AI state
   */
  getDebugInfo(): any {
    return {
      zombieCount: this.zombies.size,
      isRunning: !!this.updateTimer,
      zombies: Array.from(this.zombies.values()).map(z => ({
        id: z.id,
        type: z.type,
        position: z.position,
        mood: z.mood,
        status: z.status
      }))
    };
  }
}

// Singleton instance
export const zombieAI = new ZombieAI();