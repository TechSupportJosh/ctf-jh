import { randomBytes } from "crypto";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Challenge } from "./Challenge";
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

  @OneToMany(() => UserCompletedChallenge, (completedChallenge) => completedChallenge.user, { eager: true })
  completedChallenges!: UserCompletedChallenge[];

  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  team!: Team | null;

  hasCompletedChallenge(challenge: Challenge) {
    return this.completedChallenges.findIndex((completedChallenge) => completedChallenge.challengeId === challenge.id) !== -1;
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
    const json: Record<string, any> = {
      id: this.id,
      name: `${this.firstName} ${this.lastName[0]}`,
    };

    if (withStats && this.completedChallenges) {
      json.points = 0;
      json.bloods = 0;
      json.solves = 0;
      this.completedChallenges.forEach((completedChallenge) => {
        json.points += completedChallenge.challenge?.points ?? 0;
        json.bloods += completedChallenge.isBlood;
        json.solves += 1;
      });
      json.completions = this.completedChallenges.length;
    }

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
}

@Entity()
export class UserCompletedChallenge extends BaseEntity {
  @PrimaryGeneratedColumn()
  completedChallengeId!: number;

  @Column()
  userId!: number;

  @Column()
  challengeId!: number;

  @Column()
  completionDate!: Date;

  @Column()
  isBlood!: boolean;

  @ManyToOne(() => User, (user) => user.completedChallenges)
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
      completionDate: this.completionDate,
    };
  };
}
