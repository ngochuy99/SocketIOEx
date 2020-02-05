const mediaStreamConstraints = {
  video: true,
  audio: true
};
//set local media
const localVideo=document.querySelector('video#localVideo');
const remoteVideo=document.querySelector('video#remoteVideo');
var localStream;
var peer = new Peer({key: 'lwjd5qra8257b9'});
peer.on('open', function(id) {
  socket.emit('peer-id',peer.id);
  console.log('My peer ID is: ' + id);
});

socket.on('response',function(data){
  //accept or decline
  //console.log(data);
  $('#videomodal').modal('show');
  response(data);
})
socket.on('ok',function(data){
    var call=peer.call(data,localStream);
    console.log('gethere');
    call.on('stream', (remoteStream) => {
      remoteVideo.srcObject = remoteStream
    });
})
peer.on('call',function(call){
  console.log('called!');
  call.answer(localStream);
  call.on('stream',function(remoteStream){
    remoteVideo.srcObject=remoteStream;
  })
});
//stream
function sendrequest(){
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(stream=>{
    localStream=stream;
    localVideo.srcObject=stream;
    socket.emit('request',$('#id').val());  
    console.log(localStream);
  });
}
function response(data){
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(stream=>{
    localStream=stream;
    localVideo.srcObject=stream;
    socket.emit('accept',peer.id,data)
})
}
