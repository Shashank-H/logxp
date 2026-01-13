import type { CommandDefinition, CommandContext, CommandResult } from '../../types/command';
import { parseCommand } from './command-parser';
import {
  filterCommand,
  clearFilterCommand,
  searchCommand,
  searchNextCommand,
  searchPrevCommand,
  clearSearchCommand,
  followCommand,
  nofollowCommand,
  clearCommand,
  helpCommand,
  quitCommand,
  sortCommand,
} from './handlers';

const commands: CommandDefinition[] = [
  filterCommand,
  clearFilterCommand,
  searchCommand,
  searchNextCommand,
  searchPrevCommand,
  clearSearchCommand,
  followCommand,
  nofollowCommand,
  clearCommand,
  helpCommand,
  quitCommand,
  sortCommand,
];

const commandMap = new Map<string, CommandDefinition>();

for (const cmd of commands) {
  commandMap.set(cmd.name, cmd);
  for (const alias of cmd.aliases) {
    commandMap.set(alias, cmd);
  }
}

export function getCommand(name: string): CommandDefinition | undefined {
  return commandMap.get(name.toLowerCase());
}

export function getAllCommands(): CommandDefinition[] {
  return commands;
}

export function executeCommand(
  input: string,
  context: CommandContext
): CommandResult {
  const parsed = parseCommand(input);

  if (!parsed) {
    return {
      success: false,
      message: 'Invalid command format. Commands must start with /',
    };
  }

  const command = getCommand(parsed.name);

  if (!command) {
    return {
      success: false,
      message: `Unknown command: ${parsed.name}. Type /help for available commands.`,
    };
  }

  try {
    const result = command.execute(parsed.args, context);
    return {
      success: true,
      message: typeof result === 'string' ? result : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function getCommandSuggestions(partial: string): string[] {
  const input = partial.toLowerCase().replace(/^\//, '');

  if (!input) {
    return commands.map((c) => `/${c.name}`);
  }

  const matches: string[] = [];

  for (const cmd of commands) {
    if (cmd.name.startsWith(input)) {
      matches.push(`/${cmd.name}`);
    }
    for (const alias of cmd.aliases) {
      if (alias.startsWith(input)) {
        matches.push(`/${alias}`);
      }
    }
  }

  return [...new Set(matches)].slice(0, 5);
}
