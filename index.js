var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var userIndex = 1;
var connectedUsers = [];
var chatLog = [];
var userColors = [];

io.on('connection', function(socket){
  var userId;

  socket.on('old user', function(msg) {
      userId = msg[0];
      if (!connectedUsers.includes(msg[0])) {
        connectedUsers.push(msg[0]);
        userColors.push(msg[1]);
        console.log(userId + " connected");
      }
      io.emit('all colors', userColors);
      io.emit('user name assign', userIndex);
      io.emit('user list', connectedUsers);
      io.emit('chatLog history', chatLog);
  });

  socket.on('new user', function() {
      userId = "User" + userIndex;
      connectedUsers.push(userId);
      userColors.push("#FDFDFD");
      console.log(userId + " connected");
      io.emit('all colors', userColors);
      io.emit('user name assign', userIndex);
      io.emit('user list', connectedUsers);
      io.emit('chatLog history', chatLog);
      userIndex++;
  });

  socket.on('user name change', function(msg){
    let index = connectedUsers.indexOf(msg[0]);
    if (index !== -1) connectedUsers.splice(index, 1);
    connectedUsers.splice(index, 0, msg[1]);
    io.emit('user list', connectedUsers);
  });

  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
    chatLog.push(msg);
    if (chatLog.length >= 200) {
        chatLog.shift();
    }
  });

  socket.on('disconnect', function(){
    console.log(userId + " disconnected");
    let index = connectedUsers.indexOf(userId);
    if (index !== -1) {
        connectedUsers.splice(index, 1);
        userColors.splice(index,1);
    }
    io.emit('user list', connectedUsers);
  });

  socket.on('nick color changed', function(msg) {
    let index = connectedUsers.indexOf(msg[0]);
    userColors[index] = msg[1];
    console.log(userColors);
    io.emit('nick color changed', msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
