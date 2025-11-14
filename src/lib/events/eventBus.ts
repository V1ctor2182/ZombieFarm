/**
 * Event Bus
 *
 * Global event bus for cross-module communication and event-driven architecture.
 * Works alongside XState game machine to enable loose coupling between modules.
 *
 * Features:
 * - Type-safe event subscription and dispatch
 * - Event namespacing for module separation
 * - Priority-based handler execution
 * - Event history for debugging
 * - Wildcard subscriptions
 * - Automatic cleanup via AbortController
 *
 * Architecture:
 * - XState machine handles CORE game state transitions
 * - EventBus handles CROSS-MODULE communication (farm <-> combat <-> ui)
 * - Both systems work together: events can flow through both
 */

import type { GameEvent } from '../../types/events';

/**
 * Event Handler Function
 */
export type EventHandler<T = GameEvent> = (event: T) => void | Promise<void>;

/**
 * Event Subscription Options
 */
export interface SubscriptionOptions {
  /**
   * Priority for handler execution (higher = earlier)
   * Default: 0
   */
  priority?: number;

  /**
   * AbortSignal for automatic cleanup
   */
  signal?: AbortSignal;

  /**
   * Handler identifier for debugging
   */
  id?: string;
}

/**
 * Internal Subscription Record
 */
interface Subscription {
  handler: EventHandler;
  priority: number;
  id: string;
  signal?: AbortSignal;
}

/**
 * Event History Entry
 */
export interface EventHistoryEntry {
  event: GameEvent;
  timestamp: number;
  handlerCount: number;
}

/**
 * Event Bus Statistics
 */
export interface EventBusStats {
  totalEvents: number;
  totalSubscriptions: number;
  eventCounts: Record<string, number>;
  lastEvent: GameEvent | null;
  lastEventTimestamp: number;
}

/**
 * EventBus Class
 *
 * Singleton event bus for the game.
 */
export class EventBus {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private wildcardSubscriptions: Subscription[] = [];
  private history: EventHistoryEntry[] = [];
  private maxHistorySize: number = 100;
  private totalEventsDispatched: number = 0;
  private isEnabled: boolean = true;

