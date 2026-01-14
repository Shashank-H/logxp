import React from 'react';
import { Box, Text, useStdout } from 'ink';
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
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 80;
  // Account for sidebar (60) + borders (4) + padding
  const tableWidth = Math.max(30, termWidth - 60 - 6);

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
    return date.toISOString().replace('T', ' ').slice(0, 19);
  };

  const normalizeAndTruncate = (str: string | undefined, maxLen: number): string => {
    if (!str) return '';
    // Remove extra whitespace: trim and collapse multiple spaces to single space
    const normalized = str.trim().replace(/\s+/g, ' ');
    return normalized.length > maxLen ? normalized.slice(0, maxLen - 3) + '...' : normalized;
  };

  // Calculate message column width
  const msgWidth = Math.max(10, tableWidth - 8 - 21 - 4);

  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {/* Table Header */}
      <Box paddingX={1} flexShrink={0}>
        <Box width={8} flexShrink={0}>
          <Text bold color="cyan">Level</Text>
        </Box>
        <Box width={21} flexShrink={0}>
          <Text bold color="cyan">Timestamp</Text>
        </Box>
        <Box width={msgWidth} flexShrink={0}>
          <Text bold color="cyan">Message</Text>
        </Box>
      </Box>
      {/* Header separator */}
      <Box paddingX={1} flexShrink={0}>
        <Text color="gray" dimColor>{'─'.repeat(Math.max(10, tableWidth - 2))}</Text>
      </Box>

      {/* Table Rows - bounded container */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {logs.map((log, index) => {
          const actualIndex = scrollOffset + index;
          const isSelected = actualIndex === selectedIndex;
          // Normalize whitespace and truncate to exact width to prevent overflow
          const displayMsg = normalizeAndTruncate(log.message || log.raw, msgWidth - 1);

          return (
            <Box
              key={log.id}
              paddingX={1}
              backgroundColor={isSelected ? 'blue' : undefined}
              flexShrink={0}
              overflow="hidden"
            >
              <Box width={8} flexShrink={0} overflow="hidden">
                <LogLevelBadge level={log.level} />
              </Box>
              <Box width={21} flexShrink={0} overflow="hidden">
                <Text color={isSelected ? 'white' : 'gray'}>
                  {formatTimestamp(log.timestamp)}
                </Text>
              </Box>
              <Box width={msgWidth} flexShrink={0} overflow="hidden">
                <Text color={isSelected ? 'white' : undefined}>
                  {displayMsg}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
