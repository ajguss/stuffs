var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

router.post('/retrieve',
function(req, res, next)
{
    if(GLOBAL.database && GLOBAL.user)
    {
        data = req.body;
        if(data.room && data.since)
        {
            var currTime = new Date().getTime();
            GLOBAL.database.collection("chat_rooms").updateMany({}, {$pull: {messages: {time: {$lt: (currTime - 5000)}}}});
            
            if(data.since <= 0)
            {
                res.send({id: data.room, messages: [], since: currTime});
            }
            else
            {
                GLOBAL.database.collection("chat_rooms").findOne({_id: ObjectId(data.room.toString()) }, function(err, doc)
                {
                    if(err)
                    {
                        console.err(err);
                        res.send({error: err});
                    }
                    if(doc)
                    {
                        var response = {id: data.room, messages: [], since: currTime};
                        for(var i = 0; i < doc.messages.length; i++)
                        {
                            if(doc.messages[i].time > data.since)
                            {
                                var you = doc.messages[i].fromSteamId == GLOBAL.user.steamId;
                                console.log(GLOBAL.user);
                                response.messages.push({from: doc.messages[i].from, message: doc.messages[i].message, you: you});
                            }
                        }
                        
                        res.send(response);
                    }
                    else
                    {
                        res.send({err: "Chat Room Not Found"});
                    }
                });
            }
        }
        else
        {
            req.send({err: "Missing Information"});
        }
    }
    else if(GLOBAL.database)
    {
        res.send({err: "User not logged in"});
    }
    else
    {
        req.send({err: "Could Not Connect To Database"});
    }
});

router.post('/send',
function(req, res, next)
{
    if(GLOBAL.database && GLOBAL.user)
    {
        var currTime = new Date().getTime();
        GLOBAL.database.collection("chat_rooms").updateMany({}, {$pull: {messages: {time: {$lt: (currTime - 5000)}}}});
        data = req.body;
        
        if(data.room && data.message)
        {
            GLOBAL.database.collection("chat_rooms").findOne({_id: ObjectId(data.room.toString()) }, function(err, doc)
            {
                if(err)
                {
                    console.err(err);
                    res.send({error: err});
                }
                else if(doc)
                {
                    GLOBAL.database.collection("chat_rooms").update({_id: doc._id}, 
                    { 
                        $push: 
                        {
                            messages: 
                            {
                                from: GLOBAL.user.displayName,
                                fromSteamId: GLOBAL.user.steamId,
                                message: data.message,
                                time: currTime
                            }
                        }
                    });
                    res.send({});
                }
                else
                {
                    res.send({err: "Chat Room Not Found"});
                }
            });
        }
        else
        {
            res.send({err: "Missing Information"});
        }
    }
    else if(GLOBAL.database)
    {
        res.send({err: "User not logged in"});
    }
    else
    {
        res.send({err: "Cannot Connect to Database"});
    }
});

router.post('/rooms',
function(req, res, next)
{
    if(GLOBAL.database)
    {
        GLOBAL.database.collection("chat_rooms").find(function(err, docs)
        {
            if(err)
            {
                console.err(err);
                res.send({error: err});
            }
            else if(docs)
            {
                var response = {rooms: []};
                docs.toArray().then(function(arr)
                {
                    for(var i = 0; i < arr.length; i++)
                    {
                        if(arr[i])
                        {
                            response.rooms.push(arr[i]);
                        }
                    }
                    
                    res.send(response);
                });
                
            }
            else
            {
                res.send({err: "No Chat Rooms Found"});
            }
        });
    }
    else
    {
        res.send({err: "Cannot Connect to Database"});
    }
});

module.exports = router;
