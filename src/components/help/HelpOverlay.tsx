import React, { useState, useRef } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { getAllCommands } from '../../core/commands';

interface HelpOverlayProps {
  onClose: () => void;
}

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  const { stdout } = useStdout();
  const termHeight = stdout?.rows || 24;
  // Account for header (2 lines), borders (2), padding (2)
  const visibleLineCount = Math.max(5, termHeight - 6);

  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollOffsetRef = useRef(scrollOffset);
  scrollOffsetRef.current = scrollOffset;

  const commands = getAllCommands();

  // Build help content - clean and organized
  const sections = [
    {
      title: 'GENERAL',
      items: [
        { key: '?', desc: 'Show this help' },
        { key: 'q', desc: 'Quit' },
        { key: 'ESC', desc: 'Back / Clear search / Exit fullscreen' },
        { key: '/', desc: 'Open command palette' },
        { key: 'Space', desc: 'Toggle follow mode' },
      ],
    },
    {
      title: 'NAVIGATION',
      items: [
        { key: 'j/k', desc: 'Move down/up' },
        { key: 'g/G', desc: 'Go to top/bottom' },
        { key: 'PgUp/PgDn', desc: 'Page up/down' },
        { key: 'Tab', desc: 'Switch focus (logs/details)' },
      ],
    },
    {
      title: 'SIDEBAR',
      items: [
        { key: 'd', desc: 'Toggle sidebar' },
        { key: 'Enter', desc: 'Open sidebar + focus' },
        { key: 'f', desc: 'Fullscreen details' },
        { key: 'c', desc: 'Copy selected log to clipboard' },
      ],
    },
    {
      title: 'SEARCH',
      items: [
        { key: 'n/.', desc: 'Next match' },
        { key: 'N/,', desc: 'Previous match' },
      ],
    },
    {
      title: 'COMMANDS',
      items: commands.flatMap((cmd) => {
        const aliasStr = cmd.aliases.length > 0 ? ` (${cmd.aliases.map(a => `/${a}`).join(', ')})` : '';
        const items: Array<{key: string; desc: string; isUsage?: boolean}> = [{
          key: `/${cmd.name}`,
          desc: cmd.description + aliasStr,
        }];
        // Add usage line showing params on next line
        if (cmd.usage && cmd.usage !== `/${cmd.name}`) {
          items.push({
            key: '',
            desc: cmd.usage,
            isUsage: true,
          });
        }
        return items;
      }),
    },
  ];

  // Calculate total lines for scrolling
  let totalLines = 0;
  sections.forEach((section, idx) => {
    totalLines += 1; // Title
    totalLines += section.items.length;
    if (idx < sections.length - 1) totalLines += 1; // Spacing between sections
  });

  const scrollMax = Math.max(0, totalLines - visibleLineCount);

  useInput((input, key) => {
    // Close on ESC, q, or Ctrl+H (but not backspace which some terminals send as Ctrl+H)
    if (key.escape || input === 'q' || (key.ctrl && input === 'h' && !key.backspace)) {
      onClose();
      return;
    }

    const currentOffset = scrollOffsetRef.current;

    if (key.upArrow || input === 'k') {
      setScrollOffset(Math.max(0, currentOffset - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setScrollOffset(Math.min(scrollMax, currentOffset + 1));
      return;
    }

    if (key.pageUp) {
      setScrollOffset(Math.max(0, currentOffset - visibleLineCount));
      return;
    }

    if (key.pageDown) {
      setScrollOffset(Math.min(scrollMax, currentOffset + visibleLineCount));
      return;
    }

    if (input === 'g') {
      setScrollOffset(0);
      return;
    }

    if (input === 'G') {
      setScrollOffset(scrollMax);
      return;
    }
  });

  // Flatten sections into lines
  const allLines: Array<{ type: 'title' | 'item' | 'blank'; content?: any }> = [];

  sections.forEach((section, sectionIndex) => {
    allLines.push({ type: 'title', content: section.title });
    section.items.forEach((item) => {
      allLines.push({ type: 'item', content: item });
    });
    // Add spacing between sections (but not after last)
    if (sectionIndex < sections.length - 1) {
      allLines.push({ type: 'blank' });
    }
  });

  // Get visible lines based on terminal height
  const maxScrollOffset = Math.max(0, allLines.length - visibleLineCount);
  const clampedScrollOffset = Math.min(scrollOffset, maxScrollOffset);
  const visibleLines = allLines.slice(clampedScrollOffset, clampedScrollOffset + visibleLineCount);

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      padding={1}
      height={termHeight}
      overflow="hidden"
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
            Use j/k or arrows to scroll | Line {clampedScrollOffset + 1}/{totalLines}
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <Box flexDirection="column" height={visibleLineCount} overflow="hidden">
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

          // Usage/param lines are rendered in gray, indented
          if (item.isUsage) {
            return (
              <Box key={index}>
                <Box width={16} flexShrink={0} />
                <Text color="gray" dimColor>{item.desc}</Text>
              </Box>
            );
          }

          return (
            <Box key={index}>
              <Box width={16} flexShrink={0}>
                <Text color="green" bold>{item.key}</Text>
              </Box>
              <Text color="white">{item.desc}</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
