const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../service/ai-service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");

function initSockets(httpServer) {
  const io = new Server(httpServer);

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.request.headers?.cookie || "");
    const token = cookies.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      try {
        const payload =
          typeof messagePayload === "string"
            ? JSON.parse(messagePayload)
            : messagePayload;

        await messageModel.create({
          user: socket.user._id,
          chat: payload.chat,
          content: payload.content,
          role: "user",
        });

        const vector = await generateVector(payload.content);

        await createMemory({
          vector,
          messageId: new Date().getTime().toString(),
          metadata: {
            chat: payload.chat.toString(),
            user: socket.user._id.toString(),
            text: payload.content,
          },
        });

        const memory = await queryMemory({
            queryVector:vector,
            limit: 3,
            metadata: {
               
            }
        })

        console.log("Retrieved memory from Pinecone:", memory);

        const chatHistory = (
          await messageModel
            .find({ chat: payload.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        ).reverse();

        const aiResponse = await generateResponse(
          chatHistory.map((msg) => {
            return {
              role: msg.role,
              parts: [{ text: msg.content }],
            };
          }),
        );

        await messageModel.create({
          user: socket.user._id,
          chat: payload.chat,
          content: aiResponse,
          role: "model",
        });

        socket.emit("ai-response", {
          content: aiResponse,
          chat: payload.chat,
        });
      } catch (error) {
        console.error("Socket error occurred:", error);
        socket.emit("error", { message: "Server me koi dikkat aayi hai." });
      }
    });

    socket.on("disconnect", () => {
      console.log(
        "User disconnected:",
        socket.user?.fullname?.firstName || "User",
      );
    });
  });

  return io;
}

module.exports = initSockets;
