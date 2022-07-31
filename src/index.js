import cors from 'cors';
import { createServer } from "http";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
// import { PubSub } from "graphql-subscriptions";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import jwt from 'jsonwebtoken';

import {Bank, Post, Role, User, Comment, Mail, Socket} from './model'

import connection from './mongo' 
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

let pubsub = new PubSub();

let PORT = process.env.PORT || 4000;
// const pubsub = new PubSub();

// Schema definition
// const typeDefs = gql`
//   type Query {
//     currentNumber: Int
//   }

//   type Subscription {
//     numberIncremented: Int
//   }
// `;

// // Resolver map
// const resolvers = {
//   Query: {
//     currentNumber() {
//       return currentNumber;
//     },
//   },
//   Subscription: {
//     numberIncremented: {
//       subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
//     },
//   },
// };

async function startApolloServer(typeDefs, resolvers) {

    // Create schema, which will be used separately by ApolloServer and
    // the WebSocket server.
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Create an Express app and HTTP server; we will attach the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();
    const httpServer = createServer(app);

    // Set up WebSocket server.
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql",
    });

    const getDynamicContext = async (ctx, msg, args) => {
        // ctx is the graphql-ws Context where connectionParams live
       if (ctx.connectionParams.authToken) {
            //   const currentUser = await findUser(connectionParams.authentication);
            //   return { currentUser };

            try {
                let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);

                // code
                // -1 : foce logout
                //  0 : anonymums
                //  1 : OK

                // {status: true, code: 1, data}

                let currentUser = await User.findById(userId)
                
                // console.log("currentUser >> " , currentUser._id)
                return {...ctx, currentUser} 
            } catch(err) {
                // logger.error(err.toString());
                console.log(">> ", err.toString())
            }
        }
        // Otherwise let our resolvers know we don't have a current user

        // console.log("getDynamicContext :", ctx.connectionParams.authToken)

        return { ...ctx, currentUser: null };
    };

    const serverCleanup = useServer({ 
            schema,
            context: (ctx, msg, args) => {
                // Returning an object will add that information to our
                // GraphQL context, which all of our resolvers have access to.
                return getDynamicContext(ctx, msg, args);
            },
            onConnect: async (ctx) => {
                // Check authentication every time a client connects.
                // if (tokenIsNotValid(ctx.connectionParams)) {
                //   // You can return false to close the connection  or throw an explicit error
                //   throw new Error('Auth token missing!');
                // }
                // console.log("Connect! ", ctx);

                if (ctx.connectionParams.authToken) {
                    console.log("Connect! ", ctx.connectionParams.authToken);
                    try {
                        let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);
        
                        await User.updateOne({
                            _id: userId
                        }, {
                            $set: {
                                isOnline: true
                            }
                        })
                    } catch(err) {
                        console.log(">> ", err.toString())
                    }
                }
            },
            onDisconnect: async (ctx, code, reason) =>{
                console.log("Disconnected! ", ctx.connectionParams.authToken);

                if (ctx.connectionParams.authToken) {
                    try {
                        let userId  = jwt.verify(ctx.connectionParams.authToken, process.env.JWT_SECRET);
        
                        await User.updateOne({
                            _id: userId
                        }, {
                            $set: {
                                isOnline: false
                            }
                        })
                    } catch(err) {
                        console.log(">> ", err.toString())
                    }
                }
            }
        }, 
        wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: "bounded",
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),
        
            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                return {
                    async drainServer() {
                    await serverCleanup.dispose();
                    },
                };
                },
            },
        ],

        // subscriptions: {
        //     path: "/subscriptions",
        //     onConnect: () => {
        //       console.log("Client connected for subscriptions");
        //     },
        //     onDisconnect: () => {
        //       console.log("Client disconnected from subscriptions");
        //     },
        // },

        context: async ({ req }) => {
            // console.log("ApolloServer context ", req.headers)

            // https://daily.dev/blog/authentication-and-authorization-in-graphql
            // throw Error("throw Error(user.msg);");

            // const decode = jwt.verify(token, 'secret');

            if (req.headers && req.headers.authorization) {
                var auth    = req.headers.authorization;
                var parts   = auth.split(" ");
                var bearer  = parts[0];
                var token   = parts[1];

                if (bearer == "Bearer") {
                    // let decode = jwt.verify(token, process.env.JWT_SECRET);

                    try {
                        let userId  = jwt.verify(token, process.env.JWT_SECRET);

                        // code
                        // -1 : foce logout
                        //  0 : anonymums
                        //  1 : OK

                        // {status: true, code: 1, data}

                        let currentUser = await User.findById(userId)
                        
                        // console.log("context >> " , data._id)
                        return {...req, pubsub, currentUser} 
                    } catch(err) {
                        // logger.error(err.toString());
                        console.log(">> ", err.toString())
                    }
                }
            }
            return {...req, pubsub, currentUser: null}
        }
    });
  

    await server.start();
    server.applyMiddleware({ app });

    // server.installSubscriptionHandlers(httpServer);
    
    // Now that our HTTP server is fully set up, actually listen.
    httpServer.listen(PORT, () => {
    console.log(
        `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
    });
}

startApolloServer(typeDefs, resolvers) 


// In the background, increment a number every second and notify subscribers when
// // it changes.
// let currentNumber = 0;
// function incrementNumber() {
//   currentNumber++;
//   pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: currentNumber });
//   setTimeout(incrementNumber, 1000);
// }
// // Start incrementing
// incrementNumber();
