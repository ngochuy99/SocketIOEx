var express=require('express');
var app=express();
var http=require('http').createServer(app);
var io= require('socket.io')(http);
app.use(express.static('public'));
app.set('view engine', 'html');
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/snake',function(req,res){
    res.sendFile(__dirname + '/snake.html');
});
var Userlist={};
var ID={};
var room={};
io.on('connection',function(socket){
    socket.on('NewUser',function(username,id,roomid){
        socket.username=username;
        Userlist[username]=username;
        ID[username]=id;
        socket.roomid=roomid;
        room[username]=roomid;
        socket.join(roomid);
        socket.emit('notify','You have joined chatroom ' +roomid);
        socket.broadcast.to(socket.roomid).emit('notify',socket.username+' have connected!');
        var local={};
        for(people in Userlist){
            if(room[people]==socket.roomid)  local[people]=people;
        }
        io.to(socket.roomid).emit('update',local);
        io.emit('select',Userlist,socket.username);
    })
    socket.on('sendmes',function(data){
        io.to(socket.roomid).emit('post',socket.username,"      "+data);
    })
    //disconnect-api
    socket.on('leave-room',function(roomid){
        socket.leave(socket.roomid);
        socket.emit('disconnect');
        socket.roomid=roomid;
        room[socket.username]=socket.roomid;
        Userlist[socket.username]=socket.username;
        socket.join(roomid);
        socket.emit('notify','You have joined chatroom ' +roomid);
        socket.broadcast.to(socket.roomid).emit('notify',socket.username+' have connected!');
        var local={};
        for(people in Userlist){
            if(room[people]==socket.roomid)  local[people]=people;
        }
        io.to(socket.roomid).emit('update',local);
    })

    socket.on('disconnect',function(){
        delete Userlist[socket.username];
        delete room[socket.username];
        io.to(socket.roomid).emit('leave',socket.username+' has left');
        var local={};
        for(people in Userlist){
            if(room[people]==socket.roomid)  local[people]=people;
        }
        io.to(socket.roomid).emit('update',local);
    })
    //private-message-api
    socket.on('private',function(data,id){
        var receive='To '+id;
        var sender ='From '+socket.username;
        socket.emit('post-private',receive,data);
        io.to(ID[id]).emit('post-private',sender,data);
    })
    //videocall-api
    socket.on('peer-id',function(data){
        socket.peerid=data;
    })

    socket.on('request',function(calling,stream){
        socket.to(ID[calling]).emit('response',socket.username);
    })
    socket.on('accept',function(data,name){
        socket.to(ID[name]).emit('ok',data);
    })
    socket.on('busy',function(name){
        socket.to(ID[name]).emit('alr-busy');
    })
    
    socket.on('deny',function(name){
        socket.to(ID[name]).emit('not-ok');
    })
    //change-name-api
    socket.on('change-name',function(newname){
        for(name in Userlist){
            if(name==newname){
                socket.emit('name-invalid');
                return;
            }
        }
        var oldname=socket.username;
        delete Userlist[oldname];
        Userlist[newname]=newname;
        ID[newname]=ID[oldname];
        delete ID[oldname];
        room[newname]=room[oldname];
        delete room[oldname];
        socket.username=newname;
        socket.join(room[newname]);
        socket.emit('notify','You have joined chatroom ' +socket.roomid);
        socket.broadcast.to(socket.roomid).emit('notify',socket.username+' have connected!');
        var local={};
        for(people in Userlist){
            if(room[people]==socket.roomid)  local[people]=people;
        }
        io.to(socket.roomid).emit('update',local);
        io.emit('select',Userlist);
    })
    //a person is typing
    socket.on('typing',function(data,name){
        socket.broadcast.to(socket.roomid).emit('noti-type',data,name);
    })
    socket.on('stop-typing',function(name){
        socket.broadcast.to(socket.roomid).emit('unnoti-type',name);
    })
    //group-video-call-api
    socket.on('group-request',function(list,name){
        socket.to(ID[name]).emit('group-response',list,socket.username);
    })
    socket.on('list-update',function(list,host,name){
        socket.to(ID[host]).emit('host-update',list,name);
    })
    socket.on('member-update',function(memberlist,peerlist){
        for(var index=0;index<memberlist.length;index++){
            socket.to(ID[memberlist[index]]).emit('mem-update',peerlist,memberlist);
        }
    })
    socket.on('group-busy',function(name){
        socket.to(ID[name]).emit('group-alr-busy');
    })
    socket.on('endcall',function(member,id){
        for(var index=0;index<member.length;index++){
            socket.to(ID[member[index]]).emit('closed',member,id);
        }
    })
})
http.listen(process.env.PORT||3000,function(){
    console.log('Sever is running on port '+3000);
})