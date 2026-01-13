import type { LogXPConfig } from '../types/config';

export const DEFAULT_CONFIG: LogXPConfig = {
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'gray',
    trace: 'gray',
    unknown: 'white',
    json: {
      key: 'cyan',
      string: 'green',
      number: 'magenta',
      boolean: 'yellow',
      null: 'gray',
      bracket: 'white',
    },
  },
  patterns: {
    error: ['error', 'fatal', 'exception', 'panic', 'fail'],
    warn: ['warn', 'warning', 'caution'],
    info: ['info', 'information'],
    debug: ['debug'],
    trace: ['trace', 'verbose'],
  },
  jsonFields: {
    level: ['level', 'severity', 'loglevel', 'log_level', 'lvl'],
    message: ['message', 'msg', 'text', 'content', 'body'],
    timestamp: ['timestamp', 'time', 'ts', 'datetime', 'date', '@timestamp'],
  },
  defaults: {
    followMode: true,
    bufferSize: 10000,
  },
  keybindings: {
    quit: ['q', 'escape'],
    command: ['/'],
    toggleFollow: [' '],
    scrollUp: ['up', 'k'],
    scrollDown: ['down', 'j'],
    pageUp: ['pageup'],
    pageDown: ['pagedown'],
    home: ['home'],
    end: ['end'],
  },
};
