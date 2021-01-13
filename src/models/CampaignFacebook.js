const mongoose = require('mongoose');
const { Schema } = mongoose;
const VarSchema = new Schema(
  {
    userID: {
      type: String,
      required: true
    },
    description: {
      type: String,
    },
    title: {
      type: String,
    },
    inputURL: {
      type: String,
    },
    status: {
      type: String,
      default: 'INIT',
      enum: ['INIT', 'LIVE', 'LIVE_FINISH'],
    },
    isRemoved: {
      type: Boolean,
      default: false
    },
    linkVideo: String,
    linkStream: String,
    thumbnail: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('CampaignFacebook', VarSchema);
