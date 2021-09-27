export interface Config {
  maxTeamSize: number;
  locationFlagPrecision: number;
  startTime: string;
  endTime: string;
  maintenance: boolean;
  scoringType: "static" | "dynamic";
  dynamicScoreReduction: number;
  dynamicScoreMinSolves: number;
  dynamicScoreMaxSolves: number;
}
