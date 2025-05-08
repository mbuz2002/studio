
"use client";

import type { PropsWithChildren} from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type LogLevel = "INFO" | "WARN" | "ERROR";

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

export const MAX_LOGS = 200; // Keep a maximum of 200 log entries

export const LogProvider = ({ children }: PropsWithChildren) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogLevel, message: string, source?: string) => {
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
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    // Optionally, we can add a log entry indicating logs were cleared
    // addLog("INFO", "Log sistem telah dibersihkan.", "LogContext"); 
    // However, this might be confusing if the goal is a completely empty log.
    // For now, just clear.
  }, []);
  
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

