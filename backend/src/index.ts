import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { mkdir, access } from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import { promisify } from "util";
import { isAdmin, isAuthenticated } from "./middlewares/auth";
import { uploadDirectory } from "./constants";
import { CronJob } from "cron";

dotenv.config();

const mkdirAsync = promisify(mkdir);
const accessAsync = promisify(access);

import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { challengeRouter } from "./routes/challenges";
import { leaderboardRouter } from "./routes/leaderboard";
import { teamsRouter } from "./routes/teams";
import { updateStats } from "./utils/statsCron";
import { User } from "./entity/User";
import { UserStats } from "./entity/Stats";
import { getConfig } from "./utils/config";

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
router.use("/teams", isAuthenticated(), teamsRouter);
router.use("/leaderboard", isAuthenticated(), leaderboardRouter);
router.use("/admin", isAdmin(), adminRouter);

router.get("/me", isAuthenticated(), (req, res) => {
  res.json(req.user!.toSelfJSON());
});

router.get("/me/stats", isAuthenticated(), async (req, res) => {
  const user = await User.findOne({ where: { id: req.user!.id }, relations: ["stats"] });
  res.json(user!.stats);
});

router.get("/config", isAuthenticated(), async (req, res) => {
  const config = await getConfig();
  res.json({ ...config, id: undefined });
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

  // Create upload directory
  try {
    await accessAsync(uploadDirectory);
  } catch (err) {
    await mkdirAsync(uploadDirectory);
  }

  const job = new CronJob("0 0 * * * *", () => updateStats(connection));
  job.start();

  app.listen(8080, () => {
    console.log("Listening on port 8080...");
  });
})();
