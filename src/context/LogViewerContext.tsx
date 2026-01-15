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
        // Remove any existing search filters
        const newFilters = state.activeFilters.filter(f => f.type !== 'search');
        return {
          ...state,
          searchTerm: null,
          searchMatches: [],
          currentMatchIndex: -1,
          activeFilters: newFilters,
          scrollOffset: 0,
          selectedLogIndex: null,
        };
      }
      
      // Remove any existing search filters and add new one
      const newFilters = state.activeFilters.filter(f => f.type !== 'search');
      newFilters.push({ type: 'search', value: action.payload });
      
      return {
        ...state,
        searchTerm: action.payload,
        currentMatchIndex: -1,
        activeFilters: newFilters,
        scrollOffset: 0,
        // Auto-select first filtered log
        selectedLogIndex: 0,
        followMode: false,
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
        scrollOffset: Math.max(
          0,
          matchLogIndex - Math.floor(state.viewportHeight / 2)
        ),
        followMode: false,
      };
    }

    case 'CLEAR_SEARCH': {
      // Remove any search filters
      const newFilters = state.activeFilters.filter(f => f.type !== 'search');
      return {
        ...state,
        searchTerm: null,
        searchMatches: [],
        currentMatchIndex: -1,
        activeFilters: newFilters,
        scrollOffset: 0,
        // Reset selection to first log
        selectedLogIndex: 0,
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

  // Only compute search matches when search term changes (not on every scroll)
  const searchMatchesComputed = useMemo(() => {
    if (!state.searchTerm) return [];

    // Since search is now a filter, all filtered logs are matches
    // Return array of indices [0, 1, 2, ..., filteredCount-1]
    return Array.from({ length: filteredCount }, (_, i) => i);
  }, [state.searchTerm, filteredCount]);

  const stateWithMatches = useMemo(() => {
    return {
      ...state,
      searchMatches: searchMatchesComputed,
    };
  }, [state, searchMatchesComputed]);

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
      state: stateWithMatches,
      dispatch,
      filteredCount,
      visibleLogs,
      getLogByIndex,
      addLogs,
      clearLogs,
    }),
    [stateWithMatches, filteredCount, visibleLogs, getLogByIndex, addLogs, clearLogs]
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
