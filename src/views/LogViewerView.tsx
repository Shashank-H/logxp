import React, { useCallback, useEffect } from 'react';
import { useInput, useApp } from 'ink';
import { LogViewerLayout } from '../components/layout/LogViewerLayout';
import { CommandBar } from '../components/command/CommandBar';
import { useLogViewer } from '../context/LogViewerContext';
import { useLogStream } from '../hooks/useLogStream';

interface LogViewerViewProps {
  isPiped: boolean;
}

function useKeyboardInput(
  isPiped: boolean,
  state: ReturnType<typeof useLogViewer>['state'],
  dispatch: ReturnType<typeof useLogViewer>['dispatch']
) {
  const { exit } = useApp();

  useEffect(() => {
    if (isPiped) {
      const handleExit = () => {
        setTimeout(() => exit(), 100);
      };

      process.stdin.on('end', handleExit);
      return () => {
        process.stdin.off('end', handleExit);
      };
    }
  }, [isPiped, exit]);

  useInput(
    (input, key) => {
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
    },
    { isActive: !isPiped }
  );
}

export function LogViewerView({ isPiped }: LogViewerViewProps) {
  const { state, dispatch, addLogs } = useLogViewer();

  const handleBatch = useCallback(
    (logs: Parameters<typeof addLogs>[0]) => {
      addLogs(logs);
    },
    [addLogs]
  );

  const { isStreaming } = useLogStream({
    isPiped,
    onBatch: handleBatch,
  });

  useKeyboardInput(isPiped, state, dispatch);

  const getState = useCallback(() => state, [state]);

  const handleCloseCommand = useCallback(() => {
    dispatch({ type: 'SET_COMMAND_MODE', payload: false });
  }, [dispatch]);

  return (
    <LogViewerLayout>
      {!isPiped && (
        <CommandBar
          isActive={state.commandMode}
          dispatch={dispatch}
          getState={getState}
          onClose={handleCloseCommand}
        />
      )}
    </LogViewerLayout>
  );
}
