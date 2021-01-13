const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const docs =
  process.env.NODE_ENV !== 'local'
    ? require('./swagger.server.json')
    : require('./swagger.json');

module.exports = (app) => {
  app.get('/trongnv', (req, res, next) => {
    req.session.auth = true;
    res.send('Save done!');
  });
  // const swaggerDefinition = require('./config/docs');
  const swaggerSpec = swaggerJSDoc(docs);
  app.use('/docs', swaggerUi.serve);
  app.get('/docs', (req, res, next) => {
    if (req.session.auth) next();
    else res.send('un-authenticate!')
  }, swaggerUi.setup(swaggerSpec));
};

