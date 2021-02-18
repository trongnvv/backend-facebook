const router = require("express").Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require("../utils");
const facebookValid = require("../validations/facebook.validation");
const commentCtrl = require("../controllers/comment.controller");

router.get(
  '/',
  isAuthenticated,
  wrapController(commentCtrl.getComments),
  respond
);

router.post(
  "/:id/reply",
  isAuthenticated,
  validateInput(facebookValid.comment),
  wrapController(commentCtrl.pushCommentFB),
  respond
);

module.exports = router;
