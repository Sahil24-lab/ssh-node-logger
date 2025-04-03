"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// test/logger.test.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../lib/logger"));
describe("ssh-node-logger tests", () => {
    beforeEach(() => {
        // Reset logger properties for each test.
        logger_1.default.level = logger_1.default.LOG;
        logger_1.default.isDebug = true;
        logger_1.default._logCache = [];
        if (logger_1.default._flushTimer) {
            clearInterval(logger_1.default._flushTimer);
            logger_1.default._flushTimer = null;
        }
        logger_1.default.logFilePath = null;
    });
    test("logs message with log level LOG", () => {
        console.log = jest.fn();
        logger_1.default.log("Test log message");
        expect(console.log).toHaveBeenCalled();
    });
    test("warn logs message with WARN level", () => {
        console.warn = jest.fn();
        logger_1.default.warn("Test warn message");
        expect(console.warn).toHaveBeenCalled();
    });
    test("error logs message with ERROR level", () => {
        console.error = jest.fn();
        logger_1.default.error("Test error message");
        expect(console.error).toHaveBeenCalled();
    });
    test("setLevel filters logs", () => {
        console.log = jest.fn();
        logger_1.default.setLevel(logger_1.default.INFO);
        logger_1.default.log("Should not appear");
        logger_1.default.info("Should appear");
        expect(console.log).toHaveBeenCalledTimes(1);
    });
    test("caching logs when isDebug is false", () => {
        logger_1.default.isDebug = false;
        console.log = jest.fn();
        logger_1.default.log("Cached log message");
        expect(logger_1.default._logCache.length).toBe(1);
        logger_1.default.flush();
        expect(logger_1.default._logCache.length).toBe(0);
        expect(console.log).toHaveBeenCalled();
    });
    test("log rotation works", () => {
        // Create a temporary file path.
        const tmpPath = path_1.default.join(__dirname, "test.log");
        if (fs_1.default.existsSync(tmpPath))
            fs_1.default.unlinkSync(tmpPath);
        logger_1.default.setPath(tmpPath);
        // Write a large log to exceed the max size.
        const bigMessage = "a".repeat(1024 * 1024);
        logger_1.default.isDebug = true;
        logger_1.default.log(bigMessage);
        // Write another log to trigger rotation.
        logger_1.default.log("Another log message");
        // Check that the log file exists.
        expect(fs_1.default.existsSync(tmpPath)).toBe(true);
        // Cleanup: remove the test log file.
        fs_1.default.unlinkSync(tmpPath);
        // Remove any rotated files that start with 'test.log.'
        const files = fs_1.default.readdirSync(__dirname);
        files.forEach((file) => {
            if (file.startsWith("test.log.")) {
                fs_1.default.unlinkSync(path_1.default.join(__dirname, file));
            }
        });
    });
});
