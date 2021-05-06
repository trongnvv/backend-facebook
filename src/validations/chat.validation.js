const Joi = require('joi');
const mongoose = require('mongoose');
const isObjectId = (value, helpers) => {
  if (mongoose.Types.ObjectId.isValid(value)) return true;
  return helpers.message('Invalid objectId')
};

module.exports = {
  seen: Joi.object({
    psid: Joi.string().required(),
    pageID: Joi.custom(isObjectId),
  }),
  sendOrder: Joi.object({
    commentFBID: Joi.string().required(),
    text: Joi.string().required(),
  }),
  sendOverall: Joi.object({
    psid: Joi.string().required(),
    pageID: Joi.custom(isObjectId),
    text: Joi.string().required(),
  }),
  fetchMessages: Joi.object({
    conversationID: Joi.string().required(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(10),
    isClone: Joi.string()
  }),
  getConversations: Joi.object({
    pageID: Joi.custom(isObjectId).required(),
    after: Joi.string(),
    before: Joi.string(),
  }),
  getMessages: Joi.object({
    pageID: Joi.custom(isObjectId).required(),
    conversationID: Joi.string().required(),
    after: Joi.string(),
    before: Joi.string(),
  }),
  getMessageDetail: Joi.object({
    pageID: Joi.custom(isObjectId).required(),
    psid: Joi.string().required(),
    after: Joi.string(),
    before: Joi.string(),
  })
};
