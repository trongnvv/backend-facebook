const facebookService = require('../services/fb.service');
module.exports = {

  getComments: async (req, res, next) => {
    const { query, db } = req;
    const { campaignID, page, limit, createdTimeSort } = query;

    const pageSearch = parseInt(page) || 1;
    const limitSearch = parseInt(limit) || 20;
    const sort = parseInt(createdTimeSort) || 1;

    if (campaignID) {
      const Comment = db.model('Comment');

      const queryResult = await Comment.aggregate()
        .match({ campaignID })
        .sort({ createdTime: sort })
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
    }

    return {
      comments: [],
      total: 0
    };
  },
  pushCommentFB: async (req, res, next) => {
    const { db } = req;
    const { id: commentID } = req.params;
    const { message } = req.body;
    const Comment = db.model('Comment');
    const LiveFacebook = db.model('LiveFacebook');
    const PageFacebook = db.model('PageFacebook');

    const comment = await Comment.aggregate()
      .match({ commentID })
      .lookup({
        from: LiveFacebook.collection.collectionName,
        localField: 'postID',
        foreignField: 'postID',
        as: 'live'
      })
      .unwind('live')
      .lookup({
        from: PageFacebook.collection.collectionName,
        localField: 'live.pageID',
        foreignField: 'pageID',
        as: 'page'
      })
      .unwind('page')
      .match({ 'page.isRemoved': false })
      .addFields({
        accessToken: '$page.accessToken'
      })
      .project({
        page: 0,
        live: 0
      });
    if (!comment || comment.length !== 1) throw new Error('Data not found');
    facebookService.commentToFacebook(
      commentID,
      comment[0].accessToken,
      message
    );
  },

  // campaignPushCommentToFB: async (req, res, next) => {
  //   const { db } = req;
  //   const { id: campaignID } = req.params;
  //   const { message } = req.body;
  //   const LiveFacebook = db.model('LiveFacebook');
  //   const PageFacebook = db.model('PageFacebook');
  //   const UserFacebook = db.model('UserFacebook');

  //   const lives = await LiveFacebook.aggregate()
  //     .match({ campaignID, isRemoved: false })
  //     .lookup({
  //       from: UserFacebook.collection.collectionName,
  //       localField: 'userFacebookID',
  //       foreignField: 'userFacebookID',
  //       as: 'user'
  //     })
  //     .unwind({
  //       path: '$user',
  //       preserveNullAndEmptyArrays: true
  //     })
  //     .match({ 'user.isRemoved': false })
  //     .addFields({
  //       accessToken: '$user.accessToken'
  //     })
  //     .lookup({
  //       from: PageFacebook.collection.collectionName,
  //       localField: 'pageID',
  //       foreignField: 'pageID',
  //       as: 'page'
  //     })
  //     .unwind({
  //       path: '$page',
  //       preserveNullAndEmptyArrays: true
  //     })
  //     .match({ $ne: { 'page.isRemoved': true } })
  //     .addFields({
  //       accessToken: {
  //         $switch: {
  //           branches: [
  //             {
  //               case: { $eq: ['$onProfile', true] },
  //               then: '$user.accessToken'
  //             },
  //             {
  //               case: { $eq: ['$onProfile', false] },
  //               then: '$page.accessToken'
  //             }
  //           ],
  //           default: 'trongnv'
  //         }
  //       }
  //     })
  //     .project({
  //       user: 0,
  //       page: 0
  //     });
  //   for (const live of lives) {
  //     facebookService.commentToFacebook(
  //       live.videoID,
  //       live.accessToken,
  //       message
  //     );
  //   }
  // },
}