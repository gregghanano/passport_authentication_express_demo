var fs = require('fs');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require('passport-http');

var app = express();

var server = https.createServer({
	cert: fs.readFileSync(__dirname + '/my.crt'),
	key: fs.readFileSync(__dirname + '/my.key'),
}, app);

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

passport.use(new passportLocal.Strategy(verifyCredentials));

passport.use(new passportHttp.BasicStrategy(verifyCredentials));

function verifyCredentials(username, password, done){
	// pretend this is using a real database
	if (username === password){
		done(null, { id: username, name: username });
	} else {
		done(null, null);
	}
}

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	//query database or casche here
	done(null, { id: id, name: id })
});

function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated()){
		next();
	} else {
		res.sendStatus(403);
	}
}

app.get('/', function(req, res){
	res.render('index', {
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	});
});

app.get('/login', function(req, res){
	res.render('login');
});

app.post('/login', passport.authenticate('local'), function(req, res){
	res. redirect('/');
});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.use('/api', passport.authenticate('basic', { session: false }));

app.get('/api/data', ensureAuthenticated, function(req, res){
	res.json([
		{ value: 'foo' },
		{ value: 'bar' },
		{ value: 'baz' }
		]);
});

server.listen(1337, function() {
	console.log('listening on 1337');
});

// command to create openssl cert and key
// openssl req -x509 -nodes -days 365 -newkey rsa:1024 -out my.crt -keyout my.key