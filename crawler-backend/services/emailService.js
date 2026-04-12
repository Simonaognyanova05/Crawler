const nodemailer = require("nodemailer");

async function sendEmail(to, articles) {
    // Ако articles не е масив, го направи масив или го спри
    const articlesArray = Array.isArray(articles) ? articles : [];

    console.log(`📧 Sending email to: ${to} with ${articlesArray.length} articles.`);

    // Продължи с articlesArray.forEach(...)

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_FROM,
            pass: process.env.SMTP_PASS
        }
    });

    // Генерираме текста динамично тук
    let htmlBody = `<h2>Вашият новинарски отчет</h2>`;

    if (!articles || articles.length === 0) {
        htmlBody += `<p>Няма нови новини по избраните от Вас теми за този период.</p>`;
    } else {
        htmlBody += `<ul style="list-style: none; padding: 0;">`;
        articles.forEach(article => {
            htmlBody += `
                <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: #333;">${article.title}</h3>
                    <p style="margin: 5px 0; color: #666;">Тема: <b>${article.topic}</b></p>
                    <a href="${article.link}" style="color: #007bff; text-decoration: none; font-weight: bold;">Прочети повече →</a>
                </li>`;
        });
        htmlBody += `</ul>`;
    }

    const info = await transporter.sendMail({
        from: `"News AI Bot" <${process.env.SMTP_FROM}>`,
        to,
        subject: "Latest Tech News Report",
        html: htmlBody
    });

    console.log("✅ Email sent successfully:", info.messageId);
}

module.exports = { sendEmail };