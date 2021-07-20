import express from "express";
import { Challenge } from "../entity/Challenge";
import { User, UserCompletedChallenge } from "../entity/User";

const router = express.Router();

router.get("/challenges", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement", "completions"] });

  res.json(challenges.map((challenge) => challenge.toJSON()));
});

router.get("/stats", async (req, res) => {
  const userCount = await User.count();
  const totalCompletions = await UserCompletedChallenge.count();

  res.json({
    userCount,
    totalCompletions,
  });
});

export const adminRouter = router;
