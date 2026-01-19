import React, { useState, useMemo, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { getCommandSuggestions, type CommandSuggestion } from '../../core/commands';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  onToggleHelp?: () => void;
}

export function CommandInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  onToggleHelp,
}: CommandInputProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Compute suggestions directly from value - no state needed
  const suggestions = useMemo(() => {
    if (!value.startsWith('/')) return [];
    return getCommandSuggestions(value);
  }, [value]);

  // Reset selection when suggestions change
  const prevSuggestionsLengthRef = useRef(suggestions.length);
  if (prevSuggestionsLengthRef.current !== suggestions.length) {
    prevSuggestionsLengthRef.current = suggestions.length;
    // Can't call setState during render, but we can adjust the index
  }

  // Ensure selectedIndex is within bounds
  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, suggestions.length - 1));

  // Use ref to always have current value in useInput callback
  const valueRef = useRef(value);
  valueRef.current = value;
  const suggestionsRef = useRef(suggestions);
  suggestionsRef.current = suggestions;
  const selectedIndexRef = useRef(safeSelectedIndex);
  selectedIndexRef.current = safeSelectedIndex;

  useInput((input, key) => {
    const currentValue = valueRef.current;
    const currentSuggestions = suggestionsRef.current;
    const currentSelectedIndex = selectedIndexRef.current;

    // Ctrl+H toggles help (works in command mode too)
    // Note: Don't trigger on backspace (some terminals send Ctrl+H as backspace)
    if (key.ctrl && input === 'h' && !key.backspace) {
      if (onToggleHelp) {
        onToggleHelp();
      }
      return;
    }

    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      if (currentSuggestions.length > 0 && currentSelectedIndex >= 0) {
        const selected = currentSuggestions[currentSelectedIndex];
        if (selected) {
          // If user just typed "/" or partial, use the selected command
          const parts = currentValue.split(' ');
          parts[0] = selected.name;
          onSubmit(parts.join(' '));
          return;
        }
      }
      onSubmit(currentValue);
      return;
    }

    // Arrow up - move selection up
    if (key.upArrow) {
      if (currentSuggestions.length > 0) {
        const newIndex = currentSelectedIndex <= 0
          ? currentSuggestions.length - 1
          : currentSelectedIndex - 1;
        setSelectedIndex(newIndex);
      }
      return;
    }

    // Arrow down - move selection down
    if (key.downArrow) {
      if (currentSuggestions.length > 0) {
        const newIndex = (currentSelectedIndex + 1) % currentSuggestions.length;
        setSelectedIndex(newIndex);
      }
      return;
    }

    // Tab - autocomplete with selected suggestion
    if (key.tab && currentSuggestions.length > 0) {
      const selected = currentSuggestions[currentSelectedIndex];
      if (selected) {
        const parts = currentValue.split(' ');
        parts[0] = selected.name;
        onChange(parts.join(' '));
      }
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

  const selectedSuggestion = suggestions[safeSelectedIndex];

  return (
    <Box flexDirection="column">
      {/* Command input line */}
      <Box>
        <Text color="cyan" bold>
          :{' '}
        </Text>
        <Text color="white">{value}</Text>
        <Text color="cyan">▋</Text>
      </Box>

      {/* Command suggestions dropdown */}
      {suggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
            {suggestions.map((suggestion, index) => (
              <Box key={suggestion.name}>
                <Text
                  backgroundColor={index === safeSelectedIndex ? 'cyan' : undefined}
                  color={index === safeSelectedIndex ? 'black' : 'white'}
                >
                  {suggestion.name.padEnd(16)}
                </Text>
                <Text color="gray" dimColor={index !== safeSelectedIndex}>
                  {' '}{suggestion.description}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Help section for selected command */}
          {selectedSuggestion && (
            <Box flexDirection="column" marginTop={1} paddingX={1}>
              <Box>
                <Text color="yellow" bold>Usage: </Text>
                <Text color="white">{selectedSuggestion.usage}</Text>
              </Box>
              {selectedSuggestion.example && (
                <Box>
                  <Text color="yellow" bold>Example: </Text>
                  <Text color="green">{selectedSuggestion.example}</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
