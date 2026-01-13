import React from 'react';
import { Box, Text } from 'ink';
import type { LogEntry as LogEntryType } from '../../types/log';
import { LogEntry } from './LogEntry';

interface LogListProps {
  logs: LogEntryType[];
  searchTerm?: string | null;
  searchMatches?: number[];
  currentMatchIndex?: number;
  scrollOffset?: number;
}

export function LogList({
  logs,
  searchTerm,
  searchMatches = [],
  currentMatchIndex = -1,
  scrollOffset = 0,
}: LogListProps) {
  if (logs.length === 0) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text color="gray" dimColor>
          Waiting for log input...
        </Text>
      </Box>
    );
  }

  const currentMatchLogIndex =
    currentMatchIndex >= 0 ? searchMatches[currentMatchIndex] : -1;

  return (
    <Box flexDirection="column" flexGrow={1}>
      {logs.map((log, index) => {
        const actualIndex = scrollOffset + index;
        const isCurrentMatch = actualIndex === currentMatchLogIndex;

        return (
          <LogEntry
            key={log.id}
            entry={log}
            searchTerm={searchTerm}
            isCurrentMatch={isCurrentMatch}
          />
        );
      })}
    </Box>
  );
}
