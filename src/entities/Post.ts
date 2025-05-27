import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Length } from "class-validator";
import { Users } from "./User";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Length(255)
  title!: string;

  @Column("text")
  content!: string;

  @ManyToOne(() => Users, (user) => user.posts)
  user!: Users;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
