require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const fetch = require("node-fetch")
const uri = "mongodb://localhost:27017"
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express').default
const { ApolloServer } = require('apollo-server-express')
const typeDefs = `
  type Query {
      totalReviews: Int!
      totalMovies: Int!
      me: User
  }
  type AuthPayload {
      token: String!
      user: User!
  }
  type User {
      githubLogin: ID!
      name: String
      avatar: String
  }
  type Mutation {
      addMovie(title: String! description: String): Boolean!
      addReview(text: String! movieId: String!): Boolean!
      githubAuth(code: String!): AuthPayload!
  }
`

const requestGithubToken = credentials =>
    fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(credentials)
        }
    ).then(res => res.json()).catch(error => { throw new Error(JSON.stringify(error))})

const requestGithubUserAccount = token =>{
    return fetch(`https://api.github.com/user?access_token=${token}`).then(res => res.json())
}

const authorizeWithGithub = async (credentials) => {
    const { access_token} = await requestGithubToken(credentials)
    const githubUser = await requestGithubUserAccount(access_token)
    return { ...githubUser, access_token }
}
const resolvers = {
    Query: {
        totalReviews: (parent, args, { db }) => db.collection('reviews').estimatedDocumentCount(),
        totalMovies: (parent, args, { db }) => db.collection('movies').estimatedDocumentCount(),
        me: (parent, args, { currentUser}) => currentUser
    },
    Mutation: {
        async addMovie(parent, args, { db, currentUser }){
            if(!currentUser) {
                throw new Error('only an authorized user can post a movie')
            }
            const newMovie = {
                ...args.input,
                userID: currentUSer.githubLogin,
                created: new Date()
            }
            const { insertedIds } = await db.collection('movies').insertOne(newMovie)
            newMovie.id = insertedIds[0]

            return true
        },
        addReview(parent, args, { db }){
            console.log('hitting review')
            db.collection('reviews').insertOne(args)
            return true
        },
        async githubAuth(parent, { code }, { db }) {
            console.log('stuff!', code)
            let { message, access_token, avatar_url, login, name } = await authorizeWithGithub({
                client_id: process.env.GIT_CLIENT_ID,
                client_secret: process.env.GIT_CLIENT_SECRET,
                code
            })
            console.log('WHATS UP', stuff)
            if(message) {
                throw new Error(message)
            }
            let latestUserInfo = {
                name,
                githubLogin: login,
                githubToken: access_token,
                avatar: avatar_url
            }
            const { ops:[user] } = await db.collection('users').replaceOne({ githubLogin: login}, latestUserInfo, {upsert: true})
            return { user, token: access_token}
        }
    }
}
//

//server.listen().then(({url}) => console.log(`Graphql servire running on ${url}`))
async function start(){
    const app = express()

    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
    const db = client.db('removie')
    const context = async ({ req }) =>{
        const githubToken = req.headers.authorization
        const currentUser = await db.collection('users').findOne({ githubToken })
        return { db, currentUser }
    }
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context
    })

    server.applyMiddleware({ app })

    app.get('/', expressPlayground({ endpoint: '/graphql'}))

    app.listen({ port: 4000 }, () =>
        console.log(`Server runnin at 4000`)
    )
}
start()
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
// MongoClient.connect('mongodb://localhost:27017', (err, client) => {
//   // Client returned
//   var db = client.db('removie');
//   let reviwes
//   db.collection('reviews').find({}, {'text': 1, _id: 0}).toArray((err, docs) => {
//     console.log("Found the following records");
//     console.log(docs)
//     reviews = docs.map(doc => doc.text)
//     console.log(reviews)
//     //callback(docs);
//   });
//   const express = require('express')
//   const graphqlHTTP = require('express-graphql')
//   const { buildSchema } = require('graphql')
//
//   const root = {
//     hello: () => {
//         return 'Hello world!'
//     },
//     review: () => {
//         return reviews
//     }
//   }
//
//   const app = express()
//   app.use('/graphql', graphqlHTTP({
//     schema: schema,
//     rootValue: root,
//     graphiql: true,
//   }))
//   app.listen(4001)
//   console.log('Running a GraphQL API server at localhost:4001/graphql')
// });
