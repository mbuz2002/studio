
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, source?: string) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const MAX_LOGS = 200; 

export const LogProvider = ({ children }: PropsWithChildren) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addLog = useCallback((level: LogLevel, message: string, source?: string) => {
    if (!isMounted) { 
      console.warn("LogProvider: addLog called before component is mounted. Log was not added:", {level, message, source});
      return;
    }
    const newLogEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      source,
    };
    setLogs(prevLogs => {
      const updatedLogs = [newLogEntry, ...prevLogs];
      if (updatedLogs.length > MAX_LOGS) {
        return updatedLogs.slice(0, MAX_LOGS);
      }
      return updatedLogs;
    });
  }, [isMounted]);

  const clearLogs = useCallback(() => {
    if (!isMounted) return;
    setLogs([]);
  }, [isMounted]); 
  
  const contextValue = useMemo(() => ({
    logs,
    addLog,
    clearLogs,
  }), [logs, addLog, clearLogs]);

  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};

