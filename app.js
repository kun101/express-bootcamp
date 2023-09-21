var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();

var MongoStore = require("connect-mongo");

var passport = require("passport");
var session = require("express-session");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sessionObject = session({
  name: "session", // name for our session cookie
  secret: "secret", // secret for signing the session cookie
  resave: true, // force save the cookie again on each request
  rolling: true,  // rolling ensures the cookie refreshes after the cookie expires
  saveUninitialized: false, // only save after we gather required data from the user
  store: MongoStore.create({
      mongoUrl: process.env["MONGO_URL"], //save the cookie in our db
      collectionName: "sessions", // this will be our collection name in the db
  }),
  cookie: {
      maxAge: 1000*60*60*24, // expires after 1 day
      httpOnly: true, // can only be accessed via http
  }, 
});

app.use(sessionObject); // allows express to use this session

app.use(passport.authenticate("session")); // passport will use sessions to store user details
app.use(passport.initialize()); // initialize passport 
app.use(passport.session()); // this will authenticate each request and populate it with user details

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
      cb(null, {
          name: user.name,
          email: user.emails[0].value,
          photo: user.photos[0].value,
      });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
      return cb(null, user);
  });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
