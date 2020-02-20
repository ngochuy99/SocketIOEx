{const mediaStreamConstraints = {
    video: true,
    audio: true
  };
  //set local media
    const localVideo=document.querySelector('video#MyVideo');
    var remoteVideo;
    var localStream;
    var peerlist=[],member=[];
    var number=2;
    const unique = (value, index, self) => {
        return self.indexOf(value) === index
      }
      
    var peer = new Peer({key: 'lwjd5qra8257b9'});
    peer.on('open', function(id){
        socket.emit('peer-id',peer.id);
    });
    socket.on('group-response',function(list,caller){
        if(busy===true){
            socket.emit('group-busy',caller);
            }
        else{
            $('#caller').append('<h3 class="text-danger">'+caller+' is calling (group)</h3><br>');
            $('#call-incoming').modal('show');
            //close
            $("#groupmodal").on("hidden.bs.modal",function(){
                number=2;
                localStream.getTracks().forEach(track=>track.stop());
                peerlist=[];
            })
            $("#call-incoming").on("hide.bs.modal",function(){
                $('#caller').empty(); 
            })
            //decline
            $('#deny').click(function(){
                $('#caller').empty();
                socket.emit('group-decline',caller);
            })
            //accept
            $('#accept').click(function(event){
                busy=true;
                list=list.filter(unique);
                event.stopPropagation();
                event.stopImmediatePropagation();
                //Fix occur many times
                $('#call-incoming').modal('hide');
                $('#groupmodal').modal('show');
                $('#caller').empty();
                navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
                    .then(stream=>{
                        localVideo.srcObject=stream;
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
    })
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
    function HostNewGroup(){
        member.push(clientname);
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
        .then(stream=>{
            localVideo.srcObject=stream;
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
        socket.emit('group-request',peerlist,des);
        }
        else{
            window.alert('Only available up to 5 people!');
        }
    }
    function resethtml(call){
        call.close();
        console.log(member);
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
        busy=true
        if(number%2==0){
            $('#videocontain').append('<video class="col-5.5 mr-2" width="500" height="250"  id="'+id+'" autoplay></video>')
        }
        remoteVideo=document.getElementById(id);
    }
    }