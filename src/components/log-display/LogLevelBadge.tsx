import React from 'react';
import { Text } from 'ink';
import type { LogLevel } from '../../types/log';
import { DEFAULT_CONFIG } from '../../config/defaults';

interface LogLevelBadgeProps {
  level: LogLevel;
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  error: 'ERR',
  warn: 'WRN',
  info: 'INF',
  debug: 'DBG',
  trace: 'TRC',
  unknown: '---',
};

export function LogLevelBadge({ level }: LogLevelBadgeProps) {
  const color = DEFAULT_CONFIG.colors[level];
  const label = LEVEL_LABELS[level];

  return (
    <Text color={color} bold={level === 'error' || level === 'warn'}>
      [{label}]
    </Text>
  );
}
