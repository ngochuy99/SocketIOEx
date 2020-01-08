var express=require('express');
var app=express();
var http=require('http').createServer(app);
var io= require('socket.io')(http);
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
var Userlist={};
var ID={};

//iosocket-part
// io.on('connection',function(socket){
//     var name;
//     socket.on('disconnect',function(msg){
//         if(name="") name="unnamed";
//         io.emit('userleft',name);
//     })
//     socket.on('chat message',function(msg){
//         io.emit('chat message',msg)
//         name=msg.name;
//     })
// })

//altenative iosocket
io.on('connection',function(socket){
    socket.on('NewUser',function(username,id){
        socket.username=username;
        Userlist[username]=username;
        ID[username]=id;
        socket.emit('notify','You have joined chat room');
        socket.broadcast.emit('notify',username+' have connected!');
        io.sockets.emit('update',Userlist);
    })
    socket.on('sendmes',function(data){
        io.emit('post',socket.username,data);
    })
    socket.on('disconnect',function(){
        delete Userlist[socket.username];
        io.emit('leave',socket.username+'has left');
    })
    socket.on('private',function(data,id){
        var text='From '+socket.username;
        io.to(ID[id]).emit('post',text,data);
    })
})
http.listen(3000,function(){
    console.log('Sever is running on port 3000');
})