import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

const HISTORY_FILE = join(homedir(), '.logxp', 'shell_history');
const MAX_HISTORY = 100;

/**
 * Manages history of shell commands used to generate logs
 * (e.g., "tail -f /var/log/app.log", "docker logs -f container")
 */
class ShellCommandHistory {
  private history: string[] = [];
  private position: number = -1;
  private currentInput: string = '';

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (existsSync(HISTORY_FILE)) {
        const content = readFileSync(HISTORY_FILE, 'utf-8');
        this.history = content
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .slice(-MAX_HISTORY);
      }
    } catch {
      // Ignore read errors, start with empty history
    }
  }

  private save(): void {
    try {
      const dir = dirname(HISTORY_FILE);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(HISTORY_FILE, this.history.join('\n') + '\n');
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Add a shell command to history
   */
  add(command: string): void {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Don't add duplicates of the last command
    if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
      return;
    }

    this.history.push(trimmed);

    // Trim to max size
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }

    this.save();
    this.reset();
  }

  /**
   * Start navigating history with current input
   */
  startNavigation(currentInput: string): void {
    if (this.position === -1) {
      this.currentInput = currentInput;
    }
  }

  /**
   * Get previous command in history (up arrow)
   */
  previous(currentInput: string): string | null {
    if (this.history.length === 0) return null;

    this.startNavigation(currentInput);

    if (this.position === -1) {
      this.position = this.history.length - 1;
    } else if (this.position > 0) {
      this.position--;
    }

    return this.history[this.position] || null;
  }

  /**
   * Get next command in history (down arrow)
   */
  next(): string | null {
    if (this.position === -1) return null;

    if (this.position < this.history.length - 1) {
      this.position++;
      return this.history[this.position] || null;
    } else {
      // Return to current input
      this.position = -1;
      return this.currentInput;
    }
  }

  /**
   * Reset navigation position
   */
  reset(): void {
    this.position = -1;
    this.currentInput = '';
  }

  /**
   * Get all history items (for display)
   */
  getAll(): string[] {
    return [...this.history];
  }
}

// Singleton instance
export const shellHistory = new ShellCommandHistory();
