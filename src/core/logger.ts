// AdolatAI - Logger xizmati

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    data?: unknown;
}

class Logger {
    private isDev = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) || false;
    private logs: LogEntry[] = [];
    private maxLogs = 100;

    private createEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            data
        };
    }

    private log(level: LogLevel, message: string, data?: unknown) {
        const entry = this.createEntry(level, message, data);

        // Saqlash
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Konsolga chiqarish (faqat dev muhitda)
        if (this.isDev) {
            const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
            switch (level) {
                case 'debug':
                    console.debug(prefix, message, data || '');
                    break;
                case 'info':
                    console.info(prefix, message, data || '');
                    break;
                case 'warn':
                    console.warn(prefix, message, data || '');
                    break;
                case 'error':
                    console.error(prefix, message, data || '');
                    break;
            }
        }
    }

    debug(message: string, data?: unknown) {
        this.log('debug', message, data);
    }

    info(message: string, data?: unknown) {
        this.log('info', message, data);
    }

    warn(message: string, data?: unknown) {
        this.log('warn', message, data);
    }

    error(message: string, data?: unknown) {
        this.log('error', message, data);
    }

    // Barcha loglarni olish
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    // Loglarni tozalash
    clear() {
        this.logs = [];
    }

    // Oxirgi xatolarni olish
    getErrors(): LogEntry[] {
        return this.logs.filter(l => l.level === 'error');
    }
}

// Singleton
export const logger = new Logger();
export default logger;
