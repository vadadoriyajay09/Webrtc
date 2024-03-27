var socket = io();

var videoChatForm = document.getElementById("video-chat-form");
var videoChatRooms = document.getElementById("video-chat-rooms");
var joinBtn = document.getElementById("join");
var roomInput = document.getElementById("roomName");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
// upgrade work
var Button_Group = document.getElementById("Button_Group");
var MuteBtn = document.getElementById("muteBtn");
var Hidecamara = document.getElementById("Hidecamara");
var LeaveRoombtn = document.getElementById("LeaveRoom");

var mutefleg = false;
var hidecamareflg = false;

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

MuteBtn.addEventListener("click", function () {
  mutefleg = !mutefleg;
  if (mutefleg) {
    MuteBtn.textContent = "Un Mute Mic";
    userStream.getTracks()[0].enabled = false;
  } else {
    MuteBtn.textContent = "Mute Mic";
    userStream.getTracks()[0].enabled = true;
  }
});

Hidecamara.addEventListener("click", function () {
  hidecamareflg = !hidecamareflg;
  if (hidecamareflg) {
    Hidecamara.textContent = "Showcamara";
    userStream.getTracks()[1].enabled = false;
    Hidecamara.poster =
      "https://southsafe.ie/wp-content/uploads/2021/02/Lenovo.png";
    // const image = document.createElement("img");
    // image.src = "https://southsafe.ie/wp-content/uploads/2021/02/Lenovo.png";
    // document.querySelector("#user-video").appendChild(image);
  } else {
    Hidecamara.textContent = "Hide camara";
    userStream.getTracks()[1].enabled = true;
  }
});

socket.on("created", function () {
  creator = true;
  navigator.getUserMedia(
    {
      audio: true,
      video: {
        width: 500,
        height: 500,
      },
    },
    function (stream) {
      userStream = stream;
      videoChatForm.style = "display:none";
      Button_Group.style = "display:flex";
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
        width: 500,
        height: 500,
      },
    },
    function (stream) {
      userStream = stream;
      videoChatForm.style = "display:none";
      Button_Group.style = "display:flex";
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
    console.log(userStream.getTracks()[1], "======");
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
    console.log(userStream.getTracks()[1], "======");
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

// Leave btn
LeaveRoombtn.addEventListener("click", function () {
  socket.emit("leave", roomName);
  videoChatForm.style = "display:block";
  Button_Group.style = "display:none";

  if (userVideo.srcObject) {
    userVideo.srcObject.getTracks()[0].stop();
    userVideo.srcObject.getTracks()[1].stop();
  }
  if (peerVideo.srcObject) {
    peerVideo.srcObject.getTracks()[0].stop();
    peerVideo.srcObject.getTracks()[1].stop();
  }
});
socket.on("leave", function () {});

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
