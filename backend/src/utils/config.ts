import { Config } from "../entity/Config";

let _config: Config | null = null;

export const updateConfig = async () => {
  const fetched = await Config.findOne();
  if (fetched) _config = fetched;
};

export const getConfig = async () => {
  if (_config) return _config;

  // Now check the database in case one does exist
  await updateConfig();

  if (_config) return _config;

  // If no config exists, create one
  _config = new Config();
  _config.startTime = new Date();
  _config.endTime = new Date();
  await _config.save();

  return _config;
};
