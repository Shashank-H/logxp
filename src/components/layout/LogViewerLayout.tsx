import React, { useEffect } from 'react';
import { Box, Text, useStdout } from 'ink';
import { LogTable } from '../log-display/LogTable';
import { LogDetailSidebar } from '../log-display/LogDetailSidebar';
import { StatusBar } from './StatusBar';
import { useLogViewer } from '../../context/LogViewerContext';

interface LogViewerLayoutProps {
  children?: React.ReactNode;
  showCommand?: string | null;
  isRunning?: boolean;
  showPipedWarning?: boolean;
}

export function LogViewerLayout({
  children,
  showCommand,
  isRunning = false,
  showPipedWarning = false,
}: LogViewerLayoutProps) {
  const { stdout } = useStdout();
  const { state, dispatch, filteredLogs, visibleLogs } = useLogViewer();

  useEffect(() => {
    const height = stdout?.rows || 24;
    // Account for: header (3), status bar (3), log table border (2), table header (2), separator (1)
    const reservedLines = 3 + 3 + 2 + 2 + 1;
    const viewportHeight = Math.max(5, height - reservedLines);
    dispatch({ type: 'SET_VIEWPORT_HEIGHT', payload: viewportHeight });
  }, [stdout?.rows, dispatch]);

  const handleSelect = (index: number) => {
    dispatch({ type: 'SELECT_LOG', payload: index });
  };

  const selectedLog =
    state.selectedLogIndex !== null
      ? filteredLogs[state.selectedLogIndex] ?? null
      : null;

  return (
    <Box flexDirection="column" height="100%" overflow="hidden">
      {/* LogXP Header */}
      <Box
        borderStyle="double"
        borderColor="cyan"
        paddingX={1}
        justifyContent="space-between"
      >
        <Box>
          <Text color="cyan" bold>LogXP</Text>
          <Text color="gray"> - Rich CLI Log Navigator</Text>
        </Box>
        <Box>
          {showCommand && (
            <>
              <Text color="gray">cmd: </Text>
              <Text color="yellow">{showCommand}</Text>
              {isRunning && (
                <Text color="green" bold> [LIVE]</Text>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Piped mode warning */}
      {showPipedWarning && (
        <Box paddingX={1}>
          <Text color="yellow">
            Piped mode: Keyboard shortcuts disabled. Use interactive mode for full features.
          </Text>
        </Box>
      )}

      {/* Main log display area - split layout */}
      <Box flexGrow={1} flexDirection="row" overflow="hidden">
        {/* Left side: Table - takes remaining space */}
        <Box
          flexGrow={1}
          flexShrink={1}
          flexDirection="column"
          overflow="hidden"
          borderStyle={state.focusedPane === 'logs' ? 'double' : 'single'}
          borderColor={state.focusedPane === 'logs' ? 'cyan' : 'gray'}
        >
          <LogTable
            logs={visibleLogs}
            selectedIndex={state.selectedLogIndex}
            scrollOffset={state.scrollOffset}
            onSelect={handleSelect}
          />
        </Box>

        {/* Right side: Detail Sidebar - fixed width */}
        <Box flexShrink={0} width={60}>
          <LogDetailSidebar
            log={selectedLog}
            width={60}
            isFocused={state.focusedPane === 'details'}
            scrollOffset={state.detailScrollOffset}
            viewportHeight={state.viewportHeight}
          />
        </Box>
      </Box>

      {/* Command bar slot */}
      {children}

      {/* Status bar */}
      <StatusBar
        totalLogs={state.logs.length}
        filteredCount={filteredLogs.length}
        activeFilters={state.activeFilters}
        followMode={state.followMode}
        scrollOffset={state.scrollOffset}
        searchTerm={state.searchTerm}
        searchMatches={state.searchMatches}
        currentMatchIndex={state.currentMatchIndex}
        isStreaming={isRunning || state.isStreaming}
      />
    </Box>
  );
}
