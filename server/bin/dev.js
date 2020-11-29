require('dotenv').config();
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { errorHandle } = require('../src/utils');
const routers = require('../src/routes');
const app = require('../app');
const swaggerDefinition = require('../config/docs');

/**
 *  initialize swagger-jsdoc
 */
const swaggerSpec = swaggerJSDoc(swaggerDefinition);
app.use(`/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 *  Logging Http Request.
 */
app.use(logger('dev'));

/**
 *  Import routes, event handle
 */
app.use(routers);
app.use(errorHandle);

module.exports = app;
