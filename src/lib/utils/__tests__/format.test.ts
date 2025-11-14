/**
 * Formatting Utilities Test Suite
 *
 * Tests for formatting functions including:
 * - Number formatting with K/M/B suffixes
 * - Time formatting (seconds to HH:MM:SS)
 * - Percentage formatting with precision
 * - Currency formatting for Dark Coins and Soul Essence
 *
 * All formatters should handle edge cases gracefully.
 */

import {
  formatNumber,
  formatLargeNumber,
  formatTime,
  formatPercentage,
  formatDarkCoins,
  formatSoulEssence,
  formatDuration,
  formatCountdown,
} from '../format';

describe('Format Utilities', () => {
  describe('formatNumber', () => {
    it('formats whole numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('formats decimal numbers', () => {
      expect(formatNumber(3.14)).toBe('3.14');
      expect(formatNumber(3.14159, 2)).toBe('3.14');
      expect(formatNumber(3.14159, 4)).toBe('3.1416');
      expect(formatNumber(0.123456, 3)).toBe('0.123');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-42)).toBe('-42');
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-3.14, 2)).toBe('-3.14');
    });

    it('handles zero decimal places', () => {
      expect(formatNumber(3.14159, 0)).toBe('3');
      expect(formatNumber(99.9, 0)).toBe('100');
    });

    it('handles edge cases', () => {
      expect(formatNumber(NaN)).toBe('NaN');
      expect(formatNumber(Infinity)).toBe('∞');
      expect(formatNumber(-Infinity)).toBe('-∞');
    });

    it('adds thousands separators', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234567.89, 2)).toBe('1,234,567.89');
    });
  });

  describe('formatLargeNumber', () => {
    it('formats small numbers without suffix', () => {
      expect(formatLargeNumber(0)).toBe('0');
      expect(formatLargeNumber(999)).toBe('999');
    });

    it('formats thousands with K suffix', () => {
      expect(formatLargeNumber(1000)).toBe('1K');
      expect(formatLargeNumber(1500)).toBe('1.5K');
      expect(formatLargeNumber(12345)).toBe('12.3K');
      expect(formatLargeNumber(999999)).toBe('1000K');
    });

    it('formats millions with M suffix', () => {
      expect(formatLargeNumber(1000000)).toBe('1M');
      expect(formatLargeNumber(1500000)).toBe('1.5M');
      expect(formatLargeNumber(12345678)).toBe('12.3M');
    });

    it('formats billions with B suffix', () => {
      expect(formatLargeNumber(1000000000)).toBe('1B');
      expect(formatLargeNumber(1500000000)).toBe('1.5B');
      expect(formatLargeNumber(12345678901)).toBe('12.3B');
    });

    it('formats trillions with T suffix', () => {
      expect(formatLargeNumber(1000000000000)).toBe('1T');
      expect(formatLargeNumber(1500000000000)).toBe('1.5T');
    });

    it('handles negative numbers', () => {
      expect(formatLargeNumber(-1000)).toBe('-1K');
      expect(formatLargeNumber(-1500000)).toBe('-1.5M');
    });

    it('respects custom precision', () => {
      expect(formatLargeNumber(1234567, 0)).toBe('1M');
      expect(formatLargeNumber(1234567, 1)).toBe('1.2M');
      expect(formatLargeNumber(1234567, 2)).toBe('1.23M');
    });

    it('handles decimal inputs', () => {
      expect(formatLargeNumber(1234.56)).toBe('1.2K');
      expect(formatLargeNumber(0.5)).toBe('0.5');
    });
  });

  describe('formatTime', () => {
    it('formats seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00:00');
      expect(formatTime(30)).toBe('00:00:30');
      expect(formatTime(59)).toBe('00:00:59');
    });

    it('formats minutes correctly', () => {
      expect(formatTime(60)).toBe('00:01:00');
      expect(formatTime(90)).toBe('00:01:30');
      expect(formatTime(3599)).toBe('00:59:59');
    });

    it('formats hours correctly', () => {
      expect(formatTime(3600)).toBe('01:00:00');
      expect(formatTime(3661)).toBe('01:01:01');
      expect(formatTime(86399)).toBe('23:59:59');
    });

    it('handles values over 24 hours', () => {
      expect(formatTime(86400)).toBe('24:00:00');
      expect(formatTime(90000)).toBe('25:00:00');
      expect(formatTime(172800)).toBe('48:00:00');
    });

    it('formats short version', () => {
      expect(formatTime(30, true)).toBe('0:30');
      expect(formatTime(90, true)).toBe('1:30');
      expect(formatTime(3661, true)).toBe('1:01:01');
    });

    it('handles negative values', () => {
      expect(formatTime(-30)).toBe('-00:00:30');
      expect(formatTime(-3600)).toBe('-01:00:00');
    });

    it('handles decimal values', () => {
      expect(formatTime(30.7)).toBe('00:00:30');
      expect(formatTime(90.9)).toBe('00:01:30');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentages with default precision', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(100)).toBe('100%');
    });

    it('formats decimal percentages', () => {
      expect(formatPercentage(33.333)).toBe('33.33%');
      expect(formatPercentage(66.666)).toBe('66.67%');
      expect(formatPercentage(0.1234)).toBe('0.12%');
    });

    it('respects custom precision', () => {
      expect(formatPercentage(33.333, 0)).toBe('33%');
      expect(formatPercentage(33.333, 1)).toBe('33.3%');
      expect(formatPercentage(33.333, 3)).toBe('33.333%');
    });

    it('handles values over 100%', () => {
      expect(formatPercentage(150)).toBe('150%');
      expect(formatPercentage(1000)).toBe('1000%');
    });

    it('handles negative percentages', () => {
      expect(formatPercentage(-10)).toBe('-10%');
      expect(formatPercentage(-50.5)).toBe('-50.5%');
    });

    it('handles small values', () => {
      expect(formatPercentage(0.001, 3)).toBe('0.001%');
      expect(formatPercentage(0.001, 2)).toBe('0%');
    });
  });

  describe('formatDarkCoins', () => {
    it('formats Dark Coins with icon', () => {
      expect(formatDarkCoins(0)).toBe('💰 0');
      expect(formatDarkCoins(100)).toBe('💰 100');
      expect(formatDarkCoins(1000)).toBe('💰 1K');
    });

    it('handles large amounts', () => {
      expect(formatDarkCoins(1500)).toBe('💰 1.5K');
      expect(formatDarkCoins(1000000)).toBe('💰 1M');
      expect(formatDarkCoins(1500000000)).toBe('💰 1.5B');
    });

    it('handles negative amounts (debt)', () => {
      expect(formatDarkCoins(-100)).toBe('💰 -100');
      expect(formatDarkCoins(-1000)).toBe('💰 -1K');
    });

    it('can omit icon', () => {
      expect(formatDarkCoins(1000, false)).toBe('1K');
      expect(formatDarkCoins(1500000, false)).toBe('1.5M');
    });
  });

  describe('formatSoulEssence', () => {
    it('formats Soul Essence with icon', () => {
      expect(formatSoulEssence(0)).toBe('👻 0');
      expect(formatSoulEssence(100)).toBe('👻 100');
      expect(formatSoulEssence(1000)).toBe('👻 1K');
    });

    it('handles large amounts', () => {
      expect(formatSoulEssence(1500)).toBe('👻 1.5K');
      expect(formatSoulEssence(1000000)).toBe('👻 1M');
    });

    it('can omit icon', () => {
      expect(formatSoulEssence(1000, false)).toBe('1K');
      expect(formatSoulEssence(1500000, false)).toBe('1.5M');
    });

    it('handles decimal precision', () => {
      expect(formatSoulEssence(1234)).toBe('👻 1.2K');
      expect(formatSoulEssence(1567)).toBe('👻 1.6K');
    });
  });

  describe('formatDuration', () => {
    it('formats short durations in seconds', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('formats medium durations in minutes', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(300)).toBe('5m');
      expect(formatDuration(3599)).toBe('59m 59s');
    });

    it('formats long durations in hours', () => {
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(3661)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h');
      expect(formatDuration(86399)).toBe('23h 59m');
    });

    it('formats very long durations in days', () => {
      expect(formatDuration(86400)).toBe('1d');
      expect(formatDuration(90000)).toBe('1d 1h');
      expect(formatDuration(172800)).toBe('2d');
      expect(formatDuration(259200)).toBe('3d');
    });

    it('handles compact format', () => {
      expect(formatDuration(90, true)).toBe('1m');
      expect(formatDuration(3661, true)).toBe('1h');
      expect(formatDuration(90000, true)).toBe('1d');
    });

    it('handles negative durations', () => {
      expect(formatDuration(-30)).toBe('-30s');
      expect(formatDuration(-90)).toBe('-1m 30s');
    });
  });

  describe('formatCountdown', () => {
    it('formats countdown timer', () => {
      expect(formatCountdown(0)).toBe('Ready!');
      expect(formatCountdown(30)).toBe('00:30');
      expect(formatCountdown(90)).toBe('01:30');
      expect(formatCountdown(3661)).toBe('1:01:01');
    });

    it('shows "Ready!" for zero or negative', () => {
      expect(formatCountdown(0)).toBe('Ready!');
      expect(formatCountdown(-10)).toBe('Ready!');
    });

    it('formats hours when needed', () => {
      expect(formatCountdown(3600)).toBe('1:00:00');
      expect(formatCountdown(7200)).toBe('2:00:00');
    });

    it('pads minutes and seconds with zeros', () => {
      expect(formatCountdown(5)).toBe('00:05');
      expect(formatCountdown(65)).toBe('01:05');
      expect(formatCountdown(3605)).toBe('1:00:05');
    });
  });
});
