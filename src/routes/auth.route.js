const router = require('express').Router();
const { isAuthenticated } = require('../middleware');
const { validateInput, respond, wrapController } = require('../utils');
const { register, login } = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');

router.post('/register',
  validateInput(register),
  wrapController(authController.register),
  respond
);

router.post('/login',
  validateInput(login),
  wrapController(authController.login),
  respond
);

router.post('/logout',
  isAuthenticated,
  wrapController(authController.logout),
  respond
);

router.get('/user/info',
  isAuthenticated,
  wrapController(authController.getUserInfo),
  respond
);

module.exports = router;
