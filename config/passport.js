var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var User = mongoose.model("User");

passport.use(
  new LocalStrategy(
    // config password with column name custom
    // {
    //   usernameField: "email",
    //   passwordField: "password"
    // },
    function(username, password, done) {
      console.log(username);
      var criteria =
        username.indexOf("@") === -1
          ? { username: username }
          : { email: username };
      User.findOne(criteria)
        .then(function(user) {
          if (!user || !user.validPassword(password)) {
            return done(null, false, {
              errors: { "email or password": "is invalid" }
            });
          }

          return done(null, user);
        })
        .catch(done);
    }
  )
);
