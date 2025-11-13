/**
 * Character Controller for Zombie Farm
 * Implements Stardew Valley-style WASD movement for the necromancer character
 */

import * as Phaser from "phaser";

export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  IDLE = "idle"
}

export interface CharacterConfig {
  speed: number;
  runSpeed: number;
  spriteKey: string;
  startPosition: { x: number; y: number };
  collisionRadius: number;
}

export class CharacterController {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: any;

  private speed: number;
  private runSpeed: number;
  private isRunning: boolean = false;
  private direction: Direction = Direction.DOWN;
  private isMoving: boolean = false;

  // Interaction system
  private interactionKey?: Phaser.Input.Keyboard.Key;
  private nearbyInteractables: any[] = [];

  // Character state
  public position: { x: number; y: number };
  public health: number = 100;
  public maxHealth: number = 100;
  public energy: number = 100;
  public maxEnergy: number = 100;

  constructor(scene: Phaser.Scene, config: CharacterConfig) {
    this.scene = scene;
    this.speed = config.speed || 160;
    this.runSpeed = config.runSpeed || 240;
    this.position = config.startPosition;

    // Create the necromancer sprite
    this.sprite = scene.add.sprite(
      config.startPosition.x,
      config.startPosition.y,
      config.spriteKey || 'necromancer'
    );

    // Set up physics
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(16, 16); // Collision box size
    body.setOffset(8, 16); // Offset for feet collision

    // Set up controls
    this.setupControls();

    // Set up animations
    this.createAnimations();

    // Camera follow
    scene.cameras.main.startFollow(this.sprite);
    scene.cameras.main.setLerp(0.1, 0.1);
    scene.cameras.main.setZoom(2); // Pixel perfect zoom
  }

