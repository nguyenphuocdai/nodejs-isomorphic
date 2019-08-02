var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");
var User = mongoose.model("User");
var auth = require("../auth");
var helper = require("../helper/helper");

router.get("/user", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.put("/user", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== "undefined") {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== "undefined") {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function() {
        return res.json(user.toAuthJSON());
      });
    })
    .catch(next);
});

router.post("/users/login", function(req, res, next) {
  if (!req.body.email && !req.body.username) {
    return res
      .status(422)
      .json({ errors: { Message: "Email or username can't be blank" } });
  }

  if (!req.body.password) {
    return res
      .status(422)
      .json({ errors: { Message: "Password can't be blank" } });
  }

  passport.authenticate("local", { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      return res.json(user.toAuthJSON());
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post("/users", function(req, res, next) {
  var user = new User();

  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }
  if (!req.body.user.username) {
    return res.status(422).json({ errors: { username: "can't be blank" } });
  }
  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

  user.requestId = req.body.user.requestId;
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.firstname = req.body.user.firstname;
  user.lastname = req.body.user.lastname;
  user.displayname = req.body.user.displayname;
  user.gender = req.body.user.gender ? req.body.user.gender : "";
  user.birthday = req.body.user.birthday ? req.body.user.birthday : "";
  user.phoneNumber = req.body.user.phoneNumber ? req.body.user.phoneNumber : "";

  user.isSuperUser = req.body.user.isSuperUser
    ? req.body.user.isSuperUser
    : false;
  user.updatePassword = false;
  user.lastIpAddress = req.body.user.lastIpAddress
    ? req.body.user.lastIpAddress
    : "";
  user.isDeleted = false;
  user.createdByUser = req.body.user.createdByUser
    ? req.body.user.createdByUser
    : "-1";
  user.createOnDateTime = req.body.user.createOnDateTime
    ? req.body.user.createOnDateTime
    : helper.getDateTime();
  user.lastModifyUserID = "";
  user.passwordResetToken = "";
  user.lowerEmail = req.body.user.email.toLowerCase();
  user.image = req.body.user.image ? req.body.user.image : "";

  user.setPassword(req.body.user.password);

  user
    .save()
    .then(function() {
      return res.json(user.toAuthJSON());
    })
    .catch(next);
});

module.exports = router;
