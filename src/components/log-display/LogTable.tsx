import React from 'react';
import { Box, Text, useStdout } from 'ink';
import type { LogEntry } from '../../types/log';
import type { SidebarMode } from '../../types/state';
import { LogLevelBadge } from './LogLevelBadge';

interface LogTableProps {
  logs: LogEntry[];
  selectedIndex: number | null;
  scrollOffset: number;
  onSelect: (index: number) => void;
  searchTerm?: string | null;
  searchMatches?: number[];
  currentMatchIndex?: number;
  sidebarMode?: SidebarMode;
}

export function LogTable({
  logs,
  selectedIndex,
  scrollOffset,
  onSelect,
  searchTerm,
  searchMatches = [],
  currentMatchIndex = -1,
  sidebarMode = 'visible',
}: LogTableProps) {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 80;
  // Account for sidebar width only when visible, plus borders and padding
  const sidebarWidth = sidebarMode === 'hidden' ? 0 : 60;
  const tableWidth = Math.max(30, termWidth - sidebarWidth - 6);

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

  // Highlight search term in text
  const highlightText = (
    text: string,
    term: string | null | undefined,
    isCurrentMatch: boolean,
    hasHighlightedBg: boolean  // true if row has highlighted background (selected or match)
  ): React.ReactNode => {
    // Text color for non-highlighted portions (black on highlighted bg, default otherwise)
    const textColor = hasHighlightedBg ? 'black' : undefined;

    if (!term) {
      return <Text color={textColor}>{text}</Text>;
    }

    const parts: React.ReactNode[] = [];
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let lastIndex = 0;
    let index = lowerText.indexOf(lowerTerm);
    let key = 0;

    while (index !== -1) {
      // Add non-matching part
      if (index > lastIndex) {
        parts.push(
          <Text key={key++} color={textColor}>
            {text.slice(lastIndex, index)}
          </Text>
        );
      }
      // Add highlighted matching part (yellow for current match, cyan for others)
      parts.push(
        <Text
          key={key++}
          backgroundColor={isCurrentMatch ? 'yellow' : 'cyan'}
          color="black"
          bold
        >
          {text.slice(index, index + term.length)}
        </Text>
      );
      lastIndex = index + term.length;
      index = lowerText.indexOf(lowerTerm, lastIndex);
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key={key++} color={textColor}>
          {text.slice(lastIndex)}
        </Text>
      );
    }

    return <>{parts}</>;
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
          // Check if this is the current match being navigated
          const currentMatchLogIndex = currentMatchIndex >= 0 ? searchMatches[currentMatchIndex] : -1;
          const isCurrentMatch = actualIndex === currentMatchLogIndex;
          // Check if this row contains the search term (for highlighting)
          const rawText = (log.message || log.raw || '').toLowerCase();
          const hasSearchMatch = searchTerm ? rawText.includes(searchTerm.toLowerCase()) : false;
          // Normalize whitespace and truncate to exact width to prevent overflow
          const displayMsg = normalizeAndTruncate(log.message || log.raw, msgWidth - 1);

          // Determine row background color
          let bgColor: string | undefined = undefined;
          if (isSelected) {
            bgColor = 'blue';
          } else if (isCurrentMatch) {
            bgColor = 'yellow';
          } else if (hasSearchMatch) {
            bgColor = 'gray';  // Highlight all matching rows
          }

          return (
            <Box
              key={log.id}
              paddingX={1}
              backgroundColor={bgColor}
              flexShrink={0}
              overflow="hidden"
            >
              <Box width={8} flexShrink={0} overflow="hidden">
                <LogLevelBadge level={log.level} />
              </Box>
              <Box width={21} flexShrink={0} overflow="hidden">
                <Text color={isSelected ? 'white' : (isCurrentMatch || hasSearchMatch) ? 'black' : 'gray'}>
                  {formatTimestamp(log.timestamp)}
                </Text>
              </Box>
              <Box width={msgWidth} flexShrink={0} overflow="hidden">
                {hasSearchMatch
                  ? highlightText(displayMsg, searchTerm, isCurrentMatch, isSelected || hasSearchMatch)
                  : <Text color={isSelected ? 'white' : undefined}>{displayMsg}</Text>
                }
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
