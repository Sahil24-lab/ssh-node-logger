/// <reference types="node" />
export declare enum LogLevel {
    LOG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
interface LogCacheEntry {
    level: keyof typeof LogLevel;
    message: string;
}
declare class Logger {
    level: LogLevel;
    isDebug: boolean;
    logFilePath: string | null;
    _logCache: LogCacheEntry[];
    _flushTimer: NodeJS.Timeout | null;
    private _formatMessage;
    private _writeToFile;
    private _startFlushInterval;
    private _writeLog;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    flush(): void;
    setLevel(newLevel: LogLevel): void;
    setPath(filePath: string): void;
}
declare const _default: Logger & typeof LogLevel;
export default _default;
