// src/index.ts
import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";

const app = express();
const PORT = process.env.PORT || 4000;
dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
