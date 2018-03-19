var userService = require('./../services/user');
const config = require('config');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var SUCCESS_URL = '/?ref=login';
const _ = require('lodash');

module.exports = function(app) {

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {

    if (user) {

      userService.findById(user.id)
      .then(r => {
        done(null, r);
      })
    } else {
      done(null, user)
    }
  });


  if (_.get(config.get('auth'), 'google.clientID')) {
    passport.use(new GoogleStrategy({
      clientID: config.get('auth.google.clientID'),
      clientSecret: config.get('auth.google.clientSecret'),
      callbackURL: config.get('auth.google.callbackURL'),
      profileFields: config.get('auth.google.scope')
    }, function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        userService.updateSocialUser(accessToken, refreshToken, profile, 'google')
          .then(function(user) {
            done(null, user)
          })
          .catch(function(err) {
            done(err)
          })
      })
    }))
  }

  var successRedirect = function(req, res) {

    var url = SUCCESS_URL
    if (req.session.last_url) {

      url = req.session.last_url
      req.session.last_url = undefined
    }

    return res.redirect(url);
  }

  app.get('/auth/google', function(req, res, next) {
    return next()
  }, passport.authenticate('google', {
    scope: config.get('auth.google.scope')
  }));

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
  }), successRedirect);

  app.get('/login', function(req, res) {
    res.locals.user  = req.user
    return res.render('views/users/login');
  });

  app.post('/login', passport.authenticate('local', {
    successRedirect: SUCCESS_URL,
    failureRedirect: '/login'
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    return res.redirect('/');
  })
}
