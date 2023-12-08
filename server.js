const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("a user connected")
    socket.emit("me", socket.id)

    socket.on("disconnect", () => {
        console.log("a user disconnected")
        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) =>  {
        console.log("user to call:", data.userToCall)
        io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from})
    })

    socket.on("answerCall", (data) => {
        console.log("answer to:", data.to)
        io.to(data.to).emit("callAccepted", data.signal)
    })
})

server.listen(5000, () => console.log("server is running on port 5000"))

