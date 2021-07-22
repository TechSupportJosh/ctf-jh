import { UserChallengeCompletion } from "./Challenge";

export interface User {
  id: number;
  username?: string;
  warwickId?: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  completedChallenges: UserChallengeCompletion[];
}
