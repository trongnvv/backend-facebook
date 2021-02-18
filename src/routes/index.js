const router = require('express').Router();
const authRoute = require('./auth.route');
const fbRoute = require('./facebook.route');
const campRoute = require('./campaign.route');
const liveRoute = require('./live.route');
const commentRoute = require('./comment.route');

router.get('/ping', async (req, res) => {
  res.json({ name: 'Service are running...', ping: 'PONG' });
});

router.use('/', authRoute);
router.use('/campaigns', campRoute);
router.use('/live', liveRoute);
router.use('/facebook', fbRoute);
router.use('/comments', commentRoute);

module.exports = router;
