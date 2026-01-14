import React from 'react';
import { Box, Text } from 'ink';
import type { Filter } from '../../types/state';

interface StatusBarProps {
  totalLogs: number;
  filteredCount: number;
  activeFilters: Filter[];
  followMode: boolean;
  scrollOffset: number;
  searchTerm: string | null;
  searchMatches: number[];
  currentMatchIndex: number;
  isStreaming: boolean;
}

export function StatusBar({
  totalLogs,
  filteredCount,
  activeFilters,
  followMode,
  scrollOffset,
  searchTerm,
  searchMatches,
  currentMatchIndex,
  isStreaming,
}: StatusBarProps) {
  const hasFilters = activeFilters.length > 0;
  const hasSearch = searchTerm !== null;

  const getFilterText = () => {
    if (activeFilters.length === 0) return '';
    return activeFilters
      .map((f) => (f.type === 'level' ? `level:${f.value}` : f.value))
      .join(', ');
  };

  const getScrollPosition = () => {
    if (totalLogs === 0) return 'Top';
    if (followMode) return 'Follow';
    const percent = Math.round((scrollOffset / Math.max(1, totalLogs - 1)) * 100);
    return `${percent}%`;
  };

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box>
        {hasFilters && (
          <Text color="yellow">
            [FILTER: {getFilterText()}]{' '}
          </Text>
        )}
        {hasSearch && (
          <Text color="cyan">
            [FILTER: "{searchTerm}" ({filteredCount} {filteredCount === 1 ? 'match' : 'matches'}) - Press ESC to clear]{' '}
          </Text>
        )}
        <Text color="white">
          {filteredCount}
          {hasFilters && <Text color="gray">/{totalLogs}</Text>} logs
        </Text>
      </Box>

      <Box>
        <Text color="gray">
          Line {scrollOffset + 1} | {getScrollPosition()}
        </Text>
        <Text> | </Text>
        {followMode ? (
          <Text color="green" bold>
            FOLLOW
          </Text>
        ) : (
          <Text color="gray" dimColor>
            PAUSED
          </Text>
        )}
        {isStreaming && (
          <>
            <Text> | </Text>
            <Text color="blue">STREAMING</Text>
          </>
        )}
      </Box>
    </Box>
  );
}
