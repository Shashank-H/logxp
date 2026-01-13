import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { getCommandSuggestions } from '../../core/commands';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function CommandInput({
  value,
  onChange,
  onSubmit,
  onCancel,
}: CommandInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  // Use ref to always have current value in useInput callback
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (value.startsWith('/')) {
      const newSuggestions = getCommandSuggestions(value);
      setSuggestions(newSuggestions);
      setSelectedSuggestion(-1);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  useInput((input, key) => {
    const currentValue = valueRef.current;

    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        const parts = currentValue.split(' ');
        parts[0] = suggestions[selectedSuggestion];
        onSubmit(parts.join(' '));
      } else {
        onSubmit(currentValue);
      }
      return;
    }

    if (key.tab && suggestions.length > 0) {
      const nextIndex = (selectedSuggestion + 1) % suggestions.length;
      setSelectedSuggestion(nextIndex);
      const parts = currentValue.split(' ');
      parts[0] = suggestions[nextIndex];
      onChange(parts.join(' '));
      return;
    }

    if (key.backspace || key.delete) {
      onChange(currentValue.slice(0, -1));
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      onChange(currentValue + input);
    }
  });

  return (
    <Box flexDirection="column">
      {suggestions.length > 0 && (
        <Box paddingLeft={1}>
          {suggestions.map((suggestion, index) => (
            <Text
              key={suggestion}
              color={index === selectedSuggestion ? 'cyan' : 'gray'}
              dimColor={index !== selectedSuggestion}
            >
              {suggestion}
              {index < suggestions.length - 1 && '  '}
            </Text>
          ))}
        </Box>
      )}
      <Box>
        <Text color="cyan" bold>
          Command:{' '}
        </Text>
        <Text color="white">{value}</Text>
        <Text color="cyan">▋</Text>
      </Box>
    </Box>
  );
}
