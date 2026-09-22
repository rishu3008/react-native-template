export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Structured context attached to a log entry. Never secrets (rule 22). */
export type LogContext = Record<string, unknown>;

export type LogEntry = {
  level: LogLevel;
  message: string;
  context: LogContext | undefined;
  error: unknown;
  timestamp: number;
};

/**
 * Where log entries go. The console transport is the only one the template
 * ships; a crash reporter or log aggregator is added by registering another
 * (rule 48).
 */
export type LogTransport = (entry: LogEntry) => void;

export type Logger = {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: unknown, context?: LogContext) => void;
  addTransport: (transport: LogTransport) => () => void;
  setLevel: (level: LogLevel) => void;
};
