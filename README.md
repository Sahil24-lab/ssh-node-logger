[![npm version](https://badge.fury.io/js/ssh-node-logger.svg)](https://www.npmjs.com/package/ssh-node-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E=14-green.svg)](https://nodejs.org)

# ssh-node-logger

A zero-dependency `npm-package` logger utility for Node.js with built-in log rotation, environment-aware output, and optional caching for production use.

## Summary

- The package auto-detects logging mode based on `NODE_ENV` so you don't need to manually set a flag in each file.
- Log rotation renames the log file when it exceeds a predefined size (1MB), and caching buffers log messages in production for periodic flushing.
- Follow the instructions below to test and integrate the package into your project.

### Features:

- Automatic detection of logging mode via `NODE_ENV`
- Log rotation when file exceeds 1MB
- Colorized console output
- Caching in production for efficient writes
- Four log levels: `LOG`, `INFO`, `WARN`, `ERROR`
- Customizable log path and log level

## Install

Install with npm or yarn:

```
npm install ssh-node-logger
```

or

```
yarn add ssh-node-logger
```

## Usage

```js
var logger = require("ssh-node-logger");

// Basic log messages
logger.log("normal log message");
logger.warn("warning message");
logger.error("bad error message");
logger.info("success message");

// Toggle immediate logging or caching.
// When isDebug is true, messages are output immediately.
// When false, messages are cached and flushed at intervals.
logger.isDebug = true;
logger.isDebug = false;

// Set custom log level. Available levels are:
// logger.LOG < logger.INFO < logger.WARN < logger.ERROR
logger.setLevel(logger.INFO);

// Set custom log output path
logger.setPath("path/to/your/logfile.log");
```

## Contributing

Contributions are welcome. Submit issues or pull requests.

## License

MIT License
