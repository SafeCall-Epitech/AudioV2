const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

const server = https.createServer(options, app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user is connected: ", socket.id);
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    console.log("a user disconnected: ", socket.id);
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("user to call:", data.userToCall, " signal:", data.signalData.type);
    io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from });
  });

  socket.on("answerCall", (data) => {
    console.log("answer to:", data.to, " signal:", data.signal.type);
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

const PORT = 5000;

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
