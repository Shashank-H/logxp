import React from 'react';
import { Box, Text } from 'ink';
import type { LogEntry } from '../../types/log';
import { LogLevelBadge } from './LogLevelBadge';

interface LogTableProps {
  logs: LogEntry[];
  selectedIndex: number | null;
  scrollOffset: number;
  onSelect: (index: number) => void;
}

export function LogTable({
  logs,
  selectedIndex,
  scrollOffset,
  onSelect,
}: LogTableProps) {
  if (logs.length === 0) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text color="gray" dimColor>
          Waiting for log input...
        </Text>
      </Box>
    );
  }

  const formatTimestamp = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return date.toISOString().replace('T', ' ').slice(0, 23);
  };

  const truncate = (str: string | undefined, maxLen: number): string => {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
  };

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Table Header */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Box width={8}>
          <Text bold color="cyan">Level</Text>
        </Box>
        <Box width={25}>
          <Text bold color="cyan">Timestamp</Text>
        </Box>
        <Box flexGrow={1}>
          <Text bold color="cyan">Message</Text>
        </Box>
      </Box>

      {/* Table Rows */}
      {logs.map((log, index) => {
        const actualIndex = scrollOffset + index;
        const isSelected = actualIndex === selectedIndex;

        return (
          <Box
            key={log.id}
            paddingX={1}
            backgroundColor={isSelected ? 'blue' : undefined}
          >
            <Box width={8}>
              <LogLevelBadge level={log.level} />
            </Box>
            <Box width={25}>
              <Text color={isSelected ? 'white' : 'gray'}>
                {formatTimestamp(log.timestamp)}
              </Text>
            </Box>
            <Box flexGrow={1}>
              <Text color={isSelected ? 'white' : undefined}>
                {truncate(log.message, 80)}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
