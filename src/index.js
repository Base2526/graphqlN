// import { ApolloServer } from "apollo-server";

import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import cors from 'cors'

import socketIO from 'socket.io'

// import mongoose from "mongoose";
import { elastic } from "./elastic"
import connection from './mongo' 

// TODO: import TypeDefs and Resolvers
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

import {Bank, Post, Role, User, Comment, Mail, Socket} from './model'

let PORT = process.env.PORT || 4040;

// // TODO: initial and connect to MongoDB
// mongoose.Promise = global.Promise;
// // mongoose.connect("YOUR_MONGODB_URI", { useNewUrlParser: true });

// // uri
// mongoose.connect(
//   "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/bl?replicaSet=rs",
//   {
//     useNewUrlParser: true,
//     useFindAndModify: false, // optional
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//   }
// );
// const dboose = mongoose.connection;
// dboose.on("error", console.error.bind(console, "mongoose : connection error:"));
// dboose.once("open", async function () {
//   // we're connected!
//   console.log("mongoose : Connected successfully to database!", PORT);
// });

/*
// TODO: create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen(PORT).then( async({ url }) => {
  console.log(`🚀  Server ready at ${url}`);

  let exists = await elastic.indices.exists({
    index: process.env.ELASTIC_INDEX,
  });

  console.log("elastic exists.statusCode :", exists.statusCode)
  if (exists.statusCode === 404){
    await elastic.indices.create({
      index: process.env.ELASTIC_INDEX,
      body: {},
    });
  }

  PostModel.watch().on("change", async (data) => {
    console.log("PostModel : change")
  });
});
*/
const bodyParser = require('body-parser');
const path = require('path');
const rfs = require('rotating-file-stream');
// const logger = require('./util/loggerEasy');
const logger = require('./utils/logger');
const { stream } = logger;
const morgan = require('morgan');


async function startApolloServer(typeDefs, resolvers) {
  const app = express();



  /////////////////

  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, 'logs'),
  });
  
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // Morgan
  morgan.token('th-date', function (req, res) {
    const date = new Date();
    return date;
  });
  app.use(morgan('common', { stream: accessLogStream }));
  app.use(
    morgan(
      ':th-date :method[pretty] :url :status :res[content-length] - :response-time ms',
      {
        stream: stream,
      }
    )
  );

  ////////////////


  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  let io = socketIO(httpServer)

  app.use(cors())

  server.applyMiddleware({  app, 
                            bodyParserConfig: {
                              limit: '100mb',
                            }
                          });
  let resolve = await new Promise(resolve => httpServer.listen({ port: PORT }, resolve({"status": true})));
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}` , resolve);

  await Socket.deleteMany({})

  io.on('connection', async(soc) => {

    // global.socket = socket
    let handshake = soc.handshake;

    let query = handshake.query;

    console.log('A client connected', soc.id, query.x)

    // logger.info(`Ready Listening on port`);

    await Socket.findOneAndUpdate({socketId: soc.id}, {updatedAt: Date.now() }, {
      new: true,
      upsert: true,
    });

    soc.on("disconnect", async () => {
      console.log("A client disconnect", soc.id)

      await Socket.deleteOne({socketId: soc.id })
    })

    // https://stackoverflow.com/questions/20337832/is-socket-io-emit-callback-appropriate
    /*
    client send data to server
    */
    soc.on('follow', (data, callback) => {
      console.log(`follow received is ${data}`)
      // return {result : "folow function()"}

      callback({data});
    });

  });
}

startApolloServer(typeDefs, resolvers) 
