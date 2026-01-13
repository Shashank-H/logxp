import { Box, Text, Newline } from "ink";
import { useRouter } from "../hooks/useRouter";

export function SettingsView() {
    const { navigate } = useRouter();

    return (
        <Box flexDirection="column">
            <Text bold color="magenta">⚙️  Settings</Text>
            <Newline />
            <Text>Configuration options:</Text>
            <Newline />
            <Box flexDirection="column" paddingLeft={2}>
                <Text>• Theme: <Text color="cyan">Dark</Text></Text>
                <Text>• Output format: <Text color="cyan">Formatted</Text></Text>
                <Text>• Line numbers: <Text color="green">Enabled</Text></Text>
            </Box>
            <Newline />
            <Text dimColor>Press <Text color="green">h</Text> to go back to Home</Text>
        </Box>
    );
}
