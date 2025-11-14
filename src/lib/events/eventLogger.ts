/**
 * Event Logger
 *
 * Debugging and monitoring utilities for the event bus.
 * Provides console logging, filtering, and analysis tools for events.
 *
 * Features:
 * - Colored console output for events
 * - Event filtering by type or pattern
 * - Event timing and performance tracking
 * - Event replay capabilities
 * - Automatic subscription to event bus
 */

import type { GameEvent } from '../../types/events';
import { eventBus, type EventHistoryEntry } from './eventBus';

/**
 * Logger Configuration
 */
export interface EventLoggerConfig {
  /**
   * Enable logging
   */
  enabled: boolean;

  /**
   * Log all events (or use filters)
   */
  logAll: boolean;

  /**
   * Event types to include (whitelist)
   */
  include?: string[];

  /**
   * Event types to exclude (blacklist)
   */
  exclude?: string[];

  /**
   * Collapse event details in console
   */
  collapsed: boolean;

  /**
   * Track event timing
   */
  trackTiming: boolean;

  /**
   * Maximum events to store in memory
   */
  maxEvents: number;
}

/**
 * Event Timing Record
 */
export interface EventTiming {
  eventType: string;
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

/**
 * EventLogger Class
 *
 * Provides debugging and monitoring for game events.
 */
export class EventLogger {
  private config: EventLoggerConfig = {
    enabled: false,
    logAll: true,
    collapsed: false,
    trackTiming: false,
    maxEvents: 1000,
  };

  private eventTimings: Map<string, number[]> = new Map();
  private unsubscribe?: () => void;

  /**
   * Initialize the event logger
   *
   * @param config - Logger configuration
   */
  constructor(config?: Partial<EventLoggerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Auto-enable in development
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      this.config.enabled = true;
    }

    this.attachToEventBus();
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.config.enabled = true;
    if (!this.unsubscribe) {
      this.attachToEventBus();
    }
  }

