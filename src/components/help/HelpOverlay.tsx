import React, { useState, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { getAllCommands } from '../../core/commands';

interface HelpOverlayProps {
  onClose: () => void;
}

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollOffsetRef = useRef(scrollOffset);
  scrollOffsetRef.current = scrollOffset;

  const commands = getAllCommands();

  // Build help content
  const sections = [
    {
      title: 'KEYBOARD SHORTCUTS',
      items: [
        { key: 'Ctrl+H', desc: 'Toggle this help screen' },
        { key: 'q / Esc', desc: 'Quit application' },
        { key: '/', desc: 'Open command palette' },
        { key: 'Tab', desc: 'Switch focus between logs and details pane' },
        { key: 'Space', desc: 'Toggle follow mode (auto-scroll to new logs)' },
        { key: '', desc: '' },
        { key: 'NAVIGATION (Logs Pane)', desc: '' },
        { key: 'j / Down', desc: 'Move selection down' },
        { key: 'k / Up', desc: 'Move selection up' },
        { key: 'g', desc: 'Jump to first log' },
        { key: 'G', desc: 'Jump to last log' },
        { key: 'Page Up', desc: 'Scroll up one page' },
        { key: 'Page Down', desc: 'Scroll down one page' },
        { key: '', desc: '' },
        { key: 'NAVIGATION (Details Pane)', desc: '' },
        { key: 'j / Down', desc: 'Scroll details down' },
        { key: 'k / Up', desc: 'Scroll details up' },
        { key: 'Page Up', desc: 'Scroll details up by 10 lines' },
        { key: 'Page Down', desc: 'Scroll details down by 10 lines' },
        { key: '', desc: '' },
        { key: 'SEARCH', desc: '' },
        { key: 'n', desc: 'Go to next search match' },
        { key: 'N / p', desc: 'Go to previous search match' },
      ],
    },
    {
      title: 'COMMANDS',
      items: commands.map((cmd) => ({
        key: `/${cmd.name}`,
        desc: cmd.description,
        usage: cmd.usage,
        aliases: cmd.aliases.length > 0 ? cmd.aliases.map(a => `/${a}`).join(', ') : null,
      })),
    },
    {
      title: 'COMMAND EXAMPLES',
      items: commands
        .filter((cmd) => cmd.examples.length > 0)
        .flatMap((cmd) =>
          cmd.examples.map((ex) => ({
            key: ex,
            desc: '',
          }))
        ),
    },
  ];

  // Calculate total lines for scrolling
  let totalLines = 0;
  sections.forEach((section) => {
    totalLines += 2; // Title + blank line
    totalLines += section.items.length;
    totalLines += 1; // Spacing after section
  });

  useInput((input, key) => {
    if (key.escape || input === 'q' || (key.ctrl && input === 'h')) {
      onClose();
      return;
    }

    const currentOffset = scrollOffsetRef.current;

    if (key.upArrow || input === 'k') {
      setScrollOffset(Math.max(0, currentOffset - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setScrollOffset(Math.min(totalLines - 10, currentOffset + 1));
      return;
    }

    if (key.pageUp) {
      setScrollOffset(Math.max(0, currentOffset - 10));
      return;
    }

    if (key.pageDown) {
      setScrollOffset(Math.min(totalLines - 10, currentOffset + 10));
      return;
    }

    if (input === 'g') {
      setScrollOffset(0);
      return;
    }

    if (input === 'G') {
      setScrollOffset(Math.max(0, totalLines - 20));
      return;
    }
  });

  // Flatten sections into lines
  const allLines: Array<{ type: 'title' | 'item' | 'blank'; content?: any }> = [];

  sections.forEach((section) => {
    allLines.push({ type: 'title', content: section.title });
    allLines.push({ type: 'blank' });
    section.items.forEach((item) => {
      allLines.push({ type: 'item', content: item });
    });
    allLines.push({ type: 'blank' });
  });

  // Get visible lines
  const visibleLines = allLines.slice(scrollOffset, scrollOffset + 30);

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      padding={1}
      height="100%"
    >
      {/* Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Box>
          <Text color="cyan" bold>
            LogXP Help
          </Text>
          <Text color="gray"> - Press </Text>
          <Text color="yellow">Esc</Text>
          <Text color="gray"> or </Text>
          <Text color="yellow">q</Text>
          <Text color="gray"> to close</Text>
        </Box>
        <Box>
          <Text color="gray">
            Use j/k or arrows to scroll | Line {scrollOffset + 1}/{totalLines}
          </Text>
        </Box>
      </Box>

      <Box borderStyle="single" borderColor="gray" marginBottom={1} />

      {/* Content */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {visibleLines.map((line, index) => {
          if (line.type === 'blank') {
            return <Text key={index}> </Text>;
          }

          if (line.type === 'title') {
            return (
              <Box key={index} marginBottom={0}>
                <Text color="cyan" bold underline>
                  {line.content}
                </Text>
              </Box>
            );
          }

          const item = line.content;

          // Check if it's a section header within items
          if (item.key && !item.desc && item.key.includes('(')) {
            return (
              <Box key={index}>
                <Text color="yellow" bold>
                  {item.key}
                </Text>
              </Box>
            );
          }

          // Empty separator
          if (!item.key && !item.desc) {
            return <Text key={index}> </Text>;
          }

          return (
            <Box key={index} flexDirection="column">
              <Box>
                <Box width={20} flexShrink={0}>
                  <Text color="green" bold>
                    {item.key}
                  </Text>
                </Box>
                <Text color="white">{item.desc}</Text>
              </Box>
              {item.usage && (
                <Box marginLeft={2}>
                  <Text color="gray">Usage: {item.usage}</Text>
                </Box>
              )}
              {item.aliases && (
                <Box marginLeft={2}>
                  <Text color="gray">Aliases: {item.aliases}</Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box borderStyle="single" borderColor="gray" marginTop={1} />
      <Box justifyContent="center" marginTop={1}>
        <Text color="gray">
          LogXP v1.0.0 - Rich CLI Log Navigator
        </Text>
      </Box>
    </Box>
  );
}
