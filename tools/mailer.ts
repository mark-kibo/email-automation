"use server"

import { error } from "console";
import { NextResponse } from "next/server";

const nodemailer = require("nodemailer")


const transporter = nodemailer.createTransport({
    service: "gmail",
    //   port: 587,
    //   secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "kibochamark@gmail.com",
        pass: "omjdqblveywwkbou",
    },
});

// async..await is not allowed in global scope, must use a wrapper







export const mail = async (to:string, subject:string, message:string, file:{name:string; data:string | null;}) => {

    try {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"mark kibocha👻" <kibochamark@gmail.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: message, // plain text body
            html: `<b>${message}</b>`, // html body
            attachments: [
                {
                    filename: file.name, // Use the file name as the attachment name
                    content: file.data, // Use the file data as the attachment content
                }
            ]
        });

        console.log("Message sent: %s", info.messageId);
        NextResponse.json({
            message: "Message sent: %s" + info.messageId
        })
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    } catch {
        return NextResponse.json({
            error: "Failed to send email"
        })
    }


}