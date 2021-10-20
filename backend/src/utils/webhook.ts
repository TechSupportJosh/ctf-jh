import axios from "axios";
import { Challenge } from "../entity/Challenge";
import { User, UserSolvedChallenge } from "../entity/User";

const client = axios.create({
  validateStatus: undefined,
});

export const sendWebhook = async (solvedChallenge: UserSolvedChallenge) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  client.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `:drop_of_blood: ${solvedChallenge.user.firstName} ${solvedChallenge.user.lastName[0]} blooded **${solvedChallenge.challenge.title}**!`,
  });
};
