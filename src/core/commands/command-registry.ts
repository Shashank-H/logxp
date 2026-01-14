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

export interface CommandSuggestion {
  name: string;
  description: string;
  usage: string;
  example: string;
}

export function getCommandSuggestions(partial: string): CommandSuggestion[] {
  const input = partial.toLowerCase().replace(/^\//, '');

  if (!input) {
    return commands.map((c) => ({
      name: `/${c.name}`,
      description: c.description,
      usage: c.usage,
      example: c.examples[0] || '',
    }));
  }

  const matches: CommandSuggestion[] = [];
  const seen = new Set<string>();

  for (const cmd of commands) {
    if (cmd.name.startsWith(input) && !seen.has(cmd.name)) {
      seen.add(cmd.name);
      matches.push({
        name: `/${cmd.name}`,
        description: cmd.description,
        usage: cmd.usage,
        example: cmd.examples[0] || '',
      });
    }
    for (const alias of cmd.aliases) {
      if (alias.startsWith(input) && !seen.has(alias)) {
        seen.add(alias);
        matches.push({
          name: `/${alias}`,
          description: cmd.description,
          usage: cmd.usage,
          example: cmd.examples[0] || '',
        });
      }
    }
  }

  return matches.slice(0, 8);
}
