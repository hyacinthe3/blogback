"use strict";
// src/data-source.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "hyacinthee",
    password: "982006hy",
    database: "blog",
    synchronize: true,
    logging: false,
    entities: [User_1.User, Post_1.Post],
});
