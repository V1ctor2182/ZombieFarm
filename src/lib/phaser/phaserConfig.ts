/**
 * Phaser Game Configuration
 *
 * Central configuration for the Phaser game engine.
 * This file defines game dimensions, physics settings, and rendering options.
 */

import Phaser from 'phaser';

/**
 * Game dimensions
 * Using 16:9 aspect ratio at 1024x576 for good balance between
 * detail and performance. Can be scaled up for larger displays.
 */
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 576;

/**
 * Phaser Game Configuration
 *
 * @see https://photonstorm.github.io/phaser3-docs/Phaser.Types.Core.html#.GameConfig
 */
export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL with Canvas fallback
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0F0F0F', // Match our dark theme

  // Parent will be set dynamically by PhaserGame component
  parent: '',

  // Scale mode configuration
  scale: {
    mode: Phaser.Scale.FIT, // Fit to parent container while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Physics engine configuration
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 }, // Top-down view, no gravity
      debug: false, // Enable manually if needed for debugging
      fps: 60,
    },
  },

  // Rendering options
  render: {
    pixelArt: true, // Use nearest-neighbor scaling for pixel art
    antialias: false, // Disable for crisp pixel art
    roundPixels: true, // Prevent sub-pixel rendering
  },

  // Performance options
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },

  // Scene configuration
  // Scenes will be added dynamically
  scene: [],

  // Audio configuration
  audio: {
    disableWebAudio: false,
  },

  // DOM configuration
  dom: {
    createContainer: true,
  },
};

/**
 * Create a Phaser game configuration with custom scenes
 *
 * @param scenes - Array of Phaser scenes to register
 * @param parent - HTML element ID or element to use as parent container
 * @returns Complete Phaser game configuration
 */
export function createPhaserConfig(
  scenes: Phaser.Types.Scenes.SceneType[],
  parent: string | HTMLElement
): Phaser.Types.Core.GameConfig {
  return {
    ...phaserConfig,
    parent: typeof parent === 'string' ? parent : undefined,
    scene: scenes,
  };
}
