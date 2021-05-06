const mongoose = require('mongoose');
const { Schema } = mongoose;
const VarSchema = new Schema(
  {
    psid: {
      type: String,
      required: true,
    },
    pageFBID: {
      type: String,
      required: true,
    },
    message: String
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('MessageReceive', VarSchema);
