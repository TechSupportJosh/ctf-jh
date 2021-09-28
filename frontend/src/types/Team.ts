import { UserChallengeSolve } from "./Challenge";
import { AttemptStats, SolveStats, Stats } from "./Stats";

export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  stats: Stats;
  solveAttempts: AttemptStats;
  solvedChallenges: UserChallengeSolve[];
}

export interface UserTeam {
  id: number;
  name: string;
}

export interface Team extends UserTeam {
  teamLeader: TeamMember;
  members: TeamMember[];
  stats?: SolveStats[];
}
