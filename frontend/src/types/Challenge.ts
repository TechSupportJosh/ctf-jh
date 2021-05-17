export interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
}

export interface AdminChallenge extends Challenge {
  flag: string;
}
