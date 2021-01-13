module.exports = (controller) => {
  return (req, res, next) => {
    controller(req, res, next)
      .then((result) => {
        req.data = result;
        next();
      })
      .catch(next);
  }
}