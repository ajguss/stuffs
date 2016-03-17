'use strict'

var peer = new Peer({key: 'dd9ktvjhndmcmcxr'});
var conn = [];

$(document).ready(function()
{
    $('body').append(
        '<div class="chat-box-wrapper">' +
            '<button class="chat-box-join-room-btn">Join</button>' +
            '<button class="chat-box-create-room-btn">Create</button>' +
        '</div>'
    );
    
    $('.chat-box-join-room-btn').click(function()
    {
        setupChat();
        setupConnection(peer.connect('superawesomeidthingy'));
    });
    
    $('.chat-box-create-room-btn').click(function()
    {
        setupChat();
        peer = new Peer('superawesomeidthingy', {key: 'dd9ktvjhndmcmcxr'});
        
        peer.on('connection', function(c)
        {
            setupConnection(c);
        });
    });
});

function setupConnection(c)
{
    conn[conn.length] = c;
    c.on('open', function()
    {
        c.on('data', function(data)
        {
            $(".chat-box-message-wrapper").append("<p>" + data + "</p>")
        });
    });
}

function setupChat()
{
    $('.chat-box-wrapper').html(
        '<div class="chat-box-message-wrapper"></div>' +
        '<div class="chat-box-input-wrapper">' +
            '<input class="chat-box-input" type="text"/>' +
            '<button class="chat-box-input-send-button">Send</button>' +
        '</div>'
    );
    
    $('.chat-box-input-send-button').click(function()
    {
        for(var i = 0; i < conn.length; i++)
        {
            conn[i].send($(".chat-box-input").val());
        }
    });
}