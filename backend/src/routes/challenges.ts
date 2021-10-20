import express from "express";
import rateLimit from "express-rate-limit";
import { getDistance } from "geolib";
import path from "path";
import { uploadDirectory } from "../constants";
import { FlagSubmissionDTO } from "../dto/FlagSubmission";
import { Challenge, FlagType } from "../entity/Challenge";
import { EventType } from "../entity/Log";
import { Team } from "../entity/Team";
import { User, UserSolveAttempt, UserSolvedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import { Configuration } from "../utils/config";
import { logEvent } from "../utils/log";
import { sendEvent } from "../utils/sse";
import { sendWebhook } from "../utils/webhook";

const router = express.Router();

router.get("/", async (req, res) => {
  const config = Configuration.get();

  if (!config.canViewChallenges()) return res.json([]);

  const challenges = await Challenge.find({ relations: ["unlockRequirement"], where: { disabled: false } });

  const response: any[] = [];

  for (const challenge of challenges) {
    if (challenge.unlockRequirement && !(await req.user!.hasSolvedChallenge(challenge.unlockRequirement))) {
      response.push(await challenge.toLockedJSON());
    } else {
      response.push(await challenge.toUnlockedJSON());
    }
  }

  res.json(response);
  // }
  // res.json(
  //   await Promise.all(
  //     challenges.map(async (challenge) => {
  //       // Check whether the user has solved this challenge
  //       // If they haven't, then we returned a censored version of the challenge
  //       if (challenge.unlockRequirement && !(await req.user!.hasSolvedChallenge(challenge.unlockRequirement))) {
  //         return challenge.toLockedJSON();
  //       }

  //       return challenge.toUnlockedJSON();
  //     })
  //   )
  // );
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

  if (await req.user!.hasSolvedChallenge(challenge)) return res.status(400).json({ message: "Challenge has already been submitted." });

  if (challenge.unlockRequirement && !(await req.user?.hasSolvedChallenge(challenge.unlockRequirement)))
    return res.status(400).json({ message: "Challenge is locked." });

  if (challenge.flagType === FlagType.String && challenge.flag !== flag) {
    await UserSolveAttempt.create({ challenge: challenge, user: req.user, correct: false }).save();
    return res.status(400).json({ message: "Incorrect flag." });
  }

  if (challenge.flagType === FlagType.Location) {
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

  if (solvedChallenge.isBlood) {
    await sendWebhook(solvedChallenge);
  }

  if (req.user!.team) {
    // If the user is apart of a team, we need to send SSE event which ensures that
    // they have the up to date versions of challenges / team info
    // We explicitly ignore the request user, as the frontend will handle retrieivng
    // the new challenges

    const team = await Team.findOne({ where: { id: req.user!.team.id } });

    if (team) {
      sendEvent(
        "fetch",
        ["team", "challenges"],
        team.members.filter((member) => member.id !== req.user!.id).map((member) => member.id)
      );
    }
  }

  logEvent(EventType.UserSolvedChallenge, { "user:userId": req.user!.id, "challenge:challengeId": challenge.id });

  return res.status(200).json({ isBlood: solvedChallenge.isBlood });
});

router.use("/:challengeId/file", async (req, res) => {
  const config = Configuration.get();

  if (!config.canViewChallenges()) return res.sendStatus(404);

  const challenge = await Challenge.findOne({ relations: ["unlockRequirement"], where: { id: req.params.challengeId } });

  if (!challenge || !challenge?.fileName) return res.sendStatus(404);

  // Check whether the user can access this challenge
  if (challenge.unlockRequirement && !(await req.user!.hasSolvedChallenge(challenge.unlockRequirement))) {
    return res.sendStatus(404);
  }

  return res.download(path.join(uploadDirectory, challenge.fileName), challenge.fileName);
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
