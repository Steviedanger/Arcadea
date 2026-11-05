import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Will update to your Vercel URL later in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen when a player joins with their room/floor info (e.g., "Block C, Room 14")
  socket.on("join_game", (data: { username: string; room: string }) => {
    console.log(`${data.username} from ${data.room} joined the arcade.`);
  });

  // Listen for score submissions from Football Trivia or Word Puzzles
  socket.on("submit_score", (data: { room: string; score: number; gameType: string }) => {
    console.log(`Score received from ${data.room}: ${data.score} in ${data.gameType}`);
    // Broadcast updated scores to everyone on the leaderboard
    io.emit("leaderboard_update", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Arcadea backend server running on port ${PORT}`);
});