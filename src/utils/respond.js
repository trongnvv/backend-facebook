module.exports = (req, res, next) => {
  next({
    success: true,
    data: req.data,
    message: req.message ? req.message : null
  })
};
