var express = require("express");
var router = express.Router();

var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

var loginCheck = require("../middlewares/checkLogin");
var indexFunction = require("../controllers/indexController");

/* GET home page. */
router.get("/", indexFunction);

router.get("/createProduct", function (req, res, next) {
    res.render("createProduct");
});

router.post("/createProduct", loginCheck, async function (req, res, next) {
    var client = await MongoClient.connect(process.env["MONGO_URL"]);
    var db = client.db("mydb");
    var collection = db.collection("products");

    // console.log(req.body)
    await collection.insertOne({
        name: req.body.name,
        price: parseInt(req.body.price),
        photo: req.body.photo,
        description: req.body.description,
        email: req.user.email,
    });

    res.redirect("/home");
});

router.get("/home", async function (req, res, next) {
    var client = await MongoClient.connect(process.env["MONGO_URL"]);
    var db = client.db("mydb");
    var collection = db.collection("products");

    var products = await collection.find({}).toArray();
    console.log(products);

    var user = req.user;
    if (user == undefined) {
        user = {
            name: "",
            email: "guest",
        };
    }

    res.render("home", {
        products: products,
        user: user,
    });
});

router.post(
    "/deleteProduct/:product_id",
    loginCheck,
    async function (req, res, next) {
        var client = await MongoClient.connect(process.env["MONGO_URL"]);
        var db = client.db("mydb");
        var collection = db.collection("products");

        var product = await collection.findOne({
            _id: new ObjectId(req.params.product_id),
        });

        if (product.email == req.user.email) {
            await collection.deleteOne({
                _id: new ObjectId(req.params.product_id),
            });

            res.redirect("/home");
        } else {
            res.send("You don't have permissions to delete this product");
        }
    }
);

router.get("/updateProduct/:product_id", async function (req, res, next) {
    var client = await MongoClient.connect(process.env["MONGO_URL"]);
    var db = client.db("mydb");
    var collection = db.collection("products");

    var product = await collection.findOne({
        _id: new ObjectId(req.params.product_id),
    });

    console.log(product);

    res.render("updateProduct", {
        product: product,
    });
});

router.post("/updateProduct/:product_id", async function (req, res, next) {
    var client = await MongoClient.connect(process.env["MONGO_URL"]);
    var db = client.db("mydb");
    var collection = db.collection("products");

    var product = await collection.findOne({
        _id: new ObjectId(req.params.product_id),
    });

    if (product.email == req.user.email) {
        // console.log(req.body)
        await collection.updateOne(
            {
                _id: new ObjectId(req.params.product_id),
            },
            {
                $set: {
                    name: req.body.name,
                    price: parseInt(req.body.price),
                    photo: req.body.photo,
                    description: req.body.description,
                    email: req.user.email,
                },
            }
        );
        res.redirect("/home");
    } else {
        res.send("You don't have permissions to update this product");
    }
});

module.exports = router;
