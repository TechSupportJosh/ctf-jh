import express from "express";
import rateLimit from "express-rate-limit";
import { getDistance } from "geolib";
import { FlagSubmissionDTO } from "../dto/FlagSubmission";
import { Challenge, FlagType } from "../entity/Challenge";
import { Team } from "../entity/Team";
import { UserSolveAttempt, UserSolvedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import { Configuration } from "../utils/config";
import { sendEvent } from "../utils/sse";
import { sendWebhook } from "../utils/webhook";

const router = express.Router();

router.get("/", async (req, res) => {
  const config = Configuration.get();

  if (!config.canViewChallenges()) return res.json([]);

  const challenges = await Challenge.find({ relations: ["unlockRequirement", "solves"], where: { disabled: false } });

  res.json(
    challenges.map((challenge) => {
      // Apply dynamic scoring
      if (config.scoringType === "dynamic" && challenge.solves.length > config.dynamicScoreMinSolves) {
        challenge.points = Math.max(
          challenge.points -
            Math.min(config.dynamicScoreMaxSolves, challenge.solves.length - config.dynamicScoreMinSolves) * config.dynamicScoreReduction,
          0
        );
      }

      // Check whether the user has solved this challenge
      // If they haven't, then we returned a censored version of the challenge
      if (
        challenge.unlockRequirement &&
        !(req.user?.hasSolvedChallenge(challenge.unlockRequirement) || req.user?.team?.hasSolvedChallenge(challenge.unlockRequirement))
      ) {
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

  const config = Configuration.get();

  if (!config.canSubmitFlags()) return res.status(400).json({ message: "Unable to submit flags at this time." });

  const challenge = await Challenge.createQueryBuilder("challenge").addSelect("flag").where({ id: req.params.challengeId }).getOne();
  if (!challenge) return res.status(404);

  const userTeam = await Team.createQueryBuilder("team")
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("members.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .getOne();

  if (req.user?.hasSolvedChallenge(challenge) || userTeam?.hasSolvedChallenge(challenge))
    return res.status(400).json({ message: "Challenge has already been submitted." });

  if (challenge.unlockRequirement && !req.user?.hasSolvedChallenge(challenge.unlockRequirement))
    return res.status(400).json({ message: "Challenge is locked." });

  if (challenge.flagType === FlagType.STRING && challenge.flag !== flag) {
    await UserSolveAttempt.create({ challenge: challenge, user: req.user, correct: false }).save();
    return res.status(400).json({ message: "Incorrect flag." });
  }

  if (challenge.flagType === FlagType.LOCATION) {
    // Firstly attempt to split up their flag
    const [latitudeString, longitudeString] = flag.split(",");
    const latitude = parseFloat(latitudeString);
    const longitude = parseFloat(longitudeString);

    if (isNaN(longitude) || isNaN(latitude)) {
      await UserSolveAttempt.create({ challenge: challenge, user: req.user, correct: false }).save();
      return res.status(400).json({ message: "Incorrect flag." });
    }

    const [flagLatituideString, flatLongitudeString] = challenge.flag.split(",");
    const flagLatitude = parseFloat(flagLatituideString);
    const flagLongitude = parseFloat(flatLongitudeString);

    const config = Configuration.get();

    if (getDistance({ latitude: flagLatitude, longitude: flagLongitude }, { latitude, longitude }) > config.locationFlagPrecision) {
      await UserSolveAttempt.create({ challenge: challenge, user: req.user, correct: false }).save();
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

  await UserSolveAttempt.create({ challenge: challenge, user: req.user, correct: true }).save();

  await sendWebhook(req.user!, parseInt(req.params.challengeId));

  if (userTeam) {
    // If the user is apart of a team, we need to send SSE event which ensures that
    // they have the up to date versions of challenges / team info
    // We explicitly ignore the request user, as the frontend will handle retrieivng
    // the new challenges
    sendEvent(
      "fetch",
      ["team", "challenges"],
      userTeam.members.filter((member) => member.id !== req.user!.id).map((member) => member.id)
    );
  }
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
