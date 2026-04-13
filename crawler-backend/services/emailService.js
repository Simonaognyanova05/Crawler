const { emailTransporter } = require("../utils/emailTransporter");
const { config } = require("../config/env");

async function sendEmail(to, articles) {
    try {
        const list = Array.isArray(articles) ? articles : [];
        console.log(`Изпращане на имейл до ${to} (${list.length} статии)`);

        let htmlBody = `
            <h2 style="font-family: Arial, sans-serif;">Вашият новинарски отчет</h2>
        `;

        if (list.length === 0) {
            htmlBody += `
                <p style="font-family: Arial, sans-serif;">
                    Няма нови новини по избраните от Вас теми за този период.
                </p>
            `;
        } else {
            const itemsHtml = list
                .map(article => `
                    <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; list-style: none;">
                        <h3 style="margin: 0; color: #333; font-family: Arial, sans-serif;">
                            ${article.title}
                        </h3>
                        <p style="margin: 5px 0; color: #666; font-family: Arial, sans-serif;">
                            Тема: <b>${article.topic}</b>
                        </p>
                        <a href="${article.link}" 
                           style="color: #007bff; text-decoration: none; font-weight: bold; font-family: Arial, sans-serif;">
                           Прочети повече →
                        </a>
                    </li>
                `)
                .join("");

            htmlBody += `<ul style="padding: 0; margin: 0;">${itemsHtml}</ul>`;
        }

        const info = await emailTransporter.sendMail({
            from: `"News AI Bot" <${config.SMTP_FROM}>`,
            to,
            subject: "Latest Tech News Report",
            html: htmlBody
        });

        console.log(`Имейл изпратен успешно: ${info.messageId}`);

    } catch (err) {
        console.error("Email sending error:", err.message);
    }
}

module.exports = { sendEmail };
