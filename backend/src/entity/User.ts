import { randomBytes } from "crypto";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Challenge } from "./Challenge";

enum LoginType {
  Username = 0,
  WarwickOAuth,
}

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

  @ManyToOne(() => User, (user) => user.completedChallenges)
  public user!: User;

  @ManyToOne(() => Challenge)
  public challenge!: Challenge;
}
