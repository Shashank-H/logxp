import type { ParsedCommand } from '../../types/command';

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();

  if (!trimmed.startsWith('/')) {
    return null;
  }

  const withoutSlash = trimmed.slice(1);
  const parts = withoutSlash.split(/\s+/);

  if (parts.length === 0 || !parts[0]) {
    return null;
  }

  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  return {
    name,
    args,
    raw: input,
  };
}
