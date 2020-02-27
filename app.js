var express=require('express');
var app=express();
var http=require('http').createServer(app);
var io= require('socket.io')(http);
var fs = require("fs");
var path = require("path");
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
    setInterval(cleanUpload,86400000);
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
        io.emit('online-update',Userlist);
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
        io.emit('online-update',Userlist);
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
        io.emit('online-update',Userlist);
    })
    //private-message-api
    socket.on('private',function(data,id){
        var receive='To '+id;
        var sender ='From '+socket.username;
        socket.emit('post-private',receive,data);
        io.to(ID[id]).emit('post-private',sender,data);
    })
    //add chat member
    socket.on('addchatmember',function(invited,roomname,caller){
        socket.to(ID[invited]).emit('invite',roomname,caller);
    })
    socket.on('refuse',function(caller,refuse_name){
        socket.to(ID[caller]).emit('refused',refuse_name);
    })
    //videocall-api
    socket.on('peer-id',function(data){
        socket.peerid=data;
    })
    socket.on('change-type-private',function(des){
        socket.to(ID[des]).emit('change-type-1');
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
        io.emit('online-update',Userlist);
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
    socket.on('change-type-group',function(des){
        socket.to(ID[des]).emit('change-type-2');
    })
    //img share
    socket.on('upload',function(data,sender){
        var guess = data.base64.match(/^data:image\/(png|jpeg);base64,/)[1];
        var ext = "";
        switch(guess) {
        case "png"  : ext = ".png"; break;
        case "jpeg" : ext = ".jpg"; break;
        default     : ext = ".bin"; break;
        }
        var savedFilename = "/upload/"+randomString()+ext;
        fs.writeFile(__dirname+"/public"+savedFilename, getBase64Image(data.base64), 'base64', function(err) {
        if (err !== null)
            console.log(err);
        else
            io.to(socket.roomid).emit('img-share', {path: savedFilename,},sender);
        });
        
    })
})
http.listen(process.env.PORT||3000,function(){
    console.log('Sever is running on port '+3000);
})
function getBase64Image(imgData) {
    return imgData.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
}
function randomString(){
     return num=Math.floor(Math.random() * 100000).toString();
}
function cleanUpload(){
    const folderpath=__dirname+'/public/upload';
    fs.readdir(folderpath,(err,files)=>{
        if(err) throw err;
        for (const file of files){
            fs.unlink(path.join(folderpath,file),err=>{
                if(err) throw err;
            })
        }
    })
}