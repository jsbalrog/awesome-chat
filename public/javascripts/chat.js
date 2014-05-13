var chatInfra = io.connect('/chat_infra'),
    chatCom = io.connect('/chat_com');

var roomName = decodeURI((RegExp("room" + "=" + '(.+?)(&|$)').exec(location.search) || [, null]) [1]);

if(roomName) {
  // Handle the custom 'name_set' event from the server
  chatInfra.on('name_set', function(data) {

    // Trigger the 'join_room' custom event, passing the room name as a parameter
    chatInfra.emit('join_room', { 'name': roomName });

    // Handle the user_entered custom event from the server
    chatInfra.on("user_entered", function(user) {
      $('#messages').append('<div class="systemMessage">' + user.name + ' has joined the ' + roomName + ' room.' + '</div>');
    });

    chatInfra.on('message', function(message) {
      var message = JSON.parse(message);
      $('#messages').append('<div class="' + message.type + '">' + message.message + '</div>');
    });

    chatCom.on('message', function(data) {
      data = JSON.parse(data);
      console.log(data);
      if(data.type === "myMessage") {
        $('#messages').append('<div class="' + data.type + '"><span class="name">Me:</span> ' + data.message + '</div>');
      } else if(data.username) {
        $('#messages').append('<div class="' + data.type + '"><span class="name">' + data.username + ':</span> ' + data.message + '</div>');
      }
    });

    $('#nameform').hide();
    $('#messages').append('<div class="systemMessage">' + 'Hello '+ data.name + '</div>');

    $('#send').click(function() {
      var data = {
        message: $('#message').val(),
        type: 'userMessage'
      };
      chatCom.send(JSON.stringify(data));
      $('#message').val('');
    });

  });
}

$(document).ready(function() {
  $('#setname').click(function() {
    // Trigger the 'set_name' custom event
    chatInfra.emit("set_name", { name: $('#nickname').val() });
  });
});
