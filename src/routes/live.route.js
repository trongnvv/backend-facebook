const router = require("express").Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require("../utils");
const facebookValid = require("../validations/facebook.validation");
const liveCtrl = require("../controllers/live.controller");

router.get(
  "/",
  isAuthenticated,
  wrapController(liveCtrl.getLive),
  respond
);

router.post(
  "/:id/comment",
  isAuthenticated,
  validateInput(facebookValid.comment),
  wrapController(liveCtrl.livePushCommentFB),
  respond
);

router.put(
  "/:id/finish",
  isAuthenticated,
  wrapController(liveCtrl.finishLive),
  respond
);

module.exports = router;
