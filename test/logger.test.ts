// test/logger.test.ts
import fs from "fs";
import path from "path";
import logger from "../src/logger";

describe("ssh-node-logger tests", () => {
  beforeEach(() => {
    // Reset logger properties for each test.
    logger.level = logger.LOG;
    logger.isDebug = true;
    (logger as any)._logCache = [];
    if ((logger as any)._flushTimer) {
      clearInterval((logger as any)._flushTimer);
      (logger as any)._flushTimer = null;
    }
    logger.logFilePath = null;
  });

  test("logs message with log level LOG", () => {
    console.log = jest.fn();
    logger.log("Test log message");
    expect(console.log).toHaveBeenCalled();
  });

  test("warn logs message with WARN level", () => {
    console.warn = jest.fn();
    logger.warn("Test warn message");
    expect(console.warn).toHaveBeenCalled();
  });

  test("error logs message with ERROR level", () => {
    console.error = jest.fn();
    logger.error("Test error message");
    expect(console.error).toHaveBeenCalled();
  });

  test("setLevel filters logs", () => {
    console.log = jest.fn();
    logger.setLevel(logger.INFO);
    logger.log("Should not appear");
    logger.info("Should appear");
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test("caching logs when isDebug is false", () => {
    logger.isDebug = false;
    console.log = jest.fn();
    logger.log("Cached log message");
    expect((logger as any)._logCache.length).toBe(1);
    logger.flush();
    expect((logger as any)._logCache.length).toBe(0);
    expect(console.log).toHaveBeenCalled();
  });

  test("log rotation works", () => {
    // Create a temporary file path.
    const tmpPath = path.join(__dirname, "test.log");
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    logger.setPath(tmpPath);
    // Write a large log to exceed the max size.
    const bigMessage = "a".repeat(1024 * 1024);
    logger.isDebug = true;
    logger.log(bigMessage);
    // Write another log to trigger rotation.
    logger.log("Another log message");
    // Check that the log file exists.
    expect(fs.existsSync(tmpPath)).toBe(true);
    // Cleanup: remove the test log file.
    fs.unlinkSync(tmpPath);
    // Remove any rotated files that start with 'test.log.'
    const files = fs.readdirSync(__dirname);
    files.forEach((file) => {
      if (file.startsWith("test.log.")) {
        fs.unlinkSync(path.join(__dirname, file));
      }
    });
  });
});
