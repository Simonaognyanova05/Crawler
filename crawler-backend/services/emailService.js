const nodemailer = require("nodemailer");

async function sendEmail(to, htmlContent) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Hacker News – Latest Hacker-Related Articles",
        text: "Your email client does not support HTML. Please view the HTML version.",
        html: htmlContent
    });
}

module.exports = {
    sendEmail
};
