const mongoose = require('mongoose');
const { Schema } = mongoose;

const VarSchema = new Schema(
  {
    message: {
      type: String,
    },
    from: {
      type: Object,
    },
    post: {
      type: Object,
    },
    postID: {
      type: String,
    },
    commentID: {
      type: String,
    },
    liveID: {
      type: String,
    },
    campaignID: {
      type: String,
    },
    parentID: {
      type: String,
    },
    createdTime: {
      type: String
    },
    typeLive: {
      type: String,
      default: 'xinhxinh',
      enum: ['xinhxinh', 'facebook', 'tiktok'],
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('Comment', VarSchema);
