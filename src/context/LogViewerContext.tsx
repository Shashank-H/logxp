import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import type { LogEntry, LogLevel } from '../types/log';
import type { LogViewerState, LogViewerAction, Filter } from '../types/state';
import { LogDatabase } from '../core/database';
import { DEFAULT_CONFIG } from '../config/defaults';
import { LOG_LEVEL_PRIORITY } from '../types/log';

const INITIAL_STATE: LogViewerState = {
  logs: [], // Kept for compatibility but will be empty
  totalReceived: 0,
  totalLogs: 0, // New: track total logs in DB
  activeFilters: [],
  searchTerm: null,
  searchMatches: [],
  currentMatchIndex: -1,
  scrollOffset: 0,
  followMode: DEFAULT_CONFIG.defaults.followMode,
  viewportHeight: 20,
  commandMode: false,
  commandInput: '',
  sortBy: 'default',
  isStreaming: true,
  isPaused: false,
  selectedLogIndex: null,
  focusedPane: 'logs',
  detailScrollOffset: 0,
  showHelp: false,
  sidebarMode: 'hidden',
  copyNotification: null,
};

function logViewerReducer(
  state: LogViewerState,
  action: LogViewerAction
): LogViewerState {
  switch (action.type) {
    case 'ADD_LOGS': {
      // Logs are now in DB, just update counters
      const totalReceived = state.totalReceived + action.payload.length;
      const totalLogs = state.totalLogs + action.payload.length;

      let scrollOffset = state.scrollOffset;
      if (state.followMode && !state.isPaused) {
        scrollOffset = Math.max(0, totalLogs - state.viewportHeight);
      }

      return {
        ...state,
        totalReceived,
        totalLogs,
        scrollOffset,
      };
    }

    case 'ADD_FILTER':
      return {
        ...state,
        activeFilters: [...state.activeFilters, action.payload],
        scrollOffset: 0,
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        activeFilters: [],
        scrollOffset: 0,
      };

    case 'SET_SEARCH': {
      if (action.payload === null) {
        return {
          ...state,
          searchTerm: null,
          searchMatches: [],
          currentMatchIndex: -1,
        };
      }

      // Search only sets searchTerm for highlighting - does NOT filter logs
      return {
        ...state,
        searchTerm: action.payload,
        currentMatchIndex: -1,
        searchMatches: [], // Will be populated by SET_SEARCH_MATCHES
        followMode: false,
      };
    }

    case 'SET_SEARCH_MATCHES': {
      return {
        ...state,
        searchMatches: action.payload,
      };
    }

    case 'NAVIGATE_SEARCH': {
      if (state.searchMatches.length === 0) return state;

      let newIndex: number;
      if (action.payload === 'next') {
        newIndex = (state.currentMatchIndex + 1) % state.searchMatches.length;
      } else {
        newIndex =
          state.currentMatchIndex <= 0
            ? state.searchMatches.length - 1
            : state.currentMatchIndex - 1;
      }

      const matchLogIndex = state.searchMatches[newIndex] ?? 0;
      return {
        ...state,
        currentMatchIndex: newIndex,
        selectedLogIndex: matchLogIndex, // Select the matched log
        scrollOffset: Math.max(
          0,
          matchLogIndex - Math.floor(state.viewportHeight / 2)
        ),
        followMode: false,
      };
    }

    case 'CLEAR_SEARCH': {
      // Clear search state (search doesn't modify activeFilters)
      return {
        ...state,
        searchTerm: null,
        searchMatches: [],
        currentMatchIndex: -1,
      };
    }

    case 'SCROLL':
      return {
        ...state,
        scrollOffset: Math.max(0, state.scrollOffset + action.payload),
        followMode: false,
      };

    case 'SCROLL_TO':
      if (action.payload === 'top') {
        return { ...state, scrollOffset: 0, followMode: false };
      }
      return {
        ...state,
        scrollOffset: Math.max(0, state.totalLogs - state.viewportHeight),
        followMode: true,
      };

    case 'SET_VIEWPORT_HEIGHT':
      return { ...state, viewportHeight: action.payload };

    case 'TOGGLE_FOLLOW': {
      const newFollowMode = !state.followMode;
      // When entering follow mode, immediately jump to the bottom
      const scrollOffset = newFollowMode
        ? Math.max(0, state.totalLogs - state.viewportHeight)
        : state.scrollOffset;
      return {
        ...state,
        followMode: newFollowMode,
        scrollOffset,
        isPaused: false,
        // Clear selection when entering follow mode
        selectedLogIndex: newFollowMode ? null : state.selectedLogIndex,
      };
    }

    case 'SET_FOLLOW': {
      // When entering follow mode, immediately jump to the bottom
      const scrollOffset = action.payload
        ? Math.max(0, state.totalLogs - state.viewportHeight)
        : state.scrollOffset;
      return {
        ...state,
        followMode: action.payload,
        scrollOffset,
        isPaused: false,
        // Clear selection when entering follow mode
        selectedLogIndex: action.payload ? null : state.selectedLogIndex,
      };
    }

    case 'SET_COMMAND_MODE':
      return {
        ...state,
        commandMode: action.payload,
        commandInput: action.payload ? '' : state.commandInput,
      };

    case 'UPDATE_COMMAND_INPUT':
      return { ...state, commandInput: action.payload };

    case 'CLEAR_LOGS':
      return {
        ...state,
        totalLogs: 0,
        scrollOffset: 0,
        searchMatches: [],
        currentMatchIndex: -1,
      };

    case 'SET_SORT':
      return { ...state, sortBy: action.payload };

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };

    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused, followMode: false };

    case 'SELECT_LOG':
      return { ...state, selectedLogIndex: action.payload, detailScrollOffset: 0 };

    case 'TOGGLE_FOCUS':
      // Only toggle focus if sidebar is visible
      if (state.sidebarMode === 'hidden') return state;
      return {
        ...state,
        focusedPane: state.focusedPane === 'logs' ? 'details' : 'logs',
      };

    case 'SET_FOCUS':
      return { ...state, focusedPane: action.payload };

    case 'SCROLL_DETAIL':
      return {
        ...state,
        detailScrollOffset: Math.max(0, state.detailScrollOffset + action.payload),
      };

    case 'TOGGLE_HELP':
      return { ...state, showHelp: !state.showHelp };

    case 'SET_HELP':
      return { ...state, showHelp: action.payload };

    case 'TOGGLE_SIDEBAR': {
      const newMode = state.sidebarMode === 'hidden' ? 'visible' : 'hidden';
      return {
        ...state,
        sidebarMode: newMode,
        // Auto-switch focus to logs when hiding sidebar
        focusedPane: newMode === 'hidden' ? 'logs' : state.focusedPane,
      };
    }

    case 'SET_SIDEBAR_MODE': {
      const modeChanged = state.sidebarMode !== action.payload;
      return {
        ...state,
        sidebarMode: action.payload,
        // Auto-switch focus to logs when hiding sidebar
        focusedPane: action.payload === 'hidden' ? 'logs' : state.focusedPane,
        // Reset scroll offset when mode changes (content width changes)
        detailScrollOffset: modeChanged ? 0 : state.detailScrollOffset,
      };
    }

    case 'TOGGLE_FULLSCREEN_DETAIL': {
      // No-op when sidebar is hidden
      if (state.sidebarMode === 'hidden') return state;
      const newMode = state.sidebarMode === 'fullscreen' ? 'visible' : 'fullscreen';
      return {
        ...state,
        sidebarMode: newMode,
        // Always focus details in fullscreen mode
        focusedPane: newMode === 'fullscreen' ? 'details' : state.focusedPane,
        // Reset scroll offset when switching modes (content width changes)
        detailScrollOffset: 0,
      };
    }

    case 'SET_COPY_NOTIFICATION':
      return { ...state, copyNotification: action.payload };

    default:
      return state;
  }
}

