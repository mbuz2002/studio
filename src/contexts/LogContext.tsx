
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

export const MAX_LOGS = 250; // Increased max logs for SuperAdmin to see more potentially

export const LogProvider = ({ children }: PropsWithChildren) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addLog = useCallback((level: LogLevel, message: string, source?: string) => {
    if (!isMounted) { 
      // Queue log if not mounted? Or just console.warn?
      // For now, just warn and skip if not mounted, as it usually indicates a setup issue.
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
    // Using a functional update for setLogs is safer if addLog might be called rapidly
    // or if its dependencies change in a way that could cause stale closures (though less likely here with isMounted).
    setLogs(prevLogs => {
      const updatedLogs = [newLogEntry, ...prevLogs];
      if (updatedLogs.length > MAX_LOGS) {
        return updatedLogs.slice(0, MAX_LOGS);
      }
      return updatedLogs;
    });
  }, [isMounted]); // isMounted is the key dependency here

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
