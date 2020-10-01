const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/';


function insertThingMongo(data) {
    MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
        if (err) throw err;
        var dbo = db.db("dbName");
        var thing = data;
        dbo.collection("things").insertOne(thing, (err, res) => {
            if (err) throw err;
            db.close();
        });
    });
}

function clearThings() {
    MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
        if (err) throw err;
        var dbo = db.db("dbName");
        dbo.collection("things").drop(() => {
            db.close();
        })
    })
}

function getScreenshotErrors() {
    MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
        if (err) throw err;
        var dbo = db.db("dbName");
        dbo.collection("things").find({}).toArray((err, result) => {
            if (err) throw err;
            return result;
        });
    });
}

module.exports = {
    uri: uri,
    insert: insertThingMongo,
    clear: clearThings,
    get: getScreenshotErrors
}