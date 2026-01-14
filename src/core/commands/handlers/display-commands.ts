import type { CommandDefinition } from '../../../types/command';

export const followCommand: CommandDefinition = {
  name: 'follow',
  aliases: ['f', 'tail'],
  description: 'Enable auto-scroll to newest logs',
  usage: '/follow',
  examples: ['/follow'],
  execute: (_, context) => {
    context.dispatch({ type: 'SET_FOLLOW', payload: true });
    return 'Follow mode enabled';
  },
};

export const nofollowCommand: CommandDefinition = {
  name: 'nofollow',
  aliases: ['pause', 'stop'],
  description: 'Disable auto-scroll for manual navigation',
  usage: '/nofollow',
  examples: ['/nofollow', '/pause'],
  execute: (_, context) => {
    context.dispatch({ type: 'SET_FOLLOW', payload: false });
    return 'Follow mode disabled';
  },
};

export const clearCommand: CommandDefinition = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear current log buffer',
  usage: '/clear',
  examples: ['/clear'],
  execute: (_, context) => {
    context.dispatch({ type: 'CLEAR_LOGS' });
    return 'Logs cleared';
  },
};

export const helpCommand: CommandDefinition = {
  name: 'help',
  aliases: ['h', '?'],
  description: 'Show available commands',
  usage: '/help',
  examples: ['/help'],
  execute: () => {
    return `
Commands:
  /filter <keyword>     Filter logs by keyword
  /filter level:<lvl>   Filter by level (error, warn, info, debug, trace)
  /clear-filter         Clear all filters
  /search <term>        Search and highlight text
  /search-next, /n      Jump to next match
  /search-prev, /p      Jump to previous match
  /clear-search         Clear search
  /sort <type>          Sort by timestamp, level, or default
  /follow               Enable auto-scroll
  /nofollow             Disable auto-scroll
  /clear                Clear log buffer
  /help                 Show this help

Keys:
  ↑/↓, j/k              Scroll up/down
  PgUp/PgDn             Scroll by page
  g/G                   Jump to top/bottom
  Space                 Toggle follow mode
  n/N                   Next/previous search match
  /                     Enter command mode
  q, Esc                Quit
`.trim();
  },
};

export const quitCommand: CommandDefinition = {
  name: 'quit',
  aliases: ['q', 'exit'],
  description: 'Exit the application',
  usage: '/quit',
  examples: ['/quit'],
  execute: () => {
    process.exit(0);
  },
};
