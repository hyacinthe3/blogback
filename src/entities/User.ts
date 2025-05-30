import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Length, IsEmail } from "class-validator";
import { Post } from "./Post";
import { Token } from "./token";

export type UserRole='User' | 'Admin'

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ unique: true })
  @Length(4, 20)
  username!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @Length(8, 100)
  password!: string;



  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @Column({ default: false })
  isVerified!: boolean;

  @OneToMany(() => Token, (token) => token.user)
  tokens!: Token[];


  @Column({type:'varchar',default:'user'})
  role!:UserRole;
}
