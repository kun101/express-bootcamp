var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

var indexFunction = async function (req, res, next) {
    var client = await MongoClient.connect(process.env["MONGO_URL"]);
    var db = client.db("mydb");
    var collection = db.collection("test");

    var document = await collection.findOne({
        name: "kunal",
    });

    console.log(document);

    res.render("index", { title: document.title, subtitle: document.subtitle });
}

module.exports = indexFunction;