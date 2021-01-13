const mongoose = require("mongoose");
const { Schema } = mongoose;
const VarSchema = new Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    userFacebookPicture: {
      type: String,
      required: true,
    },
    userFacebookID: {
      type: String,
      required: true,
    },
    userFacebookName: {
      type: String,
      required: true,
    },
    userLink: {
      type: String,
    },
    userFacebookEmail: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'SUBSCRIBE',
      enum: ["SUBSCRIBE", "EXPIRED"],
    },
    isRemoved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserFacebook", VarSchema);
