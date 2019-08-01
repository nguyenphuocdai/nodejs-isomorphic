var router = require("express").Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var auth = require("../auth");
var helper = require("../helper/helper");
var jwt = require("jsonwebtoken");
var secret = require("../../config").secret;

// Preload user profile on routes with ':username'
router.param("username", function(req, res, next, username) {
  User.findOne({ username: username })
    .then(function(user) {
      if (!user) {
        return res.sendStatus(404);
      }

      req.profile = user;

      return next();
    })
    .catch(next);
});

router.get("/:username", auth.optional, function(req, res, next) {
  // var token = helper.getTokenFromHeader(req);
  // if (!token) {
  //   return res.status(401).send({ auth: false, message: "No token provided." });
  // }

  // jwt.verify(token, secret, function(err, decoded) {
  //   if (err) {
  //     return res
  //       .status(500)
  //       .send({ auth: false, message: "Failed to authenticate token." });
  //   }
  //   var deco = decoded;
  // });

  if (req.payload) {
    var userRequest = req.params.username;
    if (req.payload.username !== userRequest) {
      return res.status(400).send({
        profile: req.profile.toProfileJSONFor(false)
      });
    }
    User.findById(req.payload.id).then(function(user) {
      if (!user) {
        return res.json({ profile: req.profile.toProfileJSONFor(false) });
      }

      return res.json({ profile: req.profile.toProfileJSONFor(user) });
    });
  } else {
    return res.json({ auth: false, message: "Failed to authenticate token or token has expired." });
  }
});

router.post("/:username/follow", auth.required, function(req, res, next) {
  var profileId = req.profile._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.follow(profileId).then(function() {
        return res.json({ profile: req.profile.toProfileJSONFor(user) });
      });
    })
    .catch(next);
});

router.delete("/:username/follow", auth.required, function(req, res, next) {
  var profileId = req.profile._id;

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfollow(profileId).then(function() {
        return res.json({ profile: req.profile.toProfileJSONFor(user) });
      });
    })
    .catch(next);
});

module.exports = router;
