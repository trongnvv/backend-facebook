const docs =
  process.env.NODE_ENV !== 'local'
  ? require('./swagger.server.json')
  : require('./swagger.json');

module.exports = docs;
