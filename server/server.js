const express = require("express");
const Socket = require("socket.io");
const PORT = 3000;

const app = express();
const server = require("http").createServer(app);


// The io.on("connection", socket => { /* ... */ }) code subscribes to a "connection" event and waits for clients to connect.

// "connection" is a predefined event in Socket.IO and is triggered when a client connects to the Socket.IO server.

// Our socket argument above provides an object reference to individual client connections and it has various properties and methods.

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = [];

io.on("connection", socket => {
  socket.on("adduser", username => {
    socket.user = username;
    users.push(username);
    io.sockets.emit("users", users);

    io.to(socket.id).emit("private", {
      id: socket.id,
      name: socket.user,
      msg: "secret message",
    });
  });

  socket.on("message", message => {
    io.sockets.emit("message", {
      message,
      user: socket.user,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.user} is disconnected`);
    if (socket.user) {
      users.splice(users.indexOf(socket.user), 1);
      io.sockets.emit("user", users);
      console.log("remaining users:", users);
    }
  });
});

server.listen(PORT, () => {
  console.log("listening on PORT: ", PORT);
});