const mongoose = require('mongoose');
const { Schema } = mongoose;
const VarSchema = new Schema(
  {
    userID: {
      type: String,
      required: true
    },
    userFacebookID: {
      type: String,
      required: true
    },
    pageID: {
      type: String
    },
    postID: {
      type: String,
      required: true
    },
    liveID: {
      type: String,
      required: true
    },
    campaignID: {
      type: String
    },
    videoID: {
      type: String
    },
    streamURL: {
      type: String
    },
    secureStreamURL: {
      type: String
    },
    linkVideo: {
      type: String
    },
    thumbnail: {
      type: String
    },
    description: {
      type: String
    },
    title: {
      type: String
    },
    onProfile: {
      type: Boolean,
      default: false
    },
    startLive: {
      type: Date
    },
    endLive: {
      type: Date
    },
    status: {
      type: String,
      default: 'UNPUBLISHED',
      enum: [
        'UNPUBLISHED',
        'LIVE',
        'LIVE_STOPPED',
        'PROCESSING',
        'VOD',
        'SCHEDULED_UNPUBLISHED',
        'SCHEDULED_LIVE',
        'SCHEDULED_EXPIRED',
        'SCHEDULED_CANCELED'
      ]
    },
    isRemoved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LiveFacebook', VarSchema);
