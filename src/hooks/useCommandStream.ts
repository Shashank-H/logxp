import { useState, useEffect, useRef, useCallback } from 'react';
import type { Subprocess } from 'bun';
import type { LogEntry } from '../types/log';
import { parseLine } from '../core/parser';

interface UseCommandStreamOptions {
  command: string | null;
  onBatch: (logs: LogEntry[]) => void;
  batchInterval?: number;
}

interface UseCommandStreamResult {
  isRunning: boolean;
  error: string | null;
  stop: () => void;
}

export function useCommandStream({
  command,
  onBatch,
  batchInterval = 16,
}: UseCommandStreamOptions): UseCommandStreamResult {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const procRef = useRef<Subprocess | null>(null);
  const pendingLines = useRef<string[]>([]);
  const lineCounter = useRef(0);
  const partialLine = useRef('');

  const processBatch = useCallback(() => {
    if (pendingLines.current.length === 0) return;

    const lines = pendingLines.current;
    pendingLines.current = [];

    const entries: LogEntry[] = [];
    for (const line of lines) {
      if (line.trim()) {
        lineCounter.current++;
        entries.push(parseLine(line, lineCounter.current));
      }
    }

    if (entries.length > 0) {
      onBatch(entries);
    }
  }, [onBatch]);

  const stop = useCallback(() => {
    if (procRef.current) {
      procRef.current.kill();
      procRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!command) return;

    const runCommand = async () => {
      try {
        setIsRunning(true);
        setError(null);

        if (!command.trim()) {
          setError('Invalid command');
          setIsRunning(false);
          return;
        }

        // Spawn the process through shell to support pipes, &&, etc.
        const proc = Bun.spawn(['sh', '-c', command], {
          stdout: 'pipe',
          stderr: 'pipe',
        });

        procRef.current = proc;

        // Read stdout
        const reader = proc.stdout.getReader();
        const decoder = new TextDecoder();

        const readLoop = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const text = decoder.decode(value);
              const combined = partialLine.current + text;
              const lines = combined.split('\n');

              partialLine.current = lines.pop() || '';

              for (const line of lines) {
                pendingLines.current.push(line);
              }
            }

            // Process remaining partial line
            if (partialLine.current.trim()) {
              pendingLines.current.push(partialLine.current);
              partialLine.current = '';
            }
            processBatch();
          } catch {
            // Stream closed
          }
        };

        readLoop();

        // Also read stderr
        const stderrReader = proc.stderr.getReader();
        const stderrLoop = async () => {
          try {
            while (true) {
              const { done, value } = await stderrReader.read();
              if (done) break;

              const text = decoder.decode(value);
              const lines = text.split('\n');

              for (const line of lines) {
                if (line.trim()) {
                  pendingLines.current.push(line);
                }
              }
            }
          } catch {
            // Stream closed
          }
        };

        stderrLoop();

        // Wait for process to exit
        const exitCode = await proc.exited;
        setIsRunning(false);

        if (exitCode !== 0) {
          setError(`Process exited with code ${exitCode}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start command');
        setIsRunning(false);
      }
    };

    runCommand();

    // Set up batch processing interval
    const interval = setInterval(processBatch, batchInterval);

    return () => {
      clearInterval(interval);
      stop();
    };
  }, [command, batchInterval, processBatch, stop]);

  return { isRunning, error, stop };
}
