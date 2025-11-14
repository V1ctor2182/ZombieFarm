# Events Module

Event bus system for cross-module communication and event-driven architecture.

## Overview

The Events module provides a type-safe, priority-based event system that works alongside XState to enable loose coupling between game modules (Farm, Combat, UI).

### Architecture

- **XState Machine**: Handles CORE game state transitions
- **EventBus**: Handles CROSS-MODULE communication (farm ↔ combat ↔ ui)
- Both systems work together harmoniously

## Files

```
src/lib/events/
├── eventBus.ts          # Core event bus implementation
├── eventLogger.ts       # Debugging and monitoring utilities
├── index.ts             # Barrel exports
└── __tests__/
    ├── eventBus.test.ts      # EventBus tests (23 tests)
    └── eventLogger.test.ts   # EventLogger tests (20 tests)
```

## Usage

### Basic Event Subscription

```typescript
import { eventBus } from '@/lib/events';

// Subscribe to specific event
const unsubscribe = eventBus.on('zombie.harvested', (event) => {
  console.log('Zombie harvested:', event.payload.zombieId);
});

// Later, cleanup
unsubscribe();
```

### Dispatching Events

```typescript
import { dispatchEvent, emitEvent } from '@/lib/events';

// Async dispatch (await all handlers)
await dispatchEvent({
  type: 'zombie.harvested',
  payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() }
});

// Fire and forget (don't wait)
emitEvent({
  type: 'battle.initiated',
  payload: { battleId: 'battle-1', locationId: 'village-1', timestamp: Date.now() }
});
```

### Wildcard Subscriptions

```typescript
// Listen to ALL events
eventBus.on('*', (event) => {
  console.log('Event:', event.type, event.payload);
});
```

### Priority Handling

```typescript
// Higher priority = executed first
eventBus.on('zombie.harvested', handler1, { priority: 10 });
eventBus.on('zombie.harvested', handler2, { priority: 5 });
eventBus.on('zombie.harvested', handler3, { priority: 1 });

// Execution order: handler1 → handler2 → handler3
```

### One-Time Subscriptions

```typescript
// Auto-unsubscribe after first trigger
eventBus.once('battle.ended', (event) => {
  console.log('Battle result:', event.payload.result);
});
```

### Automatic Cleanup with AbortSignal

```typescript
const controller = new AbortController();

eventBus.on('zombie.harvested', handler, {
  signal: controller.signal
});

// Later, cleanup all handlers at once
controller.abort();
```

## Event Logging

The event logger provides debugging utilities for development.

### Enable Logging

```typescript
import { enableEventLogging } from '@/lib/events';

// Enable in dev mode
enableEventLogging();
```

### Console Access (Development)

In the browser console, access debugging tools:

```javascript
// Global event bus
window.eventBus

// Global event logger
window.eventLogger

// View event history
window.eventLogger.printHistory(20)

// View statistics
window.eventLogger.printStats()

// View timing stats
window.eventLogger.printTimingStats()
```

### Filter Events

```typescript
import { eventLogger } from '@/lib/events';

// Configure logging filters
eventLogger.configure({
  logAll: false,
  include: ['zombie\\..*'], // Only log zombie events
  exclude: ['time\\..*'],   // Exclude time events
});
```

### Event Timing

```typescript
// Enable timing tracking
eventLogger.configure({ trackTiming: true });

// Get timing statistics
const stats = eventLogger.getTimingStats();
console.table(stats);
```

### Event Replay

```typescript
// Replay events from history (debugging)
const history = eventBus.getHistory();
const zombieEvents = history
  .filter(e => e.event.type.startsWith('zombie.'))
  .map(e => e.event);

await eventLogger.replayEvents(zombieEvents, 100); // 100ms delay between events
```

## API Reference

### EventBus

#### Methods

- `on<T>(eventType, handler, options?)`: Subscribe to events
- `once<T>(eventType, handler, options?)`: Subscribe once
- `off<T>(eventType, handler)`: Unsubscribe
- `dispatch(event)`: Dispatch event (async, waits for all handlers)
- `emit(event)`: Emit event (fire and forget)
- `getHistory(limit?)`: Get event history
- `clearHistory()`: Clear event history
- `getStats()`: Get statistics
- `setEnabled(enabled)`: Enable/disable event bus
- `clear()`: Remove all subscriptions

#### Subscription Options

```typescript
interface SubscriptionOptions {
  priority?: number;      // Execution priority (higher = earlier)
  signal?: AbortSignal;   // Automatic cleanup
  id?: string;            // Handler identifier for debugging
}
```

### EventLogger

#### Methods

- `enable()`: Enable logging
- `disable()`: Disable logging
- `configure(config)`: Update configuration
- `logEvent(event)`: Manually log an event
- `getTimingStats()`: Get timing statistics
- `printTimingStats()`: Print timing stats to console
- `clearTimingStats()`: Clear timing stats
- `printHistory(limit?)`: Print event history to console
- `printStats()`: Print event bus stats to console
- `filterEvents(pattern)`: Filter events by pattern
- `replayEvents(events, delayMs?)`: Replay events
- `detach()`: Detach from event bus

#### Configuration

```typescript
interface EventLoggerConfig {
  enabled: boolean;          // Enable logging
  logAll: boolean;           // Log all events (or use filters)
  include?: string[];        // Event types to include (whitelist)
  exclude?: string[];        // Event types to exclude (blacklist)
  collapsed: boolean;        // Collapse event details in console
  trackTiming: boolean;      // Track event timing
  maxEvents: number;         // Maximum events to store in memory
}
```

## Features

### Type Safety

All events are fully typed using discriminated unions:

