import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { LogEntry } from '../../types/log';
import type { FocusedPane } from '../../types/state';

interface LogDetailSidebarProps {
  log: LogEntry | null;
  width?: number;
  isFocused?: boolean;
  scrollOffset?: number;
  viewportHeight?: number;
}

export function LogDetailSidebar({
  log,
  width = 50,
  isFocused = false,
  scrollOffset = 0,
  viewportHeight = 20,
}: LogDetailSidebarProps) {
  const borderColor = isFocused ? 'cyan' : 'gray';

  if (!log) {
    return (
      <Box
        width={width}
        borderStyle="single"
        borderColor={borderColor}
        flexDirection="column"
        padding={1}
        flexShrink={0}
      >
        <Text color="gray" dimColor>
          Select a log to view details
        </Text>
        <Text> </Text>
        <Text color="gray" dimColor>
          Press Tab to switch focus
        </Text>
      </Box>
    );
  }

  const formatTimestamp = (date: Date | undefined): string => {
    if (!date) return 'N/A';
    return date.toISOString();
  };

  // Trim only trailing whitespace
  const trimTrailing = (str: string): string => {
    return str.replace(/\s+$/, '');
  };

  // Build content lines for scrollable display
  const contentLines = useMemo(() => {
    const lines: Array<{ key: string; value: string; isHeader?: boolean }> = [];

    if (log.level) {
      lines.push({ key: 'level', value: log.level.toUpperCase() });
    }

    if (log.timestamp) {
      lines.push({ key: 'timestamp', value: formatTimestamp(log.timestamp) });
    }

    if (log.message) {
      // Split long messages into multiple lines
      const maxWidth = width - 6; // Account for padding and border
      const message = trimTrailing(log.message);
      lines.push({ key: 'message', value: '', isHeader: true });

      // Word wrap the message
      let currentLine = '';
      const words = message.split(' ');
      for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            lines.push({ key: '', value: trimTrailing(currentLine) });
          }
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push({ key: '', value: trimTrailing(currentLine) });
      }
    }

    // Add metadata fields
    if (log.metadata && Object.keys(log.metadata).length > 0) {
      lines.push({ key: '---', value: '---', isHeader: true });
      Object.entries(log.metadata).forEach(([key, value]) => {
        const strValue = typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);

        // Handle multiline values
        const valueLines = strValue.split('\n');
        valueLines.forEach((line, i) => {
          lines.push({
            key: i === 0 ? key : '',
            value: trimTrailing(line)
          });
        });
      });
    }

    // Add raw log
    lines.push({ key: '---', value: '---', isHeader: true });
    lines.push({ key: 'raw', value: '', isHeader: true });
    const rawLines = log.raw.split('\n');
    rawLines.forEach(line => {
      lines.push({ key: '', value: trimTrailing(line) });
    });

    return lines;
  }, [log, width]);

  // Calculate visible lines based on scroll
  const visibleLines = contentLines.slice(scrollOffset, scrollOffset + viewportHeight - 4);
  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset + viewportHeight - 4 < contentLines.length;

  return (
    <Box
      width={width}
      borderStyle={isFocused ? 'double' : 'single'}
      borderColor={borderColor}
      flexDirection="column"
      padding={1}
      overflow="hidden"
      flexShrink={0}
    >
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color={isFocused ? 'cyan' : 'white'}>
          Log Details {isFocused ? '(focused)' : ''}
        </Text>
        {(canScrollUp || canScrollDown) && (
          <Text color="gray">
            {canScrollUp ? '↑' : ' '}{canScrollDown ? '↓' : ' '}
          </Text>
        )}
      </Box>

      {/* Scrollable content */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {visibleLines.map((line, index) => {
          if (line.key === '---') {
            return (
              <Box key={index}>
                <Text color="gray" dimColor>{'─'.repeat(width - 6)}</Text>
              </Box>
            );
          }
          if (line.isHeader) {
            return (
              <Box key={index}>
                <Text color="cyan" bold>{line.key}:</Text>
              </Box>
            );
          }
          if (line.key) {
            return (
              <Box key={index}>
                <Text color="cyan">{line.key}: </Text>
                <Text color="white">{line.value}</Text>
              </Box>
            );
          }
          return (
            <Box key={index}>
              <Text color="gray">{line.value}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
