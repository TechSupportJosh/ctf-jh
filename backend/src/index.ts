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
import { teamsRouter } from "./routes/teams";
import { Team, TeamStats } from "./entity/Team";

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
router.use("/admin", isAdmin(), adminRouter);

router.get("/me", isAuthenticated(), (req, res) => {
  res.json(req.user!.toSelfJSON());
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

  const job = new CronJob("0 0 * * * *", async function () {
    console.log("Updating team stats for all teams...");
    const currentDate = new Date();

    const teams = await Team.createQueryBuilder("team")
      .leftJoinAndSelect("team.members", "members")
      .leftJoinAndSelect("team.teamLeader", "teamLeader")
      .leftJoinAndSelect("members.completedChallenges", "completedChallenges")
      .leftJoinAndSelect("completedChallenges.challenge", "challenge")
      .getMany();

    await Promise.all(
      teams.map((team) => {
        const entry = new TeamStats();
        entry.team = team;
        entry.date = currentDate;
        entry.points = 0;
        entry.bloods = 0;
        entry.solves = 0;

        team.members.forEach((member) => {
          member.completedChallenges.forEach((completedChallenge) => {
            entry.points += completedChallenge.challenge.points;
            entry.bloods += completedChallenge.isBlood ? 1 : 0;
            entry.solves += 1;
          });
        });

        return entry.save();
      })
    );
  });
  job.start();

  app.listen(8080, () => {
    console.log("Listening on port 8080...");
  });
})();
