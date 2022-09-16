const socket = io();
var peer = new Peer();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    // videoGrid.append(myVideo);

    peer.on('call', call => {
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
        // videoGrid.append(video);
    });

    socket.on('user-connected', (userId) => {
        // sending my video to others users
        connectToNewUser(userId, stream);
    })
})

socket.on('user-disconnected', userId => {
    if (peer[userId]) peer[userId].close()
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    // sending my video
    const call = peer.call(userId, stream);    
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        // Adding User Stream
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })
    peer[userId] = call;
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video)
} 

let text = $('input');
console.log(text);

$('html').keydown((e) => {
    if(e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
    }
})
socket.on('create-message', (message) => createMessage(message));


const createMessage = (message) => {
    $('ul').append(`<li class"message"><b>user</b><br/>${message}</li>`);
    scrollToBottom();
}

const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
}

const toggleMute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    let html;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;        
        html = `
            <i class='fas fa-microphone-slash'></i>
            <span>Unmute</span>
        `
        document.querySelector('.main__mute_button').innerHTML = html
    } else {
        html = `
            <i class='fas fa-microphone'></i>
            <span>Mute</span>
        `
        document.querySelector('.main__mute_button').innerHTML = html;
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const toggleVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    let html;
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `
            <i class='fas fa-video-slash'></i>
            <span>Start Video</span>
        `
        document.querySelector('.main__video_button').innerHTML = html
    } else {
        html = `
            <i class='fas fa-video'></i>
            <span>Stop Video</span>
        `
        document.querySelector('.main__video_button').innerHTML = html;
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}