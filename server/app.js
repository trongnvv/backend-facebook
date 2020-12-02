const http = require('http');
const debug = require('debug')('demo:server');
require('dotenv').config();
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { errorHandle } = require('./src/utils');
const routers = require('./src/routes');
const express = require('express');
const cors = require('cors');
const hub = require('express-x-hub');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(hub({ algorithm: 'sha1', secret: process.env.FB_APP_SECRET }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'trongnv',
    resave: true,
    saveUninitialized: true,
  }),
);

global.clientConnection = require('./config/db');
app.use((req, _, next) => {
  req.db = global.clientConnection.useDb(process.env.PREFIX_DB);
  next();
});

app.get('/trongnv', (req, res, next) => {
  req.session.auth = true;
  res.send('Save done!');
});
const swaggerDefinition = require('./config/docs');
const swaggerSpec = swaggerJSDoc(swaggerDefinition);
app.use('/docs', swaggerUi.serve);
app.get('/docs', (req, res, next) => {
  if (req.session.auth) next();
  else res.send('un-authenticate!')
}, swaggerUi.setup(swaggerSpec));

app.use(logger('dev'));
app.use(routers);
app.use(errorHandle);

const PORT = normalizePort(process.env.PORT || '4000');
app.set('PORT', PORT);
const server = http.createServer(app);
server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

require('./src/services/socket').connect(io);
global.io = io;

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  // eslint-disable-next-line no-console
  console.log(
    `Listening on http://localhost:${addr.port}`,
  );
  debug(`Listening on ${bind}`);
}
