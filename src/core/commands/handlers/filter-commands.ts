import type { CommandDefinition, CommandContext } from '../../../types/command';
import type { LogLevel, Filter } from '../../../types';

const VALID_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug', 'trace'];

export const filterCommand: CommandDefinition = {
  name: 'filter',
  aliases: ['f'],
  description: 'Filter logs by keyword or level',
  usage: '/filter <keyword> or /filter level:<level>',
  examples: [
    '/filter error',
    '/filter level:error',
    '/filter user123',
  ],
  execute: (args, context) => {
    if (args.length === 0) {
      return 'Usage: /filter <keyword> or /filter level:<level>';
    }

    const arg = args.join(' ');

    if (arg.toLowerCase().startsWith('level:')) {
      const level = arg.slice(6).toLowerCase() as LogLevel;
      if (!VALID_LEVELS.includes(level)) {
        return `Invalid level. Valid levels: ${VALID_LEVELS.join(', ')}`;
      }
      const filter: Filter = {
        type: 'level',
        value: level,
        levelValue: level,
      };
      context.dispatch({ type: 'ADD_FILTER', payload: filter });
      return `Filter added: level:${level}`;
    }

    const filter: Filter = {
      type: 'keyword',
      value: arg,
    };
    context.dispatch({ type: 'ADD_FILTER', payload: filter });
    return `Filter added: "${arg}"`;
  },
};

export const clearFilterCommand: CommandDefinition = {
  name: 'clear-filter',
  aliases: ['unfilter', 'cf'],
  description: 'Clear all active filters',
  usage: '/clear-filter',
  examples: ['/clear-filter'],
  execute: (_, context) => {
    context.dispatch({ type: 'CLEAR_FILTERS' });
    return 'All filters cleared';
  },
};
