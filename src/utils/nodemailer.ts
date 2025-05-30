import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

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
        from: process.env.USER_EMAIL,
        to,
        subject,
        html,
    };

  try {
    console.log("Sending to:", to); // ✅ Confirm here too
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

