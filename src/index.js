import cors from 'cors';
import { createServer } from "http";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
// import { PubSub } from "graphql-subscriptions";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import connection from './mongo' 
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

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
    const serverCleanup = useServer({ schema }, wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer({
        schema,
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
