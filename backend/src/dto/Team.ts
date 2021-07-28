import * as jf from "joiful";

export class TeamDTO {
  @(jf.string().min(3).max(32).trim().required())
  name!: string;
}

export class TeamJoinDTO {
  @(jf.string().required())
  inviteCode!: string;
}
