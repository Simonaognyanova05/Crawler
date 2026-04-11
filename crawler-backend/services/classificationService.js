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
                        "You are an AI model that receives a list of news articles and returns ONLY the hacker-related ones. " +
                        "Return the result as a clean list of titles and links. Do not add explanations or commentary.",
                },
                {
                    role: "user",
                    content: `Here is a list of news articles:\n\n${text}\n\nReturn ONLY the hacker-related ones.`,
                },
            ],
            temperature: 0,
            max_tokens: 1000,
        });

        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("LLM classification error:", err);
        throw new Error("LLM classification failed");
    }
}

module.exports = { classifyText };
