import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Config extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "5" })
  maxTeamSize!: number;

  @Column({ default: "10" })
  locationFlagPrecision!: number;

  @Column({ default: true })
  maintenance!: Boolean;

  // There's not a great multi-dbms solution for default dates, therefore,
  // these times are set within utils/config.ts
  @Column()
  startTime!: Date;

  @Column()
  endTime!: Date;

  canViewChallenges() {
    return !this.maintenance && new Date() > this.startTime;
  }

  canSubmitFlags() {
    return !this.maintenance && new Date() > this.startTime && new Date() < this.endTime;
  }
}
