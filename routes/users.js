var express = require("express");
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(
    new GoogleStrategy({
        clientID: process.env["GOOGLE_CLIENT_ID"],
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
        callbackURL: "/users/auth/google/callback",
    }, async function (accessToken, refreshToken, profile, done){
      var client = await MongoClient.connect(process.env["MONGO_URL"]);
      var db = client.db("mydb");
      var collection = db.collection("users");

      await collection.findOneAndUpdate({
        email: profile.emails[0].value
      },{
        $set : {
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value
        }
      },{
        upsert: true
      });

      console.log(profile);
      return done(null, profile);
    })
);

router.get("/auth/login", passport.authenticate("google", {
  scope: ["profile","email"]
}))

router.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "/home",
  failureRedirect: "/"
}))

router.get("/logout", function(req, res, next){
  req.logout(function(){
    console.log("Logged out successfully")
  });
  res.redirect("/")
})

module.exports = router;
