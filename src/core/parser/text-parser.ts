import type { LogEntry } from '../../types/log';
import { detectLevelFromText } from './level-detector';

export function parseTextLog(line: string, lineNumber: number): LogEntry {
  const level = detectLevelFromText(line);

  return {
    id: lineNumber,
    raw: line,
    format: 'text',
    level,
    message: line,
    lineNumber,
  };
}
