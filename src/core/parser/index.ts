import type { LogEntry } from '../../types/log';
import { isJsonLine, parseJsonLog } from './json-parser';
import { parseTextLog } from './text-parser';

export function parseLine(line: string, lineNumber: number): LogEntry {
  if (isJsonLine(line)) {
    const jsonEntry = parseJsonLog(line, lineNumber);
    if (jsonEntry) {
      return jsonEntry;
    }
  }

  return parseTextLog(line, lineNumber);
}

export { isJsonLine, parseJsonLog } from './json-parser';
export { parseTextLog } from './text-parser';
export { detectLevelFromJson, detectLevelFromText } from './level-detector';
