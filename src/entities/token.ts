import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class token{
    @PrimaryGeneratedColumn()
    id:number;
}