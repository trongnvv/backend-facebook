const EventSource = require("eventsource");
const { sendMessage } = require('./kafka.service');
const { fetchAPI } = require("../utils");
const {
  FACEBOOK: { APP_ID, APP_SECRET, URL_REDIRECT, HOST: FACEBOOK_HOST },
} = require("../../config");
module.exports = {
  getAccessTokenByCode: async (code) => {
    try {
      const data = {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: URL_REDIRECT,
        code: code,
      };
      return await fetchAPI(
        `${FACEBOOK_HOST}/oauth/access_token`,
        "GET",
        null,
        null,
        data
      );
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  getLongAccessToken: async (accessToken) => {
    try {
      const params = {
        grant_type: "fb_exchange_token",
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: accessToken,
      };
      return await fetchAPI(`${FACEBOOK_HOST}/oauth/access_token`, "GET", null, null, params);
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  getUser: async (accessToken) => {
    try {
      const params = {
        fields: "id,name,email,link,picture,accounts.limit(10000){link,access_token,category,name}",
        access_token: accessToken,
      };
      return await fetchAPI(`${FACEBOOK_HOST}/me`, "GET", null, null, params);
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  getListPage: async ({ accessToken, userFacebookID }) => {
    try {
      return await fetchAPI(`${FACEBOOK_HOST}/${userFacebookID}/accounts?access_token=${accessToken}&limit=1000`, "GET");
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  getLive: async ({ accessToken, liveID }) => {
    try {
      const params = {
        fields: "stream_url,secure_stream_url,status,video",
        access_token: accessToken,
      };
      // {
      //   "stream_url": "rtmps://live-api-s.facebook.com:443/rtmp/204154577813166?s_bl=1&s_psm=1&s_sc=204154604479830&s_sw=0&s_vt=api-s&a=AbzrMwYf039GtXUN",
      //   "secure_stream_url": "rtmps://live-api-s.facebook.com:443/rtmp/204154577813166?s_bl=1&s_psm=1&s_sc=204154604479830&s_sw=0&s_vt=api-s&a=AbzrMwYf039GtXUN",
      //   "status": "VOD",
      //   "video": {
      //     "id": "204154571146500"
      //   },
      //   "id": "204154577813166"
      // }
      return await fetchAPI(`${FACEBOOK_HOST}/${liveID}`, "GET", null, null, params);
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  getVideo: async ({ accessToken, videoID }) => {
    try {
      const params = {
        fields: "source,picture",
        access_token: accessToken,
      };
      // {
      //   "source": "https://video.fhan2-1.fna.fbcdn.net/v/t42.1790-2/126840641_662146087791838_165974586163221457_n.mp4?_nc_cat=102&vs=df0c46bb5dd84ecf&_nc_vs=HBksFQAYJEdFRnZqd2ZlTEZybU4xb0NBTkZUQUxvQnFVMENidjRHQUFBRhUAAsgBABUAGCRHSnp6Z1FmbkdDeElUUkVEQUJyVElhMFhTMHNvYnY0R0FBQUYVAgLIAQAoRC1pICclcycgLWZiX3VzZV90ZmR0X3N0YXJ0dGltZSAxIC1pICclcycgLWMgY29weSAtbW92ZmxhZ3MgZmFzdHN0YXJ0KwKIEnByb2dyZXNzaXZlX3JlY2lwZQExIG1lYXN1cmVfb3JpZ2luYWxfcmVzb2x1dGlvbl9zc2ltABUAJQAcAAAmiJSKi67rXBUCKAJDMxgDYXYxHBdAT8lYEGJN0xgZZGFzaF9saXZlX21kX2ZyYWdfMl92aWRlbxIAGBh2aWRlb3MudnRzLmNhbGxiYWNrLnByb2Q4ElZJREVPX1ZJRVdfUkVRVUVTVBsEiBVvZW1fdGFyZ2V0X2VuY29kZV90YWcGb2VwX3NkE29lbV9yZXF1ZXN0X3RpbWVfbXMNMTYwNTgzOTY2NzY4OAxvZW1fY2ZnX3J1bGUKd2FzbGl2ZV9zZBNvZW1fcm9pX3JlYWNoX2NvdW50ATAlBBwAAA%3D%3D&ccb=2&_nc_sid=a6057a&efg=eyJ2ZW5jb2RlX3RhZyI6Im9lcF9zZCJ9&_nc_ohc=HM1V8C-uNC4AX_ineJu&_nc_ht=video.fhan2-1.fna&oh=dbc671ac1235aa80935e3957bfaac29f&oe=5FB8EC3B&_nc_rid=17a6bf30c7d84ec",
      //   "picture": "https://scontent.fhan2-5.fna.fbcdn.net/v/t15.5256-10/p168x128/121919331_204155044479786_1094298876804258117_n.jpg?_nc_cat=107&ccb=2&_nc_sid=ed1892&_nc_ohc=4EGGLPPrezIAX9z2bFP&_nc_ht=scontent.fhan2-5.fna&oh=ec8bc3c68efa707d98e37b6753407d51&oe=5FDCED78",
      //   "id": "204154571146500"
      // }
      return await fetchAPI(`${FACEBOOK_HOST}/${videoID}`, "GET", null, null, params);
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  createLive: async (req, {
    campain,
    object,
    description,
    title
  }) => {
    try {
      const { db, user } = req;
      const LiveFacebook = db.model("LiveFacebook");
      const data = {
        access_token: object.accessToken,
        status: 'LIVE_NOW',
        description,
        title
      };
      const resFB = await fetchAPI(`${FACEBOOK_HOST}/${object.pageID || object.userFacebookID}/live_videos`, "POST", null, data);

      const evtSource = new EventSource(`https://streaming-graph.facebook.com/${resFB.id}/live_comments?access_token=${object.accessToken}&comment_rate=one_hundred_per_second&fields=from{name,id},message,attachment,created_time`);
      evtSource.onmessage = async e => {
        const data = JSON.parse(e.data);
        console.log('listenFacebookEvent', data);
        // sendMessage('fb-live-cmt', { ...data, postID })
        //   .then(rs => console.log(rs))
        //   .catch(err => console.log(err));
      }
      evtSource.onerror = error => {
        console.log('listenFacebookEvent-error', error);
      }

      return await LiveFacebook.create({
        campaignID: campain._id,
        userID: user.userID,
        userFacebookID: object.userFacebookID,
        pageID: object.pageID && object.pageID,
        onProfile: !object.pageID,
        liveID: resFB.id,
        postID: `${object.pageID || object.userFacebookID}_${resFB.id}`,
        streamURL: resFB.stream_url,
        secureStreamURL: resFB.secure_stream_url,
        title,
        description
      });

    } catch (error) {
      console.log(error);
      return { error };
    }
  },
  stopLive: async ({
    liveID,
    accessToken,
  }) => {
    try {
      const data = {
        access_token: accessToken,
        end_live_video: true
      };
      return await fetchAPI(`${FACEBOOK_HOST}/${liveID}`, "POST", null, data);
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  subscribePage: async (pageID, pageAccessToken) => {
    try {
      const data = { subscribed_fields: ["feed", "live_videos"] };
      return await fetchAPI(`${FACEBOOK_HOST}/${pageID}/subscribed_apps?access_token=${pageAccessToken}`, "POST", null, data);
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  unSubscribePage: async (pageID, pageAccessToken) => {
    try {
      return await fetchAPI(`${FACEBOOK_HOST}/${pageID}/subscribed_apps?access_token=${pageAccessToken}`, "DELETE");
    } catch (error) {
      console.log(error.response.data);
      return { error };
    }
  },
  clonePage: async (req, fbPages) => {
    const { db, facebook, user } = req;
    const PageFacebook = db.model("PageFacebook");
    if (!fbPages) {
      const params = {
        limit: 10000,
        fields: "link,access_token,category,name",
        access_token: facebook.accessToken,
      };
      const pages = await fetchAPI(`${FACEBOOK_HOST}/${facebook.userFacebookID}/accounts`, "GET", null, null, params);
      fbPages = pages.data;
    }
    // add to db
    const dataUpsert = fbPages.map(fbPage => ({
      updateOne: {
        filter: {
          userID: user.userID,
          pageID: fbPage.id,
          userFacebookID: facebook.userFacebookID,
        },
        update: {
          $set: {
            accessToken: fbPage.access_token,
            category: fbPage.category,
            name: fbPage.name,
            link: fbPage.link,
          },
          $setOnInsert: {
            status: 'SUBSCRIBE',
            isRemoved: false,
          }
        },
        upsert: true
      }
    }))
    await PageFacebook.bulkWrite(dataUpsert);
    for (const fbPage of fbPages) {
      const data = {
        access_token: fbPage.access_token,
        subscribed_fields: ["feed", "live_videos"]
      };
      fetchAPI(`${FACEBOOK_HOST}/${fbPage.id}/subscribed_apps`, "POST", null, data)
        .then(res => console.log('subscribe pageID: ', fbPage.id))
        .catch(err => console.log('subscribe err:', err.response.data));
    }
    const idFbPages = fbPages.map(v => v.id);
    const unsubscribe = await PageFacebook.find(
      {
        pageID: { $nin: idFbPages },
        userFacebookID: facebook.userFacebookID,
        isRemoved: false
      }
    );
    // unsubscribe
    for (const item of unsubscribe) {
      const data = {
        access_token: item.accessToken,
      };
      fetchAPI(`${FACEBOOK_HOST}/${item.pageID}/subscribed_apps`, "DELETE", null, data)
        .then(res => console.log('un-subscribe pageID: ', item.pageID))
        .catch(err => console.log('un-subscribe err:', err.response.data));
    }
    // update remove db page
    await PageFacebook.updateMany(
      {
        pageID: { $nin: idFbPages },
        userFacebookID: facebook.userFacebookID,
        isRemoved: false
      },
      {
        isRemoved: true,
        status: 'UNSUBSCRIBE'
      }
    );
  },
  sendPrivateReply: async (data) => {
    try {
      const rs = await fetchAPI(`${FACEBOOK_HOST}/me/messages`, 'POST', null, data);
      return rs;
    } catch (error) {
      console.log('sendPrivateReply', data, get(error, "response.data"));
      return { error }
    }
  },
  sendStandard: async (data) => {
    try {
      const rs = await fetchAPI(`${FACEBOOK_HOST}/me/messages`, 'POST', null, data);
      return rs;
    } catch (error) {
      console.log('sendMessageStandard error: ', data, get(error, "response.data"));
      return { error }
    }
  },
  fetchMessages: async ({ accessToken, conversationID, before, after }) => {
    try {
      const data = {
        access_token: accessToken,
        fields: "created_time,id,from,message",
        limit: 30
      };
      if (before) data.before = before;
      if (after) data.after = after;
      const rs = await fetchAPI(`${FACEBOOK_HOST}/${conversationID}/messages`, "GET", null, null, data);
      return rs;
    } catch (error) {
      console.log('fetchMessagePage', conversationID, get(error, "response.data"));
      return { error }
    }
  },
  fetchConversations: async ({ accessToken, pageFBID, before, after }) => {
    try {
      const data = {
        access_token: accessToken,
        fields: "unread_count,snippet,message_count,link,updated_time,participants",
        limit: 30
      };
      if (before) data.before = before;
      if (after) data.after = after;
      const rs = await fetchAPI(`${FACEBOOK_HOST}/${pageFBID}/conversations`, "GET", null, null, data);
      return { ...rs, pageFacebookID: pageFBID };
    } catch (error) {
      console.log('fetchMessagePage', pageFBID, get(error, "response.data"));
      return { error }
    }
  },
  fetchMessagesByPSID: async ({ accessToken, pageFBID, psid }) => {
    try {
      const data = {
        access_token: accessToken,
        fields: "message_count,link,id,snippet,subject,wallpaper,can_reply,participants,messages.limit(30){message,attachments.limit(1000){file_url,image_data,id,mime_type,name,size,video_data},from,sticker,id,created_time}",
        user_id: psid
      };
      const results = await fetchAPI(`${FACEBOOK_HOST}/${pageFBID}/conversations`, "GET", null, null, data);
      const rs = get(results, "data.[0]", {});
      return {
        messageCount: rs.message_count,
        link: 'https://facebook.com' + rs.link,
        conversationID: rs.id,
        snippet: rs.snippet,
        canReply: rs.can_reply,
        participants: rs.participants,
        messages: rs.messages,
      };
    } catch (error) {
      console.log('fetchMessagesByPSID', pageFBID, get(error, "response.data"));
      return { error }
    }
  },
  listenFacebookEvent: ({ liveID, accessToken, postID }) => {
    console.log('listenFacebookEvent', liveID, accessToken);

  }
};
