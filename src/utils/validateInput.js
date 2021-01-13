var HttpStatus = require('http-status-codes');

const optsErr = (error) => ({
  success: false,
  code: HttpStatus.UNPROCESSABLE_ENTITY,
  message: HttpStatus.getStatusText(HttpStatus.UNPROCESSABLE_ENTITY),
  error,
});

module.exports = (schema) => {
  return (req, res, next) => {
    const { body, params, query, jaeger } = req;
    const errors = {};
    try {
      const { value, error } = schema.validate({
        ...body,
        ...params,
        ...query,
      });

      if (error) {
        const { details } = error;
        details.map((index) => {
          const name = index.path[0];
          const message = index.message.replace(/"/g, '');
          if (errors[name] == null) {
            errors[name] = message;
          }
        });
        next(optsErr(errors));
      }
      return next();
    } catch (err) {
      next(optsErr(err));
    }
  };
};