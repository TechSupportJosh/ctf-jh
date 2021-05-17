import axios from "axios";
import { Challenge, AdminChallenge } from "../types/Challenge";

const client = axios.create({
  baseURL: "/api",
  validateStatus: undefined,
  withCredentials: true,
});

const getChallenges = async () => {
  const response = await client.get<Challenge[]>(`/challenges`);

  return response.data;
};

export default {
  getChallenges,
};
