import { Config } from "../entity/Config";

export const getConfig = async () => {
  // TODO: Add cache
  let config = await Config.createQueryBuilder("config")
    //.cache("config_cache", 3600 * 1000)
    .getOne();

  if (config) return config;

  // If no config exists, create one
  config = new Config();
  await config.save();

  return config;
};
