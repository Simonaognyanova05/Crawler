require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: {
        "api-version": process.env.AZURE_OPENAI_API_VERSION,
    },
    defaultHeaders: {
        "api-key": process.env.AZURE_OPENAI_API_KEY,
    },
});

async function classifyText(text) {
    try {
        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: "system",
                    content:
                        "You ALWAYS return ONLY valid JSON. " +
                        "Return an array like this: " +
                        "[{\"id\":\"string\",\"title\":\"string\",\"link\":\"string\",\"topic\":\"string\"}]. " +
                        "topic must be one of: security, programming, linux, ai, windows, networking."
                },

                {
                    role: "user",
                    content: `Classify ONLY the hacker-related articles from this list and return VALID JSON:\n\n${text}`
                }
            ],
            temperature: 0,
            max_tokens: 1500
        });

        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("LLM classification error:", err);
        throw new Error("LLM classification failed");
    }
}


module.exports = { classifyText };
