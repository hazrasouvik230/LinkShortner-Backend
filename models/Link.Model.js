const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalLink: {
    type: String,
    required: true,
  },
  shortLink: {
    type: String,
    required: true,
  },
  remarks: String,
  clicks: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Active",
  },
  expirationDate: {
    type: Date,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Link", linkSchema);
