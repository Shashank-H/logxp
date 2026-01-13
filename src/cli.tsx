#!/usr/bin/env bun
import { render } from "ink";
import { useStdinReader } from "./hooks/useStdinReader";
import { PipedInputView } from "./views/PipedInputView";
import { InteractiveView } from "./views/InteractiveView";

const isPiped = !process.stdin.isTTY;

function CliApp() {
    const { inputData, isReading, totalBytes } = useStdinReader(isPiped);

    if (isPiped) {
        return (
            <PipedInputView 
                isReading={isReading}
                inputData={inputData}
                totalBytes={totalBytes}
            />
        );
    }

    return <InteractiveView />;
}

render(<CliApp />, {
    stdout: process.stdout,
    stdin: process.stdin,
    patchConsole: false,
});