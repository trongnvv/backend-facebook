const Joi = require('joi');

module.exports = {
  saveToken: Joi.object({
    accessToken: Joi.string().required(),
  }),
  verifyToken: Joi.object({
    accessToken: Joi.string().required(),
  }),
  removeAccount: Joi.object({
    id: Joi.string().required(),
  }),
  getPages: Joi.object({
    id: Joi.string().required(),
    isClone: Joi.string()
  }),
  subscribe: Joi.object({
    pageID: Joi.string().required(),
  }),
  live: Joi.object({
    userFacebookID: Joi.string(),
    pageID: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
  }),
  campaign: Joi.object({
    ids: Joi.array().required(),
    title: Joi.string(),
    description: Joi.string(),
  }),
};
