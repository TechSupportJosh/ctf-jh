import express from "express";
import { UserStats } from "../entity/Stats";
import { User } from "../entity/User";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.userId }, relations: ["solvedChallenges"] });

  if (!user) return res.status(400).json({ message: "User does not exist." });

  res.json(user.toPublicJSON(true));
});

router.get("/:userId/stats", async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.userId } });

  if (!user) return res.status(400).json({ message: "User does not exist." });

  res.json(await UserStats.find({ where: { user: user } }));
});

export const usersRouter = router;
