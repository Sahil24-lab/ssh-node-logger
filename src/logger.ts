// src/logger.ts
import * as fs from "fs";
import * as path from "path";

export enum LogLevel {
  LOG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

const COLORS: Record<keyof typeof LogLevel, string> = {
  LOG: "\x1b[37m",   // white
  INFO: "\x1b[32m",  // green
  WARN: "\x1b[33m",  // yellow
  ERROR: "\x1b[31m"  // red
};

const RESET = "\x1b[0m";

const DEFAULT_FLUSH_INTERVAL = 5000; // flush cache every 5 seconds
const MAX_LOG_FILE_SIZE = 1024 * 1024; // 1MB

// Auto-detect environment: if NODE_ENV is "development" or "local", immediate logging is enabled.
const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local";

interface LogCacheEntry {
  level: keyof typeof LogLevel;
  message: string;
}

class Logger {
  level: LogLevel = LogLevel.LOG;
  isDebug: boolean = isDev;
  logFilePath: string | null = null;
  _logCache: LogCacheEntry[] = [];
  _flushTimer: NodeJS.Timeout | null = null;

  private _formatMessage(levelStr: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${levelStr} - ${message}`;
  }

  private _writeToFile(logMessage: string): void {
    if (!this.logFilePath) return;
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      let rotate = false;
      if (fs.existsSync(this.logFilePath)) {
        const stats = fs.statSync(this.logFilePath);
        if (stats.size + Buffer.byteLength(logMessage) > MAX_LOG_FILE_SIZE) {
          rotate = true;
        }
      }
      if (rotate) {
        const rotatedPath = this.logFilePath + "." + Date.now();
        fs.renameSync(this.logFilePath, rotatedPath);
      }
      fs.appendFileSync(this.logFilePath, logMessage);
    } catch (err) {
      console.error("Failed to write log to file:", err);
    }
  }

  private _startFlushInterval(): void {
    if (!this.isDebug && !this._flushTimer) {
      this._flushTimer = setInterval(() => {
        this.flush();
      }, DEFAULT_FLUSH_INTERVAL);
    }
  }

  private _writeLog(levelKey: keyof typeof LogLevel, args: any[]): void {
    if (LogLevel[levelKey] < this.level) {
      return;
    }

    const messageContent = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    const formatted = this._formatMessage(levelKey, messageContent);
    const colored = COLORS[levelKey] + formatted + RESET;

    if (this.isDebug) {
      if (levelKey === "WARN") {
        console.warn(colored);
      } else if (levelKey === "ERROR") {
        console.error(colored);
      } else {
        console.log(colored);
      }
    } else {
      this._logCache.push({ level: levelKey, message: formatted });
    }

    if (this.logFilePath) {
      this._writeToFile(formatted + "\n");
    }
  }

  log(...args: any[]): void {
    this._writeLog("LOG", args);
    if (!this.isDebug) this._startFlushInterval();
  }

  info(...args: any[]): void {
    this._writeLog("INFO", args);
    if (!this.isDebug) this._startFlushInterval();
  }

  warn(...args: any[]): void {
    this._writeLog("WARN", args);
    if (!this.isDebug) this._startFlushInterval();
  }

  error(...args: any[]): void {
    this._writeLog("ERROR", args);
    if (!this.isDebug) this._startFlushInterval();
  }

  flush(): void {
    if (this._logCache.length > 0) {
      this._logCache.forEach((entry) => {
        const color = COLORS[entry.level] || "";
        console.log(color + entry.message + RESET);
      });
      this._logCache = [];
    }
  }

  setLevel(newLevel: LogLevel): void {
    this.level = newLevel;
  }

  setPath(filePath: string): void {
    this.logFilePath = filePath;
  }
}

const logger = new Logger();

// Attach log level constants to the logger so users can refer to them as logger.LOG, etc.
export default Object.assign(logger, LogLevel);
