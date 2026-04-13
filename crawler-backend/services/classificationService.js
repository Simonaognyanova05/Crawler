const { openaiClient } = require("../utils/openaiClient");
const { config } = require("../config/env");

async function classifyText(text) {
    try {
        if (!text || text === "[]") return [];

        const response = await openaiClient.chat.completions.create({
            model: config.AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: "system",
                    content: `
                        You are a professional news classifier. 
                        Return ONLY a JSON object with a key "articles" containing an array of classified items.
                        Format: {"articles": [{"title":"string","link":"string","topic":"string"}]}
                        Topics: security, programming, linux, ai, windows, networking.
                        Skip articles that do not fit these topics.
                    `
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

        const rawContent = response?.choices?.[0]?.message?.content?.trim();
        if (!rawContent) return [];

        if (rawContent.startsWith("<")) {
            console.error("Azure returned HTML instead of JSON:", rawContent.slice(0, 200));
            return [];
        }

        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        } catch (err) {
            console.error("Failed to parse LLM JSON:", rawContent.slice(0, 200));
            return [];
        }

        return Array.isArray(parsed)
            ? parsed
            : (parsed.articles || []);

    } catch (err) {
        console.error("LLM classification error:", err.message);
        return [];
    }
}

module.exports = { classifyText };
