import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinTable } from "typeorm";
import { UserCompletedChallenge } from "./User";

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

  @OneToMany(() => UserCompletedChallenge, (completedChallenge) => completedChallenge.challenge)
  completions!: UserCompletedChallenge[];

  toJSON() {
    return {
      ...this,
      unlockRequirement: this.unlockRequirement?.id,
      tags: this.tags.map((tag) => tag.tag),
      educationResources: this.educationResources.map((resource) => resource.resource),
      completionCount: this.completions.length,
    };
  }

  // Used when we want to null out multiple columns for locked challenges
  toLockedJSON() {
    return {
      ...this.toJSON(),
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

  toUnlockedJSON() {
    return {
      ...this.toJSON(),
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
