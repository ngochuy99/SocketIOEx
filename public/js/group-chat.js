{const mediaStreamConstraints = {
    video: true,
    audio: true
  };
  //set local media
    const localVideo=document.querySelector('video#MyVideo');
    var remoteVideo;
    var localStream;
    var peerlist=[]
    var number=2;
    const unique = (value, index, self) => {
        return self.indexOf(value) === index
      }
      
    var peer = new Peer({key: 'lwjd5qra8257b9'});
    peer.on('open', function(id){
        socket.emit('peer-id',peer.id);
    });
    socket.on('group-response',function(list,caller){
            $('#groupmodal').modal('show');
            $('#addmem').prop("disabled",true);
            $('#add-member').prop("disabled",true); 
            navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
                .then(stream=>{
                    localVideo.srcObject=stream;
                    localStream=stream;
                }).then(function(){
                    var call;
                    for(var member=0;member<list.length;member++){
                        call=peer.call(list[member],localStream);
                        call.on('stream',(remoteStream)=>{
                            console.log('trigger' + number);
                            console.log(remoteStream)
                        if(number==2||number==3){
                            remoteVideo=document.querySelector('video#RemoteVideo2');
                        }
                        else if(number==4||number==5){
                            remoteVideo=document.querySelector('video#RemoteVideo3');
                        }
                        else if(number==6||number==7){
                            remoteVideo=document.querySelector('video#RemoteVideo4');
                        }
                        else if(number==8||number==9){
                            remoteVideo=document.querySelector('video#RemoteVideo5');
                        }
                        //function call.on('stream') will occur twice cause the stream has two tracks include video and audio!
                        number++;
                        remoteVideo.srcObject=remoteStream;
                        })
                        }
                    $("#groupmodal").on("hidden.bs.modal",function(){
                        call.close();
                        console.log('modal hide!');
                        number=2;
                        localStream.getTracks().forEach(track=>track.stop());
                        peerlist=[];
                        $('#addmem').prop("disabled",false);
                        $('#add-member').prop("disabled",false); 
                    })   
                    list.push(peer.id);
                    socket.emit('list-update',list,caller);   
        })
    })
    peer.on('call',function(call){
        call.answer(localStream);
        call.on('stream',(remoteStream)=>{
            if(number==2||number==3){
                remoteVideo=document.querySelector('video#RemoteVideo2');
            }
            else if(number==4||number==5){
                remoteVideo=document.querySelector('video#RemoteVideo3');
            }
            else if(number==6||number==7){
                remoteVideo=document.querySelector('video#RemoteVideo4');
            }
            else if(number==8||number==9){
                remoteVideo=document.querySelector('video#RemoteVideo5');
            }
            //function call.on('stream') will occur twice cause the stream has two tracks include video and audio!
            remoteVideo.srcObject=remoteStream;
            number++;
        })
        $("#groupmodal").on("hidden.bs.modal",function(){
            console.log('modal hide!');
            call.close();
            number=2;
            localStream.getTracks().forEach(track=>track.stop());
            peerlist=[];
            $('#addmem').prop("disabled",false);
            $('#add-member').prop("disabled",false); 
        })
    })
    $("#groupmodal").on("hidden.bs.modal",function(){
        console.log('modal hide!');
        number=2;
        localStream.getTracks().forEach(track=>track.stop());
        peerlist=[];
        $('#addmem').prop("disabled",false);
        $('#add-member').prop("disabled",false); 
    })
    //member list update 
    socket.on('host-update',function(list){
        peerlist=list.filter(unique);
    })
    function HostNewGroup(){
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(stream=>{
            localVideo.srcObject=stream;
            localStream=stream;
        })
        peerlist.push(peer.id);
        return
    }
    function AddMember(){
        des=$('#add-member').val();
        socket.emit('group-request',peerlist,des);
        return
    }
    }
