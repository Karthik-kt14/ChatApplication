
const mongoose = require("mongoose");

const messageModel = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true, // 🔐 PREVENTS NULL FOREVER
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageModel);
module.exports = Message;
