export interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  tags: string[];
  category: string;
  difficulty: string;
  challenge_url?: string;
  file_name?: string;
  file_hash?: string;
}

export interface AdminChallenge extends Challenge {
  flag: string;
}

export interface CompletedChallenge {
  challenge_id: number;
  time_completed: number;
}
