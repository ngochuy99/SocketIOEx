var express=require('express');
var app=express();
var http=require('http').createServer(app);
var io= require('socket.io')(http);
app.use(express.static('public'));
app.get('/',function(req,res){
    res.sendFile(__dirname + '/new_index.html');
});
var Userlist={};
var ID={};
var room={};
//altenative iosocket
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
        socket.emit('post',receive,data);
        io.to(ID[id]).emit('post',sender,data);
    })
    //videocall-api
    socket.on('peer-id',function(data){
        socket.peerid=data;
    })

    socket.on('request',function(calling){
        socket.to(ID[calling]).emit('response',socket.username);
    })
    socket.on('accept',function(data,name){
        socket.to(ID[name]).emit('ok',data);
    })
})

http.listen(process.env.PORT||3000,function(){
    console.log('Sever is running on port '+process.env.PORT);
})