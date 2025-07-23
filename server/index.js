const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, "../client")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  res.json({ url: "/uploads/" + req.file.filename });
});

// Vector Clock class
class VectorClock {
  constructor() {
    this.clock = {};
  }

  tickAndUpdate(senderId, senderClock) {
    for (const [id, time] of Object.entries(senderClock || {})) {
      this.clock[id] = Math.max(this.clock[id] || 0, time);
    }
    this.clock[senderId] = (this.clock[senderId] || 0) + 1;
  }

  getClock() {
    return { ...this.clock };
  }
}

const vectorClocks = {};
const fifoBuffers = {};
const expectedSeq = {};

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  vectorClocks[socket.id] = new VectorClock();
  fifoBuffers[socket.id] = [];
  expectedSeq[socket.id] = 0;

  // Handle new user join
  socket.on("newUser", (username) => {
    socket.username = username;
    socket.broadcast.emit("systemMessage", `${username} joined the chat`);
    io.emit("userCount", io.engine.clientsCount);
  });

  // Handle message
  socket.on("message", (data) => {
    const vc = vectorClocks[socket.id];
    vc.tickAndUpdate(socket.id, data.vectorClock);

    const message = {
      senderId: socket.id,
      username: data.username,
      text: data.text,
      vectorClock: vc.getClock(),
      sequenceNumber: data.sequenceNumber,
      type: data.type || "text",
      timestamp: data.timestamp || Date.now()
    };

    const delay = Math.floor(Math.random() * 2000);
    setTimeout(() => {
      const expected = expectedSeq[socket.id];

      if (data.sequenceNumber === expected) {
        io.emit("message", message);
        expectedSeq[socket.id]++;

        let buffer = fifoBuffers[socket.id];
        buffer.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        while (buffer.length && buffer[0].sequenceNumber === expectedSeq[socket.id]) {
          const nextMsg = buffer.shift();
          io.emit("message", nextMsg);
          expectedSeq[socket.id]++;
        }
      } else {
        fifoBuffers[socket.id].push(message);
      }
    }, delay);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stopTyping", (data) => {
    socket.broadcast.emit("stopTyping", data);
  });

  // Clear chat
  socket.on("clearChat", () => {
    io.emit("chatCleared");
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    if (socket.username) {
      socket.broadcast.emit("systemMessage", `${socket.username} left the chat`);
    }

    delete vectorClocks[socket.id];
    delete fifoBuffers[socket.id];
    delete expectedSeq[socket.id];

    io.emit("userCount", io.engine.clientsCount);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server is running at http://localhost:3000");
});
