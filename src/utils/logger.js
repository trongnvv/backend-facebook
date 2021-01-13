const logger4js = {
  appenders: {
    out: { type: 'stdout' },
    debug: {
      type: 'dateFile',
      filename: 'logs/debug/debug_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true,
    },
    'debug-filter': {
      type: 'logLevelFilter',
      appender: 'debug',
      level: 'debug',
      maxLevel: 'debug',
    },
    result: {
      type: 'dateFile',
      filename: 'logs/result/result_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true,
    },
    'result-filter': {
      type: 'logLevelFilter',
      appender: 'result',
      level: 'info',
      maxLevel: 'info',
    },
    error: {
      type: 'dateFile',
      filename: 'logs/error/error_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true,
    },
    'error-filter': {
      type: 'logLevelFilter',
      appender: 'error',
      level: 'error',
      maxLevel: 'error',
    },
    default: {
      type: 'dateFile',
      filename: 'logs/default/default_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true,
    },
    warn: {
      type: 'dateFile',
      filename: 'logs/warn/warn_file',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      keepFileExt: true,
    },
    'warn-filter': {
      type: 'logLevelFilter',
      appender: 'warn',
      level: 'warn',
      maxLevel: 'warn',
    },
  },
  categories: {
    default: {
      appenders: [
        'out',
        'default',
        'debug-filter',
        'result-filter',
        'debug-filter',
        'error-filter',
        'warn-filter',
      ],
      level: 'trace',
    },
    debug: { appenders: ['debug', 'debug-filter'], level: 'debug' },
    result: {
      appenders: [
        'result-filter',
        'debug-filter',
        'error-filter',
        'warn-filter',
      ],
      level: 'debug',
    },
    error: { appenders: ['error', 'error-filter'], level: 'error' },
    warn: { appenders: ['warn', 'warn-filter'], level: 'warn' },
  },
};

const log4js = require('log4js');

log4js.configure(logger4js);
const logger = log4js.getLogger('dev');

module.exports = {
  log: logger,
  logger,
};
