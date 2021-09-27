import { Config } from "../entity/Config";

export class Configuration {
  private static _instance: Config;

  private constructor() {}

  public static get() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance;
  }

  public static async update() {
    const fetched = await Config.findOne();
    if (fetched) this._instance = fetched;
  }
}
