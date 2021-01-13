const facebookService = require('../services/fb.service');
const { get } = require('lodash');

module.exports = {
  getAllCampaign: async (req, res, next) => {
    const { db } = req;
    const { page, limit, status } = req.query;
    const Campaign = db.model('CampaignFacebook');
    const pageSearch = parseInt(page) || 1;
    const limitSearch = parseInt(limit) || 10;
    const listStatusSearch = status ? status.split(';') : [];
    const statusSearch = listStatusSearch.length
      ? { status: { $in: listStatusSearch } }
      : {};

    const queryResult = await Campaign.aggregate()
      .match({ ...statusSearch })
      .sort({ createdAt: -1 })
      .facet({
        results: [
          { $skip: (pageSearch - 1) * limitSearch },
          { $limit: limitSearch }
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
  getCampaign: async (req, res, next) => {
    const { db, user } = req;
    const CampaignFacebook = db.model('CampaignFacebook');
    const rs = await CampaignFacebook.find({
      userID: user.userID,
      isRemoved: false
    })
      .sort({ createdAt: -1 })
      .lean();
    return rs;
  },
  createLiveMulti: async (req, res, next) => {
    const { db, user } = req;
    const { ids, title, description } = req.body;
    const CampaignFacebook = db.model('CampaignFacebook');
    const LiveFacebook = db.model('LiveFacebook');
    const PageFacebook = db.model('PageFacebook');
    const UserFacebook = db.model('UserFacebook');

    let objects = [];
    const pages = await PageFacebook.find({
      pageID: { $in: ids },
      userID: user.userID,
      isRemoved: false
    });
    objects = objects.concat(pages);
    const userFB = await UserFacebook.find({
      userFacebookID: { $in: ids },
      userID: user.userID,
      isRemoved: false
    });
    objects = objects.concat(userFB);

    if (objects.length !== ids.length) throw new Error('Some ids invalid');

    const campaign = await CampaignFacebook.create({
      userID: user.userID,
      description,
      title
    });

    await Promise.all(
      objects.map(async (object) => {
        await facebookService.createLive(req, {
          campaign,
          object,
          description,
          title
        });
      })
    );
    const live = await LiveFacebook.find({
      userID: user.userID,
      isRemoved: false,
      campaignID: campaign._id
    });
    const output = live.map((v) => v.secureStreamURL);
    const ffmpeg = await facebookService.registFFMPEF(campaign._id, output);
    if (ffmpeg.message !== 'success' || !ffmpeg.data.stream_input)
      throw 'Regist output from server ffmpeg fail';
    const newCampaign = await CampaignFacebook.findOneAndUpdate(
      {
        _id: campaign._id
      },
      {
        inputURL: ffmpeg.data.stream_input,
        linkStream: ffmpeg.data.stream_input
      },
      {
        new: true
      }
    );
    return { listLive: live, campaign: newCampaign };
  },
  finishLiveCampaign: async (req, res, next) => {
    const { db } = req;
    const { id: campaignID } = req.params;
    const CampaignFacebook = db.model('CampaignFacebook');
    const campaign = await CampaignFacebook.findOne({
      _id: campaignID,
      isRemoved: false
    });
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status === 'LIVE') {
      facebookService
        .stopLiveCampaign({ inputURL: campaign.inputURL })
        .then((res) => console.log('stop live campaign', res))
        .catch((err) =>
          console.log('stop live campaign err', err.response.data)
        );
      await CampaignFacebook.findOneAndUpdate(
        { _id: campaignID, isRemoved: false },
        { status: 'LIVE_FINISH' },
        { new: true }
      );
    }
  },
  campaignPushCommentToFB: async (req, res, next) => {
    const { db } = req;
    const { id: campaignID } = req.params;
    const { message } = req.body;
    const LiveFacebook = db.model('LiveFacebook');
    const PageFacebook = db.model('PageFacebook');

    const lives = await LiveFacebook.aggregate()
      .match({ campaignID, isRemoved: false, onProfile: false })
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
    for (const live of lives) {
      facebookService.commentToFacebook(
        live.videoID,
        live.accessToken,
        message
      );
    }
  },
}