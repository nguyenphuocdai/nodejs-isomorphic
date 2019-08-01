var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var secret = require("../config").secret;

var UserSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true
    },
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    firstname: String,
    lastname: String,
    displayname: String,
    gender: String,
    birthday: String,
    phoneNumber: String,
    isSuperUser: Boolean,
    updatePassword: Boolean,
    lastIpAddress: String,
    isDeleted: Boolean,
    createdByUser: String,
    createOnDateTime: String,
    lastModifyUserID: String,
    passwordResetToken: String,
    lowerEmail: String,
    image: String,
    hash: String,
    salt: String
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    displayname: this.displayname,
    token: this.generateJWT(),
    createdByUser: this.createdByUser
  };
};

UserSchema.methods.toProfileJSONFor = function(user) {
  if (!user) {
    return null;
  }
  return {
    username: user.username,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    displayname: user.lastname,
    gender: user.gender,
    birthday: user.birthday,
    phoneNumber: user.phoneNumber,
    isSuperUser: user.isSuperUser,
    updatePassword: user.updatePassword,
    lastIpAddress: user.lastIpAddress,
    isDeleted: user.isDeleted,
    createdByUser: user.createdByUser,
    createOnDateTime: user.createOnDateTime,
    lastModifyUserID: user.lastModifyUserID,
    lowerEmail: user.lowerEmail,
    image: user.image
  };
};

// UserSchema.methods.favorite = function(id){
//   if(this.favorites.indexOf(id) === -1){
//     this.favorites.push(id);
//   }

//   return this.save();
// };

// UserSchema.methods.unfavorite = function(id){
//   this.favorites.remove(id);
//   return this.save();
// };

// UserSchema.methods.isFavorite = function(id){
//   return this.favorites.some(function(favoriteId){
//     return favoriteId.toString() === id.toString();
//   });
// };

// UserSchema.methods.follow = function(id){
//   if(this.following.indexOf(id) === -1){
//     this.following.push(id);
//   }

//   return this.save();
// };

// UserSchema.methods.unfollow = function(id){
//   this.following.remove(id);
//   return this.save();
// };

// UserSchema.methods.isFollowing = function(id){
//   return this.following.some(function(followId){
//     return followId.toString() === id.toString();
//   });
// };

mongoose.model("User", UserSchema);
