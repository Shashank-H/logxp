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
    const viewportHeight = Math.max(5, height - 6);
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
    <Box flexDirection="column" height="100%">
      {/* Header with command info */}
      {showCommand && (
        <Box paddingX={1} borderStyle="single" borderColor="gray">
          <Text color="gray">Running: </Text>
          <Text color="cyan">{showCommand}</Text>
          {isRunning && (
            <Text color="green" bold>
              {' '}
              (active)
            </Text>
          )}
        </Box>
      )}

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
        {/* Left side: Table */}
        <Box flexGrow={1} flexDirection="column">
          <LogTable
            logs={visibleLogs}
            selectedIndex={state.selectedLogIndex}
            scrollOffset={state.scrollOffset}
            onSelect={handleSelect}
          />
        </Box>

        {/* Right side: Detail Sidebar */}
        <LogDetailSidebar log={selectedLog} width={60} />
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
