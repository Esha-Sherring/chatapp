const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users');

const { generateMessage, generateLocationMessage } = require('./utils/messages')
//const WebSocket = require('ws');
//const socket = new WebSocket('ws://localhost:3000');
//const { Socket } = require('dgram');

const app=express();
const server=http.createServer(app);
const io=socketio(server);
//const socket = io.connect('http://192.168.0.105:8888');

const port= process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public')
console.log(publicDirectoryPath);
app.use(express.static(publicDirectoryPath))
app.listen(process.env.PORT || 3000);
io.on('connection', (socket)=>{

    console.log("New websocket Connection");

    
    socket.on('join',(options,callback)=>{
        
        
        const {error,user}=addUser({id:socket.id,...options})
        if(error){
           return callback(error)
        }
        
        
        socket.join(user.room);
        socket.emit('message', generateMessage('Admin',"Welcome")); //sending to sender-client only
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the room`));
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    callback()

})
  
    socket.on('sendMessage', (message,callback) =>{
        const user = getUser(socket.id);
        const filter= new Filter()
        if(filter.isProfane(message))
        {
            return callback('Profanity not permitted');
        }
        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback('Delievered')

    })

    socket.on('disconnect',() =>{
        const user=removeUser(socket.id)
        if(user)
        {
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        

    })
    socket.on('sendLocation',(coords,callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude}, ${coords.longitude}`));
        callback();
    })
    
});

server.listen(port,()=>{
    console.log("server running on port 3000");
})