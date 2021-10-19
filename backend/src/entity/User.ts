import { randomBytes } from "crypto";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Challenge } from "./Challenge";
import { UserStats } from "./Stats";
import { Team } from "./Team";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  warwickId?: number;

  @Column({ nullable: true, unique: true })
  username?: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  isAdmin!: boolean;

  @OneToMany(() => UserAuth, (authValue) => authValue.user)
  authValues!: UserAuth[];

  @OneToMany(() => UserSolvedChallenge, (solvedChallenge) => solvedChallenge.user)
  solvedChallenges!: UserSolvedChallenge[];

  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  team!: Team | null;

  @OneToMany(() => UserStats, (userStats) => userStats.user)
  stats!: UserStats[];

  @OneToMany(() => UserSolveAttempt, (solveAttempt) => solveAttempt.user)
  solveAttempts!: UserSolveAttempt[];

  async hasSolvedChallenge(challenge: Challenge) {
    const ids = [this.id];

    if (this.team) {
      // Gather user IDs of all team members
      ids.push(
        ...(await User.createQueryBuilder("user").where("user.teamId = :teamId", { teamId: this.team.id }).getMany()).map((user) => user.id)
      );
    }

    return (
      (await UserSolvedChallenge.createQueryBuilder("userSolvedChallenge")
        .where("userSolvedChallenge.challengeId = :challengeId AND userSolvedChallenge.userId IN (:...userIds)", {
          challengeId: challenge.id,
          userIds: ids,
        })
        //.andWhere("", { userId: ids })
        .getOne()) !== undefined
    );
  }

  toPublicJSON(withStats: boolean) {
    let json: Record<string, any> = {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName[0],
    };

    if (withStats && this.solvedChallenges)
      json = {
        ...json,
        solvedChallenges: this.solvedChallenges.map((challenge) => ({ ...challenge, challenge: undefined })),
        stats: this.getSolveStats(),
        solveAttempts: this.getAttemptStats(),
      };

    return json;
  }

  getSolveStats() {
    const stats = {
      points: 0,
      solves: 0,
      bloods: 0,
    };

    this.solvedChallenges.forEach((solvedChallenge) => {
      stats.points += solvedChallenge.challenge?.getEffectivePoints() ?? 0;
      stats.bloods += solvedChallenge.isBlood ? 1 : 0;
      stats.solves += 1;
    });

    return stats;
  }

  async getAttemptStats() {
    return {
      correct: await UserSolveAttempt.count({ where: { userId: this.id, correct: true } }),
      incorrect: await UserSolveAttempt.count({ where: { userId: this.id, correct: false } }),
    };
  }
}

@Entity()
export class UserSolvedChallenge extends BaseEntity {
  @PrimaryGeneratedColumn()
  solvedChallengeId!: number;

  @Column()
  userId!: number;

  @Column()
  challengeId!: number;

  @Column()
  solveDate!: Date;

  @Column()
  isBlood!: boolean;

  @ManyToOne(() => User, (user) => user.solvedChallenges)
  public user!: User;

  @ManyToOne(() => Challenge)
  public challenge!: Challenge;

  toSimpleJSON = () => {
    return {
      user: `${this.user.firstName} ${this.user.lastName[0]}`,
      challenge: {
        title: this.challenge.title,
        difficulty: this.challenge.difficulty,
      },
      isBlood: this.isBlood,
      solveDate: this.solveDate,
    };
  };
}

@Entity()
export class UserSolveAttempt extends BaseEntity {
  @PrimaryGeneratedColumn()
  solveAttemptId!: number;

  @Column()
  userId!: number;

  @Column()
  challengeId!: number;

  @Column()
  correct!: boolean;

  @ManyToOne(() => User, (user) => user.solvedChallenges)
  public user!: User;

  @ManyToOne(() => Challenge)
  public challenge!: Challenge;
}

@Entity()
export class UserAuth extends BaseEntity {
  @PrimaryGeneratedColumn()
  authId!: number;

  @Column()
  userId!: number;

  @Column()
  creationDate!: Date;

  @Column()
  cookieValue!: string;

  @Column()
  expiryDate!: Date;

  @Column()
  userAgent!: string;

  @Column()
  ipAddress!: string;

  @ManyToOne(() => User, (user) => user.authValues)
  public user!: User;
}
