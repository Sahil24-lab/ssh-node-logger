# ssh-node-logger

A `npm-package` logger utility that can be switched between development and production modes.

## Summary

- The package auto-detects logging mode based on `NODE_ENV` so you don't need to manually set a flag in each file.
- Log rotation renames the log file when it exceeds a predefined size (1MB), and caching buffers log messages in production for periodic flushing.
- Follow the instructions below to test and integrate the package into your project.

### Features:

- Built-in log rotation.
- Colorized log messages.
- Four log levels with custom output.
- Caching log messages.

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
