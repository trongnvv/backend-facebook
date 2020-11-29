const router = require('express').Router();
const authRoute = require('./auth.route');
const fbRoute = require('./facebook.route');

router.get('/ping', async (req, res) => {
  res.json({ name: 'Service are running...', ping: 'PONG' });
});

router.use('/', authRoute);
router.use('/facebook', fbRoute);

module.exports = router;
