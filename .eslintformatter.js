/* eslint-disable no-unused-vars, no-console */

const chalk = require('chalk');

function extractShortcutFilePath(filePath) {
  const DIRNAME = `${__dirname}/`;
  return filePath.replace(DIRNAME, '');
}

module.exports = results => {
  results.forEach(result => {
    const {
      filePath,
      messages,
      errorCount,
      warningCount,
      fixableErrorCount,
      fixableWarningCount,
    } = result;
    if (messages.length) {
      console.log(
        `${chalk.black.bgWhite(extractShortcutFilePath(filePath))} ${chalk.bold(
          `${chalk.red(
            `${fixableErrorCount}/${errorCount} errors`,
          )} ${chalk.yellow(
            `${fixableWarningCount}/${warningCount} warnings`,
          )}`,
        )}`,
      );
      messages.forEach((message, index) => {
        const {
          ruleId,
          severity,
          message: msg,
          line,
          column,
          nodeType,
          endLine,
          endColumn,
          fix,
        } = message;
        if (severity === 1) {
          console.log(
            chalk.bold(`  Line ${line}: ${msg} ${chalk.yellow(ruleId)}`),
          );
        } else {
          console.log(
            chalk.bold(`  Line ${line}: ${msg} ${chalk.red(ruleId)}`),
          );
        }
        if (index + 1 === messages.length) console.log('\n');
      });
    }
  });
};
