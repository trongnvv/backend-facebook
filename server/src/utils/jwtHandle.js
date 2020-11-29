const jwt = require('jsonwebtoken');

const options = {
  expiresIn: '72h',
  // algorithm: 'RS256',
};

module.exports = {
  sign: (payload, expiresIn) => {
    if (expiresIn) options.expiresIn = expiresIn;
    return jwt.sign(payload, 'trongnv', options);
  },
  verify: (token, expiresIn) => {
    try {
      if (expiresIn) options.expiresIn = expiresIn;
      return jwt.verify(token, 'trongnv', options);
    } catch (error) {
      if (error['TokenExpiredError:']) return { error: 'Token has expired' };
      return { error };
    }
  },

  decode: (token) => {
    return jwt.decode(token, { complete: true });
  }
};
