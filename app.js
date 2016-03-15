var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
GLOBAL.passport = require('passport');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;

var routes = require('./routes/index');
var login = require('./routes/login');

passport.serializeUser(function(user, done) 
{
	console.log("");
	console.log("");
	console.log("");
	console.log("Got Here 2");
	console.log("");
	console.log("");
	console.log("");
	done(null, user);
});

passport.deserializeUser(function(obj, done) 
{
	console.log("");
	console.log("");
	console.log("");
	console.log("Got Here 1");
	console.log("");
	console.log("");
	console.log("");
	done(null, obj);
});

passport.use(new SteamStrategy(
{
	returnURL: 'http://localhost:3000/steam/auth/return',
	realm: 'http://localhost:3000/',
	apiKey: '2C82A7732A81FC33E923363825B47586',
	profile: true
},
function(identifier, profile, done)
{
	console.log("");
	console.log("");
	console.log("");
	console.log("Got Here");
	console.log("");
	console.log("");
	console.log("");
    
	process.nextTick(function () 
	{
		profile.identifier = identifier;
		console.log("--- Profile ---");
		console.log(profile);
		console.log("--- Profile ---");
		return done(null, profile);
	});
}
));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY'}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/login', login);

app.use('/steam/auth/return',
function(req, res, next)
{
	/*console.log(" --- Query --- ");
	console.log(req.query);
	console.log(" --- Query--- ");
	console.log("");
	console.log(" --- Passport --- ");
	console.log(passport);
	console.log(" --- Passport --- ");*/
	
	console.log("");
	console.log("");
	console.log("Steam Authorization Return");
	console.log("");
	console.log("");
	
	res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
