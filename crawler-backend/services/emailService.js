const { emailTransporter } = require("../utils/emailTransporter");
const { config } = require("../config/env");

async function sendEmail(to, articles) {
    try {
        const articlesArray = Array.isArray(articles) ? articles : [];

        console.log(`Sending email to: ${to} with ${articlesArray.length} articles.`);

        let htmlBody = `<h2>Вашият новинарски отчет</h2>`;

        if (!articlesArray.length) {
            htmlBody += `<p>Няма нови новини по избраните от Вас теми за този период.</p>`;
        } else {
            htmlBody += `<ul style="list-style: none; padding: 0;">`;

            articlesArray.forEach(article => {
                htmlBody += `
                    <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <h3 style="margin: 0; color: #333;">${article.title}</h3>
                        <p style="margin: 5px 0; color: #666;">Тема: <b>${article.topic}</b></p>
                        <a href="${article.link}" style="color: #007bff; text-decoration: none; font-weight: bold;">Прочети повече →</a>
                    </li>
                `;
            });

            htmlBody += `</ul>`;
        }

        const info = await emailTransporter.sendMail({
            from: `"News AI Bot" <${config.SMTP_FROM}>`,
            to,
            subject: "Latest Tech News Report",
            html: htmlBody
        });

        console.log("Email sent successfully:", info.messageId);

    } catch (err) {
        console.error("Email sending error:", err.message);
    }
}

module.exports = { sendEmail };
