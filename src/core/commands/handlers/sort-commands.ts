import type { CommandDefinition } from '../../../types/command';

export const sortCommand: CommandDefinition = {
  name: 'sort',
  aliases: [],
  description: 'Sort logs by timestamp, level, or default order',
  usage: '/sort <timestamp|level|default>',
  examples: ['/sort timestamp', '/sort level', '/sort default'],
  execute: (args, context) => {
    if (args.length === 0) {
      return 'Usage: /sort <timestamp|level|default>';
    }

    const sortType = args[0].toLowerCase();

    if (sortType === 'timestamp' || sortType === 'time' || sortType === 'ts') {
      context.dispatch({ type: 'SET_SORT', payload: 'timestamp' });
      return 'Sorting by timestamp';
    }

    if (sortType === 'level' || sortType === 'severity' || sortType === 'lvl') {
      context.dispatch({ type: 'SET_SORT', payload: 'level' });
      return 'Sorting by level';
    }

    if (sortType === 'default' || sortType === 'chronological' || sortType === 'none') {
      context.dispatch({ type: 'SET_SORT', payload: 'default' });
      return 'Sorting by default (chronological) order';
    }

    return `Invalid sort type: ${sortType}. Use: timestamp, level, or default`;
  },
};
