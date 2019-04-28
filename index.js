
const MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/removie", (err, db) => {

     if(err) throw err;
     console.log('db running', db)
     //Write databse Insert/Update/Query code here..

});
