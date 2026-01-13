import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { LogViewerProvider } from '../context/LogViewerContext';
import { LogViewerView } from './LogViewerView';

export function InteractivePrompt() {
  const [command, setCommand] = useState('');
  const [started, setStarted] = useState(false);
  const { exit } = useApp();

  useInput((input, key) => {
    if (started) return;

    if (key.escape) {
      exit();
      return;
    }

    if (key.return) {
      if (command.trim()) {
        setStarted(true);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setCommand((prev) => prev.slice(0, -1));
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      setCommand((prev) => prev + input);
    }
  });

  if (started) {
    return (
      <LogViewerProvider>
        <LogViewerView isPiped={false} command={command} />
      </LogViewerProvider>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="yellow" bold>
        LogXP - Rich CLI Log Navigator
      </Text>
      <Text> </Text>

      <Text color="white">Enter the command that outputs logs:</Text>
      <Box marginTop={1}>
        <Text color="cyan">$ </Text>
        <Text color="white">{command}</Text>
        <Text color="cyan">▋</Text>
      </Box>

      <Text> </Text>
      <Text color="gray">Examples:</Text>
      <Text color="gray">  tail -f /var/log/app.log</Text>
      <Text color="gray">  docker logs -f my-container</Text>
      <Text color="gray">  npm run dev</Text>
      <Text color="gray">  node app.js</Text>

      <Text> </Text>
      <Text color="gray" dimColor>
        Press Enter to start, Esc to quit
      </Text>

      <Text> </Text>
      <Text color="gray" dimColor>
        Tip: You can also run: logxp "your-command"
      </Text>
    </Box>
  );
}
