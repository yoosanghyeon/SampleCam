// const socket = io('ws://211.119.132.242:3001/');
const socket = io('ws://localhost:3001/');
socket.connect();

const video = document.querySelector('video');


var canvas = document.getElementById("preview");
var context = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 700;

context.width = canvas.width;
context.height = canvas.height;

const constraints = {
  "audio": false,
  "video": true
}
function handleSuccess(stream) {
  console.log('click')
  const video = document.querySelector('video');
  const videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log(`Using video device: ${videoTracks[0].label}`);
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  if (error.name === 'OverconstrainedError') {
    const v = constraints.video;
    errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
  } else if (error.name === 'NotAllowedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    if(e){
      e.target.disabled = true;
    }
    setInterval(function(){
      Draw(video,context);
    },0.1);
  } catch (e) {
    handleError(e);
  }
}

init();




function Draw(video,context){
  context.drawImage(video,0,0,640,480);
  // console.log(canvas.toDataURL('image/webp'))
  socket.emit("video", canvas.toDataURL('image/webp'));
}