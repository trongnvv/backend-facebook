const HttpStatus = require('http-status-codes');
const facebookService = require('../services/fb.service');

module.exports = {
  getCheckAccessToken: async (req, res, next) => {
    const { accessToken } = req.body;
    const resUserFB = await facebookService.getUser(accessToken);
    if (!resUserFB || resUserFB.error)
      next({
        success: false,
        code: HttpStatus.UNAUTHORIZED,
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token was expired'
      });
  },
  saveToken: async (req, res, next) => {
    const { user, facebook } = req;
    const UserFacebook = req.db.model('UserFacebook');
    const userFB = await UserFacebook.findOneAndUpdate(
      {
        userFacebookID: facebook.userFacebookID,
      },
      {
        isRemoved: false,
        userID: user.userID,
        status: 'SUBSCRIBE',
        userFacebookName: facebook.name,
        userFacebookEmail: facebook.email,
        accessToken: facebook.accessToken,
        userLink: facebook.userLink,
        userFacebookPicture: facebook.picture
      },
      { new: true, upsert: true }
    );
    // subcribe page
    facebookService
      .clonePage(req, facebook.accounts && facebook.accounts.data)
      .then((res) => console.log('clone-page', res))
      .catch((err) => console.log('clone-page err', err));
    return userFB;
  },
  getFacebooks: async (req, res, next) => {
    const { user, db } = req;
    const UserFacebook = db.model('UserFacebook');
    const rs = await UserFacebook.find({ userID: user.userID, isRemoved: false })
      .sort({ createdAt: -1 })
      .lean();
    return rs;
  },
  removeAccount: async (req, res, next) => {
    const { user, db } = req;
    const { id: userFacebookID } = req.params;
    const UserFacebook = db.model('UserFacebook');
    const PageFacebook = db.model('PageFacebook');
    const facebook = await UserFacebook.find({
      userID: user.userID,
      userFacebookID,
      isRemoved: false
    });
    if (!facebook) {
      next({
        success: false,
        code: HttpStatus.BAD_REQUEST,
        status: HttpStatus.BAD_REQUEST,
        message: 'Account facebook not found'
      });
      return;
    }
    UserFacebook.updateOne({ userFacebookID }, { isRemoved: true }).exec();
    PageFacebook.updateMany({ userFacebookID }, { isRemoved: true }).exec();
  },
  getListPage: async (req, res, next) => {
    try {
      const { db, facebook, user } = req;
      const { isClone } = req.query;
      const PageFacebook = db.model('PageFacebook');
      if (isClone) await facebookService.clonePage(req);
      const rs = await PageFacebook.find({
        userID: user.userID,
        userFacebookID: facebook.userFacebookID,
        isRemoved: false
      })
        .sort({ createdAt: -1 })
        .lean();
      return rs;
    } catch (error) {
      throw error;
    }
  },

  subscribe: async (req, res, next) => {
    const { db } = req;
    const { pageID } = req.body;
    const PageFacebook = db.model('PageFacebook');
    const pageFB = await PageFacebook.findOne({ pageID });
    if (!pageFB)
      throw new Error(
        'Page facebook not found or the page is associated  with another account'
      );
    facebookService
      .subscribePage(pageID, pageFB.accessToken)
      .then((res) => console.log('subscribe', res))
      .catch((err) => console.log('err: ', err));
    return;
  },
  unSubscribe: async (req, res, next) => {
    const { db } = req;
    const { pageID } = req.body;
    const PageFacebook = db.model('PageFacebook');
    const pageFB = await PageFacebook.findOne({ pageID });
    if (!pageFB)
      throw new Error(
        'Page facebook not found or the page is associated  with another account'
      );
    facebookService
      .unSubscribePage(pageID, pageFB.accessToken)
      .then((res) => console.log('unSubscribe', res))
      .catch((err) => console.log('err: ', err));
    return;
  }
};
