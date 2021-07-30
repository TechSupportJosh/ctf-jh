export interface RecentSolve {
  user: string;
  challenge: {
    title: string;
    difficulty: string;
  };
  isBlood: boolean;
  solveDate: string;
}
