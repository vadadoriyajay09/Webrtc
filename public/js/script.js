var socket = io();

var videoChatForm = document.getElementById("video-chat-form");
var videoChatRooms = document.getElementById("video-chat-rooms");
var joinBtn = document.getElementById("join");
var roomInput = document.getElementById("roomName");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");

var roomName = roomInput.value;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

var creator = false;

var rtcPeerConnection;
var userStream;
var iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun1.1.google.com:19302" },
  ],
};

joinBtn.addEventListener("click", function () {
  if (roomInput.value == "") {
    alert("Please enter a room name!");
  } else {
    socket.emit("Join", roomName);
  }
});

socket.on("created", function () {
  creator = true;
  navigator.getUserMedia(
    {
      audio: true,
      video: {
        width: 1280,
        height: 720,
      },
    },
    function (stream) {
      userStream = stream;
      videoChatForm.style = "display:none";
      userVideo.srcObject = stream;
      userVideo.onloadedmetadata = function (e) {
        userVideo.play();
      };
      socket.emit("ready", roomName);
    },
    function (error) {
      console.log("You Can't access Media");
    }
  );
});

socket.on("joined", function () {
  creator = false;
  navigator.getUserMedia(
    {
      audio: true,
      video: {
        width: 1280,
        height: 720,
      },
    },
    function (stream) {
      userStream = stream;
      videoChatForm.style = "display:none";
      userVideo.srcObject = stream;
      userVideo.onloadedmetadata = function (e) {
        userVideo.play();
      };
      socket.emit("ready", roomName);
    },
    function (error) {
      console.log("You Can't access Media");
    }
  );
});

socket.on("full", function () {
  alert("Room is full, You can't join room!");
});

socket.on("ready", function () {
  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream); // for audio
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream); // for video
    rtcPeerConnection.createOffer(
      function (offer) {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName);
      },
      function (error) {
        console.log(error);
      }
    );
  }
});

socket.on("candidate", function (candidate) {
  var iceCandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(iceCandidate);
});

socket.on("offer", function (offer) {
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream); // for audio
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream); // for video
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection.createAnswer(
      function (answer) {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      },
      function (error) {
        console.log(error);
      }
    );
  }
});

socket.on("answer", function (answer) {
  rtcPeerConnection.setRemoteDescription(answer);
});

function OnIceCandidateFunction(event) {
  console.log("🚀 ~ OnIceCandidateFunction ~ event:", event.candidate);
  if (event.candidate) {
    socket.emit("candidate", event.candidate, roomName);
  }
}

function onTrackFunction(event) {
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = function (e) {
    peerVideo.play();
  };
}
