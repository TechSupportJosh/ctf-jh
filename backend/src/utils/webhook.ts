import axios from "axios";
import { Challenge } from "../entity/Challenge";
import { User, UserCompletedChallenge } from "../entity/User";

const client = axios.create({
  validateStatus: undefined,
});

export const sendWebhook = async (user: User, challengeId: number) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  const challenge = await Challenge.findOne({ where: { id: challengeId } });
  if (!challenge) return;

  const completionCount = await UserCompletedChallenge.count({ where: { challengeId: challengeId } });

  client.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `${completionCount === 1 ? ":drop_of_blood:" : ""} ${user.firstName} ${user.lastName[0]} ${
      completionCount === 1 ? "blooded" : "solved"
    } **${challenge.title}**!`,
  });
};
