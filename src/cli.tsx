#!/usr/bin/env bun
import { render, Box, Text } from 'ink';
import { LogViewerProvider } from './context/LogViewerContext';
import { LogViewerView } from './views/LogViewerView';
import { InteractivePrompt } from './views/InteractivePrompt';
import { shellHistory } from './core/history';

// Version from package.json
const VERSION = '0.1.0';

// Parse command line arguments
const args = process.argv.slice(2);

// Handle --version and --help flags
if (args.includes('--version') || args.includes('-v')) {
  console.log(`logxp ${VERSION}`);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
logxp ${VERSION} - Rich CLI Log Navigator

USAGE:
  logxp [command]           Run command and view its logs
  logxp                     Interactive mode (prompts for command)
  command | logxp           Pipe logs into logxp

OPTIONS:
  -h, --help                Show this help message
  -v, --version             Show version number

EXAMPLES:
  logxp "tail -f /var/log/app.log"
  logxp "docker logs -f container"
  logxp "npm run dev"
  kubectl logs -f pod | logxp

KEYBOARD SHORTCUTS (in viewer):
  /         Open command palette
  ?         Show help
  q         Quit
  ESC       Go back to home
  j/k       Navigate up/down
  Space     Toggle follow mode

For more info: https://github.com/Shashank-H/logxp
`);
  process.exit(0);
}

const commandArg = args.join(' ').trim();

// Save CLI command to history
if (commandArg) {
  shellHistory.add(commandArg);
}

// Check if stdin is piped
const isPiped = !process.stdin.isTTY;

// Determine mode:
// 1. If command argument provided -> command mode (spawn command, full interactivity)
// 2. If stdin is piped and no command -> piped mode (read stdin, limited interactivity)
// 3. If interactive terminal and no command -> prompt mode (ask for command)
const mode = commandArg ? 'command' : isPiped ? 'piped' : 'prompt';

// Enter alternate screen buffer (like vim, nano, htop)
// This hides the command prompt and previous terminal content
if (!isPiped) {
  process.stdout.write('\x1b[?1049h'); // Enter alternate screen buffer
  process.stdout.write('\x1b[2J');     // Clear screen
  process.stdout.write('\x1b[H');      // Move cursor to top-left
}

// Restore terminal on exit
function cleanup() {
  if (!isPiped) {
    process.stdout.write('\x1b[?1049l'); // Exit alternate screen buffer
  }
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

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

render(<App />, { fullScreen: true });
