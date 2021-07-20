import * as jf from "joiful";

export class FlagSubmissionDTO {
  @(jf.string().required())
  flag!: string;
}
