import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import cookieParser from "cookie-parser";

dotenv.config();

import { authRouter } from "./routes/auth";
import { isAuthenticated } from "./middlewares/auth";

const app = express();
app.use(cookieParser());

const router = express.Router();
router.use("/auth", authRouter);

app.get("/", isAuthenticated(), (req, res) => {
  res.send("You are authenticated! " + JSON.stringify(req.user));
});

// Mount all routes under /api
app.use("/api", router);

(async () => {
  const connection: Connection = await createConnection({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    entities: ["src/entity/*.ts"],
  });

  app.listen(8080, () => {
    console.log("Listening on port 8080...");
  });
})();
