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

  // The amount of points deducted from the base score for each solve
  @Column({ default: 5 })
  dynamicScoreReduction!: number;

  // The maximum number of solves to deduct points from the base points
  // e.g. a value of 10 with a reduction of 5 points means a maximum of 5 x 10 = 50
  // points will be taken away
  @Column({ default: 10 })
  dynamicScoreMaxSolves!: number;

  // The minimum number of solves required before deducting points
  @Column({ default: 3 })
  dynamicScoreMinSolves!: number;

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
