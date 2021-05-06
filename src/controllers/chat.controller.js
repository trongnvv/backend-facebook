const hsc = require('http-status-codes');
const { get } = require('lodash');
const facebookService = require('../services/facebook.service');
const { HOST_CHAT_BACKEND } = require("../../config");
// TODO create facebookSDK
const facebookSDK = {
  getPageAccessToken: () => { },
  getPageInfo: () => { },
}
const seen = async (req, res, next) => {
  const { psid, pageID } = req.body;
  const accessToken = await facebookSDK.getPageAccessToken(req, pageID);

  const params = {
    access_token: accessToken,
    recipient: { id: psid },
    "sender_action": "mark_seen"
  }
  const rs = await facebookService.sendStandard(params);
  if (rs.error) {
    return next({
      status: hsc.BAD_REQUEST,
      message: get(rs.error, 'message', 'Seen message error!')
    })
  }
}

const sendOverall = async (req, res, next) => {
  const { text, psid } = req.body;
  const { accessToken, isTag } = req.mid;
  const params = {
    access_token: accessToken,
    message: {
      text
    },
    recipient: { id: psid }
  }

  let rs = {};
  console.log("isTag", isTag);
  if (isTag) {
    params.messaging_type = 'MESSAGE_TAG'
    params.tag = 'CONFIRMED_EVENT_UPDATE';
  }
  rs = await facebookService.sendStandard(params);
  if (rs.error) {
    return next({
      status: hsc.BAD_REQUEST,
      message: get(rs.error, 'message', 'Send message error!')
    })
  }
}

const sendOrder = async (req, res, next) => {
  const { commentFBID, text } = req.body;
  const { psid, accessToken, isPrivate, isTag } = req.mid;

  const params = {
    access_token: accessToken,
    message: {
      text
    }
  }

  let rs = {};

  if (psid && !isPrivate) {
    if (isTag) {
      params.messaging_type = 'MESSAGE_TAG'
      params.tag = 'CONFIRMED_EVENT_UPDATE';
    }
    params.recipient = { id: psid }
    rs = await facebookService.sendStandard(params);
    if (!rs.error) return;
  }

  delete params.messaging_type;
  delete params.tag;
  params.recipient = { comment_id: commentFBID }
  rs = await facebookService.sendPrivateReply(params);
  if (rs.error) {
    return next({
      status: hsc.BAD_REQUEST,
      message: get(rs.error, 'message', 'Send message error!')
    })
  }
}

const getConversations = async (req, res, next) => {
  const { pageID } = req.params;
  const { before, after } = req.query;
  const page = await facebookSDK.getPageInfo(req, pageID);
  const rs = await facebookService.fetchConversations({
    after,
    before,
    accessToken: page.accessToken,
    pageFBID: page.pageFacebookID
  });
  if (rs.error) {
    return next({
      status: hsc.BAD_REQUEST,
      message: get(rs.error, 'message', 'Get conversations fail')
    })
  }
  const results = await Promise.all(rs.data.map((v => {
    const participants = v.participants &&
      v.participants.data &&
      v.participants.data.length > 0 &&
      v.participants.data.filter(p => p.id != page.pageFacebookID)
    return {
      snippet: v.snippet,
      unreadCount: v.unread_count,
      messageCount: v.message_count,
      link: `https://facebook.com/${v.link}`,
      updatedTime: v.updated_time,
      conversationID: v.id,
      customer: participants && participants.length > 0 && participants[0].name,
      psid: participants && participants.length > 0 && participants[0].id
    }
  })))
  const paging = {};
  if (rs.paging) {
    if (rs.paging.next) {
      // after
      const params = new URLSearchParams(rs.paging.next);
      paging.next = `${HOST_CHAT_BACKEND}/${pageID}/conversations?after=${params.get("after")}`
    }
    if (rs.paging.previous) {
      // before
      const params = new URLSearchParams(rs.paging.previous);
      paging.previous = `${HOST_CHAT_BACKEND}/${pageID}/conversations?before=${params.get("before")}`
    }
  }
  return { results, paging };
}

const getMessages = async (req, res, next) => {
  const { pageID } = req.params;
  const { before, after, conversationID } = req.query;
  const accessToken = await facebookSDK.getPageAccessToken(req, pageID);
  const rs = await facebookService.fetchMessages({
    accessToken,
    before,
    after,
    conversationID
  });
  if (rs.error) {
    return next({
      status: hsc.BAD_REQUEST,
      message: get(rs.error, 'message', 'Get messages fail')
    })
  }
  const results = await Promise.all(rs.data.map(m => {
    return {
      message: m.message,
      createdTime: m.created_time,
      from: m.from,
      id: m.id,
      attachments: get(m, 'attachments.data')
    }
  }))
  const paging = {};
  if (rs.paging) {
    if (rs.paging.next) {
      // after
      const params = new URLSearchParams(rs.paging.next);
      paging.next = `${HOST_CHAT_BACKEND}/${pageID}/messages?conversationID=${conversationID}&after=${params.get("after")}`
    }
    if (rs.paging.previous) {
      // before
      const params = new URLSearchParams(rs.paging.previous);
      paging.previous = `${HOST_CHAT_BACKEND}/${pageID}/messages?conversationID=${conversationID}&before=${params.get("before")}`
    }
  }
  return { results, paging };
}


const getMessageDetail = async (req, res, next) => {
  const { pageID, psid } = req.params;
  const page = await facebookSDK.getPageInfo(req, pageID);

  const rs = await facebookService.fetchMessagesByPSID({
    accessToken: page.accessToken,
    psid,
    pageFBID: page.pageFacebookID
  })
  if (rs.error) {
    return {
      conversationID: 'unknown',
      messages: [],
      pagePicture: page.picture
    };
  }
  const messages = rs.messages;
  const results = await Promise.all(messages.data.map(m => {
    return {
      message: m.message,
      createdTime: m.created_time,
      from: m.from,
      id: m.id,
      attachments: get(m, 'attachments.data')
    }
  }))
  const paging = {};
  if (messages.paging) {
    if (messages.paging.next) {
      // after
      const params = new URLSearchParams(messages.paging.next);
      paging.next = `${HOST_CHAT_BACKEND}/${pageID}/messages?conversationID=${rs.conversationID}&after=${params.get("after")}`
    }
    if (messages.paging.previous) {
      // before
      const params = new URLSearchParams(messages.paging.previous);
      paging.previous = `${HOST_CHAT_BACKEND}/${pageID}/messages?conversationID=${rs.conversationID}&before=${params.get("before")}`
    }
  }
  return { ...rs, messages: results, paging, pagePicture: page.picture };
}
module.exports = {
  seen,
  sendOrder,
  sendOverall,
  getConversations,
  getMessages,
  getMessageDetail,
}