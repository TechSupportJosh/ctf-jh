export interface RecentSolve {
  user: string;
  team: string;
  challenge: {
    title: string;
    difficulty: string;
  };
  isBlood: boolean;
  solveDate: string;
}
