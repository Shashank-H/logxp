import React from 'react';
import { Text } from 'ink';
import { DEFAULT_CONFIG } from '../../config/defaults';

interface JsonHighlighterProps {
  data: Record<string, unknown>;
  compact?: boolean;
}

export function JsonHighlighter({ data, compact = true }: JsonHighlighterProps) {
  const colors = DEFAULT_CONFIG.colors.json;

  const renderValue = (value: unknown, key?: number): React.ReactNode => {
    if (value === null) {
      return (
        <Text key={key} color={colors.null}>
          null
        </Text>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Text key={key} color={colors.boolean}>
          {String(value)}
        </Text>
      );
    }

    if (typeof value === 'number') {
      return (
        <Text key={key} color={colors.number}>
          {String(value)}
        </Text>
      );
    }

    if (typeof value === 'string') {
      const escaped = value.replace(/"/g, '\\"');
      return (
        <Text key={key} color={colors.string}>
          "{escaped}"
        </Text>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <Text key={key} color={colors.bracket}>
            []
          </Text>
        );
      }
      return (
        <React.Fragment key={key}>
          <Text color={colors.bracket}>[</Text>
          {value.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text color={colors.bracket}>, </Text>}
              {renderValue(item)}
            </React.Fragment>
          ))}
          <Text color={colors.bracket}>]</Text>
        </React.Fragment>
      );
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const entries = Object.entries(obj);
      if (entries.length === 0) {
        return (
          <Text key={key} color={colors.bracket}>
            {'{}'}
          </Text>
        );
      }
      return (
        <React.Fragment key={key}>
          <Text color={colors.bracket}>{'{'}</Text>
          {entries.map(([k, v], i) => (
            <React.Fragment key={i}>
              {i > 0 && <Text color={colors.bracket}>, </Text>}
              <Text color={colors.key}>"{k}"</Text>
              <Text color={colors.bracket}>: </Text>
              {renderValue(v)}
            </React.Fragment>
          ))}
          <Text color={colors.bracket}>{'}'}</Text>
        </React.Fragment>
      );
    }

    return (
      <Text key={key} color={colors.string}>
        {String(value)}
      </Text>
    );
  };

  return <>{renderValue(data)}</>;
}
