const express = require('express');
const cors = require('cors');
const hub = require('express-x-hub');
const { Kafka } = require('kafkajs');

const app = express();
app.use(cors());
app.use(hub({ algorithm: 'sha1', secret: process.env.FB_APP_SECRET }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

global.clientConnection = require('./config/db');
const { getKBroker } = require('./src/services/kafka.service');
const kafka = new Kafka({
  clientId: 'fb-backend',
  brokers: [...getKBroker()],
});

global.producer = kafka.producer();

app.use((req, _, next) => {
  req.db = global.clientConnection.useDb(process.env.PREFIX_DB);
  next();
});

module.exports = app;
