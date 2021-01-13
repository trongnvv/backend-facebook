const mongoose = require('mongoose');
const { Schema } = mongoose;
const VarSchema = new Schema(
  {
    userID: {
      type: String,
      required: true
    },
    pageID: {
      type: String,
      required: true
    },
    userFacebookID: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    category: {
      type: String,
    },
    link:{
      type: String,
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "SUBSCRIBE",
      enum: ['SUBSCRIBE', 'EXPIRED', 'UNSUBSCRIBE', 'LIVE_STREAM'],
    },
    isRemoved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('PageFacebook', VarSchema);
