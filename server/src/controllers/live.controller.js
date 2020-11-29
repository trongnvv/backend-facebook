const facebookService = require('../services/fb.service');
const { get } = require('lodash');

module.exports = {
  getLive: async (req, res, next) => {
    const { db, user } = req;
    const { id } = req.query; // user id or page id
    const LiveFacebook = db.model('LiveFacebook');
    const CampaignFacebook = db.model('CampaignFacebook');

    const lives = await LiveFacebook.aggregate()
      .match({
        userID: user.userID,
        $or: [
          { pageID: id, onProfile: false },
          { userFacebookID: id, onProfile: true },
          { campaignID: id }
        ],
        isRemoved: false
      })
      .addFields({
        convertedId: { $toObjectId: '$campaignID' }
      })
      .lookup({
        from: CampaignFacebook.collection.collectionName,
        localField: 'convertedId',
        foreignField: '_id',
        as: 'campaign'
      })
      .unwind('campaign')
      .addFields({
        linkStream: '$campaign.inputURL'
      })
      .sort({ createdAt: -1 })
      .project({
        convertedId: 0,
        campaign: 0
      });

    return lives;
  },
  getAllLive: async (req, res, next) => {
    const { db } = req;
    const { page, limit, status } = req.query;
    const LiveFacebook = db.model('LiveFacebook');
    const CampaignFacebook = db.model('CampaignFacebook');

    const pageSearch = parseInt(page) || 1;
    const limitSearch = parseInt(limit) || 10;
    const statusSearch = status ? { status } : {};

    const queryResult = await LiveFacebook.aggregate()
      .match({ isRemoved: false, ...statusSearch })
      .sort({ createdAt: -1 })
      .addFields({
        convertedId: { $toObjectId: '$campaignID' }
      })
      .lookup({
        from: CampaignFacebook.collection.collectionName,
        localField: 'convertedId',
        foreignField: '_id',
        as: 'campaign'
      })
      .unwind('campaign')
      .addFields({
        linkStream: '$campaign.inputURL'
      })
      .facet({
        results: [
          { $skip: (pageSearch - 1) * limitSearch },
          { $limit: limitSearch },
          {
            $project: {
              convertedId: 0,
              campaign: 0
            }
          }
        ],
        metadata: [
          {
            $count: 'total'
          }
        ]
      });

    return {
      data: get(queryResult, '[0].results', []),
      total: get(queryResult, '[0].metadata.[0].total', 0)
    };
  },
  finishLive: async (req, res, next) => {
    const { db } = req;
    const { id: liveID } = req.params;
    const LiveFacebook = db.model('LiveFacebook');
    const live = await LiveFacebook.findOne({ liveID, isRemoved: false });
    if (!live) throw new Error('Live not found');
    let accessToken;
    if (live.onProfile) {
      const UserFacebook = db.model('UserFacebook');
      const user = await UserFacebook.findOne({
        userFacebookID: live.userFacebookID
      });
      if (!user) throw new Error('User fb not found');
      accessToken = user.accessToken;
    } else {
      const PageFacebook = db.model('PageFacebook');
      const page = await PageFacebook.findOne({
        userFacebookID: live.userFacebookID
      });
      if (!page) throw new Error('User fb not found');
      accessToken = page.accessToken;
    }
    if (live.status === 'LIVE') {
      facebookService
        .stopLive({ liveID, accessToken })
        .then((res) => console.log('stop live', liveID))
        .catch((err) => console.log('stop live err', err.response.data));
      await LiveFacebook.findOneAndUpdate(
        { liveID, isRemoved: false },
        { status: 'LIVE_STOPPED' },
        { new: true }
      );
    }
  },
  livePushCommentFB: async (req, res, next) => {
    const { db } = req;
    const { id: liveID } = req.params;
    const { message } = req.body;
    const LiveFacebook = db.model('LiveFacebook');
    const PageFacebook = db.model('PageFacebook');

    const lives = await LiveFacebook.aggregate()
      .match({ liveID, isRemoved: false, onProfile: false })
      .lookup({
        from: PageFacebook.collection.collectionName,
        localField: 'pageID',
        foreignField: 'pageID',
        as: 'page'
      })
      .unwind('page')
      .match({ 'page.isRemoved': false })
      .addFields({
        accessToken: '$page.accessToken'
      })
      .project({
        page: 0
      });
    if (!lives || lives.length !== 1) throw new Error('Data not found');
    facebookService.commentToFacebook(
      lives[0].videoID,
      lives[0].accessToken,
      message
    );
  },
}