import type { LogViewerAction } from './state';

export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

export interface CommandContext {
  dispatch: React.Dispatch<LogViewerAction>;
  getState: () => import('./state').LogViewerState;
}

export interface CommandDefinition {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  examples: string[];
  execute: (args: string[], context: CommandContext) => void | string;
}

export interface CommandResult {
  success: boolean;
  message?: string;
}
