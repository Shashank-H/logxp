import { Text, Box, Newline } from "ink";

export function WelcomeView() {
    return (
        <Box flexDirection="column">
            <Text bold color="cyan">📥 Input Mode</Text>
            <Newline />
            <Text>This CLI can accept piped input from other commands.</Text>
            <Newline />
            <Text dimColor>💡 Example usage:</Text>
            <Text color="green">  echo "hello" | bun run cli</Text>
            <Text color="green">  cat file.txt | bun run cli</Text>
            <Newline />
            <Text dimColor>Press <Text color="green">h</Text> to go back to Home</Text>
        </Box>
    );
}
