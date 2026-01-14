import React from 'react';
import { Box, Text } from 'ink';

interface KeyValueDisplayProps {
  data: Record<string, unknown>;
  indent?: number;
}

export function KeyValueDisplay({ data, indent = 0 }: KeyValueDisplayProps) {
  const renderValue = (value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null) {
      return <Text color="gray">null</Text>;
    }

    if (value === undefined) {
      return <Text color="gray">undefined</Text>;
    }

    if (typeof value === 'boolean') {
      return <Text color="yellow">{value.toString()}</Text>;
    }

    if (typeof value === 'number') {
      return <Text color="cyan">{value}</Text>;
    }

    if (typeof value === 'string') {
      return <Text color="green">"{value}"</Text>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text color="gray">[]</Text>;
      }
      
      return (
        <Box flexDirection="column">
          <Text color="gray">[</Text>
          {value.map((item, index) => (
            <Box key={index} marginLeft={2}>
              <Text color="gray">{index}: </Text>
              {renderValue(item, depth + 1)}
            </Box>
          ))}
          <Text color="gray">]</Text>
        </Box>
      );
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      
      if (keys.length === 0) {
        return <Text color="gray">{'{}'}</Text>;
      }

      return (
        <Box flexDirection="column">
          {keys.map((key) => (
            <Box key={key} marginLeft={depth > 0 ? 2 : 0}>
              <Text bold color="blue">{key}: </Text>
              {renderValue(obj[key], depth + 1)}
            </Box>
          ))}
        </Box>
      );
    }

    return <Text>{String(value)}</Text>;
  };

  return (
    <Box flexDirection="column">
      {Object.entries(data).map(([key, value]) => (
        <Box key={key} flexDirection="column" marginBottom={1}>
          <Text bold color="magenta">{key}:</Text>
          <Box marginLeft={2}>
            {renderValue(value)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
