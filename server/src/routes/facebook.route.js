const router = require("express").Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require("../utils");
const facebookValid = require("../validations/facebook.validation");
const facebookMid = require("../middleware/facebook");
const accountCtrl = require("../controllers/account-fb.controller");
const campaignCtrl = require("../controllers/campaign.controller");
const commentCtrl = require("../controllers/comment.controller");
const liveCtrl = require("../controllers/live.controller");
const webhookCtrl = require("../controllers/webhooks.controller");

router.get("/webhooks", webhookCtrl.verifyWebhooks);
router.post("/webhooks", webhookCtrl.receiveWebhooks, respond);

router.post(
  "/save-token",
  isAuthenticated,
  validateInput(facebookValid.saveToken),
  facebookMid.checkExist,
  wrapController(accountCtrl.saveToken),
  respond
);

router.post(
  "/verify-token",
  isAuthenticated,
  validateInput(facebookValid.verifyToken),
  wrapController(accountCtrl.getCheckAccessToken),
  respond
);

router.get(
  "/accounts",
  isAuthenticated,
  wrapController(accountCtrl.getFacebooks),
  respond
);

router.delete(
  "/accounts/:id", // user fb id
  isAuthenticated,
  validateInput(facebookValid.removeAccount),
  wrapController(accountCtrl.removeAccount),
  respond
);

router.get(
  "/pages",
  isAuthenticated,
  validateInput(facebookValid.getPages),
  facebookMid.checkGetPages,
  wrapController(accountCtrl.getListPage),
  respond
);

router.post(
  "/pages/subscribe",
  isAuthenticated,
  validateInput(facebookValid.subscribe),
  wrapController(accountCtrl.subscribe),
  respond
);

router.post(
  "/pages/un-subscribe",
  isAuthenticated,
  validateInput(facebookValid.subscribe),
  wrapController(accountCtrl.unSubscribe),
  respond
);
router.get(
  "/live",
  isAuthenticated,
  wrapController(liveCtrl.getLive),
  respond
);

router.post(
  "/live/:id/comment",
  isAuthenticated,
  validateInput(facebookValid.comment),
  wrapController(liveCtrl.livePushCommentFB),
  respond
);

router.put(
  "/live-finish/:id",
  isAuthenticated,
  wrapController(liveCtrl.finishLive),
  respond
);
router.get(
  "/campaign/all",
  isAuthenticated,
  wrapController(campaignCtrl.getAllCampaign),
  respond
);

router.get(
  "/campaign",
  isAuthenticated,
  wrapController(campaignCtrl.getCampaign),
  respond
);

router.post(
  "/campaign",
  isAuthenticated,
  validateInput(facebookValid.campaign),
  wrapController(campaignCtrl.createLiveMulti),
  respond
);

router.post(
  "/campaign/:id/live-finish",
  isAuthenticated,
  wrapController(campaignCtrl.finishLiveCampaign),
  respond
);

router.post(
  "/campaign/:id/comment",
  isAuthenticated,
  validateInput(facebookValid.comment),
  wrapController(campaignCtrl.campaignPushCommentToFB),
  respond
);

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
