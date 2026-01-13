import type { LogEntry, LogLevel } from './log';

export interface Filter {
  type: 'keyword' | 'level';
  value: string;
  levelValue?: LogLevel;
}

export interface LogViewerState {
  logs: LogEntry[];
  totalReceived: number;

  activeFilters: Filter[];

  searchTerm: string | null;
  searchMatches: number[];
  currentMatchIndex: number;

  scrollOffset: number;
  followMode: boolean;
  viewportHeight: number;

  commandMode: boolean;
  commandInput: string;

  sortBy: 'default' | 'timestamp' | 'level';

  isStreaming: boolean;
  isPaused: boolean;
}

export type LogViewerAction =
  | { type: 'ADD_LOGS'; payload: LogEntry[] }
  | { type: 'SET_FILTER'; payload: Filter | null }
  | { type: 'ADD_FILTER'; payload: Filter }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SEARCH'; payload: string | null }
  | { type: 'NAVIGATE_SEARCH'; payload: 'next' | 'prev' }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'SCROLL'; payload: number }
  | { type: 'SCROLL_TO'; payload: 'top' | 'bottom' }
  | { type: 'SET_VIEWPORT_HEIGHT'; payload: number }
  | { type: 'TOGGLE_FOLLOW' }
  | { type: 'SET_FOLLOW'; payload: boolean }
  | { type: 'SET_COMMAND_MODE'; payload: boolean }
  | { type: 'UPDATE_COMMAND_INPUT'; payload: string }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_SORT'; payload: 'default' | 'timestamp' | 'level' }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'TOGGLE_PAUSE' };
