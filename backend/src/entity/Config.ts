import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Config extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "5" })
  maxTeamSize!: number;

  @Column({ default: "10" })
  locationFlagPrecision!: number;
}
