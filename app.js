//Retrieve modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
GLOBAL.passport = require('passport');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var ejs = require('ejs');
var User = require('./resources/util/js/user');
var request = require("request");

//Set dilimiter to a ? (use <? ?> instead of <% %>)
ejs.delimiter = '?';

//Retrieve page handlers
var routes = require('./routes/index');
var chat = require('./routes/chat');
var deposit = require('./routes/deposit');

//Setup basic Global variables
GLOBAL.localIp = 'localhost';//'192.168.0.104';
GLOBAL.title = 'CSGOMeme';

MongoClient.connect("mongodb://localhost:27017/csgomemedb", function(err, db)
{
    if(err)
    {
        console.log("Unsuccessful Database Connection");
        console.error(err);
    }
    else
    {
        console.log("Connected To Datbase");
        GLOBAL.database = db;
    }
    
});

//passport authentication things
passport.serializeUser(function(user, done) 
{
    done(null, user);
});

passport.deserializeUser(function(obj, done) 
{
	done(null, obj);
});

passport.use(new SteamStrategy(
{
    returnURL: 'http://' + GLOBAL.localIp + ':3000/auth/steam/return',
    realm: 'http://' + GLOBAL.localIp + ':3000/',
    apiKey: '2C82A7732A81FC33E923363825B47586'
},
function(identifier, profile, done)
{
    return done(null, profile);
}
));

//Force https redirect
var https_redirect = function () 
{
    return function(req, res, next) 
    {
        if (req.secure) 
        {
            if(env === 'development') 
            {
                return res.redirect('https://localhost:3000' + req.url);
            } 
            else 
            {
                return res.redirect('https://' + req.headers.host + req.url);
            }
        }
        else 
        {
            return next();
        }
    };
};

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'c8bf639a-0838-4266-918d-a5325d2775df'}));

//Use passport authentication things
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//Add page handlers
app.use(https_redirect());
app.use('/', routes);
app.use('/chat', chat);
app.use('/deposit', deposit);

//Passport steam login credentials
app.get('/auth/steam', passport.authenticate('steam'), function(req, res) {});
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), 
    function(req, res) 
    {
        console.log("Steam return");
        req.session.user = new User(req.user, function()
        {
            console.log("User Created");
            res.redirect('/'); 
        });
    });
	
app.get('/inventory', function(req, res) {
	if(req.session.user){
		request("http://steamcommunity.com/profiles/" + req.session.user.steamId + "inventory/json/730/2", function(error, response, body){
			if(!error && response.statusCode === 200){
				res.send(body);
			}
		}
	)};	
});

// catch 404 and forward to error handler
app.use(function(req, res, next) 
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') 
{
    app.use(function(err, req, res, next) 
    {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}



// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) 
{
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
