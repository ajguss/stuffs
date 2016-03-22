'use strict'

var boxData = {pageReturn: undefined, boxopen: true, roomId: undefined, since: -1, roomName: undefined};

$(document).ready(function()
{
    $('body').append(
        '<div class="chat-box-wrapper">' +
            '<div class="chat-box-top fake-click">' +
                '<div class="chat-box-title">' +
                '</div>' +
                '<div class="chat-box-settings-button">' +
                    '<img class="chat-box-settings-button-image" src="/resources/images/chat-box/settings-button-4.png"/>' +
                '</div>' +
            '</div>' + 
            '<div class="chat-box-body">' +
            '</div>' +
            '<div class="chat-box-bottom">' + 
            '</div>' +
        '</div>'
    );
    
    $('.chat-box-settings-button').click(function(e)
    {
        e.originalEvent.stopPropagation();
        showSettingsPage();
    });
    
    $('.chat-box-top').click(function()
    {
        if(boxData.boxopen)
        {
            hideChatBox();
        }
        else
        {
            showChatBox();
        }
    });
    
    setInterval(getNewMessages, 500);
    
    showChatRoomListPage();
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

function showChatPage()
{
    if(boxData.roomId && boxData.roomName)
    {
        boxData.pageReturn = showChatPage;
        setChatBoxTitle(boxData.roomName);
        
        if($('.chat-box-bottom').find('.chat-box-input-wrapper').size() == 0)
        {
            $('.chat-box-bottom').append(
                    '<div class="chat-box-input-wrapper">' + 
                        '<input type="text" class="chat-box-text-input"></input>' +
                        '<button class="chat-box-send-button fake-click">Send</button>' +
                    '</div>');
            
            var sendData = function()
            {
                if(boxData.roomId && $(".chat-box-text-input").val().length > 0)
                {
                    $.post('/chat/send', {room: boxData.roomId, message: $(".chat-box-text-input").val()}, function(data)
                    {
                        if(data.err)
                        {
                            showErrorPage(data.err);
                        }
                        $('.chat-box-text-input').val("");
                    }, 'json');
                }
            }
            
            $('.chat-box-send-button').click(sendData);
            $('.chat-box-text-input').keypress(function(event)
            {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13')
                {
                    sendData();  
                }
            });
        }
        
        if(!doesChatBoxHaveElement('.chat-box-message-list'))
        {
            $('.chat-box-body').append('<div class="chat-box-message-list"></div>');
        }
        
        showPage('.chat-box-message-list');
        $('.chat-box-input-wrapper').show();
    }
    else
    {
        showChatRoomListPage();
    }
}

function showChatRoomListPage()
{
    boxData.pageReturn = showChatRoomListPage;
    boxData.roomId = undefined;
    boxData.since = -1;
    boxData.roomName = undefined;
    
    setChatBoxTitle("Join Chat Room");
    
    if(!doesChatBoxHaveElement(".chat-room-list"))
    {
        $('.chat-box-body').append('<div class="chat-room-list"></div>');
        $.post("/chat/rooms", {}, function(data)
        {
            if(data.err)
            {
                showErrorPage(data.err);
            }
            else
            {
                var roomList = $('.chat-box-body').find('.chat-room-list');
                for(var i = 0; i < data.rooms.length; i++)
                {
                    roomList.append('<div class="chat-box-select-button chat-box-room-select-button" data-room-id="' + data.rooms[i]._id + '" data-room-name="' + data.rooms[i].name + '"><a>' + data.rooms[i].name + '</a></div>');
                }
                
                $('.chat-box-room-select-button').click(function(e)
                {
                    boxData.roomId = $(e.currentTarget).data("room-id");
                    boxData.roomName = $(e.currentTarget).data("room-name");
                    $('.chat-box-message-list').html("");
                    showChatPage();
                });
            }
            
        }, 'json');
    }
    
    showPage('.chat-room-list');
}

function showSettingsPage()
{
    setChatBoxTitle("Menu");
    
    if(!doesChatBoxHaveElement(".chat-box-menu"))
    {
        $('.chat-box-body').append('<div class="chat-box-menu"></div>');
        var menu = $('.chat-box-body').find('.chat-box-menu');
        
        menu.append('<div class="chat-box-select-button" id="chat-box-menu-choose-room-button"><a>Choose Chat Room</a></div>');
        menu.append('<div class="chat-box-select-button" id="chat-box-menu-refresh-list-button"><a>Refresh Room List</a></div>');
        menu.append('<div class="chat-box-select-button" id="chat-box-menu-back-button"><a>Back</a></div>');
        
        $("#chat-box-menu-choose-room-button").click(showChatRoomListPage);
        
        $("#chat-box-menu-refresh-list-button").click(function()
        {
            $(".chat-room-list").remove();
            showChatRoomListPage();
        });
        
        $("#chat-box-menu-back-button").click(function()
        {
            if(boxData.pageReturn != undefined) boxData.pageReturn();
        });
    }
    showPage('.chat-box-menu');
    showChatBox();
}

function showErrorPage(error)
{
    setChatBoxTitle("An Error Has Occured");
    
    boxData.pageReturn = undefined;
    boxData.roomId = undefined;
    boxData.since = -1;
    boxData.roomName = undefined;
    
    if(!doesChatBoxHaveElement(".chat-box-error-page"))
    {
        $('.chat-box-body').append('<div class="chat-box-error-page"></div>');
        var errorPage = $('.chat-box-body').find('.chat-box-error-page');
        
        errorPage.append('<div class="chat-box-error-message"></div>');
        errorPage.append('<div class="chat-box-select-button" id="chat-box-error-okay-button"><a>Okay</a></div>');
        
        $("#chat-box-error-okay-button").click(showChatRoomListPage);
    }
    
    $('.chat-box-error-message').html("<a>"  + error + "</a>");
    
    showPage('.chat-box-error-page');
    showChatBox();
}

function showPage(page)
{
    clearBody();
    $(page).show();
}

function clearBody()
{
    $('.chat-box-body').children().hide();
    $('.chat-box-bottom').children().hide();
}

function hideChatBox()
{
    boxData.boxopen = false;
    if($(".chat-box-wrapper").css("bottom") != "-" + ($('.chat-box-body').height() + $('.chat-box-bottom').height()) + "px")
    {
        $(".chat-box-wrapper").animate({bottom: "-" + ($('.chat-box-body').height() + $('.chat-box-bottom').height()) + "px"}, 700);
    }
}

function showChatBox()
{
    boxData.boxopen = true;
    
    if($(".chat-box-wrapper").css("bottom") != "0px")
    {
        $(".chat-box-wrapper").animate({bottom: "0px"}, 700);
    }
}

function setChatBoxTitle(title)
{
    $('.chat-box-title').html("<a>" + title + "</a>");
}

function doesChatBoxHaveElement(element)
{
    return $('.chat-box-body').find(element).size() > 0
}

function getNewMessages()
{
    if(boxData.roomId)
    {
        if(!boxData.since) boxData.since = -1;
        
        $.post("/chat/retrieve", {room: boxData.roomId, since: boxData.since}, function(data)
        {
            if(data.err)
            {
                showErrorPage(data.err);
                console.log("got here");
            }
            else
            {
                if(data.since) boxData.since = data.since;
                if(data.messages && data.messages.length > 0)
                {
                    for(var i = 0; i < data.messages.length; i++)
                    {
                        console.log(data);
                        $('.chat-box-message-list').append(
                                '<table class="chat-box-single-message' + (data.messages[i].you ? '-you' : '') + '">' +
                                    '<tr>' +
                                        '<th><a>' + data.messages[i].from + '</a></th>' +
                                    '</tr>' +
                                    '<tr>' +
                                        '<td><a>' + data.messages[i].message + '</a></td>' +
                                    '</tr>' +
                                '</table>');
                        
                        $('.chat-box-body').scrollTop($('.chat-box-message-list').height());
                        
                    }
                }
            }
        }, 'json');
        
    }
}