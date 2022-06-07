// const socket = io('ws://211.119.132.242:3001');
const socket = io('ws://localhost:3001');
socket.connect();

const video = document.querySelector('video');


var canvas = document.getElementById("preview");
var context = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

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
    setInterval(async function(){
      await Draw(video,context);
    },41);
  } catch (e) {
    console.log(e)
    // handleError(e);
  }
}

init();




async function Draw(video,context){
  context.drawImage(video,0,0,500,500);
  await getJpegBytes(canvas).then((data) =>{
    socket.volatile.emit("stream", data)
  }).catch(error => {
    console.log(error)
  })
}

// function Draw(video,context){
//   context.drawImage(video,0,0,300,300);
//   // console.log(canvas.toDataURL('image/webp'))
//   socket.emit("stream", canvas.toDataURL('image/jpeg'));
// }



async function getJpegBytes(canvas) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.addEventListener('loadend', function () {
      if (this.error) {
        reject(this.error)
      } else {
        // 순서
        // Canvas -> arrayBuffer -> ByteBuffer 40kb
        var bytes = new Uint8Array(this.result);
        resolve(bytes);
      }
    })

    canvas.toBlob(blob => fileReader.readAsArrayBuffer(blob), 'image/jpeg')
  })
}