var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', GLOBAL.passport.authenticate('steam', { failureRedirect: '/' }),
function(req, res, next) 
{
	//res.render('login', { title: 'Skin Gambling' });
	console.log("Login got here");
	res.redirect('/');
});

/*router.post('/', function(req, res, next)
{
	console.log(request.body);
	//res.render('login', { title: 'Skin Gambling' });
});*/

module.exports = router;
