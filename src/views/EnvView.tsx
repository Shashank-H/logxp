import React, { useState, useMemo } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';

interface EnvViewProps {
  onBack: () => void;
}

export function EnvView({ onBack }: EnvViewProps) {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 120;
  const termHeight = stdout?.rows || 24;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [filter, setFilter] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  // Get and sort environment variables
  const allEnvVars = useMemo(() => {
    return Object.entries(process.env)
      .filter(([key, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)) as [string, string][];
  }, []);

  // Filter environment variables based on search
  const envVars = useMemo(() => {
    if (!filter) return allEnvVars;
    const lowerFilter = filter.toLowerCase();
    return allEnvVars.filter(
      ([key, value]) =>
        key.toLowerCase().includes(lowerFilter) ||
        value.toLowerCase().includes(lowerFilter)
    );
  }, [allEnvVars, filter]);

  // Calculate visible area (reserve lines for header and footer)
  const headerHeight = 3;
  const footerHeight = 2;
  const visibleHeight = termHeight - headerHeight - footerHeight;
  const maxScroll = Math.max(0, envVars.length - visibleHeight);

  useInput((input, key) => {
    if (isFiltering) {
      if (key.escape) {
        setIsFiltering(false);
        setFilter('');
        return;
      }
      if (key.return) {
        setIsFiltering(false);
        return;
      }
      if (key.backspace || key.delete) {
        setFilter((prev) => prev.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setFilter((prev) => prev + input);
        setScrollOffset(0);
      }
      return;
    }

    if (key.escape || input === 'q') {
      onBack();
      return;
    }

    if (input === '/') {
      setIsFiltering(true);
      return;
    }

    // Navigation
    if (key.upArrow || input === 'k') {
      setScrollOffset((prev) => Math.max(0, prev - 1));
      return;
    }
    if (key.downArrow || input === 'j') {
      setScrollOffset((prev) => Math.min(maxScroll, prev + 1));
      return;
    }
    if (key.pageUp) {
      setScrollOffset((prev) => Math.max(0, prev - visibleHeight));
      return;
    }
    if (key.pageDown) {
      setScrollOffset((prev) => Math.min(maxScroll, prev + visibleHeight));
      return;
    }
    if (input === 'g') {
      setScrollOffset(0);
      return;
    }
    if (input === 'G') {
      setScrollOffset(maxScroll);
      return;
    }
  });

  // Get visible env vars
  const visibleEnvVars = envVars.slice(scrollOffset, scrollOffset + visibleHeight);

  // Calculate max key width for alignment (cap at reasonable width)
  const maxKeyWidth = Math.min(
    30,
    Math.max(...visibleEnvVars.map(([key]) => key.length), 10)
  );
  const valueWidth = termWidth - maxKeyWidth - 6; // 6 for padding and separator

  return (
    <Box
      width={termWidth}
      height={termHeight}
      flexDirection="column"
    >
      {/* Header */}
      <Box
        borderStyle="single"
        borderColor="cyan"
        paddingX={1}
        justifyContent="space-between"
      >
        <Text color="cyan" bold>Environment Variables</Text>
        <Text color="gray">
          {envVars.length} vars {filter && `(filtered from ${allEnvVars.length})`}
        </Text>
      </Box>

      {/* Filter bar */}
      {isFiltering && (
        <Box paddingX={1}>
          <Text color="yellow">/</Text>
          <Text color="white">{filter}</Text>
          <Text color="cyan">▋</Text>
        </Box>
      )}
      {!isFiltering && filter && (
        <Box paddingX={1}>
          <Text color="gray">Filter: </Text>
          <Text color="yellow">{filter}</Text>
        </Box>
      )}

      {/* Environment variables list */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {visibleEnvVars.length === 0 ? (
          <Box justifyContent="center" alignItems="center" flexGrow={1}>
            <Text color="gray">No environment variables found</Text>
          </Box>
        ) : (
          visibleEnvVars.map(([key, value], index) => {
            const truncatedValue =
              value.length > valueWidth
                ? value.slice(0, valueWidth - 3) + '...'
                : value;
            return (
              <Box key={key}>
                <Text color="green" bold>
                  {key.padEnd(maxKeyWidth)}
                </Text>
                <Text color="gray"> = </Text>
                <Text color="white">{truncatedValue}</Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box
        borderStyle="single"
        borderColor="gray"
        borderTop={true}
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        paddingX={1}
        justifyContent="space-between"
      >
        <Text color="gray" dimColor>
          <Text color="yellow">j/k</Text> Scroll  |
          <Text color="yellow">/</Text> Filter  |
          <Text color="yellow">g/G</Text> Top/Bottom  |
          <Text color="red">q/Esc</Text> Back
        </Text>
        <Text color="gray" dimColor>
          {scrollOffset + 1}-{Math.min(scrollOffset + visibleHeight, envVars.length)} of {envVars.length}
        </Text>
      </Box>
    </Box>
  );
}
