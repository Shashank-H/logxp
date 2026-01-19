import React, { useCallback, useRef } from 'react';
import { useInput, useApp, useStdin, Box, Text } from 'ink';
import { LogViewerLayout } from '../components/layout/LogViewerLayout';
import { CommandBar } from '../components/command/CommandBar';
import { HelpOverlay } from '../components/help/HelpOverlay';
import { useLogViewer } from '../context/LogViewerContext';
import { useLogStream } from '../hooks/useLogStream';
import { useCommandStream } from '../hooks/useCommandStream';
import { copyToClipboard } from '../utils/clipboard';

interface LogViewerViewProps {
  isPiped: boolean;
  command: string | null;
  onBack?: () => void;
  onShowEnv?: () => void;
}

interface KeyboardHandlerProps {
  onBack?: () => void;
  onShowEnv?: () => void;
}

// Separate component for keyboard input to avoid useInput when raw mode not supported
function KeyboardHandler({ onBack, onShowEnv }: KeyboardHandlerProps) {
  const { state, dispatch, filteredCount, getLogByIndex } = useLogViewer();
  const { exit } = useApp();
  const getLogByIndexRef = useRef(getLogByIndex);
  getLogByIndexRef.current = getLogByIndex;

  // Use refs to avoid stale closure issues in useInput
  const stateRef = useRef(state);
  stateRef.current = state;
  const filteredCountRef = useRef(filteredCount);
  filteredCountRef.current = filteredCount;
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  const onShowEnvRef = useRef(onShowEnv);
  onShowEnvRef.current = onShowEnv;

  useInput((input, key) => {
    const currentState = stateRef.current;
    const logCount = filteredCountRef.current;

    // When help is shown, only allow closing it
    if (currentState.showHelp) return;

    // When in command mode, let CommandInput handle all keys (including Ctrl+H)
    if (currentState.commandMode) return;

    // Ctrl+H toggles help (only when not in command mode)
    // Note: Don't trigger on backspace (some terminals send Ctrl+H as backspace)
    if (key.ctrl && input === 'h' && !key.backspace) {
      dispatch({ type: 'TOGGLE_HELP' });
      return;
    }

    // Ctrl+E or Cmd+E opens environment variables view
    if ((key.ctrl || key.meta) && input === 'e') {
      if (onShowEnvRef.current) {
        onShowEnvRef.current();
      }
      return;
    }

    // Ctrl+B toggles sidebar visibility
    if (key.ctrl && input === 'b') {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
      return;
    }

    // ESC: exit fullscreen first, then clear search, then go back
    if (key.escape) {
      // Exit fullscreen mode if active
      if (currentState.sidebarMode === 'fullscreen') {
        dispatch({ type: 'SET_SIDEBAR_MODE', payload: 'visible' });
        return;
      }
      if (currentState.searchTerm) {
        dispatch({ type: 'CLEAR_SEARCH' });
        return;
      }
      if (onBackRef.current) {
        onBackRef.current();
      } else {
        exit();
      }
      return;
    }

    // q quits the app entirely
    if (input === 'q') {
      exit();
      return;
    }

    // ? also opens help
    if (input === '?') {
      dispatch({ type: 'SET_HELP', payload: true });
      return;
    }

    // 'd' toggles sidebar visibility
    if (input === 'd') {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
      return;
    }

    // 'f' toggles fullscreen detail view
    if (input === 'f') {
      dispatch({ type: 'TOGGLE_FULLSCREEN_DETAIL' });
      return;
    }

    // 'c' copies the selected log to clipboard
    if (input === 'c') {
      if (currentState.selectedLogIndex !== null) {
        const log = getLogByIndexRef.current(currentState.selectedLogIndex);
        if (log) {
          copyToClipboard(log.raw).then((success) => {
            dispatch({
              type: 'SET_COPY_NOTIFICATION',
              payload: success ? 'Copied!' : 'Copy failed',
            });
            // Clear notification after 2 seconds
            setTimeout(() => {
              dispatch({ type: 'SET_COPY_NOTIFICATION', payload: null });
            }, 2000);
          });
        }
      }
      return;
    }

    if (input === '/') {
      dispatch({ type: 'SET_COMMAND_MODE', payload: true });
      return;
    }

    // Tab to switch focus between logs and details pane
    if (key.tab) {
      dispatch({ type: 'TOGGLE_FOCUS' });
      return;
    }

    if (input === ' ') {
      dispatch({ type: 'TOGGLE_FOLLOW' });
      return;
    }

    // Enter key opens sidebar and focuses it (when a log is selected)
    if (key.return) {
      if (currentState.selectedLogIndex !== null) {
        // Show sidebar if hidden
        if (currentState.sidebarMode === 'hidden') {
          dispatch({ type: 'SET_SIDEBAR_MODE', payload: 'visible' });
        }
        // Focus the details pane
        dispatch({ type: 'SET_FOCUS', payload: 'details' });
      }
      return;
    }

    // Handle navigation based on focused pane
    if (currentState.focusedPane === 'details') {
      // Detail pane scrolling
      if (key.upArrow || input === 'k') {
        dispatch({ type: 'SCROLL_DETAIL', payload: -1 });
        return;
      }
      if (key.downArrow || input === 'j') {
        dispatch({ type: 'SCROLL_DETAIL', payload: 1 });
        return;
      }
      if (key.pageUp) {
        dispatch({ type: 'SCROLL_DETAIL', payload: -10 });
        return;
      }
      if (key.pageDown) {
        dispatch({ type: 'SCROLL_DETAIL', payload: 10 });
        return;
      }
      return;
    }

    // Logs pane navigation
    if (key.upArrow || input === 'k') {
      // If no selection, start at bottom of visible area
      const visibleBottom = Math.min(
        currentState.scrollOffset + currentState.viewportHeight - 1,
        logCount - 1
      );
      const currentIndex = currentState.selectedLogIndex ?? visibleBottom;

      // If this is the first selection, just select without moving
      if (currentState.selectedLogIndex === null) {
        dispatch({ type: 'SELECT_LOG', payload: currentIndex });
        dispatch({ type: 'SET_FOLLOW', payload: false });
        return;
      }

      const newIndex = Math.max(0, currentIndex - 1);
      dispatch({ type: 'SELECT_LOG', payload: newIndex });
      // Only scroll if selection goes above visible area
      if (newIndex < currentState.scrollOffset) {
        dispatch({ type: 'SCROLL', payload: -1 });
      }
      dispatch({ type: 'SET_FOLLOW', payload: false });
      return;
    }

    if (key.downArrow || input === 'j') {
      // If no selection, start at top of visible area
      const currentIndex = currentState.selectedLogIndex ?? currentState.scrollOffset;

      // If this is the first selection, just select without moving
      if (currentState.selectedLogIndex === null) {
        dispatch({ type: 'SELECT_LOG', payload: currentIndex });
        dispatch({ type: 'SET_FOLLOW', payload: false });
        return;
      }

      const maxIndex = logCount - 1;
      const newIndex = Math.min(maxIndex, currentIndex + 1);
      dispatch({ type: 'SELECT_LOG', payload: newIndex });
      // Only scroll if selection goes below visible area
      const visibleEnd = currentState.scrollOffset + currentState.viewportHeight - 1;
      if (newIndex > visibleEnd) {
        dispatch({ type: 'SCROLL', payload: 1 });
      }
      dispatch({ type: 'SET_FOLLOW', payload: false });
      return;
    }

    if (key.pageUp) {
      const currentIndex = currentState.selectedLogIndex ?? currentState.scrollOffset;
      const newIndex = Math.max(0, currentIndex - currentState.viewportHeight);
      dispatch({ type: 'SELECT_LOG', payload: newIndex });
      // Scroll to keep selection visible
      if (newIndex < currentState.scrollOffset) {
        dispatch({ type: 'SCROLL', payload: newIndex - currentState.scrollOffset });
      }
      dispatch({ type: 'SET_FOLLOW', payload: false });
      return;
    }

    if (key.pageDown) {
      const currentIndex = currentState.selectedLogIndex ?? currentState.scrollOffset;
      const maxIndex = logCount - 1;
      const newIndex = Math.min(maxIndex, currentIndex + currentState.viewportHeight);
      dispatch({ type: 'SELECT_LOG', payload: newIndex });
      // Scroll to keep selection visible
      const visibleEnd = currentState.scrollOffset + currentState.viewportHeight - 1;
      if (newIndex > visibleEnd) {
        dispatch({ type: 'SCROLL', payload: newIndex - visibleEnd });
      }
      dispatch({ type: 'SET_FOLLOW', payload: false });
      return;
    }

    if (input === 'g') {
      dispatch({ type: 'SCROLL_TO', payload: 'top' });
      dispatch({ type: 'SELECT_LOG', payload: 0 });
      return;
    }

    if (input === 'G') {
      const lastIndex = logCount - 1;
      dispatch({ type: 'SELECT_LOG', payload: lastIndex });
      dispatch({ type: 'SCROLL_TO', payload: 'bottom' });
      return;
    }

    if (input === 'n') {
      dispatch({ type: 'NAVIGATE_SEARCH', payload: 'next' });
      return;
    }

    if (input === 'N' || input === 'p') {
      dispatch({ type: 'NAVIGATE_SEARCH', payload: 'prev' });
      return;
    }

    // Comma and period for search navigation (< and > on most keyboards)
    if (input === ',') {
      dispatch({ type: 'NAVIGATE_SEARCH', payload: 'prev' });
      return;
    }

    if (input === '.') {
      dispatch({ type: 'NAVIGATE_SEARCH', payload: 'next' });
      return;
    }
  });

  return null;
}

