const Joi = require('joi');

module.exports = {
  register: Joi.object({
    username: Joi.string().min(3).max(40).required().label('Username'),
    password: Joi.string().min(6).max(30).required().label("Password"),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm password')
  }),
  login: Joi.object({
    username: Joi.string().label('Username'),
    password: Joi.string().min(6).max(30).required().label("Password"),
  })
};
