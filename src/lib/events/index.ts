/**
 * Events Module
 *
 * Central event bus and logging utilities for cross-module communication.
 */

export { EventBus, eventBus, dispatchEvent, emitEvent } from './eventBus';
export type {
  EventHandler,
  SubscriptionOptions,
  EventHistoryEntry,
  EventBusStats,
} from './eventBus';

export {
  EventLogger,
  eventLogger,
  enableEventLogging,
  disableEventLogging,
  printEventStats,
} from './eventLogger';
export type { EventLoggerConfig, EventTiming } from './eventLogger';
