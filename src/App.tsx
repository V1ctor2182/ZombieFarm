/**
 * Main App Component
 *
 * This is the root component of the Zombie Farm application.
 * Currently displays Phaser integration test. Will be replaced with
 * actual game UI once core systems are implemented.
 */

import { useState } from 'react';
import { PhaserGame, TestScene } from '@lib/phaser';
import type Phaser from 'phaser';

export const App = () => {
  const [gameReady, setGameReady] = useState(false);

  const handleGameReady = (game: Phaser.Game) => {
    // eslint-disable-next-line no-console
    console.log('Game instance ready:', game);
    setGameReady(true);
  };

  return (
    <div className="h-screen w-screen bg-dark-bg flex flex-col">
      {/* Header */}
      <header className="hud-element px-6 py-4">
        <h1 className="text-2xl font-bold text-zombie-flesh-400">Zombie Farm</h1>
        <p className="text-sm text-dark-textDim">
          Phase 2 Complete: Tailwind + Phaser {gameReady && '✅'}
        </p>
      </header>

      {/* Game Canvas Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl aspect-video panel">
          <PhaserGame scenes={[TestScene]} onGameReady={handleGameReady} />
        </div>
      </main>

      {/* Footer */}
      <footer className="hud-element px-6 py-3 text-center text-dark-textDim text-sm">
        <p>
          Core Systems: Build Tools ✅ | TypeScript ✅ | React ✅ | Tailwind ✅ | Phaser ✅ | XState
          (pending)
        </p>
      </footer>
    </div>
  );
};
