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
import { selfRouter } from "./routes/self";
import { usersRouter } from "./routes/users";
import { updateStats } from "./utils/statsCron";
import { Configuration } from "./utils/config";
import { addSSEClient, removeSSEClient } from "./utils/sse";
import { Config } from "./entity/Config";

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
router.use("/users", isAuthenticated(), usersRouter);
router.use("/admin", isAdmin(), adminRouter);
router.use("/me", isAuthenticated(), selfRouter);

router.get("/config", isAuthenticated(), async (req, res) => {
  const config = Configuration.get();
  res.json({ ...config, id: undefined });
});

router.get("/events", isAuthenticated(), (req, res) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    "X-Accel-Buffering": "no",
  });

  const client = addSSEClient(res, req.user!.id);

  // Keep-alive, should send periodically
  res.write("retry: 10000\n\n");
  res.write(":heartbeat\n\n");

  req.on("close", () => {
    removeSSEClient(client);
  });
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

  // Initialise config singleton
  await Configuration.update();

  // If no config exists, create one
  if (!Configuration.get()) {
    const config = new Config();
    config.startTime = new Date();
    config.endTime = new Date();
    await config.save();
    await Configuration.update();
    console.log("Initialised first-time configuration entry");
  }

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
