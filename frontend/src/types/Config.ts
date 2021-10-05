export interface Config {
  maxTeamSize: number;
  locationFlagPrecision: number;
  startTime: string;
  endTime: string;
  maintenance: boolean;
  scoringType: "static" | "dynamic";
  dynamicScoreDecay: number;
  dynamicScoreMinPoints: number;
}
