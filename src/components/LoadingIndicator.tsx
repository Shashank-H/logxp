import { Text, Box } from "ink";

interface LoadingIndicatorProps {
    bytes: number;
}

export function LoadingIndicator({ bytes }: LoadingIndicatorProps) {
    return (
        <Box>
            <Text color="yellow">📥 Reading from stdin... </Text>
            <Text dimColor>({bytes} bytes)</Text>
        </Box>
    );
}
