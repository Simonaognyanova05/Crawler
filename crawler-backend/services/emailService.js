const nodemailer = require("nodemailer");

async function sendClassificationEmail(to, classification) {
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: to,
        subject: "Резултат от класификация",
        text: `Тип на заявката: ${classification}`,
        html: `<p>Тип на заявката: <b>${classification}</b></p>`
    });
}

module.exports = {
    sendClassificationEmail
};