  /**
   * Disable logging
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Configure the logger
   *
   * @param config - Partial configuration to update
   */
  configure(config: Partial<EventLoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log a single event manually
   *
   * @param event - Event to log
   */
  logEvent(event: GameEvent): void {
    if (!this.config.enabled) return;

    if (!this.shouldLogEvent(event.type)) return;

    const startTime = performance.now();

    this.printEvent(event);

    if (this.config.trackTiming) {
      const duration = performance.now() - startTime;
      this.recordTiming(event.type, duration);
    }
  }

  /**
   * Get timing statistics for all events
   *
   * @returns Array of timing records
   */
  getTimingStats(): EventTiming[] {
    const stats: EventTiming[] = [];

    for (const [eventType, times] of this.eventTimings.entries()) {
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      stats.push({
        eventType,
        count: times.length,
        totalTime,
        avgTime,
        minTime,
        maxTime,
      });
    }

    // Sort by total time (descending)
    stats.sort((a, b) => b.totalTime - a.totalTime);

    return stats;
  }

  /**
   * Print timing statistics to console
   */
  printTimingStats(): void {
    const stats = this.getTimingStats();

    console.group('📊 Event Timing Statistics');
    console.table(
      stats.map((s) => ({
        'Event Type': s.eventType,
        Count: s.count,
        'Total (ms)': s.totalTime.toFixed(2),
        'Avg (ms)': s.avgTime.toFixed(2),
        'Min (ms)': s.minTime.toFixed(2),
        'Max (ms)': s.maxTime.toFixed(2),
      }))
    );
    console.groupEnd();
  }

  /**
   * Clear timing statistics
   */
  clearTimingStats(): void {
    this.eventTimings.clear();
  }

  /**
   * Print event history from event bus
   *
   * @param limit - Number of recent events to show
   */
  printHistory(limit: number = 20): void {
    const history = eventBus.getHistory(limit);

    console.group(`📜 Event History (last ${limit} events)`);
    for (const entry of history) {
      console.log(
        `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.event.type}`,
        entry.event.payload,
        `(${entry.handlerCount} handlers)`
      );
    }
    console.groupEnd();
  }

  /**
   * Print event bus statistics
   */
  printStats(): void {
    const stats = eventBus.getStats();

    console.group('📈 Event Bus Statistics');
    console.log('Total Events Dispatched:', stats.totalEvents);
    console.log('Total Subscriptions:', stats.totalSubscriptions);
    console.log('Last Event:', stats.lastEvent?.type || 'None');
    console.log(
      'Last Event Time:',
      stats.lastEventTimestamp ? new Date(stats.lastEventTimestamp).toLocaleTimeString() : 'N/A'
    );
    console.log('\nEvent Counts:');
    console.table(stats.eventCounts);
    console.groupEnd();
  }

  /**
   * Filter events by type pattern
   *
   * @param pattern - Regex pattern or string to match
   * @returns Array of matching events from history
   */
  filterEvents(pattern: string | RegExp): EventHistoryEntry[] {
    const history = eventBus.getHistory();
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    return history.filter((entry) => regex.test(entry.event.type));
  }

  /**
   * Replay events from history
   *
   * @param events - Events to replay
   * @param delayMs - Delay between events
   */
  async replayEvents(events: GameEvent[], delayMs: number = 0): Promise<void> {
    console.log(`🔄 Replaying ${events.length} events...`);

    for (const event of events) {
      await eventBus.dispatch(event);

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.log('✅ Replay complete');
  }

  /**
   * Detach from event bus
   */
  detach(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  /**
   * Attach to event bus
   */
  private attachToEventBus(): void {
    // Subscribe to all events
    this.unsubscribe = eventBus.on(
      '*',
      (event: GameEvent) => {
        this.logEvent(event);
      },
      {
        priority: -1000, // Low priority to log after all other handlers
        id: 'event-logger',
      }
    );
  }

  /**
   * Check if event should be logged based on config
   *
   * @param eventType - Event type to check
   * @returns True if should log
   */
  private shouldLogEvent(eventType: string): boolean {
    if (!this.config.enabled) return false;

    // Check exclusions first
    if (this.config.exclude?.some((pattern) => new RegExp(pattern).test(eventType))) {
      return false;
    }

    // If logAll is true, log everything (unless excluded)
    if (this.config.logAll) return true;

    // Otherwise check inclusions
    if (this.config.include?.some((pattern) => new RegExp(pattern).test(eventType))) {
      return true;
    }

    return false;
  }

  /**
   * Print event to console with formatting
   *
   * @param event - Event to print
   */
  private printEvent(event: GameEvent): void {
    const color = this.getEventColor(event.type);
    const icon = this.getEventIcon(event.type);
    const timestamp = new Date().toLocaleTimeString();

    const title = `${icon} [${timestamp}] ${event.type}`;

    if (this.config.collapsed) {
      console.groupCollapsed(`%c${title}`, `color: ${color}; font-weight: bold`);
    } else {
      console.group(`%c${title}`, `color: ${color}; font-weight: bold`);
    }

    console.log('Payload:', event.payload);
    console.trace('Stack trace:');
    console.groupEnd();
  }

  /**
   * Get color for event type
   *
   * @param eventType - Event type
   * @returns CSS color string
   */
  private getEventColor(eventType: string): string {
    if (eventType.startsWith('zombie.')) return '#00ff00'; // Green
    if (eventType.startsWith('battle.')) return '#ff0000'; // Red
    if (eventType.startsWith('building.')) return '#ffaa00'; // Orange
    if (eventType.startsWith('resource.')) return '#00aaff'; // Blue
    if (eventType.startsWith('game.')) return '#ff00ff'; // Magenta
    if (eventType.startsWith('player.')) return '#ffff00'; // Yellow
    if (eventType.startsWith('time.')) return '#aaaaaa'; // Gray
    if (eventType.startsWith('ui.')) return '#00ffff'; // Cyan

    return '#ffffff'; // White (default)
  }

  /**
   * Get icon for event type
   *
   * @param eventType - Event type
   * @returns Emoji icon
   */
  private getEventIcon(eventType: string): string {
    if (eventType.startsWith('zombie.')) return '🧟';
    if (eventType.startsWith('battle.')) return '⚔️';
    if (eventType.startsWith('building.')) return '🏗️';
    if (eventType.startsWith('resource.')) return '💎';
    if (eventType.startsWith('game.')) return '🎮';
    if (eventType.startsWith('player.')) return '👤';
    if (eventType.startsWith('time.')) return '⏰';
    if (eventType.startsWith('ui.')) return '🖥️';

    return '📣';
  }

  /**
   * Record timing for an event
   *
   * @param eventType - Event type
   * @param duration - Duration in ms
   */
  private recordTiming(eventType: string, duration: number): void {
    const times = this.eventTimings.get(eventType) || [];
    times.push(duration);

    // Keep only recent timings
    if (times.length > this.config.maxEvents) {
      times.shift();
    }

    this.eventTimings.set(eventType, times);
  }
}

/**
 * Global event logger instance
 */
export const eventLogger = new EventLogger();

/**
 * Enable event logging (dev mode convenience)
 */
export const enableEventLogging = (): void => {
  eventLogger.enable();
  console.log('✅ Event logging enabled');
};

/**
 * Disable event logging
 */
export const disableEventLogging = (): void => {
  eventLogger.disable();
  console.log('❌ Event logging disabled');
};

/**
 * Print event statistics
 */
export const printEventStats = (): void => {
  eventLogger.printStats();
  eventLogger.printTimingStats();
};

// Expose logger to window for dev console access (only in browser dev mode)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).eventLogger = eventLogger;
  (window as any).eventBus = eventBus;
  console.log('💡 Event debugging available: window.eventLogger, window.eventBus');
}
