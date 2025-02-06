import { Server } from "socket.io";
import http from "http";
import express from "express";
import { trace, metrics } from '@opentelemetry/api';

const APP_NAME = process.env.APP_NAME;
const app = express();
const server = http.createServer(app);
const meter = metrics.getMeter(APP_NAME);

const onlineUsersCounter = meter.createUpDownCounter('online_users', {
  description: 'Number of users currently online'
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  onlineUsersCounter.add(1);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    onlineUsersCounter.add(-1);
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