export function LogViewerView({ isPiped, command, onBack, onShowEnv }: LogViewerViewProps) {
  const { state, dispatch, addLogs } = useLogViewer();
  const { isRawModeSupported } = useStdin();

  const handleBatch = useCallback(
    (logs: Parameters<typeof addLogs>[0]) => {
      addLogs(logs);
    },
    [addLogs]
  );

  // Use stdin stream when piped
  useLogStream({
    isPiped,
    onBatch: handleBatch,
  });

  // Use command stream when command is provided
  const { isRunning, error } = useCommandStream({
    command: !isPiped ? command : null,
    onBatch: handleBatch,
  });

  const getState = useCallback(() => state, [state]);

  const handleCloseCommand = useCallback(() => {
    dispatch({ type: 'SET_COMMAND_MODE', payload: false });
  }, [dispatch]);

  const handleCloseHelp = useCallback(() => {
    dispatch({ type: 'SET_HELP', payload: false });
  }, [dispatch]);

  const handleToggleHelp = useCallback(() => {
    dispatch({ type: 'TOGGLE_HELP' });
  }, [dispatch]);

  // Show error if command failed
  if (error && !isRunning && state.totalLogs === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>
          Error: {error}
        </Text>
        <Text> </Text>
        <Text color="gray">Press Ctrl+C to exit</Text>
      </Box>
    );
  }

  // Show limited mode warning when raw mode is not available
  const showLimitedWarning = !isRawModeSupported && state.totalLogs === 0;

  // Show help overlay when active
  if (state.showHelp) {
    return (
      <>
        {isRawModeSupported && <KeyboardHandler onBack={onBack} onShowEnv={onShowEnv} />}
        <HelpOverlay onClose={handleCloseHelp} />
      </>
    );
  }

  return (
    <>
      {/* Only render keyboard handler when raw mode is supported */}
      {/* useInput isActive option disables it when in command mode to prevent two hooks processing keystrokes */}
      {isRawModeSupported && <KeyboardHandler onBack={onBack} onShowEnv={onShowEnv} />}

      <LogViewerLayout
        showCommand={command}
        isRunning={isRunning}
        showPipedWarning={showLimitedWarning}
      >
        {isRawModeSupported && (
          <CommandBar
            isActive={state.commandMode}
            dispatch={dispatch}
            getState={getState}
            onClose={handleCloseCommand}
            onToggleHelp={handleToggleHelp}
          />
        )}
      </LogViewerLayout>
    </>
  );
}
