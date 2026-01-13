import { useState, useEffect, useRef, useCallback } from 'react';
import type { LogEntry } from '../types/log';
import { parseLine } from '../core/parser';

interface UseLogStreamOptions {
  isPiped: boolean;
  batchInterval?: number;
  onBatch?: (logs: LogEntry[]) => void;
}

interface UseLogStreamResult {
  isStreaming: boolean;
  totalBytes: number;
  lineCount: number;
}

export function useLogStream({
  isPiped,
  batchInterval = 16,
  onBatch,
}: UseLogStreamOptions): UseLogStreamResult {
  const [isStreaming, setIsStreaming] = useState(isPiped);
  const [totalBytes, setTotalBytes] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  const pendingLines = useRef<string[]>([]);
  const lineCounter = useRef(0);
  const bytesRef = useRef(0);
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

    if (entries.length > 0 && onBatch) {
      onBatch(entries);
      setLineCount(lineCounter.current);
    }
  }, [onBatch]);

  useEffect(() => {
    if (!isPiped) return;

    process.stdin.setEncoding('utf8');

    const handleData = (chunk: string) => {
      bytesRef.current += chunk.length;
      setTotalBytes(bytesRef.current);

      const combined = partialLine.current + chunk;
      const lines = combined.split('\n');

      partialLine.current = lines.pop() || '';

      for (const line of lines) {
        pendingLines.current.push(line);
      }
    };

    const handleEnd = () => {
      if (partialLine.current.trim()) {
        pendingLines.current.push(partialLine.current);
        partialLine.current = '';
      }
      processBatch();
      setIsStreaming(false);
    };

    process.stdin.on('data', handleData);
    process.stdin.on('end', handleEnd);

    const interval = setInterval(processBatch, batchInterval);

    return () => {
      process.stdin.off('data', handleData);
      process.stdin.off('end', handleEnd);
      clearInterval(interval);
    };
  }, [isPiped, batchInterval, processBatch]);

  return { isStreaming, totalBytes, lineCount };
}
