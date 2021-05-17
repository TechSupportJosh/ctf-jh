import { CompletedChallenge } from "./Challenge";

export interface User {
  firstname: string;
  surname: string;
  is_admin: boolean;
  completed_challenges: CompletedChallenge[];
}
