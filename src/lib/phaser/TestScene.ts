/**
 * Test Scene for Phaser Integration
 *
 * A simple scene to verify that Phaser is working correctly.
 * This will be replaced with actual game scenes later.
 */

import Phaser from 'phaser';

export class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestScene' });
  }

  preload(): void {
    // No assets to load yet
  }

  create(): void {
    // Add a simple background
    this.add.rectangle(512, 288, 1024, 576, 0x1a1a1a);

    // Add test text
    const titleText = this.add.text(512, 200, 'Phaser 3 Initialized', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#3A4A2D',
    });
    titleText.setOrigin(0.5);

    // Add subtitle
    const subtitleText = this.add.text(512, 270, 'Zombie Farm - Core Systems', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#1FBF1F',
    });
    subtitleText.setOrigin(0.5);

    // Add a pulsing zombie emoji or shape
    const zombieCircle = this.add.circle(512, 380, 40, 0x3a4a2d);

    // Add pulsing animation
    this.tweens.add({
      targets: zombieCircle,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Add instruction text
    const instructionText = this.add.text(
      512,
      480,
      'Phaser integration test successful!\nGame scenes will replace this screen.',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#999999',
        align: 'center',
      }
    );
    instructionText.setOrigin(0.5);

    // Add version info
    this.add.text(10, 10, `Phaser v${Phaser.VERSION}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#666666',
    });

    // Log to console for debugging
    // eslint-disable-next-line no-console
    console.log('TestScene created successfully');
    // eslint-disable-next-line no-console
    console.log('Phaser version:', Phaser.VERSION);
  }

  override update(): void {
    // No update logic needed for test scene
  }
}
