import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinTable } from "typeorm";
import { Configuration } from "../utils/config";
import { UserSolvedChallenge } from "./User";

export enum FlagType {
  String = "string",
  Location = "location",
}

@Entity()
export class Challenge extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  disabled!: boolean;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  author!: string;

  @Column()
  category!: string;

  @Column()
  points!: number;

  @Column({
    type: "simple-enum",
    enum: FlagType,
  })
  flagType!: FlagType;

  @Column()
  flag!: string;

  @OneToMany(() => ChallengeTag, (tag) => tag.challenge, {
    eager: true,
  })
  tags!: ChallengeTag[];

  @Column()
  difficulty!: string;

  @OneToMany(() => EducationResource, (resource) => resource.challenge, {
    eager: true,
  })
  educationResources!: EducationResource[];

  @ManyToOne(() => Challenge, { nullable: true, onDelete: "SET NULL" })
  @JoinTable()
  unlockRequirement?: Challenge;

  @Column()
  hint!: string;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ nullable: true })
  fileHash?: string;

  @Column({ nullable: true })
  url?: string;

  @OneToMany(() => UserSolvedChallenge, (solvedChallenge) => solvedChallenge.challenge)
  solves!: UserSolvedChallenge[];

  async getEffectivePoints(solveCount?: number) {
    const config = Configuration.get();
    if (config.scoringType === "static") return this.points;

    if (solveCount === undefined) solveCount = await UserSolvedChallenge.count({ where: { challengeId: this.id } });

    // Ensure that we can never go below minimium points
    return Math.max(
      Math.ceil(((config.dynamicScoreMinPoints - this.points) / config.dynamicScoreDecay ** 2) * solveCount ** 2 + this.points),
      config.dynamicScoreMinPoints
    );
  }

  async toJSON() {
    const solveCount = await UserSolvedChallenge.count({ where: { challengeId: this.id } });

    return {
      ...this,
      unlockRequirement: this.unlockRequirement?.id,
      tags: this.tags.map((tag) => tag.tag),
      educationResources: this.educationResources.map((resource) => resource.resource),
      solveCount: solveCount,
      points: await this.getEffectivePoints(solveCount),
    };
  }

  // Used when we want to null out multiple columns for locked challenges
  async toLockedJSON() {
    return {
      ...(await this.toJSON()),
      flag: null,
      locked: true,
      description: null,
      tags: null,
      educationResources: null,
      fileName: null,
      fileHash: null,
      url: null,
      hint: null,
    };
  }

  async toUnlockedJSON() {
    return {
      ...(await this.toJSON()),
      flag: null,
      locked: false,
    };
  }
}

@Entity()
export class EducationResource extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  resource!: string;

  @ManyToOne(() => Challenge, (challenge) => challenge.educationResources, {
    onDelete: "CASCADE",
  })
  challenge!: Challenge;
}

@Entity()
export class ChallengeTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  tag!: string;

  @ManyToOne(() => Challenge, (challenge) => challenge.tags, {
    onDelete: "CASCADE",
  })
  challenge!: Challenge;
}
