// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {

    //asyncronous
    //User.findOne won't fire unless data is sent back
    process.nextTick(function() {

      // find a user whose email is the same as the form email
      // we are trying to see if the user trying to login already exists
      User.findOne({ 'local.email': email}, function(err, user) {

        // if there are any errors, return the error
        if(err)
          return done(err);

        // check to see if theres already a user with that email
        if(user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
        } else {

          // if there are no users with that email create a new user
          var newUser = new User();

          // set the user's local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          // save the user
          newUser.save(function(err) {
            if(err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email': email }, function(err, user) {
      if(err)
        return done(err);
      if(!user)
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      if(!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

      return done(null, user);
    });
  }));
};













