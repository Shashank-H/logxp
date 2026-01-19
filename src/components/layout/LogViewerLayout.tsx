import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, useStdout } from 'ink';
import { LogTable } from '../log-display/LogTable';
import { LogDetailSidebar } from '../log-display/LogDetailSidebar';
import { StatusBar } from './StatusBar';
import { useLogViewer } from '../../context/LogViewerContext';

// Debounce delay for showing log details (ms)
const DETAIL_DEBOUNCE_MS = 200;

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
  const { state, dispatch, filteredCount, visibleLogs, getLogByIndex } = useLogViewer();

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

  // Debounce the selected log index for detail panel
  const [debouncedIndex, setDebouncedIndex] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced value after delay
    debounceRef.current = setTimeout(() => {
      setDebouncedIndex(state.selectedLogIndex);
    }, DETAIL_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.selectedLogIndex]);

  // Only fetch log details for debounced index
  const selectedLog =
    debouncedIndex !== null
      ? getLogByIndex(debouncedIndex)
      : null;

  return (
    <Box flexDirection="column" height="100%" overflow="hidden" position="relative">
      {/* LogXP Header */}
      <Box
        borderStyle="double"
        borderColor="cyan"
        paddingX={1}
        justifyContent="space-between"
        flexShrink={0}
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
        {/* Left side: Table - hidden in fullscreen mode */}
        {state.sidebarMode !== 'fullscreen' && (
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
              searchTerm={state.searchTerm}
              searchMatches={state.searchMatches}
              currentMatchIndex={state.currentMatchIndex}
              sidebarMode={state.sidebarMode}
            />
          </Box>
        )}

        {/* Right side: Detail Sidebar - hidden when sidebarMode is 'hidden', full-width in fullscreen */}
        {state.sidebarMode !== 'hidden' && (
          <LogDetailSidebar
            log={selectedLog}
            width={state.sidebarMode === 'fullscreen' ? undefined : 60}
            isFocused={state.focusedPane === 'details'}
            scrollOffset={state.detailScrollOffset}
            viewportHeight={state.viewportHeight}
            isFullscreen={state.sidebarMode === 'fullscreen'}
          />
        )}
      </Box>

      {/* Status bar */}
      <StatusBar
        totalLogs={state.totalLogs}
        filteredCount={filteredCount}
        activeFilters={state.activeFilters}
        followMode={state.followMode}
        scrollOffset={state.scrollOffset}
        searchTerm={state.searchTerm}
        searchMatches={state.searchMatches}
        currentMatchIndex={state.currentMatchIndex}
        isStreaming={isRunning || state.isStreaming}
        sidebarMode={state.sidebarMode}
        copyNotification={state.copyNotification}
      />

      {/* Command bar overlay - positioned absolutely on top */}
      {children}
    </Box>
  );
}
