import axios from "axios";
import { Challenge, AdminChallenge } from "../types/Challenge";
import { User } from "../types/User";

const client = axios.create({
  baseURL: "/api",
  validateStatus: undefined,
  withCredentials: true,
});

const getUser = async () => {
  const response = await client.get<User>(`/me/`);

  if (response.status === 200) return response.data;
};

const getChallenges = async () => {
  const response = await client.get<Challenge[]>(`/challenges/`);

  if (response.status === 200) return response.data;
};

const submitFlag = async (challengeId: number, flag: string) => {
  const response = await client.post(`/challenges/submit`, {
    challenge_id: challengeId,
    flag: flag,
  });

  return response.status;
};

const getAdminChallenges = async () => {
  const response = await client.get<AdminChallenge[]>(`/admin/challenges`);

  if (response.status === 200) return response.data;
};

export default {
  getUser,
  getChallenges,
  submitFlag,
  getAdminChallenges,
};
