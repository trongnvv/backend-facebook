'use strict';

var HttpStatus = require('http-status-codes');
module.exports = module.exports.default = function (output, req, res, next) {
  const { success } = output;
  
  if (success) {
    return res.json({ ...output });
  }

  const statusCode =
    success
      ? HttpStatus.OK
      : output.code
        ? output.code
        : output.status
          ? output.status
          : output.response
            ? output.response.status
            : HttpStatus.INTERNAL_SERVER_ERROR;


  const message = output.response
    ? output.response.data.message
    : output.message;
  const errors = output.error
    ? output.error
    : output.response
      ? output.response.data.errors
      : output.errors
        ? output.errors
        : output.stack;
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
