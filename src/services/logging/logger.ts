import { redactContext } from './redact';
import type {
  LogContext,
  LogEntry,
  LogLevel,
  Logger,
  LogTransport,
} from './types';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Verbose while developing, quiet in production (rule 22).
 *
 * Set from __DEV__ rather than from appConfig, so the logging layer has no
 * dependency on configuration and can be used during bootstrap before
 * anything else is wired up.
 */
let currentLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

const transports = new Set<LogTransport>();

/**
 * Console transport.
 *
 * The only place in the template permitted to call console, which is why the
 * no-console lint rule is disabled here and nowhere else.
 */
const consoleTransport: LogTransport = entry => {
  const prefix = `[${entry.level}]`;
  const args: unknown[] = [prefix, entry.message];

  if (entry.context != null) {
    args.push(entry.context);
  }

  if (entry.error != null) {
    args.push(entry.error);
  }

  /* eslint-disable no-console */
  if (entry.level === 'error') {
    console.error(...args);
  } else if (entry.level === 'warn') {
    console.warn(...args);
  } else {
    console.log(...args);
  }
  /* eslint-enable no-console */
};

if (__DEV__) {
  transports.add(consoleTransport);
}

const emit = (
  level: LogLevel,
  message: string,
  error: unknown,
  context: LogContext | undefined,
): void => {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[currentLevel]) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    context: redactContext(context),
    error,
    timestamp: Date.now(),
  };

  for (const transport of transports) {
    try {
      transport(entry);
    } catch {
      // A failing transport must never break the code that logged. Swallowed
      // deliberately: reporting it would require logging, which is what just
      // failed.
    }
  }
};

export const logger: Logger = {
  debug: (message, context) => emit('debug', message, undefined, context),
  info: (message, context) => emit('info', message, undefined, context),
  warn: (message, context) => emit('warn', message, undefined, context),
  error: (message, error, context) => emit('error', message, error, context),

  addTransport: transport => {
    transports.add(transport);
    return () => transports.delete(transport);
  },

  setLevel: level => {
    currentLevel = level;
  },
};

/** Test seam. */
export const __resetLogger = (level: LogLevel = 'debug') => {
  transports.clear();
  currentLevel = level;
};
