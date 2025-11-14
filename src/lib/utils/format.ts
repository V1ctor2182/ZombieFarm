/**
 * Formatting Utilities
 *
 * Functions for formatting numbers, time, percentages, and currencies
 * for display in the UI. All formatters handle edge cases gracefully.
 *
 * @module lib/utils/format
 */

/**
 * Formats a number with thousands separators and optional decimal precision.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: auto-detect, max 2)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.567); // "1,234.57"
 * formatNumber(1234.567, 1); // "1,234.6"
 * formatNumber(1000000); // "1,000,000"
 */
export function formatNumber(value: number, decimals?: number): string {
  if (isNaN(value)) return 'NaN';
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';

  // Determine decimal places
  const decimalPlaces =
    decimals !== undefined
      ? decimals
      : value % 1 === 0
        ? 0
        : Math.min(2, value.toString().split('.')[1]?.length || 0);

  // Round to desired precision
  const rounded = Number(value.toFixed(decimalPlaces));

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = rounded.toString().split('.');

  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine with decimal part if present
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Formats large numbers with K/M/B/T suffixes.
 * Useful for displaying large resource counts compactly.
 *
 * @param value - The number to format
 * @param precision - Decimal places for the shortened value (default: 1)
 * @returns Formatted number with suffix
 *
 * @example
 * formatLargeNumber(1500); // "1.5K"
 * formatLargeNumber(1500000); // "1.5M"
 * formatLargeNumber(1500000000); // "1.5B"
 */
export function formatLargeNumber(value: number, precision: number = 1): string {
  if (isNaN(value)) return 'NaN';
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Thresholds for suffixes
  const trillion = 1e12;
  const billion = 1e9;
  const million = 1e6;
  const thousand = 1e3;

  // Helper to strip trailing zeros and decimal point
  const stripZeros = (num: string): string => num.replace(/\.?0+$/, '');

  if (absValue >= trillion) {
    return `${sign}${stripZeros((absValue / trillion).toFixed(precision))}T`;
  } else if (absValue >= billion) {
    return `${sign}${stripZeros((absValue / billion).toFixed(precision))}B`;
  } else if (absValue >= million) {
    return `${sign}${stripZeros((absValue / million).toFixed(precision))}M`;
  } else if (absValue >= thousand) {
    return `${sign}${stripZeros((absValue / thousand).toFixed(precision))}K`;
  } else {
    // For small numbers, show with precision if decimal
    return absValue % 1 === 0 ? `${sign}${absValue}` : `${sign}${absValue.toFixed(precision)}`;
  }
}

/**
 * Formats seconds into HH:MM:SS format.
 *
 * @param seconds - Time in seconds
 * @param short - If true, omit hours if zero (default: false)
 * @returns Formatted time string
 *
 * @example
 * formatTime(3661); // "01:01:01"
 * formatTime(90); // "00:01:30"
 * formatTime(90, true); // "1:30"
 */
export function formatTime(seconds: number, short: boolean = false): string {
  const absSeconds = Math.abs(Math.floor(seconds));
  const sign = seconds < 0 ? '-' : '';

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  if (short) {
    if (hours === 0) {
      return `${sign}${minutes}:${secs.toString().padStart(2, '0')}`;
    } else {
      // For hours in short format, don't pad hours
      return `${sign}${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
  }

  return `${sign}${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats a percentage value with specified precision.
 *
 * @param value - The percentage value (0-100, but can be outside this range)
 * @param precision - Decimal places (default: 2)
 * @returns Formatted percentage string with % symbol
 *
 * @example
 * formatPercentage(50); // "50%"
 * formatPercentage(33.333); // "33.33%"
 * formatPercentage(33.333, 1); // "33.3%"
 */
export function formatPercentage(value: number, precision: number = 2): string {
  return `${value.toFixed(precision).replace(/\.?0+$/, '')}%`;
}

/**
 * Formats Dark Coins currency with icon.
 *
 * @param amount - The amount of Dark Coins
 * @param showIcon - Whether to show the coin icon (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatDarkCoins(1500); // "💰 1.5K"
 * formatDarkCoins(1500, false); // "1.5K"
 */
export function formatDarkCoins(amount: number, showIcon: boolean = true): string {
  const formatted = formatLargeNumber(amount);
  return showIcon ? `💰 ${formatted}` : formatted;
}

/**
 * Formats Soul Essence currency with icon.
 *
 * @param amount - The amount of Soul Essence
 * @param showIcon - Whether to show the soul icon (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatSoulEssence(1500); // "👻 1.5K"
 * formatSoulEssence(1500, false); // "1.5K"
 */
export function formatSoulEssence(amount: number, showIcon: boolean = true): string {
  const formatted = formatLargeNumber(amount);
  return showIcon ? `👻 ${formatted}` : formatted;
}

/**
 * Formats a duration in seconds to a human-readable string.
 * Shows the two most significant units (e.g., "1h 30m", "2d 5h").
 *
 * @param seconds - Duration in seconds
 * @param compact - If true, show only the largest unit (default: false)
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(90); // "1m 30s"
 * formatDuration(3661); // "1h 1m"
 * formatDuration(86400); // "1d"
 * formatDuration(90, true); // "1m"
 */
export function formatDuration(seconds: number, compact: boolean = false): string {
  const absSeconds = Math.abs(Math.floor(seconds));
  const sign = seconds < 0 ? '-' : '';

  const days = Math.floor(absSeconds / 86400);
  const hours = Math.floor((absSeconds % 86400) / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
    if (!compact && hours > 0) parts.push(`${hours}h`);
  } else if (hours > 0) {
    parts.push(`${hours}h`);
    if (!compact && minutes > 0) parts.push(`${minutes}m`);
  } else if (minutes > 0) {
    parts.push(`${minutes}m`);
    if (!compact && secs > 0) parts.push(`${secs}s`);
  } else {
    parts.push(`${secs}s`);
  }

  return sign + parts.join(' ');
}

/**
 * Formats a countdown timer.
 * Shows MM:SS for times under an hour, H:MM:SS for longer durations.
 * Returns "Ready!" for zero or negative values.
 *
 * @param seconds - Time remaining in seconds
 * @returns Formatted countdown string or "Ready!"
 *
 * @example
 * formatCountdown(90); // "01:30"
 * formatCountdown(3661); // "1:01:01"
 * formatCountdown(0); // "Ready!"
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Ready!';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
