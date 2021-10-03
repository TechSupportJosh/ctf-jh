import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum EventType {
  AuthSuccess = "auth-success",
  ChallengeUpdated = "challenge-updated",
  ChallengeDeleted = "challenge-deleted",
  ChallengeSolvesDeleted = "challenge-solves-deleted",
  UserCreated = "user-created",
  UserDeleted = "user-deleted",
  UserSolvesDeleted = "user-solves-deleted",
  UserSolvedChallenge = "user-solved-challenge",
  UserDeletedSessions = "user-deleted-sessions",
  UserDeletedSession = "user-deleted-session",
  ConfigUpdated = "config-updated",
  TeamInviteGenerated = "team-invite-generated",
  TeamCreated = "team-created",
  TeamDisbanded = "team-disbanded",
  TeamMemberJoined = "team-member-join",
  TeamMemberKicked = "team-member-kicked",
  TeamMemberLeft = "team-member-left",
}

@Entity()
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  createdAt!: Date;

  @Column({
    type: "simple-enum",
    enum: EventType,
  })
  eventType!: EventType;

  @Column()
  data!: string;

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      eventType: this.eventType,
      data: JSON.parse(this.data),
    };
  }
}
