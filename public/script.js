const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
//to get the video and audio strreams
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
     //anwsering the call
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        //getting user media stream
        addVideoStream(video, userVideoStream);
        // console.log("i am working");
      });
    });
        //when a user connect (async functions)
    socket.on("user-connected", (userId) => {
      // user is joining
      setTimeout(() => {
        // user joined
        connectToNewUser(userId, stream);
      }, 1000);
    });
     
    // chat section the
    // using jquery to get text 
    let text = $("input"); //targetting input field

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        // console.log(text.val());
        socket.emit("message", text.val());
        text.val("");
      } // got text messages
    });

    socket.on("createMessage", (message) => {
      $(".messages").append(
        `<li class = "message"><b>user</b><br/>${message}</li>`
      );// displaying messages over frontend
      scrollToBottom();
    });
  });
 // getting a room id
peer.on("open", (id) => {
  // console.log(id);
  socket.emit("join-room", ROOM_ID, id);
}); 
 // calling another person
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};
 
// videostreams function
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

// chats scrolling function
const scrollToBottom = () => {
  let d = $(".main-chat-window");
  d.scrollTop(d.prop("scrollHeight"));
};

// play contols
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main-mute-button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main-mute-button').innerHTML = html;
}
const playStop = () => {
  
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main-video-button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main-video-button').innerHTML = html;
}