// const { checkAuth } = require('../common/urlApi');
const { fetchAPI } = require("../utils");

const verifyJwtToken = (token) => {
  return fetchAPI(checkAuth, 'GET', { authorization: `Bearer ${token}` });
};

module.exports = {
  connect: async (io) => {
    io.on('connection', (socket) => {
      socket.on('authenticate', function (token) {
        verifyJwtToken(token)
          .then(async ({ data: userInfo }) => {
            const userId = userInfo.userId;
            if (userId) {
              socket.auth = true;
              socket.userId = userId;
              socket.token = data.token;
              socket.emit('authenticated_success', userId);
              socket.join(`user_${userId}`);
            }
          })
          .catch((err) => console.log('err -==========>>>> 54:', err.response.data));
      });

      socket.on('request_comment_live', function (liveID) {
        if (socket.auth) {
          socket.emit('request_comment_live_success', liveID);
          socket.join(`live_${liveID}`);
        } else {
          socket.emit('request_comment_live_error', liveID);
        }
      });

      socket.on('leave_live', function (liveID) {
        socket.emit('leave_live_success', liveID);
        socket.leave(`live_${liveID}`);
      });

      socket.on('request_comment_campaign', function (campaignID) {
        if (socket.auth) {
          socket.emit('request_comment_campaign_success', campaignID);
          socket.join(`campaign_${campaignID}`);
        } else {
          socket.emit('request_comment_campaign_error', campaignID);
        }
      });

      socket.on('leave_campaign', function (campaignID) {
        socket.emit('leave_campaign_success', campaignID);
        socket.leave(`campaign_${campaignID}`);
      });

      setTimeout(function () {
        if (!socket.auth) {
          console.log('[Unauthorized]', socket.id);
          socket.disconnect('unauthorized');
        }
      }, 60000);

      console.log('a user connected');
      socket.on('disconnect', function () {
        if (!socket.auth) {
          return;
        }
      });
    });
  },
  sendComment: async (userID, data) => {
    const io = global.io;
    io.to(`user_${userID}`).emit('comment_fb', data);
    if (data && data.liveID) {
      io.to(`live_${data.liveID}`).emit('comment_fb_live', data);
    }
    if (data && data.campaignID) {
      io.to(`campaign_${data.campaignID}`).emit('comment_fb_campaign', data);
    }
  }
};
