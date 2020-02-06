{const mediaStreamConstraints = {
  video: true,
  audio: true
};
//set local media
const localVideo=document.querySelector('video#localVideo');
const remoteVideo=document.querySelector('video#remoteVideo');
var localStream;
var call;
var peer = new Peer({key: 'lwjd5qra8257b9'});
peer.on('open', function(id) {
  socket.emit('peer-id',peer.id);
  // console.log('My peer ID is: ' + id);
});
socket.on('response',function(data){
  //accept or decline
  //console.log(data);
  $('#videomodal').modal('show');
  response(data);
})
socket.on('ok',function(data){
    var call=peer.call(data,localStream);
    call.on('stream', (remoteStream) => {
      remoteVideo.srcObject = remoteStream
    });
    $("#videomodal").on("hidden.bs.modal", function() {
      call.close();
      localStream.getTracks().forEach(track=>track.stop());
    });
    call.on('close',function(){
      console.log('close');
      localStream.getTracks().forEach(track=>track.stop());
      $('#videomodal').modal('hide');
    })
})
peer.on('call',function(call){
  call.answer(localStream);
  call.on('stream',function(remoteStream){
    remoteVideo.srcObject=remoteStream;
  })
  $("#videomodal").on("hidden.bs.modal", function() {
    call.close();
    localStream.getTracks().forEach(track=>track.stop());
  });
  call.on('close',function(){
    console.log('close');
    localStream.getTracks().forEach(track=>track.stop());
    $('#videomodal').modal('hide');
  })
});

//stream
function sendrequest(){
  console.log($('#id').val());
  if($('#id').val()!=='Chatroom'){
    $('#videomodal').modal('show');
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(stream=>{
    localStream=stream;
    localVideo.srcObject=stream;
    socket.emit('request',$('#id').val());  
    console.log(localStream);
  });
  }
  else(window.alert("Call one person pls!"));
}
function response(data){
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(stream=>{
    localStream=stream;
    localVideo.srcObject=stream;
    socket.emit('accept',peer.id,data)
})
}
}