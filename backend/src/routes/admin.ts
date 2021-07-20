import express from "express";
import md5File from "md5-file";
import multer, { Multer } from "multer";
import { ChallengeDTO } from "../dto/Challenge";
import { Challenge, ChallengeTag, EducationResource } from "../entity/Challenge";
import { User, UserCompletedChallenge } from "../entity/User";
import { validator } from "../middlewares/validator";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
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
  const totalCompletions = await UserCompletedChallenge.count();

  res.json({
    userCount,
    totalCompletions,
  });
});

router.get("/challenges", async (req, res) => {
  const challenges = await Challenge.find({ relations: ["unlockRequirement", "completions"] });

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

  if (req.files?.length) {
    const file = (req.files as Express.Multer.File[])[0];
    challenge.fileName = file.filename;
    challenge.fileHash = await md5File(file.path);
  }

  await challenge.save();

  // Delete previous tags & education resources
  await Promise.all(challenge.tags.map((tag) => tag.remove()));
  await Promise.all(challenge.educationResources.map((resource) => resource.remove()));

  // Then create all of tags and resources
  await Promise.all(
    dto.tags.split(",").map((tagValue) => {
      const tag = new ChallengeTag();
      tag.challenge = challenge!;
      tag.tag = tagValue.trim();
      return tag.save();
    })
  );

  await Promise.all(
    dto.educationResources.split(",").map((resourceValue) => {
      const resource = new EducationResource();
      resource.challenge = challenge!;
      resource.resource = resourceValue.trim();
      return resource.save();
    })
  );

  res.redirect(303, "/admin");
});

export const adminRouter = router;
