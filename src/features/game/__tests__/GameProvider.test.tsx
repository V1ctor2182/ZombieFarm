/**
 * GameProvider Tests
 *
 * Test suite for GameProvider React context integration.
 * Tests hooks, context access, and React-XState integration.
 *
 * Following TDD methodology: these tests are written FIRST.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { GameProvider, useGameState, useGameDispatch, useIsState } from '../GameProvider';

describe('GameProvider', () => {
  // ============================================================================
  // PROVIDER INITIALIZATION
  // ============================================================================

  describe('provider initialization', () => {
    it('should render without crashing', () => {
      const TestComponent = () => <div>Test</div>;

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should initialize with loading state', () => {
      const TestComponent = () => {
        const state = useGameState();
        return <div data-testid="state">{state.value}</div>;
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const stateElement = screen.getByTestId('state');
      expect(stateElement.textContent).toBe('loading');
    });

    it('should provide valid context to children', () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();

        return (
          <div>
            <div data-testid="has-state">{state ? 'yes' : 'no'}</div>
            <div data-testid="has-dispatch">{dispatch ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('has-state').textContent).toBe('yes');
      expect(screen.getByTestId('has-dispatch').textContent).toBe('yes');
    });

    it('should throw error when hooks used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      const TestComponent = () => {
        try {
          useGameState();
          return <div>Should not render</div>;
        } catch (error) {
          return <div data-testid="error">Error caught</div>;
        }
      };

      expect(() => render(<TestComponent />)).toThrow();

      console.error = originalError;
    });
  });

  // ============================================================================
  // useGameState HOOK
  // ============================================================================

  describe('useGameState hook', () => {
    it('should return current state snapshot', () => {
      const TestComponent = () => {
        const state = useGameState();
        return (
          <div>
            <div data-testid="state-value">{JSON.stringify(state.value)}</div>
            <div data-testid="player-level">{state.context.player.level}</div>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('state-value')).toBeInTheDocument();
      expect(screen.getByTestId('player-level')).toHaveTextContent('1');
    });

    it('should update when state changes', async () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();

        return (
          <div>
            <div data-testid="state">{state.value}</div>
            <button
              onClick={() =>
                dispatch({ type: 'game.started', payload: { timestamp: Date.now() } })
              }
            >
              Start Game
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const button = screen.getByRole('button', { name: /start game/i });
      const stateElement = screen.getByTestId('state');

      expect(stateElement.textContent).toBe('loading');

      act(() => {
        button.click();
      });

      await waitFor(() => {
        const newState = stateElement.textContent;
        expect(newState).not.toBe('loading');
      });
    });

    it('should provide access to context data', () => {
      const TestComponent = () => {
        const state = useGameState();
        const { player, farm, inventory, time } = state.context;

        return (
          <div>
            <div data-testid="player-name">{player.name}</div>
            <div data-testid="player-level">{player.level}</div>
            <div data-testid="current-day">{time.day}</div>
            <div data-testid="dark-coins">{inventory.currencies.darkCoins}</div>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('player-name')).toBeInTheDocument();
      expect(screen.getByTestId('player-level')).toBeInTheDocument();
      expect(screen.getByTestId('current-day')).toBeInTheDocument();
      expect(screen.getByTestId('dark-coins')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // useGameDispatch HOOK
  // ============================================================================

  describe('useGameDispatch hook', () => {
    it('should return dispatch function', () => {
      const TestComponent = () => {
        const dispatch = useGameDispatch();
        return <div data-testid="has-dispatch">{typeof dispatch === 'function' ? 'yes' : 'no'}</div>;
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('has-dispatch')).toHaveTextContent('yes');
    });

    it('should dispatch events to the machine', async () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();

        return (
          <div>
            <div data-testid="xp">{state.context.player.xp}</div>
            <button
              onClick={() =>
                dispatch({
                  type: 'player.xpGained',
                  payload: { amount: 100, source: 'test', timestamp: Date.now() },
                })
              }
            >
              Gain XP
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const xpElement = screen.getByTestId('xp');
      const button = screen.getByRole('button', { name: /gain xp/i });

      expect(xpElement).toHaveTextContent('0');

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(xpElement).toHaveTextContent('100');
      });
    });

    it('should handle multiple dispatches in sequence', async () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();

        return (
          <div>
            <div data-testid="xp">{state.context.player.xp}</div>
            <button
              onClick={() => {
                dispatch({
                  type: 'player.xpGained',
                  payload: { amount: 50, source: 'test1', timestamp: Date.now() },
                });
                dispatch({
                  type: 'player.xpGained',
                  payload: { amount: 50, source: 'test2', timestamp: Date.now() },
                });
              }}
            >
              Gain XP Twice
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const button = screen.getByRole('button');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('xp')).toHaveTextContent('100');
      });
    });
  });

  // ============================================================================
  // useIsState HOOK
  // ============================================================================

  describe('useIsState hook', () => {
    it('should return true for current state', () => {
      const TestComponent = () => {
        const isLoading = useIsState('loading');
        return <div data-testid="is-loading">{isLoading ? 'yes' : 'no'}</div>;
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('is-loading')).toHaveTextContent('yes');
    });

    it('should return false for non-current state', () => {
      const TestComponent = () => {
        const isFarm = useIsState('farm');
        return <div data-testid="is-farm">{isFarm ? 'yes' : 'no'}</div>;
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('is-farm')).toHaveTextContent('no');
    });

    it('should update when state changes', async () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();
        const isLoading = useIsState('loading');
        const isFarm = useIsState('farm');

        return (
          <div>
            <div data-testid="is-loading">{isLoading ? 'yes' : 'no'}</div>
            <div data-testid="is-farm">{isFarm ? 'yes' : 'no'}</div>
            <button
              onClick={() => {
                dispatch({ type: 'game.started', payload: { timestamp: Date.now() } });
                if (!state.matches('farm')) {
                  dispatch({ type: 'tutorial.completed', payload: { timestamp: Date.now() } });
                }
              }}
            >
              Go to Farm
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('is-loading')).toHaveTextContent('yes');
      expect(screen.getByTestId('is-farm')).toHaveTextContent('no');

      const button = screen.getByRole('button');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('no');
        expect(screen.getByTestId('is-farm')).toHaveTextContent('yes');
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('integration with game flow', () => {
    it('should handle complete game flow from loading to farm', async () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();

        return (
          <div>
            <div data-testid="state">{state.value}</div>
            <div data-testid="xp">{state.context.player.xp}</div>
            {state.matches('loading') && (
              <button onClick={() => dispatch({ type: 'game.started', payload: { timestamp: Date.now() } })}>
                Start
              </button>
            )}
            {state.matches('tutorial') && (
              <button onClick={() => dispatch({ type: 'tutorial.completed', payload: { timestamp: Date.now() } })}>
                Complete Tutorial
              </button>
            )}
            {state.matches('farm') && <div data-testid="farm-ready">Farm Ready</div>}
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Start game
      const startButton = screen.getByRole('button', { name: /start/i });
      act(() => {
        startButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('state').textContent).not.toBe('loading');
      });

      // Complete tutorial if in tutorial state
      const completeTutorialButton = screen.queryByRole('button', { name: /complete tutorial/i });
      if (completeTutorialButton) {
        act(() => {
          completeTutorialButton.click();
        });
      }

      // Should eventually reach farm
      await waitFor(() => {
        expect(screen.getByTestId('farm-ready')).toBeInTheDocument();
      });
    });

    it('should handle pause and resume flow', async () => {
      const TestComponent = () => {
        const state = useGameState();
        const dispatch = useGameDispatch();
        const isPaused = useIsState('paused');

        return (
          <div>
            <div data-testid="is-paused">{isPaused ? 'yes' : 'no'}</div>
            <button
              onClick={() => {
                if (isPaused) {
                  dispatch({ type: 'game.resumed', payload: { timestamp: Date.now() } });
                } else {
                  dispatch({ type: 'game.paused', payload: { timestamp: Date.now() } });
                }
              }}
            >
              Toggle Pause
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('is-paused')).toHaveTextContent('no');

      const button = screen.getByRole('button');

      // Pause
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-paused')).toHaveTextContent('yes');
      });

      // Resume
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-paused')).toHaveTextContent('no');
      });
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('error handling', () => {
    it('should handle invalid events gracefully', () => {
      const TestComponent = () => {
        const dispatch = useGameDispatch();

        return (
          <button
            onClick={() => {
              // Try to dispatch an invalid event
              dispatch({ type: 'invalid.event' as any, payload: {} as any });
            }}
          >
            Invalid Event
          </button>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const button = screen.getByRole('button');

      // Should not crash
      expect(() => {
        act(() => {
          button.click();
        });
      }).not.toThrow();
    });
  });
});
