import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LogXPConfig } from '../types/config';
import { DEFAULT_CONFIG, loadConfig } from '../config';

interface ConfigContextValue {
  config: LogXPConfig;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextValue>({
  config: DEFAULT_CONFIG,
  isLoading: true,
});

interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<LogXPConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig()
      .then((loaded) => {
        setConfig(loaded);
      })
      .catch(() => {
        // Use defaults on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): LogXPConfig {
  const context = useContext(ConfigContext);
  return context.config;
}

export function useConfigLoading(): boolean {
  const context = useContext(ConfigContext);
  return context.isLoading;
}
