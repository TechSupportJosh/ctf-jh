import express from "express";
import { FlagSubmissionDTO } from "../dto/FlagSubmission";
import { Challenge, ChallengeTag } from "../entity/Challenge";
import { UserCompletedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import { sendWebhook } from "../utils/webhook";

const router = express.Router();

router.get("/", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement"], where: { disabled: false } });

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

router.post("/:challengeId/submit", validator(FlagSubmissionDTO), async (req, res) => {
  const { flag } = res.locals.dto as FlagSubmissionDTO;

  const challenge = await Challenge.findOne({ select: ["id", "flag", "unlockRequirement"], where: { id: req.params.challengeId } });
  if (!challenge) return res.status(404);

  if (req.user?.hasCompletedChallenge(challenge)) return res.status(400).json({ message: "Challenge has already been submitted." });

  if (challenge.unlockRequirement && !req.user?.hasCompletedChallenge(challenge.unlockRequirement))
    return res.status(400).json({ message: "Challenge is locked." });

  if (challenge.flag !== flag) return res.status(400).json({ message: "Incorrect flag." });

  const completedChallenge = new UserCompletedChallenge();
  completedChallenge.challenge = challenge;
  completedChallenge.user = req.user!;
  completedChallenge.completionDate = new Date();
  await completedChallenge.save();

  await sendWebhook(req.user!, parseInt(req.params.challengeId));

  return res.status(200).json({ message: "Great job!" });
});

export const challengeRouter = router;
