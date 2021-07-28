import { randomBytes } from "crypto";
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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
