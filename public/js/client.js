{const mediaStreamConstraints = {
  video: {facingMode :'user'},
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
  $('#caller').append('<h3 class="text-danger">'+data+' is calling </h3><br>');
  $('#call-incoming').modal('show');
  $('#accept').click(function(){
    $('#call-incoming').modal('hide');
    $('#videomodal').modal('show');
    response(data);
    $('#caller').empty();
    $('#face-time').prop("disabled",true); 
  })
  $('#deny').click(function(){
    socket.emit('deny',data);
  })
})
socket.on('not-ok',function(){
  $('#videomodal').modal('hide');
  window.alert('The call was refused!');
})
socket.on('ok',function(data){
    var call=peer.call(data,localStream);
    call.on('stream', (remoteStream) => {
      remoteVideo.srcObject = remoteStream
    });
    $("#videomodal").on("hidden.bs.modal", function() {
      call.close();
      localStream.getTracks().forEach(track=>track.stop());
      $('#face-time').prop("disabled",false); 
    });
    call.on('close',function(){
      console.log('close');
      localStream.getTracks().forEach(track=>track.stop());
      $('#face-time').prop("disabled",false); 
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
    $('#face-time').prop("disabled",false); 
  });
  call.on('close',function(){
    console.log('close');
    localStream.getTracks().forEach(track=>track.stop());
    $('#face-time').prop("disabled",false); 
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
      $('#face-time').prop("disabled",true);  
  }).catch(handleerror);
  }
  else(window.alert("Call one person pls!"));
}
function response(data){
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
  .then(stream=>{
    localStream=stream;
    localVideo.srcObject=stream;
    socket.emit('accept',peer.id,data)
}).catch(handleerror);
}
}
function handleerror(err){
  $('#videomodal').modal('hide');
  window.alert('Enable your webcam and micro!');
}
