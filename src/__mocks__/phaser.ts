/**
 * Phaser Mock
 *
 * Mock implementation of Phaser for Jest tests.
 * Phaser uses canvas APIs that are not available in jsdom, so we mock it
 * to prevent errors when rendering components that use Phaser.
 *
 * This is a minimal mock - add more as needed when testing Phaser-specific logic.
 */

export default {
  Game: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    scene: {
      add: jest.fn(),
      remove: jest.fn(),
      start: jest.fn(),
    },
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  })),
  Scene: jest.fn(),
  AUTO: 'AUTO',
  CANVAS: 'CANVAS',
  WEBGL: 'WEBGL',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH',
  },
};
