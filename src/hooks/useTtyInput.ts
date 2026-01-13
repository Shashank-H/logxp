import { useEffect, useRef, useCallback } from 'react';

interface KeyEvent {
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  sequence: string;
}

interface UseTtyInputOptions {
  onInput: (char: string, key: KeyEvent) => void;
  isActive?: boolean;
}

// Parse escape sequences to key names
function parseKey(data: string): KeyEvent {
  const key: KeyEvent = {
    name: '',
    ctrl: false,
    meta: false,
    shift: false,
    sequence: data,
  };

  // Escape sequences
  if (data === '\x1b[A') {
    key.name = 'up';
  } else if (data === '\x1b[B') {
    key.name = 'down';
  } else if (data === '\x1b[C') {
    key.name = 'right';
  } else if (data === '\x1b[D') {
    key.name = 'left';
  } else if (data === '\x1b[5~') {
    key.name = 'pageup';
  } else if (data === '\x1b[6~') {
    key.name = 'pagedown';
  } else if (data === '\x1b[H' || data === '\x1b[1~') {
    key.name = 'home';
  } else if (data === '\x1b[F' || data === '\x1b[4~') {
    key.name = 'end';
  } else if (data === '\x1b' || data === '\x1b\x1b') {
    key.name = 'escape';
  } else if (data === '\x7f' || data === '\b') {
    key.name = 'backspace';
  } else if (data === '\r' || data === '\n') {
    key.name = 'return';
  } else if (data === '\t') {
    key.name = 'tab';
  } else if (data.length === 1) {
    const code = data.charCodeAt(0);
    if (code < 32) {
      // Control character
      key.ctrl = true;
      key.name = String.fromCharCode(code + 64).toLowerCase();
    } else {
      key.name = data;
    }
  }

  return key;
}

export function useTtyInput({ onInput, isActive = true }: UseTtyInputOptions) {
  const fileRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const isRunning = useRef(false);

  const readLoop = useCallback(async () => {
    if (!readerRef.current || !isRunning.current) return;

    try {
      const decoder = new TextDecoder();

      while (isRunning.current) {
        const { done, value } = await readerRef.current.read();
        if (done) break;

        const data = decoder.decode(value);

        // Split by escape sequences or individual chars
        let i = 0;
        while (i < data.length) {
          let chunk: string;

          if (data[i] === '\x1b' && i + 1 < data.length) {
            // Escape sequence
            if (data[i + 1] === '[') {
              // CSI sequence - find the end
              let end = i + 2;
              while (end < data.length && data[end] >= '0' && data[end] <= '?') {
                end++;
              }
              if (end < data.length) {
                end++; // include final char
              }
              chunk = data.slice(i, end);
              i = end;
            } else {
              chunk = data.slice(i, i + 2);
              i += 2;
            }
          } else {
            chunk = data[i];
            i++;
          }

          const key = parseKey(chunk);
          onInput(chunk.length === 1 && chunk.charCodeAt(0) >= 32 ? chunk : '', key);
        }
      }
    } catch (err) {
      // Reader closed or error
    }
  }, [onInput]);

  useEffect(() => {
    if (!isActive) return;

    const startReading = async () => {
      try {
        // Open /dev/tty using Bun's file API
        fileRef.current = Bun.file('/dev/tty');
        const stream = fileRef.current.stream();
        readerRef.current = stream.getReader();
        isRunning.current = true;

        // Set terminal to raw mode using stty
        Bun.spawnSync(['stty', 'raw', '-echo'], {
          stdin: Bun.file('/dev/tty'),
        });

        readLoop();
      } catch {
        // /dev/tty not available - keyboard input will be disabled
        // This is expected in non-interactive environments (CI, SSH without PTY, etc.)
      }
    };

    startReading();

    return () => {
      isRunning.current = false;

      // Restore terminal mode
      try {
        Bun.spawnSync(['stty', 'sane'], {
          stdin: Bun.file('/dev/tty'),
        });
      } catch {}

      if (readerRef.current) {
        try {
          readerRef.current.cancel();
        } catch {}
        readerRef.current = null;
      }
    };
  }, [isActive, readLoop]);
}
