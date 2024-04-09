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







export const mail = async (to: string, subject: string, message: string, file: any, contentType: any, path:string) => {
    console.log(path, file, contentType, path)

    try {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"mark kibocha👻" <kibochamark@gmail.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: message, // plain text body
            html: `<p className="space-y-4 space-x-2 flex items-start justify-start">${message}</p>`, // html body
            attachments: [
                {
                    filename: file,
                    path: path,// Use the file name as the attachment name
                    contentType: contentType, // Use the file data as the attachment content
                }
            ]
        });

        console.log("Message sent: %s", info.messageId);
        return { message: "Message sent: %s" };
    } catch (error) {
        console.error("Failed to send email", error);
        return { error: "Failed to send email" };
    }


}