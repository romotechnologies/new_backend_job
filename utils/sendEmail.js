import nodemailer from 'nodemailer'

export const sendEmail=async(to,subject,text)=>{
  const transporter=nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
   
  const receiver={
    from:"p71891140@gmail.com",
    to,
    subject,
    text
  }
  await transporter.sendMail(receiver)


}