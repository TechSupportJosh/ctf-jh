import express from "express";
import { User } from "../entity/User";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.userId } });

  if (!user) return res.status(400).json({ message: "User does not exist." });

  res.json(user.toPublicJSON(true));
});

router.get("/:userId/stats", async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.userId }, relations: ["stats", "solveAttempts"] });

  if (!user) return res.status(400).json({ message: "User does not exist." });

  res.json(user.stats);
});

export const usersRouter = router;
