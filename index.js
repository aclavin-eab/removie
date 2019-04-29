
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb://localhost:27017"
// Connect to the db
// (async function() {
//   try {
//
//     const client = await MongoClient.connect(uri, { useNewUrlParser: true });
//     // ... anything
//     console.log(client)
//     client.close();
//   } catch(e) {
//     console.error(e)
//   }
// })()
MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  // Client returned
  var db = client.db('removie');
  let reviwes
  db.collection('reviews').find({}, {'text': 1, _id: 0}).toArray((err, docs) => {
    console.log("Found the following records");
    console.log(docs)
    reviews = docs.map(doc => doc.text)
    console.log(reviews)
    //callback(docs);
  });
  const express = require('express')
  const graphqlHTTP = require('express-graphql')
  const { buildSchema } = require('graphql')
  const schema = buildSchema(`
      type Query {
          hello: String
          review: [String]
      }
  `)

  const root = {
    hello: () => {
        return 'Hello world!'
    },
    review: () => {
        return reviews
    }
  }

  const app = express()
  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }))
  app.listen(4000)
  console.log('Running a GraphQL API server at localhost:4000/graphql')
});
