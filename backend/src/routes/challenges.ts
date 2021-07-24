import express from "express";
import rateLimit from "express-rate-limit";
import { FlagSubmissionDTO } from "../dto/FlagSubmission";
import { Challenge, ChallengeTag } from "../entity/Challenge";
import { User, UserCompletedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import { sendWebhook } from "../utils/webhook";

const router = express.Router();

router.get("/", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement", "completions"], where: { disabled: false } });

  res.json(
    challenges.map((challenge) => {
      // Check whether the user has completed this challenge
      // If they haven't, then we returned a censored version of the challenge
      if (challenge.unlockRequirement && !req.user?.hasCompletedChallenge(challenge.unlockRequirement)) {
        return challenge.toLockedJSON();
      }

      return challenge.toUnlockedJSON();
    })
  );
});

const flagSubmissionLimiter = rateLimit({
  max: 5,
  windowMs: 60 * 1000,
  keyGenerator: (req, res) => {
    return req.user!.id.toString();
  },
  skipSuccessfulRequests: true,
});
router.post("/:challengeId/submit", validator(FlagSubmissionDTO), flagSubmissionLimiter, async (req, res) => {
  const { flag } = res.locals.dto as FlagSubmissionDTO;

  const challenge = await Challenge.findOne({ select: ["id", "flag", "unlockRequirement"], where: { id: req.params.challengeId } });
  if (!challenge) return res.status(404);

  if (req.user?.hasCompletedChallenge(challenge)) return res.status(400).json({ message: "Challenge has already been submitted." });

  if (challenge.unlockRequirement && !req.user?.hasCompletedChallenge(challenge.unlockRequirement))
    return res.status(400).json({ message: "Challenge is locked." });

  if (challenge.flag !== flag) return res.status(400).json({ message: "Incorrect flag." });

  const completions = await UserCompletedChallenge.count({ where: { challengeId: challenge.id } });

  const completedChallenge = new UserCompletedChallenge();
  completedChallenge.challenge = challenge;
  completedChallenge.user = req.user!;
  completedChallenge.completionDate = new Date();
  completedChallenge.isBlood = completions === 0;

  await completedChallenge.save();

  await sendWebhook(req.user!, parseInt(req.params.challengeId));

  return res.status(200).json({ isBlood: completedChallenge.isBlood });
});

router.get("/recent", async (req, res) => {
  const recentCompletions = await UserCompletedChallenge.find({ relations: ["user", "challenge"], take: 20 });

  console.log(recentCompletions);

  return res.json(recentCompletions.map((completion) => completion.toSimpleJSON()));
});

export const challengeRouter = router;
