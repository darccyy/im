// Modules
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// Use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Access static files
const staticFiles = express.static(path.join(__dirname, "../client/build"));
app.use(staticFiles);

// Start router
const router = express.Router();

// Api test message
router.get("/api/test", (req, res) => {
  res.json({ message: "This was sent from server. ❤" });
});

// Use router
app.use(router);

// any routes not picked up by the server api will be handled by the react router
app.use("/*", staticFiles);

// Start server
app.set("port", process.env.PORT || 3001);
const server = app.listen(app.get("port"), () => {
  console.log(`Listening on ${app.get("port")}`);
});

// Socket
const io = require("socket.io")(server);
var app_socket = io.of("/im");
app_socket.on("connection", function (socket) {
  console.log("Client connected");

  socket.on("disconnect", function () {
    console.log("Client disconnected");
  });

  socket.on("join", function (room) {
    socket.join(room);
  });

  socket.on("msg", function (room, data) {
    io.of("/im").to(room).emit("msg", data);
  });
});
