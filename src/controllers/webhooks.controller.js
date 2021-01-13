const facebookService = require('../services/fb.service');
const { get } = require('lodash');
const { sendComment } = require('../services/socket');

const handleStatusCampaign = async ({ db, live }) => {
  const Campaign = db.model('CampaignFacebook');
  const LiveFacebook = db.model('LiveFacebook');

  const { campaignID, status: liveStatus } = live;

  const campaign = await Campaign.findById(campaignID);
  if (liveStatus === 'LIVE' && campaign.status === 'INIT') {
    Campaign.findByIdAndUpdate(campaignID, { status: 'LIVE' }).exec();
  } else if (liveStatus === 'VOD') {
    const allLives = await LiveFacebook.find({ campaignID, status: { $ne: 'VOD' } });
    if (allLives.length === 0) {
      Campaign.findByIdAndUpdate(campaignID, { status: 'LIVE_FINISH' }).exec();
    }
  }
};

const handleStatusLive = async (req, res, next, changeEvent) => {
  next();
  const { db } = req;
  const { id: liveID, status: newStatus } = changeEvent.value;
  const LiveFacebook = db.model('LiveFacebook');

  const updateStatus = newStatus ? newStatus.toUpperCase() : '';
  if (!updateStatus) return;

  let updateData = { status: updateStatus };
  const liveFacebook = await LiveFacebook.findOne({ liveID });

  if (!liveFacebook) return;

  if (updateStatus === 'VOD' || updateStatus === 'LIVE') {
    let accessToken = '';

    if (liveFacebook.onProfile) {
      const UserFacebook = db.model('UserFacebook');
      const user = await UserFacebook.findOne({
        userFacebookID: liveFacebook.userFacebookID
      });
      accessToken = user.accessToken;
    } else {
      const PageFacebook = db.model('PageFacebook');
      page = await PageFacebook.findOne({ pageID: liveFacebook.pageID });
      accessToken = page.accessToken;
    }

    const { source, picture, thumbnails } = await facebookService.getVideo({
      accessToken,
      videoID: liveFacebook.videoID
    });

    let thumbnail = '';
    if (Array.isArray(thumbnails) && thumbnails.length) {
      thumbnail = thumbnails[thumbnails.length - 1];
    } else {
      thumbnail = picture;
    }
    updateData = { ...updateData, linkVideo: source, thumbnail };
  }

  const updateLive = await LiveFacebook.findOneAndUpdate(
    { liveID },
    updateData,
    { new: true }
  );

  const linkVideoCampaign = updateData.linkVideo || '';
  const thumbnailCampaign = updateData.thumbnail || '';

  const CampaignFacebook = db.model('CampaignFacebook');

  CampaignFacebook.findOneAndUpdate(
    { _id: updateLive.campaignID },
    { linkVideo: linkVideoCampaign, thumbnail: thumbnailCampaign }
  ).exec();

  handleStatusCampaign({ db, live: updateLive });
};

const handleComment = async (req, res, next, changeEvent) => {
  next();
  const { value } = changeEvent;
  const { db } = req;
  const LiveFacebook = db.model('LiveFacebook');
  const Comment = db.model('Comment');

  const liveFacebook = await LiveFacebook.findOne({
    postID: get(value, 'post_id')
  });
  const { _id: liveID, campaignID, userID } = liveFacebook;

  const newComment = {
    from: get(value, 'from'),
    post: get(value, 'post'),
    message: get(value, 'message'),
    postID: get(value, 'post_id'),
    commentID: get(value, 'comment_id'),
    createdTime: get(value, 'created_time'),
    parentId: get(value, 'parent_id'),
    typeLive: 'facebook',
    liveID,
    campaignID
  };
  // send socket
  sendComment(userID, newComment);

  await Comment.create(newComment);
};

module.exports = {
  verifyWebhooks: async (req, res, next) => {
    if (
      req.query['hub.mode'] == 'subscribe' &&
      req.query['hub.verify_token'] == VERIFY_TOKEN_WEBHOOKS
    ) {
      return res.send(req.query['hub.challenge']);
    }
    res.json({});
  },
  receiveWebhooks: async (req, res, next) => {
    // code sp by tuan1412 
    // if (!req.isXHubValid || !req.isXHubValid()) {
    //   throw new Error(
    //     'Warning - request header X-Hub-Signature not present or invalid'
    //   );
    // }
    // change status
    const changeEvent = get(req, 'body.entry[0].changes[0]');

    if (get(changeEvent, 'field') === 'live_videos') {
      return handleStatusLive(req, res, next, changeEvent);
    }

    if (
      get(changeEvent, 'field') === 'feed' &&
      get(changeEvent, 'value.item') === 'comment'
    ) {
      return handleComment(req, res, next, changeEvent);
    }

    next();
  }
}