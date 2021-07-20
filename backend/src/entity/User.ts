import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinTable, ManyToOne, OneToMany } from "typeorm";
import { Challenge } from "./Challenge";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  warwickId!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  isAdmin!: boolean;

  @Column({ select: false, nullable: true })
  authValue?: string;

  @Column({ select: false, nullable: true })
  authExpiry?: Date;

  @OneToMany(() => UserCompletedChallenge, (completedChallenge) => completedChallenge.user, { eager: true })
  completedChallenges!: UserCompletedChallenge[];

  hasCompletedChallenge(challenge: Challenge) {
    return this.completedChallenges.findIndex((completedChallenge) => completedChallenge.challengeId === challenge.id) !== -1;
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
