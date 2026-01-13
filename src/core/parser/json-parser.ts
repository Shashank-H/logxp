import type { LogEntry, ParsedJsonLog } from '../../types/log';
import { DEFAULT_CONFIG } from '../../config/defaults';
import { detectLevelFromJson } from './level-detector';

const MESSAGE_FIELDS = DEFAULT_CONFIG.jsonFields.message;
const TIMESTAMP_FIELDS = DEFAULT_CONFIG.jsonFields.timestamp;

export function isJsonLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}');
}

export function parseJsonLog(
  line: string,
  lineNumber: number
): LogEntry | null {
  try {
    const data = JSON.parse(line) as Record<string, unknown>;
    const level = detectLevelFromJson(data);
    const message = extractMessage(data);
    const timestamp = extractTimestamp(data);

    return {
      id: lineNumber,
      raw: line,
      format: 'json',
      level,
      message,
      timestamp,
      metadata: data,
      lineNumber,
    };
  } catch {
    return null;
  }
}

function extractMessage(data: Record<string, unknown>): string | undefined {
  for (const field of MESSAGE_FIELDS) {
    const value = findFieldCaseInsensitive(data, field);
    if (value !== undefined && typeof value === 'string') {
      return value;
    }
  }
  return undefined;
}

function extractTimestamp(data: Record<string, unknown>): Date | undefined {
  for (const field of TIMESTAMP_FIELDS) {
    const value = findFieldCaseInsensitive(data, field);
    if (value !== undefined) {
      const date = parseTimestamp(value);
      if (date) return date;
    }
  }
  return undefined;
}

function parseTimestamp(value: unknown): Date | undefined {
  if (value instanceof Date) return value;

  if (typeof value === 'number') {
    if (value > 1e12) {
      return new Date(value);
    }
    return new Date(value * 1000);
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return undefined;
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
