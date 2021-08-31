export interface ChallengeBase {
  id: number;
  title: string;
  author: string;
  points: number;
  category: string;
  difficulty: string;
  unlockRequirement?: number;
  solveCount?: number;
}

export interface LockedChallenge extends ChallengeBase {
  locked: true;
}

export interface UnlockedChallenge extends ChallengeBase {
  locked: false;
  description: string;
  hint: string;
  tags: string[];
  flagType: "string" | "location";
  educationResources: string[];
  url?: string;
  fileName?: string;
  fileHash?: string;
}

export interface UserChallengeSolve {
  userId: number;
  challengeId: number;
  solveDate: number;
  isBlood: boolean;
}

export interface AdminChallengeSolve extends UserChallengeSolve {
  userId: number;
}

export interface AdminChallenge extends UnlockedChallenge {
  flag: string;
  disabled: boolean;
  solves: AdminChallengeSolve[];
}

export type Challenge = UnlockedChallenge | LockedChallenge;