interface LogViewerContextValue {
  state: LogViewerState;
  dispatch: React.Dispatch<LogViewerAction>;
  filteredCount: number;
  visibleLogs: LogEntry[];
  getLogByIndex: (index: number) => LogEntry | null;
  addLogs: (logs: LogEntry[]) => void;
  clearLogs: () => void;
}

const LogViewerContext = createContext<LogViewerContextValue | null>(null);

interface LogViewerProviderProps {
  children: React.ReactNode;
  bufferSize?: number;
}

export function LogViewerProvider({
  children,
  bufferSize = DEFAULT_CONFIG.defaults.bufferSize,
}: LogViewerProviderProps) {
  const [state, dispatch] = useReducer(logViewerReducer, INITIAL_STATE);
  const dbRef = useRef<LogDatabase | null>(null);

  // Initialize database
  useEffect(() => {
    dbRef.current = new LogDatabase();
    
    return () => {
      // Cleanup database on unmount
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, []);

  const addLogs = useCallback((logs: LogEntry[]) => {
    const db = dbRef.current;
    if (!db) return;
    
    // Insert logs into database
    db.insertLogs(logs);
    
    // Update state counters
    dispatch({ type: 'ADD_LOGS', payload: logs });
  }, []);

  const clearLogs = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    
    // Clear database
    db.clear();
    
    // Update state
    dispatch({ type: 'CLEAR_LOGS' });
  }, []);

  // Get filtered count efficiently without fetching all logs
  const filteredCount = useMemo(() => {
    const db = dbRef.current;
    if (!db) return 0;

    return db.getLogCount(
      state.activeFilters.length > 0 ? state.activeFilters : undefined
    );
  }, [state.totalLogs, state.activeFilters]);

  // Get single selected log by index (not all logs)
  const getLogByIndex = useCallback((index: number): LogEntry | null => {
    const db = dbRef.current;
    if (!db || index < 0) return null;

    const logs = db.getLogs(
      index,
      1,
      state.activeFilters.length > 0 ? state.activeFilters : undefined,
      state.sortBy !== 'default' ? state.sortBy : undefined
    );
    return logs[0] || null;
  }, [state.activeFilters, state.sortBy]);

  // Compute search matches - indices where search term matches
  // If filters are active, returns indices within filtered dataset
  const searchMatchesComputed = useMemo(() => {
    const db = dbRef.current;
    if (!db || !state.searchTerm) return [];

    // Search within the current dataset (respecting active filters)
    return db.searchLogs(
      state.searchTerm,
      state.activeFilters.length > 0 ? state.activeFilters : undefined
    );
  }, [state.searchTerm, state.totalLogs, state.activeFilters]);

  // Sync computed search matches to state so NAVIGATE_SEARCH can use them
  useEffect(() => {
    dispatch({ type: 'SET_SEARCH_MATCHES', payload: searchMatchesComputed });
  }, [searchMatchesComputed]);

  const visibleLogs = useMemo(() => {
    const db = dbRef.current;
    if (!db) return [];

    const start = Math.max(0, state.scrollOffset);
    
    // Query only the visible logs with pagination
    return db.getLogs(
      start,
      state.viewportHeight,
      state.activeFilters.length > 0 ? state.activeFilters : undefined,
      state.sortBy !== 'default' ? state.sortBy : undefined
    );
  }, [state.scrollOffset, state.viewportHeight, state.activeFilters, state.sortBy, state.totalLogs]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      filteredCount,
      visibleLogs,
      getLogByIndex,
      addLogs,
      clearLogs,
    }),
    [state, filteredCount, visibleLogs, getLogByIndex, addLogs, clearLogs]
  );

  return (
    <LogViewerContext.Provider value={value}>
      {children}
    </LogViewerContext.Provider>
  );
}

export function useLogViewer() {
  const context = useContext(LogViewerContext);
  if (!context) {
    throw new Error('useLogViewer must be used within a LogViewerProvider');
  }
  return context;
}
