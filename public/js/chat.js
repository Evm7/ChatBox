const socket = io();
var username;
var users_room;
const colours = ['crimson', 'mediumslateblue', 'fuchsia', 'blue', 'yellowgreen', 'darkmagenta', 'darkturquoise', 'lawngreen', 'orangered', 'goldenrod'];

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
socket.on('connect', function () {
    const params = jQuery.deparam(window.location.search);
    username = params.username;
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        }
        else {
            console.log('No error');
        }
    });
});
socket.on('disconnect', function () {
    console.log('Disconnected from the server');
});
socket.on('updateUserList', function (users) {
    users_room = users;
    const ol = jQuery('<ol id="colores"></ol>');
    users.forEach(function (user) {
        ol.append(jQuery('<li></li>').text(user));
    });
    jQuery(document).ready(function () {
        jQuery('#colores li').each(function (i) {
            $(this).css("color", colours[i % colours.length]);
        })
        .hover(function(e){
            $(this).css('opacity', 0.7);
        },
               function(e){
            $(this).css('opacity',1);
        });
    })
    jQuery('#users').html(ol);
});
socket.on('newMessage', function (message) {
    const formattedTime = moment(message.createdAt).format('H:mm ');
    var template;
    //if I send the message
    if (username === message.from) {
        template = jQuery('#message-template-alter').html();
    }
    //if another user send the message
    else {
        template = jQuery('#message-template').html();
    }
    const html = Mustache.render(template, {
        colour: colours[users_room.indexOf(message.from) % colours.length]
        , text: message.text
        , from: message.from
        , createdAt: formattedTime
    , });
    jQuery('#messages').append(html);
    scrollToBottom();
});
jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    const messageTextBox = jQuery('[name=message]');
    socket.emit('createMessage', {
        text: messageTextBox.val()
    }, function () {
        messageTextBox.val('')
    });
});
