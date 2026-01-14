export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'unknown';

export type LogFormat = 'json' | 'text';

export interface LogEntry {
  id: number;
  raw: string;
  format: LogFormat;
  level: LogLevel;
  timestamp?: Date;
  message?: string;
  metadata?: Record<string, unknown>;
  lineNumber: number;
}

export interface ParsedJsonLog {
  level: LogLevel;
  message?: string;
  timestamp?: Date;
  data: Record<string, unknown>;
}

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
  unknown: 5,
};
