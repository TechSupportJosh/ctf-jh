import { UserChallengeCompletion } from "./Challenge";
import { UserTeam } from "./Team";

export interface User {
  id: number;
  username?: string;
  warwickId?: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  completedChallenges: UserChallengeCompletion[];
  team?: UserTeam;
}
