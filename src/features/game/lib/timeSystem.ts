/**
 * Time System
 *
 * Manages in-game time, day/night cycles, and offline time calculation.
 *
 * Requirements from DOMAIN-FARM.md:
 * - 30-minute real-time cycle = 1 full day/night
 * - Day: 20 minutes real-time (6:00-20:00 game time = 14 hours)
 * - Night: 10 minutes real-time (20:00-6:00 game time = 10 hours)
 * - Time progresses while game is open
 * - Calculate offline time when player returns (capped at 7 days)
 *
 * Time Ratio Calculation:
 * - 30 min real-time = 24 hours game-time
 * - Ratio: 24 * 60 / 30 = 48 (48 game minutes per 1 real minute)
 *
 * Day/Night Breakdown:
 * - Day (6:00-20:00): 14 hours game-time = 20 minutes real-time
 * - Night (20:00-6:00): 10 hours game-time = 10 minutes real-time
 * - Custom ratios: Day = 14*60/20 = 42x, Night = 10*60/10 = 60x
 * - We use simplified 48x ratio for consistent time progression
 */

import { TimeState, Weather, Season } from '../../../types/global';

/**
 * Day/Night Phase
 *
 * More granular time-of-day phases for visual and gameplay effects.
 */
export enum DayNightPhase {
  DAWN = 'dawn', // 6:00-8:00
  DAY = 'day', // 8:00-18:00
  DUSK = 'dusk', // 18:00-20:00
  NIGHT = 'night', // 20:00-6:00
}

/**
 * Time Event
 *
 * Events triggered by time progression (day change, day/night transitions, etc.)
 */
export interface TimeEvent {
  type: 'hour_changed' | 'day_changed' | 'day_started' | 'night_started' | 'dawn' | 'dusk';
  timestamp: number;
  data?: {
    hour?: number;
    day?: number;
    phase?: DayNightPhase;
  };
}

/**
 * Time Update Result
 *
 * Result of advancing time, including new state and any triggered events.
 */
export interface TimeUpdateResult {
  newState: TimeState;
  events: TimeEvent[];
}

/**
 * Offline Time Result
 *
 * Result of calculating offline time progression.
 */
export interface OfflineTimeResult extends TimeUpdateResult {
  elapsedRealTimeMs: number;
  elapsedGameTimeMinutes: number;
  daysPassed: number;
}

/**
 * Time Constants
 */
const TIME_CONSTANTS = {
  // Real-time to game-time ratio (48x speed)
  REAL_TO_GAME_RATIO: 48,

  // Full day/night cycle duration (30 minutes real-time)
  FULL_CYCLE_MS: 30 * 60 * 1000,

  // Day duration (20 minutes real-time for 14 hours game-time)
  DAY_DURATION_MS: 20 * 60 * 1000,

  // Night duration (10 minutes real-time for 10 hours game-time)
  NIGHT_DURATION_MS: 10 * 60 * 1000,

  // Game time boundaries (hours)
  DAY_START_HOUR: 6,
  DAY_END_HOUR: 20,
  DAWN_END_HOUR: 8,
  DUSK_START_HOUR: 18,

  // Offline time cap (7 days of game-time)
  MAX_OFFLINE_DAYS: 7,
};

/**
 * Create Time State
 *
 * Creates a new time state with default or custom values.
 *
 * @param overrides - Optional partial time state to override defaults
 * @returns New time state
 */
export function createTimeState(
  overrides?: Partial<Omit<TimeState, 'isDaytime' | 'lastUpdate'>>
): TimeState {
  const hour = overrides?.hour ?? TIME_CONSTANTS.DAY_START_HOUR;
  const minute = overrides?.minute ?? 0;

  return {
    day: overrides?.day ?? 1,
    hour,
    minute,
    season: overrides?.season ?? Season.SPRING,
    isDaytime: isDaytime(hour, minute),
    weather: overrides?.weather ?? Weather.CLEAR,
    lastUpdate: Date.now(),
  };
}

/**
 * Is Daytime
 *
 * Checks if the given time is during daytime (6:00-19:59).
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns True if daytime, false if nighttime
 */
export function isDaytime(hour: number, minute: number): boolean {
  return hour >= TIME_CONSTANTS.DAY_START_HOUR && hour < TIME_CONSTANTS.DAY_END_HOUR;
}

