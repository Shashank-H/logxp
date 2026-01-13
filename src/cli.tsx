#!/usr/bin/env bun
import { render, Box, Text } from 'ink';
import { LogViewerProvider } from './context/LogViewerContext';
import { LogViewerView } from './views/LogViewerView';
import { InteractivePrompt } from './views/InteractivePrompt';

// Parse command line arguments
const args = process.argv.slice(2);
const commandArg = args.join(' ').trim();

// Check if stdin is piped
const isPiped = !process.stdin.isTTY;

// Determine mode:
// 1. If command argument provided -> command mode (spawn command, full interactivity)
// 2. If stdin is piped and no command -> piped mode (read stdin, limited interactivity)
// 3. If interactive terminal and no command -> prompt mode (ask for command)
const mode = commandArg ? 'command' : isPiped ? 'piped' : 'prompt';

function App() {
  if (mode === 'piped') {
    // Legacy piped mode - limited functionality
    return (
      <LogViewerProvider>
        <LogViewerView isPiped={true} command={null} />
      </LogViewerProvider>
    );
  }

  if (mode === 'command') {
    // Command provided as argument - full interactivity
    return (
      <LogViewerProvider>
        <LogViewerView isPiped={false} command={commandArg} />
      </LogViewerProvider>
    );
  }

  // Prompt mode - ask for command
  return <InteractivePrompt />;
}

render(<App />);
