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
  description: 'Show help overlay',
  usage: '/help',
  examples: ['/help'],
  execute: (_, context) => {
    context.dispatch({ type: 'SET_HELP', payload: true });
    return null;
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
