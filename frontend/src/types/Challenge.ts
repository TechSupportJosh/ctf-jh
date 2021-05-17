export interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  tags: string[];
  category: string;
}

export interface AdminChallenge extends Challenge {
  flag: string;
}

export interface CompletedChallenge {
  challenge_id: number;
  time_completed: number;
}
