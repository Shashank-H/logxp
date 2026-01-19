import { spawn, execSync } from 'child_process';

/**
 * Check if running in WSL
 */
function isWSL(): boolean {
  try {
    const release = execSync('uname -r', { encoding: 'utf8' });
    return release.toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

/**
 * Copy text to system clipboard using native commands
 * Supports macOS (pbcopy), Linux (xclip/xsel), Windows (clip), and WSL (clip.exe)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const platform = process.platform;

  let command: string;
  let args: string[];

  if (platform === 'darwin') {
    command = 'pbcopy';
    args = [];
  } else if (platform === 'win32') {
    command = 'clip';
    args = [];
  } else if (isWSL()) {
    // WSL - use Windows clip.exe
    command = 'clip.exe';
    args = [];
  } else {
    // Linux - try xclip first, fall back to xsel
    command = 'xclip';
    args = ['-selection', 'clipboard'];
  }

  return new Promise((resolve) => {
    try {
      const proc = spawn(command, args, { stdio: ['pipe', 'ignore', 'ignore'] });

      proc.on('error', () => {
        // If xclip fails on Linux, try xsel
        if (platform === 'linux' && command === 'xclip') {
          const xselProc = spawn('xsel', ['--clipboard', '--input'], { stdio: ['pipe', 'ignore', 'ignore'] });
          xselProc.on('error', () => resolve(false));
          xselProc.on('close', (code) => resolve(code === 0));
          xselProc.stdin.write(text);
          xselProc.stdin.end();
        } else {
          resolve(false);
        }
      });

      proc.on('close', (code) => resolve(code === 0));
      proc.stdin.write(text);
      proc.stdin.end();
    } catch {
      resolve(false);
    }
  });
}
