const mongoose = require('mongoose');
const { Schema } = mongoose;
const VarSchema = new Schema(
  {
    campaignID: mongoose.Types.ObjectId,
    pageID: mongoose.Types.ObjectId,
    psid: {
      type: String,
      required: true,
    },
    commentFBID: {
      type: String,
      required: true,
    }
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('MessageRef', VarSchema);
