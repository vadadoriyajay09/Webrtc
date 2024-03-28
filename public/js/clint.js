var connection = new WebSocket("ws://localhost:8000");
connection.onopen = function () {
  console.log("Connected to the Server !");
};

var local_video = document.querySelector("#local-video");

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.getUserMedia(
  { audio: true, video: true },
  function (myStream) {
    stream = myStream;
    local_video.srcObject = stream;
  },
  function (error) {
    alert("you can't access media");
  }
);
