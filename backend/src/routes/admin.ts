import express from "express";
import md5File from "md5-file";
import multer from "multer";
import { ChallengeDTO } from "../dto/Challenge";
import { Challenge, ChallengeTag, EducationResource } from "../entity/Challenge";
import { User, UserSolvedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import path from "path";
import { UserDTO } from "../dto/User";
import { Not } from "typeorm";
import { hashPassword } from "../utils/password";
import { uploadDirectory } from "../constants";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, "IntakeCTF_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

router.get("/stats", async (req, res) => {
  const userCount = await User.count();
  const totalSolves = await UserSolvedChallenge.count();

  res.json({
    userCount,
    totalSolves,
  });
});

router.get("/challenges", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement", "solves"] });

  res.json(challenges.map((challenge) => challenge.toJSON()));
});

router.post("/challenges", upload.array("file", 1), validator(ChallengeDTO), async (req, res) => {
  const dto = res.locals.dto as ChallengeDTO;

  let challenge = await Challenge.findOne({ where: { id: dto.id } });
  if (!challenge) challenge = new Challenge();

  challenge.disabled = dto.disabled === "on" || false;
  challenge.title = dto.title;
  challenge.description = dto.description;
  challenge.author = dto.author;
  challenge.category = dto.category;
  challenge.points = dto.points;
  challenge.flag = dto.flag;
  challenge.difficulty = dto.difficulty;
  challenge.hint = dto.hint;
  challenge.url = dto.url;

  if (dto.unlockRequirement === -1) {
    challenge.unlockRequirement = undefined;
  } else {
    const unlockChallenge = await Challenge.findOne({ where: { id: dto.unlockRequirement } });
    if (!unlockChallenge) return res.status(400).send("Invalid unlock requirement");

    challenge.unlockRequirement = unlockChallenge;
  }

  if (req.files?.length) {
    const file = (req.files as Express.Multer.File[])[0];
    challenge.fileName = file.filename;
    challenge.fileHash = await md5File(file.path);
  }

  await challenge.save();

  // Delete previous tags & education resources
  await Promise.all((challenge.tags ?? []).map((tag) => tag.remove()));
  await Promise.all((challenge.educationResources ?? []).map((resource) => resource.remove()));

  if (dto.tags !== "")
    // Then create all of tags and resources
    await Promise.all(
      dto.tags.split(",").map((tagValue) => {
        const tag = new ChallengeTag();
        tag.challenge = challenge!;
        tag.tag = tagValue.trim();
        return tag.save();
      })
    );

  if (dto.educationResources !== "")
    await Promise.all(
      dto.educationResources.split(",").map((resourceValue) => {
        const resource = new EducationResource();
        resource.challenge = challenge!;
        resource.resource = resourceValue.trim();
        return resource.save();
      })
    );

  res.redirect(303, "/admin?success=challenge-updated");
});

router.delete("/challenges/:challengeId", async (req, res) => {
  const challenge = await Challenge.findOne({ relations: ["solves"], where: { id: req.params.challengeId } });
  if (!challenge) return res.status(404);

  await Promise.all(challenge.solves.map((solve) => solve.remove()));

  await challenge.remove();

  return res.sendStatus(200);
});

router.delete("/challenges/:challengeId/solves", async (req, res) => {
  const challenge = await Challenge.findOne({ relations: ["solves"], where: { id: req.params.challengeId } });
  if (!challenge) return res.status(404);

  await Promise.all(challenge.solves.map((solve) => solve.remove()));

  return res.sendStatus(200);
});

router.get("/users", async (req, res) => {
  const users = await User.find();

  res.json(users);
});

router.post("/users", validator(UserDTO), async (req, res) => {
  const dto = res.locals.dto as UserDTO;

  let user = await User.createQueryBuilder("user").addSelect("user.password").where({ id: dto.id }).getOne();
  if (!user) user = new User();

  if (dto.username !== undefined) {
    // Ensure that a user with a username cannot be created without a password
    if (user.password === undefined && dto.password === undefined) return res.redirect("/admin?error=no-password");

    // Ensure this username does not already exist
    const userSearch = await User.count({ where: { username: dto.username, id: Not(dto.id) } });
    if (userSearch > 0) return res.redirect("/admin?error=username-exists");

    // If we've specified a username, only re-hash the password if it's specified
    if (dto.password !== undefined) {
      const passwordHash = await hashPassword(dto.password);
      if (passwordHash === null) return res.redirect("/admin?error=hash-error");
      user.password = passwordHash;
    }
  } else {
    // If no username is specified, remove the password
    user.password = undefined;
  }

  user.username = dto.username;
  user.warwickId = dto.warwickId;
  user.firstName = dto.firstName;
  user.lastName = dto.lastName;
  user.isAdmin = dto.isAdmin === "on" || false;

  await user.save();

  res.redirect(303, "/admin?success=user-updated");
});

router.delete("/users/:userId", async (req, res) => {
  const user = await User.findOne({ relations: ["solvedChallenges"], where: { id: req.params.userId } });
  if (!user) return res.status(404);

  await Promise.all(user.solvedChallenges.map((solve) => solve.remove()));

  await user.remove();

  return res.sendStatus(200);
});

router.delete("/users/:userId/submissions", async (req, res) => {
  const user = await User.findOne({ relations: ["solvedChallenges"], where: { id: req.params.userId } });
  if (!user) return res.status(404);

  await Promise.all(user.solvedChallenges.map((solve) => solve.remove()));

  return res.sendStatus(200);
});

export const adminRouter = router;