/**
 * Is Nighttime
 *
 * Checks if the given time is during nighttime (20:00-5:59).
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns True if nighttime, false if daytime
 */
export function isNighttime(hour: number, minute: number): boolean {
  return !isDaytime(hour, minute);
}

/**
 * Get Day/Night Phase
 *
 * Returns the current phase of the day for more granular effects.
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Day/night phase
 */
export function getDayNightPhase(hour: number, minute: number): DayNightPhase {
  if (hour >= TIME_CONSTANTS.DAY_START_HOUR && hour < TIME_CONSTANTS.DAWN_END_HOUR) {
    return DayNightPhase.DAWN;
  }
  if (hour >= TIME_CONSTANTS.DAWN_END_HOUR && hour < TIME_CONSTANTS.DUSK_START_HOUR) {
    return DayNightPhase.DAY;
  }
  if (hour >= TIME_CONSTANTS.DUSK_START_HOUR && hour < TIME_CONSTANTS.DAY_END_HOUR) {
    return DayNightPhase.DUSK;
  }
  return DayNightPhase.NIGHT;
}

/**
 * Get Time of Day String
 *
 * Formats the current time as HH:MM string.
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Formatted time string
 */
export function getTimeOfDayString(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Get Real Time to Game Time Ratio
 *
 * Returns the speed multiplier (how many game minutes pass per real minute).
 *
 * @returns Ratio (48x by default)
 */
export function getRealTimeToGameTimeRatio(): number {
  return TIME_CONSTANTS.REAL_TO_GAME_RATIO;
}

/**
 * Calculate Day Progress
 *
 * Returns the percentage of daylight elapsed (0-100).
 * Returns 0 during nighttime.
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Progress percentage (0-100)
 */
export function calculateDayProgress(hour: number, minute: number): number {
  if (isNighttime(hour, minute)) {
    return 0;
  }

  // Day is 6:00-20:00 (14 hours)
  const totalDayMinutes = (TIME_CONSTANTS.DAY_END_HOUR - TIME_CONSTANTS.DAY_START_HOUR) * 60;
  const minutesSinceDayStart = (hour - TIME_CONSTANTS.DAY_START_HOUR) * 60 + minute;

  return (minutesSinceDayStart / totalDayMinutes) * 100;
}

/**
 * Calculate Night Progress
 *
 * Returns the percentage of nighttime elapsed (0-100).
 * Returns 0 during daytime.
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Progress percentage (0-100)
 */
export function calculateNightProgress(hour: number, minute: number): number {
  if (isDaytime(hour, minute)) {
    return 0;
  }

  // Night is 20:00-6:00 (10 hours)
  const totalNightMinutes = 10 * 60;
  let minutesSinceNightStart: number;

  if (hour >= TIME_CONSTANTS.DAY_END_HOUR) {
    // After 20:00 same day
    minutesSinceNightStart = (hour - TIME_CONSTANTS.DAY_END_HOUR) * 60 + minute;
  } else {
    // Before 6:00 next day
    minutesSinceNightStart = (24 - TIME_CONSTANTS.DAY_END_HOUR) * 60 + hour * 60 + minute;
  }

  return (minutesSinceNightStart / totalNightMinutes) * 100;
}

/**
 * Advance Time
 *
 * Advances the game time by the given real-time delta and returns the new state
 * along with any time-based events that occurred.
 *
 * @param currentState - Current time state
 * @param deltaMs - Real-time elapsed in milliseconds
 * @returns Time update result with new state and events
 */
export function advanceTime(currentState: TimeState, deltaMs: number): TimeUpdateResult {
  // Handle negative or zero delta
  if (deltaMs <= 0) {
    return {
      newState: currentState,
      events: [],
    };
  }

  // Convert real-time to game-time
  const gameMinutesElapsed = (deltaMs / 60000) * TIME_CONSTANTS.REAL_TO_GAME_RATIO;

  // Calculate new time
  let newMinute = currentState.minute + gameMinutesElapsed;
  let newHour = currentState.hour;
  let newDay = currentState.day;

  // Track events
  const events: TimeEvent[] = [];
  const now = Date.now();

  // Roll over minutes to hours
  while (newMinute >= 60) {
    newMinute -= 60;
    newHour++;

    events.push({
      type: 'hour_changed',
      timestamp: now,
      data: { hour: newHour % 24 },
    });

    // Roll over hours to days
    if (newHour >= 24) {
      newHour -= 24;
      newDay++;

      events.push({
        type: 'day_changed',
        timestamp: now,
        data: { day: newDay },
      });
    }
  }

  // Round minute to avoid floating point issues
  newMinute = Math.floor(newMinute);

  // Determine if day/night state changed
  const wasDay = currentState.isDaytime;
  const isDay = isDaytime(newHour, newMinute);

  if (!wasDay && isDay) {
    events.push({
      type: 'day_started',
      timestamp: now,
      data: { phase: DayNightPhase.DAWN },
    });
  } else if (wasDay && !isDay) {
    events.push({
      type: 'night_started',
      timestamp: now,
      data: { phase: DayNightPhase.NIGHT },
    });
  }

  // Check for dawn/dusk transitions
  const currentPhase = getDayNightPhase(currentState.hour, currentState.minute);
  const newPhase = getDayNightPhase(newHour, newMinute);

  if (currentPhase !== newPhase) {
    if (newPhase === DayNightPhase.DAWN) {
      events.push({
        type: 'dawn',
        timestamp: now,
        data: { phase: DayNightPhase.DAWN },
      });
    } else if (newPhase === DayNightPhase.DUSK) {
      events.push({
        type: 'dusk',
        timestamp: now,
        data: { phase: DayNightPhase.DUSK },
      });
    }
  }

  // Create new state
  const newState: TimeState = {
    ...currentState,
    day: newDay,
    hour: newHour,
    minute: newMinute,
    isDaytime: isDay,
    lastUpdate: now,
  };

  return {
    newState,
    events,
  };
}

/**
 * Calculate Offline Time
 *
 * Calculates how much game time has passed while the player was offline
 * and returns the updated state with all events that occurred.
 *
 * @param currentState - Current time state
 * @param lastPlayed - Timestamp when player last played (milliseconds since epoch)
 * @returns Offline time result with updated state, events, and metrics
 */
export function calculateOfflineTime(
  currentState: TimeState,
  lastPlayed: number
): OfflineTimeResult {
  const now = Date.now();
  let elapsedRealTimeMs = now - lastPlayed;

  // Handle clock skew (future timestamp)
  if (elapsedRealTimeMs < 0) {
    return {
      newState: currentState,
      events: [],
      elapsedRealTimeMs: 0,
      elapsedGameTimeMinutes: 0,
      daysPassed: 0,
    };
  }

  // Cap at 7 days of real-time (14 full day/night cycles)
  const maxOfflineMs = TIME_CONSTANTS.MAX_OFFLINE_DAYS * TIME_CONSTANTS.FULL_CYCLE_MS;
  const wasCapped = elapsedRealTimeMs > maxOfflineMs;
  if (wasCapped) {
    elapsedRealTimeMs = maxOfflineMs;
  }

  // Calculate game time elapsed
  const elapsedGameTimeMinutes = (elapsedRealTimeMs / 60000) * TIME_CONSTANTS.REAL_TO_GAME_RATIO;

  // Advance time
  const result = advanceTime(currentState, elapsedRealTimeMs);

  // Calculate how many full days passed
  const daysPassed = result.newState.day - currentState.day;

  return {
    newState: result.newState,
    events: result.events,
    elapsedRealTimeMs,
    elapsedGameTimeMinutes,
    daysPassed,
  };
}

/**
 * Get Day/Night Stat Modifiers
 *
 * Returns the stat modifiers based on current time of day.
 * From DOMAIN-FARM.md:
 * - Zombies: +15% stats at night
 * - Humans: +10% stats during day
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Stat modifiers for zombies and humans
 */
export function getDayNightStatModifiers(
  hour: number,
  minute: number
): {
  zombieModifier: number;
  humanModifier: number;
} {
  const isDay = isDaytime(hour, minute);

  return {
    zombieModifier: isDay ? 1.0 : 1.15, // +15% at night
    humanModifier: isDay ? 1.1 : 1.0, // +10% during day
  };
}

/**
 * Apply Time-based Effects
 *
 * Helper to apply day/night modifiers to entity stats.
 *
 * @param baseValue - Base stat value
 * @param modifier - Modifier (1.0 = no change, 1.15 = +15%)
 * @returns Modified value
 */
export function applyTimeModifier(baseValue: number, modifier: number): number {
  return Math.floor(baseValue * modifier);
}
