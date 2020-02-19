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
                $('#row11').empty();
                $('#row12').empty();
                $('#row21').empty();
                $('#row22').empty();
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
                                    appendvideo(number);
                                //function call.on('stream') will occur twice cause the stream has two tracks include video and audio!
                                number++;
                                remoteVideo.srcObject=remoteStream;
                                $("#groupmodal").on("hidden.bs.modal",function(){
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
            appendvideo(number);
            //function call.on('stream') will occur twice cause the stream has two tracks include video and audio!
            remoteVideo.srcObject=remoteStream;
            number++;
        })
        $("#groupmodal").on("hidden.bs.modal",function(){
            resethtml(call);
        })
    })
    //member list update 
    socket.on('host-update',function(list,name){
        peerlist=list.filter(unique);
        member.push(name);
        socket.emit('member-update',member,peerlist);
    })
    socket.on('mem-update',function(list){
        peerlist=list;
    })
    socket.on('group-alr-busy',function(){
        window.alert('Already in room!');
    })
    function HostNewGroup(){
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
            $('#row11').empty();
            $('#row12').empty();
            $('#row21').empty();
            $('#row22').empty();
            $('#addmem').prop("disabled",false);
            $('#add-member').prop("disabled",false); 
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
        busy=false;
        number=2;
        localStream.getTracks().forEach(track=>track.stop());
        peerlist=[];
        $('#row11').empty();
        $('#row12').empty();
        $('#row21').empty();
        $('#row22').empty();
        $('#addmem').prop("disabled",false);
        $('#add-member').prop("disabled",false);     
    }
    function appendvideo(number){
        busy=true
            if(number==2||number==3){
                if(number==2){
                    $('#row11').append('<video width="500" height="250"  id="RemoteVideo2" autoplay></video>')
                }
                remoteVideo=document.querySelector('video#RemoteVideo2');
            }
            else if(number==4||number==5){
                if(number==4){
                    $('#row12').append('<video width="500" height="250"  id="RemoteVideo3" autoplay></video>')
                }
                remoteVideo=document.querySelector('video#RemoteVideo3');
            }
            else if(number==6||number==7){
                if(number==6){
                    $('#row21').append('<video width="500" height="250"  id="RemoteVideo4" autoplay></video>')
                }
                remoteVideo=document.querySelector('video#RemoteVideo4');
            }
            else if(number==8||number==9){
                if(number==8){
                    $('#row22').append('<video width="500" height="250"  id="RemoteVideo5" autoplay></video>')
                }
                remoteVideo=document.querySelector('video#RemoteVideo5');
            }
    }
    }