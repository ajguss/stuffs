var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) 
{
    console.log(req.session.user);
	res.render('index', { title: GLOBAL.title, user: req.session.user });
});

module.exports = router;
