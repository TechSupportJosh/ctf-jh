import { UserChallengeCompletion } from "./Challenge";

export interface User {
  id: number;
  warwickId: number;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  completedChallenges: UserChallengeCompletion[];
}
