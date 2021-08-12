import axios from "axios";
import { Challenge, AdminChallenge, LockedChallenge } from "../types/Challenge";
import { User } from "../types/User";
import { basePath } from "shared";
import { AdminStats, SolveStats, Stats, TeamLeaderboardStats, UserLeaderboardStats } from "../types/Stats";
import { RecentSolve } from "../types/RecentSolve";
import { Team } from "../types/Team";

const client = axios.create({
  baseURL: basePath + "api",
  validateStatus: undefined,
  withCredentials: true,
});

const getUser = async () => {
  const response = await client.get<User>(`/me`);

  if (response.status === 200) return response.data;
};

const getStats = async () => {
  const response = await client.get<SolveStats[]>(`/me/stats`);

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

const getRecentSolves = async () => {
  const response = await client.get<RecentSolve[]>(`/challenges/recent`);

  if (response.status === 200) return response.data;
};

const joinTeam = async (inviteCode: string) => {
  const response = await client.post<{ message: string }>(`/teams/join`, {
    inviteCode: inviteCode,
  });

  return {
    statusCode: response.status,
    message: response.data.message,
  };
};

const createTeam = async (name: string) => {
  const response = await client.post<{ message: string }>(`/teams`, {
    name: name,
  });

  return {
    statusCode: response.status,
    message: response.data.message,
  };
};

const leaveTeam = async () => {
  const response = await client.post<{ message: string }>(`/teams/leave`);

  return {
    statusCode: response.status,
    message: response.data.message,
  };
};

const deleteTeam = async (teamId: number) => {
  const response = await client.delete<{ message: string }>(`/teams/${teamId}`);

  return {
    statusCode: response.status,
    message: response.data.message,
  };
};

const getTeams = async () => {
  const response = await client.get<Team[]>(`/teams`);

  if (response.status === 200) return response.data;
};

const getTeam = async (teamId: number) => {
  const response = await client.get<Team>(`/teams/${teamId}`);

  if (response.status === 200) return response.data;
};

const getInviteCode = async (teamId: number) => {
  const response = await client.get<{ inviteCode: string }>(`/teams/${teamId}/invite-code`);

  if (response.status === 200) return response.data.inviteCode;
};

const createInviteCode = async (teamId: number) => {
  const response = await client.post<{ inviteCode: string }>(`/teams/${teamId}/invite-code`);

  if (response.status === 200) return response.data.inviteCode;
};

const kickTeamMember = async (teamId: number, userId: number) => {
  const response = await client.post<{ message: string }>(`/teams/${teamId}/kick/${userId}`);

  return {
    statusCode: response.status,
    message: response.data.message,
  };
};

const getUserLeaderboard = async () => {
  const response = await client.get<UserLeaderboardStats>(`/leaderboard/users`);

  if (response.status === 200) return response.data;
};

const getTeamLeaderboard = async () => {
  const response = await client.get<TeamLeaderboardStats>(`/leaderboard/teams`);

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

const deleteChallengeSolves = async (challengeId: number) => {
  const response = await client.delete(`/admin/challenges/${challengeId}/solves`);

  return response.status === 200;
};

const getAdminStats = async () => {
  const response = await client.get<AdminStats>(`/admin/stats`);

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
  getStats,
  submitFlag,
  getRecentSolves,
  joinTeam,
  createTeam,
  leaveTeam,
  deleteTeam,
  getTeams,
  getTeam,
  getInviteCode,
  createInviteCode,
  kickTeamMember,
  getUserLeaderboard,
  getTeamLeaderboard,
  getAdminChallenges,
  deleteChallenge,
  deleteChallengeSolves,
  getAdminStats,
  getAdminUsers,
  deleteUser,
  deleteUserSubmissions,
};
