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
                        "You are an AI classifier. You ALWAYS return ONLY valid JSON. " +
                        "No markdown, no lists, no numbering, no explanations. " +
                        "Return an array of objects in this exact format: " +
                        "[{\"id\": \"string\", \"title\": \"string\", \"link\": \"string\"}]. " +
                        "If no hacker-related articles exist, return []."
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
