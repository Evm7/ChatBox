/* jshint node: true */
/* jshint esversion: 6 */
/* globals $:false*/

const socket = io();
var username;
var users_room;
const colours = ['crimson', 'mediumslateblue', 'fuchsia', 'blue', 'yellowgreen', 'darkmagenta', 'darkturquoise', 'lawngreen', 'orangered', 'goldenrod'];

//slides the screen down if it is fully complete of messages
function scrollToBottom() {
    const messages = jQuery('#messages');
    const newMessage = messages.children('li:last-child');
    const clientHeight = messages.prop('clientHeight');
    const scrollTop = messages.prop('scrollTop');
    const scrollHeight = messages.prop('scrollHeight');
    const newMessageHeight = newMessage.innerHeight();
    const lastMessageHeight = newMessage.prev().innerHeight();
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};

//Create the connection between client and server
socket.on('connect', function () {
    //maps the parametres introduced by user in fromulary of index.html
    const params = jQuery.deparam(window.location.search);
    username = params.username;
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            //if username or room not correctly introduced, returns to form
            window.location.href = '/';
        }
        else {
            console.log('No error');
        }
        //display Room name in chat
        jQuery('.RoomName__text').html(params.room);
    });
});

//Disconnect user from the server
socket.on('disconnect', function () {
    console.log('Disconnected from the server');
});

//Introduce connected users to list and add colour properties
socket.on('updateUserList', function (users) {
    users_room = users;
    const ol = jQuery('<ol id="colores"></ol>');
    users.forEach(function (user) {
        ol.append(jQuery('<li></li>').text(user));
    });
    jQuery(document).ready(function () {
        jQuery('#colores li').each(function (i) {
            $(this).css("color", colours[i % colours.length]);
        }).hover(function (e) {
            $(this).css('opacity', 0.7);
        }, function (e) {
            $(this).css('opacity', 1);
        });
    });
    jQuery('#users').html(ol);
});

//Create new message received by the server
socket.on('newMessage', function (message) {
    // get the exact time in format HH:mm from moment librarie, in order to apply it to the message
    const formattedTime = moment(message.createdAt).format('H:mm ');
    //Hide typing message as it is send
    jQuery('.feedback').hide();
    var template;
    //if I send the message, bubble in right side
    if (username === message.from) {
        template = jQuery('#message-template-alter').html();
    }
    //if another user send the message, bubble in left-side
    else {
        template = jQuery('#message-template').html();
    }
    //introduce values in message attributes
    const html = Mustache.render(template, {
        colour: colours[users_room.indexOf(message.from) % colours.length]
        , text: message.text
        , from: message.from
        , createdAt: formattedTime
    , });
    jQuery('#messages').append(html);
    scrollToBottom();
});

//send message to server in order to be broadcast
jQuery('#message-form').on('submit', function (e) {
    //prevent the submit from the current functionality
    e.preventDefault();
    const messageTextBox = jQuery('[name=message]');
    //send message to server to be Broadcast
    socket.emit('createMessage', {
        text: messageTextBox.val()
    }, function () {
        messageTextBox.val('')
    });
});

//emit typing message to server if so
jQuery('#message-form').bind("keypress", ()=>{
    socket.emit('typing', username)
});

//notify users that X users is typing.
socket.on('typing', (data) => {
    jQuery('.feedback').html("<p><i class='feedback__info'>" + data.username +" is typing a message..."+"</i></p>").show();
});
