import { Text, Box } from "ink";

interface OutputDisplayProps {
    lines: string[];
    totalBytes: number;
}

export function OutputDisplay({ lines, totalBytes }: OutputDisplayProps) {
    return (
        <Box flexDirection="column">
            <Box marginBottom={1}>
                <Text bold color="cyan">📋 Received Input</Text>
                <Text dimColor> ({lines.length} lines, {totalBytes} bytes)</Text>
            </Box>
            
            <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
                {lines.map((line, idx) => (
                    <Box key={`line-${idx}`}>
                        <Text color="gray">{String(idx + 1).padStart(3, ' ')}│ </Text>
                        <Text>{line}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
