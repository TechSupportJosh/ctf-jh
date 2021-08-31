import { UserChallengeSolve } from "./Challenge";
import { AttemptStats } from "./Stats";
import { UserTeam } from "./Team";

export interface User {
  id: number;
  username?: string;
  warwickId?: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  solvedChallenges: UserChallengeSolve[];
  solveAttempts: AttemptStats;
  team?: UserTeam;
}
