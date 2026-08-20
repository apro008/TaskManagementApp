import { env } from '../config/env';

const levels = ['debug', 'info', 'warn', 'error'] as const;

type Level = (typeof levels)[number];

function enabled(level: Level) {
  return levels.indexOf(level) >= levels.indexOf(env.logLevel as Level);
}

export const log = {
  debug(...args: unknown[]) {
    if (enabled('debug')) console.log('[debug]', ...args);
  },
  info(...args: unknown[]) {
    if (enabled('info')) console.log('[info]', ...args);
  },
  warn(...args: unknown[]) {
    if (enabled('warn')) console.warn('[warn]', ...args);
  },
  error(...args: unknown[]) {
    if (enabled('error')) console.error('[error]', ...args);
  },
};
