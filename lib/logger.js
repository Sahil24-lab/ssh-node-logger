// lib/logger.js
const fs = require("fs");
const path = require("path");

// Define log levels
const LEVELS = {
  LOG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// ANSI color codes for console output
const COLORS = {
  LOG: "\x1b[37m", // white
  INFO: "\x1b[32m", // green
  WARN: "\x1b[33m", // yellow
  ERROR: "\x1b[31m", // red
  RESET: "\x1b[0m",
};

const DEFAULT_FLUSH_INTERVAL = 5000; // flush cache every 5 seconds
const MAX_LOG_FILE_SIZE = 1024 * 1024; // 1MB

// Auto-detect environment. If NODE_ENV is "development" or "local", immediate logging is enabled.
const isDev =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local";

const logger = {
  // Current minimum level to output; default is LOG so every log shows.
  level: LEVELS.LOG,
  // When true, logs are written immediately; if false, logs are cached.
  isDebug: isDev,
  // Optional file path for logging. If set, logs are appended to this file.
  logFilePath: null,
  // Internal cache for log messages
  _logCache: [],
  // Reference for the flush interval timer
  _flushTimer: null,

  // Formats the message with a timestamp and level
  _formatMessage(levelStr, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${levelStr} - ${message}`;
  },

  // Writes the log message to console and file if configured.
  _writeLog(levelKey, args) {
    if (LEVELS[levelKey] < this.level) {
      return;
    }

    const levelStr = levelKey;
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

    const formatted = this._formatMessage(levelStr, messageContent);
    const colored = COLORS[levelKey] + formatted + COLORS.RESET;

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
  },

  // Writes log to file and rotates the file if it exceeds the maximum size.
  _writeToFile(logMessage) {
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
  },

  // Flushes all cached log messages to console.
  flush() {
    if (this._logCache.length > 0) {
      this._logCache.forEach((entry) => {
        const color = COLORS[entry.level] || "";
        console.log(color + entry.message + COLORS.RESET);
      });
      this._logCache = [];
    }
  },

  // Starts the flush interval timer if caching is enabled.
  _startFlushInterval() {
    if (!this.isDebug && !this._flushTimer) {
      this._flushTimer = setInterval(() => {
        this.flush();
      }, DEFAULT_FLUSH_INTERVAL);
    }
  },

  // Stops the flush interval timer.
  _stopFlushInterval() {
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
  },

  // Allows users to set a custom log level.
  setLevel(newLevel) {
    this.level = newLevel;
  },

  // Allows users to set a custom log file output path.
  setPath(filePath) {
    this.logFilePath = filePath;
  },

  // Logging methods
  log(...args) {
    this._writeLog("LOG", args);
    if (!this.isDebug) this._startFlushInterval();
  },

  info(...args) {
    this._writeLog("INFO", args);
    if (!this.isDebug) this._startFlushInterval();
  },

  warn(...args) {
    this._writeLog("WARN", args);
    if (!this.isDebug) this._startFlushInterval();
  },

  error(...args) {
    this._writeLog("ERROR", args);
    if (!this.isDebug) this._startFlushInterval();
  },
};

module.exports = Object.assign(logger, LEVELS);
