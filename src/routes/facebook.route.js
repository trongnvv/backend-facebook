const router = require("express").Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require("../utils");
const facebookValid = require("../validations/facebook.validation");
const facebookMid = require("../middleware/facebook");
const accountCtrl = require("../controllers/account-fb.controller");
const webhookCtrl = require("../controllers/webhooks.controller");

router.get("/webhooks", webhookCtrl.verifyWebhooks);
router.post("/webhooks", webhookCtrl.receiveWebhooks, respond);

router.post(
  "/accounts",
  isAuthenticated,
  validateInput(facebookValid.saveToken),
  facebookMid.checkExist,
  wrapController(accountCtrl.saveToken),
  respond
);

router.get(
  "/accounts",
  isAuthenticated,
  wrapController(accountCtrl.getFacebooks),
  respond
);

router.delete(
  "/accounts/:id",
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

router.get(
  "/pages",
  isAuthenticated,
  validateInput(facebookValid.getPages),
  facebookMid.checkGetPages,
  wrapController(accountCtrl.getListPage),
  respond
);


module.exports = router;
