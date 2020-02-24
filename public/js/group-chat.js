{const mediaStreamConstraints = {
    video: true,
    audio: true
  };
  //set local media
    const localVideoGroup=document.querySelector('video#MyVideo');
    var remoteVideo;
    var localStream;
    var peerlist=[],member=[];
    var number=2,type=1;
    const unique = (value, index, self) => {
        return self.indexOf(value) === index
      }
    socket.on('group-response',function(list,caller){
        type=2;
        if(busy===true){
            socket.emit('group-busy',caller);
            }
        else{
            $('#caller-group').append('<h3 class="text-success">'+caller+' is calling (group)</h3><br>');
            $('#call-incoming-group').modal('show');
            //close
            $("#groupmodal").on("hidden.bs.modal",function(){
                number=2;
                localStream.getTracks().forEach(track=>track.stop());
                peerlist=[];
            })
            $("#call-incoming-group").on("hide.bs.modal",function(){
                $('#caller-group').empty(); 
            })
            //decline
            $('#deny-group').click(function(){
                $('#caller-group').empty();
                socket.emit('group-decline',caller);
            })
            //accept
            $('#accept-group').click(function(event){
                busy=true;
                list=list.filter(unique);
                event.stopPropagation();
                event.stopImmediatePropagation();
                //Fix occur many times
                $('#call-incoming-group').modal('hide');
                $('#groupmodal').modal('show');
                $('#caller-group').empty();
                navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
                    .then(stream=>{
                        localVideoGroup.srcObject=stream;
                        localStream=stream;
                    }).then(function(){
                        var call;
                        for(var member=0;member<list.length;member++){
                            if(list[member]!=peer.id){
                                call=peer.call(list[member],localStream);
                                call.on('stream',(remoteStream)=>{
                                    appendvideo(number,remoteStream.id);
                                //function call.on('stream') will occur twice cause the stream has two tracks include video and audio!
                                number++;
                                remoteVideo.srcObject=remoteStream;
                                $("#groupmodal").on("hidden.bs.modal",function(event){
                                    event.stopPropagation();
                                    event.stopImmediatePropagation();
                                    resethtml(call);
                                })
                                })
                            }
                        }   
                        list.push(peer.id);
                        socket.emit('list-update',list,caller,clientname);   
            })
            })
        }
    })
    peer.on('call',function(call){
        if(type==1){
          call.answer(localStream);
          call.on('stream',function(remoteStream){
            const remoteVideo=document.querySelector('video#remoteVideo');
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
        }
        else{
                  call.answer(localStream);
                  call.on('stream',(remoteStream)=>{
                      appendvideo(number,remoteStream.id);
                      //function call.on('stream') will occur twice cause the stream has two tracks include video and audio!
                      remoteVideo.srcObject=remoteStream;
                      number++;
                  })
                  $("#groupmodal").on("hidden.bs.modal",function(event){
                      event.stopPropagation();
                      event.stopImmediatePropagation();
                      resethtml(call);
                  })
        }
        });
      
    //member list update 
    socket.on('host-update',function(list,name){
        peerlist=list.filter(unique);
        member.push(name);
        socket.emit('member-update',member,peerlist);
    })
    socket.on('mem-update',function(list,memberlist){
        peerlist=list;
        member=memberlist;
    })
    socket.on('group-alr-busy',function(){
        window.alert('Already in room!');
    })
    socket.on('closed',function(remain,id){
        member=remain;
        document.getElementById(id).remove();
        number=number-2;
    })
    socket.on('change-type-2',function(){
        type=2;
    })
    function HostNewGroup(){
        type=2;
        member.push(clientname);
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(stream=>{
            localVideoGroup.srcObject=stream;
            localStream=stream;
        })
        peerlist.push(peer.id);
        busy=true;
        $("#groupmodal").on("hidden.bs.modal",function(){
            busy=false;
            number=2;
            localStream.getTracks().forEach(track=>track.stop());
            peerlist=[];
        })
        return
    }
    function AddMember(){
        des=$('#add-member').val();
        if(des==="Chatroom"){
            window.alert('Only person available!');
            return;
        }
        for(var i=0;i<member.length;i++){
            if(member[i]==des){
                window.alert('Already in room!');
                return;
            }
        }
        if(number<10){
            socket.emit('change-type-group',des);
            socket.emit('group-request',peerlist,des);
        }
        else{
            window.alert('Only available up to 5 people!');
        }
    }
    function resethtml(call){
        call.close();
        var sendlist=[];
        for(var i=0;i<member.length;i++){
            if(member[i]!=clientname) sendlist.push(member[i]);
        }
        socket.emit('endcall',sendlist,localStream.id);
        busy=false;
        number=2;
        localStream.getTracks().forEach(track=>track.stop());
        peerlist=[];
        member=[];
        $('#videocontain').empty();
    }
    function appendvideo(number,id){
        busy=true;
        if(number%2==0){
            $('#videocontain').append('<video class="col-5.5 mr-2" width="500" height="250" controls  id="'+id+'" autoplay></video>')
        }
        remoteVideo=document.getElementById(id);
    }
    }