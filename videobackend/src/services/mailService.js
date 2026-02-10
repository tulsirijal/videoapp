import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Video App" <${process.env.EMAIL_USER}>`, 
      to,
      subject,
      html,
    });
    console.log(`Email successfully delivered to ${to}`);
  } catch (error) {
    console.error(" Gmail SMTP Error:", error.message);
    throw error; 
  }
};