  /**
   * Subscribe to a specific event type
   *
   * @param eventType - Event type to listen for (e.g., 'zombie.harvested')
   * @param handler - Handler function
   * @param options - Subscription options
   * @returns Unsubscribe function
   *
   * @example
   * ```ts
   * const unsubscribe = eventBus.on('zombie.harvested', (event) => {
   *   console.log('Zombie harvested:', event.payload.zombieId);
   * });
   *
   * // Later, cleanup
   * unsubscribe();
   * ```
   */
  on<T extends GameEvent = GameEvent>(
    eventType: T['type'] | '*',
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    const subscription: Subscription = {
      handler: handler as EventHandler,
      priority: options.priority ?? 0,
      id: options.id ?? this.generateSubscriptionId(),
      signal: options.signal,
    };

    // Handle abort signal
    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        this.off(eventType, handler as EventHandler);
      });
    }

    // Add to subscriptions
    if (eventType === '*') {
      this.wildcardSubscriptions.push(subscription);
      this.wildcardSubscriptions.sort((a, b) => b.priority - a.priority);
    } else {
      const subs = this.subscriptions.get(eventType) || [];
      subs.push(subscription);
      subs.sort((a, b) => b.priority - a.priority);
      this.subscriptions.set(eventType, subs);
    }

    // Return unsubscribe function
    return () => this.off(eventType, handler as EventHandler);
  }

  /**
   * Subscribe to event with automatic cleanup after first trigger
   *
   * @param eventType - Event type to listen for
   * @param handler - Handler function
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  once<T extends GameEvent = GameEvent>(
    eventType: T['type'],
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    const wrappedHandler: EventHandler<T> = (event) => {
      handler(event);
      this.off(eventType, wrappedHandler as EventHandler);
    };

    return this.on(eventType, wrappedHandler, options);
  }

  /**
   * Unsubscribe from an event
   *
   * @param eventType - Event type
   * @param handler - Handler to remove
   */
  off<T extends GameEvent = GameEvent>(
    eventType: T['type'] | '*',
    handler: EventHandler<T>
  ): void {
    if (eventType === '*') {
      this.wildcardSubscriptions = this.wildcardSubscriptions.filter(
        (sub) => sub.handler !== handler
      );
    } else {
      const subs = this.subscriptions.get(eventType);
      if (subs) {
        const filtered = subs.filter((sub) => sub.handler !== handler);
        if (filtered.length === 0) {
          this.subscriptions.delete(eventType);
        } else {
          this.subscriptions.set(eventType, filtered);
        }
      }
    }
  }

  /**
   * Dispatch an event to all subscribers
   *
   * @param event - Event to dispatch
   * @returns Promise that resolves when all handlers complete
   *
   * @example
   * ```ts
   * await eventBus.dispatch({
   *   type: 'zombie.harvested',
   *   payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() }
   * });
   * ```
   */
  async dispatch(event: GameEvent): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    // Get all relevant handlers
    const handlers = this.getHandlersForEvent(event);

    // Add to history
    this.addToHistory(event, handlers.length);

    // Increment counter
    this.totalEventsDispatched++;

    // Execute handlers in priority order
    for (const subscription of handlers) {
      // Skip if signal was aborted
      if (subscription.signal?.aborted) {
        this.off(event.type, subscription.handler);
        continue;
      }

      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(
          `[EventBus] Error in handler ${subscription.id} for event ${event.type}:`,
          error
        );
      }
    }
  }

  /**
   * Dispatch event synchronously (fire and forget)
   *
   * @param event - Event to dispatch
   */
  emit(event: GameEvent): void {
    // Don't await - fire and forget
    this.dispatch(event).catch((error) => {
      console.error('[EventBus] Error dispatching event:', error);
    });
  }

  /**
   * Get event history
   *
   * @param limit - Maximum number of entries to return
   * @returns Array of history entries
   */
  getHistory(limit?: number): EventHistoryEntry[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Get statistics about the event bus
   *
   * @returns Event bus statistics
   */
  getStats(): EventBusStats {
    const eventCounts: Record<string, number> = {};

    for (const entry of this.history) {
      const type = entry.event.type;
      eventCounts[type] = (eventCounts[type] || 0) + 1;
    }

    const lastEntry = this.history[this.history.length - 1];

    return {
      totalEvents: this.totalEventsDispatched,
      totalSubscriptions: this.getTotalSubscriptionCount(),
      eventCounts,
      lastEvent: lastEntry?.event || null,
      lastEventTimestamp: lastEntry?.timestamp || 0,
    };
  }

  /**
   * Enable or disable event bus
   *
   * @param enabled - Whether to enable the bus
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if event bus is enabled
   *
   * @returns True if enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
    this.wildcardSubscriptions = [];
  }

  /**
   * Get all handlers for an event (including wildcards)
   *
   * @param event - Event to get handlers for
   * @returns Array of subscriptions
   */
  private getHandlersForEvent(event: GameEvent): Subscription[] {
    const specific = this.subscriptions.get(event.type) || [];
    const all = [...specific, ...this.wildcardSubscriptions];

    // Sort by priority (already sorted in each array, but need combined sort)
    all.sort((a, b) => b.priority - a.priority);

    return all;
  }

  /**
   * Add event to history
   *
   * @param event - Event to add
   * @param handlerCount - Number of handlers that will process it
   */
  private addToHistory(event: GameEvent, handlerCount: number): void {
    this.history.push({
      event,
      timestamp: Date.now(),
      handlerCount,
    });

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get total number of subscriptions
   */
  private getTotalSubscriptionCount(): number {
    let count = this.wildcardSubscriptions.length;

    for (const subs of this.subscriptions.values()) {
      count += subs.length;
    }

    return count;
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();

/**
 * Type-safe event dispatcher (convenience function)
 *
 * @param event - Event to dispatch
 * @returns Promise that resolves when all handlers complete
 */
export const dispatchEvent = (event: GameEvent): Promise<void> => {
  return eventBus.dispatch(event);
};

/**
 * Type-safe event emitter (fire and forget)
 *
 * @param event - Event to emit
 */
export const emitEvent = (event: GameEvent): void => {
  eventBus.emit(event);
};
