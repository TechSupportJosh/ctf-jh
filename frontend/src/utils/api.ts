import axios from "axios";
import { Challenge, AdminChallenge, LockedChallenge } from "../types/Challenge";
import { User } from "../types/User";
import config from "../config";
import { Stats } from "../types/Stats";
import { RecentCompletion } from "../types/RecentCompletion";

const client = axios.create({
  baseURL: config.basePath + "api",
  validateStatus: undefined,
  withCredentials: true,
});

const getUser = async () => {
  const response = await client.get<User>(`/me`);

  if (response.status === 200) return response.data;
};

const getChallenges = async () => {
  const response = await client.get<(Challenge | LockedChallenge)[]>(`/challenges`);

  if (response.status === 200) return response.data;
};

const submitFlag = async (challengeId: number, flag: string) => {
  const response = await client.post<{ isBlood: Boolean }>(`/challenges/${challengeId}/submit`, {
    flag: flag,
  });

  return {
    statusCode: response.status,
    isBlood: response.status === 200 && response.data.isBlood,
  };
};

const getRecentCompletions = async () => {
  const response = await client.get<RecentCompletion[]>(`/challenges/recent`);

  if (response.status === 200) return response.data;
};

const getAdminChallenges = async () => {
  const response = await client.get<AdminChallenge[]>(`/admin/challenges`);

  if (response.status === 200) return response.data;
};

const deleteChallenge = async (challengeId: number) => {
  const response = await client.delete(`/admin/challenges/${challengeId}`);

  return response.status === 200;
};

const deleteChallengeSubmissions = async (challengeId: number) => {
  const response = await client.delete(`/admin/challenges/${challengeId}/submissions`);

  return response.status === 200;
};

const getAdminStats = async () => {
  const response = await client.get<Stats>(`/admin/stats`);

  if (response.status === 200) return response.data;
};

const getAdminUsers = async () => {
  const response = await client.get<User[]>(`/admin/users`);

  if (response.status === 200) return response.data;
};

const deleteUser = async (userId: number) => {
  const response = await client.delete(`/admin/users/${userId}`);

  return response.status === 200;
};

const deleteUserSubmissions = async (userId: number) => {
  const response = await client.delete(`/admin/users/${userId}/submissions`);

  return response.status === 200;
};

export default {
  getUser,
  getChallenges,
  submitFlag,
  getRecentCompletions,
  getAdminChallenges,
  deleteChallenge,
  deleteChallengeSubmissions,
  getAdminStats,
  getAdminUsers,
  deleteUser,
  deleteUserSubmissions,
};
