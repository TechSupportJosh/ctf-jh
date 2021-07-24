export interface RecentCompletion {
  user: string;
  challenge: {
    title: string;
    difficulty: string;
  };
  isBlood: boolean;
  completionDate: string;
}
