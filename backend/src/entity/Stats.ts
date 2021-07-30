import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Team } from "./Team";
import { User } from "./User";

@Entity()
export class UserStats extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  date!: Date;

  @Column()
  points!: number;

  @Column()
  solves!: number;

  @Column()
  bloods!: number;
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
