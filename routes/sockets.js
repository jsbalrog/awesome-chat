var io = require('socket.io');

exports.initialize = function(server) {
  io = io.listen(server);

  var chateInfra = io.of('/chat_infra').on('connection', function(socket) {

    // Handle the custom event
    socket.on('set_name', function(data) {
      // Attach additional info to the socket session
      socket.set('nickname', data.name, function() {
        // Name is set, so notify the client with a custom 'name_set' event
        socket.emit('name_set', data);

        socket.send(JSON.stringify({ type: 'serverMessage', message: 'Welcome to the chat room!' }));

        // Broadcast custom event that a user has entered
        socket.broadcast.emit('user_entered', data);
      });
    });
  });

  var chatCom = io.of('/chat_com').on('connection', function(socket) {
    socket.on('message', function(message) {
      message = JSON.parse(message);
      if(message.type == 'userMessage') {
        socket.get('nickname', function(err, nickname) {
          message.username = nickname;
          socket.broadcast.send(JSON.stringify(message));
          message.type = 'myMessage';
          socket.send(JSON.stringify(message));
        });
      }
    });
  });
};
