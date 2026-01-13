import { useState, useEffect } from "react";

interface StdinReaderResult {
  inputData: string[];
  isReading: boolean;
  totalBytes: number;
}

export function useStdinReader(isPiped: boolean): StdinReaderResult {
  const [inputData, setInputData] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(isPiped);
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    if (!isPiped) return;

    let buffer = "";
    let bytes = 0;

    process.stdin.setEncoding("utf8");

    const handleData = (data: string) => {
      buffer += data;
      bytes += data.length;
      setTotalBytes(bytes);
    };

    const handleEnd = () => {
      const lines = buffer
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

      setInputData(lines);
      setIsReading(false);

      setTimeout(() => process.exit(0), 100);
    };

    process.stdin.on("data", handleData);
    process.stdin.on("end", handleEnd);

    return () => {
      process.stdin.off("data", handleData);
      process.stdin.off("end", handleEnd);
    };
  }, [isPiped]);

  return { inputData, isReading, totalBytes };
}
