{const mediaStreamConstraints = {
  video: true,
  audio: true
};
//set local media
const localVideo=document.querySelector('video#localVideo');
const remoteVideo=document.querySelector('video#remoteVideo');
var localStream,MyStream;
var call,number=1;
var peerid=[],Allstream=[];
var busy=false,group=false;
var peer = new Peer({key: 'lwjd5qra8257b9'});
peer.on('open', function(id){
  socket.emit('peer-id',peer.id);
});
//one-to-one call
socket.on('response',function(data){
  if(busy===true){
    socket.emit('busy',data);
  }
  else{
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
    $('#caller').empty();
  })
  }
})
socket.on('not-ok',function(){
  $('#videomodal').modal('hide');
  window.alert('The call was refused!');
  localStream.getTracks().forEach(track=>track.stop());
  $('#face-time').prop("disabled",false); 
  $('#videomodal').modal('hide');
})
socket.on('ok',function(data){
    var call=peer.call(data,localStream);
    call.on('stream', (remoteStream) => {
      busy=true;
      remoteVideo.srcObject = remoteStream;
    });
    $("#videomodal").on("hidden.bs.modal", function() {
      call.close();
      busy=false;
      localStream.getTracks().forEach(track=>track.stop());
      $('#face-time').prop("disabled",false); 
    });
    call.on('close',function(){
      busy=false;
      localStream.getTracks().forEach(track=>track.stop());
      $('#face-time').prop("disabled",false); 
      $('#videomodal').modal('hide');
    })
})
socket.on('alr-busy',function(){
  $('#videomodal').modal('hide');
  window.alert("Can't call right now!");
  localStream.getTracks().forEach(track=>track.stop());
  $('#face-time').prop("disabled",false); 
  $('#videomodal').modal('hide');
})
peer.on('call',function(call){
  call.answer(localStream);
  call.on('stream',function(remoteStream){
    busy=true;
    remoteVideo.srcObject=remoteStream;
  })
  $("#videomodal").on("hidden.bs.modal", function() {
    call.close();
    busy=false;
    localStream.getTracks().forEach(track=>track.stop());
    $('#face-time').prop("disabled",false); 
  });
  call.on('close',function(){
    busy=false;
    localStream.getTracks().forEach(track=>track.stop());
    $('#face-time').prop("disabled",false); 
    $('#videomodal').modal('hide');
  })
});

//stream
function sendrequest(){
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
function handleerror(err){
  $('#videomodal').modal('hide');
  window.alert('Enable your webcam and micro!');
}
}
