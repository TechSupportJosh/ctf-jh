import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class OAuthToken extends BaseEntity {
  @PrimaryColumn()
  token!: string;

  @Column()
  tokenSecret!: string;

  @Column()
  expires?: Date;
}
