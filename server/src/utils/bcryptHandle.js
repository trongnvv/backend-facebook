const bcrypt = require('bcrypt');

module.exports = {
  encrypt: (plaintext) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(plaintext, 10, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
  },
  compare: (plaintext, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plaintext, hash, function (err, res) {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
};