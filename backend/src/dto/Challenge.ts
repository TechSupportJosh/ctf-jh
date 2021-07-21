import * as jf from "joiful";

export class ChallengeDTO {
  @(jf.number().integer().optional())
  id?: number;

  @(jf.string().optional())
  disabled!: "on" | undefined;

  @(jf.string().required())
  title!: string;

  @(jf.string().required())
  description!: string;

  @(jf.string().required())
  author!: string;

  @(jf.string().required())
  category!: string;

  @(jf.number().integer().required())
  points!: number;

  @(jf.string().required())
  flag!: string;

  @(jf.string().allow("").required())
  tags!: string;

  @(jf.string().required())
  difficulty!: string;

  @(jf.string().allow("").required())
  educationResources!: string;

  @(jf.number().integer().empty("").optional().default(-1))
  unlockRequirement?: number;

  @(jf.string().required())
  hint!: string;

  @(jf.string().allow("").optional())
  url?: string;
}
