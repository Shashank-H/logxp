import React from 'react';
import { Box, Text } from 'ink';
import { getAllCommands } from '../../core/commands';

interface HelpOverlayProps {
  onClose: () => void;
}

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  const commands = getAllCommands();

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Text color="cyan" bold>
        Available Commands
      </Text>
      <Text> </Text>

      {commands.map((cmd) => (
        <Box key={cmd.name} marginBottom={0}>
          <Box width={20}>
            <Text color="yellow">/{cmd.name}</Text>
          </Box>
          <Text color="gray">{cmd.description}</Text>
        </Box>
      ))}

      <Text> </Text>
      <Text color="cyan" bold>
        Keyboard Shortcuts
      </Text>
      <Text> </Text>

      <Box>
        <Box width={20}>
          <Text color="yellow">↑/↓, j/k</Text>
        </Box>
        <Text color="gray">Scroll up/down</Text>
      </Box>
      <Box>
        <Box width={20}>
          <Text color="yellow">PgUp/PgDn</Text>
        </Box>
        <Text color="gray">Scroll by page</Text>
      </Box>
      <Box>
        <Box width={20}>
          <Text color="yellow">g/G</Text>
        </Box>
        <Text color="gray">Jump to top/bottom</Text>
      </Box>
      <Box>
        <Box width={20}>
          <Text color="yellow">Space</Text>
        </Box>
        <Text color="gray">Toggle follow mode</Text>
      </Box>
      <Box>
        <Box width={20}>
          <Text color="yellow">n/N</Text>
        </Box>
        <Text color="gray">Next/previous search match</Text>
      </Box>
      <Box>
        <Box width={20}>
          <Text color="yellow">/</Text>
        </Box>
        <Text color="gray">Enter command mode</Text>
      </Box>
      <Box>
        <Box width={20}>
          <Text color="yellow">q, Esc</Text>
        </Box>
        <Text color="gray">Quit</Text>
      </Box>

      <Text> </Text>
      <Text color="gray" dimColor>
        Press any key to close
      </Text>
    </Box>
  );
}
