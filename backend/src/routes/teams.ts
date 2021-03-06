import express from "express";
import rateLimit from "express-rate-limit";
import { TeamDTO, TeamJoinDTO } from "../dto/Team";
import { EventType } from "../entity/Log";
import { TeamStats } from "../entity/Stats";
import { Team } from "../entity/Team";
import { User } from "../entity/User";
import { validator } from "../middlewares/validator";
import { Configuration } from "../utils/config";
import { logEvent } from "../utils/log";

const router = express.Router();

router.get("/:teamId", async (req, res) => {
  const team = await Team.createQueryBuilder("team")
    .where("team.id = :teamId", { teamId: req.params.teamId })
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("team.teamLeader", "teamLeader")
    .leftJoinAndSelect("members.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("members.solveAttempts", "solveAttempts")
    .leftJoin("solvedChallenges.challenge", "challenge")
    .getOne();

  if (!team) return res.sendStatus(404);

  const stats = await TeamStats.createQueryBuilder("stats").where("stats.teamId = :teamId", { teamId: req.params.teamId }).getMany();

  return res.json({
    ...(await team.toJSON()),
    stats,
  });
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

  logEvent(EventType.TeamInviteGenerated, {
    "user:teamLeaderId": req.user!.id,
    "team:teamId": team.id,
    inviteCode: team.inviteCode,
  });

  return res.json({
    inviteCode: team.inviteCode,
  });
});

router.delete("/:teamId", async (req, res) => {
  const team = await Team.findOne({ where: { id: req.params.teamId } });

  if (!team) return res.status(404).send({ message: "This team does not exist." });
  if (team.teamLeader.id !== req.user!.id) return res.status(401).send({ message: "You are not authorised to do this." });

  const config = Configuration.get();
  if (config.hasStarted()) return res.status(400).json({ message: "You cannot disband a team after the CTF has started!" });

  const memberUpdate = team.members.map((member) => {
    member.team = null;
    return member.save();
  });

  await Promise.all(memberUpdate);
  await team.remove();

  logEvent(EventType.TeamDisbanded, {
    "user:teamLeaderId": req.user!.id,
    "team:teamId": team.id,
  });

  return res.json({
    message: "Team was successfully disbanded.",
  });
});

router.post("/:teamId/kick/:userId", async (req, res) => {
  const team = await Team.findOne({ where: { id: req.params.teamId } });

  if (!team) return res.status(404).send({ message: "This team does not exist." });
  if (team.teamLeader.id !== req.user!.id) return res.status(401).send({ message: "You are not authorised to do this." });

  const config = Configuration.get();
  if (config.hasStarted()) return res.status(400).json({ message: "You cannot kick a team member after the CTF has started!" });

  const user = await User.findOne({ where: { id: req.params.userId }, relations: ["team"] });

  if (!user) return res.status(404).send({ message: "This user does not exist." });
  if (user.id === req.user!.id) return res.status(400).send({ message: "You cannot kick yourself from the team." });
  if (user.team?.id !== team.id) return res.status(400).send({ message: "This user is not in your team." });

  user.team = null;
  await user.save();

  logEvent(EventType.TeamMemberKicked, {
    "user:teamLeaderId": req.user!.id,
    "team:teamId": team.id,
    "user:userId": user.id,
  });

  return res.json({
    message: "User successfully kicked from the team.",
  });
});

router.post("/", validator(TeamDTO), async (req, res) => {
  const dto = res.locals.dto as TeamDTO;

  const config = Configuration.get();
  if (config.hasStarted()) return res.status(400).json({ message: "You cannot create a team after the CTF has started!" });

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

  logEvent(EventType.TeamCreated, {
    "user:teamLeaderId": req.user!.id,
    "team:teamId": team.id,
  });

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

  const config = Configuration.get();
  if (config.hasStarted()) return res.status(400).json({ message: "You cannot join a team after the CTF has started!" });

  if (req.user!.team) return res.status(400).json({ message: "You are already in a team." });

  const team = await Team.createQueryBuilder("team")
    .addSelect("team.inviteCode")
    .leftJoinAndSelect("team.members", "members")
    .where({ inviteCode: inviteCode })
    .getOne();

  if (!team) return res.status(400).json({ message: "This invite code does not exist." });

  if (team.members.length >= config.maxTeamSize) return res.status(400).json({ message: "This team is full." });

  req.user!.team = team;
  await req.user!.save();

  logEvent(EventType.TeamMemberJoined, {
    "user:userId": req.user!.id,
    "team:teamId": team.id,
    inviteCode: team.inviteCode,
  });

  return res.json({ message: "You've joined the team." });
});

router.post("/leave", async (req, res) => {
  if (!req.user!.team) return res.status(400).json({ message: "You are not in a team." });

  const config = Configuration.get();
  if (config.hasStarted()) return res.status(400).json({ message: "You cannot leave a team after the CTF has started!" });

  if (req.user!.team.teamLeader.id == req.user!.id)
    return res.status(400).json({ message: "You cannot leave the team as the team leader." });

  const teamId = req.user!.team.id;

  req.user!.team = null;
  await req.user!.save();

  logEvent(EventType.TeamMemberLeft, {
    "user:userId": req.user!.id,
    "team:teamId": teamId,
  });

  return res.json({ message: "You've left the team." });
});

export const teamsRouter = router;
