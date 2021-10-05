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

  @Column({ default: "static" })
  scoringType!: "static" | "dynamic";

  // The minimum amount of points a challenge can be worth
  @Column({ default: 100 })
  dynamicScoreMinPoints!: number;

  // The amount of solves before points will be at minimum
  @Column({ default: 30 })
  dynamicScoreDecay!: number;

  canViewChallenges() {
    return !this.maintenance && this.hasStarted();
  }

  canSubmitFlags() {
    return !this.maintenance && !this.hasFinished() && this.hasStarted();
  }

  hasStarted() {
    return new Date() > this.startTime;
  }

  hasFinished() {
    return new Date() > this.endTime;
  }
}
