            var socket=io.connect();
            var clientname;
            var typechat=false;

            socket.on('connect',function(){
            num=Math.floor(Math.random() * 100000)
            var name,roomid;	

            name="Guest "+num;
            roomid="Guest";
            clientname=name;
            socket.emit('NewUser',name,socket.id,roomid);
            $('#room').append(roomid);
            })
        $(document).ready(function(){
            //init
            var today = new Date();   
            window.alert('Take a Name to start chatting!');
            $('#Username').focus();
            //ClearChatbox
            $('#refresh').click(function(e){
            $('#messages').empty();
            e.preventDefault();
            })
            $('#private-refresh').click(function(e){
                $('#private-mes').empty();
                e.preventDefault();
                })
            //LeaveRoom
            $("#join").click(function(e){
            if(!(roomid=$("#Room").val()))
            roomid="Guest";
            socket.emit('leave-room',roomid);
            e.preventDefault();
            $('#room').empty().append('Room: '+roomid);
            });
            $('#Room').keypress(function(e){
                if(e.which==13){
                    if(!(roomid=$("#Room").val()))
                    roomid="Guest";
                    socket.emit('leave-room',roomid);
                    e.preventDefault();
                    $('#room').empty().append('Room: '+roomid);
                    }
            })

            //Notify A member joined chatroom
            socket.on('notify',function(username){
            if($(".text-warning").length){
                $(".text-warning").first().before('<tr><td><b class="text-danger">'+username+'</b></td></tr>');
            }
            else{
            $('#messages').append('<tr><td><b class="text-danger">'+username+'</b></td></tr>');
            }
            $('#box').scrollTop($('#box').height());
            })

            //Submit Member information
            $(function(){
            $('#form-submit').click(function(e){
            if($('#m').val()!=''){
            var message=$('#m').val();
            $('#m').val('');
            e.preventDefault();
            if($('#id').val()!='Chatroom'){
                socket.emit('private',message,$('#id').val());
            }
            else
            socket.emit('sendmes',message);
            }
            })
            $('#m').keypress(function(e){
            if(e.which==13){
                if($('#m').val()!=''){
                var message=$('#m').val();
                $('#m').val('');
                e.preventDefault();
                if($('#id').val()!='Chatroom'){
                socket.emit('private',message,$('#id').val());
                }
                else{
                socket.emit('sendmes',message);
                $(this).blur();
                }
            }
            }
            })
        });
            //Send messages to chatroom
            socket.on('post',function(name,data){
            if($(".text-warning").length){
                //Check if someone is typing
                $(".text-warning").first().before('<div class="text-danger"><b class="text-danger">'+name+'</b>:<br>'+data+' <span class="time-right">'+today.getHours()+':'+today.getMinutes()+'</span></div>');
                $('#box').stop().animate ({scrollTop: $('#box')[0].scrollHeight});
            }
            else{
            $("#messages").append('<div class="text-danger"><b class="text-danger">'+name+'</b>:<br>'+data+' <span class="time-right">'+today.getHours()+':'+today.getMinutes()+'</span></div>');
            }
            $('#box').stop().animate ({scrollTop: $('#box')[0].scrollHeight});
            $('#m').focus();
            })
            //send private message
            socket.on('post-private',function(name,data){
                $("#private-mes").append('<div class="text-danger"><b class="text-danger">'+name+'</b>:<br>'+data+' <span class="time-right">'+today.getHours()+':'+today.getMinutes()+'</span></div>');
                $('#inbox').stop().animate ({scrollTop: $('#inbox')[0].scrollHeight});
                $('#m').focus();
            })
            //Update Private message destination
            socket.on('select',function(list){
            $('.id').empty();
            $('.id').append('<option >Chatroom</option>');
            $.each(list,function(user){
                if(user!='null'&&user!=clientname)
                $('.id').append('<option>'+user+'</option>');
            })
            })
            //update online Member
            socket.on('update',function(list){
            $('#users').empty();
            $.each(list,function(user){
                if(user!='null')
                $('#users').append('<div class="text-danger">'+user+'</div>');
            })
            })
            //Detect a Member left the room
            socket.on('leave',function(data){
            if($(".text-warning").length){
                $(".text-warning").first().before('<tr><td><b class="text-danger">'+data+'</b></td></tr>');
            }
            else{
            $('#messages').append('<tr><td><b class="text-danger">'+data+'</b></td></tr>');
            }
            $('#box').stop ().animate ({scrollTop: $('#box')[0].scrollHeight});
            })
            //change name
            $('#Save').click(function(){
                clientname=$('#Username').val();
                $('#Save').prop("disabled",true);
                $('#Username').prop("disabled",true);
                $('.id').prop("disabled",false);
                $('#form-submit').prop("disabled",false);
                $('#m').prop("disabled",false);
                $('#face-time').prop("disabled",false);
                $('#emoji').prop('disabled',false);
                $('#game').prop('disabled',false);
                $('#group-chat').prop('disabled',false);
                socket.emit('change-name',$('#Username').val());
            })
            $('#Username').keypress(function(e){
                if(e.which==13){
                clientname=$('#Username').val();
                $('#Save').prop("disabled",true);
                $('#Username').prop("disabled",true);
                $('.id').prop("disabled",false);
                $('#form-submit').prop("disabled",false);
                $('#m').prop("disabled",false);
                $('#face-time').prop("disabled",false);
                $('#emoji').prop('disabled',false);
                $('#game').prop('disabled',false);
                $('#group-chat').prop('disabled',false);
                socket.emit('change-name',$('#Username').val());
            }
            })
            socket.on('name-invalid',function(){
                window.alert('Name has already exist!');
                $('#Save').prop("disabled",false);
                $('#Username').prop("disabled",false);
                $('#Username').focus();
            })
            //A person is typing
            $('#m').keyup(function(){
                if($('#id').val()==='Chatroom'){    
                    if(typechat==false){
                        typechat=true;
                        data=clientname+' is typing . . .';
                        socket.emit('typing',data,clientname);
                        timeout=setTimeout(CheckifTyping(),1000);
                    }
                    else{
                        clearTimeout(timeout);
                        timeout=setTimeout(CheckifTyping(),1000);
                    }
                }
                })
            function CheckifTyping(){
                if(!$('#m').val()){
                    typechat=false;
                    socket.emit('stop-typing',clientname);
                }
            }
            socket.on('noti-type',function(data,name){
                $('#messages').append('<tr><td><b class="text-warning" id='+name+'>'+data+'</b></li></tr>');
            })
            socket.on('unnoti-type',function(name){
                $('#'+name).remove();
            })
        })