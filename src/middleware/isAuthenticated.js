"use strict";
const HttpStatus = require("http-status-codes");
const mongoose = require('mongoose');
const { errorCustom, jwtHandle } = require('../utils');
module.exports = module.exports.default = async (req, res, next) => {
  try {
    const User = req.db.model('User');
    const { authorization } = req.headers;
    // require auth headers
    if (!authorization) throw new errorCustom(HttpStatus.FORBIDDEN, 'Access token invalid');
    // validate type
    const [tokenType, accessToken] = authorization.split(' ');
    if (tokenType !== 'Bearer') throw new errorCustom(HttpStatus.BAD_REQUEST, 'Access token invalid');
    // verify token
    const data = await jwtHandle.verify(accessToken);
    const { userID, iat, exp } = data;
    if (!userID || iat > exp) throw new errorCustom(HttpStatus.UNAUTHORIZED, 'Access token expired');
    // check logout
    const user = await User.findOne({ _id: mongoose.Types.ObjectId(userID) });
    if (!user || !user.accessToken) throw new errorCustom(HttpStatus.UNAUTHORIZED, 'Account logged out');
    req.user = { userID, username: user.username };
    next();
  } catch (error) {
    next({
      success: false,
      code: error.code || HttpStatus.BAD_REQUEST,
      status: error.code || HttpStatus.BAD_REQUEST,
      message: error.message,
    });
  }
};
