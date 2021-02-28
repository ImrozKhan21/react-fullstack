import "reflect-metadata";
import {MikroORM} from "@mikro-orm/core";
import {__prod__} from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {HelloResolver} from "./resolvers/hello";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

const main = async () => {
    // Order matters, liked redis session needs to be done before middleware
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    // For Same origin policy error
    app.use(
        cors({
        origin: "http://localhost:3000",
        credentials: true
    }))

    // For Setting of cookie, and using Redix
    app.use(
        session({
            name: "qid",
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax", // csrf
                secure: __prod__, // only works in https
            },
            saveUninitialized: false,
            secret: "mehru786", // usually hide it
            resave: false,
        })
    );

    // Apollo server for GraphQl queries and mutations
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) =>
            ({em: orm.em, req, res}), // context is used to share data to all resolvers
    });

    apolloServer.applyMiddleware({
        app,
        cors: false
    });

    app.listen(4000, () => {
        console.log("server started on localhost:4000");
    });
};

main().catch((err) => {
    console.log("ERROR", err);
});
