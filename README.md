ChatBox
==============

This is ChatBox.
ChatBox is an applicaction client-server which runs in port 9080 and creates a connection between multiple clients to one uniq server.
Most important aspect is that it let users to enter an specific group (or room) and messages are only transmitted to this particular room.


We have base our project in the Udemy Course Doccumentation: "The Complete Node js"

Usage
-----

Here is how you use it:

 * Enter to server directory and use command: node server.js
 * Connect to the browser and seach for the url: http://localhost:9080
 * Enter your username and the room you want to chat to
 * Now you are able to interact with all the others users connected to the same chat Room.


Libraries used:

- [socket.io](https://github.com/socketio/socket.io)
- [jQuery](https://github.com/jquery/jquery)
- [express](https://github.com/expressjs/express)
- [mustache.js](https://github.com/janl/mustache.js)
- [Moment.js](https://github.com/moment/moment)
