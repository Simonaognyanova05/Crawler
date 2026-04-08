const nodemailer = require("nodemailer");

async function sendClassificationEmail(to, classification) {
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL, to,
        subject: "Класификация на заявката",
        text: `Тип на заявката: ${classification}`
    });
}

module.exports = {
    sendClassificationEmail
};





