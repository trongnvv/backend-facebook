const router = require("express").Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require("../utils");

const chatValid = require("../validations/chat.validation");
const chatCtrl = require("../controllers/chat.controller");
const { sendOrder, sendOverall } = require("../middlewares/send-message");

router.post(
  '/send/seen',
  validateInput(chatValid.seen),
  isAuthenticated,
  wrapController(chatCtrl.seen),
  respond
);

router.post(
  '/send/order',
  validateInput(chatValid.sendOrder),
  isAuthenticated,
  sendOrder,
  wrapController(chatCtrl.sendOrder),
  respond
);

router.post(
  '/send/overall',
  validateInput(chatValid.sendOverall),
  isAuthenticated,
  sendOverall,
  wrapController(chatCtrl.sendOverall),
  respond
);

router.get( // list conversations of page
  '/:pageID/conversations',
  validateInput(chatValid.getConversations),
  isAuthenticated,
  wrapController(chatCtrl.getConversations),
  respond
);

router.get( // list messages of conversation
  '/:pageID/messages',
  validateInput(chatValid.getMessages),
  isAuthenticated,
  wrapController(chatCtrl.getMessages),
  respond
);

router.get( // list messages of conversation
  '/:pageID/messages/:psid',
  validateInput(chatValid.getMessageDetail),
  isAuthenticated,
  wrapController(chatCtrl.getMessageDetail),
  respond
);


module.exports = router;
