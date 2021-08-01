import express from "express";
import { TeamStats, UserStats } from "../entity/Stats";
import { leaderboardLastUpdated } from "../utils/statsCron";

const router = express.Router();

const cacheMs = 60 * 60 * 1000;

router.get("/users", async (req, res) => {
  const ids = await UserStats.createQueryBuilder("stats")
    .select("MAX(id)", "id")
    .groupBy("stats.user")
    .cache("user_leaderboard_stats_id", cacheMs)
    .getRawMany();

  const userStats = await UserStats.createQueryBuilder("stats")
    .leftJoinAndSelect("stats.user", "user")
    .cache("user_leaderboard_stats", cacheMs)
    .orderBy("stats.points", "DESC")
    .whereInIds(ids)
    .getMany();

  res.json({
    lastUpdated: leaderboardLastUpdated,
    leaderboard: userStats.map((stat) => stat.toLeaderboardJSON()),
  });
});

router.get("/teams", async (req, res) => {
  const ids = await TeamStats.createQueryBuilder("stats")
    .select("MAX(id)", "id")
    .groupBy("stats.team")
    .cache("team_leaderboard_stats_id", cacheMs)
    .getRawMany();

  const teamStats = await TeamStats.createQueryBuilder("stats")
    .leftJoinAndSelect("stats.team", "team")
    .cache("team_leaderboard_stats", cacheMs)
    .orderBy("stats.points", "DESC")
    .whereInIds(ids)
    .getMany();

  res.json({
    lastUpdated: leaderboardLastUpdated,
    leaderboard: teamStats.map((stat) => stat.toLeaderboardJSON()),
  });
});

export const leaderboardRouter = router;
