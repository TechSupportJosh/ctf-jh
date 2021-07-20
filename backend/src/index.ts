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

const app = express();
app.use(cookieParser());
app.use(express.json());

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

// Mount all routes under /api
app.use("/api", router);

(async () => {
  const connection: Connection = await createConnection({
    type: "sqlite",
    database: "database.db",
    synchronize: true,
    entities: ["src/entity/*.ts"],
  });

  const demoChallenge = new Challenge();
  demoChallenge.disabled = false;
  demoChallenge.author = "Josh";
  demoChallenge.description = "It's a demo challenge";
  demoChallenge.difficulty = "Easy";
  demoChallenge.flag = "WMG{Test Flag}";
  demoChallenge.hint = "This is a hint";
  demoChallenge.points = 30;
  demoChallenge.title = "Demo Challange";
  demoChallenge.educationResources = [];
  demoChallenge.tags = [];

  await demoChallenge.save();

  const tag = new ChallengeTag();
  tag.tag = "LFI";
  tag.challenge = demoChallenge;
  await tag.save();

  const tag2 = new ChallengeTag();
  tag2.tag = "RFI";
  tag2.challenge = demoChallenge;
  await tag2.save();

  const resource = new EducationResource();
  resource.resource = "https://google.com";
  resource.challenge = demoChallenge;
  await resource.save();

  const lockedChallenge = new Challenge();
  lockedChallenge.disabled = false;
  lockedChallenge.author = "Josh";
  lockedChallenge.description = "It's the sequel!";
  lockedChallenge.difficulty = "Hard";
  lockedChallenge.flag = "WMG{Test Flag 2}";
  lockedChallenge.hint = "This is a hint";
  lockedChallenge.points = 70;
  lockedChallenge.title = "Demo Locked Challenge";
  lockedChallenge.educationResources = [];
  lockedChallenge.tags = [];
  lockedChallenge.unlockRequirement = demoChallenge;
  await lockedChallenge.save();

  app.listen(8080, () => {
    console.log("Listening on port 8080...");
  });
})();
