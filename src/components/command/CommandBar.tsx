import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { CommandInput } from './CommandInput';
import { executeCommand } from '../../core/commands';
import type { LogViewerState, LogViewerAction } from '../../types/state';

interface CommandBarProps {
  isActive: boolean;
  dispatch: React.Dispatch<LogViewerAction>;
  getState: () => LogViewerState;
  onClose: () => void;
}

export function CommandBar({
  isActive,
  dispatch,
  getState,
  onClose,
}: CommandBarProps) {
  const [input, setInput] = useState('/');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const handleSubmit = useCallback(
    (value: string) => {
      const result = executeCommand(value, { dispatch, getState });

      if (result.message) {
        setMessage({
          text: result.message,
          isError: !result.success,
        });

        setTimeout(() => {
          setMessage(null);
          if (result.success) {
            onClose();
          }
        }, 2000);
      } else {
        onClose();
      }

      setInput('/');
    },
    [dispatch, getState, onClose]
  );

  const handleCancel = useCallback(() => {
    setInput('/');
    setMessage(null);
    onClose();
  }, [onClose]);

  if (!isActive && !message) {
    return null;
  }

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="flex-start"
      paddingTop={3}
    >
      <Box
        width={80}
        flexDirection="column"
        borderStyle="single"
        borderColor="cyan"
        paddingX={1}
        backgroundColor="black"
      >
        {message && (
          <Text color={message.isError ? 'red' : 'green'}>{message.text}</Text>
        )}
        {isActive && !message && (
          <CommandInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </Box>
    </Box>
  );
}
