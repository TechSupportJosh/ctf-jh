import express from "express";
import rateLimit from "express-rate-limit";
import { TeamDTO, TeamJoinDTO } from "../dto/Team";
import { Team } from "../entity/Team";
import { User } from "../entity/User";
import { validator } from "../middlewares/validator";
import { getConfig } from "../utils/config";

const router = express.Router();

router.get("/", async (req, res) => {
  const teams = await Team.createQueryBuilder("team")
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("team.teamLeader", "teamLeader")
    .leftJoinAndSelect("members.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .getMany();

  return res.json(teams);
});

router.get("/:teamId", async (req, res) => {
  const team = await Team.createQueryBuilder("team")
    .where("team.id = :teamId", { teamId: req.params.teamId })
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("team.teamLeader", "teamLeader")
    .leftJoinAndSelect("team.stats", "stats")
    .leftJoinAndSelect("members.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .getOne();

  if (!team) return res.sendStatus(404);

  return res.json(team);
});

router.get("/:teamId/invite-code", async (req, res) => {
  const team = await Team.findOne({ where: { id: req.params.teamId }, select: ["id", "inviteCode"], relations: ["teamLeader"] });

  if (!team) return res.status(404).send({ message: "This team does not exist." });
  if (team.teamLeader.id !== req.user!.id) return res.status(401).send({ message: "You are not authorised to do this." });

  return res.json({
    inviteCode: team.inviteCode,
  });
});

router.post("/:teamId/invite-code", async (req, res) => {
  const team = await Team.findOne({ where: { id: req.params.teamId } });

  if (!team) return res.status(404).send({ message: "This team does not exist." });
  if (team.teamLeader.id !== req.user!.id) return res.status(401).send({ message: "You are not authorised to do this." });

  team.createInviteCode();
  await team.save();

  return res.json({
    inviteCode: team.inviteCode,
  });
});

router.delete("/:teamId", async (req, res) => {
  const team = await Team.findOne({ where: { id: req.params.teamId } });

  if (!team) return res.status(404).send({ message: "This team does not exist." });
  if (team.teamLeader.id !== req.user!.id) return res.status(401).send({ message: "You are not authorised to do this." });

  const memberUpdate = team.members.map((member) => {
    member.team = null;
    return member.save();
  });

  await Promise.all(memberUpdate);
  await team.remove();

  return res.json({
    message: "Team was successfully disbanded.",
  });
});

router.post("/:teamId/kick/:userId", async (req, res) => {
  const team = await Team.findOne({ where: { id: req.params.teamId } });

  if (!team) return res.status(404).send({ message: "This team does not exist." });
  if (team.teamLeader.id !== req.user!.id) return res.status(401).send({ message: "You are not authorised to do this." });

  const user = await User.findOne({ where: { id: req.params.userId }, relations: ["team"] });

  if (!user) return res.status(404).send({ message: "This user does not exist." });
  if (user.id === req.user!.id) return res.status(400).send({ message: "You cannot kick yourself from the team." });
  if (user.team?.id !== team.id) return res.status(400).send({ message: "This user is not in your team." });

  user.team = null;
  await user.save();

  return res.json({
    message: "User successfully kicked from the team.",
  });
});

router.post("/", validator(TeamDTO), async (req, res) => {
  const dto = res.locals.dto as TeamDTO;

  if (req.user!.team) return res.status(400).json({ message: "You are already in a team." });

  // Unique checks
  const searchTeam = await Team.findOne({ where: { name: dto.name } });

  if (searchTeam) return res.status(400).json({ message: "A team already exists with this name!" });

  const team = new Team();
  team.name = dto.name;
  team.teamLeader = req.user!;
  team.createInviteCode();

  await team.save();

  req.user!.team = team;
  await req.user!.save();

  return res.status(200).json({ message: "Team created." });
});

const joinLimiter = rateLimit({
  max: 5,
  windowMs: 5 * 60 * 1000,
  keyGenerator: (req, res) => {
    return req.user!.id.toString();
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(400).json({ message: "You're doing this too often, please try again in 5 minutes." });
  },
});

router.post("/join", validator(TeamJoinDTO), joinLimiter, async (req, res) => {
  const { inviteCode } = res.locals.dto as TeamJoinDTO;

  if (req.user!.team) return res.status(400).json({ message: "You are already in a team." });

  const team = await Team.createQueryBuilder("team")
    .addSelect("team.inviteCode")
    .leftJoinAndSelect("team.members", "members")
    .where({ inviteCode: inviteCode })
    .getOne();

  if (!team) return res.status(400).json({ message: "This invite code does not exist." });

  const config = await getConfig();

  if (team.members.length >= config.maxTeamSize) return res.status(400).json({ message: "This team is full." });

  req.user!.team = team;
  await req.user!.save();

  return res.json({ message: "You've joined the team." });
});

router.post("/leave", async (req, res) => {
  if (!req.user!.team) return res.status(400).json({ message: "You are not in a team." });

  if (req.user!.team.teamLeader.id == req.user!.id)
    return res.status(400).json({ message: "You cannot leave the team as the team leader." });

  req.user!.team = null;
  await req.user!.save();

  return res.json({ message: "You've left the team." });
});

export const teamsRouter = router;
