import express from "express";
import { promisify } from "util";
import { User, UserAuth } from "../entity/User";
import { isAuthenticated } from "../middlewares/auth";
import { EventType, logEvent } from "../utils/log";

const router = express.Router();

router.get("/", isAuthenticated(), (req, res) => {
  res.json(req.user!.toSelfJSON());
});

router.get("/stats", isAuthenticated(), async (req, res) => {
  const user = await User.findOne({ where: { id: req.user!.id }, relations: ["stats", "solveAttempts"] });
  res.json(user!.stats);
});

router.get("/sessions", isAuthenticated(), async (req, res) => {
  const sessions = await UserAuth.createQueryBuilder("userAuth")
    .select("userAuth.creationDate")
    .addSelect("userAuth.ipAddress")
    .addSelect("userAuth.userAgent")
    .addSelect("userAuth.authId")
    .where({ userId: req.user!.id })
    .getMany();
  res.json(sessions);
});

router.delete("/sessions", isAuthenticated(), async (req, res) => {
  const sessions = await UserAuth.find({ where: { user: req.user } });

  await Promise.all(sessions.map((session) => session.remove()));

  logEvent(EventType.UserDeletedSessions, { "user:userId": req.user!.id });

  return res.status(200).send({ message: "Sessions deleted." });
});

router.delete("/sessions/:authId", isAuthenticated(), async (req, res) => {
  const userAuth = await UserAuth.findOne({ where: { user: req.user, authId: req.params.authId } });

  if (!userAuth) return res.status(404).send({ message: "This session does not exist." });

  await userAuth.remove();

  logEvent(EventType.UserDeletedSession, { "user:userId": req.user!.id });

  return res.status(200).send({ message: "Session deleted." });
});

export const selfRouter = router;
