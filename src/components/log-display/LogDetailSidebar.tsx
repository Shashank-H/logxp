import React from 'react';
import { Box, Text } from 'ink';
import type { LogEntry } from '../../types/log';
import { LogLevelBadge } from './LogLevelBadge';
import { KeyValueDisplay } from './KeyValueDisplay';

interface LogDetailSidebarProps {
  log: LogEntry | null;
  width?: number;
}

export function LogDetailSidebar({ log, width = 50 }: LogDetailSidebarProps) {
  if (!log) {
    return (
      <Box
        width={width}
        borderStyle="single"
        borderColor="gray"
        flexDirection="column"
        padding={1}
      >
        <Text color="gray" dimColor>
          Select a log to view details
        </Text>
      </Box>
    );
  }

  const formatTimestamp = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return date.toISOString();
  };

  // Combine all log data into a single object for display
  const logData: Record<string, unknown> = {};

  if (log.level) {
    logData.level = log.level;
  }

  if (log.timestamp) {
    logData.timestamp = formatTimestamp(log.timestamp);
  }

  if (log.message) {
    logData.message = log.message;
  }

  // Add metadata fields
  if (log.metadata && Object.keys(log.metadata).length > 0) {
    Object.entries(log.metadata).forEach(([key, value]) => {
      logData[key] = value;
    });
  }

  return (
    <Box
      width={width}
      borderStyle="single"
      borderColor="cyan"
      flexDirection="column"
      padding={1}
      overflow="hidden"
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Log Details
        </Text>
      </Box>

      {/* All fields displayed as key-value pairs */}
      <Box flexDirection="column" overflow="hidden">
        <KeyValueDisplay data={logData} />
      </Box>
    </Box>
  );
}
