import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { LogXPConfig } from '../types/config';
import { DEFAULT_CONFIG } from './defaults';
import { parseYaml } from './yaml-parser';

const CONFIG_FILENAME = '.logxp.yaml';
const CONFIG_FILENAME_ALT = '.logxp.yml';

function getConfigPaths(): string[] {
  const home = homedir();
  return [
    join(process.cwd(), CONFIG_FILENAME),
    join(process.cwd(), CONFIG_FILENAME_ALT),
    join(home, '.config', 'logxp', 'config.yaml'),
    join(home, '.config', 'logxp', 'config.yml'),
    join(home, CONFIG_FILENAME),
  ];
}

async function readConfigFile(path: string): Promise<Record<string, unknown> | null> {
  try {
    const file = Bun.file(path);
    if (!(await file.exists())) {
      return null;
    }
    const content = await file.text();
    return parseYaml(content);
  } catch {
    return null;
  }
}

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key as keyof T];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  }

  return result;
}

export async function loadConfig(): Promise<LogXPConfig> {
  const paths = getConfigPaths();

  let config = { ...DEFAULT_CONFIG };

  for (const path of paths) {
    const fileConfig = await readConfigFile(path);
    if (fileConfig) {
      config = deepMerge(config, fileConfig);
      break;
    }
  }

  return config;
}

export function validateConfig(config: unknown): config is Partial<LogXPConfig> {
  if (typeof config !== 'object' || config === null) {
    return false;
  }
  return true;
}

export function getConfigPath(): string | null {
  const paths = getConfigPaths();
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
}
