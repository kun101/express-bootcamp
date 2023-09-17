var express = require("express");
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;

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

module.exports = router;
