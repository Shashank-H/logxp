import type { LogEntry, LogLevel } from "./log";

export interface Filter {
  type: "keyword" | "level" | "search";
  value: string;
  levelValue?: LogLevel;
}

export type FocusedPane = "logs" | "details";
export type SidebarMode = "hidden" | "visible" | "fullscreen";

export interface LogViewerState {
  logs: LogEntry[];
  totalReceived: number;
  totalLogs: number; // Total logs in database

  activeFilters: Filter[];

  searchTerm: string | null;
  searchMatches: number[];
  currentMatchIndex: number;

  scrollOffset: number;
  followMode: boolean;
  viewportHeight: number;

  commandMode: boolean;
  commandInput: string;

  sortBy: "default" | "timestamp" | "level";

  isStreaming: boolean;
  isPaused: boolean;

  selectedLogIndex: number | null;

  focusedPane: FocusedPane;
  detailScrollOffset: number;
  showHelp: boolean;
  sidebarMode: SidebarMode;
  copyNotification: string | null;
}

export type LogViewerAction =
  | { type: "ADD_LOGS"; payload: LogEntry[] }
  | { type: "SET_FILTER"; payload: Filter | null }
  | { type: "ADD_FILTER"; payload: Filter }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_SEARCH"; payload: string | null }
  | { type: "SET_SEARCH_MATCHES"; payload: number[] }
  | { type: "NAVIGATE_SEARCH"; payload: "next" | "prev" }
  | { type: "CLEAR_SEARCH" }
  | { type: "SCROLL"; payload: number }
  | { type: "SCROLL_TO"; payload: "top" | "bottom" }
  | { type: "SET_VIEWPORT_HEIGHT"; payload: number }
  | { type: "TOGGLE_FOLLOW" }
  | { type: "SET_FOLLOW"; payload: boolean }
  | { type: "SET_COMMAND_MODE"; payload: boolean }
  | { type: "UPDATE_COMMAND_INPUT"; payload: string }
  | { type: "CLEAR_LOGS" }
  | { type: "SET_SORT"; payload: "default" | "timestamp" | "level" }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SELECT_LOG"; payload: number | null }
  | { type: "TOGGLE_FOCUS" }
  | { type: "SET_FOCUS"; payload: FocusedPane }
  | { type: "SCROLL_DETAIL"; payload: number }
  | { type: "TOGGLE_HELP" }
  | { type: "SET_HELP"; payload: boolean }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_MODE"; payload: SidebarMode }
  | { type: "TOGGLE_FULLSCREEN_DETAIL" }
  | { type: "SET_COPY_NOTIFICATION"; payload: string | null };
