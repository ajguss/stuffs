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
var ejs = require('ejs');

//Set dilimiter to a ? (use <? ?> instead of <% %>)
ejs.delimiter = '?';

//Retrieve page handlers
var routes = require('./routes/index');
var login = require('./routes/login');

//Setup basic Global variables
GLOBAL.localIp = '192.168.0.108';

GLOBAL.user = {};

GLOBAL.title = 'Skin Cities';

GLOBAL.baseDatabaseURL = "mongodb://localhost:27017/skin_city";

//passport authentication things
passport.serializeUser(function(user, done) 
{
    GLOBAL.user = user;
    console.log(user);
    
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
    console.log("I GOT HERE!!!!!!!!!");
    console.log(identifier);
    console.log(profile);
    
    return done(null, profile);
}
));

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
app.use(session({secret: '1234567890QWERTY'}));

//Use passport authentication things
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//Add page handlers
app.use('/', routes);
app.use('/login', login);

//Passport steam login credentials
app.get('/auth/steam', passport.authenticate('steam'), function(req, res) {});
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), 
    function(req, res) 
    { 
        res.redirect('/login'); 
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
