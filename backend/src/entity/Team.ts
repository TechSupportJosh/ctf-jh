import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { getRandomWords } from "../utils/randomwords";
import { Challenge } from "./Challenge";
import { TeamStats } from "./Stats";
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

  getSolveStats() {
    const stats = {
      points: 0,
      solves: 0,
      bloods: 0,
    };

    this.members.forEach((member) => {
      const userStats = member.getSolveStats();
      stats.points += userStats.points;
      stats.bloods += userStats.bloods;
      stats.solves += userStats.solves;
    });

    return stats;
  }
}
