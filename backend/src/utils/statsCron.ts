import { TeamStats, UserStats } from "../entity/Stats";
import { Team } from "../entity/Team";
import { User } from "../entity/User";

export const updateStats = async () => {
  console.log("Updating stats for all users / teams...");
  const currentDate = new Date();

  const teams = await Team.createQueryBuilder("team")
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("team.teamLeader", "teamLeader")
    .leftJoinAndSelect("members.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .getMany();

  const users = await User.createQueryBuilder("user")
    .leftJoinAndSelect("user.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .getMany();

  await Promise.all(
    users.map((user) => {
      const entry = new UserStats();
      const stats = user.getSolveStats();
      entry.user = user;
      entry.date = currentDate;
      entry.points = stats.points;
      entry.bloods = stats.bloods;
      entry.solves = stats.solves;

      return entry.save();
    })
  );

  await Promise.all(
    teams.map((team) => {
      const entry = new TeamStats();
      entry.team = team;
      entry.date = currentDate;
      entry.points = 0;
      entry.bloods = 0;
      entry.solves = 0;

      team.members.forEach((member) => {
        const stats = member.getSolveStats();
        entry.points += stats.points;
        entry.bloods += stats.bloods;
        entry.solves += stats.solves;
      });

      return entry.save();
    })
  );

  const finishedDate = new Date();
  const timeTaken = (finishedDate.getTime() - currentDate.getTime()) / 1000;
  console.log(`Finished saving stats, took ${timeTaken} seconds`);
};
