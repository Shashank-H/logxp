import React from 'react';
import { Text, Box } from 'ink';
import type { LogEntry } from '../../types/log';
import { LogLevelBadge } from './LogLevelBadge';
import { JsonHighlighter } from '../syntax/JsonHighlighter';
import { DEFAULT_CONFIG } from '../../config/defaults';

interface JsonLogEntryProps {
  entry: LogEntry;
  searchTerm?: string | null;
  isCurrentMatch?: boolean;
}

export function JsonLogEntry({
  entry,
  searchTerm,
  isCurrentMatch,
}: JsonLogEntryProps) {
  const { timestamp, message, metadata, level } = entry;

  const formatTimestamp = (date: Date): string => {
    return date.toISOString().replace('T', ' ').slice(0, 23);
  };

  const renderMessage = () => {
    if (!message) return null;

    if (!searchTerm) {
      return <Text color="white">{message}</Text>;
    }

    const parts: React.ReactNode[] = [];
    const lowerMsg = message.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    let lastIndex = 0;
    let index = lowerMsg.indexOf(lowerTerm);
    let key = 0;

    while (index !== -1) {
      if (index > lastIndex) {
        parts.push(
          <Text key={key++} color="white">
            {message.slice(lastIndex, index)}
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
          {message.slice(index, index + searchTerm.length)}
        </Text>
      );
      lastIndex = index + searchTerm.length;
      index = lowerMsg.indexOf(lowerTerm, lastIndex);
    }

    if (lastIndex < message.length) {
      parts.push(
        <Text key={key++} color="white">
          {message.slice(lastIndex)}
        </Text>
      );
    }

    return <>{parts}</>;
  };

  const getFilteredMetadata = (): Record<string, unknown> | null => {
    if (!metadata) return null;

    const skipFields = [
      ...DEFAULT_CONFIG.jsonFields.level,
      ...DEFAULT_CONFIG.jsonFields.message,
      ...DEFAULT_CONFIG.jsonFields.timestamp,
    ].map((f) => f.toLowerCase());

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (!skipFields.includes(key.toLowerCase())) {
        filtered[key] = value;
      }
    }

    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  const filteredMetadata = getFilteredMetadata();

  return (
    <Box>
      <LogLevelBadge level={level} />
      <Text> </Text>
      {timestamp && (
        <>
          <Text color="gray" dimColor>
            {formatTimestamp(timestamp)}
          </Text>
          <Text> </Text>
        </>
      )}
      {renderMessage()}
      {filteredMetadata && (
        <>
          <Text> </Text>
          <JsonHighlighter data={filteredMetadata} compact />
        </>
      )}
    </Box>
  );
}
