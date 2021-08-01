export interface AdminStats {
  userCount: number;
  totalSolves: number;
}

export interface Stats {
  points: number;
  bloods: number;
  solves: number;
}

export interface SolveStats extends Stats {
  id: number;
  date: string;
}

export interface UserLeaderboardStats {
  lastUpdated: string;
  leaderboard: {
    user: {
      id: number;
      name: string;
    };
    stats: Stats;
  }[];
}

export interface TeamLeaderboardStats {
  lastUpdated: string;
  leaderboard: {
    team: {
      id: number;
      name: string;
    };
    stats: Stats;
  }[];
}
