import React, { useEffect } from 'react';
import { Box, Text, useStdout } from 'ink';
import { LogList } from '../log-display/LogList';
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

      {/* Main log display area */}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        <LogList
          logs={visibleLogs}
          searchTerm={state.searchTerm}
          searchMatches={state.searchMatches}
          currentMatchIndex={state.currentMatchIndex}
          scrollOffset={state.scrollOffset}
        />
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
