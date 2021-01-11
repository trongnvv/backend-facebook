var HttpStatus = require('http-status-codes');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');

module.exports = function (output, req, res, next) {
  const { success } = output;
  const { tracer } = req;

  if (success) {
    return res.json({ ...output });
  }

  if (tracer) {
    const { url, headers, method } = req;
    const parentSpanContext = tracer.extract(
      FORMAT_HTTP_HEADERS,
      headers
    );
    const span = tracer.startSpan(
      `HTTP ${method} /${url.trim().split('/')[4]}`,
      {
        childOf: parentSpanContext,
      }
    );
    span.setTag(Tags.HTTP_URL, url);

    if (statusCode >= 400) {
      span.setTag(Tags.ERROR, true);
      span.log({ event: output });
    }
    span.setTag(Tags.HTTP_STATUS_CODE, statusCode);
    span.finish();
  }

  const statusCode =
    success
      ? HttpStatus.OK : output.code
        ? output.code : output.status
          ? output.status : output.response
            ? output.response.status : HttpStatus.INTERNAL_SERVER_ERROR;


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
