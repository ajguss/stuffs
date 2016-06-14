var express = require('express');
GLOBAL.passport = require('passport');
var util = require('util');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var User = require('./resources/util/js/user');
var icon = "";

var handlebars = require('express3-handlebars')
 .create({ defaultLayout: 'main' });
 
var routes = require('./routes/index');
var deposit = require('./routes/deposit');
 
GLOBAL.localIp = 'localhost';
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

//passport setup
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new SteamStrategy(
{
    returnURL: 'http://' + GLOBAL.localIp + ':3000/auth/steam/return',
    realm: 'http://' + GLOBAL.localIp + ':3000/',
    apiKey: '4330978285A7B4D920920B661D2E5A43'
},
function(identifier, profile, done)
{
    return done(null, profile);
}
));

var signed = false;
var avatar = null;
var sname = null;

var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
//Use passport authentication things
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(__dirname + '/public'));



app.get('/', function (req, res) {
	
	res.render('home');
	
	
});
app.get('/about', function (req, res) {
    res.render('about');
});
app.get('/auth/steam', passport.authenticate('steam'), function(req, res) {});
app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), 
    function(req, res) 
    {
        req.session.user = new User(req.user, function()
        {
			
			app.locals.avatar = req.session.user.avatar;
			app.locals.steamName = req.session.user.displayName;
			res.render('home');
            res.redirect('/'); 
        });
		
		
    });
// 404 catch-all handler (middleware)
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});
// 500 error handler (middleware)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
 app.get('port') + '; press Ctrl-C to terminate.');
});
