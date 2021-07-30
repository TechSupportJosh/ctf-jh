import axios from "axios";
import { Challenge } from "../entity/Challenge";
import { User, UserSolvedChallenge } from "../entity/User";

const client = axios.create({
  validateStatus: undefined,
});

export const sendWebhook = async (user: User, challengeId: number) => {
  if (!process.env.DISCORD_WEBHOOK_URL) return;

  const challenge = await Challenge.findOne({ where: { id: challengeId } });
  if (!challenge) return;

  const solveCount = await UserSolvedChallenge.count({ where: { challengeId: challengeId } });

  client.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `${solveCount === 1 ? ":drop_of_blood:" : ""} ${user.firstName} ${user.lastName[0]} ${
      solveCount === 1 ? "blooded" : "solved"
    } **${challenge.title}**!`,
  });
};
