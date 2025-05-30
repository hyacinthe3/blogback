import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import {
  Length,
  IsNotEmpty,
  IsString
} from "class-validator";
import { Users } from "./User";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  @Length(3, 255, { message: "Title must be between 3 and 255 characters" })
  title!: string;

  @Column("text")
  @IsString()
  @IsNotEmpty({ message: "Content is required" })
  content!: string;

  @ManyToOne(() => Users, (user) => user.posts)
  user!: Users;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
