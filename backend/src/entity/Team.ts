import { randomBytes } from "crypto";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { getRandomWords } from "../utils/randomwords";
import { User } from "./User";

@Entity()
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ select: false })
  inviteCode!: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  teamLeader!: User;

  @OneToMany(() => User, (user) => user.team, { eager: true })
  members!: User[];

  @OneToMany(() => TeamStats, (teamStats) => teamStats.team)
  stats!: TeamStats[];

  createInviteCode() {
    this.inviteCode = getRandomWords(3, " ");
  }

  toJSON() {
    return {
      ...this,
      teamLeader: this.teamLeader.toPublicJSON(false),
      members: this.members.map((member) => member.toPublicJSON(true)),
    };
  }
}

@Entity()
export class TeamStats extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Team)
  team!: Team;

  @Column()
  date!: Date;

  @Column()
  points!: number;

  @Column()
  solves!: number;

  @Column()
  bloods!: number;
}
