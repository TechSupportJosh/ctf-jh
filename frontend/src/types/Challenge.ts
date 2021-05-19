export interface BaseChallenge {
  id: number;
  title: string;
  author: string;
  points: number;
  tags: string[];
  category: string;
  difficulty: string;
  unlock_requirement: number;
}

export interface LockedChallenge extends BaseChallenge {
  locked: true;
}

export interface Challenge extends BaseChallenge {
  locked: false;
  description: string;
  education_links: string[];
  hint: string;
  challenge_url?: string;
  file_name?: string;
  file_hash?: string;
}

export interface CompletedChallenge {
  challenge_id: number;
  time_completed: number;
}

export interface AdminCompletedChallenge extends CompletedChallenge {
  user_id: number;
}

export interface AdminChallenge extends Challenge {
  flag: string;
  disabled: boolean;
  completions: AdminCompletedChallenge[];
}
