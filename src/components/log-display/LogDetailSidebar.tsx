import React, { useMemo } from 'react';
import { Box, Text, useStdout } from 'ink';
import type { LogEntry } from '../../types/log';
import type { FocusedPane } from '../../types/state';

interface LogDetailSidebarProps {
  log: LogEntry | null;
  width?: number;
  isFocused?: boolean;
  scrollOffset?: number;
  viewportHeight?: number;
  isFullscreen?: boolean;
}

export function LogDetailSidebar({
  log,
  width,
  isFocused = false,
  scrollOffset = 0,
  viewportHeight = 20,
  isFullscreen = false,
}: LogDetailSidebarProps) {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 80;
  // Use terminal width when fullscreen, otherwise use provided width or default
  const effectiveWidth = isFullscreen ? termWidth : (width ?? 50);
  const borderColor = isFocused ? 'cyan' : 'gray';

  if (!log) {
    return (
      <Box
        width={isFullscreen ? undefined : effectiveWidth}
        flexGrow={1}
        borderStyle={isFullscreen ? 'double' : 'single'}
        borderColor={isFullscreen ? 'magenta' : borderColor}
        flexDirection="column"
        padding={1}
        flexShrink={0}
      >
        <Text color="gray" dimColor>
          Select a log to view details
        </Text>
        <Text> </Text>
        <Text color="gray" dimColor>
          {isFullscreen ? 'Press f or ESC to exit fullscreen' : 'Press Tab to switch focus'}
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
      const maxWidth = effectiveWidth - 6; // Account for padding and border
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

    // Add metadata fields - truncate to fit width
    if (log.metadata && Object.keys(log.metadata).length > 0) {
      lines.push({ key: '---', value: '---', isHeader: true });
      const maxWidth = effectiveWidth - 6; // Account for padding and border
      Object.entries(log.metadata).forEach(([key, value]) => {
        const strValue = typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value);

        // Handle multiline values and truncate long lines
        const valueLines = strValue.split('\n');
        valueLines.forEach((line, i) => {
          const trimmed = trimTrailing(line);
          const keyPart = i === 0 ? key : '';
          const availableWidth = keyPart ? maxWidth - keyPart.length - 2 : maxWidth;
          const truncated = trimmed.length > availableWidth
            ? trimmed.slice(0, availableWidth - 3) + '...'
            : trimmed;
          lines.push({
            key: keyPart,
            value: truncated
          });
        });
      });
    }

    // Add raw log - wrap lines to fit width (never truncate)
    lines.push({ key: '---', value: '---', isHeader: true });
    lines.push({ key: 'raw', value: '', isHeader: true });
    // Use conservative width: effectiveWidth - padding(2) - border(2) - safety margin(2)
    const rawMaxWidth = Math.max(20, effectiveWidth - 8);
    const rawLines = log.raw.split('\n');
    rawLines.forEach(line => {
      const trimmed = trimTrailing(line);
      if (trimmed.length === 0) {
        lines.push({ key: '', value: '' });
      } else if (trimmed.length <= rawMaxWidth) {
        lines.push({ key: '', value: trimmed });
      } else {
        // Split into multiple lines - hard wrap at rawMaxWidth
        for (let i = 0; i < trimmed.length; i += rawMaxWidth) {
          lines.push({ key: '', value: trimmed.slice(i, i + rawMaxWidth) });
        }
      }
    });

    return lines;
  }, [log, effectiveWidth]);

  // Calculate visible area and clamp scroll offset to valid range
  const visibleAreaHeight = viewportHeight - 2; // Account for header and border
  const maxScrollOffset = Math.max(0, contentLines.length - visibleAreaHeight);
  const clampedScrollOffset = Math.min(scrollOffset, maxScrollOffset);
  const visibleLines = contentLines.slice(clampedScrollOffset, clampedScrollOffset + visibleAreaHeight);
  const canScrollUp = clampedScrollOffset > 0;
  const canScrollDown = clampedScrollOffset < maxScrollOffset;

  return (
    <Box
      width={isFullscreen ? undefined : effectiveWidth}
      flexGrow={1}
      borderStyle={isFullscreen ? 'double' : (isFocused ? 'double' : 'single')}
      borderColor={isFullscreen ? 'magenta' : borderColor}
      flexDirection="column"
      padding={1}
      overflow="hidden"
      flexShrink={0}
    >
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Text bold color={isFullscreen ? 'magenta' : (isFocused ? 'cyan' : 'white')}>
            Log Details
          </Text>
          {isFullscreen && (
            <Text color="gray"> (fullscreen - press f or ESC to exit)</Text>
          )}
          {!isFullscreen && isFocused && (
            <Text color="cyan"> (focused)</Text>
          )}
        </Box>
        {(canScrollUp || canScrollDown) && (
          <Text color="gray">
            {canScrollUp ? '↑' : ' '}{canScrollDown ? '↓' : ' '}
          </Text>
        )}
      </Box>

      {/* Scrollable content - fill available space */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {visibleLines.map((line, index) => {
          if (line.key === '---') {
            return (
              <Box key={index} flexShrink={0}>
                <Text color="gray" dimColor>{'─'.repeat(Math.max(10, effectiveWidth - 6))}</Text>
              </Box>
            );
          }
          if (line.isHeader) {
            return (
              <Box key={index} flexShrink={0}>
                <Text color="cyan" bold>{line.key}:</Text>
              </Box>
            );
          }
          if (line.key) {
            return (
              <Box key={index} flexShrink={0}>
                <Text color="cyan">{line.key}: </Text>
                <Text color="white">{line.value}</Text>
              </Box>
            );
          }
          return (
            <Box key={index} flexShrink={0}>
              <Text color="gray">{line.value}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
