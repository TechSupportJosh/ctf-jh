import * as jf from "joiful";

export class LoginDTO {
  @(jf.string().min(1).max(64))
  username!: string;

  @(jf.string().min(8).max(256))
  password!: string;
}
