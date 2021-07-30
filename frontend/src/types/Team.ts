import { SolveStats } from "./Stats";

export interface TeamMember {
  id: number;
  name: string;
  points?: number;
  bloods?: number;
  solves?: number;
}

export interface UserTeam {
  id: number;
  name: string;
}

export interface Team extends UserTeam {
  teamLeader: TeamMember;
  members: TeamMember[];
  stats?: SolveStats[];
}
