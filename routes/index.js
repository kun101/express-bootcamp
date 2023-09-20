var express = require("express");
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(
    new GoogleStrategy({
        clientID: "10476920527-h05dueqe6irn2b2b7di33otafkmgj750.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "/auth/google/callback",
    }, async function (accessToken, refreshToken, profile, done){
      var client = await MongoClient.connect(
        "mongodb+srv://expressbootcamp8:test@cluster0.xtdz3pi.mongodb.net/"
      );
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

/* GET home page. */
router.get("/", async function (req, res, next) {

    var client = await MongoClient.connect(
        "mongodb+srv://expressbootcamp8:test@cluster0.xtdz3pi.mongodb.net/"
    );
    var db = client.db("mydb");
    var collection = db.collection("test");

    var document = await collection.findOne({
      name: "kunal"
    });

    console.log(document);

    res.render("index", { title: document.title, subtitle: document.subtitle });
});

router.get("/createProduct", function(req, res, next){
  res.render("createProduct");
});

router.post("/createProduct", function(req, res, next){

  if(req.isAuthenticated()){
    next();
  }else{
    res.send("You are not authenticated")
  }

}, async function(req, res, next){
  var client = await MongoClient.connect(
    "mongodb+srv://expressbootcamp8:test@cluster0.xtdz3pi.mongodb.net/"
  );
  var db = client.db("mydb");
  var collection = db.collection("products");

  // console.log(req.body)
  await collection.insertOne({
    name: req.body.name,
    price: parseInt(req.body.price),
    photo: req.body.photo,
    description: req.body.description,
    email: req.user.email
  });

  res.redirect("/home");

});

router.get("/home", async function(req, res, next){
  var client = await MongoClient.connect(
    "mongodb+srv://expressbootcamp8:test@cluster0.xtdz3pi.mongodb.net/"
  );
  var db = client.db("mydb");
  var collection = db.collection("products");

  var products = await collection.find({}).toArray();
  console.log(products)

  var user = req.user;
  if (user==undefined){
    user = {
      name: "",
      email: "guest"
    }
  }

  res.render("home", {
    products: products,
    user: user
  });
});

router.post("/deleteProduct/:product_id", function(req, res, next){

  if(req.isAuthenticated()){
    next();
  }else{
    res.send("You are not authenticated")
  }

}, async function(req, res, next){

  var client = await MongoClient.connect(
    "mongodb+srv://expressbootcamp8:test@cluster0.xtdz3pi.mongodb.net/"
  );
  var db = client.db("mydb");
  var collection = db.collection("products");

  var product = await collection.findOne({
    _id : new ObjectId(req.params.product_id)
  })

  if(product.email == req.user.email){
    await collection.deleteOne({
      _id: new ObjectId(req.params.product_id)
    });
  
    res.redirect("/home")
  }else{
    res.send("You don't have permissions to delete this file")
  }

});

module.exports = router;
