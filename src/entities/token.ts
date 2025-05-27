import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Users } from "./User";

export enum TokenType {
    RESET_PASSWORD = 'reset_password',
    EMAIL_VERIFICATION = 'email_verification',
}

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id!: number;

//     @Column()
// user_id!: number;



    @ManyToOne(() => Users, (user) => user.tokens, {
        onDelete: "RESTRICT", // or omit this line to use default
        nullable: false,
    })
    user!: Users;

    @Column()
    token!: string;

    @Column({ type: 'enum', enum: TokenType })
    token_type!: TokenType;

    @Column({ type: 'timestamp' })
    expirationData!: Date;

    @Column({ default: false })
    tokenstatus!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
