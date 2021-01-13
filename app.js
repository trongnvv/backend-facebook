require('dotenv').config();
const logger = require('morgan');
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

require('./config/docs')(app);
global.clientConnection = require('./config/db');
app.use((req, _, next) => {
  req.db = global.clientConnection.useDb(process.env.PREFIX_DB);
  next();
});
app.use(logger('dev'));
app.use(routers);
app.use(errorHandle);

module.exports = app;