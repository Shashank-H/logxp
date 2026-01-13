import React, { useCallback } from 'react';
import { useInput, useApp, useStdin, Box, Text } from 'ink';
import { LogViewerLayout } from '../components/layout/LogViewerLayout';
import { CommandBar } from '../components/command/CommandBar';
import { useLogViewer } from '../context/LogViewerContext';
import { useLogStream } from '../hooks/useLogStream';
import { useCommandStream } from '../hooks/useCommandStream';

interface LogViewerViewProps {
  isPiped: boolean;
  command: string | null;
}

// Separate component for keyboard input to avoid useInput when raw mode not supported
function KeyboardHandler() {
  const { state, dispatch } = useLogViewer();
  const { exit } = useApp();

  useInput((input, key) => {
    if (state.commandMode) return;

    if (input === 'q' || key.escape) {
      exit();
      return;
    }

    if (input === '/') {
      dispatch({ type: 'SET_COMMAND_MODE', payload: true });
      return;
    }

    if (input === ' ') {
      dispatch({ type: 'TOGGLE_FOLLOW' });
      return;
    }

    if (key.upArrow || input === 'k') {
      dispatch({ type: 'SCROLL', payload: -1 });
      return;
    }

    if (key.downArrow || input === 'j') {
      dispatch({ type: 'SCROLL', payload: 1 });
      return;
    }

    if (key.pageUp) {
      dispatch({ type: 'SCROLL', payload: -state.viewportHeight });
      return;
    }

    if (key.pageDown) {
      dispatch({ type: 'SCROLL', payload: state.viewportHeight });
      return;
    }

    if (input === 'g') {
      dispatch({ type: 'SCROLL_TO', payload: 'top' });
      return;
    }

    if (input === 'G') {
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
  });

  return null;
}

export function LogViewerView({ isPiped, command }: LogViewerViewProps) {
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

  // Show error if command failed
  if (error && !isRunning && state.logs.length === 0) {
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
  const showLimitedWarning = !isRawModeSupported && state.logs.length === 0;

  return (
    <>
      {/* Only render keyboard handler when raw mode is supported */}
      {isRawModeSupported && <KeyboardHandler />}

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
          />
        )}
      </LogViewerLayout>
    </>
  );
}
