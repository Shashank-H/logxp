import { Box, Text, Newline } from "ink";
import { useRouter } from "../hooks/useRouter";

export function HomeView() {
    const { navigate } = useRouter();

    return (
        <Box flexDirection="column">
            <Text bold color="cyan">🏠 Home</Text>
            <Newline />
            <Text>Welcome to LogXP CLI!</Text>
            <Newline />
            <Text dimColor>Available commands:</Text>
            <Text>  • Press <Text color="green">i</Text> to view Input mode</Text>
            <Text>  • Press <Text color="green">s</Text> to view Settings</Text>
            <Text>  • Press <Text color="red">q</Text> to quit</Text>
        </Box>
    );
}
