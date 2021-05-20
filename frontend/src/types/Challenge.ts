export interface ChallengeBase {
  id: number;
  title: string;
  author: string;
  points: number;
  category: string;
  difficulty: string;
  unlock_requirement: number;
}

export interface LockedChallenge extends ChallengeBase {
  locked: true;
}

export interface UnlockedChallenge extends ChallengeBase {
  locked: false;
  description: string;
  hint: string;
  tags: string[];
  education_resources: string[];
  url?: string;
  file_name?: string;
  file_hash?: string;
}

export interface UserChallengeCompletion {
  challenge_id: number;
  time_completed: number;
}

export interface AdminChallengeCompletion extends UserChallengeCompletion {
  user_id: number;
}

export interface AdminChallenge extends UnlockedChallenge {
  flag: string;
  disabled: boolean;
  completions: AdminChallengeCompletion[];
}

export type Challenge = UnlockedChallenge | LockedChallenge;
