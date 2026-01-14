import type { LogLevel } from '../../types/log';
import { DEFAULT_CONFIG } from '../../config/defaults';

const LEVEL_FIELDS = DEFAULT_CONFIG.jsonFields.level;

const LEVEL_MAP: Record<string, LogLevel> = {
  error: 'error',
  err: 'error',
  fatal: 'error',
  critical: 'error',
  crit: 'error',
  warn: 'warn',
  warning: 'warn',
  info: 'info',
  information: 'info',
  debug: 'debug',
  dbg: 'debug',
  trace: 'trace',
  verbose: 'trace',
};

export function detectLevelFromJson(data: Record<string, unknown>): LogLevel {
  for (const field of LEVEL_FIELDS) {
    const value = findFieldCaseInsensitive(data, field);
    if (value !== undefined) {
      const level = normalizeLevel(String(value));
      if (level !== 'unknown') {
        return level;
      }
    }
  }
  return 'unknown';
}

export function detectLevelFromText(text: string): LogLevel {
  const lowerText = text.toLowerCase();

  for (const pattern of DEFAULT_CONFIG.patterns.error) {
    if (lowerText.includes(pattern)) return 'error';
  }
  for (const pattern of DEFAULT_CONFIG.patterns.warn) {
    if (lowerText.includes(pattern)) return 'warn';
  }
  for (const pattern of DEFAULT_CONFIG.patterns.info) {
    if (lowerText.includes(pattern)) return 'info';
  }
  for (const pattern of DEFAULT_CONFIG.patterns.debug) {
    if (lowerText.includes(pattern)) return 'debug';
  }
  for (const pattern of DEFAULT_CONFIG.patterns.trace) {
    if (lowerText.includes(pattern)) return 'trace';
  }

  return 'unknown';
}

function normalizeLevel(value: string): LogLevel {
  const lower = value.toLowerCase().trim();
  return LEVEL_MAP[lower] || 'unknown';
}

function findFieldCaseInsensitive(
  obj: Record<string, unknown>,
  fieldName: string
): unknown | undefined {
  const lowerField = fieldName.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === lowerField) {
      return obj[key];
    }
  }
  return undefined;
}
