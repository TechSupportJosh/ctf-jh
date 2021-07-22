import * as jf from "joiful";

export class UserDTO {
  @(jf.number().integer().optional())
  id?: number;

  @(jf.number().integer().required())
  warwickId!: number;

  @(jf.string().required())
  firstName!: string;

  @(jf.string().required())
  lastName!: string;

  @(jf.string().optional())
  isAdmin!: "on" | undefined;
}
