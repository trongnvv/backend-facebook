const errorHandle = require('../src/middleware/errorHandle');
const routers = require('../src/routes');
const app = require('../app');

app.use(routers);
app.use(errorHandle);

module.exports = app;
