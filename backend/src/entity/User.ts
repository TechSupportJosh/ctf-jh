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

  @Column({ select: false, nullable: true })
  authValue!: string;

  @Column({ select: false, nullable: true })
  authExpiry!: Date;

  @OneToMany(() => UserSolvedChallenge, (solvedChallenge) => solvedChallenge.user, { eager: true })
  solvedChallenges!: UserSolvedChallenge[];

  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  team!: Team | null;

  @OneToMany(() => UserStats, (userStats) => userStats.user)
  stats!: UserStats[];

  hasSolvedChallenge(challenge: Challenge) {
    return this.solvedChallenges.findIndex((solvedChallenge) => solvedChallenge.challengeId === challenge.id) !== -1;
  }

  createAuth() {
    // Create new auth string + expiry time in 3 days
    const daysBeforeExpires = 3;
    const authValue = randomBytes(32).toString("base64");
    const authExpiry = new Date();
    authExpiry.setDate(new Date().getDate() + daysBeforeExpires);

    this.authValue = authValue;
    this.authExpiry = authExpiry;
  }

  clearAuth() {
    this.authValue = randomBytes(32).toString("base64");
    this.authExpiry = new Date(0);
  }

  toPublicJSON(withStats: boolean) {
    let json: Record<string, any> = {
      id: this.id,
      name: `${this.firstName} ${this.lastName[0]}`,
    };

    if (withStats && this.solvedChallenges) json = { ...json, ...this.getSolveStats() };

    return json;
  }

  toSelfJSON() {
    // Reduces team information
    const user: Record<string, any> = { ...this };
    if (this.team) {
      user.team = {
        id: user.team.id,
        name: user.team.name,
      };
    }
    return user;
  }

  getSolveStats() {
    const stats = {
      points: 0,
      solves: 0,
      bloods: 0,
    };

    this.solvedChallenges.forEach((solvedChallenge) => {
      stats.points += solvedChallenge.challenge?.points ?? 0;
      stats.bloods += solvedChallenge.isBlood ? 1 : 0;
      stats.solves += 1;
    });

    return stats;
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
