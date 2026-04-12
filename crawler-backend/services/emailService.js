const nodemailer = require("nodemailer");

async function sendEmail(to, htmlContent) {

    console.log("Sending email to:", to);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_FROM,
            pass: process.env.SMTP_PASS
        }
    });

    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Latest News",
        html: htmlContent
    });

    console.log("Email sent:", info.messageId);

}

module.exports = {
    sendEmail
};