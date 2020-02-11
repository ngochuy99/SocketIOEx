            var socket=io.connect();
            var clientname;
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
            //ClearChatbox
            $('#refresh').click(function(e){
            $('#messages').empty();
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
            $('#messages').append('<li><b class="text-danger">'+username+'</b></li>');
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
            $("#messages").append('<div class="text-danger"><b class="text-danger">'+name+'</b>:<br>'+data);
            $('#box').stop().animate ({scrollTop: $('#box')[0].scrollHeight});
            $('#m').focus();
            })
            //Update Private message destination
            socket.on('select',function(list){
            $('#id').empty();
            $('#id').append('<option >Chatroom</option>');
            $.each(list,function(user){
                if(user!='null'&&user!=clientname)
                $('#id').append('<option>'+user+'</option>');
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
            $('#messages').append('<li><b class="text-danger">'+data+'</b></li>');
            $('#box').stop ().animate ({scrollTop: $('#box')[0].scrollHeight});
            })
            //change name
            $('#Save').click(function(){
                clientname=$('#Username').val();
                $('#Save').prop("disabled",true);
                $('#Username').prop("disabled",true);
                socket.emit('change-name',$('#Username').val());
            })
            $('#Username').keypress(function(e){
                if(e.which==13){
                clientname=$('#Username').val();
                $('#Save').prop("disabled",true);
                $('#Username').prop("disabled",true);
                socket.emit('change-name',$('#Username').val());
            }
            })
        })
