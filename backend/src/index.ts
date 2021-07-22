import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import cookieParser from "cookie-parser";

dotenv.config();

import { isAdmin, isAuthenticated } from "./middlewares/auth";
import { Challenge, ChallengeTag, EducationResource } from "./entity/Challenge";
import { authRouter } from "./routes/auth";
import { challengeRouter } from "./routes/challenges";
import { adminRouter } from "./routes/admin";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
    },
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "common" : "dev"));

const router = express.Router();
router.use("/auth", authRouter);
router.use("/challenges", isAuthenticated(), challengeRouter);
router.use("/admin", isAdmin(), adminRouter);

router.get("/me", isAuthenticated(), (req, res) => {
  res.json(req.user);
});

app.get("/", isAuthenticated(), (req, res) => {
  res.send("You are authenticated! " + JSON.stringify(req.user));
});

router.use("/static", express.static("uploads"));

// Mount all routes under /api
app.use("/api", router);

(async () => {
  const connection: Connection = await createConnection({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    entities: [path.join(__dirname, "entity", "*.js"), path.join(__dirname, "entity", "*.ts")],
  });

  app.listen(8080, () => {
    console.log("Listening on port 8080...");
  });
})();
