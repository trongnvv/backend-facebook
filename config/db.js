const mongoose = require('mongoose');

require('../src/models');

const clientOption = {
  socketTimeoutMS: 10000,
  keepAlive: true,
  poolSize: 50,
  useNewUrlParser: true,
  autoIndex: false,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

const conn = mongoose.createConnection(process.env.MONGO_URI, clientOption);
// eslint-disable-next-line no-console
conn.on('error', console.error.bind(console, 'MongoDB Connection Error>> : '));
// eslint-disable-next-line func-names
conn.once('open', function () {
  // eslint-disable-next-line no-console
  console.log('client MongoDB Connection ok!');
});

module.exports = conn;
