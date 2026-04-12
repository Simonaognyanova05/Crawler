require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
});

async function classifyText(text) {
    try {
        if (!text || text === "[]") return [];

        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: "system",
                    content: `You are a professional news classifier. 
                    Return ONLY a JSON object with a key "articles" containing an array of classified items.
                    Format: {"articles": [{"title":"string","link":"string","topic":"string"}]}
                    Topics: security, programming, linux, ai, windows, networking.
                    Skip articles that do not fit these topics.`
                },
                {
                    role: "user",
                    content: `Classify these articles:\n\n${text}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 2000
        });

        const rawContent = response.choices[0].message.content.trim();
        if (!rawContent) return [];

        const parsed = JSON.parse(rawContent);
        
        // Връщаме масива, независимо дали е директно или в обект {"articles": [...]}
        return Array.isArray(parsed) ? parsed : (parsed.articles || []);

    } catch (err) {
        console.error("❌ LLM classification error:", err.message);
        return [];
    }
}

module.exports = { classifyText };