import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import type { LogEntry, LogLevel } from '../types/log';
import type { LogViewerState, LogViewerAction, Filter } from '../types/state';
import { CircularBuffer } from '../core/buffer';
import { DEFAULT_CONFIG } from '../config/defaults';
import { LOG_LEVEL_PRIORITY } from '../types/log';

const INITIAL_STATE: LogViewerState = {
  logs: [],
  totalReceived: 0,
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
      const newLogs = [...state.logs, ...action.payload];
      const totalReceived = state.totalReceived + action.payload.length;

      let scrollOffset = state.scrollOffset;
      if (state.followMode && !state.isPaused) {
        scrollOffset = Math.max(0, newLogs.length - state.viewportHeight);
      }

      return {
        ...state,
        logs: newLogs,
        totalReceived,
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
      return {
        ...state,
        searchTerm: action.payload,
        currentMatchIndex: -1,
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

    case 'CLEAR_SEARCH':
      return {
        ...state,
        searchTerm: null,
        searchMatches: [],
        currentMatchIndex: -1,
      };

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
        scrollOffset: Math.max(0, state.logs.length - state.viewportHeight),
        followMode: true,
      };

    case 'SET_VIEWPORT_HEIGHT':
      return { ...state, viewportHeight: action.payload };

    case 'TOGGLE_FOLLOW': {
      const newFollowMode = !state.followMode;
      return {
        ...state,
        followMode: newFollowMode,
        isPaused: false,
        // Clear selection when entering follow mode
        selectedLogIndex: newFollowMode ? null : state.selectedLogIndex,
      };
    }

    case 'SET_FOLLOW':
      return {
        ...state,
        followMode: action.payload,
        isPaused: false,
        // Clear selection when entering follow mode
        selectedLogIndex: action.payload ? null : state.selectedLogIndex,
      };

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
        logs: [],
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
  filteredLogs: LogEntry[];
  visibleLogs: LogEntry[];
  addLogs: (logs: LogEntry[]) => void;
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
  const bufferRef = useRef(new CircularBuffer<LogEntry>(bufferSize));

  const addLogs = useCallback((logs: LogEntry[]) => {
    const buffer = bufferRef.current;
    buffer.pushMany(logs);
    dispatch({ type: 'ADD_LOGS', payload: logs });
  }, []);

  const filteredLogs = useMemo(() => {
    let logs = state.logs;

    if (state.activeFilters.length > 0) {
      logs = logs.filter((log) => {
        return state.activeFilters.every((filter) => {
          if (filter.type === 'level') {
            return log.level === filter.levelValue;
          }
          const searchText = (log.raw + (log.message || '')).toLowerCase();
          return searchText.includes(filter.value.toLowerCase());
        });
      });
    }

    if (state.sortBy === 'timestamp') {
      logs = [...logs].sort((a, b) => {
        const aTime = a.timestamp?.getTime() || 0;
        const bTime = b.timestamp?.getTime() || 0;
        return aTime - bTime;
      });
    } else if (state.sortBy === 'level') {
      logs = [...logs].sort((a, b) => {
        return LOG_LEVEL_PRIORITY[a.level] - LOG_LEVEL_PRIORITY[b.level];
      });
    }

    return logs;
  }, [state.logs, state.activeFilters, state.sortBy]);

  const searchMatchesComputed = useMemo(() => {
    if (!state.searchTerm) return [];

    const matches: number[] = [];
    const term = state.searchTerm.toLowerCase();

    filteredLogs.forEach((log, index) => {
      const searchText = (log.raw + (log.message || '')).toLowerCase();
      if (searchText.includes(term)) {
        matches.push(index);
      }
    });

    return matches;
  }, [filteredLogs, state.searchTerm]);

  const stateWithMatches = useMemo(() => {
    return {
      ...state,
      searchMatches: searchMatchesComputed,
    };
  }, [state, searchMatchesComputed]);

  const visibleLogs = useMemo(() => {
    const start = Math.max(0, state.scrollOffset);
    const end = start + state.viewportHeight;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, state.scrollOffset, state.viewportHeight]);

  const value = useMemo(
    () => ({
      state: stateWithMatches,
      dispatch,
      filteredLogs,
      visibleLogs,
      addLogs,
    }),
    [stateWithMatches, filteredLogs, visibleLogs, addLogs]
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
