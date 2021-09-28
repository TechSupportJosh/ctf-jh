import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EventType } from "../utils/log";

@Entity()
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  createdAt!: Date;

  @Column({
    type: "simple-enum",
    enum: EventType,
  })
  eventType!: EventType;

  @Column()
  data!: string;

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      eventType: this.eventType,
      data: JSON.parse(this.data),
    };
  }
}
