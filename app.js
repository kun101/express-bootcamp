var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
  name: "session",
  secret: "secret",
  resave: true,
  // rolling ensures the cookie refreshes after the cookie expires
  rolling: true,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: "mongodb+srv://expressbootcamp8:test@cluster0.xtdz3pi.mongodb.net/",
      collectionName: "sessions",
  }),
  cookie: {
      maxAge: 1000*60*60*24, //millisecond
      httpOnly: true,
  }, 
});

app.use(sessionObject);

app.use(passport.authentication("session"));
app.use(passport.initialize());
app.use(passport.session());

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
