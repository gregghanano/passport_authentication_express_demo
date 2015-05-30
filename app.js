var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var passportLocal = require('passport-local');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({ secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false 
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(function(username, password, done){
	// pretend this is using a real database
	if (username === password){
		done(null, { id: username, name: username });
	} else {
		done(null, null);
	}
}));

app.get('/', function(req, res){
	res.render('index', {
		isAuthenticated: false,
		user: req.user
	});
});

app.get('/login', function(req, res){
	res.render('login');
})

app.post('/login', passport.authenticate('local'), function(req, res){
	res. redirect('/');
})

app.listen(1337, function() {
	console.log('listening on 1337');
});