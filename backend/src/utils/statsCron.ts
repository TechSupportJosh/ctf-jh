import type { Connection } from "typeorm";
import { TeamStats, UserStats } from "../entity/Stats";
import { Team } from "../entity/Team";
import { User } from "../entity/User";

export let leaderboardLastUpdated = new Date();

export const updateStats = async (connection: Connection) => {
  console.log("Updating stats for all users / teams...");
  const currentDate = new Date();

  const teams = await Team.createQueryBuilder("team")
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("team.teamLeader", "teamLeader")
    .leftJoinAndSelect("members.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .leftJoinAndSelect("challenge.solves", "solves")
    .getMany();

  const users = await User.createQueryBuilder("user")
    .leftJoinAndSelect("user.solvedChallenges", "solvedChallenges")
    .leftJoinAndSelect("solvedChallenges.challenge", "challenge")
    .leftJoinAndSelect("challenge.solves", "solves")
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
      const stats = team.getSolveStats();
      entry.team = team;
      entry.date = currentDate;
      entry.points = stats.points;
      entry.bloods = stats.bloods;
      entry.solves = stats.solves;

      return entry.save();
    })
  );

  // Clear the database cache
  await connection.queryResultCache?.remove([
    "user_leaderboard_stats_id",
    "user_leaderboard_stats",
    "team_leaderboard_stats_id",
    "team_leaderboard_stats",
  ]);

  leaderboardLastUpdated = currentDate;

  const finishedDate = new Date();
  const timeTaken = (finishedDate.getTime() - currentDate.getTime()) / 1000;
  console.log(`Finished saving stats, took ${timeTaken} seconds`);
};
