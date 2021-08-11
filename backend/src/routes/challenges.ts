import express from "express";
import rateLimit from "express-rate-limit";
import { FlagSubmissionDTO } from "../dto/FlagSubmission";
import { Challenge, ChallengeTag, FlagType } from "../entity/Challenge";
import { User, UserSolvedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import { sendWebhook } from "../utils/webhook";
import { getDistance } from "geolib";
import { locationFlagPrecision } from "shared/config";

const router = express.Router();

router.get("/", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement", "solves"], where: { disabled: false } });

  res.json(
    challenges.map((challenge) => {
      // Check whether the user has solved this challenge
      // If they haven't, then we returned a censored version of the challenge
      if (challenge.unlockRequirement && !req.user?.hasSolvedChallenge(challenge.unlockRequirement)) {
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

  const challenge = await Challenge.createQueryBuilder("challenge").addSelect("flag").where({ id: req.params.challengeId }).getOne();
  if (!challenge) return res.status(404);

  if (req.user?.hasSolvedChallenge(challenge)) return res.status(400).json({ message: "Challenge has already been submitted." });

  if (challenge.unlockRequirement && !req.user?.hasSolvedChallenge(challenge.unlockRequirement))
    return res.status(400).json({ message: "Challenge is locked." });

  if (challenge.flagType === FlagType.STRING && challenge.flag !== flag) return res.status(400).json({ message: "Incorrect flag." });

  if (challenge.flagType === FlagType.LOCATION) {
    // Firstly attempt to split up their flag
    const [latitudeString, longitudeString] = flag.split(",");
    const latitude = parseFloat(latitudeString);
    const longitude = parseFloat(longitudeString);

    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({ message: "Incorrect flag." });
    }

    const [flagLatituideString, flatLongitudeString] = challenge.flag.split(",");
    const flagLatitude = parseFloat(flagLatituideString);
    const flagLongitude = parseFloat(flatLongitudeString);

    if (getDistance({ latitude: flagLatitude, longitude: flagLongitude }, { latitude, longitude }) > locationFlagPrecision) {
      return res.status(400).json({ message: "Incorrect flag." });
    }
  }

  const solves = await UserSolvedChallenge.count({ where: { challengeId: challenge.id } });

  const solvedChallenge = new UserSolvedChallenge();
  solvedChallenge.challenge = challenge;
  solvedChallenge.user = req.user!;
  solvedChallenge.solveDate = new Date();
  solvedChallenge.isBlood = solves === 0;

  await solvedChallenge.save();

  await sendWebhook(req.user!, parseInt(req.params.challengeId));

  return res.status(200).json({ isBlood: solvedChallenge.isBlood });
});

router.get("/recent", async (req, res) => {
  const recentSolves = await UserSolvedChallenge.find({
    relations: ["user", "challenge"],
    take: 15,
    order: {
      solveDate: "DESC",
    },
  });

  return res.json(recentSolves.map((solve) => solve.toSimpleJSON()));
});

export const challengeRouter = router;
