const axios = require("axios");

async function classifyText(text) {
    const endpoint = "https://eurobank-planb.openai.azure.com/";
    const response = await axios.post(
        endpoint,
        {
            messages: [
                {
                    role: "user",
                    content: `Classify the following request as one of: http, mongo, sql, redis, unknown. Return ONLY the label. Request:${text}`
                }
            ],
            max_tokens: 10,
            temperature: 0
        },
        {
            headers: {
                "Content-Type": "application/json",
                "api-key": AZURE_OPENAI_KEY
            }
        }
    );

    return response.data.choices[0].message.content.trim();
}

module.exports = { classifyText };