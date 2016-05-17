var request = require("request");

function User(steamInfo, callback)
{
    //Retrieve information from Steam
    this.steamId = steamInfo._json.steamid;
    this.displayName = steamInfo.displayName;
    this.avatar = steamInfo._json.avatar;
    
    //Initialize anything extra
    
    //Go to the database (if possible) and get user's information if it exists
    var _self = this;
    
    //refreshInventory();
    
    if(GLOBAL.database)
    {
        GLOBAL.database.collection("users").count({steamId: _self.steamId}, function(err, count)
        {
            if(count == 0)
            {
                GLOBAL.database.collection("users").insert(_self);
                
                if(callback) callback();
            }
            else if(count == 1)
            {
                GLOBAL.database.collection("users").updateOne({steamId: _self.steamId}, {$set: _self}, {j: true}, function(err, result)
                {
                    GLOBAL.database.collection("users").findOne({steamId: _self.steamId}, function(err, doc)
                    {
                        //Retrieve any aditional information from the database
                        for(prop in doc)
                        {
                            _self[prop] = doc[prop];
                        }
                        
                        if(callback) callback();
                    });
                });
            }
            else
            {
                GLOBAL.database.collection("users").find({steamId: _self.steamId}, function(err, docs)
                {
                    console.log("");
                    console.log("Multiple Users with the same SteamID: ");
                    for(var i = 0; i < docs.length; i++)
                    {
                        console.log(docs[i]);
                    }
                    console.log("");
                    if(callback) callback();
                });
            }
        });
    }
    else if(callback)
    {
        callback();
    }
}

User.prototype.updateDatabase = function(callback)
{
    if(GLOBAL.database)
    {
        GLOBAL.database.collection("users").updateOne({steamId: this.steamId}, {$set: _self}, {j: true}, function(err, results)
        {
            if(callback) callback();
        });
    }
    else if(callback)
    {
        callback();
    }
};

User.prototype.refreshInventory = function()
{
    var _self = this;
    request("http://steamcommunity.com/profiles/" + this.steamId + "inventory/json/730/2", function(error, response, body)
    {
        if(!error && response.statusCode === 200)
        {
            _self.inventory = body;
        }
    });
};

module.exports = User;