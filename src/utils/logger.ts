type LoggerPayload = Record<string, unknown>;

function print(level: 'info' | 'warn' | 'error', message: string, payload?: LoggerPayload) {
  const context = payload ? JSON.stringify(payload) : '';

  if (level === 'info') {
    console.info(`[NusaQuest] ${message} ${context}`.trim());
    return;
  }

  if (level === 'warn') {
    console.warn(`[NusaQuest] ${message} ${context}`.trim());
    return;
  }

  console.error(`[NusaQuest] ${message} ${context}`.trim());
}

export const logger = {
  info: (message: string, payload?: LoggerPayload) => print('info', message, payload),
  warn: (message: string, payload?: LoggerPayload) => print('warn', message, payload),
  error: (message: string, payload?: LoggerPayload) => print('error', message, payload),
};
