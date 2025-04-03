"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
// src/logger.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["LOG"] = 0] = "LOG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
const COLORS = {
    LOG: "\x1b[37m",
    INFO: "\x1b[32m",
    WARN: "\x1b[33m",
    ERROR: "\x1b[31m" // red
};
const RESET = "\x1b[0m";
const DEFAULT_FLUSH_INTERVAL = 5000; // flush cache every 5 seconds
const MAX_LOG_FILE_SIZE = 1024 * 1024; // 1MB
// Auto-detect environment: if NODE_ENV is "development" or "local", immediate logging is enabled.
const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "local";
class Logger {
    constructor() {
        this.level = LogLevel.LOG;
        this.isDebug = isDev;
        this.logFilePath = null;
        this._logCache = [];
        this._flushTimer = null;
    }
    _formatMessage(levelStr, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] ${levelStr} - ${message}`;
    }
    _writeToFile(logMessage) {
        if (!this.logFilePath)
            return;
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
        }
        catch (err) {
            console.error("Failed to write log to file:", err);
        }
    }
    _startFlushInterval() {
        if (!this.isDebug && !this._flushTimer) {
            this._flushTimer = setInterval(() => {
                this.flush();
            }, DEFAULT_FLUSH_INTERVAL);
        }
    }
    _writeLog(levelKey, args) {
        if (LogLevel[levelKey] < this.level) {
            return;
        }
        const messageContent = args
            .map((arg) => {
            if (typeof arg === "object") {
                try {
                    return JSON.stringify(arg);
                }
                catch (e) {
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
            }
            else if (levelKey === "ERROR") {
                console.error(colored);
            }
            else {
                console.log(colored);
            }
        }
        else {
            this._logCache.push({ level: levelKey, message: formatted });
        }
        if (this.logFilePath) {
            this._writeToFile(formatted + "\n");
        }
    }
    log(...args) {
        this._writeLog("LOG", args);
        if (!this.isDebug)
            this._startFlushInterval();
    }
    info(...args) {
        this._writeLog("INFO", args);
        if (!this.isDebug)
            this._startFlushInterval();
    }
    warn(...args) {
        this._writeLog("WARN", args);
        if (!this.isDebug)
            this._startFlushInterval();
    }
    error(...args) {
        this._writeLog("ERROR", args);
        if (!this.isDebug)
            this._startFlushInterval();
    }
    flush() {
        if (this._logCache.length > 0) {
            this._logCache.forEach((entry) => {
                const color = COLORS[entry.level] || "";
                console.log(color + entry.message + RESET);
            });
            this._logCache = [];
        }
    }
    setLevel(newLevel) {
        this.level = newLevel;
    }
    setPath(filePath) {
        this.logFilePath = filePath;
    }
}
const logger = new Logger();
// Attach log level constants to the logger so users can refer to them as logger.LOG, etc.
exports.default = Object.assign(logger, LogLevel);
