const router = require("express").Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require("../utils");
const facebookValid = require("../validations/facebook.validation");
const campaignCtrl = require("../controllers/campaign.controller");

router.get(
  "/search",
  isAuthenticated,
  wrapController(campaignCtrl.getAllCampaign),
  respond
);

router.get(
  "/",
  isAuthenticated,
  wrapController(campaignCtrl.getCampaign),
  respond
);

router.post(
  "/",
  isAuthenticated,
  validateInput(facebookValid.campaign),
  wrapController(campaignCtrl.createLiveMulti),
  respond
);

router.post(
  "/:id/live-finish",
  isAuthenticated,
  wrapController(campaignCtrl.finishLiveCampaign),
  respond
);

router.post(
  "/:id/comment",
  isAuthenticated,
  validateInput(facebookValid.comment),
  wrapController(campaignCtrl.campaignPushCommentToFB),
  respond
);

module.exports = router;
