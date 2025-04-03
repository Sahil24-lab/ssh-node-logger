# ssh-node-logger

A `npm-package` logger utility that can be switched between development and production modes.

Features:

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

---



**.gitignore**

```gitignore
node_modules/
*.log
coverage/

```
