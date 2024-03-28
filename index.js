require("dotenv").config();

const express = require("express");
const app = express();

var mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://vadadoriyajay09:WMbMwi7Hv2jycnR8@webrtc.jitxqnq.mongodb.net/video-call-app?retryWrites=true&w=majority&appName=webrtc"
);

app.listen(3000, () => {
  console.log("Server is running");
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// websocket code
var websocketserv = require("ws").Server;

var wss = new websocketserv({
  port: 8000,
});
wss.on("connection", function (conn) {
  console.log("user connect");
  conn.on("message", function (params) {});
});
