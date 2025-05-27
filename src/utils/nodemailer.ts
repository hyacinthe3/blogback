import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.APP_PASSWORD,
    },
});

export async function sendEmail(to: string,subject: string, html: string){
    const mailOptions = {
        from: `<${process.env.USER_EMAIL}>`,
        to,
        subject,
        html,
    };

    try {
       const information = await transporter.sendMail(mailOptions);
       console.log(`The Email Is Sent`,information.response);
        
    } catch (error) {
        console.error(`Error In Sending Email`,error);
        throw error;
        
    }
}

