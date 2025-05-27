// src/data-source.ts
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "982006hy",
  database: "blog",
  synchronize: true,
  logging: false,
  entities: [User,Post],  
});


