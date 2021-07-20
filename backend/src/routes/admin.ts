import express from "express";
import { Challenge } from "../entity/Challenge";

const router = express.Router();

router.get("/challenges", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement"] });

  res.json(challenges.map((challenge) => challenge.toJSON()));
});

export const adminRouter = router;
