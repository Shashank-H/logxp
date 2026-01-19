import React from 'react';
import { Box, Text } from 'ink';
import type { Filter, SidebarMode } from '../../types/state';

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
  sidebarMode: SidebarMode;
  copyNotification?: string | null;
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
  sidebarMode,
  copyNotification,
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
      flexShrink={0}
    >
      <Box>
        {hasFilters && (
          <Text color="yellow">
            [FILTER: {getFilterText()}]{' '}
          </Text>
        )}
        {hasSearch && (
          <Text color="cyan">
            [SEARCH: "{searchTerm}" ({searchMatches.length === 0 ? 'no matches' :
              currentMatchIndex >= 0
                ? `${currentMatchIndex + 1}/${searchMatches.length}`
                : `${searchMatches.length} ${searchMatches.length === 1 ? 'match' : 'matches'}`
            }) - ,/. to navigate, ESC to clear]{' '}
          </Text>
        )}
        <Text color="white">
          {filteredCount}
          {hasFilters && <Text color="gray">/{totalLogs}</Text>} logs
        </Text>
      </Box>

      <Box>
        {copyNotification && (
          <>
            <Text color={copyNotification === 'Copied!' ? 'green' : 'red'} bold>
              {copyNotification}
            </Text>
            <Text> | </Text>
          </>
        )}
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
        <Text> | </Text>
        {sidebarMode === 'hidden' ? (
          <Text color="gray" dimColor>PANEL:OFF</Text>
        ) : sidebarMode === 'fullscreen' ? (
          <Text color="magenta" bold>FULLSCREEN</Text>
        ) : (
          <Text color="cyan">PANEL</Text>
        )}
      </Box>
    </Box>
  );
}
