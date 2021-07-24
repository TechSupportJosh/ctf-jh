export interface ChallengeBase {
  id: number;
  title: string;
  author: string;
  points: number;
  category: string;
  difficulty: string;
  unlockRequirement?: number;
  completionCount?: number;
}

export interface LockedChallenge extends ChallengeBase {
  locked: true;
}

export interface UnlockedChallenge extends ChallengeBase {
  locked: false;
  description: string;
  hint: string;
  tags: string[];
  educationResources: string[];
  url?: string;
  fileName?: string;
  fileHash?: string;
}

export interface UserChallengeCompletion {
  challengeId: number;
  completionDate: number;
  isBlood: boolean;
}

export interface AdminChallengeCompletion extends UserChallengeCompletion {
  userId: number;
}

export interface AdminChallenge extends UnlockedChallenge {
  flag: string;
  disabled: boolean;
  completions: AdminChallengeCompletion[];
}

export type Challenge = UnlockedChallenge | LockedChallenge;
