import { EventType, Log } from "../entity/Log";

interface Events {
  [EventType.AuthSuccess]: AuthSuccess;
  [EventType.ChallengeUpdated]: ChallengeUpdated;
  [EventType.ChallengeDeleted]: ChallengeDeleted;
  [EventType.ChallengeSolvesDeleted]: ChallengeSolvesDeleted;
  [EventType.UserCreated]: UserCreated;
  [EventType.UserDeleted]: UserDeleted;
  [EventType.UserSolvesDeleted]: UserSolvesDeleted;
  [EventType.UserSolvedChallenge]: UserSolvedChallenge;
  [EventType.UserDeletedSessions]: UserDeletedSessions;
  [EventType.UserDeletedSession]: UserDeletedSession;
  [EventType.ConfigUpdated]: ConfigUpdated;
  [EventType.TeamInviteGenerated]: TeamInviteGenerated;
  [EventType.TeamCreated]: TeamCreated;
  [EventType.TeamDisbanded]: TeamDisbanded;
  [EventType.TeamMemberJoined]: TeamMemberJoined;
  [EventType.TeamMemberKicked]: TeamMemberKicked;
  [EventType.TeamMemberLeft]: TeamMemberLeft;
}

interface AuthSuccess {
  "user:userId": number;
  userAgent: string;
  ipAddress: string;
}
interface ChallengeUpdated {
  "user:adminId": number;
  "challenge:challengeId": number;
}
interface ChallengeDeleted {
  "user:adminId": number;
  "challenge:challengeId": number;
  challengeTitle: string;
}
interface ChallengeSolvesDeleted {
  "user:adminId": number;
  "challenge:challengeId": number;
}
interface UserCreated {
  "user:adminId": number;
  "user:userId": number;
}
interface UserDeleted {
  "user:adminId": number;
  "user:userId": number;
}
interface UserSolvesDeleted {
  "user:adminId": number;
  "user:userId": number;
}
interface UserSolvedChallenge {
  "user:userId": number;
  "challenge:challengeId": number;
}
interface UserDeletedSessions {
  "user:userId": number;
}
interface UserDeletedSession {
  "user:userId": number;
}
interface ConfigUpdated {
  "user:adminId": number;
}
interface TeamInviteGenerated {
  "user:teamLeaderId": number;
  "team:teamId": number;
  inviteCode: string;
}
interface TeamCreated {
  "user:teamLeaderId": number;
  "team:teamId": number;
}
interface TeamDisbanded {
  "user:teamLeaderId": number;
  "team:teamId": number;
}
interface TeamMemberJoined {
  "user:userId": number;
  "team:teamId": number;
  inviteCode: string;
}
interface TeamMemberKicked {
  "user:teamLeaderId": number;
  "team:teamId": number;
  "user:userId": number;
}
interface TeamMemberLeft {
  "user:userId": number;
  "team:teamId": number;
}
export const logEvent = async <T extends keyof Events>(type: T, data: Events[T]) => {
  const entry = Log.create({
    eventType: type,
    createdAt: new Date(),
    data: JSON.stringify(data),
  });
  await entry.save();
};
