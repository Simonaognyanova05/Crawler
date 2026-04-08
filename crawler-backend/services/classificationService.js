const axios = require("axios");

async function classifyText(text) {
    const response = await axios.post(
        "http://planb-bulgaria.duckdns.org:11434/api/generate",
        {
            model: "devstral-small-2:24b",
            prompt: `Classify the following request as one of: http, mongo, sql, redis, unknown. Return ONLY the label. Request:\n\n${text}`,
            stream: false
        }
    );

    return response.data.response.trim();
}

module.exports = { classifyText };