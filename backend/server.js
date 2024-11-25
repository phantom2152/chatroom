import express from "express";
import cors from "cors";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app)
const PORT = 5001;

const io = new Server(
    server, {
    cors: {
        origin: "http://localhost:5173"
    }
});


app.use(cors({
    origin: "*"
}));

var rooms = [];

const generateUniqueUsername = () => {
    const seed = Date.now();
    const username = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        seed
    });

    return username;

}

app.get("/", (req, res) => res.end("Server is running"));


app.post("/createroom", (req, res) => {
    const creatorUsername = generateUniqueUsername();
    const roomObj = {
        id: crypto.randomUUID(),
        creator_username: creatorUsername,
        created_at: new Date().toLocaleString(),
        joiner_username: "",
        joined_at: "",
        creator_ready: false,
        joiner_ready: false,
        state: "waiting_for_join",
        messages: []
    }

    rooms.push(roomObj);

    return res.status(201).json(roomObj);
})


app.get("/join/:roomId", (req, res) => {
    let id = req.params.roomId;
    let roomObj = rooms.find(obj => obj.id === id);

    if (!roomObj) {
        return res.status(404).json({
            message: "room not found"
        })
    }

    if (roomObj.state !== "waiting_for_join" || roomObj.joiner_username || roomObj.joined_at) {
        return res.status(403).json({
            message: "Room already filled"
        })
    }

    const joinerUsername = generateUniqueUsername();
    const objIdx = rooms.findIndex(x => x.id === id);
    roomObj.joiner_username = joinerUsername;
    roomObj.joined_at = new Date().toLocaleString();
    roomObj.state = "waiting_for_ready";
    rooms[objIdx] = roomObj;

    return res.json(roomObj);
})

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join_room", (data, callback) => {
        console.log("➡️ Join request:", data);

        const room = rooms.find(r => r.id === data.roomId);
        if (!room) {
            callback({ error: "Room not found" });
            return;
        }

        if (room.state === "closed") {
            callback({ error: "Room is closed" });
            return;
        }

        if (room.state === "chat_active") {
            callback({ error: "Room is full" });
            return;
        }

        socket.username = data.username;
        socket.join(data.roomId);

        callback({ success: true });

        io.to(data.roomId).emit('room_status', {
            status: room.state,
            users: {
                creator: room.creator_username,
                joiner: room.joiner_username
            }
        });
    });

    socket.on("user_ready", (data) => {
        console.log("✅ Ready signal from:", data.username);
        const room = rooms.find(r => r.id === data.roomId);

        if (room.creator_username === data.username) {
            room.creator_ready = true;
        } else {
            room.joiner_ready = true;
        }

        if (room.creator_ready && room.joiner_ready) {
            room.state = "chat_active";
        }

        const objIdx = rooms.findIndex(x => x.id === data.roomId);
        rooms[objIdx] = room;

        io.to(data.roomId).emit("ready_update", {
            username: data.username,
            bothReady: room.creator_ready && room.joiner_ready,
            newState: room.state
        });
    });

    socket.on("chat_message", data => {
        console.log("💬 New message from:", data.username);
        const room = rooms.find(r => r.id === data.roomId);

        if (room && room.state === "chat_active") {
            const messageObj = {
                username: data.username,
                text: data.text,
                timestamp: new Date().toLocaleString()
            };

            room.messages.push(messageObj);
            io.to(data.roomId).emit("receive_message", messageObj);
        }
    });

    socket.on("user_leaving", (data) => {
        console.log("👋 User leaving:", data.username);
        const room = rooms.find(r => r.id === data.roomId);

        if (room) {
            room.state = "closed";
            io.to(data.roomId).emit("peer_disconnected", {
                username: data.username
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.username);

        const room = rooms.find(r =>
            r.creator_username === socket.username ||
            r.joiner_username === socket.username
        );

        if (room) {
            room.state = "closed";
            io.to(room.id).emit("peer_disconnected", {
                username: socket.username
            });
        }
    });
});


server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

