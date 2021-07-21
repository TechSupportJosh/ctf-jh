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
    entities: ["src/entity/*.ts"],
  });

  app.listen(8080, () => {
    console.log("Listening on port 8080...");
  });
})();
