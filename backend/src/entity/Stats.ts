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

  async toLeaderboardJSON() {
    return {
      user: await this.user.toPublicJSON(false),
      stats: {
        points: this.points,
        solves: this.solves,
        bloods: this.bloods,
      },
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

  toLeaderboardJSON() {
    return {
      team: {
        id: this.team.id,
        name: this.team.name,
      },
      stats: {
        points: this.points,
        solves: this.solves,
        bloods: this.bloods,
      },
    };
  }
}
