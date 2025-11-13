/**
 * PhaserGame Component
 *
 * React wrapper component that hosts the Phaser game canvas.
 * Handles lifecycle management (mounting/unmounting) and provides
 * a clean interface between React and Phaser.
 *
 * Usage:
 * ```tsx
 * <PhaserGame scenes={[MyScene]} onGameReady={(game) => {...}} />
 * ```
 */

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserConfig } from './phaserConfig';

interface PhaserGameProps {
  /**
   * Array of Phaser scene classes to register with the game
   */
  scenes: Phaser.Types.Scenes.SceneType[];

  /**
   * Optional callback when Phaser game instance is ready
   */
  onGameReady?: (game: Phaser.Game) => void;

  /**
   * Optional callback when Phaser game is destroyed
   */
  onGameDestroy?: () => void;

  /**
   * Optional CSS class name for the container div
   */
  className?: string;
}

/**
 * PhaserGame Component
 *
 * Wraps a Phaser game instance in a React component.
 * Handles initialization and cleanup automatically.
 */
export function PhaserGame({ scenes, onGameReady, onGameDestroy, className }: PhaserGameProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) {
      return;
    }

    // Create unique ID for this game instance
    const containerId = `phaser-game-${Date.now()}`;
    gameContainerRef.current.id = containerId;

    // Create Phaser game configuration
    const config = createPhaserConfig(scenes, containerId);

    // Initialize Phaser game
    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    // Notify parent component that game is ready
    if (onGameReady) {
      onGameReady(game);
    }

    // eslint-disable-next-line no-console
    console.log('Phaser game initialized');

    // Cleanup function - runs when component unmounts
    return () => {
      // eslint-disable-next-line no-console
      console.log('Destroying Phaser game instance');

      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }

      if (onGameDestroy) {
        onGameDestroy();
      }
    };
  }, [scenes, onGameReady, onGameDestroy]);

  return (
    <div
      ref={gameContainerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
}
