import { Box } from "ink";
import { Header } from "../components/Header";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { OutputDisplay } from "../components/OutputDisplay";

interface PipedInputViewProps {
    isReading: boolean;
    inputData: string[];
    totalBytes: number;
}

export function PipedInputView({ isReading, inputData, totalBytes }: PipedInputViewProps) {
    return (
        <Box flexDirection="column" padding={1}>
            <Header />
            {isReading ? (
                <LoadingIndicator bytes={totalBytes} />
            ) : (
                <OutputDisplay lines={inputData} totalBytes={totalBytes} />
            )}
        </Box>
    );
}
