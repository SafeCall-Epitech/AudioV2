const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();

const options = {
  key: fs.readFileSync("certificates/privkey.pem"),
  cert: fs.readFileSync("certificates/cert.pem"),
};

const server = https.createServer(options, app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const mapUsers = new Map()
const mapCalls = new Map()

io.on("connection", (socket) => {
    console.log("a user is connected: ", socket.id)
    io.to(socket.id).emit("me", socket.id)

    socket.on("pseudo", (data) => {
        if (!mapUsers.has(data.pseudo)) {
            mapUsers.set(socket.id, data.pseudo)
        }
        if (mapCalls.has(data.pseudo)) {
            io.to(socket.id).emit("callReceived", {signal: mapCalls.get(data.pseudo)[1][0], from: mapCalls.get(data.pseudo)[1][1]})
        }
        console.log("nb users connected:", mapUsers.size)
        mapUsers.forEach((value, key) => {
            console.log(`${key}: ${value}`)
        });
    })

    socket.on("disconnect", () => {
        for (const [key, values] of mapCalls.entries()) {
            if (key == mapUsers.get(socket.id)) {
                console.log("endcall3", mapUsers.get(socket.id))
                for (const [k, v] of mapUsers.entries()) {
                    if (v == values[0]) {
                        io.to(k).emit("callEnded")
                        break;
                    }
                }
                mapCalls.delete(key)
                break
            }
            if (values[0] == mapUsers.get(socket.id)) {
                console.log("endcall4", mapUsers.get(socket.id))

                for (const [k, v] of mapUsers.entries()) {
                    if (v == key) {
                        io.to(k).emit("callEnded")
                        break;
                    }
                }
                mapCalls.delete(key)
                break
            }
        }
        console.log("a user disconnected: ", socket.id, mapUsers.get(socket.id))
        mapUsers.delete(socket.id)
    })

    socket.on("callUser", (data) =>  {
        console.log("user to call:", data.userToCall, " signal:", data.signalData.type)
        mapCalls.set(data.userToCall, [mapUsers.get(socket.id), [data.signalData, socket.id]])
        for (const [key, value] of mapUsers.entries()) {
            if (value === data.userToCall) {
                console.log(key, value)
                io.to(key).emit("callReceived", {signal: data.signalData, from: socket.id})
                break
            }
        }
    })

    socket.on("endCall", () => {
        for (const [key, values] of mapCalls.entries()) {
            if (key == mapUsers.get(socket.id)) {
                console.log("endcall1", mapUsers.get(socket.id))
                for (const [k, v] of mapUsers.entries()) {
                    if (v == values[0]) {
                        io.to(k).emit("callEnded")
                        break;
                    }
                }
                mapCalls.delete(key)
                break
            }
            if (values[0] == mapUsers.get(socket.id)) {
                console.log("endcall2", mapUsers.get(socket.id))

                for (const [k, v] of mapUsers.entries()) {
                    if (v == key) {
                        io.to(k).emit("callEnded")
                        break;
                    }
                }
                mapCalls.delete(key)
                break
            }
        }
        console.log("nb calls:", mapCalls.size)
        mapCalls.forEach((value, key) => {
            console.log(key, value[0])
        });
    })

    socket.on("answerCall", (data) => {
        console.log("answer to:", data.to, " signal:", data.signal.type)
        io.to(data.to).emit("callAccepted", data.signal)
    })
})

const PORT = 5000;

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
