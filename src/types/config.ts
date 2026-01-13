import type { LogLevel } from './log';

export interface ColorConfig {
  error: string;
  warn: string;
  info: string;
  debug: string;
  trace: string;
  unknown: string;
  json: {
    key: string;
    string: string;
    number: string;
    boolean: string;
    null: string;
    bracket: string;
  };
}

export interface PatternConfig {
  error: string[];
  warn: string[];
  info: string[];
  debug: string[];
  trace: string[];
}

export interface JsonFieldConfig {
  level: string[];
  message: string[];
  timestamp: string[];
}

export interface DefaultsConfig {
  followMode: boolean;
  bufferSize: number;
}

export interface KeybindingConfig {
  quit: string[];
  command: string[];
  toggleFollow: string[];
  scrollUp: string[];
  scrollDown: string[];
  pageUp: string[];
  pageDown: string[];
  home: string[];
  end: string[];
}

export interface LogXPConfig {
  colors: ColorConfig;
  patterns: PatternConfig;
  jsonFields: JsonFieldConfig;
  defaults: DefaultsConfig;
  keybindings: KeybindingConfig;
}
