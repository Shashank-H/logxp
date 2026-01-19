import React, { useState, useRef, useCallback } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import { LogViewerProvider } from '../context/LogViewerContext';
import { LogViewerView } from './LogViewerView';
import { EnvView } from './EnvView';
import { HelpOverlay } from '../components/help/HelpOverlay';
import { shellHistory } from '../core/history';
import packageJson from '../../package.json';

type View = 'home' | 'logs' | 'env';

// ASCII art inlined for bundled executable compatibility
const APP_NAME = `█████                         █████ █████ ███████████
░░███                         ░░███ ░░███ ░░███░░░░░███
 ░███         ██████   ███████ ░░███ ███   ░███    ░███
 ░███        ███░░███ ███░░███  ░░█████    ░██████████
 ░███       ░███ ░███░███ ░███   ███░███   ░███░░░░░░
 ░███      █░███ ░███░███ ░███  ███ ░░███  ░███
 ███████████░░██████ ░░███████ █████ █████ █████
░░░░░░░░░░░  ░░░░░░   ░░░░░███░░░░░ ░░░░░ ░░░░░
                      ███ ░███
                    ░░██████
                      ░░░░░░`;

export function InteractivePrompt() {
  const [command, setCommand] = useState('');
  const [currentView, setCurrentView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [showHelp, setShowHelp] = useState(false);
  const { exit } = useApp();
  const { stdout } = useStdout();
  const commandRef = useRef(command);
  commandRef.current = command;

  const termWidth = stdout?.columns || 120;

  useInput((input, key) => {
    // Handle help overlay close
    if (showHelp) {
      if (key.escape || input === 'q' || (key.ctrl && input === 'h') || input === '?') {
        setShowHelp(false);
      }
      return;
    }

    if (currentView !== 'home') return;

    // Show help with ? or Ctrl+H
    if (input === '?' || (key.ctrl && input === 'h')) {
      setShowHelp(true);
      return;
    }

    if (key.escape) {
      exit();
      return;
    }

    if (key.return) {
      if (commandRef.current.trim()) {
        // Save to history before starting
        shellHistory.add(commandRef.current.trim());
        setCurrentView('logs');
      }
      return;
    }

    // Ctrl+E or Cmd+E to open environment variables view
    if ((key.ctrl || key.meta) && input === 'e') {
      setPreviousView('home');
      setCurrentView('env');
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
    setCurrentView('home');
    setCommand('');
  }, []);

  const handleShowEnv = useCallback(() => {
    setPreviousView('logs');
    setCurrentView('env');
  }, []);

  const handleEnvBack = useCallback(() => {
    setCurrentView(previousView);
  }, [previousView]);

  if (currentView === 'logs') {
    return (
      <LogViewerProvider>
        <LogViewerView isPiped={false} command={command} onBack={handleBack} onShowEnv={handleShowEnv} />
      </LogViewerProvider>
    );
  }

  if (currentView === 'env') {
    return <EnvView onBack={handleEnvBack} />;
  }

  const inputWidth = Math.min(80, termWidth - 4);
  const termHeight = stdout?.rows || 24;
  const cwd = process.cwd();

  return (
    <Box
      width={termWidth}
      height={termHeight}
      flexDirection="column"
    >
      {/* Main content - centered */}
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
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
            <Text color="green">Enter</Text> Start  |  <Text color="yellow">↑↓</Text> History  |  <Text color="cyan">Ctrl+E</Text> Env Vars  |  <Text color="red">Esc</Text> Quit
          </Text>
        </Box>
      </Box>

      {/* Footer - cwd on left, version on right */}
      <Box paddingX={1} justifyContent="space-between">
        <Text color="gray" dimColor>{cwd}</Text>
        <Text color="gray" dimColor>v{packageJson.version}</Text>
      </Box>
    </Box>
  );
}