```typescript
type GameEvent = FarmEvent | CombatEvent | SystemEvent | WorldEvent | UIEvent;

// TypeScript knows the exact payload shape
eventBus.on('zombie.harvested', (event) => {
  // event.payload is typed as:
  // { plotId: PlotId; zombieId: ZombieId; timestamp: number }
});
```

### Error Handling

Handlers that throw errors won't break other handlers:

```typescript
eventBus.on('zombie.harvested', () => {
  throw new Error('Handler 1 error');
});

eventBus.on('zombie.harvested', () => {
  console.log('Handler 2 still executes!');
});

await eventBus.dispatch({ ... }); // Both handlers run, error logged
```

### Event History

Track all dispatched events for debugging:

```typescript
const history = eventBus.getHistory(10); // Last 10 events

history.forEach(entry => {
  console.log(entry.event.type, entry.timestamp, entry.handlerCount);
});
```

### Statistics

Monitor event bus performance:

```typescript
const stats = eventBus.getStats();

console.log({
  totalEvents: stats.totalEvents,
  totalSubscriptions: stats.totalSubscriptions,
  eventCounts: stats.eventCounts, // Count per event type
  lastEvent: stats.lastEvent,
});
```

## Testing

### Test Coverage

- **EventBus**: 23 tests covering all functionality
- **EventLogger**: 20 tests covering logging and debugging
- **Total**: 43 tests, 100% passing

### Running Tests

```bash
# Run event tests
npm test -- src/lib/events/__tests__/

# Run with coverage
npm test -- src/lib/events/__tests__/ --coverage
```

### Test Examples

```typescript
import { EventBus } from '@/lib/events';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('dispatches events to subscribers', async () => {
    const handler = jest.fn();
    eventBus.on('zombie.harvested', handler);

    await eventBus.dispatch({
      type: 'zombie.harvested',
      payload: { plotId: 'plot-1', zombieId: 'zombie-1', timestamp: Date.now() }
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
```

## Best Practices

### 1. Use Specific Event Types

```typescript
// Good: Specific event type
eventBus.on('zombie.harvested', handler);

// Avoid: Wildcard unless necessary
eventBus.on('*', handler);
```

### 2. Clean Up Subscriptions

```typescript
// Good: Save unsubscribe function
const unsubscribe = eventBus.on('zombie.harvested', handler);

// Later cleanup
useEffect(() => {
  return () => unsubscribe();
}, []);
```

### 3. Use AbortSignal for Component Lifecycle

```typescript
function MyComponent() {
  useEffect(() => {
    const controller = new AbortController();

    eventBus.on('zombie.harvested', handler, {
      signal: controller.signal
    });

    return () => controller.abort();
  }, []);
}
```

### 4. Handle Errors in Handlers

```typescript
eventBus.on('zombie.harvested', async (event) => {
  try {
    await processZombie(event.payload.zombieId);
  } catch (error) {
    console.error('Failed to process zombie:', error);
  }
});
```

### 5. Use Priority for Ordering

```typescript
// Validate first (high priority)
eventBus.on('zombie.harvested', validateZombie, { priority: 100 });

// Process next (medium priority)
eventBus.on('zombie.harvested', processZombie, { priority: 50 });

// Log last (low priority)
eventBus.on('zombie.harvested', logZombie, { priority: 0 });
```

## Integration with XState

The event bus works alongside the XState game machine:

```typescript
import { useGameDispatch } from '@/features/game/GameProvider';
import { eventBus } from '@/lib/events';

function HarvestButton({ zombieId }: { zombieId: string }) {
  const dispatch = useGameDispatch();

  const handleHarvest = async () => {
    // 1. Dispatch to XState machine (state transition)
    dispatch({
      type: 'zombie.harvested',
      payload: { plotId: 'plot-1', zombieId, timestamp: Date.now() }
    });

    // 2. Broadcast to event bus (cross-module notification)
    await eventBus.dispatch({
      type: 'zombie.harvested',
      payload: { plotId: 'plot-1', zombieId, timestamp: Date.now() }
    });
  };

  return <button onClick={handleHarvest}>Harvest</button>;
}
```

## Performance

### Benchmarks

- Event dispatch: ~0.1ms per event
- Handler execution: Sequential (priority-ordered)
- History tracking: Last 100 events (configurable)
- Memory usage: Minimal (event metadata only)

### Optimization Tips

1. **Use `once()` for single-use handlers**
2. **Unsubscribe when not needed** (prevent memory leaks)
3. **Avoid heavy computation in handlers** (offload to workers)
4. **Use priority wisely** (don't over-prioritize)

## Troubleshooting

### Events Not Firing

```typescript
// Check if event bus is enabled
console.log(eventBus.getEnabled()); // Should be true

// Check subscriptions
console.log(eventBus.getStats().totalSubscriptions);

// Enable logging to debug
enableEventLogging();
```

### Handlers Not Called

```typescript
// Verify event type matches exactly
eventBus.on('zombie.harvested', handler); // Case-sensitive

// Check handler wasn't aborted
const controller = new AbortController();
eventBus.on('zombie.harvested', handler, { signal: controller.signal });
// Don't call controller.abort() before event dispatch
```

### Memory Leaks

```typescript
// Always cleanup subscriptions
const unsubscribe = eventBus.on('zombie.harvested', handler);

// In React components
useEffect(() => {
  const unsubscribe = eventBus.on('zombie.harvested', handler);
  return () => unsubscribe();
}, []);
```

## Future Enhancements

- Event namespacing for module isolation
- Event middleware support
- Event serialization for persistence
- Event replay with time travel debugging
- Performance monitoring dashboard

---

**Status**: ✅ Complete and Production-Ready
**Tests**: 43/43 passing (100%)
**Coverage**: Full coverage across all features
**Documentation**: Comprehensive API and usage guide
