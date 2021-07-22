import * as jf from "joiful";

export class UserDTO {
  @(jf.number().integer().optional())
  id?: number;

  @(jf.number().integer().empty("").optional())
  warwickId?: number;

  @(jf.string().empty("").optional().min(1).max(64))
  username?: string;

  @(jf.string().empty("").optional().min(8).max(256))
  password?: string;

  @(jf.string().required())
  firstName!: string;

  @(jf.string().required())
  lastName!: string;

  @(jf.string().optional())
  isAdmin!: "on" | undefined;
}