  private setupControls(): void {
    // Arrow keys
    this.cursors = this.scene.input.keyboard?.createCursorKeys();

    // WASD keys
    this.wasdKeys = this.scene.input.keyboard?.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      E: Phaser.Input.Keyboard.KeyCodes.E
    });

    // Interaction key
    this.interactionKey = this.wasdKeys.E;
  }

  private createAnimations(): void {
    const anims = this.scene.anims;

    // Walking animations (4 directions)
    const directions = ['up', 'down', 'left', 'right'];

    directions.forEach(dir => {
      // Walking
      anims.create({
        key: `necromancer-walk-${dir}`,
        frames: anims.generateFrameNumbers('necromancer', {
          start: this.getAnimationStart(dir, 'walk'),
          end: this.getAnimationEnd(dir, 'walk')
        }),
        frameRate: 8,
        repeat: -1
      });

      // Running
      anims.create({
        key: `necromancer-run-${dir}`,
        frames: anims.generateFrameNumbers('necromancer', {
          start: this.getAnimationStart(dir, 'run'),
          end: this.getAnimationEnd(dir, 'run')
        }),
        frameRate: 12,
        repeat: -1
      });

      // Idle
      anims.create({
        key: `necromancer-idle-${dir}`,
        frames: anims.generateFrameNumbers('necromancer', {
          start: this.getAnimationStart(dir, 'idle'),
          end: this.getAnimationEnd(dir, 'idle')
        }),
        frameRate: 4,
        repeat: -1
      });
    });
  }

  private getAnimationStart(direction: string, action: string): number {
    // This would map to your actual sprite sheet layout
    const mapping: any = {
      'down-idle': 0,
      'down-walk': 4,
      'down-run': 8,
      'up-idle': 12,
      'up-walk': 16,
      'up-run': 20,
      'left-idle': 24,
      'left-walk': 28,
      'left-run': 32,
      'right-idle': 36,
      'right-walk': 40,
      'right-run': 44
    };
    return mapping[`${direction}-${action}`] || 0;
  }

  private getAnimationEnd(direction: string, action: string): number {
    return this.getAnimationStart(direction, action) + 3;
  }

  public update(delta: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Reset velocity
    body.setVelocity(0);

    // Check for running
    this.isRunning = this.wasdKeys.SHIFT.isDown;
    const currentSpeed = this.isRunning ? this.runSpeed : this.speed;

    // Handle movement input
    let dx = 0;
    let dy = 0;

    // Vertical movement
    if (this.wasdKeys.W.isDown || this.cursors?.up.isDown) {
      dy = -currentSpeed;
      this.direction = Direction.UP;
    } else if (this.wasdKeys.S.isDown || this.cursors?.down.isDown) {
      dy = currentSpeed;
      this.direction = Direction.DOWN;
    }

    // Horizontal movement
    if (this.wasdKeys.A.isDown || this.cursors?.left.isDown) {
      dx = -currentSpeed;
      this.direction = Direction.LEFT;
    } else if (this.wasdKeys.D.isDown || this.cursors?.right.isDown) {
      dx = currentSpeed;
      this.direction = Direction.RIGHT;
    }

    // Apply diagonal movement normalization
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707; // 1/√2
      dy *= 0.707;
    }

    // Set velocity
    body.setVelocity(dx, dy);

    // Update movement state
    this.isMoving = dx !== 0 || dy !== 0;

    // Update position
    this.position.x = this.sprite.x;
    this.position.y = this.sprite.y;

    // Play animations
    this.updateAnimation();

    // Handle interactions
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey!)) {
      this.interact();
    }

    // Update energy (running consumes energy)
    if (this.isRunning && this.isMoving) {
      this.energy = Math.max(0, this.energy - 0.1);
      if (this.energy === 0) {
        this.isRunning = false; // Can't run when exhausted
      }
    } else if (!this.isRunning) {
      this.energy = Math.min(this.maxEnergy, this.energy + 0.05);
    }
  }

  private updateAnimation(): void {
    const action = this.isMoving ? (this.isRunning ? 'run' : 'walk') : 'idle';
    const animKey = `necromancer-${action}-${this.direction}`;

    // Only play new animation if it's different
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey, true);
    }
  }

  private interact(): void {
    console.log('🧟 Interacting at position:', this.position);

    // Check for nearby zombies
    const nearbyZombies = this.findNearbyZombies();
    if (nearbyZombies.length > 0) {
      this.interactWithZombie(nearbyZombies[0]);
      return;
    }

    // Check for nearby buildings
    const nearbyBuildings = this.findNearbyBuildings();
    if (nearbyBuildings.length > 0) {
      this.interactWithBuilding(nearbyBuildings[0]);
      return;
    }

    // Check for harvestable graves
    const nearbyGraves = this.findNearbyGraves();
    if (nearbyGraves.length > 0) {
      this.harvestZombie(nearbyGraves[0]);
      return;
    }
  }

  private findNearbyZombies(): any[] {
    // This would search for zombies within interaction range
    // For now, returning empty array
    return [];
  }

  private findNearbyBuildings(): any[] {
    // This would search for buildings within interaction range
    return [];
  }

  private findNearbyGraves(): any[] {
    // This would search for ready-to-harvest zombie graves
    return [];
  }

  private interactWithZombie(zombie: any): void {
    console.log('🧟 Petting zombie:', zombie);
    // Increase zombie happiness
    // Play petting animation
    // Show heart particle effect
  }

  private interactWithBuilding(building: any): void {
    console.log('🏚️ Entering building:', building);
    // Open building UI
    // Trigger building-specific action
  }

  private harvestZombie(grave: any): void {
    console.log('⚰️ Harvesting zombie from grave:', grave);
    // Trigger harvest event
    // Spawn wandering zombie
    // Play rising animation
  }

  // Utility methods
  public teleportTo(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.position = { x, y };
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);

    // Flash red when damaged
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    if (this.health === 0) {
      this.onDeath();
    }
  }

  private onDeath(): void {
    console.log('💀 Character has died!');
    // Handle character death
    // Show game over screen
    // Respawn at last save point
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);

    // Green flash for healing
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0x00ff00,
      duration: 200,
      yoyo: true
    });
  }

  // Save/Load character state
  public saveState(): any {
    return {
      position: this.position,
      health: this.health,
      maxHealth: this.maxHealth,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      direction: this.direction
    };
  }

  public loadState(state: any): void {
    this.position = state.position;
    this.health = state.health;
    this.maxHealth = state.maxHealth;
    this.energy = state.energy;
    this.maxEnergy = state.maxEnergy;
    this.direction = state.direction;

    this.teleportTo(this.position.x, this.position.y);
  }

  // Cleanup
  public destroy(): void {
    this.sprite.destroy();
  }
}