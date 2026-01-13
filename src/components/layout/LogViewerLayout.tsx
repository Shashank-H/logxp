import React, { useEffect } from 'react';
import { Box, useStdout } from 'ink';
import { LogList } from '../log-display/LogList';
import { StatusBar } from './StatusBar';
import { useLogViewer } from '../../context/LogViewerContext';

interface LogViewerLayoutProps {
  children?: React.ReactNode;
}

export function LogViewerLayout({ children }: LogViewerLayoutProps) {
  const { stdout } = useStdout();
  const { state, dispatch, filteredLogs, visibleLogs } = useLogViewer();

  useEffect(() => {
    const height = stdout?.rows || 24;
    const viewportHeight = Math.max(5, height - 4);
    dispatch({ type: 'SET_VIEWPORT_HEIGHT', payload: viewportHeight });
  }, [stdout?.rows, dispatch]);

  return (
    <Box flexDirection="column" height="100%">
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        <LogList
          logs={visibleLogs}
          searchTerm={state.searchTerm}
          searchMatches={state.searchMatches}
          currentMatchIndex={state.currentMatchIndex}
          scrollOffset={state.scrollOffset}
        />
      </Box>

      {children}

      <StatusBar
        totalLogs={state.logs.length}
        filteredCount={filteredLogs.length}
        activeFilters={state.activeFilters}
        followMode={state.followMode}
        scrollOffset={state.scrollOffset}
        searchTerm={state.searchTerm}
        searchMatches={state.searchMatches}
        currentMatchIndex={state.currentMatchIndex}
        isStreaming={state.isStreaming}
      />
    </Box>
  );
}
