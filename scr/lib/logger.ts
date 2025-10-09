export const logger = {
  info: (...a: any[]) => { if (process.env.NODE_ENV !== 'test') console.log('[INFO]', ...a); },
  warn: (...a: any[]) => { if (process.env.NODE_ENV !== 'test') console.warn('[WARN]', ...a); },
  error: (...a: any[]) => { if (process.env.NODE_ENV !== 'test') console.error('[ERROR]', ...a); },
};
