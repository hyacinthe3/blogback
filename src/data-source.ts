// src/data-source.ts
import { DataSource } from "typeorm";
import { Users } from "./entities/User";
import { Post } from "./entities/Post";
import { Token } from "./entities/token";
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "982006hy",
  database: "blog",
  synchronize: true,
  logging: false,
  entities: [Users,Post,Token],  
  dropSchema: true, // CAUTION: drops everything on startup!
});


