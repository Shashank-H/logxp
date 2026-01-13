import React from 'react';
import type { LogEntry as LogEntryType } from '../../types/log';
import { JsonLogEntry } from './JsonLogEntry';
import { TextLogEntry } from './TextLogEntry';

interface LogEntryProps {
  entry: LogEntryType;
  searchTerm?: string | null;
  isCurrentMatch?: boolean;
}

export function LogEntry({ entry, searchTerm, isCurrentMatch }: LogEntryProps) {
  if (entry.format === 'json') {
    return (
      <JsonLogEntry
        entry={entry}
        searchTerm={searchTerm}
        isCurrentMatch={isCurrentMatch}
      />
    );
  }

  return (
    <TextLogEntry
      entry={entry}
      searchTerm={searchTerm}
      isCurrentMatch={isCurrentMatch}
    />
  );
}
