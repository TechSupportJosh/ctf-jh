import * as jf from "joiful";

export class ConfigDTO {
  @(jf.number().integer().min(1))
  maxTeamSize!: number;

  @(jf.number().integer().min(1))
  locationFlagPrecision!: number;

  @jf.boolean()
  maintenance!: boolean;

  @jf.date()
  startTime!: Date;

  @jf.date()
  endTime!: Date;
}
