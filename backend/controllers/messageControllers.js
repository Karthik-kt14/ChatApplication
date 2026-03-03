
const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Content and chatId are required" });
  }

  // ✅ Ensure chat exists
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  let message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  message = await message.populate("sender", "name pic");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  chat.latestMessage = message;
  await chat.save();

  res.status(201).json(message);
});

const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    chat: req.params.chatId,
  })
    .populate("sender", "name pic email")
    .populate("chat");

  res.status(200).json(messages);
});

module.exports = { sendMessage,allMessages };
