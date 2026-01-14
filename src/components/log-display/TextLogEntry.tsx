import React from 'react';
import { Text, Box } from 'ink';
import type { LogEntry } from '../../types/log';
import { LogLevelBadge } from './LogLevelBadge';
import { DEFAULT_CONFIG } from '../../config/defaults';

interface TextLogEntryProps {
  entry: LogEntry;
  searchTerm?: string | null;
  isCurrentMatch?: boolean;
}

export function TextLogEntry({
  entry,
  searchTerm,
  isCurrentMatch,
}: TextLogEntryProps) {
  const color = DEFAULT_CONFIG.colors[entry.level];

  const renderText = () => {
    if (!searchTerm) {
      return (
        <Text color={color} dimColor={entry.level === 'trace'}>
          {entry.raw}
        </Text>
      );
    }

    const parts: React.ReactNode[] = [];
    const lowerRaw = entry.raw.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    let lastIndex = 0;
    let index = lowerRaw.indexOf(lowerTerm);
    let key = 0;

    while (index !== -1) {
      if (index > lastIndex) {
        parts.push(
          <Text key={key++} color={color}>
            {entry.raw.slice(lastIndex, index)}
          </Text>
        );
      }
      parts.push(
        <Text
          key={key++}
          backgroundColor={isCurrentMatch ? 'yellow' : 'gray'}
          color="black"
          bold
        >
          {entry.raw.slice(index, index + searchTerm.length)}
        </Text>
      );
      lastIndex = index + searchTerm.length;
      index = lowerRaw.indexOf(lowerTerm, lastIndex);
    }

    if (lastIndex < entry.raw.length) {
      parts.push(
        <Text key={key++} color={color}>
          {entry.raw.slice(lastIndex)}
        </Text>
      );
    }

    return <>{parts}</>;
  };

  return (
    <Box>
      <LogLevelBadge level={entry.level} />
      <Text> </Text>
      {renderText()}
    </Box>
  );
}
