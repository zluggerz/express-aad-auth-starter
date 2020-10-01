// Azure AD Auth Requirements
var expressSession = require('express-session');
const MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
// var methodOverride = require('method-override');
var config = require('./config');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var passport = require('passport');

// Express Server Requirements
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var autoprefixer = require('express-autoprefixer');
const db = require('./bin/db.js');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/';


// Setup/config Passport for Azure AD authentication
passport.serializeUser((user, done) => {
  done(null, user.oid);
});

passport.deserializeUser((oid, done) => {
  findByOid(oid, (err, user) => {
    done(err, user);
  });
});

// Array to hold logged in users
var users = [];

var findByOid = (oid, fn) => {
  for(var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

passport.use(new OIDCStrategy({
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode,
    redirectUrl: config.creds.redirectUrl,
    allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
    clientSecret: config.creds.clientSecret,
    validateIssuer: config.creds.validateIssuer,
    isB2C: config.creds.isB2C,
    issuer: config.creds.issuer,
    passReqToCallback: config.creds.passReqToCallback,
    scope: config.creds.scope,
    loggingLevel: config.creds.loggingLevel,
    nonceLifetime: config.creds.nonceLifetime,
    nonceMaxAmount: config.creds.nonceMaxAmount,
    useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
    cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
    clockSkew: config.creds.clockSkew,
  }, 
  (iss, sub, profile, accesstoken, refreshToken, done) => {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    }
    process.nextTick(() => {
      findByOid(profile.oid, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      });
    });
  }
));

// Routes
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true,
  outputStyle: 'compressed'
}));
app.use(autoprefixer({ browsers: 'last 2 versions', cascade: false}));
app.use(express.static(path.join(__dirname, 'public')));

// These routes are included by the default Express template. I don't use them so I commented them out. Do what you like.
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// Session and Auth Middlewares
if (config.useMongoDBSessionStore) {
  app.use(express.session({
    secret: 'ItsABigDirtyLie,All0f1t',
    cookie: {maxAge: config.mongoDBSessionMaxAge * 1000},
    store: new MongoStore({
      url: config.databaseUri,
      clear_interval: config.mongoDBSessionMaxAge
    })
  }));
} else {
  app.use(expressSession({ secret: 'Do Ze thingz...or something', resave: true, saveUninitialized: false }));
}
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    res.locals.user = req.user;
    return next(); 
  }
  res.redirect('/login');
};


// Custom Middlewares


// Login and Logout Pages

app.get('/login',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,                      // required
        resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
        customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
        failureRedirect: '/' 
      }
    )(req, res, next);
  },
  function(req, res) {
    res.redirect('/');
});

app.get('/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,                      // required
        failureRedirect: '/'  
      }
    )(req, res, next);
  },
  function(req, res) {
    res.redirect('/');
  });

  app.post('/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,                      // required
        failureRedirect: '/'  
      }
    )(req, res, next);
  },
  function(req, res) {
    res.redirect('/');
  });

  app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
      req.logOut();
      res.redirect(config.destroySessionUrl);
    });
  });


/* GET Home page. */
app.get('/', ensureAuthenticated, function(req, res) {
    res.render('index', { title: "Title" });
});

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
