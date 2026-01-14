import React, { useState, useRef, useCallback } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { LogViewerProvider } from '../context/LogViewerContext';
import { LogViewerView } from './LogViewerView';
import { shellHistory } from '../core/history';
import { parse as parseYaml } from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load app name art from yaml
function loadAppNameArt(): string {
  try {
    const artPath = join(import.meta.dir, '../../art.yml');
    const content = readFileSync(artPath, 'utf-8');
    const parsed = parseYaml(content);
    return parsed.name?.trim() || 'LogXP';
  } catch {
    return 'LogXP';
  }
}

const APP_NAME = loadAppNameArt();

export function InteractivePrompt() {
  const [command, setCommand] = useState('');
  const [started, setStarted] = useState(false);
  const { exit } = useApp();
  const { stdout } = useStdout();
  const commandRef = useRef(command);
  commandRef.current = command;

  const termWidth = stdout?.columns || 120;

  useInput((input, key) => {
    if (started) return;

    if (key.escape) {
      exit();
      return;
    }

    if (key.return) {
      if (commandRef.current.trim()) {
        // Save to history before starting
        shellHistory.add(commandRef.current.trim());
        setStarted(true);
      }
      return;
    }

    // Up arrow - previous command from history
    if (key.upArrow) {
      const prev = shellHistory.previous(commandRef.current);
      if (prev !== null) {
        setCommand(prev);
      }
      return;
    }

    // Down arrow - next command from history
    if (key.downArrow) {
      const next = shellHistory.next();
      if (next !== null) {
        setCommand(next);
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

  const handleBack = useCallback(() => {
    setStarted(false);
    setCommand('');
  }, []);

  if (started) {
    return (
      <LogViewerProvider>
        <LogViewerView isPiped={false} command={command} onBack={handleBack} />
      </LogViewerProvider>
    );
  }

  const inputWidth = Math.min(80, termWidth - 4);
  const termHeight = stdout?.rows || 24;

  return (
    <Box
      width={termWidth}
      height={termHeight}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      {/* App Name Art */}
      <Box flexDirection="column" alignItems="center">
        <Text color="cyan" bold>{APP_NAME}</Text>
      </Box>

      {/* Tagline */}
      <Box marginTop={1}>
        <Text color="gray">Rich CLI Log Navigator</Text>
      </Box>

      {/* Input Section */}
      <Box
        flexDirection="column"
        marginTop={2}
        width={inputWidth}
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
      >
        <Text color="white">Enter a command that outputs logs:</Text>
        <Box marginTop={1}>
          <Text color="green" bold>$ </Text>
          <Text color="white">{command}</Text>
          <Text color="cyan" bold>▋</Text>
        </Box>
      </Box>

      {/* Examples */}
      <Box flexDirection="column" alignItems="center" marginTop={1}>
        <Text color="gray" dimColor>
          Examples: <Text color="white">tail -f /var/log/app.log</Text> | <Text color="white">docker logs -f container</Text> | <Text color="white">npm run dev</Text>
        </Text>
      </Box>

      {/* Controls */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          <Text color="green">Enter</Text> Start  |  <Text color="yellow">↑↓</Text> History  |  <Text color="red">Esc</Text> Quit
        </Text>
      </Box>
    </Box>
  );
}
